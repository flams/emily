require(["StaticProxy"], function (StaticProxy) {
	
	describe("StaticProxyCreate", function () {
		
		it("should be an object with a create function", function () {
			expect(StaticProxy).toBeInstanceOf(Object);
			expect(StaticProxy.create).toBeInstanceOf(Function);
		});

		it("should return a new object on create", function () {
			var proxied = {},
				staticProxy = StaticProxy.create(proxied);
			
			expect(staticProxy).toBeInstanceOf(Object);
		});
		
	});
	
	describe("StaticProxyTest", function () {
		
		var tinyProxy = null,
			proxied = {
				func: jasmine.createSpy()
			};
		
		beforeEach(function () {
			staticProxy = StaticProxy.create(proxied);
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