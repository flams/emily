/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Transport",

["Store"],
/**
 * @class
 * Transport creates the link between your requests and Emily's requests handlers.
 * A request handler can be defined to make requets of any kind as long as it's supported
 * by your node.js. (HTTP, FileSystem, SIP...)
 */
function Transport(Store) {

	/**
	 * Create a Transport
	 * @param {Object} $reqHandlers the requestHandler defined in your node.js app
	 * @returns
	 */
	return function TransportConstructor($reqHandlers) {

		/**
		 * The request handlers
		 * @private
		 */
		var _reqHandlers = null;

		/**
		 * Set the requests handlers
		 * @param {Object} reqHandlers the list of requests handlers
		 * @returns
		 */
		this.setReqHandlers = function setReqHandlers(reqHandlers) {
			if (reqHandlers instanceof Object) {
				_reqHandlers = reqHandlers;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Get the requests handlers
		 * @private
		 * @returns
		 */
		this.getReqHandlers = function getReqHandlers() {
			return _reqHandlers;
		};

		/**
		 * Make a request
		 * @param {String} channel is the name of the request handler to use
		 * @param data the request data
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.request = function request(channel, data, callback, scope) {
			if (_reqHandlers.has(channel)
					&& typeof data != "undefined") {

				_reqHandlers.get(channel)(data, function () {
					callback && callback.apply(scope, arguments);
				});
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Listen to a path (Kept alive)
		 * @param {String} channel is the name of the request handler to use
		 * @param data the request data: path should indicate the url, query can add up query strings to the url
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, data, callback, scope) {
			if (_reqHandlers.has(channel)
					&& typeof data != "undefined"
					&& typeof callback == "function") {

				var func = function () {
					callback.apply(scope, arguments);
				},
				abort;

				abort = _reqHandlers.get(channel)(data, func, func);
				return function () {
					abort.func.call(abort.scope);
				};
			} else {
				return false;
			}
		};

		this.setReqHandlers($reqHandlers);

	};

});
