import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/r392'; const r={};
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
// AUTH: fresh incognito context, no credentials
const ctx=await b.newContext({viewport:{width:1440,height:900}}); await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'}); await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().waitFor({timeout:60000});
r.labTitle=await p.title(); r.labOpensDemo=true; r.localStorageKeys=await p.evaluate(()=>Object.keys(localStorage));
const resp=await p.goto('http://127.0.0.1:5173/studio/some-premium-product',{waitUntil:'load'}).catch(e=>null);
await p.waitForTimeout(4000); r.premiumUrl=p.url(); r.premiumStatus=resp&&resp.status(); r.premiumHasWorkspace=await p.getByRole('listbox',{name:'Sounds'}).count(); r.premiumBody=(await p.locator('body').innerText()).slice(0,300);
await p.screenshot({path:`${out}/auth-premium-1440.png`});
const tok=await p.request.get('http://127.0.0.1:5173/api/studio-token?productId=x'); r.tokenStatus=tok.status();
// EV13 neighbour: preview while playing keeps playing
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'}); await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().waitFor({timeout:60000}); await p.waitForTimeout(4000);
await p.evaluate(()=>{window.__d=0;const pr=BaseAudioContext.prototype,dec=pr.decodeAudioData;pr.decodeAudioData=function(...a){if(window.__d>0){window.__d--;return dec.apply(this,a).then(x=>new Promise(rr=>setTimeout(()=>rr(x),2500)));}return dec.apply(this,a);};});
const st=()=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-status]').textContent); const pl=()=>p.evaluate(()=>document.querySelector('[data-playing]')?.getAttribute('data-playing'));
await p.getByRole('listbox',{name:'Sounds'}).getByRole('option',{name:/Full mix/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
await p.keyboard.press('Space'); await p.waitForTimeout(800); r.playingBefore=await pl();
await p.getByRole('listbox',{name:'Sounds'}).getByRole('option',{name:/Middle East/}).first().click(); await p.evaluate(()=>{window.__d=1;});
await p.getByRole('button',{name:'Preview',exact:true}).first().click(); await p.waitForTimeout(800);
r.midStatus=await st(); r.playingDuringDecode=await pl(); await p.waitForTimeout(3500); r.endStatus=await st(); r.playingEnd=await pl();
r.errs=errs; fs.writeFileSync(`${out}/nb.json`,JSON.stringify(r,null,1)); console.log(JSON.stringify(r,null,1)); await b.close();
