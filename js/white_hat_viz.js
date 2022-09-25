{
    const darkBlue = "#4575b4";
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
        .attr("height", h);

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

    d3.json("data/state_gender_murder.geojson", function (geodata) {
        //Create a path for each map feature in the data
        features
            .selectAll("path")
            .data(geodata.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                let maleRatio = d.properties.males / (d.properties.males + d.properties.females);
                let color_sequential = d3
                    .scaleSequential(d3.interpolate(darkRed, darkBlue))
                    .domain([0, 1]);

                return color_sequential(maleRatio);
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
            console.log("Here");
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
                    .attr("fill", "red")
                    .attr("fill-opacity", 0.5)
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
        .attr("height", 100);

    const ctx = colorScaleCanvas.node().getContext("2d");

    const color_sequential = d3
        .scaleSequential(d3.interpolate(darkBlue, darkRed))
        .domain([-1, 1]);

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
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Male", linearScale(-1) + 10, 85);
    ctx.fillText("Female", linearScale(1) - 115, 85);

    ctx.font = "15px";
    ctx.fillText("Murder ratio of Male to Female", linearScale(0) - 210, 85);


    //Position of the tooltip relative to the cursor
    const tooltipOffset = {x: 5, y: -25};

    //Create a tooltip, hidden at the start
    function showTooltipForState(d) {
        moveTooltipForState();

        tooltipForState
            .style("display", "block")
            .style("background", function () {
                let maleRatio = d.properties.males / (d.properties.males + d.properties.females);
                let color_sequential = d3
                    .scaleSequential(d3.interpolate(darkRed, darkBlue))
                    .domain([0, 1]);

                return color_sequential(maleRatio);
            })
            .style("color", '#ffffff');

        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

        let males = parseInt(d.properties.males);
        let females = parseInt(d.properties.females);

        let html = "";
        html = "<b>State: </b>" + d.properties.NAME
            + "<br><b>Murders: </b>" + (males + females)
            + "<br><b>Male: </b>" + males + " (" + (formatter.format((males / (males + females)) * 100))+ "%)"
            + "<br><b>Female: </b>" + females + " (" + (formatter.format((females / (males + females)) * 100))+ "%)";
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
            .scaleSequential(d3.interpolate("white", '#f88585'))
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
