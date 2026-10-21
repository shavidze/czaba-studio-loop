const fs = require('fs');
const p = 'current-task.md';
let t = fs.readFileSync(p, 'utf8');
function rep(from, to) {
  if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 60));
  t = t.replace(from, to);
}
rep(
  '| CG-6 type `3`, **playing**, `setTargetAtTime` hook | real click on the music header | exactly one `setTargetAtTime(≈1.4125, τ 0.015)` on the SFX clip gain path, 0 new `start` calls (the round-30 R30-GV live oracle) |',
  '| CG-6 type `3`, **playing**, `setTargetAtTime` + `start` hooks | real click on the music header | see the CG-6 procedure below |',
);
rep(
  '- **Unchanged contract (one run each):** Enter commits once (+1); Escape reverts the text (0); the `0 dB` reset (+1).',
  [
    '- **CG-6 procedure (live audio):** the SFX clip has a live source only while the playhead is inside `[4, 6)`. First set a loop around it (for example a range 3.5–6.5 on the SFX lane, then Ctrl+L). Start playback with Space while the body has focus. Then select SFX, click into Clip Gain, type `3` and click the music header. **Record the playhead at the click.**',
    '  - playhead inside `[4, 6)`: exactly **one** `setTargetAtTime(≈1.4125, τ 0.015)` on the SFX clip gain path and **0** new `start` calls at the click (the round-30 R30-GV live oracle), +1 `Clip Gain`;',
    '  - playhead outside `[4, 6)` (control; record it): **0** live calls at the click, the `Clip Gain` entry is still written, and the next loop iteration starts the SFX source at gain ≈1.4125 (the R30-GL oracle);',
    '  - a run that misses the window is a replaceable invalid attempt (3 valid runs, at most 2 replacements); report every attempt.',
    '- **Unchanged contract (one run each):** Enter commits once (+1); Escape reverts the text (0); the `0 dB` reset (+1).',
  ].join('\n'),
);
rep(
  "- correct the round-33 section's residual list: the scrollbar residual is now fixed (do not rewrite the round-33 text; add the correction in the new section);",
  "- correct the round-33 section's residual list: the scrollbar residual is now handled (do not rewrite the round-33 text; add the correction in the new section). State that A-R33-REVIEW-SCROLLBAR is a **code-review finding, not reproduced** in a browser (headless shows a 0 px scrollbar), so the gutter rule is preventive and the real check is the Tech Lead's R34-T;",
);
fs.writeFileSync(p, t);
console.log('ok');
