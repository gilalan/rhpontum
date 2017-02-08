angular.module('rhPontumApp').service("instituicaoAPI", function($http){

	var _urlBaseInstituicoes = '/api/instituicoes';
	var svc = this;	

	svc.get = function () {
		return $http.get(_urlBaseInstituicoes);
	};

	svc.getInstituicao = function(idInstituicao) {

		return $http.get(_urlBaseInstituicoes+'/'+idInstituicao);//, {
	      //headers: { 'X-Auth': token }
	    //});
	};

	svc.create = function (instituicao) {

		console.log("instituicao capturada do form: ", instituicao);
		return $http.post(_urlBaseInstituicoes, instituicao);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseInstituicoes+'/'+id);
	};

	svc.update = function (id) {

		return $http.put(_urlBaseInstituicoes + '/' + id);
	};

	svc.getCampiByInstituicao = function(id) {

		return $http.get(_urlBaseInstituicoes+'/'+id+'/campi')
	}
});