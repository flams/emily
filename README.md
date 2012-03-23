Extensive documentation, along with unit tests and JsDoc can be found here: http://flams.github.com/emily/

###What is Emily?

 * Emily is a JS Framework for building MVC applications.
 * It's runtime agnostic as it doesn't rely on the DOM.
 * It's ready for realtime applications.
 * It's only a set of AMD/commonJS modules.
 * It's ready for being used with other frameworks.
 * It doesn't use any proprietary technology.

###What modules does it provide?

 * Observable: the all mighty observer design pattern.
 * Store: the spine of your MV* application.
 * Promise: a simple promises interpretation.
 * StateMachine: don't hide your states and transitions behind if/else anymore.
 * Transport: make requests to anything node.js has access to.
 * CouchDBStore: a Store that displays a CouchDB view or document and gets updated on changes.
 * Tools: these functions you always need and rewrite.
 
 The documentation for each module can be found here: http://flams.github.com/emily/ 

###How do I install it?

In the browser:

Olives requires an AMD/commonJS compatible loader. I use requirejs: http://requirejs.org/

```html
	<script src="require.js"></script>
	<script src="Emily.js"></script>
```

```js
	require(["Module"], function (Module) {
		// Do what you want with Module
	});
```		
		
In node:

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

###There are already so many frameworks out there, why would I choose Emily?

Emily is only a set of AMD/commonJS modules. You can pick up the parts that you need, or like, and build stuff around them.

If you decide to go for all Emily's modules, then you have a set of powerful tools to base your MVC applications on.

Emily lets you decide what piece of software best suites you and your projects.

###It's doesn't rely on the DOM. So what about the V in MVC?

Following Emily's principles, you can use any tool you want to create nice UIs.

But if you like it, you might want to have a look at Olives: http://flams.github.com/olives/

Olives is only a set of AMD/commonJS modules to build realtime UIs in a browser!

###Contributing to Emily

Contributors are more than welcome. To be part of Emily, a new module should follow these requirements:

 * It should use only standard technologies.
 * It should let native features be usable out of the box and not re-implement them.
 * It should use the latest features when they're the best way to achieve something.
 * It should be 100% TDD, with 100% code coverage.
 * It should be in AMD format.
 * It should run in any JavaScript runtime.
 
###Emily is just a tool. I share mine, do you share yours?