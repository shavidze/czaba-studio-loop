# B round 375 → 376 planning

## 1. Round 375 result (D-29z1246)
- **C round 375 PASS** (`c-round-375.json`): 16 rows passed, `browserVerified` and `realVerified` true, 0 bugs. The fake-bearer 500 on `/api/studio-token` is listed as blocked (backend unavailable in the cloud); no-token 401 verified. Gate rows were left to the gate.
- **Gate 375 published `6b11be7`** on both remotes (`gates/gate-round-375.json`, status `published`). This is the baseline for round 376. The store tree is clean at `6b11be7`.
- **Done:** PERF-11c-iii-b (Library + preview leaves). **Closed:** GATE374-L2-RBLEAF1-REVERT (and its deferred copy, L7).
- **Archive:** `tasks/round-375.md` is a byte copy of the dispatched `current-task.md` (sha256 `cffb349d…`). Nothing was deleted.

## 2. Findings and records (D-29z1246)
- **A-R375 test Lows:** DPR-NO-POSITIVE-CONTROL ruled **Low** (A's question): RB-LEAF3 in the same covering set proves the name is live, so there is no behaviour gap. It and RBLEAF3-PER-STEP are fixed in round 376, which owns both files. PREV-ONLY-UNDEFINED-KEY → info (same as React's shallow-equal semantics).
- **Gate 375 review (9/10):** L1 unused wrappers → GATE375-L1-UNUSED-WRAPPERS (deferred Low; the wrapper policy goes to the architecture checkpoint); L2 comparator fragility → GATE375-L2 (deferred Low, under SIG-R375-LEAF-COMPARATOR-HOME); I3 → info. Its architecture note is the **third independent echo** of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Recorded as an input, not scheduled.
- **C's notes:** the LIB-KEYS activeElement alternation and the preview timing text are equal on HEAD → INFO-C375-LIBKEYS-ACTIVE-FLAKE.
- **New, found by B:** B-R375-PROBE-FORWARDREF-NAME. The browser leaf probe keyed forwardRef components by `render.name`, so `ArrangementMarkerRow` (an anonymous arrow with a `displayName`) always read 0 in the round-373/374 probes. The fixed loop probe (`b-round-375/probe/leaf-probe-376.mjs`, reads `displayName` first) shows that MarkerRow renders once per commit at HEAD. This corrects the c2 premise. No app change is needed, because the unit render logs already read `displayName`.
- **No Critical or High is open.** The open Mediums are manual, root or awaiting_user (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1). None of them blocks the next round.

## 3. Round 376 = PERF-11c-iii-c1 (D-29z1247, D-29z1248)
- **Split:** PERF-11c-iii-c becomes c1 (Transport) and c2 (LoopBrace + MarkerRow). MarkerRow is a 946-line forwardRef with an imperative handle, editor state and focus hand-offs, and LoopBrace has the same gesture shape. The scope is unchanged.
- **Premise at HEAD in the browser** (`b-round-375/probe/leaf-head-376.json`, both viewports): every add, zoom, mute, Ctrl+Z, Undo/Redo button and preview start/stop renders the whole Transport.
- **Sketch** (`b-round-375/sketch.patch.txt`, 6 files): `ArrangementTransportView` (memo) with data props. Edit, Centre and View memo groups, each with its own range and selection selectors. `useArrangementTransportActions`, an `openExportDialog` useCallback, and a shared `useSoftDisableFocusHandoff` whose arm expires after one frame.
- **Pre-check:**
  - tsc 0 errors, Biome rc 0.
  - Full suite on v1: 252 files / 3,721 tests. The 140 covering files on v2: 2,200/2,200.
  - Production perf on v2 (interactions + resources): 0 FAIL.
    - `zoom.1` 53 → 41, `zoom.30` 140 → 128, click 38 → 29.
    - Release components drop by 2 to 8 on every committing drag; move/lane max 58 → 40.
    - **Accepted:** the range-drag start costs +2 components (once).
  - 10/10 mutants red (`mutants/summary.txt`; the DELETE mutant was re-run with a corrected anchor; every file restored).
  - The sketch browser probe matches the design at both viewports, with the wrapper at 0 everywhere. The TRANSPORT-BROWSER recipe gives equal results on HEAD and the sketch.
- **`tech-lead` review** (`b-round-375/sketch-review.md`):
  - v1 was approved with changes. TL-R376-M1 (a hand-off arm could outlive its click) is fixed in v2 and proven by FL11: green on HEAD, red on v1, green on v2. L1 (duplication) is fixed by the hook. L2 (wrapper) keeps the wrapper with a site-revert guard.
  - The v2 delta was **approved**, with Lows only: D-L5 → deferred Low; D-L1, D-L2 and D-L3 → info.
- **Recipe correction found by probe (L29):** the zoom slider writes no zoom history, so the Zoom-back hand-off row starts with Fit.

## 4. Checkpoint, regression and RETRO (D-29z1249)
- **Architecture checkpoint:** ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still requested from root (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). Round 376 is the fourth pattern-A leaf and the third `use*Actions` hook, and gate 375 gave the third echo. It is non-blocking for c1 and c2. d and e wait for root's answer or RETRO 384. **Bounded request to root, restated:** run the read-only frontend-architect on the actions-vs-data split (pattern A per-leaf props + memo vs pattern B stable actions context + data stores), the wrapper policy (GATE375-L1, TL-R376-L2) and the comparator home (SIG-R375-LEAF-COMPARATOR-HOME), before d (VideoDock) is dispatched.
- **REGRESSION:** `regression-last.json` = 2026-11-05 (round 342). It is due at the first planning on or after 2026-11-08. The planning date when this round started was 2026-11-06, so it is not due this round. The next planning (round 377) will very likely fall on or after 2026-11-08, and it then plans REGRESSION first.
- **RETRO:** about round 384, or at the end of STUDIO-PERFORMANCE.
- **lessons.md:** unchanged (60 lines). No Saba-reported issue arose this round, so no "Why we missed it" is due.
- **Not applicable:** reference-first, `product-designer`, YouTube and screen budget (a performance refactor with no visible change).
- **Advisor:** available and consulted before the plan (it prompted the MarkerRow probe check and the c1/c2 split).

## 5. Ready for the gate after C PASS
Round 376's 6 code/test files and 1 doc (`grants-376.txt`). Nothing else in the store tree changes.
