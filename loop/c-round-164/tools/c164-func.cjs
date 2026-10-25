// C round 164 ENV-FUNC: add/drag/delete/undo/redo/A key + real output tap with the envelope at gain 0 vs 0 dB. node c164-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, steps: [] };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c164func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady && log.fontsReady.ok;
  await p.mouse.move(2, 2); await sleep(300); await L.setSnapOff(p);
  await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
  const pts = () => p.evaluate((cid) => [...document.querySelectorAll(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`)].map((e) => `${e.dataset.time}@${e.dataset.gain}`), cid);
  const env = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-envelope-toggle]').getAttribute('aria-pressed'));
  const step = async (name, extra = {}) => { const r = { name, status: await L.status(p), points: await pts(), env: await env(), ...extra }; res.steps.push(r); return r; };
  await L.blur(p); await p.keyboard.press('a'); await sleep(300); await step('A key on');
  let cb = await X.clipBox(p, cid); await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500); await step('dblclick add');
  let pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  await p.mouse.move(pt.x + pt.width / 2, pt.y + pt.height / 2); await p.mouse.down(); await p.mouse.move(pt.x + pt.width / 2, pt.y + pt.height / 2 + 18, { steps: 6 }); await p.mouse.up(); await sleep(700); await step('drag 18 down');
  pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  await p.mouse.dblclick(pt.x + pt.width / 2, pt.y + pt.height / 2); await sleep(500); await step('dblclick point delete');
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); await step('Ctrl+Z restores');
  await L.blur(p); await p.keyboard.press('Control+Shift+z'); await sleep(400); await step('Ctrl+Shift+Z redo delete');
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); await step('Ctrl+Z again');
  await L.blur(p); await p.keyboard.press('a'); await sleep(300); await step('A key off');
  await L.blur(p); await p.keyboard.press('a'); await sleep(300); await step('A key on again');
  // real audio: drag the point to the bottom (gain 0)
  pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  await p.mouse.move(pt.x + pt.width / 2, pt.y + pt.height / 2); await p.mouse.down(); await p.mouse.move(pt.x + pt.width / 2, pt.y + 300, { steps: 8 }); await p.mouse.up(); await sleep(700); await step('drag to bottom');
  cb = await X.clipBox(p, cid); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-gain0.png`), clip: { x: cb.x, y: cb.y - 4, width: 360, height: cb.height + 8 } });
  const measure = async (label, from) => {
    await L.blur(p); await L.seekTo(p, from); await sleep(300);
    await p.evaluate(() => window.__tapStart()); await L.blur(p); await p.keyboard.press('Space'); await sleep(1300); await p.keyboard.press('Space'); await sleep(200);
    const S = await p.evaluate(() => window.__tapStop());
    const t0 = S.length ? S[0].t : 0; const inWin = S.filter((s) => s.t - t0 >= 100 && s.t - t0 <= 1100);
    const peak = inWin.reduce((m, s) => Math.max(m, s.peak), 0);
    const ctxState = await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state));
    return { label, from, samples: inWin.length, peak: +peak.toFixed(5), ctxState, tap: await p.evaluate(() => ({ n: window.__tap.an.size, err: window.__tap.err || null })) };
  };
  res.audio = [];
  for (const from of [0, 20]) res.audio.push(await measure('gain0', from));
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); await step('undo drag to bottom (0 dB)');
  for (const from of [0, 20]) res.audio.push(await measure('0dB', from));
  res.audioRatio = [0, 20].map((from) => { const a = res.audio.find((x) => x.label === 'gain0' && x.from === from); const z = res.audio.find((x) => x.label === '0dB' && x.from === from); return { from, gain0: a.peak, zero: z.peak, ratio: z.peak > 0 ? +(a.peak / z.peak).toFixed(4) : null }; });
  res.net = X.netOk(net);
  await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ W, fonts: res.fonts, steps: res.steps, audio: res.audio, ratio: res.audioRatio, net: res.net }, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
