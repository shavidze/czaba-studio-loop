# A — Round 84 report: SRW-19 video opacity fade + X1 (C-R83-L1)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Task: `current-task.md` (Round 84, D-29z49)
STATUS: IMPLEMENTED — awaiting C (scope completed; no C row claimed)

## Baseline (verified before the first edit)
- HEAD `a68c81d91be994ee02eb00e184cbdcc06b5f5a60`, `git status --short` = 0 lines.
- Frozen list `b-round-83-r84-tree-sha256.txt`: 478/478 OK. The 6 snapshots matched their prefixes. Protected 4/4 OK. `:5173/studio-lab` = 200.

## Pre-flight
- Primitives read: AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/studio-feature.md, prompts/new-test.md, skill pre-flight.
- Grep results:
  - `setClipFade` callers: only the two in `ArrangementClip.tsx` (l.435 drag preview, l.742 reset). Both now pick `setVideoClipFade` when `isVideo`.
  - `arrangement-clip-fade-` testids in source: only `ArrangementClip.tsx` (ramps, handles). Video now uses `arrangement-video-fade-`.
  - Readers of `fadeIn`/`fadeOut` that could assume an audio track: `graph.client.ts` and `ArrangementContext.tsx` read only through `clipFadeShapes` (audio-only, FD6). `clipboard.ts` copies the fields for every kind (desired). `SfxQuickEdit`/`SfxSceneBuilder`/`sfx-*` are a different model (SFX editor), not arrangement clips. No detail panel reads them. **No site outside the grants misbehaves for a faded video clip → no stop needed.**

## Changed files (end state 6 M + 4 ??)
| File | Change |
|---|---|
| `app/lib/arrangement/video-fades.ts` (new) | `setVideoClipFade` (mirror of `setClipFade`, video track only; private helpers re-implemented locally), `videoFadeOpacityAt` (`findVideoClipAt` + `clipFadeGainAt`, 1 without video), `arrangementHasVideoFades` (effective/clamped fades on video-track clips, used by the export dialog) |
| `app/components/arrangement/ArrangementVideoDock.tsx` | New `ArrangementVideoFadeOverlay` inside `arrangement-video-box` after both `<video>`s: `pointer-events-none absolute inset-0 z-10 bg-background`, `aria-hidden`, `data-testid="arrangement-video-fade"`, `data-video-opacity` = picture opacity (3 dp), `style.opacity` = 1 − value. Written per position frame via `useArrangementPositionWriter` reading the arrangement from a ref, plus once per arrangement change (layout effect) so an edit while stopped updates at once. DOM written only when the 3-dp string changes. Initial value rendered once (`useState` initializer) so SSR/first paint is right and React never rewrites it. Slot role / sync / swap code untouched |
| `app/components/arrangement/ArrangementClip.tsx` | V5 only: `showFadeHandles` drops `!isVideo`; video testid prefix `arrangement-video-fade` (handles + `-ramps`); video titles `Video Fade In/Out — სურათი (ხმა არ იცვლება) · drag · double-click = 0`; labels `Video Fade In/Out` at the three label sites (drag status, release, reset); setter choice `isVideo ? setVideoClipFade : setClipFade` at the two call sites; video ramp overlay `text-accent`; import. Gesture kinds/thresholds/capture/pointercancel/X1 guard unchanged |
| `app/components/arrangement/ArrangementExportDialog.tsx` | `hasVideoFades = arrangementHasVideoFades(arrangement)`; when true, one `<p data-testid="arrangement-export-video-fades">` right after the (still disabled, unchanged-reason) video option with the exact text (byte-identical to the task, `grep -c` = 1 in both) |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | X1: `CLIP_ENVELOPE_ROOT_BORDER_PX = 1`; double-click measures from the clip root rect (`closest('[data-clip-id]')`, fallback body − border); point `left` − 1 px; SVG `left: −1px; width: lineWidth` instead of `inset-0 w-full`, so the viewBox maps 1:1 onto the root's outer box |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | **AL1 appended only (70 insertions, 0 deletions): two cases — 40 px/s untrimmed (6/10/14 s) and 25 px/s start-trimmed `sourceOffset 1.5` (5/8.04/12.6 s), each asserting (a)–(d).** No literal or stub was amended: l.613 `'0,0.7488 80,0.7488'`, l.737 `'0,0 160,0 320,0.7488 480,0 640,0'`, l.741 `'0,0 40,0'` are unchanged and still pass, because the fix keeps viewBox units and moves the SVG box instead |
| `app/lib/arrangement/__tests__/video-fades.test.ts` (new) | VF1–VF4 (12 tests) |
| `app/lib/arrangement/__tests__/video-fades-ui.test.tsx` (new) | VU1–VU4 (10 tests) |
| `docs/.../073-studio-lab-clip-volume-envelope-stage-2.md` | l.4 only, exact text from the task |
| `docs/.../074-studio-lab-video-opacity-fade.md` (new) | Georgian, TEMPLATE sections, status `Round 84 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z49)`; V1, V3, black = `bg-background`, overlay vs slot opacity, X1 coordinate rule, every §4 Live difference |

