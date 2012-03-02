/**
* This server is only for testing purpose.
* Don't use it in production
*/
var app = require('http').createServer(function (req, res) {
		var file = req.url != "/" ? req.url : '/index.html',
				filetype = file.split(".").pop(),
				types = {"html" : "html",
						 "js" : "javascript"};

	  fs.readFile(__dirname + file,
			  function (err, data) {
			    if (err) {
			      res.writeHead(500);
			      return res.end('Error loading index.html');
			    }

			    res.writeHead(200, { 'Content-Type': 'text/' + types[filetype] });
			    res.end(data);
			  });
			}
	).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , http = require('http');
/*

io.sockets.on("connection", function (socket) {
	socket.on("CouchDB", function (data) {
		
		var req;
		
		data.hostname = "127.0.0.1";
		data.port = 5984;
		data.auth = "couchdb:couchdb";

		req = http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				data.keptAlive && socket.emit(data.__eventId__, ""+chunk);
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		});
		
		if (data.data) {
			req.write(data.data);
		}
		req.end();
	});
	
	socket.on("FileSystem", function (data) {
		socket.emit(data.__eventId__, fs.readFileSync("./" + data.file, "utf8"));
	});

});*/


handlers = {
 "CouchDB" : function (data, onEnd, onData) {
	 data.hostname = "127.0.0.1";
	 data.port = 5984;
	 data.auth  = "couchdb:couchdb";
		 
		var req =http.request(data, function (res) {
				
			var body = "";
			
			res.on('data', function (chunk) {
				onData && onData(chunk);
				body += chunk;
			});
			res.on('end', function () {
				onEnd(body);
			});
			
			
		});
		
		req.end(data.data, "utf8");
		
		return {scope: req, func: abort};
 	},
 	
 	"FileSystem": function (data, onEnd) {
 		onEnd(fs.readFileSync("./" + data.file, "utf8"));
 	}
}

//en gros:
	
	var io = requirejs("socket.io"),
	    Transport = requiresjs("Transport");

// Ce transport là va être utilisé par couchdb
transport = new Transport(handlers);
// Genre comme ça
new CouchDBStore(transport);

// Et là on s'abonne aux events socket.io pour les reqs qui viennent de la pres
io.sockets.on("connection", function (socket) {
	Tools.loop(handlers, function (func, handler) {
		socket.on(handler, function (reqDdata) {
			func(reqDdata, function onEnd(body) {
				socket.emit(reqDdata.__eventId__, body);
			}, function onData(chunk) {
				reqDdata.keptAlive && socket.emit(reqDdata.__eventId__, ""+chunk);
			});
		});
	});
});
	