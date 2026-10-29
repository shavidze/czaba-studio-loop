const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const OUT=__dirname;
const lum=(c)=>{const m=c.match(/\d+(\.\d+)?/g).map(Number);const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
(async()=>{const browser=await chromium.launch();const R={base:'http://127.0.0.1:5173',when:new Date().toISOString()};
for (const [w,h] of [[1440,900],[1280,720]]) for (const rm of ['no-preference','reduce']){
 const tag=`${w}x${h}-${rm}`;const r={};R[tag]=r;
 const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:rm});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(R.base+'/studio-lab');
 await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:150000});
 await sleep(800);
 r.beforeAdd=await page.evaluate(()=>{const l=document.querySelectorAll('[data-testid="arrangement-insert-marker"]');const b=l[0]&&l[0].getBoundingClientRect();return {count:l.length,hidden:l[0]&&l[0].hidden,w:b&&b.width,h:b&&b.height};});
 await page.screenshot({path:`${OUT}/${tag}-empty.png`});
 await page.locator('[data-source-id="demo-stem-pulse"]').first().click();await sleep(250);await page.locator('button',{hasText:/^Add/}).first().click();await sleep(1000);
 await page.evaluate(()=>document.activeElement&&document.activeElement.blur());for(let i=0;i<4;i++){await page.keyboard.press('Equal');await sleep(150);}
 const ph0=await page.locator('[data-testid="arrangement-playhead"]').boundingBox();
 const lanes=await page.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(l=>{const b=l.getBoundingClientRect();return {track:l.getAttribute('data-track-id'),y:b.y,h:b.height};}));
 const sfx=lanes.find(l=>l.track==='sfx')||lanes[lanes.length-1];
 const pps=97.7; const x0=ph0.x+ph0.width/2;
 const cx=x0+2*pps, cy=sfx.y+sfx.h/2;
 r.clickTarget=await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);const lane=e&&e.closest('[data-track-id]');return {el:e&&(e.getAttribute('data-testid')||e.tagName),lane:lane&&lane.getAttribute('data-track-id'),scrub:!!(e&&e.closest('[data-testid="arrangement-bars-scrub-strip"]'))};},[cx,cy]);
 await page.mouse.click(cx,cy);await sleep(400);
 const measure=()=>page.evaluate(()=>{const ls=document.querySelectorAll('[data-testid="arrangement-insert-marker"]');const l=ls[0];const b=l.getBoundingClientRect();const cs=getComputedStyle(l);const p=document.querySelector('[data-testid="arrangement-playhead"]');const pb=p.getBoundingClientRect();
  return {count:ls.length,hidden:l.hidden,display:cs.display,x:b.x,w:b.width,h:b.height,bg:cs.backgroundColor,pe:cs.pointerEvents,anim:cs.animationName,opacity:cs.opacity,ariaHidden:l.getAttribute('aria-hidden'),tabindex:l.getAttribute('tabindex'),marker:l.getAttribute('data-insert-marker'),phX:pb.x,phW:pb.width,phH:pb.height,phBg:getComputedStyle(p).backgroundColor,playing:!!document.querySelector('button[aria-label="Pause"], button[title^="Pause"]'),clock:(document.querySelector('[data-testid="arrangement-position"]')||{}).textContent};});
 r.stoppedClick=await measure(); r.stoppedClick.expectedX=x0+2*pps-0; r.stoppedClick.dxFromLaneTime=r.stoppedClick.x+r.stoppedClick.w/2-(x0+2*pps);
 r.clickThrough=await page.evaluate(()=>{const l=document.querySelector('[data-testid="arrangement-insert-marker"]');const b=l.getBoundingClientRect();const sfx=document.querySelector('[data-track-id="sfx"]').getBoundingClientRect();const e=document.elementFromPoint(b.x+b.width/2,sfx.y+sfx.height/2);return {hitIsLine:e===l,lane:e&&e.closest('[data-track-id]')&&e.closest('[data-track-id]').getAttribute('data-track-id')};});
 const samples=[];for(let i=0;i<24;i++){samples.push(await page.evaluate(()=>getComputedStyle(document.querySelector('[data-testid="arrangement-insert-marker"]')).opacity));await sleep(100);}
 r.opacitySamples=samples.map(Number); r.opacityChanges=r.opacitySamples.reduce((n,v,i,a)=>n+(i&&v!==a[i-1]?1:0),0);
 r.contrast=await page.evaluate(()=>{const l=document.querySelector('[data-testid="arrangement-insert-marker"]');const p=document.querySelector('[data-testid="arrangement-playhead"]');const b=l.getBoundingClientRect();l.style.visibility='hidden';p.style.visibility='hidden';
  const bgAt=(y)=>{let e=document.elementFromPoint(b.x+b.width/2,y);const id=e&&(e.getAttribute('data-testid')||e.getAttribute('data-track-id')||e.tagName);while(e){const c=getComputedStyle(e).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'&&!/,\s*0\)$/.test(c))return {y,id,bg:c};e=e.parentElement;}return {y,id,bg:null};};
  const out=[];for(const t of ['sfx','music','video']){const lane=document.querySelector(`[data-track-id="${t}"]`);if(lane){const lb=lane.getBoundingClientRect();out.push({at:t,...bgAt(lb.y+lb.height/2)});}}
  out.push({at:'top+4',...bgAt(b.y+4)});l.style.visibility='';p.style.visibility='';return out;});
 r.contrast.forEach(c=>{if(c.bg)c.ratio=+ratio('rgb(236, 230, 218)',c.bg).toFixed(2);});
 await page.screenshot({path:`${OUT}/${tag}-stopped-2s.png`});
 await page.keyboard.press('Space');await sleep(1500);await page.keyboard.press('Space');await sleep(300);
 r.twoLines=await measure(); r.twoLines.dx=r.twoLines.phX+r.twoLines.phW/2-(r.twoLines.x+r.twoLines.w/2);
 await page.screenshot({path:`${OUT}/${tag}-two-lines.png`});
 await page.keyboard.press('Space');await sleep(120);r.replayClock=(await measure()).clock;
 await sleep(400);
 const cx6=x0+6*pps; await page.mouse.click(cx6,cy);await sleep(100);r.playingClick=await measure();
 await sleep(400);r.playingClickLater=await measure();
 await page.keyboard.press('Space');await sleep(300);
 // Home with mutation count
 await page.evaluate(()=>{window.__m=[];const l=document.querySelector('[data-testid="arrangement-insert-marker"]');new MutationObserver(ms=>ms.forEach(m=>window.__m.push(l.getAttribute('data-insert-marker')))).observe(l,{attributes:true,attributeFilter:['data-insert-marker']});});
 const homeBefore=(await measure()).marker; await page.keyboard.press('Home');await sleep(300);
 r.home={before:homeBefore,mutations:await page.evaluate(()=>window.__m),after:await measure()};
 r.home.headerEdgeDx=r.home.after.x-(x0-ph0.width/2);
 // range
 const music=await page.evaluate(()=>{const c=document.querySelector('[data-track-id="music"] [data-clip-id]');if(!c)return null;const b=c.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};});
 r.musicClip=music;
 if(music){await page.mouse.click(x0+1*pps,cy);await sleep(200);
  const ry=music.y+music.h*0.7;await page.mouse.move(x0+5*pps,ry);await page.mouse.down();await page.mouse.move(x0+6*pps,ry,{steps:5});await page.mouse.move(x0+7*pps,ry,{steps:5});await page.mouse.up();await sleep(300);
  r.range={hasRange:await page.locator('[data-testid="arrangement-range"]').count(),line:await measure()};
  await page.screenshot({path:`${OUT}/${tag}-range.png`});
  await page.mouse.click(x0+8*pps,cy);await sleep(300);
  r.rangeCleared={hasRange:await page.locator('[data-testid="arrangement-range"]').count(),line:await measure()};}
 // zoom
 await page.mouse.click(x0+2*pps,cy);await sleep(300);const z0=await measure();
 await page.evaluate(()=>document.activeElement&&document.activeElement.blur());
 await page.keyboard.press('Equal');await sleep(300);const z1=await measure();await page.keyboard.press('Minus');await page.keyboard.press('Minus');await sleep(300);const z2=await measure();
 r.zoom={z0:{x:z0.x,marker:z0.marker},zIn:{x:z1.x,marker:z1.marker},zOut:{x:z2.x,marker:z2.marker}};
 r.titles=await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>/^(Play|Pause|Back to start)/.test(b.getAttribute('title')||'')).map(b=>({title:b.getAttribute('title'),keys:b.getAttribute('aria-keyshortcuts')})));
 // sheet
 await page.keyboard.press('Shift+Slash');await sleep(400);
 r.sheet=await page.evaluate(()=>{const d=document.querySelector('[role="dialog"]');if(!d)return null;return [...d.querySelectorAll('[data-shortcut-id]')].slice(0,6).map(li=>({id:li.getAttribute('data-shortcut-id'),action:li.querySelector('span').textContent,keys:[...li.querySelectorAll('kbd')].map(k=>k.textContent),h:Math.round(li.getBoundingClientRect().height)}));});
 r.markerRow=await page.evaluate(()=>{const li=document.querySelector('[data-shortcut-id="marker"]');return li&&{action:li.querySelector('span').textContent,h:Math.round(li.getBoundingClientRect().height)};});
 await page.screenshot({path:`${OUT}/${tag}-sheet.png`});
 await page.keyboard.press('Escape');
 r.pageErrors=errors;
 await ctx.close();}
fs.writeFileSync(`${OUT}/probe.json`,JSON.stringify(R,null,1));await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
