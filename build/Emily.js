/*
 Emily ${VERSION} http://flams.github.com/emily

 The MIT License (MIT)

 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBStore",["Store","StateMachine","Tools","Promise"],function(a,d,h,c){function e(){var f=null,b={},g=new c,a={getView:function(){b.query=b.query||{};b.query.update_seq=true;f.request("CouchDB",{method:"GET",path:"/"+b.database+"/_design/"+b.design+"/"+b.view,query:b.query},function(g){var a=JSON.parse(g);if(a.rows)this.reset(a.rows),typeof a.total_rows=="undefined"&&this.setReducedViewInfo(true),e.event("subscribeToViewChanges",a.update_seq);else throw Error("CouchDBStore ["+b.database+
", "+b.design+", "+b.view+"].sync() failed: "+g);},this)},getDocument:function(){f.request("CouchDB",{method:"GET",path:"/"+b.database+"/"+b.document,query:b.query},function(b){b=JSON.parse(b);b._id?(this.reset(b),e.event("subscribeToDocumentChanges")):g.reject(this)},this)},getBulkDocuments:function(){var a={path:"/"+b.database+"/_all_docs",query:b.query},g;b.keys instanceof Array?(a.method="POST",a.data=JSON.stringify({keys:b.keys}),a.headers={"Content-Type":"application/json"},g=a.data):(a.method=
"GET",g=JSON.stringify(b.query));b.query.include_docs=true;b.query.update_seq=true;f.request("CouchDB",a,function(a){var c=JSON.parse(a);if(c.rows)this.reset(c.rows),e.event("subscribeToBulkChanges",c.update_seq);else throw Error('CouchDBStore.sync("'+b.database+'", '+g+") failed: "+a);},this)},createDocument:function(a){f.request("CouchDB",{method:"PUT",path:"/"+b.database+"/"+b.document,headers:{"Content-Type":"application/json"},data:this.toJSON()},function(b){b=JSON.parse(b);b.ok?(a.resolve(b),
e.event("subscribeToDocumentChanges")):a.reject(b)})},subscribeToViewChanges:function(a){h.mixin({feed:"continuous",heartbeat:2E4,since:a},b.query);this.stopListening=f.listen("CouchDB",{path:"/"+b.database+"/_changes",query:b.query},function(a){if(a=="\n")return false;var a=JSON.parse(a),g;g=b.reducedView?"updateReduced":a.deleted?"delete":a.changes[0].rev.search("1-")==0?"add":"change";e.event(g,a.id)},this)},subscribeToDocumentChanges:function(){this.stopListening=f.listen("CouchDB",{path:"/"+
b.database+"/_changes",query:{feed:"continuous",heartbeat:2E4}},function(a){if(a=="\n")return false;a=JSON.parse(a);a.id==b.document&&a.changes.pop().rev!=this.get("_rev")&&(a.deleted?e.event("deleteDoc"):e.event("updateDoc"))},this)},subscribeToBulkChanges:function(a){h.mixin({feed:"continuous",heartbeat:2E4,since:a,include_docs:true},b.query);this.stopListening=f.listen("CouchDB",{path:"/"+b.database+"/_changes",query:b.query},function(b){if(b=="\n")return false;var b=JSON.parse(b),a;a=b.changes[0].rev.search("1-")==
0?"bulkAdd":b.deleted?"delete":"bulkChange";e.event(a,b.id,b.doc)},this)},updateDocInStore:function(a){f.request("CouchDB",{method:"GET",path:"/"+b.database+"/_design/"+b.design+"/"+b.view,query:b.query},function(b){b=JSON.parse(b);b.rows.length==this.getNbItems()?b.rows.some(function(b,g){b.id==a&&this.set(g,b)},this):this.actions.evenDocsInStore.call(this,b.rows,a)},this)},evenDocsInStore:function(b,a){var g=this.getNbItems();b.length<g?this.loop(function(b,g){b.id==a&&this.del(g)},this):b.length>
g&&b.some(function(b,g){if(b.id==a)return this.alter("splice",g,0,b)},this)},addBulkDocInStore:function(a){if(b.query.startkey||b.query.endkey)b.query.include_docs=true,b.query.update_seq=true,f.request("CouchDB",{method:"GET",path:"/"+b.database+"/_all_docs",query:b.query},function(b){JSON.parse(b).rows.forEach(function(b,g){b.id==a&&this.alter("splice",g,0,b.doc)},this)},this);else return false},updateBulkDocInStore:function(b,a){this.loop(function(g,c){g.id==b&&this.set(c,a)},this)},removeDocInStore:function(b){this.loop(function(a,
g){a.id==b&&this.del(g)},this)},addDocInStore:function(a){f.request("CouchDB",{method:"GET",path:"/"+b.database+"/_design/"+b.design+"/"+b.view,query:b.query},function(b){JSON.parse(b).rows.some(function(b,g){b.id==a&&this.alter("splice",g,0,b)},this)},this)},updateReduced:function(){f.request("CouchDB",{method:"GET",path:"/"+b.database+"/_design/"+b.design+"/"+b.view,query:b.query},function(b){this.set(0,JSON.parse(b).rows[0])},this)},updateDoc:function(){f.request("CouchDB",{method:"GET",path:"/"+
b.database+"/"+b.document},function(b){this.reset(JSON.parse(b))},this)},deleteDoc:function(){this.reset({})},updateDatabase:function(a){f.request("CouchDB",{method:"PUT",path:"/"+b.database+"/"+b.document,headers:{"Content-Type":"application/json"},data:this.toJSON()},function(b){b=JSON.parse(b);b.ok?(this.set("_rev",b.rev),a.resolve(b)):a.reject(b)},this)},updateDatabaseWithBulkDoc:function(a){var g=[];this.loop(function(b){g.push(b.doc)});f.request("CouchDB",{method:"POST",path:"/"+b.database+
"/_bulk_docs",headers:{"Content-Type":"application/json"},data:JSON.stringify({docs:g})},function(b){a.resolve(JSON.parse(b))})},removeFromDatabase:function(){f.request("CouchDB",{method:"DELETE",path:"/"+b.database+"/"+b.document,query:{rev:this.get("_rev")}})},resolve:function(){g.resolve(this)},unsync:function(){this.stopListening();delete this.stopListening}},e=new d("Unsynched",{Unsynched:[["getView",a.getView,this,"Synched"],["getDocument",a.getDocument,this,"Synched"],["getBulkDocuments",a.getBulkDocuments,
this,"Synched"]],Synched:[["updateDatabase",a.createDocument,this],["subscribeToViewChanges",a.subscribeToViewChanges,this,"Listening"],["subscribeToDocumentChanges",a.subscribeToDocumentChanges,this,"Listening"],["subscribeToBulkChanges",a.subscribeToBulkChanges,this,"Listening"],["unsync",function(){},"Unsynched"]],Listening:[["entry",a.resolve,this],["change",a.updateDocInStore,this],["bulkAdd",a.addBulkDocInStore,this],["bulkChange",a.updateBulkDocInStore,this],["delete",a.removeDocInStore,this],
["add",a.addDocInStore,this],["updateReduced",a.updateReduced,this],["updateDoc",a.updateDoc,this],["deleteDoc",a.deleteDoc,this],["updateDatabase",a.updateDatabase,this],["updateDatabaseWithBulkDoc",a.updateDatabaseWithBulkDoc,this],["removeFromDatabase",a.removeFromDatabase,this],["unsync",a.unsync,this,"Unsynched"]]});this.sync=function(b,a,c,f){if(typeof b=="string"&&typeof a=="string"&&typeof c=="string")return this.setSyncInfo(b,a,c,f),e.event("getView"),g;else if(typeof b=="string"&&typeof a==
"string"&&typeof c!="string")return this.setSyncInfo(b,a,c),e.event("getDocument"),g;else if(typeof b=="string"&&a instanceof Object)return this.setSyncInfo(b,a),e.event("getBulkDocuments"),g;return false};this.setSyncInfo=function(a,g,c,e){this.clearSyncInfo();if(typeof a=="string"&&typeof g=="string"&&typeof c=="string")return b.database=a,b.design=g,b.view=c,b.query=e,true;else if(typeof a=="string"&&typeof g=="string"&&typeof c!="string")return b.database=a,b.document=g,b.query=c,true;else if(typeof a==
"string"&&g instanceof Object){b.database=a;b.query=g;if(b.query.keys instanceof Array)b.keys=b.query.keys,delete b.query.keys;return true}return false};this.clearSyncInfo=function(){b={};return true};this.setReducedViewInfo=function(a){return typeof a=="boolean"?(b.reducedView=a,true):false};this.getSyncInfo=function(){return b};this.unsync=function(){return e.event("unsync")};this.upload=function(){var a=new c;if(b.document)return e.event("updateDatabase",a),a;else if(!b.view)return e.event("updateDatabaseWithBulkDoc",
a),a;return false};this.remove=function(){return b.document?e.event("removeFromDatabase"):false};this.setTransport=function(b){return b&&typeof b.listen=="function"&&typeof b.request=="function"?(f=b,true):false};this.getStateMachine=function(){return e};this.getTransport=function(){return f};this.actions=a}return function(){e.prototype=new a;return new e}});
define("Observable",["Tools"],function(a){return function(){var d={};this.watch=function(a,c,e){if(typeof c=="function"){var f=d[a]=d[a]||[],c=[c,e];f.push(c);return[a,f.indexOf(c)]}else return false};this.unwatch=function(a){var c=a[0],a=a[1];return d[c]&&d[c][a]?(delete d[c][a],d[c].some(function(a){return!!a})||delete d[c],true):false};this.notify=function(h){var c=d[h],e;if(c){for(e=c.length;e--;)c[e]&&c[e][0].apply(c[e][1]||null,a.toArray(arguments).slice(1));return true}else return false};this.hasObserver=
function(a){return!(!a||!d[a[0]]||!d[a[0]][a[1]])};this.hasTopic=function(a){return!!d[a]};this.unwatchAll=function(a){d[a]?delete d[a]:d={};return true}}});
define("Promise",["Observable","StateMachine"],function(a,d){return function(){var h,c,e=new d("Unresolved",{Unresolved:[["resolve",function(b){h=b;f.notify("success",b)},"Resolved"],["reject",function(b){c=b;f.notify("fail",b)},"Rejected"],["addSuccess",function(b,a){f.watch("success",b,a)}],["addFail",function(b,a){f.watch("fail",b,a)}]],Resolved:[["addSuccess",function(b,a){b.call(a,h)}]],Rejected:[["addFail",function(b,a){b.call(a,c)}]]}),f=new a;this.resolve=function(b){return e.event("resolve",
b)};this.reject=function(b){return e.event("reject",b)};this.then=function(b,a,c,f){b instanceof Function&&(a instanceof Function?e.event("addSuccess",b):e.event("addSuccess",b,a));a instanceof Function&&e.event("addFail",a,c);c instanceof Function&&e.event("addFail",c,f);return this};this.getObservable=function(){return f};this.getStateMachine=function(){return e}}});
define("StateMachine",["Tools"],function(a){function d(){var d={};this.add=function(a,e,f,b){var g=[];if(d[a])return false;return typeof a=="string"&&typeof e=="function"?(g[0]=e,typeof f=="object"&&(g[1]=f),typeof f=="string"&&(g[2]=f),typeof b=="string"&&(g[2]=b),d[a]=g,true):false};this.has=function(a){return!!d[a]};this.get=function(a){return d[a]||false};this.event=function e(e){var f=d[e];return f?(f[0].apply(f[1],a.toArray(arguments).slice(1)),f[2]):false}}return function(h,c){var e={},f="";
this.init=function(a){return e[a]?(f=a,true):false};this.add=function(a){return e[a]?false:e[a]=new d};this.get=function(a){return e[a]};this.getCurrent=function(){return f};this.event=function(b){var g;g=e[f].event.apply(e[f].event,a.toArray(arguments));return g===false?false:(g&&(e[f].event("exit"),f=g,e[f].event("entry")),true)};a.loop(c,function(a,g){var c=this.add(g);a.forEach(function(a){c.add.apply(null,a)})},this);this.init(h)}});
define("Store",["Observable","Tools"],function(a,d){return function(h){var c=d.clone(h)||{},e=new a,f=new a,b=function(a){var b=d.objectsDiffs(a,c);["updated","deleted","added"].forEach(function(a){b[a].forEach(function(b){e.notify(a,b,c[b]);f.notify(b,c[b],a)})})};this.getNbItems=function(){return c instanceof Array?c.length:d.count(c)};this.get=function(a){return c[a]};this.has=function(a){return c.hasOwnProperty(a)};this.set=function(a,b){var d;return typeof a!="undefined"?(d=this.has(a),c[a]=
b,d=d?"updated":"added",e.notify(d,a,c[a]),f.notify(a,c[a],d),true):false};this.update=function(a,b,c){var h;return this.has(a)?(h=this.get(a),d.setNestedProperty(h,b,c),e.notify("updated",b,c),f.notify(a,h,"updated"),true):false};this.del=function(a){return this.has(a)?(this.alter("splice",a,1)||(delete c[a],e.notify("deleted",a),f.notify(a,c[a],"deleted")),true):false};this.delAll=function(a){return a instanceof Array?(a.sort(d.compareNumbers).reverse().forEach(this.del,this),true):false};this.alter=
function(a){var e,f;return c[a]?(f=d.clone(c),e=c[a].apply(c,Array.prototype.slice.call(arguments,1)),b(f),e):false};this.watch=function(a,b,c){return e.watch(a,b,c)};this.unwatch=function(a){return e.unwatch(a)};this.getStoreObservable=function(){return e};this.watchValue=function(a,b,c){return f.watch(a,b,c)};this.unwatchValue=function(a){return f.unwatch(a)};this.getValueObservable=function(){return f};this.loop=function(a,b){d.loop(c,a,b)};this.reset=function(a){if(a instanceof Object){var e=
d.clone(c);c=d.clone(a)||{};b(e);return true}else return false};this.toJSON=function(){return JSON.stringify(c)}}});
define("Tools",function(){return{getGlobal:function(){return function(){return this}.call(null)},mixin:function(a,d,h){this.loop(a,function(c,e){if(!d[e]||!h)d[e]=a[e]});return d},count:function(a){var d=0;this.loop(a,function(){d++});return d},compareObjects:function(a,d){return Object.getOwnPropertyNames(a).sort().join("")==Object.getOwnPropertyNames(d).sort().join("")},compareNumbers:function(a,d){return a>d?1:a<d?-1:0},toArray:function(a){return Array.prototype.slice.call(a)},loop:function(a,
d,h){var c;if(a instanceof Object&&d instanceof Function){if(a instanceof Array)for(c=0;c<a.length;c++)d.call(h,a[c],c,a);else for(c in a)a.hasOwnProperty(c)&&d.call(h,a[c],c,a);return true}else return false},objectsDiffs:function(a,d){if(a instanceof Object&&d instanceof Object){var h=[],c=[],e=[],f=[];this.loop(d,function(b,e){typeof a[e]=="undefined"?f.push(e):b!==a[e]?c.push(e):b===a[e]&&h.push(e)});this.loop(a,function(a,c){typeof d[c]=="undefined"&&e.push(c)});return{updated:c,unchanged:h,added:f,
deleted:e}}else return false},jsonify:function(a){return a instanceof Object?JSON.parse(JSON.stringify(a)):false},clone:function(a){return a instanceof Array?a.slice(0):typeof a=="object"&&a!==null&&!(a instanceof RegExp)?this.mixin(a,{}):false},getNestedProperty:function(a,d){return a&&a instanceof Object?typeof d=="string"&&d!=""?d.split(".").reduce(function(a,c){return a&&a[c]},a):typeof d=="number"?a[d]:a:a},setNestedProperty:function(a,d,h){if(a&&a instanceof Object)if(typeof d=="string"&&d!=
""){var c=d.split(".");return c.reduce(function(a,d,b){a[d]=a[d]||{};c.length==b+1&&(a[d]=h);return a[d]},a)}else return typeof d=="number"?(a[d]=h,a[d]):a;else return a}}});
define("Transport",["Store","Tools"],function(a,d){return function(a){var c=null;this.setReqHandlers=function(a){return a instanceof Object?(c=a,true):false};this.getReqHandlers=function(){return c};this.request=function(a,d,b,g){return c.has(a)&&typeof d=="object"?(c.get(a)(d,function(){b&&b.apply(g,arguments)}),true):false};this.listen=function(a,f,b,g){if(c.has(a)&&typeof f=="object"&&typeof f.path=="string"&&typeof b=="function"){var h=function(){b.apply(g,arguments)},i;d.mixin({__keepalive__:true,
method:"get"},f);i=c.get(a)(f,h,h);return function(){i.func.call(i.scope)}}else return false};this.setReqHandlers(a)}});
