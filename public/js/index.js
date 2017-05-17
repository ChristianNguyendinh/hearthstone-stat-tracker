var chartData = {'winloss': [0, 0], 
    'classAgainst': [
        {name: 'warlock', value: 0, color: 'purple', image: '/images/icons/icon_warlock.png'},
        {name: 'warrior', value: 0, color: 'maroon', image: '/images/icons/icon_warrior.png'},
        {name: 'rogue', value: 0, color: 'tomato', image: '/images/icons/icon_rogue.png'},
        {name: 'priest', value: 0, color: 'oldlace', image: '/images/icons/icon_priest.png'},
        {name: 'shaman', value: 0, color: 'teal', image: '/images/icons/icon_shaman.png'},
        {name: 'paladin', value: 0, color: 'khaki', image: '/images/icons/icon_paladin.png'},
        {name: 'mage', value: 0, color: 'navy', image: '/images/icons/icon_mage.png'},
        {name: 'hunter', value: 0, color: 'green', image: '/images/icons/icon_hunter.png'},
        {name: 'druid', value: 0, color: 'sienna', image: '/images/icons/icon_druid.png'}
    ]
};

var indexFromClass = {
    warlock: 0,
    warrior: 1,
    rogue: 2,
    priest: 3,
    shaman: 4,
    paladin: 5,
    mage: 6,
    hunter: 7,
    druid: 8
}

$('#mainForm').submit(function(e) {

    var count = 0;
    var obj = {};
    obj['name'] = userName;
    $('#mainForm').serializeArray().forEach(function(x) {
        if (x.name == 'myClass') {
            obj['mdeck'] = x.value;
        } else if (x.name == 'theirClass') {
            obj['tdeck'] = x.value;
            chartData['classAgainst'][indexFromClass[x.value]].value++;                   
        } else {
            obj['result'] = x.value;
            x.value == 'win' ? chartData['winloss'][0]++ : chartData['winloss'][1]++;;
        }
        count++;
    });

    if (count == 3) {
        // show game added
        $('#displayMessage').animate({opacity:1}, 1500, function() {
            $('#displayMessage').animate({opacity:0}, 1500);
        });
    } else {
        // error
        $('#errorMessage').animate({opacity:1}, 1500, function() {
            $('#errorMessage').animate({opacity:0}, 1500);
        });
        e.preventDefault();
        return;
    }

    obj['date'] = (new Date()).toString().split(" G")[0];
    console.log(obj);

    // clear button select
    var buttons = document.getElementsByClassName("hidden-input");
    for(var i = 0; i < buttons.length; i++) {
        buttons[i].checked = false;
    }

    var data = obj;
    /* Post here when adding a game state. When render stats server will req and load new page with data */
    $.ajax({type: "POST", url: "/api/v2/game/" + obj['name'], data: data}).done(function(d) {
        console.log(d);
    });

    updateBarChart();

    e.preventDefault();
});

// Charts -------------------------------------------------

var margin = {top: 75, right: 20, bottom: 40, left: 80};
var width = 1100 - margin.right - margin.left;
var height = 600 - margin.top - margin.bottom;

// init scales
var scaleX = d3.scaleLinear().range([0, width]);
var scaleY = d3.scaleBand().rangeRound([0, height]).padding(0.1);

// make axis objects
var xAxis = d3.axisBottom(scaleX);
var yAxis = d3.axisLeft(scaleY).tickFormat("");

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction('e')
    .offset([0, 10])
    .html(function(d) {
        return "<span>" + d.value + " " + d.name + " Something Blah</span>"
    });

// select group inside of content for the chart
var chart = d3.select("#chart")
    // .attr("width", width + margin.left + margin.left)
    // .attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.left) + " " + (height + margin.top + margin.bottom))
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the domain for the scales
scaleX.domain([0, d3.max(chartData['classAgainst'], function(d) { return d.value })]);
scaleY.domain(chartData['classAgainst'].map(function(d) { return d.name }));

// Append the x axis 
chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Append the Y axis
chart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-2,0)")
    .call(yAxis);

// Append tooltip
chart.call(tip);

// Title
chart.append("g")
    .attr("transform", "translate(" + (width * .25) + "," + (0 - margin.bottom) + ")")
    .append("text")
        .html("Games Played Against")
        .attr("class", "title")

// Tick Images
chart.select(".y").selectAll(".tick")
    .data(chartData['classAgainst'])
    .append("svg:image")
        .attr("width", 38)
        .attr("height", 37)
        .attr("y", -20)
        .attr("x", -50)
        .attr("xlink:href", function(d) { return d.image });

// create the bar chart
chart.selectAll("rect")
    .data(chartData['classAgainst'])
    .enter()
    .append("rect")
        .attr("y", function(d, i) { return scaleY(d.name) })
        .attr("height", scaleY.bandwidth())
        .attr("width", function(d, i) { return scaleX(d.value) })
        .style("fill", function(d) { return d.color })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

// update
function updateBarChart() {

    // remap the domains for new data
    scaleX.domain([0, d3.max(chartData['classAgainst'], function(d) { return d.value })]);
    scaleY.domain(chartData['classAgainst'].map(function(d) { return d.name }));
    
    // get the joins for the new data
    var r = chart.selectAll("rect")
        .data(chartData['classAgainst']);
    
    // enter for any new nodes    
    r.enter()
        .append("rect")
        .attr("y", function(d, i) { return scaleY(d.name) })
        .attr("height", scaleY.bandwidth())
        .attr("width", function(d, i) { return scaleX(d.value) })
        .style("fill", function(d) { return d.color });

    // remove any removed nodes
    r.exit().remove();

    // update the rest
    r.transition().duration(1000)
        .attr("y", function(d, i) { return scaleY(d.name) })
        .attr("height", scaleY.bandwidth())
        .attr("width", function(d, i) { return scaleX(d.value) })
        .style("fill", function(d) { return d.color });

    // remove old axis
    chart.selectAll("x axis").remove()

    // update new axis
    chart.append("g").transition().duration(1000)
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

}


