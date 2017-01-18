angular.module('rhPontumApp').factory("timestampInterceptor", function(){

	return {
		request: function (config){
			
			var url = config.url;
			
			if (url.indexOf('view') > -1) 
				return config;
			
			var timestamp = new Date().getTime();
			//Burlar mecanismo de cache.
			//Cuidado para não ter problema com a queryString -> ?
			config.url = url + "?timestamp=" + timestamp;
			
			return config;
		}
	};
});