/*
 * main3.js
 *
 * Name : Vincent Erich
 * Student Number : 10384081
 */

window.onload = function() {
	/*
	 * Use XMLHttp to read the JSON data from the file
	 * 'countries_population.json'. Parse the JSON data to a JSON string and
	 * use this JSON string to color the map (i.e., the SVG).
	 */
 	var xmlhttp = new XMLHttpRequest();
 	var url = "countries_population.json";

 	xmlhttp.onreadystatechange = function() {
 		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
 			var json = JSON.parse(xmlhttp.responseText);
 			color_map(json);
 		}
 	};

 	xmlhttp.open("GET", url, true);
 	xmlhttp.send();
}

function color_map(json) {
	data_points = json.points;
	for(var i = 0; i < data_points.length; i++) {
		var data_point = data_points[i];
		var country = data_point[0];
		var country_id = get_country_id(country);
		
		if(!country_id) {
			console.log("No id found for: " + country);
		} else {
			var population = Number(data_point[1]);
			var fill_color = get_fill_color(population);
			changeColor(country_id, fill_color);
		};
	};
};

function get_country_id(country) {
	for(var i = 0; i < country_codes.length; i++) {
		var current_country = country_codes[i][2];
		if(country == current_country) {
			return country_codes[i][0];
		};

		// Another check...
		// country_words = country.split(" ");
		// var match = true;
		// for(var j = 0; j < country_words.length; j++) {
		// 	if(current_country.indexOf(country_words[j]) == -1) {
		// 		match = false;
		// 		break;
		// 	}
		// };
		// if(match) {
		// 	console.log("Country: ", country, "Match: ", country_codes[i][2], "Country code: ", country_codes[i][0]);
		// 	return country_codes[i][0];
		// }
	};
	return undefined;
};

/*
 * Returns the right (fill) color given a population value.
 */
function get_fill_color(population) {
	// < 5m
	if (population < 5000000) {
		return "#fcfbfd";
	}
	// 5m - 10m
	else if(population < 10000000) {
		return "#efedf5";
	}
	// 10m - 25m
	else if(population < 25000000) {
		return "#dadaeb";
	}
	// 25m - 50m
	else if(population < 50000000) {
		return "#bcbddc";
	}
	// 50m - 75m
	else if(population < 75000000) {
		return "#9e9ac8";
	}
	// 75m - 100m
	else if(population < 100000000) {
		return "#807dba";
	}
	// 100m - 200m
	else if(population < 200000000) {
		return "#6a51a3";
	}
	// 200m - 1000m
	else if(population < 1000000000) {
		return "#54278f";
	}
	// 1000m - 1000m +
	else {
		return "#3f007d";
	}
};

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
	try {
		var element = document.getElementById(id);	// Could be a <g> element (with children), or a single <path> element.
		element.style.fill = color;
		fill_children(element, color);
	}
	catch (e) {
		console.log(e + "; id: " + id);
	};
};

function fill_children(element, color) {
	var children = element.childNodes;
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		if(child.nodeType != 1) {
			continue;
		} else {
			if(child.nodeName == "path") {
				child.style.fill = color;
			}
			else if(child.nodeName == "g") {
				fill_children(child, color);
			}
			else {
				continue;
			};
		};
	};
};