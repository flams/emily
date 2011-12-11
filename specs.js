var requirejs = require("requirejs"),
	jasmine = require("jasmine-node");



requirejs.config({
	baseUrl: "./src/Emily",
	nodeRequire: require
});


requirejs("Observable");
requirejs("TinyStore");
requirejs("Transport");
requirejs("Tools");
requirejs("./src/Emily-test/Observable.spec.js");
requirejs("./src/Emily-test/TinyStore.spec.js");
requirejs("./src/Emily-test/Transport.spec.js");
requirejs("./src/Emily-test/Tools.spec.js");



jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
jasmine.getEnv().execute();




