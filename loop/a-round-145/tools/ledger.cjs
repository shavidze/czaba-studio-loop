const fs = require('node:fs');
const G = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
for (const p of process.argv.slice(2)) {
  const raw = fs.readFileSync(p, 'utf8');
  const lines = strip(raw).split(/\r?\n/);
  const out = [];
  lines.forEach((l, i) => { if (G.test(l)) out.push([i + 1, l.trim().replaceAll('${', '{')]); });
  console.log('##', p, out.length, /[«»]/.test(strip(raw)) ? 'GUILLEMET' : '');
  for (const [n, l] of out) console.log(n, JSON.stringify(l));
}
