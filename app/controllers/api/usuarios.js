var Usuario = require('../../models/usuario');
var router = require('express').Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var moment = require('moment');
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

  var _usuario = new Usuario({email: user.email, firstAccess: user.firstAccess, funcionario: user.funcionario, perfil: user.perfil});
  
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
      return res.status(200).send({ success: true, message: 'Usuário associado com sucesso!'});
    });
  });
});

//Traz apenas 1 usuario
router.get('/:id', function(req, res) {

  var idUsuario = req.params.id;

  Usuario.findOne({_id: idUsuario})
  .populate('perfil')
  .populate({
      path: 'funcionario', 
      select: 'nome sobrenome PIS sexoMasculino alocacao',
      model: 'Funcionario',
      populate: [{
        path: 'alocacao.cargo',
        select: 'especificacao nomeFeminino',
        model: 'Cargo'
      },
      {
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{
          path: 'escala', 
          model: 'Escala'
        }]
      }]            
  })
  .exec(function(err, usuario){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro na obtenção do Usuário no Banco de Dados!'});
    }        
    console.log("usuário retornado no get único: ", usuario);      
    return res.json(usuario);
  });

});

//Atualiza 1 usuario
router.put('/:id', function(req, res){

  var idUsuario = req.params.id;
  var _usuario = req.body;

  var conditions = {
    _id : idUsuario 
  }

  //console.log("_usuario: ",_usuario);
  
  if (_usuario && _usuario.senha){

    bcrypt.hash(_usuario.senha, 10, function (err, hash) {
      
      if(err) {
        console.log('Erro: ', err);
        return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!'+err });
      }

      var update = {
        senha: hash,
        firstAccess: false
      }
      //console.log("new hash: ", hash);

      Usuario.findOneAndUpdate(conditions, update, function(err, result){
        //console.log("findOneAndUpdate");
        if (err) {
          
          if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate unique key (email)
            //console.log('error: ', err);
            return res.status(500).send({ success: false, message: 'E-mail já existe!' });
          }
          // Some other error
          //console.log('Entrou no erro');
          return res.status(500).send(err);
        } 
        //console.log('passou lotado pelo erro');
        if (_usuario.returnToken) {
          var expires = moment().add(1, 'days').valueOf();

          var token = jwt.encode({
              _id: _usuario._id,
              email: _usuario.email,
              role: _usuario.role, 
              acLvl: _usuario.acLvl, 
              firstAccess: false,
              exp: expires
          }, config.secretKey);

          var obj = {'token': token, 'idUsuario': _usuario._id, 'firstAccess': false};

          res.json(obj);
        }
        else {
          return res.status(200).send({success: true, message: 'Usuario atualizado com sucesso!'});
        }
      });
    });
  }
  else {

    return res.status(200).send({success: true, message: 'Usuario não modificado!'});
  }
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

router.post('/unregister', function(req, res){

  var funcionario = req.body;
  console.log('vai dar UnRegister no funcionário: ', funcionario);

  Usuario.remove({funcionario: funcionario._id}, function(err){
    if(err){
      console.log('Erro no delete usuario', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Usuario removido do funcionário com sucesso!'});
  });

});

module.exports = router;