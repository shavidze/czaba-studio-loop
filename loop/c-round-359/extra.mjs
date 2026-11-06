import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-359';const R={};
const b=await chromium.launch();
for (const [W,H] of [[1440,900],[1280,720]]){
const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:120000});await p.waitForTimeout(800);
await p.getByText('Full mix',{exact:true}).first().click();await p.keyboard.press('Enter');await p.locator('[data-clip-kind="audio"]').first().waitFor();await p.waitForTimeout(1500);await p.evaluate(()=>document.activeElement?.blur?.());
const ids=await p.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(x=>/ruler|bar/i.test(x)));
const rul=async()=>p.evaluate(()=>[...document.querySelectorAll('[data-testid]')].filter(e=>/ruler|bars/i.test(e.getAttribute('data-testid'))).map(e=>[e.getAttribute('data-testid'),e.getBoundingClientRect().height|0,(e.textContent||'').slice(0,40)]));
const o={ids,rulerSeeded:await rul()};
await p.getByTestId('arrangement-snap-toggle').click();
await p.getByTestId('arrangement-grid-division').selectOption('1/8');
await p.setViewportSize({width:800,height:900});await p.waitForTimeout(1500);await p.setViewportSize({width:W,height:H});await p.waitForTimeout(2000);
o.rulerAfter=await rul();o.snap=await p.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed');o.div=await p.getByTestId('arrangement-grid-division').inputValue();
if(W===1440){
 await p.getByTestId('arrangement-envelope-toggle').click();
 const wz=p.getByTestId('arrangement-waveform-zoom');
 o.wzOpts=await wz.evaluate(e=>[...e.options].map(x=>x.value+':'+x.disabled));
 const last=o.wzOpts.filter(x=>!x.endsWith('true')).pop().split(':')[0];
 await wz.selectOption(last);o.wz1=await wz.inputValue();
 await p.setViewportSize({width:800,height:900});await p.waitForTimeout(1500);await p.setViewportSize({width:W,height:H});await p.waitForTimeout(2000);
 o.view2={env:await p.getByTestId('arrangement-envelope-toggle').getAttribute('aria-pressed'),wz:await p.getByTestId('arrangement-waveform-zoom').inputValue()};
}
R[W+'x'+H]=o;await p.screenshot({path:`${D}/extra-${W}x${H}.png`});await ctx.close();}
writeFileSync(D+'/extra.json',JSON.stringify(R,null,1));await b.close();
