/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
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
				reject: jasmine.createSpy()
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

			expect(returnFunc.wasCalled).toEqual(true);
			expect(returnFunc.mostRecentCall.args[0]).toBe(value);
			expect(returnFunc.mostRecentCall.object).toBe(scope);

			expect(newPromise.fulfill.wasCalled).toEqual(true);
			expect(newPromise.fulfill.mostRecentCall.args[0]).toEqual("return");
		});

		it("should reject the new promise if the func throws", function () {
			var reason = {},
				resolver = promise.makeResolver(newPromise, throwFunc, scope);

			resolver(reason);

			expect(throwFunc.wasCalled).toEqual(true);
			expect(throwFunc.mostRecentCall.args[0]).toBe(reason);
			expect(throwFunc.mostRecentCall.object).toBe(scope);

			expect(newPromise.reject.wasCalled).toEqual(true);
			expect(newPromise.reject.mostRecentCall.args[0]).toEqual("error");
		});

	});

	describe("PromiseStateMachine", function () {

		var states = null,
			promise = null,
			observable = null;

		beforeEach(function () {
			promise = new Promise;
			states = promise.getStates();
			observable = promise.getObservable();
		});

		it("should be init in Unresolved state", function () {
			expect(promise.getStateMachine().getCurrent()).toEqual("Unresolved");
		});

		describe("PromiseStateMachine Unresolved state", function () {

			it("should have an Unresolved state", function () {
				expect(states.Unresolved).toBeInstanceOf(Array);
			});

			it("should have a fulfill transition", function () {
				var fulfill = states.Unresolved[0],
					value = {},
					callback;

				spyOn(observable, "notify");

				expect(fulfill).toBeInstanceOf(Array);
				expect(fulfill[0]).toEqual("fulfill");
				expect(fulfill[2]).toEqual("Fulfilled");

				callback = fulfill[1];

				callback(value);

				expect(promise.getValue()).toBe(value);

				expect(observable.notify.wasCalled).toEqual(true);
				expect(observable.notify.mostRecentCall.args[0]).toEqual("fulfill");
				expect(observable.notify.mostRecentCall.args[1]).toBe(value);

			});


			it("should have a reject transition", function () {
				var reject = states.Unresolved[1],
					reason = {},
					callback;

				spyOn(observable, "notify");

				expect(reject).toBeInstanceOf(Array);
				expect(reject[0]).toEqual("reject");
				expect(reject[2]).toEqual("Rejected");

				callback = reject[1];

				callback(reason);

				expect(promise.getReason()).toBe(reason);

				expect(observable.notify.wasCalled).toEqual(true);
				expect(observable.notify.mostRecentCall.args[0]).toEqual("reject");
				expect(observable.notify.mostRecentCall.args[1]).toBe(reason);

			});

			it("should have a toFulfill action", function () {
				var toFulfill = states.Unresolved[2],
					resolver = {},
					callback;

				spyOn(observable, "watch");

				expect(toFulfill).toBeInstanceOf(Array);
				expect(toFulfill[0]).toEqual("toFulfill");

				callback = toFulfill[1];

				callback(resolver);

				expect(observable.watch.wasCalled).toEqual(true);
				expect(observable.watch.mostRecentCall.args[0]).toEqual("fulfill");
				expect(observable.watch.mostRecentCall.args[1]).toBe(resolver);
			});

			it("should have a toReject action", function () {
				var toReject = states.Unresolved[3],
					resolver = {},
					callback;

				spyOn(observable, "watch");

				expect(toReject).toBeInstanceOf(Array);
				expect(toReject[0]).toEqual("toReject");

				callback = toReject[1];

				callback(resolver);

				expect(observable.watch.wasCalled).toEqual(true);
				expect(observable.watch.mostRecentCall.args[0]).toEqual("reject");
				expect(observable.watch.mostRecentCall.args[1]).toBe(resolver);
			});

		});

		describe("PromiseStateMachine Fulfilled state", function () {

			it("should have an Fulfilled state", function () {
				expect(states.Fulfilled).toBeInstanceOf(Array);
			});

			it("should have a toFulfill action", function () {
				var toFulfill = states.Fulfilled[0],
					resolver = jasmine.createSpy();

				expect(toFulfill).toBeInstanceOf(Array);
				expect(toFulfill[0]).toEqual("toFulfill");

				callback = toFulfill[1];

				callback(resolver);

				expect(resolver.wasCalled).toEqual(true);
				expect(resolver.mostRecentCall.args[0]).toBe(promise.getValue());

			});

		});

		describe("PromiseStateMachine Rejected state", function () {

			it("should have an Rejected state", function () {
				expect(states.Rejected).toBeInstanceOf(Array);
			});

			it("should have a toReject action", function () {
				var toReject = states.Rejected[0],
					resolver = jasmine.createSpy();

				expect(toReject).toBeInstanceOf(Array);
				expect(toReject[0]).toEqual("toReject");

				callback = toReject[1];

				callback(resolver);

				expect(resolver.wasCalled).toEqual(true);
				expect(resolver.mostRecentCall.args[0]).toBe(promise.getReason());

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

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.calls[0].args[0]).toEqual("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toEqual(true);
			expect(promise.makeResolver.calls[0].args[0]).toBe(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBe(fulfillmentCB);
		});


		it("should add a fulfillement callback with a scope", function () {
			var newPromise = promise.then(fulfillmentCB, fulfillmentScope);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.calls[0].args[0]).toEqual("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toEqual(true);
			expect(promise.makeResolver.calls[0].args[0]).toBe(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBe(fulfillmentCB);
			expect(promise.makeResolver.calls[0].args[2]).toBe(fulfillmentScope);
		});

		it("should add a default fulfillement callback if none is specified", function () {
			var defaultCB,
				newPromise = promise.then();

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.calls[0].args[0]).toEqual("toFulfill");
			expect(stateMachine.event.calls[0].args[1]).toBe(resolver);

			expect(promise.makeResolver.wasCalled).toEqual(true);
			expect(promise.makeResolver.calls[0].args[0]).toEqual(newPromise);
			expect(promise.makeResolver.calls[0].args[1]).toBeInstanceOf(Function);

			defaultCB = promise.makeResolver.calls[0].args[1]

			spyOn(newPromise, "fulfill");

			defaultCB();
			expect(newPromise.fulfill.wasCalled).toEqual(true);
			expect(newPromise.fulfill.mostRecentCall.args[0]).toBe(newPromise.getValue());
		});


	});


});
