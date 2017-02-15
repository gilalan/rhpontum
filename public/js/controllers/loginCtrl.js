angular.module('rhPontumApp').controller('loginCtrl', ["$scope", "$location", "Auth", 
	"usuarioAPI", "homeAPI",
	function($scope, $location, Auth, usuarioAPI, homeAPI){
	
	console.log("Entrou no Login controller");

	function getUsuario(idUsuario){
		
		usuarioAPI.getUsuario(idUsuario).then(function sucessCallback(response){

			console.log('usuario logado: ', response.data.email);

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

	function redirectHome() {

		homeAPI.get().then(function sucessCallback(response){

			console.log('passou pelo sucess do redirectHome');
			$location.path('/dashboard');
		});
	}

	$scope.login = function (usuario) {

	    usuarioAPI.signIn(usuario).then(function sucessCallback(response){      				
						
			console.log('Auth.setToken', response.data.token);
			console.log('id usuário retornado: ', response.data.idUsuario);
            //window.location = "/";
			//return getUsuario(response.data.idUsuario);
			//return redirectHome();
			$scope.$emit('login', response.data.token);
			$location.path("/dashboard");

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

	//$scope.token = $localStorage.token;
}]);