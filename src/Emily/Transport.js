Emily.declare("Transport", /** @class */function Transport(API) {
	
	/**
	 * @returns a new Transport
	 */
	this.create = function create(url) {
		return new _Transport(url);
	};
	
	function _Transport($url) {
		
		var _socket,
			_io = API.require("io");
			_connect = function _connect(url) {
				_socket = _io.connect(url);
			},
			_getSocket = function _getSocket() {
				return _socket;
			},
			_on = function _on(event, func) {
				_socket.on(event, func);
			},
			_emit = function _emit(event, data) {
				_socket.emit(event, data);
			};
		
		(function () {
			$url && _connect($url);
		})();
		
		return {
			connect: _connect,
			getSocket: _getSocket,
			on: _on,
			emit: _emit
		};
	};
});