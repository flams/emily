/**
 * Emily.js - http://flams.github.com/emily/
 * Copyright(c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
 var compareNumbers = require("compare-numbers"),
     nestedProperty = require("nested-property"),
     getClosest = require("get-closest");

module.exports = {
    Observable: require("watch-notify"),
    Promise: require("./Promise"),
    Router: require("highway"),
    StateMachine: require("synchronous-fsm"),
    Store: require("observable-store"),
    Tools: {
         getGlobal: require("get-global"),
         mixin: require("simple-object-mixin"),
         count: require("object-count"),
         compareNumbers: compareNumbers.asc,
         toArray: require("to-array"),
         loop: require("simple-loop"),
         objectsDiffs : require("shallow-diff"),
         clone: require("shallow-copy"),
         getNestedProperty: nestedProperty.get,
         setNestedProperty: nestedProperty.set,
         closest: getClosest.number,
         closestGreater: getClosest.greaterNumber,
         closestLower: getClosest.lowerNumber
     },
    Transport: require("transport")
};
