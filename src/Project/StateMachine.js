define("StateMachine", 
		
["Tools"],
/**
 * @class
 * Create a stateMachine
 */
function StateMachine(Tools) {
	
	 /**
     * @param initState {String} the initial state
     * @param diagram {Object} the diagram that describes the state machine
     * @example
     *
     *      diagram = {
     *              "State1" : [
     *                      [ message1, action, nextState], // Same as the state's add function
     *                      [ message2, action2, nextState]
     *              ],
     *
     *              "State2" :
     *                       [ message3, action3, scope3, nextState]
     *                      ... and so on ....
     *
     *   }
     *
     * @return the stateMachine object
     */
	function StateMachineConstructor($initState, $diagram) {

		/**
		 * The list of states
		 * @private
		 */
		var _states = {},
		
		/**
		 * The current state
		 * @private
		 */
		_currentState = "";
		
		/**
		 * Set the initialization state
		 * @param {String} name the name of the init state
		 * @returns {Boolean}
		 */
		this.init = function init(name) {
				if (_states[name]) {
					_currentState = name;
					return true;
				} else {
					return false;
				}
		};
		
		/**
		 * Add a new state
		 * @param {String} name the name of the state
		 * @returns {State} a new state
		 */
		this.add = function add(name) {
			if (!_states[name]) {
				return _states[name] = new Transition();
			} else {
				return false;
			}

		};
		
		/**
		 * Get an existing state
		 * @param {String} name the name of the state
		 * @returns {State} the state
		 */
		this.get = function get(name) {
			return _states[name];
		};
		
		/**
		 * Get the current state
		 * @returns {String}
		 */
		this.getCurrent = function getCurrent() {
			return _currentState;
		};
		
		/**
		 * Pass an event to the state machine
		 * @param {String} name the name of the event
		 * @returns {Boolean} true if the event exists in the current state
		 */
		this.event = function event(name) {
			var nextState = _states[_currentState].event.apply(_states[_currentState].event, Tools.toArray(arguments));
			// False means that there's no such event
			// But undefined means that the state doesn't not change
			if (nextState === false) {
				return false;
			} else {
				// There could be no next state
				_currentState = nextState || _currentState;
				return true;
			}
		};
		
		/**
		 * Initializes the StateMachine with the given diagram
		 */
		Tools.loop($diagram, function (transition, state) {
			var myState = this.add(state);
			transition.forEach(function (params){
				myState.add.apply(null, params);
			});
		}, this);
		
		/**
		 * Sets its initial state
		 */
		this.init($initState);
	}
	
	/**
	 * Each state has associated transitions
	 */
	function Transition() {
		
		/**
		 * The list of transitions associated to a state
		 * @private
		 */
		var _transitions = {};
		
		/**
		 * Add a new transition
		 * @param {String} event the event that will trigger the transition
		 * @param {Function} action the function that is executed
		 * @param {Object} scope [optional] the scope in which to execute the action
		 * @param {String} next [optional] the name of the state to transit to.
		 * @returns {Boolean} true if success, false if the transition already exists
		 */
		this.add = function add(event, action, scope, next) {
			
			var arr = [];
		
			if (_transitions[event]) {
				return false;
			}
			
			if (typeof event == "string"
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
				
					_transitions[event] = arr;
					return true;
			} 
				
			return false;	
		};
		
		/**
		 * Check if a transition can be triggered with given event
		 * @param {String} event the name of the event
		 * @returns {Boolean} true if exists
		 */
		this.has = function has(event) {
			return !!_transitions[event];
		};
		
		/**
		 * Execute the action associated to the given event
		 * @param {String} event the name of the event
		 * @param {params} params to pass to the action
		 * @returns false if error, the next state or undefined if success (that sounds weird)
		 */
		this.event = function event(event) {
			var _transition = _transitions[event];
			if (_transition) {
				_transition[0].apply(_transition[1], Tools.toArray(arguments).slice(1));
				return _transition[2];
			} else {
				return false;
			}
		};
	};
	
	return StateMachineConstructor;
	
});