/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
var Observable = require("../src/Observable"),
    Tools = require("../src/Tools");

describe("ObservableTest", function () {

    it("should be a function", function () {
        expect(Observable).toBeInstanceOf(Function);
    });

    it("should have the correct API once created", function () {
        var observable = new Observable();
        expect(observable.watch).toBeInstanceOf(Function);
        expect(observable.unwatch).toBeInstanceOf(Function);
        expect(observable.notify).toBeInstanceOf(Function);
        expect(observable.hasObserver).toBeInstanceOf(Function);
        expect(observable.hasTopic).toBeInstanceOf(Function);
    });

});

describe("ObservableWatch", function () {

    var observable = null,
        testTopic = "testTopic";

    beforeEach(function() {
        observable = new Observable();
    });

    it("should add an observer", function () {
        var spy = jasmine.createSpy("callback");
            handler = null;

        expect(observable.hasObserver(handler)).toBe(false);
        handler = observable.watch(testTopic, spy);

        expect(observable.hasObserver(handler)).toBe(true);

    });

    it("should add an observer on a topic that is a number", function () {
        var spy = jasmine.createSpy("callback");
        handler = null;

        expect(observable.hasObserver(handler)).toBe(false);
        handler = observable.watch(0, spy);

        expect(observable.hasObserver(handler)).toBe(true);

    });

    it("should add an observer with scope", function () {
        var spy = jasmine.createSpy("callback");
            handler = null;

        expect(observable.hasObserver(handler)).toBe(false);
        handler = observable.watch(testTopic, spy, this);

        expect(observable.hasObserver(handler)).toBe(true);
    });

    it("should add multiple observers with or without scopes", function () {
        var spy1 = jasmine.createSpy("callback"),
            spy2 = jasmine.createSpy("callback"),
            handler1 = null,
            handler2 = null,
            thisObj = {},
            testTopic = "testTopic";

        handler1 = observable.watch(testTopic, spy1);
        handler2 = observable.watch(testTopic, spy2, thisObj);
        expect(observable.hasObserver(handler1)).toBe(true);
        expect(observable.hasObserver(handler2)).toBe(true);

    });

    it("can remove an observer", function () {
        var spy = jasmine.createSpy("callback"),
        handler;

        handler = observable.watch(testTopic, spy);
        expect(observable.unwatch(handler)).toBe(true);

        expect(observable.hasObserver(handler)).toBe(false);
        expect(observable.unwatch(handler)).toBe(false);
    });

    it("should remove multiple observers", function () {
        var spy1 = jasmine.createSpy("callback"),
            spy2 = jasmine.createSpy("callback"),
            handler1 = null,
            handler2 = null,
            thisObj = {},
            testTopic = "testTopic";

        handler1 = observable.watch(testTopic, spy1);
        handler2 = observable.watch(testTopic, spy2, thisObj);
        expect(observable.unwatch(handler1)).toBe(true);
        expect(observable.unwatch(handler2)).toBe(true);
        expect(observable.unwatch(handler1)).toBe(false);
        expect(observable.unwatch(handler2)).toBe(false);
    });

    it("shouldn't add observer if wrong parameter count or type", function () {
        expect(observable.watch()).toBe(false);
        expect(observable.watch("topic")).toBe(false);
        expect(observable.watch(function(){}, "topic")).toBe(false);
        expect(observable.watch("", {})).toBe(false);
    });

    it("should remove all observers", function () {
        var handler1 = null,
            handler2 = null;

        handler1 = observable.watch("test", function(){});
        handler2 = observable.watch("test2", function(){});

        expect(observable.unwatchAll).toBeInstanceOf(Function);
        expect(observable.unwatchAll()).toBe(true);

        expect(observable.hasObserver(handler1)).toBe(false);
        expect(observable.hasObserver(handler2)).toBe(false);
    });

    it("should remove all observers from one topic", function () {
        var handler1 = null,
            handler2 = null;

        handler1 = observable.watch("test", function(){});
        handler2 = observable.watch("test2", function(){});
        handler3 = observable.watch("test2", function(){});

        expect(observable.unwatchAll("test2")).toBe(true);

        expect(observable.hasObserver(handler1)).toBe(true);
        expect(observable.hasObserver(handler2)).toBe(false);
        expect(observable.hasObserver(handler3)).toBe(false);
    });

    it("should tell if a topic is already watched", function () {
        var topic = "topic",
            handler;

        handler = observable.watch("topic", function () {});
        expect(observable.hasTopic("topic")).toBe(true);
        expect(observable.hasTopic("notopic")).toBe(false);
        observable.unwatch(handler);
        expect(observable.hasTopic("topic")).toBe(false);
    });

    it("should watch an event on a topic only once", function () {
        var handle = [],
            spy = jasmine.createSpy(),
            scope = {};

        spyOn(observable, "watch").andReturn(handle);
        spyOn(observable, "unwatch");

        expect(observable.once("test", spy, scope)).toBe(handle);

        expect(observable.watch).toHaveBeenCalled();
        expect(observable.watch.mostRecentCall.args[0]).toBe("test");
        expect(typeof observable.watch.mostRecentCall.args[1]).toBe("function");
        expect(observable.watch.mostRecentCall.args[2]).toBe(observable);

        observable.watch.mostRecentCall.args[1].call(observable, 1, 2, 3);

        expect(spy).toHaveBeenCalledWith(1, 2, 3);
        expect(spy.mostRecentCall.object).toBe(scope);

        expect(observable.unwatch).toHaveBeenCalledWith(handle);
    });

});

