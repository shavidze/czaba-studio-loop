import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { appScriptSources, reachableScripts, unresolvedLocalSpecifiers } from './helpers/style-scan';
it('sweep2', () => {
  const sources = appScriptSources();
  const out: string[] = [];
  for (const [file, source] of sources) {
    const u = unresolvedLocalSpecifiers(source, file);
    if (u.length > 0) out.push(`${file}\t${u.join(',')}`);
  }
  const r = reachableScripts(sources);
  out.push(`TOTAL reached=${r.size} scrollReveal=${r.has('components/animations/ScrollReveal.tsx')}`);
  out.push(...[...r].sort().map((f) => `R ${f}`));
  writeFileSync(process.env.SWEEP_OUT ?? '/tmp/s2.txt', `${out.join('\n')}\n`);
});
