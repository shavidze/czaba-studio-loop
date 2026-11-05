# CURRENT TASK — Round 346: PERF-DRAG-PREVIEW stage c6-i. Lane and clip header icons stop re-rendering on every drag move; three round-345 Lows are closed

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 345 → 346 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v306 → v307, D-29z1090…D-29z1094):
- **D-29z1090:** round 345 closed as PASS from C's evidence (`c-round-345.json`: PASS, `browserVerified`/`realVerified` true, 12 rows). Gate 345 `published` **`645b2e6`** on both remotes [K1]. **Baseline = `645b2e6`**, clean tree [K2]. Stage c5-ii → done. New perf oracle: `c-round-345/perf-results/latest-interactions.json`.
- **D-29z1091:** round-345 notes routed. C-R345-CAPTION-MUTANT-GAP, A-R345-REVIEW-DP62-FINALLY and A-R345-REVIEW-BUDGET-NOTES are fixed **in this round**, because the round owns those files and the fixes are small. A-R345-REVIEW-VIDEO-TRACK-ID → `deferred_low_polish`. Both PERF-DURATION Lows → ROOT-REQ-PERF-TIMEOUT. ARCH-R345-VIDEO-LANE-TYPE → signal.
- **D-29z1092:** the item target **≤ 15 components per move for fade/trim/move is kept**. B's names probe found seven renders per trim commit that draw nothing the gesture changes (§0.1). Stage c6 removes them: **c6-i (this round)** = the lucide icons; **c6-ii** = `ArrangementMixFader` and `ArrangementDetailClipGain` with stable props. After that come the conversions (rows → `assert`), then the video trim/fade harness rows.
- **D-29z1093:** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is now due with root. It is non-blocking for this round.
- **D-29z1094:** this task.

**Read first:**
- `lessons.md`: L10, L11, L12, L22, L23, L29, L37, L38, L56, L57, L58. For C also L59 and L60 (destructive commands only inside `c-round-346/`, with absolute paths).
- Primitives: `AUDIO_ARCHITECTURE.md` (Studio), `FORWARDREF_COMPONENT.md` (components touched), `AGENT_DISCOVERABLE_CODE.md` (new constant names), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests), `GEORGIAN_DOCS.md` (doc 232).
- `.claude/prompts/studio-feature.md`.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a performance round. The DOM output is byte-identical: the same SVG icons, with the same classes and attributes, built once at module level instead of on every render. No text, layout, colour, behaviour or audio change.

## Baseline
- HEAD `645b2e6` (gate 345, published), clean tree [K2]. Protected files 11/11 OK [K8]. No dependency change.
- Perf oracle: `c-round-345/perf-results/latest-interactions.json`. It has 230 rows, `complete`, 0 failures, and 60/60 asserted rows pass [K7]. Per move: trim 21.633 (max 22), move 22.8 (max 101), fade 9.833 (max 10).

## 0. Why, and B's evidence

### 0.1 Premise at HEAD (L37)
B ran `b-round-345/names-probe-v2.mjs` on dev :5173 at `645b2e6`, 1440×900. It is the round-328 probe; v2 also reads forwardRef `displayName`. Output: `b-round-345/names-head-645b2e6-v2.json`. Components per pointermove commit:
- **fade** 10: `ArrangementLane`, `ChevronDown` + its inner lucide `Icon`, 2× `ArrangementMixFader`, `ArrangementClipViewInner`, `GripVertical` + inner `Icon`, `ArrangementClipEnvelope`, `ArrangementStatusTextInner`.
- **trim** 22: the fade list without the status text, plus overview ×2, `ArrangementPeakPathInner` ×2, `ArrangementClipRangeOverlayInner`, the detail chain (×5), `ArrangementDetailClipGain`, `ArrangementSelectedClipReadoutInner` and `ArrangementTimeText`.
- **move** 19 per commit; the one project-end crossing commit is 101.

Seven of the 22 trim renders draw nothing the drag changes. This was found by the `performance-optimizer` consult and confirmed by the v2 probe:
- the lane fold chevron (2: lucide wrapper + inner `Icon`), created inline in `ArrangementLane.tsx` [K3];
- the clip header grip icon (2), created inline in `ArrangementClip.tsx` [K4];
- two `ArrangementMixFader` and `ArrangementDetailClipGain` (3), forwardRef components with inline props. **c6-ii**, not this round.

The detail panel already hoists its chevrons as module constants (`DETAIL_TOGGLE_CHEVRON_RIGHT/DOWN`), and those skip rendering.

