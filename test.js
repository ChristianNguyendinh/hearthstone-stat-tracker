var express = require('express');
var server = express();
var session = require('client-sessions');

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
})
server.get('/rand', (req, res) => {
    console.log(req.poop);
    res.send("asdf");
})

server.set('port', (process.env.PORT || 3000));
server.listen(server.get('port'), function() {
    console.log("Server started... - " + new Date().toString());
});

