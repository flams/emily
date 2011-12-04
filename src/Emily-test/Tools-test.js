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

TestCase("ToolsTestCompareObjects", {
	setUp: function () {
		this.o1 = {a: 1, c:3, b:4, x:10};
		this.o2 = {a: 2, c:5, b:52, x:100};
		this.o3 = {a: 5, b: 3, x: 50};
		this.tools = Emily.require("Tools");
	},
	
	"test compareObjects exists": function () {
		assertFunction(this.tools.compareObjects);
	},
	
	"test compareObjects should return true if objects have the same own properties": function () {
		assertTrue(this.tools.compareObjects(this.o1, this.o2));
		assertFalse(this.tools.compareObjects(this.o2, this.o3));
	} 
});

TestCase("ToolsTestToArray", {
	setUp: function () {
		var ul = document.createElement("ul");
		ul.innerHTML = "<li>hel</li><li>lo</li>";
		
		this.toArray = Emily.require("Tools").toArray;
		
		this.nodeList = ul.querySelectorAll("ul");
		this.arguments = (function (a,b) {return arguments;})(1,2);
	},
	
	"test toArray can transform liveNodes to an array": function () {
		assertTrue(this.nodeList instanceof NodeList);
		var array = this.toArray(this.nodeList);
		assertArray(array);
		assertSame(this.nodeList[0], array[0]);
		assertSame(this.nodeList[1], array[1]);
	},
	
	"test toArray can transform arguments to an array": function () {
		var array = this.toArray(this.arguments);
		assertArray(array);
		assertSame(this.arguments[0], array[0]);
		assertSame(this.arguments[1], array[1]);
	}
});