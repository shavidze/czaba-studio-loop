# B round 227 → 228 planning (2026-10-28)

**Decision: CONTINUE.** Round 228 is **SABA-B-8 CALM-1b**, stage 2 of 2 of CALM-1 (D-29z278…D-29z284). Each transport button gets its key in the tooltip and a matching `aria-keyshortcuts`, both read from `shortcuts.ts`. Three Lows ride along because the round owns their files: B-R225-BACK-TO-START-KEY, C-R227-01 and C-R227-02.

The rounds after it:
- CALM-2;
- RETRO (230);
- CALM-3;
- then STUDIO-PERFORMANCE b-ii.

REGRESSION takes precedence at any planning on or after 2026-10-30.

## 1. Inputs read
- `context/active-summary.md`, `lessons.md` (in full), `current-task.md` (round 227).
- The round-227 task is archived as `tasks/round-227.md`, a new file. `cmp` OK, nothing deleted.
- `a-round-227.md`, `c-round-227.md` and `c-round-227.json`: PASS, 14 rows, `browserVerified` and `realVerified` true, 2 Low.
- `gates/gate-round-227.json`: status **published**, commit `d32464ea264e94f7b0aa98c5b64934340c275d33`, both remotes. `gates/round-227/verify.log` shows 205/205 files and 2973 tests. `gates/round-227/review.md` scored 8.5/10 with 6 suggestions.
- `regression-last.json` = 2026-10-27, so REGRESSION is not due.
- `b-round-226.md`, `b-round-225/l23-precheck-1b.txt` (superseded), `docs/technical/studio-real-workspace/calm-studio-review.md` §2 and §5, and the backlog by id.
- Source, read-only:
  - `shortcuts.ts`;
  - `strings.ts` (title entries);
  - `ArrangementTransport.tsx`;
  - the SW key handler (l.1798 `ctrlKey || metaKey`, l.1860–1887, l.2025 Home);
  - the test pin sites.

## 2. Backlog: updated only from independent evidence (v213)
- **Round 227: `published`.** C PASS with `browserVerified` true, plus the gate. **CALM-1a → მზადაა** (rounds 226 + 227). Round 226 is also marked published with 227.
- **Closed:** GATE226-B1, C-R226-02 and C-R226-03 (C rows C-UNIT, C-ROWS, C-WZ and C-FIT, plus the gate).
- **New open:**
  - C-R227-01 and C-R227-02: fixed in round 228;
  - info A-R227-REVIEW-L3-WZ-VISIBLE-NAME: a CALM-2 candidate, not C-verified;
  - GATE227-S1, S3 and S6.
- **Deferred Lows:** GATE227-S2 and GATE227-S5, both in files not granted. `deferred_low_polish` now has 352 entries. C-R226-04 stays there (§3).
- **Signals:** GATE227-S4 (perf) and GATE227-ARCH-ACTIVE-DIALOG-REF (input to the checkpoint).
- **DUX-R-2** is not closed yet. It closes with CALM-1b's C PASS.

## 3. Rulings
- **D-29z279 (format):**
  - The title is `<label> (<first key>)`, as in Saba's "Undo (Ctrl+Z)".
  - `aria-keyshortcuts` lists every key that works.
  - "Ctrl/Cmd" becomes "Ctrl", matching the sheet (Deviation K3).
- **D-29z280 (aria values):**
  - The source: MDN `aria-keyshortcuts` (fetched), which gives `Meta+C Meta+Shift+C` as an example. The handler accepts Meta.
  - Z and X keep their hard-coded values, with parity proven by NS5. Fit has no `aria-keyshortcuts`.
- **D-29z281:**
  - C-R227-01: "(no time selection)" in the chip and in `fitTitle` (L4).
  - C-R227-02: the whole doc 177 is granted (L34).
- **D-29z282:** C-R226-04 is not this round. The precondition of D-29z275 fails, because no StudioWorkspace grant is needed. It goes to the polish pass. No Live search was made, for that reason.
- **D-29z283:**
  - A's D1 (`row.children` length 2) is kept. CALM-2 and CALM-3 must cover `track-layout.test.tsx`.
  - Gate review: S1, S4, S6 and the Architecture note become signals. S2 and S5 are deferred Lows. S3 is rejected: a class pin is what caused GATE226-B1, and truncation is a browser row.
