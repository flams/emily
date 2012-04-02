var requirejs = require("requirejs"),
	// This should be require("emily"); once published
	emily = require("../emily-server.js");

emily.config.update("CouchDB.auth", "couchdb:couchdb");

console.log("integration test");

requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

	var document = new CouchDBStore(),
		bulkDoc = new CouchDBStore(),
		transport = new Transport(emily.handlers);
	
	document.setTransport(transport);
	bulkDoc.setTransport(transport);
	
	document.sync("db", "document123");

	document.reset({desc: "hello"});
		
	console.log("uploading", document.toJSON());
		
	document.upload().then(function (res) {
		console.log("document123 synchronized" /*, res*/);
		
		bulkDoc.sync("db", ["document123"]).then(function (res2) {
			
			console.log("bulkDoc Synched" /*, res2*/);
			
			bulkDoc.loop(function (val) {
				val.doc._deleted = true;
			});

			bulkDoc.upload().then(function (res3) {
				console.log("doc suppressed" /*, res3*/);
			});
			
		});
	});

});
