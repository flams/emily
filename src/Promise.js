/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
define("Promise",

["Observable", "StateMachine"],

/**
 * @class
 * Create a Promise
 */
function Promise(Observable, StateMachine) {

	return function PromiseConstructor() {

		/**
		 * The fulfilled value
		 * @private
		 */
		var _value,

		/**
		 * The rejection reason
		 * @private
		 */
		_reason,

		/**
		 * The funky observable
		 * @private
		 */
		_observable = new Observable,

		_states = {

			// The promise is unresolved
			"Unresolved": [

				// It can only be fulfilled when unresolved
				["fulfill", function (val) {
					_value = val;
					_observable.notify("fulfill", val);
				// Then it transits to the fulfilled state
				}, "Fulfilled"],

				// it can only be rejected when unresolved
				["reject", function (err) {
					_reason = err;
					_observable.notify("reject", err);
				// Then it transits to the rejected state
				}, "Rejected"],

				// When pending, add the resolver to an observable
				["addFulfillResolver", function (resolver) {
					_observable.watch("fulfill", resolver);
				}],

				// When pending, add the resolver to an observable
				["addRejectResolver", function (resolver) {
					_observable.watch("reject", resolver);
				}]],

			// When fulfilled,
			"Fulfilled": [
				// We directly call the resolver with the value
				["addFulfillResolver", function (resolver) {
					resolver(_value);
				}]],

			// When rejected
			"Rejected": [
				// We directly call the resolver with the reason
				["addRejectResolver", function (resolver) {
					resolver(_reason);
				}]]
		},

		/**
		 * The stateMachine
		 * @private
		 */
		_stateMachine = new StateMachine("Unresolved", _states);

		/**
		 * Fulfilled the promise.
		 * A promise can be fulfilld only once.
		 * @param the fulfillment value
		 * @returns the promise
		 */
		this.fulfill = function fulfill(val) {
			_stateMachine.event("fulfill", val);
			return this;
		};

		/**
		 * Reject the promise.
		 * A promise can be rejected only once.
		 * @param the rejection value
		 * @returns true if the rejection function was called
		 */
		this.reject = function reject(err) {
			_stateMachine.event("reject", err);
			return this;
		};

		/**
         * The callbacks and errbacks to call after fulfillment or rejection
         * @param {Function} the first parameter is a success function, it can be followed by a scope in which to run it
         * @param {Function} the second, or third parameter is an errback, it can also be followed by a scope
         * @examples:
         *
         * then(callback)
         * then(callback, scope, errback, scope)
         * then(callback, errback)
         * then(callback, errback, scope)
         * @returns {Promise} the new promise
         */
        this.then = function then() {
        	var promise = new PromiseConstructor,
        		hasFailed;

          	if (arguments[0] instanceof Function) {
            	if (arguments[1] instanceof Function) {
                	_stateMachine.event("addFulfillResolver", this.makeResolver(promise, arguments[0]));
              	} else {
                	_stateMachine.event("addFulfillResolver", this.makeResolver(promise, arguments[0], arguments[1]));
              	}
         	} else {
         		_stateMachine.event("addFulfillResolver", this.makeResolver(promise, function () {
         			promise.fulfill(_value);
         		}));
         	}

          	if (arguments[1] instanceof Function) {
            	_stateMachine.event("addRejectResolver", this.makeResolver(promise, arguments[1], arguments[2]));
            	hasFailed = true;
          	}

          	if (arguments[2] instanceof Function) {
                _stateMachine.event("addRejectResolver", this.makeResolver(promise, arguments[2], arguments[3]));
                hasFailed = true;
          	}

          	if (!hasFailed) {
          		_stateMachine.event("addRejectResolver", this.makeResolver(promise, function () {
          			promise.reject(_reason);
          		}));
          	}

          	return promise;
        };

        /**
         * Make a resolver
         * for debugging only
         * @private
         * @returns {Function} a closure
		 */
        this.makeResolver = function (promise, func, scope) {
			return function resolver(value) {
				try {
					promise.fulfill(func.call(scope, value));
				} catch (err) {
					promise.reject(err);
				}
			}
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

	}




});
