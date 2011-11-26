var __Global = this;

TestCase("Emily", {
	
	setUp: function () {
		this.module = function module(API) {
			this.API = API;
		};
	},
	
	tearDown: function () {
		// Important that isolation mode goes back to false
		Emily.setIsolationMode(false);
	},
	
	"test should declare a module": function () {
		assertSame(this.module, Emily.declare("module", this.module));
	},
	
	"test should require a module": function () {
		var module;
		
		Emily.declare("module", this.module);
		module = Emily.require("module");
		assertObject(module);
		assertSame(Emily, module.API);
	},
	
	"test should make Emily's modules run in isolation": function () {
		// Isolation mode should be false by default
		assertFalse(Emily.getIsolationMode());
		Emily.setIsolationMode(true);
		assertTrue(Emily.getIsolationMode()); 
		Emily.setIsolationMode(false);
		assertFalse(Emily.getIsolationMode());
	},
	
	"test Emily should allow for dependency injection while modules run in isolation": function () {
		
		// Define a future new module
		var newModule = function (API) {
				this.requireExternal = function () {
					// That will require an other one
					return API.require("requiredModule");
				};
			},
			// This is the other module that will be required by the previously defined
			requiredModule = function () {},
			// This is the same external module but stubbed
			requiredModuleStubbed = {},
			module;
		
		// Declare the future required module
		Emily.declare("requiredModule", requiredModule);
		// Declare the new module
		Emily.declare("newModule", newModule);
		// Require it to manipulate it
		module = Emily.require("newModule");
		// The requiredmodule should be the same than the one previously declared
		assertSame(Emily.require("requiredModule"), module.requireExternal());

		// Now, in UnitTestMode		
		Emily.setIsolationMode(true);	
		// Should first get the original when requiring unstubbed module
		assertSame(Emily.require("requiredModule"), module.requireExternal());
		// I can inject a stubbed module
		Emily.inject("requiredModule", requiredModuleStubbed);
		// And it should now be the one that is required
		assertSame(Emily.require("requiredModule"), module.requireExternal());
	
	},
	
	"test Emily should also serve globally defined modules": function () {
		__Global.globallyDefined = {};
		
		assertSame(__Global.globallyDefined, Emily.require("globallyDefined"));
		
		delete __Global.globallyDefined;
	},
	
	"test Emily should isolate the globally defined modules that it serves": function () {
		__Global.globallyDefined = {};
		var locallyDefined = {};
		
		Emily.setIsolationMode(true);
		assertSame(__Global.globallyDefined, Emily.require("globallyDefined"));
		Emily.inject("globallyDefined", locallyDefined);
		assertSame(locallyDefined, Emily.require("globallyDefined"));
		
		delete __Global.globallyDefined;
	}
	
});

TestCase("EmilyInheritanceTest", {
	setUp: function () {
		Emily.declare("base", function () {
			
			var _name = "base";
			
			this.getName = function () {
				return _name;
			};
			
			this.setName = function (name) {
				_name = name;
			};
		});

	},
	
	"test modules can inherit from other modules": function () {
		var module;
		Emily.declare("module", "base", function () {});
		
		module = Emily.require("module");
		
		assertFunction(module.getName);
		assertFunction(module.setName);
		module.setName("ok");
		assertEquals("ok", module.getName());
	},
	
	"test inherited modules don't share the same values": function () {
		var module1, module2;
		
		Emily.declare("module1", "base", function() {});
		Emily.declare("module2", "base", function() {});
		module1 = Emily.require("module1");
		module2 = Emily.require("module2");
		
		module1.setName("new base");
		assertNotEquals(module1.getName(), module2.getName());
		assertEquals("base", module2.getName());
	},
	
	"test inherited modules sharing values": function () {
		var module1, module2;
		
		Emily.declare("store", function () {
			this.value = "shared";
		});
		
		Emily.declare("base2", function (API) {
			var store = API.require("store");
			this.getValue = function () {
				return store.value;
			};
			this.setValue = function (value) {
				return store.value = value;
			};
		});
		
		Emily.declare("module1", "base2", function () {});
		Emily.declare("module2", "base2", function () {});
		module1 = Emily.require("module1");
		module2 = Emily.require("module2");
		
		assertEquals("shared", module1.getValue());
		assertEquals("shared", module2.getValue());
		module1.setValue("new shared");
		assertEquals("new shared", module2.getValue());
		
	},
	
	"test declare should return false with wrong params": function () {
		assertFalse(Emily.declare());
		assertFalse(Emily.declare("wrong"));
		assertFalse(Emily.declare("wrong", "params"));
		assertFalse(Emily.declare("wrong", {}));
		assertFalse(Emily.declare("wrong", "params", {}));
		assertFalse(Emily.declare("wrong", [], {}));
	}
});