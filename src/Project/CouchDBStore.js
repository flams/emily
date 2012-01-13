define("CouchDBStore", 

["Store", "StateMachine", "Tools"], 


function CouchDBStore(Store, StateMachine, Tools) {
	
	function CouchDBStoreConstructor() {
		
		var _channel = "CouchDB",
			_transport = null,
			_database = null,
			_view = null,
			_design = null,
			
			_stateMachine = new StateMachine("Unsynched", {
				"Unsynched": [
				              
				 ["getView", function () {
						_transport.request(_channel, {
							method: "GET",
							path: "/" + _database + "/_design/" + _design + "/" + "_view/" + _view +"?update_seq=true"
						}, function (results) {
							var json = JSON.parse(results);
							_dbInfo = {
									total_rows: json.total_rows,
									update_seq: json.update_seq,
									offset: json.offset
							};
							
							this.reset(json.rows);
							_stateMachine.event("subscribeToChanges", json.update_seq);
						}, this);
						
					}, this, "Synched"]],
							
				"Synched": [
				            
				  ["subscribeToChanges", function (update_seq) {
						_transport.listen(_channel, {
							method: "GET",
							path: "/" + _database + "/_changes?feed=continuous&heartbeat=20000&since="+update_seq
						}, function (changes) {
							var json = JSON.parse(changes),
								action;

							if (json.deleted) {
								action = "delete";
							} else if (json.changes[0].rev[0] == "1") {
								action = "add";
							} else {
								action = "change";
							}
							_stateMachine.event(action, json.id);
						}, this);
					}, this, "Listening"]],
					
				"Listening": [
				              
				    ["change", function (id) {
						_transport.request(_channel,{
							method: "GET",
							path: '/'+_database+'/_design/'+_design+'/_view/'+_view
						}, function (view) {
							var json = JSON.parse(view);
							
							json.rows.some(function (value, idx) {
								if (value.id == id) {
									this.set(idx, value);
								}
							}, this);

							
						}, this);
						
					}, this],
					
					["delete", function (id) {
						this.loop(function (value, idx) {
							if (value.id == id) {
								this.del(idx);
							}
						}, this);
					}, this],
					
					["add", function (id) {
						_transport.request(_channel,{
							method: "GET",
							path: '/'+_database+'/_design/'+_design+'/_view/'+_view
						}, function (view) {
							var json = JSON.parse(view);
							
							json.rows.some(function (value, idx) {
								if (value.id == id) {
									this.alter("splice", idx, 0, value);	
								}
							}, this);
							
						}, this);
					}, this]]
			
			}),
			_dbInfo = {};
		
		this.sync = function sync(database, design, view) {
			
			if (typeof database == "string" && typeof design == "string" && typeof view == "string") {
				_database = database;
				_design = design;
				_view = view;
				_stateMachine.event("getView");
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
		
		this.getState = function getState() {
			return _stateMachine.getCurrent();
		};
		
		this.getTransport = function getTransport() {
			return _transport;
		};

	};
	
	return function CouchDBStoreFactory() {
		CouchDBStoreConstructor.prototype = new Store;
		return new CouchDBStoreConstructor;
	};
	
});