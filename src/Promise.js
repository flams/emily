/**
* Emily.js - http://flams.github.com/emily/
* Copyright(c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
* MIT Licensed
*/
"use strict";

var Observable = require("./Observable"),
StateMachine = require("./StateMachine");

/**
* @class
* Create a promise/A+
*/
module.exports = function PromiseConstructor() {

    /**
     * The fulfilled value
     * @private
     */
    var _value = null,

    /**
     * The rejection reason
     * @private
     */
    _reason = null,

    /**
     * The funky observable
     * @private
     */
    _observable = new Observable(),

    /**
     * The state machine States & transitions
     * @private
     */
    _states = {

        // The promise is pending
        "Pending": [

            // It can only be fulfilled when pending
            ["fulfill", function onFulfill(value) {
                _value = value;
                _observable.notify("fulfill", value);
            // Then it transits to the fulfilled state
            }, "Fulfilled"],

            // it can only be rejected when pending
            ["reject", function onReject(reason) {
                _reason = reason;
                _observable.notify("reject", reason);
            // Then it transits to the rejected state
            }, "Rejected"],

            // When pending, add the resolver to an observable
            ["toFulfill", function toFulfill(resolver) {
                _observable.watch("fulfill", resolver);
            }],

            // When pending, add the resolver to an observable
            ["toReject", function toReject(resolver) {
                _observable.watch("reject", resolver);
            }]],

        // When fulfilled,
        "Fulfilled": [
            // We directly call the resolver with the value
            ["toFulfill", function toFulfill(resolver) {
                   resolver(_value);
            }]],

        // When rejected
        "Rejected": [
            // We directly call the resolver with the reason
            ["toReject", function toReject(resolver) {
                   resolver(_reason);
            }]]
    },

    /**
     * The stateMachine
     * @private
     */
    _stateMachine = new StateMachine("Pending", _states);

    /**
     * Fulfilled the promise.
     * A promise can be fulfilld only once.
     * @param the fulfillment value
     * @returns the promise
     */
    this.fulfill = function fulfill(value) {
        setTimeout(function () {
            _stateMachine.event("fulfill", value);
            return this;
        }, 0);
    };

    /**
     * Reject the promise.
     * A promise can be rejected only once.
     * @param the rejection value
     * @returns true if the rejection function was called
     */
    this.reject = function reject(reason) {
        setTimeout(function () {
            _stateMachine.event("reject", reason);
            return this;
        }, 0);
    };

    /**
     * The callbacks to call after fulfillment or rejection
     * @param {Function} fulfillmentCallback the first parameter is a success function, it can be followed by a scope
     * @param {Function} the second, or third parameter is the rejection callback, it can also be followed by a scope
     * @examples:
     *
     * then(fulfillment)
     * then(fulfillment, scope, rejection, scope)
     * then(fulfillment, rejection)
     * then(fulfillment, rejection, scope)
     * then(null, rejection, scope)
     * @returns {Promise} the new promise
     */
    this.then = function then() {
        var promise = new PromiseConstructor();

        // If a fulfillment callback is given
        if (arguments[0] instanceof Function) {
            // If the second argument is also a function, then no scope is given
            if (arguments[1] instanceof Function) {
                _stateMachine.event("toFulfill", this.makeResolver(promise, arguments[0]));
            } else {
                // If the second argument is not a function, it's the scope
                _stateMachine.event("toFulfill", this.makeResolver(promise, arguments[0], arguments[1]));
            }
        } else {
            // If no fulfillment callback given, give a default one
            _stateMachine.event("toFulfill", this.makeResolver(promise, function () {
                promise.fulfill(_value);
            }));
        }

        // if the second arguments is a callback, it's the rejection one, and the next argument is the scope
        if (arguments[1] instanceof Function) {
            _stateMachine.event("toReject", this.makeResolver(promise, arguments[1], arguments[2]));
        }

        // if the third arguments is a callback, it's the rejection one, and the next arguments is the sopce
        if (arguments[2] instanceof Function) {
            _stateMachine.event("toReject", this.makeResolver(promise, arguments[2], arguments[3]));
        }

        // If no rejection callback is given, give a default one
        if (!(arguments[1] instanceof Function) &&
            !(arguments[2] instanceof Function)) {
            _stateMachine.event("toReject", this.makeResolver(promise, function () {
                promise.reject(_reason);
            }));
        }

        return promise;
    };

    /**
     * Synchronize this promise with a thenable
     * @returns {Boolean} false if the given sync is not a thenable
     */
    this.sync = function sync(syncWith) {
        if (syncWith instanceof PromiseConstructor ||
            typeof syncWith == "object" ||
            typeof syncWith == "function") {

            syncWith.then(this.fulfill.bind(this),
                    this.reject.bind(this));

            return true;
        } else {
            return false;
        }
    };

    /**
     * Make a resolver
     * for debugging only
     * @private
     * @returns {Function} a closure
     */
    this.makeResolver = function makeResolver(promise, func, scope) {
        return function resolver(value) {
            var returnedPromise;

            try {
                returnedPromise = func.call(scope, value);
                if (returnedPromise === promise) {
                    throw new TypeError("Promise A+ 2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.");
                }
                if (!promise.sync(returnedPromise)) {
                    promise.fulfill(returnedPromise);
                }
            } catch (err) {
                promise.reject(err);
            }

        };
    };

    /**
     * Returns the reason
     * for debugging only
     * @private
     */
    this.getReason = function getReason() {
        return _reason;
    };

    /**
     * Returns the reason
     * for debugging only
     * @private
     */
    this.getValue = function getValue() {
        return _value;
    };

    /**
     * Get the promise's observable
     * for debugging only
     * @private
     * @returns {Observable}
     */
    this.getObservable = function getObservable() {
        return _observable;
    };

    /**
     * Get the promise's stateMachine
     * for debugging only
     * @private
     * @returns {StateMachine}
     */
    this.getStateMachine = function getStateMachine() {
        return _stateMachine;
    };

    /**
     * Get the statesMachine's states
     * for debugging only
     * @private
     * @returns {Object}
     */
    this.getStates = function getStates() {
        return _states;
    };
};