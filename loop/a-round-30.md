# A — Round 30: SRW-13 stage 3 — FB-04 Clip Gain (R13-M1)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-12 · Task: `current-task.md` (round 30) · Working dir: `C:/Apps/czaba-project/store`.
No commit, push, deploy or install. The dev server was not started or stopped. Nothing was deleted or reverted.

## 1. Pre-flight gate

**Primitives read:**
- AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE;
- DESIGN_TOKENS, TAILWIND_FIRST;
- TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS;
- `prompts/studio-feature.md` and the `pre-flight` skill.

The inject-primitives hook also re-fed them on the first Edit/Write of each kind.

**Pre-flight:**
- **Assumptions:**
  - `gainDb` exists only when it is non-zero.
  - The existing per-source `clipGain` node is the gain stage, so no node is added.
  - A gain-only edit never reschedules.
- **Smallest version:** about 150 source lines across 7 files, plus 1 test file and doc 035.
- **Files:** exactly §3.2.
- **Success:** `clip-gain.test.tsx` red first, then green; the frozen list green; tsc 0; 69 status lines.

**Baseline before any edit (all as B stated):**
- HEAD is `c5ed47b`.
- `sha256sum -c b-round-29-tree-sha256.txt` → **69 OK**.
- `git status --short` has **67 lines** and is identical to `b-round-29-git-status.txt` (`diff` empty).
- All 8 owned files match the snapshot shas (`9e467c0b f67135a8 988e11b7 da43c765 f12fb245 1d1fa845 ad3b2bed b85c3c96`), and `cmp` with `b-round-29-snapshots/` is equal for each.
- `node.exe` was 13 at the start; the server returned 200.

**§1.4 grep results:**
- **`ScheduleHandle`-typed object literals:** none. The type is used only in `ArrangementContext.tsx` (ref/retired types) and in `master-ui.test.tsx:250` (`latestHandle()` returns the **real** handle from `vi.fn(actual.applySchedule)`). There is no fake handle, so no conflict.
- **Consumers of `ArrangementClipboardItem`:** none outside `clipboard.ts`. `ArrangementContext.tsx:459` holds only an `ArrangementClipboard` ref.
- **Whole-clip `toEqual`/`toStrictEqual` after split, duplicate, paste or Cut Time** are in `all-lane-clipboard`, `ArrangementContext.test`, `clipboard`, `delete-selection`, `loop`, `master`, `model`, `selection` and `video`. None of their fixtures has `gainDb`. Every write is a conditional spread, so the outputs are byte-identical, and they all stay green.
- **Tests that count `setTargetAtTime` on clip gain nodes:** none. The fakes in 17 test files record or assign targets. `graph.test.ts` asserts targets only on **track** gain nodes, and l.373 counts gain nodes; neither changed.
- **Contract conflict found (tsc, not an assertion), see §6.1:** a required `setClipGain` prop on `ArrangementDetailPanelProps` breaks tsc in two frozen tests that render the panel standalone.

## 2. Red-first, then green

The new file `app/lib/arrangement/__tests__/clip-gain.test.tsx` had **26 `it`** at red time: model 5, graph 4, clipboard 2, provider 6, UI 9. Two UI tests were added after the review (§4), so the final file has **28**.
- It loaded on the unchanged snapshot sources, because missing ESM exports resolve to `undefined` in vitest. That is the same in-place method as round 29; no scratch copy was needed.
- Output: `a-round-30/red-first.txt`.

```
Test Files  1 failed (1)
     Tests  25 failed | 1 passed (26)
```

Failure reasons:
- the 5 model tests and the clipboard carry test: `setClipGainDb is not a function`;
- graph seeding: `expected 1 to be close to 1.99526`;
- the 2 handle tests: `handle.setClipGain is not a function`;
- the export scan: missing `clipGains: clipLinearGains(arrangement)`;
- 5 provider tests: `result.current.setClipGain is not a function`;
- the `startGraph` test: `expected undefined to be close to 1.41254`;
- the 9 UI tests: `Unable to find [data-testid="arrangement-detail-clip-gain-input"]` (or `-reset`).

The one green test is "a clipboard from clips without gain has no own gainDb". It is a guard and is green by design.

After the implementation it was **26/26 green** (`a-round-30/green-1.txt`). The final file is 28/28 inside the full run (`vitest-full-final.txt`).

