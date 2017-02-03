angular.module('rhPontumApp').controller('equipeCtrl', ["$scope", "equipesAPI", "setores",
	function($scope, equipesAPI, setores){
		
	$scope.setores = setores.data;
	$scope.loaded = [];
	$scope.funcionarios = [];

	$scope.create = function (equipe) {

		equipesAPI.create(equipe).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			$scope.successMsg = response.data.message;			
			
			delete $scope.equipe;			
			$scope.equipeForm.$setPristine();
			$scope.load();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
	}

	$scope.delete = function (id) {

		equipesAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.update = function (id) {

		equipesAPI.update(id).then(function sucessCallback(response){

			console.log("atualizou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao atualizar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.loadFuncionarios = function(equipeId, index) {

		equipesAPI.getFuncionariosByEquipe(equipeId).then(function sucessCallback(response){

			$scope.funcionarios[index] = response.data;
			$scope.loaded[index] = true;

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
		});
	}

	load = function() {

		equipesAPI.get().then(function sucessCallback(response){

			$scope.equipes = response.data;
			console.log("equipes: ", response.data);
			initLoadedArray($scope.equipes);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro no loading de equipes: " + response.data.message);

		});
	}

	initLoadedArray = function(equipes) {

		for (i = 0; i < equipes.length; i++) { 
			$scope.loaded[i] = false;
			$scope.funcionarios[i] = [];
		}
	}

	load();

}]);