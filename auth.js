var jwt = require('jwt-simple');
var config = require('./config');

//LEMBRAR DE REMOVER ESSE USUARIO DA MEMORIA QUANDO DER O LOGOUT

module.exports = function (req, res, next) {
  if (req.headers['x-auth']) {
    req.auth = jwt.decode(req.headers['x-auth'], config.secretKey);
	console.log('consegui pegar o user? ', req.auth);
  }
  next();
};