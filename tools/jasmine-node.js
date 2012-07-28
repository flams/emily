var requirejs = require("requirejs");

// I shouldn't have to get jasmine terminal reporter like this,
// i need to contact misko hevery to know why I can't do it like before (new TerminalReporter)
var jasmine = require("jasmine-node"),
	TerminalReporter = require("jasmine-node/lib/jasmine-node/reporter").jasmineNode.TerminalReporter;

// lib.require.js
// src/*
// specs/specHelper
// specs/*

process.argv.slice(2).forEach(requirejs);

jasmine.getEnv().addReporter(new TerminalReporter({}));
jasmine.getEnv().execute();