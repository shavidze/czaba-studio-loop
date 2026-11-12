// B round 474: real-resolver inventory of colour-utility class tokens that Tailwind does not emit.
const root = process.argv[2];
// usage: node tw-undefined.mjs <storeRoot>
const { compile } = await import(process.argv[2] + '/node_modules/@tailwindcss/node/dist/index.mjs');
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const t0 = Date.now();
const css = readFileSync(join(root, 'app/styles/app.css'), 'utf8');
const c = await compile(css, { base: join(root, 'app/styles'), onDependency() {} });
const cssText = ['app/styles/app.css', 'app/styles/base/utilities.css'].map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); if (statSync(p).isDirectory()) return n === '__tests__' ? [] : walk(p); return /\.(tsx|ts)$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : []; });
const PREFIX = /^(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|from|via|to|shadow|fill|stroke|divide|placeholder|caret|accent|decoration)-/;
const hits = [];
let prev = c.build([]).length;
const seen = new Map();
for (const f of walk(join(root, 'app'))) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/["'`]([^"'`]*)["'`]/g)) {
      for (const tok of m[1].split(/\s+/)) {
        if (!tok || /[${}()]/.test(tok)) continue;
        const base = tok.split(':').pop().replace(/^!/, '');
        if (!PREFIX.test(base)) continue;
        if (!/^[a-z0-9:/_.\-[\]#%,!]+$/i.test(tok)) continue;
        let emits = seen.get(tok);
        if (emits === undefined) { const out = c.build([tok]); emits = out.length > prev; prev = out.length; seen.set(tok, emits); }
        if (emits) continue;
        const plainCss = new RegExp(`\\.${base.replace(/[/.[\]#%]/g, (x) => `\\\\${x}`)}(?![\\w-])`).test(cssText);
        if (plainCss) continue;
        hits.push(`${relative(root, f)}:${i + 1} ${tok}`);
      }
    }
  });
}
for (const h of hits) console.log(h);
console.log(`TOTAL ${hits.length} tokens ${seen.size} ms ${Date.now() - t0}`);
