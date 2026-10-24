# B — Round 127 result and Round 128 plan (D-29z93)

Date: 2026-10-24 (planning from ~06:15 UTC) · Author: B · Advisor: available. I consulted it after orientation and before writing anything, and again before finishing.

## 1. Inputs read
- **Context and reports:**
  - `context/active-summary.md`;
  - `current-task.md` (round 127), now archived as `tasks/round-127.md` (`cmp` OK, 26991 bytes);
  - `a-round-127.md`, `c-round-127.md` and `c-round-127.json`;
  - `gates/gate-round-127.json`, `env-status.json` and `regression-last.json`.
- **Gate 127:** `skipped` ("C taskStatus FAIL"). It was not published, so **the baseline is still `608187f`**, plus the C-verified round-127 working tree (24 ` M` + 3 `??`). That tree is kept.
- **Decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist. Root files (`root-pre-push-review.md`, `publication-checkpoint.json`) add no new follow-up.
- **Opened for specific facts only** (the full backlog was not read):
  - `backlog.json`: VISUAL-A `v0_plan_d29z92`, `open_findings`, `deferred_low_polish` and `architecture_signals`;
  - `plan.md`: the D-29z92 block and the round table;
  - store, read-only: `Modal.tsx`, the dialog footer (l.540–590), `strings.ts`, and the test titles and selectors that mention `Close`.
- **Backups:** `b-round-127-{current-task,b-next,feature-status,backlog,plan,regression-last}-before.*`.

## 2. Round 127 result (independent C evidence)
- **C: FAIL.** `browserVerified` and `realVerified` are true, and every browser row that can run here was run.
- **The only failure is C-R127-01 (Medium)**, which equals A's P1.
  - The frozen Modal ✕ has `aria-label="Close"`, and the footer text is now `Close` too, so one dialog has 2 buttons named "Close".
  - During a render the footer one is disabled and the ✕ is enabled.
  - 15 granted tests are red. In C's run: 28 files, 353 tests, 15 failed.
- **Passed in the browser:**
  - EX-EN-IDLE / RUN / RANGE / MP3 / CANCEL / MUTE / EMPTY / VIDEO. The Georgian count is 0 everywhere; only `source.audioNote` (V-0.2) was subtracted.
  - Export output is unchanged: 7217877 frames, the range is 192000 frames, the muted WAV has peak 0, and MP3 and WAV + MP3 came through the real CDN.
  - EX-LAYOUT: only the footer widths changed, and that is attributable to the text. The 1280 overlap is 13 / 45 px, equal to F-2.
  - G127-3 (401, "Sign in required"; fake-Bearer 403 blocked: backend unavailable in cloud) and PX-NET.
- **Inconclusive:** `Decoding — please wait` could not be reached, so it is covered by jsdom only. Not claimed.
- **Backlog updates, all from this evidence:**
  - V-0.1 → `c_fail_round127_fixup_round128` (feature-status: **ბაგია**). It is **not** done: the browser half passed, but the tests and the a11y row did not.
  - C-R127-01 → `open_findings` (Medium, scheduled round 128).
  - C-R127-L1 → parts a–d go into round 128; parts e–f go to `deferred_low_polish` (now 172).
  - GATE103-S2 → "fixed in tree, awaits C PASS and publish". It is not done.

## 3. Rulings (D-29z93)
- **R1 — P1 → option 1: the footer button becomes `Done`.**
  - It removes the duplicate in the product, which C asked for, and it changes one module value. No query changes are needed, because the queries read `studioExportStrings.closeButton`.
  - Option 2 (an `aria-label`) breaks label-in-name (WCAG 2.5.3) and risks silent matches.
  - Option 3 touches the frozen, shared `Modal.tsx` and the e2e selectors. It is recorded as signal `ARCH-R127-MODAL-CLOSE-LABEL`.
  - Option 4 leaves the bug in the product.
  - **The key `closeButton` stays.** It names the action, and renaming it would touch 35 references in 13 files.
  - **Rationale (an uncertain UI contract, so the smallest honest choice):** the button only dismisses the dialog. `Done` is distinct from Close, Cancel and Export. B makes no Ableton claim about this label.
