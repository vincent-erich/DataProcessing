/*
 * script.js
 *
 * Visualizes the data in the <texarea> element (see ../index.html) in a
 * graph. The script is written in such a way that it is possible to
 * change (to some extent**) the width and the height of the canvas, the 
 * padding, the gap between the y-axis and the x-axis, and the step size
 * along the y-axis, without affecting the graph. 
 * 
 ** Without affecting the titles and labels.       
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

var data_points = load_data();
var first_date = data_points[0][0]			// The first date in 'data_points' (i.e., September 22, 1994). 
var first_date_time = first_date.getTime();	// The time (in ms.) of the first date in 'data_points' since January 1st, 1970.

//----------

var canvas = document.getElementById("mycanvas");			// HTML canvas element.
var canvas_width = Number(canvas.getAttribute("width"));	// The width of the HTML canvas element (in px.). 
var canvas_height = Number(canvas.getAttribute("height"));	// The height of the HTML canvas element (in px.).
var padding_left = 70;		// Padding left (in px.).
var padding_right = 50;		// Padding right (in px.).
var padding_top = 50;		// Padding top (in px.).
var padding_bottom = 100; 	// Padding bottom (in px.).
var y_x_gap = 10;			// The length of the gap between the y-axis and the x-axis (in px.).

//----------

var length_x_axis = canvas_width - padding_right - y_x_gap - padding_left;	// The length of the x-axis (in px.).
var length_y_axis = canvas_height - padding_bottom - padding_top;			// The length of the y-axis (in px.).
var step_size_y_axis = 50;		// The step size along the y-axis (in 0.1 degrees Celcius).
var length_mark = 10;			// The length (in px.) of a mark along the x-axis/y-axis (i.e., the vertical/horizontal bar).
var font_label = "12px Arial";	// The font of the labels along the x-axis/y-axis.

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
var font_title = "15px Arial";	// The font of the titles.

//-------------------------------------

// Check for support.
if(canvas.getContext) {
	var ctx = canvas.getContext("2d");
	draw_axes(ctx);
	draw_titles(ctx);
	draw_data(ctx);
}

//-------------------------------------

/*
 * Loads the data in the <textarea> element (see ../index.html) and returns
 * an array of data points.
 */
function load_data() {
	var textarea = document.getElementById("rawdata");
	var data = textarea.innerHTML.split("\n");
	var data_points = [];

	/* 
	 * Loop over the array 'data'. Start at index 1, because the header 
	 * '#date,maxtemp' is at index 0. Exclude the last element in the array
	 * (i.e., 'index < data.length - 1'), because the last element in the
	 * array is an empty string.   
	 */ 
	for(var index = 1; index < data.length - 1; index++) {
		var string_data = data[index];
		var string_data_parts = string_data.split(",");
		var date = new Date(string_data_parts[0]);
		var max_temp = Number(string_data_parts[1]);
		var data_point = [date, max_temp];
		data_points.push(data_point);
	};

	return data_points;
};

//-------------------------------------

/*
 * Returns a (linear) transformation function (adopted from the previous
 * homework assignment).
 */
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

/*
 * Draws the axes of the graph, including the zero line.
 */
function draw_axes(context_2D) {
	// Draw the x-axis.
	draw_line(context_2D, padding_left + y_x_gap, padding_top + length_y_axis, padding_left + y_x_gap + length_x_axis, padding_top + length_y_axis);
	// Draw the marks (and labels) along the x-axis.
	draw_marks_x_axis(context_2D);

	// Draw the y-axis.
	draw_line(context_2D, padding_left, padding_top, padding_left, padding_top + length_y_axis);
	// Draw the marks (and labels) along the y-axis.
	draw_marks_y_axis(context_2D);

	// Draw the zero line.
	context_2D.save();
	context_2D.setLineDash([5, 15]);
	var y_zero_line = y_transform(0);
	draw_line(context_2D, padding_left + y_x_gap, y_zero_line, padding_left + y_x_gap + length_x_axis, y_zero_line);
	context_2D.restore();
};

//-------------------------------------

/*
 * Calls the function 'draw_mark_x_axis(context_2D)' multiple times (with the 
 * right arguments) to draw the marks (and labels) along the x-axis.
 */
function draw_marks_x_axis(context_2D) {
	var y = padding_top + length_y_axis;

	context_2D.save();
	context_2D.font = font_label;

	// Draw a mark (and a label) for the first date.
	var first_transformed_date = transform_date(first_date);
	var first_x = x_transform(first_transformed_date);
	draw_mark_x_axis(context_2D, first_x, y, first_date);

	var prev_month = first_date.getMonth();

	// Draw a mark (and a label) for the first day of every month.
	for(var index = 1; index < data_points.length - 1; index++) {
		var date = data_points[index][0];
		var month = date.getMonth();
		if(month !== prev_month) {
			var transformed_date = transform_date(date);
			var x = x_transform(transformed_date);
			draw_mark_x_axis(context_2D, x, y, date);
			prev_month = month;
		}
	};

	// Draw a mark (and a label) for the last date.
	var last_date = data_points[data_points.length - 1][0];
	var last_transformed_date = transform_date(last_date);
	var last_x = x_transform(last_transformed_date);
	draw_mark_x_axis(context_2D, last_x, y, last_date);

	context_2D.restore();
};

