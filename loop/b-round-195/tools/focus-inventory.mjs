// B round 195 planning: read-only inventory of focus/ring/outline class tokens in app/ (excl. __tests__).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = process.argv[2] ?? 'app';
const files = [];
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (n === '__tests__') continue; const s = statSync(p); if (s.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(n)) files.push(p); } };
walk(root);
const re = /(?:[\w-]+:)*(?:focus(?:-visible|-within)?|peer-focus-visible|group-focus-visible)(?::[\w-]+)*:[^\s`'"{}),]+|(?<![\w-])(?:ring|outline)(?:-[\w/.\[\]#%()-]+)?(?![\w-])/g;
const isStudio = (f) => /components\/arrangement\/|lib\/arrangement\/|routes\/studio-lab\.tsx/.test(f);
const byArea = { studio: {}, store: {}, css: {} }; const perFile = {};
for (const f of files) {
  const src = readFileSync(f, 'utf8'); const area = f.endsWith('.css') ? 'css' : isStudio(f) ? 'studio' : 'store';
  const m = src.match(re) ?? []; const toks = m.filter((t) => /focus|ring|outline/.test(t) && !/^(ring|outline)$/.test(t) || /^(ring|outline)$/.test(t));
  if (!toks.length) continue; perFile[relative('.', f)] = toks.length;
  for (const t of toks) byArea[area][t] = (byArea[area][t] ?? 0) + 1;
}
const sort = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]));
console.log(JSON.stringify({ files: Object.keys(perFile).length, perArea: { studio: sort(byArea.studio), store: sort(byArea.store), css: sort(byArea.css) }, perFile: sort(perFile) }, null, 1));
