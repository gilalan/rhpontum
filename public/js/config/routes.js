angular.module('rhPontumApp').config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	
	/*accessLevel => 
	 *{
	   0: public,
	   1: colaborador,
	   2: fiscal,
	   3: gestor,
	   4: admin 
	 *}
	 */
	$locationProvider.html5Mode(true);

	$routeProvider.when("/", {
		controller: "loginCtrl",
		templateUrl: "view/login.html",
		access: 'public'		
	});

	$routeProvider.when("/home", {
		controller: "homeCtrl",
		templateUrl: "view/dashboard.html",
		access: 'user'		
	});


	$routeProvider.when("/dashboard", {
		controller: "dashboardCtrl",
		templateUrl: "view/dashboard.html",
		access: 'user',
		resolve: {
			setores: function(setoresAPI){
				return setoresAPI.get();
			}
		}
	});

	$routeProvider.when('/instituicoes', {
		controller: 'instituicaoCtrl',
		templateUrl: 'view/instituicoes.html',
		access: 'admin'
	});

	$routeProvider.when('/campi', {
		controller: 'campiCtrl',
		templateUrl: 'view/campi.html',
		resolve: {
			instituicoes: function(instituicaoAPI){
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/setores', {
		controller: 'setorCtrl',
		templateUrl: 'view/setores.html',
		resolve: {
			campi: function(campiAPI){
				return campiAPI.get();
			}
		}
	});

	$routeProvider.when('/equipes', {
		controller: 'equipeCtrl',
		templateUrl: 'view/equipes.html',
		resolve: {
			setores: function(setoresAPI){
				return setoresAPI.get();
			}
		}
	});

	$routeProvider.when('/novaEquipe', {
		controller: 'novaEquipeCtrl',
		templateUrl: 'view/novaEquipe.html'
	});

	$routeProvider.when('/editEquipe/:id', {
		controller: 'editEquipeCtrl',
		templateUrl: 'view/editEquipe.html',
		resolve: {
			funcionarios: function(funcionariosAPI, $route){
				return funcionariosAPI.getFuncionario($route.current.params.id);
			}
		}
	});

	$routeProvider.when('/funcionarios', {
		controller: 'funcionarioCtrl',
		templateUrl: 'view/funcionarios.html'
	});

	$routeProvider.when('/novoFuncionario', {
		controller: 'novoFuncionarioCtrl',
		templateUrl: 'view/editFuncionario.html',
		resolve: {
			setores: function(setoresAPI){
				return setoresAPI.get();
			},
			instituicoes: function(instituicaoAPI) {
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/editFuncionario/:id', {
		controller: 'editFuncionarioCtrl',
		templateUrl: 'view/editFuncionario.html',
		resolve: {
			funcionario: function(funcionariosAPI, $route){
				return funcionariosAPI.getFuncionario($route.current.params.id);
			},
			setores: function(setoresAPI){
				return setoresAPI.get();
			},
			instituicoes: function(instituicaoAPI) {
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/associarFuncionario/:id', {
		controller: 'associarFuncionarioCtrl',
		templateUrl: 'view/associarFuncionario.html',
		resolve: {
			funcionario: function(funcionariosAPI, $route){
				return funcionariosAPI.getFuncionario($route.current.params.id);
			}
		}
	});

	$routeProvider.when('/registro_ponto', {
		controller: 'regPontoCtrl',
		templateUrl: 'view/registro_ponto.html'
	});

	$routeProvider.when("/register", {
		controller: "registerCtrl",
		templateUrl: "view/register.html"
	});

	$routeProvider.when("/feriados", {
		controller: "feriadoCtrl",
		templateUrl: "view/feriados.html",
		resolve: {
			feriados: function(feriadosAPI) {
				return feriadosAPI.get();
			}
		}
	});

	$routeProvider.when('/novoFeriado', {
		controller: 'novoFeriadoCtrl',
		templateUrl: 'view/editFeriado.html'		
	});

	$routeProvider.when('/editFeriado/:id', {
		controller: 'editFeriadoCtrl',
		templateUrl: 'view/editFeriado.html',
		resolve: {
			feriado: function(feriadosAPI, $route){
				return feriadosAPI.getFeriado($route.current.params.id);
			}
		}
	});

	$routeProvider.when("/turnos", {
		controller: "turnoCtrl",
		templateUrl: "view/turnos.html",
		resolve: {
			turnos: function(turnosAPI){
				return turnosAPI.get();
			}
		}
	});

	$routeProvider.when('/novoTurno', {
		controller: 'novoTurnoCtrl',
		templateUrl: 'view/editTurno.html',
		resolve: {
			escalas: function(escalasAPI){
				return escalasAPI.get();
			}
		}
	});

	$routeProvider.when('/editTurno/:id', {
		controller: 'editTurnoCtrl',
		templateUrl: 'view/editTurno.html',
		resolve: {
			turno: function(turnosAPI, $route){
				return turnosAPI.getTurno($route.current.params.id);
			},
			escalas: function(escalasAPI){
				return escalasAPI.get();
			}
		}
	});

	$routeProvider.when("/escalas", {
		controller: "escalaCtrl",
		templateUrl: "view/escalas.html"
	});

	$routeProvider.when("/error", {
		templateUrl: "view/error.html"
	});

	$routeProvider.when("/unauthorized", {
		templateUrl: "view/unauthorized.html"
	});

	$routeProvider.otherwise({
		redirectTo: '/dashboard'
	});
}])

.run(['$rootScope', '$location', 'Auth', function($rootScope, $location, Auth){

	$rootScope.$on("$routeChangeStart", function(event, next, current){
		console.log('1. route change start: ');
		
		//current é de "onde veio", só aparece esse objeto se NÃO for o primeiro acesso
		if (current)
			console.log('2. current.access: ', current.access);

		//next.access pega essa variável definida na rota, que indica o nível de acesso a ela.
		//a gnt passa isso para um authorize(local) e verifica se ele pode entrar nessa rota.
		if(next)
			console.log('next.access: ', next.access);
			if(Auth.authorize(next.access)){
				console.log('opa fui autorizado');
				console.log('deverá seguir o fluxo normal eu acho');
			} else {
				console.log('vc não é autorizado a ver essa rota');
				$location.path('/');
			}
			
	});    

}]);