describe("ObservableNotify", function () {

    var observable = null,
        testTopic = "testTopic";

    beforeEach(function () {
        observable = new Observable();
    });

    it("should notify observer", function () {
        var spy = jasmine.createSpy("callback");

        observable.watch(testTopic, spy);
        expect(observable.notify(testTopic)).toBe(true);
        expect(spy.wasCalled).toBe(true);
    });

    it("should notify observer on topics that are numbers", function () {
        var spy = jasmine.createSpy("callback");

        observable.watch(0, spy);
        expect(observable.notify(0)).toBe(true);
        expect(spy.wasCalled).toBe(true);

    });

    it("should notify observer in scope", function () {
        var spy = jasmine.createSpy("callback");
            thisObj = {};

        observable.watch(testTopic, spy, thisObj);
        expect(observable.notify(testTopic)).toBe(true);
        expect(spy.wasCalled).toBe(true);
        expect(spy.mostRecentCall.object).toBe(thisObj);
    });

    it("should pass parameters", function () {
        var spy = jasmine.createSpy("callback");
            post = {x:10};

        observable.watch(testTopic, spy);
        observable.notify(testTopic, post);

        expect(spy.mostRecentCall.args[0]).toBe(post);
    });

    it("should pass multiple parameters", function () {
        var spy = jasmine.createSpy("callback"),
            param1 = "param1",
            param2 = "param2";

        observable.watch(testTopic, spy);
        observable.notify(testTopic, param1, param2);

        expect(spy.mostRecentCall.args[0]).toBe(param1);
        expect(spy.mostRecentCall.args[1]).toBe(param2);
    });

    it("should notify all observers", function () {
        var spy1 = jasmine.createSpy("callback"),
            spy2 = jasmine.createSpy("callback"),
            thisObj = {},
            testTopic = "testTopic";

        observable.watch(testTopic, spy1);
        observable.watch(testTopic, spy2, thisObj);
        observable.notify(testTopic, "test");
        expect(spy1.wasCalled).toBe(true);
        expect(spy2.wasCalled).toBe(true);
        expect(spy2.mostRecentCall.object).toBe(thisObj);
    });

    it("should return false when notifying on empty topics", function () {
        expect(observable.notify("fake")).toBe(false);
    });

});

describe("ObservableMiscBehavior", function () {

    var observable = null,
        order = null;

    beforeEach(function () {
        observable = new Observable();
        order = [];

        observable.watch("topic", function () {
            order.push("observer1");
        });
        observable.watch("topic", function () {
            order.push("observer2");
        });
        observable.watch("topic", function () {
            order.push("observer3");
        });

    });

    it("should call observers in the order they are added", function () {
        observable.notify("topic");
        expect(order[0]).toBe("observer1");
        expect(order[1]).toBe("observer2");
        expect(order[2]).toBe("observer3");

    });

    it("should use Tools.loop to loop over observers", function () {
        spyOn(Tools, "loop");
        observable.notify("topic");
        expect(Tools.loop.wasCalled).toBe(true);
        expect(Tools.loop.callCount).toBe(1);
    });

    it("should continue notifying observers even if one of them fails to execute", function () {
        var errFunc = function () {
            error++;
        };

        observable.watch("topic", errFunc);

        observable.watch("topic", function () {
            order.push("observer5");
        });

        observable.notify("topic");

        expect(order[3]).toBe("observer5");
    });

    it("should accept that observers are removed on the fly", function () {

        var obs = observable.watch("topic", function () {
            order.push("observer4");
            observable.unwatch(obs);
        });

        observable.watch("topic", function () {
            order.push("observer5");
        });

        observable.notify("topic");

        expect(order[3]).toBe("observer4");
        expect(order[4]).toBe("observer5");

        observable.notify("topic");

        expect(order[8]).toBe("observer5");

    });

});

describe("ObservablesIsolated", function () {

    var observable1 = new Observable(),
        observable2 = new Observable(),
        testTopic = "testTopic";

    it("should add observer to only one observable", function () {
        var handler = observable1.watch(testTopic, function () {});
        expect(observable2.hasObserver(handler)).toBe(false);
    });

    it("should notify only one observable", function () {
        expect(observable2.notify(testTopic)).toBe(false);
    });

});