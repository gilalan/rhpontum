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

    // Configure all bar charts
    ChartJsProvider.setOptions('bar', {
      multiTooltipTemplate: function(label) {
        return label.label + ': ' + label.value+"##";
      }
    });
}]);

