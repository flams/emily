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

	function PromiseConstructor() {

		/**
		 * The value once resolved
		 * @private
		 */
		var _resolvedValue,

		/**
		 * The value once rejected
		 * @private
		 */
		_rejectedValue,

		_observable = new Observable,

		/**
		 * The stateMachine
		 * @private
		 */
		_stateMachine = new StateMachine("Unresolved", {
			"Unresolved": [["resolve", function (val) {
								_resolvedValue = val;
								_observable.notify("success", val);
							}, "Resolved"],

							["reject", function (err) {
								_rejectedValue = err;
								_observable.notify("fail", err);
							}, "Rejected"],

							["addSuccess", function (promise, func, scope) {
								_observable.watch("success", function (val) {
									var value;
									try {
										promise.resolve(func.call(scope, val));
									} catch (err) {
										promise.reject(err);
									}


								});
							}],

							["addFail", function (promise, func, scope) {
								_observable.watch("fail", function (val) {
									var value;

									try {
										promise.resolve(func.call(scope, val));
									} catch (err) {
										promise.reject(err);
									}

								}, scope);
							}]],

			"Resolved": [["addSuccess", function (promise, func, scope) {
								try {
										promise.resolve(func.call(scope, _resolvedValue));
									} catch (err) {
										promise.reject(err);
									}
							}]],

			"Rejected": [["addFail", function (promise, func, scope) {
								promise.reject(func.call(scope, _rejectedValue));
							}]]
		});

		/**
		 * Resolve the promise.
		 * A promise can be resolved only once.
		 * @param the resolution value
		 * @returns true if the resolution function was called
		 */
		this.resolve = function resolve(val) {
			_stateMachine.event("resolve", val);
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
         * T he callbacks and errbacks to call after resolution or rejection
         * @param {Function} the first parameter is a success function, it can be followed by a scope in which to run it
         * @param {Function} the second, or third parameter is an errback, it can also be followed by a scope
         * @examples:
         *
         * then(callback)
         * then(callback, scope, errback, scope)
         * then(callback, errback)
         * then(callback, errback, scope)
         *
         */
        this.then = function then() {
        	var promise = new PromiseConstructor;
             if (arguments[0] instanceof Function) {
              if (arguments[1] instanceof Function) {
                 _stateMachine.event("addSuccess", promise, arguments[0]);
              } else {
                 _stateMachine.event("addSuccess", promise, arguments[0], arguments[1]);
              }
          }

          if (arguments[1] instanceof Function) {
                 _stateMachine.event("addFail", promise, arguments[1], arguments[2]);
          }

          if (arguments[2] instanceof Function) {
                 _stateMachine.event("addFail", promise, arguments[2], arguments[3]);
          }
          return promise;
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

	}

	return function () {

		var promise = new PromiseConstructor;

		this.resolve = function () {
			promise.resolve.apply(promise, arguments);
			return promise;
		};

		this.reject = function () {
			promise.reject.apply(promise, arguments);
			return promise;
		};

		this.then = function () {
			return promise.then.apply(promise, arguments);
		}



	};



});
