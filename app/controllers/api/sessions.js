var Usuario = require('../../models/usuario');
var router = require('express').Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var config = require('../../../config');

router.post('/', function(req, res, next) {

    if (!req.body.email || !req.body.senha) {
        return res.sendStatus(401);
    }
        
    console.log("req.body.email: " + req.body.email);

    Usuario.findOne({email: req.body.email})
    .select('email')
    .select('senha')
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
                console.log("aconteceu um erro");
                return res.status(500).send({ success: false, message: 'Ocorreu um erro no processamento!'});
            }
            if (!valid) {
                console.log("Senha inválida? " + valid);
                return res.status(401).send({ success: false, message: 'Senha inválida!'});
            }
            var token = jwt.encode({email: usuario.email}, config.secretKey);
            res.json(token);
        });
    });
});

module.exports = router;