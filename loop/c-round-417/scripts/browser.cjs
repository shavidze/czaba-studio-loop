const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:5173'; const OUT = path.join(__dirname, '..');
const st = (p) => p.evaluate(() => ({
  insertMarker: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'),
  pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
  playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'),
  playLabel: document.querySelector('[data-playing]')?.getAttribute('aria-label'),
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
  markers: document.querySelectorAll('[data-testid="arrangement-marker"]').length,
  authUser: localStorage.getItem('auth_user'),
}));
const toSec = (s) => { const m = /(\d+):(\d+\.\d+)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = res[k] = { steps: [] };
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await p.goto(`${BASE}/studio-lab`);
    await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    await sleep(800);
    const shot = (n) => p.screenshot({ path: path.join(OUT, 'shots', `${n}-${k}.png`) });
    r.authUser = await p.evaluate(() => localStorage.getItem('auth_user'));
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    await p.evaluate(() => document.activeElement?.blur());
    const g = await p.evaluate(() => {
      const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft = 0;
      const rr = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect();
      return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: rr.y + rr.height - 3 };
    });
    await p.keyboard.press('Home'); await sleep(200);
    const x0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
    r.geom = { ...g, x0 };
    // row 5: play/stop smoke first
    const pos0 = toSec((await st(p)).pos); const t0 = Date.now();
    await p.keyboard.press('Space'); await sleep(1100);
    const sPlay = await st(p); const wall = (Date.now() - t0) / 1000;
    r.smoke = { pos0, posPlaying: sPlay.pos, playing: sPlay.playing, advanced: toSec(sPlay.pos) - pos0, wall };
    await shot('smoke-playing');
    await p.keyboard.press('Space'); await sleep(150);
    const f1 = (await st(p)); await sleep(500); const f2 = await st(p);
    r.smoke.stopped = f1.playing; r.smoke.frozen = f1.pos === f2.pos; r.smoke.f1 = f1.pos; r.smoke.f2 = f2.pos;
    // row 4: markers
    for (const t of [2, 6]) {
      await p.mouse.click(x0 + t * g.pps, g.by, { modifiers: ['Alt'] }); await sleep(300);
      await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('m'); await sleep(300);
      if (await p.locator('[data-testid="arrangement-marker-name-input"]').count()) { await p.keyboard.press('Enter'); await sleep(300); }
    }
    r.markersAdded = (await st(p)).markers;
    await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('Home'); await sleep(300);
    await p.keyboard.press('Space'); await sleep(400);
    r.afterSpace = await st(p);
    const visits = [];
    for (let i = 0; i < 8; i++) {
      await p.keyboard.press('Control+ArrowRight'); await sleep(150);
      const s = await st(p); visits.push({ i: i + 1, pos: s.pos, ins: s.insertMarker, playing: s.playing, status: s.status });
      if (s.playing === 'false' && i > 2) break;
    }
    r.visits = visits; await shot('ctrlright-last');
    // poll until stopped
    let stopped = false;
    for (let i = 0; i < 40; i++) { const s = await st(p); if (s.playing === 'false' && s.playLabel === 'Play') { stopped = true; break; } await sleep(100); }
    r.stoppedBeforeNext = stopped; r.beforeNext = await st(p);
    await p.keyboard.press('Control+ArrowRight'); await sleep(300);
    r.afterNext = await st(p); await sleep(500); r.afterNextLater = await st(p);
    await shot('after-final-press');
    r.errors = errors;
    await ctx.close();
  }
  // row 6 auth
  const r6 = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = r6[k] = {};
    const c2 = await b.newContext({ viewport: vp }); const p2 = await c2.newPage();
    try { await p2.goto(BASE + '/studio/middle-east', { waitUntil: 'domcontentloaded', timeout: 120000 }); } catch (e) { r.gotoErr = String(e).slice(0, 100); }
    await p2.waitForTimeout(8000);
    r.authUser = await p2.evaluate(() => localStorage.getItem('auth_user'));
    r.body = (await p2.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 200);
    r.signIn = /Sign in required/i.test(r.body); r.audioSrc = await p2.locator('audio[src]').count();
    r.timeline = await p2.locator('[data-testid="arrangement-timeline-scroller"]').count();
    await p2.screenshot({ path: path.join(OUT, 'shots', `auth-premium-${k}.png`) });
    const resp = await p2.request.get(BASE + '/api/studio-token?product=middle-east&file=a.mp3');
    r.tokenStatus = resp.status();
    await c2.close();
  }
  res.auth = r6;
  fs.writeFileSync(path.join(OUT, 'browser.json'), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
