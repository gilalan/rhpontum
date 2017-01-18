angular.module('rhPontumApp').service('apontamentosAPI', function($http) {

	var _urlBaseApontamentos = '/api/apontamentos';

	this.get = function() {

		return $http.get(_urlBaseApontamentos);
	};

	this.save = function (apontamento) {

		return $http.post(_urlBaseApontamentos, apontamento);
	};

	this.delete = function (id) {

		return $http.delete(_urlBaseApontamentos + id);
	};

});