angular.module('rhPontumApp').controller('applicationCtrl', ["$scope", function($scope){
		
	$scope.$on('login', function (_, user) {
	  $scope.currentUser = user;
	});
}]);