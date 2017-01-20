angular.module('rhPontumApp')
.factory('sessionInjectorInterceptor', ['$q', '$location', '$localStorage', 
	function($q, $location, $localStorage){

	return {
		request: function(config){

			var url = config.url;
			
			if (url.indexOf('view') > -1) 
				return config;

			//melhor checar se há um usuário logado antes de pegar no localStorage
			//se o usuario der refresh, perdemeos a informacao do usuário logado na memoria e recuperamos do localStorage
			if ($localStorage.token) {
				console.log('interceptorInjectorSession, injetando token');
				config.headers['X-Auth'] = $localStorage.token;
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