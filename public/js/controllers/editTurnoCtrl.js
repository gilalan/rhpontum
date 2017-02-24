angular.module('rhPontumApp').controller('editTurnoCtrl', ['$scope', '$window', 'turno', 'turnosAPI', 'escalas',  
    function($scope, $window, turno, turnosAPI, escalas){
    
    console.log('entrando em edit turno ctrl');
    console.log('recebendo turno: ', turno.data);
    $scope.turno = turno.data;
    console.log('escalas.data', escalas.data);
    $scope.escalas = escalas.data;
    $scope.newOrEdit = 'Editar';
    $scope.preencherEscala = {flag: true};
    $scope.rowHorarioDias = [];
    $scope.minutosIntervaloPrincipal = null;
    $window.scrollTo(0, 0);

    $scope.save = function(turno) {
        
        verifySelectedOptions(turno);

        update(turno);

        $window.scrollTo(0, 0);
    };
    
    $scope.saveAll = function (turno) {
        
        console.log('antes de salvar, turno?', turno);
        verifySelectedOptions(turno);

        if ($scope.preencherEscala.tipoSemanal)
            turno.jornada = buildJornadaSemanalObject();

        if ($scope.preencherEscala.tipoRevezamento)
            turno.jornada = buildJornadaRev12x36Object();

        console.log("ajustou e vai enviar o turno: ", turno);
        update(turno);
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

    update = function (turno) { 

        turnosAPI.update(turno).then(function sucessCallback(response){
            
            console.log("dados recebidos: ", response.data);
            $scope.successMsg = response.data.message;

        }, function errorCallback(response){
        
            $scope.errorMsg = response.data.message;
            console.log("Erro de cadastro de turno: " + response.data.message);
        });
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

    $scope.changeDia = function () {

        $scope.diaBase1Toggle = !$scope.diaBase1Toggle;
        
        if ($scope.diaBase1Toggle)
            $scope.diaBase = {dia: 1, str: "Dia 1"};
        else 
            $scope.diaBase = {dia: 2, str: "Dia 2"};
            
        $scope.diaBaseText = $scope.diaBase.str;
    }

    changeTotalMinutesToString = function (totalMinutes, separator) {

        if (totalMinutes == 0)
            if (separator)
                return "00"+separator+"00";
            else
                return "0000";

        if (!totalMinutes)
            return "";
        
        var hours = Math.floor(totalMinutes/60);
        var minutes = totalMinutes % 60;
        var hoursStr = "";
        var minutesStr = "";

        hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
        minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;

        return (separator) ? hoursStr+separator+minutesStr : hoursStr+minutesStr;
    };

    changeIntervalToString = function (saida1, entd2) {

        if ( (!saida1 && !entd2) || (!saida1 && entd2) 
            || (saida1 && !entd2) )
            return "";

        if ( (entd2 - saida1) == 0)
            return "0000";

        if ( (entd2 - saida1) < 60 )
            return ""+(entd2-saida1)+"min";
        
        var strIntervalo = "Das " + changeTotalMinutesToString(saida1, ":") 
            + " às " + changeTotalMinutesToString(entd2, ":");

        var minutesDiff = entd2 - saida1;
        var hours = Math.floor(minutesDiff/60);
        var minutes = minutesDiff % 60;
        var hoursStr = " ( ";
        var minutesStr = "";

        if (hours >= 1 && hours <= 23) 
            hoursStr += hours+"h";

        if (minutes >= 1 && minutes <= 59)
            minutesStr = " e " + minutes + "min )";
        else 
            minutesStr = " )";

        return strIntervalo + hoursStr + minutesStr;
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

        if($scope.turno.jornada.array) {
            console.log("tentar preencher o horário da jornada");
            $scope.turno.jornada.array.forEach(function(jornadaRow){
                rowHorarioDias.forEach(function(rowHorarioDia){
                    if(jornadaRow.dia == rowHorarioDia.nDia) {
                        if (jornadaRow.horarios) {
                            rowHorarioDia.ent1 = changeTotalMinutesToString(jornadaRow.horarios.ent1);
                            rowHorarioDia.sai1 = changeTotalMinutesToString(jornadaRow.horarios.sai1);
                            rowHorarioDia.ent2 = changeTotalMinutesToString(jornadaRow.horarios.ent2);
                            rowHorarioDia.sai2 = changeTotalMinutesToString(jornadaRow.horarios.sai2);
                            rowHorarioDia.intervalo = changeIntervalToString(jornadaRow.horarios.sai1, jornadaRow.horarios.ent2);
                            rowHorarioDia.viradaTurno = changeTotalMinutesToString(jornadaRow.viradaTurno);
                        }
                    }
                });
            });
        }
        
        return rowHorarioDias;
    };

    getInfoRev12x36 = function() {

        $scope.diaBase = {dia: 1, str: 'Dia 1'};
        $scope.diaBaseText = $scope.diaBase.str;
        $scope.diaBase1Toggle = true;

        //DIA BASE CALCULAR
        var dateAtual = new Date();
        //$scope.anoBase = "" + dateAtual.getFullYear();
        $scope.meses = [
            {mes: 0, str: 'Jan', selecionado: false},
            {mes: 1, str: 'Fev', selecionado: false},
            {mes: 2, str: 'Mar', selecionado: false},
            {mes: 3, str: 'Abr', selecionado: false},
            {mes: 4, str: 'Mai', selecionado: false},
            {mes: 5, str: 'Jun', selecionado: false},
            {mes: 6, str: 'Jul', selecionado: false},
            {mes: 7, str: 'Ago', selecionado: false},
            {mes: 8, str: 'Set', selecionado: false},
            {mes: 9, str: 'Out', selecionado: false},
            {mes: 10, str: 'Nov', selecionado: false},
            {mes: 11, str: 'Dez', selecionado: false}
        ];

        var rowHorarioDia = 
        {
            diaBase: $scope.diaBase,
            ent1: "", sai1: "", ent2: "", sai2: "", 
            intervalo: "Sem Intervalo", 
            mesBase: dateAtual.getMonth(),
            anoBase: ""+dateAtual.getFullYear(),
            viradaTurno: "0000"
        };

        if($scope.turno.jornada) {

            if($scope.turno.jornada.array) {

                $scope.turno.jornada.array.forEach(function(obj){
                    
                    if (obj.horarios) {
                        rowHorarioDia.ent1 = changeTotalMinutesToString(obj.horarios.ent1);
                        rowHorarioDia.sai1 = changeTotalMinutesToString(obj.horarios.sai1);
                        rowHorarioDia.ent2 = changeTotalMinutesToString(obj.horarios.ent2);
                        rowHorarioDia.sai2 = changeTotalMinutesToString(obj.horarios.sai2);
                        rowHorarioDia.intervalo = changeIntervalToString(obj.horarios.sai1, obj.horarios.ent2);
                    }
                    rowHorarioDia.viradaTurno = changeTotalMinutesToString(obj.viradaTurno);
                    rowHorarioDia.anoBase = obj.anoBase;
                    
                    $scope.meses.forEach(function(objetoMes){
                        if (objetoMes.mes == obj.mesBase){
                            objetoMes.selecionado = true;
                            return;
                        }
                    });
                    $scope.diaBase = {dia: obj.diaBase, str: "Dia "+obj.diaBase};
                    $scope.diaBaseText = $scope.diaBase.str;
                    $scope.diaBase1Toggle = (obj.diaBase == 1) ? true : false;
                    //$scope.anoBase = ""+obj.anoBase;
                });
            }
        }

        rowHorarioDia.diaBase = $scope.diaBase;

        return [rowHorarioDia];
    };

    buildJornadaSemanalObject = function() {

        var arrayHorarios = [];
        var horariosEmMinutos;

        $scope.rowHorarioDias.forEach(function(rowHorarioDia){

            horariosEmMinutos = getHorarios(rowHorarioDia);
            console.log("total min trabalho: ", getTotalMinutosTrabalho(horariosEmMinutos));
            arrayHorarios.push(
            {
                dia: rowHorarioDia.nDia,
                diaAbrev: rowHorarioDia.dia.substring(0, 3),
                horarios: horariosEmMinutos,
                minutosTrabalho: getTotalMinutosTrabalho(horariosEmMinutos),
                viradaTurno: getTotalMinutosHorario(rowHorarioDia.viradaTurno)
            });
        });

        return jornada = {
            array: arrayHorarios,
            minutosIntervalo: $scope.minutosIntervaloPrincipal
        };
    };

    buildJornadaRev12x36Object = function () {

        var arrayBase = [];

        //Essa escala só vai ter 1 linha no rowHorarioDias!!!
        //$scope.rowHorarioDias.forEach(function(rowHorarioDia){
        //});
        var rowHorarioDia = $scope.rowHorarioDias[0];
        //var mesBaseSelected = $scope.meses.filter(function(mes){return mes.selecionado});
        //console.log("mesBaseSelected: ", mesBaseSelected);
        var horariosEmMinutos = getHorarios(rowHorarioDia);

        arrayBase.push(
        {
            horarios: horariosEmMinutos,
            //diaBase: $scope.diaBase.dia,
            //mesBase: mesBaseSelected[0].mes,
            //anoBase: $scope.anoBase,
            viradaTurno: getTotalMinutosHorario(rowHorarioDia.viradaTurno)
        });
        console.log("total min trabalho: ", getTotalMinutosTrabalho(horariosEmMinutos));
        return jornada = {
            array: arrayBase,
            minutosIntervalo: $scope.minutosIntervaloPrincipal,
            minutosTrabalho: getTotalMinutosTrabalho(horariosEmMinutos)
        };
    };

    getHorarios = function (rowHorarioDia) {

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
        console.log("hora pega: " + hoursStr + ":" + minutesStr);
        var hours = parseInt(hoursStr) * 60;
        var minutes = parseInt(minutesStr);
        console.log("total em minutos: ", (hours + minutes));
        return (hours + minutes); 
    };

    getTotalMinutosTrabalho = function (objHorariosmMinutos) {

        if (objHorariosmMinutos) {
            
            if (objHorariosmMinutos.ent1 && objHorariosmMinutos.sai1 && 
            objHorariosmMinutos.ent2 && objHorariosmMinutos.sai2) {
                return (objHorariosmMinutos.sai2 - objHorariosmMinutos.ent2) + 
                    ((objHorariosmMinutos.sai1 - objHorariosmMinutos.ent1));

            } else if ( (objHorariosmMinutos.ent1 && objHorariosmMinutos.sai1) && 
            (!objHorariosmMinutos.ent2 && !objHorariosmMinutos.sai2) ) {

                return (objHorariosmMinutos.sai1 - objHorariosmMinutos.ent1);

            } else {
                return 0;
            }
        }  

        return 0;
    };

    init = function () {

        checkEscalaSelecionada();

        if ($scope.turno.escala.codigo == 1) {

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
        } else if ($scope.turno.escala.codigo == 2) {
            $scope.preencherEscala.tipoRevezamento = true;
            $scope.rowHorarioDias = getInfoRev12x36();
        }
    };

    init();
}]);
