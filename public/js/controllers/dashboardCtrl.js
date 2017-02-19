angular.module('rhPontumApp').controller('dashboardCtrl', ["$scope", "$filter", "setores", "setoresAPI", "equipesAPI", "funcionariosAPI", "apontamentosAPI",   
	function($scope, $filter, setores, setoresAPI, equipesAPI, funcionariosAPI, apontamentosAPI){

	console.log("ENTRANDO NO DASHBOARD CTRL", setores);
	//$scope.funcionarios = funcionarios.data;
	$scope.setores = setores.data;
	$scope.dataInicial = $filter('date')(new Date(), 'dd/MM/yyyy');
	$scope.dataFinal = $filter('date')(new Date(), 'dd/MM/yyyy');
	$scope.equipesMap = new Map();
	$scope.funcionariosMap = new Map();
	$scope.apontamentoStatusStr = {statusString: "Nenhum ponto"};
	$scope.dateApontamentosFuncionarioMap = new Map();
	
	/* 
	TODO : AJEITAR O CASO QUANDO NÃO TEM DADOS PARA VISUALIZAR NOS PONTOS!
	O SISTEMA CONSTROI AS DATAS COM A TABLE VAZIA E ISSO É FEIO DO PONTO DE VISTA DE DESIGN
	*/

	$scope.getEquipes = function(setorId){
		
		if(setorId){
			if (!$scope.equipesMap.get(setorId)) {
				console.log('getEquipes!!: ');
				setoresAPI.getEquipesBySetor(setorId).then(function sucessCallback(response){

					$scope.equipesMap.set(setorId, response.data);

				}, function errorCallback(response){

					$scope.errorMsg = response.data.message;
				});
			}
		}
	};

	$scope.getFuncionariosByEquipe = function (equipeId) {

		if (equipeId) {

			if (!$scope.funcionariosMap.get(equipeId)) {
				console.log('get funcionarios!!');
				//equipesAPI.getFuncionariosByEquipe(equipeId).then(function sucessCallback(response){
				equipesAPI.getEquipe(equipeId).then(function sucessCallback(response){
					
					console.log("response data Objeto Equipe Completo", response.data);
					var equipeCompleta = response.data;
					$scope.funcionariosMap.set(equipeId, equipeCompleta.componentes);					

				}, function errorCallback(response){

					$scope.errorMsg = response.data.message;
				});
			}

		}
	}

	//Conjunto de funcionários de uma equipe
	getApontamentosByFuncionarios = function(arrayFuncionarios, dataInicial, dataFinal){

		console.log("array de funcionários ", arrayFuncionarios);

		$scope.rangeDate = getArrayRangeDate(dataInicial, dataFinal);

		$scope.rangeDate.forEach(function(date){

			getApontamentosByDateAndEquipe(date, arrayFuncionarios);
		});
	}

	//recupera apontamentos de todos os funcionários desta data
	getApontamentosByDateAndEquipe = function(date, equipe) {

		var objDateEquipe = {dataInicial: date, equipe: equipe};

		apontamentosAPI.getApontamentosByDateAndEquipe(objDateEquipe).then(function sucessCallback(response){
			
			console.log('data enviada', date);
			console.log('arrayapontamentos por data', response.data);

			var apontamentoFunc = response.data;
			createPrettyStringResults(apontamentoFunc);
			$scope.dateApontamentosFuncionarioMap.set(date, apontamentoFunc);

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro na obtenção do apontamento diário: " + response.data.message);
		});		
	}	

	Date.prototype.addDays = function(currentDate, days) {
	  
	  var dat = new Date(this.valueOf());
	  dat.setDate(dat.getDate() + days);
	  return dat;
	}

	getArrayRangeDate = function (startDate, endDate, interval) {
		
		var interval = interval || 1;
		var retVal = [];
		var current = new Date(startDate);

		while (current <= endDate) {
		  retVal.push(new Date(current));
		  current = current.addDays(current, interval);
		}

		console.log('rangeDate calculado:', retVal);
		return retVal;
	}

	showApontamentos = function() {

		if (apontamentosArray.length > 0){

			//var apontamento = response.data[0];
			apontamentosArray.forEach()
			setPretty(apontamento);
		}
	}

	createPrettyStringResults = function(apontamentoFuncionarios) {

		apontamentoFuncionarios.forEach(function(apontamentoFuncionario){

			setPretty(apontamentoFuncionario);
		});
	}

	setPretty = function(apontamento) {

		apontamento.statusString = "Nenhum ponto";

		if (apontamento.marcacoes) {
						
			if (apontamento.marcacoes.length > 0 && apontamento.marcacoes.length < 4)
				apontamento.statusString = "Em andamento";				

			else if (apontamento.marcacoes.length === 4)
				apontamento.statusString = "OK";

			var StrMarc = "";
			apontamento.marcacoes.forEach(function(marcacao){
				
				var hora = $filter('zpad')(marcacao.hora);
				var minuto = $filter('zpad')(marcacao.minuto);

				if (marcacao.descricao == "ent1") {
					StrMarc +=  hora + ":" + minuto + " - ";						
				} else if (marcacao.descricao == "sai2") {
					StrMarc += hora + ":" + minuto;
				}
			});
			apontamento.marcacaoString = StrMarc;
		}
	}

	fixDateFormat = function(data) {
				
		var regex = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/;

		if (regex.test(data)){
			if(data.length === 10) {
				var dateArray = data.split("/");
				return new Date(dateArray[2], dateArray[1]-1, dateArray[0]).getTime();
			}
		} 

		return data;
	}

	$scope.getApontamentosByFilter = function(setorId, equipeId, dataInicial, dataFinal){
		
		//check date format
		console.log('data entrada: ', dataInicial);
		dataInicial = fixDateFormat(dataInicial); 
		console.log('data entrada: ', dataInicial);
		console.log('data final: ', dataFinal);
		dataFinal = fixDateFormat(dataFinal);	
		console.log('data final: ', dataFinal);	

		var criteriosBusca = {
			setor: setorId,
			equipe: equipeId,
			dataInicial: dataInicial,
			dataFinal: dataFinal
		}

		getApontamentosByFuncionarios($scope.funcionariosMap.get(equipeId), dataInicial, dataFinal);
		
	}

	//Pode criar uma regra para trazer o setor/equipe de preferência sempre q entrar nessa tela
	//Ex.: Gestor clica na tela -> pega equipes do gestor e seleciona a primeira para mostrar de cara
}]);
