angular.module('rhPontumApp').controller('loginCtrl', ["$scope", "$location", "Auth", 
	"usuariosAPI", "homeAPI", 
	function($scope, $location, Auth, usuariosAPI, homeAPI){
	
	console.log("Entrou no Login controller");

	function getUsuario(idUsuario){
		
		usuariosAPI.getUsuario(idUsuario).then(function sucessCallback(response){

			console.log('usuario logado: ', response.data.email);

			//Maneira elegante de associar um usuário logado a nossa APP			
			$scope.$emit('login', response.data);
			//usuarioLogado = response.data;
			$location.path("/indicadores");

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
			$location.path('/indicadores');
		});
	}	

	$scope.login = function (usuario, baterPonto) {
			
		console.log("Entrou no $scope.login");
		console.log("bater ponto?", usuario);
		console.log("bater ponto?", baterPonto);

	    usuariosAPI.signIn(usuario).then(function sucessCallback(response){      				
						
			console.log('Auth.setToken', response.data.token);
			console.log('id usuário retornado: ', response.data.idUsuario);
            //window.location = "/";
			//return getUsuario(response.data.idUsuario);
			//return redirectHome();
			$scope.$emit('login', response.data.token);
			var pathTo = "/indicadores";

			if (baterPonto)
				pathTo = "/registro_ponto/"+response.data.idUsuario;

			console.log("path? ", pathTo);
			$location.path(pathTo);

		}, function errorCallback (response) {
			
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.register = function (usuario) {

		usuariosAPI.register(usuario).then(function sucessCallback(response){

			$scope.successMsg = response.data.message;
			delete $scope.user;			
			$scope.userForm.$setPristine();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
		
	}

}]);