# Round 273: SYS-6 STATUS-LIFETIME, stage 2 (of 3). The status describes the state at the end of the action: Space, range writes and gesture release keep the transport texts true. Closes GATE272-S1-LATE-READ (Medium), B-R272-STOPPED-TEXT-WHILE-PLAYING, C-R272-01 and GATE272-S3-SELECTION-PASTEND-STALE

**Planned by:** B, at the round 272 → 273 planning, 2026-10-30.

**Decisions:**
- D-29z597: round 272 result.
- D-29z598: gate-272 triage and the C/A notes.
- **D-29z599: this contract.**
- D-29z600: the SYS-6 split (stage 2 = this round, stage 3 = round 274), the order, and the checkpoint request.

**Type:** a systemic bug round on one owner: `ArrangementContext.tsx`, plus `playback-start.ts` and `strings.ts`.
- **What it covers:** one Medium and two Lows with one root cause. Transport texts that name a start point are not re-derived when the start point changes through a path other than `writeInsertMarker`.
- **GATE272-S3** is the same rule applied to one more template. Fixing it costs one classifier change, in code this round already owns.
- **Reference-first does not apply.** This is a bug-fix round. Live has no status line with these texts, so Ableton conformance is "does not apply".
- **No `product-designer` consult.** There is no new feature. The one new string is a status text on the existing line (§3.5, L39).

**Grants:** `b-round-272-r273-grants.txt`. Everything not granted is frozen.

## Baseline: HEAD `b288be7`, clean tree
`gates/gate-round-272.json` is `published`, commit `b288be7bd3aa7fd26e16387e90008122ce0a94e1` [K1].

## 1. What changes, and why
B reproduced each row at HEAD `b288be7` in the browser, at both viewports, with 0 page errors (`b-round-272/probe-r273-head.json`).

| # | Recipe (16 s demo stem "pulse" on Music; probe scenario) | HEAD | After this round |
|---|---|---|---|
| 1 | **C-R272-01** (`rangeDrag`). Space, lower-zone click at 4, Space (stop), then drag from 2 to 5 s in the lower half of the Music row. That point is the clip body, so this is the `ArrangementClip` range path [K22] | the line keeps `Stopped — Space plays from the insert marker at 00:04.000.`, but Space plays from the selection start | after the release: `Stopped — Space plays from the time selection start at 00:02.000.` |
| 2 | **B-R272-STOPPED-TEXT-WHILE-PLAYING** (`spaceFromStopped`). The stopped state of row 1 (no range), then Space | `data-playing=true`, but the line still reads `Stopped — Space plays from the insert marker at 00:04.000.` | `Playing from 00:04.000.`. After Stop: `Stopped — Space plays from the insert marker at 00:04.000.` |
| 2b | Row 1 after the drag, then Space | `Stopped — … insert marker at 00:04.000.` while playing from 2 | `Playing from 00:02.000.`; after Stop, the selection text |
| 3 | **GATE272-S3** (`selPastEndHome`). Drag from 17 to 18 s on the empty lane background, past the 16 s end. This is the `StudioWorkspace` lane path [K9]. Then Space (refused), then Home | the refusal `Time selection start (00:17.000) is past the end … Home returns to 0.` stays, although the range is gone and the marker is 0 | `Stopped — Space plays from the insert marker at 00:00.000.` |
| 4 | **Round-272 section 0** (`stripFromStopped`). Stopped state at 4, then a click on the bars-ruler top strip at 6 | already true at HEAD: `Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.`; after Stop, `… insert marker at 00:06.000.` | **unchanged.** It is now a ruled and pinned contract (§2, LT12) |
| 5 | **L51 clobber control** (`clobberAdded`). The clip-added text after Add, then Space, then Stop | the text stays | **unchanged** (§3.8) |

## 2. Ruling on GATE272-S1 (Medium): when a status updater reads state
**The semantic, in one sentence:** a function-form status update describes **the state at the end of the action that queued it**. That is the state React sees when it applies the update in its next render, after the handler has returned and every ref the handler wrote is final.

