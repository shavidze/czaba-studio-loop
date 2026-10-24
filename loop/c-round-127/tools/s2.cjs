// C round 127 session 2: node s2.cjs <1440|1280> <tag> <mode: range|video|empty>
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const TAG = process.argv[3] || 'r1';
const MODE = process.argv[4] || 'range';
const C = require('./c127lib.cjs'); const { X, L, sleep } = C;
const H = require('./h3.cjs');
const res = { vp: W, tag: TAG, mode: MODE, startedUtc: new Date().toISOString(), rows: {} };
const net = [];
const out = (k, v) => { res.rows[k] = v; C.save(`s2-${MODE}-${W}-${TAG}.json`, { ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise, downloads: n.downloads.map((d) => d.name) })) }); };
const videoLine = (p) => p.evaluate(() => { const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]'); if (!d) return null; return [...d.querySelectorAll('li')].map((l) => l.textContent.replace(/\s+/g, ' ').trim()); });
(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `s2-${MODE}-${W}-${TAG}`, net, { extraInit: C.obsInit });
    if (MODE === 'range') {
      const snap = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
      if (snap !== 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); }
      await L.blur(p);
      const a1 = await L.addAt(p, 'demo-hero-music', 'music', 0);
      const a2 = await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
      const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
      const st = await X.rangeDrag(p, stems, 6, 2);
      const rg = await H.range(p);
      out('setup', { snap: await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap), a1, a2, rangeStatus: st, range: rg });
      await C.openDlg(p); await p.mouse.move(2, 2); await sleep(300);
      const dd = await C.dump(p);
      await C.shot(p, `RANGE-dialog-${W}-${TAG}.png`);
      const tw = await C.tabWalk(p, 7);
      out('dialog', { dump: dd, tw, roleClose: await p.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).count() });
      const r = await C.runExport(p, log, `range4-${W}-${TAG}`, { format: 'wav', scope: 'range' });
      r.wav = r.files.map(C.wavInfo);
      await C.shot(p, `RANGE-done-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      out('rangeExport', r);
    } else if (MODE === 'video') {
      await L.setSnapOff(p);
      await L.addAt(p, 'demo-stem-pulse', 'stems', 0);
      await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA + 'beeps-6s-h264-aac.mp4');
      const seen = [];
      const t0 = Date.now();
      let opened = false;
      while (Date.now() - t0 < 15000) {
        if (!opened) { const can = await p.evaluate(() => document.querySelectorAll('[data-clip-kind=video]').length > 0); if (can) { await C.openDlg(p).catch(() => {}); opened = await C.isOpen(p); } }
        if (opened) { const v = await videoLine(p); const s = JSON.stringify(v); if (!seen.length || seen[seen.length - 1].s !== s) seen.push({ t: Date.now() - t0, s, v }); if (v && v.some((x) => /Included/.test(x))) break; }
        await sleep(60);
      }
      const ddInc = await C.dump(p);
      await C.shot(p, `VIDEO-included-${W}-${TAG}.png`);
      out('videoSoundSeq', { seen, dumpIncluded: ddInc });
      await C.closeByFooter(p);
      await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(300); await L.blur(p);
      await C.openDlg(p);
      const ddOff = await C.dump(p); const vOff = await videoLine(p);
      await C.shot(p, `VIDEO-off-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(300); await L.blur(p);
      out('videoOff', { vOff, georg: ddOff.net, runs: ddOff.runs });
      const h = p.locator('[data-testid=arrangement-video-fade-in-handle]').first();
      const hb = await h.boundingBox();
      let fade = null;
      if (hb) { await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down(); await p.mouse.move(hb.x + hb.width / 2 + 20, hb.y + hb.height / 2, { steps: 5 }); await p.mouse.move(hb.x + hb.width / 2 + 40, hb.y + hb.height / 2, { steps: 5 }); await p.mouse.up(); await sleep(400); fade = await p.evaluate(() => { const v = document.querySelector('[data-clip-kind=video]'); return v ? v.getAttribute('data-fade-in') : null; }); }
      await L.blur(p);
      await C.openDlg(p);
      const ddFade = await C.dump(p);
      const fadeNote = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-video-fades]') || {}).textContent || null);
      await C.shot(p, `VIDEO-fade-${W}-${TAG}.png`);
      const vr = await C.runExport(p, log, `video-${W}-${TAG}`, { format: 'wav', scope: 'project' });
      vr.wav = vr.files.map(C.wavInfo);
      await C.closeByFooter(p);
      out('videoFade', { handleFound: !!hb, fadeIn: fade, fadeNote, georg: ddFade.net, runs: ddFade.runs, videoRadio: ddFade.radios.find((r) => !r.tid), export: { recs: vr.recs, wav: vr.wav, status: vr.post.status, georg: vr.post.net } });
      await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA + 'noaudio-2s-h264.mp4');
      await sleep(4000);
      await L.blur(p);
      await C.openDlg(p);
      const vNo = await videoLine(p);
      const noteTexts = await p.evaluate(() => { const t = document.querySelector('#arrangement-export-title'); const d = t.closest('[role=dialog]'); return [...d.querySelectorAll('li span.text-muted')].map((s) => s.textContent.trim()); });
      const ddNo = await C.dump(p, noteTexts.filter((x) => !/^(Included|Off \(M\/Solo\)|Decoding — please wait)$/.test(x)));
      await C.shot(p, `VIDEO-noaudio-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      out('videoNoAudio', { vNo, noteTexts, georgTotal: ddNo.total, subtracted: ddNo.subtracted, subtractedList: ddNo.subtractedList, net: ddNo.net, runs: ddNo.runs });
    } else if (MODE === 'empty') {
      await L.setSnapOff(p);
      await L.addAt(p, 'demo-soft-impact', 'sfx', 1);
      const id = (await L.clipsDom(p))[0].id;
      await L.selectClip(p, id);
      await p.keyboard.press('Delete'); await sleep(400);
      const clips = (await L.clipsDom(p)).length;
      await C.openDlg(p);
      const dd = await C.dump(p);
      const exportBtn = await p.evaluate(() => { const fb = document.querySelector('[data-testid=arrangement-export-footer]'); return [...fb.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim(), disabled: b.disabled })); });
      await C.shot(p, `EMPTY-${W}-${TAG}.png`);
      const tw = await C.tabWalk(p, 5);
      out('empty', { clipsAfterDelete: clips, dump: dd, exportBtn, tw });
    }
  } catch (e) { res.error = String(e.stack || e); out('error', res.error); }
  out('end', new Date().toISOString());
  console.log(JSON.stringify({ err: res.error, rows: Object.keys(res.rows), net: X.netOk(net) }));
  await b.close();
})();
