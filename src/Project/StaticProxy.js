define("StaticProxy", 
		
function StaticProxy() {
	
	return function StaticProxyConstructor(proxied) {
		
		var _proxied = proxied;
		
		this.trap = function trap(method, wrapper) {
			var _trapped = _proxied[method];
			_proxied[method] = function () {
				wrapper();
				_trapped();
			};
		};
		
	};
	
});