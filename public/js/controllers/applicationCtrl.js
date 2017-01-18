angular.module('rhPontumApp').controller('applicationCtrl', function($scope){
	
	$scope.$on('login', function (_, user) {
	  $scope.currentUser = user;
	});
});