angular.module('rhPontumApp').controller('novoTurnoCtrl', ['$scope', '$window', 'turnosAPI', 'escalas', 
    function($scope, $window, turnosAPI, escalas){
    
    console.log('entrando em novo turno CTRL');
    $scope.escalas = escalas.data;
    $scope.newOrEdit = 'Novo';
    $scope.turno = {isFlexivel: false, intervaloFlexivel: false, ignorarFeriados: false};
    $scope.preencherEscala = false;

    $scope.save = function(turno) {

        verifySelectedOptions(turno);
            
        turnosAPI.create(turno).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;

            if(response.data.success) {
                $scope.preencherEscala = true;
            }

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de turno: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };

    $scope.checkUncheckEscala = function(escala) {
        
       //Não pode simplesmente deselecionar uma escala, ele tem q manter 1 ativa sempre
       if (!escala.selecionada) {
            escala.selecionada = !escala.selecionada;
            //uncheckOthers();
            $scope.escalas.forEach(function(otherEscala){
                if(otherEscala._id !== escala._id)
                    otherEscala.selecionada = false;
            });
        }
    };

    verifySelectedOptions = function (turno) {

        if (!turno.isFlexivel)
            turno.isFlexivel = false;

        if (!turno.intervaloFlexivel)
            turno.intervaloFlexivel = false;

        if (!turno.ignorarFeriados)
            turno.ignorarFeriados = false;

        $scope.escalas.forEach(function(escala){
            if(escala.selecionada){
                turno.escala = escala._id;
                return;
            }
        });
    };

    setEscalaSelecionada = function() {

        if($scope.escalas.length > 0)
            $scope.escalas[0].selecionada = true;

    };

    setEscalaSelecionada();
}]);