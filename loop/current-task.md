# CURRENT TASK — Round 345: PERF-DRAG-PREVIEW stage c5-ii. A video clip drag (move, trim, fade, and a group that holds a video clip) previews through the store, so it no longer re-renders the provider and the whole workspace on every pointermove. The video dock still follows the drag. Five video perf rows become asserts

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 344 → 345 planning.

**Decisions** (all in `backlog.json` → `decisions_log_b`, backlog v303 → v304 → v305 → v306, D-29z1084…D-29z1089):
- **D-29z1084: round 344 closed as PASS, from C's evidence.**
  - `c-round-344.json`: `taskStatus` PASS, `browserVerified`/`realVerified` true, 10 rows.
  - Gate 344 is `published` as **`c79642c`** on both remotes [K1]. The gate's `head` field (`0aa317f`) is the pre-publish parent; `context/head-sha.txt` still says `0aa317f`, which is stale. **The baseline is `c79642c`** [K2].
  - Stage c5-i → done.
  - New perf oracle: `c-round-344/perf-results/latest-interactions.json` [K13]. The c5-ii value baseline is `c-round-344/video-rows.txt`.
- **D-29z1085: round-344 notes.**
  - A's six reviewer Lows go to `deferred_low_polish`.
  - C-R344-PERF-DURATION goes into ROOT-REQ-PERF-TIMEOUT, because the fix is root-only config.
  - The `withTeardown` note becomes signal ARCH-R344-WITH-TEARDOWN.
- **D-29z1086: c5-ii rulings and consults** (§0.4, §1.1).
- **D-29z1087: this task.**
- **D-29z1088: the reviewer's pre-existing findings** are recorded, not scheduled (§5).
- **D-29z1089: final-review rulings.** The RENDERS move rows allow up to 3 workspace renders, from the project-end crossings (DP22). A's mutants run on a scratch copy only. Probe fact: component-name columns are invalid on production builds.

**Read first:**
- `lessons.md`: L10, L11, L12, L22, L26, L28, L29, L31, L34, L37, L38, L49, L51, L52, L56, L57, L58. For C also L59 and L60 (destructive commands only inside `c-round-345/`, with absolute paths).
- Primitives: `AUDIO_ARCHITECTURE.md` (Studio/DAW), `REACT_CONTEXT.md` (store/context readers), `AGENT_DISCOVERABLE_CODE.md` (the new hook name), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests), `GEORGIAN_DOCS.md` (docs).
- `.claude/prompts/studio-feature.md` (Studio change).

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, screen budget and the YouTube request do not apply.** This is a performance round. What the user sees and hears must stay exactly as at HEAD, and the browser rows prove it: B's dock probe gives identical clip, gap-caption, fade-overlay, status and Undo states on HEAD and on the sketch at both viewports (§0.3). No text, layout, colour or audio-graph change.

## Baseline
- HEAD is `c79642c` (gate 344, published), with a clean tree [K2]. Protected files: 11/11 OK [K8]. No dependency change.
- **Perf oracle:** `c-round-344/perf-results/latest-interactions.json`. It has 230 rows, `complete`, 0 failures. Video stopped is 98.35 per move; the audio lane move is 22.8 [K13].
- **Budget file:** 230 rows, 11 video rows, 0 asserted video rows, 55 asserted rows and 16 `commits-per-move` rows [K7].

## 0. Why this round, and B's evidence

