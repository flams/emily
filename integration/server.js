/**
* This server is only for testing purpose.
* It assumes you have a CouchDB up and running on localhost:5984
* With a database called "db" and a document "document2" with a property "hey"
*/
var emily = require("../emily-server.js");
// should be
// var emily = require("emily"); once published

// To change the configuration
//emily.config.CouchDB.hostname = "ip address here";
//emily.config.CouchDB.port = "port number here";

emily.require(["Transport", "CouchDBStore"], function (Transport, CouchDBStore) {

	var store = new CouchDBStore();
	store.setTransport(new Transport(emily.handlers));
	store.sync("db", "document2").then(function () {
		
		this.watchValue("hey", function (value) {
			console.log(value);
		});
		
	}, store);
});


