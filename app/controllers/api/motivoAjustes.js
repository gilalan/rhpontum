var MotivoAjuste = require('../../models/motivoAjuste');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Evento de Abono
//=========================================================================

var accessLevel = 4;

//Get ALL motivosAjuste
router.get('/', function(req, res) {

	MotivoAjuste.find()
  .exec(function(err, motivosAjuste){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(motivosAjuste);
	});

});

//Create MotivoAjuste
router.post('/', function(req, res) {

  console.log("req", req.body);

  MotivoAjuste.create({
    
    nome: req.body.nome    

  }, function(err, motivoAjuste){

    if(err) {
      console.log('erro post motivoAjuste: ', err);
      
      if (err.code === 11000) {
        console.log('motivoAjuste existente!');
        return res.status(500).send({success: false, message: 'Evento de Abono já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(motivoAjuste);
  });
});

//Traz apenas 1 MotivoAjuste
router.get('/:id', function(req, res) {

  var idMotivoAjuste = req.params.id;

  MotivoAjuste.findOne({_id: idMotivoAjuste}, function(err, motivoAjuste){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(motivoAjuste);
  });

});

//Atualiza 1 MotivoAjuste
router.put('/:id', function(req, res){

  var idMotivoAjuste = req.params.id;
  MotivoAjuste.findOne({_id: idMotivoAjuste}, function(err, motivoAjuste){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    motivoAjuste.nome = req.body.nome;

    //tenta atualizar de fato no BD
    motivoAjuste.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    //return res.json(MotivoAjuste);
    return res.status(200).send({success: true, message: 'Evento de Abono atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idMotivoAjuste = req.params.id;
  MotivoAjuste.remove({_id: idMotivoAjuste}, function(err){
    if(err){
      console.log('Erro no delete MotivoAjuste', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Evento de Abono removido com sucesso!'});
  });

});

module.exports = router;