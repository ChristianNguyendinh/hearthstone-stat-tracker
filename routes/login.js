const secret = "asdf";

exports.loginGet = (req, res) => {
    res.render('login');
};

exports.loginPost = (req, res) => {
    var auth = false;
    var sessionID = null;

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        var hash = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex')

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
                res.redirect('/dashboard');
            } else {
                res.redirect('/login');
            }
        });
    });
};

// Helpers /////

function newSessionID(userID) {
    var sessionID = crypto.randomBytes(20).toString('hex');

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        // Clear sessions with ID, then add new one
        client.query('DELETE FROM sessions WHERE userid = $1', [userID], (err, result) => {
            if (err) {
                return console.error(err);
            }
            else {
                client.query('INSERT INTO sessions (sessionid, userid) VALUES ($1, $2)', [sessionID, userID], (err, result) => {
                    if (err)
                        return console.error(err);
                })  
                .then(() => {
                    done();
                });
            }
        })
        .then(() => {
            done();
        });
    });

    return sessionID;
}