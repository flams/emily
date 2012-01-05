require(["TinyStore"], function (TinyStore) {
	
	describe("TinyStoreTest", function () {

		it("should be an object with a create function", function () {
			expect(TinyStore).toBeInstanceOf(Object);
			expect(TinyStore.create).toBeInstanceOf(Function);
		});
		
		it("should have the following methods once created", function () {
			var tinyStore = TinyStore.create();
			expect(tinyStore.getNbItems).toBeInstanceOf(Function);
			expect(tinyStore.get).toBeInstanceOf(Function);
			expect(tinyStore.set).toBeInstanceOf(Function);
			expect(tinyStore.has).toBeInstanceOf(Function);
			expect(tinyStore.del).toBeInstanceOf(Function);
			expect(tinyStore.alter).toBeInstanceOf(Function);
			expect(tinyStore.watch).toBeInstanceOf(Function);
			expect(tinyStore.unwatch).toBeInstanceOf(Function);
		});
	
	});
	
	describe("TinyStoreGetSetDel", function () {
		
		var tinyStore = null;
		
		beforeEach(function () {
			tinyStore = TinyStore.create();
		});
		
		it("should set values of any type", function () {
			var obj = {},
				arr = [],
				func = function () {};
				
			tinyStore.set("test");
			expect(tinyStore.has("test")).toEqual(true);
			expect(tinyStore.get("test")).toBeUndefined();
			tinyStore.set("test", null);
			expect(tinyStore.get("test")).toEqual(null);
			tinyStore.set("test", obj);
			expect(tinyStore.get("test")).toBe(obj)
			tinyStore.set("test", arr);
			expect(tinyStore.get("test")).toEqual(arr);
			tinyStore.set("test", func);
			expect(tinyStore.get("test")).toEqual(func);
			tinyStore.set("test", "yes");
			expect(tinyStore.get("test")).toEqual("yes");
		});
		
		
		it("should return undefined if does'nt exist", function () {
			expect(tinyStore.get("has not")).toBeUndefined();
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
		
		it("should call Array.splice on del if init'd with an array", function () {
			tinyStore.reset([1]);
			spyOn(Array.prototype, "splice").andCallThrough();
			expect(tinyStore.del(0)).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(0);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(1);
		});

	});
	
	describe("TinyStoreObservable", function () {
		
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
		
		it("should provide value when said available", function () {
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
			handler = tinyStore.watch("added", spy);
			tinyStore.unwatch(handler);
			tinyStore.set("test");
			tinyStore.del("test");
			expect(spy.wasCalled).toEqual(false);
		});
		
		it("should execute in scope on set", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			tinyStore.watch("added", spy, thisObj);
			tinyStore.set("test");
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should execute in scope on update", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			tinyStore.watch("added", spy, thisObj);
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
		it("can be initialized with an object", function () {
			var func = function () {};
			
			var tinyStore = TinyStore.create({x: 10, y: 20, z:func});
			expect(tinyStore.get("x")).toEqual(10);
			expect(tinyStore.get("y")).toEqual(20);
			expect(tinyStore.get("z")).toEqual(func);
		});
		
		it("can be initialized with an array", function () {
			var tinyStore = TinyStore.create([1, 2, "yes"]);
			expect(tinyStore.get(0)).toEqual(1);
			expect(tinyStore.get(1)).toEqual(2);
			expect(tinyStore.get(2)).toEqual("yes");
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
	
	
	describe("TinyStoreAlteration", function () {
		var tinyStore = null,
			initialData = null;
		
		beforeEach(function () {
			initialData = [0, 1, 2, 3];
			tinyStore = TinyStore.create(initialData);
		});
		
		it("should give access to Array's functions", function () {
			spyOn(Array.prototype, "pop").andCallThrough();
			spyOn(Array.prototype, "sort").andCallThrough();
			spyOn(Array.prototype, "splice").andCallThrough();
			tinyStore.alter("pop");
			tinyStore.alter("sort");
			tinyStore.alter("splice", 1, 2);
			expect(Array.prototype.pop.wasCalled).toEqual(true);
			expect(Array.prototype.sort.wasCalled).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(1);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(2);
		});
		
		it("should advertise on changes", function () {
			var spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy();
			
			tinyStore.watch("updated", spy1);
			tinyStore.watch("deleted", spy2);
			
			tinyStore.alter("splice", 1, 2);

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
			expect(tinyStore.alter("doesn't exist")).toEqual(false);
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
		
		it("should only reset if data is object or array", function () {
			expect(function () {
				tinyStore.reset();
			}).not.toThrow();
			
			expect(tinyStore.reset()).toEqual(false);
			expect(tinyStore.get("a")).toEqual(10);
		});
		
		it("should advertise for every modified value", function () {
			var spyA = jasmine.createSpy(),
				spyB = jasmine.createSpy();
			
			tinyStore.watch("deleted", spyA);
			tinyStore.watch("added", spyB);
			tinyStore.reset(resetData);
			expect(spyA.wasCalled).toEqual(true);
			expect(spyA.mostRecentCall.args[0]).toEqual("a")
			expect(spyA.mostRecentCall.args[1]).toBeUndefined();
			expect(spyA.callCount).toEqual(1);
			expect(spyB.mostRecentCall.args[0]).toEqual("b");
			expect(spyB.mostRecentCall.args[1]).toEqual(20);
			expect(spyB.callCount).toEqual(1);
		});
	});
	
	describe("TinyStoreIsolation", function () {
		
		var dataSet = null,
			tinyStore1 = null,
			tinyStore2 = null;
		
		beforeEach(function () {
			dataSet = {a: 10, b: 20};
			tinyStore1 = TinyStore.create(dataSet);
			tinyStore2 = TinyStore.create(dataSet);
		});
		
		it("shouldn't share data sets that are identical", function () {
			tinyStore1.set("shared", "yes");
			expect(tinyStore2.get("shared")).toBeUndefined();
		});
		
		it("shouldn't share observers", function () {
			var spyAdded = jasmine.createSpy(),
				spyUpdated = jasmine.createSpy();
			
			tinyStore1.watch("added", spyAdded);
			tinyStore2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});
		
		it("should have the same behaviour on reset", function () {
			tinyStore1.reset(dataSet);
			tinyStore2.reset(dataSet);
			tinyStore1.set("shared", "yes");
			expect(tinyStore2.get("shared")).toBeUndefined();

			var spyAdded = jasmine.createSpy(),
			spyUpdated = jasmine.createSpy();
		
			tinyStore1.watch("added", spyAdded);
			tinyStore2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});

	});

	
});