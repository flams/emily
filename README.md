###What is Emily?

 * Emily is a JS library for building scalable web applications.
 * It's runtime agnostic as it doesn't rely on the DOM.
 * It's ready for realtime applications.
 * It's only a set of AMD/commonJS modules, your module loader is the framework
 * It's ready for being used with other frameworks.
 * It only relies on standard features
 * It eases the development of MV* applications my providing the M

###What modules does it provide?

 * Observable: the all mighty observer design pattern.
 * Store: the spine of your MV* application.
 * Promise: a fully compliant promise/A+ implementation following https://github.com/promises-aplus/promises-tests
 * StateMachine: don't hide your states and transitions behind if/else anymore.
 * Transport: make requests to anything node.js has access to.
 * Tools: these functions you always need and rewrite.

###How do I use it?

####In the browser:

Emily requires an AMD/commonJS compatible loader. I use requirejs: http://requirejs.org/
Download the latest version of Emily here: http://flams.github.com/emily/

```html
	<script src="require.js"></script>
	<script src="Emily.js"></script>
```

```js
	require(["Module"], function (Module) {
		// Do what you want with Module
	});
```

####In node:

```
npm install requirejs
npm install emily
```

```js
	var requirejs = require("requirejs");
		emily = require("emily");

	requirejs(["Module"], function (Module) {
		// Do what you want with Module
	});
```

### Integration tests: (Emily 1.3.4)

##Observable

```js
describe("Observable implements the Observer design pattern, also called publish subscribe", function () {

	it("has a watch function for adding a listener", function () {
		var observable = new Observable();

		var handle = observable.watch("topic", function listener() {
			// action to execute when something is published on the topic
		}, this);
	});

	it("has a notify function for publishing something on a topic", function () {
		var observable = new Observable(),
			message;

		observable.watch("topic", function listener(something) {
			message = something;
		});

		observable.notify("topic", "hello");

		expect(message).toBe("hello");
	});

	it("notifies several listeners in the order they were added", function () {
		var observable = new Observable(),
			order = [];

		observable.watch("topic", function listener1() {  order.push(1); });
		observable.watch("topic", function listener2() {  order.push(2); });
		observable.watch("topic", function listener3() {  order.push(3); });

		observable.notify("topic");

		expect(order[0]).toBe(1);
		expect(order[1]).toBe(2);
		expect(order[2]).toBe(3);
	});

	it("should continue publishing on all the listeners even if one of them fails", function () {
		var observable = new Observable(),
			order = [];

		observable.watch("topic", function listener1() {  order.push(1); });
		observable.watch("topic", function listener2() {  throw new Error("this listener fails"); });
		observable.watch("topic", function listener3() {  order.push(3); });

		observable.notify("topic");

		expect(order[0]).toBe(1);
		expect(order[1]).toBe(3);
	});

	it("can bind the this object of a listener to a given object and pass multiple things on the topic", function () {
		var observable = new Observable(),
			message1,
			message2,
			message3,
			context;

		observable.watch("topic", function listener(something1, something2, something3) {
			message1 = something1;
			message2 = something2;
			message3 = something3;
			context = this;
		}, this);

		observable.notify("topic", "hello", "this is", "emily");

		expect(message1).toBe("hello");
		expect(message2).toBe("this is");
		expect(message3).toBe("emily");
		expect(context).toBe(this);
	});

	it("can remove a listener on a topic", function () {
		var observable = new Observable(),
			removed = true;

		var handle = observable.watch("topic", function listener(something) {
			removed = false;
		});

		// Remove the listener so it doesn't get called anymore
		observable.unwatch(handle);

		observable.notify("topic");

		expect(removed).toBe(true);
	});

});
```


### Going further

Check out Olives for scalable MV* applications in the browser. https://github.com/flams/olives

1.3.4 - 03 MAR 2013
-------------------

* Added advance to the state machine

1.3.3 - 28 JAN 2013
-------------------

* Added Store.dump
* When store publishes a change event, it publishes both the new and the previous value

1.3.2 - 22 JAN 2013
-------------------

* Fixed emily-server breaking olives
* Updated requirejs

1.3.1 - 1 JAN 2013
-------------------

* Promise has been updated to pass the promise/A+ specs according to
https://github.com/promises-aplus/promises-tests
* Updated StateMachine so new transitions can be added on the fly
* Moved the CouchDB handler to CouchDB Emily Tools

1.3.0 - 16 DEC 2012
-------------------

 * Promise has been updated to pass the promise/A specs according to https://github.com/domenic/promise-tests
 * The build now includes the source files as you should be able to drop them into your application
   to decide how you want to load and optimize them

1.2.0 - 07 OCT 2012
-------------------

Removal of CouchDBStore - now part of CouchDB-Emily-Tools


