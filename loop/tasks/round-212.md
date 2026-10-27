# CURRENT TASK — Round 212: PERF-FADER-c, the remaining Clip Gain drag latency (SABA-B-5 part 3) + the release-commit fix (C-R211-01) + stored gains as a prop (GATE211-S1)

Decisions: **D-29z195** (architecture checkpoint request), **D-29z196** (round 211 accepted; closures; DEVIATION rulings; doc 166 l.4), **D-29z197** (waveform outline path; `buildPeakShape` string format unfrozen), **D-29z198** (C-R211-01 + GATE211-S1; release-commits ruling), **D-29z199** (queue: PERF-FADER-c before PERF-1b). Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` (L10, L11, L12, L23, L26, L28 apply).
- `tasks/round-211.md` §1 (the clip-gain pointer path, which you must not change), `c-round-211.md` (C-R211-01 repro and probe method), `gates/round-211/review.md` (S1–S6).
- B's measurements: `b-round-211/diag/` (`diag*.cjs`, `result*.json`, `pixdiff.cjs`, `pixdiff.json`, `px-*.png`).
- Code:
  - `app/components/arrangement/ArrangementClip.tsx` l.246–320 (`buildPeakShape`, `ArrangementPeakPath`);
  - `ArrangementDetailPanel.tsx` l.86–95, l.243–380, l.500–545, l.700–720 and l.985–1000;
  - `StudioWorkspace.tsx` l.2163–2192.
- Project: `.claude/prompts/studio-feature.md`, primitives `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`.

## Baseline
- **Commit:** `28a274c` (gate 211 **published** to both remotes; tree clean). The `head` field in `gates/gate-round-211.json` is the pre-commit HEAD `180dd2e`; the published commit is `28a274c`.
- **Frozen:** the 1,050 files in `b-round-211-r212-tree-sha256.txt`, which is every tracked file except the 7 grants. From the store root: `sha256sum -c --quiet <loop>/b-round-211-r212-tree-sha256.txt` (B checked: rc 0).
- **Grants:** `b-round-211-r212-grants.txt` (7). Start hashes: `b-round-211-r212-granted-start-sha256.txt`. Start copies: `b-round-211/r212-granted-start/`.
- **New files:** `b-round-211-r212-new-files.txt` (2), both mandatory:
  - `app/lib/arrangement/__tests__/waveform-outline-path.test.tsx`
  - `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md` (167 is free; 166 is the last doc)
- **Protected and frozen as always:** auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md`, `package.json`, `biome.json`, `tsconfig*.json`, `playwright*.config.ts`, `app/routes/**`.
- **Frozen this round in particular:**
  - `app/contexts/ArrangementContext.tsx`, because the architecture checkpoint is reviewing it (D-29z195);
  - `app/lib/arrangement/mix-draft-store.ts`, `perf/**` (budgets and spec), `useRelativeFaderDrag.ts` and `ArrangementLane.tsx`;
  - every test file outside the 3 granted ones.

## 0. Why this round
- **SABA-B-5 (Medium, Saba 2026-10-27: "dragging a fader is slow") is still open for Clip Gain.** Round 211 cut React work to 3 components per move. But C's production harness still measured single-clip Clip Gain move-to-paint p95 at **18.1 / 18.6 ms stopped** and **59.7 / 58.1 ms playing** (C-R211-02). The target is p95 < 16 ms. For comparison, members (no detail waveform) were 6–10 ms and the track fader 1.7–3.8 ms.
- **Cause, measured by B.** Setup: dev server, 1440×900, single clip, Playwright. The method is the harness's: capture `pointermove` → rAF → MessageChannel. Data: `b-round-211/diag/result*.json`.

  | Experiment | stopped p95 (ms) | playing p95 (ms) |
  |---|---|---|
  | as-is | 14.4–21.7 | 23.2–45.9 |
  | `display:none` on the lane clip svgs | — | 6.0–6.9 |
  | `display:none` on the detail waveform svg | — | 15.9–16.2 |
  | `display:none` on every playhead (workspace, ruler handle, overview) | — | 45.8–47.2 (no gain) |
  | `display:none` on the detail playhead | — | 24.1–24.3 (no gain) |
  | **`will-change: transform` on the waveform svgs (layer promotion)** | **35.6–38.9 (worse)** | **56.7–58.6 (worse)** |
  | **the same geometry as one outline path** (rewritten in the page by a MutationObserver after each commit, so its own cost is included) | **6.4–7.7** | **8.8–10.5** |

  - In the CDP trace of a playing drag, RasterTask totals 1,730 ms and Commit 372 ms. The cost is the software raster of the peak path.
  - Today `buildPeakShape` emits one 1-unit rectangle subpath per column: up to 4,096 for the lane and 480 for the detail panel. Rasterizing that many abutting antialiased rects is what costs the time.
  - **Rejected by measurement; do not try:**
    - layer promotion (worse);
    - moving the playhead to transforms (no gain);
    - canvas (no measured need; jsdom has no 2D context, and the first server paint would be empty).
