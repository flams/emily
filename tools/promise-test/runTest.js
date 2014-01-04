/* BROKEN as of latest promise A+ because of API change (!)
var promiseTests = require("promises-aplus-tests"),
	Promise = require("../../src/Promise");

var adapter = {

	resolved: function (value) {
		var promise = new Promise;
		promise.fulfill(value);
		return promise;
	},

	rejected: function (reason) {
		var promise = new Promise;
		promise.reject(reason);
		return promise;
	},

	pending: function () {
		var promise = new Promise;
	},

	deferred: function () {
		var promise = new Promise;

		return {
			promise: promise,
		    fulfill: promise.fulfill.bind(promise),
		    reject: promise.reject.bind(promise)
		}
	}
};

promiseTests(adapter, function () {
// All done, output in the CLI.
});
*/

