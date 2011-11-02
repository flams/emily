/**
 * @class
 */
function Emily() {
	
	/**
	 * The list of services
	 * @private
	 */
	var _services = {},
		_injected = {},
		_isolationMode = false;
	
    /**
     * Declare a new service
     * @param {String} name the name of the service
     * @param {Function} func the service's function
     */
    this.declare = function declare(name, func) {   	
    	_services[name] = new func(this);
    	return true;
    };
    
    /**
     * Require a service
     * @param {String} name the name of the service
     * @returns {Object} the service
     */
    this.require = function require(name) {
    	if (_isolationMode) {
    		return _injected[name];
    	} else {
    		return _services[name] || window[name];	
    	}
    };
    
    /**
     * Switch to unit testing. In unit testing, services run in isolation.
     * To stubb a service, use the inject function
     * @param value
     */
    this.setIsolationMode = function setIsolationMode(value) {
    	_isolationMode = value;
    };
    
    /**
     * Know the unit testing mode value
     * @returns {Boolean}
     */
    this.getIsolationMode = function getIsolationMode() {
    	return _isolationMode;
    };
    
    /**
     * Inject a stubbed service
     * @param {String} name the name of the service to stubb
     * @param {Object} obj the stubbed service
     */
    this.inject = function inject(name, obj) {
    	_injected[name] = obj;
    };
    
    
};

var Emily = new Emily; 