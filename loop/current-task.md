# Round 331: PERF-DRAG-PREVIEW stage c2a. The selected-clip readout and the detail panel stop re-rendering for fields they do not show

**Planned by:** B, at the round 330 → 331 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v290; D-29z962…D-29z971):
- **D-29z962: round 330 closed as PASS, from C's evidence.** C round 330 is `taskStatus` PASS with `browserVerified`/`realVerified` true and 11/11 rows. Gate 330 published `1e5f552` (rounds 329 + 330) on both remotes [K1].
  - **PERF-DRAG-PREVIEW stage c1 → done.**
  - Closed: C-R329-01 (memo leaf; click 106, range max 30), C-R329-02 (DP24; MU-OVERVIEW-NO-LOOP red), C-R328-01 (DP20) and A-R329-REVIEW-LOOP-EXTENT (merged into C-R329-02).
- **D-29z963: INFO-C330-DP21-GRANT is accepted.** A's 7 DP21 Undo lines stay. C's mutant MU-C330-MEMO-IGNORES-END-DECREASE is red on them (`c-round-330/mutant-c.txt`), so they guard a real regression.
- **D-29z964: the gate-330 review Lows.**
  - **GATE330-S1** (doc 232's test-file entry stops at DP22) and **GATE330-S2** (item 22 still says that `memo` was not added) are fixed in this round's doc edit, §1.3. Same file, owned, low cost.
  - **GATE330-S3** (= INFO-C330-DP24-FAR: DP24's far move would pass without the loop) → `deferred_low_polish`. The loop is already proven by the `20.000` assertions and MU-OVERVIEW-NO-LOOP. Pinning a new exact value would need its own sketch run (L58).
- **D-29z965: the gate-330 Architecture proposal** (memo `ArrangementLane`, lanes read the timeline width from a store; removes the 107/108 crossing commit) → `architecture_signals` as ARCH-R330-LANE-MEMO-WIDTH, linked to the pending checkpoint D-29z915. Not scheduled.
- **D-29z966: stage c2 is split into c2a and c2b; consult disagreement ruled.**
  - `performance-optimizer` wanted the overview and `memo(ArrangementTrackMeter)` in c2a.
  - `tech-lead` wanted the overview held: its wrapper is in the signal-3 churn region, and D-29z915 should decide whether overview and lane geometry come from a store.
  - **B follows tech-lead on the overview** (2 renders per fade move; it stays as residual SIG-R331-OVERVIEW-FADE). **B moves the TrackMeter memo to c2b** with the lane-side pieces.
  - c2a (this round) touches only the two selected-clip readers in `StudioWorkspace.tsx`, plus pure helpers in `preview-store.ts`.
  - **c2b** (the next PERF round): the overview with the same equality, if D-29z915 is answered or still has no answer when c2b is planned; `memo(ArrangementTrackMeter)`; a field comparator for `ArrangementPeakPath`; and the detail start/end text derived in render instead of in the layout effect (the extra 2-component commit on trim and move).
- **D-29z967: tech-lead's `Pick<ArrangementClip, …>` projection is rejected for c2a.** `ArrangementDetailPanel` passes the clip to `ArrangementPeakPath` (props typed `ArrangementClip`) and `clipWaveformScale` → `clipLinearGain` (both typed `ArrangementClip`) [K21]. The Pick would therefore ripple into `ArrangementClip.tsx`, `waveform-zoom.ts` and `model.ts`, which is lane code shared by every clip. c2a uses the exhaustive roles record plus the PS-ROLES and DP27 guards instead. The Pick stays as signal SIG-R331-DETAIL-PICK for T12-ADVANCED (micro fades), when the panel first shows a fade field.
- **D-29z968: the hook's home.** `useEqualityStableSelector` lives in `StudioWorkspace.tsx`, next to its two callers. It is the same ref-held-selector pattern as zustand's own `useShallow` (`node_modules/zustand/esm/react/shallow.mjs`) [K22], so the ref write inside the selector is the library's documented shape, not a render side effect. If c2b needs it in a second file, c2b extracts it to `app/hooks/` first.
- **D-29z969: signals.**
  - SIG-R326-DETAIL-IGNORES-FADE and SIG-R326-READOUT-PRIMITIVE close when this round gets C PASS and the gate publishes it.
  - SIG-R326-SKIP-UNCHANGED-FADE stays a signal.
  - New candidate PERF-CAND-FADE-BUDGET: tighten the fade budget from `≤ 24` once c5 is done (D-29z950 conversion step). Its red proof is already in hand: the pre-fix tree measured 21.633 per move / max 22 (C round 330), and the sketch measures 13.767 / 14.
  - B's hypothesis "the readout render on a move is legitimate" was wrong: during a move the readout shows the lane-move hint. The sketch's DP26 found that before dispatch (L58 worked; no new lesson).
- **D-29z970: this task.**
- **D-29z971: the next round** is REGRESSION if it is planned on or after 2026-11-05 (`regression-last` 2026-11-02 [K14]). Otherwise it is stage c2b.

**Read first:** `lessons.md`: L23, L29, L31, L37, L56, L57, L58. A also reads `.claude/prompts/new-hook.md` (D-29z968 overrides its `app/hooks/` location for this round) and the primitives `AGENT_DISCOVERABLE_CODE.md` (new exports) and `AUDIO_ARCHITECTURE.md` (Studio).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `1e5f552` (gate 330, published), with a clean tree: 0 entries in `git status` [K2]. Protected files: 11/11 OK [K13]. No dependency change.

## 0. Why this round, and B's evidence
- **What renders today on every in-second pointermove** (C round 330, `c-round-330/names-a.json`, 1440×900): fade 22, trim 23 (+ 2), move 23 (+ 2) components.
- **Which of these show a value that changed** (`performance-optimizer` table, checked by B):

| Component | fade | trim | move |
|---|---|---|---|
| `ArrangementSelectedClipReadoutInner` + `ArrangementTimeText` | waste | shown change | **waste** (the lane-move hint replaces the readout while a move is active [K5]) |
| `ArrangementDetailPanelWithSelectionInner` → `ArrangementDetailPanel` → `…ContentInner` → `…WaveformInner` → `ArrangementPeakPathInner` + host | waste: the panel reads no fade or envelope field [K6] | shown change | shown change (start) |
| overview pair | waste | shown change | shown change |
| lane + `ArrangementTrackMeter`, clip view, status text, project end text | lane/meter waste (c2b); the rest show changes | | |

- **The cut.** One equality, `sameSelectedClipShownFields`, compares exactly the clip fields that the readout and the detail panel show or act on: `id`, `trackId`, `sourceId`, `start`, `sourceOffset`, `duration`, `gainDb`. `fadeIn`, `fadeOut` and `envelope` are ignored.
  - The field list is an exhaustive `Record<keyof ArrangementClip, 'shown' | 'ignored'>` (`SELECTED_CLIP_FIELD_ROLES`). `ArrangementClip` has 10 fields today [K7]. A new field is a compile error until it is classified.
  - `useArrangementPreview` takes no equality function [K8], so a small ref-held selector applies the equality (D-29z968).
  - The readout selects nothing while `clipLaneDrag` is set, because it then renders the hint and not the clip.
- **B's sketch** (`b-round-330/sketch/sketch.patch.txt`; scratch `/home/runner/b330-scratch`; `git apply --check` is clean on `store/`). Four files, 291 insertions and 5 deletions:
  - `preview-store.ts`: `PreviewClipFieldRole`, `SELECTED_CLIP_FIELD_ROLES`, `sameSelectedClipShownFields`, `sameSelectedClipsShownFields`.
  - `StudioWorkspace.tsx`: the `useShallow` import is removed (its only use was the detail wrapper [K3]). The new `useEqualityStableSelector` hook is added. The readout selector becomes `selectPreviewClip(state.preview, arrangement, clipLaneDrag ? null : primaryClipId)` with `sameSelectedClipShownFields`, and the detail wrapper's `useShallow(selectPreviewClipsAmong …)` becomes the same hook with `sameSelectedClipsShownFields` [K4].
  - `drag-preview-render.test.tsx`: DP25–DP28 (§2.1). `preview-store.test.ts`: PS-ROLES and PS-LIST.
- **jsdom on the sketch:** the 17 covering files (`b-round-330/covering-files.txt`) are green (`covering-unit.log`). Full vitest is green (`precheck-full.log`) [K18]. Typecheck rc 0. Biome is clean on the four files.
- **Mutants** (`b-round-330/run-mutants.py`, `mutants-summary.txt`). All 7 are red on the rows below, and the files are byte-restored afterwards [K19]:

| Mutant | Change | Red on |
|---|---|---|
| MU-DETAIL-SHALLOW | the detail equality reverts to HEAD's `useShallow` semantics (element identity) | DP25 |
| MU-READOUT-IDENTITY | the readout equality becomes `===` | DP25 |
| MU-READOUT-HINT-SELECTS | the readout keeps selecting the clip during a lane move | DP26 |
| MU-EQUAL-IGNORES-START | `start` drops out of the equality | DP26, PS-ROLES, PS-LIST |
| MU-ROLE-GAIN-IGNORED | `gainDb` is reclassified as `ignored` | DP27, DP28, PS-ROLES |
| MU-DETAIL-SHOWS-FADE | the detail panel prints `fadeIn` as text | DP27 |
| MU-DETAIL-FADE-ATTR | the detail waveform gets a `data-fade-in` attribute (markup only, no text) | DP27 |

  B's first DP27 compared the markup before and after a committed change in one mount. Both fade-display mutants survived it, because the equality itself freezes the stale markup. DP27 therefore compares fresh mounts (base clip vs the variant clip), and the same-mount case is kept as DP28.
- **Perf, production build of the sketch, the interactions spec alone** (`b-round-330/perf-sketch-results/latest-interactions.json`, compared by `b-round-329/perf-rowcmp.py` with C round 330's run: `b-round-330/perf-rowcmp-vs-c330.txt`) [K20]:
  - rc 0, `failures` [], 167 rows; all 36 asserted rows pass.
  - **104 non-wallclock rows are EQUAL** to C round 330. That includes every trim, range, click, zoom and play row.
  - **17 differ, all of them fade or move component rows:**
    - fade ×9: `interact.drag.fade.{stopped,playing}.move-components-per-move` (+ `.6x`) and `interact.drag.fade.30.playing.move-components-per-move` go 21.633 → **13.767**; `-max` (+ `.6x`) go 22 → **14**;
    - move ×8: `interact.drag.move.{stopped,playing}.move-components-per-move` (+ `.6x`) go 30.367 → **29.4**; `-max` (+ `.6x`) go 108 → **107**.
  - The app code measured here is the code in the final patch; only test hunks changed after the perf run.
- **Browser names probe on the sketch** (dev server :5198, own `cacheDir`; `b-round-330/names-sketch.json`, `names-compare.txt`). The first attempt timed out on the cold compile; it is environment-invalid and kept (`names-sketch-attempt1-coldcompile.log`).
  - `fade-moves` [14, 14, 14, 14] (was [22 ×4]). Each commit lost exactly `ArrangementDetailPanelWithSelectionInner`, `ArrangementDetailPanel`, `ArrangementDetailContentInner`, `ArrangementDetailWaveformInner`, `ArrangementPeakPathInner`, one host, `ArrangementSelectedClipReadoutInner` and `ArrangementTimeText`.
  - `move-moves` [22, 2, 22, 2, 107, 2, 22, 2] (was [23, 2, 23, 2, 108, 2, 23, 2]); each lost only `ArrangementSelectedClipReadoutInner`.
  - `trim-moves` and `harness-clip-click` [104, 2, 0] are equal to C round 330 in counts and names.
- **L58 positive-control sweep:** 3 count-greater-than-zero controls name these readers [K16]:
  - DP6 (trim): still true, because trim changes `start` (shown).
  - `render-budget.test.tsx` l.438–439 (select + open the detail panel): a selection change, not a fade [K16].

  All 3 are green on the sketch.
- **Consults:** `performance-optimizer` and `tech-lead` (read-only, this planning). The disagreement and the rulings are D-29z966 and D-29z967.
- **Reference-first, product-designer, screen budget:** not applicable. This is a perf round, and nothing visible or audible changes.

## 1. Contract
**Apply `b-round-330/sketch/sketch.patch.txt` with `git apply` from `store/`.** §1.1–§1.2 describe that patch. Do not retype it: the mutants and the claims match its exact lines. §1.3 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **`app/lib/arrangement/preview-store.ts`:** the four new exports are appended; the existing exports are unchanged.
2. **`app/components/arrangement/StudioWorkspace.tsx`:**
   - the readout and the detail wrapper selectors, as in §0;
   - `useEqualityStableSelector` is defined just above `ArrangementSelectedClipReadoutProps`;
   - the `useShallow` import goes;
   - nothing else changes. The overview wrapper, the group header and the `timelineSeconds` selector stay exactly as at HEAD.
3. **Doc 232** (`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`):
   - l.4 becomes exactly `**სტატუსი:** In Progress (stage c2a of a, b, c1, c2a, c2b, c3–c5; round 331, C verifies)` [K11].
   - **GATE330-S1:** the test-file entry under `## შეცვლილი ფაილები` (the line containing `round 329-ში DP20–DP22` [K12]) gains `; round 330-ში DP23–DP24, fixture/mount `loop` პარამეტრი; round 331-ში DP25–DP28 და preview-store.test.ts-ში PS-ROLES/PS-LIST`.
   - **GATE330-S2:** item 22 (the one containing `memo\` არ დაემატა` [K12]) ends with ` (round 330-ში შეიცვალა, იხ. item 23)`.
   - A new `### ეტაპი c2a: არჩეული კლიპის მკითხველები (round 331, D-29z966)`, placed after the c1 section and before `### განხილული ალტერნატივები`. It covers the shown-field equality, the exhaustive roles record, the hook (zustand `useShallow` pattern) and the lane-move hint branch.
   - `### განხილული ალტერნატივები` gains the rejected `Pick` (D-29z967) and the held overview (D-29z966).
   - `## შეცვლილი ფაილები` lists `preview-store.ts`.
   - `## პრობლემები და გადაწყვეტები` gains one Problem → Solution entry. Problem: a fade drag re-rendered the detail panel and the readout although none of their fields changed. Solution: the shown-field equality; DP25 and DP27 guard it.
   - `## ტესტირება` names DP25–DP28, PS-ROLES, PS-LIST and the perf numbers, cited to B's sketch (`b-round-330/perf-rowcmp-vs-c330.txt`). C measures the real ones. Name only rows that exist (L26).
   - `## TODO` lists c2b (overview, `memo(ArrangementTrackMeter)`, the `ArrangementPeakPath` comparator, the detail text in render), SIG-R331-DETAIL-PICK and PERF-CAND-FADE-BUDGET.
   - The seven TEMPLATE headings stay in order.

**Ownership:** A edits exactly these 5 files. `ArrangementDetailPanel.tsx`, `ArrangementOverview.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx`, `perf/**` and every protected file stay untouched. A may strengthen the new rows, never weaken them. No `expect(` is removed from any existing row.

**Neighbour behaviour that could break** (C covers each one in §2.2):
- a shown value going stale: trim and move readouts, the group detail after a gain change, and the state after release and Undo;
- the lane-move hint;
- the export sound;
- the anonymous `/studio-lab` and purchase protection.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-330/claims-331.sh` from the loop root. The output must equal `b-round-330/claims-331-planning-output.txt`. Any difference is a STOP |
| A-IMPL | `git apply b-round-330/sketch/sketch.patch.txt`, then §1.3 by hand |
| A-CLAIMS-AFTER | Save as `a-round-331/claims-after.txt`. It must equal `b-round-330/claims-331-sketch-output.txt` except:<ul><li>K2: A's line is `1e5f552 5`;</li><li>K11: the new l.4;</li><li>K12: A's line is `1 1 1 1` (both gate-330 strings still present once, and both additions present once; the sketch and HEAD print `1 1 0 0`);</li><li>K13: A's line is `11`;</li><li>K10: higher only if A strengthens a row</li></ul> |
| A-SCOPE | `git status --short` lists exactly 5 modified files (the 4 patch files + doc 232) and nothing untracked |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, and K15 stays **16**. `npx biome check` on the four code files is clean |
| A-UNIT | `npx vitest run $(cat <loop>/b-round-330/covering-files.txt)` (17 files): all green, 247 or more. List any test above 50 % of its timeout (L31). On the sketch the new rows take 0–277 ms against the 5 s default timeout (DP27 277 ms, DP28 206 ms; `b-round-330/new-rows-durations.txt`) |
| A-MUTANT | On a scratch copy, never in `store/`: `python3 -I b-round-330/run-mutants.py <scratch>`. All 7 are red on the rows in §0, and `restored` is true |
| A-REVIEW | code-reviewer on the 5 files. Its Architecture note goes to B |

**DP rows** (they are in the patch; listed here so C can check them):
- **DP25:** a fade-in move. Positive control first: `ArrangementClipViewInner` renders 2 times over two moves, `data-fade-in` follows, and a preview exists. Then the readout, `ArrangementTimeText`, the detail wrapper, `ArrangementDetailPanel`, `…ContentInner` and `…WaveformInner` each render 0 times. The readout and detail text are unchanged during the drag and after the release, and the committed `fadeIn` is 3.
- **DP26:** a same-lane move. The hint is shown, the readout renders 0 times and is absent, the detail panel renders and its text follows `00:04.000`. After the release the readout shows `00:04.000`.
- **DP27:** for every field classified `ignored`, a fresh mount with the variant clip renders the same readout and detail-panel markup as the base clip (`outerHTML`, with `useId` values normalised). Control: the `start` variant's markup differs.
- **DP28:** for every `ignored` field, a committed change in one mount changes the clip view's markup, keeps the readout and detail markup, and stores the variant.
- **PS-ROLES:** the roles record has exactly the 10 clip fields; `ignored` = {envelope, fadeIn, fadeOut}; the equality is true exactly for the ignored-field variants.
- **PS-LIST:** list order, length and shown-field changes; `undefined` handling.

A does not run a browser or perf row; C runs them.

### 2.2 C's rows
C writes `c-round-331.md` and `c-round-331.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 6 (DP25–DP28, PS-ROLES, PS-LIST) + 7 browser or perf rows (DRAG-NAMES, PERF, FADE-SHOWN, TRIM-SHOWN, MOVE-HINT, GROUP-SHOWN, D-ROWS) + G331-AUTH = 14;
- `mutantsRecorded` = 7, the `run-mutants.py` set; `mutantRedOnSketch` = true, evidence `b-round-330/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 2 (full vitest `b-round-330/precheck-full.log`, typecheck `b-round-330/sketch-typecheck.log`);
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-330.json`.

**Browser rows** compare A's tree (:5173) with HEAD `1e5f552` on a second dev server that has its own Vite `cacheDir` (L38), at **1440×900 and 1280×720**, unless the row says otherwise. A cold-compile timeout is environment-invalid; replace it and keep the original.

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-330/claims-331.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | 5 modified files, nothing untracked. `git apply -R --check b-round-330/sketch/sketch.patch.txt` passes (only test hunks may differ, and only if A strengthened a row with no `expect(` removed). `git diff --quiet -- app/components/arrangement/ArrangementDetailPanel.tsx` passes. Protected 11/11 |
| UNIT | On C's scratch: `drag-preview-render`, `preview-store`, `status-preview-store`, ×3 | Green on every run; DP25–DP28, PS-ROLES and PS-LIST present |
| MUTANT | `run-mutants.py` on C's scratch, plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server, 1440×900 | Per-commit counts and names equal `b-round-330/names-sketch.json`:<ul><li>`fade-moves` [14, 14, 14, 14]. Each commit's name multiset equals `names-sketch.json`: no `ArrangementDetail*`, `ArrangementSelectedClipReadoutInner` or `ArrangementTimeText`; `ArrangementPeakPathInner` and `tag11` each appear once fewer than in C round 330 (the lane clip's copies stay);</li><li>`move-moves` [22, 2, 22, 2, 107, 2, 22, 2], with no `ArrangementSelectedClipReadoutInner` in any move commit;</li><li>`trim-moves` and `harness-clip-click` [104, 2, 0] equal to C round 330</li></ul> |
| **PERF** | Production build of A's tree. Run `perf/studio-lab-interactions.perf.spec.ts` **alone**, after a browser warm-up (L38). Compare with `python3 -I b-round-329/perf-rowcmp.py c-round-330/perf-interactions-atree-results/latest-interactions.json <C's latest-interactions.json>` | <ul><li>rc 0, `failures` [], all 36 asserted rows pass.</li><li>Every non-wallclock row other than the 17 named in §0 is `EQUAL` to C round 330 (B's sketch: 104 equal). Any other `DIFF` is a finding, reported with its number.</li><li>The 17 rows are **record for the equality clause** this round; the four `interact.drag.fade.{stopped,playing}.move-components-{per-move,max}` rows keep their spec budget (≤ 24) and stay inside the 36 asserted rows. Finding thresholds:<ul><li>fade per-move above 14.5 or max above 14;</li><li>move per-move above 30 or max above 107.</li></ul>A value over a threshold is reported as a finding with its number, not as a FAIL of this row. B's sketch measured 13.767 / 14 and 29.4 / 107. No loaded replicate was run (L37), so these are not exact asserts</li></ul> |
| **FADE-SHOWN (browser)** | Select the demo's first music clip, open the detail panel, then drag its fade-in handle 4 moves of 10 px. Record the readout text and `title`, and the detail-content text, after every move, after the release and after Ctrl+Z | During the drag, the readout and detail values equal their pre-drag values. After the release and after Undo, A's values equal HEAD's at every sample. The clip's `data-fade-in` follows the drag on both trees |
| **TRIM-SHOWN (browser)** | The same clip: trim-start drag, 4 moves | The readout and detail text change on each move and equal HEAD's at every sample (the equality must not hold back a shown change) |
| **MOVE-HINT (browser)** | The same clip: drag by its name bar, 4 moves on the same lane | During the drag the lane-move hint is shown and `arrangement-selected-clip` is absent on both trees. After the release the readout equals HEAD's |
| **GROUP-SHOWN (browser)** | Click the first music clip, then Shift+click a second audio clip (Shift adds to the selection [K23]), so the detail panel shows the group view. Drag one member's fade-in and release. Then type a value into the group's Clip Gain input and commit it (in the group view it sets all members) | A equals HEAD at every step, in the group detail text and in the gain range text, which updates after the gain commit. **Listed L29 deviation:** B took this recipe from the code (K23) and did not run it in the browser at the baseline; no loop artifact holds a browser multi-select recipe (B grepped `tasks/round-301.md` and `b-round-328/rows.mjs`). If the group view cannot be reached at HEAD, C records the state it reached and compares that state. That is not a FAIL of A |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-331/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD, then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha equals HEAD's at both viewports |
| G331-AUTH | As G330-AUTH (`c-round-330/g330-auth.cjs`), at both viewports, in fresh anonymous contexts | `/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| DOCS | Read doc 232 | Matches §1.3: l.4 is byte-exact, both gate-330 Lows are fixed, the c2a section exists, the 7 headings are in TEMPLATE order, and every DP/PS id the doc cites exists as an `it(` row |

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**Ableton conformance:** not applicable. This is a perf round, and the behaviour is held to HEAD.

## 3. Not in scope
- The overview, the lanes, `ArrangementTrackMeter`, `ArrangementPeakPath` and the detail layout-effect text (c2b).
- Cross-lane ghosts (c3), group moves (c4), video clips (c5).
- Budget changes in `perf/budgets.interactions.json`.
- Protected files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx` and the rest of `b-round-318/protected-sha256.txt`.
- Commits and pushes (root only).

## 7. Claims
Run `bash b-round-330/claims-331.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). Expected output at HEAD: `b-round-330/claims-331-planning-output.txt`. On B's sketch: `b-round-330/claims-331-sketch-output.txt`.
- K1 gate 330 published, commit `1e5f552`.
- K2 HEAD short hash and the `git status` entry count.
- K3 `useShallow` occurrences in `StudioWorkspace.tsx` and its import line.
- K4 the readout selector (HEAD form / sketch form) and the detail `useShallow(selectPreviewClipsAmong …)` line.
- K5 the readout's `return clipLaneDrag ? (` branch and the hint testid.
- K6 `fadeIn|fadeOut|envelope` occurrences in `ArrangementDetailPanel.tsx` (0) and the `sourceOffset` readout line.
- K7 the field count of `ArrangementClip`.
- K8 `useArrangementPreview` = `useStore(store, selector)`, with no equality parameter.
- K9 the new exports and the hook (0 at HEAD, 1 each on the sketch).
- K10 `expect(` and DP-row counts in `drag-preview-render.test.tsx` and `preview-store.test.ts`.
- K11 doc 232 l.4.
- K12 the two gate-330 strings in doc 232, and the two §1.3 additions.
- K13 protected files OK count.
- K14 the `regression-last` date.
- K15 Biome lint diagnostics in the Studio folders.
- K16 count-greater-than-zero controls on the readers.
- K17 cited artifacts exist.
- K18 full vitest totals and rc on the sketch.
- K19 mutants killed / restored.
- K20 perf EQUAL / DIFF counts.
- K21 `ArrangementPeakPath` and `clipLinearGain` take `ArrangementClip`.
- K22 zustand's `useShallow` source holds the previous value in a ref.
- K23 a Shift+pointerdown on a clip calls `toggleClipSelection(clip.id, 'add')` (Ctrl/Cmd toggles).

On the sketch output, K2 shows the scratch repo's own hash and K13 is `10`, because the scratch's `vite.config.ts` carries B's private Vite `cacheDir`. That edit is not in the patch, and A's lines are fixed by A-CLAIMS-AFTER. K16 rises 3 → 5 because DP26 adds two positive controls.
