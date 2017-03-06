angular.module('rhPontumApp').config(["ChartJsProvider", function(ChartJsProvider){
		
	//console.log(ChartJsProvider);

	// Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#1166e8', '#85b716', '#68217a', '#45668e', '#ff6600'],
      responsive: true
    });

    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: true
    });

    Chart.defaults.global.scaleLabel = function(label){
      return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    
}]);

