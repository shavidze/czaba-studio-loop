# B — round 257 → 258 planning (D-29z499 … D-29z506)

Planned 2026-10-30 from 00:10 UTC. The baseline is HEAD `d732d26` with a clean tree (gate 257 `published`). **The next task is round 258, REGRESSION-ROUND-2026-10-30** (`current-task.md`). The previous task is archived as `tasks/round-257.md` (`cmp` equal to the round-257 `current-task.md`). Backups of every artifact B edits are in `b-round-257/*-before-258`.

## 1. Evidence accepted (C round 257)
- **C's verdict:** `c-round-257.json` is PASS, with `browserVerified=true` and `realVerified=true`.
  - 13 rows passed and there are 0 bugs.
  - Purchased origin is BLOCKED (backend unavailable in cloud), and the gate rows are not claimed.
  - Evidence: `c-round-257/browser/c257.json`, plus the mutants M6/M8 that turn tests red.
- **Gate 257:** `published`, commit `d732d26` on both remotes. The reviewer said "COMMIT: OK".
- **Backlog changes:**
  - Closed: C-R256-01 (Medium), C-R256-02 (Low) and B-R249-PAUSE-LABEL (Low).
  - SABA-B-9 stage 1 → done.
  - `rounds[257]` → done.
- **Info rows C-I257-01/02/04/05:** recorded as `C-I257-OBS`. C-I257-04 (the outline computes to 1 px in Chromium 143) matches L9.

## 2. Why REGRESSION now, and the gate-257 Medium (D-29z499, D-29z500)
- **The regression is due.** `regression-last.json` = 2026-10-27, so it falls due on 2026-10-30, today. Round 257 §7 fixed this order in advance.
- **The gate-257 reviewer's Suggestion 1 needed a ruling first.** The reviewer marked it Medium unless the Studio is desktop-only.
  - **B's probe at `d732d26`** (leaf elements, not only buttons: `b-round-257/probe/narrow2.json`):
    - no overlap at 1024, 900 or 870;
    - Delete × Zoom overlaps by 1 px at 864, 41 px at 800 and up to 48 px at 768 (`narrow-768.png`).
  - My first probe compared buttons only and reported 0. The advisor caught that, so the leaf probe replaces it.
  - **Ruling: Low.**
    - The project's own floor is 1024 px: `MobileBlocker` on the purchased Studio route says "Studio is Desktop-Only".
    - The required viewports are 1280 and 1440.
    - TL-Q-VIEWPORT is open, and the precedent is C-R41-01 (Low at 1024).
  - **Where it goes:**
    - recorded as **GATE257-NARROW-TOOLBAR-OVERLAP** (`deferred_low_polish`, regression since round 256);
    - added to TL-Q-VIEWPORT;
    - C observation RP-NARROW in round 258;
    - a cheap fold-in candidate for SABA-B-9 stage 2.
  - A new overlap at ≥ 1024 px would be Medium.
  - **The alternative I rejected:** a fix-up first, then the regression. The reviewer's Medium was conditional, and the condition (a desktop floor) holds.
- **Lesson L53 added** (lessons.md is now 59 lines): a change from wrapping to a non-wrapping or grid layout gets one probe below the required viewports.

## 3. Scope additions → rows (L6)
SA-n is index n (0-based) of `regression_rounds[2].scope_additions`.

| SA | Row in round 258 |
|---|---|
| 0 | RS-4B |
| 1 | RV-SABA-1-2 (selector) |
| 2, 4, 5 | RR-MP3 |
| 3 | RR-OSS |
| 6 | RR-LEGACY |
| 7 | RR-PERF |
| 8, 9, 10 | RR-SHEET |
| 10, 11 | RR-OVERVIEW |
| 12 | RR-TEMPO (adapted for 11b) |
| 13, 14 | RR-STRIP (lower zone adapted for 10a) |
| 15, 16 | RR-SEEDRACE |
| 17, 18, 19 | RR-ADAPT |
| 20, 21 | RR-MENU |
| 22–25 | RR-FOCUS-ORIGINS |
| 26, 28 | RR-HIDDEN-SNAP (28 is record only) |
| 27, 29–37, 39 | RR-MARKER |
| 38, 40 | RR-BLINK |
| 40, 41 | RR-SHEET (C-SHEET-256 replaces 255, D-29z502) |
| 41, 42 | RR-TRANSPORT |

**Not in `scope_additions`, added as rows:**
- RR-CURSOR (SABA-B-6, round 207);
- RR-FADER (PERF-FADER, rounds 209–213);
- RS-HIDDEN (round 204);
- RS-LM (round 205).

SYS-1…3 are still queued, not done, so they have no rows. SYS-4 is a docs-only item with no browser behaviour.

