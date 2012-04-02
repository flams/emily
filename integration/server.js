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
		
	document.upload();
		
	setTimeout(function () {
		bulkDoc.sync("db", ["document1", "document123"]).then(function () {
			this.update("1._deleted", true);
			this.upload();
		}, bulkDoc);
	}, 200);
	


	
	
	
});
