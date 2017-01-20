var Instituicao = require('../../models/instituicao');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Instituições
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

//Get ALL instituicoes
router.get('/', function(req, res) {

	Instituicao.find(function(err, instituicoes){
		
		if(err) {
        	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      	}

      	/*remover por enquanto essa função de verificar a permissão de autorização
      	
      	if(!config.ensureAuthorized(req.auth, accessLevel)) {
      		console.log('usuário não autorizado para instituições');
      		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
      	}
      	*/
      		
    	return res.json(instituicoes);
	});

});

//Create instituicao
router.post('/', function(req, res) {

  console.log("req", req.body);

  Instituicao.create({
    
    nome: req.body.nome,
    sigla: req.body.sigla,
    enderecos: req.body.enderecos

  }, function(err, instituicao){

    if(err) {
      console.log('erro post instituicao: ', err);
      
      if (err.code === 11000) {
        console.log('Instituição existente!');
        return res.status(500).send({success: false, message: 'Instituição já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    /*remover por enquanto essa função de verificar a permissão de autorização
    if(!config.ensureAuthorized(req.auth, accessLevel)) {
      console.log('usuário não autorizado para instituições');
      return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
    }
    */
      
    return res.json(instituicao);
  });
});

//Traz apenas 1 instituição
router.get('/:id', function(req, res) {

  var idInstit = req.params.id;

  Instituicao.findOne({_id: idInstit}, function(err, instituicao){
    
    if(err) {
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
        
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
          console.log('usuário não autorizado para instituições');
          return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */
          
      return res.json(instituicao);
  });

});

//Atualiza 1 instituicao
router.put('/:id', function(req, res){

  var idInstit = req.params.id;
  Instituicao.findOne({_id: idInstit}, function(err, instituicao){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    /*remover por enquanto essa função de verificar a permissão de autorização
    
    if(!config.ensureAuthorized(req.auth, accessLevel)) {
      console.log('usuário não autorizado para instituições');
      return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
    }
    */
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    instituicao.nome = req.body.nome;
    instituicao.sigla = req.body.sigla;
    if(req.body.enderecos)
      instituicao.enderecos = req.body.enderecos;

    //tenta atualizar de fato no BD
    instituicao.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    return res.json(instituicao);
  });
});

router.delete('/:id', function(req, res){

  var idInstit = req.params.id;
  Instituicao.remove({_id: idInstit}, function(err){
    if(err){
      console.log('Erro no delete instituicao', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Instituição removida com sucesso!'});
  });

});

module.exports = router;