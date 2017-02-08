angular.module('rhPontumApp').controller('applicationCtrl', ["$scope", "$rootScope", function($scope, $rootScope){	

	$scope.auth = true;
	//$scope.auth = true; //TO COLOCANDO ASSIM PARA PODER FUNCIONAR COM O LAYOUT E TALS
	//TENHO QUE CORRIGIR ESSA QUESTÃO DE QUEM É PERMITIDO PARA USAR O QUẼ

	$scope.$on('login', function (_, user) {
	  	$rootScope.currentUser = user;
		$scope.auth = true;
	});
	
}]);