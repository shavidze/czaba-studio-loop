const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2]; const out = process.argv[3];
async function grid(page){return page.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');const s=document.querySelector('[data-testid="arrangement-status"]');const r=document.querySelector('[data-testid="arrangement-bars-ruler"]');return {division:g?.getAttribute('data-grid-division'),mode:g?.getAttribute('data-grid-mode'),snap:g?.getAttribute('data-snap'),bpm:r?.getAttribute('data-bpm')??null,status:s?.textContent??null};});}
async function fresh(browser,w,h){const context=await browser.newContext({viewport:{width:w,height:h}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`${base}/studio-lab`,{waitUntil:'networkidle'});await page.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:30000});await page.waitForTimeout(800);return {context,page,errors};}
async function key(page,k,n=1){for(let i=0;i<n;i++){await page.locator('body').press(k);await page.waitForTimeout(150);}}
async function enterSynth(page){const row=page.locator('[data-source-id="demo-synth-mix"]').first();await row.waitFor({timeout:15000});const btn=row.locator('button').first();const t=(await btn.count())?btn:row;await t.focus();await page.keyboard.press('Enter');await page.waitForTimeout(1500);await page.evaluate(()=>{const a=document.activeElement;if(a instanceof HTMLElement)a.blur();});}
(async()=>{const browser=await chromium.launch();const results=[];
for(const [w,h] of [[1440,900],[1280,720]]){
 // S2: adaptive 1 then seed
 let {context,page,errors}=await fresh(browser,w,h);const a=[];a.push({step:'mount',...await grid(page)});
 await key(page,'Digit1');a.push({step:'1',...await grid(page)});await enterSynth(page);a.push({step:'seed',...await grid(page)});
 results.push({viewport:`${w}x${h}`,recipe:'S2-hand-choice',errors,steps:a});await context.close();
 // control: no key then seed
 ({context,page,errors}=await fresh(browser,w,h));const c=[];await enterSynth(page);c.push({step:'seed',...await grid(page)});
 results.push({viewport:`${w}x${h}`,recipe:'S2-control-no-key',errors,steps:c});await context.close();
 // C-R239-01 zoom back
 ({context,page,errors}=await fresh(browser,w,h));const d=[];await key(page,'Digit1',2);d.push({step:'1x2',...await grid(page)});await key(page,'Equal',10);d.push({step:'=x10',...await grid(page)});await key(page,'Digit2');d.push({step:'2',...await grid(page)});await key(page,'Minus',10);d.push({step:'-x10',...await grid(page)});
 results.push({viewport:`${w}x${h}`,recipe:'C-R239-01-zoom-back',errors,steps:d});await context.close();
}
await browser.close();require('node:fs').writeFileSync(out,JSON.stringify(results,null,2));
for(const r of results){console.log(r.viewport,r.recipe,'errors',r.errors.length);for(const s of r.steps)console.log(' ',s.step.padEnd(8),s.mode,s.division,'snap',s.snap,'bpm',s.bpm,'|',(s.status||'').slice(-90));}})();
