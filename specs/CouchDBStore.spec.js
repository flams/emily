/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

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

require(["CouchDBStore", "Store", "Promise", "StateMachine"], function (CouchDBStore, Store, Promise, StateMachine) {
	
	var transportMock = null,
		couchDBStore = null;
	
	beforeEach(function () {
		transportMock = {
				listen: jasmine.createSpy("listen"),
				request: jasmine.createSpy("request")
			};
		couchDBStore = new CouchDBStore;
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
	
	describe("CouchDBStoreStateMachine", function () {
		it("should have a function to get the StateMachine", function () {
			expect(couchDBStore.getStateMachine).toBeInstanceOf(Function);
			expect(couchDBStore.getStateMachine()).toBeInstanceOf(StateMachine);
		});
	});
	
	describe("CouchDBStoreSyncInfo", function () {
		it("should have a function to set sync info", function () {
			expect(couchDBStore.setSyncInfo).toBeInstanceOf(Function);
			expect(couchDBStore.setSyncInfo("db")).toEqual(false);
			expect(couchDBStore.setSyncInfo("db", "document")).toEqual(true);
			expect(couchDBStore.setSyncInfo("db", "design", "view")).toEqual(true);
		});
		
		it("should have a function to get sync info for a document", function () {
			var syncInfo;
			
			expect(couchDBStore.getSyncInfo).toBeInstanceOf(Function);
			couchDBStore.setSyncInfo("db", "document");
			syncInfo = couchDBStore.getSyncInfo();
			
			expect(syncInfo).toBeInstanceOf(Object);
			expect(syncInfo["database"]).toEqual("db");
			expect(syncInfo["document"]).toEqual("document");
			expect(syncInfo["design"]).toBeUndefined();
			expect(syncInfo["view"]).toBeUndefined();
		});
		
		it("should have a function to get sync info for a view", function () {
			var syncInfo;
			
			couchDBStore.setSyncInfo("db", "design", "view");
			syncInfo = couchDBStore.getSyncInfo();
			
			expect(syncInfo["database"]).toEqual("db");
			expect(syncInfo["document"]).toBeUndefined();
			expect(syncInfo["design"]).toEqual("design");
			expect(syncInfo["view"]).toEqual("view");
		});
	});
	
	/**
	 * A couchDB Store can synchronize with a view
	 * A view is a list of documents
	 */
	describe("CouchDBStoreSyncView", function () {
		
		var couchDBStore = null,
			stateMachine = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			stateMachine = couchDBStore.getStateMachine();
		});
		
		it("should initialize in Unynched state", function () {
			expect(couchDBStore.getStateMachine().getCurrent()).toEqual("Unsynched");
		});
		
		it("should have the following states, transitions and actions", function () {
			var Unsynched,
				Synched,
				Listening,
				getView,
				subscribeToViewChanges,
				entry,
				change,
				del,
				add;
			
			Unsynched = stateMachine.get("Unsynched");
			expect(Unsynched).toBeTruthy();
			getView = Unsynched.get("getView");
			expect(getView[0]).toBe(couchDBStore.actions.getView);
			expect(getView[1]).toBe(couchDBStore);
			expect(getView[2]).toEqual("Synched");
			
			Synched = stateMachine.get("Synched");
			expect(Synched).toBeTruthy();
			subscribeToViewChanges = Synched.get("subscribeToViewChanges");
			expect(subscribeToViewChanges[0]).toBe(couchDBStore.actions.subscribeToViewChanges);
			expect(subscribeToViewChanges[1]).toBe(couchDBStore);
			expect(subscribeToViewChanges[2]).toEqual("Listening");
			
			Listening = stateMachine.get("Listening");
			expect(Listening).toBeTruthy();
			
			entry = Listening.get("entry");
			expect(entry[0]).toBe(couchDBStore.actions.resolve);
			expect(entry[1]).toBe(couchDBStore);
			
			change = Listening.get("change");
			expect(change[0]).toBe(couchDBStore.actions.updateDocInStore);
			expect(change[1]).toBe(couchDBStore);
			
			del = Listening.get("delete");
			expect(del[0]).toBe(couchDBStore.actions.removeDocInStore);
			expect(del[1]).toBe(couchDBStore);
			
			add = Listening.get("add");
			expect(add[0]).toBe(couchDBStore.actions.addDocInStore);
			expect(add[1]).toBe(couchDBStore);
		});
		
		it("should call setSyncInfo on sync", function () {
			spyOn(couchDBStore, "setSyncInfo");
			couchDBStore.sync("database", "document", "view");
			expect(couchDBStore.setSyncInfo.wasCalled).toEqual(true);
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[0]).toEqual("database");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[1]).toEqual("document");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[2]).toEqual("view");
		});
		
		it("should return a promise on sync", function () {
			expect(couchDBStore.sync("database", "document", "view")).toBeInstanceOf(Promise);
		});
		
		it("should call getView on sync", function () {
			spyOn(stateMachine, "event"),
			couchDBStore.sync("document", "design", "view");
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("getView");
		});
		
	});
	
	describe("CouchDBStoreViewData", function () {
		
		var couchDBStore = null,
			stateMachine = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			couchDBStore.setSyncInfo("db", "design", "view");
			stateMachine = couchDBStore.getStateMachine();
		});
		
		it("should get a view's data", function () {
			var reqData;

			couchDBStore.actions.getView();
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view?update_seq=true");
		});
		
		it("should reset the store on sync and ask for changes subscribtion", function () {
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
	           callback;
			
			spyOn(stateMachine, "event");
			spyOn(couchDBStore, "reset");
			couchDBStore.actions.getView.call(couchDBStore);
			callback = transportMock.request.mostRecentCall.args[2];
			
			callback.call(couchDBStore, res);
			expect(couchDBStore.reset.wasCalled).toEqual(true);
			expect(couchDBStore.reset.mostRecentCall.args[0]).toBeInstanceOf(Object);
			expect(couchDBStore.reset.mostRecentCall.args[0][0].value.date).toEqual("2012/01/13 12:45:56");
			expect(couchDBStore.reset.mostRecentCall.args[0][2].value.title).toEqual("the 3rd document");
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToViewChanges");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual(8);
			
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
		});
		
		it("should subscribe to view changes", function () {
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1]).toEqual("/db/_changes?feed=continuous&heartbeat=20000&since=8");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBStore);
		});
		
		it("should not fail with empty json from heartbeat", function () {
			var callback;
			
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			expect(function() {
				callback("\n");
			}).not.toThrow();

		});
		
		it("should call for document update if one of them has changed", function () {
			var listenRes = '{"seq":9,"id":"document3","changes":[{"rev":"2-4f2957d984aa9d94d4298407f3292a47"}]}',
				callback;

			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback(listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("change");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document3");
		});
		
		it("should call for document addition if one of them was added", function () {
			var listenRes = '{"seq":10,"id":"document4","changes":[{"rev":"1-5a99f185bc942f626934108bd604bb33"}]}',
				callback;
	
			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback(listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("add");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document4");
		});
		
		it("should call for document removal if one of them was removed", function () {
			var listenRes = '{"seq":11,"id":"document4","changes":[{"rev":"2-36ec9b80dce993a4a6a9ee311d266807"}],"deleted":true}',
				callback;
	
			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback(listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("delete");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document4");
		});
		
		it("should update the selected document", function () {
			var reqData,
				value,
				listenRes = '{"total_rows":3,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}';                                                                                   	            
			
			spyOn(couchDBStore, "set");
			
			couchDBStore.actions.updateDocInStore.call(couchDBStore, "document3");
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
		
			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBStore, listenRes);
			
			expect(couchDBStore.set.wasCalled).toEqual(true);
			expect(couchDBStore.set.mostRecentCall.args[0]).toEqual(2);
			value = couchDBStore.set.mostRecentCall.args[1];
			
			expect(value.value.body).toEqual("a change for the example");
			
		});
		
		it("should add the new document", function () {
			var reqData,
				value,
				listenRes = '{"total_rows":4,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
					'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}';                                                                                   	            
			
			spyOn(couchDBStore, "alter");
			
			couchDBStore.actions.addDocInStore.call(couchDBStore, "document4");
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
	
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
		
			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBStore, listenRes);
			
			expect(couchDBStore.alter.wasCalled).toEqual(true);
			expect(couchDBStore.alter.mostRecentCall.args[0]).toEqual("splice");
			expect(couchDBStore.alter.mostRecentCall.args[1]).toEqual(3);
			expect(couchDBStore.alter.mostRecentCall.args[2]).toEqual(0);
			value = couchDBStore.alter.mostRecentCall.args[3];
			
			expect(value.value.body).toEqual("do you see me?");
		});
		
		it("should delete the removed document", function () {
			couchDBStore.reset([{
				"id":"document1",
				"key":"2012/01/13 12:45:56",
				"value":{
					"date":"2012/01/13 12:45:56",
					"title":"my first document",
					"body":"in this database"
				}
			},
			{
				"id":"document2",
				"key":"2012/01/13 13:45:21",
				"value":{
					"date":"2012/01/13 13:45:21",
					"title":"this is a new document",
					"body":"in the database"
				}
			},
			{
				"id":"document3",
				"key":"2012/01/13 21:45:12",
				"value":{
					"date":"2012/01/13 21:45:12",
					"title":"the 3rd document",
					"body":"a change for the example"
				}
			},
			{
				"id":"document4",
				"key":"2012/01/13 23:37:12",
				"value":{
					"date":"2012/01/13 23:37:12",
					"title":"the 4th\'s just been added",
					"body":"do you see me?"
				}
			}]);
			
			spyOn(couchDBStore, "del");
			couchDBStore.actions.removeDocInStore.call(couchDBStore, "document4");
			expect(couchDBStore.del.wasCalled).toEqual(true);
			expect(couchDBStore.del.mostRecentCall.args[0]).toEqual(3);
		});
	});
	
	/**
	 * A couchDBstore can synchronize with a document
	 * A document is a JSON object
	 */
	describe("CouchDBStoreSyncDocument", function () {
		
		var couchDBStore = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
		});
		
		it("should have a function to synchronize with a couchdb document", function () {
			expect(couchDBStore.sync).toBeInstanceOf(Function);
			expect(couchDBStore.sync("no")).toEqual(false);
			expect(couchDBStore.sync("no", true)).toEqual(false);
			expect(couchDBStore.sync("yes", "yes")).toBeInstanceOf(Promise);
		});
		
		it("should call Transport to issue the sync request", function () {
			var reqData; 
			
			couchDBStore.sync("db", "document1");
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/document1");
		});
		
		it("should populate the store on sync and notify", function () {
			var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
	            spy = jasmine.createSpy(),
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("added", spy);
			couchDBStore.sync("db", "document1");
			asyncRequest();
			expect(spy.callCount).toEqual(5);
			expect(couchDBStore.getNbItems()).toEqual(5);
			expect(couchDBStore.get("_id")).toEqual("document1");
			expect(couchDBStore.get("_rev")).toEqual("1-7f5175756a7ab72660278c3c0aed2eee");
		});
		
		it("should call the promise rejection on sync if document doesn't exist", function () {
			var asyncRequest,
				res = {
					'/db/document4' : '{"error":"not_found","reason":"missing"}'
				},
				promise;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res[reqData.path]);
				};
			};
	
			promise = couchDBStore.sync("db", "document4");
			spyOn(promise, "reject");
			asyncRequest();
			
			expect(promise.reject.wasCalled).toEqual(true);
			expect(promise.reject.mostRecentCall.args[0]).toEqual(couchDBStore);
		});
		
		it("should subscribe to changes", function () {
			
			var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			transportMock.listen = jasmine.createSpy();

			couchDBStore.sync("db", "document1");
			asyncRequest();
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1]).toEqual("/db/_changes?feed=continuous&heartbeat=20000");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			
		});
		
		it("should not fail with empty json from heartbeat", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
				asyncRequest,
				asyncListen,
				listenRes = '\n';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};
	
				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				couchDBStore.sync("db", "design", "view");
				asyncRequest();
				expect(function() {
					asyncListen();
				}).not.toThrow();
		});
		
		it("should reflect changes and resolve the sync promise", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
							'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
				spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy(),
				promise;

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			couchDBStore.watch("updated", spy1);
			couchDBStore.watch("added", spy2);
			promise = couchDBStore.sync("db", "document1");
			spyOn(promise, "resolve");
			asyncRequest();
			asyncListen();

			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0]).toBe(couchDBStore);
			
			asyncRequest();
			expect(spy1.wasCalled).toEqual(true);
			// _rev and title have been updated
			expect(spy1.callCount).toEqual(2);
			expect(spy1.mostRecentCall.args[0]).toEqual("title");
			expect(spy1.mostRecentCall.args[1]).toEqual("was my first document");
			expect(spy2.wasCalled).toEqual(true);
			// The first 5, then the newfield
			expect(spy2.callCount).toEqual(6);
			expect(spy2.mostRecentCall.args[0]).toEqual("newfield");
			expect(spy2.mostRecentCall.args[1]).toEqual("safe");
		});
		
		it("should update the database on update", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
								'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
					asyncRequest,
					asyncListen,
					stateMachine = couchDBStore.getStateMachine(),
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			spyOn(stateMachine, "event").andCallThrough();
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.sync("db", "document1");
			asyncRequest();
			asyncListen();
			asyncRequest();
				
			expect(couchDBStore.update).toBeInstanceOf(Function);
			couchDBStore.set("title", "my first update");
			
			expect(couchDBStore.update()).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabase");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("PUT");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual("/db/document1");
			expect(transportMock.request.mostRecentCall.args[1].headers["Content-Type"]).toEqual("application/json");
			json = JSON.parse(transportMock.request.mostRecentCall.args[1].data);
			expect(json.title).toEqual("my first update");
			expect(json._rev).toEqual("2-0b77a81676739718c23c72a12a131986");
			expect(json.body).toEqual("in this database");
			
		});
		
		it("should not get changes when another document is updated", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document5","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				
		});
		
		it("should not get changes if the rev is the same", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"1-7f5175756a7ab72660278c3c0aed2eee"}]}';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				
		});
		
		it("should not get changes if document is deleted", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}], "deleted": true}',
					spy = jasmine.createSpy();

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				couchDBStore.watch("deleted", spy);
				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				expect(spy.callCount).toEqual(5);
				
		});
		
		it("should add document on update if it's missing", function () {
			var asyncRequest,
				res = {
						'/db/document4' : '{"error":"not_found","reason":"missing"}'
					},
				model = {
					title: "Emily is funky",
					body: "it's easy to use",
					date: "2012/01/30"
				};
				stateMachine = couchDBStore.getStateMachine();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res[reqData.path]);
				};
			};

			couchDBStore.sync("db", "document4");
			spyOn(transportMock, "request").andCallThrough();
			spyOn(stateMachine, "event").andCallThrough();
			asyncRequest();
			
			expect(couchDBStore.get("error")).toBeUndefined();
			expect(couchDBStore.get("reason")).toBeUndefined();
			expect(stateMachine.getCurrent()).toEqual("Synched");
			
			couchDBStore.reset(model);
			
			couchDBStore.update();
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabase");
			
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("PUT");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual('/db/document4');
			expect(transportMock.request.mostRecentCall.args[1].headers["Content-Type"]).toEqual("application/json");
			expect(JSON.parse(transportMock.request.mostRecentCall.args[1].data).body).toBe("it's easy to use");
			asyncRequest();
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToDocumentChanges");

			
		});
		
		it("should remove a document from the database", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
								'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
					asyncRequest,
					asyncListen,
					stateMachine = couchDBStore.getStateMachine(),
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			spyOn(stateMachine, "event").andCallThrough();
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.sync("db", "document1");
			asyncRequest();
			asyncListen();
			asyncRequest();
				
			expect(couchDBStore.remove).toBeInstanceOf(Function);
			
			expect(couchDBStore.remove()).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("removeFromDatabase");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("DELETE");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual("/db/document1?rev=2-0b77a81676739718c23c72a12a131986");
		});
		
		
	});
	
});