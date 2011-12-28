require(["CouchDB"], function (CouchDB) {

	describe("CouchDBTest", function () {
		
		var adapterDouble = null,
			reponses = null;
		
		beforeEach(function () {
			responses = {
					get : {
						"_all_dbs": ["_replicator","_users","testdb"],
						"testdb": '{"db_name":"testdb","doc_count":2,"doc_del_count":0,"update_seq":2,"purge_seq":0,"compact_running":false,"disk_size":8281,"instance_start_time":"1325034176135726","disk_format_version":5,"committed_update_seq":2}'
					}
			};
			adapterDouble = {
					get: function (url, callback) {
						callback(responses.get[url]);
					},
					del: jasmine.createSpy(),
					put: jasmine.createSpy()
			};
			CouchDB.useAdapter(adapterDouble);
		});
		
		describe("CouchDBInit", function () {
			it("should be an object", function () {
				expect(CouchDB).toBeInstanceOf(Object);
			});
			
			it("should use the given adapter", function() {
				expect(CouchDB.useAdapter).toBeInstanceOf(Function);
				expect(CouchDB.getAdapter).toBeInstanceOf(Function);
				expect(CouchDB.useAdapter(adapterDouble)).toEqual(true);
				expect(CouchDB.getAdapter()).toBe(adapterDouble);
			});
		});
		
		describe("CouchDBAPI", function () {
			it("should get the list of databases", function () {
				var callback = jasmine.createSpy();

				expect(CouchDB.getAll).toBeInstanceOf(Function);
				
				spyOn(adapterDouble, "get").andCallThrough();
				
				// This looks asynchronous and it will be when used in production,
				// but for testing purpose it's synchronous
				CouchDB.getAll(callback);
				
				// Tests can be run here and not in the callback.
				expect(adapterDouble.get).toHaveBeenCalled();
		
				expect(adapterDouble.get.mostRecentCall.args[0]).toEqual("_all_dbs");
				expect(adapterDouble.get.mostRecentCall.args[1]).toEqual(callback); 
				
				expect(callback).toHaveBeenCalled();
				expect(callback.mostRecentCall.args[0]).toBe(responses.get["_all_dbs"]);
			});
			
			
			it("should get a database", function () {
				var callback = jasmine.createSpy();
				
				spyOn(adapterDouble, "get").andCallThrough();
				
				expect(CouchDB.get).toBeInstanceOf(Function);
				CouchDB.get("testdb", callback);
				
				expect(adapterDouble.get).toHaveBeenCalled();
				expect(adapterDouble.get.mostRecentCall.args[0]).toEqual("testdb");
				expect(adapterDouble.get.mostRecentCall.args[1]).toBeInstanceOf(Function);
				
				expect(callback.callCount).toEqual(1);
				expect(callback.mostRecentCall.args[0]).toBe(responses.get["testdb"]);
				
				CouchDB.get("testdb", callback);
				
				expect(adapterDouble.get.callCount).toEqual(1);
				expect(callback.callCount).toEqual(2);
			});
			
			it("should get the list of loaded databases", function () {
				var loaded = null;
				
				expect(CouchDB.getLoaded).toBeInstanceOf(Function);
				
				loaded = CouchDB.getLoaded();
				
				expect(loaded).toBeInstanceOf(Object);

				expect(loaded["testdb"]).toBe(responses.get["testdb"]);
				expect(Object.getOwnPropertyNames(loaded).join("")).toEqual("testdb");
			});

			
			it("should not fail if get is called without callback", function () {
				// So get could be used as a database preload function
				expect(function () {CouchDB.get("testdb");}).not.toThrow();
				// Test it again now that the db is preloaded
				expect(function () {CouchDB.get("testdb");}).not.toThrow();
			});
			
			// The following is being refactored
			it("should add a database", function () {
				var callback = function () {};
				
				expect(CouchDB.add).toBeInstanceOf(Function);

				CouchDB.add("testdb", callback);
				
				expect(adapterDouble.put).toHaveBeenCalled();
				expect(adapterDouble.put.mostRecentCall.args[0]).toEqual("testdb");
				expect(adapterDouble.put.mostRecentCall.args[1]).toEqual(callback);
			});
			
			it("should delete a database", function () {
				var callback = function () {};
				
				expect(CouchDB.del).toBeInstanceOf(Function);

				CouchDB.del("testdb", callback);
				
				expect(adapterDouble.del).toHaveBeenCalled();
				expect(adapterDouble.del.mostRecentCall.args[0]).toEqual("testdb");
				expect(adapterDouble.del.mostRecentCall.args[1]).toEqual(callback);
			});
		});
		
	});
		
});