### 0.1 Premise at HEAD (L37)
- **Perf harness** (C round 344, production): a video clip name-bar move costs **98.35 components per move** (max 100). An audio lane move costs 22.8 [K13].
- **Browser probe** (`b-round-343/probe/head-*.json`, dev): move 99.4, trim 100.7 and fade 94.4 per move. `ArrangementProvider`, `StudioWorkspace` and `ArrangementVideoDock` render on 59 of 59 move commits.
- **Cause:**
  - `ArrangementClip.tsx` sends a video clip's geometry to `previewArrangement` (`const previewGeometry = isVideo ? previewArrangement : …`), which calls `updateHistory` [K3, K5].
  - The video fade readout goes to `setStatus` (`previewStatus && !isVideo`) [K3].
  - A group that holds a video clip uses `previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry` [K3].
  - The dock reads React `arrangement` in its stopped-sync effect, its caption, its gap caption and its fade overlay [K4].
  - The video lane itself already draws from the preview store (`useArrangementPreviewLaneClips`) [K5].

### 0.2 What the sketch changes (`b-round-344/sketch/source.patch.txt`; scripts `apply-source.py`, `apply-tests.py`, `apply-budgets.py`)

**`ArrangementClip.tsx`:**
- `const previewGeometry = previewClipGeometry ?? previewArrangement;` (no `isVideo` branch).
- The fade readout uses `if (previewStatus) {` for audio and video alike.
- `ClipGesture.group` loses `hasVideo`. The module function `groupHasVideoClip` is deleted. The local `previewGroup` is gone, and the group branch calls `previewGeometry`.
- `endStaleClipGesture` still calls `previewArrangement(gesture.before)`. This is the shared committed-state restore, and it also empties the store [K3]. It is not changed.

**`ArrangementVideoDock.tsx`:**
- A new module hook `useVideoLaneArrangement(arrangement)` returns `{ ...arrangement, clips: videoLaneClips }`, memoized on `[arrangement, videoLaneClips]`.
  - `videoLaneClips = useArrangementPreviewLaneClips(arrangement, videoTrackId)`. This existing hook uses `useShallow` [K5], so an audio drag returns a shallow-equal array and the dock does not render.
  - `videoTrackId` is the id of the `kind === 'video'` track, or `''` (which gives `[]`).
- `videoLaneArrangement` replaces `arrangement` in four places:
  - `resolveVideoTarget(…)` in the stopped-sync effect, and that effect's deps (`[videoLaneArrangement, isPlaying, positionStore, videoSources]`);
  - `ArrangementVideoCaption`;
  - `ArrangementVideoFadeOverlay`;
  - `ArrangementVideoGapCaption`.
- `hasVideoClips` keeps reading React `arrangement`. Edits are refused during a gesture, so the clip count cannot change mid-drag.
- The playing sync keeps `const current = getArrangement();` [K4]. `previewClipGeometry` already updates `historyRef` [K5].
- **Why this object is safe:** `video.ts` and `video-fades.ts` read only `tracks` and the video-lane clips (tech-lead, §0.4). The name says that it holds video-lane clips only.

**`ArrangementContext.tsx` is not changed.**

### 0.3 B's sketch evidence (L58). The scratch is `/home/runner/b344-scratch/sc`, a `git archive c79642c` with `node_modules` symlinked

| Check | Result | File |
|---|---|---|
| typecheck | rc 0 | `b-round-344/sketch-typecheck.log` |
| Biome check on the 3 changed source/test files | rc 0 | `b-round-344/sketch-biome.log` |
| `drag-preview-render.test.tsx` | 64/64 | `b-round-344/sketch-targeted-vitest.log` |
| 119 test files that name a video clip (list in `sketch-targeted-files.txt`) | 119 files, 1800 tests pass | `b-round-344/sketch-targeted-vitest.log` |
| Unit mutants (`sketch/run-unit-mutants.sh`) | see below | `b-round-344/unit-mut-*.log` |
| perf-lib report test with the sketch budgets (scratch config, GATE304-M1) | 34/34 | `b-round-344/perf-lib-sketch.log` |
| **Production perf, alone** | see below | `b-round-344/perf-sketch.log`, `perf-sketch-results/latest-interactions.json`, `perf-rowcmp-sketch-vs-c344.txt` |
| New budgets evaluated on the sketch run and on C's HEAD run (computed, not run) | 60 asserted rows. The sketch fails 0. HEAD fails 1 (`interact.drag.video.stopped.move-components-per-move`) | `b-round-344/budget-eval.txt` |
| **Dock probe** (`b-round-344/dock-probe.mjs`; HEAD = dev :5173, sketch = production :5189) | HEAD and sketch are **identical** at 1440 and 1280 (see below) | `b-round-344/probe/dock-{head,sketch}-{1440,1280}.json` |
| Render probe on the sketch (production) | see below | `b-round-344/probe/video-sketch-summary.txt` |

