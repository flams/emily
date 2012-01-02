/**
* This server is only for testing purpose.
* Don't use it in production
*/
var io = require("socket.io").listen(8000),
	http = require("http"),
	fs = require("fs");

io.sockets.on("connection", function (socket) {
	// Couchdb example
	//transport.request("CouchDB", {"path": "/_all_dbs", "method": "get", "reqId": "test"}, 
	//function (result) {console.log(JSON.parse(result))})
	
	socket.on("CouchDB", function (data) {
		data.hostname = "127.0.0.1";
		data.port = 5984;
		data.auth = "couchdb:couchdb";

		var req = http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		});
		req.end();
	});
	
	
	socket.on("FileSystem", function (data) {
		socket.emit(data.__eventId__, fs.readFileSync("./" + data.file, "utf8"));
	});
	
	socket.on("Http", function (data) {
		http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		}).end();
	});
});
