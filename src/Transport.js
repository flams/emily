/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Transport", 
		
function Transport() {
	
	return function TransportConstructor($reqHandlers) {
		
		var _reqHandlers = null;
		
		this.setReqHandlers = function setReqHandlers(reqHandlers) {
			if (typeof reqHandlers == "object") {
				_reqHandlers = reqHandlers;
				return true;
			} else {
				return false;
			}
		};
		
		this.getReqHandlers = function getReqHandlers() {
			return _reqHandlers;
		};
		
		this.request = function request(channel, reqData, callback, scope) {
			if (_reqHandlers && _reqHandlers[channel] && typeof reqData == "object") {
				_reqHandlers[channel](reqData, function () {
					callback.apply(scope, arguments);
				});
				return true;
			} else {
				return false;
			}
		};
		
		this.listen = function listen(channel, url, callback, scope) {
			if (_reqHandlers && _reqHandlers[channel] &&
				typeof url == "string" && typeof callback == "function") {
				var func = function () {
					callback.apply(scope, arguments);
				},
				reqData = {
						keptAlive: true,
						method: "get",
						path: url
				},
				abort = _reqHandlers[channel](reqData, func, func);
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