**Provenance of the two added tests.** Neither was in the red-first run.
- "0 dB with dirty text …" asserts `mouseDown` default prevented. That is red against the pre-fix panel, which had no `onMouseDown`.
- "a blur with unchanged or normalised-equal text …" is a guard; it is green by design on the pre-fix code too.

## 3. Diff summary per file (against `b-round-29-snapshots/`)

**`types/arrangement.ts`:** +1 line, `gainDb?: number` on `ArrangementClip`.

**`model.ts`:**
- `CLIP_GAIN_MIN_DB = -60` and `CLIP_GAIN_MAX_DB = 24`;
- `normalizeClipGainDb` (clamp, then round to 0.1 dB, with `-0` → `0`);
- `setClipGainDb`, which returns the same object for an unknown clip, a non-audio track, a non-finite value or an unchanged stored value, and removes the key at 0 by destructuring;
- `clipLinearGain` and `clipLinearGains`.

Split, duplicate, trim, move and `deleteTime` are untouched.

**`graph.client.ts`** (5 hunks; no new `create*` call):
- the import of `clipLinearGains`;
- `ApplyScheduleOptions.clipGains?`;
- `ScheduleHandle.setClipGain`;
- `ScheduledSourceState.clipId`;
- the `clipGainTargets` Map seeded from options, with `startPlan` using it (`?? 1`);
- `setClipGain` (returns on disconnect or an equal target; otherwise `setTargetAtTime(v, now, 0.015)` on every non-ended state of that clip);
- the export passes `clipGains: clipLinearGains(arrangement)`.

The literal `applySchedule(ctx, planSchedule(arrangement, 0)` is kept, and there is no `setTrackGain` in the export.

**`clipboard.ts`:** `ArrangementClipboardItem.gainDb?`, plus three conditional spreads (`materialInWindow`, `copyClipsToClipboard`, the paste push). Nothing else changed.

**`ArrangementContext.tsx`:**
- the imports;
- `CLIP_GAIN_LABEL`;
- the interface member `setClipGain`;
- the `scheduleKey` replacer that drops `gainDb`;
- `startGraph` passes `clipGains`;
- the non-reschedule branch of `syncPlayback` calls `handle.setClipGain(clip.id, clipLinearGain(clip))` for every clip;
- the `setClipGain` `useCallback` (`refuseEditDuringGesture` → `false`, otherwise `applyEdit(setClipGainDb(historyRef.current.present, …), 'Clip Gain')`);
- `setClipGain` added to the value object and to the deps array.

**`ArrangementDetailPanel.tsx`:**
- 3 reason/status constants;
- the `model` import;
- the optional prop (§6.1);
- `clipGainInputText`;
- a second `useId`;
- the text state;
- a mount ref (`useLayoutEffect` cleanup);
- a re-sync `useLayoutEffect` on `clipGainDb`;
- the `commitClipGain` / `handleClipGainKeyDown` / `resetClipGain` handlers;
- the fourth `w-32` column;
- **post-review:** `onMouseDown={(event) => event.preventDefault()}` on the reset button (review fix 2);
- **post-review:** the `false` branch of `commitClipGain` reverts the text to the stored value, and the `უცვლელია` status formats the stored value (review fix 3).

The info column, waveform, range column and header are unchanged. No new colour or token.

**`StudioWorkspace.tsx`:** one line, `setClipGain={workspace.setClipGain}`.

**`detail-panel-polish.test.tsx`:** only the two queries in `detailLabelTexts` (`label:not([data-testid="arrangement-detail-clip-gain"] *)` and the same for `input`). Biome re-wrapped those two statements. The expectation lines are byte-identical; see `a-round-30/diff-polish.txt`.

**New files:** `clip-gain.test.tsx` and `docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md`.

The saved diffs are in `a-round-30/diff-part1.txt` (types, model, context, workspace, polish), `diff-graph.client.txt`, `diff-clipboard.txt` and `diff-ArrangementDetailPanel.txt`.

## 4. Code-reviewer (actual `code-reviewer` subagent)

The real `code-reviewer` subagent ran read-only over all 9 files plus the snapshots. Score: 8/10, no High findings. My dispositions:

1. **Medium — blur while clicking another clip with dirty text could show the gesture-blocked status.**
   - **Rejected with evidence.** In headless Chromium (§5.1), a real click on another clip with dirty `9` fired blur and focusout on the removed input.
   - Even so, there was **no** status and **no** entry. The clip's pointerdown `preventDefault` suppresses the mousedown focus move, selection changes first, and the blur from removal hits the `useLayoutEffect` mount guard.
   - No code change. C should still check it in real Chrome (R30-GK).
