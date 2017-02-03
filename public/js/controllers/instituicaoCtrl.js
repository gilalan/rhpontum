angular.module('rhPontumApp').controller('instituicaoCtrl', ['$scope', 'instituicaoAPI', function($scope, instituicaoAPI){

	$scope.create = function (instituicao) {

		//Péssima maneira ao meu ver...
		instituicao.enderecos = [instituicao.endereco];

		instituicaoAPI.create(instituicao).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			$scope.successMsg = response.data.message;			
			
			delete $scope.instituicao;			
			$scope.instituicaoForm.$setPristine();
			$scope.load();

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});		
	}

	$scope.delete = function (id) {

		instituicaoAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.update = function (id) {

		instituicaoAPI.update(id).then(function sucessCallback(response){

			console.log("atualizou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao atualizar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

		instituicaoAPI.get().then(function sucessCallback(response){

			$scope.instituicoes = response.data;
			console.log("instituicoes: ", response.data);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro no loading de instituicoes: " + response.data.message);

		});
	}

	$scope.load();

}]);