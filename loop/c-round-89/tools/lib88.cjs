// C round 88: HR-VISIBLE geometry for the export dialog sticky footer
const X=require('./lib87.cjs');const{L,sleep,blur}=X;const fs=require('fs');
// in-page geometry function; installed once per page
const GEOM_SRC=`window.__g88=function(tag){const t=document.querySelector('#arrangement-export-title');if(!t)return null;const d=t.closest('[role=dialog]');
 const foot=d.querySelector('[data-testid=arrangement-export-footer]');let pn=null;for(let e=(foot||t).parentElement;e;e=e.parentElement){const cs=getComputedStyle(e);if(/(auto|scroll)/.test(cs.overflowY)){pn=e;break;}}
 if(!pn)return{err:'no scroller'};const pr=pn.getBoundingClientRect();const top=pr.top+pn.clientTop,bot=top+pn.clientHeight;
 const R=r=>[+r.top.toFixed(1),+r.bottom.toFixed(1)];
 const vis=el=>{if(!el)return null;const r=el.getBoundingClientRect();const inBox=r.top>=top-0.5&&r.bottom<=bot+0.5&&r.bottom<=innerHeight+0.5;const cx=r.left+r.width/2,cy=r.top+r.height/2;const h=document.elementFromPoint(cx,cy);const hit=!!h&&(h===el||el.contains(h));return{r:R(r),inBox,hit,ok:inBox&&hit,hitTag:h?(h.dataset&&h.dataset.testid)||h.tagName:null};};
 const btns=[...d.querySelectorAll('button')];const busy=btns.find(b=>/მიმდინარეობს/.test(b.textContent));const exp=btns.find(b=>/ექსპორტი$/.test(b.textContent.trim()));const close=btns.find(b=>b.textContent.trim()==='დახურვა');
 const st=d.querySelector('[role=status],[role=alert]');const lab=d.querySelector('[data-testid=arrangement-export-progress-label]');const bar=d.querySelector('[data-testid=arrangement-export-progress]');const ov=d.querySelector('[data-testid=arrangement-export-overload]');
 const fr=foot&&foot.getBoundingClientRect();
 return{tag,t:Math.round(performance.now()),panel:R(pr),clientTop:pn.clientTop,ch:pn.clientHeight,sh:pn.scrollHeight,scrollTop:pn.scrollTop,footer:fr&&R(fr),footerSticky:foot&&getComputedStyle(foot).position,
  label:lab&&lab.textContent,value:bar&&bar.hasAttribute('value')?bar.getAttribute('value'):null,statusText:st&&st.textContent,statusRole:st&&st.getAttribute('role'),statusInFooter:!!(st&&foot&&foot.contains(st)),
  v:{status:vis(st),label:vis(lab),bar:vis(bar),busy:vis(busy),export:vis(exp),close:vis(close),overload:vis(ov)},closeDisabled:close?close.disabled:null,exportText:exp&&exp.textContent.trim(),busyText:busy&&busy.textContent.trim(),overloadText:ov&&ov.textContent};};`;
async function inst(p){await p.evaluate(GEOM_SRC);}
const geom=(p,tag)=>p.evaluate(t=>window.__g88(t),tag);
// MutationObserver sampler: one geometry sample per DOM change in the dialog (label/status/value changes)
async function moStart(p){await inst(p);await p.evaluate(()=>{const d=document.querySelector('#arrangement-export-title').closest('[role=dialog]');window.__mo88={s:[]};let last=0;
 const f=()=>{const g=window.__g88('mo');const prev=window.__mo88.s.at(-1);const k=g.label+'|'+g.statusText+'|'+(g.v.busy?1:0);if(!prev||prev.__k!==k||performance.now()-last>120){g.__k=k;window.__mo88.s.push(g);last=performance.now();}};
 const mo=new MutationObserver(f);mo.observe(d,{attributes:true,childList:true,characterData:true,subtree:true});window.__mo88.mo=mo;f();});}
