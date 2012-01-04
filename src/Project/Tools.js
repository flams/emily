define("Tools",
/**
 * @class
 * Tools is a collection of tools 
 */
function Tools (){

	return {
	    /**
	     * For applications that don't run in a browser, window is not the global object.
	     * This function returns the global object wherever the application runs.
	     * @returns {Object} the global object
	     */
		getGlobal: function getGlobal() {
	    	var func = function() {
	    		return this;
	    	};
	    	return func.call(null);
	    },
		
		/**
		 * Mixes an object into another
		 * @param {Object} destination object to mix values into
		 * @param {Object} source object to get values from
		 * @param {Boolean} optional, set to true to prevent overriding
		 */
	    mixin: function mixin(source, destination, dontOverride) {
			this.loop(source, function (value, idx) {
				if (!destination[idx] || !dontOverride) {
					destination[idx] = source[idx];	
				}
			});
		},
		
		/**
		 * Count the number of properties in an object
		 * It doesn't look up in the prototype chain
		 * @param {Object} object the object to count
		 * @returns {Number}
		 */
		count: function count(object) {
			var nbItems = 0,
				v;
			
			for (v in object) {
				if (object.hasOwnProperty(v)) {
					nbItems++;
				}
			}
			
			return nbItems;
		},
		
		/**
		 * Compares the properties of two objects and returns true if they're the same
		 * It's doesn't do it recursively
		 * @param {Object} first object
		 * @param {Object} second object
		 * @returns {Boolean} true if the two objets have the same properties
		 */
		compareObjects: function compareObjects(object1, object2) {
			var getOwnProperties = function (object) {
				return Object.getOwnPropertyNames(object).sort().join("");
			};
			return getOwnProperties(object1) == getOwnProperties(object2);
		},
		
		/**
		 * Transform array-like objects to array, such as nodeLists or arguments
		 * @param {Array-like object}
		 * @returns {Array}
		 */
		toArray: function toArray(array) {
			return Array.prototype.slice.call(array);
		},
		
		/**
		 * Small adapter for looping over objects and arrays
		 * @param {Array/Object} iterated the array or object to loop through
		 * @param {Function} callback the function to execute for each iteration
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns {Boolean} true if executed
		 */
		loop: function loop(iterated, callback, scope) {
			if (iterated instanceof Object && typeof callback == "function") {
				var i;
				if (iterated instanceof Array) {
					iterated.forEach(callback, scope);
				} else {
					for (i in iterated) {
						if (iterated.hasOwnProperty(i)) {
							callback.call(scope, iterated[i], i, iterated);
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},
		
		objectsDiffs : function objectsDiffs(before, after) {
			if (before instanceof Object && after instanceof Object) {
				var unchanged = [],
					updated = [],
					deleted = [],
					added = [];
				
				 // Look for the unchanged values
				 this.loop(after, function (value, idx) {
					 if (value !== before[idx] && typeof before[idx] != "undefined") {
						 updated.push(idx);
					 } else if (value === before[idx]) {
						 unchanged.push(idx);
					 } else if (typeof before[idx] == "undefined") {
						 added.push(idx);
					 }
				 });
				 
				 // Look for the deleted
				 this.loop(before, function (value, idx) {
					if (typeof after[idx] == "undefined") {
						deleted.push(idx);
					} 
				 });
				 
				return {
					updated: updated,
					unchanged: unchanged,
					added: added,
					deleted: deleted
				};
				
			} else {
				return false;
			}
		},
		
		/**
		 * Transforms Arrays and Objects into valid JSON
		 * @param {Object/Array} object the object to JSONify 
		 * @returns the JSONified object or false if failed
		 */
		jsonify: function jsonify(object) {
			if (object instanceof Object) {
				return JSON.parse(JSON.stringify(object));	
			} else {
				return false;
			}
		}
		
	};
	
	
});
		