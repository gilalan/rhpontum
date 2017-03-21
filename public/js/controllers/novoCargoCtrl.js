angular.module('rhPontumApp').controller('novoCargoCtrl', ['$scope', '$window', '$location', 'cargosAPI',  
    function($scope, $window, $location, cargosAPI){
    
    console.log('entrando em novo cargo CTRL');
    $scope.newOrEdit = 'Novo';
    //$scope.cargo = {fixo: true};

    $scope.save = function(cargo) {

        cargosAPI.create(cargo).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            delete $scope.cargo;
            $scope.cargoForm.$setPristine();
            $scope.successMsg = response.data.message;
            //cargo cadastrado/salvo com sucesso e retornar para página anterior.
            $location.path('/cargos');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de cargo: " + response.data.message);
            $window.scrollTo(0, 0);
        });

    };
}]);