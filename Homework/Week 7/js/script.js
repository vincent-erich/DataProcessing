/*
 * script.js
 *
 * Short description here...
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

var my_data;
var selected_year = "2014";
var popup_on_hover = true;
var country_code_selected_country;

fill_select();
set_listener_on_map();
get_data();

function fill_select() {
    var select_box = d3.select("#select_box");
    var min = 1960;
    var max = 2014;

    for(i = min; i < max + 1; i++) {
        var option_text = i.toString();
        var option = select_box.append("option")
                            .attr("value", option_text)
                            .html(option_text); 
        if(i == 2014) {
            option
                .attr("selected", "selected");
        };
    }
};

function set_listener_on_map() {
    document.getElementById("svg_map").addEventListener("click", function() {
        console.log("click...");
        if (popup_on_hover) {
            popup_on_hover = false;
            document.getElementById("popup_info").innerHTML = "OFF";
        }
        else {
            popup_on_hover = true;
            document.getElementById("popup_info").innerHTML = "ON";
        }
        d3.select("#svg_map").selectAll("*").remove();
        draw_map();
    });
};

function get_data() {
    d3.json("data/data.json", function(error, json) {
        if(error) {
            console.log(error);
        };
        my_data = json;
        draw_map();
    });
};

function year_changed() {
    selected_year = document.getElementById("select_box").value;
    d3.select("#svg_map").selectAll("*").remove();
    d3.select("#svg_bar_chart").selectAll("*").remove();
    country_code_selected_country = "new_year";
    draw_map();
};

function draw_map() {
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
                '<i>The distribution of age groups is shown on the right.</i></br></br>',
                '<i>Note: If no bars are visible, then the distribution of </br> age groups is unknown (e.g., Greenland).</i>',
                '<% } else { %>',
                'Population: unknown <% } %>',
                '<% draw_bar_chart(geography.properties.name, geography.id) %>',
                '</div>'
            ].join('')),
            popupOnHover: popup_on_hover,
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2
        },
        fills: my_data['fills'],
        data: my_data['data'][selected_year]
    });
};

// Vertical bar chart.
function draw_bar_chart(country_name, country_code) {
    // Country is present in the data set.
    if(my_data['data'][selected_year].hasOwnProperty(country_code)) {
        if(country_code != country_code_selected_country) {
            country_code_selected_country = country_code
            d3.select("#svg_bar_chart").selectAll("*").remove();

            all_data_country = my_data["data"][selected_year][country_code]
            percentages = all_data_country["percentages"]

            var margin = {top: 40, right: 20, bottom: 50, left: 50};
            var width = 230 - margin.left - margin.right;
            var height = 330 - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .domain(percentages.map(function(d) { return d[0]; }))
                .rangeRoundBands([0, width], .2);

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
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .text(country_name);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(x_axis)
              .append("text")
                .attr("x", width / 2)
                .attr("y", 35)
                .attr("text-anchor", "middle")
                .text("Age group");

            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(height / 2))
                .attr("y", -35)
                .style("text-anchor", "middle")
                .text("Percentage of total population");

            var bar_containers = svg.selectAll(".bar")
                .data(percentages)
              .enter().append("g")
                .attr("class", "bar_container");

            var bars = bar_containers.append("rect")
                .attr("x", function(d) { return x(d[0]); })
                .attr("y", y(0))
                .attr("width", x.rangeBand())
                .attr("height", 0);

            var labels = bar_containers.append("text")
                .attr("x", function(d) { return x(d[0]) + (x.rangeBand() / 2); })
                .attr("y", y(0) - 5)
                .style("text-anchor", "middle")
                .text(function(d) { if(d[1] == "Unknown") { return "Unkn."; } else { return d[1].toFixed(2) + "%"; };}); 

            bars
                .transition()
                .duration(3000)
                    .attr("y", function(d) { if(d[1] == "Unknown") { return y(0); } else { return y(d[1]); };})
                    .attr("height", function(d) { if(d[1] == "Unknown") { return 0; } else { return height - y(d[1]); };});

            labels
                .transition()
                .duration(3000)
                    .attr("y", function(d) { if(d[1] == "Unknown") { return y(0); } else {return y(d[1])}; })
                    .attr("dy", -5);
        };
    }
    else {
        country_code_selected_country = "country_not_in_dataset"
        d3.select("#svg_bar_chart").selectAll("*").remove();
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
