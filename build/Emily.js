/*
 Emily http://flams.github.com/emily

 The MIT License (MIT)

 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBStore",["Store","StateMachine","Tools","Promise"],function(b,e,h,f){function c(){var c=null,a={},d=new f,b={getView:function(){a.query=a.query||{};a.query.update_seq=true;c.request("CouchDB",{method:"GET",path:"/"+a.database+"/_design/"+a.design+"/_view/"+a.view,query:a.query},function(d){var b=JSON.parse(d);if(b.rows)this.reset(b.rows),i.event("subscribeToViewChanges",b.update_seq);else throw Error("CouchDBStore ["+a.database+", "+a.design+", "+a.view+"].sync() failed: "+d);},this)},
getDocument:function(){c.request("CouchDB",{method:"GET",path:"/"+a.database+"/"+a.document,query:a.query},function(a){a=JSON.parse(a);a._id?(this.reset(a),i.event("subscribeToDocumentChanges")):d.reject(this)},this)},getBulkDocuments:function(){var d={path:"/"+a.database+"/_all_docs",query:a.query},b;a.keys instanceof Array?(d.method="POST",d.data=JSON.stringify({keys:a.keys}),d.headers={"Content-Type":"application/json"},b=d.data):(d.method="GET",b=JSON.stringify(a.query));a.query.include_docs=
true;a.query.update_seq=true;c.request("CouchDB",d,function(d){var c=JSON.parse(d);if(c.rows)this.reset(c.rows),i.event("subscribeToBulkChanges",c.update_seq);else throw Error('CouchDBStore.sync("'+a.database+'", '+b+") failed: "+d);},this)},createDocument:function(d){c.request("CouchDB",{method:"PUT",path:"/"+a.database+"/"+a.document,headers:{"Content-Type":"application/json"},data:this.toJSON()},function(a){a=JSON.parse(a);a.ok?(d.resolve(a),i.event("subscribeToDocumentChanges")):d.reject(a)})},
subscribeToViewChanges:function(d){h.mixin({feed:"continuous",heartbeat:2E4,since:d},a.query);this.stopListening=c.listen("CouchDB",{path:"/"+a.database+"/_changes",query:a.query},function(a){if(a=="\n")return false;var a=JSON.parse(a),d;d=a.deleted?"delete":a.changes[0].rev.search("1-")==0?"add":"change";i.event(d,a.id)},this)},subscribeToDocumentChanges:function(){this.stopListening=c.listen("CouchDB",{path:"/"+a.database+"/_changes",query:{feed:"continuous",heartbeat:2E4}},function(d){if(d=="\n")return false;
d=JSON.parse(d);d.id==a.document&&d.changes.pop().rev!=this.get("_rev")&&(d.deleted?i.event("deleteDoc"):i.event("updateDoc"))},this)},subscribeToBulkChanges:function(d){h.mixin({feed:"continuous",heartbeat:2E4,since:d,include_docs:true},a.query);this.stopListening=c.listen("CouchDB",{path:"/"+a.database+"/_changes",query:a.query},function(a){if(a=="\n")return false;var a=JSON.parse(a),d;d=a.changes[0].rev.search("1-")==0?"bulkAdd":a.deleted?"delete":"bulkChange";i.event(d,a.id,a.doc)},this)},updateDocInStore:function(d){c.request("CouchDB",
{method:"GET",path:"/"+a.database+"/_design/"+a.design+"/_view/"+a.view,query:a.query},function(a){JSON.parse(a).rows.some(function(a,b){a.id==d?this.set(b,a):a.id||this.set(b,a)},this)},this)},addBulkDocInStore:function(d){if(a.query.startkey||a.query.endkey)a.query.include_docs=true,a.query.update_seq=true,c.request("CouchDB",{method:"GET",path:"/"+a.database+"/_all_docs",query:a.query},function(a){JSON.parse(a).rows.forEach(function(a,b){a.id==d&&this.alter("splice",b,0,a.doc)},this)},this);else return false},
updateBulkDocInStore:function(a,d){this.loop(function(b,c){b.id==a&&this.set(c,d)},this)},removeDocInStore:function(a){this.loop(function(d,b){d.id==a&&this.del(b)},this)},addDocInStore:function(d){c.request("CouchDB",{method:"GET",path:"/"+a.database+"/_design/"+a.design+"/_view/"+a.view,query:a.query},function(a){JSON.parse(a).rows.some(function(a,b){a.id==d&&this.alter("splice",b,0,a)},this)},this)},updateDoc:function(){c.request("CouchDB",{method:"GET",path:"/"+a.database+"/"+a.document},function(a){this.reset(JSON.parse(a))},
this)},deleteDoc:function(){this.reset({})},updateDatabase:function(d){c.request("CouchDB",{method:"PUT",path:"/"+a.database+"/"+a.document,headers:{"Content-Type":"application/json"},data:this.toJSON()},function(a){a=JSON.parse(a);a.ok?d.resolve(a):d.reject(a)})},updateDatabaseWithBulkDoc:function(d){var b=[];this.loop(function(a){b.push(a.doc)});c.request("CouchDB",{method:"POST",path:"/"+a.database+"/_bulk_docs",headers:{"Content-Type":"application/json"},data:JSON.stringify({docs:b})},function(a){d.resolve(JSON.parse(a))})},
removeFromDatabase:function(){c.request("CouchDB",{method:"DELETE",path:"/"+a.database+"/"+a.document,query:{rev:this.get("_rev")}})},resolve:function(){d.resolve(this)},unsync:function(){this.stopListening();delete this.stopListening}},i=new e("Unsynched",{Unsynched:[["getView",b.getView,this,"Synched"],["getDocument",b.getDocument,this,"Synched"],["getBulkDocuments",b.getBulkDocuments,this,"Synched"]],Synched:[["updateDatabase",b.createDocument,this],["subscribeToViewChanges",b.subscribeToViewChanges,
this,"Listening"],["subscribeToDocumentChanges",b.subscribeToDocumentChanges,this,"Listening"],["subscribeToBulkChanges",b.subscribeToBulkChanges,this,"Listening"],["unsync",function(){},"Unsynched"]],Listening:[["entry",b.resolve,this],["change",b.updateDocInStore,this],["bulkAdd",b.addBulkDocInStore,this],["bulkChange",b.updateBulkDocInStore,this],["delete",b.removeDocInStore,this],["add",b.addDocInStore,this],["updateDoc",b.updateDoc,this],["deleteDoc",b.deleteDoc,this],["updateDatabase",b.updateDatabase,
this],["updateDatabaseWithBulkDoc",b.updateDatabaseWithBulkDoc,this],["removeFromDatabase",b.removeFromDatabase,this],["unsync",b.unsync,this,"Unsynched"]]});this.sync=function(a,b,c,f){if(typeof a=="string"&&typeof b=="string"&&typeof c=="string")return this.setSyncInfo(a,b,c,f),i.event("getView"),d;else if(typeof a=="string"&&typeof b=="string"&&typeof c!="string")return this.setSyncInfo(a,b,c),i.event("getDocument"),d;else if(typeof a=="string"&&b instanceof Object)return this.setSyncInfo(a,b),
i.event("getBulkDocuments"),d;return false};this.setSyncInfo=function(d,b,c,f){if(typeof d=="string"&&typeof b=="string"&&typeof c=="string")return a.database=d,a.design=b,a.view=c,a.query=f,true;else if(typeof d=="string"&&typeof b=="string"&&typeof c!="string")return a.database=d,a.document=b,a.query=c,true;else if(typeof d=="string"&&b instanceof Object){a.database=d;a.query=b;if(a.query.keys instanceof Array)a.keys=a.query.keys,delete a.query.keys;return true}return false};this.getSyncInfo=function(){return a};
this.unsync=function(){return i.event("unsync")};this.upload=function(){var d=new f;if(a.document)return i.event("updateDatabase",d),d;else if(!a.view)return i.event("updateDatabaseWithBulkDoc",d),d;return false};this.remove=function(){return a.document?i.event("removeFromDatabase"):false};this.setTransport=function(a){return a&&typeof a.listen=="function"&&typeof a.request=="function"?(c=a,true):false};this.getStateMachine=function(){return i};this.getTransport=function(){return c};this.actions=
b}return function(){c.prototype=new b;return new c}});
define("Observable",["Tools"],function(b){return function(){var e={};this.watch=function(b,f,c){if(typeof f=="function"){var g=e[b]=e[b]||[];observer=[f,c];g.push(observer);return[b,g.indexOf(observer)]}else return false};this.unwatch=function(b){var f=b[0],b=b[1];return e[f]&&e[f][b]?(delete e[f][b],e[f].some(function(b){return!!b})||delete e[f],true):false};this.notify=function(h){var f=e[h],c;if(f){for(c=f.length;c--;)f[c]&&f[c][0].apply(f[c][1]||null,b.toArray(arguments).slice(1));return true}else return false};
this.hasObserver=function(b){return!(!b||!e[b[0]]||!e[b[0]][b[1]])};this.hasTopic=function(b){return!!e[b]};this.unwatchAll=function(b){e[b]?delete e[b]:e={};return true}}});
define("Promise",["Observable","StateMachine"],function(b,e){return function(){var h,f,c=new e("Unresolved",{Unresolved:[["resolve",function(a){h=a;g.notify("success",a)},"Resolved"],["reject",function(a){f=a;g.notify("fail",a)},"Rejected"],["addSuccess",function(a,d){g.watch("success",a,d)}],["addFail",function(a,d){g.watch("fail",a,d)}]],Resolved:[["addSuccess",function(a,d){a.call(d,h)}]],Rejected:[["addFail",function(a,d){a.call(d,f)}]]}),g=new b;this.resolve=function(a){return c.event("resolve",
a)};this.reject=function(a){return c.event("reject",a)};this.then=function(a,d,b,f){a instanceof Function&&(d instanceof Function?c.event("addSuccess",a):c.event("addSuccess",a,d));d instanceof Function&&c.event("addFail",d,b);b instanceof Function&&c.event("addFail",b,f);return this};this.getObservable=function(){return g};this.getStateMachine=function(){return c}}});
define("StateMachine",["Tools"],function(b){function e(){var e={};this.add=function(b,c,g,a){var d=[];if(e[b])return false;return typeof b=="string"&&typeof c=="function"?(d[0]=c,typeof g=="object"&&(d[1]=g),typeof g=="string"&&(d[2]=g),typeof a=="string"&&(d[2]=a),e[b]=d,true):false};this.has=function(b){return!!e[b]};this.get=function(b){return e[b]||false};this.event=function c(c){var g=e[c];return g?(g[0].apply(g[1],b.toArray(arguments).slice(1)),g[2]):false}}return function(h,f){var c={},g="";
this.init=function(a){return c[a]?(g=a,true):false};this.add=function(a){return c[a]?false:c[a]=new e};this.get=function(a){return c[a]};this.getCurrent=function(){return g};this.event=function(a){var d;d=c[g].event.apply(c[g].event,b.toArray(arguments));return d===false?false:(d&&(c[g].event("exit"),g=d,c[g].event("entry")),true)};b.loop(f,function(a,b){var c=this.add(b);a.forEach(function(a){c.add.apply(null,a)})},this);this.init(h)}});
define("Store",["Observable","Tools"],function(b,e){return function(h){var f=e.clone(h)||{},c=new b,g=new b,a=function(a){var b=e.objectsDiffs(a,f);["updated","deleted","added"].forEach(function(a){b[a].forEach(function(b){c.notify(a,b,f[b]);g.notify(b,f[b],a)})})};this.getNbItems=function(){return f instanceof Array?f.length:e.count(f)};this.get=function(a){return f[a]};this.has=function(a){return f.hasOwnProperty(a)};this.set=function(a,b){var e;return typeof a!="undefined"?(e=this.has(a),f[a]=
b,e=e?"updated":"added",c.notify(e,a,f[a]),g.notify(a,f[a],e),true):false};this.update=function(a,b,f){var h;return this.has(a)?(h=this.get(a),e.setNestedProperty(h,b,f),c.notify("updated",b,f),g.notify(a,h,"updated"),true):false};this.del=function(a){return this.has(a)?(this.alter("splice",a,1)||(delete f[a],c.notify("deleted",a),g.notify(a,f[a],"deleted")),true):false};this.delAll=function(a){return a instanceof Array?(a.sort(e.compareNumbers).reverse().forEach(this.del,this),true):false};this.alter=
function(b){var c,g;return f[b]?(g=e.clone(f),c=f[b].apply(f,Array.prototype.slice.call(arguments,1)),a(g),c):false};this.watch=function(a,b,f){return c.watch(a,b,f)};this.unwatch=function(a){return c.unwatch(a)};this.getStoreObservable=function(){return c};this.watchValue=function(a,b,c){return g.watch(a,b,c)};this.unwatchValue=function(a){return g.unwatch(a)};this.getValueObservable=function(){return g};this.loop=function(a,b){e.loop(f,a,b)};this.reset=function(b){if(b instanceof Object){var c=
e.clone(f);f=e.clone(b)||{};a(c);return true}else return false};this.toJSON=function(){return JSON.stringify(f)}}});
define("Tools",function(){return{getGlobal:function(){return function(){return this}.call(null)},mixin:function(b,e,h){this.loop(b,function(f,c){if(!e[c]||!h)e[c]=b[c]});return e},count:function(b){var e=0;this.loop(b,function(){e++});return e},compareObjects:function(b,e){return Object.getOwnPropertyNames(b).sort().join("")==Object.getOwnPropertyNames(e).sort().join("")},compareNumbers:function(b,e){return b>e?1:b<e?-1:0},toArray:function(b){return Array.prototype.slice.call(b)},loop:function(b,
e,h){var f,c;if(b instanceof Object&&typeof e=="function"){if(c=b.length)for(f=0;f<c;f++)e.call(h,b[f],f,b);else for(f in b)b.hasOwnProperty(f)&&e.call(h,b[f],f,b);return true}else return false},objectsDiffs:function(b,e){if(b instanceof Object&&e instanceof Object){var h=[],f=[],c=[],g=[];this.loop(e,function(a,c){typeof b[c]=="undefined"?g.push(c):a!==b[c]?f.push(c):a===b[c]&&h.push(c)});this.loop(b,function(a,b){typeof e[b]=="undefined"&&c.push(b)});return{updated:f,unchanged:h,added:g,deleted:c}}else return false},
jsonify:function(b){return b instanceof Object?JSON.parse(JSON.stringify(b)):false},clone:function(b){return b instanceof Array?b.slice(0):typeof b=="object"&&b!==null&&!(b instanceof RegExp)?this.mixin(b,{}):false},getNestedProperty:function(b,e){return b&&b instanceof Object?typeof e=="string"&&e!=""?e.split(".").reduce(function(b,f){return b&&b[f]},b):typeof e=="number"?b[e]:b:b},setNestedProperty:function(b,e,h){if(b&&b instanceof Object)if(typeof e=="string"&&e!=""){var f=e.split(".");return f.reduce(function(b,
e,a){b[e]=b[e]||{};f.length==a+1&&(b[e]=h);return b[e]},b)}else return typeof e=="number"?(b[e]=h,b[e]):b;else return b}}});
define("Transport",["Store","Tools"],function(b,e){return function(h){var f=null;this.setReqHandlers=function(c){return c instanceof b?(f=c,true):false};this.getReqHandlers=function(){return f};this.request=function(b,e,a,d){return f.has(b)&&typeof e=="object"?(f.get(b)(e,function(){a&&a.apply(d,arguments)}),true):false};this.listen=function(b,g,a,d){if(f.has(b)&&typeof g=="object"&&typeof g.path=="string"&&typeof a=="function"){var h=function(){a.apply(d,arguments)},i;e.mixin({__keepalive__:true,
method:"get"},g);i=f.get(b)(g,h,h);return function(){i.func.call(i.scope)}}else return false};this.setReqHandlers(h)}});
