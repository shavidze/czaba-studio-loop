import { createRequire } from 'node:module';import fs from 'node:fs';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const res={};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
 await p.addInitScript(()=>{window.__a={starts:[],stops:0,ctx:[]};const S=AudioBufferSourceNode.prototype;const o=S.start;S.start=function(...a){window.__a.starts.push({when:a[0]??0,offset:a[1]??0,dur:this.buffer?.duration,ch:this.buffer?.numberOfChannels});return o.apply(this,a)};const AC=window.AudioContext;window.AudioContext=class extends AC{constructor(...a){super(...a);window.__a.ctx.push(this)}}});
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
 await p.getByText('Demo collection ready').first().waitFor({timeout:120000});await p.waitForTimeout(1200);
 const st=()=>p.evaluate(()=>document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent.trim());
 const clk=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim()));return e&&e.textContent.trim()});
 const clips=()=>p.evaluate(()=>new Set([...document.querySelectorAll('[data-clip-id]')].map(e=>e.getAttribute('data-clip-id'))).size);
 const r={clips0:await clips()};
 await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
 await p.waitForSelector('[data-clip-id]');r.clips1=await clips();
 await p.keyboard.press('Space');await p.waitForTimeout(800);r.afterFirstSpace=await st();
 if(r.afterFirstSpace!=='Playing'){await p.keyboard.press('Space');r.neededSecondSpace=true}
 await p.waitForTimeout(1500);r.playing=await st();r.clkPlaying=await clk();
 r.audio=await p.evaluate(()=>({ctxStates:window.__a.ctx.map(c=>c.state),starts:window.__a.starts.slice(0,5),nStarts:window.__a.starts.length,sr:window.__a.ctx[0]?.sampleRate}));
 await p.keyboard.press('Space');await p.waitForTimeout(500);r.stopped=await st();r.clkStopped=await clk();
 res[`${w}x${h}`]=r;await c.close();}
console.log(JSON.stringify(res,null,1));await br.close();
