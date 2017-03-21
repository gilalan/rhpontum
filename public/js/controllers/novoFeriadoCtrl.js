angular.module('rhPontumApp').controller('novoFeriadoCtrl', ['$scope', '$window', '$location', 'feriadosAPI',  
    function($scope, $window, $location, feriadosAPI){
    
    console.log('entrando em novo feriado CTRL');
    $scope.newOrEdit = 'Novo';
    $scope.feriado = {fixo: true};

    $scope.save = function(feriado) {

        if (!feriado.fixo)
            feriado.fixo = false;
            
        feriadosAPI.create(feriado).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            delete $scope.feriado;
            $scope.feriadoForm.$setPristine();
            $scope.successMsg = response.data.message;
            //feriado cadastrado/salvo com sucesso e retornar para página anterior.
            $location.path('/feriados');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de feriado: " + response.data.message);
            $window.scrollTo(0, 0);
        });
    };
}]);