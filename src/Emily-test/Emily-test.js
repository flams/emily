TestCase("Emily", {
	
	setUp: function () {
		this.spy = sinon.spy();
	},
	
	tearDown: function () {
		// Important that isolation mode goes back to false
		Emily.setIsolationMode(false);
	},
	
	"test should declare a service" : function () {
		assertTrue(Emily.declare("myService", this.spy));
		assertSame(Emily, this.spy.args[0][0]);
	},
	
	"test should require a service": function () {
		Emily.declare("myService", this.spy);
		assertObject(Emily.require("myService"));
		assertUndefined(Emily.require("nothing"));
	},
	
	"test should make Emily's services run in isolation": function () {
		// Isolation mode should be false by default
		assertFalse(Emily.getIsolationMode());
		Emily.setIsolationMode(true);
		assertTrue(Emily.getIsolationMode()); 
		Emily.setIsolationMode(false);
		assertFalse(Emily.getIsolationMode());
	},
	
	"test Emily should allow for dependency injection while services run in isolation": function () {
		
		// Define a future new service
		var newService = function (API) {
				this.requireExternal = function () {
					// That will require an other one
					return API.require("requiredService");
				};
			},
			// This is the other service that will be required by the previously defined
			requiredService = function (API) {},
			// This is the same external service but stubbed
			requiredServiceStubbed = {},
			service;
		
		// Declare the future required service
		Emily.declare("requiredService", requiredService);
		// Declare the new service
		Emily.declare("newService", newService);
		// Require it to manipulate it
		service = Emily.require("newService");
		// The requiredService should be the same than the one previously declared
		assertSame(requiredService, service.requireExternal().constructor);

		// Now, in UnitTestMode		
		Emily.setIsolationMode(true);	
		// Should first get undefined when requiring unstubbed service
		assertUndefined(service.requireExternal());
		// I can inject a stubbed service
		Emily.inject("requiredService", requiredServiceStubbed);
		// And it should now be the one that is required
		assertSame(requiredServiceStubbed, service.requireExternal());
	
	},
	
	"test Emily should also serve globally defined services": function () {
		window.globallyDefined = {};
		
		assertSame(window.globallyDefined, Emily.require("globallyDefined"));
		
		delete window.globallyDefined;
	},
	
	"test Emily should isolate the globally defined services that it serves": function () {
		window.globallyDefined = {};
		var locallyDefined = {};
		
		Emily.setIsolationMode(true);
		Emily.inject("globallyDefined", locallyDefined);
		assertSame(locallyDefined, Emily.require("globallyDefined"));
		
		delete window.globallyDefined;
	}
});