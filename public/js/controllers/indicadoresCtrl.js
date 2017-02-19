angular.module('rhPontumApp').controller('indicadoresCtrl', ['$scope', '$timeout', '$filter', 'setores', 'usuario', 'feriados', 'currentDate', 'equipesAPI', 'apontamentosAPI', 
 function($scope, $timeout, $filter, setores, usuario, feriados, currentDate, equipesAPI, apontamentosAPI){

	console.log("indicadores");
  var _usuario = usuario.data;
  var feriados = feriados.data;
  var dataHoje = new Date(currentDate.data.date);//data de hoje mesmo para comparações com as datas que ele vai navegando
  $scope.gestor = _usuario.funcionario;
  $scope.currentDate = new Date(currentDate.data.date);//fica variando a medida que o usuario navega
  $scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');
  $scope.liberado = false;
  $scope.funcionarioApontamentosMap = new Map();
  
  getEquipesByGestor = function() {

    equipesAPI.getEquipesByGestor($scope.gestor).then(function successCallback(response){

      $scope.equipes = response.data;
      if($scope.equipes){
        if($scope.equipes.length > 0){
          $scope.equipes[0].selecionada = true;
          showIndicators($scope.equipes[0]);
        } 
      } 

      console.log('Equipes do gestor: ', response.data);

    }, 
    function errorCallback(response){
      $errorMsg = response.data.message;
      console.log("houve um erro ao carregar as equipes do gestor");
    });
  }

  //Esse meu intervalo está sendo para apenas 1 dia, esse código não funcionará
  //caso a gnt altere esse comportamento! Cuidado!
  getApontamentosByDateRangeAndEquipe = function(intervaloDias, componentes) {

    var objDateEquipe = {date: $scope.currentDate, dias: intervaloDias, equipe: componentes};

    apontamentosAPI.getApontamentosByDateRangeAndEquipe(objDateEquipe).then(function successCallback(response){

      //$scope.apontamentosDiarios = response.data;
      var apontamentosDiarios = response.data;

      console.log("apontamentos diarios: ", response.data);
      //console.log("atualizado $scope.equipe.componentes", $scope.equipe.componentes);

      createPrettyStringResults(apontamentosDiarios);

    }, function errorCallback(response){
      
      $errorMsg = response.data.message;
      console.log("Erro ao obter apontamentos por um range de data e equipe");

    });
  }

  showIndicators = function(equipe) {

    $scope.equipe = equipe;
    
    if (!equipe.componentes){
      console.log("Equipe sem componentes!!!! Tratar isso no código");
      $scope.equipe.componentes = [];
      //$scope.apontamentosDiarios = [];

    } else {

      getApontamentosByDateRangeAndEquipe(1, $scope.equipe.componentes);//pegando o diário
    }


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
        componente.apontamentoDiario = {};
        setPretty(componente);
      }

    });
  }

  setPretty = function(funcionario) {
    
    var expedienteObj = {};
    var codigoEscala = funcionario.alocacao.turno.escala.codigo; 
    var jornadaArray = funcionario.alocacao.turno.jornada.array; //varia de acordo com a escala
    var today = $scope.currentDate.getDay();
    var apontamento = funcionario.apontamentoDiario;

    //se tiver marcações
    if (apontamento.marcacoes) {          
      
      //pode não ter expediente iniciado, estar atrasado ou faltante mesmo
      if (apontamento.marcacoes.length == 0){

        
        expedienteObj = checkExpediente(today, codigoEscala, jornadaArray, false, false);
        apontamento.statusCodeString = expedienteObj.code;
        apontamento.statusString = expedienteObj.string;
        apontamento.statusImgUrl = expedienteObj.imgUrl;

      }            
      else if (apontamento.marcacoes.length > 0){
        
        apontamento.marcacoesStringObj = createStringMarcacoes(apontamento);
        //checar a primeira batida -> ent1
        var _ent1ObjMarcacao = apontamento.marcacoes[0];
        var minutosTotaisMarcacao = converteParaMinutosTotais(_ent1ObjMarcacao.hora, 
          _ent1ObjMarcacao.minuto);
        //apontamento.statusString = "Em andamento";
        //Verificar a falta de flexibilidade, pois utiliza a tolerancia
        if(!funcionario.alocacao.turno.isFlexivel){

          expedienteObj = checkExpediente(today, codigoEscala, jornadaArray, minutosTotaisMarcacao, funcionario.alocacao.turno.tolerancia);
          apontamento.statusCodeString = expedienteObj.code;
          apontamento.statusString = expedienteObj.string;
          apontamento.statusImgUrl = expedienteObj.imgUrl;
        }
        else {
          console.log("horário flexível, não dá pra dizer se há atraso");
          apontamento.statusCodeString = "FLE";
          apontamento.statusString = "Horário Flexível";
          apontamento.statusImgUrl = "../img/bullet-black.png";
        }
      }
     
    }
    //se não tiver apontamento ou marcações -> 
    else {
      expedienteObj = checkExpediente(today, codigoEscala, jornadaArray, false, false);
      apontamento.statusCodeString = expedienteObj.code;
      apontamento.statusString = expedienteObj.string;
      apontamento.statusImgUrl = expedienteObj.imgUrl;
    }

    //Atualiza o funcionario.apontamento.
    funcionario.apontamentoDiario = apontamento;
  }

  checkExpediente = function(today, codigoEscala, jornadaArray, valorComparacao, tolerancia) {
    
    console.log("################## CHECK EXPEDIENTE");
    console.log("today ", today);//dia da semana apenas de 0 a 6
    console.log("codigoEscala ", codigoEscala);
    console.log("jornadaArray", jornadaArray);
    console.log("valorComparacao", valorComparacao);
    console.log("tolerancia", tolerancia);
    
    //escala semanal
    if (codigoEscala == 1) {

      if (isFeriado()){

        console.log("opa, hoje é feriado!");
        return {code: "FRD", string: "Feriado!", imgUrl: "../img/bullet-emoji.png"};

      } else {
        //Obtém a informação do DIA ATUAL na jornada do trabalhador
        var objDay = getDayInArrayJornadaSemanal(today, jornadaArray);
        console.log("ObjDay ", objDay);
        if (objDay.horarios) {         

          //ENTRADA 1 para o DIA ATUAL
          var ENT1 = objDay.horarios.ent1;
          
          if (!valorComparacao){ //é o caso de saber se é o início do expediente
            
            //Verificar se o dia navegado é antes ou depois comparado ao dia de HOJE
            var codDate = compareOnlyDates($scope.currentDate, dataHoje);

            if (codDate === 0) { //é o próprio dia de hoje
              //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
              var totalMinutesAtual = converteParaMinutosTotais($scope.currentDate.getHours(), 
              $scope.currentDate.getMinutes());

              if (totalMinutesAtual < ENT1) {
              
                console.log("Ainda não iniciou o expediente");
                return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};

              } else {
                console.log("Já passou o tempo da batida dele , então está ausente, ainda não bateu!");
                return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
              }
            } else if (codDate === -1) {//Navegando em dia passado 

              console.log("Navegando em dias anteriores e sem valor de apontamento, ou seja, faltante");
              return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
            } else { //Navegando em dias futuros

              console.log("Navegando em dias futuros, expediente não iniciado!");
              return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};
            }

          } else { //Você compara com o valor fornecido por parametro (q normalmente é o valor do apontamento)

            if((valorComparacao >= (ENT1 - tolerancia)) && (valorComparacao <= (ENT1 + tolerancia))){
              console.log("Está dentro dos limites tolerados no horário rígido!");
              return {code: "PRE", string: "Presente", imgUrl: "../img/bullet-green.png"};
            } else {
              console.log("Está fora dos limites - bateu atrasado!");
              return {code: "ATR", string: "Atrasado", imgUrl: "../img/bullet-yellow.png"};
            }

          }

        } else {

          console.log("Dia de descanso na escala semanal");
          return {code: "DSR", string: "Descanso Semanal Remunerado", imgUrl: "../img/bullet-grey.png"};
        }
      } //fim do não-feriado

    } else if (codigoEscala == 2) {//escala 12x36h

    }
  }

  getDayInArrayJornadaSemanal = function (dayToCompare, arrayJornadaSemanal) {
    
    var diaRetorno = {};
    arrayJornadaSemanal.forEach(function(objJornadaSemanal){
      if(dayToCompare == objJornadaSemanal.dia){
        diaRetorno = objJornadaSemanal;
        return diaRetorno;
      }
    });
    return diaRetorno;
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
          console.log("É Feriado (fixo)!");
          flagFeriado = true;
          return feriado;
        }

      } else {//se não é fixo

        if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === date) ){
          console.log("É Feriado (variável)!");
          flagFeriado = true;
          return feriado;
        }

      }
    });

    return flagFeriado;
  }

  compareOnlyDates = function (date1, date2) {

    var d1 = date1;
    var d2 = date2;
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    if (d1.getTime() < d2.getTime())
      return -1;
    else if (d1.getTime() === d2.getTime())
      return 0;
    else
      return 1; 
  }

  init = function(){
    
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

    console.log("clicked equipe: ", equipe.nome);
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

    getApontamentosByDateRangeAndEquipe(1, $scope.equipe.componentes);//pegando o diário
  }

  $scope.addOneDay = function () {

    $scope.currentDate.setDate($scope.currentDate.getDate() + 1);
    $scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');

    getApontamentosByDateRangeAndEquipe(1, $scope.equipe.componentes);//pegando o diário
  }

  init();
	
	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };

    $scope.testes = [1,2,3,4,5,6,7,8,9,10];

    $scope.groups = [
	    {
	      title: 'Dynamic Group Header - 1',
	      content: 'Dynamic Group Body - 1'
	    },
	    {
	      title: 'Dynamic Group Header - 2',
	      content: 'Dynamic Group Body - 2'
	    }
    ];
    $scope.oneAtATime = true;
    $scope.status = {
	    isCustomHeaderOpen: false,
	    isFirstOpen: true,
	    isFirstDisabled: false
	  };

    // Simulate async data update
    $timeout(function () {
      $scope.data = [
        [28, 48, 40, 19, 86, 27, 90],
        [65, 59, 80, 81, 56, 55, 40]
      ];
    }, 3000);

}]); 