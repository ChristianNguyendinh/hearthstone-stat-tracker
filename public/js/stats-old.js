var wl = [0, 0]
var record = {};
var labelNames = [];

$.ajax({type: "GET", url: "/api/v2/winrate/" + userName}).done(function(d) {
    document.getElementById("ratio").innerHTML = d['count'].toString() + "% Overall Winrate";
});

$.ajax({type: "GET", url: "/api/v2/winloss/" + userName}).done(function(d) {
    wl[0] = d['win'];
    wl[1] = d['lose'];
}).then(() => {
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Wins", "Losses"],
            datasets: [{
                label: ' wins/losses',
                data: wl,
                backgroundColor: [
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255,99,132,1)'
                ],
                hoverBackgroundColor: [
                    'rgba(153, 102, 255, 0.4)',
                    'rgba(255, 99, 132, 0.4)'
                ],
                hoverBorderWidth: [
                    3, 3
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Win/Loss Rate'
            },
            animation: {
                animateRotate: true
            }
        }
    });
});

$.ajax({type: "GET", url: "/api/v2/classresults/" + userName}).done(function(d) {
    /* Need to preserve order to match the labels, so for now we do this dirty */
    let max = 0
    record['gamesPlayed'] = []
    record['gamesPlayed'][0] = (max = Math.max(max, d['warlock']['gamesPlayedAs']), d['warlock']['gamesPlayedAs']);
    record['gamesPlayed'][1] = (max = Math.max(max, d['warrior']['gamesPlayedAs']), d['warrior']['gamesPlayedAs']);
    record['gamesPlayed'][2] = (max = Math.max(max, d['druid']['gamesPlayedAs']), d['druid']['gamesPlayedAs']);
    record['gamesPlayed'][3] = (max = Math.max(max, d['shaman']['gamesPlayedAs']), d['shaman']['gamesPlayedAs']);
    record['gamesPlayed'][4] = (max = Math.max(max, d['rogue']['gamesPlayedAs']), d['rogue']['gamesPlayedAs']);
    record['gamesPlayed'][5] = (max = Math.max(max, d['mage']['gamesPlayedAs']), d['mage']['gamesPlayedAs']);
    record['gamesPlayed'][6] = (max = Math.max(max, d['hunter']['gamesPlayedAs']), d['hunter']['gamesPlayedAs']);
    record['gamesPlayed'][7] = (max = Math.max(max, d['paladin']['gamesPlayedAs']), d['paladin']['gamesPlayedAs']);
    record['gamesPlayed'][8] = (max = Math.max(max, d['priest']['gamesPlayedAs']), d['priest']['gamesPlayedAs']);

    record['gamesAgainst'] = []
    record['gamesAgainst'][0] = (max = Math.max(max, d['warlock']['gamesPlayedAgainst']), d['warlock']['gamesPlayedAgainst']);
    record['gamesAgainst'][1] = (max = Math.max(max, d['warrior']['gamesPlayedAgainst']), d['warrior']['gamesPlayedAgainst']);
    record['gamesAgainst'][2] = (max = Math.max(max, d['druid']['gamesPlayedAgainst']), d['druid']['gamesPlayedAgainst']);
    record['gamesAgainst'][3] = (max = Math.max(max, d['shaman']['gamesPlayedAgainst']), d['shaman']['gamesPlayedAgainst']);
    record['gamesAgainst'][4] = (max = Math.max(max, d['rogue']['gamesPlayedAgainst']), d['rogue']['gamesPlayedAgainst']);
    record['gamesAgainst'][5] = (max = Math.max(max, d['mage']['gamesPlayedAgainst']), d['mage']['gamesPlayedAgainst']);
    record['gamesAgainst'][6] = (max = Math.max(max, d['hunter']['gamesPlayedAgainst']), d['hunter']['gamesPlayedAgainst']);
    record['gamesAgainst'][7] = (max = Math.max(max, d['paladin']['gamesPlayedAgainst']), d['paladin']['gamesPlayedAgainst']);
    record['gamesAgainst'][8] = (max = Math.max(max, d['priest']['gamesPlayedAgainst']), d['priest']['gamesPlayedAgainst']);

    /* scale winrate to the highest play count */
    record['winrate'] = []
    record['winrate'][0] = (d['warlock']['gamesWonAs'] / d['warlock']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][1] = (d['warrior']['gamesWonAs'] / d['warrior']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][2] = (d['druid']['gamesWonAs'] / d['druid']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][3] = (d['shaman']['gamesWonAs'] / d['shaman']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][4] = (d['rogue']['gamesWonAs'] / d['rogue']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][5] = (d['mage']['gamesWonAs'] / d['mage']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][6] = (d['hunter']['gamesWonAs'] / d['hunter']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][7] = (d['paladin']['gamesWonAs'] / d['paladin']['gamesPlayedAs']).toFixed(2)*max;
    record['winrate'][8] = (d['priest']['gamesWonAs'] / d['priest']['gamesPlayedAs']).toFixed(2)*max;

    record['loserate'] = []
    record['loserate'][0] = (d['warlock']['gamesLostAgainst'] / d['warlock']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][1] = (d['warrior']['gamesLostAgainst'] / d['warrior']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][2] = (d['druid']['gamesLostAgainst'] / d['druid']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][3] = (d['shaman']['gamesLostAgainst'] / d['shaman']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][4] = (d['rogue']['gamesLostAgainst'] / d['rogue']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][5] = (d['mage']['gamesLostAgainst'] / d['mage']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][6] = (d['hunter']['gamesLostAgainst'] / d['hunter']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][7] = (d['paladin']['gamesLostAgainst'] / d['paladin']['gamesPlayedAgainst']).toFixed(2);
    record['loserate'][8] = (d['priest']['gamesLostAgainst'] / d['priest']['gamesPlayedAgainst']).toFixed(2);

    //console.log(record['games']);
}).then(() => {

    var ctx6 = document.getElementById("myBarChart1");
    var myBarChart1 = new Chart(ctx6, {
        type: 'bar',
        data: {
            labels: ["Warlock", "Warrior", "Druid", "Shaman", "Rogue", "Mage", "Hunter", "Paladin", "Priest"],
            datasets: [{
                data: record['gamesPlayed'],
                backgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ],
                hoverBackgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ]
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Games Played As'
            },
            legend: {
                display: false
            }
        }
    });

    var ctx7 = document.getElementById("myBarChart2");
    var myBarChart2 = new Chart(ctx7, {
        type: 'bar',
        data: {
            labels: ["Warlock", "Warrior", "Druid", "Shaman", "Rogue", "Mage", "Hunter", "Paladin", "Priest"],
            datasets: [{
                data: record['gamesAgainst'],
                backgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ],
                hoverBackgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ]
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Games Played Against'
            },
            legend: {
                display: false
            }
        }
    });


    var ctx2 = document.getElementById("myChart2");
    var myRadarChart = new Chart(ctx2, {
        type: 'radar',
        data: {
            labels: ["Warlock", "Warrior", "Druid", "Shaman", "Rogue", "Mage", "Hunter", "Paladin", "Priest"],
            datasets: [
                {
                    label: "Games Played",
                    backgroundColor: "rgba(179,181,198,0.2)",
                    borderColor: "rgba(179,181,198,0.5)",
                    pointBackgroundColor: "rgba(179,181,198,1)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(179,181,198,1)",
                    data: record['gamesPlayed']
                },
                {
                    label: "Games Won",
                    backgroundColor: "rgba(99,255,127,0.2)",
                    borderColor: "rgba(99,255,127,1)",
                    pointBackgroundColor: "rgba(99,255,127,1)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(99,255,127,1)",
                    data: record['winrate']
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Win Rate / Games Played Radar'
            }
        }
    });

    var ctx3 = document.getElementById("myChart3");
    var myPieChart = new Chart(ctx3, {
        type: 'pie',
        data: {
            labels: ["Warlock", "Warrior", "Druid", "Shaman", "Rogue", "Mage", "Hunter", "Paladin", "Priest"],
            datasets: [{
                data: record['loserate'],
                backgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ],
                hoverBackgroundColor: [
                    "#9630c1",
                    "#ed4f23",
                    "#3eaf2a",
                    "#775d32",
                    "#db0618",
                    "#0b4fbc",
                    "#2d6633",
                    "#e8ea60",
                    "#f9f4f9"
                ]
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Loss Rate Against Class'
            }
        }
    });
});

