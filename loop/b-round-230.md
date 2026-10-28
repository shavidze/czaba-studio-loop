# B — Round 230 → 231 planning (2026-10-28)

**Decision: CONTINUE.** Round 231 = SABA-B-8 CALM-2b (the final stage of CALM-2) + RT-FIX-231. Task: `current-task.md`; the round-230 task is archived at `tasks/round-230.md`. Decisions D-29z299…D-29z305. Advisor consulted before the plan and before handover.

## 1. Round 230 result (evidence, not claims)
| Source | Result |
|---|---|
| `a-round-230.md` | No change (RETRO). HEAD `5da0f50`, empty status, frozen rc 0. Lesson feedback: amended L26 is not satisfiable (`## Prompt`). |
| `c-round-230.json` | taskStatus **FAIL**. `browserVerified` true, `realVerified` true. **PASS:** SOURCE-SCOPE, RT-NUM, RT-CAUSE, RT-IDS, RT-SABA, RT-SCREEN, G230-3, STUDIO-SMOKE-230. **FAIL:** RT-LESSONS (C-R230-01, Low). Notes N1–N5. |
| `gates/gate-round-230.json` | `skipped` ("C taskStatus FAIL"). Nothing to publish from `store/`; the baseline stays `5da0f50`. |
| `root-pre-push-review.md`, `publication-checkpoint.json` | Dated 2026-10-07; nothing new for this round. |

**Rulings:**
- **C-R230-01 (D-29z299):** accepted. A and C independently found the same defect. I reworded L26: the seven TEMPLATE headings after `## Prompt`, as an in-order subsequence, with extra headings allowed. I restored the final newline (N2).
  - Checkability: `b-round-230/l26-check.py` → 171 of 175 quarter-IV docs pass. The 4 that fail (005, 006, 009, 076) predate the rule.
  - The diff against `b-round-230/lessons-before-231.md` is limited to the header line, L26 and the final newline.
- **N3/N4 (D-29z300):** fixed by an addendum appended to `user-review/screen-review-230.md`. I did not rewrite it, because it was already notified at 16:22Z. The addendum cites `calm-studio-review.md` l.44, l.46, l.50 and l.152, which I verified with `sed`. It also says how CALM-2b touches SR-230-10.
- **N1:** left as is (the count is correct; wording only). **N5:** environment only.
- **RETRO 230:** done except RT-FIX-231. Per `tasks/round-230.md` §4, round 231 still runs as planned. The planning date 2026-10-28 is before 2026-10-30, so the next round is CALM-2b, not REGRESSION. `regression-last.json` is unchanged (round 199, due on or after 2026-10-30).
- **Backlog:** I updated it only from this evidence. Version 215 → 216. Round 230 is `c_fail_rt_lessons_only`. `retro_runs[2]` is done except RT-FIX-231. New findings: C-R230-01 (fixed at planning, re-check pending), C-N230-NOTES and SABA-Q-NOTICE-ONE-ROW. The SABA-B-8 stages are updated (CALM-2a done, CALM-2b dispatched). GATE229-S3, GATE229-S5 and B-R229-DOC170-STATUS are dispatched. Script: `b-round-230/update-backlog.py`; before copy: `b-round-230/backlog-before-231.json`.

