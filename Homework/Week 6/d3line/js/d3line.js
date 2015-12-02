/*
 * d3line.js
 *
 * Recreates the line graph from week 3 + 4 using D3 + SVG.
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

var svg_width = 850;
var svg_height = 550;
var margin = {top: 50, right: 70, bottom: 50, left: 50};

//----------

var length_x_axis = svg_width - margin.left - margin.right;
var length_y_axis = svg_height - margin.top - margin.bottom;

// A time formatter (i.e., yyyy-mm-dd).
var date_format = d3.time.format("%Y/%m/%d");

//----------

var radius_inner_focus = 5;
var radius_outer_focus = 10;

//----------

var date_label_width = 85;
var date_label_height = 20;
var temperature_label_width = 35;
var temperature_label_height = 20; 

//----------

var graph_title = "Maximum temperature in De Bilt (NL) from September 22, 1994 - September 21, 1995 (including)";
var y_axis_title = "Maximum temperature (in 0.1 degrees Celcius)";
var x_axis_title = "Time (in months)";

//-------------------------------------

// A (time) scale object for the x-axis.
var x = d3.time.scale()
	.range([0, length_x_axis]);

// A (linear) scale object for the y-axis.
var y = d3.scale.linear()
	.range([length_y_axis, 0]);

// An axis component for the x-axis.
var x_axis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(d3.time.month, 1);

// An axis component for the y-axis.
var y_axis = d3.svg.axis()
	.scale(y)
	.orient("left");

// A line generator (used for the construction of the "d" attribute for the
// the <path> element that represents the data line).
var line = d3.svg.line()
	.x(function(d) { return x(d[0]); })
	.y(function(d) { return y(d[1]); });

// Append an <svg> element to the HTML body, and append a <g> element to the
// <svg> element. The <g> element holds all the other elements. 
var svg = d3.select("body").append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height)
  .append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Draw the title of the graph.
svg.append("text")
		.attr("class", "title")
		.attr("x", length_x_axis / 2)
		.attr("y", -30)
		.style("text-anchor", "middle")
		.text(graph_title);

var data;	// (a global).

// Load the data using 'd3.json'. 'd3.json' takes a callback function, and the
// file loading is done asynchronously. Hence, the data is only available in
// the scope of the callback function.
d3.json("data/KNMI_19950921_reformatted.json", function(error, json) {
	if (error) {
		return console.log(error);
	};
	data = json;
	// Coerce the dates to JavaScript Date objects, and coerce the maximum
	// temperatures to numbers.
	data.forEach(function(d) {
		d[0] = date_format.parse(d[0]);
		d[1] = +d[1];
	});

	// Set the domains of the scale objects.
	x.domain(d3.extent(data, function(d) { return d[0]; }));
	y.domain(d3.extent(data, function(d) { return d[1]; }));

	// Draw the x-axis (including the x-axis label).
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + length_y_axis + ")")
		.call(x_axis)
	  .append("text")
	  	.attr("x", length_x_axis / 2)
	  	.attr("y", 40)
	  	.style("text-anchor", "middle")
	  	.text(x_axis_title);

	// Draw the y-axis (including the y-axis label).
	svg.append("g")
		.attr("class", "y axis")
		.call(y_axis)
	  .append("text")
	  	.attr("transform", "rotate(-90)")
	  	.attr("x", -(length_y_axis / 2))
	  	.attr("y", -40)
	  	.style("text-anchor", "middle")
	  	.text(y_axis_title);

	// Draw the data line (note the use of the line generator). 
	svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);

	// The container for the cross-hair and the tooltip.
	var overlay = svg.append("g")
		.attr("class", "overlay");

	// Append a <rect> element to the container. The <rect> element has an
	// event listener attached to it that registers mouse move events. The
	// <rect> element is not visible (transparent) and spans the whole graph
	// area. 
	overlay.append("rect")
		.attr("class", "listener")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", length_x_axis)
		.attr("height", length_y_axis)
		.on("mousemove", function() {
			handle_mouse_move(overlay, this);
		});
});

//-------------------------------------

/*
 * Handles a mouse move event.
 */

var timeout_id;	// (a global).

function handle_mouse_move(container, listener_element) {
	// Clear the timeout.
	window.clearTimeout(timeout_id);
	// Remove the cross-hair and the tooltip.
	container.selectAll("g").remove();
	
	// Get the mouse coordinates and compute the x- and y-position for the
	// cross-hair.
	var mouse_position = d3.mouse(listener_element);
	var x_pos = mouse_position[0];
	var date = x.invert(x_pos)
	var max_temp = get_temperature_value(date);
	var y_pos = y(max_temp);

	draw_cross_hair(container, x_pos, y_pos);
	// Set a timeout for the tooltip (500 ms.).
	timeout_id = window.setTimeout(function() { draw_tooltip(container, x_pos, y_pos, date, max_temp); }, 500);
}

//-------------------------------------

/*
 * Returns the (maximum) temperature value belonging to the date.
 */
