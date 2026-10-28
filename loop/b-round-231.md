# B — Round 231 → 232 planning (2026-10-28)

**Decision: CONTINUE.** Round 232 = SABA-B-8 **CALM-3**, the final SABA-B-8 stage: a quiet empty-project Overview, and Ctrl+Alt+O to hide or show it. It also carries GATE229-S2 and the GATE229-S4 C row.
- Task: `current-task.md`. The round-231 task is archived at `tasks/round-231.md` (new copy; nothing overwritten).
- Decisions: D-29z306…D-29z312.
- Advisor consulted before the plan; a second call is made before handover.

## 1. Round 231 result (evidence, not claims)
| Source | Result |
|---|---|
| `c-round-231.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 16 rows passed; 0 failed; 0 blocked; gate rows not claimed. 1 Low (C-R231-01). Notes N1–N8. |
| `a-round-231.md` | Implemented within the grants. Covering set 29 files / 562 tests green; mutants MU-1…MU-9 (MU-8 browser-only). code-reviewer 8/10, R1/R3/R6 left for B's ruling, plus one Architecture note. |
| `gates/gate-round-231.json` | `published`, commit `e5507ffe56a4e59234bbb5a66f0537aaad5ceb62` on both remotes. **That commit is the round-232 baseline.** |
| `store/` at planning | HEAD `e5507ff`; `git status` empty (`b-round-231/git-status-at-planning.txt`). |

**Rulings (backlog v216 → v217, only from this evidence; script `b-round-231/update-backlog.py`, before copy `b-round-231/backlog-before-232.json`):**
- **D-29z306, what closes:**
  - CALM-2b is **done**, and with it CALM-2.
  - RT-FIX-231 PASS closes C-R230-01, C-N230-NOTES and RETRO 230.
  - GATE229-S3, GATE229-S5 and B-R229-DOC170-STATUS close (C-VIDEO-SOLO-231, AN-REVIEW-231).
- **D-29z307, C-R231-01 (Low):** goes to `deferred_low_polish`. It shares its root cause with C-R139-02: lane ghosts are cleared only on `dragleave`/`drop`. One fix will close both. CALM-3 does not grant `ArrangementLane.tsx`, so it is not fixed early.
- **D-29z307, C's notes:**
  - N2 (duplicate `PC10` id) → deferred Low `C-R231-N2-PC10-DUP`.
  - N1 and N4 → wording guidance for my future rows.
  - N7 → evidence on SABA-Q-NOTICE-ONE-ROW.
  - N3, N6 and N8 → info.
- **D-29z307, A's open items (L10):**
  - **R1 / N5** (the hint stays on the active lane during a drag over another lane): keep the rule as specified. The reviewer's "any drag active" owner is recorded as the signal `ARCH-A231-ANY-DRAG-ACTIVE`, not scheduled.
  - **R3:** the in-memory set is always written. That stands: the session stays consistent if storage later throws.
  - **R6:** focus to search on a mouse click stands, so focus never falls to `body` when the clicked button unmounts.
- **My error:** the round-231 task said Apply's `aria-describedby` resolves to the reason, but Apply has none (it uses `title`). The code is correct. I recorded it as `B-R230-APPLY-DESCRIBEDBY` (info). It is the second occurrence of lesson L29's class, so I added no new lesson.
- **Regression date:** `regression-last.json` stays at round 199. The next regression is due on or after 2026-10-30. Planning is on 2026-10-28, so round 232 is CALM-3. The SABA-B-8 key acceptance is added to the regression `scope_additions` (L6, D-29z311).

## 2. Round 232 design (what was decided and why)
| Item | Ruling | Evidence |
|---|---|---|
| Empty state (D-29z309) | Empty ⇔ `arrangement.clips.length === 0`. The root is transparent, and a 1 px `bg-outline` baseline **replaces** the outline overlay as child 0. The frame and playhead are `invisible` but stay mounted, so aria values keep updating. The bbox is unchanged. | Baseline: an empty project has extent 10 s, so the frame fills the whole box (the "empty frame" look). Scratch: baseline 956×1 / 796×1; ← still moves `aria-valuenow`. |
| Test pins kept by design | OV1's exact overlay literal stays byte-identical (rendered only when full); DXC4/PNR4 keep child 1 as the rows container; PNR4 keeps the `rounded-panel` count at 3; TH5 keeps the playhead tokens. | `b-round-231/l23-sweep-raw.log` |
| Hidden slot (D-29z309) | When hidden, a 64 px `aria-hidden` slot takes the Overview's place. | Baseline probe: the dock is 107 px, set by the 160×90 video box. Without a slot the caption row drops 68 px. Collapsing the row was not approved. |
| Key (D-29z309) | `code KeyO` + Alt + (Ctrl or Meta), no Shift, no AltGraph. Repeat and an active gesture are ignored. The existing sheet, export and typing early returns apply. Not in history. | Live 12 manual 42.1, re-fetched today. The AltGraph mutant is red in jsdom on the scratch. |
| Storage (D-29z309) | One key per browser (`czaba-studio-overview-hidden`, removed when shown). Same `useSyncExternalStore` pattern as `library-notice.ts`; the server snapshot is "shown". | Scratch: reload keeps it hidden; showing removes the key. |
| Focus (D-29z309) | Focus is not moved by code. The next Tab goes to `arrangement-video-expand`, and the status announces the change. This is the smallest honest behaviour; I did not invent a focus target. C reports a Low if a browser loses the place. | Scratch probe `tabAfterHide`. |
| Feedback (D-29z309) | A one-time status: "Overview hidden. Ctrl+Alt+O shows it again." / "Overview shown. Ctrl+Alt+O hides it.". There is no visible button, which Saba did not approve. | L39: no persistent text added. |
| GATE229-S2/S4 (D-29z310) | The dock l.889 change is class-only. The caption-height row includes an ≥ 80-character file name at 1280. | `gates/round-229/review.md` |
| L23 (D-29z311) | 121-file sweep: 3 files / 4 tests red, all granted. After the fixes: 122 files / 1,789 green, `tsc` 0, Biome clean. | `l23-*.log`, `precheck-*.py`, `precheck-scratch.diff` |
| Reference | Live 12 6.1 and 42.1 (WebFetch, 2026-10-28). No reference for the empty look; persistence not confirmed. Deviations D1–D6 are listed in the task. | task §3 |

**Scope check:** nothing in Saba's decision 3 is shrunk or deferred. The three items (quiet empty state, Ctrl+Alt+O, remembered and listed in the sheet) are all in round 232. The "not approved" item (dock-row collapse) is left out, as the policy says.

## 3. Method notes (honest record)
- **Scratch location:** my first scratch copy was briefly created inside `b-round-231/` (165 MB of tracked-file copies). I moved it to `/tmp/b231-scratch` within a minute, before any further writes. Root never saw it in the loop folder. `ls b-round-231/` was checked afterwards.
- **Scratch server:** port 5174, started from `/tmp/b231-scratch` and stopped after the probe. The :5173 server stayed up (200).
- **Mutant restore:** one scratch mutant (the AltGraph guard) was restored from a backup and checked with `diff -q`.
- **`store/`:** never written. At the end: HEAD `e5507ff`, empty status, and the frozen, grant and root lists all give rc 0.

**Amendment after the advisor review:**
- N2's required `afterEach` (`setOverviewHidden(false)`) sets the module's in-memory value, so a later "preset storage, mount hidden" case could never pass in that file. OV-T3 now lives in its own file, N4 `overview-visibility-persist-ui.test.tsx`. Vitest isolates module state per file.
- B verified N4 on the scratch: its sketch passes, and MU-4 turns it red.
- The new-files list now has N1–N4, and the covering set has 32 files.
- D4 now marks "Live gives the space back" as an inference.
- The `patch -p0 --dry-run` of the reference diff gives rc 0 and is cited.

## 4. Architecture signals and checkpoints
- **New signal:** `ARCH-A231-ANY-DRAG-ACTIVE` (A round 231 reviewer). Not scheduled.
- **New request:** `b-round-231-checkpoint-request.md` (D-29z312). It is filed at the SABA-B-8 feature boundary, and root runs it after C round 232 passes. It covers:
  - the two storage helpers;
  - the growing `StudioWorkspace` keydown handler (GATE228-S2/S4);
  - the any-drag-active proposal.

  It is non-blocking.
- **Still pending:** `b-round-229-checkpoint-request.md` (wanted before SABA-B-7), and the `-211`, `-221` and `-225` requests.

## 5. Ready for commit?
Round 231 is already published (`e5507ff`). Round 232 is dispatched, so nothing from `store/` is ready yet. The loop state is ready for root's loop-state commit: `tasks/round-231.md`, `current-task.md`, backlog v217, `feature-status.md`, the checkpoint request and `b-round-231/`.

## 6. For Saba (via root)
- `SABA-Q-NOTICE-ONE-ROW` now has C's measurement: the notice fits on one row when the library is 56 px wider.
- `screen-review-230.md` and its addendum are still awaiting his answers.
- After CALM-3, SABA-B-8 is complete. His decision 3 deliberately did not approve collapsing the dock row when there is no video (D4 in the task): hiding the Overview makes the screen calmer but does not free space.

## 7. Next after round 232
- **C PASS and gate PASS:** SABA-B-8 is complete.
  - If round-233 planning is on or after 2026-10-30: **REGRESSION** first.
  - Otherwise **SABA-B-7-ENVELOPE-DB**.
  - Then SYS-5, then PERF b-ii.
- **C FAIL:** a fix-up on the same grants.