**Unit mutants** (each red on the sketch):
- **HEAD source** with the new tests: 8 red (DP9b, DP13, DP48, DP53, DP57, DP58, DP59, DP62).
- **Dock reads committed `arrangement`:** 3 red (DP58, DP59, DP61).
- **Dock subscribes to the whole preview:** 1 red (DP60).
- **`previewStatus && !isVideo` restored:** 2 red (DP13, DP48).

**Production perf:**
- rc 0, `complete`, `failures` [], 230 rows, 55/55 asserted pass.
- Against C344: **162 EQUAL, 3 DIFF, 0 NEW** [K15]. The DIFFs:
  - `interact.drag.video.stopped.move-components-per-move` **98.35 → 23.617** [23.617 ×3];
  - stopped and playing `move-components-max` **100 → 25**.
- The playing ratio (wallclock) was 23.617, 23.617 and 23.65.
- `drag-video-live` was [1, 1, 1].
- `durationMs` was 471 935. Read-only consult greps were running at the same time.
- This run was on a sketch whose dock names differed (`useShownVideoArrangement`/`shownVideoArrangement`). The final sketch differs only by that rename and the formatter's reflow (`sketch/source-perf-run-vs-final.diff`).

**Dock probe.** The transport is stopped, and `10.mp4` is imported at 0 with the playhead at 0.
- **Move +60/+120 px:** the clip start goes 1.500 → 3.000, `arrangement-video-gap` shows mid-drag, and the overlay stays 1.000. Release gives "Move clip: start 00:03.000, length 00:07" and Undo puts it back to 0.000.
- **Fade-in:** `data-fade-in` goes 1.500 → 3.000, and the overlay's `data-video-opacity` is 0.000 mid-drag. The status shows "Video Fade In: 1.500 s" → "Video Fade In: 3.000 s", then "Video Fade In: 3.000 s." at release. Undo gives 0.000 and 1.000.
- `pageErrors` [].

**Render probe (production):** per move, move 28.4, trim 26.95 (1440) and fade 15.733 (HEAD: 99.4, 100.7 and 94.4).
- Fade release commits are 2 when stopped and 4 when playing (HEAD: 1 and 3). This is the status-preview flush, the same path as the audio fade, whose harness rows are 3 and 2 [K13].
- **Probe limit:** production minifies component names, so the probe's provider, workspace and dock columns read 0 for that reason alone. Only `perMove`, `max`, `commits` and the clip states count there. C's render-name rows run on the dev server (§2.2).

### 0.4 Consults (D-29z1086)

**`tech-lead`:** no Critical or High. Applied:
- the dock object is renamed `videoLaneArrangement` (was "shown");
- DP53 checks `c1` after release;
- new DP61 (pointercancel mid video fade) and DP62 (video move while playing).

Readers found:
- **Follow the preview mid-drag:** the video lane, the detail panel, the transport and project end, the dock caption, gap caption, fade overlay and stopped frame, and the playing sync through `getArrangement()`.
- **Stay committed, with no visible effect:** `hasVideoClips`; the overview, which skips video; the envelope, which never shows for video; the export dialog, a modal.
- **Audio:** no re-schedule happens mid-drag, at HEAD or now. Release restarts stay 31.

Pre-existing findings → §5.

