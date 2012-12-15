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

		it("should return its observer and statemachine for debugging", function () {
			var promise = new Promise();
			expect(promise.getStateMachine).toBeInstanceOf(Function);
			expect(promise.getObservable).toBeInstanceOf(Function);
			expect(promise.getStateMachine()).toBeInstanceOf(StateMachine);
			expect(promise.getObservable()).toBeInstanceOf(Observable);
		});

	});


});
