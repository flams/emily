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

			it("tells what was added in an array", function () {
				var array1 = ["a", "b", "c"],
					array2 = ["a", "b", "c", "d", "e"];

				var diff = Tools.objectsDiffs(array1, array2);
				// The third item of array2 was added
				expect(diff.added[0]).toBe(3);
				// The fourth item too
				expect(diff.added[1]).toBe(4);
			});

			it("tells what was removed", function () {
				var array1 = ["a", "b", "c"],
					array2 = ["a", "b"];

				var diff = Tools.objectsDiffs(array1, array2);
				// The third item of array2 was deleted
				expect(diff.deleted[0]).toBe(2);
			});

			it("tells what was updated", function () {
				var array1 = ["a", "b", "c"],
					array2 = ["a", "d", "e"];

				var diff = Tools.objectsDiffs(array1, array2);
				// The second item of array2 was updated
				expect(diff.updated[0]).toBe(1);
				// The third one too
				expect(diff.updated[1]).toBe(2);
			});

			it("tells what remains unchanged", function () {
				var array1 = ["a", "b", "c"],
					array2 = ["a", "d", "e"];

				var diff = Tools.objectsDiffs(array1, array2);
				// The first item remains unchanged
				expect(diff.unchanged[0]).toBe(0);
			});

			it("also works with objects", function () {
				var object1 = { a: 10, b: 20, c: 30},
					object2 = { b: 30, c: 30, d: 40};

				var diff = Tools.objectsDiffs(object1, object2);

				expect(diff.deleted[0]).toBe("a");
				expect(diff.updated[0]).toBe("b");
				expect(diff.unchanged[0]).toBe("c");
				expect(diff.added[0]).toBe("d");
			});

		});

		describe("Tools.jsonify returns the jsonified version of an object", function () {

			it("returns a new object without the properties that can't be saved in a stringified json", function () {
				var nonJsonObject = {
					a: function () {},
					b: undefined,
					c:["emily"]
				};

				var jsonified = Tools.jsonify(nonJsonObject);

				expect(Tools.count(jsonified)).toBe(1);
				expect(jsonified.c[0]).toBe("emily");
				expect(jsonified.c).not.toBe(nonJsonObject.c);
			});

		});

		describe("Tools.setNestedProperty sets the property of an object nested in one or more objects", function () {

			it("sets the property of an object deeply nested and creates the missing ones", function () {
				var object = {};

				Tools.setNestedProperty(object, "a.b.c.d.e.f", "emily");

				expect(object.a.b.c.d.e.f).toBe("emily");
			});

			it("returns the value if the first parameter is not an object", function () {
				expect(Tools.setNestedProperty("emily")).toBe("emily");
			});

			it("also works if there are arrays in the path, but it doesn't create an array", function () {
				var object = {};

				Tools.setNestedProperty(object, "a.b.c.0.d", "emily");

				expect(object.a.b.c[0].d).toBe("emily");
				expect(Array.isArray(object.a.b.c)).toBe(false);
			});

		});

		describe("Tools.getNestedProperty gets the property of an object nested in other objects", function () {

			it("gets the property of an object deeply nested in another one", function () {
				var object = {b:{c:{d:{e:1}}}};

				expect(Tools.getNestedProperty(object, "b.c")).toBe(object.b.c);
				expect(Tools.getNestedProperty(object, "b.c.d.e")).toBe(1);
			});

			it("also works if an array is in the path", function () {
				var object = {a: [{b: 1}]};

				expect(Tools.getNestedProperty(object, "a.0.b")).toBe(1);
			});

		});

	});

	describe("Store is an observable data structure that publishes events whenever it's updated", function () {

		it("can store its data in an object", function () {
			var store = new Store({});

			store.set("key", "emily");
			store.set("otherKey", 2);

			expect(store.get("key")).toBe("emily");
			expect(store.get("otherKey")).toBe(2);

			expect(store.has("key")).toBe(true);

			expect(store.del("key")).toBe(true);
			expect(store.del("key")).toBe(false);
			expect(store.has("key")).toBe(false);
		});

		it("can store data in an array", function () {
			var store = new Store([]);

			store.set(0, "emily");
			store.set(1, 1);

			expect(store.get(0)).toBe("emily");
			expect(store.get(1)).toBe(1);

			expect(store.del(0)).toBe(true);
			expect(store.get(0)).toBe(1);
		});

		it("can be initialized with data", function () {
			var store = new Store({a: 10});

			expect(store.get("a")).toBe(10);
		});

		it("can be initialized two times with the same data but the data are not shared between them", function () {
			var data = {a: 10},
				store1 = new Store(data),
				store2 = new Store(data);

			store1.set("b", 20);

			expect(store2.has("b")).toBe(false);
		});

		it("publishes events when a store is updated", function () {
			var store = new Store([]),
				itemAdded = false,
				itemUpdated = false,
				itemDeleted = false,
				handle;

			// Listening to the events uses the same API as the Observable
			handle = store.watch("added", function (key) {
				itemAdded = key;
			}, this);

			store.watch("updated", function (key) {
				itemUpdated = key;
			}, this);

			store.watch("deleted", function (key) {
				itemDeleted = key;
			}, this);

			store.set(0, "emily");

			expect(itemAdded).toBe(0);

			store.set(0, "olives");

			expect(itemUpdated).toBe(0);

			store.del(0);

			expect(itemDeleted).toBe(0);

			store.unwatch(handle);
		});

		it("publishes events when a value in the store is updated", function () {
			var store = new Store([]),
				spyNewValue,
				spyOldValue,
				spyEvent,
				handle;

			handle = store.watchValue(0, function (newValue, action, oldValue) {
				spyNewValue = newValue;
				spyOldValue = oldValue;
				spyEvent = action;
			}, this);

			store.set(0, "emily");

			expect(spyNewValue).toBe("emily");
			expect(spyEvent).toBe("added");

			store.set(0, "olives");

			expect(spyNewValue).toBe("olives");
			expect(spyEvent).toBe("updated");
			expect(spyOldValue).toBe("emily");

			store.unwatchValue(handle);
		});

		it("works the same with objects", function () {
			var store = new Store({}),
				spyNewValue,
				spyOldValue,
				spyEvent;

			store.watchValue("key", function (newValue, action, oldValue) {
				spyNewValue = newValue;
				spyOldValue = oldValue;
				spyEvent = action;
			}, this);

			store.set("key", "emily");

			expect(spyNewValue).toBe("emily");
			expect(spyEvent).toBe("added");

			store.set("key", "olives");

			expect(spyNewValue).toBe("olives");
			expect(spyEvent).toBe("updated");
			expect(spyOldValue).toBe("emily");
		});

		it("can update the property of an object nested in a store and publish an event", function () {
			var store = new Store({
					key: {}
				}),
				updatedValue = false;

			store.watchValue("key", function (value) {
				updatedValue = value;
			}, this);

			store.update("key", "a.b.c", "emily");

			expect(updatedValue.a.b.c).toBe("emily");

		});

		it("can delete multiple items in one function call", function () {
			var store = new Store(["a", "b", "c", "d", "e", "f"]);

			store.delAll([0,1,2]);

			expect(store.count()).toBe(3);

			expect(store.get(0)).toBe("d");
			expect(store.get(1)).toBe("e");
			expect(store.get(2)).toBe("f");
		});

		it("can delete multiple properties in one function call", function () {
			var store = new Store({a: 10, b: 20, c: 30});

			store.delAll(["a", "b"]);

			expect(store.count()).toBe(1);

			expect(store.has("a")).toBe(false);
			expect(store.has("b")).toBe(false);
			expect(store.has("c")).toBe(true);
		});

		it("can proxy methods to the inner data structure's methods", function () {
			var store = new Store([0, 2, 3]),
				newValue;

			store.watchValue(1, function (value) {
				newValue = value;
			});
			// Splice can alter the store
			store.alter("splice", 1, 0, 1); // [0,1,2,3]

			expect(store.get(1)).toBe(1);
			expect(newValue).toBe(1);

			// Map doesn't alter it, just like calling map on any array
			var newArray = store.alter("map", function (value) {
				return value * 2;
			});

			expect(newArray[3]).toBe(6);
		});

		it("can also proxy to any method of an object", function () {
			var store = new Store({a: 10});

			expect(store.alter("hasOwnProperty", "a")).toBe(true);
		});

		it("has a function for iterating over it the same way being based on an object or an array", function () {
			var store = new Store({a: 10, b: 20}),
				calls = [];

			store.loop(function () {
				calls.push(arguments);
			});

			// Note that it's lucky that this test passes
			// as loop doesn't guarantee the order in case of an object!
			expect(calls[0][0]).toBe(10);
			expect(calls[0][1]).toBe("a");

			expect(calls[1][0]).toBe(20);
			expect(calls[1][1]).toBe("b");

			store = new Store(["a", "b"]),
			calls = [];

			store.loop(function () {
				calls.push(arguments);
			});

			expect(calls[0][0]).toBe("a");
			expect(calls[0][1]).toBe(0);

			expect(calls[1][0]).toBe("b");
			expect(calls[1][1]).toBe(1);
		});

		it("has a function for resetting the whole store", function () {
			var store = new Store({a: 10}),
				itemAdded;

			// Calling reset fires the diff events
			store.watch("added", function (key) {
				itemAdded = key;
			});

			store.reset(["a"]);

			expect(store.get(0)).toBe("a");

			expect(itemAdded).toBe(0);
		});

		it("can return the jsonified version of itself", function () {
			var store = new Store({a: undefined}),
				jsonified;

			expect(store.has("a")).toBe(true);

			jsonified = store.toJSON();
			expect(Tools.count(jsonified)).toBe(0);
		});

		it("can return it's internal structure", function () {
			var store = new Store({a: 10}),
				internal;

			internal = store.dump();

			expect(internal.a).toBe(10);

			// The internal is not the object passed at init
			expect(store).not.toBe(internal);

		});

		describe("Promise is a fully Promise/A+ compliant implementation", function () {

			it("calls the fulfillment callback within scope", function () {
				var promise = new Promise(),
					scope = {},
					thisObj,
					value;

				promise.then(function (val) {
					thisObj = this;
					value = val;
				}, scope);

				promise.fulfill("emily");

				expect(value).toBe("emily");
				expect(thisObj).toBe(scope);
			});

			it("calls the rejection callback within a scope", function () {
				var promise = new Promise(),
					scope = {},
					thisObj,
					reason;

				promise.then(null, function (res) {
					thisObj = this;
					reason = res;
				}, scope);

				promise.reject(false);

				expect(reason).toBe(false);
				expect(thisObj).toBe(scope);
			});

			it("can synchronise a promise with another one, or any thenable", function () {
				var promise1 = new Promise(),
					promise2 = new Promise(),
					synched;

				promise2.sync(promise1);

				promise2.then(function (value) {
					synched = value;
				});

				promise1.fulfill(true);

				expect(synched).toBe(true);
			});

			it("can return the reason of a rejected promise", function () {
				var promise = new Promise();

				promise.reject("reason");

				expect(promise.getReason()).toBe("reason");
			});

			it("can return the value of a fulfilled promise", function () {
				var promise = new Promise();

				promise.fulfill("emily");

				expect(promise.getValue()).toBe("emily");
			});

			it("passes all the promise-A+ tests specs", function () {
				expect('225 tests complete (6 seconds)').toBeTruthy();
			});

		});

	});

});
