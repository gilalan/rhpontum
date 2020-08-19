//const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//const MONGODB_URI = "mongodb://127.0.0.1:27017/production?authSource=admin";
const MONGODB_URI = "mongodb://127.0.0.1:27017/production";
const MONGODB_USER = "adminrhponto";
const MONGODB_PASS = "12345678";

const authData =  {
    //"user": MONGODB_USER,
    //"pass": MONGODB_PASS,
    "useNewUrlParser": true
}; 
mongoose.connect(
    MONGODB_URI, 
    authData,
    (err) => {
        if (!err) { console.log('MongoDB connection succeeded.'); }
        else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
    }
);
const db = mongoose.connection;
// connect to mongoDB database on modulus.io mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi
// novo CLUSTER on ATLAS: mongodb://Admin:a5e1hj90svmb#88ptr@rhpontocluster-shard-00-00-67fdt.mongodb.net:27017,rhpontocluster-shard-00-01-67fdt.mongodb.net:27017,rhpontocluster-shard-00-02-67fdt.mongodb.net:27017/RHPontoDB?ssl=true&replicaSet=RHPontoCluster-shard-0&authSource=admin
// Databases no ATLAS: RHPontoDB, Ohy3tagi, Admin

//Dados de Testes
//mongoose.connect('mongodb://Admin:a5e1hj90svmb#88ptr@rhpontocluster-shard-00-00-67fdt.mongodb.net:27017,rhpontocluster-shard-00-01-67fdt.mongodb.net:27017,rhpontocluster-shard-00-02-67fdt.mongodb.net:27017/Ohy3tagi?ssl=true&replicaSet=RHPontoCluster-shard-0&authSource=admin');

//Dados de PRODUÇÃO
//mongoose.connect('mongodb://Admin:a5e1hj90svmb#88ptr@rhpontoproduction-shard-00-00-67fdt.mongodb.net:27017, rhpontoproduction-shard-00-01-67fdt.mongodb.net:27017, rhpontoproduction-shard-00-02-67fdt.mongodb.net:27017/production?ssl=true&replicaSet=RHPontoProduction-shard-0&authSource=admin');
/*
const url = 'mongodb://adminrhponto:12345678@127.0.0.1:27017/production?authSource=admin';
module.exports = MongoClient.connect(url, function(err, db){
   if(!err) 
   	console.log('connected');
});
*/
//LocalhostTest
//mongoose.connect('mongodb://rhadmin:rhgilli86@127.0.0.1:27017/production?authSourcer=admin', {useNewUrlParser: true});
//'mongodb://adminrhponto:12345678@127.0.0.1:27017/production?authSource=admin

//var db = mongoose.connection;  
/*
db.on('error', function(err){  
    console.log('Erro de conexao.', err)
});
db.on('open', function () {  
  // console.log('Conexão aberta.')
});
db.on('connected', function(err){  
    console.log('Conectado')
});
db.on('disconnected', function(err){  
    console.log('Desconectado')
});
*/

module.exports = db;