**`performance-optimizer`:**
- Five rows become `assert`: stopped per-move ≤ ceil(23.617) = 24, both `release-commits` == 1, playing `move-restarts` == 0, and `drag-video-live` == 1. This follows the lane and group precedent.
- Both max rows, both p95 rows, `release-restarts` and the playing ratio (wallclock) stay `record`.
- Every pre-existing deterministic median must stay EQUAL at 1× and 6×. The audio rows carry little risk: `replaceClip` and `moveClips` keep the identity of untouched clips.
- Video trim and fade harness rows are a later `record` stage: PERF-CAND-VIDEO-TRIM-FADE-ROWS, folded into the conversions stage.

## 1. What A changes (exactly these 6 files)
**Fastest route:**
1. Run `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-344/sketch/source.patch.txt /home/runner/czaba-project/tmp/studio-real-loop/b-round-344/sketch/tests.patch.txt /home/runner/czaba-project/tmp/studio-real-loop/b-round-344/sketch/budgets.patch.txt`. All three pass `git apply --check` on `c79642c`.
2. Read every hunk against §0.2 and §1.1.
3. Edit the two docs by hand (§1.3).

A may write equal or stronger code. A must not weaken any test or budget, and must not drop any `expect(` without an equal or stronger replacement (L52).

| File | What |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | §0.2 only |
| `app/components/arrangement/ArrangementVideoDock.tsx` | §0.2 only |
| `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | §1.2 only |
| `perf/budgets.interactions.json` | §1.1 rows only |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | whole (L34) |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | `### Liveness-ის წესები` and `## მეტრიკები` only |

Nothing else changes:
- not `ArrangementContext.tsx`, `preview-store.ts`, the perf spec, `perf/lib/**` or `e2e/**`;
- no config, no `package.json` or lock file;
- no protected file [K8, K11].

### 1.1 Rulings (D-29z1086, L4/L10)
- **One element, one rule.** The video fade readout follows the audio fade's contract (status preview while dragging, committed text at release), so DP13's old "status equals the committed status during the drag" is inverted on purpose. It is checked again after release.
- **Budgets:** the 5 rows above become `assert` with owner `PERF-DRAG-PREVIEW-c5-ii` and the notes in the patch. Notes on 3 more rows are extended: the two max rows and the playing ratio. Nothing else in the file changes.
  - Result: 230 rows, 11 video rows, **5 asserted video rows**, **60 asserted rows**, and 16 `commits-per-move` rows [K7].
- **Pre-existing rows:** every pre-existing non-video deterministic row must stay EQUAL against `c-round-344`. A DIFF on any of them is a STOP.
- **Video rows:**
  - expected DIFFs: stopped per-move about 23.617 (≤ 24), and both max rows about 25;
  - every other video row EQUAL;
  - a different value that still passes its budget is reported, not a STOP;
  - a failed assert is a STOP.
- **L31 (timeout):** the spec now runs 463–472 s against the 450 s bound. Record `durationMs`. Above 450 000 is a recorded Low finding (ROOT-REQ-PERF-TIMEOUT), not a STOP.
- **`drag-preview-render.test.tsx`:** about 6 s at the last run, far below its timeout (L31 OK).

### 1.2 Tests (`drag-preview-render.test.tsx`, from `tests.patch.txt`)

Rewritten from "provider path" to the store contract. No assertion is lost: each old check is kept or replaced by a stronger one.
- **DP9b:** provider and workspace 0, clip view 2, `data-clip-start` 4.000, preview `v1` 4, React `v1` 1, `getArrangement()` 4. Release: "Move clip", store empty, `arrangement === getArrangement()`, start 4. Undo gives 1.
- **DP13:** provider and workspace 0, status text 1 render, preview fade > 0, the clip's `data-fade-in` matches, React fade 0, the shown readout contains the value, and the committed `status` is unchanged mid-drag. Release: store empty, an Undo label, the fade kept, and the shown status equals the committed status. Undo gives 0.
- **DP48:** the provider pin changes from 1 to 0. The rest is unchanged.
- **DP53:** a group with `c1`, `v1` and `PROJECT_END_CLIP`. Provider and workspace 0, preview `c1` 5 and `v1` 4, the video `data-clip-start` 4.000, React unchanged. Release: "Move (2)", store empty, `c1` 5 and `v1` 4.

