# CURRENT TASK — Round 351: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1, fix-up. B rules on C-R350-01 (the DP71 mutant pair) and closes A-R350-REVIEW-SEEK-TEST with one jsdom test, DP72

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 350 → 351 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v312 → v313, D-29z1118…D-29z1122):
- **D-29z1118: round 350 is closed as C FAIL, with origin B spec.**
  - `c-round-350.json`: FAIL, `browserVerified`/`realVerified` true, one Low finding (C-R350-01).
  - Every product, perf and browser row passed: PERF 70/70 with exactly the 9 sketch DIFFs; NAMES; BEHAVIOUR, RELEASE and PLAY-SYNC at both viewports; G350-AUTH.
  - Gate 350 was `skipped` ("C taskStatus FAIL") [K1]. **Baseline stays `7f56989`**, and A's three round-350 files remain in the working tree [K2].
  - This is not a fault in A's work. B's §1.2 table named a mutant (M-B2) that cannot turn DP71 red, and B never ran that pair on a sketch.
- **D-29z1119: the ruling on C-R350-01 (L10)** is in §0.1.
- **D-29z1120: A-R350-REVIEW-SEEK-TEST** (reviewer Medium, a test gap) is closed in this round by DP72 (§0.2).
- **D-29z1121:** the other round-350 notes are routed (§5).
- **D-29z1122:** this task. RETRO moves from 351 to 352.

