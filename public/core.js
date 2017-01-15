

var rhPontumApp = angular.module('rhPontumApp', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.funcData = {};

    // when landing on the page, get all users and show them
    $http.get('/api/users')
        .success(function(data) {
            $scope.users = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createUser = function() {
        $http.post('/api/users', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form 
                $scope.users = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a user after checking it
    $scope.deleteUser = function(id) {
        $http.delete('/api/users/' + id)
            .success(function(data) {
                $scope.users = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


    // get funcionarios
    $http.get('/api/funcionarios')
        .success(function(data) {
            $scope.funcionarios = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createFuncionario = function() {
        $http.post('/api/funcionarios', $scope.formFunc)
            .success(function(data) {
                $scope.formFunc = {}; // clear the form 
                $scope.funcionarios = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}