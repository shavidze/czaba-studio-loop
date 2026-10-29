const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2]; const out = process.argv[3];
async function grid(page){return page.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');const s=document.querySelector('[data-testid="arrangement-status"]');const r=document.querySelector('[data-testid="arrangement-bars-ruler"]');const sel=document.querySelector('[data-testid="arrangement-grid-division"]');return {division:g?.getAttribute('data-grid-division'),seconds:g?.getAttribute('data-grid-seconds'),period:(()=>{const b=document.querySelector('[data-track-id] [data-grid-seconds]');const m=/transparent 1px ([\d.]+)px/.exec(b?.style.backgroundImage||'');return m?Number(m[1]):null;})(),mode:g?.getAttribute('data-grid-mode'),snap:g?.getAttribute('data-snap'),bpm:r?.getAttribute('data-bpm')??null,selectValue:sel?.value,title:sel?.getAttribute('title'),status:s?.textContent??null};});}
(async()=>{const browser=await chromium.launch();const results=[];
for(const [w,h] of [[1440,900],[1280,720]]){const context=await browser.newContext({viewport:{width:w,height:h}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`${base}/studio-lab`,{waitUntil:'networkidle'});await page.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:30000});await page.waitForTimeout(800);
const steps=[];steps.push({step:'mount',...await grid(page)});
const row=page.locator('[data-source-id="demo-synth-mix"]').first();await row.waitFor({timeout:15000});
const btn=row.locator('button').first(); const target=(await btn.count())?btn:row; await target.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
steps.push({step:'Enter on synth mix',...await grid(page)});
for(let i=0;i<5;i++){await page.locator('body').press('Equal');await page.waitForTimeout(150);steps.push({step:`zoom+ ${i+1}`,...await grid(page)});}
await page.keyboard.press('Digit3');await page.waitForTimeout(150);steps.push({step:'3 triplet',...await grid(page)});
await page.keyboard.press('Digit5');await page.waitForTimeout(150);steps.push({step:'5 fixed',...await grid(page)});
await page.keyboard.press('Digit5');await page.waitForTimeout(150);steps.push({step:'5 adaptive',...await grid(page)});
results.push({viewport:`${w}x${h}`,errors,steps});await context.close();}
await browser.close();require('node:fs').writeFileSync(out,JSON.stringify(results,null,2));
for(const r of results){console.log(r.viewport,'errors',r.errors.length);for(const s of r.steps)console.log(' ',s.step.padEnd(20),s.mode,s.division,s.seconds,'period',s.period,'snap',s.snap,'bpm',s.bpm,'|',(s.status||'').slice(0,140));}})();
