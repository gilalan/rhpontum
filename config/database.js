
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// connect to mongoDB database on modulus.io mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi
// novo CLUSTER on ATLAS: mongodb://Admin:a5e1hj90svmb#88ptr@rhpontocluster-shard-00-00-67fdt.mongodb.net:27017,rhpontocluster-shard-00-01-67fdt.mongodb.net:27017,rhpontocluster-shard-00-02-67fdt.mongodb.net:27017/RHPontoDB?ssl=true&replicaSet=RHPontoCluster-shard-0&authSource=admin
// Databases no ATLAS: RHPontoDB, Ohy3tagi, Admin
mongoose.connect('mongodb://Admin:a5e1hj90svmb#88ptr@rhpontocluster-shard-00-00-67fdt.mongodb.net:27017,rhpontocluster-shard-00-01-67fdt.mongodb.net:27017,rhpontocluster-shard-00-02-67fdt.mongodb.net:27017/Ohy3tagi?ssl=true&replicaSet=RHPontoCluster-shard-0&authSource=admin');


var db = mongoose.connection;  

db.on('error', function(err){  
    console.log('Erro de conexao.', err)
});
db.on('open', function () {  
  console.log('Conexão aberta.')
});
db.on('connected', function(err){  
    console.log('Conectado')
});
db.on('disconnected', function(err){  
    console.log('Desconectado')
});


module.exports = db;
