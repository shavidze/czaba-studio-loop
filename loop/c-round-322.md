# C round 322: PERF-8b + RT-FIX verification — FINAL: FAIL (browserVerified false; see FINAL at the end)

**A status:** `STOP — needs B ruling` (§6, render-budget.test.tsx). The round cannot PASS (precedent: rounds 282/318/319 → FAIL).

## Plan
RT-FIX, SOURCE-SCOPE, CLAIMS, EXPECT, STOP repro, SELECT-NAMES / S2-VIDEO (HEAD vs A dev), S-* rows (provisional), G322-AUTH. PERF-SELECT not runnable (§2.5 harness absent).

## Checkpoint 1 (rows run)
- CLAIMS (`c-round-322/claims-c.txt`, 1 s): equals `a-round-322/claims-after-stop.txt` byte-for-byte. K3 0, K4 0, K5 0, K10 0, K11 0, K12 1, K21 11, K22 `0 748 780`, K8 11. **K19 0 (needs ≥5) and K13 still lists doc 230 → A-CLAIMS-AFTER not met.** Every other line equals HEAD output.
- RT-FIX: **PASS.** `diff retro-321-before-fix.md retros/retro-321.md` == `retro-321-fix.diff.txt` (cmp); §9 one-liner == `asserts-specified-305-320.txt`; `retro321-mentions-v2.py` → `c-round-322/` gives 18 ids / 4 strings, cmp-equal to B's; every id appears in §8; §4 "9 + 2" = classify.txt cat_window focus 7 + keyboard 2 (open) and focus 1 + keyboard 1 (deferred). C's extra spellings (`R32[01]\b`, `320\s*retro`, `round[ -]?32[01]`) found only STUDIO-PERFORMANCE execution order (already inventoried) and SIG-R320-* ids (not retro mentions). C-R321-01/02/03 close.
- SOURCE-SCOPE: 4 app files + new `selection-store.ts` + 29 test files == `selection-test-files.txt`. All inside §2.1. Protected 11/11 OK. Missing from §2.1 deliverables: SS test file, harness spec/budgets, docs 168/230/231.
- EXPECT: `expect-count.py` on A == HEAD byte-for-byte (TOTAL 4021). 66 removed `expect(` lines, 66 added; after normalising `selectedClipIds`→`getSelectedClipIds()` and `selectedClipId`→`getSelectedClipIds().at(-1)` the sets are equal. Only read paths changed.
- STOP repro (`c-round-322/render-budget-atree.log`): on a scratch copy of A's tree, `render-budget.test.tsx` gives 7/8, failing at l.617 `expect(api.current).not.toBe(valueAtPlay)` after `selectClip('music-1')`. That is a behaviour assertion (a positive control). It is not a selection-field read, so §2.4's exception does not cover it. The STOP is genuine. Option (a), applied by C on the scratch copy (`render-budget-option-a.log`): 8/8 pass; `setStatus(string)` matches `ArrangementStatusUpdate`; +3 `expect(`, none removed; the positive control keeps its intent through a value-changing trigger. Scratch restored.

## Checkpoint 2 (dev probes; HEAD = scratch `git archive 53c5c79` on :5197, own `cacheDir /tmp/c322-head-vite-cache` scratch-only; A = :5173)
- SELECT-NAMES (`c-round-322/probe/selnames-summary.txt`; HEAD attempt 1 timed out on a cold compile, `head-sel-attempt1-cold.log`, one retry after warm-up):
  - HEAD: `click-original-same-lane` commit 0 provider rendered, 105 components, **10/10 K15 names**; `click-original-again` 2 commits (92, 0). Equal to B's `select-same-lane-head.json`.
  - A: `click-original-same-lane` `providerRendered` false, 23 components, **0/10 K15 names**; `click-original-again` **1 commit with 0 components**. Equal to A's `select-same-lane-a.json`.
  - The task says "`click-original-again` has 0 commits". HEAD has a trailing empty commit too (`(False, 0)`), and A keeps only that one. Read literally, the row cannot pass on any tree → finding C-R322-02 (origin B). On the content criterion (0 components, no provider render) A meets the intent.
  - MU-SELECTION-IN-VALUE on A's tree: **not run**. A wrote no mutant set (STOP); deferred to the resumed round.
  - Observation: on Ctrl+D (`dup-ctrl-d`), A's commit renders 112 vs HEAD 110. The +2 are `ArrangementSelectedClipReadoutInner` and `ArrangementDetailPanelWithSelection` (`selnames-diff.txt`). `ArrangementDetailPanelWithSelection` and `ArrangementGroupHeaderWithSelection` are not memoised (StudioWorkspace.tsx l.694/724), so they render on every StudioWorkspace commit. This is the C-R318-01 pattern. It is for PERF-SELECT/PERF-LOAD to measure when A resumes; recorded as INFO-C322-WRAPPER-RISE, not yet a finding.
