require(["Transport"], function (Transport) {
	
	beforeEach(function () {
		this.addMatchers({
			toBeInstanceOf: function(expected) {
				return this.actual instanceof expected;
			}
		});
	});
	
	describe("TransportTest", function () {
		
		it("should be an object with a create method", function () {
			expect(Transport).toBeInstanceOf(Object);
			expect(Transport.create).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TransportTestConnect", function () {
		
		var transport = null;
		

		beforeEach(function () {
			io = { connect : function connect(url) {
					connect.called = true;
					connect.url = url;
					return {
						on: sinon.spy(),
						emit: sinon.spy()
					};
				}
			};
			transport = Transport.create();
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
			transport = Transport.create(url);
			
			expect(io.connect.called).toEqual(true);
			expect(io.connect.url).toEqual(url);
		});
		
		it("should subscribe to events", function () {
			var url = "/",
				transport,
				socket,
				event = "event",
				func = function () {};
				
			transport = Transport.create(url);
			socket = transport.getSocket();
			
			transport.on(event, func);
			
			expect(socket.on.calledOnce).toEqual(true);
			expect(socket.on.calledWith(event, func)).toEqual(true);
			
		});
		
		it("should emit events", function () {
			var url = "/",
				transport,
				socket,
				event = "event",
				data = {};
	
			transport = Transport.create(url);
			
			transport.emit(event, data);
			socket = transport.getSocket();
			expect(socket.emit.calledOnce).toEqual(true);
			expect(socket.emit.calledWith(event, data)).toEqual(true);
		});
		
	});
	
});