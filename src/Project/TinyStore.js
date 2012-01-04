define("TinyStore", ["Observable", "Tools"],
/** 
 * @class
 * TinyStore creates a small NoSQL database
 * that can publish events on data add/change.
 */
 function TinyStore(Observable, Tools) {
	
	/**
	 * Defines the tinyStore
	 * @private
	 * @param values
	 * @returns
	 */
	function _TinyStore(values) {
		
		var _data = JSON.parse(JSON.stringify(values || {})), 
			_observable = Observable.create();
		
		/**
		 * Get the number of items in the store
		 * @returns {Number} the number of items in the store
		 */
		this.getNbItems = function() {
			return Tools.count(_data);
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
			if (typeof name != "undefined") {
				_data[name] = typeof value == "undefined" ? null : value;
				_observable.notify(name, _data[name]);
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
		 * @param {String} name the index of the value
		 * @param {Function} func the function to execute when the value changes
		 * @param {Object} scope the scope in which to execute the function
		 * @returns {Handler} the subscribe's handler to use to stop watching
		 */
		this.watch = function watch(name, func, scope) {
			return _observable.watch(name, func, scope);
		};
		
		/**
		 * Unwatch the value's modifications
		 * @param {Handler} handler the handler returned by the watch function
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _observable.unwatch(handler);
		};

		this.loop = function loop(func, scope) {
			Tools.loop(_data, func, scope);
		};
		
		this.reset = function reset(data) {
			if (data instanceof Object) {
				// This should go into tools as well, in a "comparison function" that only returns
				// removed, modified arrays to loop on
					var previousData = JSON.parse(JSON.stringify(_data)),
				 	unchanged = [];


					_data = JSON.parse(JSON.stringify(data || {}));
					
				 // Check for the unchanged values
				 this.loop(function (value, idx) {
					 if (value === previousData[idx]) {
						 unchanged.push(idx);
					 }
				 });
				 
				 // Notify for the deleted
				 Tools.loop(previousData, function (value, idx) {
					if (typeof _data[idx] == "undefined") {
						_observable.notify(idx);
						//NOTNOW BUT WILL BE NEEDED:_observable.unwatchAll(idx);
					}
				 });
				 
				 // Notify those that have changed
				 this.loop(function (value, idx) {
					 // If it has changed, it's not in the unchanged array
					if (unchanged.indexOf(idx) < 0) {
						_observable.notify(idx, value);
					} 
				 });

				return true;
			} else {
				return false;
			}

		};
		
		["push",
		 "pop",
		 "unshift",
		 "shift",
		 "slice",
		 "splice"
		 ].forEach(function (name) {
			 this[name] = function () {
				 return _data[name].apply(_data, arguments);	 
			 };
		 }, this);
	
	}
	
	return { 
		/**
		 * Creates a new TinyStore
		 * @param {Object} values the values to initialize the store with
		 * @returns {Object} the TinyStore
		 */
		create: function create(values) {
			return new _TinyStore(values);
		}
	};
});