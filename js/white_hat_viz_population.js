{
    const white = "#ffffff";
    const darkRed = '#d73027'

    //width and height
    const w = screen.width;
    const h = screen.height / 2;

    //Map projection
    const projection = d3
        .geoAlbersUsa()
        .scale(1000)
        .translate([w / 2, h / 2]); //translate to center the map in view

    //Generate paths based on projection
    const path = d3
        .geoPath()
        .projection(projection);

    //Create an SVG
    const svg = d3
        .select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "mapSvg");

    //Group for the map features
    const features = svg.append("g")
        .attr("class", "features");

    //Create a tooltip, hidden at the start
    let tooltipForState = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    //Create a tooltip, hidden at the start
    let tooltipForCity = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    //Keeps track of currently zoomed feature
    let centered;

    let color_sequential_for_state_background = d3
        .scaleSequential(d3.interpolate(white, darkRed))
        .domain([0, 0.000010113090032833224]);

    let color_sequential_num = d3
        .scaleSequential(d3.interpolate(0, 1))
        .domain([0, 0.000010113090032833224]);

    d3.json("data/state_gender_murder.geojson", function (geodata) {
        //Create a path for each map feature in the data
        features
            .selectAll("path")
            .data(geodata.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                return color_sequential_for_state_background(d.properties.murderToPopRatio);
            })
            .style('stroke', '#ffffff')
            .attr("cursor", "pointer")
            .attr("stroke-width", "1px")
            .on("mouseover", showTooltipForState)
            .on("mousemove", moveTooltipForState)
            .on("mouseout", hideTooltipForState)
            .on("click", clickedForState);
    });

    // Zoom to feature on click
    function clickedForState(d, i) {

        //Add any other onClick events here

        let x, y, k;

        function stateClick() {
            d3.csv("data/pop_loc_murder.csv", function (csv) {
                let murderByPop_max_ratio = 0; // using this to set max circle radius

                let dataToPass = [];

                for (let i = 0; i < csv.length; i++) {

                    if (csv[i].state_name !== d.properties.NAME) {
                        continue;
                    } else {
                        dataToPass.push(csv[i]);
                    }

                    let murders = parseInt(csv[i].males) + parseInt(csv[i].females);
                    let pop = parseInt(csv[i].pop);
                    let murderByPop = murders / pop;

                    if (murderByPop > murderByPop_max_ratio) {
                        murderByPop_max_ratio = murders;
                    }
                }

                features
                    .selectAll("circle")
                    .data(dataToPass).enter()
                    .append("circle")
                    .attr("cx", function (csv_d) {
                        return projection([csv_d.lng, csv_d.lat])[0];
                    })
                    .attr("cy", function (csv_d) {
                        return projection([csv_d.lng, csv_d.lat])[1];
                    })
                    .attr("r", function (csv_d) {
                        let bubbleScale = d3.scaleSqrt([0, murderByPop_max_ratio], [0, 50])
                        return bubbleScale(parseInt(csv_d.males) + parseInt(csv_d.females));
                    })
                    .attr("class", "city-circle")
                    .attr("fill", "#496dbb")
                    .attr("fill-opacity", 0.6)
                    .attr("cursor", "pointer")
                    .on("mouseover", showTooltipForCity)
                    .on("mousemove", moveTooltipForCity)
                    .on("mouseout", hideTooltipForCity);
            });
        }

        function removeAllCircles() {
            features
                .selectAll("circle")
                .remove();
        }

        if (d && centered !== d) {
            // Compute the new map center and scale to zoom to
            const centroid = path.centroid(d);
            const b = path.bounds(d);
            x = centroid[0];
            y = centroid[1];
            k = .8 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);
            centered = d

            // remove circles
            removeAllCircles();

            // add circles for state clicked
            stateClick();
        } else {
            x = w / 2;
            y = h / 2;
            k = 1;
            centered = null;

            // remove circles
            removeAllCircles();
        }

        // Highlight the new feature
        features.selectAll("path")
            .classed("highlighted", function (d) {
                return d === centered;
            })
            .style("stroke-width", 1 / k + "px"); // Keep the border width constant

        //Zoom and re-center the map
        //Uncomment .transition() and .duration() to make zoom gradual
        features
            .transition()
            .duration(500)
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
    }

    const colorScaleCanvas = d3
        .select("body")
        .append("canvas")
        .attr("width", w)
        .attr("height", 100)
        .attr("id", "legendCanvas");

    const ctx = colorScaleCanvas.node().getContext("2d");

    const color_sequential = d3
        .scaleSequential(d3.interpolate(white, darkRed))
        .domain([0, 1]);

    let linearScaleLengthRatio = 450;

    const linearScale = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([(w / 2) - linearScaleLengthRatio, (w / 2) + linearScaleLengthRatio]);

    d3.range(-1, 1, 0.0005)
        .forEach(function (d) {
            ctx.beginPath();
            ctx.strokeStyle = color_sequential(d);
            ctx.moveTo(linearScale(d), 50);
            ctx.lineTo(linearScale(d), 100);
            ctx.stroke();
        });

    ctx.font = "30px arial";
    ctx.fillStyle = "#414141";
    ctx.fillText("Lower", linearScale(-1) + 10, 85);

    ctx.fillStyle = "#f3f3f3";
    ctx.fillText("Higher", linearScale(1) - 115, 85);

    ctx.fillStyle = "#414141";
    ctx.font = "20px arial";
    ctx.fillText("Ratio between people murdered per state population", linearScale(0) - 240, 83);


    //Position of the tooltip relative to the cursor
    const tooltipOffset = {x: 5, y: -25};

    //Create a tooltip, hidden at the start
    function showTooltipForState(d) {
        moveTooltipForState();

        tooltipForState
            .style("display", "block")
            .style("background", function () {
                return color_sequential_for_state_background(d.properties.murderToPopRatio);
            })
            .style("color", function () {
                if (color_sequential_num(d.properties.murderToPopRatio) < 0.80) {
                    return '#000000';
                } else {
                    return '#ffffff';
                }

            });

        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

        const formatter_2 = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        let males = parseInt(d.properties.males);
        let females = parseInt(d.properties.females);

        let html = "";
        html = "<b>State: </b>" + d.properties.NAME
            + "<br><b>Murders: </b>" + (males + females) + " (" + (formatter.format(((males + females) / 11896) * 100))+ "% of U.S.)"
            + "<br><b>Male: </b>" + males + " (" + (formatter.format((males / (males + females)) * 100))+ "%)"
            + "<br><b>Female: </b>" + females + " (" + (formatter.format((females / (males + females)) * 100))+ "%)"
            + "<br>1 Murder per <b>" + (formatter_2.format(d.properties.population / (males + females)) + "</b> people");

        $(".tooltip").html(html);
    }

    //Move the tooltip to track the mouse
    function moveTooltipForState() {
        tooltipForState.style("top", (d3.event.pageY + tooltipOffset.y) + "px")
            .style("left", (d3.event.pageX + tooltipOffset.x) + "px");
    }

    //Create a tooltip, hidden at the start
    function hideTooltipForState() {
        tooltipForState.style("display", "none");
    }

    //Create a tooltip, hidden at the start
    function showTooltipForCity(d) {
        moveTooltipForCity();

        let males = parseInt(d.males);
        let females = parseInt(d.females);

        const color_sequential = d3
            .scaleSequential(d3.interpolate("white", '#496dbb'))
            .domain([0, 1]);

        tooltipForCity
            .style("display", "block")
            .style("background", color_sequential((males + females) / d.murdersPerState))
            .style("color", '#111111')
            .style("box-shadow", "5px 5px 20px 1px " + color_sequential((males + females) / d.murdersPerState));

        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

        let html = "";
        html = "<b>Location: </b>" + d.city_state
            + "<br><b>Murders: </b>" + (males + females) + " (" + (formatter.format(((males + females) / d.murdersPerState) * 100))+ "% of state)"
            + "<br><b>Male: </b>" + males + " (" + (formatter.format((males / (males + females)) * 100))+ "%)"
            + "<br><b>Female: </b>" + females + " (" + (formatter.format((females / (males + females)) * 100))+ "%)";
        $(".tooltip").html(html);
    }

    //Move the tooltip to track the mouse
    function moveTooltipForCity() {
        tooltipForCity.style("top", (d3.event.pageY + tooltipOffset.y) + "px")
            .style("left", (d3.event.pageX + tooltipOffset.x) + "px");
    }

    //Create a tooltip, hidden at the start
    function hideTooltipForCity() {
        tooltipForCity.style("display", "none");
    }
}
