// move to config file
const pg = require('pg');
const conString = process.env.DATABASE_URL || 'postgres://localhost:5432/christian';

exports.postData = function(req, res) {
    addGame(req.body);
    res.json({ message: "good - v2" });
};

exports.winRate = function(req, res) {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);
        
        let ratioArr = [];
        let ratio = "invalid";

        client.query('SELECT result FROM games WHERE name = $1;', [req.params.name], (err, result) => {
            if (!err) {
                for (let i = 0; i < result.rowCount; i++) {
                    //console.log("GOT DATA: id: %s, name: %s", result.rows[i].id, result.rows[i].name);
                    ratioArr.push(result.rows[i].result);
                }
            } else {
                return console.error(err);
            }
        })
        .then(() => {
            done();
            if (ratioArr != "invalid" && ratioArr.length != 0) {
                ratio = ratioArr.reduce((acc, x) => { return x == 'win' ? acc + 1 : acc }, 0);
                ratio = (ratio / ratioArr.length).toFixed(2)*100;
            } 
            res.json({count: ratio});
        });
    });
};

exports.winLoss = function(req, res) {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);
        
        let winloss = {win: 0, lose: 0};
        client.query('SELECT result FROM games WHERE name = $1;', [req.params.name], (err, result) => {
            if (!err) {
                for (let i = 0; i < result.rowCount; i++) {
                    result.rows[i].result == 'win' ? winloss['win']++ : winloss['lose']++;
                }
            } else {
                console.log(err)
            }
        }).then(() => {
            done();
            res.json(winloss);
        });
    });
};

exports.classResults = function(req, res) {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

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
        client.query('SELECT * FROM games WHERE name = $1;', [req.params.name], (err, result) => {
            if (!err) {
                // id | name | deck | opponent | result | date
                for (let i = 0; i < result.rowCount; i++) {
                    record[result.rows[i].deck]['gamesPlayedAs']++;
                    record[result.rows[i].opponent]['gamesPlayedAgainst']++;
                    result.rows[i].result == 'win' ? record[result.rows[i].deck]['gamesWonAs']++ : record[result.rows[i].opponent]['gamesLostAgainst']++;
                }
            } else {
                console.log(err)
            }
        })
        .then(() => {
            done();
            res.json(record);
        });
    });
};

exports.timeStats = function(req, res) {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        let dateObj = {};
        dateObj['dayCount'] = (new Array(7)).fill(0);
        dateObj['monthCount'] = (new Array(28)).fill(0);
        dateObj['yearCount'] = (new Array(12)).fill(0);
        let today = new Date();
        
        client.query('SELECT date FROM games WHERE name = $1;', [req.params.name], (err, result) => {
            if (!err) {
                // id | name | deck | opponent | result | date
                // Sat Mar 11 2017 03:15:36
                for (let i = 0; i < result.rowCount; i++) {
                    let d = new Date(result.rows[i].date);
                    let dayDiff = Math.floor(Math.abs(today - d) / 86400000);
                    let monthDiff = Math.floor(Math.abs(today - d) / 2419000000);

                    if (dayDiff < 7)
                        dateObj['dayCount'][6 - dayDiff]++;

                    if (dayDiff < 28)
                        dateObj['monthCount'][27 - dayDiff]++;

                    if (monthDiff < 12)
                        dateObj['yearCount'][11 - monthDiff]++;
                }
            } else {
                console.log(err)
            }
        })
        .then(() => {
            done();
            res.json(dateObj);
        });
    });
};

exports.totalRecords = function(req, res) {
    var indexFromClass = {
        warlock: 0,
        warrior: 1,
        paladin: 2,
        shaman: 3,
        priest: 4,
        rogue: 5,
        hunter: 6,
        mage: 7,
        druid: 8
    }

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        // We can make this better later
        let dataObj = [
            {"class": "warlock", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "warrior", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "paladin", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "shaman", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "priest", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "rogue", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "hunter", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "mage", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
            {"class": "druid", "records": [
                {"class": "warlock", "wins": 0, "losses": 0},
                {"class": "warrior", "wins": 0, "losses": 0},
                {"class": "paladin", "wins": 0, "losses": 0},
                {"class": "shaman", "wins": 0, "losses": 0},
                {"class": "priest", "wins": 0, "losses": 0},
                {"class": "rogue", "wins": 0, "losses": 0},
                {"class": "hunter", "wins": 0, "losses": 0},
                {"class": "mage", "wins": 0, "losses": 0},
                {"class": "druid", "wins": 0, "losses": 0},
            ]},
        ];
        
        client.query('SELECT deck, opponent, result FROM games WHERE name = $1;', [req.params.name], (err, result) => {
            if (!err) {
                // id | name | deck | opponent | result | date
                for (let i = 0; i < result.rowCount; i++) {
                    let own_index = indexFromClass[result.rows[i].deck];
                    let their_index = indexFromClass[result.rows[i].opponent];
                    if (result.rows[i].result == "win")
                        dataObj[own_index]['records'][their_index]['wins']++; 
                    else
                        dataObj[own_index]['records'][their_index]['losses']++; 
                }
            } else {
                console.log(err)
            }
        })
        .then(() => {
            done();
            res.json(dataObj);
        });
    });
};

addGame = function(data) {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);
        /*console.log('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');*/
        client.query('INSERT INTO games (name, deck, opponent, result, date) VALUES ($1, $2, $3, $4, $5);', 
            [data.name, data.mdeck, data.tdeck, data.result, data.date])
        .then(() => {
            done();
            //console.log("game added");
        });
    });
};