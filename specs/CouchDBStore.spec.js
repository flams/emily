/**
 * Tested with the following _design/doc
 * views: {
 * 	view: 	{
 * 		map: function(doc) {
 * 				emit(doc.date, {date:doc.date, title:doc.title, body:doc.body});
 * 			}
 * 		}
 * 	}
 */

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
		
		it("should have a function to get its current state", function () {
			expect(couchDBStore.getState).toBeInstanceOf(Function);
			expect(couchDBStore.getState()).toEqual("Unsynched");
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
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
	            spy = jasmine.createSpy();
			
			transportMock.request = function (channel, reqData, callback, scope) {
				callback.call(scope, res);
			};
			
			couchDBStore.watch("added", spy);

			couchDBStore.sync("db", "design", "view");
			expect(spy.callCount).toEqual(3);
			expect(couchDBStore.getNbItems()).toEqual(3);
			expect(couchDBStore.get(0).value.date).toEqual("2012/01/13 12:45:56");
			expect(couchDBStore.get(2).value.title).toEqual("the 3rd document");
			
			expect(couchDBStore.getDBInfo).toBeInstanceOf(Function);
			expect(couchDBStore.getDBInfo("update_seq")).toEqual(8);
			expect(couchDBStore.getDBInfo("total_rows")).toEqual(3);
			expect(couchDBStore.getDBInfo("offset")).toEqual(0);
		});
		
		it("should subscribe to changes", function () {
			
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
	            reqData,
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			transportMock.listen = jasmine.createSpy();

			couchDBStore.sync("db", "desgin", "view");
			asyncRequest();
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.listen.mostRecentCall.args[1];
			expect(reqData.method).toEqual("GET");
			expect(reqData.path).toEqual("/db/_changes?feed=continuous&heartbeat=20000&since=8");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			
		});
		
		it("should not fail with empty json from heartbeat", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}'
				},
				asyncRequest,
				asyncListen,
				listenRes = '\n',
				spy = jasmine.createSpy();

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes[reqData.path]);
					};
				};
	
				transportMock.listen = function (channel, reqData, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};
				
				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.watch("updated", spy);
				couchDBStore.sync("db", "design", "view");
				asyncRequest();
				expect(function() {
					asyncListen();
				}).not.toThrow();

		});
		
		it("should reflect changes", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
				'/db/_design/design/_view/view' : '{"total_rows":3,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}'                                                                                    	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":9,"id":"document3","changes":[{"rev":"2-4f2957d984aa9d94d4298407f3292a47"}]}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, reqData, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("updated", spy);
			couchDBStore.sync("db", "design", "view");
			asyncRequest();
			expect(couchDBStore.getState()).toEqual("Listening");
			asyncListen();
			asyncRequest();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual(2);
			expect(spy.mostRecentCall.args[1].value.title).toEqual("the 3rd document");
		});
		
		it("should add new items", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":9,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}',
				'/db/_design/design/_view/view':'{"total_rows":4,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
						'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}'                                                                                  	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":10,"id":"document4","changes":[{"rev":"1-5a99f185bc942f626934108bd604bb33"}]}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, reqData, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("added", spy);
			couchDBStore.sync("db", "design", "view");
			asyncRequest();
			expect(couchDBStore.getState()).toEqual("Listening");
			asyncListen();
			asyncRequest();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.callCount).toEqual(4);
			expect(spy.mostRecentCall.args[0]).toEqual(3);
			expect(spy.mostRecentCall.args[1].value.title).toEqual("the 4th\'s just been added");
		});
		
		it("should remove deleted items", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":4,"update_seq":10,"offset":0,"rows":[' + 
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
						'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}'                                                                          	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":11,"id":"document4","changes":[{"rev":"2-36ec9b80dce993a4a6a9ee311d266807"}],"deleted":true}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, reqData, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("deleted", spy);
			couchDBStore.sync("db", "design", "view");
			asyncRequest();
			asyncListen();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.callCount).toEqual(1);
			expect(spy.mostRecentCall.args[0]).toEqual(3);
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
			expect(couchDBStore.get(4)).toBeUndefined();
		});
	});
	
});