"use strict";

var ReadStream = require("read-stream");
var assert = require("assert");
var Promise = require("..")

var stream = ReadStream();
var promise = Promise(stream.stream);

var transformedPromise = promise.then(function () {
    throw new Error("uh oh");
});

stream.end("first");

setTimeout(function () {
    transformedPromise.then(null, function (e) {
        assert(e && e.message === "uh oh");
    });
}, 100);
