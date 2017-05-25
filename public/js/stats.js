var imageData = {
    "warlock": '/images/icons/icon_warlock.png',
    "warrior": '/images/icons/icon_warrior.png',
    "rogue": '/images/icons/icon_rogue.png',
    "priest": '/images/icons/icon_priest.png',
    "shaman": '/images/icons/icon_shaman.png',
    "paladin": '/images/icons/icon_paladin.png',
    "mage": '/images/icons/icon_mage.png',
    "hunter": '/images/icons/icon_hunter.png',
    "druid": '/images/icons/icon_druid.png'
};

// Table ////////////////////////////////////////////////////////////////

var tableData = null;

$.ajax({type: "GET", url: "/api/v2/classrecords/" + userName}).done(function(d) {
    tableData = d;
}).then(function() {
    // Add the placeholder for formatting
    tableData.unshift({"class": "placeholder"});

    var margin = {top: 85, right: 20, bottom: 40, left: 80};
    var width = 1100 - margin.right - margin.left;
    var height = 700 - margin.top - margin.bottom;

    // init scales
    var scaleX = d3.scaleBand().rangeRound([0, width]);
    var scaleY = d3.scaleBand().rangeRound([0, height]);

    // Init axes
    var xAxis = d3.axisTop(scaleX);
    var yAxis = d3.axisLeft(scaleY);

    // Select the table
    var table = d3.select("#table")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set domain for scales
    scaleX.domain(tableData.map(function(d) { return d.class }));
    scaleY.domain(tableData.map(function(d) { return d.class }));

    // Vertical Lines
    table.selectAll(".y .table-line")
        .data(tableData)
        .enter()
        .append("line")
            .attr("x1", function(d) { return scaleX(d.class) })
            .attr("x2", function(d) { return scaleX(d.class) })
            .attr("y1", 0)
            .attr("y2", height - scaleY.bandwidth())
            .attr("class", "y table-line")

    // Images on top
    table.selectAll(".y-image")
        .data(tableData.slice(1))
        .enter()
        .append("svg:image")
            .attr("width", 38)
            .attr("height", 37)
            .attr("y", -40)
            .attr("x", function(d) { return scaleX(d.class) - (scaleX.bandwidth() / 1.5)})
            .attr("xlink:href", function(d) { return imageData[d.class] })
            .attr("class", "y-image");

    // Horizontal Lines
    table.selectAll(".x .table-line")
        .data(tableData)
        .enter()
        .append("line")
            .attr("x1", 0)
            .attr("x2", width - scaleX.bandwidth())
            .attr("y1", function(d) { return scaleY(d.class) })
            .attr("y2", function(d) { return scaleY(d.class) })
            .attr("class", "x table-line");

    // Images on top
    table.selectAll(".x-image")
        .data(tableData.slice(1))
        .enter()
        .append("svg:image")
            .attr("width", 38)
            .attr("height", 37)
            .attr("y", function(d) { return scaleY(d.class) - (scaleY.bandwidth() * 0.8)})
            .attr("x", -50)
            .attr("xlink:href", function(d) { return imageData[d.class] })
            .attr("class", "x-image");

    // Columns for recrds + background rects
    var columns = table.selectAll(".column")
        .data(tableData.slice(1))
        .enter()
        .append("g")
            .attr("class", "column")
            .attr("transform", function(d) { return "translate(" + (scaleX(d.class) - (scaleX.bandwidth() * .75)) + ")" });
     
    // Background rects   
    columns.selectAll("rect")
        .data(function(d) { return d.records})
        .enter()
        .append("rect")
            .attr("width", scaleX.bandwidth() - 3)
            .attr("height", scaleY.bandwidth() - 4)
            .attr("x", -(scaleX.bandwidth() * 0.24))
            .attr("y", function(d) { return scaleY(d.class) - (scaleY.bandwidth() - 2) })
            .attr("class", function(d) { 
                if (d.wins > d.losses) 
                    return "win-block block"
                else if (d.wins < d.losses)
                    return "lose-block block"
                else
                    return "tie-block block"
            });

    // Records
    columns.selectAll("text")
        .data(function(d) { return d.records})
        .enter()
        .append("text")
            .html(function(d) { return d.wins + " - " + d.losses })
            .attr("y", function(d) { return scaleY(d.class) - (scaleY.bandwidth() * 0.4) })
            .attr("class", "record-text");

    // Title
    table.append("g")
        .attr("transform", "translate(" + (width * .4) + "," + (-20 - margin.bottom) + ")")
        .append("text")
            .html("Your Class")
            .attr("class", "table-title")
});


// Line Chart ////////////////////////////////////////////////////////////////

