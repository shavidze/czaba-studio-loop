// C326 B-IM24: real browser, fresh anonymous context per viewport. Markers near 2 s and 6 s, Home, Space, Ctrl+Right while playing.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:5173';
const withClip = process.argv[2] !== 'noclip';
const st = (p) => p.evaluate(() => ({
  insertMarker: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'),
  pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
  playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'),
  playLabel: document.querySelector('[data-playing]')?.getAttribute('aria-label'),
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
  markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('aria-label')),
  authUser: localStorage.getItem('auth_user'),
}));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = { at: new Date().toISOString(), withClip, vp: {} };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}${withClip ? '' : '-noclip'}`;
    const r = { steps: [] };
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await p.goto(`${BASE}/studio-lab`);
    await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    await sleep(800);
    const shot = async (name) => p.screenshot({ path: path.join(__dirname, 'shots', `bim24-${k}-${name}.png`) });
    if (withClip) {
      await p.locator('[data-source-id="demo-stem-pulse"]').first().click();
      await sleep(250);
      await p.locator('button', { hasText: /^Add/ }).first().click();
      await sleep(1000);
    }
    await p.evaluate(() => document.activeElement?.blur());
    const g = await p.evaluate(() => {
      const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
      s.scrollLeft = 0;
      const r = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect();
      return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: r.y + r.height - 3 };
    });
    await p.keyboard.press('Home');
    await sleep(200);
    const x0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
    r.geom = { ...g, x0 };
    r.start = await st(p);
    await shot('00-start');
    for (const t of [2, 6]) {
      await p.mouse.click(x0 + t * g.pps, g.by, { modifiers: ['Alt'] });
      await sleep(300);
      const afterClick = await st(p);
      await p.evaluate(() => document.activeElement?.blur());
      await p.keyboard.press('m');
      await sleep(300);
      const editorOpen = await p.locator('[data-testid="arrangement-marker-name-input"]').count();
      if (editorOpen) {
        await p.keyboard.press('Enter');
        await sleep(300);
      }
      const afterAdd = await st(p);
      r.steps.push({ action: `add marker near ${t}s`, afterClick, editorOpen, afterAdd });
      await shot(`01-marker-${t}`);
    }
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Home');
    await sleep(300);
    r.afterHome = await st(p);
    await p.keyboard.press('Space');
    await sleep(400);
    r.afterSpace = await st(p);
    await shot('02-playing');
    const visits = [];
    for (let i = 0; i < 6; i += 1) {
      await p.keyboard.press('Control+ArrowRight');
      await sleep(120);
      const s = await st(p);
      visits.push(s);
      r.steps.push({ action: `Ctrl+Right #${i + 1}`, ...s });
      await shot(`03-ctrlright-${i + 1}`);
    }
    r.visits = visits.map((v) => ({ pos: v.pos, playing: v.playing, status: v.status }));
    await p.keyboard.press('Space');
    await sleep(200);
    r.errors = errors;
    out.vp[k] = r;
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, `b-im24${withClip ? '' : '-noclip'}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
