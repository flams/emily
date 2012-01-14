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
			expect(stateMachine.init(initState)).toEqual(false);
			stateMachine.add(initState);
			expect(stateMachine.init(initState)).toEqual(true);
		});
		
		it("should return the current state", function () {
			var initState = "state";
			expect(stateMachine.getCurrent()).toEqual("");
			stateMachine.add(initState);
			stateMachine.init(initState);
			expect(stateMachine.getCurrent()).toEqual(initState);
		});
		
		it("should'nt override an existing state", function () {
			var state = stateMachine.add("state");
			expect(stateMachine.add("state")).toEqual(false);
			expect(state).toEqual(stateMachine.get("state"));
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
		});
		
		it("should add an action without transition", function () {
			var action = jasmine.createSpy(),
				event = "on";
			
			expect(state.add(event)).toEqual(false);
			expect(state.add(action, event)).toEqual(false);
			expect(state.add(event, event)).toEqual(false);
			expect(state.add(action, action)).toEqual(false);
			expect(state.add(event, action)).toEqual(true);
			expect(state.add(event, action)).toEqual(false);
			
			expect(state.has(event));
		});
		
		it("should execute action on message", function () {
			var action = jasmine.createSpy(),
				event = "on";
			
			state.add(event, action);
			expect(state.event(event)).toBeUndefined();
			expect(action.wasCalled).toEqual(true);
		});
		
		it("should return false if no such transition", function () {
			expect(state.event("noSuchTransition")).toEqual(false);
		});
		
		it("should pass parameters to the action", function () {
			var action = jasmine.createSpy(),
				event = "on",
				params = {};
		
			state.add(event, action);
			expect(state.event(event, params)).toBeUndefined();
			expect(action.wasCalled).toEqual(true);
			expect(action.mostRecentCall.args[0]).toBe(params);
		});
		
		it("should pass multiple parameters to the action", function () {
			var action = jasmine.createSpy(),
				event = "on",
				params1 = {},
				params2 = {};
		
			state.add(event, action);
			expect(state.event(event, params1, params2)).toBeUndefined();
			expect(action.wasCalled).toEqual(true);
			expect(action.mostRecentCall.args[0]).toBe(params1);
			expect(action.mostRecentCall.args[1]).toBe(params2);
		});
		
		it("should add an action with scope", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {};
			
			// rule of thumbs : if scope is to be passed, it's always the param after the callback
			expect(state.add(event, action, scope)).toEqual(true);
			expect(state.add(event, action, scope)).toEqual(false);
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
			
			expect(state.add(event, action, scope, next)).toEqual(true);
			expect(state.add(event, action, scope, next)).toEqual(false);
		});
		
		it("should execute an action in scope and return the next transition", function () {
			var action = jasmine.createSpy(),
				event = "on",
				scope = {},
				next = "next";
			
			state.add(event, action, scope, next);
			expect(state.event(event)).toEqual(next);
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
			
			expect(state.add(event, action, next)).toEqual(true);
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
			expect(stateMachine.event(event, params)).toEqual(true);
			expect(action.wasCalled).toEqual(true);
			expect(action.mostRecentCall.args[0]).toBe(params);
			expect(stateMachine.event("noEvent")).toEqual(false);
		});
		
		it('should send multiple params to the current state', function () {
			var action = jasmine.createSpy(),
				event = "on",
				params1 = {},
				params2 = {};
			
			stateMachine.init("state1");
			state1.add(event, action);
			expect(stateMachine.event(event, params1, params2)).toEqual(true);
			expect(action.wasCalled).toEqual(true);
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
			expect(stateMachine.event("close!")).toEqual(false);
			expect(stateMachine.event("open!")).toEqual(true);
			expect(open.wasCalled).toEqual(true);
			expect(stateMachine.getCurrent()).toEqual("opened");
			expect(stateMachine.event("close!")).toEqual(true);
			expect(close.wasCalled).toEqual(true);
			expect(stateMachine.getCurrent()).toEqual("closed");
		});
		
		
	});
	
	describe("StateMachineInit", function () {
		
			// The actions :
			var Unlock = jasmine.createSpy(),
				UnlockObj = {},
				
				Alarm = jasmine.createSpy(),
				
				Thankyou = jasmine.createSpy(),
				ThankyouObj = {},
				
				Lock = jasmine.createSpy(),
			
			// The State Diagram
			diagram = {	
				"Unlocked" : [
			           ["Coin", Thankyou, ThankyouObj],
			           ["Pass", Lock, "Locked"]
				],
		
				"Locked" : [
					["Coin", Unlock, UnlockObj, "Unlocked"],
					["Pass", Alarm]
				]
			},
				
			stateMachine = new StateMachine("Locked", diagram);
			
			it("should have been initialiazed with the given diagram", function () {
				var locked,
					unlocked;
				
				expect(unlocked = stateMachine.get("Unlocked")).toBeTruthy();
				expect(locked = stateMachine.get("Locked")).toBeTruthy();
				
				expect(locked.has("Coin")).toBeTruthy();
				expect(locked.has("Pass")).toBeTruthy();
				expect(unlocked.has("Coin")).toBeTruthy();
				expect(unlocked.has("Pass")).toBeTruthy();
				
				expect(stateMachine.getCurrent()).toEqual("Locked");
				
				stateMachine.event("Pass");
				expect(Alarm.wasCalled).toEqual(true);
				expect(stateMachine.getCurrent()).toEqual("Locked");
				
				stateMachine.event("Coin");
				expect(Unlock.wasCalled).toEqual(true);
				expect(Unlock.mostRecentCall.object).toBe(UnlockObj);
				expect(stateMachine.getCurrent()).toEqual("Unlocked");
				
				stateMachine.event("Coin");
				expect(Thankyou.wasCalled).toEqual(true);
				expect(Thankyou.mostRecentCall.object).toBe(ThankyouObj);
				expect(stateMachine.getCurrent()).toEqual("Unlocked");
				
				stateMachine.event("Pass");
				expect(Lock.wasCalled).toEqual(true);
				expect(stateMachine.getCurrent()).toEqual("Locked");
			});
		
	});
});