- **D-29z284:** 12 grants. The frozen set holds 1,070 files. `StudioWorkspace.tsx`, `ArrangementShortcutSheet.tsx` and `track-layout.test.tsx` are frozen.

## 4. Pre-check (L23)
- **Scratch:** `/tmp/b228` = `git archive d32464e` (outside the repo).
- **App edits:** `b-round-227/precheck-apply.py`. `tsc` rc 0.
- **Sweep** over `app/lib app/components app/hooks app/routes`: 8 files and 23 tests red, all of them title literals or the ST8 formatter list (`b-round-227/l23-precheck-1b.txt`).
- **Test-only fixes:** `b-round-227/precheck-tests.py`, applying ruling R1. The 8 files plus 5 neighbours give 13 files and 270 tests green (`l23-precheck-fixed.log`).
- **Reference diff:** `b-round-227/precheck-scratch.diff`.
- **L31:** the gate-227 times are well inside their limits (§0.3 of the task).
- **`e2e/` and `perf/`:** 0 collisions; the only hits are 4 unrelated clip-title `getByTitle` calls.
- **Fit chip (L3):** B measured the new text by swapping it in the DOM of the live `/studio-lab`. At both viewports it is 304×18 inside the 319 px `li`, with 0 overflow (`b-round-227/fit-measure/result.json`).
- **After the advisor's final review:** the task gained the e2e/perf line, the fit measurement, a Biome-wrapping allowance in C-SCOPE, the states for C-PARITY (no range-state Delete) and the named bbox file.

## 5. Reference (reference-first)
Fetched on 2026-10-28:
- Live 12 manual 2.2.2 "Info View". Hover help is a panel; the fetched section mentions no tooltips or keys on hover.
- MDN `aria-keyshortcuts`.

Rows K1–K4 are in task §3. K1 (Info View vs tooltip) and K3 (Ctrl/Cmd → Ctrl) are listed deviations. **No claim that Live shows keys in tooltips is made.** No project subagent was consulted: the Live behaviour needed here came from the fetched manual section, and round 226's R1–R5 rows stand.

## 6. Consults
- **The advisor (before writing):** adopted:
  - bookkeeping first;
  - every ruling with a D-ID;
  - `strings.ts` importing from `shortcuts.ts`;
  - Undo/Redo title helpers, so the tests import helpers instead of re-pinning literals;
  - Control+Meta in aria;
  - scope = review row 5;
  - a fresh pre-check on `d32464e`;
  - parity, title-table and aria rows for C;
  - C-R226-04 deferred unless the source supports it.
- **Advisor availability:** the advisor tool was available and was used.

## 7. Architecture checkpoint
- **No new request.** CALM-1 finishes with this round (the feature boundary), but the pending ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP (`b-round-225-checkpoint-request.md`) already covers the dialog/keymap risk.
- The gate-227 Architecture note (activeDialogRef) is appended to it as input. Root may run it at the CALM-1 boundary. It does not block CALM-2.
- These are still pending with root: `b-round-221`, `211`, `205` and `203`.

## 8. Files written by B
- **Task files:**
  - `tasks/round-227.md` (a copy);
  - `current-task.md` (round 228);
  - `b-round-227-r228-{grants, granted-start-sha256, tree-sha256 (1,070, rc 0), root-files, root-files-start-sha256}.txt`.
- **`b-round-227/`:**
  - backups `*-before.*`;
  - `git-status-at-planning.txt`;
  - `granted-start/` (12 files);
  - `precheck-apply.py`, `precheck-tests.py`, `precheck-scratch.diff`;
  - `l23-precheck-1b.txt`, `l23-precheck-sweep.log`, `l23-precheck-fixed.log`;
  - `backlog-update.py`.
- **Updated:**
  - `backlog.json` (v213);
  - `feature-status.md`;
  - `b-next.json`.
- **Unchanged:** `lessons.md` (no new lesson: round 227 had no miss to learn from), `regression-last.json` and `context/*`. App source was not touched, and `git status` in the store is empty.

## 9. Status
**CONTINUE.** Round 228 is dispatched.

Commit readiness: CALM-1a is published. CALM-1b becomes commit-ready after a C PASS and the root gate on round 228.
