/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

var __Global = this;

require(["Tools"], function (Tools) {

	describe("ToolsTestGetGlobal", function () {

		it("should get global object", function () {
			expect(Tools.getGlobal).toBeInstanceOf(Function);
			expect(Tools.getGlobal()).toBe(__Global);
		});

	});

	describe("ToolsTestMixin", function () {

		var source = {},
			destination = {};

		beforeEach(function () {
			destination = {a: 10, b: 20};
			source = function () { this.b=30; this.c=40;};
			source.prototype.d = 50;
			source = new source();
		});

		it("should be a function", function () {
			expect(Tools.mixin).toBeInstanceOf(Function);
		});

		it("should mix source into destination", function () {
			Tools.mixin(source, destination);
			expect(source.b).toBe(destination.b);
			expect(destination.b).toBe(30);
			expect(source.c).toBe(destination.c);
		});

		it("should mix source into destination without overriding", function () {
			Tools.mixin(source, destination, true);
			expect(source.b).not.toBe(destination.b);
			expect(destination.b).toBe(20);
			expect(source.c).toBe(destination.c);
		});

		it("should'nt mix in values from the proto chain", function () {
			Tools.mixin(source, destination);
			expect(destination.d).toBeUndefined();
		});

		it("should also return the destination", function () {
			expect(Tools.mixin(source, destination)).toBe(destination);
		});
	});

	describe("ToolsTestCount", function () {

		var object = function () { this.a=10; this.b=20;};
			object.prototype.c = 30;
			object = new object();

		it("should be a function", function () {
			expect(Tools.count).toBeInstanceOf(Function);
		});

		it("should count the number of items", function () {
			expect(Tools.count(object)).toBe(2);
		});

	});

	describe("ToolsTestCompareObjects", function () {
		var o1 = {a: 1, c:3, b:4, x:10},
			o2 = {a: 2, b:52, c:4, x:100},
			o3 = {a: 5, b: 3, x: 50};

		it("should be a function", function () {
			expect(Tools.compareObjects).toBeInstanceOf(Function);
		});

		it("should return true if objects have the same own properties", function () {
			expect(Tools.compareObjects(o1, o2)).toBe(true);
			expect(Tools.compareObjects(o2, o3)).toBe(false);
		});
	});

	describe("ToolsTestCompareNumbers", function () {

		it("should return 1 if first number is greater than the second", function () {
			expect(Tools.compareNumbers(100, 10)).toBe(1);
			expect(Tools.compareNumbers(2.3, 2.2)).toBe(1);
			expect(Tools.compareNumbers(1, -1)).toBe(1);
		});

		it("should return -1 if first number is lower than the second", function () {
			expect(Tools.compareNumbers(0, 1)).toBe(-1);
			expect(Tools.compareNumbers(2.3,2.35)).toBe(-1);
			expect(Tools.compareNumbers(-1, -0.9)).toBe(-1);
		});

		it("should return 0 if they're the same", function () {
			expect(Tools.compareNumbers(0,0)).toBe(0);
			expect(Tools.compareNumbers(-1, -1)).toBe(0);
			expect(Tools.compareNumbers(2.3, 2.3)).toBe(0);
		});

	});

	describe("ToolsTestToArray", function () {

		it("should be a function", function () {
			expect(Tools.toArray).toBeInstanceOf(Function);
		});

		if (__Global.document) {
			it("should transform nodes lists to an array if running in browser", function () {
				var ul = document.createElement("ul"),
				nodeList = ul.querySelectorAll("ul"),
				array = null;


				ul.innerHTML = "<li>hel</li><li>lo</li>";

				expect(nodeList).toBeInstanceOf(NodeList);
				array = Tools.toArray(nodeList);
				expect(array).toBeInstanceOf(Array);
				expect(nodeList[0]).toBe(array[0]);
				expect(nodeList[1]).toBe(array[1]);
			});
		}

		it("should transform arguments to an array", function () {
			var args = (function (a,b) {return arguments;})(1,2),
				array = Tools.toArray(args);
			expect(array).toBeInstanceOf(Array);
			expect(args[0]).toBe(array[0]);
			expect(args[1]).toBe(array[1]);
		});

	});

	describe("ToolsTestLoop", function () {

		var object = {
				a: 2,
				e: 15,
				b: 0,
				c: 1,
				d: 2
			},
			array = [2,0,1,2];


		it("should be a function", function () {
			expect(Tools.loop).toBeInstanceOf(Function);
		});

		it("should execute only with correct parameters", function () {
			expect(Tools.loop()).toBe(false);
			expect(Tools.loop("")).toBe(false);
			expect(Tools.loop(null)).toBe(false);
			expect(Tools.loop({}), "").toBe(false);
			expect(Tools.loop([], [])).toBe(false);
			expect(Tools.loop([], function(){})).toBe(true);
		});

		it("should iterate through arrays", function () {
			var spy = jasmine.createSpy();
			expect(Tools.loop(array, spy)).toBe(true);
			expect(spy.calls[0].args[0]).toBe(2);
			expect(spy.calls[0].args[1]).toBe(0);

			expect(spy.calls[1].args[0]).toBe(0);
			expect(spy.calls[1].args[1]).toBe(1);

			expect(spy.calls[2].args[0]).toBe(1);
			expect(spy.calls[2].args[1]).toBe(2);

			expect(spy.calls[3].args[0]).toBe(2);
			expect(spy.calls[3].args[1]).toBe(3);

			expect(spy.mostRecentCall.args[2]).toBe(array);
		});

		it("should iterate through arrays in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};

			Tools.loop(array, spy, thisObj);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});

		it("should iterate through objects", function () {
			var spy = jasmine.createSpy();
			expect(Tools.loop(object, spy)).toBe(true);
			expect(spy.callCount).toBe(5);
			spy.calls.forEach(function (value, idx, call) {
				expect(object[call[idx].args[1]]).toBe(call[idx].args[0]);
			});
			expect(spy.mostRecentCall.args[2]).toBe(object);
		});

		it("should iterate through objects in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};

			Tools.loop(object, spy, thisObj);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});

		it("shouldn't loop on values that are deleted on the fly", function () {
			Tools.loop(array, function (val, key) {
				if (key === 0) {
					array.splice(key, 1);
				}
				expect(typeof val != "undefined" && key != 3).toBe(true);
			});
		});
	});

	describe("ToolsTestObjectDiff", function () {

		it("should be a function", function () {
			expect(Tools.objectsDiffs).toBeInstanceOf(Function);
		});

		it("should take two objects as parameters", function () {
			expect(Tools.objectsDiffs("")).toBe(false);
			expect(Tools.objectsDiffs([], "")).toBe(false);
			expect(Tools.objectsDiffs("", {})).toBe(false);
			expect(Tools.objectsDiffs({}, [])).toBeTruthy();
		});

		it("should return an object with changed/deleted info", function () {
			var result = Tools.objectsDiffs({}, {});
			expect(result).toBeInstanceOf(Object);
			expect(result.updated).toBeInstanceOf(Array);
			expect(result.unchanged).toBeInstanceOf(Array);
			expect(result.added).toBeInstanceOf(Array);
			expect(result.deleted).toBeInstanceOf(Array);
		});

		describe("ToolsTestDiffWithArray", function () {
			var initialArray = ["a", "b", "c", "d"],
				finalArray = ["a", "d", "e"];

			it("should return items that have changed or have been deleted", function () {
				var result = Tools.objectsDiffs(initialArray, finalArray);
				expect(result.updated.length).toBe(2);
				expect(result.unchanged.length).toBe(1);
				expect(result.added.length).toBe(0);
				expect(result.deleted.length).toBe(1);
				expect(result.updated.sort().join("")).toBe([1, 2].sort().join(""));
				expect(result.unchanged[0]).toBe(0);
				expect(result.deleted[0]).toBe(3);
			});

			it("shouldn't have the same result if arrays are swapped", function () {
				var result = Tools.objectsDiffs(finalArray, initialArray);
				expect(result.added.length).toBe(1);
				expect(result.added[0]).toBe(3);
			});
		});

		describe("ToolsTestDiffWithObjects", function () {
			var initialObject = {a: 10, b: 20, c: 30},
				finalObject = {a:10, c: 40, d: 50};

			it("should return items that have changed or have been deleted", function () {
				var result = Tools.objectsDiffs(initialObject, finalObject);
				expect(result.updated.length).toBe(1);
				expect(result.updated[0]).toBe("c");
				expect(result.unchanged.length).toBe(1);
				expect(result.unchanged[0]).toBe("a");
				expect(result.deleted.length).toBe(1);
				expect(result.deleted[0]).toBe("b");
				expect(result.added.length).toBe(1);
				expect(result.added[0]).toBe("d");
			});
		});

	});

	describe("ToolsTestJsonify", function () {

		var func = function () {
				this.a = 1;
				this.b = function () {};
				this.e = null;
			},
			object = null,
			array = [1, 3];

		func.prototype.c = 3;
		object = new func();

		it("should be a function", function () {
			expect(Tools.jsonify).toBeInstanceOf(Function);
		});

		it("should return valid JSON", function () {
			var result = Tools.jsonify(object);
			expect(result).toBeInstanceOf(Object);
			expect(result.a).toBe(1);
			expect(result.b).toBeUndefined();
			expect(result.c).toBeUndefined();
			expect(result.d).toBeUndefined();
		});

		it("should return a copy of the array", function () {
			var result = Tools.jsonify(array);
			expect(result).toBeInstanceOf(Array);
			expect(result).not.toBe(array);
			expect(result.length).toBe(2);
			expect(result[0]).toBe(1);
			expect(result[1]).toBe(3);
		});

		it("should return false if not an object", function () {
			expect(Tools.jsonify("")).toBe(false);
		});

	});

	describe("ToolsTestClone", function () {

		it("should be a function", function () {
			expect(Tools.clone).toBeInstanceOf(Function);
		});

		it("should make a copy of objects", function () {
			var object = {a:10, b:20},
				clone = Tools.clone(object);

			expect(Tools.count(clone)).toBe(Tools.count(object));
			Tools.loop(clone, function (value, idx) {
				expect(clone[idx]).toBe(object[idx]);
			});
			expect(clone).not.toBe(object);
		});

		it("should make a copy of arrays", function () {
			var array  = [1, 2, 3],
				copy = Tools.clone(array);

			expect(copy.length).toBe(array.length);
			copy.forEach(function (value, idx) {
				expect(copy[idx]).toBe(array[idx]);
			});
			expect(copy).not.toBe(array);
		});

		it("should return the rest", function () {
			var func = function () {},
				regExp = /o/;

			expect(Tools.clone("yes")).toBe(false);
			expect(Tools.clone(null)).toBe(false);
			expect(Tools.clone(func)).toBe(false);
			expect(Tools.clone(regExp)).toBe(false);

		});
	});

	describe("ToolsGetNestedProperty", function () {

		var a = {b:{c:{d:{e:1}}}},
			b = [{c:{d:10}}];

		it("should be a function", function () {
			expect(Tools.getNestedProperty).toBeInstanceOf(Function);
		});

		it("should return the property value", function () {

			expect(Tools.getNestedProperty()).toBeUndefined();
			expect(Tools.getNestedProperty("")).toBe("");
			expect(Tools.getNestedProperty("a.b.c.d.e")).toBe("a.b.c.d.e");
			expect(Tools.getNestedProperty(true)).toBe(true);
			expect(Tools.getNestedProperty(null)).toBe(null);
			expect(Tools.getNestedProperty(a)).toBe(a);
			expect(Tools.getNestedProperty(a.b)).toBe(a.b);
			expect(Tools.getNestedProperty(a.b, "")).toBe(a.b);
			expect(Tools.getNestedProperty(a, "b.c")).toBe(a.b.c);
			expect(Tools.getNestedProperty(a, "b.c.d.e")).toBe(1);
			expect(Tools.getNestedProperty(a, "b")).toBe(a.b);
			expect(Tools.getNestedProperty(a, "b.e")).toBeUndefined();
		});

		it("should get the property through an array too", function () {
			expect(Tools.getNestedProperty(b, "0.c.d")).toBe(10);
		});

		it("should work with numbers as property", function () {
			expect(Tools.getNestedProperty(b, 0)).toBe(b[0]);
		});

		it("should return undefined if nested property doesn't exist", function () {
			expect(Tools.getNestedProperty(a, "z.x.y")).toBeUndefined();
		});

	});

	describe("ToolsSetNestedProperty", function () {

		var a = {b:{c:{d:{e:1}}}},
			b = [{c:{d:10}}];

		it("should be a function", function () {
			expect(Tools.setNestedProperty).toBeInstanceOf(Function);
		});

		it("should set the property value", function () {
			var obj = {};
			expect(Tools.setNestedProperty()).toBeUndefined();
			expect(Tools.setNestedProperty("")).toBe("");
			expect(Tools.setNestedProperty(true)).toBe(true);
			expect(Tools.setNestedProperty(null)).toBe(null);
			expect(Tools.setNestedProperty(a)).toBe(a);
			expect(Tools.setNestedProperty(a, "b.c.d.e", 2)).toBe(2);
			expect(a.b.c.d.e).toBe(2);
			expect(Tools.setNestedProperty(a, "b.c", obj)).toBe(obj);
			expect(a.b.c).toBe(obj);
			expect(Tools.setNestedProperty(a, "b", obj)).toBe(obj);
			expect(a.b).toBe(obj);
		});

		it("should set the property through an array too", function () {
			expect(Tools.setNestedProperty(b, "0.c.d", 20)).toBe(20);
			expect(b[0].c.d).toBe(20);
		});

		it("should work with numbers as property", function () {
			expect(Tools.setNestedProperty(b, 0, 20)).toBe(20);
			expect(b[0]).toBe(20);
		});

		it("should force set if nested property doesn't exist", function () {
			expect(Tools.setNestedProperty(a, "z.x.y", 10)).toBe(10);
			expect(a.z.x.y).toBe(10);
		});
	});

	describe("Closest", function () {

		var array = [10, 15, 0, 20, 5];

		it("should be a function", function () {
			expect(Tools.closest).toBeInstanceOf(Function);
		});

		it("should return the closest item in an array", function () {
			expect(Tools.closest()).toBeUndefined();
			expect(Tools.closest(0)).toBeUndefined();
			expect(Tools.closest(0, array)).toBe(2);
			expect(Tools.closest(2, array)).toBe(2);
			expect(Tools.closest(3, array)).toBe(4);
			expect(Tools.closest(2.5, array)).toBe(2);
			expect(Tools.closest(9, array)).toBe(0);
			expect(Tools.closest(10, array)).toBe(0);
			expect(Tools.closest(15.5, array)).toBe(1);
			expect(Tools.closest(20, array)).toBe(3);
		});

	});

	describe("ClosestGreater", function () {

		var array = [10, 15, 1, 20, 5];

		it("should be a function", function () {
			expect(Tools.closestGreater).toBeInstanceOf(Function);
		});

		it("should return the closest greater or equal item in an array", function () {
			expect(Tools.closestGreater()).toBeUndefined();
			expect(Tools.closestGreater(0)).toBeUndefined();
			expect(Tools.closestGreater(0, array)).toBe(2);
			expect(Tools.closestGreater(2, array)).toBe(4);
			expect(Tools.closestGreater(3, array)).toBe(4);
			expect(Tools.closestGreater(2.5, array)).toBe(4);
			expect(Tools.closestGreater(9, array)).toBe(0);
			expect(Tools.closestGreater(10, array)).toBe(0);
			expect(Tools.closestGreater(15.5, array)).toBe(3);
			expect(Tools.closestGreater(20, array)).toBe(3);
		});

	});

	describe("ClosestLower", function () {

		var array = [10, 15, 0, 20, 5];

		it("should be a function", function () {
			expect(Tools.closestLower).toBeInstanceOf(Function);
		});

		it("should return the closest lower or equal item in an array", function () {
			expect(Tools.closestLower()).toBeUndefined();
			expect(Tools.closestLower(0)).toBeUndefined();
			expect(Tools.closestLower(0, array)).toBe(2);
			expect(Tools.closestLower(4, array)).toBe(2);
			expect(Tools.closestLower(9, array)).toBe(4);
			expect(Tools.closestLower(10, array)).toBe(0);
			expect(Tools.closestLower(14, array)).toBe(0);
			expect(Tools.closestLower(15.5, array)).toBe(1);
			expect(Tools.closestLower(20, array)).toBe(3);
		});

	});

});