var timeData = null;
var lineChartData = null;

var margin = {top: 85, right: 20, bottom: 40, left: 80};
var width = 1100 - margin.right - margin.left;
var height = 700 - margin.top - margin.bottom;

// init scales
var scaleLineX = d3.scaleLinear().rangeRound([0, width]);
var scaleLineY = d3.scaleLinear().rangeRound([height, 0]);

var xAxis = null;
var yAxis = null;

// Create line function for x,y positions
var line = d3.line()
    .x(function(d, i) { return scaleLineX(i) })
    .y(function(d, i) { return scaleLineY(d) });

var lineChart = d3.select("#lineChart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.left) + " " + (height + margin.top + margin.bottom))
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

$.ajax({type: "GET", url: "/api/v2/timestats/" + userName}).done(function(d) {
    timeData = d;
}).then(function() {
    // initial dataset
    lineChartData = timeData['dayCount'];

    // Set domain for scales
    scaleLineX.domain([0, lineChartData.length - 1]);
    scaleLineY.domain([0, d3.max(lineChartData)]);

    // Create Axes
    xAxis = d3.axisBottom(scaleLineX).ticks(lineChartData.length).tickFormat(formatDateLabel);
    yAxis = d3.axisLeft(scaleLineY);

    // Append the x axis 
    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Append the Y axis
    lineChart.append("g")
        .attr("class", "axis")
        .call(yAxis);

    // Title
    lineChart.append("g")
        .attr("transform", "translate(" + width * 0.3 + ",-25)")
        .append("text")
            .html("Games Played in Last 7 Days")
            .attr("class", "line-title")

    // Draw the line
    lineChart.append("path")
        .datum(lineChartData)
        .attr("class", "lc-path")
        .attr("d", line)
        .attr("stroke", "#34c");

    // Draw the dots
    lineChart.selectAll(".dot")
        .data(lineChartData)
        .enter()
        .append("circle")
            .attr("r", 5)
            .attr("cx", function(d, i) { return scaleLineX(i) })
            .attr("cy", function(d, i) { return scaleLineY(d) })
            .attr("fill", "#34c")
            .attr("class", "dot");
});

// Line Chart Helpers --------

function updateLineChart(type) {
    // update data
    var titleText = "";
    var strokeColor = "";
    if (type == "year") {
        lineChartData = timeData['yearCount'];
        titleText = "Games Played in Last 12 Months";
        strokeColor = "#e44";
    }
    else if (type == "month") {
        lineChartData = timeData['monthCount'];
        titleText = "Games Played in Last 4 Weeks";
        strokeColor = "#1b7";
    }
    else {
        lineChartData = timeData['dayCount'];
        titleText = "Games Played in Last 7 Days";
        strokeColor = "#34c";
    }

    // update scales
    scaleLineX.domain([0, lineChartData.length - 1]);
    scaleLineY.domain([0, d3.max(lineChartData)]);

    // Remove old data
    lineChart.selectAll(".axis").remove();
    lineChart.selectAll(".path").remove();
    lineChart.selectAll(".dot").remove();

    // new title
    lineChart.selectAll(".line-title").html(titleText)

    // new X axis 
    xAxis = d3.axisBottom(scaleLineX).ticks(lineChartData.length > 15 ? lineChartData.length / 2 : lineChartData.length).tickFormat(formatDateLabel);
    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // new Y axis
    lineChart.append("g").transition().duration(1000)
        .attr("class", "axis")
        .call(yAxis);

    // new line
    lineChart.select(".lc-path").transition().duration(500)
        .attr("d", line(lineChartData))
        .attr("stroke", strokeColor);

    // New dots
    lineChart.selectAll(".dot")
        .data(lineChartData)
        .enter()
        .append("circle")
            .attr("r", 0)
            .attr("cx", function(d, i) { return scaleLineX(i) })
            .attr("cy", function(d, i) { return scaleLineY(d) })
            .attr("fill", strokeColor)
            .attr("class", "dot")
            .transition().duration(1500)
                .attr("r", 5);
}

function formatDateLabel(d, i) {
    var d = new Date();
    if (lineChartData.length != 12) {
        d.setDate(d.getDate() - (lineChartData.length - 1 - i));
        return d.toLocaleDateString();
    } 
    else {
        var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        d.setMonth(d.getMonth() - (lineChartData.length - 1 - i));
        return monthArray[d.getMonth()];
    }
}

document.getElementById("lineDay").onclick = function(e) {
    updateLineChart("day");
}

document.getElementById("lineMonth").onclick = function(e) {
    updateLineChart("month");
}

document.getElementById("lineYear").onclick = function(e) {
    updateLineChart("year");
}