### 0.2 B's sketch (`b-round-345/sketch/`, scratch `git archive 645b2e6` at `/home/runner/b345-scratch/sc2`)
- `source.patch.txt` (written by `apply-source.py`, then `biome check --write`):
  - **`ArrangementLane.tsx`:** three new module constants above `export function ArrangementLane`: `LANE_FOLD_CHEVRON_RIGHT`, `LANE_FOLD_CHEVRON_DOWN` and `LANE_ADD_PLUS_ICON`. Their JSX is exactly the old inline elements. The fold button renders `{folded ? LANE_FOLD_CHEVRON_RIGHT : LANE_FOLD_CHEVRON_DOWN}`, and both video-import buttons render `{LANE_ADD_PLUS_ICON}`.
  - **`ArrangementClip.tsx`:** `CLIP_HEADER_VIDEO_ICON` and `CLIP_HEADER_GRIP_ICON` after `FADE_HANDLE_PX`. The header renders `{isVideo ? CLIP_HEADER_VIDEO_ICON : CLIP_HEADER_GRIP_ICON}`.
  - `git apply --check` is clean on `store/`. Typecheck rc 0. Biome on both files is clean.
- **Names on the sketch** (dev :5197 with a private Vite `cacheDir`, stopped afterwards; `names-sketch-v2.json`, `names-compare.txt`). Components are only removed, never added:
  - fade [10×4] → **[6×4]**;
  - trim [22×4] → **[18×4]**;
  - move [19, 19, 101, 19] → **[15, 15, 89, 15]**;
  - clip click [100, 0] → **[88, 0]**.
- **Covering unit tests on the sketch** (108 files that import `ArrangementLane`, `StudioWorkspace` or `ArrangementClip`): see `b-round-345/sketch-covering-vitest.log` and `b-round-345.md` §4.
- **No production perf run by B.** So every perf row stays `record` this round (L58). The conversions round runs B's sketch perf and mutants.

## 1. Scope (A)

### 1.1 Files (exactly 5)
| # | File | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementLane.tsx` | Apply `source.patch.txt` (icon constants only). |
| 2 | `app/components/arrangement/ArrangementClip.tsx` | Apply `source.patch.txt` (icon constants only). |
| 3 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | §1.2. |
| 4 | `perf/budgets.interactions.json` | §1.3: **notes only** on three rows. No `mode`, `budget`, `kind` or `owner` change; still 230 rows and 60 asserted. |
| 5 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.4. |

Untouched: `ArrangementContext.tsx`, `ArrangementVideoDock.tsx`, `ArrangementMixFader.tsx`, `ArrangementDetailPanel.tsx`, the perf spec, `perf/lib`, `e2e`, config, doc 168, and the protected files.

### 1.2 Tests in `drag-preview-render.test.tsx`
1. **The render counter sees forwardRef components.** Extend `componentName` in `renderLog`, now function-only [K6]. It also returns `type.displayName` when `type` is a non-null object with a string `displayName`.
   - Write it with narrowing (`typeof`, `in`); no `as`, `any` or `@ts-ignore`.
   - Existing assertions name only function components (B grep: no `rendersOf` on a forwardRef name). Every existing DP stays green unchanged.
2. **DP63** "a stopped trim, move and fade re-render no lane fold or clip header icon":
   - Mount `AUDIO_CLIPS`.
   - **Positive control:** after mount, `rendersOf('GripVertical') > 0` and `rendersOf('ChevronDown') > 0`, so the counter really sees lucide icons.
   - For each gesture on `c1` (trimStart, header move, fade-in handle): press, make one move, `renderLog.counts.clear()`, make two more moves. Then:
     - `rendersOf('ArrangementClipViewInner') > 0`, so the gesture is live;
     - `rendersOf('GripVertical') === 0`, `rendersOf('ChevronDown') === 0` and `rendersOf('ChevronRight') === 0`.
   - Release after each gesture.
3. **DP64** "the dock caption follows a stopped video move from the store" (closes **C-R345-CAPTION-MUTANT-GAP**). The caption only shows a name for a real imported source, so DP64 imports one:
   - **Mocking:** add the same module mock as `lane-strings-ui.test.tsx`: `vi.mock('~/lib/arrangement/video.client', async (importOriginal) => ...)` with `probeVideoFile` and `decodeVideoAudio` as `vi.fn`. Inside DP64 only, `probeVideoFile` resolves `{ url: 'blob:film', duration: 4, width: 640, height: 360 }` and `decodeVideoAudio` never resolves. No other DP calls these functions.
   - **Steps:**
     - Mount with `[...AUDIO_CLIPS]` (no fixture video clip).
     - `act(async () => live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]))`, then flush.
     - Seek the playhead inside the imported clip: `act(() => live(api).seekTo(1))`.
     - `arrangement-video-caption` `textContent` is `'film.mp4'`.
     - Press the imported clip's header and move it right until its preview start is past the playhead. While it is still held:
       - the committed clip start in `live(api).arrangement` is unchanged;
       - the store preview start is greater than 1;
       - the caption `textContent` is `''`.
     - Release: the caption is `''`. Undo: the caption is `'film.mp4'`.
   - **Red proof (A runs it on a scratch copy):** `ArrangementVideoCaption arrangement={arrangement}` [K5] makes DP64 fail on the mid-drag caption.