## Tests actually run (A scope per speed rules)
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0, 0 errors; 218 pre-existing warnings + 1 info repo-wide. Scoped `npx biome check` (no `--write`) on the 8 owned code/test files: clean. New files formatted via `biome format --stdin-file-path` → stdout.
- Targeted vitest: `a-round-84/targeted-list.txt` (51 files: every test importing StudioWorkspace / ArrangementClip / ArrangementVideoDock / ArrangementExportDialog / ArrangementClipEnvelope / fades / video / video-fades) → **51 files, 980 tests passed** (final run after the review follow-up). Log: `a-round-84/targeted-run.log`.
- Full suite / `npm run verify` / build: **not run by A** (gate rows).

## Mutation proofs (scratch copy `a-round-84/mut/store`, node_modules symlinked; `store/` never mutated; script `a-round-84/scripts/mutate.py`; logs + `summary.txt` in `a-round-84/mut/`)
| ID | Mutation | Red |
|---|---|---|
| (a) | setter accepts audio clips | VF1 same-reference |
| (b) | opacity ignores fade-out | VF2 ×3, VU3 |
| (c) | overlay writes gain instead of 1 − gain | VU3 ×2 |
| (d) | video handle reuses `arrangement-clip-fade-` | VU1, VU2 ×2, VU3, frozen FU1 … (6) |
| (e) | export line shown without a video fade | VU4 |
| (f) | video setter used for audio clips | VU2 audio path, frozen FU2 ×2, FU3 … (7) |
| (g) | X1 double-click measures from the body again | AL1 ×2 |
| (i) extra | X1 point `left` without the −1 px | AL1 ×2 |
| (j) extra | X1 SVG back to the body box (`left 0`, `width − 2`) | AL1 ×2 |
| (h) | overlay rewrites equal values | VU3 no-rewrite |
- Regression acceptance: both AL1 cases run against the pre-change `ArrangementClipEnvelope.tsx` (HEAD) in the scratch copy are red; the 40 px/s case stores exactly C's numbers `5.975 / 9.975 / 13.975` instead of `6.000 / 10.000 / 14.000` (`a-round-84/mut/pre-change-AL1.log`).

## A's own Playwright smoke (1440×900, one warm-up load; NOT C evidence) — `a-round-84/pw/`
- `beeps-6s-vp9-opus.webm` decodes in this Chromium (frames painted).
- Video clip at S = 0 (no move), zoom ≈ 40.05 px/s. Two `arrangement-video-fade-*-handle` with the exact titles; 0 `arrangement-clip-fade-*` in V.
- Fade-in drag ≈ +1 s → `data-fade-in="1.001"` (zoom was 40.05, not 40), status `Video Fade In: 1.001 წმ.`, ramps overlay present.
- Stopped clicks at S+0.25 / 0.50 / 0.75 / 1.5 → `data-video-opacity` 0.250 / 0.500 / 0.750 / 1.000, computed overlay opacity 0.75 / 0.5 / 0.25 / 0. Box screenshots `a-r84-box-0.25.png` (dark) vs `a-r84-box-0.75.png` (bright).
- Export dialog shows the exact note; Ctrl+Z → fade 0.000, overlay 1.000.
- X1 (fresh page, demo audio clip, 40.000 px/s, Env mode): double-clicks at integer ruler x of 1 / 2.5 / 6 / 10 s → `1.000;2.500;6.000;10.000`; point centre − ruler x ≤ 2e-4 px; SVG right − clip right = 0 px.
  - **Harness note for C:** Chromium truncates fractional `page.mouse` coordinates (x = 611.99995 arrived as clientX 611 → 2.475). Use integer pixel coordinates (or compute T from the actual `clientX`) in X1-ALIGN.
- Console: no hydration / `useLayoutEffect` warning, no non-noise error.

## Acceptance status (honest)
- Unit/UI rows I ran: VF1–VF4, VU1–VU4, AL1 (2 cases), mutations (a)–(j), T84-TARGETED (51/980) → pass.
- **No C browser row is claimed.** VF-HANDLES, VF-IN, VF-PREVIEW (incl. play run), VF-OUT, VF-FLOAT, VF-EDITS, VF-UNDO, VF-AUDIO (WAV identity), VF-EXPORT, VF-PLAY-EDIT, VF-SYNC, X1-ALIGN, P-M1, REG-HYD, G84-3 and SOURCE-UNCHANGED belong to C. My smoke only suggests they should pass.

