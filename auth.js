var jwt = require('jwt-simple');
var config = require('./config');

//Isso é um middleware que roda antes da requisição ser completada para as rotas
/*
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

    */


module.exports = function (req, res, next) {
  if (req.headers['x-auth']) {
    req.auth = jwt.decode(req.headers['x-auth'], config.secretKey);
	  //console.log('consegui pegar o user? ', req.auth);
  } 
  else {
  	//console.log("Objeto req url: ", req.url);
	  //console.log("##### NENHUM USUÁRIO LOGADO NA APP!!!! ##### ROTA PUBLICA?!");
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  //res.header('Access-Control-Allow-Headers', 'Content-Type');
  //console.log('passou aqui no ALL e colocou os HEADERS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  
  next();
};