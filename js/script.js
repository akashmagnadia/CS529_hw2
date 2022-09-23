//width and height
var w = screen.width;
var h = w/3;

//Define map projection
var projection = d3
    .geoAlbersUsa()
    .translate([w/2, h/2])
    .scale([1000]);

//Define path generator
var path = d3
    .geoPath()
    .projection(projection);

//Create SVG element
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var canvas = d3
    .select("body")
    .append("canvas")
    .attr("width", 960)
    .attr("height", 500);

var ctx = canvas.node().getContext("2d");

d3.json("data/state_gender_murder.geojson", function(json) {
    //Bind data and create one path per GeoJSON feature
    svg
        .selectAll("path")
        .data(json.features).enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            if (d.properties.males > d.properties.females) {
                return "steelblue";
            } else {
                return "red";
            }
        })
        .style('stroke', '#000000');

    // d3.json("data/freq_by_state.json", function(json) {
    //     console.log(json);
    //     console.log(json[0].males);
    //     d3
    //         .select("body svg")
    //         .selectAll("path")
    //         .data(json).enter()
    //         .style("fill", "red");
    // });
});

var color_sequential = d3
    .scaleSequential(d3.interpolate("steelblue", "red"))
    .domain([-1, 1]);

var x = d3.scaleLinear().domain([-1, 1]).range([20, 500]);

d3.range(-1, 1, 0.001)
    .forEach(function (d) {
        console.log(d);
        ctx.beginPath();
        ctx.strokeStyle = color_sequential(d);
        ctx.moveTo(x(d), 80);
        ctx.lineTo(x(d), 100);
        ctx.stroke();
    });
