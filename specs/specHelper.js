/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

beforeEach(function () {
	this.addMatchers({
		toBeInstanceOf: function(expected) {
			return this.actual instanceof expected;
		}
	});
});
