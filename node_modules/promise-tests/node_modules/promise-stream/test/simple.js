"use strict";

var ReadStream = require("read-stream");
var assert = require("assert");
var Promise = require("..")

var stream = ReadStream();
var promise = Promise(stream.stream);

promise
.then(function (first) {
    return "second";
})
.then(
    function (x) {
        console.log("result", x)
        assert(x === "second", "should transform fulfillment values");
    },
    function (e) {
        assert(false, "should not be rejected");
    }
);

stream.end("first");
