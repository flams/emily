define("CouchDBStore", 

["Store", "StateMachine", "Tools"], 

/**
 * @class
 * CouchDBStore synchronises a Store with a CouchDB view
 * It subscribes to _changes to keep its data up to date.
 */
function CouchDBStore(Store, StateMachine, Tools) {
	
	/**
	 * Defines the CouchDBStore
	 * @returns {CouchDBStoreConstructor}
	 */
	function CouchDBStoreConstructor() {
		
		/**
		 * The name of the channel on which to run the requests
		 * @private
		 */
		var _channel = "CouchDB",
		
		/**
		 * The transport used to run the requests
		 * @private
		 */
		_transport = null,
		
		/**
		 * The database name
		 * @private
		 */
		_database = null,
		
		/**
		 * The name of the view
		 * @private
		 */
		_view = null,
		
		/**
		 * The name of the design document
		 * @private
		 */
		_design = null,
		
		/**
		 * An object to store info like update_sq
		 * @private
		 */
		_dbInfo = {},
		
		/**
		 * The state machine
		 * @private
		 * it concentrates almost the whole logic.
		 * It can already be extended to handle reconnect for instance
		 */
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
						
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
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
			
		});
		
		/**
		 * Synchronize the store with a view
		 * @param {String} database the name of the database where to get...
		 * @param {String} ...design the design document, in which...
		 * @param {String} view ...the view is.
		 * @returns {Boolean}
		 */
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
		
		/**
		 * Get a specific info about the current view
		 * Should be used only for debugging
		 * @param {String} name (update_seq/offset/total_rows)
		 * Note: if you want to get the number of items, store.getNbItems() is the func for that
		 * @returns the info
		 */
		this.getDBInfo = function getDBInfo(name) {
			return _dbInfo[name];
		};
		
		/**
		 * The transport object to use
		 * @param {Object} transport the transport object
		 * @returns {Boolean} true if 
		 */
		this.setTransport = function setTransport(transport) {
			if (transport && typeof transport.listen == "function" && typeof transport.request == "function") {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the current state machine's state
		 * Also only useful for debugging
		 * @returns {String} the name of the current state
		 */
		this.getState = function getState() {
			return _stateMachine.getCurrent();
		};
		
		/**
		 * Get the current transport
		 * Also only useful for debugging
		 * @returns {Object} the current transport
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};

	};
	
	return function CouchDBStoreFactory() {
		CouchDBStoreConstructor.prototype = new Store;
		return new CouchDBStoreConstructor;
	};
	
});