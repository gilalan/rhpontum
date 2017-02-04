angular.module('rhPontumApp').controller('feriadoCtrl', ['$scope', '$location', 'feriadosAPI', 'feriados', 
	function($scope, $location, feriadosAPI, feriados){

	$scope.feriados = feriados.data;

	$scope.delete = function (id) {

		feriadosAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

        feriadosAPI.get().then(function sucessCallback(response){

            $scope.feriados = response.data;
            console.log("feriados: ", response.data);

        }, function errorCallback(response){

            $scope.errorMsg = response.data.message;
            console.log("Erro no loading de feriados: " + response.data.message);

        });
    }

    $scope.edit = function(id) {

        $location.path("/editFeriado/"+id);
    }

    $scope.new = function() {

        $location.path('/novoFeriado');
    }
}]);