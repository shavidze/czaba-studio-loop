// A round 196: R84 measurement — is each focusable's outline clipped by an overflow ancestor?
const T = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-195/tools/';
const X = require(`${T}lib122.cjs`);
const { L, sleep } = X;
const fs = require('fs');
const path = require('path');
const net = [];
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = {};
  try {
    const o = await L.openStudio(b, X.VPS[1440], 'a196-clip', net, { deviceScaleFactor: 2 });
    const p = o.page;
    if (!(await p.$('[data-testid=arrangement-marker]'))) {
      await p.click('[data-testid=arrangement-marker-add]');
      await sleep(500);
      await p.keyboard.press('Enter');
      await sleep(500);
    }
    const tracks = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')).filter((id) => document.querySelector(`[data-track-id="${id}"] [data-testid=arrangement-track-pan]`)));
    res.tracks = tracks;
    if (tracks.length >= 2) {
      await p.click(L.nameSel(tracks[0]));
      await p.click(L.nameSel(tracks[1]), { modifiers: ['Shift'] });
      await p.keyboard.press('Control+g');
      await sleep(600);
      res.group = !!(await p.$('[data-testid=arrangement-group-volume]'));
    }
    await p.keyboard.press('Tab');
    res.rows = await p.evaluate(() => {
      const sel = 'button, input, select, [tabindex]:not([tabindex="-1"]), a[href]';
      const out = [];
      for (const el of document.querySelectorAll(sel)) {
        if (el.disabled || !el.getClientRects().length) continue;
        el.focus({ preventScroll: true });
        if (document.activeElement !== el) continue;
        const s = getComputedStyle(el);
        const w = parseFloat(s.outlineWidth) || 0;
        const off = parseFloat(s.outlineOffset) || 0;
        const r = el.getBoundingClientRect();
        const ext = off + w;
        const ring = { l: r.left - ext, t: r.top - ext, r: r.right + ext, b: r.bottom + ext };
        let clippedBy = null;
        for (let a = el.parentElement; a; a = a.parentElement) {
          const as = getComputedStyle(a);
          if (as.overflowX === 'visible' && as.overflowY === 'visible') continue;
          const ar = a.getBoundingClientRect();
          const cut = [];
          if (as.overflowX !== 'visible' && ring.l < ar.left - 0.01) cut.push(`L${(ar.left - ring.l).toFixed(1)}`);
          if (as.overflowX !== 'visible' && ring.r > ar.right + 0.01) cut.push(`R${(ring.r - ar.right).toFixed(1)}`);
          if (as.overflowY !== 'visible' && ring.t < ar.top - 0.01) cut.push(`T${(ar.top - ring.t).toFixed(1)}`);
          if (as.overflowY !== 'visible' && ring.b > ar.bottom + 0.01) cut.push(`B${(ring.b - ar.bottom).toFixed(1)}`);
          if (cut.length) {
            clippedBy = { ancestor: a.getAttribute('data-testid') || a.tagName + '.' + String(a.className).slice(0, 40), cut: cut.join(' ') };
            break;
          }
        }
        const probes = [
          ['T', (r.left + r.right) / 2, r.top - ext + w / 2],
          ['B', (r.left + r.right) / 2, r.bottom + ext - w / 2],
          ['L', r.left - ext + w / 2, (r.top + r.bottom) / 2],
          ['R', r.right + ext - w / 2, (r.top + r.bottom) / 2],
        ];
        const covered = [];
        for (const [side, x, y] of probes) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          const hit = document.elementFromPoint(x, y);
          if (hit && hit !== el && !hit.contains(el) && !el.contains(hit)) covered.push(`${side}:${hit.getAttribute('data-testid') || hit.tagName}`);
        }
        out.push({ covered,
          id: el.getAttribute('data-testid') || el.getAttribute('aria-label') || el.tagName,
          style: s.outlineStyle, width: s.outlineWidth, offset: s.outlineOffset, shadow: s.boxShadow,
          box: [r.width, r.height].map((v) => +v.toFixed(1)), clippedBy,
        });
      }
      return out;
    });
  } catch (e) {
    res.error = String((e && e.stack) || e).slice(0, 800);
  }
  await b.close();
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(__dirname, 'r84-clip-1440.json'), JSON.stringify(res, null, 1));
  const rows = res.rows || [];
  console.log('focusables', rows.length, 'err', res.error, 'net', res.net.ok);
  console.log('noRing', rows.filter((r) => r.style !== 'solid').map((r) => r.id));
  console.log('shadow', rows.filter((r) => r.shadow !== 'none').map((r) => `${r.id}:${r.shadow}`));
  console.log('group', res.group, res.tracks);
  for (const r of rows.filter((x) => x.covered.length)) console.log('COVERED', r.id, r.offset, r.box, r.covered.join(' '));
  for (const r of rows.filter((x) => x.clippedBy)) console.log('CLIPPED', r.id, r.offset, r.box, JSON.stringify(r.clippedBy));
})();
