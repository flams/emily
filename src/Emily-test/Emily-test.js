TestCase("Emily", {
	
	"test should declare a service" : function () {
		var spy = sinon.spy();
		
		assertTrue(Emily.declare("myService", spy));
		assertSame(Emily, spy.args[0][0]);
	},
	
	"test should require a service": function () {
		var spy = sinon.spy();
		
		Emily.declare("myService", spy);
		
		assertObject(Emily.require("myService"));
		assertUndefined(Emily.require("nothing"));
	}
});


