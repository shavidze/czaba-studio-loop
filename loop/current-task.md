# CURRENT TASK — Round 120: T12 stage 4a — the waveform shows the clip's Clip Gain (display only)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned from 22:38:46 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-119.md` (copied before this file was overwritten; same size, 13834 bytes, and the same title. A `cmp` was not run before the overwrite). Rationale: `b-round-119.md`. Decision record: **D-29z85** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** one feature stage (T12 stage 4a). No bug is carried in: C round 119 PASS with 0 app bugs.
- **Baseline: clean commit `4090f6ea78317ebc331cd6add9c63d318ca4ab41`** (gate 119 `published`, rounds 118 + 119, both remotes). `git status --porcelain` is empty.
  - Frozen list: `tmp/studio-real-loop/b-round-119-r120-tree-sha256.txt`, 930 entries. That is every tracked file except the 2 granted tracked files in §2.
  - `sha256sum -c` gave OK at planning.

## 0. Why this round
- **Round 119 passed and is published.**
  - C round 119: PASS (`c-round-119.json`, `browserVerified: true`, `realVerified: true`).
  - Gate 119 published `4090f6e`.
  - So **T12 stage 3b is `c_pass_published`**, and C-R118-01 is closed.
- **The regression round is not due at this planning.**
  - `regression-last.json` = 2026-10-21. B planned at 2026-10-23 22:38 UTC, which is 2 days; the rule needs 3 or more.
  - The round-121 planning falls on or after 2026-10-24 UTC. **If round 120 passes C, round 121 is the REGRESSION round.**
  - **If round 120 fails C,** round 121 is the bounded fix-up first (the 116→117 / 118→119 pattern; a fix-up is not new scope). The regression round then runs at the next planning, on the published tree, so its results are not mixed with a known round-120 defect.
- **Nothing blocks new scope.** No Critical, High or Medium finding is open and reproducible in the cloud. The next scope in dependency order is **T12 V1 stage 4** (T12.27 item 8 + T12.19).
- **Stage 4 is split in two. The scope is unchanged and nothing is deferred:**
  - **4a (this round)** is T12.19: the waveform drawing shows the clip's real Clip Gain.
  - **4b (after the regression round)** is T12.18: a separate, view-only Waveform Vertical Zoom that never reaches the engine (Test 7). **T12.27 item 8 requires 4b, so 4a alone does not close stage 4 or V1.**
  - 4a adds one `scale` factor to `buildPeakShape`. 4b will multiply its zoom into that same factor. Together they match the spec formula `displayAmplitude = source × clipGainDisplayScale × waveformZoomScale`.

## 1. What changes (user-visible)
| # | Behaviour now | Behaviour after round 120 |
|---|---|---|
| 1 | A clip's waveform has the same height at any Clip Gain | The waveform height is the source peak × the clip's linear gain `10^(dB/20)`, clamped to the clip's height. At −6 dB it is about half as tall. At +3 dB it is about 1.41× as tall, and columns that reach the clip edge are cut there |
| 2 | — | During a Clip Gain fader drag (single or multi), the waveform follows the preview live. Undo restores the previous drawing |
| 3 | The detail panel's waveform ignores Clip Gain | The detail panel uses the same scale as the lane clip (one clip, one picture) |
| 4 | Track Volume, group Volume, Master, Pan, mute/solo, fades and the envelope do not change the waveform | **Unchanged** (must-not). Only Clip Gain scales the drawing (T12.19) |
| 5 | Audio | **Unchanged.** Nothing in the audio path changes. The display factor never reaches the engine or the export |

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | R1–R3:<br>• `buildPeakShape` gets a required 5th parameter `scale: number`.<br>• The lane call site passes `clipLinearGain(clip)` (import it from `~/lib/arrangement/model`).<br>• `clip.gainDb` joins the `useMemo` deps (l.306–309).<br>• Add `data-testid="arrangement-clip-waveform"` to the peak `<svg>` (l.841). |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | R4 **only**: the detail call site (l.191–197) passes `clipLinearGain(clip)` and adds `clip.gainDb` to the deps, plus the import. Nothing else in this file changes |
| `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` | **new**: §3.2 tests WG1–WG8 |
| `docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md` | **new** implementation doc (TEMPLATE.md sections, Georgian) |

