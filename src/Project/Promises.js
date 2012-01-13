define("Promise", 

["StateMachine", "Observable", "Tools"],

/**
 * @class
 * This is an attempt to implement promises.
 * Not sure it's correct at the moment
 */
function Promise(StateMachine, Observable, Tools) {
	
	/**
	 * Defines the promise
	 */
	return function PromiseConstructor($func, $scope) {
		
		/**
		 * The function to resolve
		 * @private
		 */
		var _toResolve = null,
		
		/**
		 * The scope in which to run the function to resolve
		 * @private
		 */
		_scope = null,
		
		/**
		 * The value to pass to success callbacks
		 * @private
		 */
		_success = null,
		
		/**
		 * The value to pass to errbacks
		 * @private
		 */
		_failed = null,
		
		/**
		 * The observable to notifiy the result
		 * @private
		 */
		_observable = new Observable();
		
		/**
		 * The state machine
		 * 3 states : unresolved, resolved, failed
		 * @private
		 */
		_stateMachine = new StateMachine("Unresolved", {
			"Unresolved": [["resolve", function () {
					_toResolve.call(_scope, function () {
						return _stateMachine.event.apply(_stateMachine, Tools.toArray(arguments));
					});
				}],
				["success", function (args) {
					_success = args;
					_observable.notify("success", args);
				}, "Resolved"],
				["fail", function (args) {
					_failed = args;
					_observable.notify("fail", args);
				}, "Failed"],
				["addThen", function (type, func, scope) {
					_observable.watch(type, func, scope);
				}]],
			"Resolved": [["addThen", function (type, func, scope) {
				func.call(scope, type == "success" ? _success : _failed);
			}]],
			"Failed": [["addThen", function (type, func, scope) {
				func.call(scope, type == "success" ? _success : _failed);
			}]]
		});
		
		/**
		 * The callbacks and errbacks to call after resolution.
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

			if (arguments[0] instanceof Function) {
				if (arguments[1] instanceof Function) {
					_stateMachine.event("addThen", "success", arguments[1]);
				} else {
					_stateMachine.event("addThen", "success", arguments[0], arguments[1]);
				}
			}
			
			if (arguments[1] instanceof Function) {
				_stateMachine.event("addThen", "fail", arguments[1], arguments[2]);
			} 
			
			if (arguments[2] instanceof Function) {
				_stateMachine.event("addThen", "fail", arguments[2], arguments[3]);
			}

		};
		
		/**
		 * Launch the promise resolution
		 * @returns {Boolean} true if the resolution start
		 */
		this.resolve = function resolve() {
			return !!(_toResolve && _stateMachine.event("resolve"));
		};
		
		/**
		 * Get the current state machine's state
		 * Only useful for debugging
		 * @returns {String}
		 */
		this.getState = function getState() {
			return _stateMachine.getCurrent();
		};
		
		if ($func instanceof Function) {
			_toResolve = $func;
			_scope = $scope;
		}
		
	};
	
});