angular.module('rhPontumApp').service('equipesAPI', ['$http', function($http){

	var _urlBaseEquipes = '/api/equipes';
	var svc = this;	

	svc.get = function () {
		return $http.get(_urlBaseEquipes);
	};

	svc.create = function (equipe) {

		console.log("equipe capturada do form: ", equipe);
		return $http.post(_urlBaseEquipes, equipe);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseEquipes+'/'+id);
	};

	svc.update = function (id) {

		return $http.put(_urlBaseEquipes + '/' + id);
	};

	svc.getEquipe = function(id) {

		return $http.get(_urlBaseEquipes+'/'+id);
	};

	svc.getFuncionariosByEquipe = function(id) {

		return $http.get(_urlBaseEquipes + '/' + id + '/funcionarios');
	};

}]);