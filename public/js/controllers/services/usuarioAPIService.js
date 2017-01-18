angular.module('rhPontumApp').service("usuarioAPI", function($http){

	var _urlBaseUsuarios = '/api/usuarios';
	var svc = this;

	svc.getUsuario = function() {

		return $http.get(_urlBaseUsuarios);//, {
	      //headers: { 'X-Auth': token }
	    //});
	};

	svc.login = function (usuario) {
		
		console.log(usuario);
		return $http.post('/api/sessions', usuario).then(function sucessCallback(response){
	      
			svc.token = response.data;
			console.log("Login efetuado, token gerado da api user svc: " + svc.token);
			$http.defaults.headers.common['X-Auth'] = response.data;

			return response;
		});
			
	};

	svc.register = function (usuario) {
		return $http.post(_urlBaseUsuarios, usuario);
	};	
	
});