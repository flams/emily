define("CouchDBStore",["Store","StateMachine","Tools","Promise"],function(d,e,f,c){function b(){var b=null,a=null,j=null,f=null,d=null,i={},h=new e("Unsynched",{Unsynched:[["getView",function(c){b.request("CouchDB",{method:"GET",path:"/"+a+"/_design/"+d+"/_view/"+j+"?update_seq=true"},function(a){a=JSON.parse(a);i={total_rows:a.total_rows,update_seq:a.update_seq,offset:a.offset};this.reset(a.rows);c.resolve(this);h.event("subscribeToViewChanges",a.update_seq)},this)},this,"Synched"],["getDocument",
function(c){b.request("CouchDB",{method:"GET",path:"/"+a+"/"+f},function(a){a=JSON.parse(a);a._id?(c.resolve(this),this.reset(a),h.event("subscribeToDocumentChanges")):c.reject(this)},this)},this,"Synched"]],Synched:[["updateDatabase",function(){b.request("CouchDB",{method:"PUT",path:"/"+a+"/"+f,headers:{"Content-Type":"application/json"},data:this.toJSON()},function(){h.event("subscribeToDocumentChanges")})},this],["subscribeToViewChanges",function(c){b.listen("CouchDB","/"+a+"/_changes?feed=continuous&heartbeat=20000&since="+
c,function(a){if(a=="\n")return false;var a=JSON.parse(a),c;c=a.deleted?"delete":a.changes[0].rev.search("1-")==0?"add":"change";h.event(c,a.id)},this)},this,"Listening"],["subscribeToDocumentChanges",function(){b.listen("CouchDB","/"+a+"/_changes?feed=continuous&heartbeat=20000",function(a){if(a=="\n")return false;a=JSON.parse(a);a.id==f&&(a.deleted?h.event("deleteDoc"):h.event("updateDoc"))},this)},this,"Listening"]],Listening:[["change",function(c){b.request("CouchDB",{method:"GET",path:"/"+a+
"/_design/"+d+"/_view/"+j},function(a){JSON.parse(a).rows.some(function(a,b){a.id==c&&this.set(b,a)},this)},this)},this],["delete",function(a){this.loop(function(c,b){c.id==a&&this.del(b)},this)},this],["add",function(c){b.request("CouchDB",{method:"GET",path:"/"+a+"/_design/"+d+"/_view/"+j},function(a){JSON.parse(a).rows.some(function(a,b){a.id==c&&this.alter("splice",b,0,a)},this)},this)},this],["updateDoc",function(){b.request("CouchDB",{method:"GET",path:"/"+a+"/"+f},function(a){this.reset(JSON.parse(a))},
this)},this],["deleteDoc",function(){this.reset({})},this],["updateDatabase",function(){b.request("CouchDB",{method:"PUT",path:"/"+a+"/"+f,headers:{"Content-Type":"application/json"},data:this.toJSON()})},this],["removeFromDatabase",function(){b.request("CouchDB",{method:"DELETE",path:"/"+a+"/"+f+"?rev="+this.get("_rev")})},this]]});this.sync=function(b,e,g){var i=new c;if(typeof b=="string"&&typeof e=="string"&&typeof g=="string")return a=b,d=e,j=g,h.event("getView",i),i;else if(typeof b=="string"&&
typeof e=="string"&&typeof g=="undefined")return a=b,f=e,h.event("getDocument",i),i;return false};this.update=function(){return h.event("updateDatabase")};this.remove=function(){return h.event("removeFromDatabase")};this.getDBInfo=function(a){return i[a]};this.setTransport=function(a){return a&&typeof a.listen=="function"&&typeof a.request=="function"?(b=a,true):false};this.getStateMachine=function(){return h};this.getTransport=function(){return b}}return function(){b.prototype=new d;return new b}});
define("Observable",["Tools"],function(d){return function(){var e={};this.watch=function(f,c,b){if(typeof c=="function"){var d=e[f]=e[f]||[];observer=[c,b];d.push(observer);return[f,d.indexOf(observer)]}else return false};this.unwatch=function(f){var c=f[0],f=f[1];return e[c]&&e[c][f]?(delete e[c][f],e[c].some(function(b){return!!b})||delete e[c],true):false};this.notify=function(f){var c=e[f],b;if(c){for(b=c.length;b--;)c[b]&&c[b][0].apply(c[b][1]||null,d.toArray(arguments).slice(1));return true}else return false};
this.hasObserver=function(f){return!(!f||!e[f[0]]||!e[f[0]][f[1]])};this.hasTopic=function(f){return!!e[f]};this.unwatchAll=function(f){e[f]?delete e[f]:e={};return true}}});
define("Promise",["Observable","StateMachine"],function(d,e){return function(){var f,c,b=new e("Unresolved",{Unresolved:[["resolve",function(a){f=a;g.notify("success",a)},"Resolved"],["reject",function(a){c=a;g.notify("fail",a)},"Rejected"],["addSuccess",function(a,b){g.watch("success",a,b)}],["addFail",function(a,b){g.watch("fail",a,b)}]],Resolved:[["addSuccess",function(a,b){a.call(b,f)}]],Rejected:[["addFail",function(a,b){a.call(b,c)}]]}),g=new d;this.resolve=function(a){return b.event("resolve",
a)};this.reject=function(a){return b.event("reject",a)};this.then=function(a,c,f,d){a instanceof Function&&(c instanceof Function?b.event("addSuccess",a):b.event("addSuccess",a,c));c instanceof Function&&b.event("addFail",c,f);f instanceof Function&&b.event("addFail",f,d);return this};this.getObservable=function(){return g};this.getStateMachine=function(){return b}}});
define("StateMachine",["Tools"],function(d){function e(){var f={};this.add=function(c,b,d,a){var e=[];if(f[c])return false;return typeof c=="string"&&typeof b=="function"?(e[0]=b,typeof d=="object"&&(e[1]=d),typeof d=="string"&&(e[2]=d),typeof a=="string"&&(e[2]=a),f[c]=e,true):false};this.has=function(c){return!!f[c]};this.event=function b(b){var e=f[b];return e?(e[0].apply(e[1],d.toArray(arguments).slice(1)),e[2]):false}}return function(f,c){var b={},g="";this.init=function(a){return b[a]?(g=a,
true):false};this.add=function(a){return b[a]?false:b[a]=new e};this.get=function(a){return b[a]};this.getCurrent=function(){return g};this.event=function(a){var c=b[g].event.apply(b[g].event,d.toArray(arguments));return c===false?false:(g=c||g,true)};d.loop(c,function(a,b){var c=this.add(b);a.forEach(function(a){c.add.apply(null,a)})},this);this.init(f)}});
define("Store",["Observable","Tools"],function(d,e){return function(f){var c=e.clone(f)||{},b=new d,g=function(a){var d=e.objectsDiffs(a,c);["updated","deleted","added"].forEach(function(a){d[a].forEach(function(d){b.notify(a,d,c[d])})})};this.getNbItems=function(){return c instanceof Array?c.length:e.count(c)};this.get=function(a){return c[a]};this.has=function(a){return c.hasOwnProperty(a)};this.set=function(a,d){var e;return typeof a!="undefined"?(e=this.has(a),c[a]=d,e?b.notify("updated",a,c[a]):
b.notify("added",a,c[a]),true):false};this.del=function(a){return this.has(a)?(this.alter("splice",a,1)||(delete c[a],b.notify("deleted",a)),true):false};this.alter=function(a){var b,d;return c[a]?(d=e.clone(c),b=c[a].apply(c,Array.prototype.slice.call(arguments,1)),g(d),b):false};this.watch=function(a,c,d){return b.watch(a,c,d)};this.unwatch=function(a){return b.unwatch(a)};this.loop=function(a,b){e.loop(c,a,b)};this.reset=function(a){if(a instanceof Object){var b=e.clone(c);c=e.clone(a)||{};g(b);
return true}else return false};this.toJSON=function(){return JSON.stringify(c)}}});
define("Tools",function(){return{getGlobal:function(){return function(){return this}.call(null)},mixin:function(d,e,f){this.loop(d,function(c,b){if(!e[b]||!f)e[b]=d[b]});return e},count:function(d){var e=0;this.loop(d,function(){e++});return e},compareObjects:function(d,e){return Object.getOwnPropertyNames(d).sort().join("")==Object.getOwnPropertyNames(e).sort().join("")},toArray:function(d){return Array.prototype.slice.call(d)},loop:function(d,e,f){var c,b;if(d instanceof Object&&typeof e=="function"){if(b=
d.length)for(c=0;c<b;c++)e.call(f,d[c],c,d);else for(c in d)d.hasOwnProperty(c)&&e.call(f,d[c],c,d);return true}else return false},objectsDiffs:function(d,e){if(d instanceof Object&&e instanceof Object){var f=[],c=[],b=[],g=[];this.loop(e,function(a,b){a!==d[b]&&typeof d[b]!="undefined"?c.push(b):a===d[b]?f.push(b):typeof d[b]=="undefined"&&g.push(b)});this.loop(d,function(a,c){typeof e[c]=="undefined"&&b.push(c)});return{updated:c,unchanged:f,added:g,deleted:b}}else return false},jsonify:function(d){return d instanceof
Object?JSON.parse(JSON.stringify(d)):false},clone:function(d){return d instanceof Array?d.slice(0):typeof d=="object"&&d!==null&&!(d instanceof RegExp)?this.mixin(d,{}):d},getObjectsProperty:function(d,e){if(d&&d instanceof Object&&typeof e=="string"&&e!=""){var f=e.split(".");f.unshift(d);return f.reduce(function(c,b){return c[b]})}else return d}}});
define("Transport",["Observable"],function(d){return function(e){var f=null,c=io,b=new d;this.connect=function(b){f=c.connect(b);return!!f};this.getSocket=function(){return f};this.on=function(b,a){f.on(b,a)};this.once=function(b,a){f.once(b,a)};this.emit=function(b,a,c){f.emit(b,a,c)};this.request=function(b,a,c,d){var e=Date.now()+Math.floor(Math.random()*1E6),i=function(){c&&c.apply(d||null,arguments)};f[a.keptAlive?"on":"once"](e,i);a.__eventId__=e;f.emit(b,a);if(a.keptAlive)return function(){f.removeListener(e,
i)}};this.listen=function(c,a,d,e){var f=c+"/"+a,i,h;b.hasTopic(f)||(h=this.request(c,{path:a,method:"GET",keptAlive:true},function(a){b.notify(f,a)},this));i=b.watch(f,d,e);return{stop:function(){b.unwatch(i);b.hasTopic(f)||h()}}};this.getListenObservable=function(){return b};this.connect(e)}});
