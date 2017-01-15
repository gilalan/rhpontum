// ======================================================
/* configure routes for every request in our API
 * here we have all routes in a single file
 *
*/
// ======================================================

// load the User model
var User = require('./models/user');
var Funcionario = require('./models/funcionario')

// expose the routes to our app with module.exports
module.exports = function(app) {

    // api ---------------------------------------------------------------------
    // get all users
    app.get('/api/users', function(req, res) {

        // use mongoose to get all users in the database
        User.find(function(err, users) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(users); // return all users in JSON format
        });
    });

    // create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        console.log("Objeto req.body: " + req.body);
        // create a user, information comes from AJAX request from Angular
        User.create({
            name : req.body.name,
            lastname: req.body.lastname,
            birthdate: req.body.birthdate,
            done : false
        }, function(err, user) {
            if (err)
                res.send(err);

            // get and return all the users after you create another
            User.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });

    });

    // delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
            _id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            // get and return all the users after you create another
            User.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });
    });

    //=========================================================================
    // API para FUNCIONARIOS
    //=========================================================================
    // get all FUNCIONARIOS
    app.get('/api/funcionarios', function(req, res) {

        // usando o mongoose Model para buscar todos os funcionários
        Funcionario.find(function(err, funcionarios) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(funcionarios); // return all users in JSON format
        });
    });


    // cria um funcionário na BD em consultas provenientes de um POST
    app.post('/api/funcionarios', function(req, res) {

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

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index2.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

};