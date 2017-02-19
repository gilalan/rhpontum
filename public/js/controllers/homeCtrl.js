angular.module('rhPontumApp').controller('homeCtrl', ['$scope', '$location', 'Auth',
	function($scope, $location, Auth){

	$scope.currentUser = Auth.getCurrentUser();
	console.log("ENTRANDO NO HOME CTRL");
	
	$scope.logout = function() {
		
		$scope.$emit('logout');
		$location.path("/");
	}

}]);