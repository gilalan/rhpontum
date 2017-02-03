angular.module('rhPontumApp').service('apontamentosAPI', function($http) {

	var _urlBaseApontamentos = '/api/apontamentos';
	var svc = this;

	svc.get = function() {

		return $http.get(_urlBaseApontamentos);
	};

	svc.create = function (apontamento) {

		return $http.post(_urlBaseApontamentos, apontamento);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseApontamentos + '/' + id);
	};

	svc.update = function (id, apontamento) {

		return $http.put(_urlBaseApontamentos + '/' + id, apontamento);
	};

	svc.getApontamento = function(id) {

		return $http.get(_urlBaseApontamentos+'/'+id);
	};

	svc.getApontamentosByDate = function(date) {

		return $http.post(_urlBaseApontamentos+'/date', date);
	};

	svc.getApontamentosByDateAndEquipe = function(objDateEquipe) {

		return $http.post(_urlBaseApontamentos+'/date/equipe', objDateEquipe);
	};
});