async function moStop(p){return p.evaluate(()=>{window.__mo88.mo.disconnect();return window.__mo88.s;});}
// rAF sampler (VIS-SCROLL only)
async function rafStart(p){await inst(p);await p.evaluate(()=>{window.__raf88={s:[],run:true};const f=()=>{const g=window.__g88('raf');if(g&&!g.err){const d=document.querySelector('[data-testid=arrangement-export-footer]');
 if(d){const r=d.getBoundingClientRect();g.footHits=[0.15,0.5,0.85].map(fx=>{const h=document.elementFromPoint(r.left+r.width*fx,r.top+Math.min(r.height/2,r.height-4));return!!h&&d.contains(h);});
  const body=d.parentElement;const prevs=[...body.children].filter(c=>c!==d);const lastEl=prevs.at(-1);g.lastNonFooterBottom=lastEl?+lastEl.getBoundingClientRect().bottom.toFixed(1):null;}
 window.__raf88.s.push(g);}if(window.__raf88.run)requestAnimationFrame(f);};requestAnimationFrame(f);});}
async function rafStop(p){return p.evaluate(()=>{window.__raf88.run=false;return window.__raf88.s;});}
const phaseOf=X.phaseOf;
// a render sample is "good" when label, bar, busy and status all HR-VISIBLE
const renderOk=g=>!!(g&&g.v.label&&g.v.label.ok&&g.v.bar&&g.v.bar.ok&&g.v.busy&&g.v.busy.ok&&g.v.status&&g.v.status.ok);
function summarizeRender(samples){const ph={};for(const g of samples){if(!g.label)continue;const k=phaseOf(g.label);ph[k]||={n:0,ok:0,bad:[]};ph[k].n++;if(renderOk(g))ph[k].ok++;else if(ph[k].bad.length<3)ph[k].bad.push({label:g.label,scrollTop:g.scrollTop,v:g.v});}
 const scrolls=[...new Set(samples.map(g=>g.scrollTop))];return{phases:ph,scrollTops:scrolls,first:samples.find(g=>g.label)||null};}
// focus probe after each key: active element, rect vs footer
const focusProbe=p=>p.evaluate(()=>{const a=document.activeElement;const t=document.querySelector('#arrangement-export-title');const d=t&&t.closest('[role=dialog]');const f=d&&d.querySelector('[data-testid=arrangement-export-footer]');
 const r=a.getBoundingClientRect();const fr=f&&f.getBoundingClientRect();const inF=!!(f&&f.contains(a));let pn=null;for(let e=f&&f.parentElement;e;e=e.parentElement){if(/(auto|scroll)/.test(getComputedStyle(e).overflowY)){pn=e;break;}}
 return{inside:!!(d&&d.contains(a)),tag:a.tagName,id:a.dataset.testid||a.getAttribute('aria-label')||(a.textContent||'').trim().slice(0,24)||a.tagName,inFooter:inF,bottom:+r.bottom.toFixed(1),top:+r.top.toFixed(1),footerTop:fr?+fr.top.toFixed(1):null,covered:!inF&&fr?r.bottom>fr.top+0.5:false,scrollTop:pn?pn.scrollTop:null,containsFooter:!!(f&&a.contains(f))};});
async function tabCycle(p,n=6,{arrows=false}={}){const out=[];for(let i=0;i<n;i++){await p.keyboard.press('Tab');await sleep(120);const f=await focusProbe(p);out.push(f);
 if(arrows&&f.tag==='INPUT'){for(let k=0;k<3;k++){await p.keyboard.press('ArrowDown');await sleep(120);const g=await focusProbe(p);g.arrow=true;out.push(g);}for(let k=0;k<3;k++){await p.keyboard.press('ArrowUp');await sleep(100);}const h=await focusProbe(p);h.arrowBack=true;out.push(h);}}return out;}
module.exports={...X,GEOM_SRC,inst,geom,moStart,moStop,rafStart,rafStop,renderOk,summarizeRender,focusProbe,tabCycle};
