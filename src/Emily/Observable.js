Emily.declare("Observable", /** @class */function Observable() {
	
	
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
		
	}
	
});