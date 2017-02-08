angular.module('rhPontumApp').controller('novoTurnoCtrl', ['$scope', '$window', 'turnosAPI', 'escalas', 
    function($scope, $window, turnosAPI, escalas){
    
    console.log('entrando em novo turno CTRL');
    $scope.escalas = escalas.data;
    $scope.newOrEdit = 'Novo';
    $scope.turno = {isFlexivel: false, intervaloFlexivel: false, ignoraFeriados: false};
    $scope.preencherEscala = {flag: false};
    $scope.rowHorarioDias = null;
    $scope.minutosIntervaloPrincipal = null;
    $scope.anoBase = "";
    var turnoSalvo = null;

    $scope.save = function(turno) {

        verifySelectedOptions(turno);
            
        turnosAPI.create(turno).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            
            $scope.successMsg = response.data.message;

            if(response.data.success) {
                $scope.preencherEscala.flag = true;
                turnoSalvo = response.data.turno;
                initAutomaticFill(turnoSalvo);
            }

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de turno: " + response.data.message);
        });

        $window.scrollTo(0, 0);
    };

    $scope.saveAll = function (turno) {
        
        //Fazer para o turno que foi salvo e retornado , tá feioso! need refatoramento
        verifySelectedOptions(turnoSalvo);
        
        if ($scope.preencherEscala.tipoSemanal){
            turnoSalvo.jornada = buildJornadaSemanalObject();
        }

        if ($scope.preencherEscala.tipoRevezamento){
            console.log("chamou o buildJornadaRevezamentoObject");
            turnoSalvo.jornada = buildJornadaRevezamentoObject();
            console.log("retornou do buildJornadaRevezamentoObject");
        }

        //Poderão ter mais escalas no futuro

        console.log("ajustou e vai enviar o turno: ", turnoSalvo);
        update(turnoSalvo);
        $window.scrollTo(0, 0);

    };

    $scope.goPreencher = function(preencher) {
        
        $scope.rowHorarioDias.forEach(function(rowHorarioDia){
            
            if (rowHorarioDia.nDia != 0 && rowHorarioDia.nDia != 6) {
                rowHorarioDia.ent1 = preencher.ent1;
                rowHorarioDia.sai1 = preencher.sai1;
                rowHorarioDia.ent2 = preencher.ent2;
                rowHorarioDia.sai2 = preencher.sai2;
                rowHorarioDia.viradaTurno = preencher.viradaTurno;
            }
        });
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

    $scope.checkUncheckMes = function(mesObj) {
        
       //Não pode simplesmente deselecionar um mes, ele tem q manter 1 ativa sempre
       if (!mesObj.selecionado) {
            mesObj.selecionado = !mesObj.selecionado;
            //uncheckOthers();
            $scope.meses.forEach(function(otherMesObj){
                if(otherMesObj.mes != mesObj.mes)
                    otherMesObj.selecionado = false;
            });
        }
    };

    $scope.changeDia = function () {

        $scope.diaBase1Toggle = !$scope.diaBase1Toggle;
        
        if ($scope.diaBase1Toggle)
            $scope.diaBase = {dia: 1, str: "Dia 1"};
        else 
            $scope.diaBase = {dia: 2, str: "Dia 2"};
            
        $scope.diaBaseText = $scope.diaBase.str;
    }

    update = function (turno) { 

        turnosAPI.update(turno).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            $scope.successMsg = response.data.message;

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de turno: " + response.data.message);
        });
    };

    getAllDaysInWeek = function() {

       var rowHorarioDias = [
           {nDia: 0, dia: 'Domingo', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 1, dia: 'Segunda-Feira', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 2, dia: 'Terça-Feira', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 3, dia: 'Quarta-Feira', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 4, dia: 'Quinta-Feira', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 5, dia: 'Sexta-Feira', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""},
           {nDia: 6, dia: 'Sábado', ent1: "", sai1: "", ent2: "", sai2: "", intervalo: "Sem Intervalo", viradaTurno: ""}
        ];
        
        return rowHorarioDias;
    };

    getInfoEscalaRev = function() {

        console.log("ENTROU NO METODO GET INFO REV");
        $scope.diaBase = {dia: 1, str: 'Dia 1'};
        $scope.diaBaseText = $scope.diaBase.str;
        $scope.diaBase1Toggle = true;

        //DIA BASE CALCULAR
        var dateAtual = new Date();
        //$scope.anoBase = "" + dateAtual.getFullYear();
        $scope.meses = [
            {mes: 0, str: 'Jan', selecionado: ((dateAtual.getMonth() == 0) ? true : false)},
            {mes: 1, str: 'Fev', selecionado: ((dateAtual.getMonth() == 1) ? true : false)},
            {mes: 2, str: 'Mar', selecionado: ((dateAtual.getMonth() == 2) ? true : false)},
            {mes: 3, str: 'Abr', selecionado: ((dateAtual.getMonth() == 3) ? true : false)},
            {mes: 4, str: 'Mai', selecionado: ((dateAtual.getMonth() == 4) ? true : false)},
            {mes: 5, str: 'Jun', selecionado: ((dateAtual.getMonth() == 5) ? true : false)},
            {mes: 6, str: 'Jul', selecionado: ((dateAtual.getMonth() == 6) ? true : false)},
            {mes: 7, str: 'Ago', selecionado: ((dateAtual.getMonth() == 7) ? true : false)},
            {mes: 8, str: 'Set', selecionado: ((dateAtual.getMonth() == 8) ? true : false)},
            {mes: 9, str: 'Out', selecionado: ((dateAtual.getMonth() == 9) ? true : false)},
            {mes: 10, str: 'Nov', selecionado: ((dateAtual.getMonth() == 10) ? true : false)},
            {mes: 11, str: 'Dez', selecionado: ((dateAtual.getMonth() == 11) ? true : false)}
        ];

        var rowHorarioDias = [
           {diaBase: $scope.diaBase,
            ent1: "", sai1: "", ent2: "", sai2: "", 
            intervalo: "Sem Intervalo", 
            mesBase: dateAtual.getMonth(),
            anoBase: dateAtual.getFullYear(),
            viradaTurno: "0000"
            }
        ];

        console.log("rowHorarioDias", rowHorarioDias);
        return rowHorarioDias;
    };

    buildJornadaSemanalObject = function() {

        var arrayHorarios = [];

        $scope.rowHorarioDias.forEach(function(rowHorarioDia){

            arrayHorarios.push(
            {
                dia: rowHorarioDia.nDia,
                diaAbrev: rowHorarioDia.dia.substring(0, 3),
                horarios: getHorarios(rowHorarioDia),
                viradaTurno: getTotalMinutosHorario(rowHorarioDia.viradaTurno)
            });
        });

        return jornada = {
            array: arrayHorarios,
            minutosIntervalo: $scope.minutosIntervaloPrincipal
        };
    };

    buildJornadaRevezamentoObject = function () {

        var arrayBase = [];

        //Essa escala só vai ter 1 linha no rowHorarioDias!!!
        //$scope.rowHorarioDias.forEach(function(rowHorarioDia){
        //});
        var rowHorarioDia = $scope.rowHorarioDias[0];
        var varAnoBase = rowHorarioDia.anoBase;
        console.log("ANO BASE? ", varAnoBase);
        var mesBaseSelected = $scope.meses.filter(function(mes){return mes.selecionado});

        console.log("mesBaseSelected: ", mesBaseSelected);
        //console.log("$scope ano base", $scope.obj.anoBase);
        arrayBase.push(
        {
            horarios: getHorarios(rowHorarioDia),
            diaBase: $scope.diaBase.dia,
            mesBase: mesBaseSelected[0].mes,//mesBaseSelected,//mesBaseSelected[0].mes,
            anoBase: varAnoBase,
            viradaTurno: getTotalMinutosHorario(rowHorarioDia.viradaTurno)
        });
        console.log("VAI RETORNAR A JORNADA!", arrayBase);
        return jornada = {
            array: arrayBase,
            minutosIntervalo: $scope.minutosIntervaloPrincipal
        };
    };

    getHorarios = function (rowHorarioDia) {

        console.log("ENTRANDO NO GET HORARIOS?!");
        if (rowHorarioDia.ent1 && rowHorarioDia.sai1 && 
            rowHorarioDia.ent2 && rowHorarioDia.sai2) {

            //Atualizar o total de miunutos do intervalo, não achei outro local melhor para esse cálculo
            if (!$scope.minutosIntervaloPrincipal) {
                $scope.minutosIntervaloPrincipal = getTotalMinutosHorario(rowHorarioDia.ent2);
                $scope.minutosIntervaloPrincipal -= getTotalMinutosHorario(rowHorarioDia.sai1);
                console.log("$scope.minutosIntervaloPrincipal ", $scope.minutosIntervaloPrincipal);
            }

            return {
                ent1: getTotalMinutosHorario(rowHorarioDia.ent1),
                sai1: getTotalMinutosHorario(rowHorarioDia.sai1),
                ent2: getTotalMinutosHorario(rowHorarioDia.ent2),
                sai2: getTotalMinutosHorario(rowHorarioDia.sai2)
            };
        } 

        if (rowHorarioDia.ent1 && rowHorarioDia.sai1 && 
            !rowHorarioDia.ent2 && !rowHorarioDia.sai2) {

            return {
                ent1: getTotalMinutosHorario(rowHorarioDia.ent1),
                sai1: getTotalMinutosHorario(rowHorarioDia.sai1)                
            };

        }

        return {};
        
    };

    getTotalMinutosHorario = function(strHorario) {

        if (strHorario.length < 4)
            return "";
        
        var hoursStr = strHorario.substring(0, 2);
        var minutesStr = strHorario.substring(2);
        var hours = parseInt(hoursStr) * 60;
        var minutes = parseInt(minutesStr);
        return (hours + minutes); 
    };

    verifySelectedOptions = function (turno) {

        if (!turno.isFlexivel)
            turno.isFlexivel = false;

        if (!turno.intervaloFlexivel)
            turno.intervaloFlexivel = false;

        if (!turno.ignoraFeriados)
            turno.ignoraFeriados = false;

        if (!turno.jornada) {
            turno.jornada = {
                "minutosIntervalo": 0
            };
        }

        $scope.escalas.forEach(function(escala){
            if(escala.selecionada){
                turno.escala = escala._id;
                return;
            }
        });
    };

     initAutomaticFill = function (turno) {

        //Semanal
        if (turno.escala.codigo == 1) {
            $scope.preencherEscala.tipoSemanal = true;
            $scope.rowHorarioDias = getAllDaysInWeek();
            //Testes - inicializa o preenchimento automático
            $scope.preencher = {
                ent1: "0800",
                sai1: "1200",
                ent2: "1400",
                sai2: "1800",
                viradaTurno: "0000"
            };
        }

        else if (turno.escala.codigo == 2) {

            $scope.preencherEscala.tipoRevezamento = true;
            $scope.rowHorarioDias = getInfoEscalaRev();
        }
    };

    setEscalaSelecionada = function() {

        if($scope.escalas.length > 0)
            $scope.escalas[0].selecionada = true;

    };

    setEscalaSelecionada();
}]);