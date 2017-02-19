angular.module('rhPontumApp')
	.factory('Auth', ['$localStorage', '$q', 'jwtHelper', 
		function($localStorage, $q, jwtHelper) {

	return {
		authorize: function(routerAccessLevel){

			var user = jwtHelper.decodeToken($localStorage.token);
			console.log("USUARIO OBTIDO NO AUTH ATRAVES DO DECODEJWT: ", user);
			console.log("ROTA NívelAcesso: ", routerAccessLevel);
			console.log("USUARIO NívelAcesso: ", user.acLvl);
			if (user.acLvl >= routerAccessLevel) {
				//se usuario tem acesso maior que a página demanda... ele está autorizado
				return true;
			} else {
				return false;
			}
		},
		setToken: function(token) {
			$localStorage.token = token;
		},
		getToken: function(){
			return $localStorage.token;
		},
		setCurrentUser: function(user) {
			//var user = jwtHelper.decodeToken(getToken());
			//console.log()
		},
		getCurrentUser: function() {
			var user = jwtHelper.decodeToken($localStorage.token);
			return user;
		},
		logout: function(){
			delete $localStorage.token;
			$q.when();
		}
	}
}]);