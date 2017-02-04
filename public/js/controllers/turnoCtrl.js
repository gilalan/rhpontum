angular.module('rhPontumApp').controller('turnoCtrl', ['$scope', '$location', 'turnosAPI', 'turnos', 
	function($scope, $location, turnosAPI, turnos){

	$scope.turnos = turnos.data;

	$scope.delete = function (id) {

		turnosAPI.delete(id).then(function sucessCallback(response){

			console.log("deletou?", response.data);
			$scope.successMsg = response.data.message;
			$scope.load();

		}, function errorCallback(response){

			console.log("erro ao deletar", response.data.message);
			$scope.errorMsg = response.data.message;
		});
	}

	$scope.load = function() {

        turnosAPI.get().then(function sucessCallback(response){

            $scope.turnos = response.data;
            console.log("turnos: ", response.data);

        }, function errorCallback(response){

            $scope.errorMsg = response.data.message;
            console.log("Erro no loading de turnos: " + response.data.message);

        });
    }

    $scope.edit = function(id) {

        $location.path("/editTurno/"+id);
    }

    $scope.new = function() {

        $location.path('/novoTurno');
    }
}]);