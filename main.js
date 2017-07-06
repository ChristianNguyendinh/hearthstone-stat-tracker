const express = require('express');
const server = express();
const path = require('path');
const request = require('request');
const bodyparser = require('body-parser');
const session = require('client-sessions');
const routes = require('./routes/routes.js');

// Global Imports
config = require('./config.js');
pg = require('pg');
crypto = require('crypto');

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
// temp for now
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/d3-tip/')));

// Session Cookies for login
server.use(session({
    cookieName: 'poop',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    cookie: { 
        ephemeral: true
    }
}));


// Routes ///////////////////////////

server.get('/', (req, res) => {
    res.send("Greetings Traveler");
});

server.get('/index/', checkAuth, (req, res) => {
    res.render('index', { name: req.user });
});

server.get('/stats/', checkAuth, (req, res) => {
    res.render('stats', { name: req.user });
});

server.get('/dashboard/', checkAuth, (req, res) => {
    res.render('dashboard', { name: req.user });
});
server.get('/test/', (req, res) => {
    res.render('dashboard', {name: "asdf124"});
});

////////// Login and Registration ////////////////////

server.get('/login/', routes.login.loginGet);

server.post('/login/', routes.login.loginPost);

server.get('/register/', routes.register.registerGet);

server.post('/register/', routes.register.registerPost);

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

// Get the records for each class vs another class - see api file for format of data
server.get('/api/v2/classrecords/:name', routes.api_v2.totalRecords);


server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), function() {
    console.log("Server started... - " + new Date().toString());
});

// Middleware functions ///////

function checkAuth(req, res, next) {
    var auth = false;

    // add a middleware function that does this to the auth required pages
    pg.connect(config.conString, (err, client, done) => {
        if (err) return console.error(err);

        client.query('SELECT userid FROM sessions WHERE sessionid = $1;', [req.poop.sessionID], (err, result) => {
            if (err) return console.error(err);

            if (result.rowCount == 1) {
                auth = true;
                // Get the username from the users file
                client.query('SELECT username FROM users WHERE id = $1;', [result.rows[0].userid], (err, new_result) => {
                    if (err) return console.error(err);
                    
                    req.user = new_result.rows[0].username;
                })
                .then(() => {
                    done();
                    if (auth) {
                        next();
                    }
                    else {
                        res.redirect('/login')              
                    }
                });
            }
        })
    });
}
