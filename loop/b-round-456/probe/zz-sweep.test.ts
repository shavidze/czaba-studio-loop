import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { appScriptSources, reachableScripts, resolvedImports } from './helpers/style-scan';

const LOOSE = /['"`]((?:~\/|\.\.?\/)[^'"`\n]+)['"`]/g;
const SIDE_EFFECT = /^\s*import\s+['"]((?:~\/|\.\.?\/)[^'"\n]+)['"]/gm;
const BACKTICK_DYNAMIC = /\bimport\s*\(\s*`/g;
const REQUIRE = /\brequire\s*\(/g;

it('sweep', () => {
  const sources = appScriptSources();
  const lines: string[] = [];
  for (const [file, source] of sources) {
    const loose = [...source.matchAll(LOOSE)].map((m) => m[1]);
    const resolved = resolvedImports(source, file).length;
    const side = [...source.matchAll(SIDE_EFFECT)].map((m) => m[1]);
    const bt = [...source.matchAll(BACKTICK_DYNAMIC)].length;
    const rq = [...source.matchAll(REQUIRE)].length;
    if (loose.length !== resolved || side.length > 0 || bt > 0 || rq > 0) {
      lines.push(`${file}\tloose=${loose.length}\tresolved=${resolved}\tside=${side.join(',')}\tbacktick=${bt}\trequire=${rq}\tspecs=${loose.join(',')}`);
    }
  }
  const reached = reachableScripts(sources);
  lines.push(`TOTAL files=${sources.size} reached=${reached.size}`);
  writeFileSync(process.env.SWEEP_OUT ?? '/tmp/sweep.txt', `${lines.join('\n')}\n`);
});
