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

router.get('/api/usuarios', function(req, res, next){

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
router.post('/api/usuarios', function(req, res, next) {

    var _usuario = new Usuario({email: req.body.email});

    bcrypt.hash(req.body.senha, 10, function (err, hash) {
      if(err) {
        throw next(err);
      }
      _usuario.senha = hash;
       
      _usuario.save(function (err, usuario) {
          
        if (err) { 
          throw next(err);
        }
        console.log("usuario criado com sucesso!");
        res.sendStatus(201);
      });
    });
});

// delete a user
router.delete('/api/usuarios/:user_id', function(req, res) {
    Usuario.remove({
        _id : req.params.user_id
    }, function(err, user) {
        if (err)
            res.send(err);

        // get and return all the users after you create another
        Usuario.find(function(err, users) {
            if (err)
                res.send(err)
            res.json(users);
        });
    });
});

module.exports = router;