2. **Medium — `0 dB` with dirty text gave two entries, and could act on a reset that was disabled until the blur commit enabled it.**
   - **Fixed:** `onMouseDown={(e) => e.preventDefault()}` on the reset, so focus stays in the field. The dirty text is discarded, and the result is one `Clip Gain` entry to 0.
   - New UI test: "0 dB with dirty text keeps focus in the field …". It asserts `mouseDown` default prevented, one entry, and Undo back to 3.
   - Keyboard Tab to the reset still blurs the field (and commits), by the contract.
3. **Low — on a `false` return the field showed the normalised typed value.**
   - **Fixed:** on `false` the text reverts to the stored value, and the "უცვლელია" status now formats the stored value.
   - The optional-prop deviation is listed in §6.1 for B.
4. **Low — test gaps.**
   - Added "a blur with unchanged or normalised-equal text commits nothing and shows no status".
   - The unmount guard **cannot** be exercised in jsdom: jsdom fires no blur on removal, and React's event system is off during commit. Its evidence is the browser observation in §5.1 only. C mutation (i) does not cover it.
   - Loop wrap is covered only at the graph level; it is stated in §6.4.
5. **Low — the disabled reset has a `title` but no `aria-describedby`.** Not changed; the spec links only the input. Left for B.
6. **Info — retired graphs keep the old gain for ≤ the lookahead window.** Recorded in §6.5.
7. **Nit — `_previousGainDb` unused binding.** Kept. Biome is clean, and it is the advisor-recommended way to omit the key without `delete`.
8. **Nit — the status recomputes `normalizeClipGainDb`.** Kept; it is the same function the model uses.
9. **Nit — the `scheduleKey` replacer drops any `gainDb` key.** Kept, as B specified in §2.4. It is safe because `master` is not in the key array. This is recorded in doc 035.

After the fixes, re-run: tsc 0; full vitest **1161/1161** (node.exe 11); build ✓; Biome `./app` 218 warnings + 1 info; 69 OK; 69 status lines; protected 4/4.

## 5. Command tails (verbatim, `a-round-30/`)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-29-tree-sha256.txt   → 69 OK, 0 other lines
$ npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx   → before review: Tests 26 passed (26); final (green-final.txt): Test Files 1 passed (1) · Tests 28 passed (28)
$ npx vitest run <frozen list + clip-gain>   (node.exe 11)
 ✓ clipboard.test.ts (11) ✓ all-lane-clipboard.test.tsx (14) ✓ meter-ui.test.tsx (12) ✓ master-ui.test.tsx (18)
 ✓ track-meter-ui.test.tsx (11) ✓ render-budget.test.tsx (7) ✓ gesture-guard.test.tsx (19) ✓ detail-panel-polish.test.tsx (16)
 ✓ detail-panel.test.tsx (24) ✓ clip-gain.test.tsx (26) ✓ master.test.ts (17) ✓ graph.test.ts (19)
 ✓ ArrangementContext.test.ts (21) ✓ loop.test.ts (24) ✓ schedule.test.ts (12)
 Test Files  15 passed (15) · Tests  251 passed (251)   [before review fixes]
 final (frozen-list-final.txt, node.exe 11): Test Files  15 passed (15) · Tests  253 passed (253)
$ npx tsc --noEmit            → exit 0 (no output)
$ npx vitest run              (node.exe 11)
 Test Files  67 passed (67) · Tests  1159 passed (1159)   [= 1133 + 26]
  final, after the review fixes: Test Files  67 passed (67) · Tests  1161 passed (1161)   [= 1133 + 28]
