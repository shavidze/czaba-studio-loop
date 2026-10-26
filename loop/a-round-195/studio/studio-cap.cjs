// A round 193: /studio-lab rest + overlays capture. node studio-cap.cjs <W> <phase:before|after>
const X = require('./lib122.cjs');
const { L, sleep } = X;
const fs = require('fs');
const path = require('path');
const W = +process.argv[2];
const PHASE = process.argv[3];
const ROOT = path.join(__dirname, '..');
const SHD = path.join(ROOT, 'shots', `studio-${PHASE}-${W}`);
fs.mkdirSync(SHD, { recursive: true });
const net = [];
const res = { W, PHASE, utc: new Date().toISOString() };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], `studio-${PHASE}-${W}`, net, { deviceScaleFactor: 2, extraInit: X.tapInit });
    const p = o.page;
    res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), demo: document.body.innerText.includes('Demo collection — no sign-in required') }));
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    await p.screenshot({ path: path.join(SHD, 'rest-full.png') });
    if (W === 1440) {
      const lane = await p.evaluate(() => { const l = document.querySelectorAll('[data-grid-seconds]')[1]; const r = l.getBoundingClientRect(); const vw = document.documentElement.clientWidth; return { x: Math.min(r.right, vw) - 80, y: r.y + r.height / 2 }; });
      await p.mouse.click(lane.x, lane.y, { button: 'right' });
      await sleep(500);
      const gm = await p.$('[data-testid=arrangement-grid-menu]');
      res.gridMenu = !!gm;
      if (gm) { await p.screenshot({ path: path.join(SHD, 'grid-menu-full.png') }); }
      await p.keyboard.press('Escape'); await sleep(400);
      if (!(await p.$('[data-testid=arrangement-marker]'))) { await p.click('[data-testid=arrangement-marker-add]'); await sleep(500); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p); await p.mouse.move(2, 2); await sleep(300); res.markerAdded = true; }
      const marker = await p.$('[data-testid=arrangement-marker]');
      res.markerCount = await p.evaluate(() => document.querySelectorAll('[data-testid=arrangement-marker]').length);
      if (marker) {
        await marker.click({ button: 'right' }); await sleep(500);
        res.markerMenu = !!(await p.$('[data-testid=arrangement-marker-menu]'));
        if (res.markerMenu) await p.screenshot({ path: path.join(SHD, 'marker-menu-full.png') });
        await p.keyboard.press('Escape'); await sleep(400);
      }
      await X.openDlg(p);
      await p.mouse.move(2, 2); await sleep(400);
      await p.screenshot({ path: path.join(SHD, 'export-dialog-full.png') });
      res.exportDialog = true;
      res.dangerButtonClasses = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].map((x) => x.className).filter((c) => /destructive/.test(c)));
    }
  } catch (e) { res.error = String((e && e.stack) || e).slice(0, 800); }
  await b.close();
  res.net = net.map((n) => ({ errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, auth: n.authHeaders, noise: n.noise }));
  L.save(path.join(ROOT, 'out'), `studio-${PHASE}-${W}.json`, res);
  console.log(JSON.stringify(res));
})();