New tests:
- **DP57:** video trimEnd through the store. Duration 3 in the preview and 4 in React; release gives `trimEndLabel` and 3.
- **DP58:** the gap caption follows a stopped video move from the store. Moving onto the playhead hides it, moving off shows it, and release keeps it hidden.
- **DP59:** the fade overlay `data-video-opacity` follows a stopped video fade drag. Release keeps the shown value; Undo gives 1.000.
- **DP60:** an audio move with a video clip present (and `PROJECT_END_CLIP`) gives provider and workspace 0 and **`ArrangementVideoDock` 0**.
- **DP61:** pointercancel mid video fade. Store empty, Undo label unchanged, fade 0, overlay 1.000, readout text kept (the same as DP11 for audio).
- **DP62:** a video move while playing. Provider and workspace 0, `getArrangement()` 4, React 1. Release adds "Move clip" and playback continues.

### 1.3 Docs

**Doc 232 (whole):**
- **l.1:** append `, ეტაპი c5-ii — video კლიპის preview store-ში` inside the closing parenthesis.
- **l.4:** exactly `**სტატუსი:** In Progress (stage c5-ii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, conversions; C round 345 PASS)` (L28).
- **New section** `### ეტაპი c5-ii: video კლიპის preview store-ში (round 345, D-29z1086)`, after the c5-i section and before `### განხილული ალტერნატივები`. Items continue from 72, in Georgian. It covers:
  - the cause (§0.1);
  - the three `ArrangementClip.tsx` changes and why `endStaleClipGesture` stays;
  - `useVideoLaneArrangement` and why it does not render the dock on audio drags;
  - what follows the preview and what stays committed (§0.4);
  - the 5 asserts and the record rows;
  - the numbers 98.35 → 23.617 and 100 → 25.
- **One entry each** under files, problems and testing. The problem: the dock would follow nothing mid-drag if it kept React `arrangement`, which DP58/DP59 prove. The solution: the video-lane selector.
- **TODO:** the `c5-ii:` line becomes done. Keep the conversions line, and add PERF-CAND-VIDEO-TRIM-FADE-ROWS to it.
- 7 `## ` headings in TEMPLATE order [K12]. Every test name cited exists (L26).

**Doc 168 (L34), only:**
- `### Liveness-ის წესები`: the `interact.harness.drag-video-live` row is now `assert == 1` since round 345, owner `PERF-DRAG-PREVIEW-c5-ii`.
- `## მეტრიკები`: the c5-i paragraph says which 5 video rows are asserted from round 345 and which stay `record`.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-345.md` and `a-round-345/` as it goes)

| Row | Command | Expected |
|---|---|---|
| A-CLAIMS | `bash b-round-344/claims-345.sh` from the loop root, before any edit and again at the end | Pre equals `b-round-344/claims-345-planning-output.txt`. Final equals `b-round-344/claims-345-sketch-output.txt` except **K2** (A's tree: `c79642c 6`) and **K12** (`stage c5-ii of 7 1 11`); K11 0. Any other difference is a STOP |
| A-TYPE | `npm run typecheck` | rc 0 |
| A-LINT | `npm run lint` | rc 0; warnings ≤ gate 344's count (record both) |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx app/lib/arrangement/__tests__/video-fades-ui.test.tsx app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/peaks-worker-video.test.tsx` | All pass; drag-preview 64/64 |
| A-MUTANT | On a **scratch copy** of A's final tree, never `store/` (a job killed mid-mutant would leave a mutated store tree): `mkdir -p /home/runner/a345-scratch && git -C /home/runner/czaba-project/store archive HEAD | tar -x -C /home/runner/a345-scratch && cd /home/runner/czaba-project/store && git diff HEAD | git -C /home/runner/a345-scratch apply && ln -s /home/runner/czaba-project/store/node_modules /home/runner/a345-scratch/node_modules`, then `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-344/sketch/run-unit-mutants.sh /home/runner/a345-scratch /home/runner/czaba-project/tmp/studio-real-loop/a-round-345` (the script refuses the store path) | Each of the 4 mutants red, with at least the tests of §0.3; `git -C store status` unchanged |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-344/perf-results/latest-interactions.json <A's result>` | rc 0; `complete`; `failures` []; 230 rows; **60/60 asserted pass**; 162 EQUAL and 3 DIFF (the video rows of §0.3), or §1.1's video rule; every non-video row EQUAL; `durationMs` recorded |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts` | 34/34 |
| A-SCOPE | `git status --short`, `git diff --stat` | the 6 files only, 0 untracked; protected 11 OK |
| A-REVIEW | the real `code-reviewer` subagent on the 6 files | no Medium+ open; code changed after the review goes back to it (L11); Architecture notes go to B |

