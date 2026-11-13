import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t389/out';
const [W,H]=(process.argv[2]??'1440x900').split('x').map(Number);
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await br.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const page=await ctx.newPage();
const R={vp:`${W}x${H}`,rows:{}};
const st=()=>page.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent??null);
const pos=()=>page.evaluate(()=>document.querySelector('[data-testid="arrangement-position"]')?.textContent??null);
const play=()=>page.getByRole('button',{name:'Play',exact:true});
const stop=()=>page.getByRole('button',{name:'Stop',exact:true});
const snap=()=>page.evaluate(()=>{const p=[...document.querySelectorAll('button[aria-label="Play"]')][0];const s=[...document.querySelectorAll('button[aria-label="Stop"]')][0];const sp=document.querySelector('[data-testid="arrangement-playback-state"]');return{playing:p?.getAttribute('data-playing'),desc:p?.getAttribute('aria-describedby'),descStop:s?.getAttribute('aria-describedby'),spanId:sp?.id,span:sp?.textContent,playKey:p?.getAttribute('aria-keyshortcuts'),stopKey:s?.getAttribute('aria-keyshortcuts'),playTitle:p?.title,stopTitle:s?.title};});
await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
await page.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:120000});
await page.waitForTimeout(1000);
await page.getByText('Full mix',{exact:true}).first().click();await page.keyboard.press('Enter');
await page.locator('[data-clip-kind="audio"]').first().waitFor();await page.waitForTimeout(1500);
await page.evaluate(()=>document.activeElement?.blur?.());
R.rows.initial=await snap();R.rows.initialPos=await pos();
// 1 click play
await play().click();await page.waitForTimeout(300);const a0=await pos();await page.waitForTimeout(1000);
R.rows.s1_play={...(await snap()),pos0:a0,pos1:await pos()};
await page.screenshot({path:`${D}/play-${W}x${H}.png`});
// 2 click stop
await stop().click();await page.waitForTimeout(400);const b0=await pos();await page.waitForTimeout(800);
R.rows.s2_stop={...(await snap()),pos0:b0,pos1:await pos()};
// 3 Space
await page.evaluate(()=>document.activeElement?.blur?.());await page.keyboard.press('Space');await page.waitForTimeout(500);
R.rows.s3_spacePlay=(await snap()).playing;
await page.keyboard.press('Space');await page.waitForTimeout(500);R.rows.s3_spaceStop=(await snap()).playing;
// 4 held Enter on Play
await page.keyboard.press('Home');await page.waitForTimeout(300);
await play().focus();
await page.evaluate(()=>{window.__flips=[];const p=document.querySelector('button[aria-label="Play"]');window.__mo=new MutationObserver(()=>window.__flips.push(p.getAttribute('data-playing')));window.__mo.observe(p,{attributes:true,attributeFilter:['data-playing']});});
await page.keyboard.down('Enter');for(let i=0;i<6;i++){await page.keyboard.down('Enter');await page.waitForTimeout(80);}await page.keyboard.up('Enter');await page.waitForTimeout(400);
R.rows.s4_heldEnter={flips:await page.evaluate(()=>window.__flips),final:(await snap()).playing};
// stop via Space
await page.evaluate(()=>document.activeElement?.blur?.());await page.keyboard.press('Space');await page.waitForTimeout(400);R.rows.s4_after_stop=(await snap()).playing;
// 5 double-click Stop
await page.keyboard.press('Space');await page.waitForTimeout(900);await page.keyboard.press('Space');await page.waitForTimeout(300);
R.rows.s5_posBeforeDbl=await pos();await stop().dblclick();await page.waitForTimeout(400);R.rows.s5_posAfterDbl=await pos();R.rows.s5_playing=(await snap()).playing;
// 6 tab order
await page.evaluate(()=>document.activeElement?.blur?.());
const fol=page.getByTestId('arrangement-follow');await fol.focus();
const order=[];for(let i=0;i<6;i++){order.push(await page.evaluate(()=>{const e=document.activeElement;return (e?.getAttribute('aria-label')||e?.getAttribute('data-testid')||e?.textContent||'').trim().slice(0,30)}));await page.keyboard.press('Tab');}
R.rows.s6_tab=order;
// MARKER-NONE
await page.evaluate(()=>document.activeElement?.blur?.());await page.keyboard.press('Home');await page.waitForTimeout(300);
await page.keyboard.press('Control+ArrowRight');await page.waitForTimeout(400);R.rows.markerNoneStopped=await st();
await page.keyboard.press('Space');await page.waitForTimeout(600);
await page.keyboard.press('Control+ArrowRight');await page.waitForTimeout(400);R.rows.markerNonePlaying={status:await st(),playing:(await snap()).playing};
await page.screenshot({path:`${D}/marker-${W}x${H}.png`});
await page.keyboard.press('Space');await page.waitForTimeout(300);
writeFileSync(`${D}/playstop-${W}x${H}.json`,JSON.stringify(R,null,1));console.log(JSON.stringify(R));
await br.close();
