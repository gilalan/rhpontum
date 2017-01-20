angular.module('rhPontumApp').config(['$routeProvider', function($routeProvider){
	
	/*accessLevel => 
	 *{
	   0: public,
	   1: colaborador,
	   2: fiscal,
	   3: gestor,
	   4: admin 
	 *}
	 */
	$routeProvider.when("/", {
		controller: "loginCtrl",
		templateUrl: "view/login.html",
		access: 'public'		
	});

	$routeProvider.when("/dashboard", {
		controller: "dashboardCtrl",
		templateUrl: "view/dashboard.html",
		access: 'user'
	});

	$routeProvider.when('/about', {
		controller: 'aboutCtrl',
		templateUrl: 'view/about.html'
	});

	$routeProvider.when('/contato', {
		controller: 'contatoCtrl',
		templateUrl: 'view/contato.html'
	});

	$routeProvider.when('/funcionarios', {
		controller: 'funcionarioCtrl',
		templateUrl: 'view/funcionarios.html'
	});

	$routeProvider.when("/register", {
		controller: "registerCtrl",
		templateUrl: "view/register.html"
	});

	$routeProvider.when("/error", {
		templateUrl: "view/error.html"
	});

	$routeProvider.when("/unauthorized", {
		templateUrl: "view/unauthorized.html"
	});

	$routeProvider.otherwise({
		redirectTo: '/'
	});
}])

.run(['$rootScope', '$location', 'Auth', function($rootScope, $location, Auth){

	$rootScope.$on("$routeChangeStart", function(event, next, current){
		console.log('route change start: ');
		
		if (current)
			console.log('current.access: '+ current.access);

		//next.access pega essa variável definida na rota, que indica o nível de acesso a ela.
		//a gnt passa isso para um authorize(local) e verifica se ele pode entrar nessa rota.
		if(next)
			console.log('next.access: '+ next.access);
			if(Auth.authorize(next.access)){
				console.log('opa fui autorizado');
				console.log('deverá seguir o fluxo normal eu acho');
			} else {
				console.log('vc não é autorizado a ver essa rota');
				$location.path('/');
			}
			
	});

}]);