// Make api call to get days. On server format by:
// games played in last year
// games played in last 4 weeks (month)
// games played in each day in last week
// On toggle need to display different data
var dayArr = [];
var monthArr = [];
var yearArr = [];

var myData;

var myLineChart;

$.ajax({type: "GET", url: "/api/v2/timestats/" + userName}).done(function(d) {
    dayArr = d['dayCount'];
    monthArr = d['monthCount'];
    yearArr = d['yearCount'];
}).then(() => {

    var ctx4 = document.getElementById("myChart4");
    myLineChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: ["6", "5", "4", "3", "2", "1", "0"],
            datasets: [
                {
                    label: "Days Ago",
                    fill: false,
                    lineTension: 0.0,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: dayArr,
                    spanGaps: false,
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Time chart'
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Days ago"
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Games Played",
                    },
                    ticks: {
                        stepSize: 1
                    }
                }]
            }
        }
    });
});

var listDays = ["Sun", "Mon", "Tu", "Wed", "Th", "Fri","Sat"];
var listYears = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var pastDays = function(n) {
    
}

var pastMonths = function() {

}

$('#button1').click(function(e) {
    myLineChart.config.data.datasets[0].data = dayArr;
    myLineChart.config.data.datasets[0].label = "Days Ago";
    myLineChart.config.data.datasets[0].backgroundColor = "rgba(75,192,192,0.4)";
    myLineChart.config.data.datasets[0].borderColor = "rgba(75,192,192,1)";
    myLineChart.config.data.datasets[0].pointBorderColor = "rgba(75,192,192,1)";
    myLineChart.config.data.datasets[0].pointHoverBackgroundColor = "rgba(75,192,192,1)";

    myLineChart.config.data.labels = ["6", "5", "4", "3", "2", "1", "0"];

    myLineChart.options.title.display = true;
    myLineChart.options.title.text = "Cext Chart";
    myLineChart.options.scales.xAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.xAxes[0].scaleLabel.labelString = "Days Ago";
    myLineChart.options.scales.yAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.yAxes[0].scaleLabel.labelString = "Games Played";
    myLineChart.options.scales.yAxes[0].ticks.stepSize = 1;

    myLineChart.update();
});

