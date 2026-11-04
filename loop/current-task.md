# Round 332: PERF-DRAG-PREVIEW stage c2b-i. The overview and the track meters stop re-rendering for fields they do not draw

**Planned by:** B, at the round 331 → 332 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v291; D-29z972…D-29z983):
- **D-29z972: round 331 closed as PASS, from C's evidence.** `c-round-331.json`: `taskStatus` PASS, `browserVerified`/`realVerified` true, 14/14 rows. Gate 331 published `c1d3fbf` on both remotes [K1].
  - **Stage c2a → done.** The fade item target (≤ 15 per move, D-29z935) is met: 13.767 per move, max 14.
  - Closed: SIG-R326-DETAIL-IGNORES-FADE, SIG-R326-READOUT-PRIMITIVE, GATE330-S1 and GATE330-S2.
- **D-29z973: A-R331-REVIEW-STALE-CLIP is re-rated.** It was a latent Medium; it is now an info design signal merged into SIG-R331-DETAIL-PICK.
  - It has no reproducible failure. A, C and the gate-331 reviewer each traced every reader and action of the held clip, and none found a fade or envelope reader or a spread write-back (`a-round-331.md`, the findings in `c-round-331.md`, `gates/round-331/review.md` "What I checked").
  - PS-ROLES, DP27 and DP28 force any new clip field to be classified.
  - L46 deadline: T12-ADVANCED micro fades (the first fade field the panel shows), or one question at RETRO 336, whichever comes first.
