var express = require('express');
var server = express();
var path = require('path');
var request = require("request");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

var options = {
    host: "127.0.0.1",
    path: "/api/bob"
}

server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));

    request("http://127.0.0.1:3000/api/bob", function(error, response, body) {
        if (error)
            console.log(error)
        let j = JSON.parse(body)
        console.log(j.student);
    });
});

server.use(express.static(path.join(__dirname, 'public')));

server.route('/api/:name')
    .post(function(req, res) {
        console.log(req.params.name);
        res.json({ message: "good" });
    })
    .get(function(req, res) {
        res.json({student: req.params.name});
    });

server.listen(3000, function() {
    console.log("server started on port 3000");
});

callback = function(res) {
    console.log("hey")
    res.on('data', function(data) {
        console.log(data);
    })
};

accessDatabase = function() {
    db.serialize(() => {

        db.run('INSERT INTO users (name) VALUES ("Bill")');

        db.each('SELECT * FROM users', (err, row) => {
            if (!err)
                console.log(row.id + " : " + row.name);
            });
    });

    db.close();
};

