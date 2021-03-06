
angular.module('rhPontumApp').controller('editFuncionarioCtrl', ['$scope', '$filter', '$window', '$location', 'funcionariosAPI', 'funcionario', 'instituicoes', 'cargos', 'turnos', 'instituicaoAPI', 'campiAPI', 'setoresAPI',
    function($scope, $filter, $window, $location, funcionariosAPI, funcionario, instituicoes, cargos, turnos, instituicaoAPI, campiAPI, setoresAPI){
        
    $scope.funcionario = funcionario.data;
    $scope.funcionario.dataNascimento = $filter('date')($scope.funcionario.dataNascimento, "dd/MM/yyyy");
    $scope.funcionario.alocacao.dataAdmissao = $filter('date')($scope.funcionario.alocacao.dataAdmissao, "dd/MM/yyyy");
    $scope.instituicoes = instituicoes.data;
    $scope.cargos = cargos.data;
    $scope.turnos = turnos.data;
    $scope.newOrEdit = 'Editar';
    $scope.isInitDateRequired = false;
    $window.scrollTo(0, 0);    

    $scope.save = function(funcionario) {
    
        funcionario.dataNascimento = fixDateFormat(funcionario.dataNascimento);        
        funcionario.alocacao.dataAdmissao   = fixDateFormat(funcionario.alocacao.dataAdmissao);
        
        if (!funcionario.sexoMasculino)
            funcionario.sexoMasculino = false;

        console.log('funcionario a ser enviado:', funcionario);

        funcionariosAPI.update(funcionario).then(
            
            function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;
            $location.path('/funcionarios');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de funcionario: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };

    $scope.checkEscala = function (turno) {
        //se for da escala 12x36
        $scope.isInitDateRequired = (turno.escala.codigo == 2) ? true : false;        
    }

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

    $scope.checkEscala($scope.funcionario.alocacao.turno)

}]);