        var aboutLink = "javascript:alert('stats4rdf');";
        var codeLink = "https://github.com/boricles/stats4rdf";
		
		var sparql = "";
		var sparqlEndPoint = "";
		var instancesOf = "";
		var property = "";
		

        /* */
        $(document).ready(function() {
		
		 var thisURI = window.location.href;
		 
		 var uriParts = thisURI.split('?');
		 
		 if (uriParts.length == 2) {
			parameters = uriParts[1].split('&');
			if (parameters.length >= 3) {
				param = parameters[0].split('=');
				sparqlEndPoint = param[1];
				param = parameters[1].split('=');
				instancesOf = param[1];
				param = parameters	[2].split('=');
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
        
        function loadData() {
				 //alert(sparqlEndPoint);
                _URIbase =  sparqlEndPoint + "?query=";
                //console.log(sparql);
                var queryURLBase = _URIbase + escape(sparql) + "&format=json";
				//alert(queryURLBase);
				//console.log(queryURLBase);
				
				$.ajax( {
                        dataType :'jsonp',
                        jsonp :'callback',
                        url : queryURLBase,
                        error : function (jqXHR, textStatus, errorThrown) {
                                        alert('Error when accesing ' + queryURLBase + ' ' + textStatus);
                                        console.log(sparql);
                        },
                        success : function(json) {
                                if( json && 
                                        json.results && 
                                        json.results.bindings && 
                                        json.results.bindings.length > 0) {
                                        var rows = json.results.bindings;
										
										var entities = [];						

										for(i in rows) {
												var row = rows[i];
												var entity = new Object;
												entity.name = row.ent.value;
												entity.num = row.num.value;
												if (parseInt(entity.num)> 1)
													entities[i] = entity;
										}
										displayData(param,entities);
                                }
                                else {
                                         $("#top-1-position").html("There is no tweet information.");
                                }
                }});
        }



        /** Function to display data **/        
        function displayData(param,entities) {
                var chartWidth = 1400 , chartHeight = 700, fontSize = 13,notePosition=595, bottomContainer=710,indicatorListContainer=1390;
                if (screen.width<=1280 /*&& screen.height<=800*/) {
				//alert('hola');
                        chartWidth = 850;
                        chartHeight = 500;
                        fontSize = 13;
                        notePosition = 595;
                        bottomContainer=710;
                        indicatorListContainer=1390;
                }
                
                displayChartData(param,entities,chartWidth,chartHeight,fontSize,notePosition);
                
        }

        /** Function to display a chart of a top property 
                topProperty - the property to display
                position - the position of the county/city for that property
                index - if it is the 1 or 2 property
        **/                
        function displayChartData(param,entities,chartWidth,chartHeight,fontSize,notePosition) {
                var props = entities;
                //console.log(topProperty);

                var data = new google.visualization.DataTable();
				data.addColumn('string', 'Entity');
				data.addColumn('number', 'value');
                data.addRows(props.length);

                for (var i=0; i<props.length; i++) {
						data.setValue(i, 0, props[i].name);
						data.setValue(i, 1, parseInt(props[i].num));
                }
				
				var divValue;
				if (param=='entity')
					divValue = 'chart_div_top_entities';
				else
					divValue = 'chart_div_top_users';
                var barsVisualization = new google.visualization.ColumnChart(document.getElementById(divValue));
				
                barsVisualization.draw(data, { /*chartArea: {left:25,top:10,width:"75%",height:"70%"}, */ width: chartWidth, height: chartHeight, colors:['#736F6E','#382D2C','#306754'], legend:'none', isStacked:'true', backgroundColor: '#F7F7F7', hAxis:{textStyle: {color: "black", fontName: "sans-serif", fontSize: fontSize} } }); //,  vAxis: {title:'hola', titleTextStyle:'', color: '#FF0000' }

                //$('#top-1-chart-notes-description').css("top",""+notePosition+"px");
                //$('#top-1-chart-notes-description').html("Place your mouse over each bar to get more information.");
        }