## Known gaps / signals for B
- SRW19-RESCHEDULE: a video-fade edit during playback changes `scheduleKey` (frozen) and reschedules audio (gate-83 M2 class). Not changed.
- VIDEO-FADE-SOUND: the video's own sound is not faded (by design V3).
- `video-fades.ts` duplicates three private helpers of frozen `fades.ts`; VF1 parity test (same inputs on audio vs video track → `toStrictEqual`) guards drift.
- Fade-ramp overlay 1–2 px drift: unchanged (Lows batch).

## Exact next C checks
1. Setup per §5 (snap off, import `beeps-6s-vp9-opus.webm`, move V to ≈ 2 s, read actual S/E).
2. VF-PREVIEW stopped and the rAF-sampled play run (`[data-testid=arrangement-video-fade]` `data-video-opacity` + computed `opacity`), both viewports; pixel row is runnable (the codec decodes).
3. VF-AUDIO: two WAV exports, max sample difference 0.
4. VF-SYNC paired runs within the 3-valid-measurement budget.
5. X1-ALIGN with **integer** pointer x at 40 px/s and one other zoom; EN-ADD/DRAG/UNDO short re-run.
6. P-M1 probe; REG-HYD; G84-3; SOURCE-UNCHANGED (6 M + 4 ??, frozen 478/478, protected 4/4, A end hashes in `a-round-84/end-hashes.txt`).

## Code review (actual `code-reviewer` subagent, read-only; it could not run a shell, so it relied on my reported checks)
- Result: **9/10 — COMMIT OK.** Critical 0, High 0, Medium 0, Low 7.
- Lows and what I did:
  1. AL1 covered one zoom, `sourceOffset 0` only → **fixed**: AL1 now runs at 40 px/s untrimmed and 25 px/s start-trimmed (`sourceOffset 1.5`); both red on pre-change code and under mutations (g)/(i)/(j).
  2. AL1 is the only test that separates root from body measurement (older EU tests stub the body at 0 and jsdom root rect is 0) → acknowledged; that is why AL1 exists. No locked literal amended.
  3. Border fact in two constants (`CLIP_BORDER_PX = 2` in ArrangementClip, `CLIP_ENVELOPE_ROOT_BORDER_PX = 1` in the envelope), both tied to the root `border` class → not changed (ArrangementClip constant is outside X1 scope); recorded as signal below.
  4. Unreachable fallback branch in the double-click (editor always inside `[data-clip-id]`) → kept as a defensive fallback; harmless.
  5. SVG `left: −1` and a start-edge point are clipped by the root `overflow-hidden` border (pre-existing) → cosmetic, not X1.
  6. SSR initial value not separately tested → by construction (`useState` initializer, no persistence; video clips exist only client-side). C's REG-HYD row covers hydration.
  7. Nit: export note has no `role="note"` → not added (spec did not ask; avoids changing dialog note counts).
- **Architecture note (verbatim, for B):**
  > - **Signal 3 (duplicated code):** `video-fades.ts` l.5–24 re-implements three private helpers from `fades.ts` l.21–48. → keep, because the spec froze `fades.ts` and the VF1 parity test guards drift. Proposal for planner: in a later round, export `roundFadeSeconds`, `floorFadeSeconds` and `withClipFadeLengths` from `fades.ts` and delete the copies. Acceptance: VF1 parity still green, FD1/FD6 untouched, no behaviour change.
  > - **Signal 4 (new lifecycle in an existing owner):** `ArrangementVideoDock.tsx` l.237–273 adds a position writer and a layout effect. → keep: it lives in its own sibling component, has no link to the sync `useEffect` (l.314–702) and shares no state with swap. File length alone is not a signal, so it is not an extraction candidate now.
  > - **Coupling signal (low value):** `CLIP_ENVELOPE_ROOT_BORDER_PX` (`ArrangementClipEnvelope.tsx:21`) and `CLIP_BORDER_PX` (`ArrangementClip.tsx:44`) both depend on the root's `border` class. → keep. Just record it as a one-line backlog item; no task needed.

## Final source state
- `git status --short`: 6 M + 4 ?? (exactly the §1 Files table). Frozen 478/478 OK. Protected 4/4 OK. All owned files LF, CR = 0.
- End hashes: `a-round-84/end-hashes.txt`.
- Not run by A (gate): full vitest, build, `npm run verify`, e2e smoke.
