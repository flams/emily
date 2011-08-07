TestCase("ObservableInit", {
	"test should create an observable": function () {
		this.observable = Emily.require("Observable").create();
		assertObject(this.observable);
		assertFunction(this.observable.watch);
		assertFunction(this.observable.unwatch);
		assertFunction(this.observable.notify);
		assertFunction(this.observable.hasObserver);
	}
});

TestCase("ObservableWatch", {
	
	setUp: function () {
		this.observable = Emily.require("Observable").create();
		this.testTopic = "testTopic";
	},
	
	"test should add observer": function () {
		var func = function () {},
			handler;
		
		assertFalse(this.observable.hasObserver(handler));
		handler = this.observable.watch(this.testTopic, func);
		
		assertTrue(this.observable.hasObserver(handler));
	},
	
	"test should add observer with scope": function () {
		var func = function () {},
			handler;
		
		assertFalse(this.observable.hasObserver(handler));
		handler = this.observable.watch(this.testTopic, func, this);

		assertTrue(this.observable.hasObserver(handler));
	},
	
	"test should remove observer": function () {
		var func = function () {
				func.called = true;
			},
			handler;
		
		handler = this.observable.watch(this.testTopic, func);
		
		assertTrue(this.observable.hasObserver(handler));
		this.observable.unwatch(handler);
		assertFalse(this.observable.hasObserver(handler));
		this.observable.notify(this.testTopic);
		assertFalse(func.called === true);
	},
	
	"test should return false if remove called with wrong handler": function () {
		assertFalse(this.observable.unwatch("wrong", "handler"));
	},
	
	"test should return false if wrong parameter count or type": function () {
		assertFalse(this.observable.watch());
		assertFalse(this.observable.watch("topic"));
		assertFalse(this.observable.watch(function(){}, "topic"));
		assertFalse(this.observable.watch("", {}));
	}
});

TestCase("ObservableNotify", {
	
	setUp : function () {
		this.observable = Emily.require("Observable").create();
		this.testTopic = "testTopic";
	},
	
	"test should notify observer with no scope": function () {
		var func = function () {
				func.called  = true;
			};

		this.observable.watch(this.testTopic, func);
		
		assertUndefined(func.called);
		this.observable.notify(this.testTopic);
		assert(func.called);
	},
	
	"test should notify observer with scope": function () {
		var func = function () {
				func.scope = this;
			};
		
		this.observable.watch(this.testTopic, func, this);
		
		assertFalse(func.scope === this);
		this.observable.notify(this.testTopic);
		
		assert(func.scope === this);
	},
	
	"test should pass parameter": function () {
		var func = function (p) {
			func.param = p;
		},
		post = {x:10};
		
		this.observable.watch(this.testTopic, func);
		
		assertFalse(func.param === post);
		this.observable.notify(this.testTopic, post);
		assert(func.param === post);
	},
	
	"test should return false if topic doesn't exist": function () {
		assertFalse(this.observable.notify("fakeTopic"));
	}
	
});

TestCase("ObservablesIsolated", {
	
	setUp: function () {
		this.obs1 = Emily.require("Observable").create();
		this.obs2 = Emily.require("Observable").create();
		this.testTopic = "testTopic";
	},
	
	"test should add observer to only one observable": function () {
		var handler = this.obs1.watch(this.testTopic, function (){});
		assertFalse(this.obs2.hasObserver(handler));
		assertTrue(this.obs1.hasObserver(handler));
	},
	
	"test should notify only one observable": function () {
		this.obs1.watch(this.testTopic, function (){});
		assertFalse(this.obs2.notify(this.testTopic));
	}
	
});