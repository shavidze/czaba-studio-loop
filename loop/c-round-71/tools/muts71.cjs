const M = 'app/lib/arrangement/metronome.ts';
const C = 'app/contexts/ArrangementContext.tsx';
const SNAP = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-round-70-r71-snapshots/';
const whole = (rel, snap) => [rel, /^[\s\S]*$/, () => require('fs').readFileSync(SNAP + snap, 'utf8')];
const esc = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
module.exports = {
  red: [whole(M, 'metronome.ts'), whole(C, 'ArrangementContext.tsx')],
  a: [[C, esc('planMetronomeClicks(metronomeBpm, from, horizonUntil, end)'), 'planMetronomeClicks(metronomeBpm, from, end)']],
  b: [[C, /\n    fillMetronomeHorizon\(\);\n    releaseRetiredGraphs\(false\);/, '\n    releaseRetiredGraphs(false);']],
  c: [[M, esc('soundEnd - when'), 'until - when']],
  d: [[C, esc('        state.from,\n        state.startAt,\n      );'), '        state.from,\n        ctx.currentTime,\n      );']],
  e: [[M, esc('chunkCtx < now + lateMargin ? state.from + (now + lateMargin - state.startAt) : state.nextFrom'), 'state.nextFrom']],
  f: [[C, esc('      if (!chunk) {\n        return;\n      }\n      handle.appendClicks('), '      if (!chunk) {\n        return;\n      }\n      if (chunk.from > state.nextFrom + 1e-9) {\n        resyncLoopRef.current();\n        return;\n      }\n      handle.appendClicks(']],
  g: [[C, esc('      metronomeHorizonRef.current =\n        metronomeBpm'), '      metronomeHorizonRef.current = metronomeHorizonRef.current ??\n        (metronomeBpm'], [C, esc('nextFrom: horizonUntil }\n          : null;'), 'nextFrom: horizonUntil }\n          : null);']],
  h: [[C, esc('    metronomeHorizonRef.current = null;\n    loopScheduleRef.current = null;'), '    loopScheduleRef.current = null;']],
  i: [[C, esc('      state.nextFrom = chunk.until;\n'), '      return;\n']],
  j: [[M, esc('until: Math.min(state.end, from + horizon)'), 'until: from + horizon']],
  k: [[C, esc('metronomeBpm !== null && clickBuffers && !loop'), 'metronomeBpm !== null && clickBuffers']],
  l: [[M, esc('if (time >= from - ARRANGEMENT_EPS) {'), 'if (time >= from) {']],
  m: [[M, esc('METRONOME_SCHEDULE_HORIZON_SECONDS = 2;'), 'METRONOME_SCHEDULE_HORIZON_SECONDS = 0.25;']],
  n: [[C, esc('        METRONOME_SCHEDULE_HORIZON_SECONDS,\n        LOOP_LATE_MARGIN,\n      );'), '        METRONOME_SCHEDULE_HORIZON_SECONDS,\n        0,\n      );']],
  o: [[C, esc('planMetronomeClicks(metronomeBpm, from, loop.end)'), 'planMetronomeClicks(metronomeBpm, from, loop.end, end)']],
};
