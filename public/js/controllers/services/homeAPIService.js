angular.module('rhPontumApp').service("homeAPI", function($http, config){

	var _urlBaseHome = '/home';

	this.get = function () {
		
		return $http.get(_urlBaseHome);
	};	
});