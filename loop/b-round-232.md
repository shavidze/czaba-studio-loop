# B — Round 232 → 233 planning (2026-10-28)

**Decision: CONTINUE.** Round 233 is a bug-fix round with two CALM-3 follow-ups:
- **GATE232-S1 (Medium):** hiding the focused Overview drops focus to `body`.
- **C-R232-01 (Low):** a render-budget test runs at 56 % of its timeout at the gate.

The task is in `current-task.md`. The round-232 task is archived at `tasks/round-232.md` (a new copy; nothing was overwritten). Decisions: D-29z313…D-29z320. The advisor was consulted before the plan.

## 1. Round 232 result (evidence, not claims)
| Source | Result |
|---|---|
| `c-round-232.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 18 rows passed, 0 failed. Blocked: TLM-R232-MAC (needs a Mac) and the D5 AltGr check (jsdom only, not a §5 row). Gate rows not claimed. One info/Low finding: C-R232-01. |
| `a-round-232.md` | Implemented within the grants: 12 files, 541/541 covering tests. An L32 STOP on the frozen render-budget test (pre-existing load). |
| `gates/gate-round-232.json` | `published`, commit `bd71144292b1e82e5f0c8934f23bd28ecef0ae3c` on both remotes. **That commit is the round-233 baseline.** |
| `gates/round-232/review.md` | 8.5/10, no critical issues. Two Mediums (S1 focus to body; S2 AltGr on Windows), Lows S3–S6, nit S7, and two Architecture notes. |
| `store/` at planning | HEAD `bd71144`; `git status` empty (`b-round-232/git-status-at-planning.txt`). |

**Rulings.** Backlog v217 → v218. Script: `b-round-232/update-backlog.py` and `-2.py`. Before-copy: `b-round-232/backlog-before-233.json`.
- **D-29z313:** CALM-3 is done (C PASS with browser). SABA-B-8 is **not** marked მზადაა yet: gate 232 found a Medium on CALM-3. Under the bug gate, a Medium is fixed before new scope.
- **D-29z314:** GATE232-S1 is accepted as Medium.
  - **My error:** the round-232 rule "focus is not moved by code" (D-29z309) was wrong. C measured BODY, and my own baseline probe confirms it (`b-round-232/probe/focus.json`).
  - **Fix:** focus moves to the next Tab stop in the dock: `arrangement-video-expand` when docked, `arrangement-video-placeholder-return` when the video floats.
  - **Rejected:** the reviewer's timeline scroller. It has no `tabIndex`, so `.focus()` does nothing.
- **D-29z315:** A's L32 STOP and C-R232-01 are ruled together. Gate 232 itself measured 2,806 ms (56 %). l.377 now declares `15000`, the same as its sibling l.432. The assertion is unchanged.
- **D-29z316:** the other gate-232 findings.
  - **S2** → `open_tech_lead_manual` plus the new TLM-R232-ALTGR-WIN. It does not block (root clarification of 2026-10-23).
  - **S3** is closed by C-TOGGLE-PERSIST (0 flash frames).
  - **S4, S5, S6** → `deferred_low_polish`. S4's wrapper fix would change literals that frozen tests pin.
  - **S7** is info.
  - **C's notes:** N1 (baseline 1.15:1, decorative) is recorded for the next screen review; N2 is info; N3 is the same finding as S6.
- **D-29z317:** both gate-232 Architecture notes stay signals (GATE232-ARCH-CHORD-ACTION, GATE232-ARCH-STORE-DUP). They are appended to `b-round-231-checkpoint-request.md`, which is now **ready for root**.
- **D-29z318:** round 233 scope and next steps. The regression is not due (2026-10-28 is before 2026-10-30). Next is SABA-B-7, unless the regression is due by then.
- **D-29z319 (L42):** the Saba-approved **SABA-B-9/10/11** policy section had no backlog id.
  - It is now the queue entry `SABA-B-9-10-11-TRANSPORT-GRID`, placed after SABA-B-7-ENVELOPE-DB. Its six stages follow Saba's order (11a, 11b, 10a, 10b, 9, 11c), with his four decisions.
  - SYS-5 moves after it. Both stay before the next PERF task.
  - It also has a feature-status row.
  - This is the **second L42 occurrence** (B-R232-SABA-B-9-11-UNRECORDED, input for the next RETRO). I added no new lesson; L42 already covers it.

- **D-29z320 (after the advisor review):**
  - **Lesson L47** is added: a key or action that unmounts the focused element names its focus target, and BODY is never an expected value. C checks it in row C-LESSON-233. L42's evidence is now 2×. `lessons.md` is 53 lines.
  - **Deferred Low B-R232-DOC180-FOCUS-STALE:** doc 180 still describes the reversed focus rule. Doc 180 stays frozen this round; doc 181's TODO cites the id.
  - **OV-T6 step 1** should use the Play button. A user cannot send the chord from the search field.
  - **`youtube-request.json`** is filed for SABA-B-7 (5 queries). Root fetches the candidates; this is non-blocking.

## 2. Round 233 design
| Item | Ruling | Evidence |
|---|---|---|
| Focus target | The first enabled, tabbable `button` in `arrangement-video-dock` after the Overview in document order. Focus moves only when hiding, and only if focus was on the Overview. | Baseline Tab order, docked and floating (`probe/focus.json`). On the scratch build, `probe-fix/focus.json` and `focus2.json` show: expand or placeholder-return with `:focus-visible`; Tab → snap toggle; Shift+Tab → library separator; Play and `body` unchanged; 0 errors. |
| Test | OV-T6 in `overview-visibility-ui.test.tsx`. | MU-1 is red. MU-2 survives, so the filter is defensive and A must not claim a test for it. |
| Timeout | render-budget l.377 → `}, 15000);` | Gate 232 `verify.log` l.1370 |
| L23 | 3 grants plus doc 181. The scratch sketch gives `tsc` 0, Biome clean, and 32 files / 542 tests green. | `b-round-232/precheck-*.{diff,log}` |
| Reference | No Live reference (the Overview is not a focus stop in Live). Secondary: WCAG 2.4.3 and the APG. | task §3 |

**Scope check:** nothing is shrunk or deferred without authority.
- S2 waits only on a manual Windows check, under the root rule.
- S4–S6 are Lows, deferred under the 2026-10-23 bug gate.

## 3. SABA-B-7 preparation (so round 234 is not delayed)
I ran two read-only consults now. Both are saved as data:
- `b-round-232/saba-b-7-reference-docs-explorer.md`:
  - **Not found in the Live 12 manual:** the fader taper and how segments are interpolated.
  - **Confirmed:** the envelope's vertical axis is the "control value" (25.5); clip Gain/Volume envelopes are relative, with silence at the bottom (27.2.3); the clip Gain slider is calibrated in dB (8.4.7).
- `b-round-232/saba-b-7-reference-ableton-expert.md`:
  - a code map with file:line;
  - the tests that pin the linear behaviour;
  - two candidate tapers: A, dB-linear with a −60 dB floor, giving −15/−30/−45 dB; B, gain = p³, giving −7.5/−18.1/−36.1 dB;
  - a recommendation for short-ramp scheduling.

**Consequence for round 234:** Live's taper is unpublished, so CZABA must define its own taper function with a D-ID. C's 25/50/75 % row measures against that function, not against a "Live formula". Whether Live's clip modulation and its track Volume use the same scale is UNKNOWN. If it matters, it becomes a Saba question.

## 4. Ready for commit?
Round 232 is already published (`bd71144`). Round 233 is dispatched, so nothing in `store/` is ready yet.

The loop state is ready for root's loop-state commit:
- `tasks/round-232.md` and `current-task.md`;
- backlog v218 and `feature-status.md`;
- `b-next.json`;
- the checkpoint addendum;
- the round-233 grant and hash files;
- `b-round-232/`.

## 5. For root and Saba
- **Root:** run `b-round-231-checkpoint-request.md` (ARCH-CHECKPOINT-SABA-B-8-END, with the round-232 addendum). It is non-blocking.
- **Tech Lead:** TLM-R232-ALTGR-WIN (new) and TLM-R232-MAC.
- **Saba:** the questions already open (SABA-Q-NOTICE-ONE-ROW, SR-230-1…10, SABA-Q-CTRL-CMD-DISPLAY, which now also covers GATE232-S5).
- `root-pre-push-review.md` and `publication-checkpoint.json` are the October 7 originals and were triaged earlier, so they were not re-triaged.

## 6. Method notes
- **Scratch:** `/tmp/b232-scratch` (`git archive HEAD`, `node_modules` symlinked) and a dev server on port 5174, both outside the repo and the loop folder. The server is stopped.
- **Mutants:** applied to the scratch copy only and restored (`diff -q` checked).
- **`store/`:** never written. At the end, HEAD is `bd71144`, the status is empty, and `b-round-232-r233-tree-sha256.txt` gives rc 0.

## 7. Next after round 233
- **C PASS and gate PASS:** SABA-B-8 is complete. Then:
  - if round-234 planning is on or after 2026-10-30: **REGRESSION**;
  - otherwise **SABA-B-7-ENVELOPE-DB**;
  - then SABA-B-9/10/11 (from 11a), SYS-5 and PERF b-ii.
- **C FAIL:** a fix-up on the same grants.
