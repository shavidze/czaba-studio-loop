# CURRENT TASK — Round 121: T12 stage 4b — Waveform Vertical Zoom (view only; T12.18 + Test 7)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned from 23:26:24 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-120.md`. It was copied before this file was overwritten, and `cmp` reported the copy identical (22282 bytes). Rationale: `b-round-120.md`. Decision record: **D-29z86** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** one feature stage (T12 stage 4b). No bug is carried in, because C round 120 passed with 0 app bugs.
- **Baseline: clean commit `0a75ba8757617695d19e0b2a4aaad713bc30c01c`** (gate 120 `published`, both remotes). `git status --porcelain` is empty.
  - Frozen list: `tmp/studio-real-loop/b-round-120-r121-tree-sha256.txt`, 931 entries. That is every tracked file except the 3 granted tracked files in §2.
  - `sha256sum -c` gave OK at planning.
- **Browser baseline (B, taken on this clean tree):** `tmp/studio-real-loop/b-round-120/probe/baseline-r121.json`, with screenshots `baseline-{1440,1280}.png`. It holds the chrome row heights, the lane y positions and the sha256 of every clip's waveform `d` at 1×, at both viewports, using the C setup and the video below.

## 0. Why this round (D-29z86)
- **Round 120 passed and is published.**
  - C round 120: PASS (`c-round-120.json`, `browserVerified: true`, `realVerified: true`, 0 bugs).
  - Gate 120 published `0a75ba8`.
  - So **T12 stage 4a is `c_pass_published`**.
- **The regression round is not due at this planning.** This changes the round-120 §0/§8 forecast, which assumed planning would happen on or after 2026-10-24.
  - `regression-last.json` = 2026-10-21. B planned at 2026-10-23 23:26:24 UTC, which is 2 days; the rule needs 3 or more.
  - So the next dependency-ordered scope comes first: **stage 4b**. It closes T12 V1 (T12.27 item 8).
  - **Round 122 planning is the REGRESSION round in any case.** It falls on or after 2026-10-24, which is 3 or more days, and V1 is then complete, so the regression round covers it.
  - **If round 121 fails C,** the bounded fix-up comes first (the 116→117 / 118→119 pattern). The regression round then runs at the next planning, on the published tree.
- **Nothing blocks new scope.** No Critical, High or Medium finding is open and reproducible in the cloud.
- **Sources:**
  - T12.18 ("Waveform Vertical Zoom is NOT Gain"; two separate states, `clipGainDb` and `waveformZoom`);
  - T12.19 (`displayAmplitude = source × clipGainDisplayScale × waveformZoomScale`; "`waveformZoomScale` never reaches the audio engine");
  - T12.26 Test 7 ("100% → 200%: waveform visually larger; audio samples unchanged; meter output unchanged").
  - All are in `docs/technical/studio-real-workspace/next-stage-t12/gain-volume-source.txt` l.615–672 and l.972–986.

