angular.module('rhPontumApp').controller('indicadoresCtrl', ['$scope', '$timeout', '$filter', 'setores', 'usuario', 'currentDate', 'equipesAPI', 'apontamentosAPI', 
 function($scope, $timeout, $filter, setores, usuario, currentDate, equipesAPI, apontamentosAPI){

	console.log("indicadores");
  var _usuario = usuario.data;
  $scope.gestor = _usuario.funcionario;
  $scope.currentDate = new Date(currentDate.data.date);
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

  getApontamentosByDateRangeAndEquipe = function(intervaloDias, componentes) {

    var objDateEquipe = {date: $scope.currentDate, dias: intervaloDias, equipe: componentes};

    apontamentosAPI.getApontamentosByDateRangeAndEquipe(objDateEquipe).then(function successCallback(response){

      $scope.apontamentosDiarios = response.data;
      console.log("apontamentos diarios: ", response.data);
      createPrettyStringResults($scope.apontamentosDiarios);

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
      $scope.apontamentosDiarios = [];

    } else {

      getApontamentosByDateRangeAndEquipe(1, $scope.equipe.componentes);//pegando o diário
    }


  }

  createPrettyStringResults = function(apontamentoFuncionarios) {

    apontamentoFuncionarios.forEach(function(apontamentoFuncionario){

      setPretty(apontamentoFuncionario);
    });
  }

  setPretty = function(apontamento) {
    
    var expedienteObj = {};
    var codigoEscala = apontamento.funcionario.alocacao.turno.escala.codigo; 
    var jornadaArray = apontamento.funcionario.alocacao.turno.jornada.array; //varia de acordo com a escala
    var today = $scope.currentDate.getDay();

    //ANTES DE TUDO: verificar se é folga ou feriado...
    
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
        if(!apontamento.funcionario.alocacao.turno.isFlexivel){

          expedienteObj = checkExpediente(today, codigoEscala, jornadaArray, minutosTotaisMarcacao, apontamento.funcionario.alocacao.turno.tolerancia);
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

    //se não tiver marcações -> 
    else {
      expedienteObj = checkExpediente(today, codigoEscala, jornadaArray, false, false);
      apontamento.statusCodeString = expedienteObj.code;
      apontamento.statusString = expedienteObj.string;
      apontamento.statusImgUrl = expedienteObj.imgUrl;
    }

  }

  checkExpediente = function(today, codigoEscala, jornadaArray, valorComparacao, tolerancia) {
    
    console.log("################## CHECK EXPEDIENTE");
    console.log("today ", today);
    console.log("codigoEscala ", codigoEscala);
    console.log("jornadaArray", jornadaArray);
    console.log("valorComparacao", valorComparacao);
    console.log("tolerancia", tolerancia);
    //escala semanal
    if (codigoEscala == 1) {

      //Obtém a informação do DIA ATUAL na jornada do trabalhador
      var objDay = getDayInArrayJornadaSemanal(today, jornadaArray);
      console.log("ObjDay ", objDay);
      if (objDay.horarios) {

        //ENTRADA 1 para o DIA ATUAL
        var ENT1 = objDay.horarios.ent1;
        
        if (!valorComparacao){ //é o caso de saber se é o início do expediente
          //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
          var totalMinutesAtual = converteParaMinutosTotais($scope.currentDate.getHours(), 
          $scope.currentDate.getMinutes()); 

          if (totalMinutesAtual < ENT1) {
          
            console.log("Ainda não iniciou o expediente");
            return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "../img/bullet-blue.png"};

          } else {
            console.log("Já passou o tempo da 1a batida dele , então está ausente, ainda não bateu!");
            return {code: "AUS", string: "Ausente", imgUrl: "../img/bullet-red.png"};
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

  checkStatus = function() {
     
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