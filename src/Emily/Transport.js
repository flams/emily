define("Transport",
/** 
 * @class
 * Transport allows for client-server eventing.
 * It's based on socket.io.
 */
function () {

	return {
		/**
		 * Creates a new Transport
		 * @param {Url} url the url to connect Transport to
		 * @returns {Object} new Transport
		 */
		create: function create(url) {
			return new _Transport(url).connect(url);
		}
	};
	
	/**
	 * Defines the Transport
	 * @private
	 * @param {url} $url the url to connect Transport to
	 * @returns
	 */
	function _Transport($url) {
		
		/**
		 * @private
		 * The socket.io's socket
		 */
		var _socket,
		
		/**
		 * @private
		 * The socket.io globally defined module
		 */
		_io = io;
		
		/**
		 * Connect Transport to an url
		 * @param {Url} url the url to connect Transport to
		 */
		this.connect = function connect(url) {
			_socket = _io.connect(url);
			return this;
		},
		
		/**
		 * Get the socket, for debugging purpose
		 * @returns {Object} the socket
		 */
		this.getSocket = function getSocket() {
			return _socket;
		},
		
		/**
		 * Subscribe to a socket event
		 * @param {String} event the name of the event
		 * @param {Function} func the function to execute when the event fires
		 */
		this.on = function on(event, func) {
			_socket.on(event, func);
		},
		
		/**
		 * Publish an event on the socket
		 * @param {String} event the event to publish
		 * @param data
		 */
		this.emit = function emit(event, data) {
			_socket.emit(event, data);
		};
	};
});