/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

// HTTP is going to be used for the built-in CouchDB requests handler
var http = require("http"),
	qs = require("querystring"),
	requirejs = require("requirejs"),
	cookie = require("cookie");

// Load Emily
requirejs(__dirname + "/build/Emily.js");

// We're going to need Stores to store the handlers.
// The Store's observers can be useful. They'll actually be used by Olives
requirejs(["Store"], function (Store) {

	// There's a store to save the configuration
	exports.config = new Store({
		// CouchDB is built-in
		// Copy this to CouchDB2, 3... if you have more than one of them
		"CouchDB": {
			hostname: "127.0.0.1",
			port: 5984
		}
	});

	// There's a store to save each handler
	exports.handlers = new Store({});

});

module.exports.requirejs = requirejs;
