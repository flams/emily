# promise-stream

A Promises/A implementation based on streams

Promises and streams are the same thing. Except promises
are far less powerful / flexible

## Example using PromiseStream

``` js
var ReadStream = require("read-stream")
    , assert = require("assert")
    , Promise = require("promise-stream")

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
})

// Flow data through one's queue
one.end("one")
```

## Same example using just streams

``` js
var ReadWriteStream = require("read-write-stream")
    , assert = require("assert")

var one = ReadWriteStream()
    , two = ReadWriteStream(function write(chunk, queue) {
        console.log("one", chunk)
        queue.push("two")
    })
    , three = ReadWriteStream(function write(chunk, queue) {
        console.log("two", chunk)
        queue.error("three")
    })
    , four = ReadWriteStream()

connect([
    one.stream
    , two.stream
    , three.stream
    , four.stream
]).on("error", function (e) {
    console.log("three", e)
})

// Flow data through one's queu
one.end("one")

// Helper to emulate error propagation functionality
function connect(streams) {
    for (var i = 0; i < streams.length - 1; i++) {
        var curr = streams[i]
            , next = streams[i + 1]

        curr.pipe(next)

        // In an ideal world you just use domains.
        // None of this error propagation stuff.
        curr.on("error", function (err) {
            next.emit("error", err)
        })
    }

    return next
}
```

## Installation

`npm install promise-stream`

## Contributors

 - Raynos

## MIT Licenced
