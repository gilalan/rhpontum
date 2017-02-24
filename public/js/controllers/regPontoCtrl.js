angular.module('rhPontumApp').controller('regPontoCtrl', ['$scope', '$filter', '$interval', '$mdDialog', 'Auth', 'apontamentosAPI', 'funcionariosAPI', 'usuario', 'currentDate',
	function($scope, $filter, $interval, $mdDialog, Auth, apontamentosAPI, funcionariosAPI, usuario, currentDate){
	
	$scope.funcionario = usuario.data.funcionario;
	$scope.currentDate = currentDate.data.date; //obtendo data do servidor
	$scope.currentDateFtd = $filter('date')($scope.currentDate, 'abvFullDate');
	//$scope.currentDate = new Date(2017, 0, 31); //testessss
	
	var secsControl = 0;
	var apontamento = null;
	var marcacao = null;
	
	getApontamentoDiarioFromFuncionario = function() {
		
		var date = {dataInicial: $scope.currentDate};

		funcionariosAPI.getPeriodoApontamentoByFuncionario($scope.funcionario._id, date).then(function sucessCallback(response){

			console.log('apontamento diário:', response.data);
			if (response.data.length > 0)
				apontamento = response.data[0];

		}, function errorCallback(response){

			$scope.errorMsg = response.data.message;
			console.log("Erro na obtenção do apontamento diário: " + response.data.message);

		});
	}

	getId = function(array) {
		return (array.length + 1);
	}

	getDescricao = function(array){
		
		if (array.length === 0)
			return "ent1";
		else if (array.length === 1)
			return "sai1";
		else if (array.length === 2)
			return "ent2";
		else if (array.length === 3)
			return "sai2";
		else { //verificar quantos pares de entrada/saida já foram adicionados para gerar a descricao
			if (array.length % 2 === 0) {//se é par
				return "ent" + ( (array.length/2) + 1);
			} else {
				return "sai" + (Math.floor(array.length/2) + 1);
			}
		}
		
	}

	create = function(apontamento, ev) {

		apontamentosAPI.create(apontamento).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			var dateStr = $filter('date')(response.data.obj.date, "dd/MM/yyyy");
			var hora = $filter('zpad')(marcacao.hora);
			var minuto = $filter('zpad')(marcacao.minuto);
			$scope.successMsg = response.data.obj.message + dateStr + ", às " + hora + ":" + minuto;
			confirmDialogRegister(ev, dateStr, hora, minuto);

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});	
	}

	update = function(id, apontamento, ev) {

		apontamentosAPI.update(id, apontamento).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			var dateStr = $filter('date')(response.data.obj.date, "dd/MM/yyyy");
			var hora = $filter('number')(marcacao.hora);
			var minuto = $filter('number')(marcacao.minuto);
			$scope.successMsg = response.data.obj.message + dateStr + ", às " + hora + ":" + minuto;
			confirmDialogRegister(ev, dateStr, hora, minuto);

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de update: " + response.data.message);
			
		});	
	}

	confirmDialogRegister = function(ev, date, hora, minuto) {

		var objectDlg = {
			funcionario: $scope.funcionario,
			successMsg: $scope.successMsg,
			date: date,
			hora: hora,
			minuto: minuto
		}

		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: 'view/dialog/batidaPonto.tmpl.html', //se passar caminho errado, ele buga dizendo que tentou carregar o angular mais de uma vez
	      locals: {
	      	objectDlg: objectDlg
	      },
	      //parent: angular.element(document.body),
	      parent: angular.element(document.querySelector('#popupContainer')),
	      targetEvent: ev,
	      clickOutsideToClose:true,
	      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	      console.log("$scope.status: ", $scope.status);
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	      console.log("$scope.status: ", $scope.status);
	    });
	}

	$scope.registro = function(ev) {
		
		apontamentosAPI.getCurrentDate().then(function sucessCallback(response){

			var newDate = new Date(response.data.date);
			var gId = (apontamento) ? getId(apontamento.marcacoes) : 1;
			var descricao = (apontamento) ? getDescricao(apontamento.marcacoes) : "ent1";

			marcacao = {
				id: gId,
				descricao: descricao,
				hora: newDate.getHours(),
				minuto: newDate.getMinutes(),
				segundo: newDate.getSeconds(),
				gerada: {}
			};

			if (apontamento) {
				
				apontamento.marcacoes.push(marcacao);
				update(apontamento._id, apontamento, ev);

			} else {

				apontamento = {
					data: getOnlyDate(newDate),
					status: {id: 0, descricao: 'Correto'},
					funcionario: $scope.funcionario._id,
					marcacoes: [marcacao],
					justificativa: ''
				};
				create(apontamento, ev);
			}

		}, function errorCallback(response) {

			$scope.errorMsg = "Erro ao obter a data do servidor, tente novamente dentro de alguns segundos";
			console.log("Erro de registro: " + response.data.message);

		});
	}

	$scope.showAlert = function(ev) {
		
		//confirmDialogRegister(ev, '12/05/2017', '10', '45');
	}

	getOnlyDate = function (date) {
		console.log("date antes: ", date);
		var data = angular.copy(date);
		data.setHours(0,0,0,0); //essa data é importante zerar os segundos para que não tenha inconsistência na base
		console.log("date depois: ", data);
		return data;
	}	

	var tick = function() {
	    //$scope.clock = Date.now();//atualiza os segundos manualmente
	    var clock = new Date($scope.currentDate);
	    clock.setSeconds(clock.getSeconds() + secsControl);
	    $scope.clock = clock;
	    secsControl++;
  	}
	
    init = function() {
    	
		if ($scope.funcionario)
			getApontamentoDiarioFromFuncionario();
		else
			$scope.usuario = usuario.data;
	
		tick();
		$interval(tick, 1000);		
    }

    //INICIALIZA O CONTROLLER COM ALGUMAS VARIÁVEIS
    init();

    function DialogController($scope, $mdDialog, objectDlg) {
	    
	    $scope.batidaInfo = objectDlg;
    	console.log("$scope.objectDlg", objectDlg);

	    $scope.hide = function() {
	      $mdDialog.hide();
	    };

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.answer = function(answer) {
	      $mdDialog.hide(answer);
	    };
	}
}]);
