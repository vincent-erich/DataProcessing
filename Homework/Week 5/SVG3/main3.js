/*
 * main3.js
 *
 * Color codes the map (i.e., the SVG).
 *
 * Name : Vincent Erich
 * Student Number : 10384081
 */

window.onload = function() {
	/*
	 * Use XMLHttp to read the JSON data from the file
	 * 'countries_population.json'. Parse the JSON data to a JSON string and
	 * use this JSON string to color code the map (i.e., the SVG).
	 *
	 * Note: This code has been adopted from w3schools.com:
	 * http://www.w3schools.com/json/json_http.asp
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

/*
 * color_map loops over the data points in the JSON string (passed as an
 * argument). For each country (i.e., for each data point), the correct ID is
 * obtained (see get_country_id), and this ID is used to locate the
 * appropriate path. The fill style of a path is adjusted to reflect the data
 * (i.e., population) by color coding.
 */
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
			change_color(country_id, fill_color);
		};
	};
};

/*
 * get_country_id returns the ID (i.e., alpha 2 country code) of a country.
 * For this, the function uses the variable 'country_codes', which is defined
 * in 'countries.js'. If no ID is found, the function returns 'undefined'.
 */
function get_country_id(country) {
	for(var i = 0; i < country_codes.length; i++) {
		var current_country = country_codes[i][2];
		if(country == current_country) {
			return country_codes[i][0];
		};
		/*
		 * Alternative: Split the country name on whitespace to obtain the
		 * individual words. Then check if all those words occur in the
		 * name of the current country ('current_country'). If so, return the
		 * ID of the current country. Continue otherwise.
		 *
		 * This works in most cases, but not always, for example:
		 *
		 * "Russia" matches with "Russian Federation", correct.
		 * "Iran" matches with "Iran, Islamic Republic of", correct.
		 * "Guinea" matches with "Equatorial Guinea", correct.
		 * "India" matches with "British Indian Ocean Territory", incorrect.
		 * "Bonaire", "Sint Eustatius", and "Saba" all match with "Bonaire, Sint Eustatius and Saba", incorrect.
		 *
		 * Since the alternative does not always work, it was left out.   
		 */
		// country_words = country.split(" ");
		// var match = true;
		// for(var j = 0; j < country_words.length; j++) {
		// 	if(current_country.indexOf(country_words[j]) == -1) {
		// 		match = false;
		// 		break;
		// 	}
		// };
		// if(match) {
		// 	console.log("Country: " + country + "; Match: " + country_codes[i][2] + "; Country code: " + country_codes[i][0]);
		// 	return country_codes[i][0];
		// }
	};
	return undefined;
};

/*
 * get_fill_color returns the right fill color given a population value.
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

/* 
 * change_color takes a path ID and a color (hex value) and changes that
 * path's fill color. 
 */
function change_color(id, color) {
	try {
		var element = document.getElementById(id);	// Can be a <g> element (with children), or a single <path> element.
		element.style.fill = color;
		fill_children(element, color);	// Fill the child elements.
	}
	catch (e) {
		console.log("Error: " + e + "; id: " + id);
	};
};

/*
 * fill_children takes an element (a <g> element, or a single <path> element)
 * and a color (hex value), and, if the element has <path> elements or <g> 
 * elements as children, changes those element's fill color. Furthermore,
 * if the child is a <g> element, this function is recursively called.
 */
function fill_children(element, color) {
	var children = element.childNodes;
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		// Continue if the child is not an element.
		if(child.nodeType != 1) {
			continue;
		} else {
			// If the child is a <path> element, change that path's fill 
			// color.
			if(child.nodeName == "path") {
				child.style.fill = color;
			}
			// If the child is a <g> element, change that element's fill color 
			// and recursively call this function (recursive step).
			else if(child.nodeName == "g") {
				child.style.fill = color;
				fill_children(child, color);
			}
			else {
				continue;
			};
		};
	};
};
