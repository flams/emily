define("CouchDB", function () {

	var _adapter = null,
		_databases = {};
	
	return {
		useAdapter: function useAdapter(adapter) {
			_adapter = adapter;
			return true;
		},
		
		getAdapter: function getAdapter() {
			return _adapter;
		},
		
		getAll: function getAll(callback) {
			_adapter.get("_all_dbs", callback);
		},
		
		getLoaded: function getLoaded() {
			return _databases;
		},
		
		get: function get(name, callback) {
			if (_databases[name]) {
				callback && callback(_databases[name]);
			} else {
				_adapter.get(name, function (data) {
					_databases[name] = data;
					callback && callback(data);
				});
			}

		},
		
		add: function add(name, callback) {
			_adapter.put(name, callback);
		},
		
		del: function del(name, callback) {
			_adapter.del(name, callback);
		}
	};
	
});