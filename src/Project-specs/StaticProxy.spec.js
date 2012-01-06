require(["StaticProxy"], function (StaticProxy) {
	
	describe("StaticProxyCreate", function () {
		
		it("should be a constructor function", function () {
			expect(StaticProxy).toBeInstanceOf(Function);
		});

		it("should return a new object on create", function () {
			var proxied = {},
				staticProxy = new StaticProxy();
			
			expect(staticProxy).toBeInstanceOf(Object);
		});
		
	});
	
	describe("StaticProxyTest", function () {
		
		var staticProxy = null,
			proxied = {
				func: function () {}
			};
		
		beforeEach(function () {
			staticProxy = new StaticProxy(proxied);
		});
		
		it("should trap a method", function() {
			var spy = jasmine.createSpy();
			
			expect(staticProxy.trap).toBeInstanceOf(Function);
			staticProxy.trap("func", spy);
			
			proxied.func();
			
			expect(spy.wasCalled).toEqual(true);
		});
		
	});
	
});