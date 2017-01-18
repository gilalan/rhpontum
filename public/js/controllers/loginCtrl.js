angular.module('rhPontumApp').controller('loginCtrl', ["$scope", "$location", "usuarioAPI",
	function($scope, $location, usuarioAPI){
		
	function getUsuario(){
		
		usuarioAPI.getUsuario().then(function sucessCallback(response){

			console.log('usuario logado: ' + response.data.email);
			console.log('api services token: ' + usuarioAPI.token);

			//Maneira elegante de associar um usuário logado a nossa APP			
			$scope.$emit('login', response.data);
			//usuarioLogado = response.data;
			$location.path("/dashboard");

		}, function errorCallback(response){

			console.log("Erro de callback no getUsuario: " + response);
			/*
			if (response.status == 401)
				console.log("usuário não encontrado");
			*/
		});
	}

	$scope.login = function (usuario) {

	    usuarioAPI.login(usuario).then(function sucessCallback(response){      				
			
			return getUsuario();

		}, function errorCallback (response) {
			
			$scope.errorMsg = response.data.message;
			
		});
	}

	$scope.register = function (usuario) {

		usuarioAPI.register(usuario).then(function sucessCallback(response){

			$scope.successMsg = response.data.message;
			delete $scope.user;			
			$scope.userForm.$setPristine();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
	}
}]);