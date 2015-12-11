/*
 * script.js
 *
 * This script implements the dashboard (i.e., the choropleth map, the bar
 * chart, and the interactivity).
 *
 * Name: Vincent Erich
 * Student number: 10384081
 */

// Global constants.

var loaded_data;
var highlight_fill_color = "#FC8D59";
var highlight_border_color = "rgba(250, 15, 160, 0.2)";
var no_interaction_color = "#bdbdbd";

//----------

// Global variables.

var selected_year = "2014";
var map_interaction = true;
var popup_on_hover = true;
var highlight_on_hover = true;
var country_code_selected_country;

//----------

/*
 * Execute when the page is loaded.
 */
window.onload = function() {
    fill_select_box();
    set_listener_on_map();
    get_data_and_draw_map();
};

//-------------------------------------

/*
 * Fills the <select> element on the web page with years from 1960 - 2014 
 * (including).
 */
function fill_select_box() {
    var select_box = d3.select("#select_box");
    var start = 1960;
    var end = 2014;

    for(i = start; i < end + 1; i++) {
        var option_text = i.toString();
        var option = select_box.append("option")
                            .attr("value", option_text)
                            .html(option_text);
        // Set the year 2014 as the default option. 
        if(i == 2014) {
            option
                .attr("selected", "selected");
        };
    }
};

//-------------------------------------

/*
 * Sets an event listener on the <div> element that holds the svg map (i.e.,
 * sets an event listener on the svg map). The event listener responds to
 * mouse click events. If a mouse click is registered, the map is deleted and
 * it is checked whether the value for 'map_interaction' is true. If so, the
 * value for 'map_interaction' is set to false, as well as the values for
 * 'popup_on_hover' and 'highlight_on_hover'. A new data object is created
 * (i.e., 'data_to_use') and this data is used to draw the map. If the value
 * for 'map_interaction' is false, it is set to true, as well as the values
 * for 'popup_on_hover' and 'highlight_on_hover'. The map is drawn with the 
 * (original) loaded data.
 */
function set_listener_on_map() {
    document.getElementById("svg_map").addEventListener("click", function() {
        d3.select("#svg_map").selectAll("*").remove();
        if (map_interaction) {
            map_interaction = false;
            popup_on_hover = false;
            highlight_on_hover = false;
            document.getElementById("interaction_info").innerHTML = "OFF";
            data_to_use = 
            {
                "data": { 
                    [selected_year]: {
                        [country_code_selected_country]: {
                            "fillKey": "highlight"
                        }
                    }
                }, 
                "fills": {
                    "highlight": highlight_fill_color,
                    "defaultFill": no_interaction_color
                }
            };

            draw_map(data_to_use);
        }
        else {
            map_interaction = true;
            popup_on_hover = true;
            highlight_on_hover = true;
            document.getElementById("interaction_info").innerHTML = "ON";
            draw_map();
        }
    });
};

//-------------------------------------

/*
 * Loads the data from the file 'data/data.json', and creates a JSON string
 * of this data. The JSON string is used to draw the map. 
 */
function get_data_and_draw_map() {
    d3.json("data/data.json", function(error, json) {
        if(error) {
            console.log(error);
        };
        // 'loaded_data' is a global!
        loaded_data = json;
        draw_map();
    });
};

//-------------------------------------

/*
 * This function is called when the user selects a different year from the
 * <select> element. This function sets the value for 'selected_year' to the
 * year selected by the user, restores all the necessary values, and redraws
 * the map (with the (original) loaded data).
 */
function year_changed() {
    selected_year = document.getElementById("select_box").value;
    map_interaction = true;
    popup_on_hover = true;
    highlight_on_hover = true;
    // Note that is does not matter to what value this variable is set, as
    // long as it is not a country code. 
    country_code_selected_country = "year_changed";
    document.getElementById("interaction_info").innerHTML = "ON";
    d3.select("#svg_map").selectAll("*").remove();
    d3.select("#svg_bar_chart").selectAll("*").remove();
    draw_map();
};

//-------------------------------------

/*
 * Draws the svg map. The argument 'data' is optional. If it is set, then that
 * data is used to draw the map. If not, then the (original) loaded data is
 * used to draw the map.
 */
function draw_map(data) {
    var data_to_use;
    if(draw_map.arguments.length == 1) {
        data_to_use = data;
    }
    else {
        data_to_use = loaded_data;
    }

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
                '<% } else { %>',
                'Population: unknown <% } %>',
                '<% draw_bar_chart(geography.properties.name, geography.id, data.total) %>',
                '</div>'
            ].join('')),
            popupOnHover: popup_on_hover,
            highlightOnHover: highlight_on_hover,
            highlightFillColor: highlight_fill_color,
            highlightBorderColor: highlight_border_color,
            highlightBorderWidth: 2
        },
        fills: data_to_use['fills'],
        data: data_to_use['data'][selected_year]
    });
};

//-------------------------------------

/*
 * Draws the svg bar chart (i.e., the distribution of age groups).
 */
