TestCase("Emily", {
	
	setUp: function () {
		this.spy = sinon.spy();
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
	
	"test should make Emily run in test mode": function () {
		// Test mode should be false by default
		assertFalse(Emily.getUnitTestMode());
		Emily.setUnitTestMode(true);
		assertTrue(Emily.getUnitTestMode()); 
		Emily.setUnitTestMode(false);
		assertFalse(Emily.getUnitTestMode());
		
		// Important that UnitTestMode goes back to false
		Emily.setUnitTestMode(false);
	},
	
	"test Emily should allow for dependency injection while in UnitTestMode": function () {
		
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
		Emily.setUnitTestMode(true);	
		// Should first get undefined when requiring unstubbed service
		assertUndefined(service.requireExternal());
		// I can inject a stubbed service
		Emily.inject("requiredService", requiredServiceStubbed);
		// And it should now be the one that is required
		assertSame(requiredServiceStubbed, service.requireExternal());
		
		// Important that UnitTestMode goes back to false
		Emily.setUnitTestMode(false);
	
	}
});