var Usuario = require('../../models/usuario');
var Funcionario = require('../../models/funcionario');
var router = require('express').Router();
 var jwt = require('jwt-simple');
// var bcrypt = require('bcrypt');
var moment = require('moment');
var config = require('../../../config');

router.post('/', function(req, res) {

    var _funcionario  = req.body;   

    Funcionario.findOne({email: _funcionario.email})
    // .populate('funcionario', 'email cpf pis dataNascimento')
    // .populate('perfil', 'nome')
    .exec(function(err, funcionario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log('funcionario: ', funcionario.nome);
        if (funcionario.PIS == _funcionario.pis && funcionario.CPF == _funcionario.cpf){

            Usuario.findOne({funcionario: funcionario._id})
            .populate('perfil')    
            .select('email')
            .select('senha')
            .select('firstAccess')
            .select('perfil')
            .exec(function(err, usuario){
                
                if(err) {
                    return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento do usuário!'});
                }

                usuario.firstAccess = true;
                usuario.save(function(err){
        
                    if(err){
                      console.log('Erro no update do user', err);
                      return res.status(500).send({success: false, message: 'Ocorreu um erro na atualização!'});
                    }

                    //return res.status(200).send({success: true, message: 'Senha resetada com sucesso, prossiga para criação de nova senha.'});
                    var expires = moment().add(1, 'days').valueOf();

                    var token = jwt.encode({
                        _id: usuario._id,
                        email: usuario.email,
                        firstAccess: usuario.firstAccess,
                        role: usuario.perfil.nome, //pode botar manual para testes
                        acLvl: usuario.perfil.accessLevel, //pode botar manual para testes
                        exp: expires
                    }, config.secretKey);

                    var obj = {'token': token, 'idUsuario': usuario._id, 'firstAccess': usuario.firstAccess};

                    res.json(obj);
                });
            });

        } else {

            return res.status(500).send({success: false, message: 'Funcionaŕio não encontrado'});
        }
    });
});

module.exports = router;