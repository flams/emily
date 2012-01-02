require(["TinyStore"], function (TinyStore) {
	
	describe("TinyStoreTest", function () {

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
		
		it("should return undefined if value is not set", function () {
			expect(tinyStore.get("has not")).toBeUndefined();
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
		
		it("should return false if name is not set", function () {
			expect(tinyStore.set()).toEqual(false);
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
			
			tinyStore.watch("added", spy);
			tinyStore.set("test");
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
		});
		
		it("should notify with new value on update", function () {
			var spy = jasmine.createSpy("callback");
			tinyStore.set("test");
			tinyStore.watch("updated", spy);
			tinyStore.set("test", "new");
		
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toEqual("new");
		});
		
		it("should provide value when annonced as available", function () {
			var callback = function () {
				callback.ret = tinyStore.get("test");
			};
			tinyStore.watch("added", callback);
			tinyStore.set("test", "yes");
			
			expect(callback.ret).toEqual("yes");
		});
		
		it("should notify on del", function () {
			var spy = jasmine.createSpy("callback");
			tinyStore.set("test");
			tinyStore.watch("deleted", spy);
			tinyStore.del("test");
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
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
			
			tinyStore.watch("added", spy, thisObj);
			tinyStore.watch("updated", spy, thisObj);
			tinyStore.set("test");
			
			expect(spy.mostRecentCall.object).toBe(thisObj);
			tinyStore.set("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute in scope on del", function () {
			var spy = jasmine.createSpy("callback"),
				thisObj = {};
			
			tinyStore.set("test");
			tinyStore.watch("deleted", spy, thisObj);
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
	
	describe("TinyStoreNesting", function () {
		var tinyStore = null,
			nestedStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create();
			nestedStore = TinyStore.create();
		});
		
		it("should store objects like other stores", function () {
			tinyStore.set("nestedStore", nestedStore);
			
			expect(tinyStore.get("nestedStore")).toBe(nestedStore);
			
			nestedStore.set("test", 10);
			expect(tinyStore.get("nestedStore").get("test")).toEqual(10);
		});
	});
	
	describe("TinyStoreLoop", function () {
		
		var tinyStore = null,
			data = {
				"key1": "value1",
				"key3": 3,
				"key2": {}
			};
		
		beforeEach(function () {
			tinyStore = TinyStore.create(data);
		});
		
		it("should allow for looping through it", function () {
			expect(tinyStore.loop).toBeInstanceOf(Function);
			tinyStore.loop(function (val, idx) {
				expect(tinyStore.get(idx)).toEqual(val);
			});
		});
		
		it("should allow for looping in a given scope", function () {
			var thisObj = {},
				funcThisObj = null;
			tinyStore.loop(function () {
				funcThisObj = this;
			}, thisObj);
			
			expect(funcThisObj).toBe(thisObj);
		});
		
	});
	
	describe("TinyStoreOrdered", function () {
		var tinyStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create([0, 1, 2, 3]);
		});
		
		it("should be working with arrays as data", function () {
			expect(tinyStore.get(0)).toEqual(0);
			expect(tinyStore.get(3)).toEqual(3);
			expect(tinyStore.getNbItems()).toEqual(4);
		});
		
		it("should be updatable", function () {
			expect(tinyStore.set(0, 10)).toEqual(true);
			expect(tinyStore.get(0)).toEqual(10);
		});
		
		it("should loop in the correct order", function () {
			var i = 0;
			tinyStore.loop(function (val, idx) {
				expect(idx).toEqual(i++);
			});
		});
		
	});
	
	describe("TinyStoreReset", function () {
		var tinyStore = null,
			initialData = {a:10},
			resetData = {b:20};
		
		beforeEach(function () {
			tinyStore = TinyStore.create(initialData);
		});
		
		it("should allow for complete data reset", function () {
			expect(tinyStore.reset).toBeInstanceOf(Function);
			expect(tinyStore.reset(resetData)).toEqual(true);
			expect(tinyStore.has("a")).toEqual(false);
			expect(tinyStore.get("b")).toEqual(20);
		});
		
		it("should notify on reset", function () {
			var callback = jasmine.createSpy();
			tinyStore.watch("reset", callback);
			
			tinyStore.reset(resetData);
			expect(callback.wasCalled).toEqual(true);
		});
		
		it("should only reset if data is object or array", function () {
			expect(function () {
				tinyStore.reset();
			}).not.toThrow();
			
			expect(tinyStore.reset()).toEqual(false);
			expect(tinyStore.get("a")).toEqual(10);
		});
	});
	
	describe("TinyStoresShareData", function () {
		
		var dataSet = null,
			tinyStore1 = null,
			tinyStore2 = null;
		
		beforeEach(function () {
			dataSet = {a: 10, b: 20};
			tinyStore1 = TinyStore.create(dataSet);
			tinyStore2 = TinyStore.create(dataSet);
		});
		
		it("should share data sets that are identical", function () {
			// It works because the dataSet itself has evolved.
			// Stores internal are based upon given dataset
			tinyStore1.set("shared", "yes");
			expect(tinyStore2.get("shared")).toEqual("yes");
		});
		
		it("shouldn't share observers though", function () {
			var spyAdded = jasmine.createSpy(),
				spyUpdated = jasmine.createSpy();
			
			tinyStore1.watch("added", spyAdded);
			tinyStore1.watch("updated", spyUpdated);
			tinyStore2.set("shared");
			tinyStore2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
			
		});
		
	});
	
});