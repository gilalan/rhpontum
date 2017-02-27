var Usuario = require('../../models/usuario');
var router = require('express').Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var moment = require('moment');
var config = require('../../../config');

router.post('/', function(req, res, next) {

    if (!req.body.email || !req.body.senha) {
        return res.sendStatus(401);
    }
        
    console.log("req.body.email: " + req.body.email);

    Usuario.findOne({email: req.body.email})
    .populate('perfil')    
    .select('email')
    .select('senha')
    .select('perfil')
    .exec(function (err, usuario) {
        if (err){
            console.log("aconteceu um erro");
            return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!'});
        }
        if (!usuario) {
            console.log("Usuário não encontrado: " + req.body.email);
            return res.status(401).send({ success: false, message: 'Usuário não encontrado!'});
        }
        console.log('Usuário encontrado: ' + usuario);
        console.log('Usuário encontrado email: ' + usuario.email);
        
        bcrypt.compare(req.body.senha, usuario.senha, function (err, valid) {        
            if (err){
                console.log("aconteceu um erro: ", err);
                return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!'});
            }
            if (!valid) {
                console.log("Senha inválida? " + valid);
                return res.status(401).send({ success: false, message: 'Senha inválida!'});
            }
            var expires = moment().add(1, 'days').valueOf();

            var token = jwt.encode({
                _id: usuario._id,
                email: usuario.email,
                role: usuario.perfil.nome, //pode botar manual para testes
                acLvl: usuario.perfil.accessLevel, //pode botar manual para testes
                exp: expires
            }, config.secretKey);

            var obj = {'token': token, 'idUsuario': usuario._id};

            res.json(obj);
        });
    });
});

module.exports = router;