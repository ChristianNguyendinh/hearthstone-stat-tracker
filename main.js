var express = require('express');
var server = express();
var path = require('path')
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

server.use(express.static(path.join(__dirname, 'public')));

server.get('/', function(req, res) {
    res.sendFile('index.html')
});

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


function accessDatabase() {
    db.serialize(() => {

    db.run('INSERT INTO users (name) VALUES ("Bill")');

    db.each('SELECT * FROM users', (err, row) => {
        if (!err)
            console.log(row.id + " : " + row.name);
        });
    });

    db.close();
}