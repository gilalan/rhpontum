
angular.module('rhPontumApp').controller('novoFuncionarioCtrl', ['$scope', '$window', 'funcionariosAPI', 'equipesAPI', 'setores', 'instituicoes', 'instituicaoAPI', 'campiAPI', 'setoresAPI',
    function($scope, $window, funcionariosAPI, equipesAPI, setores, instituicoes, instituicaoAPI, campiAPI, setoresAPI){
    
    $scope.instituicoes = instituicoes.data;
    //$scope.setores = setores.data;
    $scope.campusMap = new Map();
    $scope.setoresMap = new Map();
    $scope.equipesMap = new Map();
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

    $scope.getCampi = function(instituicaoId) {
        console.log('entrou no get campi: ', instituicaoId);
        if (instituicaoId) {
            if (!$scope.campusMap.get(instituicaoId)) {
                instituicaoAPI.getCampiByInstituicao(instituicaoId).then(function sucessCallback(response){

                    $scope.campusMap.set(instituicaoId, response.data);
                    console.log('getCampi!!: ', response.data);

                }, function errorCallback(response){

                    $scope.errorMsg = response.data.message;
                });
            }
        }
    };

    $scope.getSetores = function(campusId) {
        console.log('entrou no getSetores: ', campusId);
        if (campusId) {
            if (!$scope.setoresMap.get(campusId)) {
                campiAPI.getSetoresByCampus(campusId).then(function sucessCallback(response){

                    $scope.setoresMap.set(campusId, response.data);
                    console.log('getSetores!!: ', response.data);

                }, function errorCallback(response){

                    $scope.errorMsg = response.data.message;
                });
            }
        }
    };

    $scope.getEquipes = function(setorId) {
        console.log('entrou no getEquipes: ', setorId);
        if (setorId) {
            if (!$scope.equipesMap.get(setorId)) {
                setoresAPI.getEquipesBySetor(setorId).then(function sucessCallback(response){

                    $scope.equipesMap.set(setorId, response.data);
                    console.log('getEquipes!!: ', response.data);

                }, function errorCallback(response){

                    $scope.errorMsg = response.data.message;
                });
            }
        }
    };

    $scope.checkAddEquipe = function(equipe) {
        
        equipe.selecionado = !equipe.selecionado;
    };

    filterSelected = function (equipe) {
        return equipe.selecionado;
    }

    fillEquipes = function(){

        var idEquipesSelecionadas = [];

        console.log('dentro de fillEquipes, equipesMap: ', $scope.equipesMap);            
        //$scope.equipesMap.forEach(function(equipe){
        for (var arrayEquipes of $scope.equipesMap.values()) {
            console.log("ArrayEquipes?", arrayEquipes);
            arrayEquipes.forEach(function(equipe){
                console.log('equipe?', equipe);
                console.log('equipe: ', equipe.nome);
                console.log('selected: ', equipe.selecionado);
                if (equipe.selecionado){
                    console.log("vai dar push");
                    idEquipesSelecionadas.push(equipe._id);
                }
            });
        }

        return idEquipesSelecionadas;
    };

    init = function () {

        console.log("entrou no init");
        if ($scope.instituicoes.length > 0)
            $scope.getCampi($scope.instituicoes[0]._id);
    };

    init();

}]);