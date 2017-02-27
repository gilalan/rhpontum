angular.module('rhPontumApp').controller('solicitacoesCtrl', ['$scope', '$location', 'solicitacoesAPI', 'solicitacoes', 
	function($scope, $location, solicitacoesAPI, solicitacoes){

	$scope.solicitacoes = solicitacoes.data;
    $scope.currentPage = 1;
    $scope.pageSize = 5;

    $scope.pageChangeHandler = function(num) {
      console.log('solicitacoes page changed to ' + num);
    };

	$scope.delete = function (id) {

		solicitacoesAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

        solicitacoesAPI.get().then(function sucessCallback(response){

            $scope.solicitacoes = response.data;
            console.log("solicitacoes: ", response.data);

        }, function errorCallback(response){

            $scope.errorMsg = response.data.message;
            console.log("Erro no loading de solicitacoes: " + response.data.message);

        });
    }

    $scope.edit = function(id) {

        $location.path("/editSolicitacao/"+id);
    }

    $scope.new = function() {

        $location.path('/novaSolicitacao');
    }
}]);