var Apontamento = require('../../models/apontamento');
var router = require('express').Router();

router.get('/api/apontamentos', function(req, res) {

    // usando o mongoose Model para buscar todos os funcionários
    Apontamento.find(function(err, apontamentos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(apontamentos); // return all users in JSON format
    });
});

router.post('/api/apontamentos', function(req, res) {

    // create a user, information comes from AJAX request from Angular
    var apoint = req.body;

    Apontamento.create(apoint, function(err, apontamento) {
        if (err)
            res.send(err);    

        // get and return all funcs - não funciona sem essa parte, o post é um get porém envia informações
        // ele precisa responder com algo
        Apontamento.find(function(err, apontamentos) {
            if (err)
                res.send(err)
            res.json(apontamentos);
        });       
    });

});

module.exports = router;