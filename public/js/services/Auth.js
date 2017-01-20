angular.module('rhPontumApp')
	.factory('Auth', ['$http', '$rootScope', function($http, $rootScope) {

	return {
		authorize: function(routerAccessLevel){
			if(routerAccessLevel === 'user'){
				console.log('user = rota de acesso');
			}
			return true;//to sempre retornando que ele está autorizado para testes
		}
	}
}]);