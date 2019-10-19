var Usuario = require('./app/models/usuario');

var ensureAuthorizedFunc = function(reqUsuario, routeAccessLevel) {
	
	console.log('reqUsuario', reqUsuario);
	if (reqUsuario) {
		Usuario.findOne({email: reqUsuario.email}, function(err, usuario) {
			
			if (err) 
				return false;

			console.log('usuario: ', usuario);
			if (usuario.perfil.accessLevel >= routeAccessLevel)
				return true;		

		});
	} else return false;
}

module.exports = {
  	secretKey: 'supersecretkey',
	aws: {
		region: "us-west-2",
		bucketName: "uploads-abono-attachments"
	},
	awsrep: {
        region: "sa-east-1",
        bucketName: "rhponto.rep.file",
        key: "AKIAJWIF4GOLKQPKQ5MQ"

    },
  	ensureAuthorized: ensureAuthorizedFunc	
}