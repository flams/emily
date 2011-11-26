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
	 * The list of modules' constructors
	 * @private
	 */
	var _constructors = {},
	_modules = {},
	
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
     * @param {String} inherits - optional the name of the module to inherit from
     * @param {Function} func the module's constructor
     * @returns the module's constructor
     */
    this.declare = function declare(name) {   
    	var func;
    	
    	if (typeof arguments[1] == "string" && typeof arguments[2] == "function") {
    		func = arguments[2];
    		func.prototype = new _constructors[arguments[1]](this);
    	} else if (typeof arguments[1] == "function"){
    		func = arguments[1];
    	} else {
    		return false;
    	}
    	
    	_modules[name] = new func(this);
    	return _constructors[name] = func;
    };
    
    /**
     * Require a module
     * @param {String} name the name of the module
     * @returns {Object} the module's constructor
     */
    this.require = function require(name) {
		return _isolationMode && _injected[name] || _modules[name] || this.require("Tools").getGlobal()[name];
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

var Emily = new Emily();