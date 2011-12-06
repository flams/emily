require(["TinyStore"], function (TinyStore) {
	
	TestCase("TinyStoreInit", {
		
		setUp: function () {
			this.tinyStore = TinyStore;
		},

		"test should create a TinyStore": function () {
			assertObject(this.tinyStore.create());
		},

		"test should create a TinyStore with value": function () {
			var initValues = {x: 10},
				tinyStore = this.tinyStore.create(initValues);
			assertObject(tinyStore);
			assertTrue(tinyStore.has("x"));
			assertEquals(10, tinyStore.get("x"));
		}

	});

	TestCase("TinyStoreSet", {

		setUp: function () {
			this.tinyStore = TinyStore.create();
		},

		"test should set undefined value": function () {
			this.tinyStore.set("test");
			assertTrue(this.tinyStore.has("test"));
			assertUndefined(this.tinyStore.get("test"));
		},

		"test should set null value": function () {
			this.tinyStore.set("test", null);
			assertNull(this.tinyStore.get("test"));
		},

		"test should update value if it already exists": function () {
			this.tinyStore.set("test", true);
			assertTrue(this.tinyStore.get("test"));
			assertTrue(this.tinyStore.set("test", false));
			assertFalse(this.tinyStore.get("test"));
		},

		"test should return false if wrong parameters": function () {
			assertFalse(this.tinyStore.set());
			assertFalse(this.tinyStore.set({}));
			assertFalse(this.tinyStore.set({}, "test"));
			assertFalse(this.tinyStore.set([]));
		}
	});

	TestCase("TinyStoreDel", {

		setUp: function () {
			this.tinyStore = TinyStore.create();
		},

		"test should delete value": function () {
			this.tinyStore.set("test", null);
			assertTrue(this.tinyStore.del("test"));
			assertFalse(this.tinyStore.has("test"));
			assertFalse(this.tinyStore.del("test"));
		}

	});

	TestCase("TinyStoreWatch", {

		setUp: function () {
			this.tinyStore = TinyStore.create();
		},

		"test should be notified on set": function () {
			var spy = sinon.spy();
			this.tinyStore.watch("test", spy);
			this.tinyStore.set("test");
			
			assertTrue(spy.called);
			
		},

		"test should be notified on del": function () {
			var spy = sinon.spy();
			this.tinyStore.set("test");
			
			assertFalse(spy.called);
			
			this.tinyStore.watch("test", spy);		
			this.tinyStore.del("test");
			
			assertTrue(spy.called);
		},

		"test should unwatch value": function () {
			var spy = sinon.spy();
			handler = this.tinyStore.watch("test", spy);
			this.tinyStore.unwatch(handler);
			
			this.tinyStore.set("test");
			this.tinyStore.del("test");
			
			assertFalse(spy.called);
		},

		"test should receive new value on set": function () {
			var spy = sinon.spy(),
				value = {x:10};

			this.tinyStore.watch("test", spy);
			this.tinyStore.set("test", value);
			
			assert(spy.calledWith(value));
			
			this.tinyStore.del("test");
			
			assert(spy.calledWith(undefined));
		},

		"test should exec in scope on set": function () {
			var spy = sinon.spy(),
				thisObj = {};

			this.tinyStore.watch("test", spy, thisObj);
			this.tinyStore.set("test");
			
			assertSame(thisObj, spy.thisValues[0]);
		},

		"test should exec in scope on del": function () {
			var spy = sinon.spy(),
				thisObj = {};

			this.tinyStore.set("test");
			this.tinyStore.watch("test", spy, thisObj);		
			this.tinyStore.del("test");
			
			assertSame(thisObj, spy.thisValues[0]);
		}
	});

	TestCase("TinyStoreLength", {

		"test should return proper length": function () {
			this.tinyStore = TinyStore.create();
			assertEquals(0, this.tinyStore.getNbItems());
			this.tinyStore.set("value1");
			assertEquals(1, this.tinyStore.getNbItems());
			this.tinyStore.set("value2");
			this.tinyStore.set("value3");
			assertEquals(3, this.tinyStore.getNbItems());
			this.tinyStore.del("value3");
			assertEquals(2, this.tinyStore.getNbItems());
			this.tinyStore.del("value2");
			this.tinyStore.del("value1");
			this.tinyStore.del("test");
			assertEquals(0, this.tinyStore.getNbItems());
		},

		"test should return proper length when init with data": function () {
			var initValues = {x: 10, y: 20},
			tinyStore = TinyStore.create(initValues);
			
			assertEquals(2, tinyStore.getNbItems());
			
		}
	});
});