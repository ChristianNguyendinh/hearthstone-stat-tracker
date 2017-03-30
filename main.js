var express = require('express');
var server = express();
var path = require('path');
var request = require('request');
var bodyparser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));

server.get('/index/', function(req, res) {
    res.render('index');
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

server.route('/api/:name/')
    .post(function(req, res) {
        console.log(req.body);
        console.log(req.body.name);
        console.log(req.body.date);
        addGame(req.body);
        res.json({ message: "good" });
    })
    .get(function(req, res) {
        res.json({student: req.params.name});
    });

// Return the winrate in as a percent. Ex. {'count': 62.00}
server.get('/api/winrate/:name', function(req, res) {
    let ratioArr = [];
    let ratio = "invalid";
    db.serialize(() => {
        db.each('SELECT result FROM combined WHERE name = \"' + req.params.name + '\"', (err, row) => {
            if (!err) {
                ratioArr.push(row.result);
            } else {
                console.log(err)
            }
        }, (err, rowc) => {
            if (!err && rowc > 0) {
                ratio = ratioArr.reduce((acc, x) => { return x == 'win' ? acc + 1 : acc }, 0);
                ratio = (ratio / ratioArr.length).toFixed(2)*100;
            } 
            res.json({count: ratio});
        });
    });
});

// Return the number of wins and losses. Ex. {'win': 5, 'lose': 12}
server.get('/api/winloss/:name', function(req, res) {
    let winloss = {win: 0, lose: 0};
    db.serialize(() => {
        db.each('SELECT result FROM combined WHERE name = \"' + req.params.name + '\"', (err, row) => {
            if (!err) {
                row.result == 'win' ? winloss['win']++ : winloss['lose']++;
            } else {
                console.log(err)
            }
        }, (err, rowc) => {
            res.json(winloss);
        });
    });
});

// Returns json data about match records against each class. 
// Ex. {... 'warlock': {'gamesWonAs': 4, 'gamesPlayedAs': 5, 'gamesLostAgainst': 2, 'gamesPlayedAgainst': 7}, ...}
server.get('/api/classresults/:name', function(req, res) {
    let record = {
        'warlock': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'warrior': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'paladin': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'druid': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'rogue': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'priest': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'hunter': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'mage': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 },
        'shaman': { 'gamesWonAs': 0, 'gamesPlayedAs': 0, 'gamesLostAgainst': 0, 'gamesPlayedAgainst': 0 }
    };
    db.serialize(() => {
        db.each('SELECT * FROM combined WHERE name = \"' + req.params.name + '\"', (err, row) => {
            if (!err) {
                // id | name | deck | opponent | result | date
                record[row.deck]['gamesPlayedAs']++;
                record[row.opponent]['gamesPlayedAgainst']++;
                row.result == 'win' ? record[row.deck]['gamesWonAs']++ : record[row.opponent]['gamesLostAgainst']++;
            } else {
                console.log(err)
            }
        }, (err, rowc) => {
            res.json(record);
        });
    });
});

// Day/Time functions here for later
server.get('/api/timestats/:name', function(req, res) {
    let dateObj = {};
    dateObj['dayCount'] = (new Array(7)).fill(0);
    dateObj['monthCount'] = (new Array(28)).fill(0);
    dateObj['yearCount'] = (new Array(12)).fill(0);
    let today = new Date();
    db.serialize(() => {
        db.each('SELECT date FROM combined WHERE name = \"' + req.params.name + '\"', (err, row) => {
            if (!err) {
                // id | name | deck | opponent | result | date
                // Sat Mar 11 2017 03:15:36
                let d = new Date(row.date);
                let dayDiff = Math.floor(Math.abs(today - d) / 86400000);
                let monthDiff = Math.floor(Math.abs(today - d) / 2419000000);

                if (dayDiff < 7)
                    dateObj['dayCount'][dayDiff]++;

                if (dayDiff < 28)
                    dateObj['monthCount'][dayDiff]++;

                if (monthDiff < 12)
                    dateObj['yearCount'][monthDiff]++;

            } else {
                console.log(err)
            }
        }, (err, rowc) => {
            res.json(dateObj);
        });
    });
});

server.listen(3000, function() {
    console.log("server started on port 3000");
});

addGame = function(data) {
    db.serialize(() => {
        console.log('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');
        db.run('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');

        console.log("game added");
    });
};

cleanup = function() {
    console.log("closing database and cleaning up");
    db.close;
    process.exit();
};
// this can be done better
process.on('SIGINT', cleanup);