**Why this option and not snapshot-at-write**
- `placeInsertMarker` writes the marker before `setRange(null)` [K3]. A snapshot taken at the marker write would describe a range that the same handler is about to clear: Home with a range would show a wrong selection text.
- `playFrom` would show a "Stopped" text during playback.
- Late read gives the true text in both cases at HEAD (round 272 C §0, LT8 end).

**Is it deterministic?**
- React is `^18.3.1` [K10]. A `useReducer` dispatch with a function is queued and applied during the next render, and the reducer is not computed early.
- Every writer of the refs read here writes synchronously inside its handler: `isPlayingRef`, `insertMarkerRef`, `latestRef.range`, `historyRef` and `playbackEndedAtRef`.
- Automatic batching also covers rAF and timers, such as the natural end in `tick`.

**What A must do:** nothing in the reducer. The ruling is pinned by rows, not by new code:
- LT12: a strip click from a stopped text;
- LT13: a marker write and a range write in one handler, both orders;
- LT8's end step: Home clears the range;
- the new rules below, which use the same late read.

**The doc** for this stage (204, §4) states the semantic in its `## მიდგომა` section, with the sentence above.

## 3. The contract (D-29z599)
B's sketch is `b-round-272/sketch.diff`, applied to a `git archive b288be7` scratch.

### 3.1 GATE272-S2 (Low, owned code): drop the render-time ref
- Move `describeSpaceStart` (HEAD l.1404–1427 [K4]) above `writeInsertMarker`. Only its position changes.
- `writeInsertMarker` calls `describeSpaceStart()` directly. Delete `describeSpaceStartRef`, its declaration and the render-time assignment: 3 lines at HEAD [K5].
- Add `describeSpaceStart` to `writeInsertMarker`'s deps. Every ref it reads is declared above l.790 [K6].
- **GATE272-S4 (the clamp) is ruled not a bug.** `formatArrangementTime` already clamps with `Math.max(0, seconds)` at l.598 [K7]. There is no code change, and the finding closes as "not reproducible".

### 3.2 A shared truth helper (new, inside the provider)
```ts
const rewriteStoppedTruth = useCallback(
  (text: string): string =>
    !isPlayingRef.current && insertMarkerStatusKind(text) === 'stopped' ? describeSpaceStart() : text,
  [describeSpaceStart],
);
```
- It goes right after `describeSpaceStart`.
- It is not exported and not added to the context value.

### 3.3 Rule R: a range write re-derives a stopped start text (closes C-R272-01)
- **The change:** `setRange` (HEAD l.790–793, the only `setRangeState` call [K8]) moves below `rewriteStoppedTruth`, with deps `[rewriteStoppedTruth]`. After its two existing lines it adds:
  `if (gestureCountRef.current === 0) { setStatus(rewriteStoppedTruth); }`
- **Why the gesture guard:**
  - Both range drags claim a pointer gesture [K9].
  - Without the guard, every pointermove would queue a status with a new time: a provider re-render and an announcement per pixel.
  - With the guard, a drag writes nothing until its release (§3.4).
  - B's browser pre-check counted **0** status mutations during the drag, and one keyed span swap after the release (`probe-r273-sketch.json` rangeDrag: `mutationsDuringDrag` 0, `mutationsTotal` 2).
- **While playing:** the helper returns the text unchanged, because playing texts are out of scope (§3.7).
- **Keyboard and other non-gesture writers (ruled, no extra guard).** The other callers are discrete:
  - the 16 other `setRange(` calls in the context [K23], almost all `setRange(null)` after an edit that writes its own explicit status afterwards, which wins (§3.8); l.2149 is Ctrl+Shift+L;
  - the Detail panel commit (`ArrangementDetailPanel` l.604, Enter);
  - `placeInsertMarker`.
  - The key-repeat paths (group move l.1988, nudge l.2008) clear an already-null range on each repeat. That is a function update returning the same text, so there is no sequence bump and no announcement [K16].
  - No held key moves a range start.

