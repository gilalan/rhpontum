var Funcionario = require('../../models/funcionario');
var router = require('express').Router();

//=========================================================================
// API para FUNCIONARIOS
//=========================================================================
// get all FUNCIONARIOS
router.get('/', function(req, res) {

    if (req.auth) {
      if (req.auth.email)
        console.log('usuário já logado: ' + req.auth.email);
        if (req.auth.role){

            console.log('role: ' + req.auth.role);
            //forçando um erro para um novo usuário criado com os roles
            if (req.auth.role === 'ROLE_USER'){//na verdade esse é admin
                //teria q checar o nível de acesso da rota pra saber se ele é permitido visualizar
                console.log("Usuário com ROLE não autorizado example!");
                //res.status(403).send({ success: false, message: 'Não Autorizado!' });
            }
        }

    } else {
        console.log('usuário não logado');
        //res.status(403).send({ success: false, message: 'Não Autorizado!' });
        //403 - forbidden - proibido de acessar
    }
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