- **Visual equivalence, measured by B** (`b-round-211/diag/pixdiff.json`). The outline path has the same geometry. At rest it differs from today's drawing by at most **2/255 (lane) and 5/255 (detail)** per channel, with **0 pixels differing by more than 8**. The only change is that the faint antialias seams between columns are gone.
- **C-R211-01 (Low; same owner, fixed now).** On release of a value-changing single drag, an extra commit renders the stale typed text in the pending state. It is never painted, but it doubles `release-commits`.
- **GATE211-S1 (Medium code-review suggestion; same block).** The block leaf calls `getArrangement()` during render, which is a mutable ref read. It also falls back to 0 dB when the optional prop is missing.
- **Bug gate:** no Critical or High is open. SABA-B-5 is the open Medium, so its fix comes before new perf scope (D-29z199).
- **Reference first:** not applicable, because this is a performance round. The drawing's geometry is unchanged, and PIX-212 checks the pixels.

## 1. Rulings
**D-29z197: the waveform outline path (required).**
1. **What stays and what changes.** `buildPeakShape(peaks, sourceOffset, duration, columns, scale)` keeps:
   - its signature and its `columns` result;
   - the per-column height formula, `height = max(0.02, min(1, max × s))`, with the `s` fallback;
   - the `from`/`to`/`perColumn` bucketing;
   - its `null` cases.

   **Only the `path` string format changes.** It becomes exactly one closed outline:
   - `M0 1`;
   - then, for each column `c = 0 … count−1`: `V{(1−h_c).toFixed(3)}H{c+1}`;
   - then, for each column `c = count−1 … 0`: `V{(1+h_c).toFixed(3)}H{c}`;
   - then `Z`.

   Example (the WZ1 fixture): `M0 1V0.900H1V0.750H2V0.550H3V0.500H4V0.980H5V1.020H4V1.500H3V1.450H2V1.250H1V1.100H0Z`.

   B scratch-applied exactly this format; see item 4 for the result. A may not drop redundant `V`/`H` commands, because the exact format keeps the parse tests and C's checks deterministic.
2. **Unchanged around it:**
   - `ArrangementPeakPath`: the svg, `viewBox="0 0 {columns} 2"`, `preserveAspectRatio="none"`, one `<path fill="currentColor">`, the classes, the test ids and the draft subscription;
   - the lane and detail column counts (`PEAK_SHAPE_MAX_COLUMNS` 4096, `DETAIL_PEAK_COLUMNS` 480);
   - every caller.
3. **Freeze lifted for the string only.** Round 211 froze the `buildPeakShape` output ("WG1/WG2 pin it"). That freeze is lifted **for the string format only**. The geometry stays pinned through the replacement tests in item 4.
4. **Replacing the three literal pins (the L23 hits).** B ran the whole `app/lib/arrangement app/components` suite on a scratch copy with the new format. Exactly **3 tests were red, all literal pins**, and 2,203 were green.
   - **`waveform-zoom.test.tsx` WZ1** (table at l.66–86, assert at l.413). Keep the row id, the intent of its title and every case. Each expected rect literal stays in the file as the **reference geometry**. The assert becomes two checks:
     - `columnsOf(buildPeakShape(…).path)` deep-equals `columnsOf(<rect literal>)`;
     - `path` equals `outlineOf(<rect literal>)`.
   - **`clip-gain-waveform.test.tsx` WG1** (l.33–49, l.324/328): the same treatment.
   - **`clip-gain-waveform.test.tsx` WG2** (l.333–342). "Byte-identical to the pre-round drawing" is re-expressed through a test-local legacy formatter, `rectPathOf`, which rebuilds `M{c} {top}h1V{bottom}h-1Z` per column. `rectPathOf(columnsOf(shape.path))` must have length **2530** and sha256 **`WG2_PRE_ROUND_SHA256`** (the constant is unchanged). This proves the new path encodes exactly the old drawing.
   - **Forbidden:** pasting a new sha or a new literal produced by the new code as the only check.
   - `columnsOf`, `outlineOf` and `rectPathOf` live in the new `waveform-outline-path.test.tsx` or in each granted file. They are plain parsers or formatters; they do not call `buildPeakShape`.
