//width and height
var w = screen.width;
var h = (w/4);

//Define map projection
var projection = d3
    .geoAlbersUsa()
    .translate([w/2, h/2])
    .scale([800]);

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
            let maleRatio = d.properties.males / (d.properties.males + d.properties.females);
            let color_sequential = d3
                .scaleSequential(d3.interpolate(lightBlue, darkBlue))
                .domain([0, 1]);

            return color_sequential(maleRatio);
        })
        .style('stroke', '#000000');

    d3.csv("data/freq_by_state.csv", function (csv) {
        let max_people_murdered = 0; // using this to set max circle radius
        for (let i = 0; i < csv.length; i++) {
            let males = parseInt(csv[i].males);
            let females = parseInt(csv[i].females);

            if ((males + females) > max_people_murdered) {
                max_people_murdered = males + females;
            }
        }

        console.log(max_people_murdered)

        svg
            .selectAll("circle")
            .data(csv).enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1];
            })
            .attr("r", function (d) {
                let bubbleScale = d3.scaleSqrt([0, max_people_murdered], [0, 50])
                return bubbleScale(parseInt(d.males) + parseInt(d.females));
            })
            .attr("class", "city-circle")
            .attr("fill", "red")
            .attr("fill-opacity", 0.5)
    });

    svg
        .append("text")
        .attr("x", 100)
        .attr("y", 100)
        .classed('rotation', true)
        .attr('transform', 'translate( '+w/3+', '+ (h/1.95) +'),'+ 'rotate(-15)')
        .style("font", "bold 20px Gill Sans")
        .style("fill", "yellow")
        .text("EAST COAST OR MURDER COAST?");
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

ctx.font = "bold 30px Gill Sans";
ctx.fillText("Male", linearScale(-1), 50);
ctx.fillText("Female", linearScale(1) - 95, 50);

ctx.font = "15px";
ctx.fillText("Likelihood of murder based on gender", linearScale(0) - 230, 50);

