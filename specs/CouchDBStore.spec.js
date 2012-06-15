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
 * 
 * 
 * The file is pretty long but it's nicely compartimented:
 * First comes the general functions of CouchDBStore: CouchDBStoreTest
 * 
 * Then comes the testing of the view synchronization state machine: CouchDBStoreSyncView
 * Then the functions that manipulate the data are tested: CouchDBStoreViewData
 * 
 * Then we test the state machine of the document synchronization part: CouchDBStoreSyncDocument
 * Then comes the data manipulation: CouchDBStoreDocumentData
 * And the upload to the database part: CouchDBStoreDataBaseUpdate
 * 
 * Last, we test the state machine of the bulk of documents synchronization part: CouchDBStoreSyncBulkOfDocuments
 * And the data manipulation: CouchDBStoreBulkDocumentsData
 * 
 */

require(["CouchDBStore", "Store", "Promise", "StateMachine"], function (CouchDBStore, Store, Promise, StateMachine) {
	
	var transportMock = null,
		couchDBStore = null,
		stopListening = jasmine.createSpy();
	
	beforeEach(function () {
		transportMock = {
				listen: jasmine.createSpy("listen").andReturn(stopListening),
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
			expect(couchDBStore.setSyncInfo("db", ["document1", "document2"])).toEqual(true);
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
		
		it("should have a function to get sync info for a bulk of documents", function () {
			var syncInfo,
				query = {};
			
			couchDBStore.setSyncInfo("db", query);
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["database"]).toEqual("db");
			expect(syncInfo["query"]).toBe(query);
		});
		
		it("should save keys at a different place when syncing with a bulk of documents", function () {
			var syncInfo,
				keys = [];
			
			couchDBStore.setSyncInfo("db", {keys: keys});
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["database"]).toEqual("db");
			expect(syncInfo.query.keys).toBeUndefined();
			expect(syncInfo.keys).toBe(keys);
		});
		
		it("should pass query params to the url when syncing with a view", function () {
			var syncInfo,
				query = {
					descending: true
				};
			
			couchDBStore.setSyncInfo("db", "design", "view", query);
			
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["query"]).toBe(query);
		});
		
		it("should pass query params to the url when syncing with a document", function () {
			var syncInfo,
				query = {
					revs_info: true
				};
			
			couchDBStore.setSyncInfo("db", "document", query);
			
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["query"]).toBe(query);
		});
		
		it("should pass query params to the url when syncing with a bulk of documents", function () {
			var syncInfo,
				query = {
					include_docs: true
				};
			
			couchDBStore.setSyncInfo("db", query);
			
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["query"]).toBe(query);
		});
		
		it("should have a function to set the 'reduced view' flag", function () {
			expect(couchDBStore.setReducedViewInfo).toBeInstanceOf(Function);
			expect(couchDBStore.setReducedViewInfo()).toEqual(false);
			expect(couchDBStore.setReducedViewInfo("")).toEqual(false);
			expect(couchDBStore.setReducedViewInfo(true)).toEqual(true);
			expect(couchDBStore.getSyncInfo().reducedView).toEqual(true);
			expect(couchDBStore.setReducedViewInfo(false)).toEqual(true);
			expect(couchDBStore.getSyncInfo().reducedView).toEqual(false);
		});
	});
	
