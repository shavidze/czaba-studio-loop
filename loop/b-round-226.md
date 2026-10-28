# B round 226 → 227 planning (2026-10-28)

**Decision: CONTINUE.** Round 227 is the **CALM-1a gate fix-up**: GATE226-B1, C-R226-02 and C-R226-03 (decisions D-29z272…D-29z277). It follows the rule "one round = at most three tightly related bugs".

The rounds after it:
- CALM-1b (228);
- CALM-2 (229);
- RETRO (230);
- CALM-3;
- then STUDIO-PERFORMANCE b-ii.

REGRESSION takes precedence on or after 2026-10-30.

## 1. Inputs read
- `context/active-summary.md` (headers, then lookup by id) and `lessons.md` (in full).
- `current-task.md`. It is archived as `tasks/round-226.md`, a new file: `cmp` OK, nothing deleted.
- `a-round-226.md`, `c-round-226.md` and `c-round-226.json`.
- `gates/gate-round-226.json` gives status **failed** ("verify exit 1"). `gates/round-226/verify.log`:
  - agents, lint and typecheck passed;
  - `test:run` had 1 failed test of 2972, in 1 of 205 files;
  - the build was not reached.
- Because the gate failed, nothing was published. The round-227 baseline is HEAD `80fbb3b` **plus the preserved round-226 working tree** (9 paths, identical to A's `changed-end-sha256.txt`, rc 0).
- `env-status.json` (round 226, store 200). `regression-last.json` = 2026-10-27, so REGRESSION is not due.
- `b-round-225.md`, `b-next.json`, and the backlog by id.
- Source, read-only:
  - the round-226 footer diff;
  - the failing case in `track-layout.test.tsx` (l.849–880);
  - `shortcuts.ts`;
  - `handleRulerDoubleClick` (SW l.1269–1275);
  - `strings.ts` (ruler title, waveform zoom label, footer button label);
  - the test hits for the footer testids.

## 2. Backlog: updated only from independent evidence (v212)
- **Round 226: `c_pass_gate_failed`.** CALM-1a is **bug (gate-blocked)**, not done and not მზადაა, even though C passed with `browserVerified` true. The gate is part of done.
- **New:**
  - GATE226-B1 (Medium, gate-blocking);
  - C-R226-02 and C-R226-03 (Low; fixed in round 227 because the round owns the file);
  - info A-R226-REVIEW-L7 and C-R226-OBS-KBD-BORDER.
- **Closed by ruling:** C-R226-01 (D-29z274; exception (d) is added, and C re-runs the row as C-BBOX-227).
- **Deferred:** C-R226-04 goes to `deferred_low_polish`, which now has 350 entries, with candidacy for CALM-1b (D-29z275).
- **Updated:** B-R225-BACK-TO-START-KEY now points to CALM-1b in round 228.
- **Signals (not scheduled):**
  - ARCH-A226-BLOCKING-DIALOG-REF;
  - ARCH-A226-PRODUCT-ROUTE-KEYS. This one involves the protected route, so it waits for SRW-21.

## 3. Rulings
- **D-29z273, the GATE226-B1 fix:** remove the two class-list pins and replace them with structure assertions: the same parent row as the footer "Keyboard shortcuts (?)" button. The new classes are **not** re-pinned (L8/L12), because CALM-2 and CALM-3 will touch the footer again. `StudioWorkspace.tsx` is not granted; the app DOM from round 226 stays.
- **D-29z274:**
  - C-R226-01 is accepted, because the 1280 lane-fit cascade is deterministic (`fitLaneHeights`).
  - A's D2 (12 px headings) is accepted, because the ≥ 12 px row wins (L4).
  - Doc 177 l.4 now names round 227 (L28).
- **D-29z275, C-R226-04:**
  - It is Low and pre-existing, and it sits in frozen `ArrangementRuler.tsx` and the SW release clause. The bug gate therefore defers it.
  - It is not buried: the sheet now advertises the affected keys, so its candidacy for CALM-1b is recorded. B decides at the round-228 planning, after a reference check on Live 12 keyboard focus after a ruler click.
- **D-29z276, the copy:**
  - `fit` keys → "Double-click the overview" and "Double-click the ruler (no selection)";
  - `waveform-zoom` → "Waveform Zoom menu".

  This is the smallest honest wording that matches the source. A new test, SC4, pins both and forbids "button" in any keys.
- **D-29z277, scope:**
  - 5 grants; the 5 carried files stay at their round-226 end hash.
  - A runs `npm run build` once as insurance, because gate 226 never reached the build. This is not the full suite, so the speed rule is kept.

## 4. Why we missed it (gate block)
- **B:** the L23 pre-check covered B's skeleton, not A's later structural deviation D1.
- **A:** did not apply L12's grep to the `data-testid` elements whose classes it changed.
- **New lesson L40:** if you change an element with a `data-testid`, every test file that names that testid joins the covering set. A frozen class pin is a STOP. `lessons.md` now has 57 lines, under the 60 limit. C checks it (row C-LESSON-227).

## 5. Pre-check (L23)
B made a scratch copy at `/tmp/b227`, outside the repo, and applied the exact planned edits. 6 test files, 89 tests: all green.

## 6. Consults
- **The advisor (before writing):** adopted:
  - the baseline is HEAD plus the preserved round-226 tree, not frozen at HEAD;
  - both assertions are in the grant (l.867–869 would fail next);
  - structure assertions instead of re-pinning classes;
  - the 3-item bundle;
  - explicit rulings on C-R226-01, D2, C-R226-04 and the doc status;
  - the L40 lesson;
  - the build insurance row for A.
- **No project subagent consulted.** There is no new behaviour or design choice, and the Live reference rows from round 226 stand.

## 7. Architecture checkpoint
No new request. These are still pending with root and do not block:
- ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP (`b-round-225-checkpoint-request.md`). The A round-226 signals are inputs to it.
- `b-round-221`, `211`, `205` and `203`.

## 8. Files written by B
- **Task files:**
  - `tasks/round-226.md` (a copy);
  - `current-task.md` (round 227);
  - `b-round-226-r227-{grants, granted-start-sha256, carried-r226-sha256, tree-sha256 (1,072, rc 0), root-files, root-files-start-sha256}.txt`.
- **`b-round-226/`:**
  - backups `*-before.*`;
  - `granted-start/` (copies of the 5 granted files at planning, for C's hunk-scope row);
  - `git-status-at-planning.txt`;
  - `backlog-update.py`.
- **Updated:**
  - `backlog.json` (v212);
  - `feature-status.md`;
  - `lessons.md` (L40);
  - `b-next.json`.

`regression-last.json` and `context/*` are unchanged. App source was not touched; the store tree is the same 9 round-226 paths.

## 9. Status
**CONTINUE.** Round 227 is dispatched.

Commit readiness: CALM-1a and the fix-up become commit-ready together after a C PASS and the root gate on round 227.
