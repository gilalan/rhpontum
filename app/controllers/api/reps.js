const Rep = require('../../models/rep');
const router = require('express').Router();
const config = require('../../../config');

//=========================================================================
// API para REPs
//=========================================================================

const accessLevel = 4;

//Get ALL REPs
router.get('/', function(req, res) {

	Rep.find(function(err, reps){
		
		if(err) {
        	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      	}

    	return res.json(reps);
	});

});

//Create Rep
router.post('/', function(req, res) {

  console.log("req", req.body);

  Rep.create({
    
    serial: req.body.serial,
    local: req.body.local,
    last_processed: req.body.last_processed

  }, function(err, Rep){

    if(err) {
      console.log('erro post Rep: ', err);
      
      if (err.code === 11000) {
        console.log('Rep existente!');
        return res.status(500).send({success: false, message: 'REp já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
   
    return res.json(Rep);
  });
});

//Traz apenas 1 REP
router.get('/:id', function(req, res) {

  var idRep = req.params.id;

  Rep.findOne({_id: idRep}, function(err, Rep){
    
    if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }  
    return res.json(Rep);
  });

});

//Atualiza 1 Rep
router.put('/:id', function(req, res){

  var idRep = req.params.id;
  Rep.findOne({_id: idRep}, function(err, Rep){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    Rep.serial = req.body.serial;
    Rep.local = req.body.local;
    if(req.body.last_processed)
      Rep.last_processed = req.body.last_processed;

    //tenta atualizar de fato no BD
    Rep.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

    });

    return res.json(Rep);
  });
});

router.delete('/:id', function(req, res){

  var idRep = req.params.id;
  Rep.remove({_id: idRep}, function(err){
    if(err){
      console.log('Erro no delete Rep', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'REP removido com sucesso!'});
  });

});

module.exports = router;