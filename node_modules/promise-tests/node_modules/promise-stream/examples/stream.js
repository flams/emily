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

        curr.on("error", function (err) {
            next.emit("error", err)
        })
    }

    return next
}
