const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let s = fs.readFileSync(p, 'utf8');
const rep = (from, to) => {
  const n = s.split(from).length - 1;
  if (n !== 1) {
    throw new Error(`expected 1 match, got ${n}: ${from.slice(0, 90)}`);
  }
  s = s.replace(from, to);
};

rep('    - **Previous marker:** `aria-keyshortcuts="Control+ArrowLeft"`, `data-testid="arrangement-marker-prev"`;\n    - **Next marker:** `aria-keyshortcuts="Control+ArrowRight"`, `data-testid="arrangement-marker-next"`.',
  '    - **Previous marker:** `aria-label="Previous marker (Ctrl+←)"`, `aria-keyshortcuts="Control+ArrowLeft"`, `data-testid="arrangement-marker-prev"`;\n    - **Next marker:** `aria-label="Next marker (Ctrl+→)"`, `aria-keyshortcuts="Control+ArrowRight"`, `data-testid="arrangement-marker-next"`.');

rep('  - It is a typing target, so global shortcuts are already ignored while it has focus (`isTypingTarget`).',
  '  - It is a typing target, so global shortcuts are already ignored while it has focus (`isTypingTarget`).\n  - **It is a sibling of the marker buttons in the row body, never nested inside a marker `<button>`.** The marker and row key handlers ignore events whose target is the input. Delete/Backspace typed in the input edits the text only and never deletes a marker (MU7, MK-RENAME).\n  - **It settles at most once.** The first of Enter, Escape or blur settles it; a later blur (for example when the input unmounts after Enter or Escape) does nothing. So Enter never adds twice or shows a duplicate refusal, and Escape followed by a blur never commits.\n  - **`before` is `getArrangement()` at commit time**, not when the editor opened. Edits made meanwhile (for example a clip edit while playing) are kept.');

rep('  - one `arrangement-marker` with `data-marker-time="12.000"` and an `aria-label` containing the name;',
  '  - one `arrangement-marker` with `data-marker-time="12.000"` and an `aria-label` containing the name;\n  - no duplicate-refusal status after Enter, and exactly one new history entry (the settle-once rule);');

rep('- **MU7 — rename.** F2 → the editor holds the current name; Enter with a new name → `Rename Marker`. F2 + Escape → unchanged. F2, clear, Enter → unchanged, with the status `სახელი ცარიელია …`.',
  '- **MU7 — rename.** F2 → the editor holds the current name; Enter with a new name → `Rename Marker`. F2 + Escape → unchanged, and no entry after the following blur. F2, select all, **Delete** key, Enter → the marker still exists, its name is unchanged, and the status is `სახელი ცარიელია …` (Delete in the input must not delete the marker).');

rep('| (l) M is missing from the gesture refusal | MU11 |',
  '| (l) M is missing from the gesture refusal | MU11 |\n| (m) the marker key handler does not exclude the name input | MU7 |\n| (n) a blur after Escape commits (no settle-once flag) | MU2, MU7 |');

rep('  - (m) the label width ignores the next marker;\n  - (n) Ctrl+←/→ is not excluded on sliders;\n  - (o) blur does not commit.',
  '  - (o) the label width ignores the next marker;\n  - (p) Ctrl+←/→ is not excluded on sliders;\n  - (q) blur does not commit.');

rep('- **Mutations a–l** in your own scratch. Each must kill its named tests.\n- **C extras',
  '- **Mutations a–n** in your own scratch. Each must kill its named tests.\n- **C extras');

rep('the status ends with `1 მარკერი წაიშალა.`; the clip after 25 moves left by 10 s (as before);',
  'the status ends with `1 მარკერი წაიშალა.`; the music clip is split, and its right part (originally from 25) now starts at 15, 10 s earlier (as before);');

rep("  2. One sentence is appended to the end of the **Gates** bullet (l.84): `root-ის საბოლოო gate-ზე `npm run verify` გავიდა (101 ფაილი / 1696 ტესტი, `gates/round-71/verify.log`).` The A-phase history stays.",
  "  2. One sentence is appended to the end of the **Gates** bullet (l.84). The A-phase history stays. Exact text to append (after a space):\n\n     ```text\n     root-ის საბოლოო gate-ზე `npm run verify` გავიდა (101 ფაილი / 1696 ტესტი, `gates/round-71/verify.log`).\n     ```");

fs.writeFileSync(p, s);
console.log('ok');
