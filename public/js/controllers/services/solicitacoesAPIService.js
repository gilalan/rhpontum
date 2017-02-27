angular.module('rhPontumApp').service('solicitacoesAPI', ['$http', function($http){

	var _urlBaseSolicitacoes = '/api/solicitacoes';
	var svc = this;

	svc.get = function() {

		return $http.get(_urlBaseSolicitacoes);
	};

	svc.create = function (solicitacao) {

		return $http.post(_urlBaseSolicitacoes, solicitacao);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseSolicitacoes + '/' + id);
	};

	svc.update = function (solicitacao) {

		return $http.put(_urlBaseSolicitacoes + '/' + solicitacao._id, solicitacao);
	};

	svc.getSolicitacao = function(id) {

		return $http.get(_urlBaseSolicitacoes+'/'+id);
	};
	
}]);