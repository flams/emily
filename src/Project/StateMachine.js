define("StateMachine", 

["Tools"],
		
function StateMachine(Tools) {
	
	function _StateMachine() {
		
		var _states = {},
			_currentState = "";
		
		return {
			init: function init(name) {
				if (_states[name]) {
					_currentState = name;
					return true;
				} else {
					return false;
				}
			},
			add: function add(name) {
				if (!_states[name]) {
					return _states[name] = new _Transition();
				} else {
					return false;
				}

			},
			get: function get(name) {
				return _states[name];
			},
			getCurrent: function getCurrent() {
				return _currentState;
			},
			event: function event(name) {
				var nextState = _states[_currentState].event(name);
				// False means that there's no such event
				// But undefined means that the state doesn't not change
				if (nextState === false) {
					return false;
				} else {
					// There could be no next state
					_currentState = nextState || _currentState;
					return true;
				}
			}
		};
	}
	
	function _Transition() {
		
		var _transitions = {};
		
		return {
			add: function add(message, action, scope, next) {
				
				var arr = [];
				
				if (_transitions[message]) {
					return false;
				}
				
				if (typeof message == "string"
					&& typeof action == "function") {	
						
						arr[0] = action;
					
						if (typeof scope == "object") {
							arr[1] = scope;
						} 
						
						if (typeof scope == "string") {
							arr[2] = scope;
						} 
						
						if (typeof next == "string") {
							arr[2] = next;
						}
					
						_transitions[message] = arr;
						return true;
				} 
					
				return false;
				
				
			},
			event: function event(event, params) {
				var _transition = _transitions[event];
				if (_transition) {
					
					_transition[0].call(_transition[1], params);
					return _transition[2];
				} else {
					return false;
				}
			}
		};
		
	}
	
	return {
		create: function create() {
			return new _StateMachine();
		}
	};
	
});