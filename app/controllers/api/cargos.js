var Cargo = require('../../models/cargo');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Cargos
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

//Get ALL cargos
router.get('/', function(req, res) {

	Cargo.find(function(err, cargos){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(cargos);
	});

});

//Create cargo
router.post('/', function(req, res) {

  console.log("cargo recebido: ", req.body);
  var cargoRecebido = req.body;

  Cargo.create(cargoRecebido, function(err, cargo){

    if(err) {
      console.log('erro post cargo: ', err);
      
      if (err.code === 11000) {
        console.log('cargo existente!');
        return res.status(500).send({success: false, message: 'Cargo já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(cargo);
  });
});

//Traz apenas 1 cargo
router.get('/:id', function(req, res) {

  var idCargo = req.params.id;

  Cargo.findOne({_id: idCargo}, function(err, cargo){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.status(200).send({success: true, message: 'Cargo cadastrado com sucesso!'});
    //return res.json(cargo);
  });

});

//Atualiza 1 cargo
router.put('/:id', function(req, res){

  var idCargo = req.params.id;
  Cargo.findOne({_id: idCargo}, function(err, cargo){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    cargo.especificacao = req.body.especificacao;
    cargo.nomefeminino = req.body.nomefeminino;
    cargo.descricao = req.body.descricao;
    cargo.cbo = req.body.cbo;

    //tenta atualizar de fato no BD
    cargo.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
    });

    //return res.json(cargo);
    return res.status(200).send({success: true, message: 'Cargo atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idCargo = req.params.id;
  Cargo.remove({_id: idCargo}, function(err){
    if(err){
      console.log('Erro no delete cargo', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Cargo removido com sucesso!'});
  });

});

module.exports = router;