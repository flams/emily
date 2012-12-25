var promiseTests = require("promise-tests"),
	emilyAdapter = require(__dirname + "/emilyAdapter.js");


emilyAdapter.getAdapter(function (adapter) {


	 promiseTests(adapter, ["promises-a"], function () {
		// All done, output in the CLI.
	 });

});
