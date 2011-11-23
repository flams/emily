Emily.declare("Observable",
/** 
* @class 
* Observable is an implementation of the Observer design pattern, 
* which is also known as publish/subscribe.
* 
* This service creates an Observable on which you can add subscribers.
*/
function Observable(exports) {
	
	exports.create = 
	/**
	 * Returns a new Observable
	 * @returns {Object} an Observable
	 */
	function create() {
		return new _Observable();
	};
	
	/**
	 * Defines the Observable
	 * @private
	 * @returns {_Observable}
	 */
	function _Observable() {

		/**
		 * The list of topics
		 * @private
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
		 * @param {Handler} handler returned by the watch method
		 * @returns {Boolean} true if there were subscribers
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
		 * @param {String} topic the name of the topic to publish to
		 * @param subject
		 * @returns {Boolean} true if there was subscribers
		 */
		this.notify = function notify(topic, subject) {
			
			var observers = _topics[topic],
				l;

			if (observers) {
				l = observers.length;
				while (l--) {
					observers[l] && observers[l][0].call(observers[l][1] || null, subject); 
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Check if topic has the described observer
		 * @param {Handler}
		 * @returns {Boolean} true if exists
		 */
		this.hasObserver = function hasObserver(handler) {
			return !!( handler && _topics[handler[0]] && _topics[handler[0]][handler[1]]);
		};
		
	}
	
});