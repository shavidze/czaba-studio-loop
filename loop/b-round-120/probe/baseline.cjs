const L = require('./lib.cjs');
const crypto = require('crypto');
const fs = require('fs');
const sha = (s) => (s == null ? null : crypto.createHash('sha256').update(s).digest('hex'));
(async () => {
  const browser = await L.launch();
  const net = [];
  const out = { utc: new Date().toISOString(), note: 'B round-120 planning baseline on clean published tree (git status empty, HEAD 0a75ba8)' };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = vp.width;
    let o;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        o = await L.openStudio(browser, vp, `b120-${key}-${attempt}`, net);
        await L.setSnapOff(o.page);
        break;
      } catch (e) { out[`invalid_${key}_${attempt}`] = String(e).slice(0, 200); if (o) await o.ctx.close(); o = null; }
    }
    const p = o.page;
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
    await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    await L.blur(p);
    await L.sleep(800);
    const snap = await p.evaluate(() => {
      const g = document.querySelector('[data-testid="arrangement-grid-control"]');
      const chrome = g.parentElement.parentElement;
      const rows = [...chrome.children].map((r) => Math.round(r.getBoundingClientRect().height * 10) / 10);
      const lanes = [...document.querySelectorAll('[data-track-id]')].filter((e) => e.matches('[data-track-id]') && e.querySelector('[data-testid="arrangement-track-header"]')).map((e) => { const b = e.getBoundingClientRect(); return { id: e.dataset.trackId, y: Math.round(b.top * 10) / 10, h: Math.round(b.height * 10) / 10 }; });
      const clips = [...document.querySelectorAll('[data-clip-id]')].map((e) => { const s = e.querySelector('[data-testid="arrangement-clip-waveform"]'); const path = s ? s.querySelector('path') : null; return { kind: e.dataset.clipKind, lane: e.closest('[data-track-id]').dataset.trackId, start: e.dataset.clipStart, viewBox: s ? s.getAttribute('viewBox') : null, d: path ? path.getAttribute('d') : null }; });
      const zoom = (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent;
      const undo = [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('title') || b.getAttribute('aria-label') || ''));
      const gridItems = [...g.children].map((c) => { const b = c.getBoundingClientRect(); return { tid: c.dataset.testid, x: Math.round(b.left - g.getBoundingClientRect().left), w: Math.round(b.width) }; });
      return { chromeRowHeights: rows, chromeTotal: Math.round(chrome.getBoundingClientRect().height * 10) / 10, lanes, clips, zoom, undoTitle: undo ? (undo.getAttribute('title') || undo.getAttribute('aria-label')) : null, gridItems };
    });
    snap.clips = snap.clips.map((c) => ({ ...c, dSha256: sha(c.d), dLen: c.d ? c.d.length : 0, d: undefined }));
    out[key] = snap;
    await p.screenshot({ path: `baseline-${key}.png` });
    // compact control width probe (appearance-none select, same classes as the grid select)
    out[`probe_${key}`] = await p.evaluate(() => {
      const g = document.querySelector('[data-testid="arrangement-grid-control"]');
      const ref = g.querySelector('select');
      const sets = { x5: ['½×', '1×', '2×', '4×', '8×'], x5ascii: ['0.5×', '1×', '2×', '4×', '8×'], pct5: ['50%', '100%', '200%', '400%', '800%'] };
      const res = {};
      for (const [k, labels] of Object.entries(sets)) {
        for (const extra of ['', ' appearance-none']) {
          const s = document.createElement('select'); s.className = ref.className + extra;
          for (const l of labels) { const o = document.createElement('option'); o.textContent = l; s.appendChild(o); }
          g.appendChild(s); const b = s.getBoundingClientRect();
          res[k + (extra ? '_none' : '_native')] = { w: Math.round(b.width), right: Math.round(b.right - g.getBoundingClientRect().left), overflow: g.scrollWidth > g.clientWidth };
          s.remove();
        }
      }
      return res;
    });
    await o.ctx.close();
  }
  out.net = net.map((l) => ({ label: l.label, errors: l.errors, hydration: l.hydration, forbidden: l.forbidden.length, auth: l.authHeaders.length, noise: l.noise }));
  fs.writeFileSync('baseline-r121.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1).slice(0, 6000));
  await browser.close();
})();
