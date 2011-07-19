/**
 * @class
 */
function Emily() {
    /**
     * declare a new service
     * @param {String} name the name of the service
     * @param {Function} func the service's function
     */
    this.declare = function add(name, func) {
    	this[name] = new func(this);
    };
    
    /**
     * removes a service
     * @param {String} name the name of the service
     */
    this.remove = function remove(name) {
    	delete this[name];
    };

    /**
     * loads a service
     * @param {String} name the name of the service
     */
    this.load = function load(name) {
    	
    };
    
    /**
     * reloads a service
     * @param {String} name the name of the service
     */
    this.reload = function reload(name) {
    	
    };
    
};

var Emily = new Emily; Emily.declare("Observable", /** @class */function Observable() {
	
	
	/**
	 * Return a new Observable
	 */
	this.create = function create() {
		return new _Observable();
	};
	
	function _Observable() {

		/**
		 * @private _topics
		 */
		var _topics = {};
		/**
		 * Add an observer
		 * @param {String} topic the topic to observe
		 * @param {Function} callback the callback to execute
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns handler
		 */
		this.watch = function watch(topic, callback, scope) {
			if (typeof topic == "string" && typeof callback == "function") {
				var observers = _topics[topic] = _topics[topic] || [];
			
				observer = [callback, scope];
				observers.push(observer);
				return [topic,observers.indexOf(observer)];
				
			} else {
				return false;
			}

		};
		
		/**
		 * Remove an observer
		 * @param handler returned by the watch method
		 * @returns Boolean
		 */
		this.unwatch = function unwatch(handler) {
			var topic = handler[0], idx = handler[1];
			if (_topics[topic] && _topics[topic][idx]) {
				// set value to null so the indexes don't move.
				_topics[topic][idx] = null;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Notifies observers that a topic has a new message
		 * @param topic
		 * @param subject
		 */
		this.notify = function notify(topic, subject) {
			
			var observers = _topics[topic],
				l;

			if (observers) {
				l = observers.length;
				while (l--) {
					observers[l] && observers[l][0].call(observers[l][1] || window, subject); 
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Check if topic has described observer
		 * @param topic
		 * @param func
		 * @returns {Boolean}
		 */
		this.hasObserver = function hasObserver(handler) {
			return !!( handler && _topics[handler[0]] && _topics[handler[0]][handler[1]]);
		};
		
	};
	
});Emily.declare("Promises", /** @class */function Promises(API) {
	
	
});Emily.declare("TinyStore", /** @class */function TinyStore(API) {
	
	/**
	 * Return a new DataStore
	 */
	this.create = function create(values) {
		return new _TinyStore(values);
	};
    
	/**
	 * 
	 * @param values
	 * @returns
	 */
	_TinyStore = function _TinyStore(values) {
		
		var _data = {}, 
			mixin = function mixin(values) {
				for (var i in values) {
					if (values.hasOwnProperty(i)) {
						this.length++;
						_data[i] = values[i];
					}
				}
			},
			_observable = API.Observable.create();
			
		
		
		this.length = 0;
		mixin.call(this, values);
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.get = function get(name) {
			return _data[name];
		};
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.has = function has(name) {
			return _data.hasOwnProperty(name);
		};
		
		/**
		 * 
		 * @param name
		 * @param value
		 * @returns
		 */
		this.set = function set(name, value) {
			var oldValue;
			if (typeof name == "string") {
				oldValue = _data[name];
				_data[name] = value;
				if (!oldValue) {
					this.length++;
				}
				_observable.notify(name, value, oldValue);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.del = function del(name) {
			if (this.has(name)) {
				this.length--;
				delete _data[name];
				_observable.notify(name, _data[name]);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * 
		 * @param name
		 * @param func
		 * @returns
		 */
		this.watch = function watch(name, func, scope) {
			return _observable.watch(name, func, scope);
		};
		
		/**
		 * 
		 * @param handler
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _observable.unwatch(handler);
		};
		
	};
});