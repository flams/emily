Changes are listed in the sibling https://github.com/flams/emily/blob/master/CHANGELOG.md

Extensive documentation, along with unit tests and JsDoc can be found here: http://flams.github.com/emily/

###What is Emily?

 * Emily is a JS library for building scalable web applications.
 * It's runtime agnostic as it doesn't rely on the DOM.
 * It's ready for realtime applications.
 * It's only a set of AMD/commonJS modules.
 * It's ready for being used with other frameworks.
 * It doesn't use any proprietary technology.

###What modules does it provide?

 * Observable: the all mighty observer design pattern.
 * Store: the spine of your MV* application.
 * Promise: a simple promises interpretation based on promise/A.
 * StateMachine: don't hide your states and transitions behind if/else anymore.
 * Transport: make requests to anything node.js has access to.
 * Tools: these functions you always need and rewrite.

 The documentation for each module can be found here: http://flams.github.com/emily/

###How do I install it?

In the browser:

Emily requires an AMD/commonJS compatible loader. I use requirejs: http://requirejs.org/

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

