/*
 * script.js
 *
 * Short description here...
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

var my_data;

d3.json("data/data.json", function(error, json) {
    if(error) {
        console.log(error);
    };
    my_data = json;
    draw_map("2014")
});

function draw_map(year) {
    d3.select("#svg_map").selectAll("*").remove();
    $("#svg_map").datamap({
        scope: 'world',
        geography_config: {
            borderWidth: 0.3,
            borderColor: 'black',
            popupTemplate: _.template([
                '<div class="hoverinfo">',
                '<strong><%= geography.properties.name %></strong></br></br>',
                '<% if (data.total) { %>',
                'Population: <%= data.total %></br></br>',
                '<i>The distribution of age groups is shown on the right.</i></br>',
                '<i>If no bars are visible, then the distribution of </br> age groups is unknown (e.g., Greenland).</i>',
                '<% } else { %>',
                'Population: unknown <% } %>',
                '<% draw_bar_chart("2014", geography.properties.name, geography.id) %>',
                '</div>'
            ].join('')),
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2
        },
        fills: my_data['fills'],
        data: my_data['data'][year]
    });
};

// Vertical bar chart.
function draw_bar_chart(year, country_name, country_code) {
    d3.select("#svg_bar_chart").selectAll("*").remove();

    // Country is present in the data set.
    if((my_data['data'][year].hasOwnProperty(country_code))) {

        all_data_country = my_data["data"][year][country_code]
        percentages = all_data_country["percentages"]

        var margin = {top: 30, right: 20, bottom: 30, left: 40};
        var width = 200 - margin.left - margin.right;
        var height = 360 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(percentages.map(function(d) { return d[0]; }))
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, d3.max(percentages, function(d) { if(d[1] == "Unknown") { return 0; } else { return d[1]; };})])
            .range([height, 0]);

        var x_axis = d3.svg.axis()
            .scale(x)
            .orient("bottom")

        var y_axis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select("#svg_bar_chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .text(country_name);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);

        svg.append("g")
            .attr("class", "y axis")
            .call(y_axis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", -30)
            .style("text-anchor", "middle")
            .text("Percentage of total population");

        var bars = svg.selectAll(".bar")
            .data(percentages)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", y(0))
            .attr("width", x.rangeBand())
            .attr("height", 0);

        bars
            .transition()
            .duration(3000)
                .attr("y", function(d) { if(d[1] == "Unknown") { return y(0); } else { return y(d[1]); };})
                .attr("height", function(d) { if(d[1] == "Unknown") { return 0; } else { return height - y(d[1]); };});
    };
};

// Horizontal bar chart (initial idea).
// function draw_bar_chart(year, country_code) {
//     d3.select("#svg_bar_chart").selectAll("*").remove();
//     all_data_country = my_data["data"][year][country_code]
//     percentages = all_data_country["percentages"]

//     var margin = {top: 20, right: 20, bottom: 30, left: 40};

//     var width = 600 - margin.left - margin.right;
//     var height = 200 - margin.top - margin.bottom;
    
//     var x = d3.scale.linear()
//         .domain([0, d3.max(percentages, function(d) { if(d[1] == "Unknown") { return 0; } else { return d[1]; };})])
//         .range([0, width]);

//     var y = d3.scale.ordinal()
//         .domain(percentages.map(function(d) { return d[0]; }))
//         .rangeRoundBands([height, 0], .1);

//     var x_axis = d3.svg.axis()
//         .scale(x)
//         .orient("bottom")

//     var y_axis = d3.svg.axis()
//         .scale(y)
//         .orient("left");

//     var svg = d3.select("#svg_bar_chart").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(x_axis);

//     svg.append("g")
//         .attr("class", "y axis")
//         .call(y_axis);
//         // Text label...

//     svg.selectAll(".bar")
//         .data(percentages)
//       .enter().append("rect")
//         .attr("class", "bar")
//         .attr("y", function(d) { return y(d[0]); })
//         .attr("width", function(d) { if(d[1] == "Unknown") { return 0; } else { return x(d[1]); };})
//         .attr("height", y.rangeBand());
// };
