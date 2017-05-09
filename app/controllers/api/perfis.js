var Perfil = require('../../models/perfil');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Perfils
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

//Get ALL perfils
router.get('/', function(req, res) {

	Perfil.find(function(err, perfis){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(perfis);
	});

});

//Create perfil
router.post('/', function(req, res) {

  console.log("req", req.body);

  Perfil.create({
    
    nome: req.body.nome,
    accessLevel: req.body.accessLevel    

  }, function(err, perfil){

    if(err) {
      console.log('erro post perfil: ', err);
      
      if (err.code === 11000) {
        console.log('perfil existente!');
        return res.status(500).send({success: false, message: 'Perfil já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.status(200).send({success: true, message: 'Perfil registrado com sucesso!'});
  });
});

//Traz apenas 1 perfil
router.get('/:id', function(req, res) {

  var idPerfil = req.params.id;

  Perfil.findOne({_id: idPerfil}, function(err, perfil){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(perfil);
  });

});

//Atualiza 1 perfil
router.put('/:id', function(req, res){

  var idPerfil = req.params.id;
  Perfil.findOne({_id: idPerfil}, function(err, perfil){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    perfil.nome = req.body.nome;
    perfil.accessLevel = req.body.accessLevel;

    //tenta atualizar de fato no BD
    perfil.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
    });

    //return res.json(perfil);
    return res.status(200).send({success: true, message: 'Perfil atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idPerfil = req.params.id;
  Perfil.remove({_id: idPerfil}, function(err){
    if(err){
      console.log('Erro no delete perfil', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Perfil removido com sucesso!'});
  });
});

//Get ALL perfils
router.get('/:lvl/level', function(req, res) {

  //nível do usuário que fez a requisição
  console.log('Obtendo Perfis por Level');
  var userLevel = req.params.lvl;

  Perfil.find({accessLevel: {$lt: userLevel}}) 
  .exec(function(err, perfis) {

    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
          
    return res.json(perfis);
  });
});

module.exports = router;