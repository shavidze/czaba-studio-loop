import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const [w,h]=[+process.argv[2],+process.argv[3]]; const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-391';
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext({viewport:{width:w,height:h},acceptDownloads:true});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)));
const r={vp:`${w}x${h}`};
await p.goto('http://127.0.0.1:5173/products/middle-east',{waitUntil:'load',timeout:90000}).catch(e=>r.gotoErr=String(e));
await p.waitForTimeout(9000); await p.screenshot({path:`${out}/b6-1-product-${w}.png`});
const link=p.getByRole('link',{name:/Try it in the Studio/}).or(p.getByRole('button',{name:/Try it in the Studio/}));
r.linkCount=await link.count();
if(r.linkCount){ await link.first().click(); await p.waitForURL(/studio-lab/,{timeout:30000}).catch(()=>{}); r.url=p.url();
  await p.waitForTimeout(4000); await p.screenshot({path:`${out}/b6-2-studio-${w}.png`});
  r.selected=await p.getByRole('listbox',{name:'Sounds'}).getByRole('option',{selected:true}).allInnerTexts().catch(()=>null);
  await p.keyboard.press('Enter'); await p.waitForTimeout(2500); await p.screenshot({path:`${out}/b6-3-added-${w}.png`});
  await p.keyboard.press('Space'); await p.waitForTimeout(2000); r.playing=await p.evaluate(()=>document.querySelector('[data-playing]')?.getAttribute('data-playing')); await p.screenshot({path:`${out}/b6-4-play-${w}.png`});
  await p.keyboard.press('Space'); await p.waitForTimeout(500);
  const dl=[]; p.on('download',d=>dl.push(d)); await p.getByRole('button',{name:/^Export/}).first().click(); await p.waitForTimeout(500);
  await p.locator('[role=dialog]').getByRole('button',{name:/Export WAV/}).click(); await p.waitForTimeout(6000);
  r.downloads=dl.length; if(dl.length){const buf=fs.readFileSync(await dl[0].path()); r.wav={bytes:buf.length,hdr:buf.subarray(0,4)+'/'+buf.subarray(8,12)};}
  r.status=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-status]')?.textContent);
  await p.screenshot({path:`${out}/b6-5-export-${w}.png`}); }
r.errs=errs; console.log(JSON.stringify(r,null,1)); fs.writeFileSync(`${out}/b6-${w}.json`,JSON.stringify(r,null,1)); await b.close();
