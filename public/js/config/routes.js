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
		access: 'public',
		accessLevel: 0		
	});

	$routeProvider.when("/home", {
		controller: "homeCtrl",
		//templateUrl: "view/dashboard.html",
		templateUrl: "view/indicadores.html",
		access: 'user',
		accessLevel: 1
	});


	$routeProvider.when("/dashboard", {
		controller: "dashboardCtrl",
		templateUrl: "view/dashboard.html",
		access: 'user',
		accessLevel: 1,
		resolve: {
			setores: function(setoresAPI){
				return setoresAPI.get();
			}
		}
	});

	$routeProvider.when("/indicadores", {
		controller: "indicadoresCtrl",
		templateUrl: "view/indicadores.html",
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			setores: function(setoresAPI){
				return setoresAPI.get();
			},
			usuario: function(usuariosAPI, Auth){
				return usuariosAPI.getUsuario(Auth.getCurrentUser()._id);
			},
			feriados: function(feriadosAPI){
				return feriadosAPI.get();
			},
			currentDate: function(apontamentosAPI) {
				return apontamentosAPI.getCurrentDate();
			}
		}
	});

	$routeProvider.when("/acc", {
		template: 'Test <uib-accordion></uib-accordion>',
		controller: "accCtrl"
		//templateUrl: "view/accordion.html"
	});

	$routeProvider.when('/instituicoes', {
		controller: 'instituicaoCtrl',
		templateUrl: 'view/instituicoes.html',
		access: 'admin',
		accessLevel: 4
	});

	$routeProvider.when('/campi', {
		controller: 'campiCtrl',
		templateUrl: 'view/campi.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			instituicoes: function(instituicaoAPI){
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/setores', {
		controller: 'setorCtrl',
		templateUrl: 'view/setores.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			campi: function(campiAPI){
				return campiAPI.get();
			}
		}
	});

	$routeProvider.when('/equipes', {
		controller: 'equipeCtrl',
		templateUrl: 'view/equipes.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			equipes: function(equipesAPI){
				return equipesAPI.get();
			}
		}
	});

	$routeProvider.when('/novaEquipe', {
		controller: 'novaEquipeCtrl',
		templateUrl: 'view/editEquipe.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			setores: function(setoresAPI) {
				return setoresAPI.get();
			},
			gestores: function(funcionariosAPI) {
				return funcionariosAPI.getGestores();
			}
		}
	});

	$routeProvider.when('/editEquipe/:id', {
		controller: 'editEquipeCtrl',
		templateUrl: 'view/editEquipe.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			equipe: function(equipesAPI, $route){
				return equipesAPI.getEquipe($route.current.params.id);
			},
			setores: function(setoresAPI) {
				return setoresAPI.get();
			},
			gestores: function(funcionariosAPI) {
				return funcionariosAPI.getGestores();
			}
		}
	});

	$routeProvider.when('/editarComponentes/:id', {
		controller: 'editarComponentesCtrl',
		templateUrl: 'view/editarComponentes.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			equipe: function(equipesAPI, $route){
				return equipesAPI.getEquipe($route.current.params.id);
			},
			funcionarios: function(funcionariosAPI) {
				return funcionariosAPI.get();
			}
		}
	});

	$routeProvider.when('/funcionarios', {
		controller: 'funcionarioCtrl',
		templateUrl: 'view/funcionarios.html',
		access: 'gestor',
		accessLevel: 3
	});

	$routeProvider.when('/novoFuncionario', {
		controller: 'novoFuncionarioCtrl',
		templateUrl: 'view/editFuncionario.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			cargos: function(cargosAPI){
				return cargosAPI.get();
			},
			turnos: function(turnosAPI){
				return turnosAPI.get();
			},
			instituicoes: function(instituicaoAPI) {
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/editFuncionario/:id', {
		controller: 'editFuncionarioCtrl',
		templateUrl: 'view/editFuncionario.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			funcionario: function(funcionariosAPI, $route){
				return funcionariosAPI.getFuncionario($route.current.params.id);
			},
			cargos: function(cargosAPI){
				return cargosAPI.get();
			},
			turnos: function(turnosAPI){
				return turnosAPI.get();
			},
			instituicoes: function(instituicaoAPI) {
				return instituicaoAPI.get();
			}
		}
	});

	$routeProvider.when('/associarFuncionario/:id', {
		controller: 'associarFuncionarioCtrl',
		templateUrl: 'view/associarFuncionario.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			funcionario: function(funcionariosAPI, $route){
				return funcionariosAPI.getFuncionario($route.current.params.id);
			},
			perfis: function(perfisAPI) {
				return perfisAPI.get();
			}
		}
	});

	$routeProvider.when('/registro_ponto/:id', {
		controller: 'regPontoCtrl',
		templateUrl: 'view/registro_ponto.html',
		access: 'user',
		accessLevel: 1,
		resolve: {
			usuario: function(usuariosAPI, $route){
				return usuariosAPI.getUsuario($route.current.params.id);
			},
			currentDate: function(apontamentosAPI) {
				return apontamentosAPI.getCurrentDate();
			}			
		}
	});

	$routeProvider.when("/register", {
		controller: "registerCtrl",
		templateUrl: "view/register.html",
		access: 'admin',
		accessLevel: 4
	});

	$routeProvider.when("/feriados", {
		controller: "feriadoCtrl",
		templateUrl: "view/feriados.html",
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			feriados: function(feriadosAPI) {
				return feriadosAPI.get();
			}
		}
	});

	$routeProvider.when('/novoFeriado', {
		controller: 'novoFeriadoCtrl',
		templateUrl: 'view/editFeriado.html',
		access: 'gestor',
		accessLevel: 3		
	});

	$routeProvider.when('/editFeriado/:id', {
		controller: 'editFeriadoCtrl',
		templateUrl: 'view/editFeriado.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			feriado: function(feriadosAPI, $route){
				return feriadosAPI.getFeriado($route.current.params.id);
			}
		}
	});

	$routeProvider.when("/turnos", {
		controller: "turnoCtrl",
		templateUrl: "view/turnos.html",
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			turnos: function(turnosAPI){
				return turnosAPI.get();
			}
		}
	});

	$routeProvider.when('/novoTurno', {
		controller: 'novoTurnoCtrl',
		templateUrl: 'view/editTurno.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			escalas: function(escalasAPI){
				return escalasAPI.get();
			}
		}
	});

	$routeProvider.when('/editTurno/:id', {
		controller: 'editTurnoCtrl',
		templateUrl: 'view/editTurno.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			turno: function(turnosAPI, $route){
				return turnosAPI.getTurno($route.current.params.id);
			},
			escalas: function(escalasAPI){
				return escalasAPI.get();
			}
		}
	});

	$routeProvider.when("/cargos", {
		controller: "cargoCtrl",
		templateUrl: "view/cargos.html",
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			cargos: function(cargosAPI){
				return cargosAPI.get();
			}
		}
	});

	$routeProvider.when('/novoCargo', {
		controller: 'novoCargoCtrl',
		templateUrl: 'view/editCargo.html',
		access: 'gestor',
		accessLevel: 3
	});

	$routeProvider.when('/editCargo/:id', {
		controller: 'editCargoCtrl',
		templateUrl: 'view/editCargo.html',
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			cargo: function(cargosAPI, $route){
				return cargosAPI.getCargo($route.current.params.id);
			}
		}
	});

	$routeProvider.when("/solicitacoes", {
		controller: "solicitacoesCtrl",
		templateUrl: "view/solicitacoes.html",
		access: 'gestor',
		accessLevel: 3,
		resolve: {
			solicitacoes: function(solicitacoesAPI) {
				return solicitacoesAPI.get();
			}
		}
	});

	$routeProvider.when("/criar-solicitacao", {
		controller: "editSolicitacaoCtrl",
		templateUrl: "view/editSolicitacao.html",
		access: 'user',
		accessLevel: 1
	});

	$routeProvider.when("/escalas", {
		controller: "escalaCtrl",
		templateUrl: "view/escalas.html",
		access: 'gestor',
		accessLevel: 3
	});

	$routeProvider.when("/error", {
		templateUrl: "view/error.html",
		access: 'public',
		accessLevel: 0
	});

	$routeProvider.when("/unauthorized", {
		controller: "unauthorizedCtrl",
		templateUrl: "view/unauthorized.html",
		access: 'public',
		accessLevel: 0
	});

	$routeProvider.otherwise({
		redirectTo: '/'
	});
}])

