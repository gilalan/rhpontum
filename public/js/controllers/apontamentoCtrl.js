angular.module('rhPontumApp').controller('apontamentoCtrl', function($scope, apontamentosAPI){

    // get funcionarios
    var obterApontamentos = function() {

        apontamentosAPI.get().then(function sucessCallback(response){

            $scope.apontamentos = response.data;
            console.log(response);

        }, function errorCallback(response){

            console.log('Error: ' + response);
        });
    };


    // delete a user after checking it
    $scope.deleteApontamento = function(id) {
        
        apontamentosAPI.delete(id).then(function sucessCallback(response){
            
                $scope.apontamentos = response.data;
                console.log(response.data);

            }, function errorCallback(response){
            
                console.log('Error: ' + response.data);
            });
    }; 

    // when submitting the add form, send the text to the node API
    $scope.createApontamento = function(apontamento) {
        
        var testDateArray = [];
        var testDate1 = new Date();
        testDate1.setHours(8);
        testDate1.setMinutes(0);
        var testDate2 = new Date();
        testDate2.setHours(12);
        testDate2.setMinutes(05);
        var testDate3 = new Date();
        testDate3.setHours(14);
        testDate3.setMinutes(0);
        var testDate4 = new Date();
        testDate4.setHours(18);
        testDate4.setMinutes(11);

        testDateArray.push(testDate1);
        testDateArray.push(testDate2);
        testDateArray.push(testDate3);
        testDateArray.push(testDate4);

        apontamento.marcacoes = testDateArray;

        
        apontamentosAPI.save(apontamento).then(

            function sucessCallback(response){
           
                $scope.apontamento = {}; // clear the form 
                $scope.apontamentos = response.data;
                console.log(response);           

        }, function errorCallback(response){

            console.log('Error: ' + response.data);

        });
    };    

    obterApontamentos();

});
