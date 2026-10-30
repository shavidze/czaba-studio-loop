# Round 266: fix-up of SABA-B-11c stage 1. Ctrl+E on a time selection that crosses a clip edge (C-R265-01, Medium) + the "how to make a time selection" copy (C-R265-02, Low)

**Planned by:** B, at the round 265 → 266 planning, 2026-10-30. **Decisions:** D-29z559 (round-265 result), D-29z560 (split rule + Saba question), D-29z561 (copy), D-29z562 (rulings on A's notes), D-29z563 (grants, freeze, doc 198), D-29z564 (outcome table), D-29z565 (signals, checkpoint addendum, RETRO candidate).
- **Read first:** `lessons.md` in full. These apply directly:
  - L10 (B rules on every open note, §2.4);
  - L11 (STOP);
  - L12 (no class selectors);
  - L23 (the collisions below come from B's scratch run of the whole sketch);
  - L28 (doc 198 l.4);
  - L29 (claims, §7);
  - L47/L50 (focus, §2.5);
  - L51 (status writes, §2.2).
- **Previous task:** `tasks/round-265.md` (an exact copy of the round-265 `current-task.md`). C's result: `c-round-265.json` = **FAIL**. Every §4 row passed (20 rows, `browserVerified` true), but one Medium regression the round caused in a §3 neighbour: C-R265-01. Gate: `gates/gate-round-265.json` = `skipped` ("C taskStatus FAIL"). B's reasoning: `b-round-265.md`.
- **What this round is:** a bounded fix-up of the same feature stage. It is not a redo. A's round-265 work stays in the working tree, frozen byte for byte, and C's 20 passing rows are carried (§4).

## Baseline: HEAD `2ea196e` + A's uncommitted round-265 diff
- The gate skipped round 265, so HEAD is still `2ea196e…` (gate 264's published commit) [K1].
- The working tree holds A's round-265 diff: 9 ` M` files and 2 `??` files (`b-round-265/git-status-at-planning.txt`) [K1]. `git diff` of the 3 component sources is byte-identical to C's evidence `c-round-265/source.diff` [K2].
- **Frozen:** every tracked file plus the 2 untracked files, except the 7 grants: **1,118** entries in `b-round-265-r266-tree-sha256.txt`, hashed on the working tree. That includes A's round-265 files at their round-265 content (`StudioWorkspace.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `shortcuts.ts` and the 5 rewritten tests). From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-265-r266-tree-sha256.txt` returns rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K3].
- **Grant (edit):** `b-round-265-r266-grants.txt`, 7 files [K3]:
  - `app/lib/arrangement/model.ts` (only `splitClipsByRange`); [K3]
  - `app/lib/arrangement/__tests__/model.test.ts` (the `splitClipsByRange` describe block); [K3]
  - `app/contexts/ArrangementContext.tsx` (only the range branch of `splitSelection`); [K3]
  - `app/lib/arrangement/strings.ts` (only `rangeMissingReason`, `needsSelection` and the new `splitRangeClipsDone`); [K3]
  - `app/lib/arrangement/__tests__/strings.test.ts` (only ST1, ST8, ST10 and the formatter rows for the new key, §2.6); [K3]
  - `app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` (A's round-265 file; new rows only, its BT1–BT9 rows unchanged); [K3]
  - `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md` (l.4 and the sections that describe Split, §2.7). [K3]
- **No new files.** Implementation doc 198 is reused (L28: a re-dispatch rewrites its l.4).
- **Not granted:** everything else. That includes the 4 round-265 sources, the 5 round-265 rewritten tests, `ArrangementContext.test.ts`, `delete-selection-ui.test.tsx`, `perf/**`, `e2e/**`, `package.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files. [K3]

## 0. Why this round
- **The bug gate.** C-R265-01 is a Medium regression caused by round 265: the same gesture + Ctrl+E split the clip at HEAD and refuses after the removed clamp (`c-round-265/nb-head.json` vs `split2-after.json`). The policy fixes such regressions before the feature counts as done. The pre-fixed outcome (`tasks/round-265.md` §5, "A Medium+ finding in a §4 row → a fix-up, ≤ 3 related bugs") applies. Under C's verdict, the finding sits in a §3 neighbour, not a §4 row; the fix-up rule is the same.
- **Why the grants change.** The cause is in `splitClipsByRange` (`model.ts`), which round 265 did not grant. C called it a planning gap. B confirmed it: §3 of round 265 named "Ctrl+E split at a range … on a range that spans a gap" as at risk, but §4 had no row and B's scratch pre-check did not run that sequence (RETRO-275 candidate RC-R265-AT-RISK-NO-ROW, D-29z565).
- **The bundle (≤ 3 related bugs):**
  1. C-R265-01 (Medium);
  2. C-R265-02 (Low). It is the same "where a time selection comes from" change, it lives in `strings.ts`, which this round must own anyway for the new split copy, and it costs two literals. The policy lets a Low be fixed early when the round owns the code and it is cheap. It also closes B-R264-RANGE-HOW-COPY (the same root cause, L7).
- **Not in this round:** GATE264-S2 (AltGr, different root cause; next bug round). REGRESSION is due on or after 2026-11-02, so not yet.

## 1. Reference: how Ableton Live 12 does it (checked 2026-10-30)
Sources:
- **[AV]** Live 12 manual, Arrangement View, https://www.ableton.com/en/live-manual/12/arrangement-view/ §6.12 "Splitting Clips", fetched by B on 2026-10-30;
- **[SC]** Live 12 manual, Live Keyboard Shortcuts, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/ §42.16 and §42.12, read by the `ableton-arrangement-expert` consult from the saved capture `b-round-71/ableton-shortcuts-20261021.txt` (2026-10-30);
- **[FORUM]** community forum posts found by B's WebSearch (forum.ableton.com threads "Splitting multiple tracks in arrangement view"). **Not a source** under the reference-first rule; listed only as a community report.

No hands-on Live session was available.

| Behaviour | Source | What the source says | CZABA, this round | C row |
|---|---|---|---|---|
| Split inside one clip at the insert marker | [AV] 6.12 (confirmed) | "Clicking within a clip and using Ctrl+E … divides the clip at that point." | Unchanged (marker path) | none (K22 of round 265 still holds) |
| Split a time selection inside one clip | [AV] 6.12 (confirmed) | "isolate a specific portion within a clip by dragging over the desired area of the clip's waveform … then using the same shortcut … to separate out that selection into a new clip." [SC] 42.16: "Split Clip at Selection — Ctrl E / Cmd E" | Unchanged: cut at both edges, the middle part is selected | SPLIT-IN-CLIP |
| Selection starts outside the clip and ends inside it | **unknown** (expert: "UNKNOWN"; its guess: split only at the edge inside the clip) | none | **Default D3:** cut at every selection edge that lies inside the clip | SPLIT-PAST-START, SPLIT-BG-INTO-CLIP |
| Selection over a gap touching two clips | **unknown** ([FORUM] reports that Live cuts every covered clip) | none | **Default D3:** each clip on the lane is cut at the edges inside it; the parts inside the selection are selected | SPLIT-GAP-2 |
| Selection covers a whole clip, both edges outside | **unknown** (expert's guess: the clip stays unchanged) | none | Default D3: no edge inside any clip → the existing refusal | SPLIT-NO-EDGE |
| Selection over empty space only | **unknown** | none | The existing refusal | SPLIT-NO-EDGE |
| Selection on all tracks | **unknown** ([AV] 6.14.2 confirms "Splitting" for **linked** tracks only) | none | Unchanged: refused (`splitAllTracksRefused`). Asked to Saba as a separate question, not built | none |

### Deviations and defaults (each one goes to Saba once, L44)
- **D3, SABA-Q-11C-SPLIT-SPAN (D-29z560):** written to `user-review/questions-11c.md` §4. Until Saba answers, D3 is the implemented default. It is the smallest rule that (a) restores HEAD's result for the gesture C-R265-01 found and (b) agrees with how the model already treats a range that crosses clips: `deleteRangeKeepingGap` and `deleteTime` cut every clip at the range edges, and the multi-clip split at the insert marker selects every right part. Options (b) one clip only and (c) always refuse are listed for Saba.
- **The all-tracks refusal** stays. Whether Split should cut every lane is a separate question in the same §4. It is a feature request, not this bug.

### Why we missed it
- Round 265 §3 listed "Ctrl+E split at a range … on a range that spans a gap" as at risk, but no §4 row exercised it.
- B's scratch pre-check ran the test suite on the sketch. No unit or UI test pins Ctrl+E on a range that crosses a clip edge, because before round 265 the drag could not produce one. So the suite stayed green.
- The rule that would have caught it: every command named in §3 as at risk gets one browser row with the changed gesture, run by B on the sketch at planning (RC-R265-AT-RISK-NO-ROW, a RETRO-275 candidate for L23).

## 2. A: what to do
### 2.1 `splitClipsByRange` (`model.ts`), rule D3
- **Today:** it picks the first clip on `range.trackId` that fully contains the range, and returns `null` when there is none [K4].
- **New:**
  - **Targets:** every clip on `range.trackId` that overlaps the open range: `clip.start < range.end − ε` and `clipEnd(clip) > range.start + ε` (ε = `ARRANGEMENT_EPS`, as today).
  - **Per clip:**
    - `a = max(range.start, clip.start)` and `b = min(range.end, clipEnd(clip))`;
    - skip it when `b − a < MIN_CLIP_DURATION` (as today);
    - cut at `a`, then at `b`, with the existing `splitClipAt`, which already refuses a cut closer than `MIN_CLIP_DURATION` to an edge [K4].
  - The inside part of each target (the middle piece, or the whole clip if neither cut happened) is collected in clip order.
  - **Result:** `{ arrangement, middleIds: string[] }`, or `null` when **no** cut happened on any clip. A clip that lies fully inside the range, with no cut, is not a reason to succeed on its own.
- The function name stays. `middleId` becomes `middleIds`. Its only caller is `splitSelection` [K5].
- B's sketch of exactly this is `b-round-265/sketch.diff`. It is B's evidence, not code for A to copy.

### 2.2 `splitSelection`, the range branch (`ArrangementContext.tsx`)
Only the range branch changes [K5]. The all-tracks refusal, the multi-clip marker branch and the single-clip marker branch stay byte-identical.

| Result | Selection | Status | Range | History |
|---|---|---|---|---|
| `null` | unchanged | `splitRangeFailed` "Could not split at the time selection." (unchanged) | kept | none |
| 1 inside part | `setSelectedClipId(id)`, as today | `splitRangeDone` (unchanged text) | cleared | one entry `historySplitRange`, as today |
| ≥ 2 inside parts | `setSelection(middleIds)`, like the marker branch's `setSelection(result.rightIds)` [K5] | **new** `splitRangeClipsDone(count)` = `Clips split at the edges of the time selection; the ${count} parts inside it are selected.` | cleared | one entry `historySplitRange` |

**L51 (status writes).**
- **Overwrites:** the new write lands on the same status line as `splitRangeDone`/`splitRangeFailed` today. Before it, the line shows the last action (an add, a delete or the ready text); C's rows read the final text after the key.
- **Lifetime:** it is replaced by the next action's status, as `splitRangeDone` is today. No new clearing code is added.

### 2.3 Copy (`strings.ts`, C-R265-02)
| Key | Old [K6] | New | Why |
|---|---|---|---|
| `rangeMissingReason` (export dialog) | `Make a time selection in the Arrangement (drag on a clip or on the ruler)` | `Make a time selection in the Arrangement (drag in a lane)` | A drag on the lane background or on a clip makes a range. **No ruler code sets a time range:** the only non-null range writers are the clip gesture, the lane background and the details panel [K7]. So "on the ruler" was already untrue at HEAD. "Drag in a lane" matches the sheet row `select-time` "Drag in a lane" from round 265. |
| `needsSelection` (Ctrl+L without a range) | `To set a loop, first make a time selection on the waveform.` | `To set a loop, first make a time selection (drag in a lane).` | Same reason. |
| `splitRangeClipsDone` | none | the formatter in §2.2 | New status. |

- **Left alone:** `splitRangeDone`, `splitRangeFailed`, `splitRangeTitle` and `needsSelectionTitle`.
- **`rangeInvalid` (l.808 [K6])** belongs to the details-panel numeric range entry, which is not granted. It is a signal and a question, not this round (§2.4).
- **L3 (longest state):** the new export reason is shorter. B measured the reason box at both viewports: HEAD 390 × 16 px (1 line), sketch 310 × 16 px (1 line) (`b-round-265/probe-split-*.json` G). C row COPY.

### 2.4 B rulings on round 265's open notes (L10, D-29z562)
1. **A's deviation from §2.1 item 1 of round 265 is accepted.** On the background path, any `end === start` after ms rounding gives no range, not only snapped ends. Reasons:
   - a zero-length range has no meaning;
   - HEAD had no background range, so nothing regresses;
   - the code reviewer's Medium 1 found `{X, X}` on a vertical-only drag;
   - BT9 (vertical-only) and mutant M5 cover it, and C's extra probe confirmed it in the browser.
   No code change.
2. **The clip-path `{0, 0}` free range at the 0 bound** (A's reviewer Low 1): this is HEAD's behaviour at `clip.start`, carried. It goes to `deferred_low_polish` as A-R265-REVIEW-CLIP-ZERO-RANGE. It is not this round: `ArrangementClip.tsx` is frozen.
3. **Hidden grid on the background path has no jsdom row.** This round does not add one: `StudioWorkspace.tsx` is frozen, and the background path reads the same `gridLinesVisible` inputs as the click and in-clip paths (A's code reading, `a-round-265.md`). It is carried into the next REGRESSION round as a scope addition, REG-11C-HIDDEN-GRID-BG: a browser row that zooms out until the grid hides, then makes a background drag.
4. **`rangeInvalid` (details-panel clamp)** is recorded as the signal B-R265-DETAIL-RANGE-CLAMP. The question for Saba is whether "no clamp to one clip" also covers the numeric entry. It is not a bug: the panel edits the selected clip's own range.
5. **A background drag on the video lane** gets a row now: VIDEO-BG. It uses the same handler; B measured it at baseline (§4).
6. **Doc 198 l.4** is re-ruled (§2.7).

### 2.5 Focus (L47, L50)
- **L50 grep** over the 3 granted sources gives 0 hits: `ArrangementContext.tsx`, `model.ts`, `strings.ts`. The callers of `splitSelection` are the Ctrl+E handler in `StudioWorkspace.tsx` and the Split toolbar button in `ArrangementTransport.tsx` [K10]. Both are frozen and unchanged.
- **Which element can unmount.** A split keeps the original clip id on the left part (`splitClipAt`) [K4]. So a clip element focused before the split stays mounted. The new parts are new elements, and no focused element unmounts that does not unmount at HEAD's split.
- **Ruling:** the focus target equals HEAD for the same origin:
  - Ctrl+E pressed from the library option (B's probe: the active element stays that `BUTTON` before and after, `b-round-265/probe-split-*.json` H);
  - the Split toolbar button clicked: focus stays on that button.
  
  Row FOCUS-SPLIT.

### 2.6 Tests
**Collisions (L23).** B ran the whole sketch (§2.1–2.3) on a scratch copy of the working tree, including A's round-265 diff, over all 168 test files in `app/lib/arrangement` + `app/components`. Result: `Tests 4 failed | 2455 passed (2459)` (`b-round-265/precheck-sketch-vitest.clean.txt` [K8]). All 4 are in granted files:

| Test (file:line) | Why it changes | Allowed rewrite |
|---|---|---|
| `model.test.ts:192` [K8] "produces three parts with the middle one returned" | `middleId` → `middleIds` (tsc error at l.201 on the sketch [K8]) | Read `result.middleIds[0]` and assert `middleIds` has length 1. Keep every existing assertion. |
| `strings.test.ts` ST1 (l.182 [K8]) | `rangeMissingReason` literal | Replace the literal with the new one. |
| `strings.test.ts` ST8 (l.618 [K8]) | the sorted formatter-name list gains `splitRangeClipsDone` | Add the name. Also add its exact output for count 2 and 3 to the formatter-literal row of the same describe block. |
| `strings.test.ts` ST10 (l.767 [K8]) | `needsSelection` literal | Replace the literal with the new one. |

**Rules:**
- No assertion is removed (a removal is a Medium bug).
- Equal or stronger replacements are allowed (L4).
- `perf/**` and `e2e/**` have 0 hits for every changed token [K9].
- The one other hit (`detail-panel-polish.test.tsx`, a test title "… on the waveform box") is unrelated [K9].

**New rows in `model.test.ts`** (`splitClipsByRange` block). Each asserts the exact clip list (`start`, `sourceOffset`, `duration`) and `middleIds`:
- **MS1:** a range past the clip start (range 6.25–12.5, clip 10–111.35): one cut at 12.5, `middleIds` = [the 10–12.5 part], whose id equals the original id.
- **MS2:** a range from inside clip A, across a gap, into clip B: 4 parts, `middleIds` = [A's right part, B's left part].
- **MS3:** a range over empty space only → `null`. A range covering a whole clip with both edges outside → `null`.
- **MS4:** a range edge within `MIN_CLIP_DURATION` of a clip edge: no cut at that edge; the other edge is still cut.
- **MS5:** clips on another track inside the same time window are untouched.

**New rows in `background-time-selection-ui.test.tsx`.** Use the file's existing helpers. Do not change BT1–BT9.
- **BS1:** in-clip overshoot drag (past the clip start) → Ctrl+E:
  - clips at [10, 12.5];
  - status `splitRangeDone`;
  - the selection is the [10, 12.5] part;
  - range null;
  - `undoLabel` `historySplitRange`;
  - Ctrl+Z restores 1 clip.
- **BS2:** a drag that starts inside clip A, crosses the gap and ends inside clip B (as MS2 and SPLIT-GAP-2) → Ctrl+E:
  - 2 inside parts selected;
  - status = `splitRangeClipsDone(2)`;
  - one history entry (a single Ctrl+Z restores both clips).
- **BS3:** a range over empty space only → Ctrl+E:
  - status `splitRangeFailed`;
  - arrangement and range unchanged;
  - no history entry.
- **BS4:** the Split toolbar button with a BS1 range gives the same result as Ctrl+E.

**Red-proofs (L23, L52).** Run them on a scratch copy **outside** `store/`, with `model.test.ts` + the new rows only. Report each red as file:line.
- **M6:** restore HEAD's full-containment `find` in `splitClipsByRange`. MS1, MS2, BS1 and BS2 must go red.
- **M7:** keep only the first target (`targets.slice(0, 1)`). MS2 and BS2 must go red.
- **M8:** in `splitSelection`, always use `setSelectedClipId(middleIds[0])` and `splitRangeDone`. BS2 must go red on the selection or the status.
- **M9:** return a result when no cut happened (`changed` ignored). MS3 and BS3 must go red.

### 2.7 Implementation doc 198
- **l.4** becomes exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 266 PASS)` (L28: rewriting N only). Before this round it read `**სტატუსი:** In Progress (stage 1 of 2; C round 265 PASS)` [K15].
- In Georgian, add the Split rule D3, the copy change and the C-R265-01 Problem → Solution to its existing sections. Cite only rows that exist: MS1–MS5, BS1–BS4 and the rewritten rows (L26).
- The headings stay a superset of TEMPLATE's, in order.

### 2.8 Checks (speed rules), from `store/`
- `npm run typecheck` and `npm run lint`.
- `npx biome check` on the 5 granted code and test files plus `background-time-selection-ui.test.tsx`.
- `npx vitest run` on `model.test.ts`, `strings.test.ts`, `background-time-selection-ui.test.tsx`, `ArrangementContext.test.ts`, `delete-selection-ui.test.tsx`, `export-range-ui.test.tsx`, `export-dialog-a11y-copy.test.tsx`, `navigation-strings-ui.test.tsx` and `selection.test.ts`.
- **L31:** report the slowest test in each changed test file against its limit. Round 265: BT1 0.79 s of the default 5 s (`a-round-265.md`).
- **code-reviewer:** required (7 files). Pass its Architecture notes to B.
- Do not run the full suite or `npm run verify`.

### 2.9 STOP conditions (L11, at the top of `a-round-266.md`)
- A change is needed outside the 7 grants.
- A test outside §2.6 goes red.
- A rewrite would need to drop an assertion.
- A mutant leaves its rows green.
- `sha256sum -c` of the frozen list is not rc 0 before or after.
- D3 cannot reproduce HEAD's result for the C-R265-01 gesture (clips [10, 12.5], `splitRangeDone`).

## 3. Neighbouring behaviour at risk
- **The three marker-split branches** (all-tracks refusal, multi-selected at the marker, single clip at the marker): they are not edited, and C runs SPLIT-MARKER.
- **Delete, Ctrl+Shift+X and Ctrl+L on the same ranges:** the code is unchanged. C's round-265 rows BG-INTO-CLIP, BG-EMPTY-DELETE and C's extra Ctrl+L / Ctrl+Shift+X probes are carried.
- **The export dialog's no-range state:** the text changes (COPY).
- **Undo/Redo labels:** `historySplitRange` is reused (BS1, BS2).

## 4. C: what to verify
C writes `c-round-266.md` and `c-round-266.json` as it goes.
- "Both viewports" means 1440×900 and 1280×720, in a fresh anonymous `/studio-lab` context, after `Demo collection ready` (L48).
- **Setup S** is unchanged from round 265:
  1. click the Music lane background at lane x + 400 px, 70 % of the lane height;
  2. focus the first library `option` and press Enter;
  3. the clip is at "10.000", and the zoom is 40 px/s.

  The Music lane is `[data-grid-seconds]:not([data-testid])` first. The video lane background is `[data-track-id="video"] [data-testid="arrangement-video-dropzone"]` [K11].
- **Read:**
  - the clips are `[data-clip-id]` → `data-clip-start`;
  - the status is `arrangement-status` [K12];
  - the range is `arrangement-range`;
  - the lane overlays are `arrangement-lane-range`.
- **B's baseline:** B's own probe `b-round-265/probe-split.mjs` ran on the current working tree (`probe-split-before.json`) and on the sketch served from a scratch copy on `:5175` (`probe-split-sketch.json`). Both viewports, 0 page errors, identical results per viewport. The "PASS means" values below are the sketch's measured values.

| Row | Steps | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`:<ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-265-r266-tree-sha256.txt`;</li><li>`git status --short --untracked-files=all`;</li><li>HEAD.</li></ul> | <ul><li>rc 0;</li><li>status = the 11 round-265 entries, plus ` M` on `model.ts`, `model.test.ts`, `ArrangementContext.tsx`, `strings.ts` and `strings.test.ts` (16 entries);</li><li>HEAD `2ea196e`.</li></ul> | Any other change. |
| **HUNK-SCOPE** | `git diff -U0 -- app/lib/arrangement/model.ts app/contexts/ArrangementContext.tsx app/lib/arrangement/strings.ts` (HEAD line numbers in the `@@ -a,b` headers). | Every removed or changed HEAD line lies in the allowed window:<ul><li>`model.ts` l.290–324, the `splitClipsByRange` function [K4];</li><li>`ArrangementContext.tsx` l.1989–2000, the range branch of `splitSelection` [K5];</li><li>`strings.ts` l.24, l.114–117 (the new key goes here) and l.289 [K6].</li></ul>Pure insertions are allowed only inside the same windows. | A hunk outside a window: the carried round-265 rows lean on these two files (status texts, every edit command), so every round-265 row is then re-run, not carried. |
| **CLAIMS** | Re-run K1–K16 verbatim, plus the L29 untagged-fact grep over this file.<ul><li>K4–K9 at HEAD, or with `git show HEAD:` for the granted files.</li><li>K13 and K14 give the before-values on the current tree. After A's fix, K13 gives the sketch values (`probe-split-sketch.json`) and K14 the same values except the `loopNoRange` text.</li><li>K15 runs against B's saved copy.</li><li>Copy `probe-split.mjs` and `probe-neighbours.mjs` into `c-round-266/` and change their `DIR` before running them: the scripts write screenshots to a hard-coded folder. The shots in `b-round-265/shots/` come from B's sketch run.</li></ul> | Every output matches. | A mismatch (planning FAIL). |
| **TESTS-TARGETED** | The §2.8 file set. | All green. | Red. |
| **REWRITES** | <ul><li>`git diff` of `model.test.ts` and `strings.test.ts`, which round 265 did not change.</li><li>`diff b-round-265/background-time-selection-ui.test.tsx.r265.txt app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` (B's copy of A's round-265 file [K16]).</li></ul> | <ul><li>Only the §2.6 rows change, and no assertion is removed.</li><li>The UI file diff only **adds** lines (new `it(` blocks, plus imports if needed). No BT1–BT9 line is changed or removed.</li></ul> | An assertion is removed (Medium), or a BT line changed (then BT1–BT9 are not carried). |
| **MUTANTS** | M6–M9 on C's own scratch. | Each goes red as in §2.6. | A mutant stays green. |
| **SPLIT-PAST-START** (both; the C-R265-01 repro) | After S, drag on the clip body from clip x + 100 to clip x − 150 (range "00:06.250 — 00:12.500"). Press Ctrl+E. Then Delete. Then Ctrl+Z twice. | <ul><li>Ctrl+E: clips `["10.000","12.500"]`, status "Clip split at both edges of the time selection; the middle part is selected.", no `arrangement-range`.</li><li>Delete: clips `["12.500"]`, status "Clip deleted; the gap remains." (the selected part was 10–12.5).</li><li>Ctrl+Z: `["10.000","12.500"]`, then Ctrl+Z: `["10.000"]` with status "Undo: Split at time selection".</li></ul> | "Could not split …", or a different cut. |
| **SPLIT-BG-INTO-CLIP** (both) | After S, drag lane x + 40 → clip x + 200 (range 1–15). Press Ctrl+E. | Clips `["10.000","15.000"]`, the `splitRangeDone` status, no range. | Otherwise. |
| **SPLIT-GAP-2** (both) | After S:<ol><li>drag on the clip body from clip x + 100 to clip x + 400, then Delete (clips `["10.000","20.000"]`);</li><li>click the background at lane x + 60;</li><li>drag from clip x + 50 to clip x + 500 (range "00:11.250 — 00:22.500", 1 lane overlay);</li><li>Ctrl+E;</li><li>Delete.</li></ol> | <ul><li>Ctrl+E: clips `["10.000","11.250","20.000","22.500"]`, status "Clips split at the edges of the time selection; the 2 parts inside it are selected.", no range.</li><li>Delete: clips `["10.000","22.500"]`, status "2 clips deleted; the gap remains."</li><li>Screenshot after Ctrl+E.</li></ul> | Otherwise. |
| **SPLIT-NO-EDGE** (both) | <ol><li>After S: drag lane x + 40 → lane x + 300 (empty, 1–7.5), then Ctrl+E.</li><li>After S and step 1 of SPLIT-GAP-2: click the background, drag clip x − 40 → clip x + 120 (range "00:09.000 — 00:13.000", covering the whole 10–12.5 clip), then Ctrl+E.</li></ol> | Both: status "Could not split at the time selection."; clips unchanged (`["10.000"]`, then `["10.000","20.000"]`); the range is still shown. | A split, or the range cleared. |
| **SPLIT-MARKER** (both) | After S: click inside the clip at clip x + 200 (marker 15.000), then Ctrl+E. | Clips `["10.000","15.000"]`, status "Clip split at 00:15.000." (the marker branch is unchanged; B's baseline [K14]). | Otherwise. |
| **SPLIT-ALL-TRACKS** (both) | BG-RANGE's range (lane x + 40 → lane x + 300), then Ctrl+Shift+L, then Ctrl+E. | The status is the unchanged `splitAllTracksRefused` text: "Split does not work on a selection across all tracks — make a time selection on one track." Clips unchanged, the range still shown [K14]. | Otherwise. |
| **FOCUS-SPLIT** (both) | <ol><li>SPLIT-PAST-START's range, with focus on the first library option (as after S), then Ctrl+E: read `document.activeElement`.</li><li>The same range, then click the Split toolbar button: read `document.activeElement`.</li></ol> | <ol><li>The same library `BUTTON` as before the key (B's probe, H).</li><li>The Split button (`BUTTON`, text "Split", the only button named /^Split/ [K14]).</li></ol> Equal to the baseline [K14]; never BODY. | Focus moves to BODY or elsewhere. |
| **VIDEO-BG** (both) | After S: click the Music background at lane x + 60, then drag on the video lane background from its x + 40 to x + 300. | A range "00:01.000 — 00:07.500" with exactly 1 `arrangement-lane-range`, inside `[data-track-id="video"]`; no marquee mid-drag. | Otherwise. |
| **COPY** (both) | <ol><li>After S: click the background (no range), then Ctrl+L.</li><li>With no range, open Export.</li></ol> | <ol><li>Status "To set a loop, first make a time selection (drag in a lane)." and not truncated (`scrollWidth ≤ clientWidth` on the status element). B measured `statusFits` only for the old text, which is 1 character shorter [K14]; C measures the new text.</li><li>`arrangement-export-scope-range-reason` reads "Make a time selection in the Arrangement (drag in a lane)", on 1 line (B: 310 × 16 px).</li><li>Screenshot.</li></ol> | Old text, or wrapping or clipping. |
| **CARRIED** | Confirm SOURCE-SCOPE rc 0 (the 4 round-265 sources and the 5 rewritten tests are byte-identical to what C tested in round 265, [K2]), HUNK-SCOPE PASS, and REWRITES' add-only diff of the UI file. | The 20 round-265 PASS rows (`c-round-265.json` `passed`) are carried without a re-run. The exception is BG-INTO-CLIP and IN-CLIP-SAME, which C re-runs once at 1440×900 as a smoke check (their code path shares `splitSelection`'s neighbour Delete). | A frozen file changed (then every round-265 row must be re-run). |
| **LESSONS** | `grep -n '^4[56]\. ' lessons.md` (loop root). | L45 and L46 exist. | Missing. |
| **DOC-198** | l.4 byte for byte; the headings subsequence (L26); the row citations exist (`grep`). | l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 266 PASS)`. | Otherwise. |
| **G266-AUTH** (browser; reuse `c-round-265/g265-auth.cjs`) | A fresh anonymous 1440×900 context: `/studio-lab`, `/studio/middle-east`, `/api/studio-token` with no header. | <ul><li>Workspace + demo badge, `auth_user` null.</li><li>"Sign in required", 0 `audio[src]`.</li><li>401, no token.</li></ul> | Any bypass (Critical). |

- **Gate rows:** the full vitest, the build, Biome (full), `npm run verify` and the e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`** is true only if every browser row above ran at both viewports. CARRIED rows count as verified by round 265's browser run.
- **Ableton conformance:** SPLIT-IN-CLIP / the marker path is confirmed ([AV] 6.12). D3's rows are "unconfirmed, default D3 awaiting Saba" (SABA-Q-11C-SPLIT-SPAN), never "matches Live".
- **Not in this round:** relative snap (stage 2), multi-lane partial ranges (D2), the Live-style Shift-click extension, Split on an all-tracks range, the details-panel clamp. List them under `"notInScope"`.

## 5. Outcome, fixed in advance (D-29z564)
| Result | B at the round-267 planning |
|---|---|
| C PASS and gate 266 `published` | <ul><li>SABA-B-11c stage 1 → done.</li><li>C-R265-01, C-R265-02 and B-R264-RANGE-HOW-COPY → closed.</li><li>R6-S2 (the marquee) re-verified on Ctrl/Cmd.</li><li>Stage 2 stays `awaiting_user` (R49-T).</li><li>Round 267 = **REGRESSION** if planned on or after 2026-11-02 (with REG-11C-HIDDEN-GRID-BG added). Otherwise **GATE264-S2** (AltGr, Medium), then SYS-6 STATUS-LIFETIME.</li></ul> |
| C PASS, gate fails | A bounded fix-up for that step. |
| A Medium+ finding | A fix-up with the same grants, ≤ 3 related bugs. |
| A STOP | B rules on it before re-dispatch (L10). |

## 6. Saba questions (`user-review/questions-11c.md`)
- **New §4: SABA-Q-11C-SPLIT-SPAN** (D3, plus the all-tracks split question).
- **Still open:** SABA-Q-11C-MARQUEE, SABA-Q-11C-MULTILANE and R49-T.

## 7. Claims (L29; C re-runs each command verbatim; commands from `store/` unless marked "loop root")
Claims K4–K9 describe HEAD content. The granted files are unchanged at planning, so the working tree equals HEAD for them. After A's edits, re-run K4–K9 against `git show HEAD:<file>`.

| Tag | Claim | Command | Expected |
|---|---|---|---|
| K1 | HEAD; the round-265 working tree | `git rev-parse HEAD; git status --short --untracked-files=all \| wc -l` | `2ea196e20e6c3b9099db519f807eaa4a1d95a48a`; `11` (at planning) |
| K2 | A's 3 component sources equal C's evidence | `git diff -- app/components/arrangement/ArrangementClip.tsx app/components/arrangement/ArrangementLane.tsx app/components/arrangement/StudioWorkspace.tsx \| cmp - ../tmp/studio-real-loop/c-round-265/source.diff && echo SAME` | `SAME` |
| K3 | 1,118 frozen entries; 7 grants; each protected file once | loop root: `wc -l < b-round-265-r266-tree-sha256.txt; wc -l < b-round-265-r266-grants.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-265-r266-tree-sha256.txt; done \| tr '\n' ' '` | `1118`; `7`; `1 1 1 1 1 1 1` |
| K4 | `splitClipsByRange`, its full-containment check; `splitClipAt` and its edge guard | `grep -n "export function splitClipsByRange(" app/lib/arrangement/model.ts \| cut -d: -f1; grep -n "clipEnd(entry) >= range.end - ARRANGEMENT_EPS," app/lib/arrangement/model.ts \| cut -d: -f1; grep -n "export function splitClipAt(" app/lib/arrangement/model.ts \| cut -d: -f1; grep -n "if (time - clip.start < MIN_CLIP_DURATION \|\| end - time < MIN_CLIP_DURATION) {" app/lib/arrangement/model.ts \| cut -d: -f1; awk 'NR>=290 && /^}/ {print NR; exit}' app/lib/arrangement/model.ts` | `290`; `298`; `256`; `266`; `324` (the function's closing brace) |
| K5 | `splitSelection`: all-tracks refusal, marker-branch `setSelection`, range branch | `grep -n "setStatus(studioEditStrings.splitAllTracksRefused);\|setSelection(result.rightIds);\|const result = splitClipsByRange(arrangement, latest.range);\|setStatus(studioEditStrings.splitRangeFailed);\|setSelectedClipId(result.middleId);\|setStatus(studioEditStrings.splitRangeDone);" app/contexts/ArrangementContext.tsx \| cut -d: -f1 \| tr '\n' ' '` | `1973 1985 1990 1992 1996 1998` |
| K6 | the strings | `grep -n "  rangeMissingReason: 'Make a time selection in the Arrangement (drag on a clip or on the ruler)',\|  splitRangeFailed: 'Could not split at the time selection.',\|  splitRangeDone: 'Clip split at both edges of the time selection; the middle part is selected.',\|  needsSelection: 'To set a loop, first make a time selection on the waveform.',\|  rangeInvalid:" app/lib/arrangement/strings.ts \| cut -d: -f1 \| tr '\n' ' '` | `24 114 116 289 808` |
| K7 | the only non-null time-range writers in components; the ruler sets none | `grep -rn "setTimeRange(\|setRange(" app/components --include=*.tsx \| grep -v __tests__ \| grep -v "(null)" \| cut -d: -f1,2 \| tr '\n' ' '; grep -c "setRange\|setTimeRange" app/components/arrangement/ArrangementRuler.tsx` | `app/components/arrangement/ArrangementClip.tsx:688 app/components/arrangement/StudioWorkspace.tsx:2102 app/components/arrangement/ArrangementDetailPanel.tsx:591`; `0` |
| K8 | the collision lines; B's scratch result | `grep -n "splitClipsByRange\|middleId" app/lib/arrangement/__tests__/model.test.ts \| cut -d: -f1 \| tr '\n' ' '; grep -n "it('ST1:\|it('ST8:\|it('ST10:" app/lib/arrangement/__tests__/strings.test.ts \| cut -d: -f1 \| tr '\n' ' '`; loop root: `grep -E "^ FAIL \|Tests  " b-round-265/precheck-sketch-vitest.clean.txt \| sed 's/ >.*//' \| sort \| uniq -c` | `18 192 194 201`; `182 618 767`; three lines: `1       Tests  4 failed \| 2455 passed (2459)`, `1  FAIL  app/lib/arrangement/__tests__/model.test.ts`, `3  FAIL  app/lib/arrangement/__tests__/strings.test.ts` (each with its leading `uniq -c` padding) |
| K9 | the sweep over every test root for the changed tokens | `grep -rlE "splitClipsByRange\|splitRangeDone\|splitRangeFailed\|Could not split\|middle part is selected\|on the waveform\|drag on a clip or on the ruler" app perf e2e 2>/dev/null \| sort \| tr '\n' ' '` | `app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/model.test.ts app/lib/arrangement/__tests__/strings.test.ts app/lib/arrangement/model.ts app/lib/arrangement/strings.ts ` |
| K10 | the callers of `splitSelection` | `grep -n "current.splitSelection();" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "onClick={splitSelection}" app/components/arrangement/ArrangementTransport.tsx \| cut -d: -f1` | `2347`; `174` |
| K11 | the lane selectors C uses | `grep -rn 'data-testid="arrangement-video-dropzone"' app/components --include=*.tsx \| cut -d: -f1,2; grep -n "data-track-id={track.id}" app/components/arrangement/ArrangementLane.tsx \| cut -d: -f1` | `app/components/arrangement/ArrangementLane.tsx:897`; `708` |
| K12 | the status and export-reason signals | `grep -n 'data-testid="arrangement-status"' app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n 'data-testid="arrangement-export-scope-range-reason"' app/components/arrangement/ArrangementExportDialog.tsx \| cut -d: -f1` | `3138`; `453` |
| K13 | B's browser baseline and sketch | loop root: `node b-round-265/probe-split.mjs /tmp/k13.json` (the current tree on :5173) | per viewport, 0 errors: `A_split` "Could not split at the time selection." (the C-R265-01 repro, before the fix); `F_videoOverlayRow` `["video"]`; `G_exportReason` 390 × 16 px. After A's fix, the same script gives the `probe-split-sketch.json` values |
| K14 | B's neighbour baseline on the current tree (both viewports, 0 errors) | loop root: `node b-round-265/probe-neighbours.mjs /tmp/k14.json` | `markerSplit` clips `["10.000","15.000"]`, "Clip split at 00:15.000."; `allTracks` the `splitAllTracksRefused` text, clips `["10.000"]`, range true; `splitBtnCount` 1, `splitBtnAfter.active` `BUTTON\|Split`; `loopNoRange` "To set a loop, first make a time selection on the waveform." with `statusFits` true (before the fix; after it, the new text) |
| K15 | doc 198 l.4 before this round (A's round-265 file, saved by B) | loop root: `sed -n 4p b-round-265/198-doc.r265.txt` | `**სტატუსი:** In Progress (stage 1 of 2; C round 265 PASS)` |
| K16 | B's copies of the 2 untracked round-265 files equal the planning hashes in the frozen-list generation | loop root: `sha256sum b-round-265/background-time-selection-ui.test.tsx.r265.txt b-round-265/198-doc.r265.txt \| cut -c1-12` | `6cfae02a9f47`, `fed6cea433bf` |
