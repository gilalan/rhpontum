angular.module('rhPontumApp').service('utilsAPI', ['$http', function($http){

	var _urlBaseUtils = '/api/utils';
	var svc = this;

	svc.getCurrentDate = function() {

		return $http.get(_urlBasePerfis);
	};

	svc.create = function (perfil) {

		return $http.post(_urlBasePerfis, perfil);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBasePerfis + '/' + id);
	};

	svc.update = function (perfil) {

		return $http.put(_urlBasePerfis + '/' + perfil._id, perfil);
	};

	svc.getPerfil = function(id) {

		return $http.get(_urlBasePerfis+'/'+id);
	};
	
}]);