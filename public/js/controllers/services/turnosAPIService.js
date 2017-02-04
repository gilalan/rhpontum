angular.module('rhPontumApp').service('turnosAPI', ['$http', function($http){

	var _urlBaseTurnos = '/api/turnos';
	var svc = this;

	svc.get = function() {

		return $http.get(_urlBaseTurnos);
	};

	svc.create = function (turno) {

		return $http.post(_urlBaseTurnos, turno);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseTurnos + '/' + id);
	};

	svc.update = function (turno) {

		return $http.put(_urlBaseTurnos + '/' + turno._id, turno);
	};

	svc.getTurno = function(id) {

		return $http.get(_urlBaseTurnos+'/'+id);
	};
	
}]);