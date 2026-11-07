import { open } from '../c-round-382/lib.mjs';
import fs from 'fs';
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:5173'; const out={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const k=`${w}x${h}`;
  const o = await open(base,w,h); const p=o.page;
  await p.waitForSelector('[data-testid="arrangement-status"]');
  await p.evaluate(()=>{window.__media=[];const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(!window.__media.includes(this))window.__media.push(this);return pl.call(this)};window.__dec=[];const d=BaseAudioContext.prototype.decodeAudioData;BaseAudioContext.prototype.decodeAudioData=function(...a){return d.apply(this,a).then(b=>{window.__dec.push(+b.duration.toFixed(2));return b})}});
  const L=p.getByRole('listbox',{name:'Sounds'});
  await L.getByRole('option',{name:/Full mix/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  const pl0=await p.evaluate(()=>document.querySelector('[data-playing]').getAttribute('data-playing'));
  await L.getByRole('option',{name:/Middle East/}).first().click();
  await p.getByTestId('arrangement-library-preview-toggle').click(); await p.waitForTimeout(1800);
  const r=await p.evaluate(()=>({playing:document.querySelector('[data-playing]').getAttribute('data-playing'),media:window.__media.map(m=>({src:m.getAttribute('src'),paused:m.paused,t:m.currentTime}))}));
  out['S7-'+k]={playingBefore:pl0,...r};
  await p.screenshot({path:`S7-${k}.png`});
  // add
  const cnt=()=>p.locator('[data-testid^="arrangement-clip"]').count();
  await p.getByTestId('arrangement-library-preview-toggle').click(); await p.waitForTimeout(300);
  const c0=await cnt(); await p.evaluate(()=>{window.__dec.length=0});
  await L.getByRole('option',{name:/Middle East/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  out['ADD-'+k]={c0,c1:await cnt(),dec:await p.evaluate(()=>window.__dec)};
  await o.browser.close();
}
// AUTH
const b=await chromium.launch(); const c=await b.newContext(); const pg=await c.newPage();
const lab=await pg.goto(base+'/studio-lab',{waitUntil:'load'}); out.AUTH_lab=lab.status();
await pg.waitForTimeout(2000); out.AUTH_labTitle=await pg.title();
const pr=await pg.goto(base+'/studio/some-premium-handle',{waitUntil:'load'}); await pg.waitForTimeout(3000);
out.AUTH_premium={status:pr.status(),url:pg.url(),hasWorkspace:await pg.locator('[data-testid="arrangement-status"]').count(),text:(await pg.locator('body').innerText()).slice(0,300)};
await pg.screenshot({path:'AUTH-premium.png'});
const t=await c.request.get(base+'/api/studio-token'); out.AUTH_token=t.status();
const t2=await c.request.post(base+'/api/studio-token',{data:{}}); out.AUTH_tokenPost=t2.status();
await b.close();
fs.writeFileSync('rows-extra.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1));
