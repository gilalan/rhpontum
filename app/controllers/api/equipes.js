var Equipe = require('../../models/equipe');
var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Setores -> Cada setor faz parte de um Campus (que pertence a uma Instituicao)
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
  .populate('setor', 'nome descricao')
  .populate('componentes', 'nome sobrenome PIS')
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
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
      
    return res.status(200).send({success: true, message: 'Equipe cadastrada com sucesso!'});
  });
});

//GET 1 equipe by id
router.get('/:id', function(req, res){

	var idEquipe = req.params.id;
	console.log("nomeEquipe: ", idEquipe);
	
	Equipe.findOne({_id: idEquipe})
  .populate('setor', 'nome descricao')
  .populate('gestor', 'nome')
  .populate('componentes', 'nome sobrenome PIS')
  .exec(function(err, equipe){
		
		if(err) {
   		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
   	}
    	
		console.log("Equipe mongoose: ", equipe);
		return res.json(equipe);
	});
});

//Update 1 setor by id
router.put('/:id', function(req, res){
	
	var idEquipe = req.params.id;
	
	Equipe.findOne({_id: idEquipe}, function(err, equipe){

		if(err) {
    		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    	}

      console.log("nome: ", req.body.nome);
      console.log("gestor: ", req.body.gestor);
      console.log("setor: ", req.body.setor);
      console.log("componentes: ", req.body.componentes);

	  	equipe.nome = req.body.nome;
      equipe.gestor = req.body.gestor;
      equipe.setor = req.body.setor;
      equipe.componentes = req.body.componentes;

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

//Get funcionarios by equipe
router.get('/:id/funcionarios', function(req, res){

    /*
    var idEquipe = req.params.id;

    Funcionario.find({equipes: idEquipe})
    //.populate('gestor', 'nome PIS')
    .exec(function(err, funcionarios){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log("funcionarios mongoose: ", funcionarios);
        return res.json(funcionarios);
    });
    */
});

router.post('/gestorFilter', function(req, res){
  
  console.log("gestorFilter Equipes");
  var gestor = req.body;

  Equipe.find({gestor: gestor._id})
  //.populate('gestor', 'nome')
  //.populate('setor', 'nome descricao')
  .populate({
    path: 'componentes',
    select: 'nome sobrenome PIS',
    model: 'Funcionario'    
  })
  .exec(function(err, equipes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    return res.json(equipes);
  });
});

module.exports = router;