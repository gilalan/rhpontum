var express = require('express');
var jwt = require('jwt-simple');
var app = express();
var bcrypt = require('bcrypt');
var User = require('./app/models/usuario');

app.use(require('body-parser').json());

var secretKey  = 'supersecretkey';


function validateUser(user, password, callback) {
  //return bcrypt.compareSync(password, user.password);
	return bcrypt.compare(password, user.password, callback);
}

app.post('/session', function (req, res, next) {
  
  console.log('dados enviados: ' + req.body);
  console.log('dados enviados user: ' + req.body.email);
  console.log('dados enviados psw: ' + req.body.password);
  
  User.findOne({email: req.body.email})
  	.select('password')
  	.exec(function (err, user) {
	  	if (err){
	  		console.log("aconteceu um erro");
	  		return next(err);
	  	}
	  	if (!user) {
	  		console.log("Usuário não encontrado: " + req.body.email);
	  		return res.sendStatus(401);
	  	}
	  	console.log('user finded: ' + user.email);
	  	validateUser(user, req.body.password, function (err, valid) {
			if (err){
	  			console.log("aconteceu um erro");
	  			return next(err);
	  		}
	  		if (!valid) {
	  			console.log("Senha inválida? " + valid);
	  			return res.sendStatus(401);
	  		}
	  		var token = jwt.encode({email: user.email}, secretKey);
		    res.json(token);
	  	});
  	});
});

app.post('/user', function (req, res, next) {
  
  var user = new User({email: req.body.email});
  bcrypt.hash(req.body.password, 10, function (err, hash) {

    user.password = hash;
   
    user.save(function (err, user) {
      if (err) { 
        throw next(err);
	  }
      res.sendStatus(201);
	});
  });
});

app.get('/user', function (req, res) {

  var token = req.headers['x-auth'];
  var auth = jwt.decode(token, secretKey);

  User.findOne({email: auth.email}, function (err, user) {
    res.json(user);
  });

});

app.listen(3000);
console.log("App listening on port 3000");
