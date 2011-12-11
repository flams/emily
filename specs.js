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
requirejs("./src/Emily-specs/specHelper.js");
requirejs("./src/Emily-specs/Observable.spec.js");
requirejs("./src/Emily-specs/TinyStore.spec.js");
requirejs("./src/Emily-specs/Transport.spec.js");
requirejs("./src/Emily-specs/Tools.spec.js");



jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
jasmine.getEnv().execute();




