const fs = require('fs');
const base = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
function edit(file, pairs) {
  let t = fs.readFileSync(base + file, 'utf8');
  for (const [a, b] of pairs) {
    if (!t.includes(a)) throw new Error(file + ' anchor missing: ' + a.slice(0, 60));
    t = t.replace(a, b);
  }
  fs.writeFileSync(base + file, t);
}
edit('current-task.md', [
  [
    '   - **Stop and report to B** if any state needs more than two lines at 288 (the clamp would then hide text that is visible today, beyond the `title`).',
    '   - **Stop and report to B** if any state needs more than two lines at 288. The clamp would then hide text that is visible today (it would survive only in `title`). Before the clamp exists, line count = `offsetHeight / line-height`. Keep these pre-code numbers; C compares the post-fix `scrollHeight` against them.',
  ],
  [
    '   - its rendered line count ≤ 2;',
    '   - the content line count = `round(scrollHeight / line-height)`. With the clamp, `offsetHeight` is always 2 lines, so it cannot count lines. That count is ≤ 2 in every state and equals A\'s pre-code count from §1.4a. **Only if `scrollHeight > offsetHeight`** must the text end with an ellipsis (`text-overflow`/`-webkit-line-clamp` computed, plus a screenshot);',
  ],
  [
    '2. `title` equals `აქტიური ხაზი: {name}{note}`, with the video note `(აუდიო აქ არ ემატება)` on the video lane.',
    '2. `title` is exactly `აქტიური ხაზი: ${name}${note}`, with no trailing space, and with the video note `(აუდიო აქ არ ემატება)` on the video lane. C compares `title.trim()` with `textContent.split(\'·\')[0].trim()`. The JSX `{\' \'}` before ` · playhead` leaves a trailing space in `textContent` (C round 16: `"აქტიური ხაზი: SFX "`), and that space is not a failure.',
  ],
  [
    '  - `title` equals the lane text for an audio lane and for the video lane (with the note);',
    '  - `title` is exactly `აქტიური ხაზი: ${name}${note}` (no trailing space) for an audio lane and for the video lane (with the note). It also equals the `textContent` before `·`, after `.trim()`;',
  ],
]);
edit('feature-status.md', [['find → add-ს (R17-R)', 'find → add-ს (R17-P3)']]);
console.log('task fixes applied');
