require(["Promise"], function (Promise) {
	
	describe("PromiseInit", function () {
		
		it("should be a constructor function", function () {
			expect(Promise).toBeInstanceOf(Function);
		});
		
		it("should return an object once created with the following methods", function () {
			var promise = new Promise();
			expect(promise.then).toBeInstanceOf(Function);
			expect(promise.resolve).toBeInstanceOf(Function);
		});
		
	});
	
	describe("PromiseTest", function () {
		
		it("should resolve only if Promise is set and unresolved", function () {
			var promise = new Promise();
			expect(promise.resolve()).toEqual(false);
			promise = new Promise("");
			expect(promise.resolve()).toEqual(false);
			promise = new Promise(function(){});
			expect(promise.resolve()).toEqual(true);
		});
		
		
		it("should return its state", function () {
			var promise = new Promise();
			expect(promise.getState).toBeInstanceOf(Function);
			expect(promise.getState()).toEqual("Unresolved");
		});
		
		it("should be init'd to Unresolved", function () {
			var promise = new Promise();
			expect(promise.getState()).toEqual("Unresolved");
		});
		
		it("should call the function on resolve with the result handler", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy);
			
			promise.resolve();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toBeInstanceOf(Function);
		});
		
		it("should call the function on resolve in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {},
				promise = new Promise(spy, thisObj);
			
			promise.resolve();
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should change state to Resolved on success", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy),
				result;
			
			promise.resolve();
			result = spy.mostRecentCall.args[0];
			expect(result("don't do much")).toEqual(false);
			expect(result("success")).toEqual(true);
			expect(result("success")).toEqual(false);
			expect(promise.getState()).toEqual("Resolved");
		});
		
		it("should change state to Failed on fail", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy),
				result;
			
			promise.resolve();
			result = spy.mostRecentCall.args[0];
			expect(result("don't do much")).toEqual(false);
			expect(result("fail")).toEqual(true);
			expect(result("fail")).toEqual(false);
			expect(promise.getState()).toEqual("Failed");
		});
		
		it("should execute the then callback on success", function () {
			var spyPromise = jasmine.createSpy(),
				spyThen = jasmine.createSpy(),
				promise = new Promise(spyPromise),
				result;
			
			promise.then(spyThen),
			promise.resolve();
			result = spyPromise.mostRecentCall.args[0];
			expect(spyThen.wasCalled).toEqual(false);
			result("success");
			expect(spyThen.wasCalled).toEqual(true);
		});
		
		it("should pass arguments to the then callback", function () {
			var spyPromise = jasmine.createSpy(),
				spyThen = jasmine.createSpy(),
				args = {},
				promise = new Promise(spyPromise);
			
			promise.then(spyThen),
			promise.resolve();
			spyPromise.mostRecentCall.args[0]("success", args);
			expect(spyThen.wasCalled).toEqual(true);
			expect(spyThen.mostRecentCall.args[0]).toBe(args);
		});
		
		it("should execute the then callback in scope", function () {
			var spyPromise = jasmine.createSpy(),
				spyThen = jasmine.createSpy(),
				thisObj = {},
				promise = new Promise(spyPromise);
			
			promise.then(spyThen, thisObj),
			promise.resolve();
			spyPromise.mostRecentCall.args[0]("success");
			expect(spyThen.wasCalled).toEqual(true);
			expect(spyThen.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute all then callbacks", function () {
			var spyPromise = jasmine.createSpy(),
				spyThen1 = jasmine.createSpy(),
				spyThen2 = jasmine.createSpy(),
				spyThen3 = jasmine.createSpy(),
				promise = new Promise(spyPromise);
			
			promise.then(spyThen1);
			promise.then(spyThen2);
			promise.then(spyThen3);
			
			promise.resolve();
			spyPromise.mostRecentCall.args[0]("success");
			expect(spyThen1.wasCalled).toEqual(true);
			expect(spyThen2.wasCalled).toEqual(true);
			expect(spyThen3.wasCalled).toEqual(true);
		});
		
		it("should not resolve an already resolved promise", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy);

			promise.resolve();
			spy.mostRecentCall.args[0]("success");
			expect(promise.resolve()).toEqual(false);
		});
		
		it("should directly return on new then if resolved promise", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy),
				success = {},
				result;
			
			promise.resolve();
			spy.mostRecentCall.args[0]("success", success);
			promise.then(function (res) {
				result = res;
			});
			expect(result).toBe(success);
		});
		
		it("should work the same with errbacks", function () {
			var spyPromise = jasmine.createSpy(),
				spyThen1 = jasmine.createSpy(),
				spyThen2 = jasmine.createSpy(),
				spyThen3 = jasmine.createSpy(),
				promise = new Promise(spyPromise),
				scope={};
		
			promise.then(function(){}, spyThen1);
			promise.then(function(){}, {}, spyThen2);
			promise.then(function(){}, spyThen3, scope);
			
			promise.resolve();
			spyPromise.mostRecentCall.args[0]("fail");
			expect(spyThen1.wasCalled).toEqual(true);
			expect(spyThen2.wasCalled).toEqual(true);
			expect(spyThen3.wasCalled).toEqual(true);
			expect(spyThen3.mostRecentCall.object).toBe(scope);
		});
		
		it("should directly return on new then if failed promise", function () {
			var spy = jasmine.createSpy(),
				promise = new Promise(spy),
				failed = {},
				result;
			
			promise.resolve();
			spy.mostRecentCall.args[0]("fail", failed);
			promise.then(function(){}, function (res) {
				result = res;
			});
			expect(result).toBe(failed);
		});
		
	});

	
	
});