/**
 * 
 * 
 * THE VIEW SYNCHRONIZATION PART
 * 
 * 
 */
	
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
				SynchedUnsync,
				entry,
				change,
				del,
				add,
				updateReduced,
				listeningUnsync;
			
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
			
			SynchedUnsync = Synched.get("unsync");
			expect(SynchedUnsync[0]).toBeInstanceOf(Function);
			expect(SynchedUnsync[2]).toEqual("Unsynched");
			
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
			
			updateReduced = Listening.get("updateReduced");
			expect(updateReduced[0]).toBe(couchDBStore.actions.updateReduced);
			expect(updateReduced[1]).toBe(couchDBStore);
			
			listeningUnsync = Listening.get("unsync");
			expect(listeningUnsync[0]).toBe(couchDBStore.actions.unsync);
			expect(listeningUnsync[1]).toBe(couchDBStore);
			expect(listeningUnsync[2]).toBe("Unsynched");
		});
		
		it("should call setSyncInfo on sync", function () {
			var query = {};
			spyOn(couchDBStore, "clearSyncInfo").andCallThrough();
			spyOn(couchDBStore, "setSyncInfo").andCallThrough();
			couchDBStore.sync("db", "document", "view", query);
			expect(couchDBStore.setSyncInfo.wasCalled).toEqual(true);
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[0]).toEqual("db");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[1]).toEqual("document");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[2]).toEqual("view");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[3]).toBe(query);
			
			expect(couchDBStore.clearSyncInfo.wasCalled).toEqual(true);
		});
		
		it("should have a function to clear syncInfo", function () {
			var syncInfo1,
				syncInfo2;
			
			expect(couchDBStore.clearSyncInfo).toBeInstanceOf(Function);
			couchDBStore.sync("db", "document", "view");
			
			syncInfo1 = couchDBStore.getSyncInfo();
			expect(couchDBStore.clearSyncInfo()).toEqual(true);
			
			syncInfo2 = couchDBStore.getSyncInfo();
			expect(syncInfo2).not.toBe(syncInfo1);
			
			expect(syncInfo2.design).toBeUndefined();
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
		
		it("should have a function to unsynch a view", function () {
			expect(couchDBStore.unsync).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBStore.unsync();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("unsync");
		});
		
	});
	
	describe("CouchDBStoreViewData", function () {
		
		var couchDBStore = null,
			stateMachine = null,
			query = {};
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			couchDBStore.setSyncInfo("db", "design", "_view/view", query);
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
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
			expect(reqData["query"].update_seq).toEqual(true);
			expect(reqData["query"]).toBe(query);
		});
		
		it("should reset the store on sync and ask for changes subscription", function () {
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
		
		it("should set the reduced flag if the view is reduced", function () {
			var res = '{"rows":[{"key":null,"value":[150]}]}',
				callback;
			
			spyOn(couchDBStore, "setReducedViewInfo");
			
			couchDBStore.actions.getView.call(couchDBStore);
			callback = transportMock.request.mostRecentCall.args[2];
			callback.call(couchDBStore, res);
			
			expect(couchDBStore.setReducedViewInfo.wasCalled).toEqual(true);
			expect(couchDBStore.setReducedViewInfo.mostRecentCall.args[0]).toEqual(true);
			
		});
		
		it("should throw an explicit error if resulting json has no 'row' property", function () {
			var cb;
			couchDBStore.actions.getView();
			cb = transportMock.request.mostRecentCall.args[2];
			
			expect(function () {
				cb.call(couchDBStore, '{"error":""}');
			}).toThrow('CouchDBStore [db, design, _view/view].sync() failed: {"error":""}');
		});
		
		it("should subscribe to view changes", function () {
			var reqData;
			
			expect(couchDBStore.stopListening).toBeUndefined();
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			expect(couchDBStore.stopListening).toBe(stopListening);
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
			reqData = transportMock.listen.mostRecentCall.args[1].query;
			expect(reqData.feed).toEqual("continuous");
			expect(reqData.heartbeat).toEqual(20000);
			expect(reqData.since).toEqual(8);
			expect(reqData).toBe(query);
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
		
		it("should call for update on reduced view modification", function () {
			var listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				callback;
			
			spyOn(stateMachine, "event");
			couchDBStore.setReducedViewInfo(true);
			couchDBStore.actions.subscribeToViewChanges.call(couchDBStore, 8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback(listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateReduced");
			expect(stateMachine.event.mostRecentCall.args[1]).toBeUndefined();
		});
		
		it("should update the selected document", function () {
			var reqData,
				value,
				callback,
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
			expect(reqData["query"]).toBe(query);
			
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
				callback,
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
			expect(reqData["query"]).toBe(query);
		
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
		
		it("should update the reduced view", function () {
			var reqData,
				json,
				callback,
				listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				parsed = JSON.parse(listenRes);
			
			spyOn(couchDBStore, "set");
			spyOn(JSON, "parse").andReturn(parsed);
			
			couchDBStore.actions.updateReduced.call(couchDBStore);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
	
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);
			
			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBStore, listenRes);
			
			expect(JSON.parse.wasCalled).toEqual(true);
			expect(JSON.parse.mostRecentCall.args[0]).toEqual(listenRes);
			
			expect(couchDBStore.set.wasCalled).toEqual(true);
			expect(couchDBStore.set.mostRecentCall.args[0]).toEqual(0);
			expect(couchDBStore.set.mostRecentCall.args[1]).toBe(parsed.rows[0]);
		});
		
		it("should unsync a view, ie. stop listening to changes and reset it", function () {
			var spy = jasmine.createSpy();
			couchDBStore.stopListening = spy;
			couchDBStore.actions.unsync.call(couchDBStore);
			expect(spy.wasCalled).toEqual(true);
			expect(couchDBStore.stopListening).toBeUndefined();
		});
		
		it("shouldn't allow for database modification (a view is readonly)", function () {
			spyOn(stateMachine, "event");
			expect(couchDBStore.remove()).toEqual(false);
			expect(couchDBStore.update()).toEqual(false);
			expect(stateMachine.event.wasCalled).toEqual(false);
		});

	});
	
/**
 * 
 * 
 * SINGLE JSON DOCUMENT
 * 
 * 
 */
	
	describe("CouchDBStoreSyncDocument", function () {
		
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
				getDocument,
				synchedUpdateDatabase,
				subscribeToDocumentChanges,
				synchedUnsync,
				entry,
				updateDoc,
				deleteDoc,
				ListeningUpdateDatabase,
				removeFromDatabase,
				listeningUnsync;
			
			Unsynched = stateMachine.get("Unsynched");
			expect(Unsynched).toBeTruthy();
			getDocument = Unsynched.get("getDocument");
			expect(getDocument[0]).toBe(couchDBStore.actions.getDocument);
			expect(getDocument[1]).toBe(couchDBStore);
			expect(getDocument[2]).toEqual("Synched");
			
			Synched = stateMachine.get("Synched");
			expect(Synched).toBeTruthy();
			synchedUpdateDatabase = Synched.get("updateDatabase");
			expect(synchedUpdateDatabase[0]).toBe(couchDBStore.actions.createDocument);
			expect(synchedUpdateDatabase[1]).toBe(couchDBStore);
			
			subscribeToDocumentChanges = Synched.get("subscribeToDocumentChanges");
			expect(subscribeToDocumentChanges[0]).toBe(couchDBStore.actions.subscribeToDocumentChanges);
			expect(subscribeToDocumentChanges[1]).toBe(couchDBStore);
			expect(subscribeToDocumentChanges[2]).toEqual("Listening");
			
			synchedUnsync = Synched.get("unsync");
			expect(synchedUnsync[0]).toBeInstanceOf(Function);
			expect(synchedUnsync[2]).toEqual("Unsynched");
			
			Listening = stateMachine.get("Listening");
			
			expect(Listening).toBeTruthy();
			entry = Listening.get("entry");
			expect(entry[0]).toBe(couchDBStore.actions.resolve);
			expect(entry[1]).toBe(couchDBStore);
			
			updateDoc = Listening.get("updateDoc");
			expect(updateDoc[0]).toBe(couchDBStore.actions.updateDoc);
			expect(updateDoc[1]).toBe(couchDBStore);
			
			deleteDoc = Listening.get("deleteDoc");
			expect(deleteDoc[0]).toBe(couchDBStore.actions.deleteDoc);
			expect(deleteDoc[1]).toBe(couchDBStore);
			
			ListeningUpdateDatabase = Listening.get("updateDatabase");
			expect(ListeningUpdateDatabase[0]).toBe(couchDBStore.actions.updateDatabase);
			expect(ListeningUpdateDatabase[1]).toBe(couchDBStore);
			
			removeFromDatabase = Listening.get("removeFromDatabase");
			expect(removeFromDatabase[0]).toBe(couchDBStore.actions.removeFromDatabase);
			expect(removeFromDatabase[1]).toBe(couchDBStore);
			
			listeningUnsync = Listening.get("unsync");
			expect(listeningUnsync[0]).toBe(couchDBStore.actions.unsync);
			expect(listeningUnsync[1]).toBe(couchDBStore);
			expect(listeningUnsync[2]).toBe("Unsynched");
		});
		
		it("should call setSyncInfo on sync", function () {
			var query = {};
			spyOn(couchDBStore, "setSyncInfo");
			couchDBStore.sync("database", "document", query);
			expect(couchDBStore.setSyncInfo.wasCalled).toEqual(true);
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[0]).toEqual("database");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[1]).toEqual("document");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[2]).toBe(query);
		});
		
		it("should return a promise on sync", function () {
			expect(couchDBStore.sync("database", "document")).toBeInstanceOf(Promise);
		});
		
		it("should call getDocument on sync", function () {
			spyOn(stateMachine, "event");
			couchDBStore.sync("db", "documents");
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("getDocument");
		});
		
		it("should resolve the promise", function () {
			var promise = couchDBStore.sync("db", "document");
			spyOn(promise, "resolve");
			couchDBStore.actions.resolve.call(couchDBStore);
			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0]).toBe(couchDBStore);
		});
		
		it("should have a function to unsynch a document", function () {
			expect(couchDBStore.unsync).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBStore.unsync();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("unsync");
		});
		
	});
	
	/**
	 * A couchDBstore can synchronize with a document
	 * A document is a JSON object
	 */
	describe("CouchDBStoreDocumentData", function () {
		
		var couchDBStore = null,
			stateMachine = null,
			query = {};
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			couchDBStore.setSyncInfo("db", "document1", query);
			stateMachine = couchDBStore.getStateMachine();
		});
		
		it("should get a document's data", function () {
			var reqData; 
			
			couchDBStore.actions.getDocument.call(couchDBStore);
			
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/document1");
			expect(reqData["query"]).toBe(query);
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
		});

		it("should reset the store on sync and ask for changes subscription", function () {
			var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
				callback,
				doc;
			
			couchDBStore.actions.getDocument.call(couchDBStore);
			
			callback = transportMock.request.mostRecentCall.args[2];
			spyOn(stateMachine, "event");
			spyOn(couchDBStore, "reset");
			
			callback.call(couchDBStore, res);

			expect(couchDBStore.reset.wasCalled).toEqual(true);
			doc = couchDBStore.reset.mostRecentCall.args[0];
			expect(doc).toBeInstanceOf(Object);
			
			expect(doc["_rev"]).toEqual("1-7f5175756a7ab72660278c3c0aed2eee")
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToDocumentChanges");
		});
		
		it("should reject the callback if the document doesn't exist", function () {
			couchDBStore.actions.getDocument.call(couchDBStore);
			var promise = couchDBStore.sync("db", "document2"),
				callback = transportMock.request.mostRecentCall.args[2];
			
			spyOn(promise, "reject");
			callback.call(couchDBStore, "{}");
			
			expect(promise.reject.wasCalled).toEqual(true);
			expect(promise.reject.mostRecentCall.args[0]).toBe(couchDBStore);
		});
		
		it("should subscribe to document changes", function () {	
			var reqData;
			expect(couchDBStore.stopListening).toBeUndefined();
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			expect(couchDBStore.stopListening).toBe(stopListening);
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
			reqData = transportMock.listen.mostRecentCall.args[1].query;
			expect(reqData.feed).toEqual("continuous");
			expect(reqData.heartbeat).toEqual(20000);
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBStore);
		});
		
		it("should not fail with empty json from heartbeat", function () {
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			expect(function() {
				callback("\n");
			}).not.toThrow();
		});
		
		it("should call for store update on document update", function () {
			var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
				callback;

			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			callback.call(couchDBStore, listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDoc");
		});
		
		it("should not get changes when another document is updated", function () {
			var listenRes = '{"seq":12,"id":"document5","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
				callback;
	
			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			callback.call(couchDBStore, listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(false);
		});
		
		it("should not get changes if the rev is the same", function () {
			var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
				callback;
	
			couchDBStore.set("_rev", "2-0b77a81676739718c23c72a12a131986");
			
			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			callback.call(couchDBStore, listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(false);
		});
		
		it("should call for document deletion when the document is removed", function () {
			var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}], "deleted": true}',
				callback;
			
			spyOn(stateMachine, "event");
			
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			callback = transportMock.listen.mostRecentCall.args[2];
			
			callback.call(couchDBStore, listenRes);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("deleteDoc");
		});
		
		it("should update store on call for update", function () {
			var reqData,
				callback;
			
			couchDBStore.actions.updateDoc.call(couchDBStore);
			
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/document1");
			
			spyOn(couchDBStore, "reset");
			callback = transportMock.request.mostRecentCall.args[2];
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			callback.call(couchDBStore, '{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}');
			expect(couchDBStore.reset.wasCalled).toEqual(true);
			expect(couchDBStore.reset.mostRecentCall.args[0]._rev).toEqual("2-0b77a81676739718c23c72a12a131986");
			
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
		});
		
		it("should empty the store on document deletion", function () {
			spyOn(couchDBStore, "reset");
			couchDBStore.actions.deleteDoc.call(couchDBStore);
			expect(couchDBStore.reset.wasCalled).toEqual(true);
			expect(couchDBStore.getNbItems()).toEqual(0);
		});
		
		it("should unsync a document, ie. stop listening to changes", function () {
			var spy = jasmine.createSpy();
			couchDBStore.stopListening = spy;
			couchDBStore.actions.unsync.call(couchDBStore);
			expect(spy.wasCalled).toEqual(true);
			expect(couchDBStore.stopListening).toBeUndefined();
		});

		
	});
		
	describe("CouchDBStoreDataBaseUpdate", function () {
		
		var couchDBStore = null,
			stateMachine = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			couchDBStore.setSyncInfo("db", "document1");
			stateMachine = couchDBStore.getStateMachine();
		});
		
		it("should have a function to upload a document", function () {
			expect(couchDBStore.upload).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBStore.upload();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabase");
		});
		
		it("should return a promise", function () {
			expect(couchDBStore.upload()).toBeInstanceOf(Promise);
		});
		
		it("should resolve the promise on upload", function () {
			spyOn(stateMachine, "event");
			var promise = couchDBStore.upload();
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(promise);
		});
		
		it("should have a function to remove a document", function () {
			expect(couchDBStore.remove).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBStore.remove();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("removeFromDatabase");
		});
		
		it("should update the database on update", function () {
			var reqData;
			couchDBStore.set("fakeRev", "10-hello");
			couchDBStore.actions.updateDatabase.call(couchDBStore);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("PUT");
			expect(reqData["path"]).toEqual("/db/document1");
			expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
			expect(JSON.parse(reqData.data).fakeRev).toEqual("10-hello");
		});
		
		it("should resolve the promise on update if update ok", function () {
			var promise = new Promise,
				response = '{"ok":true}';
			spyOn(promise, "resolve");
			couchDBStore.actions.updateDatabase.call(couchDBStore, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0].ok).toEqual(true);
		});
		
		it("should reject the promise on update if update failed", function () {
			var promise = new Promise,
				response = '{"ok":false}';
			spyOn(promise, "reject");
			couchDBStore.actions.updateDatabase.call(couchDBStore, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.reject.wasCalled).toEqual(true);
			expect(promise.reject.mostRecentCall.args[0].ok).toEqual(false);
		});
		
		it("should add document on update if it's missing", function () {
			var reqData;
			couchDBStore.set("fakeRev", "10-hello");
			couchDBStore.actions.createDocument.call(couchDBStore, new Promise);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("PUT");
			expect(reqData["path"]).toEqual("/db/document1");
			expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
			expect(JSON.parse(reqData.data).fakeRev).toEqual("10-hello");
			
			spyOn(stateMachine, "event");
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			transportMock.request.mostRecentCall.args[2]('{"ok":true}');
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToDocumentChanges");
		});
		
		it("should resolve the promise on doc create if update ok", function () {
			var promise = new Promise,
				response = '{"ok":true}';
			spyOn(promise, "resolve");
			couchDBStore.actions.createDocument.call(couchDBStore, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0].ok).toEqual(true);
		});
		
		it("should reject the promise on doc create if update failed", function () {
			var promise = new Promise,
				response = '{"ok":false}';
			spyOn(promise, "reject");
			couchDBStore.actions.createDocument.call(couchDBStore, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.reject.wasCalled).toEqual(true);
			expect(promise.reject.mostRecentCall.args[0].ok).toEqual(false);
		});
		
		it("should remove a document from the database", function () {
			couchDBStore.set("_rev", "10-hello");
			
			couchDBStore.actions.removeFromDatabase.call(couchDBStore);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("DELETE");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual("/db/document1");
			expect(transportMock.request.mostRecentCall.args[1].query.rev).toEqual("10-hello");
		});
		
