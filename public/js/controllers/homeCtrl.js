angular.module('rhPontumApp').controller('homeCtrl', ["$scope", "$location", function($scope, $location){

	console.log("ENTRANDO NO HOME CTRL");
	
	$scope.logout = function() {
		
		$scope.$emit('logout');
		$location.path("/");
	}

}]);