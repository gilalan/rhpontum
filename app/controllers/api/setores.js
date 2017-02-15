var Setor = require('../../models/setor');
var Equipe = require('../../models/equipe');
//var Campus = require('../../models/campi');
//var Instituicao = require('../../models/instituicao');
var router = require('express').Router();
var config = require('../../../config');


router.get('/', function(req, res) {

  Setor.find()
  .populate('campus', 'nome')  
  .exec(function(err, setores){
		
		if(err) {
    	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

  	
	  return res.json(setores);
  });
});

//criar setor
router.post('/', function(req, res) {

  console.log("setor: ", req.body);
  var _setor = req.body;

  Setor.create(_setor, function(err, setor){

    if(err) {
      console.log('erro post setor: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    return res.status(200).send({success: true, message: 'Setor cadastrado com sucesso!'});
  });
});

//GET 1 setor by id
router.get('/:id', function(req, res){

	var idSetor = req.params.id;
	console.log("idSetor: ", idSetor);
	
	Setor.findOne({_id: idSetor}, function(err, setor){
		
		if(err) {
   		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
   	}
    	
		console.log("Setor mongoose: ", setor);
		return res.json(setor);
	});
});

//Update 1 setor by id
router.put('/:id', function(req, res){
	
	var idSetor = req.params.id;
	
	Setor.findOne({_id: idSetor}, function(err, setor){

		if(err) {
    		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    	}
    	
	  	setor.nome = req.body.nome;
	  	setor.campus = req.body.campus;
	  	if(req.body.descricao)
	  		setor.descricao = req.body.descricao;

	  	//tenta atualizar de fato no BD
	    setor.save(function(err){
	      
	      if(err){
	        console.log('Erro no save do update', err);
	        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
	      }

	    });

	    return res.status(200).send({success: true, message: 'Setor atualizado com sucesso!'});
	});
});

//Remove 1 setor by ID
router.delete('/:id', function(req, res){
	
	var idSetor = req.params.id;
	
	Setor.remove({_id: idSetor}, function(err){
		
		if(err){
	      console.log('Erro no delete setor', err);
	      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
	    }

    	return res.status(200).send({success: true, message: 'Setor removido com sucesso!'});
	});
});

//########################################################
// Métodos extras, fora do padrão REST
//########################################################


//Pegando equipes de um setor específico
router.get('/:id/equipes', function(req, res){

    var idSetor = req.params.id;

    console.log('idSetor', idSetor);
    Equipe.find({setor: idSetor})
    .populate('gestor', 'nome PIS')
    .exec(function(err, equipes){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        
        console.log("equipes mongoose: ", equipes);
        return res.json(equipes);
    });
});

module.exports = router;