var express = require('express');
var server = express();
var path = require('path');
var request = require('request');
var bodyparser = require('body-parser');
var routes = require('./routes/routes.js');


server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));

server.get('/', function(req, res) {
    res.send("Greetings Traveler");
});

server.get('/index/:name', function(req, res) {
	let users = ['christian', 'christian-arena', 'testName']
    if (users.indexOf(req.params.name) != -1)
    	res.render('index', { name: req.params.name });
    else
    	res.send("Invalid User")
});

server.get('/stats/:name/', function(req, res) {
    db.serialize(() => {
        db.each('SELECT result FROM combined WHERE name = \"' + req.params.name + '\"', (err, row) => {}, 
        (err, rowc) => {
            console.log(rowc)
            if (!err && rowc > 0) {
                res.render('stats', {
                    name: req.params.name
                });
            }
            else {
                res.render('notFound', {
                    name: req.params.name
                });
            }
        });
    });
});

server.get('/graphs/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/graphs.html'));
});

////////// API Version 1 : SQLITE3 ////////////////////

server.post('/api/v1/:name/', routes.api_v1.postData);

// Return the winrate in as a percent. Ex. {'count': 62.00}
server.get('/api/v1/winrate/:name', routes.api_v1.winRate);

// Return the number of wins and losses. Ex. {'win': 5, 'lose': 12}
server.get('/api/v1/winloss/:name', routes.api_v1.winLoss);

// Returns json data about match records against each class. 
// Ex. {... 'warlock': {'gamesWonAs': 4, 'gamesPlayedAs': 5, 'gamesLostAgainst': 2, 'gamesPlayedAgainst': 7}, ...}
server.get('/api/v1/classresults/:name', routes.api_v1.classResults);

// Day/Time functions here for later
server.get('/api/v1/timestats/:name', routes.api_v1.timeStats);

////////// API Version 2 : POSTGRES ////////////////////

// Test for postgres
server.get('/api/v2/test/:name', routes.api_v2.test);

server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), function() {
    console.log("Server started..." + newDate().toString());
});