$('#button2').click(function(e) {
    myLineChart.config.data.datasets[0].data = monthArr;
    myLineChart.config.data.datasets[0].label = "Days Ago";
    myLineChart.config.data.datasets[0].backgroundColor = "rgba(255,0,0,0.4)";
    myLineChart.config.data.datasets[0].borderColor = "rgba(255,0,0,1)";
    myLineChart.config.data.datasets[0].pointBorderColor = "rgba(255,0,0,1)";
    myLineChart.config.data.datasets[0].pointHoverBackgroundColor = "rgba(255,0,0,1)";

    myLineChart.config.data.labels = ["27", "26", "25", "24", "23", "22", "21", "20" ,"19", "18", "17", "16", "15", "14", "13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"];

    myLineChart.options.title.display = true;
    myLineChart.options.title.text = "Cext Chart";
    myLineChart.options.scales.xAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.xAxes[0].scaleLabel.labelString = "Days Ago";
    myLineChart.options.scales.yAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.yAxes[0].scaleLabel.labelString = "Games Played";
    myLineChart.options.scales.yAxes[0].ticks.stepSize = 1;

    myLineChart.update();
});

$('#button3').click(function(e) {
    myLineChart.config.data.datasets[0].data = yearArr;
    myLineChart.config.data.datasets[0].label = "Months Ago";
    myLineChart.config.data.datasets[0].backgroundColor = "rgba(0,255,0,0.4)";
    myLineChart.config.data.datasets[0].borderColor = "rgba(0,255,0,1)";
    myLineChart.config.data.datasets[0].pointBorderColor = "rgba(0,255,0,1)";
    myLineChart.config.data.datasets[0].pointHoverBackgroundColor = "rgba(0,255,0,1)";

    myLineChart.config.data.labels = ["11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"];

    myLineChart.options.title.display = true;
    myLineChart.options.title.text = "Mext Chart";
    myLineChart.options.scales.xAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.xAxes[0].scaleLabel.labelString = "Months Ago";
    myLineChart.options.scales.yAxes[0].scaleLabel.display = true;
    myLineChart.options.scales.yAxes[0].scaleLabel.labelString = "Games Played";
    myLineChart.options.scales.yAxes[0].ticks.stepSize = 1;

    myLineChart.update();
});