angular.module('rhPontumApp').controller('regPontoCtrl', ['$scope', '$rootScope', '$filter', 'apontamentosAPI', 'funcionariosAPI', 
	function($scope, $rootScope, $filter, apontamentosAPI, funcionariosAPI){

	$scope.usuario = $rootScope.currentUser;
	$scope.funcionario = $scope.usuario.funcionario;
	$scope.currentDate = new Date();
	//$scope.currentDate = new Date(2017, 0, 31); //testessss
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

	$scope.registro = function() {
		
		var newDate = new Date();
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
			$scope.update(apontamento._id, apontamento);

		} else {

			apontamento = {
				data: newDate,
				status: {id: 0, descricao: 'Correto'},
				funcionario: $scope.funcionario._id,
				marcacoes: [marcacao],
				justificativa: ''
			};
			$scope.create(apontamento);
		}
	}	

	$scope.create = function(apontamento) {

		apontamentosAPI.create(apontamento).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			var dateStr = $filter('date')(response.data.obj.date, "dd/MM/yyyy");
			var hora = $filter('zpad')(marcacao.hora);
			var minuto = $filter('zpad')(marcacao.minuto);
			$scope.successMsg = response.data.obj.message + dateStr + ", às " + hora + ":" + minuto;			
			alert($scope.successMsg);

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de registro: " + response.data.message);
			
		});	
	}

	$scope.update = function(id, apontamento) {

		apontamentosAPI.update(id, apontamento).then(function sucessCallback(response){

			console.log("dados recebidos: ", response.data);
			var dateStr = $filter('date')(response.data.obj.date, "dd/MM/yyyy");
			var hora = $filter('number')(marcacao.hora);
			var minuto = $filter('number')(marcacao.minuto);
			$scope.successMsg = response.data.obj.message + dateStr + ", às " + hora + ":" + minuto;
			alert($scope.successMsg);

		}, function errorCallback(response){
			
			$scope.errorMsg = response.data.message;
			console.log("Erro de update: " + response.data.message);
			
		});	
	}

	getApontamentoDiarioFromFuncionario();

}]);
