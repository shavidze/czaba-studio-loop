const fs = require('fs');
const { execSync } = require('child_process');
const root = 'C:/Apps/czaba-project/tmp/studio-real-loop/c-round-71/scratch';
const muts = require('./muts71.cjs');
const files = ['metronome-horizon.test.ts','metronome-horizon-ui.test.tsx','metronome-ui.test.tsx','metronome.test.ts','graph.test.ts','loop.test.ts'].map((f) => 'app/lib/arrangement/__tests__/' + f).join(' ');
const idRe = /^(MH|HU|UI|M|G|L|LP)[0-9]+/;
const label = (f, a) => require('path').basename(f.name).replace(/.test.tsx?$/, '') + ':' + (idRe.test(a.title) ? a.title.split(' ')[0] : a.title.slice(0, 40));
const which = process.argv.slice(2);
for (const id of which.length ? which : ['none', ...Object.keys(muts)]) {
  const saved = new Map();
  let ok = true;
  const counts = [];
  if (id !== 'none') {
    for (const [rel, re, rep] of muts[id]) {
      const p = `${root}/${rel}`;
      const cur = fs.readFileSync(p, 'utf8');
      if (!saved.has(p)) saved.set(p, cur);
      const n = (cur.match(new RegExp(re.source, 'g')) || []).length;
      counts.push(n);
      const next = typeof rep === "function" ? rep() : cur.replace(re, rep);
      if ((typeof rep !== 'function' && n !== 1) || next === cur) { ok = false; break; }
      fs.writeFileSync(p, next);
    }
  }
  if (!ok) {
    for (const [p, s] of saved) fs.writeFileSync(p, s);
    console.log(`${id} PATTERN counts=${counts.join('/')} applied=false`);
    continue;
  }
  const out = `C:/Apps/czaba-project/tmp/studio-real-loop/c-round-71/mut/mut-${id}.json`;
  try { fs.unlinkSync(out); } catch {}
  const t0 = Date.now();
  try { execSync(`npx vitest run --config vitest.config.mts ${files} --reporter=json --outputFile=${out}`, { cwd: root, stdio: 'ignore', timeout: 900000 }); } catch {}
  let restored = true;
  for (const [p, s] of saved) { fs.writeFileSync(p, s); restored = restored && fs.readFileSync(p, 'utf8') === s; }
  let r; try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { console.log(`${id} no json restored=${restored}`); continue; }
  const failed = [...new Set(r.testResults.flatMap((f) => f.assertionResults.filter((a) => a.status === 'failed').map((a) => label(f, a))))];
  const fileErr = r.testResults.filter((f) => f.status === 'failed' && f.assertionResults.length === 0).map((f) => (f.message || '').slice(0, 150));
  console.log(`${id} counts=${counts.join('/')} total=${r.numTotalTests} failed=${r.numFailedTests} secs=${((Date.now() - t0) / 1000).toFixed(0)} restored=${restored}${fileErr.length ? ' FILEERR ' + fileErr.join('|') : ''}`);
  console.log('   failing: ' + (failed.length > 14 ? `${failed.length} tests: ${failed.slice(0, 14).join(', ')}…` : failed.join(', ')));
}