## 1. What changes (user-visible)
| # | Behaviour now | Behaviour after round 121 |
|---|---|---|
| 1 | No way to enlarge the waveform drawing without changing Clip Gain | A **Waveform Zoom** control appears in the grid row, after `Env`. It has the steps `½× 1× 2× 4× 8×` (50–800 %), and the default is `1×` |
| 2 | — | The zoom multiplies the drawing of **every audio clip on every lane**, together with Clip Gain: `peak × 10^(gainDb/20) × zoom`, clamped to the clip height, with the 0.02 floor kept. Audio clips added later are drawn at the current zoom too |
| 3 | — | **Video clips' drawing is unchanged** (the manual says "audio clips"). **The detail panel is unchanged** (the manual says "in the Arrangement"; the panel keeps showing the true clip level) |
| 4 | — | **View only.** No audio, export, meter or schedule change. Not an Undo/Redo entry, and not stored in the arrangement. It is per session: a reload returns to `1×`. A status line confirms the change: `Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება.` |
| 5 | Grid row: Snap, division, Env | The same three controls, unchanged, plus the zoom control. **The chrome row heights and the lane positions are unchanged** |

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/waveform-zoom.ts` | **new** pure module (R1). |
| `app/components/arrangement/ArrangementClip.tsx` | R2.<br>• An **optional** prop `waveformZoom?: number`, default `1`, on `ArrangementClipViewProps`.<br>• The peak memo's scale becomes `clipWaveformScale(clip, isVideo, waveformZoom)` instead of `clipLinearGain(clip)`.<br>• The memo must recompute when the clip's gain, `isVideo` or the zoom changes. Use the form Biome's `useExhaustiveDependencies` accepts; the round-120 `gainScale` form is fine.<br>• `buildPeakShape` itself is **not** changed (signature, clamp and floor). |
| `app/components/arrangement/ArrangementLane.tsx` | R2 pass-through **only**:<br>• an optional `waveformZoom?: number` prop, default `1`;<br>• it is forwarded to `<ArrangementClipView waveformZoom={…}>`.<br>Nothing else changes. |
| `app/components/arrangement/StudioWorkspace.tsx` | R3:<br>• one view state, `waveformZoom` (`useState(1)`);<br>• the change handler, with its status text;<br>• the `<select>` control as the **last** child of `[data-testid="arrangement-grid-control"]`;<br>• `data-waveform-zoom={waveformZoom}` on that grid-control element;<br>• `waveformZoom={waveformZoom}` passed to every `<ArrangementLane>`.<br>Nothing else changes. |
| `app/lib/arrangement/__tests__/waveform-zoom.test.tsx` | **new**: §3.2 tests WZ1–WZ9 |
| `docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md` | **new** implementation doc (the TEMPLATE.md sections, in Georgian) |

- **Frozen and must stay byte-identical:**
  - `ArrangementDetailPanel.tsx`, `ArrangementContext.tsx`, `model.ts`, `peaks.ts`;
  - `graph.client.ts`, `schedule.ts`, `export-wav*.ts`;
  - `clip-gain-waveform.test.tsx`, and every other test.
- **No existing test is granted.**
  - B checked that `ArrangementLane` / `ArrangementClipView` are rendered directly only in `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `gesture-guard.test.tsx`, `gesture-reentry.test.tsx` and `grid-snap-ui.test.tsx`. That is why both new props are **optional with default 1**.
  - No test pins tab order (no `.tab(` / `{Tab}`), and no test counts the grid-control children or comboboxes. `grid-snap-ui.test.tsx:387` checks that the **transport toolbar** has no `select`, so **the new select must not be placed in the transport toolbar**.
  - **A repeats these greps before editing** and records the result. If an existing test breaks, A stops and reports (§4).
- **Expected end state:**
  - ` M` for the 3 tracked files;
  - `??` for the 3 new files;
  - nothing else.
  - `sha256sum -c --quiet b-round-120-r121-tree-sha256.txt` is OK at the start and at the end.
