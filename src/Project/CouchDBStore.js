define("CouchDBStore", 

["Store", "Tools"], 


function CouchDBStore(Store, Tools) {
	
	function CouchDBStoreConstructor() {
		
		var _channel = "CouchDB",
			_transport = null,
			_dbInfo = {};
		
		this.sync = function sync(database, design, view) {
			
			if (typeof database == "string" && typeof design == "string" && typeof view == "string") {
				_transport.request(_channel, {
					method: "GET",
					path: "/" + database + "/_design/" + design + "/" + "_view/" + view +"?update_seq=true"
				}, function (results) {
					var json = JSON.parse(results);
					_dbInfo = {
							total_rows: json.total_rows,
							update_seq: json.update_seq,
							offset: json.offset
					};
					
					this.reset(json.rows);
					
					_transport.listen(_channel, {
						method: "GET",
						path: "/" + database + "/_changes?feed=continuous&heartbeat=20000&since="+_dbInfo.update_seq
					}, function (changes){
						if (changes == "\n") return false;
							var json = JSON.parse(changes);
							
							_transport.request(_channel, {
								method: "GET",
								path: '/'+database+'/_design/'+design+'/_view/'+view+'?key="'+json.id+'"'
							}, function (doc) {
								var json = JSON.parse(doc);
								this.set(json.offset, json.rows[0]);
							}, this);
						
					}, this);

				}, this);

				
				return true;
			} else {
				return false;
			}
		};
		
		this.getDBInfo = function getDBInfo(name) {
			return _dbInfo[name];
		};
		
		this.setTransport = function setTransport(transport) {
			if (transport && typeof transport.listen == "function" && typeof transport.request) {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};
		
		this.getTransport = function getTransport() {
			return _transport;
		};

	};
	
	CouchDBStoreConstructor.prototype = new Store;
	
	return CouchDBStoreConstructor;
	
});