const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path'); const net = [];
(async () => { const b = await L.launch(); const { page: p } = await L.openStudio(b, X.VPS[1440], 'space', net);
  const r = await p.evaluate(() => { const c = document.createElement('canvas').getContext('2d'); const o = {};
    for (const f of ['"Instrument Sans"', 'Inter', '"IBM Plex Mono"']) for (const px of [11, 12, 14]) { c.font = `400 ${px}px ${f}`; o[`${f} ${px}`] = { space: +c.measureText(' ').width.toFixed(2), dot: +c.measureText('·').width.toFixed(2), sDotS: +c.measureText(' · ').width.toFixed(2), n: +c.measureText('n').width.toFixed(2), sample: +c.measureText('Arrangement · Overview').width.toFixed(2) }; }
    const hint = document.querySelector('[data-testid=arrangement-shortcut-hint]'); const cs = getComputedStyle(hint);
    const rng = document.createRange(); const tn = [...hint.childNodes].find((n) => n.nodeType === 3) || hint.firstChild; 
    const spans = []; const txt = hint.textContent; let i = txt.indexOf(' '); if (tn && tn.nodeType === 3) { rng.setStart(tn, 5); rng.setEnd(tn, 6); spans.push({ ch: JSON.stringify(tn.textContent.slice(5, 6)), w: rng.getBoundingClientRect().width }); rng.setStart(tn, 6); rng.setEnd(tn, 7); spans.push({ ch: JSON.stringify(tn.textContent.slice(6, 7)), w: rng.getBoundingClientRect().width }); }
    return { o, hintFont: cs.fontFamily, hintSize: cs.fontSize, wordSpacing: cs.wordSpacing, letterSpacing: cs.letterSpacing, hintStart: JSON.stringify(txt.slice(0, 20)), codepoints: [...txt.slice(0, 14)].map((c) => c.codePointAt(0).toString(16)), spans };
  });
  console.log(JSON.stringify(r, null, 1));
  const bb = await p.locator('[data-testid=arrangement-shortcut-hint]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, 'hint-zoom-1440.png'), clip: { x: bb.x, y: bb.y - 2, width: 420, height: bb.height + 4 }, scale: 'device' });
  await b.close(); })();