- **`model.ts` is not edited.** `clipLinearGain` (l.523–525) already exists and is reused. `peaks.ts` is not edited either.
- **No existing test is granted.**
  - B's grep found no test that pins a peak `<path d>` string: `grep -rn "h1V\|svg path" app --include=*.test.*` hits only fade and envelope paths.
  - **A repeats this grep before editing** and records the result.
  - If an existing test breaks, A stops and reports it (§4).
- **Expected end state:**
  - ` M` for the 2 tracked files, and `??` for the 2 new files. Nothing else.
  - `sha256sum -c --quiet b-round-119-r120-tree-sha256.txt` is OK at the start and at the end.
- **Protected (unchanged; `git diff 4090f6e` on them is empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Use the Edit tool for edits,** so the primitives hook fires.
- **Before editing, read:**
  - `.claude/primitives-map.json` and `.claude/prompts/studio-feature.md`;
  - `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`;
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts, semicolons, no code comments, Tailwind tokens only.
- **Process rule (C-R119-01):** before touching any **untracked** file, A stores a copy of it under `a-round-120/` with its sha256. New files have no pre-edit copy.

## 3. A — behaviour rules and tests

### 3.1 Rules (D-29z85)
- **R1 — one display factor.**
  - In `buildPeakShape`, the column height is `Math.max(0.02, Math.min(1, max * s))`, where `s = Number.isFinite(scale) && scale >= 0 ? scale : 1`.
  - Apply the scale **before** the clamp.
  - These stay exactly as they are: the 0.02 floor, the 3-decimal `toFixed`, the column loop and the bucket mapping.
  - The fallback for a non-finite or negative `scale` is defensive and is tested. The UI cannot reach it, because `clipLinearGain` is always positive.
  - The shapes use the **raw** peaks. Do not normalize them (`normalizePeakColumns` is not used here), so the scale stays honest.
- **R2 — the factor is the clip's linear Clip Gain.**
  - Both call sites pass `clipLinearGain(clip)`: 1 when `gainDb` is undefined, otherwise `10^(gainDb/20)`.
  - Video clips have no `gainDb` (Clip Gain is audio-only), so their drawing is unchanged.
  - These are **not** part of the factor (must-not, §1 row 4): track/group Volume, Master, Pan, mute/solo, fades and the volume envelope.
- **R3 — live.**
  - The preview path already writes the gain into `history.present` (`previewClipGainFader` / `previewClipGainMembers`).
  - So adding `clip.gainDb` to the memo deps is enough for the drawing to follow a drag.
  - No new state, no new context API, no new effect.
- **R4 — the detail panel agrees with the lane.** It uses the same factor and the same raw peaks. Only its column count differs (480).
- **R5 — audio untouched.**
  - These files stay frozen and unchanged: `ArrangementContext.tsx`, `graph.client.ts`, `schedule.ts`, `export-wav*.ts` and `model.ts`.
  - The engine still gets exactly `clipLinearGain(clip)` through the existing `setClipGain` path.

### 3.2 New test file `clip-gain-waveform.test.tsx` (meaningful, exact)
**The WG1 fixture:** `peaks = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01])`, `sourceOffset 0`, `duration 0.05`, `columns 5` (one bucket per column).
- B computed these literals in node with `Float32Array` input.
- They are the exact expected `path` strings:

| Scale | Expected `path` |
|---|---|
| `1` | `M0 0.800h1V1.200h-1ZM1 0.500h1V1.500h-1ZM2 0.100h1V1.900h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z` |
| `10 ** (-6 / 20)` | `M0 0.900h1V1.100h-1ZM1 0.749h1V1.251h-1ZM2 0.549h1V1.451h-1ZM3 0.499h1V1.501h-1ZM4 0.980h1V1.020h-1Z` |
| `10 ** (3 / 20)` | `M0 0.717h1V1.283h-1ZM1 0.294h1V1.706h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z` |
| `10 ** (-60 / 20)` | `M0 0.980h1V1.020h-1ZM1 0.980h1V1.020h-1ZM2 0.980h1V1.020h-1ZM3 0.980h1V1.020h-1ZM4 0.980h1V1.020h-1Z` |
| `10 ** (24 / 20)` | `M0 0.000h1V2.000h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.842h1V1.158h-1Z` |

| ID | Asserts |
|---|---|
| WG1 | `buildPeakShape` on the fixture gives exactly the table rows (`toBe`), including the +3/+24 dB clamp and the −60 dB floor. A `scale` of `NaN`, `Infinity` or `-1` gives the scale-1 string |
| WG2 | **Pre-round pin.**<br>• Before editing, A runs the unmodified `buildPeakShape` on a second, realistic fixture: e.g. 300 buckets of a deterministic sine envelope, `sourceOffset 0.5`, `duration 2`, `columns 120`.<br>• A pins that literal output, or its sha256, in the test.<br>• After the change, `scale 1` must return it byte for byte.<br>• A records the pre-edit output in `a-round-120.md`. |
| WG3 | **Lane render** (the existing workspace harness with a fake decoded source).<br>• A clip at `gainDb -6`: `[data-testid="arrangement-clip-waveform"] path` `d` equals `buildPeakShape(peaks, offset, duration, columns, 10 ** (-6 / 20)).path`, **and** differs from the scale-1 string.<br>• A clip without `gainDb` equals the scale-1 string. |
| WG4 | **Live drag.**<br>• On a single clip, drag the Clip Gain fader −20 px (the stage-1 method) and keep the pointer down.<br>• **Before** pointerup, the lane `d` already equals the shape for the previewed dB (read the previewed value from the context).<br>• After release: one `Clip Gain` entry.<br>• Ctrl+Z restores the **exact** pre-drag `d` string. |
| WG5 | **Multi-clip.**<br>• Two audio clips at −6 and +3 (set via the context): each lane `d` uses its own factor.<br>• A multi drag (the stage-2 method) changes both drawings, and each still matches its own stored gain. |
| WG6 | **Detail panel.** With the clip selected at `gainDb -6`, the `[data-testid="arrangement-detail-waveform"] path` `d` equals `buildPeakShape(…, 480, 10 ** (-6 / 20)).path` |
| WG7 | **Must-not.** Each of these leaves the lane `d` byte-identical: track Volume −12 dB, group Volume, Master −12 dB, Pan, Mute/Solo, a fade-in, and one envelope breakpoint on the clip |
| WG8 | **Must-not (audio).** During a Clip Gain drag in playback:<br>• the fake graph's `setClipGain` receives exactly `10 ** (dB / 20)` for the previewed dB;<br>• `createBufferSource` is called 0 more times (the round-114 method). |

### 3.3 Mutations
A runs each one, and each must turn the named test red. Restore after each one and verify it by sha256.
- **m1:** remove `clip.gainDb` from the lane memo deps → WG4 red (stale drawing during the drag).
- **m2:** apply the scale after the clamp (`Math.min(1, max) * s`) → WG1 red (the +3/+24 dB rows exceed the clip).
- **m3:** pass `1` at the detail call site → WG6 red.
- **m4:** pass the dB value (or the squared linear gain) at the lane call site → WG3 red.

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on every changed or new file.
- `npx vitest run` on these files: `clip-gain-waveform`, `clip-gain-fader`, `clip-gain-multi`, `clip-gain`, `detail-panel`, `detail-panel-fit`, `detail-panel-polish`, `detail-panel-reason`, `clip-fades-ui`, `clip-envelope-ui`, `video-fades-ui`, `track-layout`, `render-budget`, `gesture-guard`, `gesture-reentry`, `grid-snap-clip-edges`, `peaks`, `track-volume-db`, `group-volume-db`, `master-ui`.
  - Every file in the list that exists must be green.
  - Report the counts, the pre-edit grep result, the WG2 pre-edit literal and the m1–m4 results.
- No full suite and no `npm run verify` (the gate runs them).
- **The code-reviewer is required** (4 files). Pass its Architecture note to B.
- **A's report `a-round-120.md`:**
  - start HEAD and frozen OK;
  - the diff summary per file;
  - the new test count;
  - the mutation results;
  - typecheck and lint results;
  - the reviewer verdict and Architecture note;
  - frozen OK at the end, and the end `git status`;
  - deviations.
- **A stops and reports (no edit; B rules) if:**
  - an existing test outside §2 turns red;
  - a WG1 literal does not match. A reports the received string and does not edit the literal to fit it. B derived the literal; this is the C-R118-01 lesson;
  - a needed change touches a frozen file.

## 5. C — rows
Use real Playwright Chromium with a fresh context per session, at 1440×900 and 1280×720.
- **Setup** (the same as round 119):
  - from the library, at the insert marker: `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2 s, `demo-soft-impact` on SFX @4 s;
  - Snap off; Stop state.
- **Harness rule (ENV-FIRST-LOAD-GRID-NULL):** if the job's first setup crashes before the grid control exists, discard that run as invalid and replace it once.
- **How to read the drawing:**
  - Parse `[data-clip-id=<id>] [data-testid="arrangement-clip-waveform"] path` `d` into per-column `y`; the height is `h = 1 − y`.
  - Compare readings only at the **same** zoom and clip width, so the column count is equal. If the counts differ, the row is invalid, not FAIL.
- **Ratio rule (every WG row cites it).** `s = 10^(dB/20)`, where dB is the value read from the field or valuetext; `h0` is the 0 dB reading of the same column.
  - **Judged:** a column with `0.021 ≤ h0 ≤ 0.999` and `0.021 ≤ s·h0 ≤ 0.999` must give `|h − s·h0| ≤ 0.0006 × (1 + s)`. This bound covers the 3-decimal rounding of both readings.
  - **Clamped:** `h0 ≤ 0.999` and `s·(h0 − 0.0005) ≥ 1` → the column reads exactly `y = 0.000`.
  - **Floor:** `s·(h0 + 0.0005) < 0.02` → the column reads exactly `y = 0.980`.
  - Any other column is not judged. Floor columns at 0 dB (`h0 = 0.020`) are never judged as ratios.
  - At least 10 judged columns are needed, or the row is invalid (not FAIL).
  - B checked this rule in node against the real formula with `toFixed(3)`: 927,232 judged columns across 10 gains from −60 to +24 dB, 0 violations.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T120-TARGETED** | A's vitest list (§4) | Green, with the same counts as A |
| **AN-REVIEW** | `git diff 4090f6e` on the 2 granted files; read the new test and doc 102 | ArrangementClip: only the `scale` parameter, the clamp line, the call site, the memo deps, the import and the `data-testid`. DetailPanel: only the call site, the deps and the import. WG1–WG8 exist and assert §3.2 with exact matchers. Doc 102 has the TEMPLATE sections |
| **SOURCE-SCOPE** | `git status`, `sha256sum -c b-round-119-r120-tree-sha256.txt`, protected hashes | The §2 end state exactly. The frozen list is OK. The protected hashes are unchanged, and `git diff 4090f6e` on them is empty |
| **WG-SCALE** (both viewports) | Select the stems clip and read `d` at 0 dB. Set Clip Gain to −6.0 (field, Enter) and read `d`. Then set +3.0 and read `d` | The ratio rule holds at −6 (`s = 0.501187`) and at +3 (`s = 1.412538`). Screenshots of the 0 / −6 / +3 states |
| **WG-CLAMP-FLOOR** (1440) | Clip Gain +12.0, then −60.0 | At +12 (`s = 3.981072`): the ratio rule, including its clamped columns, and no column goes past the clip (`y ≥ 0`, `1 + h ≤ 2`). At −60: every column reads `y = 0.980` |
| **WG-LIVE** (both) | Clip Gain fader: press, move −20 px, sample `d` **before** release, release, then Ctrl+Z | The mid-drag `d` already differs from the start and matches the previewed dB (the ratio rule, with `s` from the valuetext read at the same moment). After release: one `Clip Gain` entry. After Ctrl+Z: `d` equals the start string exactly |
| **WG-DETAIL** (1440) | Stems clip at −6.0; read `[data-testid="arrangement-detail-waveform"] path` | The ratio rule (`s = 0.501187`) against the detail's own 0 dB reading |
| **WG-MULTI** (1440) | Select the stems + SFX clips. Set stems −6 and SFX 0 with the field (one clip at a time), then select both and multi-drag −10 px | Each lane drawing follows its own stored gain (the ratio rule per clip, against each clip's 0 dB reading) |
| **WG-MUSTNOT** (1440) | With the stems clip at −6: change the stems lane Volume (−12 dB), Master (−12 dB), Pan, Mute and Solo; add a fade-in; add one envelope breakpoint | The stems `d` stays byte-identical after each action |
| **WG-PLAY** (1440) | Play; drag Clip Gain during play | The waveform follows. 0 new `createBufferSource` (the round-114 method). The position keeps advancing |
| **WG-AUDIO** (1440, neighbour) | Export WAV with the stems clip at 0 and at −6.0 dB (the round-114 G-T2 isolation) | Peak and RMS ratio `0.501187 ± 0.5 %`, unchanged from round 114: the display change did not touch the audio |
| **WG-VIDEO** (1440) | Video clip (the round-116 video fixture) | Its drawing (if any) and its disabled Clip Gain state are unchanged |
| **G120-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise |

- **Neighbours that could break:**
  - clip gestures on the waveform area: one move and one range drag on the stems clip at 1440, with the clip at −6;
  - the fade ramps and the envelope line still draw over the scaled waveform (screenshot);
  - one zoom in and one zoom out: the drawing keeps its scale at the new column count.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** the scale also changes the audio; a history entry is lost or added; a wrong ratio in the drawing; or the drawing does not follow a drag (the feature does not work).
  - **Low:** a clamp or floor off by one rounding step.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Clip Gain is a dB control on the clip | Live 12 Reference Manual §8.4.7 "Clip Gain and Pitch", https://www.ableton.com/en/live-manual/12/clip-view/. B capture `b-round-119/ableton-clip-view-20261023.txt` (curl, 2026-10-23) | Confirmed: "The Gain slider, calibrated in dB, changes the clip gain" | Unchanged (stages 1–2) | — |
| The waveform drawing reflects Clip Gain | Live 12 §6.1 "Layout" (capture `b-round-71/ableton-arrangement-view-20261021.txt`): the Vertical Zoom slider is "useful for highlighting transients and waveform details **without having to adjust the clip gain**" | **დასკვნა (inference)**, not stated: the sentence implies that clip gain changes the drawn size, but the manual does not describe the scale | The drawing is the source peak × the linear gain (T12.19 formula) | WG-SCALE |
| The scale is linear amplitude and clamps at the clip edge | not stated | **დაუდასტურებელი** | Linear `10^(dB/20)`, clamped to the clip height; the 0.02 floor is kept | WG-SCALE, WG-CLAMP-FLOOR |
| Track Volume does not change the clip drawing | not stated | **დაუდასტურებელი** | Only Clip Gain scales the drawing (T12.19 names Clip Gain only) | WG-MUSTNOT |
| A separate Waveform Vertical Zoom for all audio tracks | §6.1 (same capture) | Confirmed: a slider, "applied to all audio tracks in the Arrangement" | **Stage 4b**, after the regression round (not this round) | — |

- `ableton-notes-source.txt` stays **დაუდასტურებელი**. ABLETON-EXPERT-REVIEW checks the inference and the unconfirmed rows after T12 V1.
- C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- **C writes** `c-round-120.md` and `c-round-120.json`, with the fields `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. Evidence goes under `c-round-120/{tools,out,shots}/`. Write as you go.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- Inconclusive rows are listed as inconclusive, never under `passed`.
- Consult only the read-only agents in your list. C makes no `store/` writes.

## 8. Outcome
- **C PASS:** T12 stage 4a → `c_pass`. Publication makes it `c_pass_published`. Stage 4 is **not** complete until 4b passes.
- **Next planning (on or after 2026-10-24 UTC) after a C PASS:** the **REGRESSION round**. Then T12 stage 4b (Waveform Vertical Zoom, Test 7), then ABLETON-EXPERT-REVIEW.
- **C FAIL:** findings with severity. B plans the bounded fix-up first. The regression round follows at the next planning, on the published tree.

## 9. Root / architecture (not A's work)
- No new checkpoint request. Stage 4a does not touch the Volume machine or the fader hook.
- Any reviewer Architecture note becomes an addendum to the pending request (`b-round-91-checkpoint-request.md`).
