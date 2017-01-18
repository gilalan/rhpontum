angular.module('rhPontumApp').service("usuarioAPI", function($http){

	var _urlBaseUsuarios = '/api/usuarios';
	var svc = this;

	svc.login = function (usuario) {
		
		console.log(usuario);
		return $http.post('/api/sessions', usuario);
	};

	svc.register = function (usuario) {
		return $http.post(_urlBaseUsuarios, usuario);
	}

	svc.getUsuario = function(token) {

		return $http.get(_urlBaseUsuarios, {
	      headers: { 'X-Auth': token }
	    });
	};
	
});