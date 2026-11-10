const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const H = W === 1440 ? 900 : 720;
const info = (p) => p.evaluate(() => ({ flags: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => (m.querySelector('[data-marker-label]') || m).textContent.trim()), input: !!document.querySelector('[data-testid=arrangement-marker-row] input, [data-testid=arrangement-marker-strip] input'), inputVal: (document.querySelector('[data-testid=arrangement-marker-row] input, [data-testid=arrangement-marker-strip] input') || {}).value || null, active: document.activeElement && (document.activeElement.dataset.testid || document.activeElement.tagName), status: (document.querySelector('[data-testid=arrangement-status]') || {}).textContent, undo: ([...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Undo')) || {}).title }));
(async () => { const b = await L.launch(); const net = []; const res = { W, steps: [] }; const log = (k, v) => res.steps.push({ k, ...v });
  const { page: p } = await L.openStudio(b, X.VPS[W], `rvmarker-${W}`, net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.seekTo(p, 12);
  const c = (await L.clipsDom(p))[0]; const hb = await p.locator(`[data-clip-id="${c.id}"] > div`).first().boundingBox(); const hx = hb.x + 30, hy = hb.y + hb.height / 2;
  // A: add during held gesture
  await L.blur(p); await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx + 20, hy, { steps: 4 }); await p.mouse.move(hx + 40, hy, { steps: 4 }); await sleep(200);
  log('A-held', await info(p));
  await p.keyboard.press('m'); await sleep(300); log('A-M', await info(p));
  for (let i = 0; i < 60; i++) { await p.keyboard.press('Shift+Tab'); if (await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid === 'arrangement-marker-add')) break; }
  log('A-focusAdd', await info(p)); await p.keyboard.press('Enter'); await sleep(300); log('A-EnterAdd', await info(p));
  await p.keyboard.type('held'); await p.keyboard.press('Enter'); await sleep(300); log('A-typeEnter', await info(p));
  await p.mouse.move(hx + 60, hy, { steps: 3 }); await p.mouse.up(); await sleep(500); log('A-released', await info(p));
  // after release: add by keyboard
  await L.blur(p); await p.keyboard.press('m'); await sleep(400); log('A-M-after', await info(p));
  await p.keyboard.press('Control+a'); await p.keyboard.type('Intro'); await p.keyboard.press('Enter'); await sleep(400); log('A-commit', await info(p));
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); log('A-undo1', await info(p));
  await p.keyboard.press('Control+Shift+z'); await sleep(300); log('A-redo', await info(p));
  // B: rename during held gesture
  const hb2 = await p.locator(`[data-clip-id="${c.id}"] > div`).first().boundingBox(); const gx = hb2.x + 30, gy = hb2.y + hb2.height / 2;
  await L.blur(p); await p.mouse.move(gx, gy); await p.mouse.down(); await p.mouse.move(gx + 40, gy, { steps: 6 }); await sleep(200);
  for (let i = 0; i < 60; i++) { await p.keyboard.press('Shift+Tab'); if (await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid === 'arrangement-marker')) break; }
  log('B-focusFlag', await info(p)); await p.keyboard.press('F2'); await sleep(300); log('B-F2', await info(p));
  await p.keyboard.type('Verse'); await p.keyboard.press('Enter'); await sleep(300); log('B-typeEnter', await info(p));
  await p.mouse.up(); await sleep(500); log('B-released', await info(p));
  await p.keyboard.press('Control+z'); await sleep(300); log('B-undoMove', await info(p));
  // rename after release
  await p.locator('[data-testid=arrangement-marker]').first().focus(); await p.keyboard.press('F2'); await sleep(300); log('B-F2-after', await info(p));
  await p.keyboard.press('Control+a'); await p.keyboard.type('Verse'); await p.keyboard.press('Enter'); await sleep(300); log('B-commit', await info(p));
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); log('B-undo', await info(p));
  res.net = X.netOk(net); L.save(L.OUT, `RV-MARKER-ENTER-${W}.json`, res);
  for (const s of res.steps) console.log(s.k, JSON.stringify({ f: s.flags, in: s.input, v: s.inputVal, a: s.active, st: (s.status || '').slice(0, 90), u: s.undo }));
  console.log(JSON.stringify(res.net)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
