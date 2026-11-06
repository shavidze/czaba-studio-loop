import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-362';
const [W,H]=(process.argv[2]??'1440x900').split('x').map(Number);
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await br.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const page=await ctx.newPage();const R={vp:`${W}x${H}`,rows:{}};
const st=()=>page.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent??null);
const pl=()=>page.evaluate(()=>document.querySelector('[data-playing]')?.getAttribute('data-playing'));
await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
await page.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:180000});
await page.waitForTimeout(1000);
await page.getByText('Full mix',{exact:true}).first().click();await page.keyboard.press('Enter');
await page.locator('[data-clip-kind="audio"]').first().waitFor();await page.waitForTimeout(1500);
await page.evaluate(()=>document.activeElement?.blur?.());
R.rows.markersInProject=await page.getByTestId('arrangement-marker').count();
const key=async()=>{await page.keyboard.press('Control+ArrowRight');await page.waitForTimeout(400);return {status:await st(),playing:await pl()};};
R.rows.step1_toEnd=await key();
R.rows.step2_stoppedNone=await key();
await page.screenshot({path:`${D}/marker-stopped-${W}x${H}.png`});
await page.evaluate(()=>{window.__log=[];const el=document.querySelector('[data-testid="arrangement-status"]');window.__mo=new MutationObserver(()=>window.__log.push({status:el.textContent.slice(0,50),playing:document.querySelector('[data-playing]')?.getAttribute('data-playing'),t:Math.round(performance.now())}));window.__mo.observe(el,{childList:true,characterData:true,subtree:true});});
await page.keyboard.press('Space');
for(let i=0;i<4;i++){await page.keyboard.press('Control+ArrowRight');await page.waitForTimeout(15);}
R.rows.mutationLog=await page.evaluate(()=>window.__log);

await page.screenshot({path:`${D}/marker-${W}x${H}.png`});
await page.keyboard.press('Space');
writeFileSync(`${D}/marker-${W}x${H}.json`,JSON.stringify(R,null,1));console.log(JSON.stringify(R));await br.close();
