/*
 * d3map.js
 *
 * Creates a cloropleth map of the population per country in 2014.
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

    $("#svg_map").datamap({
        scope: 'world',
        geography_config: {
            borderWidth: 0.3,
            borderColor: 'black',
            popupTemplate: _.template([
                '<div class="hoverinfo">',
                '<strong><%= geography.properties.name %></strong></br>',
                '<% if (data.population) { %>',
                'Population: <%= data.population %><% } %>',
                '</div>'
            ].join('') ),
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2
        },
        fills: my_data['fills'],
        data: my_data['data']
    })
});
