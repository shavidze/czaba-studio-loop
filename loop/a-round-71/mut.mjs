import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = 'C:/Apps/czaba-project/tmp/studio-real-loop/a-round-71/';
const S = `${ROOT}scratch/`;
const SNAP = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-round-70-r71-snapshots/';
const M = 'app/lib/arrangement/metronome.ts';
const C = 'app/contexts/ArrangementContext.tsx';
const once = (needle, rep) => (src) => {
  if (typeof src !== 'string') return src;
  const hits = src.split(needle).length - 1;
  if (hits !== 1) return { error: `pattern hits=${hits} ${needle.slice(0, 60)}` };
  return src.replace(needle, () => rep);
};
const STATE_SET = `      metronomeHorizonRef.current =
        metronomeBpm !== null && clickBuffers && !loop
          ? { bpm: metronomeBpm, from, startAt, end, nextFrom: horizonUntil }
          : null;
`;
const muts = {
  a: [[C, once(': planMetronomeClicks(metronomeBpm, from, horizonUntil, end),', ': planMetronomeClicks(metronomeBpm, from, end),')]],
  b: [[C, once('    fillMetronomeHorizon();\n    releaseRetiredGraphs(false);\n  }, [fillLoopIterations, fillMetronomeHorizon, releaseRetiredGraphs]);', '    releaseRetiredGraphs(false);\n  }, [fillLoopIterations, fillMetronomeHorizon, releaseRetiredGraphs]);')]],
  c: [[M, once('duration: Math.min(METRONOME_CLICK_SECONDS - offset, soundEnd - when),', 'duration: Math.min(METRONOME_CLICK_SECONDS - offset, until - when),')]],
  d: [[C, once('        state.startAt,\n      );\n      state.nextFrom = chunk.until;', '        ctx.currentTime,\n      );\n      state.nextFrom = chunk.until;')]],
  e: [[M, once('chunkCtx < now + lateMargin ? state.from + (now + lateMargin - state.startAt) : state.nextFrom;', 'state.nextFrom;')]],
  f: [[C, once('      if (!chunk) {\n        return;\n      }\n      handle.appendClicks(', '      if (!chunk) {\n        return;\n      }\n      if (chunk.from > state.nextFrom) {\n        resyncLoopRef.current();\n        return;\n      }\n      handle.appendClicks(')]],
  g: [[C, once(STATE_SET, `      metronomeHorizonRef.current =
        metronomeHorizonRef.current ??
        (metronomeBpm !== null && clickBuffers && !loop
          ? { bpm: metronomeBpm, from, startAt, end, nextFrom: horizonUntil }
          : null);
`)]],
  h: [[C, once('    metronomeHorizonRef.current = null;\n    loopScheduleRef.current = null;\n', '    loopScheduleRef.current = null;\n')]],
  i: [[C, once('      state.nextFrom = chunk.until;\n', '      return;\n')]],
  j: [[M, once('return { from, until: Math.min(state.end, from + horizon) };', 'return { from, until: from + horizon };')]],
  k: [[C, once('metronomeBpm !== null && clickBuffers && !loop\n', 'metronomeBpm !== null && clickBuffers\n')]],
  l: [[M, once('    if (time >= from - ARRANGEMENT_EPS) {', '    if (time >= from) {')]],
  m: [[M, once('export const METRONOME_SCHEDULE_HORIZON_SECONDS = 2;', 'export const METRONOME_SCHEDULE_HORIZON_SECONDS = 0.25;')]],
  n: [[C, once('        METRONOME_SCHEDULE_HORIZON_SECONDS,\n        LOOP_LATE_MARGIN,\n      );\n      if (!chunk)', '        METRONOME_SCHEDULE_HORIZON_SECONDS,\n        0,\n      );\n      if (!chunk)')]],
  o: [[C, once('? planMetronomeClicks(metronomeBpm, from, loop.end)\n', '? planMetronomeClicks(metronomeBpm, from, loop.end, end)\n')]],
  red: [M, C].map((f) => [f, () => readFileSync(SNAP + f.split('/').at(-1), 'utf8')]),
};
const all = [
  'metronome-horizon.test.ts',
  'metronome-horizon-ui.test.tsx',
  'metronome-ui.test.tsx',
  'metronome.test.ts',
  'graph.test.ts',
  'loop.test.ts',
];
const list = all.map((f) => `app/lib/arrangement/__tests__/${f}`).join(' ');
const out = [];
const ids = (process.argv[2] ?? `none,red,${Object.keys(muts).filter((k) => k !== 'red').join(',')}`).split(',');
for (const id of ids) {
  const cmd = `npx vitest run --config vitest.config.mts ${list} --reporter=verbose`;
  out.push(`command (cwd ${S}): ${cmd}`);
  const originals = [];
  let failed = null;
  for (const [file, mutate] of id === 'none' ? [] : muts[id]) {
    const original = readFileSync(S + file, 'utf8');
    const mutated = mutate(original);
    if (typeof mutated !== 'string') {
      failed = mutated.error;
      break;
    }
    originals.push([file, original]);
    writeFileSync(S + file, mutated);
  }
  let log = '';
  if (failed === null) {
    try {
      log = execSync(cmd, { cwd: S, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
    } catch (e) {
      log = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
  }
  for (const [file, original] of originals) writeFileSync(S + file, original);
  if (failed !== null) {
    out.push(`${id}: MUTATION NOT APPLIED ${failed}`);
  } else {
    const summary = log.split('\n').filter((l) => /Test Files|Tests {2}/.test(l)).map((l) => l.trim()).join(' | ');
    const fails = log.split('\n').filter((l) => /^\s*×/.test(l)).map((l) => `   ${l.trim().replace(/ \d+ms$/, '').replace(/^× app\/lib\/arrangement\/__tests__\//, '× ')}`);
    out.push(`${id}: ${summary || 'NO SUMMARY (timeout or crash)'}`, ...fails);
  }
  console.log(out.slice(-30).join('\n'));
}
writeFileSync(`${ROOT}mut-${process.argv[2] ?? 'all'}.log`, `${out.join('\n')}\n`);
