angular.module('rhPontumApp').service('cargosAPI', ['$http', function($http){

	var _urlBaseCargos = '/api/cargos';
	var svc = this;

	svc.get = function() {

		return $http.get(_urlBaseCargos);
	};

	svc.create = function (cargo) {

		return $http.post(_urlBaseCargos, cargo);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseCargos + '/' + id);
	};

	svc.update = function (cargo) {

		return $http.put(_urlBaseCargos + '/' + cargo._id, cargo);
	};

	svc.getCargo = function(id) {

		return $http.get(_urlBaseCargos+'/'+id);
	};
}]);