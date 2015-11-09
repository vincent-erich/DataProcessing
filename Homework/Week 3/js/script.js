var data_points = load_data();
var first_date = data_points[0][0];
var first_date_time = first_date.getTime();	// Time in ms. of the first data in 'data_points' since January 1st, 1970.

var canvas = document.getElementById("mycanvas");
var canvas_width = 750;		// The width of the canvas! 
var canvas_height = 400;	// The height of the canvas!
var padding_x = 20;			// Meaning that the length of the x-axis (in px.) is: 'canvas_width' - 'padding_x'!
var positive_y = 350;		// The length (in px.) of the positive part of the y-axis. 
var negative_y = canvas_height - positive_y; 	// The length (in px.) of the negative part of the y-axis.

if(canvas.getContext) {
	var ctx = canvas.getContext("2d");
	draw_axes(ctx);
	draw_data(ctx);
}

//-------------------------------------

function load_data() {
	var textarea = document.getElementById("rawdata");
	var data = textarea.innerHTML.split("\n");
	var data_points = [];
	var max_temps = []

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
		max_temps.push(max_temp);
	};

	return data_points;
};

//-------------------------------------

function draw_axes(context_2D) {
	// Y-axis.
	draw_line(context_2D, padding_x, 0, padding_x, canvas_height);
	
	// X-axis.
	draw_line(context_2D, padding_x, canvas_height, canvas_width, canvas_height);

	// Zero-line.
	draw_line(context_2D, padding_x, positive_y, canvas_width, positive_y);
};

//-------------------------------------

function draw_data(context_2D) {
	var x_transform = createTransform([0, 364], [padding_x, canvas_width]);
	var y_transform = createTransform([0, 400], [0, canvas_height]);

	//----------
	var first_transformed_date = transformDate(first_date);
	var prev_x = x_transform(first_transformed_date);

	var first_transformed_temp = transformTemp(data_points[0][1]);
	var prev_y = y_transform(first_transformed_temp);
	//---------- 

	for(var counter = 0; counter < data_points.length; counter++) {
		var date = data_points[counter][0];
		var transformed_date = transformDate(date);
		var x = x_transform(transformed_date);

		var temp = data_points[counter][1];
		var transformed_temp = transformTemp(temp);
		var y = y_transform(transformed_temp);

		draw_line(context_2D, prev_x, prev_y, x, y);

		prev_x = x;
		prev_y = y;
	};
};

//-------------------------------------

function createTransform(domain, range){
	// domain is a two-element array of the domain's bounds
	// range is a two-element array of the range's bounds
	// implement the actual calculation here

	var beta = range[0];
	var alpha = (range[1]- range[0]) / (domain[1] - domain[0]);

	return function(x){
		return alpha * (x - domain[0]) + beta;
	};
};

//-------------------------------------

function transformDate(date) {
	date_time = date.getTime();
	time_difference_from_start = date_time - first_date_time;	// Difference in ms!
	return time_difference_from_start / 86400000;				// Return difference in days!
};

//-------------------------------------

function transformTemp(temp) {
	if(temp >= 0) {
		return positive_y - temp;
	} else {
		return positive_y + Math.abs(temp); 
	};
};

//-------------------------------------

function draw_line(context_2D, x1, y1, x2, y2) {
	context_2D.beginPath();
	context_2D.moveTo(x1, y1);
	context_2D.lineTo(x2, y2);
	context_2D.closePath();
	context_2D.stroke();
};

//-----------------------------------------------------------------------------

function getMaxOfArray(numArray) {
	return Math.max.apply(null, numArray);
};

function getMinOfArray(numArray) {
	return Math.min.apply(null, numArray);
};

// console.log("Max temp: ", getMaxOfArray(max_temps));
// console.log("Min temp: ", getMinOfArray(max_temps));