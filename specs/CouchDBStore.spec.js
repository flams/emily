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
		
		it("should pass query params to the url when syncing to a view", function () {
			var syncInfo,
				query = {
					descending: true
				};
			
			couchDBStore.setSyncInfo("db", "design", "view", query);
			
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["query"]).toBe(query);
		});
		
		it("should pass query params to the url when synching to a document", function () {
			var syncInfo,
				query = {
					revs_info: true
				};
			
			couchDBStore.setSyncInfo("db", "document", query);
			
			syncInfo = couchDBStore.getSyncInfo();
			expect(syncInfo["query"]).toBe(query);
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
				SynchedUnsync,
				entry,
				change,
				del,
				add,
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
			expect(SynchedUnsync[0].name).toEqual("noop");
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
			
			listeningUnsync = Listening.get("unsync");
			expect(listeningUnsync[0]).toBe(couchDBStore.actions.unsync);
			expect(listeningUnsync[1]).toBe(couchDBStore);
			expect(listeningUnsync[2]).toBe("Unsynched");
		});
		
		it("should call setSyncInfo on sync", function () {
			var query = {};
			spyOn(couchDBStore, "setSyncInfo").andCallThrough();
			couchDBStore.sync("db", "document", "view", query);
			expect(couchDBStore.setSyncInfo.wasCalled).toEqual(true);
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[0]).toEqual("db");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[1]).toEqual("document");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[2]).toEqual("view");
			expect(couchDBStore.setSyncInfo.mostRecentCall.args[3]).toBe(query);
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
			couchDBStore.setSyncInfo("db", "design", "view", query);
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
		
		it("should unsync a view, ie. stop listening to changes and reset it", function () {
			var spy = jasmine.createSpy();
			couchDBStore.stopListening = spy;
			couchDBStore.actions.unsync.call(couchDBStore);
			expect(spy.wasCalled).toEqual(true);
			expect(couchDBStore.stopListening).toBeUndefined();
		});
		

	});
	
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
			expect(synchedUnsync[0].name).toEqual("noop");
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
			expect(couchDBStore.sync("database", "document", "view")).toBeInstanceOf(Promise);
		});
		
		it("should call getDocument on sync", function () {
			spyOn(stateMachine, "event");
			couchDBStore.sync("db", "documentsss");
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
			stateMachine = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			couchDBStore.setSyncInfo("db", "document1");
			stateMachine = couchDBStore.getStateMachine();
		});
		
		it("get a document's data", function () {
			var reqData; 
			
			couchDBStore.actions.getDocument.call(couchDBStore);
			
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/document1");
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBStore);
		});
		
		it("should add params to the url when requesting a document", function () {
			var query;
			couchDBStore.setSyncInfo("db", "document", {
				param1: true,
				param2: '["a","b"]'
			});
			
			couchDBStore.actions.getDocument();
			query = transportMock.request.mostRecentCall.args[1].query;
			expect(query.param1).toEqual(true);
			expect(query.param2).toEqual('["a","b"]');
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
			expect(couchDBStore.stopListening).toBeUndefined();
			couchDBStore.actions.subscribeToDocumentChanges.call(couchDBStore);
			expect(couchDBStore.stopListening).toBe(stopListening);
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
			query = transportMock.listen.mostRecentCall.args[1].query;
			expect(query.feed).toEqual("continuous");
			expect(query.heartbeat).toEqual(20000);
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
			expect(typeof reqData.data).toEqual("string");
			expect(JSON.parse(reqData.data).fakeRev).toEqual("10-hello");
		});
		
		it("should add document on update if it's missing", function () {
			var reqData;
			couchDBStore.set("fakeRev", "10-hello");
			couchDBStore.actions.createDocument.call(couchDBStore);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("PUT");
			expect(reqData["path"]).toEqual("/db/document1");
			expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
			expect(typeof reqData.data).toEqual("string");
			expect(JSON.parse(reqData.data).fakeRev).toEqual("10-hello");
			
			spyOn(stateMachine, "event");
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			transportMock.request.mostRecentCall.args[2]();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToDocumentChanges");
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
		
		
	});
	
});