5. **Not changed:** the waveform's colour, size, position and zoom/gain behaviour; the fade ramp svg and the envelope; React commit counts (3 per move for a single drag).

**D-29z198: C-R211-01 and GATE211-S1 (required).** B scratch-applied both to `28a274c`: typecheck clean, Biome clean, and `app/lib/arrangement app/components app/hooks` green (154 files, 2,223 tests). No further grant is needed.
1. **C-R211-01.**
   - Replace the layout effect at `ArrangementDetailPanel.tsx` l.543–545 (`setClipGainText(displayedClipGainText)`) with React's "adjust state when a prop changes" pattern: a `syncedClipGainText` state. When it differs from `displayedClipGainText` during render, set it and call `setClipGainText(displayedClipGainText)`. React then re-renders before committing, so the release commits once, with matching text.
   - Undo/Redo, typing, Escape and the reset button must still re-sync the field exactly as today.
   - Writing the text in the pointer-up handler is not enough. The commit comes from the context's window listener, and Undo/Redo also needs the sync (tech-lead consult).
2. **GATE211-S1.**
   - `ArrangementDetailGroup` gets a required `clipGainsDb: readonly number[]`, index-aligned with `clipIds`: `clips.map((clip) => clip.gainDb ?? 0)`. Add it in the `detailGroup` memo of `StudioWorkspace.tsx` (l.2183–2191 only; nothing else in that file changes).
   - The block leaf drops `getArrangement` from its props and takes `storedClipGainsDb: readonly number[]`, index-aligned with the leaf's `clipIds`. That prop is **`clipGainGroup.clipGainsDb` when `clipGainGroup` is non-null, otherwise `[clipGainDb ?? 0]`**. The leaf's ids come from `clipGainGroup?.clipIds` (l.701–703), not from the span group.
   - `draftedClipGains` reads that array, so no mutable read happens during render.
   - The parent keeps `getArrangement` for `readClipGainAnchorDb` (l.719).
3. **Release-commits ruling (pre-ruled; no STOP).**
   - After the fix, `fader.clipgain.stopped.release-commits` is expected to fall from 2 to 1 (and members from 2 to 1 wherever it was 2). This is the intended result.
   - The `assert ≥ 1` rows stay as they are, since `perf/**` is frozen.
   - For this round, the must-be-identical list (D-29z190) **excludes** the clipgain and clipgain-members `release-commits` rows and the wall-clock rows. Every other deterministic row must equal C round 211's medians. A move in any of them is a STOP (L11).
4. **GATE211-S2 is not in this round.** It waits for the architecture checkpoint (D-29z195), and `ArrangementContext.tsx` is frozen.

**D-29z196: doc 166 l.4 (GATE211-S6, L28).** Doc 166 l.4 becomes exactly `**სტატუსი:** Completed (PERF-FADER-b C round 211 PASS, published 28a274c)`. Nothing else in doc 166 changes.

**Doc 167 (new).** In Georgian, following `docs/implementation/TEMPLATE.md`.
- **Content:**
  - the measured cause, with B's table and A's own measurements;
  - the outline format;
  - the rejected options, with their numbers;
  - C-R211-01 and S1.
- **Status line:** conditional, `In Progress (C round 212 check pending)` (L28).
- **Citations:** only test rows that exist (L26).

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | `buildPeakShape` path format only (D-29z197). Nothing else in the file. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | C-R211-01 and S1 (D-29z198); `ArrangementDetailGroup.clipGainsDb`. |
| `app/components/arrangement/StudioWorkspace.tsx` | One memo field, `clipGainsDb` (l.2183–2191). |
| `app/lib/arrangement/__tests__/waveform-zoom.test.tsx` | WZ1 only (D-29z197 item 4). |
| `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` | WG1 and WG2 only (D-29z197 item 4). |
| `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx` | New rows CP15–CP17 (below); CP1–CP14 unchanged. |
| `docs/implementation/2026/quarter-IV/166-clip-gain-pointer-preview.md` | l.4 only (D-29z196). |
| new `app/lib/arrangement/__tests__/waveform-outline-path.test.tsx` | Rows PO1–PO5 (below). |
| new `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md` | Doc 167. |

