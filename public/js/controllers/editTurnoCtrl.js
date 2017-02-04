angular.module('rhPontumApp').controller('editTurnoCtrl', ['$scope', '$window', 'turno', 'turnosAPI', 'escalas',  
    function($scope, $window, turno, turnosAPI, escalas){
    
    console.log('entrando em edit turno ctrl');
    console.log('recebendo turno: ', turno.data);
    $scope.turno = turno.data;
    console.log('escalas.data', escalas.data);
    $scope.escalas = escalas.data;
    $scope.newOrEdit = 'Editar';
    $scope.preencherEscala = true;
    $window.scrollTo(0, 0);

    $scope.save = function(turno) {
        
        verifySelectedOptions(turno);

        turnosAPI.update(turno).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de turno: " + response.data.message);
        });

        $window.scrollTo(0, 0);
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

    checkEscalaSelecionada = function() {

        if($scope.turno.escala) {
            $scope.escalas.forEach(function(escala){
                if(escala._id === $scope.turno.escala._id)
                    escala.selecionada = true;
            });
        } else {

            if($scope.escalas.length > 0)
                $scope.escalas[0].selecionada = true;
        }
    };

    getAllDaysInWeek = function() {

        var diasSemana = [
           'Domingo',
           'Segunda-Feira',
           'Terça-Feira',
           'Quarta-Feira',
           'Quinta-Feira',
           'Sexta-Feira',
           'Sábado'
        ];
        
        return diasSemana;
    };

    
    init = function () {

        checkEscalaSelecionada();
        $scope.diasSemana = getAllDaysInWeek();
    }

    init();

}]);