### 3.4 Rule G: a gesture release re-derives it too
- In `beginPointerGesture`'s release (HEAD l.1789 [K11]), the updater becomes:
  `(current) => rewriteStoppedTruth(statusAfterGestureRelease(current, lastNonRefusalStatusRef.current))`.
- Its deps become `[rewriteStoppedTruth]`.
- `statusAfterGestureRelease` itself is unchanged.

### 3.5 Rule P: a successful start replaces a stopped start text (closes B-R272-STOPPED-TEXT-WHILE-PLAYING)
- **The change:** in `startPlaybackAt`, right after `setIsPlaying(true)` (HEAD l.1376–1377 [K12]), add:
  `setStatus((text) => insertMarkerStatusKind(text) === 'stopped' ? studioPlaybackStrings.playingFrom(formatArrangementTime(from)) : text);`
- The refusal and empty branches are unchanged.
- **Copy:** one new formatter in `studioPlaybackStrings`, right before `insertMarkerToPlayhead`:
  - exact text: `playingFrom: (time: string): string => \`Playing from ${time}.\``;
  - 23 characters with a time, shorter than every existing T text (L3: covered by LT-WIDTH);
  - no `playingFrom` or "Playing from" exists today [K13].
- **Rejected:**
  - *Reuse `insertMarkerWhilePlaying`:* it says "Stop, then Space plays from here", which is false with a selection or with the marker at the end.
  - *Clear the line:* the line would lose its announcement.
  - *Write on every start:* it would clobber "clip added", `Loop is on.` and `followResumed` (§3.8).

### 3.6 The classifier (`playback-start.ts`, `insertMarkerStatusKind`)
- **New kind `'playing-from'`** for exactly `playingFrom(first)`. The type becomes `'playing' | 'playing-follow-paused' | 'playing-from' | 'stopped'`.
  - Rule W already handles any non-null kind: while playing it writes `insertMarkerWhilePlaying(new)`.
  - At Stop, Rule S writes `describeSpaceStart()` [K14].
  - So the new text is never left stale by a marker move or a Stop.
- **The selection-subject past-end forms** (`playPastEnd` with `startPointSelection`, in both the past-end and the at-end wording) become `'stopped'`. This closes GATE272-S3.
- **The playhead-subject forms stay `null`.** They name the playhead, not a start point that the marker or the range controls.
- **The sketch's shape:** one loop over the two subjects, with `end: second ?? first`. A may write it differently, as long as the classified sets are identical (PBS8, PBS9).

### 3.7 Unchanged (a change is a STOP)
- **Where Space plays.** `resolvePlaybackStart`, `resolveSpaceStartPoint` and `togglePlayback` keep HEAD's bodies.
- **These stay as they are:**
  - the `StudioWorkspace` stop effect (Rule S [K15]);
  - `reduceArrangementStatus` [K16];
  - `statusAfterGestureRelease`;
  - every explicit `setStatus(string)` writer.
- **Playing texts with a range.** While playing, `insertMarkerWhilePlaying` stays as is even when a range exists. This known limit is recorded as signal B-R273-PLAYING-TEXT-WITH-RANGE (a hypothesis, not probed) and is not part of this round.

### 3.8 L51 clobber and lifetime list
| New write | Can land on | Ruling (rows) |
|---|---|---|
| Rule P (start) | a stopped T text: replaced. Clip-added, `Loop is on.`, `followResumed` and `Demo collection ready…`: kept. A refusal: not reached, because refusals return before Rule P | LT14, LT15, B-CLOBBER |
| Rule R (range write, no gesture) | a stopped T text: re-derived. Any other text: kept. An explicit write queued **after** it in the same handler: the explicit write wins, as with Rule W in LT10 | LT13, LT17, LT19 |
| Rule G (release) | the `statusAfterGestureRelease` result: a stopped T text is re-derived, other texts are kept | LT17 |
| Rule G after a trim, move or fade that changes the project end | a stopped T text is re-derived against the new end. For example, a trim that ends the project before the marker turns `Stopped — Space plays from the insert marker …` into the past-end refusal. **This is expected and allowed:** the text is now true, while HEAD left it stale. C records it as ruled, not as a new Low. An edit that writes its own status after the release keeps it | LT17 (mechanism); observation only in the browser |
| `playingFrom` lifetime | it becomes false when the marker moves while playing (Rule W rewrites it to `insertMarkerWhilePlaying`) and at Stop (Rule S writes `describeSpaceStart()`) | LT14, LT16 |