**New rows.** Each row is either red on the start copy (`28a274c`) or has a named mutant (D-29z187 method: state the mutated line and the failing assertion).
- **PO1 geometry identity.** For the WZ1 and WG1 fixtures (every scale and zoom case) and the WG2 realistic fixture, `columnsOf(new path)` equals the per-column `(top, bottom)` computed from the documented height formula.
- **PO2 format.** Exactly one `M`, one `Z`, and `2 × columns` `V`/`H` pairs. The path starts with `M0 1` and ends with `H0Z`.
- **PO3 floor and clamp.** A silent column draws `0.980`/`1.020`; a clipping column draws `0.000`/`2.000`.
- **PO4 one column.** `count = 1` gives `M0 1V{t}H1V{b}H0Z`.
- **PO5 null cases unchanged.** Missing peaks, empty peaks, `columns ≤ 0` and an empty span all give `null`.
- **CP15 C-R211-01.** A value-changing single drag starting from a typed −12 dB. Red on the start copy. Checks:
  - on release, `ArrangementDetailClipGain` commits **once** (the commit probe counts committed fibres);
  - no committed render of the field has `data-pending`;
  - the pending `<p>`, found by test id or text, never mounts;
  - do not assert class tokens (L12).
- **CP16 field sync unchanged.** After release, each of these leaves the field and the pending state exactly as on the start copy: Undo, Redo, typing then Escape, and the reset button.
- **CP17 S1: stored gains without a mutable read.** Members at −6 and +1; drag one member's anchor.
  - The range text mid-drag is built from the drafts and the stored gains passed as props.
  - Mutant: making the leaf read `0` for undrafted members turns CP17 red.
  - A selection change mid-drag, MG11-style, shows the new selection's stored gains.

