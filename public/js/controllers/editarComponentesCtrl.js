angular.module('rhPontumApp').controller('editarComponentesCtrl', ['$scope', 'equipe', 'funcionarios', 'equipesAPI',
    function($scope, equipe, funcionarios, equipesAPI){
    
    $scope.equipe = equipe.data;
    $scope.funcionarios = funcionarios.data;
    $scope.isAssociated = false;

    /* PAGINAÇÃO , EM BREVE!
    $scope.filteredWorkers = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 5;
    $scope.maxSize = 5;
    */

    $scope.associar = function (usuario) {

        // usuario.funcionario = $scope.funcionario._id;

        // equipesAPI.register(usuario).then(function sucessCallback(response){

        //     $scope.successMsg = response.data.message;
        //     delete $scope.usuario;         
        //     $scope.userForm.$setPristine();

        // }, function errorCallback(response){
            
        //     $scope.errorMsg = response.data.message;
        //     console.log("Erro de registro: " + response.data.message);
            
        // });     
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

        // equipesAPI.getUsuarioByFuncionario($scope.funcionario._id).then(function sucessCallback(response){
            
        //     $scope.usuario = response.data;

        //     if ($scope.usuario){
        //         if($scope.usuario.funcionario._id === $scope.funcionario._id){
        //             $scope.isAssociated = true;
        //         }
        //     }

        // }, function errorCallback(response){
            
        //     console.log("Erro de registro: " + response.data.message);
        // });
    }
        
    checkAssociation();

}]);
