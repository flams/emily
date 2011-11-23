var __Global = this;

TestCase("ToolsTestGetGlobal", {
	setUp: function () {
		this.tools = Emily.require("Tools");
	},
	
	"test should get global object": function () {
		assertFunction(this.tools.getGlobal);
		assertSame(__Global, this.tools.getGlobal());
	}
});

TestCase("ToolsTestMixin", {
	
	setUp: function () {
		this.tools = Emily.require("Tools");
		this.destination = {a: 10, b: 20};
		this.source = function () { this.b=30; this.c=40;};
		this.source.prototype.d = 50;
		this.source = new this.source;
	},
	
	"test mixin exists": function () {
		assertFunction(this.tools.mixin);
	},
	
	"test mixin mixes source into destination": function () {
		this.tools.mixin(this.source, this.destination);
		assertEquals(this.source.b, this.destination.b);
		assertEquals(30, this.destination.b);
		assertEquals(this.source.c, this.destination.c);
	},
	
	"test mixin sources into destination without overriding": function () {
		this.tools.mixin(this.source, this.destination, true);
		assertNotEquals(this.source.b, this.destination.b);
		assertEquals(20, this.destination.b);
		assertEquals(this.source.c, this.destination.c);
	},
	
	"test mixin doesn't mix in values from prototype chain": function () {
		this.tools.mixin(this.source, this.destination);
		assertUndefined(this.destination.d);
	}
});

TestCase("ToolsTestCount", {
	setUp: function () {
		this.object = function () { this.a=10; this.b=20; };
		this.object.prototype.c = 30;
		this.object = new this.object;
		this.tools = Emily.require("Tools");
	},
	
	"test count function exists": function () {
		assertFunction(this.tools.count);
	},
	
	"test count function counts the number of items": function () {
		assertEquals(2, this.tools.count(this.object));
	}
});