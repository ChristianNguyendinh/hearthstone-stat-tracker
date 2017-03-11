var http = require("http");


var options = {
    host: "127.0.0.1",
    port: 3000,
    path: "/api/bob"
}

var request = require("request");

/*request("http://127.0.0.1:3000/api/bob", function(error, response, body) {
  if (error)
  	console.log(error)
  console.log(body);
});*/

http.get(options, function(response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        console.log(body);
    });
}).on('error', function(e) {
	console.log(e);
});