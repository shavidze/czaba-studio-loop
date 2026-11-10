# A round 428: SYS-2 stage 4 (2b-ii-a), held Enter on the shortcut sheet, export dialog and narrow-screen Send link

**Status:** implemented as dispatched. No STOP. Tree: 7 ` M` and 1 `??` (the 8 granted paths).
Baseline HEAD `ffae71c6ea2f041e694b8dfcf71cebea6101e429` (unchanged throughout).

## Changed files
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | B's sketch only: guard on Cancel and on Export; Done's inline copy folded to the helper; helper import |
| `app/components/arrangement/ArrangementShortcutSheet.tsx` | B's sketch only: guard on Close, plus the import |
| `app/components/arrangement/StudioNarrowScreen.tsx` | B's sketch only: guard on Send link, plus the import |
| `app/components/arrangement/StudioWorkspace.tsx` | B's sketch only: guard on the footer Shortcuts button |
| `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` | B's sketch only: HX1–HX3 |
| `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx` | B's sketch only: HQ1, HQ2 |
| `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` | B's sketch only: HN1 |
| `docs/implementation/2026/quarter-IV/276-sys-held-enter-dialogs.md` | New, written by A (Georgian) |

The sketch `b-round-427/sketch-428.patch.txt` has sha256 `fa75fa825dc2caf8923c8d430ce55f699b97a34a3db5fcacdf8a850a5e8c37d6`, which equals `sketch-428.sha256`. `git apply --check` passed, then `git apply`. After that I did not edit any of the 7 files. Saved diff of the 7 files: `a-round-428/diff.patch.txt`.

