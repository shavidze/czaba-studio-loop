const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const info = (w) => ({ sha: w.sha, sr: w.fmt.sr, bits: w.fmt.bits, ch: w.fmt.ch, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(6), rms: +w.rms.toFixed(6), nan: w.nan });
const rel = (f) => f.replace(/.*c-round-122\//, 'c-round-122/');
const rows = {
  async 'RG-19'(p, res) {
    await L.setSnapOff(p); await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    const v = (await L.clipsDom(p)).find((c) => c.kind === 'video');
    const b = await X.clipBox(p, v.id); await p.mouse.move(b.x + b.width / 2, b.y + b.height * 0.7, { steps: 3 }); await sleep(300);
    const h = await p.locator(`[data-clip-id="${v.id}"] [data-testid=arrangement-video-fade-in-handle]`).boundingBox();
    const g = await L.geo(p); const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
    await p.mouse.move(hx, hy, { steps: 2 }); await sleep(100); await p.mouse.down(); await p.mouse.move(hx + g.pps / 2, hy, { steps: 5 }); await p.mouse.move(hx + g.pps, hy, { steps: 5 }); await sleep(150); await p.mouse.up(); await sleep(400);
    res.fadeIn = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeIn, v.id); res.st = await L.status(p);
    res.pos = await L.seekTo(p, 0.5); await sleep(500);
    res.overlay = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-video-fade]'); return o ? { styleOp: o.style.opacity, comp: getComputedStyle(o).opacity, value: o.dataset.videoOpacity } : null; });
    await X.shot(p, `${res.id}-overlay.png`);
    const d = await X.openDlg(p); res.dlg = { videoLine: d.videoLine, text: d.text.slice(0, 900) }; await X.shot(p, `${res.id}-dialog.png`); await X.closeDlg(p);
    const op = +res.overlay.comp;
    res.checks = { fade1: Math.abs(+res.fadeIn - 1) <= 0.0251, pos: Math.abs(res.pos - 0.5) <= 0.026, overlay: Math.abs(op - 0.5) <= 0.02 && Math.abs(op - (1 - +res.overlay.value)) <= 1e-6, dialogNote: !!res.dlg.videoLine && res.dlg.videoLine.length > 0 };
    res.note = 'seek precision: ruler click at 0.5 s = 20 px (pps 40)';
  },
  async 'RG-20'(p, res, log) {
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
    const m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    res.rst = await X.rangeDrag(p, m.id, 4, 9); res.range = await p.evaluate(() => [document.querySelector('[data-testid=arrangement-detail-start]').value, document.querySelector('[data-testid=arrangement-detail-end]').value]);
    const d = await X.openDlg(p); res.dlg0 = { project: d.project, range: d.range, formats: d.formats, footer: d.footer, footerBox: d.footerBox, dlgBox: d.dlgBox, vh: X.VPS[vp].height };
    await X.shot(p, `${res.id}-dialog.png`);
    res.footerVisible = await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); if (!f) return false; const r = f.getBoundingClientRect(); const btn = [...f.querySelectorAll('button')].find((b) => /ექსპორტი$/.test(b.textContent.trim())); const br = btn && btn.getBoundingClientRect(); const top = btn && document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2); return { inViewport: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, btnHit: !!top && (top === btn || btn.contains(top)), btn: btn && btn.textContent.trim() }; });
    await X.closeDlg(p);
    res.checks = { rangeDefault: !!d.range && d.range.checked === true && d.project.checked === false, footer: res.footerVisible.inViewport && res.footerVisible.btnHit };
    if (vp !== '1440') return;
    const er = await X.exportWav(p, log, `${res.id}-range`, { scope: null }); const ep = await X.exportWav(p, log, `${res.id}-project`, { scope: 'project' });
    const r = X.wav(er.files[0]), pj = X.wav(ep.files[0]);
    res.r = info(r); res.p = info(pj); res.cmp = X.maxLsb(r.w, pj.w, 0, 192000, r.frames); res.files = [...er.files, ...ep.files].map(rel); res.rangeScopeAtExport = er.st0.range;
    // MP3 once (range default)
    const unpkg = []; p.on('request', (q) => { if (/unpkg|jsdelivr|ffmpeg/i.test(q.url())) unpkg.push(q.url().slice(0, 120)); });
    const em = await X.exportWav(p, log, `${res.id}-mp3`, { scope: null, format: 'mp3', keepOpen: true });
    res.mp3 = { recs: em.recs, statusEnd: em.st1 && em.st1.status, alertText: (em.st1 && em.st1.text || '').slice(0, 400), unpkg: unpkg.slice(0, 6) };
    await X.shot(p, `${res.id}-mp3.png`); await X.closeDlg(p);
    if (em.files[0]) { const buf = fs.readFileSync(em.files[0]); res.mp3.size = buf.length; res.mp3.dec = await p.evaluate(async (b64) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const c = new AudioContext(); try { const ab = await c.decodeAudioData(u.buffer); return { duration: ab.duration, sr: ab.sampleRate, ch: ab.numberOfChannels }; } catch (e) { return { err: String(e) }; } finally { c.close(); } }, buf.toString('base64')); res.files.push(rel(em.files[0])); }
    Object.assign(res.checks, { wavFmt: r.frames >= 239999 && r.frames <= 240001 && r.fmt.bits === 24 && r.fmt.sr === 48000 && r.fmt.ch === 2, content: res.cmp.max <= 1 && r.peak > 0.01, mp3: !!res.mp3.dec && Math.abs(res.mp3.dec.duration - 5) <= 0.06 });
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
