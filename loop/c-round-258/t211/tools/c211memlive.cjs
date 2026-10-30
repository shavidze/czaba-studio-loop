// C round 211 — members live-gain timeline while playing (per param: first/last write, count), to explain per-member writes.
const L = require('./c211lib.cjs');
const [base, vw, vh, tag] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
(async () => { const b = await L.launch(); const { ctx, page } = await L.openLab(b, base, vw, vh); const R = {};
  R.members = await L.addMembers(page);
  R.clips = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind=audio]')].map((c) => ({ t: c.textContent.slice(0, 20), start: c.getAttribute('data-clip-start'), w: Math.round(c.getBoundingClientRect().width) })));
  await L.space(page, 'Pause');
  const tA = await L.now(page);
  const d = await L.drag(page, L.sl(page, 'Clip Gain — fader'), 'm', { keepSeq: true, perMove: true });
  const seq = d.gwDragSeq; const by = {};
  for (const w of seq) { const o = by[w.id] || (by[w.id] = { n: 0, first: w.dt, last: w.dt, firstV: w.v, lastV: w.v }); o.n++; o.last = w.dt; o.lastV = w.v; }
  R.byParam = by; R.drag = { win: d.winCommits, max: d.winMax, chg: d.perMoveValueChanges, after: d.after.vt, starts: d.sourceStartsDuringDrag };
  R.ended = await page.evaluate((tA) => window.__c.starts.filter((t) => t >= tA - 5000).length, tA);
  R.dragMs = seq.length ? seq.at(-1).dt : null;
  // second members drag at a later playhead: move playhead to 0 by stop/start? record playhead text
  R.pos = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-position]') || document.querySelector('[data-testid=arrangement-time]') || {}).textContent || null);
  console.log(JSON.stringify(R, null, 1)); await b.close(); })();
