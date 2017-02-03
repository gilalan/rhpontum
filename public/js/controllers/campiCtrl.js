angular.module('rhPontumApp').controller('campiCtrl', ['$scope', 'campiAPI', 'instituicoes', function($scope, campiAPI, instituicoes){

	$scope.instituicoes = instituicoes.data;

	$scope.create = function (campus) {

		campiAPI.create(campus).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			$scope.successMsg = response.data.message;			
			
			delete $scope.campus;			
			$scope.campusForm.$setPristine();
			$scope.load();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
	}

	$scope.delete = function (id) {

		campiAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.update = function (id) {

		campiAPI.update(id).then(function sucessCallback(response){

			console.log("atualizou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao atualizar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

		campiAPI.get().then(function sucessCallback(response){

			$scope.campi = response.data;
			console.log("campi: ", response.data);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro no loading de campi: " + response.data.message);

		});
	}

	$scope.load();

}]);