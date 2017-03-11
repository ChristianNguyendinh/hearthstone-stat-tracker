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

server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));

    request("http://127.0.0.1:3000/api/bob", function(error, response, body) {
        if (error)
            console.log(error)
        let j = JSON.parse(body)
        console.log(j.student);
    });
});

server.route('/api/:name')
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

server.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, function() {
    console.log("server started on port 3000");
});

cleanup = function() {
    console.log("closing database and cleaning up");
    db.close;
};

addGame = function(data) {
    db.serialize(() => {
        db.run('INSERT INTO combined (name, deck, opponent, result, date) VALUES ("' + 
            data.name + '", "' + data.mdeck + '", "' + data.tdeck + '", "' + data.result + '", "' + data.date + '")');

        /*db.each('SELECT * FROM users', (err, row) => {
            if (!err)
                console.log(row.id + " : " + row.name);
            });*/

        console.log("game added");
    });
};

process.on('exit', cleanup);

