/*
 * script.js
 *
 * Short summary here...
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

//-------------------------------------

var data_points = load_data();
var first_date = data_points[0][0]
var first_date_time = first_date.getTime();	// Time in ms. of the first date in 'data_points' since January 1st, 1970.

//----------

var canvas = document.getElementById("mycanvas");			// HTML canvas element.
var canvas_width = Number(canvas.getAttribute("width"));	// The width of the HTML canvas element. 
var canvas_height = Number(canvas.getAttribute("height"));	// The height of the HTML canvas element.
var padding_left = 70;		// Padding left (in px.).
var padding_right = 50;		// Padding right (in px.).
var padding_top = 50;		// Padding top (in px.).
var padding_bottom = 100; 	// Padding bottom (in px.).
var y_x_gap = 10;			// The length (in px.) of the gap between the y-axis and the x-axis.

//----------

var length_x_axis = canvas_width - padding_right - y_x_gap - padding_left;	// The length of the x-axis (in px.).
var length_y_axis = canvas_height - padding_bottom - padding_top;			// The length of the y-axis (in px.).
var length_mark = 10;		// The length (in px.) of a mark along the x-axis/y-axis (i.e., the vertical/horizontal bar).
var step_size_y_axis = 50;	// The step size (in 0.1 degrees Celcius) along the y-axis.

var x_domain = [0, 364];
var x_range = [padding_left + y_x_gap, padding_left + y_x_gap + length_x_axis];  
var y_domain = [-50, 350];
var y_range = [padding_top + length_y_axis, padding_top];

var x_transform = create_transform(x_domain, x_range);
var y_transform = create_transform(y_domain, y_range);

//----------

var graph_title = "Maximum temperature in De Bilt (NL) from September 22, 1994 - September 21, 1995 (including)"
var x_axis_title = "Time (in days)"
var y_axis_title = "Maximum temperature (in 0.1 degrees Celcius)"

//-------------------------------------

if(canvas.getContext) {
	var ctx = canvas.getContext("2d");
	draw_axes(ctx);
	draw_titles(ctx);
	draw_data(ctx);
}

//-------------------------------------

function load_data() {
	var textarea = document.getElementById("rawdata");
	var data = textarea.innerHTML.split("\n");
	var data_points = [];
	// var max_temps = []

	// Start at index 1, because the header '#date,maxtemp' is at index 0.
	// Loop over the length of the array minus one, because the last index
	// contains an empty string. 
	for(var index = 1; index < data.length - 1; index++) {
		var string_data = data[index];
		var string_data_parts = string_data.split(",");
		var date = new Date(string_data_parts[0]);
		var max_temp = Number(string_data_parts[1]);
		var data_point = [date, max_temp];
		data_points.push(data_point);
		// max_temps.push(max_temp);
	};

	return data_points;
};

//-------------------------------------

function create_transform(domain, range){
	// 'domain' is a two-element array of the domain's bounds.
	// 'range' is a two-element array of the range's bounds.

	var beta = range[0];
	var alpha = (range[1]- range[0]) / (domain[1] - domain[0]);

	return function(x){
		return alpha * (x - domain[0]) + beta;
	};
};

//-------------------------------------

function draw_axes(context_2D) {
	// Draw the x-axis.
	draw_line(context_2D, padding_left + y_x_gap, padding_top + length_y_axis, padding_left + y_x_gap + length_x_axis, padding_top + length_y_axis);
	// Draw the marks along the x-axis.
	draw_marks_x_axis(context_2D);

	// Draw the y-axis.
	draw_line(context_2D, padding_left, padding_top, padding_left, padding_top + length_y_axis);
	// Draw the marks along the y-axis.
	draw_marks_y_axis(context_2D);

	// Draw the zero line.
	context_2D.save();
	context_2D.setLineDash([5, 15]);
	var y_zero_line = y_transform(0);
	draw_line(context_2D, padding_left + y_x_gap, y_zero_line, padding_left + y_x_gap + length_x_axis, y_zero_line);
	context_2D.restore();
};

//-------------------------------------

function draw_marks_x_axis(context_2D) {
	var y = padding_top + length_y_axis;

	// Draw the mark for the first date.
	var first_transformed_date = transform_date(first_date);
	var first_x = x_transform(first_transformed_date);
	draw_mark_x_axis(context_2D, first_x, y, first_date);

	var prev_month = first_date.getMonth();

	for(var index = 1; index < data_points.length - 1; index++) {
		var date = data_points[index][0];
		var month = date.getMonth();
		if(month != prev_month) {
			var transformed_date = transform_date(date);
			var x = x_transform(transformed_date);
			draw_mark_x_axis(context_2D, x, y, date);
			prev_month = month;
		}
	};

	// Draw the mark for the last date.
	var last_date = data_points[data_points.length - 1][0];
	var last_transformed_date = transform_date(last_date);
	var last_x = x_transform(last_transformed_date);
	draw_mark_x_axis(context_2D, last_x, y, last_date);
};

//-------------------------------------

function draw_mark_x_axis(context_2D, x, y, date) {
	draw_line(context_2D, x, y, x, y + length_mark);
	context_2D.save();
	context_2D.translate(x, y + length_mark + 5);
	context_2D.rotate(-Math.PI / 4);
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "end";
	context_2D.fillText(get_date_string(date), 0, 0);
	context_2D.restore();
};

//-------------------------------------

function get_date_string(date) {
	var year = date.getFullYear().toString();
	var month = (date.getMonth() + 1).toString();
	var day = date.getDate().toString();
	return year + "-" + (month[1]?month:"0"+month[0]) + "-" + (day[1]?day:"0"+day[0]); 
};

//-------------------------------------

function draw_marks_y_axis(context_2D) {
	var start_mark = y_domain[1];
	var end_mark = y_domain[0];
	var current_mark = start_mark;
	var x = padding_left;

	context_2D.save();
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "end";

	for(var counter = 0; counter < Math.floor(((start_mark - end_mark) / step_size_y_axis) + 1); counter++) {
		var y = y_transform(current_mark);
		draw_line(context_2D, x, y, x - length_mark, y);
		context_2D.fillText(current_mark.toString(), x - length_mark - 5, y);
		current_mark -= step_size_y_axis;
	};

	context_2D.restore();
};

//-------------------------------------

function draw_titles(context_2D) {
	// Draw the graph title.
	draw_title(context_2D, canvas_width / 2, padding_top / 2, 0, graph_title);

	// Draw the x-axis title.
	draw_title(context_2D, canvas_width - padding_right - (length_x_axis / 2), canvas_height - 10, 0, x_axis_title);

	// Draw the y-axis title.
	draw_title(context_2D, 10, canvas_height - padding_bottom - (length_y_axis / 2), -Math.PI / 2, y_axis_title);
};

//-------------------------------------

function draw_title(context_2D, x_translate, y_translate, angle, title) {
	context_2D.save();
	context_2D.translate(x_translate, y_translate);
	context_2D.rotate(angle);
	context_2D.font = "15px Arial"
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "center"
	context_2D.fillText(title, 0, 0);
	context_2D.restore();	
};

//-------------------------------------

function draw_data(context_2D) {
	var first_transformed_date = transform_date(first_date);
	var prev_x = x_transform(first_transformed_date);
	var prev_y = y_transform(data_points[0][1]); 

	for(var counter = 0; counter < data_points.length; counter++) {
		var date = data_points[counter][0];
		var transformed_date = transform_date(date);
		var x = x_transform(transformed_date);

		var max_temp = data_points[counter][1];
		var y = y_transform(max_temp);

		draw_line(context_2D, prev_x, prev_y, x, y);

		prev_x = x;
		prev_y = y;
	};
};

//-------------------------------------

function transform_date(date) {
	date_time = date.getTime();
	time_difference_from_start = date_time - first_date_time;	// Difference in ms!
	return time_difference_from_start / 86400000;				// Return difference in days!
};

//-------------------------------------

function draw_line(context_2D, x1, y1, x2, y2) {
	context_2D.beginPath();
	context_2D.moveTo(x1, y1);
	context_2D.lineTo(x2, y2);
	context_2D.closePath();
	context_2D.stroke();
};

//-------------------------------------------------------------------------------

// function getMaxOfArray(numArray) {
// 	return Math.max.apply(null, numArray);
// };

// function getMinOfArray(numArray) {
// 	return Math.min.apply(null, numArray);
// };

// console.log("Max temp: ", getMaxOfArray(max_temps));
// console.log("Min temp: ", getMinOfArray(max_temps));