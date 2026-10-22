const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
const o=await p.evaluate(()=>{const l=document.querySelector('[data-track-id="sfx"] [data-grid-seconds]');const r=l.getBoundingClientRect();const x=r.left+15*40;return [r.top+r.height-4,r.top+r.height/2].map(y=>{const e=document.elementFromPoint(x,y);return{y,isLane:e===l,tag:e.tagName,tid:e.getAttribute('data-testid'),cls:(e.className||'').toString().slice(0,80)}})});
console.log(JSON.stringify(o,null,1));await s.browser.close();})();
