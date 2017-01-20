var Setor = require('../../models/setor');
//var Campus = require('../../models/campi');
//var Instituicao = require('../../models/instituicao');
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

  Setor.find()
  .populate('campus')
  .exec(function(err, setores){
		
		if(err) {
    	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}

  	/*remover por enquanto essa função de verificar a permissão de autorização
  	
  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
  		console.log('usuário não autorizado para instituições');
  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
  	}
  	*/

    //console.log("Instituição: ", instituicao);
    //var inst = ObjectId(""+);
	return res.json(setores);
  });
});

router.post('/', function(req, res) {

  console.log("req", req.body);

  Setor.create({
    
    nome: req.body.nome,
    descricao: req.body.descricao,
    campus: req.body.campus    

  }, function(err, setor){

    if(err) {
      console.log('erro post setor: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    /*remover por enquanto essa função de verificar a permissão de autorização
    if(!config.ensureAuthorized(req.auth, accessLevel)) {
      console.log('usuário não autorizado para instituições');
      return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
    }
    */
      
    return res.json(setor);
  });
});

//GET 1 setor by id
router.get('/:id', function(req, res){

	var idSetor = req.params.id;
	console.log("nomeSetor: ", idSetor);
	
	Setor.findOne({_id: idSetor}, function(err, setor){
		
		if(err) {
    		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    	}

    	/*remover por enquanto essa função de verificar a permissão de autorização
  	
	  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
	  		console.log('usuário não autorizado para instituições');
	  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
	  	}
	  	*/
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

    	/*remover por enquanto essa função de verificar a permissão de autorização
  	
	  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
	  		console.log('usuário não autorizado para instituições');
	  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
	  	}
	  	*/

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

	    return res.json(setor);
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

module.exports = router;