A does not run the full suite or `npm run verify` (gate rows). A starts no dev server.

### 2.2 C rows (C writes `c-round-345.md`, `c-round-345.json` and `c-round-345/` as it goes)

**L57 fields:**
- `assertsSpecified` = 6: PERF (the 60 asserts as one row), UNIT, MUTANT, DOCK-FOLLOWS, RENDERS and G345-AUTH.
- `mutantRedOnSketch` = true. B's 4 unit mutants were red on the sketch, with logs in `b-round-344/unit-mut-*.log`.
- `gateChecksNamed` = full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. `gateChecksRunOnSketch` = typecheck, Biome (3 files).
- `affectedChecksNamed` = drag-preview-render, the 119 video test files, the perf spec, perf-lib, the dock probe and the render probe. All six were run on the sketch.
- `chainHeadGateRunGreen`: from `gates/gate-round-344.json`.

| Row | How | Expected |
|---|---|---|
| CLAIMS | `bash b-round-344/claims-345.sh`, first and at the end | equals A-CLAIMS final |
| SOURCE-SCOPE | `git status`, `git diff --stat`, protected sha, `git apply -R --check` of the 3 patches | Only the 6 files. The patches reverse-apply, except hunks A strengthened (name each) |
| UNIT | A-UNIT's command | all pass |
| MUTANT | C's own mutant on a scratch copy (never `store/`), predicted before it runs, that differs from B's four. Examples: route only the video group branch through `previewArrangement` (predicted: DP53 red); or make `useVideoLaneArrangement` return React `arrangement` for the caption only (predicted: no jsdom test red, because DP58 reads the gap caption, so C states the prediction and records the result as a test gap if green) | red as predicted, or the recorded gap; scratch deleted |
| PERF | Production build of A's tree, spec alone, after a warm-up (L38); then `perf-rowcmp.py` against `c-round-344` | As A-PERF. Record `durationMs` and the playing ratio's 3 values |
| **DOCK-FOLLOWS (browser, dev :5173 = A's tree)** | `node b-round-344/dock-probe.mjs http://127.0.0.1:5173 <out> <w> <h>` at 1440×900 and 1280×720 | Every field of `move` and `fade` (before/mid/held/end/afterUndo: start, fadeIn, gapShown, overlayOpacity, status) and `undoAfterImport` **equal** to `b-round-344/probe/dock-head-<w>.json`; `pageErrors` [] |
| **RENDERS (browser, dev :5173 = A's tree)** | `node b-round-343/video-probe.mjs http://127.0.0.1:5173 <out> <w> <h>` at both viewports | **`providerRenders` 0 for every gesture** (move, trim, fade; stopped and playing; both viewports). `workspaceRenders` 0 for **trim-stopped at 1440** and **fade** (stopped and playing, both viewports). For **move** (stopped and playing) `workspaceRenders` ≤ 3, value recorded (D-29z1089): the imported clip is the only clip, so moving it 0 → 3 s moves the project end 7 → 10 s, and each crossed timeline second renders the workspace once, as DP22 pins. `perMove` below half of `b-round-343/probe/head-<w>.json` for the same gesture (stopped); playing `perMove` recorded. Move and trim release `commits` equal to the HEAD probe (1). All clip states (`mid`/`end`/`afterUndo`) equal to the HEAD probe. Fade release commits and every `dockRenders` value are recorded (§0.3; the dock still renders on a *video* move, ARCH-R344-DOCK-SUBTREE). B measured the sketch on production only, where names are minified, so the dev render values are new evidence, not a B oracle. The 1280 trim gesture is recorded only (a known probe artifact). `pageErrors` [] |
| PERF-LIB | A-PERF-LIB's command | 34/34 |
| G345-AUTH | as G344-AUTH (`c-round-343/tools/g343-auth.cjs`), fresh anonymous contexts, both viewports | `/studio-lab`: the workspace and the demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token`: 401 / 400 / 403 while `/__mock/health` is 200 (500 only when the mock is down, with the health status recorded). No token in any body |
| READ | read the diff against §0.2 | `endStaleClipGesture` is unchanged; no `hasVideo`, `groupHasVideoClip` or `previewGroup` [K3]; the dock's 4 readers use `videoLaneArrangement` and `hasVideoClips` reads `arrangement` [K4]; `ArrangementContext.tsx` is untouched |
| DOCS | read docs 232 and 168 | §1.3. l.1 and l.4 are byte-exact; 7 `## ` headings; the c5-ii section has the numbers; every cited DP id exists in the test file (L26); doc 168 has hunks only in its two sections |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** DOCK-FOLLOWS, RENDERS, PERF and G345-AUTH run here; none needs the backend.
**Ableton conformance:** not applicable. This is a performance change and the behaviour is unchanged (DOCK-FOLLOWS proves it).

## 3. Neighbouring behaviour that could break
- **Audio drags.** The dock now subscribes to the store. If its selector were too wide, every audio drag would render the dock: DP60 and the 162 EQUAL perf rows guard this.
- **The stopped video frame.** The dock must follow a video drag mid-gesture. DP58, DP59 and DOCK-FOLLOWS guard this.
- **Playing.** The video sync reads `getArrangement()`, and audio is not re-scheduled mid-drag (`move-restarts` 0, asserted). DP62 guards the history.
- **Video fade status.** The readout moves to the status preview; release commits the text. DP13, DP61 and DOCK-FOLLOWS (status strings equal to HEAD) guard this.
- **Undo and cancel.** One entry per gesture, and cancel restores. DP9b, DP53, DP57 and DP61 guard this.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside K2/K12.
- A patch does not apply, or a change is needed outside the 6 files (L22: STOP with the diff).
- Any non-video perf row DIFF, any failed assert, or a liveness value that is not 1.
- A mutant that stays green.

## 5. Not in scope (recorded, D-29z1088)
- **PERF-CAND-VIDEO-TRIM-FADE-ROWS:** harness rows for video trim and fade drags (`record` first). These go to the conversions stage.
- **ARCH-R344-DOCK-SUBTREE (tech-lead, optional):** the dock still renders on each *video* move. A child that owns the overlays and the stopped-sync effect would avoid it. Not scheduled; it joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.
- **TL-R344-FADE-CANCEL-STATUS** (tech-lead Medium, pre-existing; B re-rates it Low): after a pointercancel mid-fade, the last readout ("Fade In: 2.000 s") stays as the committed status while the fade reverts to 0. DP11 already pins this for audio, at HEAD.
  - It comes only from a browser or system interruption, and no data changes.
  - It goes to `deferred_low_polish`, with the rationale recorded.
- **TL-R344-CANCEL-COMMITS-MOVE (Low, pre-existing):** pointercancel during a move or trim commits the gesture. An unmount mid-drag publishes the preview with no Undo entry. → `deferred_low_polish`.
- **Later:** the conversions stage (trim/move rows → assert), PERF-CAND-FADE-BUDGET, SIG-R324-OTHER-PREVIEW-CALLERS, and **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE** (root, after c5-ii C PASS).
- **Root only:** `vitest.config.ts` (GATE304-M1), `playwright.perf.config.ts` (ROOT-REQ-PERF-TIMEOUT), commits and pushes.

## 6. Deliverables
- **A:** the 6 files; `a-round-345.md` with the A rows; logs in `a-round-345/`.
- **C:** `c-round-345.md`, `c-round-345.json` and `c-round-345/`.

## 7. Claims
Run `bash b-round-344/claims-345.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree. Expected output at HEAD: `b-round-344/claims-345-planning-output.txt`. Expected output on B's sketch: `b-round-344/claims-345-sketch-output.txt` (scratch: K2 `no-git`, K12 docs unchanged).
- **K1:** gate 344 `published` `c79642c`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** `ArrangementClip.tsx` counts:
  - the `isVideo` `previewGeometry` line;
  - the new `previewGeometry` line;
  - `previewStatus && !isVideo`;
  - `if (previewStatus) {`;
  - `groupHasVideoClip`, `hasVideo` and `previewGroup`;
  - `previewArrangement(gesture.before);`.
- **K4:** `ArrangementVideoDock.tsx`:
  - the old and new stopped-sync deps lines;
  - `resolveVideoTarget(arrangement, …)`;
  - `useVideoLaneArrangement`;
  - `arrangement={videoLaneArrangement}`;
  - `const current = getArrangement();`;
  - `useArrangementPreviewLaneClips`.
- **K5:** `ArrangementContext.tsx`:
  - `previewClipGeometry`;
  - its `historyRef` write;
  - `useArrangementPreviewLaneClips` and its `useShallow` line.
- **K6:** the old DP9b, DP13 and DP53 titles; DP57–DP62; the DP `it(` count.
- **K7:** budget counts.
- **K8:** protected 11 OK.
- **K9:** `regression-last` date.
- **K10:** DC-KINDS and `toHaveLength(16)`.
- **K11:** `app/`, `perf/`, `e2e/` and `docs/` diff lines outside the 6 files.
- **K12:** doc 232 l.4 token, `## ` count, `### ეტაპი c5-ii` count; doc 168 `## ` count.
- **K13:** the C344 oracle, with video and audio per-move.
- **K14:** B's sketch perf.
- **K15:** B's rowcmp counts.
- **K16:** every cited artifact exists.

## 8. Root notes
- **Commit readiness:** after C PASS, the 6 files of §1 are one change. The gate's full verify and review apply.
- **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE:** please call `frontend-architect` once round 345 passes C (the request since D-29z1081). Questions:
  1. Keep or extract the preview-path code in `ArrangementClip.tsx` (ARCH-R343-THREE-PREVIEW-PATHS; after c5-ii there is one path plus the restore);
  2. ARCH-R344-DOCK-SUBTREE;
  3. ARCH-R339-DRAG-MEASURE-EXTRACT, ARCH-R344-WITH-TEARDOWN and ARCH-R337-PERF-HELPERS-TO-LIB.
- **ROOT-REQ-PERF-TIMEOUT** (open since round 278): the spec now runs 463–472 s, above L31's 450 s bound. Raising 15 → 25 min is root's call.
- **Still open for root:** ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1), checkpoint D-29z915, R80-RECORDINGS-FIELD-BORDERS.
- B's scratch `/home/runner/b344-scratch/` does not survive the job. Acceptance depends only on files in `b-round-344/`.
