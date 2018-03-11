var Estado = require('../../models/estado');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para estados
//=========================================================================

var accessLevel = 4;

//Get ALL estados
router.get('/', function(req, res) {

	Estado.find()
  .sort({nome_uf: 'asc'})
  .populate({
    path: 'cidades',
    select: 'nome_municipio',
    options: {sort: 'nome_municipio'},
    model: 'Municipio'
  })
	.exec(function(err, estados){	
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(estados);
	});
});

//Create estado
router.post('/', function(req, res) {

  console.log("req", req.body);

  Estado.create({
    
    uf: req.body.uf,
    sigla_uf: req.body.sigla_uf,
    nome_uf: req.body.nome_uf,
    cidades: req.body.cidades

  }, function(err, estado){

    if(err) {
      console.log('erro post estado: ', err);
      
      if (err.code === 11000) {
        console.log('estado existente!');
        return res.status(500).send({success: false, message: 'estado já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(estado);
  });
});

//Traz apenas 1 estado
router.get('/:id', function(req, res) {

  var idEstado = req.params.id;

  Estado.findOne({_id: idEstado}, function(err, estado){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(estado);
  });

});

//Atualiza 1 estado
router.put('/:id', function(req, res){

  var idEstado = req.params.id;
  Estado.findOne({_id: idEstado}, function(err, estado){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    estado.uf = req.body.uf;
    estado.sigla_uf = req.body.sigla_uf;
    estado.nome_uf = req.body.nome_uf;
    estado.cidades = req.body.cidades;

    //tenta atualizar de fato no BD
    estado.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

    });

    //return res.json(estado);
    return res.status(200).send({success: true, message: 'estado atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idEstado = req.params.id;
  Estado.remove({_id: idEstado}, function(err){
    if(err){
      console.log('Erro no delete estado', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'estado removido com sucesso!'});
  });

});

module.exports = router;