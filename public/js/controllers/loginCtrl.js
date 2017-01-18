angular.module('rhPontumApp').controller('loginCtrl', function($scope, $location, usuarioAPI){

	var token = "";

	function getToken(){
		return token;
	}

	function setToken(_token){
		token = _token;
	}

	function getUsuario(){
		
		usuarioAPI.getUsuario(getToken()).then(function sucessCallback(response){

			//Maneira elegante de associar um usuário logado a nossa APP
			$scope.$emit('login', response.data);
			//usuarioLogado = response.data;
			$location.path("/dashboard");

		}, function errorCallback(response){

			console.log("Erro de callback no getUsuario: " + response);

			if (response.status == 401)
				console.log("usuário não encontrado");
		});
	}

	$scope.login = function (usuario) {

	    usuarioAPI.login(usuario).then(function sucessCallback(response){
	      
			var token = response.data;
			setToken(token);

			console.log("Login efetuado, token gerado: " + token);
			return getUsuario();

		}, function errorCallback (response) {

			console.log("Erro status: " + response.status);
			if (response.status == 401) {
				console.log("usuário ou senha não encontrado(s).")
			}
		});
	}

	$scope.register = function (usuario) {

		usuarioAPI.register(usuario).then(function sucessCallback(response){

			console.log("usuario registrado com sucesso: " + response.data);

		}, function errorCallback(response){

			console.log("Erro de registro: " + response);
		});
	}
});