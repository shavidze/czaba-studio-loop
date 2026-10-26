const j=require(require('path').resolve(process.argv[2]));
const s=(o)=>JSON.stringify(o);
for(const [k,v] of Object.entries(j.cc)){ if(!v||!v.box) {console.log(k,s(v));continue;} console.log(k,s({box:v.box,radii:v.radii[0],pad:v.pad,bg:v.bg,comp:v.composite,surf:v.surface,color:v.colorRgb,it:v.innerText,svg:v.svgClass,svgBox:v.svgBox,label:v.label,title:v.title,hover:v.hover,active:v.active,crIF:v.crIconFill,crFS:v.crFillSurface,corners:v.px.corners.map(c=>c.c.join(',')),fill:v.px.fillPts.map(c=>c.c.join(',')),centre:v.px.centre,dark:v.px.darkestIconPx,off:v.px.iconCentreOff,scan:[v.scan.brass,v.scan.n,v.scan.masked]}));}
const f=j.focus; console.log("FOCUS",s({tabs:f.tabs,reached:f.reached,fv:f.info&&f.info.focusVisible,shadow:f.info&&f.info.boxShadow,ring:f.ring&&f.ring.map(r=>r.r+'/'+r.deg+':'+r.c.join(',')),corner:f.cornerWhileFocus}));
const b=j.beh; console.log("BEH click",s(b.click)); console.log("BEH space",s(b.space)); console.log("BEH focused",s(b.focusedPress)); console.log("BEH corner",s(b.corner),"undo",b.undo,b.undoRestored,"added",b.added, b.error||'');
console.log("A11Y",s(j.a11y));
for (const k of ['rest','final']) { const l=j.layout[k]; if(!l) continue; console.log("LAYOUT",k,s({row:l.row,lines:l.lines,next:l.next&&l.next.box,desc:l.descendants,scrollW:l.scrollW})); console.log(' kids',l.kids.map(x=>x.label.slice(0,10)+'@'+x.box.join(',')).join(' | ')); }
console.log(s(j.anon),j.anonCookies,'fonts',j.fonts,'net',s(j.net), j.error||'');
