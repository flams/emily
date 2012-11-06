var toArray = require("write-stream").toArray
    , ReadStream = require("read-stream")
    , PromiseState = {
        UNRESOLVED: 0
        , FULFILLED: 1
        , REJECTED: 2
    }

module.exports = Promise

function Promise(stream) {
    var state = PromiseState.UNRESOLVED
        , reason
        , value

    capture()

    return {
        then: then
    }

    function capture(fulfilledCallback, rejectedCallback) {
        stream.once("error", cleanup)

        var fulfillStream = stream.pipe(toArray(finished))

        function cleanup(err) {
            state = PromiseState.REJECTED

            stream.unpipe(fulfillStream)

            reason = err

            if (rejectedCallback) {
                rejectedCallback(err)
            }
        }

        function finished(list) {
            state = PromiseState.FULFILLED

            stream.removeListener("error", cleanup)

            value = list[0]

            if (fulfilledCallback) {
                fulfilledCallback(value)
            }
        }
    }

    function then(fulfilledCallback, rejectedCallback) {
        // Retarded sync case for when the promise is already fulfilled.
        if (state !== PromiseState.UNRESOLVED) {
            return handleSync(fulfilledCallback, rejectedCallback)
        }

        capture(handleFulfilled, handleRejected)

        function handleFulfilled(value) {
            resolve(value, fulfilledCallback)
        }

        function handleRejected(err) {
            resolve(err, rejectedCallback)
        }

        // What? Promises return promises? >_<
        var returnedQueue = ReadStream()

        return Promise(returnedQueue.stream)

        function resolve(item, callback) {
            if (!callback) {
                return
            }

            try {
                var result = callback(item)

                returnedQueue.push(result)
                returnedQueue.end()
            } catch (err) {
                returnedQueue.error(err)
            }
        }
    }

    function handleSync(fulfilledCallback, rejectedCallback) {
        if (state === PromiseState.FULFILLED && fulfilledCallback) {
            // Not allowed to be fullfilled inside the then function -.-
            process.nextTick(function () {
                fulfilledCallback(value)
            })
        } else if (state === PromiseState.REJECTED && rejectedCallback) {
            // Not allowed to be rejected inside the then function -.-
            process.nextTick(function () {
                rejectedCallback(reason)
            })
        }
    }
}
