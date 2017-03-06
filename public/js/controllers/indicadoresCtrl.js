angular.module('rhPontumApp').controller('indicadoresCtrl', ['$scope', '$timeout', '$filter', 'setores', 'usuario', 'feriados', 'currentDate', 'equipesAPI', 'apontamentosAPI', 
 function($scope, $timeout, $filter, setores, usuario, feriados, currentDate, equipesAPI, apontamentosAPI){

	////console.log("indicadores");
  var _usuario = usuario.data;
  var feriados = feriados.data;
  var weekDays = ["Dom","Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var objMapDataLabel = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6};
  var dataHoje = new Date(currentDate.data.date);//data de hoje mesmo para comparações com as datas que ele vai navegando
  var firstRun = true;
  
  $scope.gestor = _usuario.funcionario;
  $scope.liberado = false;
  
  $scope.currentDate = new Date(currentDate.data.date);//fica variando a medida que o usuario navega
  $scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');
  
  //Inicializadas no init
  $scope.currentWeek = {};
  $scope.currentWeekFtd = {};
  
  getEquipesByGestor = function() {

    equipesAPI.getEquipesByGestor($scope.gestor).then(function successCallback(response){

      $scope.equipes = response.data;
      if($scope.equipes){
        if($scope.equipes.length > 0){
          $scope.equipes[0].selecionada = true;
          showIndicators($scope.equipes[0]);
        } 
      } 

      ////console.log('Equipes do gestor: ', response.data);

    }, 
    function errorCallback(response){
      $errorMsg = response.data.message;
      ////console.log("houve um erro ao carregar as equipes do gestor");
    });
  }

  //Esse meu intervalo está sendo para apenas 1 dia, esse código não funcionará
  //caso a gnt altere esse comportamento! Cuidado!
  getApontamentosByDateRangeAndEquipe = function(beginDate, intervaloDias, componentes, updateDiario) {

    //var objDateEquipe = {date: $scope.currentDate, dias: intervaloDias, equipe: componentes};
    var objDateEquipe = {date: beginDate, dias: intervaloDias, equipe: componentes};

    if (firstRun) {   

      ////console.log("Objeto Date Equipe Enviado: ", objDateEquipe);

      apontamentosAPI.getApontamentosByDateRangeAndEquipe(objDateEquipe).then(function successCallback(response){

        var apontamentosSemanais = response.data;
        var apontamentosDiarios = getOnlyApontDiarios(apontamentosSemanais);
        
        createPrettyStringResults(apontamentosDiarios);
        buildGraphBar(apontamentosSemanais);
        ////console.log("#$!#$$$$$$$$ APONTAMENTOS DIARIOS ", apontamentosDiarios);
        ////console.log("#$%@$#@%#$@#%$@%#$@ Apontamentos Semanais: ", apontamentosSemanais);
        firstRun = false;
        
      }, function errorCallback(response){
        
        $errorMsg = response.data.message;
        ////console.log("Erro ao obter apontamentos por um range de data e equipe");

      });

    } else {

      apontamentosAPI.getApontamentosByDateRangeAndEquipe(objDateEquipe).then(function successCallback(response){

        var apontamentosResponse = response.data;

        if (updateDiario) {
          
          createPrettyStringResults(apontamentosResponse);
          ////console.log("#$!#$$$$$$$$ APONTAMENTOS DIARIOS ", apontamentosResponse);

        } else {

          buildGraphBar(apontamentosResponse);
          ////console.log("#$!@!$@!$!@$@! TESTE !@#!%!@%!%% apontamentos SEMANAIS: ", response.data);
        }

      }, function errorCallback(response){
        
        $errorMsg = response.data.message;
        ////console.log("Erro ao obter apontamentos por um range de data e equipe");

      });

    }

  }

  showIndicators = function(equipe) {

    $scope.equipe = equipe;
    
    if (!equipe.componentes){
      ////console.log("Equipe sem componentes!!!! Tratar isso no código");
      $scope.equipe.componentes = [];
      //$scope.apontamentosDiarios = [];

    } else {

      //pegando o semanal (passa 8 mas traz 7, não inclui a última data)
      //Se quiser o do dia, basta passar 1.
      getApontamentosByDateRangeAndEquipe($scope.currentWeek.begin, 8, $scope.equipe.componentes, true);
    }
  }

  getOnlyApontDiarios = function(apontamentosSemanais) {

    return apontamentosSemanais.filter(function(apontamento){
      ////console.log("apontamento.data: ", new Date(apontamento.data));
      ////console.log("currentDate: ", $scope.currentDate);
      ////console.log("são iguais? ", compareOnlyDates(new Date(apontamento.data), $scope.currentDate))
      return (compareOnlyDates(new Date(apontamento.data), 
        $scope.currentDate) === 0);
    });
  }

  createPrettyStringResults = function(apontamentoDiariosPorFuncionario) {

    var hasAppoint = false;

    $scope.equipe.componentes.forEach(function(componente){
      
      hasAppoint = false;

      apontamentoDiariosPorFuncionario.forEach(function(apontamentoDiarioPorFuncionario){
        
        //se encontrar, é pq o funcionario tem apontamentos
        if (componente._id == apontamentoDiarioPorFuncionario.funcionario._id){
          componente.apontamentoDiario = apontamentoDiarioPorFuncionario;
          setPretty(componente);
          hasAppoint = true;
          return hasAppoint;
        }

      });

      if (!hasAppoint) {
        //aí verificamos os casos possíveis (feriados, DSR, AUSENCIA)
        ////console.log("################Desve estar caindo aqui , sem apontamento...")
        componente.apontamentoDiario = {};
        setPretty(componente);
        ////console.log("componente modificado: ", componente);
      }

      createSeriesGraphic(componente.apontamentoDiario);

    });
  }

  setPretty = function(funcionario) {
    
    var expedienteObj = {};
    var funcionarioAlocacao = funcionario.alocacao;    
    var apontamento = funcionario.apontamentoDiario;
    var totalBHDia = 0;

    //se tiver marcações
    if (apontamento.marcacoes) {          
      
      //pode não ter expediente iniciado, estar atrasado ou faltante mesmo
      if (apontamento.marcacoes.length == 0){

        
        expedienteObj = checkExpediente(funcionarioAlocacao, false, false);
        apontamento.statusCodeString = expedienteObj.code;
        apontamento.statusString = expedienteObj.string;
        apontamento.statusImgUrl = expedienteObj.imgUrl;

      } //aqui podemos contabilizar o saldo de BH tb           
      else if (apontamento.marcacoes.length > 0){
        
        apontamento.marcacoesStringObj = createStringMarcacoes(apontamento);
        //checar a primeira batida -> ent1
        var _ent1ObjMarcacao = apontamento.marcacoes[0];
        var minutosTotaisMarcacao = converteParaMinutosTotais(_ent1ObjMarcacao.hora, 
          _ent1ObjMarcacao.minuto);
        //apontamento.statusString = "Em andamento";
        //Verificar a falta de flexibilidade, pois utiliza a tolerancia
        if(!funcionario.alocacao.turno.isFlexivel){

          expedienteObj = checkExpediente(funcionarioAlocacao, minutosTotaisMarcacao, funcionarioAlocacao.turno.tolerancia);
          apontamento.statusCodeString = expedienteObj.code;
          apontamento.statusString = expedienteObj.string;
          apontamento.statusImgUrl = expedienteObj.imgUrl;
        }
        else {
          ////console.log("horário flexível, não dá pra dizer se há atraso");
          apontamento.statusCodeString = "FLE";
          apontamento.statusString = "Horário Flexível";
          apontamento.statusImgUrl = "../img/bullet-black.png";
        }               
        
        //salvar no apontamento de cada funcionario
        totalBHDia = calcularBancoHorasDia(funcionarioAlocacao.turno.escala.codigo, 
          funcionarioAlocacao, apontamento);        

        ////console.log("********* MapBancoHoras: ", totalBHDia);
      }
     
    }
    //se não tiver apontamento ou marcações -> 
    else {
      expedienteObj = checkExpediente(funcionarioAlocacao, false, false);
      apontamento.statusCodeString = expedienteObj.code;
      apontamento.statusString = expedienteObj.string;
      apontamento.statusImgUrl = expedienteObj.imgUrl;
    }

    //inclui uma property para o total calculado de banco horas do dia (registro em minutos)
    apontamento.bancoHorasDia = totalBHDia;
    //Atualiza o funcionario.apontamento.
    funcionario.apontamentoDiario = apontamento;
  }

  checkExpediente = function(funcionarioAlocacao, valorComparacao, tolerancia) {
    
    var today = $scope.currentDate.getDay();
    var codigoEscala = funcionarioAlocacao.turno.escala.codigo; 
    var jornadaArray = funcionarioAlocacao.turno.jornada.array; //para ambas as escalas
    var ignoraFeriados =  funcionarioAlocacao.turno.ignoraFeriados;

    ////console.log("################## CHECK EXPEDIENTE");
    ////console.log("today ", today);//dia da semana apenas de 0 a 6
    ////console.log("codigoEscala ", codigoEscala);
    ////console.log("jornadaArray", jornadaArray);
    ////console.log("Ignora Feriados? ", ignoraFeriados);
    ////console.log("valorComparacao", valorComparacao);
    ////console.log("tolerancia", tolerancia);
    
    //escala semanal
    //if (codigoEscala == 1) {

    if (isFeriado() && !ignoraFeriados){
      
      return {code: "FRD", string: "Feriado!", imgUrl: "../img/bullet-emoji.png"};

    } else {
        
        //Obtém a informação do DIA ATUAL na jornada do trabalhador
        var objDay;

        if (codigoEscala == 1) {// jornada semanal
          
          objDay = getDayInArrayJornadaSemanal(today, jornadaArray);
          ////console.log("ObjDay ", objDay);
          if (objDay.horarios) {

          //ENTRADA 1 para o DIA ATUAL
          var ENT1 = objDay.horarios.ent1;
          ////console.log("ENT 1: ", ENT1);
          
          if (!valorComparacao){ //é o caso de saber se é o início do expediente
            
            //Verificar se o dia navegado é antes ou depois comparado ao dia de HOJE
            ////console.log('$scope.currentDate: ', $scope.currentDate);
            ////console.log('Data Hoje: ', dataHoje);
            var codDate = compareOnlyDates($scope.currentDate, dataHoje);
            ////console.log('$scope.currentDate: ', $scope.currentDate);
            ////console.log('Data Hoje: ', dataHoje);

            if (codDate === 0) { //é o próprio dia de hoje
              ////console.log("Olhando para o dia de hoje! Pode estar Ausente ou ENI");
              //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
              var totalMinutesAtual = converteParaMinutosTotais(dataHoje.getHours(), 
              dataHoje.getMinutes());
              ////console.log("Total de minutos da hora atual: ", totalMinutesAtual);

              if (totalMinutesAtual < ENT1) {
              
                ////console.log("Ainda não iniciou o expediente");
                return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};

              } else {
                ////console.log("Já passou o tempo da batida dele , então está ausente, ainda não bateu!");
                return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
              }
            } else if (codDate === -1) {//Navegando em dia passado 

                ////console.log("Navegando em dias anteriores e sem valor de apontamento, ou seja, faltante");
                return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
              } else { //Navegando em dias futuros

                ////console.log("Navegando em dias futuros, expediente não iniciado!");
                return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};
              }

            } else { //Você compara com o valor fornecido por parametro (q normalmente é o valor do apontamento)

              if((valorComparacao >= (ENT1 - tolerancia)) && (valorComparacao <= (ENT1 + tolerancia))){
                ////console.log("Está dentro dos limites tolerados no horário rígido!");
                return {code: "PRE", string: "Presente", imgUrl: "../img/bullet-green.png"};
              } else {
                ////console.log("Está fora dos limites - bateu atrasado!");
                return {code: "ATR", string: "Presente com observação (primeira batida aquém ou além da tolerância estabelecida)", imgUrl: "../img/bullet-green2.png"};
              }

            }

          } else { //Não tem a property "horarios", significa que não é dia de trabalho!

            ////console.log("Dia de descanso na escala semanal");
            return {code: "DSR", string: "Descanso Semanal Remunerado", imgUrl: "../img/bullet-grey.png"};
          }

        } else if (codigoEscala == 2) {

          ////console.log("ObjDay ", objDay);
          objDay = getDayInJornadaDiferenciada($scope.currentDate, 
            new Date(funcionarioAlocacao.dataInicioEfetivo));
          

          if (objDay.isWorkingDay && jornadaArray.length > 0) {

            //ENTRADA 1 para o DIA ATUAL
            var ENT1 = jornadaArray[0].horarios.ent1;
            ////console.log("ENT 1: ", ENT1);

            //Não tem apontamentos
            if (!valorComparacao){ //verificar se é pq não iniciou o expediente ou se é pq faltou
            
              //Verificar se o dia navegado é antes ou depois comparado ao dia de HOJE
              ////console.log('$scope.currentDate: ', $scope.currentDate);
              ////console.log('Data Hoje: ', dataHoje);
              var codDate = compareOnlyDates($scope.currentDate, dataHoje);
              ////console.log('$scope.currentDate: ', $scope.currentDate);
              ////console.log('Data Hoje: ', dataHoje);

              if (codDate === 0) { //é o próprio dia de hoje
                ////console.log("Olhando para o dia de hoje! Pode estar Ausente ou ENI");
                //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
                var totalMinutesAtual = converteParaMinutosTotais(dataHoje.getHours(), 
                dataHoje.getMinutes());
                ////console.log("Total de minutos da hora atual: ", totalMinutesAtual);

                if (totalMinutesAtual < ENT1) {
                
                  ////console.log("Ainda não iniciou o expediente");
                  return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};

                } else {
                  ////console.log("Já passou o tempo da batida dele , então está ausente, ainda não bateu!");
                  return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
                }
              } else if (codDate === -1) {//Navegando em dia passado 

                ////console.log("Navegando em dias anteriores e sem valor de apontamento, ou seja, faltante");
                return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
              } else { //Navegando em dias futuros

                ////console.log("Navegando em dias futuros, expediente não iniciado!");
                return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};
              }

            } else { //Você compara com o valor fornecido por parametro (q normalmente é o valor do apontamento)

              if((valorComparacao >= (ENT1 - tolerancia)) && (valorComparacao <= (ENT1 + tolerancia))){
                ////console.log("Está dentro dos limites tolerados no horário rígido!");
                return {code: "PRE", string: "Presente", imgUrl: "../img/bullet-green.png"};
              } else {
                ////console.log("Está fora dos limites - bateu atrasado!");
                return {code: "ATR", string: "Presente com observação (primeira batida aquém ou além da tolerância estabelecida)", imgUrl: "../img/bullet-green2.png"};
              }

            }

          } else {

            ////console.log("Dia de descanso na escala semanal");
            return {code: "DSR", string: "Descanso Semanal Remunerado", imgUrl: "../img/bullet-grey.png"}; 
          }
        }        
        
    } //fim do não-feriado
  }

  getDayInArrayJornadaSemanal = function (dayToCompare, arrayJornadaSemanal) {
    
    var diaRetorno = {};
    arrayJornadaSemanal.forEach(function(objJornadaSemanal){
      if(dayToCompare == objJornadaSemanal.dia){
        diaRetorno = objJornadaSemanal;
        return diaRetorno;
      }
    });
    //console.log("DIA RETORNO NO getDayInArrayJornadaSemanal: ", diaRetorno);
    return diaRetorno;
  }

  //12x36h
  getDayInJornadaDiferenciada = function (dateToCompare, dataInicioEfetivo) {
    
    return {
      isWorkingDay: isWorkingDay(dateToCompare, dataInicioEfetivo)      
    };
  }

  isWorkingDay = function (dateToCompare, dataInicioEfetivo) {

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    
    var d1 = angular.copy(dateToCompare); 
    var d2 = angular.copy(dataInicioEfetivo);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    var diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
    ////console.log("diffDays: ", diffDays);
    
    return (diffDays % 2 == 0) ? true : false;
  }

  converteParaHorasTotais = function (totalMinutos) {
    return (totalMinutos/60);
  }

  converteParaMinutosTotais = function (hours, mins) {
    return (hours * 60) + mins;
  }

  converteParaHoraMinutoSeparados = function(totalMinutos) {
    
    var hours = Math.floor(totalMinutes/60);
    var minutes = totalMinutes % 60;

    /* se precisar formatar
    var hoursStr = "";
    var minutesStr = "";

    hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
    minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;
    */

    return {hora: hours, minuto: minutes};
  }

  createStringMarcacoes = function(apontamento) {

    var marcacaoStringObj = {};

    apontamento.marcacoes.forEach(function(objMarcacao){
      if (objMarcacao.descricao == "ent1")
        marcacaoStringObj.ent1 = converteParaMarcacaoString(objMarcacao.hora, objMarcacao.minuto, ":");
      else if (objMarcacao.descricao == "sai1")
        marcacaoStringObj.sai1 = converteParaMarcacaoString(objMarcacao.hora, objMarcacao.minuto, ":");
      else if (objMarcacao.descricao == "ent2")
        marcacaoStringObj.ent2 = converteParaMarcacaoString(objMarcacao.hora, objMarcacao.minuto, ":");
      else if (objMarcacao.descricao == "sai2")
        marcacaoStringObj.sai2 = converteParaMarcacaoString(objMarcacao.hora, objMarcacao.minuto, ":");
    });

    return marcacaoStringObj;
  }

  calcularMarcacoesAusente = function (horariosObj) {

    if (horariosObj.ent1 && horariosObj.sai1 && horariosObj.ent2 && horariosObj.sai2){//full

      return (horariosObj.sai2 - horariosObj.ent2) + (horariosObj.sai1 - horariosObj.ent1);

    } else if (horariosObj.ent1 && horariosObj.sai1){ //parcial

      return (horariosObj.sai1 - horariosObj.ent1);
    }
  }

  calcularMarcacoes = function(apontamento) {

    var ent1 = 0;
    var sai1 = 0;
    var ent2 = 0;
    var sai2 = 0;

    var size = apontamento.marcacoes.length;

    if (size % 2 == 0){ //se estive em número par, dá pra calcular, se não, será taxada de incorreta

      apontamento.marcacoes.forEach(function(objMarcacao){
        if (objMarcacao.descricao == "ent1")
          ent1 = (objMarcacao.hora * 60) + objMarcacao.minuto;
        else if (objMarcacao.descricao == "sai1")
          sai1 = (objMarcacao.hora * 60) + objMarcacao.minuto;
        else if (objMarcacao.descricao == "ent2")
          ent2 = (objMarcacao.hora * 60) + objMarcacao.minuto;
        else if (objMarcacao.descricao == "sai2")
          sai2 = (objMarcacao.hora * 60) + objMarcacao.minuto;
      });

      return (sai2 - ent2) + (sai1 - ent1);
      
    } else {

      return null;
    }
  }

  //Calcula o banco de horas desse dia e retorna um inteiro indicando a quantidade de minutos 
  //(positivo -> saldo de horas, negativo -> fez horas a menos que o desejado)
  calcularBancoHorasDia = function (codigoEscala, funcionarioAlocacao, apontamento) {

    //console.log('**codigoEscala', codigoEscala);
    //console.log('**funcionarioAlocacao', funcionarioAlocacao);
    //console.log('**apontamento', apontamento);
    
    //var diaSemanaCorrente = (dateParam) ? dateParam.getDay() : $scope.currentDate.getDay();

    var horasTrabalhadas = calcularMarcacoes(apontamento);
    //console.log("**horasTrabalhadas: ", horasTrabalhadas);
    var horasDesejadas = 0;

    //semanal
    if (codigoEscala == 1) {

      horasDesejadas = getDayInArrayJornadaSemanal((new Date(apontamento.data)).getDay(), funcionarioAlocacao.turno.jornada.array).minutosTrabalho;

    } else if (codigoEscala == 2) {

      if (isWorkingDay(new Date(apontamento.data), 
            new Date(funcionarioAlocacao.dataInicioEfetivo))){
        
        horasDesejadas = funcionarioAlocacao.turno.jornada.minutosTrabalho;
      }
    }

    //console.log('** Horas Desejadas: ', horasDesejadas);

    
    return horasTrabalhadas ? (horasTrabalhadas - horasDesejadas) : null;
  }

  converteParaMarcacaoString = function(hours, minutes, separator) {

    var hoursStr = "";
    var minutesStr = "";

    hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
    minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;

    return (separator) ? hoursStr+separator+minutesStr : hoursStr+minutesStr;
  }

  isFeriado = function() {
     
    var date = $scope.currentDate.getDate();//1 a 31
    var month = $scope.currentDate.getMonth();//0 a 11
    var year = $scope.currentDate.getFullYear();//
    var flagFeriado = false;
    var tempDate;

    feriados.forEach(function(feriado){
      
      tempDate = new Date(feriado.data);
      if (feriado.fixo){
        
        if (tempDate.getMonth() === month && tempDate.getDate() === date){
          ////console.log("É Feriado (fixo)!");
          flagFeriado = true;
          return feriado;
        }

      } else {//se não é fixo

        if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === date) ){
          ////console.log("É Feriado (variável)!");
          flagFeriado = true;
          return feriado;
        }

      }
    });

    return flagFeriado;
  }

  compareOnlyDates = function (date1, date2) {

    //como a passagem é por referência, devemos criar uma cópia do objeto
    var d1 = angular.copy(date1); 
    var d2 = angular.copy(date2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    if (d1.getTime() < d2.getTime())
      return -1;
    else if (d1.getTime() === d2.getTime())
      return 0;
    else
      return 1; 
  }

  createSeriesGraphic = function (apontamento) {

    ////console.log("apontamento: ", apontamento);
  }

  addOrSubtractDays = function (date, value) {
        
    date = angular.copy(date);
    date.setHours(0,0,0,0);

    return new Date(date.getTime() + (value*864e5));
  }

  buildGraphBar = function (apontamentosSemanais) {
    buildBarGraphLabels();
    console.log("$scope.weekLabels", $scope.weekLabels);
    buildBarGraphData(apontamentosSemanais);
  }

  buildBarGraphLabels = function () {

    $scope.weekLabels = [];
    var count = 0;

    console.log("currentWeek begin: ", $scope.currentWeek.begin);
    var beginDay = (new Date($scope.currentWeek.begin)).getDay();
    //$scope.weekLabels.push(weekDays[beginDay]);
    
    for (var i=beginDay; i<=6; i++) {

      $scope.weekLabels.push(weekDays[i]);
      objMapDataLabel[i] = count;
      count++;
    }

    for (var i=0; i<beginDay; i++) {

      $scope.weekLabels.push(weekDays[i]);
      objMapDataLabel[i] = count;
      count++;
    }
  }

  buildBarGraphData = function (apontamentosSemanais) {

    //$scope.weekData = [[5, -1, 2, 0, -2, -4, 8]];
    $scope.weekData = [];
    var arrayBancoHorasSemanal = [0, 0, 0, 0, 0, 0, 0];
    //console.log("arrayBancoHorasSemanal: ", arrayBancoHorasSemanal);
    //console.log("objMapDataLabel: ", objMapDataLabel);
    var dateSemana;
    var totalHorasDiaEquipe = 0;
    
    console.log("Apontamento semanal length: ", apontamentosSemanais.length);
    console.log("Apontamento semanais: ", apontamentosSemanais);
    var j;
    var removedElements;
    //For dos dias da semana (se for mensal, o valor seria 30 por ex... mes de 30 dias claro)
    for (var i=0; i<7; i++) {
      
      dateSemana = addOrSubtractDays($scope.currentWeek.begin, i);
      console.log("## data atual do laço: ", dateSemana);
        
      //Tem que enviar um ARRAY de apontamentos ordenados pela data para FUNCIONAR esse laço, melhorando a performance
      j = 0;
      
      while( apontamentosSemanais[j] && (compareOnlyDates(dateSemana, new Date(apontamentosSemanais[j].data)) == 0)){//enquanto for a mesma

        //console.log("apontamento pego: ", apontamentosSemanais[j]); 
        j++;
      }
      //qtde 'j' indica numero de funcionários com apontamentos nessa data...

      removedElements = apontamentosSemanais.splice(0, j);
      console.log("elementos cortados: ", removedElements);
      // //console.log("corta do array só as datas ordenadas encontradas a partir da data exposta acima, sobrou: ", apontamentosSemanais.length);

      totalHorasDiaEquipe = calcularBancoHorasEquipe(removedElements, dateSemana);

      arrayBancoHorasSemanal[objMapDataLabel[dateSemana.getDay()]] += totalHorasDiaEquipe;

    }

    $scope.weekData.push(arrayBancoHorasSemanal);
  }

  calcularBancoHorasEquipe = function(apontamentosDiaFuncionario, currentDateNav){

    var tempHoras;
    var totalMntsTrabalhadosEquipe = 0;
    var totalHorasAusente = 0;

    $scope.equipe.componentes.forEach(function (componente){
        
      tempHoras = null;
      console.log("#componente: ", componente);

      for (var i=0; i<apontamentosDiaFuncionario.length; i++) {
        if (componente._id == apontamentosDiaFuncionario[i].funcionario._id){
          tempHoras = calcularBancoHorasDia(apontamentosDiaFuncionario[i].funcionario.alocacao.turno.escala.codigo, 
               apontamentosDiaFuncionario[i].funcionario.alocacao, apontamentosDiaFuncionario[i]);
          totalMntsTrabalhadosEquipe += tempHoras;
          break;
        }
      }
      //console.log("#tempHoras do dia para esse funcionário: ", tempHoras);
      //O funcionário esteve ausente neste dia se chegar aqui [verificar se era FOLGA/FÉRIAS/FERIADO ou algo nesse sentido]
      if (tempHoras == null || tempHoras == undefined || tempHoras == NaN){//não usar !tempHoras pq as vezes o resultado é 0, e aí entraria aqui tb
        
        totalHorasAusente = calcularHorasAusente(componente, currentDateNav);//calcula as horas de acordo com a "ausência" do funcionário [verificar os casos acima]
        //console.log("totalHorasAusente: ", totalHorasAusente);
        totalMntsTrabalhadosEquipe -= totalHorasAusente;
      }
    });

    return converteParaHorasTotais(totalMntsTrabalhadosEquipe);
  }

  calcularHorasAusente = function(componente, currentDateNav) {

    var codigoEscala = componente.alocacao.turno.escala.codigo;
    var totalMntsAtrabalhar = 0;

    if (isFeriado() && !componente.alocacao.turno.ignoraFeriados){
      
      return totalMntsAtrabalhar;

    } else {

      //Obtém a informação do DIA ATUAL na jornada do trabalhador
      var objDay;

      if (codigoEscala == 1) {// jornada semanal

        //console.log("escala semanal");
        objDay = getDayInArrayJornadaSemanal(currentDateNav.getDay(), componente.alocacao.turno.jornada.array);
        ////console.log("ObjDay ", objDay);
        if (!objDay.horarios) { //DSR -> Descanso Semanal Remunerado

          return totalMntsAtrabalhar;

        } else {//realmente esteve ausente, verificar quantas horas deveria ter feito.

          totalMntsAtrabalhar = calcularMarcacoesAusente(objDay.horarios);
          return totalMntsAtrabalhar;
        }

      } else if (codigoEscala == 2) {

        objDay = getDayInJornadaDiferenciada(currentDateNav, new Date(componente.alocacao.dataInicioEfetivo));
        //console.log("escala 12x36h");
        if (objDay.isWorkingDay && componente.alocacao.turno.jornada.array.length > 0) { //realmente faltou

          totalMntsAtrabalhar = calcularMarcacoesAusente(componente.alocacao.turno.jornada.array[0].horarios);
          return totalMntsAtrabalhar;

        } else { //é DSR nessa escala
          return totalMntsAtrabalhar;
        }
      }
    }
  }

  init = function(){
    
    $scope.currentWeek = {//fica variando a medida que o usuario navega
      begin: addOrSubtractDays($scope.currentDate, -7),
      end: addOrSubtractDays($scope.currentDate, -1)
    };
    $scope.currentWeekFtd = {
      begin: $filter('date')($scope.currentWeek.begin, 'abvFullDate1'),
      end: $filter('date')($scope.currentWeek.end, 'abvFullDate1')
    };
    ////console.log("current date ficou assim: ", $scope.currentDate);
   
    $scope.weekSeries = ['Saldo'];
    $scope.weekOptions = {
      scales: {
        xAxes: [{
          position: 'top'
        }]        
      }
    };

    //updateBarGraph();
    if ($scope.gestor) {
      if ($scope.gestor.alocacao.gestor) {//se realmente for um gestor
        $scope.liberado = true;
        //carregar equipes do gestor
        getEquipesByGestor();

      } else {
        $scope.errorMsg = "Este funcionário não é Gestor e portanto não pode visualizar estas informações";
      }
    } else {
        if (_usuario.perfil.accessLevel >= 4) {
          //é um admin vendo a página, pode liberar
          $scope.liberado =true;
        }
    }
  }

  $scope.checkUncheckEquipe = function(equipe) {

    ////console.log("clicked equipe: ", equipe.nome);
    //Não pode simplesmente deselecionar uma equipe, ele tem q manter 1 ativa sempre
    if (!equipe.selecionada) {
      
      equipe.selecionada = !equipe.selecionada;
      //uncheckOthers();
      $scope.equipes.forEach(function(otherEquipe){
        if(otherEquipe._id != equipe._id)
          otherEquipe.selecionada = false;
      });

      showIndicators(equipe);
    }
  }

  $scope.subtractOneDay = function () {

    $scope.currentDate.setDate($scope.currentDate.getDate() - 1);
    $scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');

    getApontamentosByDateRangeAndEquipe($scope.currentDate, 1, $scope.equipe.componentes, true);//pegando o diário
  }

  $scope.addOneDay = function () {

    $scope.currentDate.setDate($scope.currentDate.getDate() + 1);
    $scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');

    getApontamentosByDateRangeAndEquipe($scope.currentDate, 1, $scope.equipe.componentes, true);//pegando o diário
  }

  $scope.subtractOneWeek = function () {
    
    var currentBegin = new Date($scope.currentWeek.begin);
    var novoBegin = new Date(addOrSubtractDays(currentBegin, -7));
    var novoEnd = new Date(addOrSubtractDays(currentBegin, -1));
    ////console.log("currentBegin? ", currentBegin);
    ////console.log("Novo Begin? ", novoBegin);
    ////console.log("Novo End? ", novoEnd);

    $scope.currentWeek = {//fica variando a medida que o usuario navega
      begin: novoBegin,
      end: novoEnd
    };

    $scope.currentWeekFtd = {
      begin: $filter('date')($scope.currentWeek.begin, 'abvFullDate1'),
      end: $filter('date')($scope.currentWeek.end, 'abvFullDate1')
    };

    getApontamentosByDateRangeAndEquipe($scope.currentWeek.begin, 8, $scope.equipe.componentes, false);//pegando semanal
  }

  $scope.addOneWeek = function () {
    
    var currentEnd = new Date($scope.currentWeek.end);
    var novoBegin = new Date(addOrSubtractDays(currentEnd, 1));
    var novoEnd = new Date(addOrSubtractDays(currentEnd, 7));
    ////console.log("currentEnd? ", currentEnd);
    ////console.log("Novo Begin? ", novoBegin);
    ////console.log("Novo End? ", novoEnd);

    $scope.currentWeek = {//fica variando a medida que o usuario navega
      begin: novoBegin,
      end: novoEnd
    };

    $scope.currentWeekFtd = {
      begin: $filter('date')($scope.currentWeek.begin, 'abvFullDate1'),
      end: $filter('date')($scope.currentWeek.end, 'abvFullDate1')
    };

    getApontamentosByDateRangeAndEquipe($scope.currentWeek.begin, 8, $scope.equipe.componentes, false);//pegando semanal    
  }

  init();
	
  // var label = {
  //   value: 55, 
  //   label: "8/18 - 8/24", 
  //   datasetLabel: "Foo", 
  //   strokeColor: "rgba(178,145,47,1)", 
  //   fillColor: "rgba(178,145,47,0.2)"
  // }

  // $scope.options = {
  //   scaleShowLabelBackdrop : true,
  //   scaleShowLabels : true,
  //   scaleBeginAtZero : true,
  //   scaleLabel : "<%= Number(value) + ' %'%>",
  //   legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%> <strong><%=datasets[i].value%></strong><%}%></li><%}%></ul>",
  //   multiTooltipTemplate: "<%=datasetLabel%> XXX : <%= value %>% achieved"
  // }

	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  // $scope.data = [
  //     [65, 59, 80, 81, 56, 55, 40],
  //     [28, 48, 40, 19, 86, 27, 90]
  //   ];
  // $scope.chart_options = {
  //   multiTooltipTemplate: function(label) {
  //     return "##" + label.label + ': ' + label.value + "##";
  //   }
  // }
  $scope.options = {
   multiTooltipTemplate : function (label) {
    return label.datasetLabel + ': ' +    label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
   } 
  };
  $scope.data1 = [
      [1164445, 3444359, 3444380, 444481, 566556, 552255, 466440],
      [244448, 444448, 444440, 44419, 8446, 9427, 9440]
    ];
  $scope.onClick = function (points, evt) {

    if (points[0]) {
      console.log("points[0]", points[0]);
      if (points[0]._index || points[0]._index === 0) {
        console.log("Index? ", points[0]._index);
        var arrayData = $scope.weekData[0];
        console.log("valor: ", arrayData[points[0]._index]);
        console.log("dia: ", points[0]._model.label);
        console.log("dia: ", weekDays.indexOf(points[0]._model.label));
      }
    }
    //console.log("Evt: ", evt);
  };

  /*$scope.onHover = function (points) {
    if (points.length > 0) {
      console.log('Point', points[0].value);
    } else {
      console.log('No point');
    }
  };*/

  // // Simulate async data update
  // $timeout(function () {
  //   $scope.data = [
  //     [28, 48, 40, 19, 86, 27, 90],
  //     [65, 59, 80, 81, 56, 55, 40]
  //   ];
  // }, 3000);

}]); 