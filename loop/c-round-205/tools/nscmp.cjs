const fs = require('fs'); const p = require('path'); const D = p.join(__dirname, '..', 'out', 'noshift');
for (const W of [1280, 1440, 375]) {
  const t = JSON.parse(fs.readFileSync(p.join(D, `tree-${W}.json`))); const r = JSON.parse(fs.readFileSync(p.join(D, `ref-${W}.json`)));
  for (const st of ['offer', 'email', 'success']) {
    const a = t[st], b = r[st]; let max = 0, worst = null, missing = [];
    const ka = Object.keys(a.els), kb = Object.keys(b.els);
    if (ka.length !== kb.length) missing.push(`count ${ka.length} vs ${kb.length}`);
    ka.forEach((k, i) => { const kk = kb[i]; if (k !== kk) missing.push(k + ' != ' + kk); const d = Math.max(...a.els[k].map((v, j) => Math.abs(v - b.els[kk][j]))); if (d > max) { max = d; worst = k; } });
    console.log(W, st, 'maxDiff', max.toFixed(2), worst, 'textSame', a.text === b.text, missing.slice(0, 3).join(' | '));
  }
}
