var aboutLink = "javascript:alert('stats4rdf');";
var codeLink = "https://github.com/boricles/stats4rdf";
		
var sparql = "";
var sparqlEndPoint = "";
var instancesOf = "";
var property = "";
var numEntities;
var entities = [];
var entitiesChildren = [];
var data = [];
var labels = [];

var tooltip = $('<div id="tooltip"/>').appendTo($('body')), point = null;

//console.log("entities");
//console.log(entities);


/***********************************************************************************
 * PARAMETERS: SparqlEndPoint, Class, Property
 */

$(document).ready(function() {
		
	var thisURI = window.location.href;
		 
	var uriParts = thisURI.split('?');
		 
	if (uriParts.length == 2) {
			parameters = uriParts[1].split('&'); //Parameters
			if (parameters.length >= 3) {
				param = parameters[0].split('='); //SparqlEndPoint // e.g.: http://energia.linkeddata.es/sparql
				sparqlEndPoint = param[1];
				param = parameters[1].split('='); //Class // e.g.: http://energia.linkeddata.es/ontology/EficienciaEnergetica/Edificio
				instancesOf = param[1];
				param = parameters	[2].split('='); //Property // e.g.: http://energia.linkeddata.es/ontology/EficienciaEnergetica/calificacion
				property = param[1];

				sparql = "SELECT ?ent count(?ent) as ?num " +
						 " WHERE { " +
						 " ?s a <" + instancesOf + "> . " +						 
						 " ?s <" +  property + "> ?ent . " + 
						 " } ORDER BY DESC(?num) ";				
				
				loadData();
				
	}
	else {
				alert('You should provide the sparqlEndpoint, class and property parameters');
	}
	}
	else {
				alert('You should provide the sparqlEndpoint, class and property parameters');
			
	}
});



/***********************************************************************************
 * LOAD DATA: 
 */

function loadData() {

   _URIbase =  sparqlEndPoint + "?query=";
   var queryURLBase = _URIbase + escape(sparql) + "&format=json";
				
	$.ajax( {
                        dataType :'jsonp',
                        jsonp :'callback',
                        url : queryURLBase,
                        error : function (jqXHR, textStatus, errorThrown) {
                                        alert('Error when accesing ' + queryURLBase + ' ' + textStatus);
                                        //console.log(sparql);
                        },
                        success : function(json) {
                                if( json && 
                                        json.results && 
                                        json.results.bindings && 
                                        json.results.bindings.length > 0) {
                                        var rows = json.results.bindings;						

										for(i in rows) {
												var row = rows[i];
												var array2 = [parseInt(i), parseInt(row.num.value)];
												labels[i] = row.ent.value;
												
												//console.log("array2: ");
												//console.log(array2);
												
												//console.log("label: ");
												//console.log(labels[i]);
																								
												if (parseInt(row.num.value)> 1)
													entities[i] = array2; //entities contain all the series
										}
										
										transformData2Graph();
                                }
                                else {
                                         $("#top-1-position").html("There is no tweet information.");
                                }
	}});
}


/***********************************************************************************/
/*  Use Flot to convert our data into
 *  a graph. Creation of the graph:
 */
function transformData2Graph() {
	var options = {
	
				//label: labels, //Already included for each children below
        
					bars: {
							show: true,
							barWidth: 0.7, // Sino, salen muy anchas
							fill:0.9
						  },
						  
					
					xaxis: {
						show: true,
						axisLabel: property, //eg. e.g.: 'http://energia.linkeddata.es/ontology/EficienciaEnergetica/calificacion'
						//In the future, just the label: axisLabel: 'calificacion'
			            axisLabelFontSizePixels: 12,
			            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif'
					},
					
					yaxis: {
						show: true,
						axisLabel: instancesOf, //e.g.: 'http://energia.linkeddata.es/ontology/EficienciaEnergetica/Edificio'
						//In the future, just the label: axisLabel: 'Edificio'
			            axisLabelFontSizePixels: 12,
			            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif'
					},
			        
			        grid: {
			            hoverable: true,
			            clickable: false,
			            borderWidth: 1
			        },
			        
			        legend: {
			            labelBoxBorderColor: "none",
			            position: "right"
			        },
			        
			        series: {
			            shadowSize: 1
			        }
	};
	
	
	//In order to display various colors and labels for each bar, we need each children as a new serie:
	$.each(entities, function(i,bar) {
	if (i<10) { // We show just the TOP 10
		entitiesChildren.push({
					data: [bar],
					
					bars: {
							show: true,
							barWidth: 0.7, // If not, very wide bars
							fill:0.9
						  },
						  
					label : labels[i], // E.g.: G, D, F, C, B, A
					
					}); 
	}
	});
	
	$.plot($('#graph'), entitiesChildren, options);
	
	
	// SHOW TOOLTIP:
	
	$('#graph').bind('plothover', function(event, pos, item) {
    if (item) {
        if (point === null || point[0] != item.datapoint[0] || point[1] != item.datapoint[1]) {
            point = item.datapoint;
            tooltip.html('   ' + item.series.label + ': ' + parseInt(point[1].toFixed(2)))
                   .css('background-color', item.series.color);
                   
            var x = item.pageX - (tooltip.width() / 2),
                y = item.pageY - tooltip.height() - 18;
            
            if (tooltip.css('opacity') < 0.2) {
                tooltip.stop().css({top: y, left: x}).animate({ opacity: 1}, 400);
            } else {
                tooltip.stop().animate({ opacity: 1, top: y, left: x}, 600);
            }
        }
    } else {
        tooltip.stop().animate({opacity: 0}, 400);
        point = null;
    }
	});	
	
}
 

 