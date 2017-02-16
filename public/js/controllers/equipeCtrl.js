angular.module('rhPontumApp').controller('equipeCtrl', ["$scope", "$window", "$location", "equipesAPI", "equipes",
	function($scope, $window, $location, equipesAPI, equipes){
		
	$scope.equipes = equipes.data;

	$scope.delete = function (id) {

		equipesAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$window.scrollTo(0, 0); 
			load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.edit = function(id) {

        $location.path("/editEquipe/"+id);
    }

	$scope.new = function() {

        $location.path('/novaEquipe');
    }

	load = function() {

		equipesAPI.get().then(function sucessCallback(response){

			$scope.equipes = response.data;
			console.log("equipes: ", response.data);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro no loading de equipes: " + response.data.message);

		});
	}
}]);