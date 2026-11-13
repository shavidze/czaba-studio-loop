import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base='http://127.0.0.1:5173'; const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t389/out';
const R={};
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
async function mk(W,H){const ctx=await br.newContext({viewport:{width:W,height:H}});await ctx.addInitScript(()=>{localStorage.setItem('czaba_analytics_consent','denied');window.__starts=[];const o=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:this.buffer?this.buffer.duration:null,n:a.length});return o.apply(this,a)};});const page=await ctx.newPage();return {ctx,page,W,H};}
const T=(p)=>({
 st:()=>p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent??null),
 tempo:()=>p.getByTestId('arrangement-tempo-input').inputValue().catch(()=>null),
 pr:(id)=>p.getByTestId(id).getAttribute('aria-pressed').catch(()=>null),
 div:()=>p.getByTestId('arrangement-grid-division').evaluate(e=>e.value??e.textContent).catch(()=>null),
 ruler:()=>p.evaluate(()=>/bar|\d+\.\d/i.test(document.querySelector('[data-testid*="ruler"]')?.textContent??'')),
});
async function ready(p){await p.goto(base+'/studio-lab',{waitUntil:'load',timeout:120000});await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:120000});await p.waitForTimeout(800);}
async function add(p){await p.getByText('Full mix',{exact:true}).first().click();await p.keyboard.press('Enter');await p.locator('[data-clip-kind="audio"]').first().waitFor();await p.waitForTimeout(1500);await p.evaluate(()=>document.activeElement?.blur?.());}
async function rs(p,W,H){await p.setViewportSize({width:800,height:900});await p.waitForTimeout(1500);await p.setViewportSize({width:W,height:H});await p.waitForTimeout(2000);}
for (const [W,H] of [[1440,900],[1280,720]]){
 const {ctx,page:p}=await mk(W,H);const t=T(p);const o={};
 await ready(p);await add(p);
 o.seeded={snap:await t.pr('arrangement-snap-toggle'),div:await t.div(),met:await t.pr('arrangement-metronome-toggle'),tempo:await t.tempo()};
 await p.getByTestId('arrangement-snap-toggle').click();
 await p.getByTestId('arrangement-grid-division').selectOption('1/8').catch(async e=>{o.divErr=String(e).slice(0,150)});
 await p.getByTestId('arrangement-metronome-toggle').click();
 o.set={snap:await t.pr('arrangement-snap-toggle'),div:await t.div(),met:await t.pr('arrangement-metronome-toggle'),tempo:await t.tempo(),st:await t.st()};
 await rs(p,W,H);
 o.after={snap:await t.pr('arrangement-snap-toggle'),div:await t.div(),met:await t.pr('arrangement-metronome-toggle'),tempo:await t.tempo(),ruler:await t.ruler(),st:await t.st()};
 await p.screenshot({path:`${D}/settings-after-${W}x${H}.png`});
 if(W===1440){
  // METRONOME audio
  await p.evaluate(()=>{window.__starts.length=0});
  await p.keyboard.press('Home');await p.keyboard.press('Space');await p.waitForTimeout(2000);await p.keyboard.press('Space');await p.waitForTimeout(500);
  const A=await p.evaluate(()=>window.__starts.slice());
  await rs(p,W,H);
  await p.evaluate(()=>{window.__starts.length=0;document.activeElement?.blur?.()});
  await p.keyboard.press('Home');await p.keyboard.press('Space');await p.waitForTimeout(2000);await p.keyboard.press('Space');await p.waitForTimeout(500);
  const B=await p.evaluate(()=>window.__starts.slice());
  const sh=(a)=>a.filter(x=>x.d!==null&&x.d<0.5).length;
  o.metro={A_short:sh(A),B_short:sh(B),A_total:A.length,B_total:B.length,A_buf:[...new Set(A.map(x=>Math.round((x.d??-1)*1000)/1000))],B_buf:[...new Set(B.map(x=>Math.round((x.d??-1)*1000)/1000))],met:await t.pr('arrangement-metronome-toggle')};
  // control: metronome off
  await p.getByTestId('arrangement-metronome-toggle').click();
  await p.evaluate(()=>{window.__starts.length=0;document.activeElement?.blur?.()});
  await p.keyboard.press('Home');await p.keyboard.press('Space');await p.waitForTimeout(2000);await p.keyboard.press('Space');await p.waitForTimeout(500);
  const C=await p.evaluate(()=>window.__starts.slice());o.metro.C_off_short=sh(C);o.metro.C_total=C.length;o.metro.metOff=await t.pr('arrangement-metronome-toggle');
  // CLEARED
  await ready(p);await add(p);
  const ti=p.getByTestId('arrangement-tempo-input');await ti.fill('');await ti.press('Enter');await p.waitForTimeout(500);
  o.cleared0={tempo:await t.tempo(),st:await t.st()};
  await rs(p,W,H);
  const s2=await t.st();o.cleared1={tempo:await t.tempo(),seedSentence:(s2.match(/Tempo \d+ BPM from/g)||[]).length,st:s2};
  // RELOAD
  await ready(p);await add(p);
  const ti2=p.getByTestId('arrangement-tempo-input');await ti2.fill('100');await ti2.press('Enter');await p.waitForTimeout(500);
  o.reload0={tempo:await t.tempo()};
  await ready(p);
  o.reload1={tempoBeforeAdd:await t.tempo(),st:await t.st()};
  await add(p);
  o.reload2={tempoAfterAdd:await t.tempo(),st:await t.st(),snap:await t.pr('arrangement-snap-toggle')};
  // VIEW-STATE
  await p.getByTestId('arrangement-envelope-toggle').click();
  const wz=p.getByTestId('arrangement-waveform-zoom');
  o.view0={env:await p.getByTestId('arrangement-envelope-toggle').getAttribute('aria-pressed'),wz:await wz.evaluate(e=>e.value??e.textContent).catch(()=>null),wzTag:await wz.evaluate(e=>e.tagName+':'+(e.type||''))};
  await wz.selectOption({index:1}).catch(async()=>{await wz.fill('2').catch(()=>{})});
  o.view1={wz:await wz.evaluate(e=>e.value??e.textContent).catch(()=>null)};
  await rs(p,W,H);
  o.view2={env:await p.getByTestId('arrangement-envelope-toggle').getAttribute('aria-pressed'),wz:await p.getByTestId('arrangement-waveform-zoom').evaluate(e=>e.value??e.textContent).catch(()=>null)};
 }
 R[`${W}x${H}`]=o;await ctx.close();
}
writeFileSync(D+'/settings-probe.json',JSON.stringify(R,null,1));await br.close();
