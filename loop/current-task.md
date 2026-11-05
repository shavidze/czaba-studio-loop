# CURRENT TASK — Round 350: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1. The video dock stops re-rendering on every pointermove of a video clip's trim, fade or move drag

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 349 → 350 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v311 → v312, D-29z1111…D-29z1116):
- **D-29z1111:** round 349 is closed as PASS from C's evidence:
  - `c-round-349.json`: PASS, `browserVerified`/`realVerified` true, 10 rows, 0 bugs, 0 blocked.
  - Gate 349 `published` **`7f56989`** on both remotes [K1].
  - **Baseline = `7f56989`**, clean tree [K2].
  - Stage video-trim-fade → done.
  - Root's docs-only `aca59b3` (store direction decision) sits between 348 and 349 and is part of the baseline.
- **D-29z1112:** the round-349 notes are routed (§5).
- **D-29z1113:** the cause and the shape (§0).
- **D-29z1114:** the release-order ruling (§0.3, both consults' High).
- **D-29z1115:** the rows stay `record` this round (§0.4). There are no new interactions rows (the D-29z1108 freeze holds).
- **D-29z1116:** this task.

**Read first:**
- `lessons.md` items 10, 11, 29, 34, 38, 49, 52, 56, 57 and 58. C also reads 59 and 60.
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (the video dock is the Studio's video layer);
  - `REACT_CONTEXT.md`;
  - `AGENT_DISCOVERABLE_CODE.md` (new names);
  - `TESTING_QUALITY_GATES.md`;
  - `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` (doc 232).

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a pure performance round. What the user sees and hears does not change, and C proves that in the browser (§2.2).

## Baseline
- HEAD `7f56989` (gate 349, published), clean tree [K2]. Protected files 11/11 OK [K8]. No dependency change.
- **Oracle:** `c-round-349/perf-results/latest-interactions.json`. It has 252 rows, is `complete` and has 0 failures, and its 70 asserted rows all pass [K6]. These rows are owned by `PERF-CAND-VIDEO-TRIM-FADE-ROWS`, all `record` [K6]:
  - `interact.drag.video-trim.*` and `interact.drag.video-fade.*`;
  - `interact.harness.drag-video-trim-live` and `interact.harness.drag-video-fade-live`.

## 0. Why, and B's evidence

### 0.1 Cause (D-29z1113)
C round 349 measured, per pointermove:

| Drag | Components per move | Comparison |
|---|---|---|
| Video trim-start | 18.683 | item target ≤ 15 |
| Video fade-in | 8.85 | audio fade-in asserts ≤ 4 |
| Video move (name bar) | 15.75 | |

B's names probe on the HEAD dev server (`b-round-349/video-names-probe.mjs` → `video-names-dev.json`) renders per move:
- **trim, 19:** `ArrangementVideoDock`, `ArrangementVideoCaption`, `ArrangementVideoFadeOverlay`, `ArrangementVideoGapCaption`, `Maximize2` and its forwardRef. That is 6 dock components, plus 13 shared preview consumers: overview ×2, lane, clip view, peak path, range overlay, the 5 detail-panel components, the selected-clip readout and the time text.
- **fade, 9:** the same 6 dock components, plus the lane, the clip view and the status text.
- **move, 17.**

The cause is that `ArrangementVideoDock` subscribes to the preview store in its **body**. At l.195–198, `useVideoLaneArrangement` calls `useArrangementPreviewLaneClips` [K3]. The dock then passes a new `videoLaneArrangement` object to Caption, GapCaption and FadeOverlay [K3]. Every preview change therefore re-renders the whole dock subtree.

That subscription carries real behaviour, and it must be kept. B's behaviour probe (`video-behaviour-probe.mjs` → `video-behaviour-dev.json`, HEAD, stopped, 1440×900) recorded:
- **Trim with the playhead inside the clip (7.781 s):** the `<video>` `currentTime` stays at 7.781 while the clip start moves 0 → 0.6 → 1.6 → 3.1. A trim-start keeps the media time under the playhead.
- **Trim past the playhead (0.3 s):** the gap caption `arrangement-video-gap` **appears during the preview**, the caption empties, and both stay after release. Undo restores them.
- **Fade-in with the playhead at 0.75 s:** `data-video-opacity` follows the preview (1.000 → 1.000 → 0.469 → 0.242), stays at 0.242 after release, and returns to 1.000 on Undo.

### 0.2 The change (B's sketch as an applicable patch, `b-round-349/sketch/dock.patch.txt`; full file `b-round-349/sketch-ArrangementVideoDock.tsx`)
The work is in one source file, `ArrangementVideoDock.tsx`:
- **The `useVideoLaneArrangement` → `useArrangementPreviewLaneClips` body subscription is removed** [K3]. It is replaced by `useVideoLanePreviewReader(arrangement, getArrangement)`, which returns a `VideoLanePreviewReader` with two members:
  - `readVideoLaneArrangement()`: the video-lane arrangement, built from `getArrangement()` and the preview store's current `preview`. It is cached on the identity of both. When the filtered clip list is element-wise equal, the previous object is reused, so an audio-only drag yields the same object.
  - `subscribeVideoLanePreview(onChange)` = `previewStore.subscribe`.

  The reader is memoised on `[arrangement, getArrangement, previewStore]`. Its identity changes on commit (including Undo and Redo, which do not notify the preview store), and never per move.
- **Caption and GapCaption** read `sourceId` with `useSyncExternalStore`. The subscribe function covers the position store and the preview store, and the snapshot is a string. They re-render only when the source under the playhead changes, for example when the gap appears.
- **FadeOverlay** writes `data-video-opacity` and `style.opacity` imperatively. It writes from the position writer, as at HEAD, and from a preview-store subscription. It has no per-move render.
- **The stopped-video seek effect** (l.716–753 at HEAD) reads `readVideoLaneArrangement()` and also subscribes to the preview store. Its deps are `[videoLane, isPlaying, positionStore, videoSources]`.
- **Unchanged:** the playing sync path (it reads `getArrangement()`), the floating box, all markup, all testids and all strings.

A applies the patch byte for byte (`git apply --check` is clean on `7f56989`). That makes K3 and the §2.3 values exact by construction, as in rounds 348 and 349. The names follow `AGENT_DISCOVERABLE_CODE.md`. If the code-reviewer asks for a change to the patched code, it is a STOP for B's ruling (§4). It is not a silent edit.

### 0.3 The release-order ruling (D-29z1114)
`tech-lead` and `performance-optimizer` reviewed B's first sketch independently. Both found the same **High** issue.
- **The first sketch:** its reader took the base from the render-time `arrangement` captured in the memo.
- **The release order today:** on pointerup, `updateHistory` does `historyRef.current = next`, then a batched `setHistory(next)`, then `previewStore.getState().clearPreview()` [K4].
- **The problem:** `clearPreview` notifies subscribers at once. The overlay and the seek listener then read "preview null + the pre-drag committed clips". As a result:
  - the overlay wrote the pre-drag opacity for a moment;
  - the stopped seek could seek to, or load, the pre-drag target.

**Ruling:** the reader's base is `getArrangement()`, which returns `historyRef.current.present` [K4] and is updated before `clearPreview`.

B's release probe (`video-release-probe.mjs`) logs every `data-video-opacity` mutation (with `oldValue`) and every `<video>` `currentTime`/`src` write from pointerup to 1.2 s later:

| Tree | Fade release (playhead 0.75 s) | Move release (playhead 7.781 s) |
|---|---|---|
| HEAD (`video-release-head.json`) | 0 writes | 0 writes |
| Fixed sketch (`video-release-sketch2.json`) | 0 writes | 0 writes |
| First sketch, kept as mutant M-B1 (`mutant-sketch1-read-render-arrangement.tsx`, `video-release-sketch1-mutant.json`) | **2 opacity mutations, one with `oldValue` 1.000** (the overlay was written back to the pre-drag value) | — |

This becomes the A unit guard DP69 and C's RELEASE row.

### 0.4 B's measurements on the fixed sketch (D-29z1115)
| Check | Result | Evidence |
|---|---|---|
| Names per move (dev) | trim 19 → **13**, fade 9 → **3**, move 17 → **11**; no `ArrangementVideo*` name and no `Maximize2` in any move commit. The 4th move sample renders the whole tree (82) on HEAD and on the sketch alike, a project-end crossing outside this task (PERF-CAND-MASTER-GROUP-FADER-PROPS) | `video-names-dev.json`, `video-names-sketch.json` |
| Behaviour (dev, 1440×900) | identical to HEAD in all 6 groups (ignoring `src`, a blob URL) | `video-behaviour-sketch.json` |
| Release order | 0 writes, as HEAD | `video-release-sketch2.json` |
| Covering vitest | the 107 test files that mount the workspace or the dock, **1768/1768 PASS** | `covering-files.txt`, `sketch-covering-vitest.log` |
| `tsc --noEmit`, Biome on the file | rc 0, 0 warnings | — |
| Interactions perf (production, alone) | rc 0; `complete`; 252 rows; **70/70** asserted pass; 0 NEW; 9 deterministic DIFF, all video component rows and all lower (§2.3); the playing per-move rows (wallclock) are lower too; the 3 video liveness rows are 1 in 3/3; `durationMs` **490450** (54.5 %, under the 540000 STOP) | `perf-sketch-results/`, `perf-rowcmp-sketch-vs-c349.txt` |

**The rows stay `record` this round.** L58 says an asserted number is C's own saved output. `performance-optimizer` advised recording first. The 22 rows are converted after C's round-350 measurement, in the next PERF-CAND task, as a budgets-only change. No interactions-spec row is added (D-29z1108 freeze). `budgets.interactions.json` is **not** touched.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| # | File | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementVideoDock.tsx` | `git apply b-round-349/sketch/dock.patch.txt`, unchanged (§0.2 and §0.3) |
| 2 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | add DP66–DP71 (§1.2); existing DP tests unchanged |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.3 |

**Untouched:**
- `ArrangementContext.tsx`, `preview-store.ts` and every other `app/` file;
- `perf/` (spec, budgets, lib);
- `e2e`, config and the protected files.

`useArrangementPreviewLaneClips` keeps its export, because `ArrangementLane.tsx` still uses it [K12]. If A finds that a change outside the 3 files is needed, that is a STOP (§4).

### 1.2 New tests in `drag-preview-render.test.tsx`
Use the file's existing `mountPreviewWorkspace`, `renderLog`/`rendersOf`, `pointerDownAt`/`pointerMoveTo`/`pointerUpAt`, `live`, `previewOf` and `clipIn` helpers, as DP58–DP60 do [K5]. Each test must fail on the mutant named next to it.

| Test | Behaviour | Red on |
|---|---|---|
| DP66 | A video trimStart move, with the playhead inside the clip after the new start, renders `ArrangementVideoDock`, `ArrangementVideoCaption`, `ArrangementVideoFadeOverlay` and `ArrangementVideoGapCaption` **0 times** over 2 pointermoves (count after `renderLog.counts.clear()`). The clip's `data-clip-start` shows the preview. Release adds one Trim entry | M-B2 |
| DP67 | A video fade-in move renders the same four components 0 times over 2 pointermoves. The overlay value follows the preview when the playhead is inside the fade | M-B2 |
| DP68 | A video trimStart that uncovers the playhead: `arrangement-video-gap` appears **during** the preview, before release. It stays after release. Undo removes it | M-B3 |
| DP69 | Release order: playhead inside the fade, fade-in drag. A `MutationObserver` (`attributeOldValue`, filter `data-video-opacity`) on the overlay runs from just before `pointerUpAt` until after it. No record's `oldValue` or new value equals the pre-drag `'1.000'`, and the final value equals the value shown before release | M-B1 |
| DP70 | No preview, commit only. After a committed video fade, Undo puts the overlay back to `'1.000'` and the gap/caption to the committed state, and Redo restores the faded value. This proves the reader is rebuilt on commit | M-B4 |
| DP71 | An audio clip move with a video clip present renders the four dock components 0 times, and causes 0 `data-video-opacity` mutations (extends DP60) | M-B2 |

**Mutants:** A and C each apply these to a scratch copy, never to `store/`. Each one is a semantic edit of the patched file. B's `mutant-sketch1-read-render-arrangement.tsx` is evidence only and is not copied over A's tree.
- **M-B1:** in `readVideoLaneArrangement`, `const base = getArrangement();` becomes `const base = arrangement;`. The release probe showed the same fault on B's first sketch (`video-release-sketch1-mutant.json`).
- **M-B2:** the dock body calls `useArrangementPreviewLaneClips(arrangement, videoTrackId)` again, with the result unused.
- **M-B3:** GapCaption's subscribe covers the position store only.
- **M-B4:** the reader memo drops `arrangement` from its deps.
- The element-wise reuse (tech-lead's Medium) saves work on audio drags, but it is not observable in the DOM, because the overlay skips equal values. It has no mutant row. It is covered by READ and A-REVIEW.

### 1.3 Doc 232 (Georgian, technical terms in English)
- **l.4 status:** `In Progress (stage conversions of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions, video-trim-fade, video-trim-fade-cost-1; C round 350 pending)`. "C round 349 pending" is removed [K11].
- **Title line:** append `, ეტაპი video-trim-fade-cost — video dock-ის per-move render-ის მოხსნა`.
- **New section** `### ეტაპი video-trim-fade-cost: video dock აღარ ხატავს ყოველ move-ზე (round 350, D-29z1113)`, placed after the video-trim-fade section. It covers:
  - the cause (§0.1);
  - the reader;
  - the release-order ruling (§0.3);
  - B's measurements table (§0.4);
  - the "record now, assert next" rule.
- **Changed files, testing, TODO:**
  - Add the dock and DP66–DP71 to the changed-files and testing lists.
  - In TODO, video-trim-fade is done (C round 349 PASS). The queue becomes: the conversion of the 22 rows → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS.
- **The `## ` count stays 7** [K11].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-349/claims-350.sh` from the loop root | equals `b-round-349/claims-350-planning-output.txt` |
| A-CLAIMS final | same | K3 equals `claims-350-sketch-output.txt` K3 (`body-preview-sub 0`, `useVideoLaneArrangement 0`, `videoLaneArrangement 0`); K4, K6, K7, K12 equal the sketch output; K2 = `7f56989 3`; K5 `DP66+` = 6; K8 = 11; K10 = `0`, `untracked 0`; K11 = `7 1 0 1` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205, the HEAD count (`a-round-349.md`) |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx app/lib/arrangement/__tests__/video-fades-ui.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx` | all pass, including DP66–DP71 |
| A-COVER | the 107 files in `b-round-349/covering-files.txt` (`npx vitest run $(cat …)`) | all pass (B's sketch: 1768/1768 plus A's 6 new tests) |
| A-MUTANT | M-B1…M-B4 on a scratch copy, each run against `drag-preview-render.test.tsx` only | each red on its §1.2 test; logs in `a-round-350/` |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-349/perf-results/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | rc 0; `complete`; `failures` []; 252 rows; **70/70** asserted pass; 0 NEW; deterministic DIFF exactly the §2.3 rows at the §2.3 values (`b-round-349/perf-rowcmp-sketch-vs-c349.txt`); the 3 video liveness rows 1 in 3/3; `durationMs` ≤ 540000 and recorded |
| A-REVIEW | `code-reviewer` (3 files) | 0 Medium+ open, or each one ruled by id; Architecture note passed to B |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-349/claims-350.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check b-round-349/sketch/dock.patch.txt` | exactly the 3 files modified, 0 untracked; the dock patch reverse-applies |
| READ | read the diff | the dock no longer calls `useArrangementPreviewLaneClips`; the reader's base is `getArrangement()`; markup, testids, strings and the playing sync effect unchanged; the 6 DP tests present and asserting as §1.2 |
| UNIT | A-UNIT's command | all pass |
| MUTANT (B's, predicted) | M-B1 and M-B2 on a scratch copy (L59/L60) against `drag-preview-render.test.tsx`; M-B1 also against the browser RELEASE probe on a scratch dev server | M-B1: DP69 red, and the release probe logs an opacity mutation with `oldValue` `'1.000'` (as `video-release-sketch1-mutant.json`). M-B2: DP66, DP67 and DP71 red, and the names probe (on a scratch dev server) shows `ArrangementVideoDock` per move. Scratch deleted; `store/` unchanged |
| PERF (browser, production, alone) | A-PERF's command | as A-PERF; the deterministic rows in §2.3 equal A's run, or each difference listed with its `details` |
| NAMES (browser, dev) | `node b-round-349/video-names-probe.mjs http://127.0.0.1:5173 <c-round-350/names.json>` | per move: video-trim 13, video-fade 3, video-move 11 on its first 3 moves; no `ArrangementVideo*` or `Maximize2` name in any trim, fade or move commit (the release commits may contain them) |
| BEHAVIOUR (browser, dev, 1440×900 and 1280×720) | `video-behaviour-probe.mjs` at both viewports (C adds a viewport argument in its own copy under `c-round-350/`) | at 1440×900, every group equals `b-round-349/video-behaviour-dev.json` except `src`; at 1280×720, the same qualitative results: trim-inside `currentTime` unchanged, trim-early gap appears during the preview, fade opacity strictly falls during the drag and is 1.000 after Undo |
| RELEASE (browser, dev, both viewports) | `video-release-probe.mjs` (C's copy with a viewport argument) | fade release and move release: 0 `data-video-opacity` mutations and 0 `<video>` `currentTime`/`src` writes after pointerup; the final values equal the pre-release values; Undo restores |
| PLAY-SYNC (browser, dev, both viewports) | C's copy of `b-round-349/video-playsync-probe.mjs`: import the video, then two windows of Home, Space, 3 s and Space. Between the two windows, C inserts a stopped trim-start drag, a fade-in drag and a move drag, each followed by Undo | in both windows, at 1 s, 2 s and 3 s, the `<video>` `currentTime` minus the transport position (drift) is within ±0.3 s. **HEAD baseline** (B, no drags; `video-playsync-head-1440x900.json` and `-1280x720.json`): \|drift\| ≤ 0.014 s at both viewports. L24: a drift or stall that also appears in a HEAD control run on the same machine is listed with that HEAD result and does not fail the round. No console error other than the cloud-expected ones |
| G350-AUTH (browser, both viewports) | fresh anonymous context | `/studio-lab` opens with the workspace and demo badge, `auth_user` null; `/studio/<id>` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` refuses (401/400/405; 500 only when the mock on :5199 is down, then listed under `blocked`) |
| DOCS | doc 232 | l.4 as in §1.3; one `### ეტაპი video-trim-fade-cost`; 7 `## `; 0 "C round 349 pending"; every number the doc states matches A's run and B's §0.4 (L34) |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** PERF, NAMES, BEHAVIOUR, RELEASE, PLAY-SYNC, MUTANT (M-B1 browser half) and G350-AUTH all run here, and none needs the backend.
**Ableton conformance:** not applicable. This is a perf round, and the behaviour is unchanged by construction and by the rows above.
**L57 fields** in `c-round-350.json`:
- `mutantRedOnSketch` = true: M-B1 was red on the release probe on B's first sketch at planning.
- `affectedChecksNamed` = `drag-preview-render.test.tsx`, the interactions perf spec, and the three probes.
- `affectedChecksRunOnSketch` = `b-round-349/sketch-covering-vitest.log`, `b-round-349/perf-sketch-results/latest-interactions.json`, `video-names-sketch.json`, `video-behaviour-sketch.json` and `video-release-sketch2.json`.

### 2.3 Perf rows expected to change
The rows in the table below differ from C349 on B's sketch (`b-round-349/perf-rowcmp-sketch-vs-c349.txt`). Every other row is EQUAL (172 EQUAL; the remainder are wallclock rows inside their usual noise). A's and C's run must show the deterministic values exactly, or list each difference with its `details`:

| Row | C349 | B sketch | Mode |
|---|---|---|---|
| `interact.drag.video-trim.stopped.move-components-per-move` | 18.683 | **12.817** | record |
| `interact.drag.video-trim.stopped.move-components-max` | 19 | **15** | record |
| `interact.drag.video-trim.playing.move-components-max` | 19 | **15** | record |
| `interact.drag.video-trim.playing.move-components-per-move` (wallclock) | 18.683 | 12.817 (12.817–12.883) | record |
| `interact.drag.video-fade.stopped.move-components-per-move` | 8.85 | **2.95** | record |
| `interact.drag.video-fade.stopped.move-components-max` | 9 | **3** | record |
| `interact.drag.video-fade.playing.move-components-max` | 9 | **3** | record |
| `interact.drag.video-fade.playing.move-components-per-move` (wallclock) | 8.85 | 2.95 | record |
| `interact.drag.video.stopped.move-components-per-move` | 15.75 | **9.883** | **assert ≤ 24 (passes)** |
| `interact.drag.video.stopped.move-components-max` | 17 | **13** | record |
| `interact.drag.video.playing.move-components-max` | 17 | **12** | record |
| `interact.drag.video.playing.move-components-per-move` (wallclock) | 15.75 | 9.883 (9.883–9.95) | record |

Unchanged on the sketch:
- every `release-commits`: video 1, trim 1, fade 2;
- every `move-restarts` (0) and `release-restarts` (31);
- every non-video row.

A rise in any row is a STOP for A and a finding for C.

## 3. Neighbouring behaviour that could break
- **The stopped video frame:**
  - after a seek, a click on the ruler, or an Undo/Redo of a video edit (BEHAVIOUR, DP70);
  - when a video clip is added or removed (the reader is rebuilt on commit).
- **The gap caption and the source caption** at clip edges and in gaps (DP58, DP68).
- **The fade overlay** at rest, during playback, and in the floating box (`video-fades-ui`, `floating-video`).
- **Playback sync** (PLAY-SYNC). The playing path is unchanged.
- **Audio drags with a video present:** no new work per move (DP71).
- **SSR:** `getServerSnapshot` reads the same function, and the preview is null on the server.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- A needed change outside the 3 files, or the dock patch does not apply, or a review finding needs a change to the patched code.
- An existing test fails.
- A mutant cannot be made red on its test.
- A-PERF: any asserted row fails, any NEW row, a DIFF outside §2.3, a liveness row below 1, an aborted step, or `durationMs` > 540000.

## 5. Routed from round 349 (D-29z1112), not in scope
- **GATE349-S1** (Low): interactions spec run time (`durationMs` 490693, 91 % of the STOP). This is evidence on ROOT-REQ-PERF-TIMEOUT (overdue, L46; deadline RETRO 351) → closed_info.
- **GATE349-S2** (Low): the video trim/fade grabs depend on the timeline at x≈0. It was ruled in D-29z1108 M1. If it ever flakes, add Home before the first playing video drag → `deferred_low_polish`.
- **GATE349-S3/S4** (info): `setLive` is honest, and the record rows are as intended → closed_info.
- **C-R349-INFO-LIVE** (info): the trim liveness row is also fed by the stopped drag, and an abort stays loud through `failures` → closed_info.
- **C-R349-COLD-VITE** (info): a cold Vite dep-optimize reload once. Environment noise → closed_info.
- **Architecture signals** (not scheduled): A-R349-ARCH-VIDEO-SPEC-SPLIT and GATE349-ARCH-SPEC-SPLIT. Both say: move the video block into its own spec with its own timeout, and share `measureDrag`/`dragTarget` from `perf/lib`. Both join ARCH-R339-DRAG-MEASURE-EXTRACT, which is question 3 of ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (still unanswered).
- **New candidate, recorded:** the video move's 4th probe sample renders the whole tree (82) on HEAD. This is the project-end crossing, and it joins PERF-CAND-MASTER-GROUP-FADER-PROPS / the crossing.

## 6. Deliverables
- **A:** the 3 files; `a-round-350.md` with the A rows; logs and mutant outputs in `a-round-350/`.
- **C:** `c-round-350.md`, `c-round-350.json` and `c-round-350/`.

## 7. Claims
Run `bash b-round-349/claims-350.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:**
  - `b-round-349/claims-350-planning-output.txt` (HEAD);
  - `b-round-349/claims-350-sketch-output.txt` (B's sketch `/home/runner/b349-scratch/sk`, where K2 reads `no-git` and the tests and doc are unchanged).
- **K1:** gate 349 `published` `7f56989`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** the dock's counts of `useArrangementPreviewLaneClips`, `useVideoLaneArrangement`, `videoLaneArrangement`, `useArrangementPreviewStore` and `getArrangement`.
- **K4:** `ArrangementContext.tsx`: the `getArrangement` line reads `historyRef.current.present`; the count of `clearPreview()` calls; the `useArrangementPreviewLaneClips` export.
- **K5:** DP58, DP59, DP60 and DP65 exist; the count of DP66+.
- **K6:** budgets: 252 rows, 70 assert, the 22 owned rows all `record`.
- **K7:** the `playwright.perf.config.ts` timeout is `15 * 60 * 1000`.
- **K8:** protected files OK.
- **K9:** the `regression-last` date.
- **K10:** diff lines in `app`, `perf`, `e2e` and `docs` outside the 3 files; untracked files.
- **K11:** doc 232: the `## ` count, the cost section, "C round 349 pending" and "C round 350 pending".
- **K12:** the non-test files that call `useArrangementPreviewLaneClips(`.
- **K13:** the kept B artifacts exist (15 files, including `sketch/dock.patch.txt` and `video-playsync-probe.mjs`).
