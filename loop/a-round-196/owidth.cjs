const T='/home/runner/czaba-project/tmp/studio-real-loop/c-round-195/tools/';const X=require(T+'lib122.cjs');const {L}=X;const net=[];
(async()=>{const b=await L.chromium.launch({headless:true});const o=await L.openStudio(b,X.VPS[1440],'a196-ow',net,{deviceScaleFactor:2});const p=o.page;
const r=await p.evaluate(()=>{const rules=[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch{return []}});const g=rules.filter(x=>x.selectorText===':focus-visible').map(x=>x.style.outlineWidth+' | '+x.cssText);
const t=document.createElement('div');t.style.outline='1.5px solid red';document.body.appendChild(t);const c15=getComputedStyle(t).outlineWidth;t.style.outlineWidth='2.5px';const c25=getComputedStyle(t).outlineWidth;t.style.borderTop='1.5px solid red';const b15=getComputedStyle(t).borderTopWidth;t.remove();
return {declared:g,computed15:c15,computed25:c25,border15:b15,ua:navigator.userAgent,dpr:devicePixelRatio};});
console.log(JSON.stringify(r,null,1));await b.close();})();
