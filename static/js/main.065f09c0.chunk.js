(this["webpackJsonpreact-hex-flower-engine"]=this["webpackJsonpreact-hex-flower-engine"]||[]).push([[0],{114:function(t,e){},116:function(t,e){},13:function(t,e,n){t.exports={toolbar:"Toolbar_toolbar__1Bm9j",list:"Toolbar_list__27HlN",listItem:"Toolbar_listItem__2tFam",roll:"Toolbar_roll__1-gep"}},150:function(t,e){},151:function(t,e){},16:function(t,e,n){t.exports={outline:"Hex_outline__3Ej-P",hex:"Hex_hex__32sNz",activeHex:"Hex_activeHex__32HfI",highlightedHex:"Hex_highlightedHex__22cpa"}},194:function(t,e,n){"use strict";n.r(e);var o=n(0),i=n.n(o),a=n(90),d=n.n(a),u=(n(97),n(12)),p=n(16),l=n.n(p),c=function(t){var e=t.hex,n=t.hexAction,o=t.active,a=void 0!==o&&o,d=t.highlighted,u=void 0!==d&&d,p=[l.a.outline],c=[l.a.hex];return a&&(c.push(l.a.activeHex),p.push(l.a.highlightedHex)),u&&p.push(l.a.highlightedHex),i.a.createElement("button",{onClick:function(){"function"===typeof n&&n(e)},className:p.join(" "),disabled:a},i.a.createElement("div",{className:c.join(" ")},e.id))},r=n(91),g=n.n(r),f=function(t){var e=t.engine,n=t.setActiveHex,o=t.activeHex,a=e.nodes.find((function(t){return t.id===o})),d=(null===a||void 0===a?void 0:a.map)?Object.keys(a.map).reduce((function(t,e){return t.push(a.map[e]),t}),[]):[];return i.a.createElement("div",{className:g.a.grid},e.nodes.map((function(t){return i.a.createElement(c,{key:"hex-".concat(t.id),hex:t,hexAction:function(){console.log("setting active hex:",t.id),n(t.id)},active:t.id===o,highlighted:d.indexOf(t.id)>-1})})))},h=n(45),w=n.n(h),s={2:"upRight",3:"upRight",4:"downRight",5:"downRight",6:"down",7:"down",8:"downLeft",9:"downLeft",10:"upLeft",11:"upLeft",12:"up"},m={id:"00001",name:"STK Campaign Weather",directions:s,nodes:[{id:1,map:{up:4,upRight:3,downRight:5,down:1,downLeft:7,upLeft:2}},{id:2,map:{up:6,upRight:4,downRight:1,down:17,downLeft:14,upLeft:5}},{id:3,map:{up:8,upRight:7,downRight:11,down:18,downLeft:1,upLeft:4}},{id:4,map:{up:9,upRight:8,downRight:3,down:1,downLeft:2,upLeft:6}},{id:5,map:{up:11,upRight:6,downRight:2,down:12,downLeft:15,upLeft:1}},{id:6,map:{up:10,upRight:9,downRight:4,down:2,downLeft:5,upLeft:11}},{id:7,map:{up:14,upRight:1,downRight:12,down:15,downLeft:3,upLeft:8}},{id:8,map:{up:13,upRight:14,downRight:7,down:3,downLeft:4,upLeft:9}},{id:9,map:{up:16,upRight:13,downRight:8,down:4,downLeft:6,upLeft:10}},{id:10,map:{up:17,upRight:16,downRight:9,down:6,downLeft:11,upLeft:12}},{id:11,map:{up:12,upRight:10,downRight:6,down:5,downLeft:18,upLeft:3}},{id:12,map:{up:5,upRight:17,downRight:10,down:11,downLeft:19,upLeft:7}},{id:13,map:{up:18,upRight:15,downRight:14,down:8,downLeft:9,upLeft:16}},{id:14,map:{up:15,upRight:2,downRight:17,down:7,downLeft:8,upLeft:13}},{id:15,map:{up:7,upRight:5,downRight:19,down:14,downLeft:13,upLeft:18}},{id:16,map:{up:19,upRight:18,downRight:13,down:9,downLeft:10,upLeft:17}},{id:17,map:{up:2,upRight:19,downRight:16,down:10,downLeft:12,upLeft:14}},{id:18,map:{up:3,upRight:11,downRight:15,down:13,downLeft:16,upLeft:19}},{id:19,map:{up:16,upRight:18,downRight:18,down:16,downLeft:17,upLeft:17}}],start:9},R={id:"00000",name:"Standard Hex Flower Engine",directions:s,nodes:[{id:1,map:{up:4,upRight:3,downRight:3,down:1,downLeft:2,upLeft:2}},{id:2,map:{up:6,upRight:4,downRight:1,down:17,downLeft:14,upLeft:5}},{id:3,map:{up:8,upRight:7,downRight:11,down:18,downLeft:1,upLeft:4}},{id:4,map:{up:9,upRight:8,downRight:3,down:1,downLeft:2,upLeft:6}},{id:5,map:{up:11,upRight:6,downRight:2,down:12,downLeft:15,upLeft:1}},{id:6,map:{up:10,upRight:9,downRight:4,down:2,downLeft:5,upLeft:11}},{id:7,map:{up:14,upRight:1,downRight:12,down:15,downLeft:3,upLeft:8}},{id:8,map:{up:13,upRight:14,downRight:7,down:3,downLeft:4,upLeft:9}},{id:9,map:{up:16,upRight:13,downRight:8,down:4,downLeft:6,upLeft:10}},{id:10,map:{up:17,upRight:16,downRight:9,down:6,downLeft:11,upLeft:12}},{id:11,map:{up:12,upRight:10,downRight:6,down:5,downLeft:18,upLeft:3}},{id:12,map:{up:5,upRight:17,downRight:10,down:11,downLeft:19,upLeft:7}},{id:13,map:{up:18,upRight:15,downRight:14,down:8,downLeft:9,upLeft:16}},{id:14,map:{up:15,upRight:2,downRight:17,down:7,downLeft:8,upLeft:13}},{id:15,map:{up:7,upRight:5,downRight:19,down:14,downLeft:13,upLeft:18}},{id:16,map:{up:19,upRight:18,downRight:13,down:9,downLeft:10,upLeft:17}},{id:17,map:{up:2,upRight:19,downRight:16,down:10,downLeft:12,upLeft:14}},{id:18,map:{up:3,upRight:11,downRight:15,down:13,downLeft:16,upLeft:19}},{id:19,map:{up:19,upRight:19,downRight:18,down:16,downLeft:17,upLeft:19}}],start:1},L="ENGINE_STORE",E="ENGINE",v="CURRENT_ENGINE",_="".concat("HEX_FLOWER_ENGINE","__").concat(E),N="".concat("HEX_FLOWER_ENGINE","__").concat(v),b="".concat("HEX_FLOWER_ENGINE","__").concat(L),x="RUN_ENGINE",O="RANDOM_HEX",S=n(13),I=n.n(S),H=function(t){var e=t.setRoll,n=t.currentRoll,o=t.engines,a=t.setCurrentEngine;return i.a.createElement("nav",{className:I.a.toolbar},i.a.createElement("ul",{className:I.a.list},i.a.createElement("li",{className:I.a.listItem},i.a.createElement("button",{onClick:function(){if("function"===typeof e)try{var t=new w.a("sum(2d6)").result.total;e({type:x,total:t})}catch(n){console.error(n)}},disabled:n},"Run Engine (2d6)")),i.a.createElement("li",{className:I.a.listItem},i.a.createElement("button",{onClick:function(){if("function"===typeof e)try{var t=new w.a("1d19"),n=Object(u.a)(t.result.total,1)[0];e({type:O,total:n})}catch(o){console.error(o)}},disabled:n},"Random (1d19)")),i.a.createElement("li",{className:I.a.listItem},i.a.createElement("label",{htmlFor:"choose-engine"},"Engine"),i.a.createElement("select",{id:"choose-engine",onChange:function(t){var e=t.target.value;console.log("NEW ENGINE:",e);var n=JSON.parse(localStorage.getItem("".concat(_,"_").concat(e)));(null===n||void 0===n?void 0:n.id)&&a(n)},disabled:o.length<2},o.map((function(t){var e=t.id,n=t.name;return i.a.createElement("option",{key:"engine-".concat(e),value:e},n)}))))),n?i.a.createElement("p",{className:I.a.roll},"Roll: ",n.total):i.a.createElement(i.a.Fragment,null))},j=n(46),y=n.n(j),k=[R,m],F=function(){var t=Object(o.useState)(null),e=Object(u.a)(t,2),n=e[0],a=e[1],d=Object(o.useState)(null),p=Object(u.a)(d,2),l=p[0],c=p[1],r=Object(o.useState)(null),g=Object(u.a)(r,2),h=g[0],w=g[1],s=Object(o.useState)([]),m=Object(u.a)(s,2),R=m[0],L=m[1];return Object(o.useEffect)((function(){var t=JSON.parse(localStorage.getItem(N));console.log(localStorage.getItem(b));var e=JSON.parse(localStorage.getItem(b));Array.isArray(e)&&e.length?L(e):(L(k),localStorage.setItem(b,JSON.stringify(k.map((function(t){return{id:t.id,name:t.name}}))))),(null===t||void 0===t?void 0:t.id)?a(t):a(k[0])}),[]),Object(o.useEffect)((function(){R.forEach((function(t){var e="".concat(_,"_").concat(t.id),n=JSON.parse(localStorage.getItem(e));(null===n||void 0===n?void 0:n.id)||localStorage.setItem(e,JSON.stringify(t))}))}),[R.length]),Object(o.useEffect)((function(){(null===n||void 0===n?void 0:n.id)&&(localStorage.setItem(N,JSON.stringify(n)),(null===n||void 0===n?void 0:n.start)&&c(n.start))}),[null===n||void 0===n?void 0:n.id]),Object(o.useEffect)((function(){(null===n||void 0===n?void 0:n.id)&&(n.start=l)}),[l]),Object(o.useEffect)((function(){if(null===n||void 0===n?void 0:n.start){var t=JSON.stringify(n);localStorage.setItem("".concat(_,"_").concat(n.id),t),localStorage.setItem(N,t)}}),[null===n||void 0===n?void 0:n.start]),Object(o.useEffect)((function(){if(null===h||void 0===h?void 0:h.total){switch(h.type){case O:c(h.total);break;case x:default:var t=n.directions[h.total],e=n.nodes.find((function(t){return t.id===n.start}));if(t&&e){var o=e.map[t];o&&c(o)}}setTimeout((function(){w(null)}),1e3)}}),[null===h||void 0===h?void 0:h.total]),i.a.createElement(i.a.Fragment,null,i.a.createElement("section",{className:y.a.container},i.a.createElement("h1",{className:y.a.heading},"Hex Flower Engine"),(null===n||void 0===n?void 0:n.id)?i.a.createElement(f,{engine:n,setActiveHex:c,activeHex:l}):i.a.createElement(i.a.Fragment,null)),(null===n||void 0===n?void 0:n.id)?i.a.createElement(H,{setRoll:w,currentRoll:h,engines:R,setCurrentEngine:a}):i.a.createElement(i.a.Fragment,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));d.a.render(i.a.createElement(i.a.StrictMode,null,i.a.createElement(F,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()})).catch((function(t){console.error(t.message)}))},46:function(t,e,n){t.exports={container:"App_container__eSJ6i",heading:"App_heading__2UL9e"}},91:function(t,e,n){t.exports={grid:"Grid_grid__24j1p"}},92:function(t,e,n){t.exports=n(194)},97:function(t,e,n){}},[[92,1,2]]]);
//# sourceMappingURL=main.065f09c0.chunk.js.map