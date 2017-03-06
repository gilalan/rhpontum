angular.module('rhPontumApp').controller('applicationCtrl', ["$scope", "$rootScope", "Auth", function($scope, $rootScope, Auth){	

	console.log("Passa no APP controller!");
	$scope.logged = false;
	$scope.authorized = false;
	//$scope.auth = true; //TO COLOCANDO ASSIM PARA PODER FUNCIONAR COM O LAYOUT E TALS
	//TENHO QUE CORRIGIR ESSA QUESTÃO DE QUEM É PERMITIDO PARA USAR O QUẼ

	$scope.$on('login', function (_, token) {
	  	
		Auth.setToken(token);
		$rootScope.currentUser = Auth.getCurrentUser();//so testes
		console.log("Direto do APPCtrl: user logado: ", $rootScope.currentUser);
		$scope.logged = true;
	});

	$scope.$on('logout', function (_) {
	  	
		Auth.logout();
		$rootScope.currentUser = null;
		console.log("LOGOUT FROM APPCtrl");
		$scope.logged = false;
	});

	$scope.$on('authorized', function(_, isAuthorized) {

		$scope.authorized = (isAuthorized) ? true : false;

	});

	$scope.$on('logged', function(_, isLogged) {

		$scope.logged = (isLogged) ? true : false;
		
	});
	
}]);