**Self-checks before handover (not the full suite):**
- `npm run typecheck`; Biome on the owned paths (0 errors, 0 warnings).
- `npx vitest run` on:
  - the new file and the 3 granted test files;
  - `clip-gain`, `clip-gain-fader`, `clip-gain-multi`, `pending-status`, `detail-panel`, `detail-panel-reason`, `detail-panel-polish`, `detail-panel-fit`, `render-budget`, `content-colour-ui`, `video-fades-ui` and `fader-pointer-preview`;
  - plus one covering run of `app/lib/arrangement app/components app/hooks` (B's scratch run: 2,223 green before the new rows).
- `npm run test:perf` **twice**, sequentially, with nothing else building.
  - Both exit 0 and every assert passes.
  - Report the clipgain move-to-paint p95 rows (stopped/playing, 1×/6×) and `release-commits`, next to C round 211's numbers.
  - The JSONs go under `a-round-212/`.
- **Pixel check:** before and after screenshots of a lane waveform and of the detail waveform at rest, with B's `pixdiff.cjs` method. Report the per-channel max delta and the count of pixels with a delta > 8.
- The code-reviewer on the **final** delta (3+ files). Carry its Architecture note verbatim.

## 3. C — rows
**Setup:**
- a production build of the current tree;
- the baseline `28a274c`, built in a separate tree under `c-round-212/`;
- the dev server, for G212-3;
- Playwright Chromium;
- C's own probes under `c-round-212/tools/`, with no imports from `perf/`;
- never run `test:perf` in parallel with a build.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-212** (start + end) | HEAD, `git status`, `sha256sum -c` of the 1,050-file list, and grant diffs against the start copies. | Only the 7 grants differ, and only the 2 listed new files appear. `ArrangementClip.tsx` differs only inside `buildPeakShape`'s path assembly. `StudioWorkspace.tsx` differs only by the `clipGainsDb` memo field. Doc 166 differs only at l.4, with the exact text. In the two pinned test files only WZ1, WG1 and WG2 change. |
| **LATENCY-212** (the SABA-B-5 closure row) | `npm run test:perf` ×2 on the production build. Plus C's own move-to-paint probe: single clip, stopped and playing, at 1440×900 and 1280×720, 3 valid runs each, with at most 2 replacement runs for invalid ones. The baseline `28a274c` is probed the same way as a control. | `fader.clipgain.stopped` and `fader.clipgain.playing` move-to-paint p95 at 1× are **< 16 ms**, both as the median of C's harness runs **and** as the median of C's probe runs. Members stay < 16 ms. **If any value is ≥ 16 ms, the row FAILs for SABA-B-5:** record the numbers; SABA-B-5 stays open. No tolerance is loosened. The baseline control is informational only. If the baseline measures < 16 ms while playing that day, C records that as a note, and the row is judged on the current-tree medians alone. |
| **PERF-RUN-212** | The same two harness runs. | Both exit 0 and every assert passes. Restarts are 0. Deterministic rows agree between runs and across 1×/6×. Every deterministic row equals C round 211's medians, except the clipgain/clipgain-members `release-commits` rows (D-29z198 item 3). `move-components-max` for clipgain stays ≤ 3. `release-commits` for the single clipgain drag is 1. |
| **PIX-212** | Element screenshots of the lane waveform and the detail waveform, current build vs baseline build, at both viewports **with the detail panel expanded**. States: at rest at 0 dB; mid-drag, held at −12 dB and at +6 dB; waveform zoom 2× and 8×; a near-silent region (the floor); a clipping boost (+24 dB, columns at the top and bottom). | In every state, **0 pixels with any channel delta > 8**. Report the max delta. The svg box, viewBox, colour and position are identical. |
| **RELEASE-212** (C-R211-01) | C's MutationObserver probe from `c-round-211` (`attributeOldValue` on the Clip Gain field): type −12, drag 10 px, release. Also a members drag. | No mutation record shows the stale text, `data-pending="true"`, the warning title or the pending `<p>` during release. A single release commits once. The field shows the committed value. |
| **SYNC-212** | In the browser: a typed value, then Enter, blur or Escape; the reset button; double-click reset; Undo/Redo after a drag; Undo/Redo after a typed edit; a selection change between a clip and a group (−6 / +1). | Field text, pending marker, range text, the reset button's `disabled` and the statuses are identical to the baseline build (a baseline-vs-now diff). |
| **WAVE-LIVE-212** | Samples at 25 / 50 / 75 % of a slow single drag and of a members drag, at both viewports. | The lane and detail waveforms still follow the drag, and their heights equal the shape for the displayed dB (parse the `d`). After release, the drawing equals the committed state, with no snap-back. |
| **EXPORT-212** | Drag the clip gain to G1 and export WAV; type G1 and export. | The two hashes are equal, and the control differs. The drawing change does not affect export. |
| **DOC-212** | Docs 166 and 167. | Doc 166 l.4 is exact. Doc 167 has the conditional status and the measured table, and cites only existing rows (L26). |
| **AN-REVIEW-212** | The diff. | No `any`, `as`, `@ts-*`, lint suppressions or class selectors in tests. Semicolons everywhere. No hardcoded colours. No mutable ref read during render in the block leaf. WG2 still checks `WG2_PRE_ROUND_SHA256` through the legacy formatter. |
| **G212-3** | Fresh contexts at 1440 and 1280: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer. | `/studio-lab` opens anonymously. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header → 401. The fake Bearer gets 403 with the `:5199` mock, or 500 without it. **No token is issued.** |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. | Not claimed by C. |

**`browserVerified`:** every row above except `gate` can run in the cloud. If one does not run, the flag is false and SABA-B-5 stays open.

**Product / Ableton:** the CZABA requirement is SABA-B-5 (a fast Clip Gain fader drag). Ableton conformance is not applicable: this is a performance round, and PIX-212 and SYNC-212 check that nothing visible changed.

## 4. Adjacent behaviour that could break
- **Every waveform.** This includes the lane waveform of audio clips **and** of a video clip with an audio stream. Per C-R211-04, such a clip does draw a lane waveform, on the baseline too. It must hold during clip move, trim and fade drags, on waveform zoom changes, and for a library-added clip on its first render.
- **The PERF-FADER-a faders** (track, group, master, pan): one track drag stays at 1 component per move.
- **Typed-field pending state.** `pending-status` S9 and PM1–PM4 stay green unedited. The field still shows the warning state while typed text is unsaved.
- **Status announcements** come only after the commit; there are none per move.
- **The detail panel at 1280** starts collapsed. Expanding it shows the waveform at once.

## 5. Publication
After C PASS, root runs the gate. Commit message: "perf(studio): PERF-FADER-c waveform outline path, single release commit (SABA-B-5 part 3, C-R211-01)". Root amends doc 167 l.4 (L28).

## 6. After this round (not in scope)
- **Architecture checkpoint** (`b-round-211-checkpoint-request.md`, D-29z195). Root invokes `frontend-architect`. It is non-blocking; GATE211-S2 waits for it.
- **Then, in order (D-29z199):** PERF-1b; PERF-16; OSS-LIC; PERF-2…15; SYS-1…3; STORE-2b…5 (paused); REVIEW-RECOMMENDATIONS; T12-ADVANCED.
- **If LATENCY-212 fails:** B plans a measured follow-up before PERF-1b; SABA-B-5 stays the open Medium.
- **Schedule:** the regression round is due on or after 2026-10-30. RETRO comes at round 215 or at the end of STUDIO-PERFORMANCE.
