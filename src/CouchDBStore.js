/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("CouchDBStore", 

["Store", "StateMachine", "Tools", "Promise"], 

/**
 * @class
 * CouchDBStore synchronises a Store with a CouchDB view or document
 * It subscribes to _changes to keep its data up to date.
 */
function CouchDBStore(Store, StateMachine, Tools, Promise) {
	
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
		
		_syncInfo = {},
				
		/**
		 * An object to store info like update_sq
		 * @private
		 */
		_dbInfo = {},
		
		/**
		 * The promise that is returned by sync
		 * It's resolved when entering listening state
		 * It's rejected when no such document to sync to
		 * @private
		 */
		_syncPromise = new Promise(),
		
		actions = {
			
			/**
			 * Get a CouchDB view
			 * @private
			 */
			getView: function () {
				_transport.request(_channel, {
					method: "GET",
					path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + "_view/" + _syncInfo.view +"?update_seq=true"
				}, function (results) {
					var json = JSON.parse(results);
					_dbInfo = {
							total_rows: json.total_rows,
							update_seq: json.update_seq,
							offset: json.offset
					};
					
					this.reset(json.rows);
					_stateMachine.event("subscribeToViewChanges", json.update_seq);
				}, this);
			},
			
			/**
			 * Get a CouchDB document
			 * @private
			 */
			getDocument: function () { 
				_transport.request(_channel, {
					method: "GET",
					path: "/" + _syncInfo.database + "/" + _syncInfo.document
				}, function (results) {
					var json = JSON.parse(results);
					if (json._id) {
						this.reset(json);
						_stateMachine.event("subscribeToDocumentChanges");	
					} else {
						_syncPromise.reject(this);
					}
				}, this);
			},
			
			/**
			 * Put a new document in CouchDB
			 * @private
			 */
			createDocument: function () {
            	_transport.request(_channel, {
            		method: "PUT",
            		path: '/' + _syncInfo.database + '/' + _syncInfo.document,
            		headers: {
            			"Content-Type": "application/json"
            		},
            		data: this.toJSON()
            	}, function () {
            		_stateMachine.event("subscribeToDocumentChanges");
            	});
            },
            
            /**
             * Subscribe to changes when synchronized with a view
             * @param {Number} the update_seq given by getView, it'll be passed to since in the GET request
             * @private
             */
            subscribeToViewChanges: function (update_seq) {
				_transport.listen(_channel
					, "/" + _syncInfo.database + "/_changes?feed=continuous&heartbeat=20000&since="+update_seq
					, function (changes) {
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
						var json = JSON.parse(changes),
							action;

						if (json.deleted) {
							action = "delete";
						} else if (json.changes[0].rev.search("1-") == 0) {
							action = "add";
						} else {
							action = "change";
						}
						_stateMachine.event(action, json.id);
					}, this);
				},
				
				/**
				 * Subscribe to changes when synchronized with a document
				 * @private
				 */
				subscribeToDocumentChanges: function () {
					_transport.listen(_channel
					, "/" + _syncInfo.database + "/_changes?feed=continuous&heartbeat=20000"
					, function (changes) {
						var json;
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
						json = JSON.parse(changes);
						
						// The document is the modified document is the current one
						if (json.id == _syncInfo.document && 
							// And if it has a new revision
							json.changes.pop().rev != this.get("_rev")) {
							
							if (json.deleted) {
								_stateMachine.event("deleteDoc");
							} else {
								_stateMachine.event("updateDoc");	
							}
						 }
					}, this);
				},
				
				/**
				 * Update in the Store a document that was updated in CouchDB
				 * Get the whole view :(, then get the modified document and update it.
				 * I have no choice but to request the whole view and look for the document
				 * so I can also retrieve its position in the store (idx) and update the item.
				 * Maybe I've missed something
				 * @private
				 */
				updateDocInStore: function (id) {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_syncInfo.database+'/_design/'+_syncInfo.design+'/_view/'+_syncInfo.view
					}, function (view) {
						var json = JSON.parse(view);
						
						json.rows.some(function (value, idx) {
							if (value.id == id) {
								this.set(idx, value);
							}
						}, this);

						
					}, this);
					
				},
				
				/**
				 * Remove from the Store a document that was removed in CouchDB
				 * @private
				 */
				removeDocInStore: function (id) {
					this.loop(function (value, idx) {
						if (value.id == id) {
							this.del(idx);
						}
					}, this);
				},
				
				/**
				 * Add in the Store a document that was added in CouchDB
				 * @private
				 */
				addDocInStore: function (id) {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_syncInfo.database+'/_design/'+_syncInfo.design+'/_view/'+_syncInfo.view
					}, function (view) {
						var json = JSON.parse(view);
						
						json.rows.some(function (value, idx) {
							if (value.id == id) {
								this.alter("splice", idx, 0, value);	
							}
						}, this);
						
					}, this);
				},
				
				/**
				 * Update the document when synchronized with a document.
				 * This differs than updating a document in a View
				 * @private
				 */
				updateDoc: function () {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_syncInfo.database+'/' + _syncInfo.document
					}, function (doc) {
						this.reset(JSON.parse(doc));			
					}, this);
			    },
			    
			    /**
			     * Delete all document's properties
			     * @private
			     */
			    deleteDoc: function () {
			    	this.reset({});			
			    },
			    
			    /**
			     * Update a document in CouchDB through a PUT request
			     * @private
			     */
			    updateDatabase: function () {
			    	_transport.request(_channel, {
	            		method: "PUT",
	            		path: '/' + _syncInfo.database + '/' + _syncInfo.document,
	            		headers: {
	            			"Content-Type": "application/json"
	            		},
	            		data: this.toJSON()
	            	});
			    },
			    
			    /**
			     * Remove a document from CouchDB through a DELETE request
			     * @private
			     */
			    removeFromDatabase: function () {
			    	_transport.request(_channel, {
	            		method: "DELETE",
	            		path: '/' + _syncInfo.database + '/' + _syncInfo.document + '?rev=' + this.get("_rev")
	            	});
			    },
			    
			    resolve: function () {
	            	  _syncPromise.resolve(this);
	             }
		},
		
		/**
		 * The state machine
		 * @private
		 * it concentrates almost the whole logic.
		 */
		_stateMachine = new StateMachine("Unsynched", {
			"Unsynched": [
			    ["getView", actions.getView, this, "Synched"],
				["getDocument", actions.getDocument, this, "Synched"]
			 ],
						
			"Synched": [
			    ["updateDatabase", actions.createDocument, this],
			    ["subscribeToViewChanges", actions.subscribeToViewChanges, this, "Listening"],
				["subscribeToDocumentChanges", actions.subscribeToDocumentChanges, this, "Listening"]
			 ],
				
			"Listening": [
			    ["entry", actions.resolve, this],
			    ["change", actions.updateDocInStore, this],
				["delete", actions.removeDocInStore, this],
				["add", actions.addDocInStore, this],
				["updateDoc", actions.updateDoc, this],
			    ["deleteDoc", actions.deleteDoc, this],
			    ["updateDatabase", actions.updateDatabase, this],
			    ["removeFromDatabase", actions.removeFromDatabase, this]
			   ]
			
		});
		
		/**
		 * Synchronize the store with a view
		 * @param {String} database the name of the database where to get...
		 * @param {String} ...design the design document, in which...
		 * @param {String} view ...the view is.
		 * @returns {Boolean}
		 */
		this.sync = function sync() {
			if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
				this.setSyncInfo(arguments[0], arguments[1], arguments[2]);
				_stateMachine.event("getView");
				return _syncPromise;
			} else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "undefined") {
				this.setSyncInfo(arguments[0], arguments[1]);
				_stateMachine.event("getDocument");
				return _syncPromise;
			}
			return false;
		};
		
		this.setSyncInfo = function setSyncInfo() {
			if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
				_syncInfo["database"] = arguments[0];
				_syncInfo["design"] = arguments[1];
				_syncInfo["view"] = arguments[2];
				return true;
			} else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "undefined") {
				_syncInfo["database"] = arguments[0];
				_syncInfo["document"] = arguments[1];
				return true;
			}
			return false;
		};
		
		this.getSyncInfo = function getSyncInfo() {
			return _syncInfo;
		};
		
		/**
		 * Update the database with the current document
		 * @returns true if update called
		 */
		this.update = function update() {
			return _stateMachine.event("updateDatabase");
		};
		
		/**
		 * Remove the document from the database
		 * @returns true if remove called
		 */
		this.remove = function remove() {
			return _stateMachine.event("removeFromDatabase");
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
		 * Get the state machine
		 * Also only useful for debugging
		 * @returns {StateMachine} the state machine
		 */
		this.getStateMachine = function getStateMachine() {
			return _stateMachine;
		};
		
		/**
		 * Get the current transport
		 * Also only useful for debugging
		 * @returns {Object} the current transport
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};
		
		/**
		 * The functions called by the stateMachine made available for testing purpose
		 * @private
		 */
		this.actions = actions;

	};
	
	return function CouchDBStoreFactory() {
		CouchDBStoreConstructor.prototype = new Store;
		return new CouchDBStoreConstructor;
	};
	
});