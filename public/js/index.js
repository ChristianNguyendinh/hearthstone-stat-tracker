var chartData = {'winloss': [0, 0], 'classAgainst': {"warlock": 0, "warrior": 0, "druid": 0, "shaman": 0, "rogue": 0, "mage": 0, "hunter": 0, "paladin": 0, "priest": 0}};

$('#mainForm').submit(function(e) {

    var count = 0;
    var obj = {};
    obj['name'] = "<%= name %>";
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

    e.preventDefault();
});

// D3 stuff here



