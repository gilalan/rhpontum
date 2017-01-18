
angular.module('rhPontumApp').controller('funcionarioCtrl', function($scope, funcionariosAPI){
    
    // get funcionarios
    var obterFuncionarios = function() {

        funcionariosAPI.get().then(function sucessCallback(response){

            $scope.funcionarios = response.data;
            $scope.setores = [{
                nome: "Ciências Biológicas",
                descricao: "Setor responsável pelo curso de ciências biológicas e biologia",
                campusId: {nome: "Campus Juazeiro"}
            },
            {
                nome: "TI e Comunicação",
                descricao: "Setor responsável pelos cursos de Tecnologia da Informação",
                campusId: {nome: "Campus Juazeiro"}
            },
            {
                nome: "RH",
                descricao: "Setor responsável pelo RH",
                campusId: {nome: "Campus Juazeiro"}
            },
            {
                nome: "Administração",
                descricao: "Setor responsável pelos cursos de Administração",
                campusId: {nome: "Campus Juazeiro"}
            },
            {
                nome: "Vigilância e Marítimo",
                descricao: "Setor responsável pela Vigilância e atividades marítimas",
                campusId: {nome: "Campus Juazeiro"}
            }
            ];
            $scope.equipes = [{
                _id: 982183618723,
                nome: "Equipe Botânica",
                gestor: {nome: "Josemar Filho", PIS: "0971236"},
                componentes: ["Josemar Filho", "Marcelo Guimarães", "Joana Bezerra"],
                setor: {
                    nome: "Ciências Biológicas",
                    descricao: "Setor responsável pelo curso de ciências biológicas e biologia",
                    campusId: {nome: "Campus Juazeiro"}
                }
            },
            {
                _id: 982181558723,
                nome: "Equipe Exploração",
                gestor: {nome: "Joana Bezerra", PIS: "0975556"},
                componentes: ["Joana Bezerra", "Kátia Lucena", "Miguel Avelino"],
                setor: {
                    nome: "Ciências Biológicas II",
                    descricao: "Setor responsável pelo curso de ciências biológicas e biologia",
                    campusId: {nome: "Campus Juazeiro"}
                }
            }
            ];
            //console.log(response.data);

        }, function errorCallback(response){
            console.log('Error: ' + response.data);
        });        
       
    };

    // when submitting the add form, send the text to the node API
    $scope.createFuncionario = function(funcionario) {
            
        funcionariosAPI.save(funcionario).then(
            function sucessCallback(response){
            
            $scope.funcionario = {}; // clear the form 
            $scope.funcionarios = response.data;
            console.log(response.data);

        }, function errorCallback(response){
        
            console.log('Error: ' + response);
        });
    };

    // delete a user after checking it
    $scope.delete = function(id) {
        
        funcionariosAPI.deleteFuncionario(id).then(function sucessCallback(response){
                
            $scope.users = response.data;
            console.log(response.data);

        }, function errorCallback(response){
        
            console.log('Error: ' + response.data);
        });
    };

    obterFuncionarios();
});