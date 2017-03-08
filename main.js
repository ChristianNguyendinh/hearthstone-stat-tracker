var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');

accessDatabase();

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