function draw_bar_chart(country_name, country_code, population) {
    // Check whether the country is present in the data set.
    if(loaded_data['data'][selected_year].hasOwnProperty(country_code)) {
        // Check whether the country is already selected (if so, there is no
        // need to redraw the bar chart).
        if(country_code != country_code_selected_country) {
            country_code_selected_country = country_code

            all_data_country = loaded_data["data"][selected_year][country_code]
            percentages = all_data_country["percentages"]

            var margin = {top: 50, right: 20, bottom: 50, left: 50};
            var width = 230 - margin.left - margin.right;
            var height = 330 - margin.top - margin.bottom;

            // An ordinal scale object for the x-axis.
            var x = d3.scale.ordinal()
                .domain(percentages.map(function(d) { return d[0]; }))
                .rangeRoundBands([0, width], .2);

            // A linear scale object for the y-axis.
            var y = d3.scale.linear()
                .domain([0, d3.max(percentages, function(d) { if(d[1] == "Unknown") { return 0; } else { return d[1]; };})])
                .range([height, 0]);

            // An axis component for the x-axis.
            var x_axis = d3.svg.axis()
                .scale(x)
                .orient("bottom")

            // An axis component for the y-axis.
            var y_axis = d3.svg.axis()
                .scale(y)
                .orient("left");

            // Delete the old svg bar chart.
            d3.select("#svg_bar_chart").selectAll("*").remove();

            // Append a <svg> element to the right <div> element, and append
            // a <g> element to the <svg> element. The <g> element holds all
            // the other elements.
            var svg = d3.select("#svg_bar_chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Draw a <text> element with the name of the country.
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -40)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .text(country_name);

            // Draw a <text> element with the population.
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -25)
                .attr("text-anchor", "middle")
                .text("Population: " + population)

            // Draw the x-axis (including the x-axis label).
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(x_axis)
              .append("text")
                .attr("x", width / 2)
                .attr("y", 35)
                .attr("text-anchor", "middle")
                .text("Age group");

            // Draw the y-axis (including the y-axis label).
            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(height / 2))
                .attr("y", -35)
                .style("text-anchor", "middle")
                .text("Percentage of total population");

            // Create a <g> element (i.e., a container) for every bar.
            var bar_containers = svg.selectAll(".bar")
                .data(percentages)
              .enter().append("g")
                .attr("class", "bar_container");

            // Append a <rect> element to every <g> element. The <rect>
            // element represents the actual bar.   
            var bars = bar_containers.append("rect")
                .attr("x", function(d) { return x(d[0]); })
                .attr("y", y(0))
                .attr("width", x.rangeBand())
                .attr("height", 0)
                .style("fill", highlight_fill_color)
                .style("stroke", highlight_border_color)
                // Set an event listener on the <rect> element that responds
                // to mouse enter events.
                .on("mouseenter", function(d, i) {
                    var bar_container = d3.select(bar_containers[0][i]);
                    handle_mouse_enter(x, y, d, bar_container);
                    })
                // Set an event listener on the <rect> element that responds
                // to mouse out events.
                .on("mouseout", function(d, i) {
                    var bar_container = d3.select(bar_containers[0][i]);
                    handle_mouse_out(bar_container);
                });

            // Set a transition on the bars.
            bars
                .transition()
                .duration(3000)
                    .attr("y", function(d) { if(d[1] == "Unknown") { return y(0); } else { return y(d[1]); };})
                    .attr("height", function(d) { if(d[1] == "Unknown") { return 0; } else { return height - y(d[1]); };});
        };
    }
    else {
        country_code_selected_country = "country_not_in_dataset"
        d3.select("#svg_bar_chart").selectAll("*").remove();
    };
};

//-------------------------------------

/*
 * This function is called when the mouse enters a bar in the bar chart.
 */
function handle_mouse_enter(x_scale, y_scale, data, container) {
    // Draw a black border around the bar.
    container.select("rect")
        .style("stroke", "black")
        .style("stroke-width", 2);

    // Draw a text label with the percentage of total population.
    var label = container.append("text")
        .attr("x", function() { return x_scale(data[0]) + (x_scale.rangeBand() / 2); })
        .attr("y", function() { if(data[1] == "Unknown") { return y_scale(0) - 20; } else { return y_scale(data[1]) - 20; }; })
        .attr("dy", -5)
        .style("text-anchor", "middle")
        .style("opacity", 0.0)
        .text(function() { if(data[1] == "Unknown") { return "Unkn."; } else { return data[1].toFixed(2) + "%"; };});

    // Set a transition on the label.
    label
        .transition()
        .duration(500)
            .attr("y", function() { if(data[1] == "Unknown") { return y_scale(0); } else { return y_scale(data[1]); }; })
            .style("opacity", 1.0);
};

//-------------------------------------

/*
 * This function is called when the mouse exits a bar in the bar chart.
 */
function handle_mouse_out(container) {
    // Remove the black border around the bar (i.e., set the stroke to the
    // default color).
    container.select("rect")
        .style("stroke", highlight_border_color)
        .style("stroke-width", 1);

    // Remove the text label with the percentage of total population.
    container.select("text").remove();
};
