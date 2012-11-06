var ReadStream = require("read-stream")
    , assert = require("assert")

    , Promise = require("..")

// one is a queue
var one = ReadStream()
    // Create a promise from one's stream.
    , pone = Promise(one.stream)

var ptwo = pone.then(function (v) {
    assert(true, "one is fulfilled")
    console.log("one", v)

    return "two"
}, function (e) {
    assert(false, "one is not rejected")
})

var pthree = ptwo.then(function (v) {
    assert(true, "two is fulfilled")
    console.log("two", v)

    throw "three"
}, function (e) {
    assert(false, "two is not rejected")
})

var pfour = pthree.then(function (v) {
    assert(false, "three is not fulfilled")
}, function (e) {
    assert(true, "three is rejected")
    console.log("three", e)

    // Returning here should not break
    return "four"
})

// Flow data through one's queue
one.end("one")


