/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
require(["Promise", "Observable", "StateMachine"], function (Promise, Observable, StateMachine) {

	describe("PromiseInit", function () {

		it("should be a constructor function", function () {
			expect(Promise).toBeInstanceOf(Function);
		});

		it("should return an object once created with the following methods", function () {
			var promise = new Promise();
			expect(promise.then).toBeInstanceOf(Function);
			expect(promise.fulfill).toBeInstanceOf(Function);
			expect(promise.reject).toBeInstanceOf(Function);
		});

	});

	describe("PromiseMakeResolver", function () {

		var promise = null,
			newPromise = {
				fulfill: jasmine.createSpy(),
				reject: jasmine.createSpy(),
				sync: jasmine.createSpy().andReturn(false)
			},
			returnFunc = jasmine.createSpy().andReturn("return"),
			throwFunc = jasmine.createSpy().andThrow("error"),
			scope = {};

		beforeEach(function () {
			promise = new Promise();

		});

		it("should return a closure with the promise, the callback and the scope", function () {
			var value = {},
				resolver = promise.makeResolver(newPromise, returnFunc, scope);

			expect(resolver).toBeInstanceOf(Function);
		});

		it("should fulfill the new promise if the func returns", function () {
			var value = {},
				resolver = promise.makeResolver(newPromise, returnFunc, scope);

			resolver(value);

			expect(returnFunc.wasCalled).toBe(true);
			expect(returnFunc.mostRecentCall.args[0]).toBe(value);
			expect(returnFunc.mostRecentCall.object).toBe(scope);

			expect(newPromise.fulfill.wasCalled).toBe(true);
			expect(newPromise.fulfill.mostRecentCall.args[0]).toBe("return");
		});

		it("should reject the new promise if the func throws", function () {
			var reason = {},
				resolver = promise.makeResolver(newPromise, throwFunc, scope);

			resolver(reason);

			expect(throwFunc.wasCalled).toBe(true);
			expect(throwFunc.mostRecentCall.args[0]).toBe(reason);
			expect(throwFunc.mostRecentCall.object).toBe(scope);

			expect(newPromise.reject.wasCalled).toBe(true);
			expect(newPromise.reject.mostRecentCall.args[0]).toBe("error");
		});

	});

	describe("PromiseStateMachine", function () {

		var states = null,
			promise = null,
			observable = null;

		beforeEach(function () {
			promise = new Promise();
			states = promise.getStates();
			observable = promise.getObservable();
		});

		it("should be init in Pending state", function () {
			expect(promise.getStateMachine().getCurrent()).toBe("Pending");
		});

		describe("PromiseStateMachine Pending state", function () {

			it("should have a Pending state", function () {
				expect(states.Pending).toBeInstanceOf(Array);
			});

			it("should have a fulfill transition", function () {
				var fulfill = states.Pending[0],
					value = {},
					callback;

				spyOn(observable, "notify");

				expect(fulfill).toBeInstanceOf(Array);
				expect(fulfill[0]).toBe("fulfill");
				expect(fulfill[2]).toBe("Fulfilled");

				callback = fulfill[1];

				callback(value);

				expect(promise.getValue()).toBe(value);

				expect(observable.notify.wasCalled).toBe(true);
				expect(observable.notify.mostRecentCall.args[0]).toBe("fulfill");
				expect(observable.notify.mostRecentCall.args[1]).toBe(value);

			});


			it("should have a reject transition", function () {
				var reject = states.Pending[1],
					reason = {},
					callback;

				spyOn(observable, "notify");

				expect(reject).toBeInstanceOf(Array);
				expect(reject[0]).toBe("reject");
				expect(reject[2]).toBe("Rejected");

				callback = reject[1];

				callback(reason);

				expect(promise.getReason()).toBe(reason);

				expect(observable.notify.wasCalled).toBe(true);
				expect(observable.notify.mostRecentCall.args[0]).toBe("reject");
				expect(observable.notify.mostRecentCall.args[1]).toBe(reason);

			});

			it("should have a toFulfill action", function () {
				var toFulfill = states.Pending[2],
					resolver = {},
					callback;

				spyOn(observable, "watch");

				expect(toFulfill).toBeInstanceOf(Array);
				expect(toFulfill[0]).toBe("toFulfill");

				callback = toFulfill[1];

				callback(resolver);

				expect(observable.watch.wasCalled).toBe(true);
				expect(observable.watch.mostRecentCall.args[0]).toBe("fulfill");
				expect(observable.watch.mostRecentCall.args[1]).toBe(resolver);
			});

			it("should have a toReject action", function () {
				var toReject = states.Pending[3],
					resolver = {},
					callback;

				spyOn(observable, "watch");

				expect(toReject).toBeInstanceOf(Array);
				expect(toReject[0]).toBe("toReject");

				callback = toReject[1];

				callback(resolver);

				expect(observable.watch.wasCalled).toBe(true);
				expect(observable.watch.mostRecentCall.args[0]).toBe("reject");
				expect(observable.watch.mostRecentCall.args[1]).toBe(resolver);
			});

		});

		describe("PromiseStateMachine Fulfilled state", function () {

			it("should have a Fulfilled state", function () {
				expect(states.Fulfilled).toBeInstanceOf(Array);
			});

			it("should have a toFulfill action", function (done) {
				var toFulfill = states.Fulfilled[0],
					resolver = jasmine.createSpy().andCallFake(function () {
						done();
					});

				expect(toFulfill).toBeInstanceOf(Array);
				expect(toFulfill[0]).toBe("toFulfill");

				callback = toFulfill[1];

				callback(resolver);

			});

		});

		describe("PromiseStateMachine Rejected state", function () {

			it("should have a Rejected state", function () {
				expect(states.Rejected).toBeInstanceOf(Array);
			});

			it("should have a toReject action", function (done) {
				var toReject = states.Rejected[0],
					resolver = jasmine.createSpy().andCallFake(function () {
						done();
					});

				expect(toReject).toBeInstanceOf(Array);
				expect(toReject[0]).toBe("toReject");

				callback = toReject[1];

				callback(resolver);

			});

		});

	});

	describe("PromiseThen", function () {

		var promise = null,
			stateMachine = null,
			fulfillmentCB = null,
			fulfillmentScope = null,
			rejectCB = null,
			rejectScope = null,
			resolver = null;

		beforeEach(function () {
			resolver = jasmine.createSpy();
			promise = new Promise();
			stateMachine = promise.getStateMachine();
			spyOn(stateMachine, "event");
			spyOn(promise, "makeResolver").andReturn(resolver);
			fulfillmentCB = jasmine.createSpy();
			fulfillmentScope = {};
			rejectCB = jasmine.createSpy();
			fulfillmentScope = {};
		});

		it("should return a new promise", function () {
			expect(promise.then()).toBeInstanceOf(Promise);
			expect(promise.then()).not.toBe(promise);
		});

		it("should add a fulfillement callback", function () {
			var newPromise = promise.then(fulfillmentCB);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.calls[0].args[0]).toBe("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.calls[0].args[0]).toBe(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBe(fulfillmentCB);
		});


		it("should add a fulfillement callback with a scope", function () {
			var newPromise = promise.then(fulfillmentCB, fulfillmentScope);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.calls[0].args[0]).toBe("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.calls[0].args[0]).toBe(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBe(fulfillmentCB);
			expect(promise.makeResolver.calls[0].args[2]).toBe(fulfillmentScope);
		});

		it("should add a default fulfillement callback if none is specified", function () {
			var defaultCB,
				newPromise = promise.then();

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.calls[0].args[0]).toBe("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.calls[0].args[0]).toBe(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBeInstanceOf(Function);

			defaultCB = promise.makeResolver.calls[0].args[1];

			spyOn(newPromise, "fulfill");

			defaultCB();
			expect(newPromise.fulfill.wasCalled).toBe(true);
			expect(newPromise.fulfill.mostRecentCall.args[0]).toBe(newPromise.getValue());
		});

		it("should add a rejection callback", function () {
			var newPromise = promise.then(null, rejectCB);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("toReject");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.mostRecentCall.args[0]).toBe(newPromise);
			expect(promise.makeResolver.mostRecentCall.args[1]).toBe(rejectCB);
		});


		it("should add a rejection callback with a scope", function () {
			var newPromise = promise.then(null, rejectCB, rejectScope);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("toReject");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.mostRecentCall.args[0]).toBe(newPromise);
			expect(promise.makeResolver.mostRecentCall.args[1]).toBe(rejectCB);
			expect(promise.makeResolver.mostRecentCall.args[2]).toBe(rejectScope);
		});

		it("should add a default rejection callback if none is specified", function () {
			var defaultCB,
				newPromise = promise.then();

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("toReject");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toBe(true);
			expect(promise.makeResolver.mostRecentCall.args[0]).toBe(newPromise);
			expect(promise.makeResolver.mostRecentCall.args[1]).toBeInstanceOf(Function);

			defaultCB = promise.makeResolver.mostRecentCall.args[1];

			spyOn(newPromise, "reject");

			defaultCB();
			expect(newPromise.reject.wasCalled).toBe(true);
			expect(newPromise.reject.mostRecentCall.args[0]).toBe(newPromise.getReason());
		});


	});

	describe("PromiseSync", function () {

		var thenable = null,
			promise = null;

		beforeEach(function () {
			thenable = {
				then: jasmine.createSpy()
			};
			promise = new Promise();
		});

		it("should only synchronise with thenables", function () {
			expect(promise.sync("fake")).toBe(false);
		});

		it("should synchronize the promise with a thenable", function () {
			var onFulfilled,
				onRejected;

			spyOn(promise, "fulfill");
			spyOn(promise, "reject");

			expect(promise.sync(thenable)).toBe(true);

			expect(thenable.then.wasCalled).toBe(true);
			onFulfilled = thenable.then.mostRecentCall.args[0];
			onRejected = thenable.then.mostRecentCall.args[1];

			onFulfilled("value");
			expect(promise.fulfill.mostRecentCall.args[0]).toBe("value");

			onRejected("reason");
			expect(promise.reject.mostRecentCall.args[0]).toBe("reason");

		});

	});


});