- **D-29z974: C-R331-01** (Low, pre-existing, identical on HEAD) → `deferred_low_polish`. Its fix must carry a hit-target row at the smallest lane height (52 px, at 1280×720 with the panel open).
- **D-29z975: the gate-331 Lows.**
  - **GATE331-S1** (the roles record is not used at runtime): keep the hand-written equalities, including the new overview one. Deriving them from the record needs a key list or a cast under TS strict. PS-ROLES and PS-OVR-ROLES pin each record to its equality, field by field. Doc 232 records the choice (§1.3).
  - **GATE331-S2** (doc 232: the title lacks c2a, the TODO's "c2" wording is stale, item 30 omits `sourceOffset`): fixed in §1.3.
  - **GATE331-S3** (DP28 and `mountedSelectionMarkup` leak a mount on failure): try/finally, already in the sketch.
  - **GATE331-S4** (DP25's exact `toBe(2)`): kept. It is the positive control of the 0-render asserts, so a change in clip-view renders must surface and be ruled.
- **D-29z976: stage c2b is split into c2b-i (this round) and c2b-ii.**
  - c2b-i: the overview equality and `memo` on the track meter. One mechanism: skip fields that are not drawn.
  - c2b-ii (after REGRESSION): the detail Start/End text derived in render instead of the layout effect in `ArrangementDetailPanel.tsx` [K9]. The text is editable input state, so c2b-ii uses the existing `clipGainText` sentinel pattern keyed on the raw numbers.
  - `performance-optimizer` and `tech-lead` both recommended the split.
  - `tech-lead` also advised holding the overview until checkpoint D-29z915. B keeps D-29z966 and proceeds:
    - the equality only skips renders;
    - a changed `tracks` reference falls back to a render;
    - DP29, DP30, DP32 and five overview mutants guard it.
- **D-29z977: the track meter's memo uses `ArrangementTrackMeterInner`** with `export const ArrangementTrackMeter = memo(ArrangementTrackMeterInner);`. `track-meter-ui.test.tsx` gets a 4-string name grant.
  - `performance-optimizer` suggested a named function expression instead. B measured that esbuild renames it `ArrangementTrackMeter2` [K22]. The name-keyed probe at `track-meter-ui.test.tsx` l.590–602 then silently counts 0, so the suggestion is rejected.
- **D-29z978: NOTE-C331-OFFSET-ONLY-GUARD closed as accepted.** PS-ROLES guards the readout equality (C's mutant was red on it), and no gesture changes `sourceOffset` alone. A's round-331 reviewer Lows on DP27's scope and the zero-peak fixture → `deferred_low_polish` (A-R331-REVIEW-DP27-SCOPE).
- **D-29z979: architecture.**
  - The gate-331 note → ARCH-R331-PREVIEW-READERS; A's note → ARCH-R331-PREVIEW-ISEQUAL. Both are signals and not scheduled.
  - Signal 3 has recurred in rounds 328–332 on `StudioWorkspace.tsx` l.637–864. B asks root to run checkpoint D-29z915 after this round publishes and before c3 (`b-round-331-checkpoint-addendum.md`). Non-blocking.
- **D-29z980:** SIG-C331-FADE-COLLAPSES-GROUP is a candidate Live-reference question for the next fade feature round, not a task. Pointer-down on a fade handle collapses a multi-selection, identically on HEAD.
- **D-29z983: the `ArrangementPeakPath` field comparator is dropped from c2b-i, after B measured it.**
  - A custom `memo` comparator turns the simple memo into a MemoComponent wrapper fiber plus the inner fiber, and both probes count both.
  - In B's v1 sketch, trim therefore rose 24.583 → 25.567 per move (max 23 → 24), while fade fell to 9.833 and move to 26.233 (`b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt`). `names-sketch-v1-comparator.json` shows `ArrangementPeakPathInner` twice per instance.
  - `tech-lead` had rated the comparator low value, because `useMemo` already caches the path.
  - Successor: PERF-CAND-PEAK-PRIMITIVE-PROPS. With primitive props, the default memo skips without a wrapper. It is decided at c2b-ii planning, because it touches `ArrangementDetailPanel.tsx`, which c2b-ii opens.
- **D-29z981: this task.**
- **D-29z982: the next round is REGRESSION.** It will be planned on or after 2026-11-05 (`regression-last` 2026-11-02 [K14]). Its scope additions now include one c2b-i row. c2b-ii follows it.

**Read first:** `lessons.md`: L23, L29, L31, L37, L38, L56, L57, L58. A also reads the primitives `AGENT_DISCOVERABLE_CODE.md` (new exports), `FORWARDREF_COMPONENT.md` (the memo export of an existing component) and `AUDIO_ARCHITECTURE.md` (Studio).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `c1d3fbf` (gate 331, published), with a clean tree: 0 entries in `git status` [K2]. Protected files: 11/11 OK [K13]. No dependency change.

## 0. Why this round, and B's evidence
- **What renders today on each fade pointermove:** 14 components (C round 331, `c-round-331/names-a.json`, 1440×900).
  - **Shown changes:**
    - the clip view (`ArrangementClipViewInner` + 2 hosts) and `ArrangementClipEnvelope`;
    - `ArrangementStatusTextInner`;
    - the lane (`ArrangementLane` + 4 hosts);
    - `ArrangementPeakPathInner`. The path does not change, but it is not skipped this round (D-29z983).
  - **Waste:**
    - `ArrangementOverviewWithPreviewInner` + `ArrangementOverviewInner`. The overview draws only the clip `id`, `trackId`, `start` and `duration`, the track order and kind, and the clip count. It reads no fade, envelope, gain, source or offset field [K7].
    - `ArrangementTrackMeter`. Its props are `trackId` and `trackName` [K4], and it is not memoised, so every lane render re-renders it, including the workspace renders (click, play, zoom, the move's crossing commit).
- **The cut.** One new exhaustive roles record and two equalities, all in `preview-store.ts`:
  - `OVERVIEW_CLIP_FIELD_ROLES`: shown = `id`, `trackId`, `start`, `duration`; the other 6 fields are ignored. `ArrangementClip` has 10 fields [K10], so a new field is a compile error until the record classifies it.
  - `sameOverviewClipShownFields` compares the four shown fields.
  - `sameOverviewArrangementShownFields` also requires `tracks` to be the same reference, and the clip count and order to be equal.
- **The overview wrapper.** Its first selector goes through the existing `useEqualityStableSelector` [K3] with `sameOverviewArrangementShownFields`. `useArrangementPreview` still takes no equality [K8]. The `projectEnd` selector and the extent are unchanged.
- **`ArrangementTrackMeter.tsx`:** the function becomes `ArrangementTrackMeterInner`, exported as `memo(ArrangementTrackMeterInner)`. Its call site in `ArrangementLane.tsx` is unchanged [K4]. The meter keeps its own subscriptions (`useSyncExternalStore` for the over latch, `useTrackMeterWriter`), so a latch still re-renders it. B traced the latch render under memo (`b-round-331/meter-name-probe.txt`), and `track-meter-ui.test.tsx` pins it.
- **Not changed:** `ArrangementPeakPath` (still `memo(ArrangementPeakPathInner)`, with no comparator [K5]) and the detail layout effect [K9].
- **B's sketch** (`b-round-331/sketch/sketch.patch.txt`; scratch `/home/runner/b331-scratch`; `git apply --check` is clean on `store/`). 6 files, 226 insertions and 28 deletions:
  - `preview-store.ts` (+29): the record and two equalities.
  - `StudioWorkspace.tsx`: the overview selector and its import.
  - `ArrangementTrackMeter.tsx`: memo.
  - `drag-preview-render.test.tsx`: DP29–DP32 and the GATE331-S3 try/finally.
  - `preview-store.test.ts`: PS-OVR-ROLES and PS-OVR-ARR.
  - `track-meter-ui.test.tsx`: the 4 name strings `'ArrangementTrackMeter'` → `'ArrangementTrackMeterInner'` [K12].
- **jsdom on the sketch:**
  - the 30 covering files (`b-round-331/covering-files.txt`) are green, 438/438 (`covering-unit.log`) [K19];
  - typecheck rc 0 (`sketch-typecheck.log`);
  - Biome is clean on all 6 files.
- **Mutants** (`b-round-331/run-mutants.py`, `mutants-summary.txt`). All 6 are red on the rows below, and the files are byte-restored afterwards [K20]:

| Mutant | Change | Red on |
|---|---|---|
| MU-OVR-IDENTITY | the overview equality becomes `===` | DP29 |
| MU-OVR-IGNORES-START | `start` drops out of the overview clip equality | DP30, PS-OVR-ARR, PS-OVR-ROLES |
| MU-OVR-IGNORES-COUNT | the clip-count check goes | PS-OVR-ARR |
| MU-OVR-IGNORES-TRACKS | the `tracks` reference check goes | PS-OVR-ARR |
| MU-OVR-ROLE-SOURCE-SHOWN | `sourceId` is reclassified `shown` in the overview record | PS-OVR-ROLES |
| MU-METER-NO-MEMO | the meter export loses `memo` | DP29, DP30, DP31 |

- **What the sketch caught before dispatch (L58).**
  - DP32's `duration` control equalled the base, because the clip is clamped to its source length. It was dropped; the `start` control stays.
  - The comparator finding (D-29z983). Its v1 rows (DP33, PS-PEAK-ROLES, 3 MU-PEAK mutants) are kept in `sketch/sketch-v1-comparator.patch.txt` and `mutants-summary-v1-comparator.txt` for PERF-CAND-PEAK-PRIMITIVE-PROPS.
- **Perf** [K21]. A production build of the sketch ran the interactions spec alone: `b-round-331/perf-sketch-results/latest-interactions.json`, compared by `b-round-329/perf-rowcmp.py` with C round 331's run in `b-round-331/perf-rowcmp-vs-c331.txt`.
  - rc 0, `complete` true, `failures` [], 167 rows; all 36 asserted rows pass.
  - **83 non-wallclock rows are EQUAL** to C round 331, including every range row and every fader and clip-gain row.
  - **38 rows DIFF, and every one is lower.** The `.6x` replicate of each pair equals its 1× value (L37):

| Rows | C round 331 | Sketch |
|---|---|---|
| `interact.drag.fade.{stopped,playing}.move-components-per-move` (+ `.6x`), `interact.drag.fade.30.playing.move-components-per-move` | 13.767 | **10.817** |
| `interact.drag.fade.{stopped,playing}.move-components-max` (+ `.6x`) | 14 | **11** |
| `interact.drag.trim.{stopped,playing}.move-components-per-move` (+ `.6x`) | 24.583 | **23.6** |
| `interact.drag.trim.{stopped,playing}.move-components-max` (+ `.6x`) | 23 | **22** |
| `interact.drag.move.{stopped,playing}.move-components-per-move` (+ `.6x`) | 29.4 | **28.2** |
| `interact.drag.move.{stopped,playing}.move-components-max` (+ `.6x`) | 107 | **103** |
| `interact.click.components` (+ `.6x`) | 106 | **102** |
| `interact.play.{start,stop}-components` (+ `.6x`) | 90 | **86** |
| `interact.zoom.1.components-{max,per-key}` (+ `.6x`) | 99 | **95** |
| `interact.zoom.30.components-{max,per-key}` | 244 | **240** |
| `interact.select.same-lane.30.components` | 25 | **24** |

- **Browser names probe on the sketch.** A dev server with its own `cacheDir` served the sketch, and a warm-up run (`names-warmup.json`) came first. Output: `b-round-331/names-sketch.json` and `names-compare.txt`. Compared with C round 331's `names-a.json`, the sketch only loses names and gains none:
  - `fade-moves` [11, 11, 11, 11] (was [14 ×4]). Each commit lost `ArrangementOverviewWithPreviewInner`, `ArrangementOverviewInner` and one `ArrangementTrackMeter`.
  - `trim-moves` [22, 2 …] (was [23, 2 …]); each move commit lost one `ArrangementTrackMeter`.
  - `move-moves` [21, 2, 21, 2, 103, 2, 21, 2] (was [22, 2, 22, 2, 107, 2, 22, 2]). The 103 commit lost 4 `ArrangementTrackMeter`; the others lost 1.
  - `harness-clip-click` [100, 2, 0] (was [104, 2, 0]): lost 4 `ArrangementTrackMeter`.
  - `ArrangementTrackMeterInner` appears in no measured commit.
- **Consults:** `performance-optimizer` and `tech-lead` (read-only, this planning). Their rulings are D-29z976, D-29z977 and D-29z983.
- **Not applicable:** reference-first, product-designer, the screen budget and the YouTube request. This is a perf round, and nothing visible or audible changes.

## 1. Contract
**Apply `b-round-331/sketch/sketch.patch.txt` with `git apply` from `store/`.** §1.1–§1.2 describe that patch. Do not retype it: the mutants and the claims match its exact lines. §1.3 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **Code:**
   - `preview-store.ts` appends the new exports and leaves the existing ones unchanged.
   - `StudioWorkspace.tsx` changes only the overview wrapper's first selector and the import.
   - `ArrangementTrackMeter.tsx` changes only the function name, the `memo` import and the export.
2. **Tests:** as in §0. **Grant (L23):** in `track-meter-ui.test.tsx`, only the 4 `renderLog.counts.get('ArrangementTrackMeter')` strings become `'ArrangementTrackMeterInner'`. No `expect(` is removed or weakened in any file [K11, K12].
3. **Doc 232** (`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`):
   - **l.1 (the title):** inside its parentheses, after `ეტაპი c1 — project end`, add `, ეტაპი c2a — არჩეული კლიპის მკითხველები, ეტაპი c2b-i — overview და meter` (GATE331-S2).
   - **l.4** becomes exactly `**სტატუსი:** In Progress (stage c2b-i of a, b, c1, c2a, c2b-i, c2b-ii, c3–c5; round 332, C verifies)` [K16].
   - **Item 30:** the field list becomes ``(`id`, `trackId`, `start`, `sourceOffset`, `duration`, `gainDb`)`` (GATE331-S2) [K17].
   - **Item 27** gains one sentence: the equalities are hand-written on purpose (under TS strict without a cast, deriving them needs a key list), and the PS rows pin every record to its equality, field by field (GATE331-S1).
   - **New section** `### ეტაპი c2b-i: overview და meter (round 332, D-29z976)`, placed after the c2a section and before `### განხილული ალტერნატივები`. It covers the overview record, the `tracks` reference rule, and the meter memo with the `Inner` name (D-29z977).
   - **`### განხილული ალტერნატივები`** gains four entries:
     - the `ArrangementPeakPath` comparator, measured and dropped (D-29z983, with the v1 numbers and `perf-rowcmp-vs-c331-v1-comparator.txt`);
     - the named function expression, rejected (D-29z977);
     - holding the overview until D-29z915, not followed (D-29z976);
     - the detail text in this round, moved to c2b-ii (D-29z976).
   - **`## შეცვლილი ფაილები`:**
     - the `preview-store.ts` entry gains the c2b-i exports;
     - the `StudioWorkspace.tsx` entry gains the overview selector;
     - `ArrangementTrackMeter.tsx` (c2b-i) is added as an entry;
     - the test-file entry gains `; round 332-ში DP29–DP32, PS-OVR-ROLES/PS-OVR-ARR და track-meter-ui.test.tsx-ის 4 სახელი`.
   - **`## პრობლემები და გადაწყვეტები`** gains two Problem → Solution entries:
     - a fade drag re-rendered the overview and the meters; solved by the record and memo, guarded by DP29;
     - the named memo function was renamed `ArrangementTrackMeter2` by esbuild; solved by the `Inner` name.
   - **`## ტესტირება`** names DP29–DP32, PS-OVR-ROLES and PS-OVR-ARR, plus the perf numbers cited to B's sketch (`b-round-331/perf-rowcmp-vs-c331.txt`). C measures the real ones. Name only rows that exist (L26).
   - **`## TODO`:**
     - the c2b bullet becomes c2b-ii only: the detail Start/End text in render (sentinel keyed on raw numbers), plus PERF-CAND-PEAK-PRIMITIVE-PROPS;
     - in the stage-c bullet, the `დარჩენილია c2 (…)` clause becomes `c2 დასრულდა c2b-ii-ის გარდა` (GATE331-S2) [K17];
     - add ARCH-R331-PREVIEW-READERS and ARCH-R331-PREVIEW-ISEQUAL as checkpoint signals.
   - The seven TEMPLATE headings stay in order.

**Ownership:** A edits exactly these 7 files: the 6 patch files and doc 232. These stay untouched:
- `ArrangementLane.tsx`, `ArrangementOverview.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx` and `ArrangementContext.tsx`;
- `perf/**`;
- every protected file.

A may strengthen the new rows, never weaken them.

**Neighbour behaviour that could break** (C covers each one in §2.2):
- **The overview going stale:** its bars after a move, a trim, Undo, an add or a delete.
- **The meter:** the level, the over latch and its `sr-only` text, and the reset.
- **The export sound.**
- **Access:** the anonymous `/studio-lab` and purchase protection.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-331/claims-332.sh` from the loop root. The output must equal `b-round-331/claims-332-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-331/sketch/sketch.patch.txt`, then §1.3 by hand |
| A-CLAIMS-AFTER | Save as `a-round-332/claims-after.txt`. It must equal `b-round-331/claims-332-sketch-output.txt` except:<ul><li>K2: A's line is `c1d3fbf 7`.</li><li>K13: A's line is `11`. The sketch prints 10 only because B's scratch `vite.config.ts` carries a private `cacheDir`.</li><li>K16: the new l.4.</li><li>K17: A's line is `1 0 0 1`; HEAD and the sketch print `0 1 1 0`.</li><li>K11: higher only if A strengthens a row.</li></ul> |
| A-SCOPE | `git status --short` lists exactly 7 modified files and nothing untracked |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, and K15 stays **16**. `npx biome check` on the 6 patch files is clean |
| A-UNIT | `npx vitest run $(cat <loop>/b-round-331/covering-files.txt)` (30 files): all green, 438 or more. List any test above 50 % of its timeout (L31). On the sketch the slowest new row is DP32 at 890 ms against the 5 s default (`b-round-331/new-rows-durations.txt`) |
| A-MUTANT | On a scratch copy, never in `store/`: `python3 -I b-round-331/run-mutants.py <scratch>`. All 6 are red on the rows in §0, and `restored` is true |
| A-REVIEW | code-reviewer on the 7 files. Its Architecture note goes to B |

**DP and PS rows** (they are in the patch; listed here so C can check them):
- **DP29: a fade-in move.**
  - Positive controls first: `ArrangementClipViewInner` renders 2 times over two moves, `ArrangementLane` renders, `data-fade-in` follows, and a preview exists.
  - Then `ArrangementOverviewWithPreviewInner`, `ArrangementOverviewInner` and `ArrangementTrackMeterInner` each render 0 times.
  - The overview markup is unchanged during the drag and after the release, and the committed `fadeIn` is 3.
- **DP30: a same-lane move.**
  - The lane, the clip view, the detail waveform and `ArrangementOverviewInner` render, and the overview bar lefts change.
  - The meter renders 0 times.
  - After the release the readout shows `00:04.000`.
- **DP31: a trim-start move.** The peak path and the overview render, and the bar lefts change. The meter renders 0 times.
- **DP32:** for every overview-ignored field, a fresh mount with the variant clip renders the same overview markup as the base. Control: the `start` variant differs.
- **PS-OVR-ROLES:** the record has exactly the 10 clip fields; shown = {duration, id, start, trackId}; the clip equality is true exactly for the ignored-field variants.
- **PS-OVR-ARR:**
  - Equal: the same object, and the ignored-field variants (fadeIn, gainDb).
  - Not equal: `start`, `duration`, order, count, and a new `tracks` reference.

A does not run a browser or perf row; C runs them.

### 2.2 C's rows
C writes `c-round-332.md` and `c-round-332.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 12: 6 jsdom rows (DP29–DP32, PS-OVR-ROLES, PS-OVR-ARR), 5 browser or perf rows (DRAG-NAMES, PERF, OVERVIEW-SHOWN, METER-SHOWN, D-ROWS) and G332-AUTH;
- `mutantsRecorded` = 6, the `run-mutants.py` set; `mutantRedOnSketch` = true, evidence `b-round-331/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 1 (typecheck, `b-round-331/sketch-typecheck.log`). B did not run the full suite on this sketch; it stays a gate row;
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-331.json` and `gates/round-331/verify.log`.

**Browser rows** compare A's tree (:5173) with HEAD `c1d3fbf` on a second dev server that has its own Vite `cacheDir` (L38), at **1440×900 and 1280×720**, unless the row says otherwise. A cold-compile timeout is environment-invalid: replace it and keep the original.

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-331/claims-332.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | <ul><li>7 modified files, nothing untracked.</li><li>`git apply -R --check b-round-331/sketch/sketch.patch.txt` passes. Only test hunks may differ, and only if A strengthened a row with no `expect(` removed.</li><li>`git diff --quiet` passes for `ArrangementLane.tsx`, `ArrangementOverview.tsx`, `ArrangementClip.tsx` and `ArrangementDetailPanel.tsx`.</li><li>Protected files 11/11.</li></ul> |
| UNIT | On C's scratch: `drag-preview-render`, `preview-store`, `track-meter-ui`, ×3 | Green on every run; DP29–DP32, PS-OVR-ROLES and PS-OVR-ARR present once each |
| MUTANT | `run-mutants.py` on C's scratch, plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server, 1440×900 | Per-commit counts and name multisets equal `b-round-331/names-sketch.json`:<ul><li>`fade-moves` [11, 11, 11, 11], with no `ArrangementOverview*` or `ArrangementTrackMeter*` in any commit;</li><li>`trim-moves` [22, 2, 22, 2, 22, 2, 22, 2];</li><li>`move-moves` [21, 2, 21, 2, 103, 2, 21, 2];</li><li>`harness-clip-click` [100, 2, 0].</li></ul>Compared with `c-round-331/names-a.json`, names are only lost, as listed in §0 |
| **PERF** | Production build of A's tree. Run `perf/studio-lab-interactions.perf.spec.ts` **alone**, after a browser warm-up (L38). Compare with `python3 -I b-round-329/perf-rowcmp.py c-round-331/perf-interactions-atree-results/latest-interactions.json <C's latest-interactions.json>` | <ul><li>rc 0, `failures` [], all 36 asserted rows pass.</li><li>Every non-wallclock row other than the 38 named in §0 is `EQUAL` to C round 331 (83 on B's sketch). Any other `DIFF` is a finding, reported with its number.</li><li>The 38 rows are **record** this round. A value at or below B's sketch value in the §0 table passes the row; a value above it is a finding with its number, not a FAIL of this row. 1× and 6× agreed on the sketch, so these are deterministic.</li><li>The four asserted `interact.drag.fade.*.move-components-*` rows keep their spec budget (≤ 24).</li></ul> |
| **OVERVIEW-SHOWN (browser)** | The demo's first music clip, in this order:<ol><li>a fade-in drag of 4 moves of 10 px;</li><li>a name-bar drag of 4 moves on the same lane;</li><li>a trim-start drag of 4 moves.</li></ol>Release and Ctrl+Z after each. Then add a second library sound and delete it. Record the overview's bar `left`/`width` styles and `data-extent` after every move, release, Undo, add and delete | <ul><li>During the fade drag, the overview values equal their pre-drag values.</li><li>During the move and the trim, the bar `left`/`width` change on every move. `data-extent` changes only if the project end moves, so it is recorded and compared with HEAD only.</li><li>A equals HEAD at every sample on both viewports.</li></ul> |
| **METER-SHOWN (browser)** | <ol><li>Play the demo. For 2 s while playing, read each lane meter's `data-level-db` and `data-peak`; do the same during a fade drag, a name-bar drag and a lane Volume fader drag, with playback continuing.</li><li>Raise a lane's Volume and Clip Gain until it clips, or use any demo state that latches over. Check `data-state="over"` and the `sr-only` over text.</li><li>Click Master Peak to reset.</li></ol> | <ul><li>The meters move while playing and during every drag.</li><li>Over latches, its `sr-only` text exists, and the reset clears it.</li><li>A equals HEAD in the state sequence. Levels are wallclock, so compare them as "moving / not moving", not by value.</li><li>If the over latch cannot be reached at HEAD, record the state reached and compare that; it is not a FAIL of A.</li></ul> |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-332/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD, then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha equals HEAD's at both viewports |
| G332-AUTH | As G330-AUTH (`c-round-330/g330-auth.cjs`), at both viewports, in fresh anonymous contexts | <ul><li>`/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401.</li></ul> |
| DOCS | Read doc 232 | Matches §1.3:<ul><li>l.1 and l.4 are byte-exact;</li><li>the three GATE331-S2 fixes and the S1 sentence are present;</li><li>the c2b-i section and the four alternatives exist;</li><li>the 7 headings are in TEMPLATE order;</li><li>every DP/PS id the doc cites exists as an `it(` row.</li></ul> |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**Ableton conformance:** not applicable. This is a perf round, and the behaviour is held to HEAD.

## 3. Not in scope
- **Later stages:** the detail Start/End text and PERF-CAND-PEAK-PRIMITIVE-PROPS (c2b-ii), cross-lane ghosts (c3), group moves (c4), video clips (c5).
- **For checkpoint D-29z915:** `memo(ArrangementLane)`, the lanes reading the timeline width from a store, and moving the preview readers to another file.
- **Other:**
  - budget changes in `perf/budgets.interactions.json`;
  - protected files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx` and the rest of `b-round-318/protected-sha256.txt`;
  - commits and pushes (root only).

## 7. Claims
Run `bash b-round-331/claims-332.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). Expected output at HEAD: `b-round-331/claims-332-planning-output.txt`. On B's sketch: `b-round-331/claims-332-sketch-output.txt`.
- K1 gate 331 published, commit `c1d3fbf`.
- K2 HEAD short hash and the `git status` entry count.
- K3 the overview selector (HEAD form / sketch form) and the hook definition.
- K4 the meter export (HEAD form / sketch form) and its call site in `ArrangementLane.tsx`.
- K5 the peak path export is still `memo(ArrangementPeakPathInner)` (1 at HEAD and on the sketch), 0 comparator names, and its call sites in `ArrangementClip.tsx` and `ArrangementDetailPanel.tsx`.
- K6 what the peak path reads (`buildPeakShape` args, the draft key, `clipLinearGain`), for PERF-CAND-PEAK-PRIMITIVE-PROPS.
- K7 the fields the overview reads (no fade, envelope, gain, source or offset; the trackId filter; start; duration).
- K8 `useArrangementPreview` = `useStore(store, selector)`, with no equality parameter.
- K9 the detail layout effect (c2b-ii, untouched).
- K10 the field count of `ArrangementClip`.
- K11 `expect(` and row counts in the three test files (HEAD `205 30 0 31 0 84`, sketch `229 34 4 42 2 84`).
- K12 the meter name strings in `track-meter-ui.test.tsx` (HEAD `4 0`, sketch `0 4`).
- K13 protected files OK count.
- K14 the `regression-last` date.
- K15 Biome lint diagnostics in the Studio folders.
- K16 doc 232 l.4.
- K17 the doc 232 strings for GATE331-S2 and the new section.
- K18 cited artifacts exist.
- K19 covering-unit totals and file count.
- K20 mutants killed / restored.
- K21 perf EQUAL / DIFF counts.
- K22 the esbuild rename evidence for the named function expression.
