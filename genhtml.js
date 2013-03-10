/**
 * @license Emily http://flams.github.com/emily
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

// Showdown for concerting markup
var showdown = require("showdown"),

// Jsdom for manipulating the output html
jsdom = require("jsdom"),

// fs for reading/writing files
fs = require("fs");


// create the .md -> .html converter
var converter = new showdown.converter,

// read readme fiel
readme = fs.readFileSync("README.md") +'',

// read index.html
index = fs.readFileSync("index.html") + '',

// convert to html
output = converter.makeHtml(readme);


jsdom.env(index, [], function (errors, window) {
	window.document.querySelector("#replaceContent").innerHTML = output;
	fs.writeFileSync("index.html", window.document.innerHTML);
});



