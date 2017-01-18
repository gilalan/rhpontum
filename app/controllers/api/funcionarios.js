
var Funcionario = require('../../models/funcionario');
var router = require('express').Router();

//=========================================================================
// API para FUNCIONARIOS
//=========================================================================
// get all FUNCIONARIOS
router.get('/', function(req, res) {

    // usando o mongoose Model para buscar todos os funcionários
    Funcionario.find(function(err, funcionarios) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(funcionarios); // return all users in JSON format
    });
});


// cria um funcionário na BD em consultas provenientes de um POST
router.post('/', function(req, res) {

    // create a user, information comes from AJAX request from Angular
    Funcionario.create({
        nome : req.body.nome,
        PIS: req.body.PIS,
        dataNascimento: req.body.dataNascimento            
    }, function(err, user) {
        if (err)
            res.send(err);    

        // get and return all funcs - não funciona sem essa parte, o post é um get porém envia informações
        // ele precisa responder com algo
        Funcionario.find(function(err, funcionarios) {
            if (err)
                res.send(err)
            res.json(funcionarios);
        });       
    });

});

module.exports = router;