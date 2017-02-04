angular.module('rhPontumApp').service('escalasAPI', ['$http', function($http){

	var _urlBaseEscalas = '/api/escalas';
	var svc = this;

	svc.get = function() {

		return $http.get(_urlBaseEscalas);
	};

	svc.create = function (escala) {

		return $http.post(_urlBaseEscalas, escala);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseEscalas + '/' + id);
	};

	svc.update = function (id, escala) {

		return $http.put(_urlBaseEscalas + '/' + id, escala);
	};

	svc.getEscala = function(id) {

		return $http.get(_urlBaseEscalas+'/'+id);
	};
	
}]);