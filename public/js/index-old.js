var chartData = {'winloss': [0, 0], 'classAgainst': {"warlock": 0, "warrior": 0, "druid": 0, "shaman": 0, "rogue": 0, "mage": 0, "hunter": 0, "paladin": 0, "priest": 0}};

$('#mainForm').submit(function(e) {

    var count = 0;
    var obj = {};
    obj['name'] = userName;
    $('#mainForm').serializeArray().forEach(function(x) {
        if (x.name == 'myClass') {
            obj['mdeck'] = x.value;
        } else if (x.name == 'theirClass') {
            obj['tdeck'] = x.value;
            chartData['classAgainst'][x.value]++;                   
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

    donutChart.config.data.datasets[0].data = chartData['winloss'];
    barChart.config.data.datasets[0].data = Object.values(chartData['classAgainst']);

    donutChart.update();
    barChart.update();

    e.preventDefault();
});

var ctx = document.getElementById("donutChart");
var donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ["Wins", "Losses"],
        datasets: [{
            label: ' wins/losses',
            data: chartData['winloss'],
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
            text: 'Win/Loss Rate for This Session'
        },
        animation: {
            animateRotate: true
        }
    }
});

var ctx1 = document.getElementById("barChart");
var barChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ["Warlock", "Warrior", "Druid", "Shaman", "Rogue", "Mage", "Hunter", "Paladin", "Priest"],
        datasets: [{
            data: Object.values(chartData['classAgainst']),
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
            text: 'Classes Played Against'
        },
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 0,
                    stepSize: 1
                }
            }]
        }
    }
});