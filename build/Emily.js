function Emily(){this.declare=function(f,c){this[f]=new c(this)};this.remove=function(f){delete this[f]};this.load=function(){};this.reload=function(){}}Emily=new Emily;
Emily.declare("Observable",function(){function f(){var c={};this.watch=function(b,e,a){if(typeof b=="string"&&typeof e=="function"){var d=c[b]=c[b]||[];observer=[e,a];d.push(observer);return[b,d.indexOf(observer)]}else return!1};this.unwatch=function(b){var e=b[0],b=b[1];return c[e]&&c[e][b]?(c[e][b]=null,!0):!1};this.notify=function(b,e){var a=c[b],d;if(a){for(d=a.length;d--;)a[d]&&a[d][0].call(a[d][1]||window,e);return!0}else return!1};this.hasObserver=function(b){return!(!b||!c[b[0]]||!c[b[0]][b[1]])}}
this.create=function(){return new f}});Emily.declare("Promises",function(){});
Emily.declare("TinyStore",function(f){this.create=function(c){return new _TinyStore(c)};_TinyStore=function(c){var b={},e=f.Observable.create();this.length=0;(function(a){for(var d in a)a.hasOwnProperty(d)&&(this.length++,b[d]=a[d])}).call(this,c);this.get=function(a){return b[a]};this.has=function(a){return b.hasOwnProperty(a)};this.set=function(a,d){var c;return typeof a=="string"?(c=b[a],b[a]=d,c||this.length++,e.notify(a,d,c),!0):!1};this.del=function(a){return this.has(a)?(this.length--,delete b[a],
e.notify(a,b[a]),!0):!1};this.watch=function(a,b,c){return e.watch(a,b,c)};this.unwatch=function(a){return e.unwatch(a)}}});