- S2-VIDEO (`probe/s2-summary.txt`): HEAD **2** mixed commits (range cleared, old selection drawn; 0 frames), so the row is not vacuous; A **0**. Meets the row on the partial tree (provisional, not in `passed`).

## Checkpoint 3
- G322-AUTH (`c-round-322/g322-auth.json`, :5173 = A tree, fresh anonymous contexts): **PASS** at both viewports. `/studio-lab` shows the workspace and the demo badge, `auth_user` null, no page errors. `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token`: no header 401, fake bearer 500 with no token, bare 400. Attempt 1 timed out on the cold compile of `/studio/middle-east` (`g322-auth-attempt1-cold.log`), as in rounds 320/321; one retry after a warm-up.
- S-* rows script `c-round-322/c322-rows.mjs`. The demo library adds every item to the Music lane, so the setup is 3 clips on **one** lane (Add + Ctrl+D ×2, zoomed out with `−` ×8), not "3 clips over 2 lanes". Each edit step reloads and rebuilds the setup. No group header exists in the demo state (`arrangement-group-fold` count 0), so S-GROUP cannot run as written (no Stems group with a clip). Run in progress: A both viewports, then HEAD both.

## Checkpoint 4: S-* rows (HEAD :5197 vs A :5173, both viewports)
- Files: `rows-{head,a}-full2.json` (final, real modifiers via keyboard down/up), `rows-{head,a}-mods.json` (click rows), `rows-full2-diff.txt`, `rows-mods-diff.txt`, screenshots in `shots/`. The first runs (`rows-head.json`, `rows-a.json`) passed `modifiers` to `page.mouse.click`, which ignores it. They are superseded: in them the Ctrl/Shift clicks and the "2 selected" edits were really plain clicks.
- **Result: 27/27 step states identical HEAD vs A at 1440×900 and at 1280×720**: clip selected states (computed box-shadow/z-index, not classes), status, "n clips selected", the selected-clip line, the detail panel text, the clip gain fader state, the range readout and the transport titles/disabled states. No page errors.
  - S-CLICK: click, Ctrl+click add, Ctrl+click remove, re-click, Ctrl+A (3), Ctrl+drag marquee (2): equal. A Shift-held click and Esc changed nothing on **both** trees (INFO-C322-SHIFT-ESC: possibly the semantics or the setup, not probed further).
  - S-DETAIL: 1 clip shows the clip detail and an enabled gain fader at 0.0 dB; 2 or 3 clips show the "2 clips"/"3 clips" summary and "n clips selected": equal.
  - S-EDIT (fresh setup per step): Cut and Delete on 1 and 2 clips with Undo/Redo/Undo give clip counts [3,2,3,2,3] and [3,1,3,1,3] and the same status and selection after each step. In this layout, Duplicate, Paste and Split are refused with an "occupied" or "insert marker" status, identically on both trees (the success paths are not exercised).
  - S-TRANSPORT: no selection gives Split/Delete soft-disabled with "select a clip or make a time selection first"; 1 clip gives "Split at the insert marker" / "Delete clip"; a range gives the time-selection titles: equal.
  - S-RANGE: a body-drag on the selected clip gives the range 00:05.960–00:23.842; a click on another clip clears the range and moves the selection in one read: equal.
  - S-GROUP: **not run**; there is no group in the demo state.
