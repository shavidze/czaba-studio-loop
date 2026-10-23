const fs = require('fs');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const env = JSON.parse(fs.readFileSync(L + '/env-status.json'));
const j = {
  taskStatus: 'PASS',
  browserVerified: true,
  realVerified: true,
  envStatus: env,
  round: 107,
  verifiedUtc: new Date().toISOString(),
  bugs: [
    {
      id: 'C-R107-01',
      severity: 'medium',
      title: 'Keyboard 0 dB Clip Gain reset disables the focused button, focus falls to <body>, and the next Enter adds a library clip (pre-existing; not a round-107 regression)',
      steps: [
        'Fresh incognito /studio-lab 1280x720, Decline, wait for the library to settle',
        'Focus the Middle East library row, press Enter (one clip at 0), Fit, select the clip by its title strip',
        'Open the detail panel; type 1 in the Clip Gain input and press Enter (gain 1.0 dB, 0 dB enabled)',
        'Tab to the 0 dB button (activeElement = arrangement-detail-clip-gain-reset) and press Enter once',
        'Press Enter once more',
      ],
      expected: 'After the reset, focus stays in the panel on a sensible element (for example the Clip Gain input), so the next Enter does nothing unexpected. Focus is not lost to <body>.',
      actual: 'The reset applies (span "Clip Gain: Middle East — საჯარო preview — 0.0 dB.") and the button becomes disabled. document.activeElement becomes BODY. The next Enter goes to the workspace handler and adds the last library item as a new clip ("„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 01:41.352-ზე (უახლოესი თავისუფალი ადგილი)."). The clip count goes 1 -> 2 and the Undo label becomes "Undo: დამატება …". Another Enter adds a third clip at 03:22.704.',
      evidence: 'c-round-108/out/gain-focus-1280x720.json (afterTab, afterReset, afterEnter2, afterBodyEnter); c-round-108/out/gain-reset-1280x720.json (separate-press step); shots/gain-focus-1280x720.png. Code: ArrangementDetailPanel.tsx resetClipGain and disabled={clipGainReason !== null || clipGainDb === undefined}. The model stores 0 dB as an undefined gainDb, so the button disables itself after its own click. Pre-existing is an inference from the diff (the disabling logic, the onMouseDown preventDefault and the Enter-on-body library add have no round-107 hunk; R2 only adds a repeat guard); it was not measured at baseline in the browser.',
    },
  ],
  passed: [
    'HK-CTRL-L', 'HK-CTRL-E', 'HK-CTRL-SHIFT-L', 'HK-CTRL-C', 'HK-UNDO-STILL-REPEATS',
    'HE-MARKER-PREV', 'HE-MARKER-NEXT', 'HE-MARKER-ADD', 'HE-DETAIL-APPLY',
    'NZ-TIME0', 'NZ-MOVES', 'NZ-SNAPON-SAME', 'KR-NUDGE-NEIGHBOUR',
    'SR-REPEAT-SPACE', 'HD-BLOCKED-HOLD', 'SR-TEXT-REG', 'PX-NET', 'REG-HYD', 'G107-3',
    'AN-REVIEW', 'T107-TARGETED', 'DOC-092', 'SOURCE-UNCHANGED',
  ],
  passedWithDeviation: [
    {
      id: 'HE-CLIPGAIN-RESET',
      note: 'B row as written cannot run. On a fresh clip, 0 dB is disabled (gain-literal-1280x720.json: gainDisabled=true; the held Enter stayed on the detail toggle). I ran A\'s corrected setup: gain 1 dB, focus 0 dB, hold Enter 1+11. Result: exactly one span "Clip Gain: Middle East — საჯარო preview — 0.0 dB.", value 0.0, "Undo: Clip Gain". The button disables after the first click and focus goes to BODY, so the browser cannot isolate R2 on this button; jsdom HE4 plus mutation h9 (A) are the only coverage. See C-R107-01.',
    },
    {
      id: 'AN-REVIEW/HE1-Space',
      note: 'The literal HE1 clause (a repeated Space on ◀ returns true) is impossible: the workspace Space branch prevents Space on buttons, at baseline too. A asserts instead that the button handler leaves Space alone (preventedBeforeWindow). Accepted; B should fix the spec wording.',
    },
  ],
  blocked: ['G107-3 fake-Bearer /api/studio-token sub-check: backend unavailable in cloud'],
  gate: ['full vitest', 'typecheck', 'build', 'Biome', 'npm run verify', 'npm run test:e2e:smoke', 'PROD-MP3-UNVERIFIED'],
  observations: [
    'F2 confirmed in the browser: a range 2.957–5.914 stays after a time-0 refusal (time0-range-1280x720.json). This matches B\'s rule that the refusal writes nothing else. For B to decide; not a bug.',
    'User-flow smoke (find sound, add 3 demo sources, Fit, real WAV export): 101.702 s, 48 kHz, 2 ch, 24-bit PCM, 0 NaN, rms 0.1746454881, 486 full-scale samples. Identical to C round 98 (rms equal to 1e-11), so the full-scale count is pre-existing (flow107-1280x720.json).',
    'The first HK-CTRL-E attempt was invalid because of my recipe: a title-strip click moves the playhead (to 2.688 s). Re-run with the click at x(t=10): PASS.',
  ],
  ableton: {
    'HK/HE': 'არ ეხება (CZABA convention; no Live source consulted)',
    NZ: 'არ ეხება (CZABA requirement; the Live 12 manual §3.2 Status Bar does not cover this case)',
  },
  mutationsC: { control: '32/32', h1: ['HK1'], h5: ['HK5'], h8: ['HE3'], h10: ['NZ1', 'NZ2', 'NZ3'], h12: ['NZ3', 'SK7'] },
  targeted: { files: 69, tests: 1152, listSameAsA: true },
};
fs.writeFileSync(L + '/c-round-108.json', JSON.stringify(j, null, 1));
console.log('ok');