## 4. Grants (exact; also in `b-round-272-r273-grants.txt`)
| Path | What may change |
|---|---|
| `app/contexts/ArrangementContext.tsx` | only these:<br>• §3.1: move `describeSpaceStart`, delete `describeSpaceStartRef`, update `writeInsertMarker`'s call and deps<br>• §3.2: `rewriteStoppedTruth`<br>• §3.3: move `setRange` and give it Rule R<br>• §3.4: the release updater and deps in `beginPointerGesture`<br>• §3.5: Rule P in `startPlaybackAt` (deps only if Biome asks) |
| `app/lib/arrangement/playback-start.ts` | `InsertMarkerStatusKind` and `insertMarkerStatusKind` only (§3.6) |
| `app/lib/arrangement/strings.ts` | the one `playingFrom` formatter (§3.5). Nothing else |
| `app/lib/arrangement/__tests__/strings.test.ts` | **additions only:**<br>• one `V02B_FORMATTER_SAMPLES.studioPlaybackStrings` entry, `playingFrom: [pb.playingFrom('00:04.000')]`<br>• one exact-text expect in ST11<br>B's pre-check shows that ST12 fails without the sample |
| `app/lib/arrangement/__tests__/playback-start.test.ts` | • rename the row ids `PB1`…`PB8` → `PBS1`…`PBS8`. INFO-C272-K11: `PB1`/`PB2` already exist in `store-focus-fixups.test.tsx` [K17]<br>• in PBS8, move the two selection-subject `playPastEnd` samples from the `outside` list into the classified list as `'stopped'`, and add `playingFrom` as `'playing-from'`. The playhead sample and every other `outside` entry stay<br>• **new PBS9** (§5.2)<br>No other assertion is removed |
| `app/lib/arrangement/__tests__/status-lifetime.test.tsx` | • **LT8:** the middle step (HEAD l.325–326 [K18]) changes from `insertMarkerAfterStop('00:04.000')` to `selectionAfterStop('00:02.000')`. This is the C-R272-01 contract; the rest of LT8 is unchanged<br>• **new LT12–LT19** (§5.2), inside the existing SYS-6 describe<br>• **LT10 stays byte-identical,** including A's round-272 extension (remount, Ctrl+Shift+Space, Stop → `insertMarkerAfterStop`). It is the only row that kills M-STOP-EXACT (INFO-C272-MUTANT-MAP) |
| `docs/implementation/2026/quarter-IV/203-sys-6-status-lifetime-stage-1.md` | only the `PB<n>` row-id tokens become `PBS<n>`: 3 lines at HEAD [K19]. l.4 stays as it is; the final stage rewrites it (L28) |
| `docs/implementation/2026/quarter-IV/204-sys-6-status-lifetime-stage-2.md` | **new doc:**<br>• l.4 exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 273 PASS)`<br>• the 7 TEMPLATE headings in order (L26)<br>• `## მიდგომა` states the §2 semantic<br>• it records that SYS-6 now has 3 stages, which supersedes doc 203's "of 2" |

**Frozen:** every other file, in particular:
- `StudioWorkspace.tsx`, `ArrangementClip.tsx`, `ArrangementMarkerRow.tsx`, `status-announcement.ts`, `model.ts`, `loop.ts`, `shortcuts.ts` and `grid.ts`;
- these tests, which must pass unchanged: `bars-ruler-ui.test.tsx`, `insert-marker-ui.test.tsx`, `ArrangementContext.test.ts`, `background-time-selection-ui.test.tsx`, `gesture-reentry.test.tsx` and `pending-status.test.tsx`;
- `store-focus-fixups.test.tsx`: its PB ids stay, because the rename is on our side;
- `package.json`, `perf/**` and `e2e/**`.

