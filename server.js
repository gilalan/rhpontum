// set up ========================
var express  = require('express');
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

//var mongoose = require('mongoose');                     // mongoose for mongodb
//var morgan = require('morgan');             // log requests to the console (express4)
//var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var app = express();                               // create our app w/ express

//Database configuration =================
var database = require('./config/database');

//Other configs
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
//app.use(morgan('dev'));                                         // log every request to the console
//app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
//app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(methodOverride());

//middleware para atachar informações de usuário logado
app.use(require('./auth'));

// routes ======================================================================
app.use('/api/usuarios', require('./app/controllers/api/usuarios'));
app.use('/api/authenticate', require('./app/controllers/api/sessions'));
app.use('/api/funcionarios', require('./app/controllers/api/funcionarios'));
app.use('/api/apontamentos', require('./app/controllers/api/apontamentos'));
app.use('/api/instituicoes', require('./app/controllers/api/instituicoes'));
app.use('/api/campi', require('./app/controllers/api/campi'));
app.use('/api/setores', require('./app/controllers/api/setores'));
app.use('/api/equipes', require('./app/controllers/api/equipes'));
app.use(require('./app/controllers/static'));
// equivalent to: app.use('/', require('./controllers/static'))

process.on('uncaughtException', function(err) {
	console.log('process on - uncaughtException');
	console.log(err);
});

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");

//588168ed8ccb4e0c7bf5b22f