4. **DP62** (closes **A-R345-REVIEW-DP62-FINALLY**): everything after the Space keydown sits in `try { … } finally { if (live(api).isPlaying) { act(() => live(api).togglePlayback()); } }`. The assertions stay as they are.

### 1.3 Budget notes (closes **A-R345-REVIEW-BUDGET-NOTES**)
Three rows still say "Record until c5-ii moves the video preview off history" with no c5-ii outcome [K7 `stale 3`]: `interact.drag.video.stopped.move-to-paint-p95`, `interact.drag.video.playing.move-to-paint-p95` and `interact.drag.video.playing.release-restarts`. Append one past-tense sentence to each note and keep the old text:
- **The two `move-to-paint-p95` rows:** `Stage c5-ii (round 345) done: this row stays record (wallclock trend row, as every move-to-paint-p95 row).`
- **`release-restarts`:** `Stage c5-ii (round 345) done: this row stays record, as every release-restarts row (C round 345: 31).`

Keep 2-space JSON with key order unchanged, for example by a `json.loads`/`dumps(indent=2)` script as in rounds 344 and 345.

### 1.4 Doc 232 (Georgian, technical terms in English)
- **l.4 status:** `In Progress (stage c6-i of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions; C round 346 pending)`.
- **New section** `### ეტაპი c6-i: lucide icon-ების hoist (round 346, D-29z1092)` after the c5-ii section. It covers the premise (§0.1 numbers), the change, the sketch numbers and why the faders and clip gain wait for c6-ii.
- **Changed files, testing and TODO:** add DP63, DP64, the DP62 finally, A's perf run, and the TODO entries c6-ii → conversions → video trim/fade rows.
- **`## ` count stays 7** [K11].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-345/claims-346.sh` from the loop root | equals `b-round-345/claims-346-planning-output.txt` |
| A-CLAIMS final | same | equals `b-round-345/claims-346-sketch-output.txt` for K3, K4 and K5. K2 = `645b2e6 5`; K6 = DP `it(` 66, DP63 1, DP64 1, `componentName-function-only` 0 or 1 (A may keep the function branch; DP63's positive control proves the widening), `video.client-mock` 1, `finally` ≥ 21; K7 = `230 60 stale 0`; K8 11; K10 0; K11 `7 1` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 |
| /check | Biome on the 3 changed code files | rc 0 |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` and the lane/clip suites (`track-layout*`, `lane-strings-ui`, `studio-theme-obsidian`, `video-dock-strings-ui`) | all pass; drag-preview-render 66/66 |
| A-MUTANT (scratch copy only, L59/L60) | (1) the lane chevron inline again; (2) the clip grip inline again; (3) `ArrangementVideoCaption arrangement={arrangement}` | (1) and (2) turn DP63 red; (3) turns DP64 red. Files restored; `store/` `git status` unchanged by the mutants |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-345/perf-results/latest-interactions.json <A's result>` | rc 0; `complete`; `failures` []; 230 rows; 60/60 asserted pass; 0 NEW. Every DIFF row in a `deterministic` components or commits metric is **lower**, never higher. Record the trim, move and fade per-move and max values. Expected about trim 17.7, move about 18.9 and fade about 5.9 per move (the names ×0.983); a different value is recorded and explained, not a STOP, unless it is higher than HEAD. `durationMs` recorded |
| A-PERF-LIB | the round-345 PERF-LIB command (scratch vitest config for `perf/lib`) | 34/34 |
| A-REVIEW | `code-reviewer` (5 files changed) | 0 Medium+ open |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-345/claims-346.sh` | equals A's final |
| SOURCE-SCOPE | `git diff --stat` and `git apply -R --check b-round-345/sketch/source.patch.txt` (the two source files only) | 5 files, 0 untracked; the source patch reverse-applies |
| READ | read the diff | lane and clip DOM unchanged: same classes, `strokeWidth` and `aria-hidden`, and both Plus buttons still have the icon. No other source line changed |
| UNIT | A-UNIT's files | all pass |
| MUTANT | C's own mutants on a scratch copy: (1) the fold chevron inline again; (2) DP64 with the caption fed committed `arrangement` | (1) DP63 red; (2) DP64 red |
| NAMES (browser, dev :5173) | `node b-round-345/names-probe-v2.mjs http://127.0.0.1:5173 c-round-346/names.json` after a browser warm-up (L38) | fade [6, 6, 6, 6]; trim [18, 18, 18, 18]; move [15, 15, 89, 15] (the crossing position may vary; the non-crossing commits are 15); click [88, 0]. No `ChevronDown`, `ChevronRight` or `GripVertical` in any move commit |
| VISUAL (browser, 1440×900 and 1280×720) | `/studio-lab` with the demo project: screenshot lane headers and clip headers before (HEAD) and after; compare the lane fold `svg` and the clip header `svg` `outerHTML` | identical `outerHTML` for the fold chevron (folded and unfolded), the video-import Plus, the clip grip and the video clip `Film` icon; fold toggle still swaps the chevron |
| PERF | production, alone; A-PERF's rows | as A-PERF |
| PERF-LIB | A-PERF-LIB | 34/34 |
| G346-AUTH | fresh anonymous context at both viewports | `/studio-lab` opens with the workspace and demo badge, `auth_user` null; `/studio/<id>` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` refuses (401/400; 500 only when the mock on :5199 is down) |
| DOCS | doc 232 | l.4 as in §1.4; one `### ეტაპი c6-i` section; 7 `## ` |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** NAMES, VISUAL, PERF and G346-AUTH all run here; none needs the backend.
**Ableton conformance:** not applicable (performance change; output identical).

## 3. Neighbouring behaviour that could break
- **Fold toggle.** The chevron swaps between two constants: VISUAL checks folded and unfolded.
- **Video import buttons.** Both branches reuse one constant element. React allows one element in two places; VISUAL checks that both render the icon.
- **Clip header.** The video `Film` icon versus the audio grip: VISUAL checks both.
- **Tests that count renders.** Widening `componentName` adds names but changes no existing name's count. Every existing DP must stay green.
- **DP64's module mock.** It is file-wide, but only DP64 calls `importVideoFiles`. If any other DP changes result, STOP (§4).

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside the values in §2.1.
- The patch does not apply, or a change is needed outside the 5 files (L22: STOP with the diff).
- Any asserted perf row fails, any deterministic component or commit row goes higher, or any NEW row appears.
- A mutant stays green.
- DP64 cannot be made to work with the module mock without changing another DP's result. Then ship the rest, report the attempt with its log, and C-R345-CAPTION-MUTANT-GAP goes back to `deferred_low_polish`. This is not a round failure.

## 5. Not in scope (recorded)
- **c6-ii:** `ArrangementMixFader` and `ArrangementDetailClipGain` memo with stable lane and detail props. Next PERF-DRAG-PREVIEW stage; it reads the checkpoint answer when present.
- **Conversions:** trim/move/fade rows → `assert` at ceil(value). They need gross, fine and `flushSync`-release mutants on B's sketch perf run (D-29z1092). `move-components-max` and the 6× copies stay `record`.
- **PERF-CAND-VIDEO-TRIM-FADE-ROWS** (record), after the conversions.
- **A-R345-REVIEW-VIDEO-TRACK-ID** → `deferred_low_polish`.
- **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE:** root, with frontend-architect; the questions are in D-29z1093.
- **Root only:** `vitest.config.ts` (GATE304-M1), `playwright.perf.config.ts` (ROOT-REQ-PERF-TIMEOUT), commits and pushes.

## 6. Deliverables
- **A:** the 5 files; `a-round-346.md` with the A rows; logs in `a-round-346/`.
- **C:** `c-round-346.md`, `c-round-346.json` and `c-round-346/`.

## 7. Claims
Run `bash b-round-345/claims-346.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree; a scratch tree with a private Vite `cacheDir` shows K8 10, because `vite.config.ts` differs. Expected outputs: `b-round-345/claims-346-planning-output.txt` (HEAD) and `b-round-345/claims-346-sketch-output.txt` (B's sketch: source only, no test, budget or doc change).
- **K1:** gate 345 `published` `645b2e6`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** `ArrangementLane.tsx`: inline `<ChevronRight`, `<ChevronDown` and `<Plus` counts; the three constants; `{folded ? LANE_FOLD_CHEVRON_RIGHT : LANE_FOLD_CHEVRON_DOWN}`; `{LANE_ADD_PLUS_ICON}`.
- **K4:** `ArrangementClip.tsx`: inline `<Film` and `<GripVertical` counts; the two constants; `{isVideo ? CLIP_HEADER_VIDEO_ICON : CLIP_HEADER_GRIP_ICON}`.
- **K5:** `ArrangementVideoDock.tsx`: `ArrangementVideoCaption arrangement={videoLaneArrangement}`.
- **K6:** test file: DP `it(` count, DP62/DP63/DP64, the function-only `componentName` line, the `video.client` mock, the `finally {` count.
- **K7:** budgets: rows, asserted, stale c5-ii notes.
- **K8:** protected files OK.
- **K9:** `regression-last` date.
- **K10:** `app/`, `perf/`, `e2e/` and `docs/` diff lines outside the 5 files.
- **K11:** doc 232 `## ` count and the c6-i section.
