# B — round 322 → 323 planning

**Date:** 2026-11-03. **Advisor:** available and used twice: before writing, and before finishing. The second call led to K36/K37 claims for the Esc/Shift facts, a narrower §4 confirmation sentence (B's probe did not run Ctrl+D), and the DUP-NAMES probe path.

**Output:**
- `current-task.md` (round 323)
- `backlog.json` v282 (D-29z896…D-29z902)
- `feature-status.md`
- `lessons.md` (L58 clause; still 59 lines)
- `b-next.json` (CONTINUE)
- `tasks/round-322.md` (archive)
- `b-round-322/`: before-copies, claims, setup probe

## 0. Inputs
- **A round 322:** STOP — needs a B ruling. The `render-budget.test.tsx` positive control conflicts with PERF-8b. The tree is consistent and nothing was reverted.
- **C round 322:** FAIL. `browserVerified` and `realVerified` are false only because the tree is incomplete. There is no app bug:
  - On every runnable browser row, A's tree equals HEAD at both viewports.
  - The WAV export is byte-identical.
  - RT-FIX, SOURCE-SCOPE, EXPECT and G322-AUTH PASS.
- **Gate 322:** `skipped` (C FAIL). The baseline stays `53c5c79`.
- **Archive:** `tasks/round-322.md` is a copy of the round-322 `current-task.md` (cmp equal, K34). The before-copies are in `b-round-322/before-*`.
- **Regression:** `regression-last.json` is dated 2026-11-02 (round 301). Planning is on 2026-11-03, before 2026-11-05, so REGRESSION is not due.

## 1. Backlog updates (only from independent C evidence)
| Item | Change | Evidence |
|---|---|---|
| C-R321-01/02/03 | closed | C round 322 RT-FIX PASS (`c-round-322.md`, `c-round-322.json` `passed`) |
| RETRO-321 (`retro_runs` 321) | closed | same |
| C-R322-01 (Medium, B) | open → option (a) granted | `c-round-322/render-budget-option-a.log` (C scratch 8/8) |
| C-R322-02 (Low, B) | open → reworded | `c-round-322/probe/selnames-summary.txt` |
| PERF-8b | stays `in_progress`; **not** done (`browserVerified` false) | — |
| `rounds` | 322 result + 323 dispatched | — |
| A-R322-ARCH-SELECTION-WRAPPERS | architecture signal → PERF-10, not scheduled; point (4) added to ARCH-CHECKPOINT-PERF8-STORE-PATTERN | `a-round-322.md` §4 |

## 2. Rulings (D-29z896…D-29z902)
1. **Option (a)** for the one `it` of `render-budget.test.tsx`. It adds 3 `expect(` and removes none (88 → 91).
2. **SELECT-NAMES re-click** = 0 components, `providerRendered` false, ≤ 1 commit. The reclick commits row becomes ≤ 1.
3. **The two wrappers are memoised.** If a prop is unstable and fixing it needs an ungranted file, that is a STOP.
   - **Tolerance:** the only added names allowed are the eight subscriber names. Any other added name is a finding.
   - **New row:** DUP-NAMES.
   - **Deviation from the advisor:** the advisor suggested "A's set ⊆ HEAD's set on Ctrl+D". B rejected that variant. On Ctrl+D the `arrangement` prop changes (call site about l.3295 on A's tree), so the wrapper fiber renders no matter what. That bound could not be met, and it would only force another STOP.
4. **S-* setups named and browser-confirmed** (`b-round-322/setup-probe-a-tree.json` and `.png`):
   - **2 lanes:** use the active-track button.
   - **Group:** Ctrl+G gives "Group 1".
   - **Two facts from code:**
     - Esc does not clear a clip selection at HEAD. This is expected.
     - The code says Shift+click adds a clip, but C saw it not add. C re-tries once on HEAD. If it still does not add, it becomes the candidate C-R322-SHIFT-ADD (Low, pre-existing) for REGRESSION.
5. **L58 clause:** a sketch crash hides behaviour asserts. B greps the crashed covering set for coupling asserts.
   - This is the exact miss behind C-R322-01.
   - **Why it was missed (B phase):** the 81 files crashed before any assert ran, and B treated them as "covering set, no edits expected".

## 3. Scope check
- **No new scope folded in.** PERF-DRAG-PREVIEW and the later stages stay queued.
- **No feature was deferred** and no scope was shrunk.
- **Not affected:** purchase protection (protected 11/11) and the anonymous `/studio-lab` workspace (G322-AUTH PASS).
- **Ownership:** the grants are `tasks/round-322.md` §2.1 plus the one `render-budget.test.tsx` `it`.

## 4. Commit readiness
None this round. Root publishes after C round 323 PASS and gate 323.

## 5. Advisor and consults
- **Advisor:** available and used.
- **Project subagents:** none consulted. This is a resume ruling on measured C/A evidence, and the round-322 consults (`performance-optimizer`, `tech-lead`) still apply.
- **frontend-architect:** ARCH-CHECKPOINT-PERF8-STORE-PATTERN is already requested from root. It is non-blocking and answerable at this PERF-8 boundary.
