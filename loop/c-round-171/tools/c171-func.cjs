// C round 171 — FUNC-SMOKE-V3C4C3. Real mouse clicks at centres (elementFromPoint hit-checked). node c171-func.cjs <W> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const centreClick = async (p, l) => { const bb = await l.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await l.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return !!(t && (t === e || e.contains(t))); }, [x, y]); await p.mouse.move(x, y, { steps: 2 }); await p.mouse.click(x, y); return hit; };
const focusInfo = (p) => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, testid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label'), text: (a.textContent || '').trim().slice(0, 30), inDialog: !!a.closest('[role=dialog]') } : null; });
const DONE = (p) => p.locator('[role=dialog] button', { hasText: /^Done$/ }).last();
const EXPB = (p) => p.locator('[role=dialog] .flex.justify-end > button:last-child');
const CANCEL = '[data-testid=arrangement-export-cancel]';
const dlg = (p) => p.evaluate(() => { const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]'); if (!d) return { open: false }; const f = document.querySelector('[data-testid=arrangement-export-footer]'); const s = f && f.querySelector('[role=status],[role=alert]'); const lab = (tid) => { const i = d.querySelector(`[data-testid=${tid}]`); const l = i && i.closest('label'); return i && { checked: i.checked, border: getComputedStyle(l).borderTopColor, bg: getComputedStyle(l).backgroundColor }; }; const b = d.querySelector('.flex.justify-end > button:last-child'); const done = [...d.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Done'); return { open: true, wav: lab('arrangement-export-format-wav'), mp3: lab('arrangement-export-format-mp3'), exportLabel: b && b.textContent.trim(), exportDisabled: b && b.disabled, doneDisabled: done && done.disabled, cancel: !!d.querySelector('[data-testid=arrangement-export-cancel]'), status: s ? s.textContent.trim() : null, statusAll: [...d.querySelectorAll('[role=status],[role=alert]')].map((e) => e.textContent.trim()) }; });
async function openViaTransport(p) { await L.blur(p); const hit = await centreClick(p, p.getByRole('button', { name: 'Export', exact: true })); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(600); return hit; }
async function waitDl(log, n0, ms = 60000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) return true; await sleep(200); } return false; }
const boxOf = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; }, s);
const dockState = (p) => p.evaluate(() => ({ box: !!document.querySelector('[data-testid=arrangement-video-box]'), floating: (() => { const b = document.querySelector('[data-testid=arrangement-video-box]'); return b ? getComputedStyle(b).position : null; })(), placeholder: !!document.querySelector('[data-testid=arrangement-video-placeholder]'), ret: !!document.querySelector('[data-testid=arrangement-video-placeholder-return]'), drag: !!document.querySelector('[data-testid=arrangement-video-drag]'), expandLabel: (document.querySelector('[data-testid=arrangement-video-expand]') || {}).getAttribute?.('aria-label') || null }));
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  // ---- Session A: cards, export WAV, Done
  { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c171func-${W}-A-${ATT}`, net); res.fontsA = log.fontsReady;
    res.add = (await L.addAt(p, 'demo-middle-east', 'music', 1)).status; await sleep(600);
    res.clips = (await L.clipsDom(p)).map((c) => [c.lane, c.start, c.wdur]);
    const a = res.A = {};
    a.openHit = await openViaTransport(p); a.d0 = await dlg(p);
    const mp3Card = p.locator('[role=dialog] label:has([data-testid=arrangement-export-format-mp3])');
    a.mp3Hit = await centreClick(p, mp3Card); await sleep(400); a.dMp3 = await dlg(p);
    await p.mouse.move(2, 2); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-mp3-card.png`) });
    a.wavHit = await centreClick(p, p.locator('[role=dialog] label:has([data-testid=arrangement-export-format-wav])')); await sleep(400); a.dWav = await dlg(p);
    const n0 = log.downloads.length; a.exportHit = await centreClick(p, EXPB(p)); a.dlDone = await waitDl(log, n0); await sleep(800);
    a.dAfter = await dlg(p); a.downloads = log.downloads.slice(n0).map((d) => ({ name: d.name, size: d.size, err: d.err || null }));
    const f = log.downloads.slice(n0).find((d) => d.file && /\.wav$/.test(d.name));
    if (f) { const w = X.wav(f.file); const hdr = fs.readFileSync(f.file).subarray(0, 12).toString('latin1'); a.wav = { riff: hdr.slice(0, 4), wave: hdr.slice(8, 12), fmt: w.fmt, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(5), rms: +w.rms.toFixed(5), nan: w.nan, sha: w.sha, head: X.winStats(w.w, 0, 0.95), body: X.winStats(w.w, 1.5, 60) }; fs.unlinkSync(f.file); }
    a.projectEnd = Math.max(...res.clips.map((c) => c[1] + c[2]));
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-after-export.png`) });
    a.doneHit = await centreClick(p, DONE(p)); await sleep(600); a.dClosed = await dlg(p); a.focusAfterDone = await focusInfo(p);
    // backdrop-release observation (pre-existing Modal): press on Done, release on the backdrop
    await openViaTransport(p); const db = await DONE(p).boundingBox(); await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2); await p.mouse.down(); await sleep(150); await p.mouse.move(4, 4, { steps: 4 }); await p.mouse.up(); await sleep(500); a.pressDoneReleaseBackdrop = await dlg(p);
    await ctx.close(); }
  // ---- Session B: Cancel during a real render
  { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c171func-${W}-B-${ATT}`, net); res.fontsB = log.fontsReady;
    const c = res.C = { adds: [] };
    for (const ln of ['music', 'stems', 'sfx']) { c.adds.push((await L.addAt(p, 'demo-middle-east', ln, 1)).status); const cs = (await L.clipsDom(p)).filter((q) => q.lane === ln); await L.selectClip(p, cs[0].id); await L.blur(p); for (let i = 0; i < 6; i++) { await p.keyboard.press('Control+d'); await sleep(400); } }
    await p.keyboard.press('Escape'); await sleep(300); c.nClips = (await L.clipsDom(p)).length;
    await openViaTransport(p);
    const n0 = log.downloads.length; c.exportHit = await centreClick(p, EXPB(p)); const t0 = Date.now();
    while (Date.now() - t0 < 20000) { const l = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-progress-label]') || {}).textContent || ''); if (/\d+%/.test(l) && await p.locator(CANCEL).count()) { c.labelAtClick = l; break; } await sleep(50); }
    c.waitMs = Date.now() - t0; await sleep(150);
    c.dBefore = await dlg(p); c.cancelBox = await boxOf(p, CANCEL);
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-rendering.png`) });
    if (c.dBefore.cancel) { c.cancelHit = await centreClick(p, p.locator(CANCEL)); c.clickedAtMs = Date.now() - t0; }
    await sleep(700); c.dAfter = await dlg(p); c.focusAfter = await focusInfo(p);
    await sleep(5000); c.downloadsAfter5s = log.downloads.slice(n0).map((d) => d.name); c.dLater = await dlg(p);
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-cancelled.png`) });
    // observation: press Cancel... no; press inside, release on backdrop during a render
    const n1 = log.downloads.length; await centreClick(p, EXPB(p)); const t1 = Date.now(); while (Date.now() - t1 < 10000 && !(await p.locator(CANCEL).count())) await sleep(50); await sleep(400);
    const eb = await EXPB(p).boundingBox(); await p.mouse.move(eb.x + eb.width / 2, eb.y + eb.height / 2); await p.mouse.down(); await sleep(100); await p.mouse.move(4, 4, { steps: 4 }); await p.mouse.up(); await sleep(400);
    c.renderPressReleaseBackdrop = await dlg(p); await waitDl(log, n1, 30000); c.renderObsDownloads = log.downloads.slice(n1).map((d) => [d.name, d.size]);
    for (const d of log.downloads) if (d.file && fs.existsSync(d.file)) fs.unlinkSync(d.file);
    await ctx.close(); }
  // ---- Session C: dock
  { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c171func-${W}-D-${ATT}`, net); res.fontsD = log.fontsReady;
    const d = res.D = {};
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p); d.s0 = await dockState(p);
    d.expandHit = await centreClick(p, p.locator('[data-testid=arrangement-video-expand]')); await sleep(900); d.s1 = await dockState(p);
    d.box0 = await boxOf(p, '[data-testid=arrangement-video-box]');
    await p.locator('[data-testid=arrangement-video-drag]').focus(); await p.keyboard.press('ArrowRight'); await sleep(400);
    d.box1 = await boxOf(p, '[data-testid=arrangement-video-box]'); d.dx = +(d.box1[0] - d.box0[0]).toFixed(2); d.dy = +(d.box1[1] - d.box0[1]).toFixed(2);
    await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
    const vt = () => p.evaluate(() => { const v = document.querySelector('[data-testid=arrangement-video-box] video[data-video-role=active]') || document.querySelector('video[data-video-role=active]'); return v ? { ct: +v.currentTime.toFixed(3), paused: v.paused, inBox: !!v.closest('[data-testid=arrangement-video-box]') } : null; });
    d.v0 = await vt(); await p.keyboard.press('Space'); await sleep(1500); d.v1 = await vt(); d.pos1 = await L.posNow(p);
    await p.keyboard.press('Space'); await sleep(400); d.v2 = await vt(); await sleep(800); d.v3 = await vt(); d.pos3 = await L.posNow(p);
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-floating.png`) });
    d.closeHit = await centreClick(p, p.locator('[data-testid=arrangement-video-close]')); await sleep(700); d.s2 = await dockState(p); d.focusAfterClose = await focusInfo(p);
    await centreClick(p, p.locator('[data-testid=arrangement-video-expand]')); await sleep(900); d.s3 = await dockState(p);
    d.returnHit = await centreClick(p, p.locator('[data-testid=arrangement-video-placeholder-return]')); await sleep(700); d.s4 = await dockState(p); d.focusAfterReturn = await focusInfo(p);
    await centreClick(p, p.locator('[data-testid=arrangement-video-expand]')); await sleep(900); d.s5 = await dockState(p);
    await p.keyboard.press('Escape'); await sleep(700); d.s6 = await dockState(p); d.focusAfterEsc = await focusInfo(p);
    await ctx.close(); }
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
