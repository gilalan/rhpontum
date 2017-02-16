var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var router = require('express').Router();

router.get('/', function(req, res) {

    //var regex = /gestor|gerente/i;

    Funcionario.find({'alocacao.gestor': true}, {'nome':1, 'sobrenome': 1})
    .exec(function(err, gestores){
        if (err){
            console.log("ERROR> ", err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});    
        }
        //console.log('Gestores: ', gestores);
        return res.json(gestores);
    });
});

module.exports = router;