- Export (project, WAV): 304.056 s, 48 kHz / 24-bit / 2 ch, peak 1.0, at both viewports; **byte-identical** HEAD vs A (`cmp`).
- UNIT (`unit-c.log`, C's scratch copy of A's tree, the 111 A-UNIT files): **110 passed / 1 failed (render-budget); tests 1704 / 1705**, which reproduces A's report. `perf/lib/report.test.ts`: not run.
- Manifest: all 7 artifacts A cites exist; A's counts (claims, expect 4021, unit 110/1 and 1704/1) match C's. `missingPaths` [], `countMismatches` [].
- Store untouched by C: 34 status entries before and after; protected 11/11. C's only out-of-loop edits are scratch: `/tmp/c322/head/vite.config.ts` `cacheDir`, and the temporary option-(a) edit in `/tmp/c322/atree` (restored).

# FINAL — C round 322 verdict: **FAIL** (browserVerified = realVerified = false)

A STOPped (§6). PERF-8b is incomplete, so the round cannot PASS; precedent: rounds 282/318/319. **There is no app bug.** On every browser row C could run, A's partial tree behaves exactly like HEAD 53c5c79, and the export is byte-identical. The partial work is safe to keep while B rules.

| Row | Result | Evidence |
|---|---|---|
| RT-FIX | **PASS**: closes C-R321-01/02/03 | `retro-diff-c.txt`, `asserts-c.txt`, `retro321-mention*-v2.txt` |
| SOURCE-SCOPE | **PASS**: all inside §2.1, protected 11/11 | git status |
| EXPECT | **PASS**: equal to HEAD, 4021; only read paths changed | `expect-count-c.txt` |
| CLAIMS | FAIL: K19 0 (needs ≥5), K13 still lists doc 230 | `claims-c.txt` |
| UNIT | FAIL: render-budget red; no SS file and no mutants | `unit-c.log`, `render-budget-atree.log` |
| PERF-SELECT | BLOCKED: no harness rows | — |
| PERF-LOAD | not run (tree not final) | — |
| SELECT-NAMES | provisional: names and provider meet the row (HEAD 10/10, A 0/10, providerRendered false); "0 commits" cannot be met even at HEAD (C-R322-02); mutant not run | `probe/selnames-summary.txt` |
| S2-VIDEO | provisional meet: HEAD 2, A 0 | `probe/s2-summary.txt` |
| S-CLICK/S-EDIT/S-DETAIL/S-TRANSPORT/S-RANGE | provisional: identical to HEAD at both viewports | `rows-full2-diff.txt`, `rows-mods-diff.txt` |
| S-GROUP | not run: no group in the demo state | — |
| G322-AUTH | **PASS** at both viewports | `g322-auth.json` |
| Ableton conformance | not applicable | — |

## For B
1. **C-R322-01 (Medium; origin B sketch / A STOP): rule on render-budget l.616–620.** C reproduced the failure and confirmed that §2.4 does not cover it. A's option (a), applied on C's scratch copy, passes 8/8, adds 3 `expect(` and removes none. The positive control keeps its purpose through `setStatus`. C sees no objection to granting it. It turns the old "a selection change re-renders every consumer" assertion into the new contract. Why it was missed: on B's type-only sketch all 81 outside-list files crashed in `StudioWorkspace` before any assertion ran, so a behaviour test that depends on the coupling could not be seen (an L23/L58 consequence).
2. **C-R322-02 (Low; origin B):** reword SELECT-NAMES as "`click-original-again`: 0 components rendered, providerRendered false, ≤ 1 commit (HEAD keeps a trailing empty commit)".
3. **INFO-C322-WRAPPER-RISE:** the non-memoised `ArrangementDetailPanelWithSelection` and `ArrangementGroupHeaderWithSelection` add renders to every StudioWorkspace commit (+2 on Ctrl+D). Expect PERF-SELECT's "no rise in other rows" check to flag this (the C-R318-01 pattern). A could memoise them in the resumed round.
4. **INFO-C322-S-GROUP-PREMISE:** in the demo state there is no group to collapse, and every library add goes to Music. The resumed round needs S-GROUP and the 2-lane setup redefined, or a setup step named (for example, how a Stems group gets created).
5. After the ruling, C re-runs: CLAIMS, UNIT with the SS file and the 4 mutants plus one of C's own, PERF-SELECT, PERF-LOAD, the SELECT-NAMES mutant, and short S-* reruns on the final tree.
:5173 still serving after C's run (HTTP checked at the end); C's scratch HEAD server :5197 stopped.
