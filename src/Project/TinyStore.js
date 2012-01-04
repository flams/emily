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
			_observable = Observable.create(),
			_notifyDiffs = function _notifyDiffs(previousData) {
				var diffs = Tools.objectsDiffs(previousData, Tools.jsonify(_data));
				["updated",
				 "deleted",
				 "added"].forEach(function (value) {
					 diffs[value].forEach(function (dataIndex) {
							_observable.notify(value, dataIndex, _data[dataIndex]);
					 });
				});
			};
		
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
			var ante;
			if (typeof name != "undefined") {
				ante = this.has(name);
				_data[name] = value;
				if (ante) {
					_observable.notify("updated", name, _data[name]);	
				} else {
					_observable.notify("added", name, _data[name]);
				}
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
				_observable.notify("deleted", name);
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
				var previousData = Tools.jsonify(_data);
				_data = Tools.jsonify(data || {});
				_notifyDiffs(previousData);
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
				 var previousData = Tools.jsonify(_data),
				 apply = _data[name].apply(_data, arguments);
				 _notifyDiffs(previousData);
				 return apply;
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