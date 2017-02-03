
angular.module('rhPontumApp').controller('editFuncionarioCtrl', ['$scope', '$filter', '$window', 'funcionariosAPI', 'funcionario', 'setores', 'instituicoes', 
    function($scope, $filter, $window, funcionariosAPI, funcionario, setores, instituicoes){
        
    $scope.funcionario = funcionario.data;
    $scope.funcionario.dataNascimento = $filter('date')($scope.funcionario.dataNascimento, "dd/MM/yyyy");
    $scope.instituicoes = instituicoes.data;
    $scope.setores = setores.data;
    $scope.newOrEdit = 'Editar';
    $window.scrollTo(0, 0);    

    $scope.save = function(funcionario) {
        
        funcionario.equipes = fillEquipes();
        console.log('funcionario a ser enviado:', funcionario);

        funcionariosAPI.update(funcionario).then(
            
            function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            //delete $scope.funcionario;           
            //$scope.funcionarioForm.$setPristine();
            $scope.successMsg = response.data.message;
            //funcionario cadastrado/salvo com sucesso e retornar para página anterior.
            //$location.path('/funcionarios');

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de funcionario: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };

    $scope.checkAddEquipe = function(equipe) {
        
        equipe.selecionado = !equipe.selecionado;
    };

    fillEquipes = function(){

        var idEquipesSelecionadas = [];

        $scope.setores.forEach(function (setor){
            
            setor.equipes.forEach(function(equipe){
                if (equipe.selecionado){
                    idEquipesSelecionadas.push(equipe._id);
                }
            });
        });

        return idEquipesSelecionadas;
    };

    checkEquipes = function() {

        console.log("equipes do funcionario: ", $scope.funcionario.equipes);
        console.log("instituicao do funcionario: ", $scope.funcionario.instituicao);

        $scope.setores.forEach(function (setor){
            
            setor.equipes.forEach(function(equipe){
                
                $scope.funcionario.equipes.forEach(function(equipeFunc){

                    if (equipeFunc._id === equipe._id){
                        equipe.selecionado = true;
                    }
                });
            });
        });
    };

    checkEquipes();
}]);