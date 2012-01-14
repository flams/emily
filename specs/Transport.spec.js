require(["Transport"], function (Transport) {
	
	describe("TransportTest", function () {
		
		it("should be a constructor function", function () {
			expect(Transport).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TransportTestConnect", function () {
		
		var transport = null;
		

		beforeEach(function () {
			io = { connect : function connect(url) {
					connect.called = true;
					connect.url = url;
					return {
						on: jasmine.createSpy("on"),
						once: jasmine.createSpy("once"),
						emit: jasmine.createSpy("emit"),
						removeListener: jasmine.createSpy("removeListener")
					};
				}
			};
			transport = new Transport();
		});
		
		it("should have the correct API", function () {
			expect(transport.connect).toBeInstanceOf(Function);
			expect(transport.on).toBeInstanceOf(Function);
			expect(transport.emit).toBeInstanceOf(Function);
			expect(transport.getSocket).toBeInstanceOf(Function);
		});
		
		it("should connect transport on given url", function () {
			var url = "/",
				connected = transport.connect(url);
			
			expect(connected).toEqual(true);
			expect(io.connect.called).toEqual(true);
			expect(io.connect.url).toEqual(url);
			
		});
		
		it("can be connected directly from create", function () {
			var url = "/";
			transport = new Transport(url);
			
			expect(io.connect.called).toEqual(true);
			expect(io.connect.url).toEqual(url);
		});
		
		it("should subscribe to events", function () {
			var url = "/",
				transport,
				socket,
				event = "event",
				func = function () {};
				
			transport = new Transport(url);
			socket = transport.getSocket();
			
			transport.on(event, func);
			
			expect(socket.on.wasCalled).toEqual(true);
			expect(socket.on.mostRecentCall.args[0]).toEqual(event);
			expect(socket.on.mostRecentCall.args[1]).toEqual(func);
			
		});
		
		it("should subscribe to events and disconnect after it fires", function () {
			var url = "/",
				transport,
				event = "event",
				func = function () {},
				socket;
				
			transport = new Transport(url);
			
			socket = transport.getSocket();
			expect(transport.once).toBeInstanceOf(Function);
			
			transport.once(event, func);
			
			expect(socket.once.wasCalled).toEqual(true);
			expect(socket.once.mostRecentCall.args[0]).toEqual(event);
			expect(socket.once.mostRecentCall.args[1]).toEqual(func);
		});
		
		it("should emit events", function () {
			var url = "/",
				transport,
				socket,
				event = "event",
				data = {},
				callback;
	
			transport = new Transport(url);

			socket = transport.getSocket();

			transport.emit(event, data, callback);
			
			expect(socket.emit.wasCalled).toEqual(true);
			expect(socket.emit.mostRecentCall.args[0]).toEqual(event);
			expect(socket.emit.mostRecentCall.args[1]).toEqual(data);
			expect(socket.emit.mostRecentCall.args[2]).toEqual(callback);
		});
		
		it("should make requests", function () {
			var url = "/",
				transport,
				socket,
				channel = "File",
				requestData = {
					resource: "image.jpg"
				},
				callback = jasmine.createSpy(),
				eventId;
			
			
			transport = new Transport(url);
			socket = transport.getSocket();
			socket.once = function (id, func) {
				func();
			};
			spyOn(socket, "once").andCallThrough();
			
			expect(transport.request).toBeInstanceOf(Function);
			
			transport.request(channel, requestData, callback);
			
			expect(socket.once.wasCalled).toEqual(true);
			
			eventId = socket.once.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();
			
			expect(socket.once.mostRecentCall.args[1]).toBeInstanceOf(Function);
			expect(callback.wasCalled).toEqual(true);
			expect(socket.emit.wasCalled).toEqual(true);
			expect(socket.emit.mostRecentCall.args[0]).toEqual(channel);
			expect(socket.emit.mostRecentCall.args[1]).toBeInstanceOf(Object);
			expect(socket.emit.mostRecentCall.args[1].__eventId__).toEqual(eventId);
		});
		
		it("should make requests in scope", function () {
			var url = "/",
				transport,
				channel = "File",
				requestData = {
					resource: "image.jpg"
				},
				callback = jasmine.createSpy(),
				thisObj = {},
				socket;

			transport = new Transport(url);
			socket = transport.getSocket();
			socket.once = function (id, func) {
				func();
			};
			spyOn(socket, "once").andCallThrough();
			transport.request(channel, requestData, callback, thisObj);
			expect(callback.wasCalled).toEqual(true);
		});
		
		it("should also listen on a kept-alive socket", function () {
			var url = "/",
			transport,
			socket,
			channel = "File",
			requestData = {
				resource: "image.jpg"
			},
			callback = jasmine.createSpy(),
			eventId,
			listen;
		
			transport = new Transport(url);
			socket = transport.getSocket();
			socket.on = function (id, func) {
				func();
			};
			spyOn(socket, "on").andCallThrough();
			
			expect(transport.listen).toBeInstanceOf(Function);
			
			spyOn(transport, "request").andCallThrough();
			listen = transport.listen(channel, requestData, callback);
			expect(listen).toBeInstanceOf(Object);
			expect(listen.stop).toBeInstanceOf(Function);
			
			expect(socket.on.wasCalled).toEqual(true);
			
			eventId = socket.on.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();
			
			listen.stop();
			
			expect(socket.removeListener.mostRecentCall.args[0]).toEqual(eventId);
			expect(socket.removeListener.mostRecentCall.args[1]).toBeInstanceOf(Function);
			
			expect(transport.request.wasCalled).toEqual(true);
			expect(transport.request.mostRecentCall.args[1].keptAlive).toEqual(true);
		});
		
	});
	
});