TestCase("Emily", {
	
	setUp: function () {
		this.module = function module(exports, API) {
			module.exports = exports;
			module.API = API;
		};
	},
	
	tearDown: function () {
		// Important that isolation mode goes back to false
		Emily.setIsolationMode(false);
	},
	
	"test should declare a module" : function () {
		assertTrue(Emily.declare("module", this.module));
		assertSame(Emily, this.module.API);
	},
	
	"test should require a module": function () {
		Emily.declare("module", this.module);
		assertSame(Emily.require("module"), this.module.exports);
		assertUndefined(Emily.require("nothing"));
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
		var newModule = function (exports, API) {
				exports.requireExternal = function () {
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
		// Should first get undefined when requiring unstubbed module
		assertUndefined(module.requireExternal());
		// I can inject a stubbed module
		Emily.inject("requiredModule", requiredModuleStubbed);
		// And it should now be the one that is required
		assertSame(Emily.require("requiredModule"), module.requireExternal());
	
	},
	
	"test Emily should also serve globally defined modules": function () {
		window.globallyDefined = {};
		
		assertSame(window.globallyDefined, Emily.require("globallyDefined"));
		
		delete window.globallyDefined;
	},
	
	"test Emily should isolate the globally defined modules that it serves": function () {
		window.globallyDefined = {};
		var locallyDefined = {};
		
		Emily.setIsolationMode(true);
		Emily.inject("globallyDefined", locallyDefined);
		assertSame(locallyDefined, Emily.require("globallyDefined"));
		
		delete window.globallyDefined;
	}
	
});

TestCase("EmilyInheritance", {
	
	setUp: function () {
		   Emily.declare("base", function (exports) {
			   exports.base = function () {
				   return true;
			   };
		   });
		   
		   Emily.declare("child", "base", function (exports) {
			   exports.inherits = function () {
				   return this.base;
			   };
		   });
	},
	
	"test Emily should allow for modules to inherit from other module": function () {
	   assertSame(Emily.require("base").base, Emily.require("child").inherits());
	},

	// I can only figure out if it's prototypal based by checking its behaviour.
	// Is this test absolutely relevant?
	"test Emily's modules have prototypal inheritance": function () {
		var base = Emily.require("base"),
			child = Emily.require("child"),
			newBase = function () {};
		
		child.base = newBase;
		
		assertSame(child.inherits(), newBase);
		delete child.base;
		assertSame(child.inherits(), base.base);
		base.base = newBase;
		assertSame(child.inherits(), newBase);
	},
	
	"test Emily should allow for modules to inherit from multiple modules": function () {   
		   Emily.declare("base2", function (exports) {
			  exports.base2 = function () {
				 return true; 
			  } ;
		   });
		   
		   Emily.declare("child2", ["base", "base2"], function (exports) {
			   exports.inherits = function () {
				   return this.base;
			   };
			   exports.inherits2 = function () {
				 return this.base2;  
			   };
		   });
		   
		   assertSame(Emily.require("base").base, Emily.require("child2").inherits());
		   assertSame(Emily.require("base2").base2, Emily.require("child2").inherits2());
	}
});