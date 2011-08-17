/**
 * @class
 */
function Emily() {
	
	/**
	 * The list of services
	 * @private
	 */
	var _services = {};
	
    /**
     * declare a new service
     * @param {String} name the name of the service
     * @param {Function} func the service's function
     */
    this.declare = function declare(name, func) {
    	_services[name] = new func(this);
    	return true;
    };
    
    this.require = function require(name) {
    	return _services[name];
    };
    
    
    
};

var Emily = new Emily; 