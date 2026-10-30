# A round 261: PERF-HARNESS-STRINGS-DRIFT

**STATUS:** implemented, handed to C. **No STOP.**
- None of the §2.6 STOP conditions occurred.
- All 11 class (a) keys are rendered by their components.
- `test:perf` passed with 0 deterministic deltas against round 259.

## Spec tension (B to confirm), D-29z526 form
These are not STOPs: in each case one change meets both clauses.

1. **Step-name clause vs PERF-SWEEP.**
   - Clause A (§2.2): "test logic, timings, budgets, step names and report fields stay unchanged".
   - Clause B (§3 PERF-SWEEP): `grep -nE "…|WAV created|…"` prints 0 lines.
   - Conflict: the resources step string `c. Export -> … to the "WAV created" text …` and 3 problem/error messages (`no "WAV created: mm:ss.mmm" length text`, `the dialog shows "WAV created" before the click`, `the "WAV created" observer was not released`) had the literal.
   - Change: they are template literals now, built from `perfWavDoneName` / `perfWavDonePrefix`, which are derived from `studioExportStrings.wavDone`.
   - Evidence that the values are byte-identical: in the round-261 reports, `sequence`, row `scenario` and row `note` are all equal to `c-round-259/latest*.json` (`a-round-261/perf-summary.txt`).
2. **WIRING "no string literal in the file equals a `strings.ts` value" vs §1(c) fixture constants.**
   - Conflict: the fixture literals `'Music'` and `'Stems'` in `perfFixtureTracks` equal `strings.ts` `kindMusic`/`folderMusic` (l.278/280) and `folderStems` (l.281). Those keys are library kind/folder UI labels, not track names.
   - Change: I kept them as fixture constants, as §1(c) requires. Importing the folder keys would tie the harness to unrelated labels.
   - Also: `'Undo'` in the allowlist equals the `'Undo'` inside `undoTitle` (strings.ts l.150), which §1(b) itself rules is class (b).
3. **A pattern outside the three classes of §1.**
   - `perf/studio-lab-interactions.perf.spec.ts` `rangeLabelEnd = /\d\d:\d\d\.\d{3} – (\d\d):(\d\d\.\d{3}) ·/` parses the clip range readout. Its `–` and `·` separators are inline JSX in `ArrangementClip.tsx` (l.981, l.985).
   - My reading is that it is a parser pattern, not a label used to locate an element, so STOP bullet 1 does not apply. B to rule.
   - It is unchanged, and it is a 7th unprotected pattern next to the 6 class (b) labels (doc 195 limit 3).
   - B's K3 sweep also missed 3 browser-side `textContent?.trim() === 'Add'` checks inside `waitForFunction`. They are class (a), and I wired them through the `arg` parameter.

## Changed files
- `perf/lib/app-labels.ts` (new)
- `perf/lib/page.ts`
- `perf/studio-lab-interactions.perf.spec.ts`
- `perf/studio-lab-resources.perf.spec.ts`
- `perf/studio-lab.perf.spec.ts`
- `docs/implementation/2026/quarter-IV/195-perf-harness-strings-drift.md` (new)

