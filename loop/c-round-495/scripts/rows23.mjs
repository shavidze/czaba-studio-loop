import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O = process.argv[2]; const res = {};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const k = `${w}x${h}`; const r = {};
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  // warm
  await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:90000}).catch(e=>r.warmErr=String(e).slice(0,100));
  await p.waitForTimeout(2500);
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded',timeout:90000});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:90000});
  await p.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:60000}).catch(()=>r.readyTimeout=true);
  await p.waitForTimeout(1000);
  r.authUser = await p.evaluate(()=>localStorage.getItem('auth_user'));
  r.labOpen = true;
  // smoke
  const clips = () => p.locator('[data-clip-id]').evaluateAll(cs=>new Set(cs.map(c=>c.getAttribute('data-clip-id'))).size);
  r.clips0 = await clips();
  await p.getByTestId('arrangement-library-list').getByRole('option').filter({hasText:'Bass'}).first().click();
  await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  r.clips1 = await clips();
  const st = ()=>p.getByTestId('arrangement-playback-state').textContent();
  r.stateBefore = (await st()).trim();
  const pos = ()=>p.getByTestId('arrangement-position').textContent().then(t=>t.trim());
  r.pos0 = await pos();
  await p.getByRole('button',{name:/^Play/}).first().click();
  await p.waitForTimeout(1500);
  r.statePlaying = (await st()).trim(); r.pos1 = await pos();
  await p.screenshot({path:`${O}/c495-smoke-playing-${k}.png`});
  await p.getByRole('button',{name:/^Stop/}).first().click();
  await p.waitForTimeout(500);
  r.stateStopped = (await st()).trim(); r.pos2 = await pos();
  await p.getByRole('button',{name:/^Export/}).first().click();
  await p.waitForTimeout(700);
  r.dialogOpen = await p.getByRole('dialog').first().isVisible();
  await p.screenshot({path:`${O}/c495-smoke-export-${k}.png`});
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  r.dialogClosedEsc = !(await p.getByRole('dialog').count().then(n=>n>0 && p.getByRole('dialog').first().isVisible()));
  if (!r.dialogClosedEsc) { await p.getByRole('button',{name:/^(Done|Close)/}).first().click().catch(()=>{}); await p.waitForTimeout(500); r.dialogClosedBtn = !(await p.getByRole('dialog').first().isVisible().catch(()=>false)); }
  // protected route
  const q = await ctx.newPage();
  await q.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:90000});
  await q.waitForTimeout(4000);
  r.protectedText = (await q.locator('body').innerText()).replace(/\s+/g,' ').slice(0,200);
  r.signInRequired = /Sign in required/i.test(r.protectedText);
  r.protectedAudioSrc = await q.locator('audio[src]').count();
  r.protectedAuthUser = await q.evaluate(()=>localStorage.getItem('auth_user'));
  await q.screenshot({path:`${O}/c495-protected-${k}.png`});
  const api = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem.mp3');
  r.tokenStatus = api.status(); r.tokenBody=(await api.text()).slice(0,120);
  res[k]=r; await ctx.close();
}
await b.close();
writeFileSync(`${O}/rows23.json`,JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
