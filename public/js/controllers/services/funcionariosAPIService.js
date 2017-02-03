angular.module('rhPontumApp').service("funcionariosAPI", function($http, config){

	var _urlBaseFuncionarios = '/api/funcionarios';
	var svc = this;

	svc.get = function () {
		
		return $http.get(config.baseUrl + _urlBaseFuncionarios);
	};

	svc.create = function (funcionario) {
		
		return $http.post(_urlBaseFuncionarios, funcionario);
	};

	svc.update = function (funcionario) {

		return $http.put(_urlBaseFuncionarios + '/' + funcionario._id, funcionario);
	};
	
	svc.delete = function (id) {

		return $http.delete(_urlBaseFuncionarios + '/' + id);
	};

	svc.getFuncionario = function(id) {

		return $http.get(_urlBaseFuncionarios+'/'+id);
	};

	svc.getUsuarioByFuncionario = function(id) {

		return $http.get(_urlBaseFuncionarios+'/'+id+'/usuario');
	};

	svc.getPeriodoApontamentoByFuncionario = function(id, rangeDate) {

		return $http.post(_urlBaseFuncionarios+'/'+id+'/apontamentoRange', rangeDate);
	};
	
});