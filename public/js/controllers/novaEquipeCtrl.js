angular.module('rhPontumApp').controller('novaEquipeCtrl', ['$scope', '$window', 'equipesAPI', 'setores', 'gestores',  
    function($scope, $window, equipesAPI, setores, gestores){
    
    console.log('entrando em nova Equipe CTRL');
    $scope.newOrEdit = 'Nova';
    $scope.setores = setores.data;
    $scope.gestores = gestores.data;

    $scope.save = function(equipe) {

        equipesAPI.create(equipe).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            delete $scope.equipe;
            $scope.equipeForm.$setPristine();
            $scope.successMsg = response.data.message;
            //equipe cadastrado/salvo com sucesso e retornar para página anterior.
            //$location.path('/equipes');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de Equipe: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };
}]);   