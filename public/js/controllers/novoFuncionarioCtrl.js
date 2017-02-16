
angular.module('rhPontumApp').controller('novoFuncionarioCtrl', ['$scope', '$window', '$location', 'funcionariosAPI', 'equipesAPI', 'instituicoes', 'cargos', 'turnos', 'instituicaoAPI', 'campiAPI', 'setoresAPI',
    function($scope, $window, $location, funcionariosAPI, equipesAPI, instituicoes, cargos, turnos, instituicaoAPI, campiAPI, setoresAPI){
    
    $scope.instituicoes = instituicoes.data;
    $scope.cargos = cargos.data;
    $scope.turnos = turnos.data;
    $scope.newOrEdit = 'Novo';

    $scope.save = function(funcionario) {

        console.log('funcionario a ser enviado:', funcionario);
            
        funcionariosAPI.create(funcionario).then(
            
            function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            delete $scope.funcionario;           
            $scope.funcionarioForm.$setPristine();
            $scope.successMsg = response.data.message;
            //funcionario cadastrado/salvo com sucesso e retornar para página anterior.
            //$location.path('/funcionarios');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de funcionario: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };

    init = function () {

        console.log("entrou no init");
        //if ($scope.instituicoes.length > 0)
          //  $scope.getCampi($scope.instituicoes[0]._id);
    };

    init();

}]);