- **Protected (unchanged; `git diff 0a75ba8` on them is empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Edit rule (tightened after C-R120-01):**
  - **Every lasting edit uses the Edit or Write tool**, so the primitives hook fires. That includes formatting fixes in new files.
  - Shell string replaces are allowed **only** for temporary mutations. Each one is restored from a copy, and the restore is verified by sha256.
  - A lists every shell write in its report.
- **Before editing, read:**
  - `.claude/primitives-map.json` and `.claude/prompts/studio-feature.md`;
  - `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md` (for the reason state stays in the workspace and not in the context);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts (also no `as const`), semicolons, no code comments, Tailwind tokens only.
- **Process rule (C-R119-01):** before touching any **untracked** file, A stores a copy of it under `a-round-121/` with its sha256.

## 3. A — behaviour rules and tests

### 3.1 Rules (D-29z86)
- **R1 — `waveform-zoom.ts` (pure, exported names exactly as below):**
  - `WAVEFORM_ZOOM_LEVELS: readonly number[] = [0.5, 1, 2, 4, 8]`; `WAVEFORM_ZOOM_DEFAULT = 1`.
  - `waveformZoomLabel(level: number): string`. It returns `'½×'`, `'1×'`, `'2×'`, `'4×'` or `'8×'` for the listed levels.
  - `waveformZoomPercent(level: number): number`, which is `Math.round(level * 100)`.
  - `parseWaveformZoom(value: string): number | null`. It returns the level only when `Number(value)` is **exactly one of the listed levels**; anything else gives `null`.
  - `waveformZoomStatus(level: number): string`. It returns exactly `` `Waveform Zoom ${waveformZoomPercent(level)}% — მხოლოდ ხედი, ხმა არ იცვლება.` ``
  - `clipWaveformScale(clip: ArrangementClip, isVideo: boolean, zoom: number): number`. It returns `clipLinearGain(clip) * z` for audio clips and `clipLinearGain(clip)` for video clips. Here `z = Number.isFinite(zoom) && zoom > 0 ? zoom : 1`.
- **R2 — the drawing.**
  - Lane clips use `buildPeakShape(peaks, clip.sourceOffset, clip.duration, peakColumns, clipWaveformScale(clip, isVideo, waveformZoom))`.
  - Because the product reaches the existing pre-clamp `scale` parameter, the 1.0 clamp and the 0.02 floor apply to the combined factor.
  - **At `1×`, every drawing is byte-identical to round 120.**
- **R3 — the control (`StudioWorkspace.tsx`).**
  - The element is `<select data-testid="arrangement-waveform-zoom">`. It has one `<option value={String(level)}>` per level, and the option text is `waveformZoomLabel(level)`.
  - `aria-label="Waveform Zoom — მხოლოდ ხედი, ხმა არ იცვლება"`.
  - `title={`Waveform Zoom ${percent}% — მხოლოდ ხედი, ხმა არ იცვლება`}`.
  - **Classes:**
    - the same classes as the grid-division select;
    - plus `appearance-none`, so it fits the 224 px header (B measured 28 px wide, ending at x = 210 ≤ 216);
    - plus the accent classes the Snap and Env toggles use when it is not `1×` (`border-accent bg-accent/20 text-accent`).
  - **On change:**
    - parse the value with `parseWaveformZoom`, and ignore `null`;
    - set the state;
    - `setStatus(waveformZoomStatus(level))`.
  - **Must not:**
    - add a context API;
    - call `commitArrangement`, `previewArrangement` or any history call;
    - write to `localStorage`;
    - change the select's keyboard behaviour. `isTypingTarget` already treats a focused select as typing, so workspace shortcuts are skipped.
- **R4 — the audio is untouched.** The zoom is never in the arrangement, so it can never reach `scheduleKey`, the graph, the meters or the export. These files stay frozen: `ArrangementContext.tsx`, `graph.client.ts`, `schedule.ts`, `export-wav*.ts`, `model.ts`.
- **R5 — the layout is unchanged.**
  - The grid row stays 28 px tall, and the control stays inside the 224 px header with no overflow.
  - Nothing is added to the transport toolbar, the tempo row, the marker row or the loop row.

### 3.2 New test file `waveform-zoom.test.tsx` (meaningful, exact)
**The WZ1 fixture:** the round-120 WG1 fixture, `peaks = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01])`, `sourceOffset 0`, `duration 0.05`, `columns 5`.
- B computed these literals in node with `Float32Array` input, using the real formula. They are in `b-round-120/literals.txt`.
- They are the exact expected `buildPeakShape(…, scale).path` strings:

| Scale | Expected `path` |
|---|---|
| `0.5` | `M0 0.900h1V1.100h-1ZM1 0.750h1V1.250h-1ZM2 0.550h1V1.450h-1ZM3 0.500h1V1.500h-1ZM4 0.980h1V1.020h-1Z` |
| `2` | `M0 0.600h1V1.400h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z` |
| `4` | `M0 0.200h1V1.800h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.960h1V1.040h-1Z` |
| `8` | `M0 0.000h1V2.000h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.920h1V1.080h-1Z` |
| `10 ** (-6 / 20) * 2` (= 1.0023744672545445) | `M0 0.800h1V1.200h-1ZM1 0.499h1V1.501h-1ZM2 0.098h1V1.902h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z` |
| `10 ** (-60 / 20) * 8` | `M0 0.980h1V1.020h-1ZM1 0.980h1V1.020h-1ZM2 0.980h1V1.020h-1ZM3 0.980h1V1.020h-1ZM4 0.980h1V1.020h-1Z` |

| ID | Asserts |
|---|---|
| WZ1 | **Module, exact.**<br>• `buildPeakShape(WZ1, 0, 0.05, 5, clipWaveformScale(clip, false, zoom)).path` equals the table rows, for: zoom 0.5/2/4/8 on a clip without `gainDb`; `gainDb −6` × zoom 2; `gainDb −60` × zoom 8.<br>• `clipWaveformScale` returns exactly `10 ** (-6 / 20) * 2` (`toBe`) for −6 dB × 2.<br>• A **video** clip at zoom 8 returns `1`.<br>• A zoom of `NaN`, `0`, `-1` or `Infinity` returns `clipLinearGain(clip)`.<br>• `parseWaveformZoom`: `'2'` gives `2`, `'0.5'` gives `0.5`; `'3'`, `''`, `'abc'` and `'Infinity'` give `null`.<br>• `waveformZoomLabel` / `waveformZoomPercent` / `waveformZoomStatus` give the R1 strings for each level (`toBe`). |
| WZ2 | **Lane render.**<br>• Use the workspace harness with a non-zero fake decoded source (as in round 120 WG3), with two audio clips on two lanes.<br>• `fireEvent.change` the `arrangement-waveform-zoom` select to `'2'`. Then:<br>&nbsp;&nbsp;– each lane `[data-testid="arrangement-clip-waveform"] path` `d` equals `buildPeakShape(…, clipLinearGain(clip) * 2).path`, and differs from its `1×` string;<br>&nbsp;&nbsp;– the grid control has `data-waveform-zoom="2"`;<br>&nbsp;&nbsp;– the select value is `'2'`;<br>&nbsp;&nbsp;– the status text equals `waveformZoomStatus(2)`.<br>• Back to `'1'`: every `d` equals its pre-change string exactly. |
| WZ3 | **Composition.** A clip at `gainDb −6` (set via the context) at `2×` draws `buildPeakShape(…, 10 ** (-6 / 20) * 2)`. That differs from both the gain-only and the zoom-only strings. A Clip Gain drag at `2×` (the round-120 WG4 method) keeps `d` equal to the shape for the previewed dB × 2 **before** pointerup. |
| WZ4 | **Must-not: video.** A video clip's lane `d` is byte-identical at `1×` and `8×` (use the round-116/120 video harness) |
| WZ5 | **Must-not: detail panel.** With an audio clip selected, `[data-testid="arrangement-detail-waveform"] path` `d` is byte-identical at `1×` and `4×` |
| WZ6 | **Not history.**<br>• Make one edit (Clip Gain −6) and record the Undo control's title/label and its disabled state, and the Redo state.<br>• Change the zoom to `4×`: the Undo/Redo title and state are identical.<br>• Ctrl+Z undoes the **−6 edit** (the gain is back to 0), and the zoom stays `4×` (select value and `data-waveform-zoom`).<br>• Ctrl+Shift+Z / Redo brings back −6, and the zoom is still `4×`. |
| WZ7 | **Not audio.**<br>• `api.getArrangement()` is the **same reference** before and after a zoom change.<br>• During playback, a zoom change creates **0** `createBufferSource` calls and **0** `setClipGain` calls on the fake graph (the round-114/120 method), and the position keeps advancing. |
| WZ8 | **New clips.** At `2×`, add an audio clip from the library (the round-120 harness path). Its lane `d` uses × 2 from the first render. |
| WZ9 | **Keys on the focused select.**<br>• With a clip selected and the zoom select focused, `fireEvent.keyDown` of `ArrowLeft`, `ArrowRight`, `Delete` and `Space` on the select:<br>&nbsp;&nbsp;– the clip start, the clip count, the playing state and the Undo title are all unchanged (`isTypingTarget` guard).<br>• A grid-division select `Digit1` still narrows the grid, as before (neighbour). |

### 3.3 Mutations
A runs each one, and each must turn the named test red. A restores after each one and verifies the restore by sha256.
- **m1:** `clipWaveformScale` applies the zoom to video too → WZ1 (video case) and WZ4 red.
- **m2:** the lane passes `waveformZoom` as `1` to `ArrangementClipView` → WZ2 red.
- **m3:** `clipWaveformScale` returns `z` only (gain dropped) → WZ1 and WZ3 red.
- **m4:** `parseWaveformZoom` accepts any finite positive number → WZ1 red.
- **m5:** the peak memo does not recompute on a zoom change (zoom missing from what the memo depends on) → WZ2 red.

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on every changed or new file.
- `npx vitest run` on these files: `waveform-zoom`, `clip-gain-waveform`, `clip-gain-fader`, `clip-gain-multi`, `clip-gain`, `detail-panel`, `detail-panel-fit`, `clip-envelope-ui`, `clip-fades-ui`, `video-fades-ui`, `track-layout`, `render-budget`, `gesture-guard`, `gesture-reentry`, `grid-snap-ui`, `grid-snap-keys`, `grid-snap-menu`, `grid-musical-ui`, `grid-triplet-ui`, `tempo-ui`, `marker-time-snap-ui`, `track-header-stacking`, `track-groups-ui`, `peaks`.
  - Every file in the list that exists must be green.
  - Report the counts, the pre-edit grep results, and the m1–m5 results.
- No full suite and no `npm run verify` (the gate runs them).
- **The code-reviewer is required** (6 files). Pass its Architecture note to B.
- **A's report `a-round-121.md`:**
  - start HEAD and frozen OK;
  - the diff summary per file;
  - the new test count;
  - the mutation results;
  - typecheck and lint results;
  - the reviewer verdict and Architecture note;
  - **every shell write**;
  - frozen OK at the end, and the end `git status`;
  - deviations.
- **A stops and reports (no edit; B rules) if:**
  - an existing test outside §2 turns red;
  - a WZ1 literal does not match. A reports the received string and does not edit the literal to fit it;
  - the control cannot fit the header without changing another control or the row height;
  - a needed change touches a frozen file.

## 5. C — rows
Use real Playwright Chromium with a fresh context per session, at 1440×900 and 1280×720.
- **Setup** (the same as rounds 119–120 and as B's baseline):
  - from the library, at the insert marker: `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2 s, `demo-soft-impact` on SFX @4 s;
  - then `media/beeps-6s-vp9-opus.webm` as the video (C round-120 `loadVideo`);
  - Snap off; Stop state.
- **Harness rule (ENV-FIRST-LOAD-GRID-NULL):** if the job's first setup crashes before the grid control exists, discard that run as invalid and replace it once.
- **How to read the drawing and the ratio rule:** the same as round 120 §5 (`tasks/round-120.md`).
  - `s` is the zoom, or the gain × the zoom.
  - `h0` is the reading at `1×` and 0 dB, at the **same** horizontal zoom and clip width.
  - Judged columns: `|h − s·h0| ≤ 0.0006 × (1 + s)`. Clamped columns read exactly `y = 0.000`. Floor columns read exactly `y = 0.980`.
  - At least 10 judged columns are needed, or the row is invalid (not FAIL).
- **Baseline file:** compare against `b-round-120/probe/baseline-r121.json` (the B pre-round reading on `0a75ba8`). At `1×` and 40 px/s:
  - video `be86af38…`;
  - music `43e96d8a…`;
  - stems `9fa65c46…`;
  - sfx `e1890358…`;
  - chrome rows `[28, 20, 20, 16]`;
  - lane y at 1440: video 275 / music 356 / stems 437 / sfx 518;
  - lane y at 1280: video 313 / music 374 / stems 454 / sfx 534.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T121-TARGETED** | A's vitest list (§4) | Green, with the same counts as A |
| **AN-REVIEW** | `git diff 0a75ba8` on the 3 granted files; read the new module, the test and doc 103 | ArrangementClip: only the optional prop, its default and the scale source. Lane: only the prop and the pass-through. StudioWorkspace: only the state, the handler, the select, the `data-waveform-zoom` attribute and the lane prop. The module matches R1. WZ1–WZ9 exist with exact matchers, and the WZ1 literals are unchanged from §3.2. Doc 103 has the TEMPLATE sections. **List every shell write A reports** |
| **SOURCE-SCOPE** | `git status`, `sha256sum -c b-round-120-r121-tree-sha256.txt`, protected hashes | The §2 end state exactly. The frozen list is OK, including `ArrangementDetailPanel.tsx` `87c878e5…`. The protected hashes are unchanged |
| **WZ-PRESENT** (both viewports) | Load and set up; read the grid control | The select is the last child, shows `1×` and `data-waveform-zoom="1"`, ends ≤ 216 px from the grid-control's left, and the grid control does not overflow (`scrollWidth ≤ clientWidth`). The chrome rows and the lane y equal the baseline. **At `1×`, all four `d` sha256 equal the baseline.** Screenshot |
| **WZ-T7** (both; **Test 7**) | Choose `2×` with a REAL mouse (open the select and pick the option; keyboard if the native popup cannot be driven, labelled) | Music, stems and SFX each pass the ratio rule with `s = 2`, with clamped columns at `y = 0.000` and no column past the clip (`1 + h ≤ 2`). The video `d` sha is unchanged. The detail-panel `d` (stems selected) is unchanged. Status = `Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება.` The chrome rows and the lane y are unchanged. Screenshots at 1× and 2× |
| **WZ-LEVELS** (1440) | `½×`, `4×`, `8×`, then `1×` | The ratio rule at each level (`s` = 0.5 / 4 / 8; at 8×, ≥ 10 judged columns on the music clip, or the row is invalid). Back at `1×`: all four `d` sha256 equal the baseline |
| **WZ-GAIN** (1440) | Stems Clip Gain −6.0 (field, Enter), zoom `2×`; then a fader press-drag −20 px, sampling before release | At rest: the ratio rule with `s = 1.002374`. Mid-drag: `s = 10^(dB/20) × 2`, with dB from the valuetext. After release: one `Clip Gain` entry |
| **WZ-HISTORY** (1440) | Record the Undo title. Choose `4×`. Read the Undo title. Ctrl+Z, then Ctrl+Shift+Z | The Undo title is identical before and after the zoom change. Ctrl+Z undoes the last **edit** (not the zoom), and the zoom stays `4×`. Redo restores the edit, and the zoom is still `4×` |
| **WZ-AUDIO** (1440; Test 7 "audio samples unchanged") | Only stems audible (the round-114/120 isolation). Export WAV at `1×` and at `2×` | The same frames and header. Max \|Δ\| ≤ 1 LSB at 24-bit (HR-C-R84-L1). Peak ratio and RMS ratio `1.0000 ± 0.0001`. 0 NaN |
| **WZ-METER** (1440; Test 7 "meter output unchanged") | Music and SFX muted. A loop over stems 2.5–4.5 s. Play; at `1×` record the **per-iteration** peak of the real output tap (the round-120 `tap`) for 2 iterations; choose `2×` during play; record 2 more iterations | Per-iteration output peak at 2× = at 1×, within ±0.1 dB (a paired comparison, C-R82-LIVE-ORACLE-PAIRED). The `createBufferSource` count per iteration is the same before and after the change. The playhead keeps looping and never stops. Record the stems meter readout too, if it is exposed |
| **WZ-NEWCLIP** (1440) | At `2×`, add `demo-soft-impact` to SFX @8 s. Then choose `1×` and read it again | The new clip's `2×` drawing passes the ratio rule against its own `1×` reading |
| **WZ-KEYS** (1440) | Select the stems clip, then focus the zoom select. Press ArrowDown, ArrowUp, ArrowLeft, Delete; also Space if Chromium does not open the popup (labelled) | Arrow keys may change the zoom (native select), and the drawing follows. The clip start, the clip count and the Undo title are unchanged. Transport is not started by Space. No clip is deleted |
| **WZ-RELOAD** (1280) | Choose `4×`, then reload | After reload the control shows `1×` and `data-waveform-zoom="1"` (session-only, by design) |
| **G121-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise |

- **Neighbours that could break (1440, one check each):**
  - At `2×`: one horizontal zoom in and one zoom out. The ratio rule holds at each new column count.
  - At `2×`: a clip header move, then Undo. The zoom is unaffected.
  - The Snap toggle and the grid-division select still work. The `Env` toggle still works, and the fade ramp and the envelope line draw over the zoomed waveform (screenshot).
  - At 1280, the 1280 lane fit (`laneH` 61/80) is unchanged.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** the zoom changes the audio, the export or the meters; the zoom is an Undo entry or is undone by Ctrl+Z; the drawing ratio is wrong; the control shifts the chrome or the lanes; video or the detail panel scale.
  - **Low:** a clamp or floor off by one rounding step; status or title wording.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A separate control enlarges the waveform display without changing clip gain | Live 12 Reference Manual §6.1 "Layout", https://www.ableton.com/en/live-manual/12/arrangement-view/. B capture `b-round-71/ableton-arrangement-view-20261021.txt` (2026-10-21; text re-read on 2026-10-23) | **Confirmed:** "You can enlarge the waveform display in audio clips using the Waveform Vertical Zoom Level slider. This is useful for highlighting transients and waveform details without having to adjust the clip gain." | A zoom control, view only. It multiplies Clip Gain in the drawing (T12.19 formula) | WZ-T7, WZ-AUDIO |
| It applies to all audio tracks, including new clips | §6.1, same capture | **Confirmed:** "The zoom level is applied to all audio tracks in the Arrangement, as well as new clips as they are recorded." | One global level for every audio clip on every lane, including clips added later | WZ-T7, WZ-NEWCLIP |
| Audio clips only (not video) | §6.1 says "audio clips" | Confirmed wording. Video in Live is not tested | Video clips are not zoomed | WZ-T7 (video sha) |
| A continuous slider, its range and its location | not stated (no range or position in the text) | **დაუდასტურებელი** (unconfirmed) | **Deliberate CZABA difference:** a stepped select `½×–8×` in the 224 px grid row. The user spec (T12.18) asks for increase **or decrease**, so `½×` exists; Live's text says only "enlarge" | WZ-PRESENT, WZ-LEVELS |
| The zoom is not an Undo step | not stated | **დასკვნა** (inference): a view setting. Unconfirmed | Not in history | WZ-HISTORY |
| The Clip View / detail display also zooms | not stated | **დაუდასტურებელი** | The detail panel is **not** zoomed. It shows the true clip level, and the manual names the Arrangement | WZ-T7 (detail sha) |

- C rates "CZABA requirement met" and "Ableton correspondence" separately.
- The unconfirmed rows go to ABLETON-EXPERT-REVIEW.

## 7. Evidence and reporting
- **C writes** `c-round-121.md` and `c-round-121.json`, with the fields `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. Evidence goes under `c-round-121/{tools,out,shots}/`. Write as you go.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- Inconclusive rows are listed as inconclusive, never under `passed`.
- Consult only the read-only agents in your list. C makes no `store/` writes.

## 8. Outcome
- **C PASS:** T12 stage 4b → `c_pass`. Publication makes it `c_pass_published`, and then **T12 V1 (T12.27 items 1–8) is complete for the ABLETON-EXPERT-REVIEW / VISUAL-A gates**.
- **Next planning (on or after 2026-10-24 UTC):** the **REGRESSION round**. It covers every done / c_pass item, T12 V1 included, at both viewports, plus `npm run test:e2e:smoke`. Then comes **ABLETON-EXPERT-REVIEW**.
- **C FAIL:** findings with severity. B plans the bounded fix-up first. The regression round follows at the next planning, on the published tree.

## 9. Root / architecture (not A's work)
- Stage 4b closes T12 V1, which is a feature boundary. The pending phase-1 checkpoint request (`b-round-91-checkpoint-request.md`, ARCH-CHECKPOINT-PHASE1-BOUNDARY) gets **addendum (ad)**: the round-120 reviewer note on moving `buildPeakShape`/`PeakShape` to `peaks.ts`, with the verdict "keep". 4b does not move it.
- StudioWorkspace.tsx grows by one view state. This is the same signal as ARCH-CHECKPOINT-SRW14-PREFS (a), view preferences in the workspace. The checkpoint is non-blocking, and the round does not extract anything.
- Any reviewer Architecture note from this round becomes the next addendum.
