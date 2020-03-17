var Equipe = require('../../models/equipe');
var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var router = require('express').Router();
var config = require('../../../config');
var appUtil = require('../../../util/apontamentosUtil');

var Apontamento = require('../../models/apontamento');
var Feriado = require('../../models/feriado');
var fs = require('fs');
var moment = require('moment');
var http = require('http');
var request = require('request');
var Readable = require('stream').Readable;

//=========================================================================
// API para Equipes -> Cada setor faz parte de um Campus (que pertence a uma Instituicao)
// Cada setor possui Equipes acopladas
//=========================================================================
/*accessLevel => 
 *{
   0: public,
   1: colaborador,
   2: fiscal,
   3: gestor,
   4: admin 
  }
 */
var accessLevel = 3;

router.get('/', function(req, res) {

  Equipe.find()
  .populate('gestor', 'nome')
  .populate('fiscal', 'nome')
  .populate('setor', 'nome descricao local')
  //.populate('componentes', 'nome sobrenome PIS')
  .populate({
    path: 'componentes',
    select: 'nome sobrenome PIS matricula sexoMasculino alocacao active ferias historico',
    model: 'Funcionario',
    populate: [{
      path: 'alocacao.cargo',
      select: 'especificacao nomeFeminino',
      model: 'Cargo'
    },
    {
      path: 'alocacao.turno',
      model: 'Turno',
      populate: [{
        path: 'escala', 
        model: 'Escala'
      }]
    }]  
  })
  .sort({nome: 'asc'})
  .exec(function(err, equipes){
		
		if(err) {
    	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
  	
  	return res.json(equipes);
  });
});

router.post('/', function(req, res) {

  console.log("req", req.body);
  var _equipe = req.body;

  Equipe.create(_equipe, function(err, equipe){

    if(err) {
      console.log('erro post setor: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'+err});
    }
      
    return res.status(200).send({success: true, message: 'Equipe cadastrada com sucesso!'});
  });
});

//GET 1 equipe by id
router.get('/:id', function(req, res){

	var idEquipe = req.params.id;
	console.log("nomeEquipe: ", idEquipe);
	
	Equipe.findOne({_id: idEquipe})
  .populate('setor', 'nome descricao local')
  .populate('gestor', 'nome sobrenome')
  .populate('fiscal', 'nome sobrenome')
  .populate({
    path: 'componentes',
    select: 'nome sobrenome email PIS matricula sexoMasculino alocacao active ferias historico',
    model: 'Funcionario',
    populate: [{
      path: 'alocacao.cargo',
      select: 'especificacao nomeFeminino',
      model: 'Cargo'
    },
    {
      path: 'alocacao.turno',
      model: 'Turno',
      populate: [{
        path: 'escala', 
        model: 'Escala'
      }]
    }]  
  })
  .sort({matricula: 'asc'})
  .exec(function(err, equipe){
		
		if(err) {
   		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
   	}
    	
		console.log("Equipe mongoose: ", equipe);
		return res.json(equipe);
	});
});

//Update 1 equipe by id
router.put('/:id', function(req, res){
	
	var idEquipe = req.params.id;
  var _equipeNova = req.body;
	
	Equipe.findOne({_id: idEquipe}, function(err, equipe){

		if(err) {
    		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    	}

      console.log("nome: ", _equipeNova.nome);
      console.log("gestor: ", _equipeNova.gestor);
      console.log("fiscal: ", _equipeNova.fiscal);
      console.log("setor: ", _equipeNova.setor);
      console.log("componentes: ", _equipeNova.componentes);

	  	equipe.nome = _equipeNova.nome;
      equipe.gestor = _equipeNova.gestor;
      equipe.fiscal = _equipeNova.fiscal;
      equipe.setor = _equipeNova.setor;
      equipe.componentes = _equipeNova.componentes;

      //tenta atualizar de fato no BD
      equipe.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.status(200).send({success: true, message: 'Equipe atualizada com sucesso!'});
      });
	});
});

//Remove 1 equipe by ID
router.delete('/:id', function(req, res){
	
	var idEquipe = req.params.id;
	
	Equipe.remove({_id: idEquipe}, function(err){
		
		if(err){
	      console.log('Erro no delete setor', err);
	      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
	    }

    	return res.status(200).send({success: true, message: 'Equipe removida com sucesso!'});
	});
});

//##############################################
//Métodos extras, fora do padrão REST
//##############################################

//Atualizando os componentes de uma determinada equipe
router.post('/:id/updateWorkers', function(req, res){
        
    var query = {_id: req.params.id};
    var _componentes = req.body;

    Equipe.findOneAndUpdate(query, {componentes: _componentes}, function(err, componente){
                
      if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      console.log("componente atualizado mongoose: ", componente);
      return res.status(200).send({success: true, message: 'Componentes (des)associados com sucesso!'});
    });
});

router.post('/gestorFilter', function(req, res){
  
  console.log("gestorFilter Equipes");
  //var gestor = req.body;
  var funcionario = req.body;
  var query = {};
  if (funcionario.alocacao.gestor)
    query = {gestor: funcionario._id};
  else if (funcionario.alocacao.fiscal)
    query = {fiscal: funcionario._id};


  Equipe.find(query)
  //.populate('gestor', 'nome')
  //.populate('setor', 'nome descricao')
  .sort({nome: 'asc'})
  .populate({
    path: 'componentes',
    select: 'nome sobrenome PIS matricula sexoMasculino alocacao active ferias',
    model: 'Funcionario',
    populate: [{
      path: 'alocacao.cargo',
      select: 'especificacao nomeFeminino',
      model: 'Cargo'
    },
    {
      path: 'alocacao.turno',
      model: 'Turno',
      populate: [{
        path: 'escala', 
        model: 'Escala'
      }]
    }]  
  })
  .populate('setor', 'nome local')
  .exec(function(err, equipes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    //console.log("equipes retornadas?", equipes);
    return res.json(equipes);
  });
});

router.post('/:id/searchAndUpdateAppointments', function(req, res){

  var equipeID = req.params.id;
  var componentes = req.body.empIds;
  var arrayPis = req.body.arrayPIS;

  console.log('componentes: ', componentes);
  console.log('psi: ', arrayPis);

  var urlStaticREPFileArray = [
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006843.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006848.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006815.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006797.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006774.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006689.txt'
  ];  

  Feriado.find(function(err, rFeriados){
    

    if(err) {
      console.log('Erro ao obter lista de feriados');
    }
    else {
      feriados = rFeriados;
      for (var i=0; i<urlStaticREPFileArray.length; i++){

        request(urlStaticREPFileArray[i], function (error, response, body) {
              
          if (response && response.statusCode === 200){
            var s = new Readable();
            s.push(body);
            s.push(null);
            appUtil.readFile(s, feriados, componentes, arrayPis);
          } else {

            console.log('Aconteceu um erro na comunicação com o arquivo local do REP, código do erro: ', error);
          }
        });
      }
    }
  });

  return res.status(200).send({success: true, message: 'Consulta assíncrona enviada com sucesso, aguarde alguns minutos e cheque os apontamentos dos funcionários associados'});

});





module.exports = router;