// B round 474: real-resolver inventory (TypeScript AST string literals + Tailwind compile). usage: node tw-undefined-ast.mjs <storeRoot> [label]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = process.argv[2];
const { compile } = await import(root + '/node_modules/@tailwindcss/node/dist/index.mjs');
const ts = (await import(root + '/node_modules/typescript/lib/typescript.js')).default;
const t0 = Date.now();
const c = await compile(readFileSync(join(root, 'app/styles/app.css'), 'utf8'), { base: join(root, 'app/styles'), onDependency() {} });
const cssText = ['app/styles/app.css', 'app/styles/base/utilities.css'].map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); if (statSync(p).isDirectory()) return n === '__tests__' ? [] : walk(p); return /\.(tsx|ts)$/.test(n) && !/\.test\.tsx?$/.test(n) && !/\.d\.ts$/.test(n) ? [p] : []; });
const PREFIX = /^(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|from|via|to|shadow|fill|stroke|divide|placeholder|caret|accent|decoration)-/;
let prev = c.build([]).length; const seen = new Map(); const hits = []; let files = 0;
for (const f of walk(join(root, 'app'))) {
  files++;
  const src = readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      const line = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
      for (const tok of n.text.split(/\s+/)) {
        if (!tok) continue;
        const base = tok.split(':').pop().replace(/^!/, '');
        if (!PREFIX.test(base) || !/^[a-z0-9:/_.\-[\]#%,!]+$/i.test(tok)) continue;
        let emits = seen.get(tok);
        if (emits === undefined) { const out = c.build([tok]); emits = out.length > prev; prev = out.length; seen.set(tok, emits); }
        if (emits) continue;
        if (new RegExp(`\\.${base.replace(/[/.[\]#%]/g, (x) => `\\\\${x}`)}(?![\\w-])`).test(cssText)) continue;
        hits.push(`${relative(root, f)}:${line} ${tok}`);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
for (const h of hits) console.log(h);
console.log(`TOTAL ${hits.length} files ${files} tokens ${seen.size} ms ${Date.now() - t0}`);
