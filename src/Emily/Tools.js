Emily.declare("Tools",
/**
 * @class
 * Tools is a collection of tools 
 */
 function Tools(exports) {
	
	exports.mixin = 
	/**
	 * Mixes an object into another
	 * @param {Object} destination object to mix values into
	 * @param {Object} source object to get values from
	 * @param {Boolean} optional, set to true to prevent overriding
	 */
	function mixin(source, destination, dontOverride) {
		var value;
		for (value in source) {
			if (source.hasOwnProperty(value)) {
				if (!destination[value] || !dontOverride) {
					destination[value] = source[value];	
				}
			}
		}
	};
	
	exports.count = 
	/**
	 * Count the number of properties in an object
	 * It doesn't look up in the prototype chain
	 * @param {Object} object the object to count
	 * @returns {Number}
	 */
	function count(object) {
		var nbItems = 0,
			v;
		
		for (v in object) {
			if (object.hasOwnProperty(v)) {
				nbItems++;
			}
		}
		
		return nbItems;
	};
	
});
		