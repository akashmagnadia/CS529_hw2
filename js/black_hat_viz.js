//width and height
var w = screen.width;
var h = w/4;

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

let darkBlue = "#3182bd";
let lightBlue = "#9ecae1";

d3.json("data/state_gender_murder.geojson", function(json) {
    //Bind data and create one path per GeoJSON feature
    svg
        .selectAll("path")
        .data(json.features).enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            if (d.properties.males > d.properties.females) {
                return darkBlue;
            } else {
                return lightBlue;
            }
        })
        .style('stroke', '#000000');
});

var colorScaleCanvas = d3
    .select("body")
    .append("canvas")
    .attr("width", w)
    .attr("height", 100);

var ctx = colorScaleCanvas.node().getContext("2d");

var color_sequential = d3
    .scaleSequential(d3.interpolate(darkBlue, lightBlue))
    .domain([-1, 1]);

let linearScaleLengthRatio = 450;

var linearScale = d3
    .scaleLinear()
    .domain([-1, 1])
    .range([(w/2) - linearScaleLengthRatio, (w/2) + linearScaleLengthRatio]);

d3.range(-1, 1, 0.001)
    .forEach(function (d) {
        ctx.beginPath();
        ctx.strokeStyle = color_sequential(d);
        ctx.moveTo(linearScale(d), 50);
        ctx.lineTo(linearScale(d), 100);
        ctx.stroke();
    });

ctx.font = "bold 30px Gill Sans bold";
ctx.fillText("Male", linearScale(-1), 50);
ctx.fillText("Female", linearScale(1) - 95, 50);

ctx.font = "15px";
ctx.fillText("Likelihood of murder based on gender", linearScale(0) - 230, 50);

