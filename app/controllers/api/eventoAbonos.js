var EventoAbono = require('../../models/eventoAbono');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Evento de Abono
//=========================================================================

var accessLevel = 4;

//Get ALL eventosAbono
router.get('/', function(req, res) {

	EventoAbono.find()
  .exec(function(err, eventosAbono){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(eventosAbono);
	});

});

//Create EventoAbono
router.post('/', function(req, res) {

  console.log("req", req.body);

  EventoAbono.create({
    
    nome: req.body.nome    

  }, function(err, EventoAbono){

    if(err) {
      console.log('erro post EventoAbono: ', err);
      
      if (err.code === 11000) {
        console.log('EventoAbono existente!');
        return res.status(500).send({success: false, message: 'Evento de Abono já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(EventoAbono);
  });
});

//Traz apenas 1 EventoAbono
router.get('/:id', function(req, res) {

  var idEventoAbono = req.params.id;

  EventoAbono.findOne({_id: idEventoAbono}, function(err, eventoAbono){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(eventoAbono);
  });

});

//Atualiza 1 EventoAbono
router.put('/:id', function(req, res){

  var idEventoAbono = req.params.id;
  EventoAbono.findOne({_id: idEventoAbono}, function(err, eventoAbono){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    eventoAbono.nome = req.body.nome;

    //tenta atualizar de fato no BD
    eventoAbono.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    //return res.json(EventoAbono);
    return res.status(200).send({success: true, message: 'Evento de Abono atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idEventoAbono = req.params.id;
  EventoAbono.remove({_id: idEventoAbono}, function(err){
    if(err){
      console.log('Erro no delete EventoAbono', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Evento de Abono removido com sucesso!'});
  });

});

module.exports = router;