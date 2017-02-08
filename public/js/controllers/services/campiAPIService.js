angular.module('rhPontumApp').service("campiAPI", function($http){

	var _urlBaseCampi = '/api/campi';
	var svc = this;	

	svc.get = function () {
		return $http.get(_urlBaseCampi);
	};

	svc.getCampus = function(id) {

		return $http.get(_urlBaseCampi+'/'+id);//, {
	      //headers: { 'X-Auth': token }
	    //});
	};

	svc.create = function (campus) {

		console.log("campus capturada do form: ", campus);
		return $http.post(_urlBaseCampi, campus);
	};

	svc.delete = function (id) {

		return $http.delete(_urlBaseCampi+'/'+id);
	};

	svc.update = function (id) {

		return $http.put(_urlBaseCampi + '/' + id);
	};

	svc.getSetoresByCampus = function(id) {

		return $http.get(_urlBaseCampi + '/' + id + "/setores")
	}
});