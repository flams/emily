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

		it("should set undefined value and get it as null", function () {
			tinyStore.set("test");
			expect(tinyStore.has("test")).toEqual(true);
			expect(tinyStore.get("test")).toBeUndefined();
		});
		
		it("should return undefined if does'nt exist", function () {
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
		it("can be initialized with values", function () {
			var tinyStore = TinyStore.create({x: 10, y: 20});
			expect(tinyStore.has("x")).toEqual(true);
			expect(tinyStore.get("x")).toEqual(10);
			expect(tinyStore.has("y")).toEqual(true);
			expect(tinyStore.get("y")).toEqual(20);
		});
		
		it("should only keep valid JSON data", function () {
			var data = function () {
					this.a = 10;
					this.b = function () {};
				}, 
				tinyStore = null;
				
			data.prototype.c = 30;
			
			tinyStore = TinyStore.create(new data);
			expect(tinyStore.has("a")).toEqual(true);
			expect(tinyStore.has("b")).toEqual(false);
			expect(tinyStore.has("c")).toEqual(false);
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
	
	
	describe("TinyStoreArrayManipulation", function () {
		var tinyStore = null,
			initialData = null;
		
		beforeEach(function () {
			initialData = [0, 1, 2, 3];
			tinyStore = TinyStore.create(initialData);
		});
		
		it("should have the following Array functions", function () {
			["push",
			 "pop",
			 "unshift",
			 "shift",
			 "slice",
			 "splice"
			 ].forEach(function (name) {
				 expect(tinyStore[name]).toBeInstanceOf(Function);
			 });
		});
		
		it("should make push work like Array's", function () {
			var pushed = tinyStore.push(4);
			expect(pushed).toEqual(5);
			expect(tinyStore.get(4)).toEqual(4);
		});

		it("should make pop work like Array's", function () {
			var popped = tinyStore.pop();
			expect(popped).toEqual(3);
			expect(tinyStore.get(3)).toBeUndefined();
		});

		it("should make unshift work like Array's", function () {
			var unshifted = tinyStore.unshift(-1);
			expect(unshifted).toEqual(5);
			expect(tinyStore.get(0)).toEqual(-1);
			expect(tinyStore.get(4)).toEqual(3);
		});
		
		it("should make shift work like Array's", function () {
			var shifted = tinyStore.shift();
			expect(shifted).toEqual(0);
			expect(tinyStore.get(0)).toEqual(1);
		});
		
		it("should make slice work like Array's", function () {
			var sliced = tinyStore.slice(1, 4);
			expect(sliced).toBeInstanceOf(Array);
			expect(sliced[0]).toEqual(1);
			expect(sliced[1]).toEqual(2);
			expect(sliced[2]).toEqual(3);
			expect(sliced.length).toEqual(3);
		});
		
		it("should make splice work like Array's", function () {
			var spliced = tinyStore.splice(1, 2);
			expect(spliced).toBeInstanceOf(Array);
			expect(spliced.length).toEqual(2);
			expect(spliced[0]).toEqual(1);
			expect(spliced[1]).toEqual(2);
			expect(tinyStore.get(0)).toEqual(0);
			expect(tinyStore.get(1)).toEqual(3);
			
			 tinyStore.splice(1, 0, 1, 2);
			 expect(tinyStore.get(1)).toEqual(1);
			 expect(tinyStore.get(2)).toEqual(2);
			 expect(tinyStore.get(3)).toEqual(3);
		});
		
		it("should advertise on changes", function () {
			var spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy();
			
			tinyStore.watch("updated", spy1);
			tinyStore.watch("deleted", spy2);
			
			tinyStore.splice(1, 2);
expect(false).toEqual(true); // Add tests here !! for pop push slice and all
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