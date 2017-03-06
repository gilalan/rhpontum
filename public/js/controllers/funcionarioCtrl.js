angular.module('rhPontumApp').controller('funcionarioCtrl', ['$scope', '$location', 'funcionariosAPI',
    function($scope, $location, funcionariosAPI){
   
    $scope.currentPage = 1;
    $scope.pageSize = 5;

    $scope.pageChangeHandler = function(num) {
      console.log('funcionários page changed to ' + num);
    };

    // delete a user after checking it
    $scope.delete = function(id) {
        
        funcionariosAPI.delete(id).then(function sucessCallback(response){
                
            console.log("deletou?", response.data);
            $scope.successMsg = response.data.message;
            $scope.load();

        }, function errorCallback(response){
        
            console.log("erro ao deletar", response.data.message);
            $scope.errorMsg = response.data.message;
        });
    }; 

    $scope.update = function (id) {

        funcionariosAPI.update(id).then(function sucessCallback(response){

            console.log("atualizou?", response.data);
            $scope.successMsg = response.data.message;
            $scope.load();

        }, function errorCallback(response){

            console.log("erro ao atualizar", response.data.message);
            $scope.errorMsg = response.data.message;
        });
    }

    $scope.load = function() {

        funcionariosAPI.get().then(function sucessCallback(response){

            $scope.funcionarios = response.data;
            console.log("funcionarios: ", response.data);

        }, function errorCallback(response){

            $scope.errorMsg = response.data.message;
            console.log("Erro no loading de funcionarios: " + response.data.message);

        });
    }

    $scope.edit = function(funcionarioId) {

        $location.path("/editFuncionario/"+funcionarioId);
    }

    $scope.new = function() {

        $location.path('/novoFuncionario');
    }

    $scope.associateToUser = function(funcionarioId) {
        
        $location.path('/associarFuncionario/' + funcionarioId);
    }

    $scope.load();   
}]);