require(["CouchDBStore", "Store"], function (CouchDBStore, Store) {
	
	var transportMock = null;
	
	beforeEach(function () {
		transportMock = {
				listen: jasmine.createSpy("listen"),
				request: jasmine.createSpy("request")
			};
	});
	
	describe("CouchDBStoreTest", function () {

		var couchDBStore = new CouchDBStore;
		
		it("should be a constructor function", function () {
			expect(CouchDBStore).toBeInstanceOf(Function);
		});

		it("should inherit from Store", function () {
			expect(Object.getPrototypeOf(couchDBStore)).toBeInstanceOf(Store);
		});
	});
	
	describe("CouchDBStoreTransport", function () {
		it("should have a function to set the transport", function () {
			var couchDBStore = new CouchDBStore;
			
			expect(couchDBStore.setTransport).toBeInstanceOf(Function);
			expect(couchDBStore.setTransport()).toEqual(false);
			expect(couchDBStore.setTransport(transportMock)).toEqual(true);
		});
		
		it("should have a function to get the transport", function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			expect(couchDBStore.getTransport).toBeInstanceOf(Function);
			expect(couchDBStore.getTransport()).toBe(transportMock);
		});
	});
	
	describe("CouchDBStoreSync", function () {
		
		var couchDBStore = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
		});
		
		it("should have a function to synchronize with a couchdb view", function () {
			expect(couchDBStore.sync).toBeInstanceOf(Function);
			expect(couchDBStore.sync("no")).toEqual(false);
			expect(couchDBStore.sync("no", true)).toEqual(false);
			expect(couchDBStore.sync("yes", "yes")).toEqual(false);
			expect(couchDBStore.sync("yes", "no", false)).toEqual(false);
			expect(couchDBStore.sync("yes", "yes", "yes")).toEqual(true);
		});
		
		it("should call Transport to issue the sync request", function () {
			var req = couchDBStore.sync("db", "design", "view"),
				reqData;
			
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view?update_seq=true");
		});
		
		it("should populate the store on sync and notify", function () {
			var res =  '{"total_rows":3,"update_seq":96,"offset":0,"rows":[{"id":"e866ed6179417a05c6c93756a7000d0d","key":"e866ed6179417a05c6c93756a7000d0d","value":{"date":"2011/05/30 17:34:23","title":"fishing","body":"Fishing was fun"}},'+
	            '{"id":"e866ed6179417a05c6c93756a7000d0e","key":"e866ed6179417a05c6c93756a7000d0e","value":{"date":"2011/04/06 08:10:00","title":"going to work","body":"That is fun too"}},' +
	            '{"id":"e866ed6179417a05c6c93756a7000d0f","key":"e866ed6179417a05c6c93756a7000d0f","value":{"date":"2011/02/12 13:37:00","title":"hello world","body":"opened my new blog"}}]}',
	            spy = jasmine.createSpy();
			
			transportMock.request = function (channel, reqData, callback, scope) {
				callback.call(scope, res);
			};
			
			couchDBStore.watch("added", spy);

			couchDBStore.sync("db", "design", "view");
			expect(spy.callCount).toEqual(3);
			expect(couchDBStore.getNbItems()).toEqual(3);
			expect(couchDBStore.get(0).value.date).toEqual("2011/05/30 17:34:23");
			expect(couchDBStore.get(2).value.title).toEqual("hello world");
			
			expect(couchDBStore.getDBInfo).toBeInstanceOf(Function);
			expect(couchDBStore.getDBInfo("update_seq")).toEqual(96);
			expect(couchDBStore.getDBInfo("total_rows")).toEqual(3);
			expect(couchDBStore.getDBInfo("offset")).toEqual(0);
		});
		
		it("should subscribe to changes", function () {
			
			var res1 =  '{"total_rows":3,"update_seq":96,"offset":0,"rows":[{"id":"e866ed6179417a05c6c93756a7000d0d","key":"e866ed6179417a05c6c93756a7000d0d","value":{"date":"2011/05/30 17:34:23","title":"fishing","body":"Fishing was fun"}},'+
	            '{"id":"e866ed6179417a05c6c93756a7000d0e","key":"e866ed6179417a05c6c93756a7000d0e","value":{"date":"2011/04/06 08:10:00","title":"going to work","body":"That is fun too"}},' +
	            '{"id":"e866ed6179417a05c6c93756a7000d0f","key":"e866ed6179417a05c6c93756a7000d0f","value":{"date":"2011/02/12 13:37:00","title":"hello world","body":"opened my new blog"}}]}',
	            reqData,
				res2 = '{"seq":97,"id":"e866ed6179417a05c6c93756a7000d0f","changes":[{"rev":"7-c4b9fae9173416f5ec6879097d1d850b"}]}';
			
			transportMock.request = function (channel, reqData, callback, scope) {
				callback.call(scope, res1);
			};
			
			transportMock.listen = function (channel, reqData, callback, scope) {
				callback.call(scope, res2);
			},

			spyOn(transportMock, "listen").andCallThrough();
			couchDBStore.sync("db", "desgin", "view");
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.listen.mostRecentCall.args[1];
			expect(reqData.method).toEqual("GET");
			expect(reqData.path).toEqual("/db/_changes?feed=continuous&heartbeat=20000&since=96");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			
		});
		
		it("should reflect changes", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":96,"offset":0,"rows":[{"id":"e866ed6179417a05c6c93756a7000d0d","key":"e866ed6179417a05c6c93756a7000d0d","value":{"date":"2011/05/30 17:34:23","title":"fishing","body":"Fishing was fun"}},'+
    	            '{"id":"e866ed6179417a05c6c93756a7000d0e","key":"e866ed6179417a05c6c93756a7000d0e","value":{"date":"2011/04/06 08:10:00","title":"going to work","body":"That is fun too"}},' +
    	            '{"id":"e866ed6179417a05c6c93756a7000d0f","key":"e866ed6179417a05c6c93756a7000d0f","value":{"date":"2011/02/12 13:37:00","title":"hello world","body":"opened my new blog"}}]}',
				'/db/_design/design/_view/view?key="e866ed6179417a05c6c93756a7000d0f"':'{"total_rows":3,"offset":2,"rows":[{"id":"e866ed6179417a05c6c93756a7000d0f","key":"e866ed6179417a05c6c93756a7000d0f","value":{"date":"2011/02/12 13:37:00","title":"hello Emily!","body":"opened my new blog"}}]}'                                                                                    	            
				},
				listenRes = '{"seq":97,"id":"e866ed6179417a05c6c93756a7000d0f","changes":[{"rev":"7-c4b9fae9173416f5ec6879097d1d850b"}]}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				callback.call(scope, requestRes[reqData.path]);
			};

			transportMock.listen = function (channel, reqData, callback, scope) {
				callback.call(scope, listenRes);
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("updated", spy);
			couchDBStore.sync("db", "design", "view");
			expect(spy.wasCalled).toEqual(true);
			expect(spy.callCount).toEqual(4);
			expect(spy.mostRecentCall.args[0]).toEqual(2)
			expect(spy.mostRecentCall.args[1].value.title).toEqual("hello Emily!");
		});
	});
	
});