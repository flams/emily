Changes are listed in the sibling https://github.com/flams/emily/blob/master/CHANGELOG.md

###What is Emily?

 * Emily is a JS library for building scalable web applications.
 * It's runtime agnostic as it doesn't rely on the DOM.
 * It's ready for realtime applications.
 * It's only a set of AMD/commonJS modules, your module loader is the framework
 * It's ready for being used with other frameworks.
 * It doesn't use any proprietary technology.

###What modules does it provide?

 * Observable: the all mighty observer design pattern.
 * Store: the spine of your MV* application.
 * Promise: a fully compliant promise/A+ implementation following https://github.com/promises-aplus/promises-tests
 * StateMachine: don't hide your states and transitions behind if/else anymore.
 * Transport: make requests to anything node.js has access to.
 * Tools: these functions you always need and rewrite.

 The documentation for each module can be found here: https://github.com/flams/emily/wiki

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

### Better integration within your application

For a better integration within your application, you can simply download Emily and copy the source files that you need into your application's file tree. Provided that you are using requirejs or similar, you'll be able to load Emily's modules just like any other part of your application and you'll also be able to use your preferred optimizer.

### Going further

Check out Olives for scalable MV* applications in the browser. https://github.com/flams/olives


