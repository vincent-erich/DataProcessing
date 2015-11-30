var svg_width = 850;
var svg_height = 550;
var margin = {top: 50, right: 70, bottom: 50, left: 50};

var length_x_axis = svg_width - margin.left - margin.right;
var length_y_axis = svg_height - margin.top - margin.bottom;

var date_format = d3.time.format("%Y/%m/%d");

var graph_title = "Maximum temperature in De Bildt (NL) from September 22, 1994 - September 21, 1995 (including)";
var y_axis_title = "Maximum temperature (in 0.1 degrees Celcius)";
var x_axis_title = "Time (in days)";

var x = d3.time.scale()
	.range([0, length_x_axis]);

var y = d3.scale.linear()
	.range([length_y_axis, 0]);

var x_axis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(d3.time.month, 1);

var y_axis = d3.svg.axis()
	.scale(y)
	.orient("left");

var line = d3.svg.line()
	.x(function(d) { return x(d[0]); })
	.y(function(d) { return y(d[1]); });

var svg = d3.select("body").append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height)
  .append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
		.attr("class", "title")
		.attr("x", length_x_axis / 2)
		.attr("y", -30)
		.style("text-anchor", "middle")
		.text(graph_title);

d3.json("data/KNMI_19950921_reformatted.json", function(error, data) {
	if (error) {
		return console.warn(error);
	};
	data.forEach(function(d) {
		d[0] = date_format.parse(d[0]);
		d[1] = +d[1];
	});

	x.domain(d3.extent(data, function(d) { return d[0]; }));
	y.domain(d3.extent(data, function(d) { return d[1]; }));

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + length_y_axis + ")")
		.call(x_axis)
	  .append("text")
	  	.attr("x", length_x_axis / 2)
	  	.attr("y", 40)
	  	.style("text-anchor", "middle")
	  	.text(x_axis_title);

	svg.append("g")
		.attr("class", "y axis")
		.call(y_axis)
	  .append("text")
	  	.attr("transform", "rotate(-90)")
	  	.attr("x", -(length_y_axis / 2))
	  	.attr("y", -40)
	  	.style("text-anchor", "middle")
	  	.text(y_axis_title);

	svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);

	svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", length_x_axis)
		.attr("height", length_y_axis)
		.style("fill", "transparent")
		.style("stroke", "transparent")
		.on("mousemove", function() {
			console.log("Mouse move...")
		});
});