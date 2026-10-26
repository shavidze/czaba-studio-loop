// disabled Clip Gain (detail panel open, no clip selected) at both viewports
const L=require('./lib.cjs');const {decode}=require('./png.cjs');const fs=require('fs');const path=require('path');
(async()=>{const b=await L.chromium.launch({args:['--disable-lcd-text']});const out={};
for(const W of [1440,1280]){const H=W===1440?900:720;const net=[];const o=await L.openCtx(b,{width:W,height:H},'cgdis'+W,net,{deviceScaleFactor:2});const p=o.page;
await p.goto(L.BASE+'/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await L.sleep(2500);
const t=p.locator('[data-testid=arrangement-detail-toggle]');if((await t.getAttribute('aria-expanded'))==='false'){await t.click();await L.sleep(800);}
const f=p.locator('[data-testid=arrangement-detail-clip-gain-fader]');await f.scrollIntoViewIfNeeded();await L.sleep(300);
const g=await f.evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,dis:el.disabled,val:el.value,op:getComputedStyle(el).opacity,fill:el.style.getPropertyValue('--studio-fader-fill'),title:el.title}});
const file=path.join(L.ROOT,'shots',`clipgain-disabled-${W}.png`);await p.screenshot({path:file,clip:{x:g.x-10,y:g.y-10,width:g.w+20,height:g.h+20}});
const I=decode(fs.readFileSync(file));const y=Math.round((10+g.h/2)*2);const row=[];for(let x=20;x<20+g.w*2;x+=4)row.push(I.px(x,y).slice(0,3).join(','));
// dimmed fill end: last px whose R-B > 30 (brass-ish)
let last=-1;for(let x=20;x<20+g.w*2;x++){const c=I.px(x,y);if(c[0]-c[2]>30)last=x;}
out[W]={...g,dimFillEndCss:+(g.x-10+(last+1)/2).toFixed(2),expectedCentreCss:+(g.x+7.5+(g.w-15)*Number(g.fill)).toFixed(2),rowSample:row.filter((_,i)=>i%6===0),net:net.map(n=>[n.errors.length,n.hydration.length])};await o.ctx.close();}
console.log(JSON.stringify(out,null,1));fs.writeFileSync(path.join(L.ROOT,'out','clipgain-disabled.json'),JSON.stringify(out,null,1));await b.close();})();
