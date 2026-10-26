import { readFileSync } from 'node:fs';
const files = process.argv.slice(2);
const fill = /(^|[\s'"`:])bg-(brand|accent|buy|destructive|positive|warning)(?=[\s'"`]|$)/;
const light = /(^|[\s'"`:])text-(foreground|white|secondary|muted)(?=[\s'"`]|$)/;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const re = /className=\{?(["'`])|cn\(|\[\s*$/gm;
  const lines = src.split('\n');
  lines.forEach((ln, i) => {
    if (!fill.test(ln)) return;
    const win = lines.slice(Math.max(0, i - 6), i + 7).join('\n');
    if (light.test(win)) console.log(`${f}:${i + 1}: ${ln.trim().slice(0, 140)}`);
  });
}
