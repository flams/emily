require(["CouchDBStore", "Store"], function (CouchDBStore, Store) {
	
	describe("CouchDBStoreTest", function () {
		
		it("should be a constructor function", function () {
			expect(CouchDBStore).toBeInstanceOf(Function);
		});
		
	});

	describe("CouchDBStoreInit", function () {
		
		var couchDBStore = new CouchDBStore;
		
		it("should return a Store when initialized", function () {
			expect(couchDBStore).toBeInstanceOf(Store);
		});
		
	});
	
});