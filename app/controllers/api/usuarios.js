var Usuario = require('../../models/usuario');
var router = require('express').Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var config = require('../../../config');

// api ---------------------------------------------------------------------
// get all users
/*
router.get('/api/usuarios', function(req, res) {

    // use mongoose to get all users in the database
    Usuario.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(users); // return all users in JSON format
    });
});*/

router.get('/', function(req, res, next){

  var token = req.headers['x-auth'];
  console.log("token recebido: " + token);

  var auth = jwt.decode(token, config.secretKey);
  console.log("token decodificado: " + auth.email);

  Usuario.findOne({email: auth.email}, function (err, usuario) {
    if (err) {
        console.log("Aconteceu um erro no getUsuarios");
        return next(err);
    }
    if (!usuario){
        console.log("Usuário não encontrado no GETUSUARIOS com token!");
        res.sendStatus(401);
    }
    res.json(usuario);
  });

});

//Cria usuário e encripta a senha com o hash do bcrypt
router.post('/', function(req, res, next) {

    //checar se já tem alguém logado
    if (req.auth) {
      if (req.auth.email)
        console.log('usuário já logado: ' + req.auth.email);
    }

    var _usuario = new Usuario({email: req.body.email, funcionario: req.body.funcionario});
    console.log('email p cadastro: ', req.body.email);
    console.log('senha enviada: ' + req.body.senha);
    bcrypt.hash(req.body.senha, 10, function (err, hash) {
      if(err) {
        return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!' });
      }
      _usuario.senha = hash;
       
      _usuario.save(function (err, usuario) {
          
        if (err) {
          if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate unique key (email)
            return res.status(500).send({ success: false, message: 'E-mail já existe!' });
          }

          // Some other error
          return res.status(500).send(err);
        }

        console.log("usuario criado com sucesso!");
        res.status(201).send({ success: true, message: 'Usuário cadastrado com sucesso!'});
      });
    });
});

//get specific user
router.get('/:id', function(req, res){

  var idUsuario = req.params.id;

  Usuario.findOne({_id: idUsuario})
  .populate('instituicao', 'nome sigla')
  .populate('funcionario', 'nome dataNascimento PIS')
  .exec(function(err, usuario){
    
    if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      /*remover por enquanto essa função de verificar a permissão de autorização
    
      if(!config.ensureAuthorized(req.auth, accessLevel)) {
        console.log('usuário não autorizado para instituições');
        return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
      }
      */
    console.log("usuario mongoose: ", usuario);
    return res.json(usuario);
  });

});

//Update 1 usuario by id
router.put('/:id', function(req, res){
  
  var idUsuario = req.params.id;
  
  Usuario.findOne({_id: idUsuario}, function(err, usuario){

    if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      /*remover por enquanto essa função de verificar a permissão de autorização
    
      if(!config.ensureAuthorized(req.auth, accessLevel)) {
        console.log('usuário não autorizado para instituições');
        return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
      }
      */

      usuario.email = req.body.email;
      //usuario.senha = req.body.senha;//criptografar
      usuario.instituicao = req.body.instituicao;
      usuario.perfil = req.body.perfil;

      //tenta atualizar de fato no BD
      usuario.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

      });

      return res.json(usuario);
  });
});

// delete a user
router.delete('/:id', function(req, res) {
    
  var idUsuario = req.params.id;
  
  Usuario.remove({_id: idUsuario}, function(err){
    
    if(err){
        console.log('Erro no delete usuario', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      return res.status(200).send({success: true, message: 'Usuário removido com sucesso!'});
  });    
});

module.exports = router;