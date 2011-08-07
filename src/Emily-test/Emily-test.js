TestCase("Emily", {
	
	setUp : function () {
		this.myService = function (API) {
			this.API = API;
		};
	},
	
	"test should declare a  service" : function () {
		assertObject(Emily.declare("myService", this.myService));
	},
	
	"test should require a service": function () {
		Emily.declare("myService", this.myService);
		assertObject(Emily.require("myService"));
	}
});


