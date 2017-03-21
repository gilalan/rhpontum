angular.module('rhPontumApp').controller('editFeriadoCtrl', ['$scope', '$filter', '$window', '$location', 'feriado', 'feriadosAPI', 
    function($scope, $filter, $window, $location, feriado, feriadosAPI){
    
    console.log('entrando em edit feriado ctrl');

    $scope.feriado = feriado.data;
    $scope.feriado.data = $filter('date')($scope.feriado.data, "dd/MM/yyyy");
    $scope.newOrEdit = 'Editar';
    $window.scrollTo(0, 0);    

    $scope.save = function(feriado) {
        
        console.log('feriado a ser enviado:', feriado);
        feriado.data = fixDateFormat(feriado.data);
        console.log('feriado a ser enviado corrigido:', feriado);

        if (!feriado.fixo)
            feriado.fixo = false;

        feriadosAPI.update(feriado).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            //delete $scope.feriado;           
            //$scope.feriadoForm.$setPristine();
            $scope.successMsg = response.data.message;
            console.log("Sucesso no cadastro de feriado: " + response.data.message);
            $location.path('/feriados');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de feriado: " + response.data.message);
            $window.scrollTo(0, 0);  
        });

        $window.scrollTo(0, 0);
    };

    fixDateFormat = function(data) {
                
        var regex = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/;

        if (regex.test(data)){
            if(data.length === 10) {
                var dateArray = data.split("/");
                return new Date(dateArray[2], dateArray[1]-1, dateArray[0]).getTime();
            }
        } 

        return data;
    }
}]);