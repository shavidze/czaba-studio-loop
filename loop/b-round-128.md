# B — Round 128 result and Round 129 plan (D-29z94)

Date: 2026-10-24 (planning from ~07:00 UTC) · Author: B · Advisor: available; consulted after orientation, before writing, and again before finishing.

## 1. Inputs read
- **Context and reports:** `context/active-summary.md` (head only); `current-task.md` (round 128), archived as `tasks/round-128.md` (`cmp` OK, 23320 bytes; no earlier archive existed); `a-round-128.md`; `c-round-128.md` and `c-round-128.json`; `gates/gate-round-128.json` and `gates/round-128/review.md`; `env-status.json`; `regression-last.json`.
- **Gate 128: `published`, commit `77f2763b5e968d7f09683637602668e4a710501d`** (rounds 123–128, both remotes). It is the baseline for round 129. The store tree was clean at planning.
- **Decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist. No new root follow-up in `root-pre-push-review.md` / `publication-checkpoint.json` (unchanged since round 127 planning).
- **Opened for specific facts only:** `backlog.json` (VISUAL-A `v0_plan_d29z92`, findings, Lows, signals); `plan.md` (D-29z93 block, round table); store, read-only: `strings.ts`, `strings.test.ts` (ST1–ST5), `ArrangementContext.tsx` l.170–205, 540–550, 1762–2060, the shortcut handler in `StudioWorkspace.tsx`, and exact greps over the tests.
- **Backups:** `b-round-128-{current-task.md,b-next.json,feature-status.md,backlog.json,plan.md,regression-last.json}-before`.

## 2. Round 128 result (independent C evidence)
- **C: PASS**, `browserVerified` and `realVerified` true; 9 rows passed, 0 failed.
  - EX-KEYS: `Close` = 1 (the ✕), `Done` = 1 (the footer). Names are unique when idle, during a render, after it finishes and after a cancel, at 1440 and 1280. Focus, Tab, Escape and hold-Enter are as in round 127.
  - EX-COPY: W1–W4 exact. EX-LAYOUT: only `Done` changed, by −2 px. REG-WAV: 7217877 frames. G128-3: 401; fake-Bearer 403 BLOCKED (backend unavailable in cloud).
  - Inconclusive (not claimed): six messages that cannot be reached in the browser; ST1/ST2 cover them.
- **Backlog updates from this evidence:** V-0.1 → `c_pass_published` (feature-status: **მზადაა**); C-R127-01 closed; C-R127-L1 a–d closed; GATE103-S2 → done.
- **Deferred Lows (now 176):** C-R128-L1 (✕ half clipped at 1280 after a range export, pre-existing), GATE128-S2 (`Done` after an error), GATE128-S4 (tests build expected text with `split`), C-R128-OBS-RENDER-FOCUS (C note 5; focus on the dialog container during a render, observation only).
- **Gate reviewer Medium (GATE128-S1): the Studio is mixed-language until V-0 finishes.** This is a scheduling note, not a defect: V-0 continues now.

## 3. Rulings (D-29z94)
- **R1 — V-0.2 is split into a/b/c, scope unchanged.** Measured: the Context still has 85 Georgian lines, and with the helpers they are asserted in about 46 test files. That is too many for one checkable round. **V-0.2a (round 129)** covers the eight edit commands (l.1766–2056) and the six constants only they use. An exact grep finds 8 dependent tests (the fragment scan over-matched common words such as `არ არის`). V-0.2b = playback, library add/drop, loop, move/nudge. V-0.2c = video import and the helper modules.
- **R2 — Exact English map E1–E42 in the task**, so A does not invent copy. Terms are reused from the Live 12 manual capture (§6.11 "Using the …Time Commands", §6.12 "Splitting Clips"; `b-round-71`, 2026-10-21). Plurals are chosen by the formatter (1 vs n), as `overloadWarning` does.
- **R3 — Track names stay Georgian this round** (V-0.4/V-0.5). C subtracts them from the Georgian count. Moving them now would change lane widths (RV-1) and many unrelated tests.
- **R4 — Conditional copy stays in the Context.** Formatters take only finished strings and numbers (leaf rule). The formatter question is ruled before V-0.3.
- **R5 — X1:** `invalidRangeNoFile` → "The time selection is invalid — no file was created." This is reviewer Low (d) from round 128. The module is already owned and the cost is one value.
- **R6 — Tests:** strings.test gains ST6–ST9 (exact literals, plural samples at 1 and 3, no Georgian, a Context slice guard between `splitSelection` and `restoreHistory`). The 8 tests switch literal → module reference with the same matcher. Mutation m4 swaps one message in the Context, which proves the UI tests still bind the right message.
- **R7 — Freeze:** `b-round-128-r129-tree-sha256.txt` (929 entries; tracked and untracked minus the 11 existing grants; OK at planning). Start hashes and start copies of the grants are saved. Doc 105 is a new file.

## 4. Architecture signals (recorded; not scheduled)
- ARCH-R128-TITLES-EMBED-VISIBLE-WORDS (A's reviewer note), GATE128-S5-ALIAS-CONSTANTS (gate nit).
- **Checkpoint:** `ArrangementContext.tsx` (3765 lines) is edited, string-only, by every V-0.2 stage. The checkpoint question (strings module shape, conditional copy, Context size) was already requested in `b-round-124-checkpoint-request.md` Q1 and still has no answer. B will restate it to root when V-0.2c closes, before V-0.3. This does not block V-0.2.

## 5. Round 129 summary
- **A owns 12 files:** `strings.ts`, `strings.test.ts`, `ArrangementContext.tsx` (string-only, in the named ranges), 8 tests (literal → module only), and the new doc 105. Protected auth files and `Modal.tsx` are unchanged.
- **C** checks in the real browser at 1440×900 and 1280×720. It reads each command's status text and its effect (EDIT-COPY), checks the Undo titles and that Undo reverts (UNDO-LABEL), checks layout outside the status region, re-checks the Export copy once, and runs G129-3 last and PX-NET.
- **Outcome fixed in advance:** on or after 2026-10-27, the regression round comes first. C FAIL Medium+ → a bounded fix-up. C PASS → V-0.2b.

## 6. Decision
**CONTINUE.**
- **Not COMPLETE:** V-0.2a…V-0.5, V-1…V-3, M1/M3/M4, T12-ADVANCED, 176 deferred Lows, the Tech Lead manual checks, SRW-21 (`deferred_user`), PROD-SSR-NUL and PROD-MP3, the final regression, and Saba's answers on ABL-R/DUX-R.
- **Not BLOCKED:** nothing external is missing.
- **Commit readiness:** none this round. V-0.2a becomes publishable after C PASS in round 129.