.run(['$rootScope', '$location', 'Auth', function($rootScope, $location, Auth){

	$rootScope.$on("$routeChangeStart", function(event, next, current){
		console.log('1. route change start: ');
		console.log('#current: ', current);
		console.log('#next: ', next);
		//current é de "onde veio", só aparece esse objeto se NÃO for o primeiro acesso
		if (current){
			console.log('2. current.access: ', current.access);
			if (current.originalPath == "/"){
				var regex = /registro_ponto/;
				if (regex.test(next.originalPath)){
					//console.log("opa, veio do login para o registro_ponto");
					Auth.setBatidaDireta(true);
					//current.resolve["batidaDireta"] = true;
				}
					
			}
			//console.log("2.0 current path", current.originalPath);
			//console.log("2.1 next path: ", next.originalPath);
		}

		//next.access pega essa variável definida na rota, que indica o nível de acesso a ela.
		//a gnt passa isso para um authorize(local) e verifica se ele pode entrar nessa rota.
		if(next){
			console.log('next.access: ', next.access);

			if (next.originalPath == "/" && Auth.getToken()){ //se estiver acessando a app na tela inicial mas tiver um token de log guardado, manda para a página principal
				console.log("página de login com o usuário já logado... encaminha para o dashboard");
				return $location.path("/dashboard");
			}

			if (next.accessLevel > 0) {

				if(!Auth.getToken()){
					console.log('usuário não logado e página necessita de nível de acesso: ', next.accessLevel);
					$rootScope.$broadcast('authorized', false);
					$rootScope.$broadcast('logged', true);
					$location.path('/');
				}

				else {
					$rootScope.$broadcast('logged', true);
					console.log("rota exigida: "+next.accessLevel+" e usuário logado, checar seu nível");
					if (Auth.authorize(next.accessLevel)){//veremos se o user tem o nivel de acesso permitido
						console.log('opa fui autorizado');
						console.log('deverá seguir o fluxo normal... controller e depois view');
						$rootScope.$broadcast('authorized', true);
					} else {
						console.log('vc não é autorizado a ver essa rota');
						$rootScope.$broadcast('authorized', false);
						$location.path('/unauthorized');
					}
				}
			} 
		}
			
	});    

}]);