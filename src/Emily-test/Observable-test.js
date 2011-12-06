require(["Observable"], function (Observable) {
	
	TestCase("ObservableInit", {
		"test should create an observable": function () {
			this.observable = Observable.create();
			assertObject(this.observable);
			assertFunction(this.observable.watch);
			assertFunction(this.observable.unwatch);
			assertFunction(this.observable.notify);
			assertFunction(this.observable.hasObserver);	
		}
	});
	
	TestCase("ObservableWatch", {
		
		setUp: function () {
			this.observable = Observable.create();
			this.testTopic = "testTopic";
		},
		
		"test should add observer": function () {
			var spy = sinon.spy(),
				handler;
			
			assertFalse(this.observable.hasObserver(handler));
			handler = this.observable.watch(this.testTopic, spy);
			
			assertTrue(this.observable.hasObserver(handler));
		},
		
		"test should add observer with scope": function () {
			var spy = sinon.spy(),
				handler;
			
			assertFalse(this.observable.hasObserver(handler));
			handler = this.observable.watch(this.testTopic, spy, this);

			assertTrue(this.observable.hasObserver(handler));
		},
		
		"test should remove observer": function () {
			var spy = sinon.spy(),
				handler;
			
			handler = this.observable.watch(this.testTopic, spy);
			
			assertTrue(this.observable.hasObserver(handler));
			this.observable.unwatch(handler);
			assertFalse(this.observable.hasObserver(handler));
			this.observable.notify(this.testTopic);
			assertFalse(spy.called);
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
			this.observable = Observable.create();
			this.testTopic = "testTopic";
		},
		
		"test should notify observer with no scope": function () {
			var spy = sinon.spy();

			this.observable.watch(this.testTopic, spy);
			
			assertFalse(spy.called);
			this.observable.notify(this.testTopic);
			assertTrue(spy.called);
		},
		
		"test should notify observer with scope": function () {
			var spy = sinon.spy(),
				thisObj = {};
			
			this.observable.watch(this.testTopic, spy, thisObj);
			
			assertNotSame(thisObj, spy.thisValues[0]);
			this.observable.notify(this.testTopic);
			
			assertSame(thisObj, spy.thisValues[0]);
		},
		
		"test should pass parameter": function () {
			var spy = sinon.spy(),
				post = {x:10};
			
			this.observable.watch(this.testTopic, spy);

			this.observable.notify(this.testTopic, post);
			assert(spy.calledWith(post));
		},
		
		"test should return false if topic doesn't exist": function () {
			assertFalse(this.observable.notify("fakeTopic"));
		}
		
	});

	TestCase("ObservablesIsolated", {
		
		setUp: function () {
			this.obs1 = Observable.create();
			this.obs2 = Observable.create();
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
});