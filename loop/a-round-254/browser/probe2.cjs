const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const OUT=__dirname;
(async()=>{const browser=await chromium.launch();const R={};
for (const [w,h] of [[1440,900],[1280,720]]){
 const tag=`${w}x${h}`;const r={};R[tag]=r;
 const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});const page=await ctx.newPage();
 await page.goto('http://127.0.0.1:5173/studio-lab');
 await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:150000});
 await sleep(800);
 await page.locator('[data-source-id="demo-stem-pulse"]').first().click();await sleep(250);await page.locator('button',{hasText:/^Add/}).first().click();await sleep(1000);
 await page.evaluate(()=>document.activeElement&&document.activeElement.blur());for(let i=0;i<4;i++){await page.keyboard.press('Equal');await sleep(150);}
 const ph0=await page.locator('[data-testid="arrangement-playhead"]').boundingBox();const x0=ph0.x+ph0.width/2;
 const sfx=await page.evaluate(()=>{const b=document.querySelector('[data-track-id="sfx"]').getBoundingClientRect();return {y:b.y,h:b.height,x:b.x,w:b.width};});
 const cy=sfx.y+sfx.h/2;const pps=97.7;
 r.sfxLane=sfx;r.x0=x0;
 await page.mouse.click(x0+2*pps,cy);await sleep(300);
 // contrast with opaque walk (skip any alpha<1 colour), both lines + handle hidden
 r.contrast=await page.evaluate(()=>{const l=document.querySelector('[data-testid="arrangement-insert-marker"]');const hide=[l,document.querySelector('[data-testid="arrangement-playhead"]'),document.querySelector('[data-testid="arrangement-playhead-handle"]')].filter(Boolean);hide.forEach(e=>e.style.visibility='hidden');const b=l.getBoundingClientRect();
  const opaque=(c)=>{if(!c)return false;if(c.startsWith('rgb('))return true;const m=c.match(/\/\s*([\d.]+)\)|rgba\([^)]*,\s*([\d.]+)\)/);return m?Number(m[1]??m[2])>=1:false;};
  const probe=(label,y)=>{let e=document.elementFromPoint(b.x+b.width/2,y);const first=e&&(e.getAttribute('data-testid')||e.getAttribute('data-track-id')||e.tagName);const layers=[];while(e){const c=getComputedStyle(e).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'){layers.push(c);if(opaque(c))return {label,first,bg:c,translucentAbove:layers.slice(0,-1)};}e=e.parentElement;}return {label,first,bg:null,layers};};
  const out=[];for(const t of ['sfx','music','video']){const lane=document.querySelector(`[data-track-id="${t}"]`);if(lane){const lb=lane.getBoundingClientRect();out.push(probe(t,lb.y+lb.height/2));}}
  const ruler=document.querySelector('[data-testid="arrangement-ruler"]');if(ruler){const rb=ruler.getBoundingClientRect();out.push(probe('ruler',rb.y+rb.height/2));}
  out.push(probe('line-top+4',b.y+4));hide.forEach(e=>e.style.visibility='');return out;});
 // range recipe and clear diagnosis
 const music=await page.evaluate(()=>{const c=document.querySelector('[data-track-id="music"] [data-clip-id]');const b=c.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};});
 const ry=music.y+music.h*0.7;await page.mouse.move(x0+5*pps,ry);await page.mouse.down();await page.mouse.move(x0+6*pps,ry,{steps:5});await page.mouse.move(x0+7*pps,ry,{steps:5});await page.mouse.up();await sleep(300);
 r.rangeSet={count:await page.locator('[data-testid="arrangement-range"]').count(),lineHidden:await page.evaluate(()=>document.querySelector('[data-testid="arrangement-insert-marker"]').hidden)};
 for (const t of [8,3]){const x=x0+t*pps;
  const tgt=await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return {el:e&&(e.getAttribute('data-testid')||e.tagName),lane:e&&e.closest('[data-track-id]')&&e.closest('[data-track-id]').getAttribute('data-track-id'),cls:e&&String(e.className).slice(0,80),vw:innerWidth};},[x,cy]);
  r[`clear${t}`]={x,target:tgt};
  if(tgt.lane==='sfx'){await page.mouse.click(x,cy);await sleep(300);r[`clear${t}`].after={count:await page.locator('[data-testid="arrangement-range"]').count(),lineHidden:await page.evaluate(()=>document.querySelector('[data-testid="arrangement-insert-marker"]').hidden),marker:await page.evaluate(()=>document.querySelector('[data-testid="arrangement-insert-marker"]').getAttribute('data-insert-marker'))};break;}}
 await page.screenshot({path:`${OUT}/${tag}-range-cleared.png`});
 // zoom vs ruler: put marker at 2 s, then '-' and '=' and compare with ruler label 00:02 position
 await page.mouse.click(x0+2*pps,cy);await sleep(300);await page.evaluate(()=>document.activeElement&&document.activeElement.blur());
 const snap=async(label)=>page.evaluate((label)=>{const l=document.querySelector('[data-testid="arrangement-insert-marker"]');const lb=l.getBoundingClientRect();const p=document.querySelector('[data-testid="arrangement-playhead"]').getBoundingClientRect();
   const zoom=document.querySelector('[data-testid="arrangement-zoom"], [data-px-per-second]');const ticks=[...document.querySelectorAll('[data-testid="arrangement-ruler"] *')].filter(e=>e.children.length===0&&/^(0?0:)?0?2(\.0+)?$|^0:02$|^00:02$|^2s?$/.test((e.textContent||'').trim())).map(e=>({t:e.textContent.trim(),x:e.getBoundingClientRect().x}));
   return {label,marker:l.getAttribute('data-insert-marker'),lineX:lb.x,left:l.style.left,pps:zoom&&zoom.getAttribute('data-px-per-second'),ticks:ticks.slice(0,3)};},label);
 r.zoom=[await snap('start')];
 for (const k of ['Minus','Minus','Equal']){await page.keyboard.press(k);await sleep(300);r.zoom.push(await snap(k));}
 // scroll timeline
 await page.mouse.move(x0+3*pps,cy);await page.mouse.wheel(0,0);await page.keyboard.down('Shift');await page.mouse.wheel(0,300);await page.keyboard.up('Shift');await sleep(400);r.zoom.push(await snap('shift-wheel'));
 // Home during playback
 await page.mouse.click(x0+3*pps,cy);await sleep(200);await page.keyboard.press('Space');await sleep(700);
 const clockBefore=await page.evaluate(()=>document.querySelector('[data-testid="arrangement-position"]').textContent);
 await page.keyboard.press('Home');await sleep(500);
 r.homePlaying={clockBefore,clockAfter:await page.evaluate(()=>document.querySelector('[data-testid="arrangement-position"]').textContent),marker:await page.evaluate(()=>document.querySelector('[data-testid="arrangement-insert-marker"]').getAttribute('data-insert-marker')),playing:await page.locator('button[title^="Pause"]').count()};
 await page.keyboard.press('Space');
 await page.screenshot({path:`${OUT}/${tag}-after-home.png`});
 await ctx.close();}
fs.writeFileSync(`${OUT}/probe2.json`,JSON.stringify(R,null,1));await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
