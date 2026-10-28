const fs = require('fs');
const [lockP, pkgP, notP] = process.argv.slice(2);
const lock = JSON.parse(fs.readFileSync(lockP, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(pkgP, 'utf8'));
const txt = fs.readFileSync(notP, 'utf8');
const want = new Map();
let devCount = 0;
for (const [p, e] of Object.entries(lock.packages)) {
  if (p === '') continue;
  if (e.dev === true) { devCount++; continue; }
  const name = e.name || p.split('node_modules/').pop();
  const key = name + '@' + e.version;
  if (!want.has(key)) want.set(key, { name, version: e.version, license: typeof e.license === 'string' ? e.license : (e.license && e.license.type) || null });
}
const rowRe = /^\| (.+?) \| (.+?) \| (.+?) \| (https:\/\/www\.npmjs\.com\/package\/\S+) \|$/;
const rows = txt.split('\n').filter((l) => rowRe.test(l)).map((l) => { const m = l.match(rowRe); return { name: m[1], version: m[2], license: m[3], link: m[4] }; });
const got = new Map(rows.map((r) => [r.name + '@' + r.version, r]));
const missing = [...want.keys()].filter((k) => !got.has(k));
const extra = [...got.keys()].filter((k) => !want.has(k));
const licMismatch = [];
for (const [k, w] of want) { const r = got.get(k); if (!r) continue; const exp = w.license === null ? null : w.license; if (exp === null) { if (r.license !== 'MIT (asserted; see exceptions)' || k !== 'limiter@1.1.5') licMismatch.push([k, exp, r.license]); } else if (r.license !== exp) licMismatch.push([k, exp, r.license]); }
const linkBad = rows.filter((r) => r.link !== `https://www.npmjs.com/package/${r.name}/v/${r.version}`).map((r) => r.name);
let orderOk = true; for (let i = 1; i < rows.length; i++) { const a = rows[i - 1], b = rows[i]; if (a.name > b.name || (a.name === b.name && a.version > b.version)) { orderOk = false; console.log('order break', a.name, b.name); } }
const depMissing = Object.keys(pkg.dependencies).filter((n) => { const v = lock.packages['node_modules/' + n]?.version; return !got.has(n + '@' + v); });
const nullLic = [...want.values()].filter((w) => w.license === null).map((w) => w.name + '@' + w.version);
const out = { lockEntriesNonDev: Object.keys(lock.packages).length - 1 - devCount, devCount, uniqueRuntime: want.size, tableRows: rows.length, headerCount: (txt.match(/## Runtime packages \((\d+)\)/) || [])[1], missing, extra, licMismatch, linkBad, orderOk, depCount: Object.keys(pkg.dependencies).length, depMissing, nullLic, hasCR: txt.includes('\r'), endsOneNL: txt.endsWith('\n') && !txt.endsWith('\n\n') };
console.log(JSON.stringify(out, null, 1));
