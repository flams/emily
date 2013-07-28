/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

require(["StateMachine"], function (StateMachine) {

	describe("StateMachineTest", function () {

		it("should be a constructor function", function () {
			expect(StateMachine).toBeInstanceOf(Function);
		});

		it("should create a state machine with the correct API", function () {
			var stateMachine = new StateMachine();
			expect(stateMachine.add).toBeInstanceOf(Function);
			expect(stateMachine.get).toBeInstanceOf(Function);
			expect(stateMachine.init).toBeInstanceOf(Function);
			expect(stateMachine.getCurrent).toBeInstanceOf(Function);
			expect(stateMachine.event).toBeInstanceOf(Function);
		});

	});

	describe("StateMachineState", function () {

		var stateMachine = null;

		beforeEach(function () {
			stateMachine = new StateMachine();
		});

		it("should return a transition object when adding a state", function () {
			var state = stateMachine.add("state");
			expect(state).toBeInstanceOf(Object);
		});

		it("should return a transition object on get", function () {
			var state = stateMachine.add("state");
			expect(state).toBe(stateMachine.get("state"));
		});

		it("should should set initialization state", function () {
			var initState = "state";
			expect(stateMachine.init(initState)).toBe(false);
			stateMachine.add(initState);
			expect(stateMachine.init(initState)).toBe(true);
		});

		it("should return the current state", function () {
			var initState = "state";
			expect(stateMachine.getCurrent()).toBe("");
			stateMachine.add(initState);
			stateMachine.init(initState);
			expect(stateMachine.getCurrent()).toBe(initState);
		});

		it("should return an existing state", function () {
			var state = stateMachine.add("state");
			expect(stateMachine.add("state")).toBe(state);
		});

		it("should tell if it has a given state", function () {
			stateMachine.add("state");
			expect(stateMachine.has).toBeInstanceOf(Function);
			expect(stateMachine.has("")).toBe(false);
			expect(stateMachine.has("state")).toBe(true);
		});

	});

	describe("StateMachineTransition", function () {
		var stateMachine = null,
			state = null;

		beforeEach(function () {
			stateMachine = new StateMachine();
			state = stateMachine.add("state");
		});

		it("should have the following api", function () {
			expect(state.add).toBeInstanceOf(Function);
			expect(state.event).toBeInstanceOf(Function);
			expect(state.has).toBeInstanceOf(Function);
			expect(state.get).toBeInstanceOf(Function);
		});

		it("should add an action without transition", function () {
			var action = jasmine.createSpy(),
				event = "on";

			expect(state.add(event)).toBe(false);
			expect(state.add(action, event)).toBe(false);
			expect(state.add(event, event)).toBe(false);
			expect(state.add(action, action)).toBe(false);
			expect(state.add(event, action)).toBe(true);
			expect(state.add(event, action)).toBe(false);

			expect(state.has(event));
		});

		it("should get a previously added transition", function () {
			var action = jasmine.createSpy(),
				event = "on",
				transition;

			state.add(event, action);
			expect(state.get()).toBe(false);
			expect(state.get("off")).toBe(false);
			transition = state.get(event);
			expect(transition).toBeTruthy();
			expect(transition[0]).toBe(action);
		});

		it("should execute action on message", function () {
			var action = jasmine.createSpy(),
				event = "on";

			state.add(event, action);
			expect(state.event(event)).toBeUndefined();
			expect(action.wasCalled).toBe(true);
		});

		it("should return false if no such transition", function () {
			expect(state.event("noSuchTransition")).toBe(false);
		});

		it("should pass parameters to the action", function () {
			var action = jasmine.createSpy(),
				event = "on",
				params = {};

			state.add(event, action);
			expect(state.event(event, params)).toBeUndefined();
			expect(action.wasCalled).toBe(true);
			expect(action.mostRecentCall.args[0]).toBe(params);
		});

		it("should pass multiple parameters to the action", function () {
			var action = jasmine.createSpy(),
				event = "on",
				params1 = {},
				params2 = {};

			state.add(event, action);
			expect(state.event(event, params1, params2)).toBeUndefined();
			expect(action.wasCalled).toBe(true);
			expect(action.mostRecentCall.args[0]).toBe(params1);
			expect(action.mostRecentCall.args[1]).toBe(params2);
		});

		it("should add an action with scope", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {};

			// rule of thumbs : if scope is to be passed, it's always the param after the callback
			expect(state.add(event, action, scope)).toBe(true);
			expect(state.add(event, action, scope)).toBe(false);
		});

		it("should execute action in scope", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {};

			state.add(event, action, scope);
			expect(state.event(event)).toBeUndefined();
			expect(action.mostRecentCall.object).toBe(scope);
		});

		it("should add an action with scope and the next transition", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {},
				next = "next";

			expect(state.add(event, action, scope, next)).toBe(true);
			expect(state.add(event, action, scope, next)).toBe(false);
		});

		it("should execute an action in scope and return the next transition", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {},
				next = "next";

			state.add(event, action, scope, next);
			expect(state.event(event)).toBe(next);
			expect(action.mostRecentCall.object).toBe(scope);
		});

		it("should execute an action without transition as many times the event fires", function () {
			var action = jasmine.createSpy(),
				event = "on",
				i = 10;

			state.add(event, action);
			while (i--) {
				state.event(event);
			}
			expect(action.callCount).toBe(10);
		});

		it("shoud execute an action with transition and without scope", function () {
			var action = jasmine.createSpy(),
				event = "on",
				next = "next";

			expect(state.add(event, action, next)).toBe(true);
		});

	});

	describe("StateMachineEvent", function () {

		var stateMachine = null,
			state1 = null;
			state2 = null;

		beforeEach(function () {
			stateMachine = new StateMachine();
			state1 = stateMachine.add("state1");
			state2 = stateMachine.add("state2");
		});

		it("should send the event and the params to the current state", function () {
			var action = jasmine.createSpy(),
				event = "on",
				params = {};

			stateMachine.init("state1");
			state1.add(event, action);
			expect(stateMachine.event(event, params)).toBe(true);
			expect(action.wasCalled).toBe(true);
			expect(action.mostRecentCall.args[0]).toBe(params);
			expect(stateMachine.event("noEvent")).toBe(false);
		});

		it('should send multiple params to the current state', function () {
			var action = jasmine.createSpy(),
				event = "on",
				params1 = {},
				params2 = {};

			stateMachine.init("state1");
			state1.add(event, action);
			expect(stateMachine.event(event, params1, params2)).toBe(true);
			expect(action.wasCalled).toBe(true);
			expect(action.mostRecentCall.args[0]).toBe(params1);
			expect(action.mostRecentCall.args[1]).toBe(params2);
		});

	});

	describe("StateMachineTransit", function () {

		var stateMachine = null,
			opened = null,
			closed = null,
			open = null,
			close = null;

		beforeEach(function () {
			stateMachine = new StateMachine();
			open = jasmine.createSpy();
			close = jasmine.createSpy();
			opened = stateMachine.add("opened");
			closed = stateMachine.add("closed");
			opened.add("close!", close, "closed");
			closed.add("open!", open, "opened");
			stateMachine.init("closed");
		});


		it("should transit between states", function () {
			expect(stateMachine.event("close!")).toBe(false);
			expect(stateMachine.event("open!")).toBe(true);
			expect(open.wasCalled).toBe(true);
			expect(stateMachine.getCurrent()).toBe("opened");
			expect(stateMachine.event("close!")).toBe(true);
			expect(close.wasCalled).toBe(true);
			expect(stateMachine.getCurrent()).toBe("closed");
		});


	});

	describe("StateMachineInit", function () {

			// The actions :
			var unlock = jasmine.createSpy(),
				UnlockObj = {},

				alarm = jasmine.createSpy(),

				thankyou = jasmine.createSpy(),
				thankyouObj = {},

				lock = jasmine.createSpy(),

			// The State Diagram
			diagram = {
				"Unlocked" : [
			           ["coin", thankyou, thankyouObj],
			           ["pass", lock, "Locked"]
				],

				"Locked" : [
					["coin", unlock, UnlockObj, "Unlocked"],
					["pass", alarm]
				]
			},

			stateMachine = new StateMachine("Locked", diagram);

			it("should have been initialiazed with the given diagram", function () {
				var locked,
					unlocked;

				expect(unlocked = stateMachine.get("Unlocked")).toBeTruthy();
				expect(locked = stateMachine.get("Locked")).toBeTruthy();

				expect(locked.has("coin")).toBeTruthy();
				expect(locked.has("pass")).toBeTruthy();
				expect(unlocked.has("coin")).toBeTruthy();
				expect(unlocked.has("pass")).toBeTruthy();

				expect(stateMachine.getCurrent()).toBe("Locked");

				stateMachine.event("pass");
				expect(alarm.wasCalled).toBe(true);
				expect(stateMachine.getCurrent()).toBe("Locked");

				stateMachine.event("coin");
				expect(unlock.wasCalled).toBe(true);
				expect(unlock.mostRecentCall.object).toBe(UnlockObj);
				expect(stateMachine.getCurrent()).toBe("Unlocked");

				stateMachine.event("coin");
				expect(thankyou.wasCalled).toBe(true);
				expect(thankyou.mostRecentCall.object).toBe(thankyouObj);
				expect(stateMachine.getCurrent()).toBe("Unlocked");

				stateMachine.event("pass");
				expect(lock.wasCalled).toBe(true);
				expect(stateMachine.getCurrent()).toBe("Locked");
			});

	});

	describe("StateMachineEntryExitAction", function () {

		var goodBye = jasmine.createSpy(),
			unlock = jasmine.createSpy(),
			hello = jasmine.createSpy().andCallFake(function () {
				stateMachine.event("action");
			}),
			dontCallMe  = jasmine.createSpy(),
			action = jasmine.createSpy(),
			thisObj = {},
			diagram = {
				Locked: [["entry", dontCallMe],
				         ["exit", goodBye, thisObj],
				         ["coin", unlock, "Unlocked"]
				   ],
				Unlocked: [["exit", dontCallMe],
				           ["action", action],
				           ["entry", hello, thisObj]]
			},

			stateMachine = null;

		beforeEach(function () {
			stateMachine = new StateMachine("Locked", diagram);
		});

		it("should call the exit action in scope on exiting the Locked state", function () {
			stateMachine.event("coin");
			expect(goodBye.wasCalled).toBe(true);
			expect(goodBye.mostRecentCall.object).toBe(thisObj);
		});

		it("should call the entry action in scope on exiting the Locked state", function () {
			stateMachine.event("coin");
			expect(hello.wasCalled).toBe(true);
			expect(hello.mostRecentCall.object).toBe(thisObj);
		});

		it("shouldn't call the entry from the current state", function () {
			stateMachine.event("coin");
			expect(dontCallMe.wasCalled).toBe(false);
		});

		it("shouldn't call the exit from the next state", function () {
			stateMachine.event("coin");
			expect(dontCallMe.wasCalled).toBe(false);
		});

	});

	describe("StateMachineAdvance", function () {

		var stateMachine = new StateMachine("state1", {
			"state1": [],
			"state2": []
		});

		it("should have a function for advancing the state machine to a given state", function () {
			expect(stateMachine.advance).toBeInstanceOf(Function);

			expect(stateMachine.advance("")).toBe(false);
			expect(stateMachine.advance("state1")).toBe(true);

		});

	});

});
