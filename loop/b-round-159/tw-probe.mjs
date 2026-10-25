import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const tw = await import(require.resolve('tailwindcss')); const compile = tw.compile ?? tw.default.compile;
const fs = await import('node:fs');
const path = await import('node:path');
const twDir = path.dirname(require.resolve('tailwindcss/package.json'));
const loadStylesheet = async (id, base) => {
  const p = id === 'tailwindcss' ? path.join(twDir, 'index.css') : path.resolve(base, id);
  return { path: p, base: path.dirname(p), content: fs.readFileSync(p, 'utf8') };
};
const c = await compile('@import "tailwindcss";', { base: twDir, loadStylesheet });
const cands = process.argv.slice(2);
const out = c.build(cands);
const i = out.indexOf('@layer utilities');
console.log(out.slice(i));
