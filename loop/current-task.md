# Round 334: PERF-DRAG-PREVIEW stage c2b-iii. ArrangementPeakPath takes primitive props, so fade and move drags stop redrawing the waveform

**Planned by:** B, at the round 333 → 334 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v293; D-29z995…D-29z1003):
- **D-29z995: round 333 closed as PASS, from C's evidence.** `c-round-333.json`: `taskStatus` PASS, `browserVerified`/`realVerified` true, 10 rows, 0 bugs. Gate 333 published `3f945e3` on both remotes, review 9/10 [K1].
  - **Stage c2b-ii → done.** C measured trim 21.633, move 26.233 and range 7.267 per move, and 2 commits per click, all equal to B's sketch. The detail Start/End text equals HEAD at 23 samples per viewport.
  - **A-R333-DP42-FOCUS-PREMISE → info.** It is HEAD behaviour; C saw the same on A and HEAD in the browser.
- **D-29z996: the gate-333 review.**
  - Suggestions 1 and 2 need no fix → info GATE333-S1-S2.
  - Suggestion 3 is GATE333-S3-TYPED-TEXT-DRAG (DP42: text typed into the Start field is replaced when a drag starts). It is HEAD behaviour and the same thing as A-R333-DP42-FOCUS-PREMISE. It goes to `deferred_low_polish` as a question for Saba, because changing it would change behaviour.
  - Suggestion 4 (doc 232 cites B's sketch numbers for c2b-ii) is fixed in this round's doc edit (§1.3).
  - The Architecture note "keep" is added as evidence to ARCH-R331-PREVIEW-READERS.
- **D-29z997: REGRESSION timing, re-checked.** Today is 2026-11-04, 2 days after `regression-last` (2026-11-02) [K9]. The speed rule needs 3 days, so round 334 is new scope. REGRESSION-ROUND-2026-11-05 stays the first round B plans on or after 2026-11-05. Its c2b-ii `scope_additions` row drops "if published", because round 333 shipped in `3f945e3`.
- **D-29z998: the stage c2b-iii contract,** §0–§1 below.
- **D-29z999: the consult rulings** (§0.1).
- **D-29z1000: a custom memo comparator is not an allowed alternative.** Round 331 measured one: its wrapper fiber is counted, so trim got +1 per move (`b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt`).
- **D-29z1001: the 17 lower perf rows stay record this round.** The fade rows that are already asserted keep their spec budget (≤ 24). Tightening them stays with PERF-CAND-FADE-BUDGET, after c5. The move rows belong to PERF-1b-i and stay record.
- **D-29z1002: no wait for checkpoint D-29z915.** This round touches neither `StudioWorkspace.tsx` nor the context, so it does not wait for D-29z915, which still has no answer.
- **D-29z1003: this task.**

**Read first:**
- From `lessons.md`: L11, L23, L29, L31, L38, L52, L56, L57, L58.
- A also reads these primitives:
  - `AGENT_DISCOVERABLE_CODE.md`, for the new exports;
  - `FORWARDREF_COMPONENT.md`, for the existing component;
  - `AUDIO_ARCHITECTURE.md`, for Studio.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
HEAD is `3f945e3` (gate 333, published), with a clean tree: 0 entries in `git status` [K2]. Protected files: 11/11 OK [K8]. No dependency changes.

## 0. Why this round, and B's evidence
- **What renders today.** In C round 333 (`c-round-333/names-a.json`, 1440×900), every fade move and every same-lane move re-renders `ArrangementPeakPathInner`, although nothing it draws has changed:
  - each fade commit has 11 components, one of them `ArrangementPeakPathInner` (the lane);
  - each move commit has 21 components (103 at the second crossing), two of them `ArrangementPeakPathInner` (the lane and the detail panel).
- **The cause.** `ArrangementPeakPath` is wrapped in `memo` [K5], but it takes the whole `clip` object [K3]. A preview builds a new clip object on every move, so the shallow compare always fails.
  - From the clip it draws only `clip.id` (the draft-gain key), `clip.sourceOffset`, `clip.duration` and `clip.gainDb` [K3, K5].
  - Its other inputs are `peaks`, `columns`, `isVideo` and `zoom`.
- **The cut** (B's sketch, 4 source files and 2 test files):
  - `model.ts`: a new `gainDbLinearGain(gainDb: number | undefined): number`. `clipLinearGain` delegates to it [K3].
  - `waveform-zoom.ts`: a new `waveformScaleForGainDb(gainDb, isVideo, zoom)`, with the body of today's `clipWaveformScale`. `clipWaveformScale` delegates to it, so its WZ1 rows stay untouched [K3, K6].
  - `ArrangementClip.tsx`:
    - `ArrangementPeakPathProps` swaps `clip: ArrangementClip` for `clipId`, `sourceOffset`, `duration` and `gainDb`;
    - the inner function keeps the name `ArrangementPeakPathInner`, because the names probe and `renderLog` key on it;
    - the scale becomes `waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom)`, which equals HEAD's `{ ...clip, gainDb: draftGainDb }` branch;
    - the lane call site passes the 4 fields.
  - `ArrangementDetailPanel.tsx`: the detail call site passes the same 4 fields [K4].
  - `drag-preview-render.test.tsx`: a new describe block with DP43–DP48.
  - `clip-gain-waveform.test.tsx`: WG9 and WG10, inside the existing `lane and detail waveforms follow Clip Gain` describe.
- **Why the drawing cannot change.** The peak shape is `buildPeakShape(peaks, sourceOffset, duration, columns, scale)` before and after; only the source of the 4 values changes. The Clip Gain draft is still read by clip id. Three checks back this:
  - **jsdom:** the existing WZ, WG and CP rows and the new WG9/WG10 go red under the gain, offset and memo-dependency mutants (below).
  - **Browser:** the `d` of every lane and detail path equals HEAD at 22 samples per viewport, at both viewports (`b-round-333/wd-compare.txt`, `DIFFS 0` twice) [K19].
  - **Export:** the export sound does not use this component.
- **Consults (read-only, this planning):** §0.1.
- **Not applicable:** `product-designer`, `ableton-arrangement-expert`, reference-first, the screen budget and the YouTube request. This is a perf round, and nothing visible or audible changes.
- **B's sketch:** `b-round-333/sketch/sketch.patch.txt`.
  - Scratch: `/home/runner/b333-scratch/sc`, a git repo whose tree equals `3f945e3^{tree}`.
  - Size: 6 files, 194 insertions, 16 deletions.
  - `git apply --check` is clean on `store/`.
- **jsdom on the sketch:**
  - the covering set (`b-round-333/covering-files.txt`, 155 files) is green, 2459/2459 [K15]. It holds every test that imports `model`, plus the waveform, Clip Gain, detail and drag-preview tests;
  - typecheck rc 0 (`sketch-typecheck.log`); Biome is clean on the 6 files (`biome-sketch.log`);
  - the new rows take 39–67 ms against the 5 s default (`new-rows-durations.txt`, L31).
- **The new rows on HEAD's source** (the sketch's tests with HEAD's 4 source files):
  - **red:** DP43, DP44, DP47 and DP48. On 2 moves HEAD renders 2 PeakPaths for a fade, 4 for a plain move and 1 for a video fade, plus 1 on a committed fade-only change;
  - **green, as HEAD pins:** DP45 and DP46 (4 = 2 paths × 2 trim moves), and WG9 and WG10.
- **Mutants** (`b-round-333/run-mutants.py`, `mutants-summary.txt`). All 9 are red, and every file is byte-restored [K16]:

| Mutant | Change | Red on |
|---|---|---|
| MU-PEAK-CLIP-PROP-BACK | HEAD's 4 source files | DP43, DP44, DP47, DP48 |
| MU-PEAK-NO-MEMO (perf mutant) | `ArrangementPeakPath` without `memo` | DP43, DP44, DP46, DP47, DP48 |
| MU-PEAK-LANE-GAIN-DROPPED | the lane passes `gainDb={undefined}` | CP13, CP14, DP47, WG3, WG5, WZ3 |
| MU-PEAK-DETAIL-GAIN-DROPPED | the detail panel passes `gainDb={undefined}` | DP47, WG6 |
| MU-PEAK-DRAFT-IGNORED | the scale ignores the draft gain | CP1, CP3, CP4, CP13, WG4, WG8, WZ3 |
| MU-PEAK-COMMITTED-WINS | `gainDb ?? draftGainDb` | CP1, CP3, CP4, CP13, WZ3 |
| MU-PEAK-LANE-OFFSET-ZERO | the lane passes `sourceOffset={0}` | WG3, WG5, WG10, WZ2 |
| MU-PEAK-DETAIL-OFFSET-ZERO | the detail panel passes `sourceOffset={0}` | WG9, WG10 |
| MU-PEAK-MEMO-DEPS-STALE | `useMemo` drops `sourceOffset` and `duration` from its dependencies | WG10 |

- **Production perf on the sketch.** The spec ran alone, with nothing else running (L38). `b-round-333/perf-rowcmp-vs-c333.txt` compares it with `c-round-333/perf-interactions-atree-results`:
  - rc 0, `failures` [], `complete` true, 167 rows, and 36/36 asserted rows pass;
  - 104 rows are EQUAL and 17 are DIFF [K17], every DIFF lower:

| Rows | C round 333 | Sketch |
|---|---|---|
| `interact.drag.fade.{stopped,playing}.move-components-per-move` (asserted) (+ `.6x`, and `fade.30.playing`) | 10.817 | **9.833** |
| `interact.drag.fade.{stopped,playing}.move-components-max` (asserted) (+ `.6x`) | 11 | **10** |
| `interact.drag.move.{stopped,playing}.move-components-per-move` (+ `.6x`) | 26.233 | **24.267** |
| `interact.drag.move.{stopped,playing}.move-components-max` (+ `.6x`) | 103 | **101** |

  These rows are EQUAL: trim, range, click, select and `interact.harness.hook-live` (1). The loaded `.6x` replicate moves the same way (L37). This perf run was on the sketch before WG9, WG10 and DP48 were added; those are test-only, so the source it measured is the same as the final patch.
- **Browser names probe on the sketch.** A dev server with its own `cacheDir` ran on :5198. The warm-up attempt crashed on a cold compile; it is environment-invalid and kept as `names-warmup.log`. The output is `b-round-333/names-sketch.json`, and `names-compare.txt` compares it with C round 333:
  - `harness-clip-click` [100, 0], unchanged;
  - `fade-moves` [10, 10, 10, 10], was [11 ×4]. Each commit loses one `ArrangementPeakPathInner`;
  - `trim-moves` [22, 22, 22, 22], unchanged;
  - `move-moves` [19, 19, 101, 19], was [21, 21, 103, 21]. Each commit loses two `ArrangementPeakPathInner`.

  No commit gains a name.
- **Browser waveform probe on the sketch.** The probe is `b-round-333/waveform-d-probe.mjs`; its outputs `wd-{sketch,head}-{1440,1280}.json` are compared by `wd-compare.py` → `wd-compare.txt`.
  - It reads every lane and detail `path d` and the zoom value at 22 samples:
    - selected;
    - fade, move, trim-start and trim-end, each mid-drag, after release and after Undo;
    - typed Clip Gain `-3`;
    - a Clip Gain fader drag: mid-drag, release and Undo;
    - zoom 2×, and a move at 2×;
    - back to 1×, with Undo.
  - The sketch equals HEAD at every sample, with 0 page errors.
  - **Known limit:** the probe's trim-end drag did not change the clip at either viewport (`changed False`). The clip's right edge is probably outside the view on the long demo clip. At 1280×720 the trim-start drag did not change it either, as C also saw in round 333. Trim-end in the browser is therefore C's own sample (§2.2 WAVEFORM-D); in jsdom, DP46 and WG10 cover it.

### 0.1 Consults (D-29z999)
- **`performance-optimizer`:** safe to land.
  - `draftGainDb ?? gainDb` equals HEAD, because `useMixDraftValue` returns `number | undefined` (`ArrangementMixFader.tsx:30`) and the draft key is unchanged.
  - The detail call site rightly passes no `isVideo` or `zoom`: it renders only in the `!selection.isVideo` branch.
  - DP43 and DP44 also guard the identity of `peaks`, `peakColumns` and `waveformZoom`.
  - The 17 rows stay record (D-29z1001).
  - `gainDbLinearGain` belongs in `model.ts`, so the waveform and the audio gain share one formula.
  - Gaps it found, now closed:
    - the render counts alone could not catch a stale path → MU-PEAK-MEMO-DEPS-STALE + WG10;
    - the detail offset wiring was not proven → MU-PEAK-DETAIL-OFFSET-ZERO + WG9. Both mutants survived B's first sketch; both are red now.
  - Noted: DP45 is not red under MU-PEAK-NO-MEMO (its parents render once per move anyway), so DP45 is a HEAD pin, not a memo row.
- **`tech-lead`:** approve, with additions.
  - Keep both names; they follow `masterLinearGain` and `clipLinearGain`.
  - The helpers belong in lib.
  - The 6-file scope is right for one bounded round.
  - The detail offset mutant (added) and a video fade row (DP48, added).
  - STOP conditions (§1, adopted).
  - It also offered a `Pick<ArrangementClip, 'gainDb'>` widening instead of the two new exports. B keeps the helpers (D-29z999): `performance-optimizer` preferred one dB formula in `model.ts`, the widening changes two existing signatures, and the measured evidence is on the helper version.
- **Both consults:**
  - `clipWaveformScale` keeps no production caller (only `waveform-zoom.test.tsx`). It stays as a test-used delegate this round, and doc 232 records it as a known test-only export (§1.3). Removing it means editing `waveform-zoom.test.tsx`, which is out of scope.
  - A third inline `10 ** (gainDb / 20)` sits in `ArrangementContext.tsx:3402`. It is a doc 232 TODO and the signal SIG-R334-INLINE-DB-GAIN; it is not in this round.

## 1. Contract
**Apply `b-round-333/sketch/sketch.patch.txt` with `git apply` from `store/`.** §1.1–§1.2 describe that patch. Do not retype it, because the mutants and the claims match its exact lines. §1.3 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **Code.**
   - `app/lib/arrangement/model.ts`: adds `gainDbLinearGain` directly below `clipLinearGain`. `clipLinearGain` returns `gainDbLinearGain(clip.gainDb)`.
   - `app/lib/arrangement/waveform-zoom.ts`: imports `gainDbLinearGain` instead of `clipLinearGain` and adds `waveformScaleForGainDb`. `clipWaveformScale` returns `waveformScaleForGainDb(clip.gainDb, isVideo, zoom)`.
   - `app/components/arrangement/ArrangementClip.tsx`:
     - the props interface;
     - the inner function's parameters (`clipId`, `sourceOffset`, `duration`, `gainDb`);
     - the scale line and the `useMemo` dependencies;
     - the import;
     - the lane call site.
   - `app/components/arrangement/ArrangementDetailPanel.tsx`: the detail call site only.

   Nothing else in these files changes. `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx` and `perf/**` stay untouched [K18].
2. **Tests.** No existing `it(` or `expect(` changes [K7].
   - `drag-preview-render.test.tsx` gets the describe `PERF-DRAG-PREVIEW stage c2b-iii — the peak paths skip moves that keep their drawn fields`:
     - **DP43:** two fade-in moves redraw the clip view (2 renders, `data-fade-in` `3.000`) and render `ArrangementPeakPathInner` 0 times.
     - **DP44:** two same-lane moves render the detail content twice (Start reads `5`) and render `ArrangementPeakPathInner` 0 times.
     - **DP45 (HEAD pin):** two trim-start moves render `ArrangementPeakPathInner` exactly 4 times (lane + detail, on each move).
     - **DP46 (HEAD pin):** the same for two trim-end moves.
     - **DP48:** a video fade-in move keeps the provider path (`ArrangementProvider` renders once) and renders `ArrangementPeakPathInner` 0 times.
     - **DP47:**
       - a committed change of `fadeIn` only renders the clip view and 0 PeakPaths;
       - a committed `gainDb: -6` renders exactly 2 (lane + detail).
   - `clip-gain-waveform.test.tsx`, inside the existing describe:
     - **WG9 (HEAD pin):** with `s1` selected (`sourceOffset` 0.5), the detail `d` equals `buildPeakShape` from offset 0.5 at 480 columns, and differs from the offset-0 shape.
     - **WG10 (HEAD pin):** a committed `sourceOffset` 1.5 on `s1`, with the same duration, keeps the lane's column count. It changes both `d` strings, and each equals its expected shape.
3. **Doc 232** (`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`):
   - **l.1:** inside the parentheses, after `ეტაპი c2b-ii — Clip details-ის Start/End ტექსტი`, add `, ეტაპი c2b-iii — waveform-ის primitive props`.
   - **l.4** becomes exactly `**სტატუსი:** In Progress (stage c2b-iii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3–c5; C round 334 PASS)` [K11]. This is the L28 post-PASS form. It replaces the old `round 333, C verifies` wording, which was the other half of gate-333 suggestion 4 (D-29z996).
   - **l.5:** add `` `app/lib/arrangement/waveform-zoom.ts`, `app/lib/arrangement/model.ts` `` to the file list [K12].
   - **New section** `### ეტაპი c2b-iii: ArrangementPeakPath-ის primitive props (round 334, D-29z998)`, after the c2b-ii section and before `### განხილული ალტერნატივები`. Items 39–42:
     - **39, the problem:** a new clip object on every preview move breaks the memo; the counts from C round 333;
     - **40, the props:** the four props, the inner name kept, and `draftGainDb ?? gainDb`;
     - **41, the helpers:** the two helpers, and `clipWaveformScale` kept as a test-used delegate with no production caller;
     - **42, the pins:** the trim pins (DP45, DP46), WG9/WG10, and the browser `d` equality.
   - **`### განხილული ალტერნატივები`** gains three entries:
     - a custom `memo` comparator (rejected, D-29z1000: the wrapper fiber is counted, trim +1 per move);
     - passing `clip` and comparing selected fields inside the component (rejected: the same comparator problem);
     - `Pick<ArrangementClip, 'gainDb'>` parameters instead of the new helpers (not chosen, D-29z999).
   - **`## შეცვლილი ფაილები`:**
     - add `app/lib/arrangement/waveform-zoom.ts (ეტაპი c2b-iii: waveformScaleForGainDb)` and `app/lib/arrangement/model.ts (ეტაპი c2b-iii: gainDbLinearGain)`;
     - the `ArrangementClip.tsx` entry gains ` (ეტაპი c2b-iii: ArrangementPeakPath-ის primitive props)`;
     - the `ArrangementDetailPanel.tsx` entry gains `; ეტაპი c2b-iii: PeakPath-ის call site`;
     - the test-file entry gains `; round 334-ში DP43–DP48 და clip-gain-waveform.test.tsx-ში WG9–WG10`.
   - **`## პრობლემები და გადაწყვეტები`** gains one Problem → Solution entry: the PeakPath render on every fade and move. It is solved by primitive props and guarded by DP43, DP44, DP47 and DP48.
   - **`## ტესტირება`:**
     - in the c2b-ii perf entry, the last sentence `რეალურ მნიშვნელობებს C ზომავს ამ რაუნდში.` becomes ``C round 333-მა იგივე მნიშვნელობები გაზომა (`c-round-333/perf-rowcmp-vs-c332.txt`, `names-compare.txt`).`` (gate-333 suggestion 4, D-29z996);
     - a new entry names DP43–DP48 and WG9–WG10, plus the perf, names and waveform numbers cited to B's sketch (`b-round-333/perf-rowcmp-vs-c333.txt`, `names-compare.txt`, `wd-compare.txt`). C measures the real ones. Name only rows that exist (L26).
   - **`## TODO`:**
     - remove the c2b-iii bullet;
     - in the stage-c bullet, `c2 დასრულდა c2b-iii-ის გარდა` becomes `c2 დასრულდა`;
     - add GATE333-S3-TYPED-TEXT-DRAG as a question for Saba (a deferred Low; HEAD behaviour);
     - add SIG-R334-INLINE-DB-GAIN (`ArrangementContext.tsx` → `gainDbLinearGain`) and the test-only `clipWaveformScale`.
   - The seven TEMPLATE headings stay in order (`^## ` count 7) [K12].

**Ownership:** A edits exactly these 7 files: the 6 patch files and doc 232. These stay untouched:
- every other component, the context and `perf/**`;
- every protected file.

A may strengthen the new rows, never weaken them.

**STOP conditions** (L11): write "STOP — needs B ruling" at the top of `a-round-334.md` and change nothing else when:
- the patch does not apply, or A-CLAIMS differs from the planning output;
- any existing CP, WG1–WG8, WZ or DP1–DP42 expectation would have to change;
- a covering test is red, or above 50 % of its timeout;
- a mutant is not red on its rows;
- a type assertion or a fake `ArrangementClip` object becomes necessary;
- a third `<ArrangementPeakPath` call site appears, or removing `clipWaveformScale` looks necessary.

**Neighbour behaviour that could break** (C covers each one in §2.2):
- the lane and detail waveforms during fade, move, trim, Clip Gain (typed and fader drag), zoom and Undo;
- the video clip's drawing (gain only, zoom ignored);
- the export sound;
- anonymous `/studio-lab` access and purchase protection.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-333/claims-334.sh` from the loop root. The output must equal `b-round-333/claims-334-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-333/sketch/sketch.patch.txt`, then §1.3 by hand |
| A-CLAIMS-AFTER | Save as `a-round-334/claims-after.txt`. It must equal `b-round-333/claims-334-sketch-output.txt` except:<ul><li>K2: `3f945e3 7`.</li><li>K11: the new l.4.</li><li>K12: `1 1 1 7` (HEAD and the sketch print `0 0 0 7`).</li><li>K7: higher only if A strengthens a row.</li></ul> |
| A-SCOPE | `git status --short` lists exactly 7 modified files and nothing untracked |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, and K10 stays **16**. `npx biome check` on the 6 patch files is clean |
| A-UNIT | `npx vitest run $(cat <loop>/b-round-333/covering-files.txt)` (155 files): all green, 2459 or more. List any test above 50 % of its timeout (L31) |
| A-MUTANT | On a scratch copy, never in `store/`, run `python3 -I b-round-333/run-mutants.py <scratch>`.<ul><li>The scratch must be a git repo whose HEAD tree is `3f945e3^{tree}`, because MU-PEAK-CLIP-PROP-BACK reads `git show HEAD:`.</li><li>Use `git add -f public/middle-east.mp3` (A-333 note).</li><li>All 9 must be red on the rows in §0, with `restored` true.</li></ul> |
| A-REVIEW | Required: 7 changed files. Run the real `code-reviewer` subagent on the 7 files and pass its findings and Architecture note to B |

A does not run browser or perf rows; C runs them.

### 2.2 C's rows
C writes `c-round-334.md` and `c-round-334.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 14:
  - 8 jsdom rows: DP43–DP48, WG9 and WG10;
  - 4 browser or perf rows: DRAG-NAMES, PERF, WAVEFORM-D and D-ROWS;
  - VIDEO-WAVE and G334-AUTH;
- `mutantsRecorded` = 9, the `run-mutants.py` set; `mutantRedOnSketch` = true, evidence `b-round-333/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 1 (typecheck, `b-round-333/sketch-typecheck.log`). The full suite stays a gate row;
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-333.json` and `gates/round-333/verify.log`.

**Browser rows** compare A's tree (:5173) with HEAD `3f945e3` on a second dev server that has its own Vite `cacheDir` (L38), at **1440×900 and 1280×720**, unless the row says otherwise. A cold-compile timeout is environment-invalid: replace it and keep the original.

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-333/claims-334.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | <ul><li>7 modified files, nothing untracked.</li><li>`git apply -R --check b-round-333/sketch/sketch.patch.txt` passes. Only test hunks may differ, and only if A strengthened a row with no `expect(` removed.</li><li>`git diff --quiet` passes for `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx` and `perf/`.</li><li>Protected files 11/11.</li></ul> |
| UNIT | On C's scratch, run `drag-preview-render`, `clip-gain-waveform`, `waveform-zoom` and `clip-gain-pointer-preview` ×3 | Green on every run; DP43–DP48, WG9 and WG10 present once each |
| MUTANT | `run-mutants.py` on C's scratch (git HEAD tree = `3f945e3^{tree}`), plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server, 1440×900 | Per-commit counts and name multisets equal `b-round-333/names-sketch.json`:<ul><li>`harness-clip-click` [100, 0];</li><li>`fade-moves` [10, 10, 10, 10];</li><li>`trim-moves` [22, 22, 22, 22];</li><li>`move-moves` [19, 19, 101, 19].</li></ul>Compared with `c-round-333/names-a.json`, only `ArrangementPeakPathInner` is lost (1 per fade commit, 2 per move commit), and nothing is gained |
| **PERF** | Production build of A's tree. Run `perf/studio-lab-interactions.perf.spec.ts` **alone**, after a browser warm-up (L38). Compare with `python3 -I b-round-329/perf-rowcmp.py c-round-333/perf-interactions-atree-results/latest-interactions.json <C's latest-interactions.json>` | <ul><li>rc 0, `failures` [], all asserted rows pass.</li><li>`interact.harness.hook-live` reads 1 (SIG-R333-HOOK-LIVE-MARGIN). 0 is a FAIL.</li><li>Every non-wallclock row outside the 17 in §0 is `EQUAL` to C round 333 (104 on B's sketch). Any other `DIFF` is a finding, reported with its number.</li><li>The 17 rows are **record** this round, except the asserted fade rows, which keep their spec budget. A value at or below B's sketch value passes; a value above it is a finding, reported with its number.</li></ul> |
| **WAVEFORM-D (browser)** | Run `node b-round-333/waveform-d-probe.mjs <base> <out> <w> <h>` on A and on HEAD, at both viewports, then `python3 -I b-round-333/wd-compare.py <dir>`. The script reads `wd-sketch-*` and `wd-head-*`, so name A's files `wd-sketch-*`.<br>**Plus C's own trim-end sample:** scroll or zoom until the first music clip's right edge is in view. Drag the trim-end edge 3 moves of 10 px to the left. Read the lane and detail `d` mid-drag, after release and after Ctrl+Z, on A and on HEAD | <ul><li>`DIFFS 0` at both viewports; 0 page errors; 22 samples each.</li><li>The trim-end sample changes the clip (a `data-*` attribute or the style differs), and its `d` strings equal HEAD's at all three points.</li><li>If C cannot reach the trim-end edge, C reports it as a limit with the attempts, not as a PASS.</li></ul> |
| **VIDEO-WAVE (browser)** | The demo library has no video source. Add one as `b-round-328/rows.mjs` does: `page.setInputFiles('[data-testid="arrangement-video-input"]', '/home/runner/czaba-project/store/public/videos/hero/1.mp4')`, on A and on HEAD. Read the video clip's `arrangement-clip-waveform` `d` at zoom 1× and 4×, after a move and after Undo, on A and on HEAD | A equals HEAD at every sample. The video `d` at 1× equals the one at 4× (video ignores zoom), as WZ4 asserts in jsdom. If the video lane draws no waveform, record that it does so on both trees |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-334/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD, then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha equals HEAD's at both viewports |
| G334-AUTH | As G330-AUTH (`c-round-330/g330-auth.cjs`), at both viewports, in fresh anonymous contexts | <ul><li>`/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null.</li><li>`/studio/middle-east`: "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401.</li></ul> |
| DOCS | Read doc 232 | Matches §1.3:<ul><li>l.1 and l.4 are byte-exact, and l.5 names both lib files.</li><li>The c2b-iii section has items 39–42.</li><li>These are all present:<ul><li>the three alternatives;</li><li>the files entries;</li><li>the problem entry;</li><li>the c2b-ii testing sentence;</li><li>the new testing entry;</li><li>the TODO changes.</li></ul></li><li>The 7 headings are in TEMPLATE order.</li><li>Every DP, WZ, WG and CP id the doc cites exists as an `it(` row.</li></ul> |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**Ableton conformance:** not applicable. This is a perf round, and the drawing is held to HEAD.

## 3. Not in scope
- **Later stages:**
  - the ArrangementDetailClipGain memo (signal PERF-CAND-DETAIL-CLIPGAIN-MEMO);
  - c3: cross-lane ghosts;
  - c4: group moves;
  - c5: video clips;
  - the record → assert conversions (PERF-CAND-FADE-BUDGET).
- **For checkpoint D-29z915:** the preview-readers module, the overview `Pick` projection (SIG-R332-OVERVIEW-PICK), `memo(ArrangementLane)` and the timeline width from a store.
- **Other:**
  - GATE333-S3-TYPED-TEXT-DRAG (a question for Saba; no behaviour change);
  - SIG-R334-INLINE-DB-GAIN (the context's inline dB conversion);
  - removing `clipWaveformScale`;
  - `perf/budgets.interactions.json`, including the hook-live margin;
  - the protected files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx` and the rest of `b-round-318/protected-sha256.txt`;
  - commits and pushes (root only).

## 7. Claims
Run `bash b-round-333/claims-334.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). The expected output at HEAD is `b-round-333/claims-334-planning-output.txt`. On B's sketch it is `b-round-333/claims-334-sketch-output.txt`, where K2 shows the scratch's own commit and 6 entries.
- **K1:** gate 333 is published, commit `3f945e3`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:**
  - in `ArrangementPeakPathProps`, the `clip: ArrangementClip;` line (1 → 0) and the 4 new primitive lines (0 → 4);
  - the scale line (0 → 1);
  - `export function waveformScaleForGainDb(` (0 → 1);
  - `export function gainDbLinearGain(` (0 → 1).
- **K4:** the detail call site `<ArrangementPeakPath clip={clip} … />` (1 → 0); `clipId={clip.id}` in the lane file (0 → 1) and in the detail file (0 → 1).
- **K5:** the `ArrangementPeakPath` memo export and the draft-gain read, both unchanged (1 1).
- **K6:** the non-test files that reference `clipWaveformScale` (HEAD: `ArrangementClip.tsx` and `waveform-zoom.ts`; sketch: `waveform-zoom.ts` only).
- **K7:**
  - in `drag-preview-render.test.tsx`: the `expect(` count, the DP `it(` count and the DP43–DP48 count;
  - in `clip-gain-waveform.test.tsx`: the `expect(` count and the WG9/WG10 count.
  - HEAD prints `271 44 0 57 0`; the sketch prints `286 50 6 65 2`.
- **K8:** protected sha, 11 OK.
- **K9:** the `regression-last` date.
- **K10:** the Biome lint diagnostic count (16).
- **K11:** doc 232 l.4.
- **K12:** doc 232: c2b-iii in l.1; `waveform-zoom.ts` in l.5; the c2b-iii section; the `## ` heading count.
- **K13:** the `interact.harness.hook-live` budget (`assert >= 1`).
- **K14:** every cited artifact exists (L56).
- **K15:** B's covering run and file count.
- **K16:** mutants: the `restored` count (9) and the empty-red count (0).
- **K17:** perf EQUAL/DIFF counts vs C round 333 (104/17).
- **K18:** the `<ArrangementPeakPath` call sites in `app/` outside tests (2), and the 4 untouched paths are clean.
- **K19:** `wd-compare.txt`: `DIFFS 0` lines (2) and `EQUAL` samples (44).
