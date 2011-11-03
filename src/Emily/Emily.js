/**
 * @class
 * Emily is the module loader.
 * You can declare modules and require them.
 * There's a testing mode that allows modules to run in isolation.
 * A module that requires an other module will get an injected
 * one instead. 
 * Emily can also serve modules that are globally defined,
 * so they can be stubbed or mocked. 
 */
function Emily() {
	
	/**
	 * The list of modules
	 * @private
	 */
	var _modules = {},
	
	/**
	 * The list of injected modules while in isolationMode 
	 * @private
	 */
	_injected = {},
		
	/**
	 * The isolationMode boolean. While in isolationMode,
	 * only the injected modules are returned by require()
	 * @private 
	 */
	_isolationMode = false;
	
    /**
     * Declare a new module
     * @param {String} name the name of the module
     * @param {Function} func the module's constructor
     */
    this.declare = function declare(name, func) {   
    	var exports = {};
    	_modules[name] = exports;
    	func(exports, this);
    	return true;
    };
    
    /**
     * Require a module
     * @param {String} name the name of the module
     * @returns {Object} the module
     */
    this.require = function require(name) {
    	if (_isolationMode) {
    		return _injected[name];
    	} else {
    		// If the module is not declared,
    		// check if it exists in the global object
    		return _modules[name] || window[name];	
    	}
    };
    
    /**
     * Set isolationMode. In unit testing, modules can run in isolation.
     * To inject a test double, use the inject function.
     * @param {Boolean} the isolationMode value
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
     * Inject a test double
     * @param {String} name the name of the module to double
     * @param {Object} obj the test double
     */
    this.inject = function inject(name, obj) {
    	_injected[name] = obj;
    };
    
    
};

var Emily = new Emily; 