/**
 * 
 * 
 * BULK OF DOCUMENTS
 * 
 * 
 */
		
		describe("CouchDBStoreSyncBulkOfDocuments", function () {
			
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
					getBulkDocuments,
					subscribeToBulkChanges,
					SynchedUnsync,
					entry,
					bulkAdd,
					bulkChange,
					updateDatabaseWithBulkDoc,
					listeningUnsync;
				
				Unsynched = stateMachine.get("Unsynched");
				expect(Unsynched).toBeTruthy();
				getBulkDocuments = Unsynched.get("getBulkDocuments");
				expect(getBulkDocuments[0]).toBe(couchDBStore.actions.getBulkDocuments);
				expect(getBulkDocuments[1]).toBe(couchDBStore);
				expect(getBulkDocuments[2]).toEqual("Synched");
				
				Synched = stateMachine.get("Synched");
				expect(Synched).toBeTruthy();
				subscribeToBulkChanges = Synched.get("subscribeToBulkChanges");
				expect(subscribeToBulkChanges[0]).toBe(couchDBStore.actions.subscribeToBulkChanges);
				expect(subscribeToBulkChanges[1]).toBe(couchDBStore);
				expect(subscribeToBulkChanges[2]).toEqual("Listening");
				
				SynchedUnsync = Synched.get("unsync");
				expect(SynchedUnsync[0]).toBeInstanceOf(Function);
				expect(SynchedUnsync[2]).toEqual("Unsynched");
				
				Listening = stateMachine.get("Listening");
				expect(Listening).toBeTruthy();
				
				entry = Listening.get("entry");
				expect(entry[0]).toBe(couchDBStore.actions.resolve);
				expect(entry[1]).toBe(couchDBStore);
				
				bulkAdd = Listening.get("bulkAdd");
				expect(bulkAdd[0]).toBe(couchDBStore.actions.addBulkDocInStore);
				expect(bulkAdd[1]).toBe(couchDBStore);
				
				bulkChange = Listening.get("bulkChange");
				expect(bulkChange[0]).toBe(couchDBStore.actions.updateBulkDocInStore);
				expect(bulkChange[1]).toBe(couchDBStore);
				
				listeningUnsync = Listening.get("unsync");
				expect(listeningUnsync[0]).toBe(couchDBStore.actions.unsync);
				expect(listeningUnsync[1]).toBe(couchDBStore);
				expect(listeningUnsync[2]).toBe("Unsynched");
				
				updateDatabaseWithBulkDoc = Listening.get("updateDatabaseWithBulkDoc");
				expect(updateDatabaseWithBulkDoc[0]).toBe(couchDBStore.actions.updateDatabaseWithBulkDoc);
				expect(updateDatabaseWithBulkDoc[1]).toBe(couchDBStore);

				
			});
			
			it("should call setSyncInfo on sync", function () {
				var query = {keys:[]};
				
				spyOn(couchDBStore, "setSyncInfo").andCallThrough();
				couchDBStore.sync("database", query);
				expect(couchDBStore.setSyncInfo.wasCalled).toEqual(true);
				expect(couchDBStore.setSyncInfo.mostRecentCall.args[0]).toEqual("database");
				expect(couchDBStore.setSyncInfo.mostRecentCall.args[1]).toBe(query);
			});
			
			it("should return a promise on sync", function () {
				expect(couchDBStore.sync("database", {})).toBeInstanceOf(Promise);
			});
			
			it("should call getBulkDocuments on sync", function () {
				spyOn(stateMachine, "event");
				couchDBStore.sync("db", {});
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toBe("getBulkDocuments");
			});
			
			it("should resolve the promise", function () {
				var promise = couchDBStore.sync("db", {});
				spyOn(promise, "resolve");
				couchDBStore.actions.resolve.call(couchDBStore);
				expect(promise.resolve.wasCalled).toEqual(true);
				expect(promise.resolve.mostRecentCall.args[0]).toBe(couchDBStore);
			});
			
			it("should have a function to unsynch a bulk of documents", function () {
				expect(couchDBStore.unsync).toBeInstanceOf(Function);
				spyOn(stateMachine, "event");
				couchDBStore.unsync();
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("unsync");
			});
			
		});
		
		/**
		 * A couchDBstore can synchronize with a bulk of documents
		 * A bulk of documents is an arbitrary ordered array of documents
		 */
		describe("CouchDBStoreBulkDocumentsData", function () {
			
			var couchDBStore = null,
				stateMachine = null,
				query = {},
				keys = ["document1", "document2"];
			
			beforeEach(function () {
				couchDBStore = new CouchDBStore;
				couchDBStore.setTransport(transportMock);
				query.keys = keys;
				couchDBStore.setSyncInfo("db", query);
				stateMachine = couchDBStore.getStateMachine();
			});
			
			it("get a bulk of documents' data", function () {
				var reqData; 
				
				couchDBStore.actions.getBulkDocuments.call(couchDBStore);
				
				expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
				reqData = transportMock.request.mostRecentCall.args[1];
				expect(reqData).toBeInstanceOf(Object);
				expect(reqData["method"]).toEqual("POST");
				expect(reqData["path"]).toEqual("/db/_all_docs");
				expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
				expect(reqData["query"]).toBe(query);
				expect(reqData["query"].include_docs).toEqual(true);
				expect(reqData["query"].update_seq).toEqual(true);
				expect(JSON.parse(reqData["data"]).keys[0]).toEqual("document1");
				expect(JSON.parse(reqData["data"]).keys[1]).toEqual("document2");
				expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
				expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
			});
			
			it("should reset the store on sync and ask for changes subscription", function () {
				
				var res = '{"total_rows":2,"update_seq":2,"offset":0,"rows":['+
						'{"id":"document1","key":"document1","value":{"rev":"1-793111e6af0ccddb08147c0be1f49843"},"doc":{"_id":"document1","_rev":"1-793111e6af0ccddb08147c0be1f49843","desc":"my first doc"}},'+
						'{"id":"document2","key":"document2","value":{"rev":"1-498184b1f395834249a2ffbf3e73d372"},"doc":{"_id":"document2","_rev":"1-498184b1f395834249a2ffbf3e73d372","desc":"my second doc"}}'+
						']}',
					callback;
				
				couchDBStore.actions.getBulkDocuments.call(couchDBStore);
				
				callback = transportMock.request.mostRecentCall.args[2];
				spyOn(stateMachine, "event");
				spyOn(couchDBStore, "reset");
				
				callback.call(couchDBStore, res);
				
				expect(couchDBStore.reset.wasCalled).toEqual(true);
				expect(couchDBStore.reset.mostRecentCall.args[0]).toBeInstanceOf(Object);
				expect(couchDBStore.reset.mostRecentCall.args[0][0].key).toEqual("document1");
				
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToBulkChanges");
				expect(stateMachine.event.mostRecentCall.args[1]).toEqual(2);
				
			});
			
			it("should throw an explicit error if resulting json has no 'row' property", function () {
				var cb;
				
				couchDBStore.actions.getBulkDocuments("yes");
				cb = transportMock.request.mostRecentCall.args[2];

				expect(function () {
					cb.call(couchDBStore, '{"error":""}');
				}).toThrow('CouchDBStore.sync("db", {"keys":["document1","document2"]}) failed: {"error":""}');
			});
			
			it("should subscribe to bulk changes", function () {
				var reqData;
				
				expect(couchDBStore.stopListening).toBeUndefined();
				couchDBStore.actions.subscribeToBulkChanges.call(couchDBStore, 2);
				expect(couchDBStore.stopListening).toBe(stopListening);
				
				expect(transportMock.listen.wasCalled).toEqual(true);
				expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
				expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
				reqData = transportMock.listen.mostRecentCall.args[1].query;
				expect(reqData.feed).toEqual("continuous");
				expect(reqData.heartbeat).toEqual(20000);
				expect(reqData.since).toEqual(2);
				expect(reqData.include_docs).toEqual(true);
				expect(reqData).toBe(query);
				expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
				expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBStore);
			});
			
			it("should not fail with empty json from heartbeat", function () {
				var callback;
				
				couchDBStore.actions.subscribeToBulkChanges.call(CouchDBStore, 2);
				callback = transportMock.listen.mostRecentCall.args[2];
				
				expect(function() {
					callback("\n");
				}).not.toThrow();
			});
			
			it("should call for document addition if a document has been added to the database", function () {
				var listenRes = '{"seq":3,"id":"document2","changes":[{"rev":"1-a071048ce217ff1341fb224b83417003"}],"doc":{"_id":"document2","_rev":"1-a071048ce217ff1341fb224b83417003","desc":"my second document"}}';

				spyOn(stateMachine, "event");
				
				couchDBStore.actions.subscribeToBulkChanges.call(couchDBStore, 2);
				callback = transportMock.listen.mostRecentCall.args[2](listenRes);

				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("bulkAdd");
				expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");		
			});
			
			it("should call for document update if one of them has changed", function () {
				var listenRes = '{"seq":3,"id":"document2","changes":[{"rev":"2-a071048ce217ff1341fb224b83417003"}],"doc":{"_id":"document2","_rev":"2-a071048ce217ff1341fb224b83417003","desc":"my second document"}}',
					callback;

				spyOn(stateMachine, "event");
				
				couchDBStore.actions.subscribeToBulkChanges.call(couchDBStore, 2);
				callback = transportMock.listen.mostRecentCall.args[2];
				callback(listenRes);
				
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("bulkChange");
				expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");
				expect(stateMachine.event.mostRecentCall.args[2]._rev).toEqual("2-a071048ce217ff1341fb224b83417003");
			});
			
			it("should call for document removal if one of them was removed", function () {
				var listenRes = '{"seq":5,"id":"document2","changes":[{"rev":"3-e597919e6e32c045553beb8eb3688b21"}],"deleted":true}',
					callback;
		
				spyOn(stateMachine, "event");
				
				couchDBStore.actions.subscribeToBulkChanges.call(couchDBStore, 2);
				callback = transportMock.listen.mostRecentCall.args[2];
				callback(listenRes);
				
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("delete");
				expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");
			});
			
			it("should add the new document (only works with range)", function () {
				
				var query = {starkey: "document1", endkey: "document5"},
					result = '{"total_rows":2,"offset":0,"rows":[' +
						'{"id":"document2","key":"document2","value":{"rev":"5-aa1e4ec04d056f1cba18895a33be7f4d"},"doc":{"_id":"document2","_rev":"5-aa1e4ec04d056f1cba18895a33be7f4d","name":"Emily","type":"JS real-time Framework"}},' +
						'{"id":"document4","key":"document4","value":{"rev":"1-5b629f97e2298a911cce75d01bd6c65e"},"doc":{"_id":"document4","_rev":"1-5b629f97e2298a911cce75d01bd6c65e","name":"CouchDB","type":"NoSQL Database"}}' +
					']}';
				
				spyOn(couchDBStore, "alter");
				
				expect(couchDBStore.actions.addBulkDocInStore()).toEqual(false);
				
				couchDBStore.setSyncInfo("db", query);
				
				couchDBStore.actions.addBulkDocInStore.call(couchDBStore, "document4");
				expect(transportMock.request.wasCalled).toEqual(true);
				expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
				
				reqData = transportMock.request.mostRecentCall.args[1];
				reqData = transportMock.request.mostRecentCall.args[1];
				expect(reqData).toBeInstanceOf(Object);
				expect(reqData["method"]).toEqual("GET");
				expect(reqData["path"]).toEqual("/db/_all_docs");
				expect(reqData["query"]).toBe(query);
				expect(reqData["query"].include_docs).toEqual(true);
				expect(reqData["query"].update_seq).toEqual(true);
				expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
				expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
				
				transportMock.request.mostRecentCall.args[2].call(couchDBStore, result);
				
				expect(couchDBStore.alter.wasCalled).toEqual(true);
				expect(couchDBStore.alter.mostRecentCall.args[0]).toEqual("splice");
				expect(couchDBStore.alter.mostRecentCall.args[1]).toEqual(1);
				expect(couchDBStore.alter.mostRecentCall.args[2]).toEqual(0);
				expect(couchDBStore.alter.mostRecentCall.args[3]._rev).toEqual("1-5b629f97e2298a911cce75d01bd6c65e");
			});
			
			it("should update the selected document", function () {
				var doc = {
							"_id":"document2",
							"_rev":"2-a071048ce217ff1341fb224b83417003",
							"desc":"my second document"
					},
					cb;
				
				spyOn(couchDBStore, "loop");
				spyOn(couchDBStore, "set");
				
				couchDBStore.actions.updateBulkDocInStore.call(couchDBStore, "document2", doc);
				
				expect(couchDBStore.loop.wasCalled).toEqual(true);
				cb = couchDBStore.loop.mostRecentCall.args[0];
				
				expect(cb).toBeInstanceOf(Function);
				expect(couchDBStore.loop.mostRecentCall.args[1]).toBe(couchDBStore);
				
				cb.call(couchDBStore, {id:"documentFake"}, 1);
				expect(couchDBStore.set.wasCalled).toEqual(false);
				
				cb.call(couchDBStore, {id:"document2"}, 1);
				expect(couchDBStore.set.wasCalled).toEqual(true);
				expect(couchDBStore.set.mostRecentCall.args[0]).toEqual(1);
				expect(couchDBStore.set.mostRecentCall.args[1]._rev).toEqual("2-a071048ce217ff1341fb224b83417003");
				
			});
			
			it("should unsync a view, ie. stop listening to changes and reset it", function () {
				var spy = jasmine.createSpy();
				couchDBStore.stopListening = spy;
				couchDBStore.actions.unsync.call(couchDBStore);
				expect(spy.wasCalled).toEqual(true);
				expect(couchDBStore.stopListening).toBeUndefined();
			});
		
		});
		
		describe("CouchDBStoreDataBaseUpdateWithBulkDocuments", function () {
			
			var couchDBStore = null,
				stateMachine = null;
			
			beforeEach(function () {
				couchDBStore = new CouchDBStore;
				couchDBStore.setTransport(transportMock);
				couchDBStore.setSyncInfo("db", {keys: ["document1", "document2"]});
				stateMachine = couchDBStore.getStateMachine();
			});
			
			it("should have a function to upload a document", function () {
				expect(couchDBStore.upload).toBeInstanceOf(Function);
				spyOn(stateMachine, "event");
				couchDBStore.upload();
				expect(stateMachine.event.wasCalled).toEqual(true);
				expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabaseWithBulkDoc");
			});
			
			it("should return a promise", function () {
				expect(couchDBStore.upload()).toBeInstanceOf(Promise);
			});
					
			it("should resolve the promise on update if update ok", function () {
				var promise = new Promise,
					response = '{}';
				spyOn(promise, "resolve");
				couchDBStore.actions.updateDatabaseWithBulkDoc.call(couchDBStore, promise);
				transportMock.request.mostRecentCall.args[2](response);
				expect(promise.resolve.wasCalled).toEqual(true);
				expect(promise.resolve.mostRecentCall.args[0]).toBeInstanceOf(Object);
			});
			
			it("shouldn't allow for removing a document (a doc to delete should have a _deleted property set to true)", function () {
				expect(couchDBStore.remove()).toEqual(false);
			});
			
			it("should update the database on update", function () {
				var reqData,
					data;
				
				couchDBStore.reset([
					{"id":"document1","key":"document1","value":{"rev":"1-793111e6af0ccddb08147c0be1f49843"},"doc":{"_id":"document1","_rev":"1-793111e6af0ccddb08147c0be1f49843","desc":"my first doc"}},
					{"id":"document2","key":"document2","value":{"rev":"2-a071048ce217ff1341fb224b83417003"},"doc":{"_id":"document2","_rev":"2-a071048ce217ff1341fb224b83417003","desc":"my second document"}}                    
				]);
				couchDBStore.actions.updateDatabaseWithBulkDoc.call(couchDBStore);
				
				expect(transportMock.request.wasCalled).toEqual(true);
				expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
				reqData = transportMock.request.mostRecentCall.args[1];
				
				expect(reqData).toBeInstanceOf(Object);
				expect(reqData["method"]).toEqual("POST");
				expect(reqData["path"]).toEqual("/db/_bulk_docs");
				expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
				data = JSON.parse(reqData.data);
				expect(data.docs).toBeInstanceOf(Array);
				expect(data.docs[0]._id).toEqual("document1");
				expect(data.docs[1]._id).toEqual("document2");
				
			});
			
		});
	});
	
});