function get_temperature_value(date) {
	for(var index = 0; index < data.length; index++) {
		var current_date = data[index][0];

		if(date.getTime() ===  current_date.getTime()) {
			return data[index][1];
		}
		else {
			try {
				var next_date = data[index + 1][0];	// Should not cause an exception.
				if(date >= next_date) {
					continue;
				}
				else {
					return data[index][1];
				};
			}
			catch (e) {
				throw e;	// Throw the exception if it occurs.
			};
		};
	};
};

//-------------------------------------

/*
 * Draws the cross-hair.
 */

function draw_cross_hair(container, x, y) {
	// Draw the focus.
	draw_focus(container, x, y);

	var cross_hair = container.append("g")
		.attr("class", "cross-hair");

	// Draw the left part of the horizontal (x) cross-hair.
	if(!(x - radius_outer_focus <= 0)) {
		cross_hair.append("line")
			.attr("x1", 0)
			.attr("y1", y)
			.attr("x2", x - radius_outer_focus)
			.attr("y2", y);
	};

	// Draw the right part of the horizontal (x) cross-hair.
	if(!(x + radius_outer_focus >= length_x_axis)) {
		cross_hair.append("line")
			.attr("x1", x + radius_outer_focus)
			.attr("y1", y)
			.attr("x2", length_x_axis)
			.attr("y2", y);
	};

	// Draw the upper part of the vertical (y) cross-hair.
	if(!(y - radius_outer_focus <= 0)) {
		cross_hair.append("line")
			.attr("x1", x)
			.attr("y1", 0)
			.attr("x2", x)
			.attr("y2", y - radius_outer_focus);
	};

	// Draw the lower part of the vertical (y) cross-hair.
	if(!(y + radius_outer_focus >= length_y_axis)) {
		cross_hair.append("line")
			.attr("x1", x)
			.attr("y1", y + radius_outer_focus)
			.attr("x2", x)
			.attr("y2", length_y_axis);
	};
};

//-------------------------------------

/*
 * Draws the focus (i.e., the two circles where the horizontal and vertical 
 * cross-hair intersect).
 */

function draw_focus(container, x, y) {
	var focus = container.append("g")
		.attr("class", "cross-hair focus");

	// Draw the inner focus.
	focus.append("circle")
		.attr("cx", x)
		.attr("cy", y)
		.attr("r", radius_inner_focus);

	// Draw the outer focus.
	focus.append("circle")
		.attr("cx", x)
		.attr("cy", y)
		.attr("r", radius_outer_focus);
};

//-------------------------------------

/*
 * Calls the functions 'draw_date_label(...)' and
 * 'draw_temperature_label(...)' to draw the tooltip.
 */

function draw_tooltip(container, x, y, date, max_temp) {
	draw_date_label(container, x, y, date);
	draw_temperature_label(container, x, y, max_temp);
};

//-------------------------------------

/*
 * Draws the date label. The position where the date label is drawn, depends
 * on the position where the horizontal and vertical cross-hair intersect (the
 * horizontal and vertical cross-hair intersect at position ('x', 'y')).
 */

function draw_date_label(container, x, y, date) {
	if(x < length_x_axis / 2) {
		x_pos = x;
	}
	else {
		x_pos = x - date_label_width;
	};

	if(y < length_y_axis / 2) {
		y_pos = y + ((length_y_axis - y) / 2) - (date_label_height / 2);
	}
	else {
		y_pos = y - (y / 2) - (date_label_height / 2);
	};

	var date_label = container.append("g")
		.attr("class", "tooltip");

	date_label.append("rect")
		.attr("class", "label")
		.attr("width", date_label_width)
		.attr("height", date_label_height)
		.attr("x", x_pos)
		.attr("y", y_pos);

	date_label.append("text")
		.attr("class", "text")
		.attr("x", x_pos + (date_label_width / 2))
		.attr("y", y_pos + date_label_height)
		.attr("dy", -5)
		.attr("text-anchor", "middle")
		.text(date_format(date));
};

//-------------------------------------

/*
 * Draws the temperature label. As with the date label, the position where the
 * temperature label is drawn, depends on the position where the horizontal
 * and vertical cross-hair intersect (the horizontal and vertical cross-hair
 * intersect at position ('x', 'y')).
 */

function draw_temperature_label(container, x, y, max_temp) {
	if(x < length_x_axis / 2) {
		x_pos = x + ((length_x_axis - x) / 2) - (temperature_label_width / 2);		
	}
	else {
		x_pos = x - (x / 2) - (temperature_label_width / 2);
	};

	if(y < length_y_axis / 2) {
		y_pos = y;
	}
	else {
		y_pos = y - temperature_label_height;
	};

	var temperature_label = container.append("g")
		.attr("class", "tooltip");

	temperature_label.append("rect")
		.attr("class", "label_box")
		.attr("width", temperature_label_width)
		.attr("height", temperature_label_height)
		.attr("x", x_pos)
		.attr("y", y_pos);

	temperature_label.append("text")
		.attr("class", "text")
		.attr("x", x_pos + (temperature_label_width / 2))
		.attr("y", y_pos + temperature_label_height)
		.attr("dy", -5)
		.attr("text-anchor", "middle")
		.text(max_temp);
};
