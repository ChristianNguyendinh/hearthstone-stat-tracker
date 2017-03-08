var express = require('express');
var server = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

var router = express.Router();

server.use('/api', router);

server.listen(3000, function() {
    console.log("server started on port 3000");
});

router.get('/', function(req, res) {
    res.json({ message: "Hello" });
});

router.route('/users/:name')
    .post(function(req, res) {
        console.log(req.params.name);
        res.json({ message: "good" });
    })
    .get(function(req, res) {
        res.json({student: req.params.name});
    });

server.use('/api', router);

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