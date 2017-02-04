var Escala = require('../../models/escala');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Escalas
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

//Get ALL escalas
router.get('/', function(req, res) {

	Escala.find(function(err, escalas){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(escalas);
	});

});

//Create escala
router.post('/', function(req, res) {

  console.log("req", req.body);

  Escala.create({
    codigo: req.body.codigo,
    nome: req.body.nome,
    jornada: req.body.jornada,
    minutosIntervalo: req.body.minutosIntervalo,
    minutosEfetivos: req.body.minutosEfetivos

  }, function(err, escala){

    if(err) {
      console.log('erro post escala: ', err);
      
      if (err.code === 11000) {
        console.log('escala existente!');
        return res.status(500).send({success: false, message: 'Escala já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(escala);
  });
});

//Traz apenas 1 escala
router.get('/:id', function(req, res) {

  var idEscala = req.params.id;

  Escala.findOne({_id: idEscala}, function(err, escala){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(escala);
  });

});

//Atualiza 1 escala
router.put('/:id', function(req, res){

  var idEscala = req.params.id;
  Escala.findOne({_id: idEscala}, function(err, escala){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    escala.nome = req.body.nome;
    escala.codigo = req.body.codigo;
    escala.jornada = req.body.jornada;
    escala.minutosIntervalo = req.body.minutosIntervalo;
    escala.minutosEfetivos = req.body.minutosEfetivos;

    //tenta atualizar de fato no BD
    escala.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    //return res.json(escala);
    return res.status(200).send({success: true, message: 'Escala atualizada com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idEscala = req.params.id;
  Escala.remove({_id: idEscala}, function(err){
    if(err){
      console.log('Erro no delete escala', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Escala removida com sucesso!'});
  });

});

module.exports = router;