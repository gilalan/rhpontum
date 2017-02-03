angular.module('rhPontumApp').controller('setorCtrl', ["$scope", "setoresAPI", "campi",
	function($scope, setoresAPI, campi){
		
	$scope.campi = campi.data;
	$scope.loaded = [];
	$scope.equipes = [];

	$scope.create = function (setor) {

		setoresAPI.create(setor).then(function sucessCallback(response){

			$scope.successMsg = response.data.message;			
			
			delete $scope.setor;			
			$scope.setorForm.$setPristine();
			$scope.load();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
	}

	$scope.delete = function (id) {

		setoresAPI.delete(id).then(function sucessCallback(response){

			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
		});
	}

	$scope.update = function (id) {

		setoresAPI.update(id).then(function sucessCallback(response){

			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao atualizar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.loadEquipes = function(setorId, index) {

		setoresAPI.getEquipesBySetor(setorId).then(function sucessCallback(response){

			$scope.equipes[index] = response.data;
			$scope.loaded[index] = true;

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
		});
	}

	load = function() {

		setoresAPI.get().then(function sucessCallback(response){

			$scope.setores = response.data;
			initLoadedArray($scope.setores);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
		});
	}


	initLoadedArray = function(setores) {

		for (i = 0; i < setores.length; i++) { 
			$scope.loaded[i] = false;
			$scope.equipes[i] = [];
		}
	}

	load();

}]);