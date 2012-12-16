"use strict";

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname + '/../../src/',
    nodeRequire: require
});

exports.getAdapter = function (callback) {

	requirejs(['Promise'], function (Promise) {

		var exports = {};

		exports.fulfilled = function (value) {
		    var promise = new Promise;
		    promise.fulfill(value);
		    return promise;
		};

		exports.rejected = function (reason) {
		    var promise = new Promise;
		    promise.reject(reason);
		    return promise;
		};

		exports.pending = function () {
		    var promise = new Promise;

		    return {
		        promise: promise,
		        fulfill: promise.fulfill.bind(promise),
		        reject: promise.reject.bind(promise)
		    };
		};

		callback(exports);

	});

};




