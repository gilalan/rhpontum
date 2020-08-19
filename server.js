// set up ========================
//var fs = require('fs');
var express  = require('express');
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

/*
2. Import them to a keystore (some programs use a keystore)
keytool -importcert -file certificate.pem -keystore my.keystore
*/
// var securityOptions = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('certificate.pem'),
//     requestCert: true
// };

// .......................................................
// create the secure server (HTTPS)

var app = express();
//var secureServer = require('https').createServer(securityOptions, app);

//var app = express();                               // create our app w/ express

//Database configuration =================
var database = require('./config/database');

//Other configs
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
//app.use(morgan('dev'));                                         // log every request to the console
//app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
//app.use(bodyParser.json());                                     // parse application/json

app.use(bodyParser.json({limit: '50mb'}));							//Coloquei isso para tentar funcionar o envio/upload de imagens em base64
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(methodOverride());

//middleware para atachar informações de usuário logado
app.use(require('./auth'));

// routes ======================================================================
app.use('/api/usuarios', require('./app/controllers/api/usuarios'));
app.use('/api/authenticate', require('./app/controllers/api/sessions'));
app.use('/api/recovery', require('./app/controllers/api/recoveryPwd'));
app.use('/api/funcionarios', require('./app/controllers/api/funcionarios'));
app.use('/api/gestores', require('./app/controllers/api/gestores'));
app.use('/api/apontamentos', require('./app/controllers/api/apontamentos'));
app.use('/api/instituicoes', require('./app/controllers/api/instituicoes'));
app.use('/api/solicitacoes', require('./app/controllers/api/solicitacoes'));
app.use('/api/solicitacoes-ajuste', require('./app/controllers/api/solicitacoesAjuste'));
app.use('/api/campi', require('./app/controllers/api/campi'));
app.use('/api/setores', require('./app/controllers/api/setores'));
app.use('/api/equipes', require('./app/controllers/api/equipes'));
app.use('/api/eventosabono', require('./app/controllers/api/eventoAbonos'));
app.use('/api/motivosajuste', require('./app/controllers/api/motivoAjustes'));
app.use('/api/feriados', require('./app/controllers/api/feriados'));
app.use('/api/escalas', require('./app/controllers/api/escalas'));
app.use('/api/turnos', require('./app/controllers/api/turnos'));
app.use('/api/cargos', require('./app/controllers/api/cargos'));
app.use('/api/perfis', require('./app/controllers/api/perfis'));
app.use('/api/estados', require('./app/controllers/api/estados'));
app.use('/api/municipios', require('./app/controllers/api/municipios'));
app.use('/api/reports', require('./app/controllers/api/reports'));
app.use('/api/reps', require('./app/controllers/api/reps'));
app.use(require('./app/controllers/static'));
// equivalent to: app.use('/', require('./controllers/static'))

process.on('uncaughtException', function(err) {
	console.log('process on - uncaughtException');
	console.log(err);
});

process.env.AWS_SDK_LOAD_CONFIG = 1;
//process.env.AWS_SHARED_CREDENTIALS_FILE = '/home/gilliard/.aws/credentials';
//process.env.AWS_CONFIG_FILE = '/home/gilliard/.aws/config';

// listen (start app with node server.js) ======================================
app.listen(8080);
//secureServer.listen(8081);

console.log("App listening on port 8080");
console.log("Process.env: ", process.env.AWS_SDK_LOAD_CONFIG);
//588168ed8ccb4e0c7bf5b22f