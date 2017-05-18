var chartData = {'winloss': [0, 0], 'winrate': [0, 0], 
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
    //console.log(obj);

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

    // Update Winrate data
    var total = chartData['winloss'][0] + chartData['winloss'][1];
    chartData['winrate'] = [parseFloat((chartData['winloss'][0] / total).toFixed(2)), parseFloat((chartData['winloss'][1] / total).toFixed(2))];

    updateCharts();

    e.preventDefault();
});

// Charts -------------------------------------------------

var margin = {top: 75, right: 20, bottom: 40, left: 80};
var width = 1100 - margin.right - margin.left;
var height = 600 - margin.top - margin.bottom;
var radius = Math.min(width, height) / 2;

// init scales
var scaleX = d3.scaleLinear().range([0, width]);
var scaleY = d3.scaleBand().rangeRound([0, height]).padding(0.1);
var color = d3.scaleOrdinal().range(["#4286f4", "#ef3b56"]);

// make axis objects
var xAxis = d3.axisBottom(scaleX);
var yAxis = d3.axisLeft(scaleY).tickFormat("");

// Bar Chart -------------------------------------------------

// Tooltip for bar chart
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction('e')
    .offset([0, 10])
    .html(function(d) {
        return "<span>" + d.value + " " + d.name + " Something Blah</span>"
    });

// select group inside of content for the chart
var barChart = d3.select("#barChart")
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
barChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Append the Y axis
barChart.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-2,0)")
    .call(yAxis);

// Append tooltip
barChart.call(tip);

// Title
barChart.append("g")
    .attr("transform", "translate(" + (width * .25) + "," + (0 - margin.bottom) + ")")
    .append("text")
        .html("Games Played Against")
        .attr("class", "title")

// Tick Images
barChart.select(".y").selectAll(".tick")
    .data(chartData['classAgainst'])
    .append("svg:image")
        .attr("width", 38)
        .attr("height", 37)
        .attr("y", -20)
        .attr("x", -50)
        .attr("xlink:href", function(d) { return d.image });

// create the bar chart
barChart.selectAll("rect")
    .data(chartData['classAgainst'])
    .enter()
    .append("rect")
        .attr("y", function(d, i) { return scaleY(d.name) })
        .attr("height", scaleY.bandwidth())
        .attr("width", function(d, i) { return scaleX(d.value) })
        .style("fill", function(d) { return d.color })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

// Pie Chart -------------------------------------------------

var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 100);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

var pieChart = d3.select("#pieChart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Tooltip for donut chart
var tooltip = pieChart.append('text')
    .attr('class', 'tooltipText')
    .attr('x', -40)
    .attr('y', 10);

var tipContainer = pieChart.append('rect')
    .attr('x', -60)
    .attr('y', -65)
    .attr('class', 'tooltipContainer')
    .attr('rx', '15')
    .attr('ry', '15');

var tooltip = pieChart.append('text')
    .attr('class', 'tooltipText')
    .attr('x', -40)
    .attr('y', 10);

var g = pieChart.selectAll(".arc")
    .data(pie(chartData['winrate']))
    .enter().append("g")
    .attr("class", "arc");

g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data); })
    .on("mouseover", function(d) {
        var total = d.data;
        tooltip.html(d.data * 100 + '%');
        tooltip.style('display', 'block');
        tipContainer.style('display', 'block');
    })
    .on("mouseout", function() {
        tooltip.style('display', 'none');
        tipContainer.style('display', 'none');
    });

// Update Charts ---------------------

function updateCharts() {

    // Update Bar Chart ==============

    // remap the domains for new data
    scaleX.domain([0, d3.max(chartData['classAgainst'], function(d) { return d.value })]);
    scaleY.domain(chartData['classAgainst'].map(function(d) { return d.name }));
    
    // get the joins for the new data
    var r = barChart.selectAll("rect")
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
    barChart.selectAll("x axis").remove()

    // update new axis
    barChart.append("g").transition().duration(1000)
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Update Pie Chart ==============

    var p = pieChart.selectAll(".arc")
        .data(pie(chartData['winrate']));

    // No new or removed data, so no need for enter or exit
    p.select("path").transition().duration(750).attrTween("d", arcTween)
        .style("fill", function(d, i) { return color(i); })

}

function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}

