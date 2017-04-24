const pg = require('pg');
const conString = process.env.DATABASE_URL || 'postgres://localhost:5432/christian';

exports.test = (req, res) => {
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        let data = [];
        client.query('SELECT * FROM test;', (err, result) => {
            if (!err) {
                for (let i = 0; i < result.rowCount; i++) {
                    //console.log("GOT DATA: id: %s, name: %s", result.rows[i].id, result.rows[i].name);
                    data.push({'id': result.rows[i].id, 'name': result.rows[i].name})
                }
            }
        })
        .then(() => {
            client.query('INSERT INTO test (id, name) VALUES ($1, $2);', [69, req.params.name]);
        })
        .then(() => {
            done();
            res.json(data);
        });
    });
}