## 2. Round 231 design (what was decided and why)
| Item | Ruling | Evidence |
|---|---|---|
| Detail empty state (D-29z301) | The header label is `''` and the body hint is the one line. The two none-state reasons stay in the DOM as `sr-only`, so they remain the `aria-describedby` targets. `nothingSelected` is deleted. | `probe/scratch.json`: 1440 S0 detail rows 4 → 1; RF3 stays green unchanged |
| Field geometry (D-29z302) | Fields ±1 px. Apply h 18 → 24 at 1280 expanded (the baseline squeezed it). | `probe/baseline.json` vs `probe/scratch.json`; `bbox/delta.txt` |
| Notice (D-29z301) | Saba's exact wording is 291 px; the box is 264 px (236 px beside the X). It shows as one sentence on 2 rows (was 3). `SABA-Q-NOTICE-ONE-ROW` → awaiting_user. | `probe-notice-width.mjs` |
| Dismiss (D-29z301) | Key `czaba-studio-notice-dismissed:<collection.id>`. `useSyncExternalStore` with server snapshot "visible" (the route is SSR). In-memory fallback. Focus moves to search. | scratch: 0 layout-shift entries after reload; fresh context shows it again |
| First-run status (D-29z301) | Demo and purchased, one pattern; teaches drag, Enter and `?`. | Recipes run on the scratch in the browser: Enter adds to Music; drag adds to SFX |
| Lane hint (D-29z301) | `!isVideo && isActive && !folded && clips.length === 0 && no drag`. Project-level "before the first clip"; it returns after Undo to 0 clips (an empty-state line). | scratch: the hint follows Stems; 0 with Video active; back after Undo |
| L31 (D-29z303) | No new rows in library-row-strings-ui: LRS4 was 35 % at gate 229 but 60 % in B's loaded sweep. New file `library-notice-ui.test.tsx`. | `gates/round-229/verify.log`; `l23-sweep-raw.log` |
| L28 (D-29z304) | Docs 170 and 178 are granted; doc 176 is tied to the open PERF-HARNESS-SHARED-LIB-b-ii stage; doc 179 is `Completed (C round 231 PASS)`. | `grep -rn 'In Progress (stage' docs/implementation` at `5da0f50` |
| L23 | Sweep: 8 files / 19 tests red, all pinned copy. After the fixes, 19 files are green, and `tsc` and Biome are clean. | `l23-sweep-raw.log`, `l23-precheck-fixed.log`, `precheck-*.py`, `precheck-scratch.diff` |
| Reference first | Live 12 4.10 (drag into tracks; Enter loads onto the selected track) and 6.1 item 12 (drop area). A "Drop Files and Devices Here" label is only a 2009 forum hypothesis. No reference for a dismissible notice or a detail empty state. | §3 of the task |

**Scope check:** nothing in Saba's decision 2 is shrunk or deferred. CALM-2 = 2a (done) + 2b (this round). The one place where the literal request cannot be met as stated ("one line" for the exact wording at the default width) is measured, shipped with the exact wording, and raised to Saba as a question.

## 3. Incident (honest record)
My first copy of C's `c-round-229/bbox-after.mjs` kept its hard-coded output folder. Three runs rewrote `c-round-229/after-full-S0-1280x720.png` and `after-full-S0-1440x900.png` (3–4 bytes each), and the two JSON files came out byte-identical.
- I restored both PNGs with `git checkout --` in the loop repository. `git status -- c-round-229/` is clean.
- I fixed my copy (`b-round-230/bbox/bbox.mjs`, output folder from argv) and re-ran it into `b-round-230/bbox/`.
- No `store/` file was touched: HEAD `5da0f50`, empty status, frozen list rc 0 at the end.

## 4. Architecture signals and checkpoints
- No new Architecture note this round (no A/C code round).
- The pending root requests stay non-blocking: `b-round-229-checkpoint-request.md` (wanted before SABA-B-7), and the `b-round-211`, `-221` and `-225` requests.
- `ArrangementLibrary.tsx` gains a second `useSyncExternalStore` source, and `library-notice.ts` introduces the Studio's first browser storage. This is not a structural risk on one owner yet. I will consider it in the CALM-3 / SABA-B-7 boundary checkpoint if storage spreads (CALM-3 adds the Overview toggle storage).

## 5. Ready for commit?
Nothing from `store/` to publish for round 230. The loop state (lessons, screen-review addendum, backlog v216, feature-status, task) is ready for root's loop-state commit.

## 6. For Saba (via root)
- `SABA-Q-NOTICE-ONE-ROW`: keep the 2-row exact wording, shorten it (e.g. "Synthetic demo stems — not CZABA audio."), or widen the default library.
- The `screen-review-230.md` addendum (N3/N4).
