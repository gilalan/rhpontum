
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// connect to mongoDB database on modulus.io
mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');


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
