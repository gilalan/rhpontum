angular.module('rhPontumApp').controller('editarComponentesCtrl', ['$scope', 'equipe', 'funcionarios', 'equipesAPI',
    function($scope, equipe, funcionarios, equipesAPI){
    
    $scope.equipe = equipe.data;
    $scope.funcionarios = funcionarios.data;

    /* PAGINAÇÃO , EM BREVE!
    $scope.filteredWorkers = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 5;
    $scope.maxSize = 5;
    */

    $scope.associar = function (usuario) {

        // Obtendo funcionários selecionados
        var selectedWorkers = $scope.funcionarios.filter(function(funcionario){
            return funcionario.selected;
        });

        console.log("selectedWorkers", selectedWorkers);
        var _componentes = selectedWorkers.map(function(componente){
            return componente._id;
        });

        console.log("Componentes para envio: ", _componentes);
        equipesAPI.atualizarComponentes($scope.equipe._id, _componentes).then(function sucessCallback(response){

            $scope.successMsg = response.data.message;
        
        }, function errorCallback(response){
            
            $scope.errorMsg = response.data.message;
            console.log("Erro de registro: " + response.data.message);
            
        });     
    }

    $scope.setSelected = function (funcionario) {
        console.log("setSelected ", funcionario.nome);
        funcionario.selected = !funcionario.selected;
    }

    /* SERIA PARA PAGINAÇÃO QUE NÃO ESTÁ FUNCIONANDO NO MOMENTO
    $scope.$watch('currentPage + numPerPage', function() {
        
        console.log("entrou no watch?");
        var begin = (($scope.currentPage - 1) * $scope.numPerPage);
        var end = begin + $scope.numPerPage;
        console.log("BEGIN ", begin);
        console.log("END ", end);
        
        $scope.filteredWorkers = $scope.funcionarios.slice(begin, end);
        console.log("$SCOPE.filteredWorkers", $scope.filteredWorkers);
    });*/

    checkAssociation = function () {

        console.log("verificando os componentes da equipe...");
        $scope.equipe.componentes.forEach(function(componente){
           
            $scope.funcionarios.some(function(funcionario){

                if (funcionario._id === componente._id)
                    funcionario.selected = true;

                return funcionario._id === componente._id;
            });
        });
    }
        
    checkAssociation();

}]);
