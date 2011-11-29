Emily.declare("TinyStore", 
/** 
 * @class
 * TinyStore creates a small NoSQL database
 * that can publish events on data add/change.
 */
 function TinyStore(API) {
	
	this.create = 
	/**
	 * Creates a new TinyStore
	 * @param {Object} values the values to initialize the store with
	 * @returns {Object} the TinyStore
	 */
	function create(values) {
		return new _TinyStore(values);
	};
    
	/**
	 * Defines the tinyStore
	 * @private
	 * @param values
	 * @returns
	 */
	function _TinyStore(values) {
		
		var _data = {}, 
			_tools = API.require("Tools"),
			_observable = API.require("Observable").create();
			
		_tools.mixin(values, _data);
		
		/**
		 * Get the number of items in the store
		 * @returns {Int} the number of items in the store
		 */
		this.getNbItems = function() {
			return _tools.count(_data);
		};
		

		
		/**
		 * Get a value from its index
		 * @param {String} name the name of the index
		 * @returns the value
		 */
		this.get = function get(name) {
			return _data[name];
		};
		
		/**
		 * Checks if the store has a given value
		 * @param {String} name the name of the index
		 * @returns {Boolean} true if the value exists
		 */
		this.has = function has(name) {
			return _data.hasOwnProperty(name);
		};
		
		/**
		 * Set a new value and overrides an existing one
		 * @param {String} name the name of the value
		 * @param value the value to assign
		 * @returns true if value is set
		 */
		this.set = function set(name, value) {
			var oldValue;
			if (typeof name == "string") {
				oldValue = _data[name];
				_data[name] = value;
				_observable.notify(name, value, oldValue);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Delete value from its index
		 * @param {String} name the name of the index from which to delete the value
		 * @returns true if successfully deleted.
		 */
		this.del = function del(name) {
			if (this.has(name)) {
				delete _data[name];
				_observable.notify(name, _data[name]);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Watch the value's modifications
		 * A first notification is done if the value already exists
		 * @param {String} name the index of the value
		 * @param {Function} func the function to execute when the value changes
		 * @param {Object} scope the scope in which to execute the function
		 * @returns {Handler} the subscribe's handler to use to stop watching
		 */
		this.watch = function watch(name, func, scope) {
			var handler = _observable.watch(name, func, scope);
			if (_data[name]) {
				_observable.notify(name, _data[name]);
			}
			return handler;
		};
		
		/**
		 * Unwatch the value's modifications
		 * @param {Handler} handler the handler returned by the watch function
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _observable.unwatch(handler);
		};
		
	}
});