$ npm run build               → ✓ built in 2.25s
$ npx biome check ./app       → Checked 336 files · Found 218 warnings · Found 1 info · 0 errors (= round 29)
$ npx biome check <9 owned code/test paths> → Checked 9 files · No fixes applied (0 diagnostics)
$ git status --short          → 69 lines = baseline 67 + "?? app/lib/arrangement/__tests__/clip-gain.test.tsx" + "?? docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md"
$ git diff --stat cc1e531 -- app/components/layout/Header.tsx → 1 file changed, 21 insertions(+)
$ diff -u snapshots/detail-panel-polish.test.tsx … → only the two queries (a-round-30/diff-polish.txt)
$ protected hashes            → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
$ tasklist | grep -ci node.exe → 13 (start), 12, 11 (vitest gates), 11 (end)
```

`npx biome check --write` ran **only** on my 9 owned code and test paths. It re-wrapped my new lines in `model.ts`, `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx`, `clip-gain.test.tsx` and the two polish queries. The snapshot diffs show no foreign hunk.

### 5.1 Browser smoke (not a PASS claim)

- **Setup:** gstack browse, state `a-browse.json`, the running `:5173/studio-lab`, 1440×900. Library `სრული მიქსი` → `＋ დამატება` → music 0–16. Then a real `$B click` on the clip; the detail panel was already open.
- **Field:** `0.0`, enabled; reset disabled.
- **Commit:** real click in the field, Ctrl+A, `$B type 6`, `$B press Enter`.
  - The field shows `6.0` and keeps focus.
  - Status: `Clip Gain: ღამის პულსი · სრული მიქსი — +6.0 dB.`
  - The Undo title is `Undo: Clip Gain`; the reset is now enabled.
- **Escape:** after typing `9`, a real Escape restored `6.0`. A later blur (a click on `＋ დამატება`) made **no** Clip Gain entry; the Undo title became the add.
- **§2.5 unmount, observed in headless Chromium:**
  - I attached `blur`/`focusout` listeners to the focused field, typed `9` (dirty), then gave a real `$B click` on the second clip.
  - The listeners counted **1 `blur` + 1 `focusout`** (counter `101`), so Chromium **does** fire blur when the focused input is removed during the remount.
  - **No commit happened:** the Undo title was unchanged (`დამატება …`), the status was unchanged, the new clip shows `0.0`, and the first clip still shows `6.0` after reselecting it.
  - Two things keep it inert: the `useLayoutEffect`-cleanup mount guard, and the fact that clip pointerdown selects first and claims a gesture.
- **A real click on the empty lane background** did not change the selection (the field kept `-3` and stayed enabled). I discarded that text with Escape, so nothing was committed.
- **Console errors:** only `ERR_CONNECTION_REFUSED` / `Failed to load cart` (the known anonymous CartContext call). There is no workspace error.
- **Screenshot:** not saved. browse refused a path outside its allowed roots, and I had already stopped it.
- **Cleanup:** `browse stop`; afterwards `a-browse.json` no longer exists. I killed no process.

## 6. Deviations and observations

### 6.1 Deviation: `setClipGain` prop is optional

§2.5 says "add `setClipGain: (…) => boolean`".
- With a **required** prop, `tsc` fails with TS2741 in two frozen tests that render `<ArrangementDetailPanel …>` standalone without it: `detail-panel.test.tsx(627,10)` and `track-layout.test.tsx(1154,10)`. B's probe covered the type and handle changes but not this prop.
- To avoid editing frozen tests, I declared it `setClipGain?:`. `StudioWorkspace` always passes it, so runtime behaviour in the product is unchanged.
- Without the prop, a commit returns falsy: Enter shows `Clip Gain უცვლელია`, and the reset shows the same.
- **B: confirm or amend.** The alternative would be a frozen-test amendment adding `setClipGain={() => false}` in those two files.

### 6.2 Addition beyond the §2.5 text, for B to confirm: the reset's `onMouseDown` preventDefault

This changes the pointer behaviour of `0 dB` with dirty text from two entries to one. The keyboard path is unchanged.

### 6.2a `0 dB` with dirty text

Before the review, a pointer click on `0 dB` with changed text in the field committed twice: the blur committed the typed value, then the click reset it. After review fix 2, the reset's mousedown keeps focus in the field, so a pointer click discards the dirty text and makes **one** entry. Keyboard Tab then Enter still blurs first, which commits the typed value, then resets: two entries, by the contract.

### 6.3 Pending Volume preview

`previewTrackVolume` followed by `setClipGain` gives the Undo label `Clip Gain` on top and `Volume` beneath it. This is tested in the provider block.

### 6.4 Gain on a clip with no live source while playing

The handle stores the value in its Map only, and a later `appendPlan` or `startGraph` reads it.
- Loop wrap: iteration sources appended after the commit read the stored value. This is unit-tested, but not measured in a browser.
- A source that is stopped but not yet ended (stopAt in the future) still receives the ramp; this is harmless.

### 6.5 Retired graphs

After a reschedule, the retired graph keeps its gains for its ≤ 0.25 s grace. `setClipGain` reaches only the current handle.

### 6.6 Undo of a paste that carried gain

That is a history snapshot restore. Gain is not part of `scheduleKey`, but a paste changes clips, so it reschedules and the new graph is seeded from `clipLinearGains`. This is covered by the structure only; there is no dedicated test.

## 7. Known gaps

- No browser measurement of the export ratio, the meters or loop seams. Those are C's R30-GE/GV/GL.
- The Ableton compliance verdicts are C's (§4.6).
- No mutation runs by A. Those are C's R30-U, in a scratch copy.
- The R30-GUI geometry and Tab order are not measured by A. By DOM order the Tab order is start → end → `მონიშვნა` → Clip Gain → `0 dB`.

## 8. Exact next C checks

- **G30-1/2/3:** re-run §5 yourself. Expect vitest **1161**, tsc 0, build ✓, Biome 218 warnings + 1 info, 69 OK, **69** status lines, protected 4/4, Header +21/−0.
- **R30-S:** `diff -u` against `b-round-29-snapshots/`. Expect exactly the hunks in §3, and confirm §6.1 (the optional prop).
- **R30-U mutations (scratch copy outside `store/`). Expected catches:**
  - (a) `startPlan` ignores `clipGains` → graph test "clipGains sets …" and the provider test "starts the graph with clipGains";
  - (b) `setClipGain` does not store into the Map → "a source appended later … starts at the stored gain";
  - (c) `scheduleKey` includes `gainDb` → the provider test "does not reschedule" (graphs/sources count);
  - (d) `gainDb: 0` kept → the model test "setting 0 removes the key", the UI reset test and the provider Undo test (`Object.hasOwn`);
  - (e) the clipboard drops `gainDb` → "copy by clips, copy by range and Cut Time carry gainDb";
  - (f) a video clip accepted → the model test "same object" (`'v'`) and the provider test "unchanged value or a video clip";
  - (g) the export omits `clipGains` → the source-scan test;
  - (h) no rounding → the model tests `6.04 → 6` and `-6.06 → -6.1`, and `3.04` same-object;
  - (i) the panel commits on Escape-then-blur → the UI "Escape reverts …" test. Note: the mutation must make Escape not revert the text, or must make blur ignore the text-equality check.
- **Browser:** R30-GE (Master −12, music solo, E0/E+6/E−6), R30-GV/GL (hooks), GH/GK/GD/GN, R30-GUI at 1440 and 1280 (no overflow, info 288, waveform ≥ 128, footer/scroller = R29-FT), R30-GC, R30-K, R30-R and R30-Doc.
- **Carried:** C-R23-01 NUL record; C-R27-01; C-R6-02; C-R8-01.

## 9. Scope completed and B acceptance criteria

The A scope in §2.1–§2.9 is implemented, with the one deviation in §6.1.

What I can truthfully state from my own runs:
- **§2.9:** ≥ 16 new `it` (28 final). Red-first was shown on the snapshot sources with 26 (25 red + 1 guard). All 28 are green after the implementation.
- **G30-1 (A-side):** tsc 0; vitest 1161/1161, 0 failures; build passes; Biome 0 errors with 218 warnings + 1 info; the 14 listed frozen tests green (with the amended polish test 16/16).
- **G30-2 (A-side):** 69 OK; 69 status lines with exactly the 2 new lines; protected 4/4 OK; Header +21/−0.

**Not claimed:** any R30-* browser ID, the export numbers, the meters, the loop, the GUI geometry, the Ableton verdicts, G30-3. The backlog is **not** complete.

## 10. Carried, unchanged by A

- **Open C bugs:** C-R27-01, C-R23-01, C-R6-02 and C-R8-01.
- **Open low items:** R26-M1, the Master hold tick, DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, R9-REVIEWER-M1-L8, A-R29-REVIEW-1 and DOC034-UNREACHABLE-NOTE.
- **Root items** (`root-pre-push-review.md` / `publication-checkpoint.json`):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS (no limiter);
  - the final commit/push after everything, and the uncommitted tree (now 69 lines);
  - the shared `Modal.tsx` focus gap;
  - root GA `scroll` with consent denied;
  - the two foreign agent files;
  - the earlier A/C deviations listed by B;
  - the fake Bearer gets 500;
  - the CDP allowlist;
  - the publication-checkpoint requirements;
  - `Content-Type` without a charset;
  - the dev server repeatedly down at A/C start (it was **up** for A this round).
- **Tech Lead manual: new R30-T.** No click or zipper on a live gain change, and +6 dB audible on one clip only.
