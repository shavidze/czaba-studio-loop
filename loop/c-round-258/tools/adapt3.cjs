// C round 258: §3 adapted sub-criteria (RG-01 split path, RG-10 ruler click, RG-12 Enter status, RG-14 G toggles,
// RG-15 BPM title/status, RG-16 marker via ruler + Ctrl+Right). usage: node adapt3.cjs <outDir>
const L = require('./lib258.cjs');
const { sleep, fs, path } = L;
const outDir = path.resolve(process.argv[2]); fs.mkdirSync(outDir, { recursive: true });
const S = (page) => page.evaluate(() => ({ ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')), m: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null, playing: document.querySelector('button[aria-label="Play"]')?.dataset.playing === 'true', status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null, clock: document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null, undo: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('title') || ''))?.getAttribute('title') ?? null }));
const clips = (page) => page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ lane: c.closest('[data-track-id]')?.getAttribute('data-track-id'), start: Number(c.getAttribute('data-clip-start')), end: Number(c.getAttribute('data-clip-end') ?? NaN), id: c.getAttribute('data-clip-id') })));
async function geo(page) { const rb = await page.locator('[data-testid="arrangement-ruler"]').boundingBox(); const pps = parseFloat(await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent)); return { rb, pps, tx: (t) => rb.x + t * pps }; }
async function enterAdd(page, id) { const o = page.locator(`[role=option][data-source-id="${id}"]`).first(); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150); await page.keyboard.press('Enter'); await sleep(1200); await L.blur(page); }
(async () => {
  const browser = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
    // RG-01 path + RG-12 status: Enter at insert marker 0, clip-body click at 4, Ctrl+E
    { const { ctx, page, errors } = await L.open(browser, vp, { pulse: false });
      r.fresh = await page.evaluate(() => ({ bpm: document.querySelector('[data-testid="arrangement-tempo-input"]').value, snap: document.querySelector('[data-testid="arrangement-grid-control"]').getAttribute('data-snap'), div: document.querySelector('[data-testid="arrangement-grid-control"]').getAttribute('data-grid-division'), mode: document.querySelector('[data-testid="arrangement-grid-control"]').getAttribute('data-grid-mode') }));
      await enterAdd(page, 'demo-synth-mix'); r.enter = await S(page); r.c0 = await clips(page);
      if ((await page.getByTestId('arrangement-grid-control').getAttribute('data-snap')) === 'on') { await page.keyboard.press('KeyG'); await sleep(300); }
      const g = await geo(page); const cb = await page.locator('[data-track-id="music"] [data-clip-id]').first().boundingBox();
      await page.mouse.click(g.tx(4), cb.y + cb.height * 0.65); await sleep(400); r.bodyClick = await S(page);
      await page.keyboard.press('Control+e'); await sleep(500); r.split = await clips(page); r.splitStatus = (await S(page)).status;
      // RG-10: ruler click while stopped
      const u0 = (await S(page)).undo; await page.mouse.click(g.tx(9.5), g.rb.y + g.rb.height / 2); await sleep(500); r.ruler = await S(page); r.rulerUndoSame = r.ruler.undo === u0;
      r.errors1 = errors; await ctx.close(); }
    // RG-14: fresh, G -> snap on; drag a clip 2 -> ~3.3 -> 3.000; G off; drag to ~4.37 within 1 px
    { const { ctx, page, errors } = await L.open(browser, vp, { pulse: false });
      await L.blur(page); await page.mouse.click(5, 5); await sleep(150);
      const g = await geo(page); await page.mouse.click(g.tx(2), g.rb.y + g.rb.height / 2); await sleep(400);
      await enterAdd(page, 'demo-soft-impact'); r.impact = await clips(page);
      r.snap0 = await page.getByTestId('arrangement-grid-control').getAttribute('data-snap');
      await page.keyboard.press('KeyG'); await sleep(300); r.snap1 = await page.getByTestId('arrangement-grid-control').getAttribute('data-snap');
      const drag = async (fromT, toT) => { const c = page.locator('[data-track-id="music"] [data-clip-id]').first(); const b = await c.boundingBox(); const hy = b.y + 8; const hx = b.x + 20; await page.mouse.move(hx, hy); await page.mouse.down(); const dx = (toT - fromT) * g.pps; for (let i = 1; i <= 12; i += 1) { await page.mouse.move(hx + (dx * i) / 12, hy); await sleep(20); } await page.mouse.up(); await sleep(400); return (await clips(page))[0]; };
      r.snapDrag = await drag(2, 3.3);
      await L.blur(page); await page.keyboard.press('KeyG'); await sleep(300); r.snap2 = await page.getByTestId('arrangement-grid-control').getAttribute('data-snap');
      const before = r.snapDrag.start; r.freeDrag = await drag(before, before + 1.37); r.freeExpected = +(before + 1.37).toFixed(3);
      r.gridLines = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-track-id] [data-grid-seconds]')].map((e) => e.getAttribute('data-grid-seconds')))]);
      r.errors2 = errors; await ctx.close(); }
    // RG-15: BPM 90 -> bars; title + status say not stretched; RG-16: ruler 12, M, Enter; Home; Ctrl+Right to the flag
    { const { ctx, page, errors } = await L.open(browser, vp, { pulse: false });
      await enterAdd(page, 'demo-soft-impact');
      const ti = page.getByTestId('arrangement-tempo-input'); await ti.click(); await ti.fill('90'); await page.keyboard.press('Enter'); await sleep(600); await L.blur(page);
      r.bpm = await page.evaluate(() => ({ title: document.querySelector('[data-testid="arrangement-tempo-input"]').getAttribute('title'), status: document.querySelector('[data-testid="arrangement-status"]').textContent, bars: [...document.querySelectorAll('[data-testid="arrangement-bars-mark"]')].map((e) => e.textContent.trim()).filter(Boolean).slice(0, 3), persistent: [...document.querySelectorAll('body *')].filter((e) => e.childElementCount === 0 && /not stretched/i.test(e.textContent) && !e.closest('[data-testid="arrangement-status"]') && e.getBoundingClientRect().height > 0).map((e) => e.textContent.slice(0, 80)) }));
      const g = await geo(page);
      await page.mouse.click(g.tx(12), g.rb.y + g.rb.height / 2); await sleep(900);
      await page.keyboard.press('KeyM'); await sleep(500);
      const inp = page.getByTestId('arrangement-marker-name-input'); r.editor = await inp.count();
      if (r.editor) { await inp.fill('აქ შედის მუსიკა'); await page.keyboard.press('Enter'); await sleep(500); }
      r.flags = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => ({ t: m.getAttribute('data-marker-time'), name: m.textContent.trim(), cur: m.getAttribute('aria-current') })));
      await L.blur(page); await page.keyboard.press('Home'); await sleep(400); r.home = await S(page);
      r.steps = []; for (let i = 0; i < 6; i += 1) { await page.keyboard.press('Control+ArrowRight'); await sleep(400); const s = await S(page); const cur = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].find((m) => m.getAttribute('aria-current') === 'true')?.getAttribute('data-marker-time') ?? null); r.steps.push({ ...s, cur }); if (s.m === '12.000') break; }
      r.errors3 = errors; await ctx.close(); }
    const last = r.steps[r.steps.length - 1];
    const m = r.split.filter((c) => c.lane === 'music').sort((a, b) => a.start - b.start);
    r.checks = {
      freshDefaults: r.fresh.bpm === '' && r.fresh.snap === 'off' && r.fresh.div === '1' && r.fresh.mode === 'adaptive',
      rg12EnterStatus: /^“.+” added to the Music track at 00:00\.000\./.test(r.enter.status || '') && r.c0.length === 1 && r.c0[0].start === 0,
      rg01BodyClickMarker: r.bodyClick.m !== null && Math.abs(Number(r.bodyClick.m) - 4) < 0.03 && !r.bodyClick.playing,
      rg01Split: m.length === 2 && m[0].start === 0 && Math.abs(m[1].start - Number(r.bodyClick.m)) < 0.002,
      rg10Ruler: !r.ruler.playing && r.ruler.m !== null && Math.abs(Number(r.ruler.m) - 9.5) < 0.03 && Math.abs(r.ruler.ph - Number(r.ruler.m)) < 0.001 && r.rulerUndoSame,
      rg14: r.snap0 === 'off' && r.snap1 === 'on' && r.snapDrag.start === 3 && r.snap2 === 'off' && Math.abs(r.freeDrag.start - r.freeExpected) * 40 <= 1.0 && r.gridLines.length === 1 && r.gridLines[0] === '1',
      rg15: /not stretched/i.test(r.bpm.title || '') && /not stretched/i.test(r.bpm.status || '') && r.bpm.persistent.length === 0 && r.bpm.bars.join(',').startsWith('1,2,3'),
      rg16: r.editor === 1 && r.flags.length === 1 && r.flags[0].t === '12.000' && /აქ შედის მუსიკა/.test(r.flags[0].name) && r.home.m === '0.000' && last.cur === '12.000' && last.m === '12.000' && last.ph === 12 && last.clock === '00:12.000',
      errors: r.errors1.length + r.errors2.length + r.errors3.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean);
    console.log(k, r.pass, JSON.stringify(r.checks));
  }
  fs.writeFileSync(path.join(outDir, 'adapt3.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
