import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const all = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const r = (all[`${w}x${h}`] = {}); const errs=[];
  const ctx = await b.newContext({viewport:{width:w,height:h}}); const p = await ctx.newPage(); p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  const reqs=[]; p.on('request',q=>reqs.push(q.url()));
  const T = async (k, f) => { try { r[k] = await f(); } catch (e) { r[k] = 'ERR ' + String(e).slice(0,200); } };
  const status = () => p.getByTestId('arrangement-status').innerText();
  // LAZY direct
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}); await p.waitForTimeout(800);
  r.signalrReqDirect = reqs.filter(u=>/signalr/i.test(u)).length;
  // STATUS
  await T('status', async()=>{
    const o={}; o.initial = await status();
    await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Middle East/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(900); o.afterAdd = await status();
    await p.getByRole('button',{name:'Play',exact:true}).click(); await p.waitForTimeout(700); o.play = await status();
    await p.getByRole('button',{name:'Stop',exact:true}).click(); await p.waitForTimeout(300); o.stop = await status();
    const c = p.locator('[data-clip-id]').first(); const bb = await c.boundingBox();
    await p.mouse.move(bb.x+40,bb.y+8); await p.mouse.down(); await p.mouse.move(bb.x+140,bb.y+8,{steps:6}); o.drag = await status(); o.dragHint = await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-timeline-chrome] *, body *')].filter(e=>/Shift/.test(e.textContent||'')&&e.children.length===0).map(e=>e.textContent.slice(0,60)).slice(0,2));
    await p.keyboard.press('Escape'); await p.mouse.up(); await p.waitForTimeout(300); o.afterEsc = await status(); o.clipStart = await c.getAttribute('data-start') ?? await p.evaluate(()=>document.querySelector('[data-clip-id]').getBoundingClientRect().x);
    o.bbx0 = bb.x; o.bbx1 = (await c.boundingBox()).x; return o; });
  // loop brace: range via lane bg drag then Ctrl+L? try Loop button after range
  await T('loop', async()=>{
    const o={}; const lane = p.locator('[data-clip-id]').first(); const bb = await lane.boundingBox();
    await p.mouse.move(bb.x+200,bb.y+bb.height-6); await p.mouse.down(); await p.mouse.move(bb.x+400,bb.y+bb.height-6,{steps:8}); await p.mouse.up(); await p.waitForTimeout(300);
    const lb = p.getByRole('button',{name:/^Loop/}).first(); o.loopLabel = await lb.getAttribute('aria-label'); o.loopDisabled = await lb.getAttribute('aria-disabled'); 
    await lb.click(); await p.waitForTimeout(400); o.loopPressed = await lb.getAttribute('aria-pressed'); o.status=await status();
    const strip = p.getByTestId('arrangement-loop-strip'); o.stripKids = await strip.evaluate(e=>[...e.querySelectorAll('*')].map(x=>x.getAttribute('data-testid')||x.getAttribute('aria-label')||x.tagName).slice(0,8));
    return o; });
  // markers delete
  await T('markerDelete', async()=>{
    const o={}; const strip=p.getByTestId('arrangement-marker-strip');
    await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(300); await p.keyboard.type('Tmp'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    o.txt0 = await strip.innerText(); o.kids = await strip.evaluate(e=>[...e.querySelectorAll('*')].map(x=>x.getAttribute('data-testid')||x.getAttribute('aria-label')||x.tagName).slice(0,8));
    const mk = strip.locator('[data-testid="arrangement-marker"]').first(); await mk.click(); await p.waitForTimeout(150); await p.keyboard.press('Delete'); await p.waitForTimeout(300);
    o.txt1 = await strip.innerText(); o.status = await status(); return o; });
  await p.screenshot({path:`misc-${w}.png`}); r.errs=errs;
  await ctx.close();
}
// lazy via client nav
{ const ctx = await b.newContext({viewport:{width:1440,height:900}}); const p = await ctx.newPage(); const reqs=[]; p.on('request',q=>reqs.push(q.url()));
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle',timeout:120000}).catch(e=>all.homeErr=String(e).slice(0,100));
  all.homeTitle = await p.title(); all.signalrBeforeNav = reqs.filter(u=>/signalr/i.test(u)).length;
  const link = p.getByRole('link',{name:/studio/i}).first(); all.studioLink = await link.count();
  const n0=reqs.length; await link.click().catch(e=>all.navErr=String(e).slice(0,100));
  const samples=[]; for(let i=0;i<8;i++){ await p.waitForTimeout(40); samples.push(await p.evaluate(()=>[...document.querySelectorAll('main, #root > *, body > div')].map(e=>getComputedStyle(e).opacity+'/'+getComputedStyle(e).transform.slice(0,20)).slice(0,4)));} 
  await p.waitForTimeout(3000); all.navUrl=p.url(); all.signalrAfterNav = reqs.filter(u=>/signalr/i.test(u)).length; all.navSamples=samples.slice(0,5); await p.screenshot({path:'misc-nav.png'}); await ctx.close(); }
await b.close(); writeFileSync('misc.json', JSON.stringify(all,null,1)); console.log(JSON.stringify(all).slice(0,6000));
