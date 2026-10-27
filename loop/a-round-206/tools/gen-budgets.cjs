const fs = require('fs');
const rows = [];
const add = (r) => rows.push({ id: r.id, scenario: r.scenario, metric: r.metric, unit: r.unit, kind: r.kind, mode: r.mode, budget: r.budget ?? null, owner: r.owner, note: r.note ?? '' });
add({ id: 'harness.hook-live', scenario: 'load + library Add click', metric: 'commits', unit: 'count', kind: 'deterministic', mode: 'assert', budget: { op: '>=', value: 1 }, owner: 'PERF-1a', note: 'React commits seen by the devtools-hook stub in the 2 s after the Add click; a disabled hook must fail, not report 0.' });
add({ id: 'harness.audio-running', scenario: 'playing setup (R-H)', metric: 'audio-running', unit: 'boolean (1 = true)', kind: 'deterministic', mode: 'assert', budget: { op: '==', value: 1 }, owner: 'PERF-1a', note: 'Play button aria-label is Pause and a tracked (non-offline) AudioContext reports state running.' });
add({ id: 'harness.restart-live', scenario: 'while playing, drag the added clip 1 s right (scheduleKey change)', metric: 'restart-live', unit: 'count', kind: 'deterministic', mode: 'assert', budget: { op: '>=', value: 1 }, owner: 'PERF-1a', note: 'start() calls on non-offline contexts from pointerdown until the page is quiet (>= 500 ms after pointerup, 200 ms without a commit or start, cap 3 s); detail groups the calls per task; proves the restart counter is live.' });
add({ id: 'load.longtask-max', scenario: 'fresh /studio-lab until ready', metric: 'longtask-max', unit: 'ms', kind: 'wallclock', mode: 'record', owner: 'PERF-2', note: 'Baseline 463–491 ms (perf-plan). Ready = library Add enabled and preview waveform bars drawn.' });
add({ id: 'load.longtasks-over-50', scenario: 'fresh /studio-lab until ready', metric: 'longtasks-over-50', unit: 'count', kind: 'deterministic', mode: 'record', owner: 'PERF-2', note: 'Long tasks over 50 ms before ready.' });
add({ id: 'load.ready-ms', scenario: 'fresh /studio-lab until ready', metric: 'ready-ms', unit: 'ms', kind: 'wallclock', mode: 'record', owner: 'PERF-5', note: 'ms from navigation start to ready; baseline 2.3–2.5 s (perf-plan).' });
add({ id: 'load.commits', scenario: 'fresh /studio-lab until ready', metric: 'commits', unit: 'count', kind: 'deterministic', mode: 'record', owner: 'PERF-2', note: 'React commits until ready (record only; the Scheduler may merge commits).' });
add({ id: 'load.components', scenario: 'fresh /studio-lab until ready', metric: 'components', unit: 'count', kind: 'deterministic', mode: 'record', owner: 'PERF-2', note: 'Summed re-rendered components over the load commits.' });
add({ id: 'play.idle-commits', scenario: '5 s of playback after start + 1 s settle', metric: 'commits', unit: 'count', kind: 'deterministic', mode: 'record', owner: 'PERF-1a', note: 'perf-plan: 0; B saw 0–1.' });
add({ id: 'play.idle-components', scenario: '5 s of playback after start + 1 s settle', metric: 'components', unit: 'count', kind: 'deterministic', mode: 'record', owner: 'PERF-1a', note: 'Summed re-rendered components during idle playback.' });
add({ id: 'play.idle-longtasks-over-50', scenario: '5 s of playback after start + 1 s settle', metric: 'longtasks-over-50', unit: 'count', kind: 'deterministic', mode: 'assert', budget: { op: '==', value: 0 }, owner: 'PERF-1a', note: 'Asserted at 1x only.' });
const faders = { track: 'Volume — Music', group: 'Volume — <group> (group), Stems + SFX grouped with Ctrl+G', master: 'Master Volume', pan: 'Pan — Music', clipgain: 'Clip Gain — fader (added clip selected)' };
for (const f of ['track', 'group', 'master', 'pan', 'clipgain']) {
  for (const s of ['stopped', 'playing']) {
    for (const rate of [1, 6]) {
      const det = rate === 1 ? '' : '.6x';
      const sc = `drag ${faders[f]}, ${s}, ${rate}x CPU (R-G)`;
      const base = `fader.${f}.${s}`;
      add({ id: `${base}.components-per-commit${det}`, scenario: sc, metric: 'components-per-commit', unit: 'components', kind: 'deterministic', mode: 'record', budget: { op: '<=', value: 3 }, owner: 'PERF-FADER', note: 'Median re-rendered components per commit from pointerdown until quiet, >= 600 ms after pointerup (detail: max, commits, settleMs, slider values). Target <= 3 (PERF-FADER flips to assert). Determinism-checked; must agree across 1x and 6x.' });
      add({ id: `${base}.commits-per-move${det}`, scenario: sc, metric: 'commits-per-move', unit: 'ratio', kind: 'deterministic', mode: 'record', owner: 'PERF-FADER', note: 'Commits / moves dispatched; an upper bound only (the Scheduler merges commits). Not determinism-checked.' });
      add({ id: `${base}.moves-dispatched${det}`, scenario: sc, metric: 'moves-dispatched', unit: 'count', kind: 'deterministic', mode: 'record', budget: { op: '==', value: 121 }, owner: 'PERF-1a', note: 'pointermove events received by window during the drag (1 + 60 + 60). Determinism-checked.' });
      if (s === 'playing') add({ id: `${base}.restarts${det}`, scenario: sc, metric: 'restarts', unit: 'count', kind: 'deterministic', mode: 'assert', budget: { op: '==', value: 0 }, owner: 'PERF-FADER', note: 'start() calls on non-offline contexts from pointerdown until quiet (>= 600 ms after pointerup, 200 ms without a commit or start, cap 3 s); detail groups the calls per task; a fader move must not rebuild the graph.' });
      add({ id: `${base}.frame-p95.${rate}x`, scenario: sc, metric: 'frame-p95', unit: 'ms', kind: 'wallclock', mode: 'record', owner: 'PERF-FADER', note: 'p95 of rAF intervals between pointerdown and pointerup. Trend only (±30 %).' });
      add({ id: `${base}.frames-over-33.${rate}x`, scenario: sc, metric: 'frames-over-33', unit: 'count', kind: 'wallclock', mode: 'record', owner: 'PERF-FADER', note: 'rAF intervals > 33.4 ms during the drag. Trend only.' });
      add({ id: `${base}.loaf-count.${rate}x`, scenario: sc, metric: 'loaf-count', unit: 'count', kind: 'wallclock', mode: 'record', owner: 'PERF-FADER', note: 'long-animation-frame entries starting during the drag. Trend only.' });
      add({ id: `${base}.event-share-16.${rate}x`, scenario: sc, metric: 'event-share-16', unit: 'ratio', kind: 'wallclock', mode: 'record', budget: { op: '<', value: 0.05 }, owner: 'PERF-FADER', note: 'Share of dispatched moves with a pointermove or input Event Timing entry >= 16 ms (16 ms is the API floor). Target < 5 % (PERF-FADER: share < 5 % <=> p95 < 16 ms).' });
    }
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(rows, null, 2) + '\n');
console.log(rows.length, 'rows');
