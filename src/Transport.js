/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Transport", 
		
["Store", "Tools"],
/**
 * @class
 * Transport creates the link between your requests and Emily's requests handlers.
 * A request handler can be defined to make requets of any kind as long as it's supported
 * by your node.js. (HTTP, FileSystem, SIP...)
 */
function Transport(Store, Tools) {
	
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
			if (reqHandlers instanceof Store) {
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
		 * @param {Object} reqData the request data
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.request = function request(channel, reqData, callback, scope) {
			if (_reqHandlers.has(channel) && typeof reqData == "object") {
				_reqHandlers.get(channel)(reqData, function () {
					callback.apply(scope, arguments);
				});
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Listen to a path (Kept alive)
		 * @param {String} channel is the name of the request handler to use
		 * @param {Object} reqData the request data: path should indicate the url, query can add up query strings to the url
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, reqData, callback, scope) {
			if (_reqHandlers.has(channel) && typeof reqData == "object" && 
				typeof reqData.path == "string" && typeof callback == "function") {
				var func = function () {
					callback.apply(scope, arguments);
				},
				abort;
				
				Tools.mixin({
					keptAlive: true,
					method: "get"
				}, reqData);
				
				abort = _reqHandlers.get(channel)(reqData, func, func);
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