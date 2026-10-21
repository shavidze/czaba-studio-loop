const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
function patch(name, a, b) {
  const f = path.join(dir, name);
  const t = fs.readFileSync(f, 'utf8');
  if (t.split(a).length !== 2) {
    throw new Error('anchor not unique in ' + name + ': ' + a.slice(0, 50));
  }
  fs.writeFileSync(f, t.replace(a, () => b), 'utf8');
}

patch(
  'b-round-28.md',
  '  - C-R27-01 moves into the Tech Lead banner.',
  '  - C-R27-01 moves into the Tech Lead banner.\n- **Second advisor call** (after the files were written, before declaring done) found:\n  - the cross-artifact consistency holds (owned files are outside the 72; the frozen tests stay compatible);\n  - B had not yet read the two root files. B read them (see §8);\n  - B added the `clipboardRef`/`ArrangementClipboard` consumer grep to the task\'s §1.4.\n  The backlog v30 sentence written by the interrupted session ("called … once before declaring done") was written before this session\'s calls. This record is the authoritative one.',
);
patch(
  'b-round-28.md',
  'Updated: machine load was 10 `node.exe` at planning, and the dev server was down at planning.',
  'Updated: machine load was 10 `node.exe` at planning, and the dev server was down at planning.\n\n**B read both root files on 2026-10-12:**\n- `root-pre-push-review.md` (2026-10-07):\n  - M1–M3, L1–L4 and L6–L8 are closed in earlier rounds; L5 (`biome-ignore` tool directives) is accepted;\n  - the §3 commit-scope rule (stage exact paths, never `git add -A`) stays a root rule for the final commit.\n- `publication-checkpoint.json` (2026-10-09):\n  - its remaining requirements are already carried: library/stems/scrollbars (SRW-12 ready, SRW-23 Tech Lead), discoverable entry (SRW-22 ready), the purchased-adapter limitation (SRW-21), portable paths, T12 after the original scope, and the final commit/push by root only after everything.\n- **No finding is missing** from the carried list in `current-task.md` §4.7 / `feature-status.md` §6.',
);
patch(
  'current-task.md',
  '   - **Grep yourself** for any other frozen test that runs `cutTimeSelection()` then `pasteClipboard()` with a one-audio-lane window and a different active track. Report the result. If one exists, stop and report: it would be a frozen contract conflict for B, not something to edit.',
  '   - **Grep yourself** for any other frozen test that runs `cutTimeSelection()` then `pasteClipboard()` with a one-audio-lane window and a different active track. Report the result. If one exists, stop and report: it would be a frozen contract conflict for B, not something to edit.\n   - Also grep every consumer of `clipboardRef` and `ArrangementClipboard` (status text, any serialisation, `toStrictEqual`/`toEqual` on a whole clipboard). Report each, and confirm that the new optional field breaks none.',
);
console.log('final notes applied');
