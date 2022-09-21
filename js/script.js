//Width and height
var w = 1500;
var h = 450;

//Define map projection
var projection = d3.geoAlbersUsa()
    .translate([w/2, h/2])
    .scale([1000]);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

d3.json("data/us-states.geojson", function(json) {
    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "steelblue");
});