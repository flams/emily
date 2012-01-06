define("StaticProxy", 
		
function StaticProxyConstructor() {
	
	return function StaticProxy(proxied) {
		
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