**Read first:**
- `lessons.md` items 10, 11, 22, 26, 28, 52, 56, 57 and 58. C also reads 38, 59 and 60.
- Primitives:
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (DP72);
  - `GEORGIAN_DOCS.md` (doc 232);
  - `AUDIO_ARCHITECTURE.md` (the dock's stopped-video seek path, read only).

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a test-and-docs fix-up of a pure performance round. Nothing the user sees or hears changes. `ArrangementVideoDock.tsx` must stay byte-identical to the file C verified in round 350 [K3].

## Baseline
- HEAD `7f56989` (gate 349, published). Gate 350 was skipped [K1].
- `git status` shows exactly A's 3 round-350 files [K2]:
  - `ArrangementVideoDock.tsx`, whose sha256 equals `b-round-349/sketch-ArrangementVideoDock.tsx` (`037f62faf9e69844…`) [K3];
  - `drag-preview-render.test.tsx`, byte-identical to the copy B saved as `b-round-350/drag-preview-render.test.r350.tsx` [K5];
  - doc 232.
- Protected files: 11/11 OK [K7]. No dependency change.

## 0. Rulings and B's evidence

### 0.1 C-R350-01: which mutant guards DP71 (D-29z1119)
**Cause (independently reproduced by A, C and B):**
- `useArrangementPreviewLaneClips` is shallow-deduped [K11].
- On an audio-only drag, the video lane's clip list stays element-wise equal. M-B2 (the old body hook called again, result unused) therefore never re-renders the dock.
- So DP71 stays green under M-B2.
- This is not a gap in the product or in DP71. M-B2 was the wrong mutant for that row.

**Ruling: option (a).** The mutant map for DP66–DP71 becomes:

| Mutant (B's definition = the diff file) | Red tests | Proves |
|---|---|---|
| M-B1, unchanged (`a-round-350/mutant-M-B1.diff.txt`) | DP69 | the reader's base is `getArrangement()` (release order) |
| M-B2, kept, with an honest scope (`b-round-350/mutant-M-B2.diff.txt`) | **DP66, DP67 only**; DP71 green, by design | a body re-subscription through the lane hook re-renders the dock on video drags |
| **M-B2′** (`b-round-350/mutant-M-B2prime.diff.txt`): the dock body calls `useArrangementPreview((state) => state.preview)` | **DP66, DP67, DP71** | DP71's render half: no dock component renders on an audio drag |
| **A-M5** (`b-round-350/mutant-A-M5.diff.txt`): the overlay's equal-value skip (`if (pictureOpacity === writtenOpacityRef.current)`) is deleted [K3] | **DP71** (`takeRecords()` has length 2, not 0) | DP71's mutation half: an audio drag writes no `data-video-opacity` |
| M-B3, unchanged | DP68 | |
| M-B4, unchanged | DP70 | |
| **M-B5** (new, §0.2; `b-round-350/mutant-M-B5.diff.txt`): the stopped-seek effect drops its `subscribeVideoLanePreview` subscription [K3] | **DP72** | DP72 |

**B's runs on a scratch copy of A's round-350 tree** (`/home/runner/b350-scratch/sk` with DP72 applied, `-t 'DP6[6-9]|DP7[0-2]'`; re-run after DP72 was written, so these are saved outputs for the 7-test shape):

| Run | Result | Log |
|---|---|---|
| control | 7/7 pass | `b-round-350/mutant-control.log` |
| M-B2 | DP66 and DP67 red | `b-round-350/mutant-M-B2.log` |
| M-B2′ | DP66, DP67 and DP71 red | `b-round-350/mutant-M-B2prime.log` |
| A-M5 | DP71 red, at `expect(observer.takeRecords()).toHaveLength(0)` | `b-round-350/mutant-A-M5.log` |
| M-B5 | DP72 red, 6 others pass | `b-round-350/mutant-M-B5.log` |

These logs match A's `a-round-350/` logs and C's `c-round-350/` logs. **Neither the product file nor DP66–DP71 changes.**

### 0.2 A-R350-REVIEW-SEEK-TEST → DP72 (D-29z1120)
The reviewer's Medium finding is a test gap: no jsdom test drives the stopped-video seek path. That path now runs through the reader and the preview subscription [K3].
- A said the jsdom fixture has no video URL. That is true for `VIDEO_CLIP`.
- DP64's import pattern (`probeVideoMock` → `blob:film`, then `importVideoFiles`) gives a real seek key [K11].
- B wrote DP72 on the scratch copy using that pattern. It is an applicable patch: `b-round-350/sketch-dp72.patch.txt` (54 added lines, 0 removed, Biome-clean; `git apply --check` is clean on the current tree).

**What DP72 does:**
1. Spy on the `HTMLMediaElement.prototype` `currentTime` setter (`vi.spyOn(…, 'currentTime', 'set')`, restored by the file's `afterEach` `vi.restoreAllMocks()` [K4]).
2. Import the film. Seek to 2 s into the clip and wait until the last write equals `playhead − start + sourceOffset`.
3. Run a stopped name-bar move drag of +20 px, then +40 px (`PX_PER_SECOND` 40 [K11]).
4. During the preview, before release, the committed start is unchanged. The previewed start lies between the old start and the playhead. The last `currentTime` write equals `playhead − previewStart + sourceOffset` (3 decimals).
5. Release, then Undo. The last write returns to the pre-drag media time.

**B's measurements** (logs under `b-round-350/`):

| Run | Result | Log |
|---|---|---|
| Scratch with DP72 | 3/3 green runs | |
| Whole test file | 74/74, 9.97 s | `sketch-dp72-file.log` |
| HEAD `7f56989` dock + DP72 | green; the behaviour existed before round 350 | `dp72-on-head-dock.log` |
| M-B5 | red | `mutant-M-B5.log` |

`tsc` shows no error in the file. DP72's time is about 0.5 s against the 5 s default (L31).

## 1. Scope (A)

### 1.1 Files (exactly 2 edited; the dock stays as it is)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply ../tmp/studio-real-loop/b-round-350/sketch-dp72.patch.txt`, unchanged. DP66–DP71 and every other test stay byte-identical |
| 2 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.2 |

**Untouched:**
- `ArrangementVideoDock.tsx`: its sha256 must stay `037f62faf9e69844…` [K3];
- every other `app/` file, `perf/`, `e2e`, config and the protected files.

The code-reviewer's A-R350-REVIEW-CACHED-TRACKS (Low, patched code) is **not** in scope. It is routed to `deferred_low_polish` (§5), because any edit to the dock would void C's round-350 browser evidence.

### 1.2 Doc 232 (Georgian, technical terms in English)
- **l.4:** replace `C round 350 pending` with `C round 351 pending`. Nothing else on the line changes.
- **Testing list (the round-350 bullet):** replace the clause

  `M-B2 (body-ში ისევ `useArrangementPreviewLaneClips`) → DP66 და DP67 წითელი, DP71 მწვანე რჩება, რადგან hook `useShallow`-ით audio drag-ზე video lane-ის სიას არ ცვლის (B-ის ruling-ს ელოდება)`

  with

  `M-B2 (body-ში ისევ `useArrangementPreviewLaneClips`) → DP66 და DP67 წითელი; DP71 მწვანე რჩება, რადგან hook `useShallow`-ით audio drag-ზე video lane-ის სიას არ ცვლის, ამიტომ B-ის ruling-ით (round 351, D-29z1119) DP71-ს იცავს M-B2′ (render-ის ნახევარი) და A-M5 (`data-video-opacity`-ის mutation-ის ნახევარი)`.
- **Append one new bullet** after that bullet:

  `- `drag-preview-render.test.tsx`, round 351 (A-R350-REVIEW-SEEK-TEST, D-29z1120): DP72 (import-ილი video, playhead clip-ში 2 s-ზე, stopped move drag: preview-ის დროს, release-მდე, `<video>`-ის ბოლო `currentTime` ჩანაწერი = `playhead − preview start + sourceOffset`; Undo წინა მნიშვნელობას აბრუნებს). mutant M-B5 (stopped seek effect-ს `subscribeVideoLanePreview` წაშლილი) → DP72 წითელი.`
- **Changed files:** in the round-350 line, `(DP66–DP71)` becomes `(DP66–DP71; DP72 — round 351)`.
- **The `## ` count stays 7** [K6]. No other section changes.

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-350/claims-351.sh` from the loop root | equals `b-round-350/claims-351-planning-output.txt` |
| A-CLAIMS final | same | K1, K3, K7 and K9 equal the planning output. K2 = `7f56989 3`. K4 and K5 equal `b-round-350/claims-351-sketch-output.txt` (`DP72 1 dp72-title 1 currentTime-setter-spy 1`, `54+0-`). K6 = `h2 7 pending-350 0 pending-351 1 awaiting-ruling 0`, with `ruling-d1119`, `dp72` and `m-b5` each ≥ 1. K8 = `0 untracked 0`. K10 all 1. K11 equals the planning output |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205, the round-350 count |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | 74/74 pass |
| A-MUTANT | on a scratch copy, never in `store/`: M-B2, M-B2′, A-M5 and M-B5 (the diff files in §0.1), each with `-t 'DP6[6-9]\|DP7[0-2]'` | the red sets exactly as in §0.1's table; the control is 7/7 green; logs in `a-round-351/` |
| A-REVIEW | `code-reviewer` on the test diff (1 code file; optional per the 3+ file rule, but run it) | 0 Medium+ open, or each one ruled by id. A finding that asks to change DP72 is a STOP (§4) |

### 2.2 C rows
The dock is byte-identical to the file C verified in round 350 [K3]. The policy says unchanged code is not measured again in a loop. C's round-350 PERF, NAMES (1440 and 1280), BEHAVIOUR, RELEASE and PLAY-SYNC evidence (`c-round-350/`) therefore stands for this tree, and C proves that it applies with the hash row. The rows below are run this round:

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-350/claims-351.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `sha256sum` of the dock; `git diff --no-index b-round-350/drag-preview-render.test.r350.tsx <store test>` | exactly the 3 files modified, 0 untracked; the dock sha256 is `037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96`; the test diff equals `b-round-350/sketch-dp72.patch.txt`'s hunks (54 added lines, 0 removed) |
| READ | read the test diff and the doc diff | DP72 asserts as §0.2 (a preview-time write before `pointerUpAt`, then Undo); DP66–DP71 unchanged; doc text as §1.2 |
| UNIT | A-UNIT's command | 74/74 |
| MUTANT (jsdom) | the 4 mutants of A-MUTANT on C's own scratch (L60) | red sets exactly as §0.1, including **DP71 red on both M-B2′ and A-M5**, and DP72 red on M-B5 |
| MUTANT (browser, M-B2′) | a scratch dev server with M-B2′ applied and its own Vite `cacheDir` (L38), then `node b-round-349/video-names-probe.mjs http://127.0.0.1:<port> c-round-351/names-M-B2prime.json` | `ArrangementVideoDock` appears in the trim, fade and move commits per move (the browser half of round 350's §2.2 MUTANT row, never run in round 350). Scratch server stopped and deleted |
| NAMES smoke (browser, dev, 1440×900, this tree) | `node b-round-349/video-names-probe.mjs http://127.0.0.1:5173 c-round-351/names.json` | video-trim 13, video-fade 3, video-move 11 on its first 3 moves; no `ArrangementVideo*` or `Maximize2` in any move commit (equal to `c-round-350/names.json`) |
| G351-AUTH (browser, both viewports) | a fresh anonymous context (C's `c-round-350/auth.mjs` copied to `c-round-351/`) | `/studio-lab` opens with the workspace and the demo badge, and `auth_user` is null. `/studio/<id>` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` refuses (401, 400 or 405; a 500 only when the mock on :5199 is down, and then the row is listed under `blocked`) |
| DOCS | doc 232 | l.4 reads `… video-trim-fade-cost-1; C round 351 pending)`; the §1.2 clause and the new bullet are present; 7 `## `; 0 `B-ის ruling-ს ელოდება` |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** MUTANT (browser), NAMES smoke and G351-AUTH run here, and none needs the backend. The round-350 browser rows are cited by hash, not re-run.

**Ableton conformance:** not applicable (test and docs only).

**L57: write all L57 fields** in `c-round-351.json`:
- the manifest fields;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch` = `b-round-350/mutant-M-B2prime.log`, `mutant-A-M5.log`, `mutant-M-B5.log`;
- `mutantRedOnTree` = C's own runs;
- `gateChecksNamed`, `gateChecksRunOnSketch` (= `b-round-350/sketch-dp72-file.log` for the one affected file), `chainHeadGateRunGreen`;
- `affectedChecksNamed` = `drag-preview-render.test.tsx` and the names probe;
- `affectedChecksRunOnSketch` = `b-round-350/sketch-dp72-file.log` and `c-round-350/names.json`.

## 3. Neighbouring behaviour that could break
- **Other tests in `drag-preview-render.test.tsx`:** DP72 installs a `currentTime` setter spy. `afterEach` restores it [K4], and the whole file passed 74/74 on B's scratch.
- **Doc 232's other stage sections:** only the lines named in §1.2 change.
- **The dock:** nothing changes. Any change is a STOP, and C's SOURCE-SCOPE row checks the hash.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- `sketch-dp72.patch.txt` does not apply, or DP72 fails on the tree.
- An existing test fails.
- A change outside the 2 edited files is needed.
- A mutant's red set differs from §0.1.
- A review finding asks to change DP72 or the dock.

## 5. Routed from round 350 (D-29z1121), not in scope
- **C-R350-01** (Low, origin B spec): ruled in §0.1, and closed when C round 351 passes.
- **A-R350-REVIEW-SEEK-TEST** (Medium, test gap): closed by DP72 when C round 351 passes.
- **A-R350-REVIEW-CACHED-TRACKS** (Low, patched code): the cached lane keeps the old base's `tracks` when the clips are element-wise equal. It is safe today, because previews never change `tracks` and the reader is rebuilt on every commit. → `deferred_low_polish`. Fix with `cachedLane.tracks === base.tracks` when the dock is next touched.
- **A-R350 DP70 / DP69 / `'Video Fade In'` literal notes** (Low, test redundancy): → `deferred_low_polish` as one entry, A-R350-REVIEW-TEST-NITS.
- **C-R350-OBS-FADE-COVERS-TRIM** (Low, pre-existing on HEAD): at 1280×720, with the clip zoomed to 480 px or more, the 10 px fade-in handle covers the centre of the trim-left-edge handle. A press at the edge's vertical centre grabs the fade, and the trim works only near the top of the edge. → `deferred_low_polish` (the 2026-10-23 rule for new Lows), with C's repro. The hit-area order is a product question to check against Live's clip-corner fade handles when the polish pass runs.
- **Architecture signal A-R350-ARCH-PREVIEW-READER** (not scheduled): **keep** `useVideoLanePreviewReader` in the dock while it has one consumer. If a second lane consumer needs the "read the preview without rendering" pattern, open one bounded task: move it to `useArrangementPreviewLaneReader(trackId)` in `ArrangementContext.tsx`, keeping DP66–DP72 and the M-B1 release-order mutant red. It joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.
- **RETRO moves to round 352** (window 336–351). The ROOT-REQ-PERF-TIMEOUT question to Saba moves with it (L46). New retro candidate RC-R350-MUTANT-PAIR-UNRUN: B named a mutant → test pair for tests that did not yet exist on its sketch, so the pair was never run. L58 covers asserted numbers but not every named mutant pair.

## 6. Deliverables
- **A:** the 2 edited files; `a-round-351.md` with the A rows; logs and mutant outputs in `a-round-351/`.
- **C:** `c-round-351.md`, `c-round-351.json` and `c-round-351/`.

## 7. Claims
Run `bash b-round-350/claims-351.sh` from the loop root. Set `CLAIMS_STORE=<dir>` to point it at another tree.

**Expected outputs:**
- `b-round-350/claims-351-planning-output.txt`: the current tree;
- `b-round-350/claims-351-sketch-output.txt`: B's scratch with DP72 applied and the doc unchanged. K2 reads `no-git 0` there.

| Claim | What it checks |
|---|---|
| K1 | gate 349 `published` `7f56989`; gate 350 `skipped` |
| K2 | HEAD and the `git status` entry count |
| K3 | the dock's sha256 (first 16 hex digits) equals the round-349 sketch file; the stopped-seek preview subscription line (count 1); the overlay's equal-value skip line (count 1) |
| K4 | the DP66–DP71 count; DP72, its exact title and the `currentTime` setter spy; `vi.restoreAllMocks();` |
| K5 | the test file's numstat against `b-round-350/drag-preview-render.test.r350.tsx` |
| K6 | doc 232: the `## ` count; `C round 350 pending`; `C round 351 pending`; `B-ის ruling-ს ელოდება`; `D-29z1119`; `DP72`; `M-B5` |
| K7 | protected files OK |
| K8 | diff lines in `app`, `perf`, `e2e` and `docs` outside the 3 files; untracked files |
| K9 | the `regression-last` date |
| K10 | the kept B artifacts exist (14 files) |
| K11 | the lane hook's `useShallow` line in `ArrangementContext.tsx`; `PX_PER_SECOND = 40` and DP64 in the test file |
