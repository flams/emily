define("Promise", 

["StateMachine", "Observable", "Tools"],

function (StateMachine, Observable, Tools) {
	
	return function PromiseConstructor($func, $scope) {
		
		var _toResolve = null,
			_scope = null,
			_success = null,
			_failed = null,
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
			}),
			_observable = new Observable();
		
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
		
		this.resolve = function resolve() {
			return !!(_toResolve && _stateMachine.event("resolve"));
		};
		
		this.getState = function getState() {
			return _stateMachine.getCurrent();
		};
		
		if ($func instanceof Function) {
			_toResolve = $func;
			_scope = $scope;
		}
		
	};
	
});