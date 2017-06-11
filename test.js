var express = require('express');
var server = express();
var session = require('client-sessions');
var crypto = require('crypto');
var bodyparser = require('body-parser');
const pg = require('pg');
const conString = process.env.DATABASE_URL || 'postgres://localhost:5432/christian';



server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.use(session({
    cookieName: 'poop',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    cookie: { 
        ephemeral: true
    }
}));

server.get('/', (req, res) => {
    req.poop.mypoop = "asdf1";
    res.send("asdf");
});

server.get('/rand', (req, res) => {
    console.log(req.poop);
    res.send("asdf");
});

// --------

var secret = "asdf"

server.get('/login', (req, res) => {
    res.send("login page here")
});

// leave the get for later
server.post('/login', (req, res) => {
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.params);
    var auth = false;
    var sessionID = null;

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        var hash = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex')
        console.log(hash)

        client.query('SELECT id FROM users WHERE username = $1 AND pass = $2;', [req.body.username, hash], (err, result) => {
            if (!err) {
                if (result.rowCount == 1) {
                    auth = true; 
                    sessionID = newSessionID(result.rows[0].id);
                }
            } else {
                return console.error(err);
            }
        })
        .then(() => {
            done();
            if (auth) {
                req.poop.sessionID = sessionID;
            }
            res.json({authenticated: auth});
        });
    });
})

server.get('/dashboard', (req, res) => {
    var auth = false;

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        client.query('SELECT userid FROM sessions WHERE sessionid = $1;', [req.poop.sessionID], (err, result) => {
            if (!err) {
                if (result.rowCount == 1) {
                    auth = true;
                }
            } else {
                return console.error(err);
            }
        })
        .then(() => {
            done();
            if (auth) {
                res.json({authenticated: true}); 
            }
            else {
                res.json({authenticated: false});                
            }
        });
    });
});

server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), function() {
    console.log("Server started... - " + new Date().toString());
});

function newSessionID(userID) {
    var sessionID = crypto.randomBytes(20).toString('hex');

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        client.query('INSERT INTO sessions (sessionID, userID) VALUES ($1, $2)', [sessionID, userID], (err, result) => {
            if (err) {
                return console.error(err);
            }
        })
        .then(() => {
            done();
        });
    });

    return sessionID;
}




