angular.module('rhPontumApp').factory('errorInterceptor', ["$q", "$location", function($q, $location){

	return {
		
		responseError: function(rejection){
			
			//page not found
			if (rejection.status === 404) {
				
				$location.path("/error");

			} else if (rejection.status === 401) {
				
				console.log(rejection.data.message);

			} else if (rejection.status === 500) {
				
				console.log(rejection.data.message);
			}

			return $q.reject(rejection);
		}
	};

}]);