angular.module('rhPontumApp').controller('cargoCtrl', ['$scope', '$location', 'cargosAPI', 'cargos', 
	function($scope, $location, cargosAPI, cargos){

	$scope.cargos = cargos.data;

	$scope.delete = function (id) {

		cargosAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

        cargosAPI.get().then(function sucessCallback(response){

            $scope.cargos = response.data;
            console.log("cargos: ", response.data);

        }, function errorCallback(response){

            $scope.errorMsg = response.data.message;
            console.log("Erro no loading de cargos: " + response.data.message);

        });
    }

    $scope.edit = function(id) {

        $location.path("/editCargo/"+id);
    }

    $scope.new = function() {

        $location.path('/novoCargo');
    }
}]);