From `store/`, `git status --short --untracked-files=all` lists only these 6. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-260-r261-tree-sha256.txt` gives rc 0. HEAD is `7a960c1`.

What `app-labels.ts` contains:
- Exactly one app import: `../../app/lib/arrangement/strings` (relative, no `~/`).
- The 11 class (a) values, read by direct property access, so a rename turns tsc red. That covers 7 objects:
  - `playLabel`
  - `formatButtonWav`
  - `closeButton`
  - `wavDone`
  - `zoomSliderLabel`
  - `rangeBodyTitle`
  - `trimStartLabel`
  - `moveTitle`
  - `add`
  - `activeTrackLabel`
  - `studioGroupHeaderStrings.volumeLabel`
- The derived regexes: a `\u0000` sentinel split, then `escapeRegExp`.
  - All 5 `source` values are byte-identical to the old literals (`a-round-261/derive-check.txt`, re-checked after the review fix in `derive-check-after-review.txt`).
  - The group regex matches `Volume — Group 1 (group)` and rejects `Volume — Music`.
- `perfInlineLabels`: exactly 6 entries `{ label, sourceFile, sourceNeedle }`, typed with `satisfies Record<string, PerfInlineLabel>` (no `as`).
  - Builders: `perfTrackVolumeLabel(name)`, `perfTrackPanLabel(name)` and `perfUndoButtonPattern`.
  - Needle check: `grep -cF` gives 1 for each of the 6 (`a-round-261/needles.txt`). The Export needle is `          Export` (10 spaces), which matches only ArrangementTransport l.397.
- Fixtures: `perfFixtureTracks` (`Music`, `Stems`, `SFX`) and `perfMembersSourceTitle` (`Soft impact`).
- No `any`, no `as`, no `@ts-ignore`, no comments, semicolons throughout.

## Commands run (actual results)
1. **Sweeps** (working tree, final code):
   - K3 sweep regex over the 4 files: **0 lines**.
   - PERF-SWEEP second grep: **0 lines**.
2. **`npm run typecheck`:** rc **0**. Run before the perf run, and again after the review fixes.
3. **Mutants**:
   - Scratch at `/home/runner/czaba-project/tmp/a261-scratch`: rsync without `node_modules`/`build`/`test-results`, `node_modules` symlinked. It was re-synced with the final `app-labels.ts`.
   - Control `npx tsc --noEmit`: rc 0.
   - Mutant 1 (`zoomSliderLabel`→`zoomSliderLabelX`): rc 2, `perf/lib/app-labels.ts(26,54): error TS2551: Property 'zoomSliderLabel' does not exist on type …`.
   - Mutant 2 (`moveTitle`→`moveTitleX`, fresh `strings.ts`): rc 2, `perf/lib/app-labels.ts(42,58): error TS2551: Property 'moveTitle' does not exist on type …`.
   - Full output: `a-round-261/mutant1.txt`, `a-round-261/mutant2.txt`.
4. **`npm run test:perf`**, alone (L38; nothing else ran; the dev server on 5173 was untouched):
   - The config's own webServer built and served on 5188.
   - Result: **rc 0, 3 passed (13.7 m)**. Log: `a-round-261/perf-run-1.log`.

   | harness | complete | passes | aborts | pageErrors | problems | failed asserts | deterministic rows | Δ vs round-259 oracle |
   |---|---|---|---|---|---|---|---|---|
   | PERF-1a | true | 6 | 0 | 0 | 0 | 0 | 166 | 0 |
   | PERF-1b-i | true | 6 | 0 | 0 | 0 | 0 | 106 | 0 |
   | PERF-1b-ii | true | 6 | 0 | 0 | 0 | 0 | 37 | 0 |

   - `harness.audio-running` = 1 and `interact.harness.audio-running` = 1.
   - Every `fader.*.playing.restarts` row = 0, at 1x and 6x: track, group, master, pan, clipgain, clipgain-members.
   - No rows are new or missing against `c-round-259/latest*.json`.
   - Summary: `a-round-261/perf-summary.txt`.
   - **Caveat:** the perf run used the code before the two Low review fixes below. One fix is type-only (`satisfies`). The other is a runtime guard that throws only when a template has 0 or ≥ 2 placeholders. `derive-check-after-review.txt` shows the module loads and every exported value is unchanged. I did not repeat the 14-minute perf run; C's PERF-RUN covers the final code.
5. **Biome:** not cited. `biome.json` ignores `perf/` (L30). I wrapped the two new lines over 100 chars by hand to match the existing style.
6. **Not run (gate rows):** full vitest, `npm run verify`, a standalone build, e2e smoke, `/check` repo-wide.

## Code-reviewer (actual subagent, read-only)
- **Result:** score 8/10, no Critical, High or Medium.
- **Verified by the reviewer:** the 5 regex derivations against `strings.ts` by hand; the 6 needles; the browser-closure args; and the typecheck path (`tsconfig.json` include `**/*.ts`).
- **Its findings:**
  - Low, allowlist has no declared shape: **fixed** with `interface PerfInlineLabel` + `satisfies`.
  - Low, `splitAtSentinel` checked only the first sentinel: **fixed**; it now throws unless there is exactly one placeholder.
  - Low, the Export needle depends on indentation: **kept**. `Export` is plain JSX text on its own line (l.397), so any needle that proves the label sits on that line. I chose a needle that hits only l.397. A Biome reflow would make ALLOWLIST-TRUE fail loudly, not silently. Moving the label into `strings.ts` is SIG-R261-INLINE-LABELS.
  - Low, byte-equality of the templated report strings could not be checked by the reviewer: **settled by evidence**. The `sequence`, `scenario` and `note` comparison with round 259 is equal.
  - Info: the old observer marker already had the colon (`'WAV created:'`); it is unchanged.
  - Info: doc l.4 is the L28 post-PASS value, by rule.
- **Architecture note (for B, not acted on):**
  - **Keep:** `perf/lib/app-labels.ts` is a one-way, stateless seam onto a leaf module (`strings.ts` → `shortcuts.ts` → nothing).
  - **Proposal under SIG-R261-INLINE-LABELS:** move the 6 inline labels into `strings.ts`. Until then, a possible perf-local guard would assert that each `sourceNeedle` is present in its `sourceFile`. Acceptance for either: renaming any of the 6 labels fails typecheck or the guard. That is new test logic, so it belongs to a separate task.

## Known gaps
- A key that still exists but is no longer rendered is not caught by typecheck; only `test:perf` catches it. Doc 195 limit 1.
- The 6 class (b) labels and `rangeLabelEnd` are not drift-protected (limits 2 and 3, SIG-R261-INLINE-LABELS).
- Any future `~` import in `strings.ts` would break the Playwright loader (limit 4).
- The scratch copy `/home/runner/czaba-project/tmp/a261-scratch` was left in place, outside `store/`.

## B acceptance I actually checked (C verifies)
- §2.1 wiring: done.
- §2.2 sweeps at 0: done.
- §2.3 doc 195: TEMPLATE headings in order, l.4 `**სტატუსი:** Completed (C round 261 PASS)`, the limits stated, and only existing tests cited (`npm run typecheck`, the three perf spec files).
- §2.4 checks: done.
- §2.5 reviewer: done.

Not mine: RT-FIX-261 and G261-AUTH are C rows on B's artifacts and the auth guard.

## Exact next C checks
1. SOURCE-SCOPE: tree sha, git status (4 ` M` + 2 `??`), HEAD `7a960c1`.
2. PERF-SWEEP: both greps → 0.
3. WIRING: read `app-labels.ts`, and rule on spec tension 2.
4. ALLOWLIST-TRUE: the 6 needles.
5. MUTANT-PERF: control plus the 2 mutants on a fresh scratch.
6. TYPECHECK.
7. PERF-RUN alone. Compare with `c-round-259/latest*.json`; this round's A values are in `a-round-261/perf-summary.txt`.
8. DOC-261.
9. RT-FIX-261.
10. G261-AUTH at 1440×900.
11. B to rule on spec tensions 1–3.
