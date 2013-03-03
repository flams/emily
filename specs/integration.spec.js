/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

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

	});



});
