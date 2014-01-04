/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

var Transport = require("../src/Transport"),
    Store = require("../src/Store");

describe("TransportTest", function () {

    it("should be a constructor function", function () {
        expect(Transport).toBeInstanceOf(Function);
    });

    it("should have the following API", function () {
        var transport = new Transport();
        expect(transport.request).toBeInstanceOf(Function);
        expect(transport.listen).toBeInstanceOf(Function);
        expect(transport.setReqHandlers).toBeInstanceOf(Function);
        expect(transport.getReqHandlers).toBeInstanceOf(Function);
    });

});

describe("TransportInit", function () {

    var transport = null;

    beforeEach(function () {
        transport = new Transport();
    });

    it("should set the requests handlers", function () {
        var reqHandlers = new Store();
        transport = new Transport();

        expect(transport.getReqHandlers()).toBeNull();
        expect(transport.setReqHandlers()).toBe(false);
        expect(transport.setReqHandlers({})).toBe(true);
        expect(transport.setReqHandlers(reqHandlers)).toBe(true);
        expect(transport.getReqHandlers()).toBe(reqHandlers);
    });

    it("shoud set the requests handler at init", function () {
        var reqHandlers = new Store();
        transport = new Transport(reqHandlers);

        expect(transport.getReqHandlers()).toBe(reqHandlers);
    });
});

describe("TransportRequestTest", function () {

    var transport = null,
        reqHandlers = null,
        reqData = {};

    beforeEach(function () {
        reqHandlers =  new Store({
                "channel": jasmine.createSpy()
        });
        transport = new Transport(reqHandlers);
    });

    it("should pass the request to the request handler", function () {
        expect(transport.request()).toBe(false);
        expect(transport.request("channel")).toBe(false);
        expect(transport.request("channel", "data")).toBe(true);
        expect(transport.request("channel", reqData)).toBe(true);
        expect(reqHandlers.get("channel").wasCalled).toBe(true);
        expect(reqHandlers.get("channel").mostRecentCall.args[0]).toBe(reqData);
    });

    it("should pass the request with the callback", function () {
        var spy = jasmine.createSpy(),
            args = {};

        expect(transport.request("channel", reqData, spy)).toBe(true);
        reqHandlers.get("channel").mostRecentCall.args[1](args);

        expect(spy.wasCalled).toBe(true);
        expect(spy.mostRecentCall.args[0]).toBe(args);

    });

    it("should execute the callback in scope", function () {
        var spy = jasmine.createSpy(),
            thisObj = {},
            cb;

        expect(transport.request("channel", reqData, spy, thisObj)).toBe(true);
        cb = reqHandlers.get("channel").mostRecentCall.args[1];
        expect(typeof cb).toBe("function");
        cb();

        expect(spy.wasCalled).toBe(true);
        expect(spy.mostRecentCall.object).toBe(thisObj);
    });

    it("shouldn't fail if no callback given", function () {
        transport.request("channel", reqData);
        var cb = reqHandlers.get("channel").mostRecentCall.args[1];
        expect(function () {
            cb();
        }).not.toThrow();
    });

});

describe("TransportListenTest", function () {

    var transport = null,
        reqHandlers = null,
        data = {},
        func,
        obj = jasmine.createSpy();

    beforeEach(function () {
        func = jasmine.createSpy();
        reqHandlers =  new Store({
            "channel": jasmine.createSpy().andReturn({
                    scope:obj,
                    func: func
                }),
            "nostopchannel": jasmine.createSpy(),
            "funcstopchannel": jasmine.createSpy().andReturn(func)
        });
        transport = new Transport(reqHandlers);
    });

    it("should allow to listen to a given url", function () {
        var spy = jasmine.createSpy();
        expect(transport.listen()).toBe(false);
        expect(transport.listen("channel")).toBe(false);
        expect(transport.listen("channel", data)).toBe(false);
        expect(transport.listen("fake", data, spy)).toBe(false);
        expect(transport.listen("channel", data, spy)).toBeTruthy();
        expect(transport.listen("channel", "data", spy)).toBeTruthy();
    });

    it("should pass the data to the reqHandler", function () {
        var spy = jasmine.createSpy(),
            cb,
            params,
            args = {};

        transport.listen("channel", data, spy);

        expect(reqHandlers.get("channel").wasCalled).toBe(true);
        expect(reqHandlers.get("channel").mostRecentCall.args[0]).toBe(data);

        cb = reqHandlers.get("channel").mostRecentCall.args[1];
        expect(typeof cb).toBe("function");
        cb(args);
        expect(spy.wasCalled).toBe(true);
        expect(spy.mostRecentCall.args[0]).toBe(args);
        expect(reqHandlers.get("channel").mostRecentCall.args[2]).toBe(cb);
    });

    it("should execute the callback in scope", function () {
        var spy = jasmine.createSpy(),
            thisObj = {};

        transport.listen("channel", data, spy, thisObj);
        reqHandlers.get("channel").mostRecentCall.args[1]();
        expect(spy.mostRecentCall.object).toBe(thisObj);
    });

    it("should return a stop function", function () {
        var spy = jasmine.createSpy(),
            stop = transport.listen("channel", data, spy);

        expect(stop).toBeInstanceOf(Function);
        stop();
        expect(func.wasCalled).toBe(true);
        expect(func.mostRecentCall.object).toBe(obj);
    });

    it("should not fail if no stop function is returned or if not a valid format", function () {
        var stop = transport.listen("nostopchannel", "", function () {});

        expect(function () {
            stop();
        }).not.toThrow();
    });

    it("should call the stop function if its a function on its own", function () {
        var stop = transport.listen("funcstopchannel", "", function () {});

        stop();

        expect(func.wasCalled).toBe(true);

    });
});