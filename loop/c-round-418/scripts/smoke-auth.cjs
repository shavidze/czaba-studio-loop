const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:5173'; const OUT = path.join(__dirname, '..');
const st = (p) => p.evaluate(() => ({
  pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
  playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'),
  authUser: localStorage.getItem('auth_user'),
}));
const toSec = (s) => { const m = /(\d+):(\d+\.\d+)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = { smoke: {}, auth: {} };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = res.smoke[k] = {};
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await p.goto(`${BASE}/studio-lab`);
    await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    await sleep(800);
    r.authUser = await p.evaluate(() => localStorage.getItem('auth_user'));
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('Home'); await sleep(200);
    const pos0 = toSec((await st(p)).pos); const t0 = Date.now();
    await p.keyboard.press('Space'); await sleep(1100);
    const s = await st(p); const wall = (Date.now() - t0) / 1000;
    r.play = { pos0, pos: s.pos, playing: s.playing, advanced: toSec(s.pos) - pos0, wall };
    await p.screenshot({ path: path.join(OUT, 'shots', `smoke-playing-${k}.png`) });
    await p.keyboard.press('Space'); await sleep(150);
    const f1 = await st(p); await sleep(500); const f2 = await st(p);
    r.stop = { playing: f1.playing, frozen: f1.pos === f2.pos, f1: f1.pos, f2: f2.pos };
    r.errors = errors; await ctx.close();
  }
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = res.auth[k] = {};
    const c2 = await b.newContext({ viewport: vp }); const p2 = await c2.newPage();
    try { await p2.goto(BASE + '/studio/middle-east', { waitUntil: 'domcontentloaded', timeout: 120000 }); } catch (e) { r.gotoErr = String(e).slice(0, 100); }
    await p2.waitForTimeout(8000);
    r.authUser = await p2.evaluate(() => localStorage.getItem('auth_user')).catch(() => 'ERR');
    r.body = (await p2.evaluate(() => document.body.innerText).catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
    r.signIn = /Sign in required/i.test(r.body);
    r.audioSrc = await p2.locator('audio[src]').count();
    r.tl = await p2.locator('[data-testid="arrangement-timeline-scroller"]').count();
    await p2.screenshot({ path: path.join(OUT, 'shots', `auth-premium-${k}.png`) });
    const resp = await p2.request.get(BASE + '/api/studio-token?product=middle-east&file=a.mp3');
    r.tokenStatus = resp.status();
    await c2.close();
  }
  await b.close(); fs.writeFileSync(path.join(OUT, 'browser.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
})();
