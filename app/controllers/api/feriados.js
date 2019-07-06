var Feriado = require('../../models/feriado');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Feriados
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
var accessLevel = 4;

//Get ALL feriados
router.get('/', function(req, res) {

	Feriado.find()
  .populate('local.estado', 'sigla_uf nome_uf')
  .populate('local.municipio', 'estado nome_municipio')
  .exec(function(err, feriados){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
    //console.log("passou no getFeriados do server");  		
    return res.json(feriados);
	});

});

//Create feriado
router.post('/', function(req, res) {

  console.log("req", req.body);

  Feriado.create({
    
    nome: req.body.nome,
    fixo: req.body.fixo,
    data: req.body.data,
    abrangencia: req.body.abrangencia,
    local: req.body.local,
    ftdString: req.body.ftdString,
    array: req.body.array

  }, function(err, feriado){

    if(err) {
      console.log('erro post feriado: ', err);
      
      if (err.code === 11000) {
        console.log('feriado existente!');
        return res.status(500).send({success: false, message: 'Feriado já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(feriado);
  });
});

//Traz apenas 1 feriado
router.get('/:id', function(req, res) {

  var idFeriado = req.params.id;

  Feriado.findOne({_id: idFeriado}, function(err, feriado){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(feriado);
  });

});

//Atualiza 1 feriado
router.put('/:id', function(req, res){

  var idFeriado = req.params.id;
  Feriado.findOne({_id: idFeriado}, function(err, feriado){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    feriado.nome = req.body.nome;
    feriado.fixo = req.body.fixo;
    feriado.data = req.body.data;
    feriado.abrangencia = req.body.abrangencia;
    feriado.local = req.body.local;
    feriado.ftdString = req.body.ftdString;
    feriado.array = req.body.array;

    //tenta atualizar de fato no BD
    feriado.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    //return res.json(feriado);
    return res.status(200).send({success: true, message: 'Feriado atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idFeriado = req.params.id;
  Feriado.remove({_id: idFeriado}, function(err){
    if(err){
      console.log('Erro no delete feriado', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Feriado removido com sucesso!'});
  });

});

module.exports = router;