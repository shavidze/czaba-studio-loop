import { Scanner } from '@tailwindcss/oxide';
import { compile } from '@tailwindcss/node';
import fs from 'node:fs';
import path from 'node:path';
const [root, doc] = process.argv.slice(2);
const scanner = new Scanner({ sources: [{ base: root, pattern: '**/*', negated: false }] });
const all = new Set(scanner.scan());
const files = scanner.files;
const docAbs = path.resolve(doc);
console.log('files scanned', files.length, 'doc scanned', files.includes(docAbs));
const s2 = new Scanner({});
const docCands = new Set(s2.scanFiles([{ content: fs.readFileSync(docAbs, 'utf8'), extension: 'md' }]));
const others = new Set();
for (const f of files) {
  if (f === docAbs) continue;
  const ext = path.extname(f).slice(1) || 'txt';
  let content; try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
  for (const c of new Scanner({}).scanFiles([{ content, extension: ext }])) others.add(c);
}
const extra = [...docCands].filter((c) => !others.has(c));
const cssFile = path.join(root, 'app/styles/app.css');
const compiler = await compile(fs.readFileSync(cssFile, 'utf8'), { base: path.dirname(cssFile), onDependency() {} });
const a = compiler.build([...others]);
const compiler2 = await compile(fs.readFileSync(cssFile, 'utf8'), { base: path.dirname(cssFile), onDependency() {} });
const b = compiler2.build([...others, ...extra]);
console.log('docCandidates', docCands.size, 'extraOnlyInDoc', extra.length, 'cssEqual', a === b);
if (a !== b) { const sa = new Set(a.split('\n')); console.log(b.split('\n').filter((l) => !sa.has(l)).slice(0, 40).join('\n')); }
