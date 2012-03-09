var requirejs = require("requirejs"),
	// This should be require("emily"); once published
	emily = require("../emily-server.js");

requirejs(["Store"], function (Store) {
	var store = new Store(["Hello"]);
	console.log(store.get(0) + " world!");
});

requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {
	
	var CouchDBStore = new CouchDBStore(),
		transport = new Transport(emily.handlers);
	
	CouchDBStore.setTransport(transport);
	CouchDBStore.sync("db", "document").then(function () {
		CouchDBStore.watchValue("value", function (value) {
			console.log(value);
		});
	});

});
