TestCase("Emily", {
	
	"test should declare a service" : function () {
		var myService = function (API) {
			this.API = API;
		};
		
		Emily.declare("myService", myService);
		assertObject(Emily.myService);
		assertTrue(Emily.myService.API === Emily);
	},
	
	"test should remove a service" : function () {
		Emily.remove("myService");
		assertUndefined(Emily.myService);
	},
	
	"test should load a service" : function () {
		Emily.load("myService");

	},
	
	"test should reload a service" : function () {
		Emily.reload("myService");
	}
});


