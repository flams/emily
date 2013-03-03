/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

var __Global = this;

define(["Observable", "Tools", "Transport", "Store", "StateMachine", "Promise"],

function(Observable, Tools, Transport, Store, StateMachine, Promise) {


	describe("Observable implements the Observer design pattern, also called publish subscribe", function () {

		it("has a watch function for adding a listener", function () {
			var observable = new Observable();

			var handle = observable.watch("topic", function listener() {
				// action to execute when something is published on the topic
			}, this);
		});

		it("has a notify function for publishing something on a topic", function () {
			var observable = new Observable(),
				message;

			observable.watch("topic", function listener(something) {
				message = something;
			});

			observable.notify("topic", "hello");

			expect(message).toBe("hello");
		});

		it("notifies several listeners in the order they were added", function () {
			var observable = new Observable(),
				order = [];

			observable.watch("topic", function listener1() {  order.push(1); });
			observable.watch("topic", function listener2() {  order.push(2); });
			observable.watch("topic", function listener3() {  order.push(3); });

			observable.notify("topic");

			expect(order[0]).toBe(1);
			expect(order[1]).toBe(2);
			expect(order[2]).toBe(3);
		});

		it("should continue publishing on all the listeners even if one of them fails", function () {
			var observable = new Observable(),
				order = [];

			observable.watch("topic", function listener1() {  order.push(1); });
			observable.watch("topic", function listener2() {  throw new Error("this listener fails"); });
			observable.watch("topic", function listener3() {  order.push(3); });

			observable.notify("topic");

			expect(order[0]).toBe(1);
			expect(order[1]).toBe(3);
		});

		it("can bind the this object of a listener to a given object and pass multiple things on the topic", function () {
			var observable = new Observable(),
				message1,
				message2,
				message3,
				context;

			observable.watch("topic", function listener(something1, something2, something3) {
				message1 = something1;
				message2 = something2;
				message3 = something3;
				context = this;
			}, this);

			observable.notify("topic", "hello", "this is", "emily");

			expect(message1).toBe("hello");
			expect(message2).toBe("this is");
			expect(message3).toBe("emily");
			expect(context).toBe(this);
		});

		it("can remove a listener on a topic", function () {
			var observable = new Observable(),
				removed = true;

			var handle = observable.watch("topic", function listener(something) {
				removed = false;
			});

			// Remove the listener so it doesn't get called anymore
			observable.unwatch(handle);

			observable.notify("topic");

			expect(removed).toBe(true);
		});

		it("can remove all listeners on a given topic", function () {
			var observable = new Observable(),
				topics = [];

			observable.watch("topic1", function listener1() { topics.push("topic1"); });
			observable.watch("topic1", function listener2() { topics.push("topic1"); });
			observable.watch("topic2", function listener3() { topics.push("topic2"); });

			observable.unwatchAll("topic1");

			observable.notify("topic1");
			observable.notify("topic2");

			expect(topics.length).toBe(1);
			expect(topics[0]).toBe("topic2");
		});

		it("can remove all listeners", function () {
			var observable = new Observable(),
				topics = [];

			observable.watch("topic1", function listener1() { topics.push("topic1"); });
			observable.watch("topic1", function listener2() { topics.push("topic1"); });
			observable.watch("topic2", function listener3() { topics.push("topic2"); });

			observable.unwatchAll();

			observable.notify("topic1");
			observable.notify("topic2");

			expect(topics.length).toBe(0);
		});

	});

	describe("Tools is a set of tools commonly used in JavaScript applications", function () {

		describe("Tools.getGlobal can retrieve the global object", function () {

			it("returns the global object", function () {
				expect(Tools.getGlobal()).toBe(__Global);
			});
		});

		describe("Tools.mixin can add an object's properties to another object", function () {

			it("takes the properties of the second object to mix them into the first one", function () {
				var source = {c: 30, d: 40},
					destination = {a: 10, b: 20};

				Tools.mixin(source, destination);

				expect(destination.a).toBe(10);
				expect(destination.b).toBe(20);
				expect(destination.c).toBe(30);
				expect(destination.d).toBe(40);
			});

			it("overrides the destination's values with the source ones by default", function () {
				var source = {c: 30, d: 40},
					destination = {a: 10, b: 20, c: 25};

				Tools.mixin(source, destination);

				// The destination's c has been replaced by the source's one
				expect(destination.c).toBe(30);
			});

			it("can prevent the desitnation's values to be replaced", function () {
				var source = {c: 30, d: 40},
					destination = {a: 10, b: 20, c: 25};

				Tools.mixin(source, destination, true);

				// The destination's c has been replaced by the source's one
				expect(destination.c).toBe(25);
			});

			it("also returns the destination object", function () {
				var source = {c: 30, d: 40},
					destination = {a: 10, b: 20, c: 25};

				expect(Tools.mixin(source, destination, true)).toBe(destination);
			});
		});

		describe("Tools.count tells how many own properties an Object has", function () {

			it("only counts own properties", function () {
				var object = {a: 10, b: 20};

				expect(Tools.count(object)).toBe(2);
			});

		});

		describe("Tools.compareObject tells if two objects have the same properties, useful for duck typing", function () {

			it("tells if two objects have the same properties", function () {
				var o1 = {a: 1, c:3, b:4, x:10},
					o2 = {a: 2, b:52, c:4, x:100},
					o3 = {a: 5, b: 3, x: 50};

				expect(Tools.compareObjects(o1, o2)).toBe(true);
				expect(Tools.compareObjects(o2, o3)).toBe(false);
			});

		});

		describe("Tools.compareNumbers is useful for telling if a number if greater, equal or lower than another one", function () {

			it("tells if a number is greater than another one", function () {
				expect(Tools.compareNumbers(2.3, 2.2)).toBe(1);
			});

			it("tells if a number equals another one", function () {
				expect(Tools.compareNumbers(2.2, 2.2)).toBe(0);
			});

			it("tells if a number is lower than another one", function () {
				expect(Tools.compareNumbers(2.1, 2.2)).toBe(-1);
			});

			it("can ASC sort numbers when using Array.sort", function () {
				var array = [0, 2, 9, 4, 1, 7, 3, 12, 11, 5, 6, 8, 10];

				array.sort(Tools.compareNumbers);

				expect(array[10]).toBe(10);
				expect(array[11]).toBe(11);
			});

		});

		describe("Tools.toArray transforms an array like object, like arguments or a nodeList to an actual array", function () {

			it("transforms a list of arguments to an array", function () {
				(function () {
					var args = Tools.toArray(arguments);

					expect(Array.isArray(args)).toBe(true);

				})();
			});

			it("transforms a nodelist into an array", function () {
				if (__Global.document) {
					var all = document.querySelectorAll("*");

					expect(Array.isArray(all)).toBe(true);
				}
			});
		});

		describe("Tools.loop abstracts the difference between iterating over an object and an array", function () {

			it("can iterate over an array", function () {
				var array = [0, 1, 2, 3];

				var _self = this;

				Tools.loop(array, function (value, index, iterated) {
					expect(iterated).toBe(array);
					expect(array[index]).toBe(value);
					// The context in which to run this function can also be given
					expect(this).toBe(_self);
				}, this);
			});

			it("can iterate over an array which length varies", function () {
				var iterated = [1],
					nbOfCalls = 0;

				Tools.loop(iterated, function (value) {
					if (nbOfCalls < 10) {
						iterated.push(1);
						nbOfCalls++;
					}
				});

				expect(iterated.length).toBe(11);
			});

			it("can iterate over an object", function () {
				var object = {a: 10, b: 20};

				Tools.loop(object, function (value, key, obj) {
					expect(object).toBe(obj);
					expect(object[key]).toBe(value);
				});
			});
		});

		describe("Tools.objectsDiffs returns an object describing the differences between two objects", function () {

		});

	});



});
