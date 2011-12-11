require(["TinyStore"], function (TinyStore) {
	
	describe("TinyStoreTest", function () {

		beforeEach(function() {
			this.addMatchers({
				toBeInstanceOf: function(expected) {
					return this.actual instanceof expected;
				}
			});
		});
		
		it("should be an object with a create function", function () {
			expect(TinyStore).toBeInstanceOf(Object);
			expect(TinyStore.create).toBeInstanceOf(Function);
		});
		
		it("should have the correct API once created", function () {
			var tinyStore = TinyStore.create();
			expect(tinyStore.getNbItems).toBeInstanceOf(Function);
			expect(tinyStore.get).toBeInstanceOf(Function);
			expect(tinyStore.set).toBeInstanceOf(Function);
			expect(tinyStore.has).toBeInstanceOf(Function);
			expect(tinyStore.del).toBeInstanceOf(Function);
			expect(tinyStore.watch).toBeInstanceOf(Function);
			expect(tinyStore.unwatch).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TinyStoreGetSetDel", function () {
		
		var tinyStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create();
		});

		it("should set undefined value and get it", function () {
			tinyStore.set("test");
			expect(tinyStore.has("test")).toEqual(true);
			expect(tinyStore.get("test")).toBeUndefined();
		});
		
		it("should set null value", function () {
			tinyStore.set("test", null);
			expect(tinyStore.get("test")).toEqual(null);
		});
		
		it("should update value if it already exists", function () {
			tinyStore.set("test", true);
			expect(tinyStore.set("test", false)).toEqual(true);
			expect(tinyStore.get("test")).toEqual(false);
		});
		
		it("should return false if wrong parameters", function () {
			expect(tinyStore.set()).toEqual(false);
			expect(tinyStore.set({})).toEqual(false);
			expect(tinyStore.set({}, "test")).toEqual(false);
			expect(tinyStore.set([])).toEqual(false);
		});
		
		it("should del value", function () {
			tinyStore.set("test", true);
			expect(tinyStore.del("test")).toEqual(true);
			expect(tinyStore.has("test")).toEqual(false);
			expect(tinyStore.del("fake")).toEqual(false);
		});

	});

	
	describe("TinyStoreWatchUnwatch", function () {
		
		var tinyStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create();
		});
		
		it("should notify on set", function () {
			var spy = jasmine.createSpy("callback");
			
			tinyStore.watch("test", spy);
			tinyStore.set("test");
			expect(spy.wasCalled).toEqual(true);
		});
		
		it("should notify with new value on update", function () {
			var spy = jasmine.createSpy("callback");
			tinyStore.set("test", "old");
			tinyStore.watch("test", spy);
			tinyStore.set("test", "new");
		
			expect(spy.mostRecentCall.args[0]).toEqual("new");
		});
		
		it("should notify on del", function () {
			var spy = jasmine.createSpy("callback");
			tinyStore.set("test");
			tinyStore.watch("test", spy);
			tinyStore.del("test");
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toBeUndefined();
		});
		
		it("can unwatch value", function () {
			var spy = jasmine.createSpy("callback");
			handler = tinyStore.watch("test", spy);
			tinyStore.unwatch(handler);
			tinyStore.set("test");
			tinyStore.del("test");
			expect(spy.wasCalled).toEqual(false);
		});
		
		it("should execute in scope on set", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			tinyStore.watch("test", spy, thisObj);
			tinyStore.set("test");
			
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute in scope on del", function () {
			var spy = jasmine.createSpy("callback"),
				thisObj = {};
			
			tinyStore.set("test");
			tinyStore.watch("test", spy, thisObj);
			tinyStore.del("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});

	});
	
	describe("TinyStoreInit", function () {
		it("can be initialized with values", function () {
			var tinyStore = TinyStore.create({x: 10, y: 20});
			expect(tinyStore.has("x")).toEqual(true);
			expect(tinyStore.get("x")).toEqual(10);
			expect(tinyStore.has("y")).toEqual(true);
			expect(tinyStore.get("y")).toEqual(20);
		});
	});
	
	describe("TinyStoreLength", function () {
		
		var tinyStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create();
		});
		
		it("should return the right number of items", function () {
			expect(tinyStore.getNbItems()).toEqual(0);
			tinyStore.set("value1");
			expect(tinyStore.getNbItems()).toEqual(1);
			tinyStore.set("value2");
			tinyStore.set("value3");
			expect(tinyStore.getNbItems()).toEqual(3);
			tinyStore.del("value3");
			expect(tinyStore.getNbItems()).toEqual(2);
			tinyStore.del("value2");
			tinyStore.del("value1");
			tinyStore.del("test");
			expect(tinyStore.getNbItems()).toEqual(0);
		});
		
		it("should return the right number of items when init with data", function () {
			var initValue = {x:10, y: 20},
				tinyStore = TinyStore.create(initValue);
			
			expect(tinyStore.getNbItems()).toEqual(2);
		});	
	});
	
});