//-------------------------------------

/*
 * Draws a mark (and a label) along the x-axis. This function is called inside
 * the function 'draw_marks_x_axis(context_2D)' to actually draw marks (and 
 * labels) along the x-axis. 
 */
function draw_mark_x_axis(context_2D, x, y, date) {
	// Draw the mark.
	draw_line(context_2D, x, y, x, y + length_mark);
	context_2D.save();
	// Translate the origin of the canvas to a position 5 px. below the end
	// position of the mark.
	context_2D.translate(x, y + length_mark + 5);
	// Rotate the canvas 45 degrees (i.e., 1/4 pi radians) counter-clockwise.
	context_2D.rotate(-Math.PI / 4);
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "end";
	// Draw the label.
	context_2D.fillText(get_date_string(date), 0, 0);
	context_2D.restore();
};

//-------------------------------------

/*
 * Returns a string representation of a Date object. The string representation
 * is as follows: yyyy-mm-dd.
 *
 * NOTE: The code has been adopted form StackOverflow. Source:
 * http://stackoverflow.com/a/3067896
 */
function get_date_string(date_object) {
	var year = date_object.getFullYear().toString();		// Get the year.
	var month = (date_object.getMonth() + 1).toString();	// Get the month ('getMonth()' returns a zero-based month, hence the plus one).
	var day = date_object.getDate().toString();				// Get the day.
	// Return the correct string representation of the Date object. Use the
	// ternary operator to determine whether or not a zero character must
	// be placed before the month/day.   
	return year + "-" + (month.length===2?month:"0"+month) + "-" + (day.length===2?day:"0"+day[0]); 
};

//-------------------------------------

/*
 * Draws the marks (and labels) along the y-axis.
 */
function draw_marks_y_axis(context_2D) {
	var start_mark = y_domain[1];	// (i.e., 350).
	var end_mark = y_domain[0];		// (i.e., -50).
	var current_mark = start_mark;
	var x = padding_left;

	context_2D.save();
	context_2D.font = font_label;
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "end";

	/*
	 * The number of marks (and labels) to draw along the y-axis is equal to: 
	 * ((the end of the y-domain (i.e., 350) - the start of the y-domain 
	 * (i.e., -50)) / the step size along the y-axis (i.e., 50)) + 1. If this
	 * is not an integer, the value must be floored. 
	 */
	for(var counter = 0; counter < Math.floor(((start_mark - end_mark) / step_size_y_axis) + 1); counter++) {
		var y = y_transform(current_mark);
		// Draw the mark.
		draw_line(context_2D, x, y, x - length_mark, y);
		// Draw the label (5 px. to the left of the end position of the mark).
		context_2D.fillText(current_mark.toString(), x - length_mark - 5, y);
		current_mark -= step_size_y_axis;
	};

	context_2D.restore();
};

//-------------------------------------

/*
 * Calls the function 'draw_title(...)' multiple times (with the right
 * arguments) to draw the graph tile, the x-axis title, and the y-axis title.
 */
function draw_titles(context_2D) {
	// Draw the graph title.
	draw_title(context_2D, canvas_width / 2, padding_top / 2, 0, graph_title);

	// Draw the x-axis title.
	draw_title(context_2D, canvas_width - padding_right - (length_x_axis / 2), canvas_height - 10, 0, x_axis_title);

	// Draw the y-axis title.
	draw_title(context_2D, 10, canvas_height - padding_bottom - (length_y_axis / 2), -Math.PI / 2, y_axis_title);
};

//-------------------------------------

/*
 * Draws a center-aligned title ('title') at position ('x', 'y') under a
 * certain angle (in radians, specified by 'angle').
 */
function draw_title(context_2D, x, y, angle, title) {
	context_2D.save();
	// Translate the origin of the canvas to position ('x', 'y').
	context_2D.translate(x, y);
	// Rotate the canvas.
	context_2D.rotate(angle);
	context_2D.font = font_title;
	context_2D.textBaseline = "middle";
	context_2D.textAlign = "center"
	// Draw the title ('title').
	context_2D.fillText(title, 0, 0);
	context_2D.restore();	
};

//-------------------------------------

/*
 * Draws the data.
 */ 
function draw_data(context_2D) {
	var first_transformed_date = transform_date(first_date);
	var prev_x = x_transform(first_transformed_date);
	var prev_y = y_transform(data_points[0][1]); 

	for(var counter = 1; counter < data_points.length; counter++) {
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

/*
 * Returns an integer that represents the number of days since the first date
 * in 'data_points' (i.e., September 22, 1994). For example:
 * transform_date(new Date("1994/09/22")) --> 0;
 * transform_date(new Date("1994/09/25")) --> 3;
 * transform_date(new Date("1995/09/21")) --> 364;
 */
function transform_date(date) {
	date_time = date.getTime();
	time_difference_from_start = date_time - first_date_time;	// The difference in ms.
	return time_difference_from_start / 86400000;				// Return the difference in days.
};

//-------------------------------------

/*
 * Draw a line from position ('x1', 'y1') to position ('x2', 'y2').
 */
function draw_line(context_2D, x1, y1, x2, y2) {
	context_2D.beginPath();
	context_2D.moveTo(x1, y1);
	context_2D.lineTo(x2, y2);
	context_2D.closePath();
	context_2D.stroke();
};

//-------------------------------------