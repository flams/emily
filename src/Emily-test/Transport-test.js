TestCase("TransportTest", {
	
	setUp: function () {
		this.transport = Emily.require("Transport");
		this.fakeIO = {
				connect: function connect(url) {
					connect.called = true;
					connect.url = url;
					return {
						on: sinon.spy(),
						emit: sinon.spy()
					};
				}
		};
	},
	
	tearDown: function () {
		Emily.setIsolationMode(false);
	},
	
	"test API is correct": function () {
		assertFunction(this.transport.create);
		var transport = this.transport.create();
		assertFunction(transport.connect);
	},
	
	"test should connect transport on given url": function () {
		var url = "/";

		Emily.setIsolationMode(true);
		Emily.inject("io", this.fakeIO);
		this.transport.create().connect(url); 

		assertTrue(this.fakeIO.connect.called);
		assertEquals(url, this.fakeIO.connect.url);
		
	},
	
	"test transport can be directly initialized from create": function () {
		var url = "/";
		
		Emily.setIsolationMode(true);
		Emily.inject("io", this.fakeIO);
		this.transport.create(url);
		
		assertTrue(this.fakeIO.connect.called);
		assertEquals(url, this.fakeIO.connect.url);
	},
	
	"test subscribe to event": function () {
		var url = "/",
			transport,
			socket,
			event = "event",
			func = function(){};
		
		Emily.setIsolationMode(true);
		Emily.inject("io", this.fakeIO);
		transport = this.transport.create(url);
		
		transport.on(event, func);
		socket = transport.getSocket();
		assertTrue(socket.on.calledOnce);
		assertTrue(socket.on.calledWith(event, func));
	},
	
	"test emit event": function () {
		var url = "/",
			transport,
			socket,
			event = "event",
			data = {};
	
		Emily.setIsolationMode(true);
		Emily.inject("io", this.fakeIO);
		transport = this.transport.create(url);
		
		transport.emit(event, data);
		socket = transport.getSocket();
		assertTrue(socket.emit.calledOnce);
		assertTrue(socket.emit.calledWith(event, data));
			
	}
	
	
});;