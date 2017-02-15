var Usuario = require('../../models/usuario');
var router = require('express').Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var config = require('../../../config');


//Get ALL Users
router.get('/', function(req, res) {

  Usuario.find()
  .populate('perfil')
  .populate('funcionario')
  .exec(function(err, usuarios){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
          
    return res.json(usuarios);
  });

});

//Create usuario
router.post('/', function(req, res) {

  console.log("req", req.body);
  var user = req.body;

  var _usuario = new Usuario({email: user.email, funcionario: user.funcionario, perfil: user.perfil});
  
  bcrypt.hash(user.senha, 10, function (err, hash) {
    
    if(err) {
      return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!' });
    }
    _usuario.senha = hash;
    _usuario.save(function (err, usuario) {
        
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          // Duplicate unique key (email)
          console.log('error: ', err);
          return res.status(500).send({ success: false, message: 'E-mail já existe!' });
        }

        // Some other error
        return res.status(500).send(err);
      }

      console.log("usuario criado com sucesso!");
      return res.status(200).send({ success: true, message: 'Usuário cadastrado com sucesso!'});
    });
  });
});

//Traz apenas 1 usuario
router.get('/:id', function(req, res) {

  var idUsuario = req.params.id;

  Usuario.findOne({_id: idUsuario}, function(err, usuario){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(usuario);
  });

});

//Atualiza 1 usuario
router.put('/:id', function(req, res){

  var idUsuario = req.params.id;
  Usuario.findOne({_id: idUsuario})
  .populate('funcionario', 'nome dataNascimento PIS')
  .populate('perfil')
  .exec(function(err, usuario){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    usuario.email = req.body.email;
    //usuario.senha = req.body.senha;
    usuario.funcionario = req.body.funcionario;
    usuario.perfil = req.body.perfil;

    //tenta atualizar de fato no BD
    usuario.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
    });

    //return res.json(usuario);
    return res.status(200).send({success: true, message: 'Usuario atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idUsuario = req.params.id;
  Usuario.remove({_id: idUsuario}, function(err){
    if(err){
      console.log('Erro no delete usuario', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Usuario removido com sucesso!'});
  });
});

module.exports = router;