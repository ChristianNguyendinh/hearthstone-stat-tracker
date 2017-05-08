var express = require('express');
var server = express();
var path = require('path');
var request = require('request');
var bodyparser = require('body-parser');
var routes = require('./routes/routes.js');

// temp until we figure other things out
var users = ['christian', 'christian-arena', 'testName']

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
// temp for now
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/d3-tip/')));

server.get('/', function(req, res) {
    res.send("Greetings Traveler");
});

server.get('/index/:name', function(req, res) {
    if (users.indexOf(req.params.name) != -1)
    	res.render('index', { name: req.params.name });
    else
    	res.send("Invalid User")
});

server.get('/stats/:name/', function(req, res) {
    if (users.indexOf(req.params.name) != -1)
    	res.render('stats', { name: req.params.name });
    else
    	res.send("Invalid User")
});

server.get('/graphs/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/graphs.html'));
});

server.post('/msg/', function(req, res) {
    console.log(req.body.message);
    res.send("good");
});

server.get('/msg/', function(req, res) {
	console.log("Asdffff")
    res.send("asdf");
});

////////// API Version 1 : SQLITE3 ////////////////////

server.post('/api/v1/:name/', routes.api_v1.postData);

server.get('/api/v1/winrate/:name', routes.api_v1.winRate);

server.get('/api/v1/winloss/:name', routes.api_v1.winLoss);

server.get('/api/v1/classresults/:name', routes.api_v1.classResults);

server.get('/api/v1/timestats/:name', routes.api_v1.timeStats);

////////// API Version 2 : POSTGRES ////////////////////

server.post('/api/v2/game/:name/', routes.api_v2.postData);

// Return the winrate in as a percent. Ex. {'count': 62.00}
server.get('/api/v2/winrate/:name', routes.api_v2.winRate);

// Return the number of wins and losses. Ex. {'win': 5, 'lose': 12}
server.get('/api/v2/winloss/:name', routes.api_v2.winLoss);

// Returns json data about match records against each class. 
// Ex. {... 'warlock': {'gamesWonAs': 4, 'gamesPlayedAs': 5, 'gamesLostAgainst': 2, 'gamesPlayedAgainst': 7}, ...}
server.get('/api/v2/classresults/:name', routes.api_v2.classResults);

// Day/Time functions here for later
server.get('/api/v2/timestats/:name', routes.api_v2.timeStats);


server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), function() {
    console.log("Server started... - " + new Date().toString());
});

