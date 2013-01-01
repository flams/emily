/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

var equirejs = require("requirejs");

// Load Emily
requirejs(__dirname + "/build/Emily.js");

// We're going to need Stores to store the handlers.
// The Store's observers can be useful. They'll actually be used by Olives
requirejs(["Store"], function (Store) {

	// There's a store to save the configuration
	exports.config = new Store({});

	// There's a store to save each handler
	exports.handlers = new Store({});

});

module.exports.requirejs = requirejs;