## Checks (actually run)
| # | Check | Result | Log |
|---|---|---|---|
| A1 | `bash b-round-427/claims-428.sh` at the start | rc 0, stderr empty, **byte-identical** to `claims-428-planning-output.txt` | `a-round-428/claims-start.txt`, `.err` (0 B) |
| A2 | `npx vitest run $(grep '^app/' …/covering-files.txt)` (59 files) | rc 0, **59 files, 996/996**, 77 s | `a-round-428/a2-vitest.log` (ANSI-stripped: `a2-vitest.clean.log`) |
| A3 | `npm run typecheck` / `npm run lint` | rc 0 / rc 0 (205 warnings, 1 info, the same as B's `precheck-lint.log`) | `a-round-428/typecheck.log`, `lint.log` |
| A4 | `npx biome check` on the 7 granted code and test files | rc 0, `Checked 7 files … No fixes applied` | `a-round-428/biome7.log` |
| A5 | Claims at the end | rc 0, stderr empty. Differences from the start output: K2 `1 ?? 7 M total 8`; K5 `no`; K6 shows the doc 276 name and its l.4; K8, K8b, K9, K9b, K9c, K17 and K24 equal `claims-428-sketch-output.txt` (checked line by line). K1 stays `ffae71c…`. K2b 0; K3 frozen 1320 rc 0; K4 protected rc 0, granted-protected 0; K19 `L58 OK`; K13 lists every id, none `NOT-FOUND`. **Re-run after the last doc edit:** rc 0, stderr empty, identical to the first end run | `a-round-428/claims-end.txt`, `claims-end2.txt` (+ `.err`, 0 B), `claims-start-vs-end.diff` |
| A6 | `code-reviewer` on the 8 files, then two doc-delta re-reviews | Sketch logic: no Critical, High or Medium (score 9/10). Doc findings were fixed in the doc only, see below; the final doc review approves | `a-round-428/reviews.md` (condensed, with agentIds) |

**Doc 276 self-checks (re-run after the last edit):**
- l.4 is byte-exact `**სტატუსი:** In Progress (stage 4 of 5; C round 428 PASS)`.
- The `## ` headings equal TEMPLATE's 7, in order.
- The mutant block equals the 7 lines of `b-round-427/mutants/summary.txt` (`diff` rc 0).
- `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits.
- Every cited row id exists: HQ1, HQ2, HN1, HX1–HX3, CU1–CU10, SS2, SS5, NG6, NG7a–NG7d.
- The Mermaid block contains no `;` or `#`. No Mermaid CLI is installed, so it was not rendered.

**Timeout headroom (L31), from the A2 log:**
- CP12c: 3.9 s of 30 s.
- TC10: 2.3 s of 15 s.
- The three row files: export-cancel-ui 1.7 s for the whole file; NG5 1.5 s of 15 s.
- No covering test is above 50 % of its timeout.

## Reviewer findings
**First review, of the 8 files:**
- **Low: HQ1's `expect(sheetSearch(view).value).toBe('')`** (`shortcut-sheet-ui.test.tsx`) cannot fail in practice, because Enter never types into an input. The row's real discriminator, the repeat on search returning `true` (not prevented), is meaningful. The line is in a sketch-only test file, so A did not edit it. **For B.** Doc 276 now states it.
- **Info: the Mermaid diagram was loose:**
  - Send link was missing from the focus targets.
  - The repeat-before-press path was missing.
  - Return arrows pointed in the call direction.

  Fixed in the doc.
- **Info:** the claim "Done / Modal ✕ → Export opener" rests on the browser probe (XDONE, XMODALX), not on a jsdom row. HX3 claims no focus. No change needed.
- **Info, pre-existing:** the NG7 `afterEach` sets `navigator.share` and `navigator.clipboard` to `undefined` instead of restoring their descriptors. This is harmless in jsdom.

**Doc-delta re-review 1:**
- **Medium (doc only): a `;` inside a Mermaid message broke the parse.** Fixed: the diagram now has no `;` or `#`.
- **Lows:**
  - the search field was drawn as calling the guard. Now an `alt … else` block notes it has no guard.
  - `H-->>F` read as a return value. It is now a `Note` saying effects move the focus.
  - during the Export render, focus is on the trap and then on Done. This is now in the note.
  - the TL-R427-01 sentence named jsdom as the reason. It is reworded to say Enter writes no text in any environment.

  All are fixed in the doc only.

**Doc-delta re-review 2:** see the line at the end of this file.

## Known gaps
- **No browser run by A.** The task gives A no browser row; rows 4–6 are C's. B's probe ran on sketch v1 (`fc3d0b63…`), whose 4 source files are byte-identical to the applied sketch.
- **A did not run mutants.** That is C row 3, on a HEAD scratch.
- **The full suite, build and verify are gate rows, not run by A**, per the 2026-10-21 speed rules.
- **Orientation order (honest note):** the claims (A1), lessons and primitives were read before the sketch was applied. The `pre-flight` skill, `context/active-summary.md` and `root-pre-push-review.md` were read only after it was applied: the first command's output had been truncated. None of them mentions round 428; `root-pre-push-review.md` covers old rounds only. `context/active-backlog.json` was not opened (the task names every id A needs).
- **Doc cross-check after the review:** TH5, cited in ruling 4, exists (`export-toolbar-hold-enter.test.tsx:270`). `b-round-427/mutants/run.py` confirms the doc's "base = HEAD": its scratch is HEAD with the sketch applied and committed, with the sketch tests kept. MU-HEAD-SRC restores the 4 source files from HEAD; each other mutant deletes the one `onKeyDown={preventRepeatedEnterKeyDown}` line after its button's `onClick`.
- **The Mermaid block was not rendered** (no CLI). It was checked by reading and by the reviewer.

## Exact next C checks (from task §6)
1. **SOURCE-SCOPE and CLAIMS:** the A5 expectation above, with stderr empty. Status has only the 8 paths. Frozen 1,320 rc 0. Protected rc 0. K19 `L58 OK`.
2. **PATCH-IDENTITY:** apply the sketch to a `git archive HEAD` scratch and `cmp` the 7 files. Then A2: 59 files, 996/996.
3. **MUTANTS:** on a HEAD scratch with `c-round-428/b427copy`, the result must equal `b-round-427/mutants/summary.txt`.
4. **Held-Enter browser:** run `held-enter-2bii.mjs` against :5173 at 1440×900, 1280×720 and 800×700, then `compare.py`, which must print `ALL OK (13 cells)`. Check the focus targets and their rings. Warm `/studio-lab` in a browser first.
5. **Per-press and neighbours:** `?` and Esc, mouse open and close, Export renders exactly 1 and Done closes, Space opens once.
6. **AUTH:** `g428-auth.cjs` (legacy route settled, token 401/400).
7. **DOC:** as listed above.
8. **SOURCE-SCOPE end and L57.**

## Scope completed
- Task §3 steps 1–4 are done.
- A1–A6 passed as written above.
- **B acceptance criteria that A truly passed:** A1, A2, A3, A4, A5, and A6 (no Medium+ in the sketch logic; doc findings fixed in the doc only).
- C rows 1–8 are **not** claimed by A.
- The SYS-2 backlog item is not complete: stage 5 (2b-ii-b) remains.

## For B
- **Low A-R428-REVIEW-L1-HQ1-VALUE-ASSERT:** HQ1's `value === ''` assert is near-tautological. Candidate: drop it or replace it in stage 5 (the test file is sketch-only this round).
- **Architecture note (reviewer, proposal only):** the per-button `onKeyDown={preventRepeatedEnterKeyDown}` opt-in is now in about 60 places. The reviewer recommends keeping it for this stage, because it is auditable and lets each mutant map to one guard. Stage 5, or ARCH-CHECKPOINT-SYS-2, could decide whether a shared repeat-safe button primitive or a capture listener should replace the opt-in. A blanket listener would also hit out-of-scope Store `Modal` and menu buttons. This joins SIG-R427-HELD-ENTER-TEST-HELPER (the `pressHeldEnter` duplicate).
- **Info, pre-existing:** the NG7 `afterEach` does not restore the original `navigator.share` and `navigator.clipboard` descriptors.

**Doc-delta re-review 2 (the final doc, sha256 prefix ef1021aa321f7a0d):** `approve`, no findings. One optional wording nit (two colons in one sentence) was left as is.
