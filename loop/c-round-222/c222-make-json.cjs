const fs = require('fs');
const env = JSON.parse(fs.readFileSync('../env-status.json', 'utf8'));
const J = {
  round: 222,
  taskStatus: 'PASS',
  browserVerified: true,
  realVerified: true,
  envStatus: env,
  passed: ['SCOPE-222', 'UNIT-222', 'REDPROOF-222', 'CODE-222', 'LEGACY-UI-STUBBED-222', 'SUBSET-AUDIO-222', 'PERSIST-222', 'SELECT-ALL-222', 'ABLETON-TAB-222', 'LAB-SMOKE-222', 'G222-3', 'AN-REVIEW-222'],
  passedNotes: {
    'LEGACY-UI-STUBBED-222': 'Count, enabled state, MP3 frame walk and decode all pass. The WAV sub-criterion "byte-identical or decoded PCM identical" is NOT met literally, because 284/383996 samples differ by 1 LSB. The control run proves this comes from the export pipeline, not from the selection: two exports with the same untouched default selection (A1 vs A2) differ by 1 LSB in 318 samples. The per-stem spectrum is equal to 0.0000 dB on all 10 stems. See C-R222-01. B to rule on amending the criterion to "within 1 LSB" (L10).',
  },
  gate: ['full test suite', 'build', 'Biome', 'npm run verify', 'test:e2e:smoke'],
  blocked: ['LEGACY-OWNERSHIP-222: backend unavailable in cloud (real ownership through /api/downloads + studio-token). Not PASS, not a FAIL of A.'],
  ableton: {
    'REF-222-1': 'conscious deviation (no Rendered Track chooser; all stems ticked = full mix ~ Main). Verified 10/10 initial in browser.',
    'REF-222-2': 'conscious deviation / better than Live (in-dialog subset, persists). Verified PERSIST-222.',
    'default selection': 'unconfirmed (manual names no default for Rendered Track; C re-checked by WebFetch 2026-10-28)',
    other: 'not applicable',
  },
  bugs: [
    {
      id: 'C-R222-01', severity: 'low', origin: 'pre-existing (export pipeline), not A; not caused by round 222',
      steps: ['HR-LEGACY-STUBBED /studio/middle-east at 1440x900 (c222-legacy.cjs control)', 'Export Mix -> WAV, default selection untouched -> Export Audio (A1)', 'Reopen, do not touch the selection -> Export Audio again (A2)', 'Compare the int16 PCM'],
      expected: 'Two exports of the identical mix are bit-identical (and the task criterion LEGACY-UI-STUBBED-222 assumes this)',
      actual: 'A1 vs A2 differ in 318 of 383996 samples by 1 LSB; B1 vs B2 48 samples; A vs B (default vs Select All) 284 samples. Headers and peaks are equal. Normalize off still differs (114 samples, 1 LSB), so it is in the mix render and not in normalization. No dither or Math.random in the export path (grep). Hypothesis only: float summation order in the offline render.',
      evidence: 'c-round-222/legacy/control-1440.log, legacy/control-1440x900.json, legacy/nonorm-1440.log, legacy/main-1440.log (compareAB), legacy/spectrum-A-vs-B.json',
    },
    {
      id: 'C-R222-02', severity: 'low', origin: 'B task §3 table, copied by A into doc 174 l.36',
      steps: ['Open docs/implementation/2026/quarter-IV/174-legacy-export-dialog-stem-selection.md l.36', 'Compare the quoted manual text with https://www.ableton.com/en/live-manual/12/managing-files-and-sets/ (Rendered Track -> Main)'],
      expected: 'A quoted Ableton manual phrase is verbatim',
      actual: 'The doc (and task §3) quotes the manual as "most users will choose". The manual says "This is likely the option you will use for most scenarios". The page has no "most users" string (WebFetch, both page parts, 2026-10-28). The meaning is close; the quote is not verbatim.',
      evidence: 'c-round-222.md §AN-REVIEW; WebFetch 2026-10-28',
    },
    {
      id: 'C-R222-03', severity: 'low', origin: 'pre-existing layout (JSX unchanged this round), info for B',
      steps: ['/studio/middle-east (stubbed) at 1280x720', 'Click Export Mix'],
      expected: 'The Cancel / Export Audio footer is visible without scrolling inside the modal',
      actual: 'At 1280x720 the modal is cut at about y=683 and the footer is only reachable by scrolling inside it. At 1440x900 it is visible. Not caused by round 222 (no JSX change).',
      evidence: 'c-round-222/legacy/persist-1280x720-1-dialog-initial.png, persist-1280x720-4-reopen-after-mute.png',
    },
  ],
};
fs.writeFileSync('../c-round-222.json', JSON.stringify(J, null, 2));
console.log('ok');
