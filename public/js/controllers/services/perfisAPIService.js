angular.module('rhPontumApp').service('perfisAPI', ['$http', function($http){

	var _urlBasePerfis = '/api/perfis';
	var svc = this;

	svc.get = function() {

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