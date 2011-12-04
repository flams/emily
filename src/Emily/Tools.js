Emily.declare("Tools",
/**
 * @class
 * Tools is a collection of tools 
 */
 function Tools() {
	
    /**
     * For applications that don't run in a browser, window is not the global object.
     * This function returns the global object wherever the application runs.
     * @returns {Object} the global object
     */
	this.getGlobal = function getGlobal() {
    	var func = function() {
    		return this;
    	};
    	return func.call(null);
    };
	
	/**
	 * Mixes an object into another
	 * @param {Object} destination object to mix values into
	 * @param {Object} source object to get values from
	 * @param {Boolean} optional, set to true to prevent overriding
	 */
    this.mixin = function mixin(source, destination, dontOverride) {
		var value;
		for (value in source) {
			if (source.hasOwnProperty(value)) {
				if (!destination[value] || !dontOverride) {
					destination[value] = source[value];	
				}
			}
		}
	};
	
	/**
	 * Count the number of properties in an object
	 * It doesn't look up in the prototype chain
	 * @param {Object} object the object to count
	 * @returns {Number}
	 */
	this.count = function count(object) {
		var nbItems = 0,
			v;
		
		for (v in object) {
			if (object.hasOwnProperty(v)) {
				nbItems++;
			}
		}
		
		return nbItems;
	};
	
	/**
	 * Compares the properties of two objects and returns true if they're the same
	 * It's doesn't do it recursively
	 * @param {Object} first object
	 * @param {Object} second object
	 * @returns {Boolean} true if the two objets have the same properties
	 */
	this.compareObjects = function compareObjects(object1, object2) {
		var getOwnProperties = function (object) {
			return Object.getOwnPropertyNames(object).sort().join("");
		};
		return getOwnProperties(object1) == getOwnProperties(object2);
	};
	
	/**
	 * Transform array-like objects to array, such as nodeLists or arguments
	 * @param {Array-like object}
	 * @returns {Array}
	 */
	this.toArray = function toArray(array) {
		return Array.prototype.slice.call(array);
	};
	
});
		