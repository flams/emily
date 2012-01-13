require(["Store"], function (Store) {
	
	describe("StoreTest", function () {

		it("should be an object with a constructor", function () {
			expect(Store).toBeInstanceOf(Function);
		});
		
		it("should have the following methods once created", function () {
			var store = new Store();
			expect(store.getNbItems).toBeInstanceOf(Function);
			expect(store.get).toBeInstanceOf(Function);
			expect(store.set).toBeInstanceOf(Function);
			expect(store.has).toBeInstanceOf(Function);
			expect(store.del).toBeInstanceOf(Function);
			expect(store.alter).toBeInstanceOf(Function);
			expect(store.watch).toBeInstanceOf(Function);
			expect(store.unwatch).toBeInstanceOf(Function);
		});
	
	});
	
	describe("StoreGetSetDel", function () {
		
		var store = null;
		
		beforeEach(function () {
			store = new Store();
		});
		
		it("should set values of any type", function () {
			var obj = {},
				arr = [],
				func = function () {};
				
			store.set("test");
			expect(store.has("test")).toEqual(true);
			expect(store.get("test")).toBeUndefined();
			store.set("test", null);
			expect(store.get("test")).toEqual(null);
			store.set("test", obj);
			expect(store.get("test")).toBe(obj)
			store.set("test", arr);
			expect(store.get("test")).toEqual(arr);
			store.set("test", func);
			expect(store.get("test")).toEqual(func);
			store.set("test", "yes");
			expect(store.get("test")).toEqual("yes");
		});
		
		
		it("should return undefined if does'nt exist", function () {
			expect(store.get("has not")).toBeUndefined();
		});
		
		it("should update value if it already exists", function () {
			store.set("test", true);
			expect(store.set("test", false)).toEqual(true);
			expect(store.get("test")).toEqual(false);
		});
		
		it("should return false if name is not set", function () {
			expect(store.set()).toEqual(false);
		});
		
		it("should del value", function () {
			store.set("test", true);
			expect(store.del("test")).toEqual(true);
			expect(store.has("test")).toEqual(false);
			expect(store.del("fake")).toEqual(false);
		});

	});
	
	describe("StoreObservable", function () {
		
		var store = null;
		
		beforeEach(function () {
			store = new Store();
		});
		
		it("should notify on set", function () {
			var spy = jasmine.createSpy("callback");
			
			store.watch("added", spy);
			store.set("test");
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
		});
		
		it("should notify with new value on update", function () {
			var spy = jasmine.createSpy("callback");
			store.set("test");
			store.watch("updated", spy);
			store.set("test", "new");
		
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toEqual("new");
		});
		
		it("should provide value when said available", function () {
			var callback = function () {
				callback.ret = store.get("test");
			};
			store.watch("added", callback);
			store.set("test", "yes");
			
			expect(callback.ret).toEqual("yes");
		});
		
		it("should notify on del", function () {
			var spy = jasmine.createSpy("callback");
			store.set("test");
			store.watch("deleted", spy);
			store.del("test");
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("test");
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
		});
		
		it("can unwatch value", function () {
			var spy = jasmine.createSpy("callback");
			handler = store.watch("added", spy);
			store.unwatch(handler);
			store.set("test");
			store.del("test");
			expect(spy.wasCalled).toEqual(false);
		});
		
		it("should execute in scope on set", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			store.watch("added", spy, thisObj);
			store.set("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute in scope on update", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			store.watch("added", spy, thisObj);
			store.set("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute in scope on del", function () {
			var spy = jasmine.createSpy("callback"),
				thisObj = {};
			
			store.set("test");
			store.watch("deleted", spy, thisObj);
			store.del("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});

	});
	
	describe("StoreInit", function () {
		it("can be initialized with an object", function () {
			var func = function () {};
			
			var store = new Store({x: 10, y: 20, z:func});
			expect(store.get("x")).toEqual(10);
			expect(store.get("y")).toEqual(20);
			expect(store.get("z")).toEqual(func);
		});
		
		it("can be initialized with an array", function () {
			var store = new Store([1, 2, "yes"]);
			expect(store.get(0)).toEqual(1);
			expect(store.get(1)).toEqual(2);
			expect(store.get(2)).toEqual("yes");
		});
		
	});
	
	describe("StoreLength", function () {
		
		var store = null;
		
		beforeEach(function () {
			store = new Store();
		});
		
		it("should return the right number of items", function () {
			expect(store.getNbItems()).toEqual(0);
			store.set("value1");
			expect(store.getNbItems()).toEqual(1);
			store.set("value2");
			store.set("value3");
			expect(store.getNbItems()).toEqual(3);
			store.del("value3");
			expect(store.getNbItems()).toEqual(2);
			store.del("value2");
			store.del("value1");
			store.del("test");
			expect(store.getNbItems()).toEqual(0);
		});
		
		it("should return the right number of items when init with data", function () {
			var initValue = {x:10, y: 20},
				store = new Store(initValue);
			
			expect(store.getNbItems()).toEqual(2);
		});	
	});
	
	describe("StoreLoop", function () {
		
		var store = null,
			data = {
				"key1": "value1",
				"key3": 3,
				"key2": {}
			};
		
		beforeEach(function () {
			store = new Store(data);
		});
		
		it("should allow for looping through it", function () {
			expect(store.loop).toBeInstanceOf(Function);
			store.loop(function (val, idx) {
				expect(store.get(idx)).toEqual(val);
			});
		});
		
		it("should allow for looping in a given scope", function () {
			var thisObj = {},
				funcThisObj = null;
			store.loop(function () {
				funcThisObj = this;
			}, thisObj);
			
			expect(funcThisObj).toBe(thisObj);
		});
		
	});
	
	describe("StoreOrdered", function () {
		var store = null;
		
		beforeEach(function () {
			store = new Store([0, 1, 2, 3]);
		});
		
		it("should be working with arrays as data", function () {
			expect(store.get(0)).toEqual(0);
			expect(store.get(3)).toEqual(3);
			expect(store.getNbItems()).toEqual(4);
		});
		
		it("should be updatable", function () {
			expect(store.set(0, 10)).toEqual(true);
			expect(store.get(0)).toEqual(10);
		});
		
		it("should loop in the correct order", function () {
			var i = 0;
			store.loop(function (val, idx) {
				expect(idx).toEqual(i++);
			});
		});
		
	});
	
	
	describe("StoreAlteration", function () {
		var store = null,
			initialData = null;
		
		beforeEach(function () {
			initialData = [0, 1, 2, 3];
			store = new Store(initialData);
		});
		
		it("should give access to Array's functions", function () {
			spyOn(Array.prototype, "pop").andCallThrough();
			spyOn(Array.prototype, "sort").andCallThrough();
			spyOn(Array.prototype, "splice").andCallThrough();
			store.alter("pop");
			store.alter("sort");
			store.alter("splice", 1, 2);
			expect(Array.prototype.pop.wasCalled).toEqual(true);
			expect(Array.prototype.sort.wasCalled).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(1);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(2);
		});
		
		it("should advertise on changes", function () {
			var spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy();
			
			store.watch("updated", spy1);
			store.watch("deleted", spy2);
			
			store.alter("splice", 1, 2);

			expect(spy1.wasCalled).toEqual(true);
			expect(spy2.wasCalled).toEqual(true);
			expect(spy1.callCount).toEqual(1);
			expect(spy2.callCount).toEqual(2);
			expect(spy1.mostRecentCall.args[0]).toEqual(1);
			expect(spy1.mostRecentCall.args[1]).toEqual(3);
			spy2.calls.forEach(function (call) {
				// Don't know how to write this test better
				//  call.args[0] should equal 2 or 3
				expect(call.args[0] >= 2).toEqual(true);
				expect(call.args[1]).toBeUndefined();
			});
		});

		it("should return false if the function doesn't exist", function () {
			expect(store.alter("doesn't exist")).toEqual(false);
		});
		
		
		it("should call Array.splice on del if init'd with an array", function () {
			store.reset([0, 1, 2, 3]);
			spyOn(Array.prototype, "splice").andCallThrough();
			expect(store.del(1)).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(1);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(1);
			expect(store.get(0)).toEqual(0);
			expect(store.get(1)).toEqual(2);
		});
		
		it("should notify only once on del", function () {
			var spy = jasmine.createSpy();
			store.reset([0, 1, 2, 3]);
			store.watch("deleted", spy);
			store.del(1);
			expect(spy.callCount).toEqual(1);
		});
		
	});

	
	describe("StoreReset", function () {
		var store = null,
			initialData = {a:10},
			resetData = {b:20};
		
		beforeEach(function () {
			store = new Store(initialData);
		});
		
		it("should allow for complete data reset", function () {
			expect(store.reset).toBeInstanceOf(Function);
			expect(store.reset(resetData)).toEqual(true);
			expect(store.has("a")).toEqual(false);
			expect(store.get("b")).toEqual(20);
		});
		
		it("should only reset if data is object or array", function () {
			expect(function () {
				store.reset();
			}).not.toThrow();
			
			expect(store.reset()).toEqual(false);
			expect(store.get("a")).toEqual(10);
		});
		
		it("should advertise for every modified value", function () {
			var spyA = jasmine.createSpy(),
				spyB = jasmine.createSpy();
			
			store.watch("deleted", spyA);
			store.watch("added", spyB);
			store.reset(resetData);
			expect(spyA.wasCalled).toEqual(true);
			expect(spyA.mostRecentCall.args[0]).toEqual("a")
			expect(spyA.mostRecentCall.args[1]).toBeUndefined();
			expect(spyA.callCount).toEqual(1);
			expect(spyB.mostRecentCall.args[0]).toEqual("b");
			expect(spyB.mostRecentCall.args[1]).toEqual(20);
			expect(spyB.callCount).toEqual(1);
		});
	});
	
	describe("StoreIsolation", function () {
		
		var dataSet = null,
			store1 = null,
			store2 = null;
		
		beforeEach(function () {
			dataSet = {a: 10, b: 20};
			store1 = new Store(dataSet);
			store2 = new Store(dataSet);
		});
		
		it("shouldn't share data sets that are identical", function () {
			store1.set("shared", "yes");
			expect(store2.get("shared")).toBeUndefined();
		});
		
		it("shouldn't share observers", function () {
			var spyAdded = jasmine.createSpy(),
				spyUpdated = jasmine.createSpy();
			
			store1.watch("added", spyAdded);
			store2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});
		
		it("should have the same behaviour on reset", function () {
			store1.reset(dataSet);
			store2.reset(dataSet);
			store1.set("shared", "yes");
			expect(store2.get("shared")).toBeUndefined();

			var spyAdded = jasmine.createSpy(),
			spyUpdated = jasmine.createSpy();
		
			store1.watch("added", spyAdded);
			store2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});

	});

	
});