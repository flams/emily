var __Global = this;

require(["Tools"], function (Tools) {
	
	describe("ToolsTestGetGlobal", function () {
		
		it("should get global object", function () {
			expect(Tools.getGlobal).toBeInstanceOf(Function);
			expect(Tools.getGlobal()).toBe(__Global);
		});
		
	});
	
	describe("ToolsTestMixin", function () {
		
		var source = {}, 
			destination = {};
		
		beforeEach(function () {
			destination = {a: 10, b: 20};
			source = function () { this.b=30; this.c=40;};
			source.prototype.d = 50;
			source = new source;
		});
		
		it("should be a function", function () {
			expect(Tools.mixin).toBeInstanceOf(Function);
		});
		
		it("should mix source into destination", function () {
			Tools.mixin(source, destination);
			expect(source.b).toEqual(destination.b);
			expect(destination.b).toEqual(30);
			expect(source.c).toEqual(destination.c);
		});
		
		it("should mix source into destination without overriding", function () {
			Tools.mixin(source, destination, true);
			expect(source.b).not.toEqual(destination.b);
			expect(destination.b).toEqual(20);
			expect(source.c).toEqual(destination.c);
		});
		
		it("should'nt mix in values from the proto chain", function () {
			Tools.mixin(source, destination);
			expect(destination.d).toBeUndefined();
		});
		
	});
	
	describe("ToolsTestCount", function () {
		
		var object = function () { this.a=10; this.b=20;};
			object.prototype.c = 30;
			object = new object;
			
		it("should be a function", function () {
			expect(Tools.count).toBeInstanceOf(Function);
		});
		
		it("should count the number of items", function () {
			expect(Tools.count(object)).toEqual(2);
		});
		
	});
	
	describe("ToolsTestCompareObjects", function () {
		var o1 = {a: 1, c:3, b:4, x:10},
			o2 = {a: 2, c:5, b:52, x:100},
			o3 = {a: 5, b: 3, x: 50};
		
		it("should be a function", function () {
			expect(Tools.compareObjects).toBeInstanceOf(Function);
		});
		
		it("should return true if objects have the same own properties", function () {
			expect(Tools.compareObjects(o1, o2)).toEqual(true);
			expect(Tools.compareObjects(o2, o3)).toEqual(false);
		});
	});
	
	describe("ToolsTestToArray", function () {
		
		it("should be a function", function () {
			expect(Tools.toArray).toBeInstanceOf(Function);
		});
		
		if (__Global.document) {
			it("should transform nodes lists to an array if running in browser", function () {
				var ul = document.createElement("ul"),
				nodeList = ul.querySelectorAll("ul"),
				array = null;
			
		
				ul.innerHTML = "<li>hel</li><li>lo</li>";
				
				expect(nodeList).toBeInstanceOf(NodeList);
				array = Tools.toArray(nodeList);
				expect(array).toBeInstanceOf(Array);
				expect(nodeList[0]).toBe(array[0]);
				expect(nodeList[1]).toBe(array[1]);
			});
		}
		
		it("should transform arguments to an array", function () {
			var args = (function (a,b) {return arguments;})(1,2),
				array = Tools.toArray(args);
			expect(array).toBeInstanceOf(Array);
			expect(args[0]).toBe(array[0]);
			expect(args[1]).toBe(array[1]);
		});
		
	});
});