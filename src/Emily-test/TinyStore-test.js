TestCase("TinyStoreInit", {

	"test should create a TinyStore": function () {
		var tinyStore = Emily.TinyStore.create();
		tinyStore.set("test", true);
		assertTrue(tinyStore.has("test"));
		assertTrue(tinyStore.get("test") === true);
	},

	"test should create a TinyStore with value": function () {
		var initValues = {x: 10}, 
		tinyStore = Emily.TinyStore.create(initValues);
		assertTrue(tinyStore.has("x"));
		assertTrue(tinyStore.get("x") === 10);
	},

	"test string should create an empty TinyStore": function () {
		var tinyStore = Emily.TinyStore.create("fail");
		assertFalse(tinyStore.has("test"));
		tinyStore.set("test", true);
		assertTrue(tinyStore.has("test"));
	},

	"test array should create an empty TinyStore": function () {
		var tinyStore = Emily.TinyStore.create(["fa", "il"]);
		assertFalse(tinyStore.has("fa"));
		tinyStore.set("fa", true);
		assertTrue(tinyStore.has("fa"));
	}

});

TestCase("TinyStoreSet", {

	setUp: function () {
		this.tinyStore = Emily.TinyStore.create();
	},

	"test should set undefined value": function () {
		this.tinyStore.set("test");
		assertTrue(this.tinyStore.has("test"));
		assertUndefined(this.tinyStore.get("test"));
	},

	"test should set null value": function () {
		this.tinyStore.set("test", null);
		assertTrue(this.tinyStore.get("test") === null);
	},

	"test should update value if it already exists": function () {
		this.tinyStore.set("test", true);
		assertTrue(this.tinyStore.get("test") === true);
		assertTrue(this.tinyStore.set("test", false));
		assertTrue(this.tinyStore.get("test") === false);
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
		this.tinyStore = Emily.TinyStore.create();
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
		this.tinyStore = Emily.TinyStore.create();
	},

	"test should be notified on set": function () {
		var func = function () {
			func.called = true;
		};
		this.tinyStore.watch("test", func);
		this.tinyStore.set("test");
		assertTrue(func.called === true);
	},

	"test should be notified on del": function () {
		var func = function () {
			func.called = true;
		};
		this.tinyStore.watch("test", func);
		this.tinyStore.set("test");
		this.tinyStore.del("test");
		assertTrue(func.called === true);
	},

	"test should unwatch value": function () {
		var func = function () {
			func.called = true;
		},
		handler = this.tinyStore.watch("test", func);
		this.tinyStore.unwatch(handler);
		this.tinyStore.set("test");
		this.tinyStore.del("test");
		assertFalse(func.called === true);
	},

	"test should receive new value on set": function () {
		var func = function (v) {
			func.value = v;
		},
		value   = {x:10};

		this.tinyStore.watch("test", func)
		this.tinyStore.set("test", value);
		assertTrue(func.value === value);
		this.tinyStore.del("test");
		assertUndefined(func.value);
	},

	"test should exec in scope on set": function () {
		var func = function () {
			func.scope = this;
		};

		this.tinyStore.watch("test", func, this);
		this.tinyStore.set("test");
		assertTrue(func.scope === this);
	},

	"test should exec in scope on del": function () {
		var func = function () {
			func.scope = this;
		};

		this.tinyStore.watch("test", func, this);
		this.tinyStore.set("test");
		this.tinyStore.del("test");
		assertTrue(func.scope === this);
	}
});

TestCase("TinyStoreLength", {

	"test should return proper length": function () {
		this.tinyStore = Emily.TinyStore.create();
		assertTrue(this.tinyStore.length == 0);
		this.tinyStore.set("value1");
		assertTrue(this.tinyStore.length == 1);
		this.tinyStore.set("value2");
		this.tinyStore.set("value3");
		assertTrue(this.tinyStore.length == 3);
		this.tinyStore.del("value3");
		assertTrue(this.tinyStore.length == 2);
		this.tinyStore.del("value2");
		this.tinyStore.del("value1");
		this.tinyStore.del("test");
		assertTrue(this.tinyStore.length == 0);
	},

	"test should return proper length when init with data": function () {
		var initValues = {x: 10, y: 20},
		tinyStore = Emily.TinyStore.create(initValues);
		jstestdriver.console.log(tinyStore.length);
		assertTrue(tinyStore.length == 2);
		
	}
});