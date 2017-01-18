angular.module('rhPontumApp')
.factory('sessionInjectorInterceptor', ['sessionAPIService', function(sessionAPIService)){

	return {
		request: function(config){
			if (!sessionAPIService.isAnonymus) {
				config.headers['x-auth'] = sessionAPIService.token;
			}
			return config;
		}
	};
}]);