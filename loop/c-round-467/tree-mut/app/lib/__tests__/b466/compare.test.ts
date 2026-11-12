import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countZeroOffsetGlowHits as headCount } from '../helpers/style-scan-head';
import { countZeroOffsetGlowHits as newCount } from '../helpers/style-scan';

function walk(dir: string, out: string[]): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|mjs|js)$/.test(name)) out.push(p);
  }
  return out;
}

describe('b466 compare', () => {
  it('head vs sketch per file', () => {
    const files = [...walk('app', []), ...walk('perf', [])].filter((f) => !f.includes('b466') && !f.endsWith('style-scan-head.ts'));
    const rows: string[] = [];
    let diff = 0;
    for (const f of files.sort()) {
      const src = readFileSync(f, 'utf8');
      const h = headCount(src);
      const n = newCount(src);
      if (h || n) rows.push(`${f}\t${h}\t${n}`);
      if (h !== n) diff++;
    }
    writeFileSync(process.env.B466_OUT ?? '/tmp/b466-compare.txt', `files ${files.length}\ndiff ${diff}\n${rows.join('\n')}\n`);
    expect(files.length).toBeGreaterThan(100);
  });
});
