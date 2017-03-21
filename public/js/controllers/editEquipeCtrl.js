angular.module('rhPontumApp').controller('editEquipeCtrl', ['$scope', '$window', '$location', 'equipe', 'equipesAPI', 'setores', 'gestores', 
    function($scope, $window, $location, equipe, equipesAPI, setores, gestores){
    
    console.log('entrando em edit equipe ctrl');

    $scope.equipe = equipe.data;
    $scope.setores = setores.data;
    $scope.gestores = gestores.data;
    $scope.newOrEdit = 'Editar';
    $window.scrollTo(0, 0);    

    $scope.save = function(equipe) {
        
        console.log('equipe a ser enviada:', equipe);

        equipesAPI.update(equipe).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;
            //equipe cadastrada/salva com sucesso e retornar para página anterior.
            $location.path('/equipes');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de equipe: " + response.data.message);
            $window.scrollTo(0, 0);
        });

    };
}]);