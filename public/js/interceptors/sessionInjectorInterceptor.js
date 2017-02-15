angular.module('rhPontumApp')
.factory('sessionInjectorInterceptor', ['$q', '$location', 'Auth', 
	function($q, $location, Auth){

	return {
		request: function(config){

			var url = config.url;
			
			if (url.indexOf('view') > -1) 
				return config;

			//melhor checar se há um usuário logado antes de pegar no localStorage
			//se o usuario der refresh, perdemeos a informacao do usuário logado na memoria e recuperamos do localStorage
			var currentToken = Auth.getToken();
			if (currentToken) {
				console.log('interceptorInjectorSession, injetando token no HEADER', currentToken);
				config.headers['X-Auth'] = currentToken;
			}
			return config;
		},
		responseError: function(response){
			if (response.status === 401 || response.status === 403){
				//$rootScape.$broadcast('unauthorized') ???
				$location.path('/');
			}
			return $q.reject(response);
		}
	};
}]);