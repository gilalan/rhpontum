angular.module('rhPontumApp').controller('associarFuncionarioCtrl', ['$scope', '$rootScope', 'funcionario', 'funcionariosAPI', 'usuarioAPI',  
    function($scope, $rootScope, funcionario, funcionariosAPI, usuarioAPI){
    
    $scope.currentUser = $rootScope.currentUser;
    $scope.funcionario = funcionario.data;
    $scope.usuario = {};
    $scope.isAssociated = false;

    $scope.associar = function (usuario) {

        usuario.funcionario = $scope.funcionario._id;

        usuarioAPI.register(usuario).then(function sucessCallback(response){

            $scope.successMsg = response.data.message;
            delete $scope.usuario;         
            $scope.userForm.$setPristine();

        }, function errorCallback(response){
            
            $scope.errorMsg = response.data.message;
            console.log("Erro de registro: " + response.data.message);
            
        });     
    }

    checkAssociation = function () {

        funcionariosAPI.getUsuarioByFuncionario($scope.funcionario._id).then(function sucessCallback(response){
            
            $scope.usuario = response.data;

            if ($scope.usuario){
                if($scope.usuario.funcionario._id === $scope.funcionario._id){
                    $scope.isAssociated = true;
                }
            }

        }, function errorCallback(response){
            
            console.log("Erro de registro: " + response.data.message);
        });
    }
        
    checkAssociation();

}]);
