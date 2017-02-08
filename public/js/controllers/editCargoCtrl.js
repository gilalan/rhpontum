angular.module('rhPontumApp').controller('editCargoCtrl', ['$scope', '$window', 'cargo', 'cargosAPI', 
    function($scope, $window, cargo, cargosAPI){
    
    console.log('entrando em edit cargo ctrl');

    $scope.cargo = cargo.data;
    $scope.newOrEdit = 'Editar';
    $window.scrollTo(0, 0);    

    $scope.save = function(cargo) {
        
        console.log('cargo a ser enviado:', cargo);
        console.log('cargo a ser enviado corrigido:', cargo);

        cargosAPI.update(cargo).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;
            //cargo cadastrado/salvo com sucesso e retornar para página anterior.
            //$location.path('/cargos');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de cargo: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };
}]);