**Phase-1 rows adapted** (§3 of the task): RG-01, RG-03, RG-04, RG-05, RG-10, RG-12, RG-14, RG-15, RG-16 and RG-20.
- The changes come from Play/Stop (SABA-B-9), the insert-marker model (10a), the adaptive grid (11b), CALM-2 and the MP3 path (PERF-16).
- **Run by B at `d732d26`** (`b-round-257/probe/recipes2.json`, L29):
  - fresh state: 0 clips, BPM empty, Snap off, `1 s`;
  - a ruler click at 2 → m 2.000 / ph 2, not playing;
  - Space → plays from 2;
  - Space, Space → restarts at 2.159 ≈ 2 + start lead;
  - Shift+Space → continues (2.411);
  - Home → 0;
  - a handle drag 0 → 6 → m 6.000, ph 6;
  - Space on an empty project → `Nothing to play — add a clip from the library first.`
- **Not run by B:** the "clear the range by an empty-lane click, then Space" step of RG-04. L29 already records the empty-lane click as clearing a range (C-N229-S3-METHOD). C reports it as a lookup if the recipe needs adapting.

**OBS-R199-LEDGER is ruled** (D-29z501): RV-EN excludes the demo sound-title ledger.

## 4. Gate-257 review triage
| # | Finding | Severity | Ruling |
|---|---|---|---|
| 1 | Narrow toolbar overlap | Low | GATE257-NARROW-TOOLBAR-OVERLAP, D-29z500 |
| 2 | Tab order differs from the visual order below 1408 px | — | Saba question SABA-Q-9-TRANSPORT (g), D-29z503 (L43/L44). Default: keep the DOM order |
| 3 | `kbd` around "Double-click Stop" | Low | GATE257-KBD-GESTURE |
| 4 | Lookup by index in a test | Low | GATE257-INDEX-LOOKUP |
| 5 | Doc 193 out of date (+ C-I257-03) | Low | GATE257-DOC193-TC. l.93 is stale; fix it in the stage-2 doc edit. "Six" vs "five" are different scopes, so no change. The approach bullet gets one clause |
| 6 | Inline Export handler | Low | GATE257-EXPORT-INLINE-HANDLER |
| Arch | Toolbar churn (Signal 3) and the a11y contract spread over many files | — | Recorded as signals; question 7 in `b-round-257-checkpoint-addendum.md` (D-29z505). Non-blocking, not scheduled |

- Rows 3, 4 and 6 are `deferred_low_polish`. Each is a fold-in candidate for SABA-B-9 stage 2, if that round grants the file.
- **A frontend-architect checkpoint is requested from root** at this feature boundary: `ArrangementTransport.tsx` is a repeat owner of signals. It is non-blocking.

## 5. Saba and user-review inputs
- `user-review/AGREE-SABA-B-7.md` is still `awaiting_user` (l.4), so SABA-B-7 stays blocked on Saba.
- `ableton-decisions.md` and `design-ux-decisions.md` are unchanged; they were recorded in earlier plannings.
- `direction-decision.md` exists. STORE stays paused behind STUDIO-PERFORMANCE (D-29z172).
- No new `AGREE-*` note is needed, because this round adds no new feature.

## 6. Queue after round 258 (unchanged order)
1. Round 259: SABA-B-9 stage 2 (master to the bottom-right), or a fix-up first if round 258 finds Medium+.
2. Round 260: RETRO.
3. SABA-B-11c, after the `ableton-arrangement-expert` consult on the off-grid offset.
4. SABA-B-7 when Saba answers.
5. SYS-5, then STUDIO-PERFORMANCE b-ii onwards.
6. STORE-REDESIGN 2b…5.
7. REVIEW-RECOMMENDATIONS.
8. T12-ADVANCED.
9. PHASE2-VIDEO-SCORING (awaiting user go-ahead; skip rule).
10. PHASE2B-SPOTTING.
11. STUDIO-AGENT-COMMANDS.
12. RECORDING-META-S1.

**Also remaining:**
- SYS-1…3;
- the 430 `deferred_low_polish` entries;
- ROOT-RECON-*;
- SRW-21 (`deferred_user`);
- the Tech Lead manual checks.

## 7. Consults and availability
- **advisor:** available and used once, before writing. It caught the button-only overlap probe and the severity discriminator, and advised adapting the regression rows explicitly.
- **Project agents:** none consulted. No new feature behaviour is planned, so there was no Ableton reverse-engineering need. The architecture question goes to root.
- **WebSearch/WebFetch:** not used, because there is no new reference behaviour.

## 8. Commit readiness
Nothing new to commit from B. Round 257 is already published (`d732d26`). After round 258 passes, the gate records a loop-state commit only (no source change).
