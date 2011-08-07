Emily.declare("TinyStore", /** @class */function TinyStore(API) {
	
	/**
	 * @returns a new DataStore
	 */
	this.create = function create(values) {
		return new _TinyStore(values);
	};
    
	/**
	 * 
	 * @param values
	 * @returns
	 */
	function _TinyStore(values) {
		
		var _data = {}, 
			mixin = function mixin(values) {
				for (var i in values) {
					if (values.hasOwnProperty(i)) {
						this.length++;
						_data[i] = values[i];
					}
				}
			},
			_observable = API.require("Observable").create();
			
		
		
		this.length = 0;
		mixin.call(this, values);
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.get = function get(name) {
			return _data[name];
		};
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.has = function has(name) {
			return _data.hasOwnProperty(name);
		};
		
		/**
		 * 
		 * @param name
		 * @param value
		 * @returns
		 */
		this.set = function set(name, value) {
			var oldValue;
			if (typeof name == "string") {
				oldValue = _data[name];
				_data[name] = value;
				if (!oldValue) {
					this.length++;
				}
				_observable.notify(name, value, oldValue);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		this.del = function del(name) {
			if (this.has(name)) {
				this.length--;
				delete _data[name];
				_observable.notify(name, _data[name]);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * 
		 * @param name
		 * @param func
		 * @returns
		 */
		this.watch = function watch(name, func, scope) {
			return _observable.watch(name, func, scope);
		};
		
		/**
		 * 
		 * @param handler
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _observable.unwatch(handler);
		};
		
	}
});