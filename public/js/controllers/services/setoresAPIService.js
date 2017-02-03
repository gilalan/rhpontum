angular.module('rhPontumApp').service("setoresAPI", function($http, config){

	var _urlBaseSetores = '/api/setores';
	var svc = this;

	svc.get = function () {
		
		return $http.get(_urlBaseSetores);
	};

	svc.create = function (setor) {
		
		return $http.post(_urlBaseSetores, setor);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseSetores + '/' + id);
	};

	svc.update = function (id) {

		return $http.put(_urlBaseSetores + '/' + id);
	};

	svc.getSetor = function(id) {

		return $http.get(_urlBaseSetores+'/'+id);
	};

	svc.getEquipesBySetor = function(id) {

		return $http.get(_urlBaseSetores+'/'+id+'/equipes');
	};
});