- **R2 — Wording Lows that live in the same owned module go in now** (the 2026-10-23 exception: the round owns the code and the cost is small).
  - W1 `in this cycle` → `in this version`.
  - W2 `is created` → `is exported`.
  - W3 lowercase `no file was created` after an em dash, in 8 keys.
  - W4 `range` → `time selection` in the done message.
  - The busy label needs phase logic, so it is deferred. The self-comparison tests are deferred too.
- **R3 — Tests.**
  - A new **HE8** in `export-dialog-hold-enter.test.tsx` asserts one accessible name per dialog button, idle and during a render. It is the only `it` added. It lives there because that file has the render-phase harness (`pendingRenders`); `export-dialog-a11y-copy` has none, so it stays frozen (the advisor flagged this before I finished).
  - Mutations: m5 sets `Close` (proves the bug is caught), m6 sets `Export WAV` (proves the check is general), and m7 restores the old wording.
  - The titles that name the footer button (about 20, in 7 files) change to `Done`, and only the title text changes. The stale `export-cancel.test` "exact Georgian messages" title is fixed in the same pass.
- **R4 — Freeze.** The new list `b-round-127-r128-tree-sha256.txt` has 930 entries and covers tracked **and untracked** files.
  - In round 127 the untracked `strings.ts` was outside the frozen list, so a leftover `Closee` mutation went unseen.
  - Start hashes and start copies of the 10 grants are saved in `b-round-127-r128-granted-start-sha256.txt` and `b-round-127/r128-granted-start/`, so C can diff exactly.
- **R5 — C scope.** C re-runs only what changed: T128-TARGETED, SOURCE-SCOPE, AN-REVIEW, EX-KEYS (name counts), EX-COPY (one browser state per W key where reachable; the unreachable keys are inconclusive), the EX-LAYOUT footer, one REG-WAV, G128-3, and PX-NET.

## 4. Architecture signals (recorded; not scheduled)
- **ARCH-R127-STRINGS-MODULE-GROWTH** (A's reviewer note):
  - Keep the leaf module, and re-check the dependency direction when V-0.2 adds sibling objects.
  - Before V-0.3, B rules on conditional copy in formatters and on a file split.
  - This is the V-0 feature boundary. **B will ask root for a bounded frontend-architect checkpoint** on this question when V-0.2 closes, unless root answers `b-round-124-checkpoint-request.md` Q1 first. It does not block V-0.2.
- **ARCH-R127-MODAL-CLOSE-LABEL:** the shared Modal ✕ label is hard-coded.

## 5. Round 128 summary
- **A owns 10 files:**
  - `strings.ts`: the W0–W4 values only;
  - `strings.test.ts`: their literals;
  - `export-dialog-hold-enter.test.tsx`: +HE8 and its titles;
  - 6 more test files, title text only;
  - doc 104.
- Everything else is frozen, including all six round-127 source files and `Modal.tsx`. The protected auth files are unchanged.
- **C** checks in the real browser at 1440×900 and 1280×720. The key check: `Close` = 1 (the ✕) and `Done` = 1 (the footer), with no duplicate names, idle and during a render. The four wording states are checked too.
- **Outcome fixed in advance (§8):**
  - on or after 2026-10-27 → the regression round first;
  - FAIL Medium+ → another bounded fix-up;
  - PASS → V-0.1 `c_pass`, then V-0.2.

## 6. Decision
**CONTINUE.**
- **Not COMPLETE:** V-0.1 (open Medium), V-0.2…V-0.5, V-1…V-3, M1/M3/M4, T12-ADVANCED, 172 deferred Lows, the Tech Lead checks, SRW-21 (`deferred_user`), PROD-SSR-NUL and PROD-MP3, the final regression, and Saba's answers on ABL-R/DUX-R.
- **Not BLOCKED:** nothing external is missing.
- **Commit readiness:** none this round. V-0.1 (rounds 127 + 128) becomes publishable as one interim unit after C PASS in round 128.
