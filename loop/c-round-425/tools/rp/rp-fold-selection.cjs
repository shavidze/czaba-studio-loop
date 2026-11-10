const L = require('./lib.cjs'); const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => { const b = await L.chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`;
  const o = await L.openStudio(b, { width: w, height: h }, 'fold-' + k, [], {}); const p = o.page;
  const snap = (tag) => p.evaluate(() => { const clips = [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.dataset.clipId.slice(0, 8), kind: c.dataset.clipKind, sel: /ring-brand/.test(c.className), box: [Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)], lane: c.closest('[data-track-id]')?.dataset.trackId })); return { clips, status: (document.querySelector('[data-testid=arrangement-status]')?.textContent || '').trim().slice(0, 140), detail: (document.querySelector('[data-testid=arrangement-detail-panel]')?.textContent || '').replace(/\s+/g, ' ').slice(0, 160), active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName }; });
  const opt = p.locator('[role=option][data-source-id]').first(); await opt.focus(); await p.keyboard.press('Enter'); await sleep(800);
  const r = { afterAdd: await snap('add') };
  const bar = p.locator('[data-clip-id]').first(); const bb = await bar.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + 8); await sleep(300);
  r.selected = await snap('sel');
  const lane = await p.evaluate(() => document.querySelector('[data-clip-id]').closest('[data-track-id]').dataset.trackId);
  const fold = p.locator(`[data-track-id="${lane}"] [data-testid=arrangement-track-fold]`).first(); r.lane = lane;
  await fold.click(); await sleep(400); r.folded = await snap('folded');
  await fold.click(); await sleep(400); r.unfolded = await snap('unfolded');
  r.selectionSurvives = { foldedSel: r.folded.clips.map((c) => c.sel), unfoldedSel: r.unfolded.clips.map((c) => c.sel) };
  await p.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-425/shots/fold-${k}.png` });
  out[k] = r; await o.ctx.close(); console.log(k, JSON.stringify(r.selectionSurvives), r.lane); }
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-425/out/rp-fold-selection.json', JSON.stringify(out, null, 1)); await b.close(); })();
