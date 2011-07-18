/**
 * @class
 */
function Emily() {
    /**
     * declare a new service
     * @param {String} name the name of the service
     * @param {Function} func the service's function
     */
    this.declare = function add(name, func) {
    	this[name] = new func(this);
    };
    
    /**
     * removes a service
     * @param {String} name the name of the service
     */
    this.remove = function remove(name) {
    	delete this[name];
    };

    /**
     * loads a service
     * @param {String} name the name of the service
     */
    this.load = function load(name) {
    	
    };
    
    /**
     * reloads a service
     * @param {String} name the name of the service
     */
    this.reload = function reload(name) {
    	
    };
    
};

var Emily = new Emily; 