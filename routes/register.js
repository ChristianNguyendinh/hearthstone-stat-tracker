var secret = "asdf"

exports.registerGet = (req, res) => {
    res.render('register');
};

exports.registerPost = (req, res) => {
    var sessionID = null;
    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        var hash = crypto.createHmac('sha256', secret).update(req.body.password1).digest('hex')

        // in the future check if user already exists...
        client.query('INSERT INTO users (username, pass) VALUES ($1, $2);', [req.body.username, hash], (err, result) => {
            if (err) return console.error(err);
        })
        .then(() => {
            done();
            // for now just redirect them to the login page
            res.redirect('/login');
        });
    });
};

