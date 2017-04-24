// temp until we get postgres up
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

exports.postData = function(req, res) {
    addGame(req.body);
    res.json({ message: "good" });
};

exports.winRate = function(req, res) {
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
};

exports.winLoss = function(req, res) {
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
};

exports.classResults = function(req, res) {
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
};

exports.timeStats = function(req, res) {
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
                    dateObj['dayCount'][6 - dayDiff]++;

                if (dayDiff < 28)
                    dateObj['monthCount'][27 - dayDiff]++;

                if (monthDiff < 12)
                    dateObj['yearCount'][11 - monthDiff]++;

            } else {
                console.log(err)
            }
        }, (err, rowc) => {
            res.json(dateObj);
        });
    });
};

addGame = function(data) {
    db.serialize(() => {
        console.log('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');
        db.run('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');

        console.log("game added");
    });
};