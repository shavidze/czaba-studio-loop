import { open } from '../../c-round-382/lib.mjs';
import { createRequire } from 'node:module';
import fs from 'fs';
const out = process.argv[2]; const res = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const o = await open('http://127.0.0.1:5173', w, h); const p = o.page; const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Full mix/ }).first().click();
  await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  const pos = () => p.getByTestId('arrangement-position').textContent();
  const sec = (s) => { const m = s.match(/(\d+):(\d+(?:\.\d+)?)/); return m ? +m[1]*60 + +m[2] : NaN; };
  await p.locator('[data-clip-id]').first().waitFor();
  await p.mouse.click(5, 5); await p.waitForTimeout(100);
  await p.keyboard.press('Space'); await p.waitForTimeout(300); const t0 = Date.now(); const a = sec(await pos());
  await p.waitForTimeout(1500); const b = sec(await pos()); const dt = (Date.now()-t0)/1000;
  const playing = await p.getByTestId('arrangement-playback-state').textContent();
  await p.keyboard.press('Space'); await p.waitForTimeout(200); const c = sec(await pos()); await p.waitForTimeout(500); const d = sec(await pos());
  const follow = p.getByTestId('arrangement-follow'); const f0 = await follow.getAttribute('data-follow-mode');
  await follow.click(); const f1 = await follow.getAttribute('data-follow-mode'); await follow.click(); const f2 = await follow.getAttribute('data-follow-mode');
  const bb = await p.locator('[data-clip-id]').first().boundingBox();
  await p.mouse.move(bb.x+bb.width*0.3, bb.y+bb.height*0.7); await p.mouse.down();
  await p.mouse.move(bb.x+bb.width*0.45, bb.y+bb.height*0.7,{steps:6}); await p.mouse.move(bb.x+bb.width*0.6, bb.y+bb.height*0.7,{steps:6}); await p.mouse.up(); await p.waitForTimeout(300);
  const loop = p.getByTestId('arrangement-transport-centre').getByRole('button', { name: /Loop/ }).first();
  const l0 = await loop.getAttribute('aria-pressed'); await loop.click(); await p.waitForTimeout(200); const l1 = await loop.getAttribute('aria-pressed');
  await p.screenshot({ path: `${out}/smoke-${w}x${h}.png` });
  res[w+'x'+h] = { a,b,dt,playing,advance:b-a, stopC:c, stopD:d, frozen:c===d, f0,f1,f2, l0,l1, errs: errs.filter(e=>!/cart|CONNECTION|TUNNEL/i.test(e)) };
  await o.browser.close();
}
// auth
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const br = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const c = await br.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000);
  const demoAuth = await p.evaluate(()=>localStorage.getItem('auth_user')); const demoOpt = await p.getByRole('option').count();
  await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded' });
  await p.getByText(/Sign in required/i).first().waitFor({ timeout: 30000 }).catch(()=>{});
  const prot = { authUser: await p.evaluate(()=>localStorage.getItem('auth_user')), signIn: await p.getByText(/Sign in required/i).count(), audioSrc: await p.locator('audio[src]').count() };
  const r = await p.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3', { maxRedirects: 0 });
  res['auth'+w] = { demoAuth, demoOpt, ...prot, tokenStatus: r.status() };
  await p.screenshot({ path: `${out}/protected-${w}x${h}.png` }); await c.close();
}
await br.close(); fs.writeFileSync(out+'/smoke-auth.json', JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
