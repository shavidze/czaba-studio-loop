// B round 474: custom-property reads with no definition, resolved by Tailwind's compiler. usage: node var-undefined.mjs <storeRoot>
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = process.argv[2];
const { compile } = await import(root + '/node_modules/@tailwindcss/node/dist/index.mjs');
const walk = (d, re) => readdirSync(d).flatMap((n) => { const p = join(d, n); if (statSync(p).isDirectory()) return n === '__tests__' ? [] : walk(p, re); return re.test(n) && !/\.test\.tsx?$/.test(n) && !/\.d\.ts$/.test(n) ? [p] : []; });
const files = walk(join(root, 'app'), /\.(css|tsx|ts)$/);
const READ = /var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g;
const reads = []; const declared = new Set();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) declared.add(m[1]);
  for (const m of src.matchAll(/\[(--[A-Za-z0-9_-]+):/g)) declared.add(m[1]);
  for (const m of src.matchAll(/['"](--[A-Za-z0-9_-]+)['"]\s*[:,)]/g)) declared.add(m[1]);
  src.split('\n').forEach((l, i) => { for (const m of l.matchAll(READ)) if (!m[2] && !m[1].startsWith('--tw-')) reads.push({ f: relative(root, f), line: i + 1, name: m[1] }); });
}
const names = [...new Set(reads.map((r) => r.name))];
const probe = `${readFileSync(join(root, 'app/styles/app.css'), 'utf8')}\n.b-probe{${names.map((n, i) => `--p${i}:var(${n});`).join('')}}`;
const c = await compile(probe, { base: join(root, 'app/styles'), onDependency() {} });
const out = c.build([]);
const emitted = (n) => new RegExp(`(^|[\\s{;])${n.replace(/[-]/g, '\\-')}\\s*:`).test(out);
const hits = reads.filter((r) => !emitted(r.name));
for (const h of hits) console.log(`${h.f}:${h.line} ${h.name}`);
console.log(`TOTAL ${hits.length} reads ${reads.length} names ${names.length}`);
