angular.module('rhPontumApp').controller('unauthorizedCtrl', ['$scope', '$location', 
	function($scope, $location){

	console.log("ENTRANDO NO unauthorized CTRL");

	logout = function() {
		
		$scope.$emit('logout');
		$location.path("/");
	}

	$scope.novoLogin = function() {

		logout();
	}

}]);