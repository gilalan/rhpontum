angular.module('rhPontumApp').service("funcionariosAPI", function($http, config){

	var _urlBaseFuncionarios = '/api/funcionarios';

	this.get = function () {
		
		return $http.get(config.baseUrl + _urlBaseFuncionarios);
	};

	this.save = function (funcionario) {
		
		return $http.post(_urlBaseFuncionarios, funcionario);
	};

	this.delete = function (id) {

		return $http.delete(_urlBaseFuncionarios + id);
	};
});