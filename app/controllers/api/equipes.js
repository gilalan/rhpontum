var Equipe = require('../../models/equipe');
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

  Equipe.find()
  .populate('gestor', 'nome')
  .populate('setor')
  .exec(function(err, equipes){
		
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
	return res.json(equipes);
  });
});

router.post('/', function(req, res) {

  console.log("req", req.body);

  Equipe.create({
    
    nome: req.body.nome,
    componentes: req.body.componentes,
    gestor: req.body.gestor,
    setor: req.body.setor

  }, function(err, equipe){

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
      
    return res.json(equipe);
  });
});

//GET 1 equipe by id
router.get('/:id', function(req, res){

	var idEquipe = req.params.id;
	console.log("nomeEquipe: ", idEquipe);
	
	Equipe.findOne({_id: idEquipe})
  .populate('setor')
  .exec(function(err, equipe){
		
		if(err) {
    		return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    	}

    	/*remover por enquanto essa função de verificar a permissão de autorização
  	
	  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
	  		console.log('usuário não autorizado para instituições');
	  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
	  	}
	  	*/
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

    	/*remover por enquanto essa função de verificar a permissão de autorização
  	
	  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
	  		console.log('usuário não autorizado para instituições');
	  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
	  	}
	  	*/

	  	equipe.nome = req.body.nome;
      equipe.componentes = req.body.componentes;
      equipe.gestor = req.body.gestor;
      equipe.setor = req.body.setor;

      //tenta atualizar de fato no BD
      equipe.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

      });

      return res.json(equipe);
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

module.exports = router;