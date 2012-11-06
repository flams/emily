"use strict";

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname + '/../../src/',
    nodeRequire: require
});

exports.getAdapter = function (callback) {

	requirejs(['Promise'], function (Promise) {

		var missaPromise = {},
			promise = new Promise;

		missaPromise.fulfilled = promise.resolve;
		missaPromise.rejected = promise.reject;

		missaPromise.pending = function () {
		    var promise = new Promise;

		    return {
		        promise: promise,
		        fulfill: promise.resolve,
		        reject: promise.reject
		    };
		};

		callback(missaPromise);

	});

};




