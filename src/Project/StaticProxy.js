define("StaticProxy", 
		
function StaticProxy() {
	
	function _StaticProxy(proxied) {
		
		var _proxied = proxied;
		
		this.trap = function trap(method, wrapper) {
			var _trapped = _proxied[method];
			_proxied[method] = function () {
				wrapper();
				_trapped();
			};
		};
		
	}

	return {
		create: function (proxied) {
			return new _StaticProxy(proxied);
		}
	};
	
});