angular.module('rhPontumApp').config(function($routeProvider){
	
	$routeProvider.when("/", {
		controller: "loginCtrl",
		templateUrl: "view/login.html"
	});

	$routeProvider.when("/dashboard", {
		controller: "dashboardCtrl",
		templateUrl: "view/dashboard.html"
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
});