import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const all = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const r = (all[`${w}x${h}`] = {}); const errs=[];
  const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage(); p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  const T = async (k, f) => { try { r[k] = await f(); } catch (e) { r[k] = 'ERR ' + String(e).slice(0,160); } };
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}); await p.waitForTimeout(800);
  const status = () => p.getByTestId('arrangement-status').innerText();
  await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Pulse/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  await T('headers', async()=> await p.getByTestId('arrangement-track-header').evaluateAll(a=>a.map(e=>e.innerText.replace(/\s+/g,' ').slice(0,60))));
  // group header
  await T('group', async()=>{
    const g = p.getByTestId('arrangement-track-header').filter({hasText:/Stems/}).first();
    const names = await g.getByRole('button').evaluateAll(a=>a.map(e=>e.getAttribute('aria-label')||e.title||e.textContent));
    const out={names};
    const mute = g.getByRole('button',{name:/^Mute/}).first(); const solo = g.getByRole('button',{name:/^Solo/}).first();
    out.mute0 = await mute.getAttribute('aria-pressed'); await mute.click(); out.mute1 = await mute.getAttribute('aria-pressed'); await mute.click(); out.mute2 = await mute.getAttribute('aria-pressed');
    out.solo0 = await solo.getAttribute('aria-pressed'); await solo.click(); out.solo1 = await solo.getAttribute('aria-pressed'); await solo.click(); out.solo2 = await solo.getAttribute('aria-pressed');
    return out; });
  await T('fold', async()=>{ const f = p.getByTestId('arrangement-track-fold').first(); const n0 = await p.locator('[data-clip-id]').count(); const a0 = await f.getAttribute('aria-expanded'); await f.click(); await p.waitForTimeout(300); const a1= await f.getAttribute('aria-expanded'); await f.click(); await p.waitForTimeout(300); return {a0,a1,a2:await f.getAttribute('aria-expanded'),n0,n1:await p.locator('[data-clip-id]').count()}; });
  // master
  await T('master', async()=>{
    const m = p.getByTestId('arrangement-master'); const ro = p.getByTestId('arrangement-master-readout');
    const sl = m.locator('[role=slider],input[type=range]').first(); const o={r0:await ro.innerText(), sl: await sl.count()};
    const bb = await sl.boundingBox(); o.bb=bb;
    await p.mouse.move(bb.x+bb.width*0.5, bb.y+bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x+bb.width*0.2, bb.y+bb.height/2,{steps:6}); o.rMid = await ro.innerText(); await p.mouse.up(); o.r1 = await ro.innerText();
    await sl.dblclick(); await p.waitForTimeout(200); o.r2 = await ro.innerText(); return o; });
  // transport
  await T('transport', async()=>{
    const o={}; const st=()=>p.getByTestId('arrangement-playback-state').innerText(); const pos=()=>p.getByTestId('arrangement-position').innerText();
    await p.getByRole('button',{name:'Play',exact:true}).click(); await p.waitForTimeout(1200); o.play=await st(); o.pos1=await pos();
    await p.getByRole('button',{name:'Stop',exact:true}).click(); await p.waitForTimeout(300); o.stop=await st(); o.posStop=await pos(); await p.waitForTimeout(500); o.posStop2=await pos();
    await p.getByRole('button',{name:'Back to start'}).click(); await p.waitForTimeout(300); o.back=await pos();
    const f=p.getByTestId('arrangement-follow'); o.f0=await f.getAttribute('aria-pressed'); await f.click(); o.f1=await f.getAttribute('aria-pressed'); await f.click(); o.f2=await f.getAttribute('aria-pressed');
    o.loopBtn = await p.getByRole('button',{name:/^Loop/}).first().getAttribute('aria-label');
    return o; });
  // loop brace: make range via lane bg drag then Ctrl+L? use loop-strip drag
  await T('loop', async()=>{
    const ls = p.getByTestId('arrangement-loop-strip'); const bb = await ls.boundingBox(); const o={bb};
    await p.mouse.move(bb.x+60, bb.y+bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x+260, bb.y+bb.height/2,{steps:8}); await p.mouse.up(); await p.waitForTimeout(300);
    o.status = await status(); o.loopBtn = await p.getByRole('button',{name:/^Loop/}).first().getAttribute('aria-label');
    o.braceCount = await ls.locator('*').count(); return o; });
  // markers
  await T('markers', async()=>{
    const o={}; const row=p.getByTestId('arrangement-marker-row'); const n=()=>p.getByTestId('arrangement-marker-strip').locator('[data-testid^="arrangement-marker"]').count();
    o.n0=await n(); await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(300);
    o.inputs = await p.locator('input[type=text]:visible, input:not([type]):visible').count();
    o.afterAdd=await status();
    const inp = p.locator('[data-testid="arrangement-marker-strip"] input, [data-testid="arrangement-marker-row"] input').first();
    if (await inp.count()) { await inp.fill('Hit'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);} 
    o.markerText = await p.getByTestId('arrangement-marker-strip').innerText(); o.n1=await n(); o.statusRename=await status();
    return o; });
  await p.screenshot({path:`leaves-${w}.png`}); r.errs=errs;
}
await b.close(); writeFileSync('leaves.json', JSON.stringify(all,null,1)); console.log(JSON.stringify(all).slice(0,5000));