**Protected (auth and purchase):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts` and `app/contexts/AuthContext.tsx`.

## 5. Tests
### 5.1 Tests that change
B's full pre-check found all of these collisions (`b-round-272/precheck-vitest.json`: 3269/3272).

| Test | Why it changes | Rule |
|---|---|---|
| ST12 (`strings.test.ts`) | the new formatter needs a sample | addition only |
| PB8 → PBS8 | the selection-subject forms are now classified (§3.6) | moved, not deleted: each sample keeps an assertion, now `'stopped'` |
| LT8 middle step | it pinned the C-R272-01 bug | replaced by the stronger exact text of the new contract |

No other test file fails on the sketch. A test whose only change is a removed assertion is a Medium bug.

### 5.2 New rows
Notation: `statusText` is the `arrangement-status` text, and "seq" is `statusSequence` from the context. All expected texts are exact.

| Row | Steps | Expected |
|---|---|---|
| **PBS9** | `insertMarkerStatusKind` on `playingFrom('00:04.000')`; on both selection-subject forms; on both playhead-subject forms; on `playingFrom` with one character changed | `'playing-from'`; `'stopped'` ×2; `null` ×2; `null` |
| **LT12** (§2, round-272 section 0) | the stopped state at 4 (`insertMarkerAfterStop('00:04.000')`), then `playFrom(6)` (the strip path) | playing, with `insertMarkerWhilePlaying('00:06.000')`. After Stop: `insertMarkerAfterStop('00:06.000')` |
| **LT13** (§2, one handler) | a stopped T text at 4. One `act`: `setInsertMarker(3)`, then `setTimeRange({start:2,end:5,trackId:'music'})`. A second, fresh `act`: `setTimeRange({start:2,end:5,…})`, then `setInsertMarker(7)` | after the first: `selectionAfterStop('00:02.000')`. After the second: `insertMarkerAfterStop('00:07.000')`, with `range` null (`placeInsertMarker` clears it) |
| **LT14** (Rule P) | (a) stopped at 4, then Space. (b) Stopped at 4 with a range 2–5, then Space. (c) The from-start state (marker 16), then Space | (a) playing, `Playing from 00:04.000.`; Stop → `insertMarkerAfterStop('00:04.000')`. (b) `Playing from 00:02.000.`; Stop → `selectionAfterStop('00:02.000')`. (c) `Playing from 00:00.000.`; Stop → `insertMarkerAfterStopFromStart('00:16.000')` |
| **LT15** (clobber) | after a clip-added text, and separately after `followResumed`, press Space and then Stop | the text and seq are unchanged at both steps |
| **LT16** (`playingFrom` lifetime) | LT14(a), then Ctrl+← while playing (Follow stays `on`) | `insertMarkerWhilePlaying('00:00.000')`, the plain form. B's browser probe on the sketch confirms it at both viewports (`probe-r273-sketch.json` `spaceCtrlLeft`). After Stop: `insertMarkerAfterStop('00:00.000')` |
| **LT17** (Rules R and G under a gesture) | a stopped T text at 4. Call `const release = claimPointerGesture(1, () => {})`. Then `setTimeRange` three times (2–3, 2–4, 2–5), reading the text and seq after each. Then `release()` | during: the text and seq are unchanged after every write. After the release: `selectionAfterStop('00:02.000')`, and seq increased by exactly 1 |
| **LT18** (GATE272-S3) | a range 17–18 with the end at 16, then Space (refused, the selection past-end text), then Home | after Home: range null, marker 0, `insertMarkerAfterStop('00:00.000')`. Space then plays |
| **LT19** (scope limits) | (a) a clip-added text, then `setTimeRange({2,5})` while stopped. (b) While playing with `insertMarkerWhilePlaying('00:06.000')`, `setTimeRange({2,5})` | (a) the text and seq are unchanged. (b) the text is unchanged (§3.7) |

- **Helpers:** every row reuses the file's existing helpers (`playAndAdvance`, `clickRuler`, `stop`, `key`, `live`). The `{ timeout: 15_000 }` on the describe stays.
- **Headroom (L31):** the slowest existing row takes 1149 ms (`precheck-vitest.json`). LT14 has three parts; A may split it into LT14a–c if any part exceeds 7.5 s.

### 5.3 What A runs (speed rules)
- `npm run typecheck` and `npm run lint`.
- `npx vitest run` on these files:
  - the changed ones: `playback-start`, `status-lifetime` and `strings`;
  - `bars-ruler-ui`, `insert-marker-ui`, `ArrangementContext`, `status-announcement-ui`, `pending-status`, `markers-ui`, `background-time-selection-ui` and `gesture-reentry`;
  - the gesture-release consumers [K20]: `self-disabling-focus`, `tempo-seed-ui`, `master-ui` and `clip-gain`.
- A code-reviewer run is required (4 or more files change).

## 6. B's pre-check (L23); all files are in `b-round-272/`
**Sketch** (`sketch.diff`, applied to a `git archive b288be7` scratch with a private `node_modules` of per-entry symlinks, per RC-R271):
- `tsc --noEmit` rc 0, and Biome is clean on the 3 files.
- **Full vitest: 3269/3272.** The three failures are exactly the §5.1 rows: ST12, PB8 and LT8 l.326 (`precheck-vitest.json`/`.log`).

**Browser** (`probe-r273.cjs`, the sketch on :5186 and HEAD on :5173, at 1440×900 and 1280×720):
- 0 page errors in all 20 runs (`probe-r273-{head,sketch}.json`, `shots/`).
- Every §1 row matches its HEAD and After columns, including 0 status mutations during the drag.

**Not pre-run:** the §7 mutants. A red-proofs them, and C re-runs them.

## 7. Mutants
A red-proofs them on its tree and then restores it byte-identically. C re-runs them.

| Id | Mutation | Must turn red |
|---|---|---|
| M-NO-R | remove Rule R's `setStatus` | LT13 (first), the LT8 middle step |
| M-R-NO-GUARD | drop the `gestureCountRef.current === 0` guard | LT17 (seq during the drag) |
| M-NO-G | the release updater without `rewriteStoppedTruth` | LT17 (after the release) |
| M-NO-P | remove Rule P | LT14 |
| M-P-ALWAYS | Rule P writes `playingFrom` regardless of the kind | LT15 |
| M-NO-KIND-FROM | `playingFrom` is not classified | PBS9; LT16, because W keeps `Playing from 00:04.000.`; LT14 Stop, because Rule S skips it |
| M-NO-SEL-PASTEND | the selection-subject forms are not classified | PBS8, LT18 |
| M-SNAPSHOT | in `writeInsertMarker`, read `isPlayingRef.current` at the call and close over it | LT12 |
| M-STOP-EXACT (kept from round 272) | as in `tasks/round-272.md` §7 | LT10 |

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
- **Recipe:** copy `b-round-272/probe-r273.cjs` into `c-round-273/` first, because it writes next to itself. Then run it on HEAD and on A's tree.
- **Play state:** read it from `[data-playing]`.
- **Wait first:** wait for `Demo collection ready` (L48).

**Scope, claims and tests**

| Row | Check |
|---|---|
| SOURCE-SCOPE / HUNK-SCOPE | exactly the paths and hunks in §4. `git diff -- app/components` is empty |
| NO-REF | `grep -n "describeSpaceStartRef" app/contexts/ArrangementContext.tsx` returns 0 hits |
| CLAIMS | re-run §9 at HEAD |
| TESTS-TARGETED, TEST-CHANGES, MUTANTS | per §5.3, §5.1 (no assertion lost; equal or stronger replacements are allowed) and §7 |

**Browser behaviour**

| Row | Recipe (probe scenario) | Expected |
|---|---|---|
| B-RANGE-STATUS (clip-body range path) | §1 row 1 (`rangeDrag`) | **before the release:** the text is unchanged, with **0 status mutations**. **After the release:** `Stopped — Space plays from the time selection start at 00:02.000.` **Space:** `Playing from 00:02.000.`, and the position starts near 2. **Stop:** the selection text |
| B-SPACE-PLAYING | §1 row 2 (`spaceFromStopped`); also `spaceCtrlLeft`: after Ctrl+← while playing, `Insert marker at 00:00.000 — playback continues. Stop, then Space plays from here.`; after Stop, `… insert marker at 00:00.000.` | after Space: playing, `Playing from 00:04.000.`. After Stop: `Stopped — Space plays from the insert marker at 00:04.000.` |
| B-SPACE-FROMSTART | the round-272 B-ATEND state, then Space | `Playing from 00:00.000.`, and the position advances from 0 (allow the L48 lead) |
| B-SEL-PASTEND-HOME (lane-background range path) | §1 row 3 (`selPastEndHome`) | after Home: `Stopped — Space plays from the insert marker at 00:00.000.` |
| B-STRIP-STOPPED | §1 row 4 (`stripFromStopped`) | while playing: `Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.` After Stop: `… insert marker at 00:06.000.` Both are the same as HEAD |
| B-CLOBBER | §1 row 5 (`clobberAdded`), plus the round-272 B-UNRELATED recipe (`followResumed`), then Space and Stop | the text is unchanged at every step |
| B-AUDIO | B-SPACE-PLAYING | real output: the analyser RMS is > 0 while playing (round 272 C's tap), and the position advances |
| LT-WIDTH | `Playing from 00:04.000.` at 1280×720 and 1440×900 | the status box height is ≤ its height with the round-272 from-start text; no horizontal overflow |

**Guards and docs**

| Row | Check |
|---|---|
| SCREEN-BUDGET | persistent text lines outside the timeline, HEAD against new, in the demo state: equal |
| G273-AUTH | `/studio-lab` loads anonymously. `/studio/<id>` signed out shows "Sign in required". `/api/studio-token` without a header returns 401 |
| DOC-204 | l.4 byte-exact; the 7 TEMPLATE headings in order; the §2 sentence is present; every cited row id exists. Doc 203 differs from HEAD only by the `PB`→`PBS` tokens |

**Gate rows** (C does not claim them): the full vitest, build, full Biome, verify and e2e smoke.

## 9. Claims (L29). Run from `store/` at HEAD `b288be7`
| Tag | Command | Expected |
|---|---|---|
| K1 | `git rev-parse --short HEAD; git status --short \| wc -l` | `b288be7`, `0` |
| K3 | `sed -n 842,850p app/contexts/ArrangementContext.tsx` | `placeInsertMarker`: `writeInsertMarker(next)` first, then `setRange(null)` when a range exists |
| K4 | `sed -n 1404,1427p app/contexts/ArrangementContext.tsx` | `describeSpaceStart`, deps `[]` |
| K5 | `grep -n "describeSpaceStartRef" app/contexts/ArrangementContext.tsx` | 3 lines: 819, 836, 1428 |
| K6 | `grep -n "const historyRef\|const insertMarkerRef\|const isPlayingRef\|const latestRef\|const playbackEndedAtRef\|const gestureCountRef" app/contexts/ArrangementContext.tsx` | 676, 705, 707, 708, 746, 759 (all below 790) |
| K7 | `sed -n 597,599p app/contexts/ArrangementContext.tsx` | `formatArrangementTime` begins with `const safe = Math.max(0, seconds);` |
| K8 | `grep -rn "setRangeState(" app --include=*.tsx \| grep -v __tests__` | 1 hit, `ArrangementContext.tsx:792` |
| K9 | `grep -n "claimPointerGesture(event.pointerId" app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementClip.tsx` | `StudioWorkspace.tsx:2063`, `ArrangementClip.tsx:397` |
| K10 | `grep -n '"react":' package.json` | `"react": "^18.3.1"` |
| K11 | `sed -n 1778,1792p app/contexts/ArrangementContext.tsx` | `beginPointerGesture`. l.1789: `setStatus((current) => statusAfterGestureRelease(current, lastNonRefusalStatusRef.current));`. Deps `[]` |
| K12 | `sed -n 1353,1390p app/contexts/ArrangementContext.tsx` | `startPlaybackAt`: `setStatus` only in the empty branch (l.1363) and the past-end branch (l.1367); none after `setIsPlaying(true)` |
| K13 | `grep -rn "playingFrom\|Playing from" app perf e2e \| wc -l` | `0` |
| K14 | `sed -n 820,840p app/contexts/ArrangementContext.tsx` | Rule W: `kind === null` → keep; the follow-paused form; playing → `insertMarkerWhilePlaying`; else `describeSpaceStartRef.current()` |
| K15 | `grep -n "insertMarkerStatusKind(current.status) !== null\|current.setStatus(current.describeSpaceStart())" app/components/arrangement/StudioWorkspace.tsx` | 2 hits: l.1940 and l.1943 (Rule S) |
| K16 | `sed -n 12,28p app/lib/arrangement/status-announcement.ts` | a string bumps the sequence unless a gesture is active and the text is equal; a function returns `previous` when the text is unchanged |
| K17 | `grep -rnE "it\('PB[0-9]+" app \| awk -F: '{print $1}' \| sort \| uniq -c; grep -rnE "it\(['\"]PBS[0-9]+" app perf e2e \| wc -l` | `2 …store-focus-fixups.test.tsx` and `8 …playback-start.test.ts`; then `0` |
| K18 | `sed -n 320,327p app/lib/arrangement/__tests__/status-lifetime.test.tsx` | l.325 `setTimeRange({ start: 5, end: 2, … })`; l.326 expects `insertMarkerAfterStop('00:04.000')` |
| K19 | `grep -c "PB[1-8]" docs/implementation/2026/quarter-IV/203-sys-6-status-lifetime-stage-1.md` | `3` |
| K20 | `grep -rl "beginPointerGesture\|statusAfterGestureRelease" app --include=*.test.ts*` | 7 files: `insert-marker-ui`, `pending-status`, `self-disabling-focus`, `ArrangementContext`, `tempo-seed-ui`, `master-ui` and `clip-gain` |
| K21 | `grep -rnE "it\('LT(1[2-9])" app \| wc -l` | `0`: the new ids are free |
| K23 | `grep -nE "setRange\(" app/contexts/ArrangementContext.tsx \| grep -v "const setRange" \| wc -l` | `17`, including `placeInsertMarker` (l.846), l.1988, l.2008 and l.2149 `setRange({ ...range, allTracks: true })` |
| K22 | `sed -n 906,910p app/components/arrangement/ArrangementClip.tsx` | the clip-body `div` (`cursor-text`, `rangeBodyTitle`) with `onPointerDown={(event) => beginGesture('range', event)}` at l.910 |

## 10. STOP conditions (L11)
- A frozen or covering test fails, including by timeout, or a covering test runs above 50 % of its timeout.
- A clause conflicts with HEAD's behaviour for where Space plays.
- A §7 mutant stays green and no equal-or-stronger row inside the grants can catch it.
- The reviewer shows a Medium+ regression outside the grants.

## 11. After C PASS
**Close** these ids and remove them from `deferred_low_polish` and `open_findings` (L7):
- GATE272-S1-LATE-READ;
- B-R272-STOPPED-TEXT-WHILE-PLAYING;
- C-R272-01;
- GATE272-S3-SELECTION-PASTEND-STALE;
- GATE272-S2-RENDER-REF;
- INFO-C272-K11.

**SYS-6 stays `in_progress`.** Stage 3 is round 274 (D-29z600):
- C-R271-01-NUDGE-STALE-STATUS (the edit-result class);
- GATE270-S2-REPEAT-ANNOUNCE. K16 says a string write bumps the sequence, so its claim may be false: probe it first;
- INFO-C248-STALE-NOTE, carried;
- doc 203 and doc 204 l.4 → `Completed (C round 274 PASS)` (L28).
