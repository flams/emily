define("CouchDBStore", 

["Store"], 


function CouchDBStore(Store) {
	
	return function CouchDBStoreConstructor() {
		return new Store;
	};
	
	
	
});