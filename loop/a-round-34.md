# A — Round 34 report (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR; D-29y)

Implementer: A (Claude Opus 5.5) · 2026-10-13 · Working dir `C:/Apps/czaba-project/store` · No commit/push/stash. **No PASS claim** — C verifies.

Gate outputs: `a-round-34/` (`red.txt`, `green.txt`, `frozen.txt`, `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `final-gates.txt`, `diff-*.txt`, `smoke.txt`, `node-count-*.txt`).

## 1. Pre-flight gate

**Read before the first edit:** `.claude/rules/read-primitives.md`; the primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES (with the regression acceptance rule), BUG_HUNTING_TESTS and GEORGIAN_DOCS, all in full; `prompts/studio-feature.md`; `skills/pre-flight/SKILL.md`. The hook also injected DESIGN_TOKENS and TAILWIND_FIRST. No styling was changed.

**Baseline (before any edit):**
- HEAD `1cefea18500ac98c523caae6bf9626c811254b9e` (root had not committed);
- `git status --short` = the 9 lines;
- tree sha256: 0 not-OK (376 OK);
- snapshots: StudioWorkspace `be01135c`, fader-guards `9a973aef`, doc 036 `91c1547b`, all matching;
- protected 4/4 OK;
- node.exe 7.

**Assumptions:**
- Exactly one predicate change, in the capture handler.
- The Clip Gain commit comes from the existing `onBlur`, which React runs synchronously inside `focused.blur()` in the capture phase. That happens before `ArrangementClip.beginGesture` claims the pointer and calls `selectClip`.
- `updateHistory` writes `historyRef` synchronously (ArrangementContext l.583–586), so a following clip gesture's `before = getArrangement()` already contains the new gain. A later move cannot overwrite it; a self-check test covers this.

**Smallest version:** 1 module helper (`isScrollerGutterPointer`, 10 lines) plus a 2-line predicate change and the rename (its JSX use updated).

**Files:** only the 3 owned files, plus this report.

**§1.4 grep results:**
- **Typing targets inside the scroller subtree: none.** The scroller (StudioWorkspace l.1376–1452) contains only `ArrangementRuler`, `ArrangementLoopBrace`, `ArrangementLane`×N, the marquee and `ArrangementPlayheadLine`. In ArrangementLane/Clip/Ruler/LoopBrace, the only `<input>`s are `type="file"` (l.567) and `type="range"` (l.580, l.625), plus buttons. `ArrangementDetailPanel` renders after the scroller closes (l.1441), so it is outside.
- **Frozen tests that conflict: none.** No test asserts that a text field keeps focus after a timeline pointerdown, or that a typed Clip Gain is discarded:
  - `detail-panel-polish.test.tsx:295` focuses `start` with no pointerdown;
  - `detail-panel.test.tsx:258` and `floating-video.test.tsx:544` press a clip header during another gesture, with no text field focused.
- **Fixture:** `fader-guards.test.tsx` renders the real `StudioWorkspace`, which includes the detail panel. After `selectSfxClip()`, the Clip Gain input (`arrangement-detail-clip-gain-input`) is enabled with value `0.0`, and every Clip Gain test asserts this in `typeClipGain`. No ownership widening was needed.

## 2. Red-first, then green

**Red:** the tests were appended and run against the unchanged `StudioWorkspace.tsx` (sha `be01135c` verified immediately before the run). `red.txt`: 52 tests, **12 failed**.

| # | Case | Snapshot result | Why |
|---|---|---|---|
| 1 | search → SFX header → Delete | **FAIL** | the search kept focus (`expected <input type="search"> not to be …`) |
| 2 | … → Backspace | **FAIL** | same |
| 3 | search → empty lane | **FAIL** | same |
| 4 | Clip Gain `3` → music header | **FAIL** | `expected null to be 'Clip Gain'` after the pointerdown |
| 5 | Clip Gain `3` → same SFX header | **FAIL** | the Clip Gain input kept focus |
| 6 | Clip Gain `3` → empty lane | **FAIL** | `expected null to be 'Clip Gain'` |
| 7 | unchanged text → music header | pass | exclusion (0 entries either way) |
| 8 | empty text → music header vs plain blur | **FAIL** | status stayed the demo-ready text instead of the invalid status |
| 9 | detail start → header | **FAIL** | the start field kept focus |
| 10 | gutter, search | pass | the old code never touched text fields (labelled: snapshot-dependent) |
| 11 | gutter, music Volume | **FAIL** | the old code blurred Volume (`activeElement` was BODY) |
| 12 | scroller client box, search | **FAIL** | the search kept focus |
| 13 | regression: Backspace without a click | pass | regression |
| SC-a | clip drag with the search focused | **FAIL** | the search kept focus |
| SC-b | Clip Gain `3` → drag | **FAIL** (first version, music clip) | see §6 deviation 2 |

**Green** (after §2.1): first run 51/52. SC-b failed for a jsdom-layout reason: the music clip was dragged into the `sfx` lane (see §6). After the fix to SC-b: `green.txt`: **52/52 passed** (37 existing + 15 new). After code review, 2 more tests were added; the final run was **54/54 passed** (37 + 17). `green.txt` was overwritten and holds only that final 54/54 run. The 52/52 intermediate run was observed in-session only.

## 3. Diff summary

`app/components/arrangement/StudioWorkspace.tsx` (`diff-StudioWorkspace.txt`, 3 hunks):
1. **New module helper `isScrollerGutterPointer(event)`** (after `isRangeInputTarget`):
   - it returns false unless `event.target === event.currentTarget`;
   - otherwise it computes `x = clientX − rect.left − clientLeft` and `y = clientY − rect.top − clientTop`;
   - it returns `x ≥ clientWidth || y ≥ clientHeight`.
2. **Handler:**
   - renamed `releaseFaderFocusOnTimelinePointerDown` → `releaseEditFocusOnTimelinePointerDown`;
   - the predicate changed from `isRangeInputTarget(focused)` to `(isRangeInputTarget(focused) || isTypingTarget(focused))`;
   - `!isScrollerGutterPointer(event)` was added before the gesture check;
   - nothing else changed: no `preventDefault`/`stopPropagation`, no status, no focus moved.
3. **The single JSX use** `onPointerDownCapture={releaseEditFocusOnTimelinePointerDown}`.

`isTypingTarget`, `isSliderTarget`, `isRangeInputTarget`, the keydown handler, the round-32 guard and `handleLaneBackgroundPointerDown` are byte-identical.

`app/lib/arrangement/__tests__/fader-guards.test.tsx` (`diff-fader-guards.txt`):
- **append only**: `cmp` of the first 901 lines against the snapshot is identical, and the diff has 0 removed lines;
- one new `describe` inside the outer one, with 17 `it` (15 + 2 from the code review) and local helpers (`stubClipCapture`, `textField`, `editParts`, `clickClip`, `pressOnActive`, `stubScrollerGeometry`, `typeInSearch`, `typeClipGain`, `sfxGainDb`);
- no existing helper was changed;
- `npx biome check --write` was run on this file only; it reformatted one signature in my new lines.

`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` (`diff-doc036.txt`):
- the header status line (l.4) changed;
- `## Round 34 — timeline-ზე click ტექსტურ ველსაც ათავისუფლებს` was appended (l.309–385). It covers:
  - both bugs: steps and cause (the keyed remount l.801, no blur on a removed element, `isContentMountedRef`);
  - why the capture blur fixes both;
  - the 4 conditions, the gutter geometry and `scrollbar-gutter: stable`, the empty area, and the jsdom zero-size note;
  - decisions 2, 4, 5 and 6;
  - the round-33 residual correction (A-R33-REVIEW-SCROLLBAR is code-review-only, not reproduced, so the rule is preventive and R34-T is the real check);
  - the tests, red-first and the C IDs;
  - the Ableton note (all 3 rows unconfirmed; §18.1 double-click is still 4b).
- Earlier sections are untouched.
- An interrupted heredoc briefly truncated my own appended text. It was completed with Edit, and only my new lines were affected (the diff shows 1 changed line, the header, and the append).

## 4. Code review

The real `code-reviewer` subagent ran, read-only. Score 8/10, no critical issues, and it found the code matches §2.1 term for term. It confirmed by reading:
- the commit timing (capture blur → `onBlur` → synchronous `historyRef` before `beginGesture`/`claimPointerGesture`; render-closure `selection`);
- no other typing target in the scroller;
- the first 901 test lines are unchanged.

| # | Severity | Finding | Disposition |
|---|---|---|---|
| R1 | Medium (contract gap, not an A defect) | A typed Clip Gain + a press on the music **Volume/Pan** (range, inside the scroller): no capture blur (range target). The range claims the gesture, then the browser moves focus natively, `commitClipGain` hits `isPointerGestureActive()`, shows `GESTURE_EDIT_BLOCKED` and restores the old text, so the value is lost (with a status). The Master range outside the scroller is the same. Suggested: `!(isRangeInputTarget(focused) && isRangeInputTarget(event.target))`. | **Not changed.** §0 row 3 says "range target → no blur by the new code (unchanged)". New ID for B: **A-R34-REVIEW-1**. Found by reading code only, not run in a browser. Documented in doc 036's residual list. C can record it (synthetic: Clip Gain `3` → a real click on music Volume). |
| R2 | Low | RTL: the left scrollbar (`x < 0`) is not counted as gutter. | **Not changed.** §2.1 prescribes exactly `x ≥ clientWidth \|\| y ≥ clientHeight`, and the UI is LTR. Documented as a residual. |
| R3 | Low | Overlay scrollbars (Firefox macOS/Win11): 0 px client-box gutter → a scrollbar press could blur the search. | Documented in doc 036. Suggest a **Firefox variant of R34-T(3)** to B/Tech Lead. |
| R4 | Low | The touch residual now also covers text fields (search keyboard closes, Clip Gain commits on scroll start). | Documented in doc 036 (A-R33-REVIEW-TOUCH widened; still 4b). |
| R5 | Low | The gutter tests did not kill a "drop `clientLeft`/`clientTop`" mutation. | **Fixed:** new test `review: the gutter boundary subtracts the scroller border` (x = 499 blur / 500 keep at clientX 600/601; y = 300 keep at clientY 351; 299 blur at 350). Suggest adding mutation (g) "drop the border terms" to R34-U. |
| R6 | Low | No gesture-exclusion test with a **text field** focused (only round 33's fader test kills mutation (e)). | **Fixed:** new test `review: during an active Pan drag a clip header pointerdown keeps the search focus`. |
| N | Nit | `event.button` ignored (a right press commits Clip Gain); `rect − clientLeft` under `transform`/zoom and sub-pixel; `as const` precedent; `pressOnActive` duplicate; `firstElementChild` header. | No change (close to native behaviour, same patterns as round 33). Recorded. |

The two review tests were added after implementation and **not run on the snapshot**. By mechanism:
- R6 is snapshot-green, since the old code never blurred text fields;
- R5's x = 499 row is snapshot-red, since the old code did not blur a text field.

Neither was observed on the snapshot.

## 5. Command tails (verbatim)

```
$ git rev-parse HEAD
1cefea18500ac98c523caae6bf9626c811254b9e            (start and end)
$ sha256sum -c ../tmp/studio-real-loop/b-round-33-tree-sha256.txt | grep -vc ': OK$'
0
$ npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
 Test Files  1 passed (1)
      Tests  54 passed (54)   (final run, after the review tests)
$ npx vitest run clip-gain detail-panel track-pan delete-selection-ui all-lane-clipboard track-layout gesture-guard master-ui ArrangementContext render-budget detail-panel-polish   (full paths, see frozen.txt)
 Test Files  11 passed (11)
      Tests  222 passed (222)
$ npx tsc --noEmit
tsc exit 0
$ npx vitest run            (node.exe 7 at start)
 Test Files  69 passed (69)
      Tests  1247 passed (1247)        (= 1230 + 17; final re-run after the review tests; tsc 0, build exit 0, Biome 2 baseline errors + 218 warnings + 1 info, tree 0 not-OK, protected 4/4, status 9 lines, all re-checked)
$ npm run build
✓ built in 2.64s   (exit 0)
$ npx biome check ./app
Checked 338 files. Found 2 errors. Found 218 warnings. Found 1 info.
  errors (--diagnostic-level=error): app\lib\__tests__\bug-hunting\auth-bugs.test.ts format; app\lib\auth.ts format   (baseline CRLF, root's)
  0 diagnostics in StudioWorkspace.tsx / fader-guards.test.tsx
$ git status --short
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/graph.client.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/lib/arrangement/__tests__/fader-guards.test.tsx
?? app/lib/arrangement/__tests__/track-pan.test.tsx
?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
$ protected
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ tasklist | grep -ci node.exe
7 (start) · 7 (before the first full vitest) · 8 (while my gstack browse server ran for the smoke; I stopped it afterwards) · 7 (final gate re-run)
```

**Browser smoke** (one allowed run; gstack browse, state `a-browse.json`, `http://127.0.0.1:5173/studio-lab` answered 200, 1440×900; **not a PASS claim**; `a-round-34/smoke.txt`):
- I added `Soft impact` via a library click + Enter. It landed on the music lane at 0.
- A real click on the search, then `type ab` → items 9 → 4, active = `ბიბლიოთეკაში ძიება`.
- A real click on the clip header → active BODY, search `ab`, items 4.
- Backspace → clips `[]`, `Undo: კლიპის წაშლა`, status `კლიპი წაიშალა; სიცარიელე დარჩა.`, search still `ab`.
- Ctrl+Z → the clip is restored.

## 6. Deviations and self-check

**Deviations:**
1. **Test count.** 17 new `it` (B's cases 1–13, with 1 and 2 as one `for` loop over Delete/Backspace; 2 self-checks; 2 added after the code review). This is ≥ 12.
2. **SC-b rewritten after the red run.**
   - The first version dragged the music clip. In jsdom (no layout) the music clip hit-tested into the `sfx` lane: `['m1','sfx',8,12]`. This is a test-construction artifact, unrelated to the fix.
   - It now drags the **same SFX clip** whose gain was just committed. That is the stronger check: the move's `before` snapshot includes the new gain, `s1` ends at `['s1','sfx',5,2]` with `gainDb 3`, and history is `Clip Gain` + move.
   - The rewritten version was **not** re-run on the snapshot. By mechanism it would fail there at `expect(undoLabel).toBe('Clip Gain')` after the pointerdown, as case 4 did. This is not observed.
3. **Case 8 text.** The text is the empty string. jsdom's `type=number` turns non-numeric text into `''`, and the existing blur rejects it with `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).`. The test runs a plain `fireEvent.blur` control in a first mount and compares status and `undoLabel` exactly.
4. **Case 13.** jsdom performs no default edit on keydown. The test asserts that `keyDown` is **not prevented**, that focus stays, and that the arrangement object and history are unchanged. "The text edits" is inferred, not observed.
5. **History order.** `undoChainLabels` returns newest-first, so `[კლიპის წაშლა, Clip Gain]` in the tests equals the chronological tail `[Clip Gain, კლიპის წაშლა]` of the task.
6. **jsdom geometry.** With unstubbed geometry (`clientWidth === 0`), **every** pointerdown whose target is the scroller itself counts as gutter. No existing test presses the scroller directly. C's scratch mutations (b) and (c) need the stubbed tests 10–12, which stub per instance. This is documented in doc 036.
7. **Case 11** also presses a bottom-gutter point (`y ≥ clientHeight`) before the right-gutter point.

**§2.4 self-check:**
- A clip drag started while the search is focused moves the clip with one entry and keeps `ab`: **green** (SC-a).
- Clip Gain Enter commit and Escape revert still work: the frozen `clip-gain.test.tsx` is **green** (in `frozen.txt`, 222/222 across 11 files).
- Round 33's 18 tests: **green and byte-identical** (first 901 lines identical).
- Backspace in the search with no click is left to the field: **green** (the existing round-33 self-check and new case 13).

## 7. Known gaps and next C checks

**Known gaps:**
- **The gutter rule is preventive.** Headless shows a 0 px scrollbar, so only the Tech Lead's R34-T (3) can confirm it with a real scrollbar.
- **Touch scroll on the timeline** still blurs a fader or text field on pointerdown. This is A-R33-REVIEW-TOUCH, stage 4b. For text fields, a touch scroll now also releases the search focus.
- **Decision 6 hazard (accepted by B):** search text → clip click → Backspace deletes the clip (undoable).
- **CG-6 (live audio)** is not covered by unit tests. The commit uses the existing `setClipGain` → `applyEdit` → `syncPlayback` path, unchanged.

**Exact next C checks:**
- G34-1/2/3;
- R34-TS (all rows, Delete and Backspace, 1280×720 spot);
- R34-CG (CG-1..CG-6 + unchanged Enter/Escape/0 dB);
- R34-SB (record the geometry; empty-area check if any);
- R34-R33;
- R34-K (incl. record-only outside-scroller);
- R34-S (`diff -u` of the 3 snapshots);
- R34-U mutations (a)–(f) in a scratch copy:
  - expected: (a) → 1–6, 8, 9, 12, SC-a/SC-b and the R5 boundary test (x = 499 row) fail;
  - (b), the gutter condition removed with the rest of the new predicate kept → 10 and 11 fail;
  - (c) → 12 fails;
  - (d) → 4–6, 8, 9 and SC-b fail (Clip Gain and detail start are `type=number`);
  - (e) → round 33's gesture test and the new R6 test fail;
  - (f) → 4–6 and SC-b fail;
- R34-U, suggested extra mutation (g): drop `clientLeft`/`clientTop` in `isScrollerGutterPointer` → the review boundary test fails;
- R34-Doc;
- the Ableton two-verdict table;
- **for B:** new finding **A-R34-REVIEW-1** (Medium, from code reading; see §4 R1). A typed Clip Gain followed by a press on a track Volume/Pan/Master range is reverted with the gesture-blocked status. C may record it once (Clip Gain `3`, no Enter → real click on the music Volume).

**Root follow-ups carried** (from `root-pre-push-review.md`, `publication-checkpoint.json` and §4.8):
- rounds 31–33 are ready for root's checkpoint; round 34's 3 files are not yet C-verified;
- SRW-21 middle-east hardcode;
- Lenis on `/studio/*`;
- portable instruction paths;
- the export hard-clip;
- the CRLF Biome errors on the auth files;
- the `frontend-architect.md` Write/Bash grant;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer gets 500;
- the CDP allowlist;
- `Content-Type` without a charset;
- dev-server availability.

## 8. Scope completed

- §2.1, §2.2 and §2.3 are implemented.
- §2.4: the self-check, Biome (scoped write + read-only app), tsc, vitest, build and smoke were run. The code review is in §4.
- No B acceptance criterion is marked passed by A. All of §4 is C's.
