
angular.module('rhPontumApp').controller('novoFuncionarioCtrl', ['$scope', '$window', 'funcionariosAPI', 'equipesAPI', 'setores', 'instituicoes', 
    function($scope, $window, funcionariosAPI, equipesAPI, setores, instituicoes){
    
    $scope.instituicoes = instituicoes.data;
    $scope.setores = setores.data;
    $scope.newOrEdit = 'Novo';

    $scope.save = function(funcionario) {

        funcionario.equipes = fillEquipes();
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

    $scope.checkAddEquipe = function(equipe) {
        
        equipe.selecionado = !equipe.selecionado;
    };

    filterSelected = function (equipe) {
        return equipe.selecionado;
    }

    fillEquipes = function(){

        var idEquipesSelecionadas = [];

        $scope.setores.forEach(function (setor){
            console.log("setor", setor.nome);
            
            setor.equipes.forEach(function(equipe){
                console.log('equipe: ', equipe.nome);
                console.log('selected: ', equipe.selecionado);
                if (equipe.selecionado){
                    console.log("vai dar push");
                    idEquipesSelecionadas.push(equipe._id);
                }
            });
            //equipesSetor = setor.equipes.filter(filterSelected);
            //idEquipesSelecionadas = idEquipesSelecionadas.concat(idEquipesSetor);
        });

        return idEquipesSelecionadas;
    };

}]);