import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:1440,height:900}}); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle',timeout:120000});
await p.evaluate(()=>{ window.__s=[]; const t0=performance.now(); const f=()=>{ const els=[...document.querySelectorAll('body *')].filter(e=>{const c=getComputedStyle(e);const o=+c.opacity;return o>0&&o<0.98&&e.getBoundingClientRect().width>300&&e.getBoundingClientRect().height>300;}); window.__s.push({t:Math.round(performance.now()-t0),path:location.pathname,anim:els.slice(0,3).map(e=>e.tagName+'.'+(e.dataset.testid||'')+':'+(+getComputedStyle(e).opacity).toFixed(2))}); if(performance.now()-t0<2500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
await p.getByRole('link',{name:/studio/i}).first().click(); await p.waitForTimeout(3000);
const s = (await p.evaluate(()=>window.__s)) ?? []; console.log('studio nav: __s lost =', s.length===0, 'url', p.url()); const withAnim=s.filter(x=>x.anim.length);
console.log('frames',s.length,'onStudioLabWithFade',s.filter(x=>x.path==='/studio-lab'&&x.anim.length).length,'onStudioLab',s.filter(x=>x.path==='/studio-lab').length,'onHomeWithFade',s.filter(x=>x.path==='/'&&x.anim.length).length, JSON.stringify(s.filter(x=>x.path==='/studio-lab'&&x.anim.length).slice(0,4)));
// positive control: store-internal nav
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.evaluate(()=>{ window.__s=[]; const t0=performance.now(); const f=()=>{ const els=[...document.querySelectorAll('body *')].filter(e=>{const c=getComputedStyle(e);const o=+c.opacity;return o>0&&o<0.98&&e.getBoundingClientRect().width>300&&e.getBoundingClientRect().height>300;}); window.__s.push({t:Math.round(performance.now()-t0),path:location.pathname,anim:els.slice(0,3).map(e=>e.tagName+':'+(+getComputedStyle(e).opacity).toFixed(2))}); if(performance.now()-t0<2500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
await p.getByRole('link',{name:/^(store|shop|sounds|products|about|contact|free)/i}).first().click(); await p.waitForTimeout(3000);
const s2 = (await p.evaluate(()=>window.__s)) ?? []; const w2=s2.filter(x=>x.anim.length); console.log('CONTROL frames',s2.length,'withBigFade',w2.length, JSON.stringify(w2.slice(0,4)), [...new Set(s2.map(x=>x.path))]);
await b.close();
