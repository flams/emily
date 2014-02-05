var promiseTests = require("promises-aplus-tests"),
	Promise = require("../../src/Promise");

var adapter = {

	deferred: function () {
		var promise = new Promise;

		return {
			promise: promise,
		    resolve: promise.fulfill,
		    reject: promise.reject
		}
	}
};

promiseTests(adapter, { grep: "2.2.6.1" },function () {
// All done, output in the CLI.
});
