// C round 115 — G-T2-MULTI. Usage: node export.cjs <1440|1280>
// Tolerances fixed before running (task §4): peak and RMS ratio vs own baseline = 10^(g/20) ±0.5 %; stored difference exactly 4.0; no clipped samples.
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const X = process.env.SECOND || 'sfx';
const num = (s) => Number(String(s).replace(/−/g, '-'));

async function doExport(p, log, name) {
  await L.blur(p);
  const n0 = log.downloads.length;
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title');
  await L.sleep(400);
  await p.click('[data-testid=arrangement-export-format-wav]');
  await p.click('[data-testid=arrangement-export-scope-project]');
  await L.sleep(200);
  const btn = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ });
  await btn.click();
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) { if (log.downloads.length > n0 && log.downloads[n0].file) break; await L.sleep(200); }
  await L.sleep(800);
  const overload = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-export-overload]'); return o ? o.textContent.trim() : null; });
  await p.screenshot({ path: path.join(L.SHOTS, `export-${name}-${VP.width}.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) throw new Error('no download for ' + name);
  const dst = path.join(L.OUT, `exp-${VP.width}-${X}${process.env.MASTER ? `-m${-Number(process.env.MASTER)}` : ''}-${name}.wav`);
  fs.renameSync(rec.file, dst);
  return { name, file: path.basename(dst), size: fs.statSync(dst).size, overload, ms: Date.now() - t0 };
}

function analyse(file) {
  const w = W.parse(fs.readFileSync(file));
  const st = W.stats(w);
  let first = -1, last = -1;
  for (let i = 0; i < w.n; i++) { if (w.read(i) !== 0) { if (first < 0) first = i; last = i; } }
  return { w, info: { riff: w.riff, tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, peak: st.peak, peakDb: +(20 * Math.log10(st.peak)).toFixed(3), rms: st.rms, rmsDb: +(20 * Math.log10(st.rms)).toFixed(3), firstNZs: first < 0 ? null : +(Math.floor(first / w.fmt.ch) / w.fmt.sr).toFixed(4), lastNZs: last < 0 ? null : +(Math.floor(last / w.fmt.ch) / w.fmt.sr).toFixed(4) } };
}

async function setMute(p, lane, on) {
  const cur = await p.evaluate((lane) => document.querySelector(`[data-track-id=${lane}] button[aria-label^="Mute"]`).getAttribute('aria-pressed'), lane);
  if ((cur === 'true') !== on) { await p.click(`[data-track-id=${lane}] button[aria-label^="Mute"]`); await L.sleep(200); }
  await L.blur(p);
}
const selected = (p) => L.clipsDom(p).then((c) => c.filter((x) => x.sel).map((x) => x.lane));
async function single(p, clips, lane) {
  if ((await selected(p)).length > 1) {
    const pt = await p.evaluate(() => {
      for (const c of [...document.querySelectorAll('[data-clip-id]')]) {
        const b = c.getBoundingClientRect();
        for (const dx of [80, 160, 240]) {
          const x = Math.min(b.right + dx, innerWidth - 40), y = b.top + 10;
          const e = document.elementFromPoint(x, y);
          if (e && !e.closest('[data-clip-id]') && !e.closest('[data-testid=arrangement-detail-panel]') && e.closest('[data-track-id]')) return { x, y };
        }
      }
      return null;
    });
    if (pt) { await p.mouse.click(pt.x, pt.y); await L.sleep(300); }
  }
  const other = clips.find((c) => c.lane === (lane === 'music' ? 'stems' : 'music'));
  await L.selectClip(p, other.id);
  await L.selectClip(p, clips.find((c) => c.lane === lane).id);
  await L.blur(p);
  const s = await selected(p);
  if (s.join() !== lane) throw new Error('select ' + lane + ' got ' + s);
  return p.inputValue(FIELD);
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const MASTER = Number(process.env.MASTER || 0);
  const tag = `exp-${VP.width}-${X}${MASTER ? `-m${-MASTER}` : ''}`;
  const o = await L.openStudio(browser, VP, tag, net);
  const p = o.page;
  const out = { utc: new Date().toISOString(), vp: VP, steps: [], exports: {}, rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: n.downloads.map((d) => ({ name: d.name, size: d.size })) })); L.save(L.OUT, `${tag}.json`, out); };
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) out.steps.push(await L.addAt(p, s, ln, t));
  await L.blur(p);
  const clips = await L.clipsDom(p);
  out.clips = clips;
  await L.selectClip(p, clips.find((c) => c.lane === 'stems').id);
  const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  await L.blur(p);
  const A = {};
  if (MASTER) {
    const MS = 'input[aria-label="Master Volume"]';
    const m0 = await p.evaluate((MS) => { const e = document.querySelector(MS); return { v: +e.value, step: +e.step, min: +e.min }; }, MS);
    await p.locator(MS).focus();
    for (let k = 0; k < 400; k++) { const v = +(await p.inputValue(MS)); if (v <= MASTER + 1e-9) break; await p.keyboard.press('ArrowLeft'); await L.sleep(10); }
    await L.blur(p); await L.sleep(300);
    out.master = { before: m0, after: +(await p.inputValue(MS)), text: await p.evaluate((MS) => document.querySelector(MS).getAttribute('aria-valuetext'), MS) };
    console.log('master', JSON.stringify(out.master));
    if (Math.abs(out.master.after - MASTER) > 1e-9) throw new Error('master not at target');
  }
  const exp = async (name) => { const e = await doExport(p, o.log, name); const a = analyse(path.join(L.OUT, e.file)); A[name] = a.w; out.exports[name] = { ...e, info: a.info }; console.log(name, JSON.stringify(a.info), 'overload:', e.overload); save(); return a.info; };
  const only = async (lane) => { for (const ln of ['music', 'stems', 'sfx']) await setMute(p, ln, ln !== lane); };

  await only('stems'); const bS = await exp('base-stems-0');
  await only(X); const bX = await exp(`base-${X}-0`);
  out.rows.baselines = { stems: { full: bS.full, peakDb: bS.peakDb, valid: bS.full === 0 && !out.exports['base-stems-0'].overload }, [X]: { full: bX.full, peakDb: bX.peakDb, valid: bX.full === 0 && !out.exports[`base-${X}-0`].overload } };
  save();

  await single(p, clips, 'stems'); await p.fill(FIELD, '-6'); await p.locator(FIELD).press('Enter'); await L.sleep(250); await L.blur(p);
  await single(p, clips, X); await p.fill(FIELD, '-2'); await p.locator(FIELD).press('Enter'); await L.sleep(250); await L.blur(p);
  await single(p, clips, 'stems');
  await L.selectClip(p, clips.find((c) => c.lane === X).id, ['Shift']);
  await L.blur(p);
  const sel = await selected(p);
  const r0 = await p.evaluate(([F]) => { const f = document.querySelector(F); const b = f.getBoundingClientRect(); const rg = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); return { v: +f.value, box: { x: b.x, y: b.y, w: b.width, h: b.height }, range: rg && rg.textContent }; }, [F]);
  const x0 = r0.box.x + ((r0.v + 60) / 84) * r0.box.w, y = r0.box.y + r0.box.h / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 20; k++) await p.mouse.move(x0 - k, y);
  await p.mouse.up(); await L.sleep(300);
  const rangeAfter = await p.evaluate(() => { const rg = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); return rg && rg.textContent; });
  const gS = num(await single(p, clips, 'stems'));
  const gX = num(await single(p, clips, X));
  out.steps.push({ multiSelected: sel, rangeBefore: r0.range, faderW: r0.box.w, rangeAfter, gStems: gS, gSfx: gX });
  save();

  await only('stems'); const mS = await exp('multi-stems');
  await only(X); const mX = await exp(`multi-${X}`);
  const row = (b, m, g) => { const t = Math.pow(10, g / 20); const pr = m.peak / b.peak, rr = m.rms / b.rms; return { g, target: +t.toFixed(6), peakRatio: +pr.toFixed(6), rmsRatio: +rr.toFixed(6), peakErrPct: +((pr / t - 1) * 100).toFixed(3), rmsErrPct: +((rr / t - 1) * 100).toFixed(3), full: m.full, nan: m.nan, sameFrames: m.frames === b.frames, sr: m.sr, bits: m.bits, ch: m.ch, seconds: m.seconds, ok: Math.abs(pr / t - 1) <= 0.005 && Math.abs(rr / t - 1) <= 0.005 && m.full === 0 && m.nan === 0 }; };
  const rs = row(bS, mS, gS), rx = row(bX, mX, gX);
  out.rows['G-T2-MULTI'] = { second: X, stems: rs, [X]: rx, storedDiff: +(gX - gS).toFixed(4), selected: sel, baselinesValid: out.rows.baselines.stems.valid && out.rows.baselines[X].valid,
    pass: sel.length === 2 && Math.abs(gX - gS - 4) < 1e-9 && gS < -6 && rs.ok && rx.ok && out.rows.baselines.stems.valid && out.rows.baselines[X].valid };
  save();
  console.log(JSON.stringify(out.rows, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
