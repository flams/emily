var requirejs = require("requirejs"),
	// This should be require("emily"); once published
	emily = require("../emily-server.js");

emily.config.update("CouchDB.auth", "couchdb:couchdb");

console.log("integration test");

requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

	var document = new CouchDBStore(),
		bulkDoc1 = new CouchDBStore(),
		bulkDoc2 = new CouchDBStore(),
		transport = new Transport(emily.handlers);
	
	document.setTransport(transport);
	bulkDoc1.setTransport(transport);
	bulkDoc2.setTransport(transport);
	
	document.sync("db", "document123");

	document.reset({desc: "hello"});
		
	console.log("uploading", document.toJSON());
		
	document.upload().then(function (res) {
		console.log("document123 synchronized" /*, res*/);
		
		bulkDoc1.sync("db", {keys: ["document123"]}).then(function (res2) {
			
			console.log("bulkDoc Synched" /*, res2*/);
			
			bulkDoc1.loop(function (val) {
				val.doc._deleted = true;
			});

			bulkDoc1.upload().then(function (res3) {
				console.log("doc suppressed" /*, res3*/);
			});
			
		});

		
		
	});

	bulkDoc2.sync("db", {
		startkey: '"document1"',
		endkey: '"document50"'
	}).then(function () {
		this.loop(function (doc) {
			console.log("synched with ", doc.id);
		}, this);
	}, bulkDoc2);

});
