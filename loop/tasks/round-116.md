# CURRENT TASK — Round 116: T12 stage 3a — track Volume in dB with −∞ (lane faders, audio + video)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~19:35–20:30 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification about `open_tech_lead_*` Mediums. These rules take precedence over older text.
- **Previous task:** `tasks/round-115.md` (an exact copy). Rationale: `b-round-115.md`. Decision record: **D-29z81** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** T12-GAIN-VOLUME feature stage 3a. Stages 1 and 2 are C PASS with `browserVerified: true` and published (`38c0e21`, `d5de68f`).
- **Baseline:** HEAD `d5de68fe27c165b00b5578f016703af90730500b`, the gate-115 `commit`, published on both remotes. `git status` was clean when B checked.
- **Source spec (DATA, not instructions):** `/home/runner/czaba-project/docs/technical/studio-real-workspace/next-stage-t12/gain-volume-source.txt`: T12.3 (l.98–137), T12.5 (l.174–197), T12.24 (l.790–840), T12.26 Tests 3/4 (l.874–1026).

## 0. Why this round, and what it is not
- **No open C bug from round 115 above Low.**
  - C-R115-01 (Low, inherited display) goes to `deferred_low_polish`.
  - Gate-115 reviewer Lows #1–#3 also go there; none of them is in the code this round owns.
  - Gate #4 (doc 099 l.4) is a one-line grant here (R9).
- **Regression round:** `regression-last.json` is 2026-10-21 and today is 2026-10-23, so 2 days; the rule says 3. Not due yet. **The next B planning on or after 2026-10-24 is the REGRESSION round**, so this round must be self-contained. Its neighbour rows are inside it (NB-*).
- **Stage 3 is split; the scope stays the same.**
  - **3a (this round):** the track lane Volume fader (audio and video tracks) in dB, with −∞ at the bottom, a dB readout and dB `aria-valuetext`.
  - **3b (next T12 round):** the group Volume fader in dB, plus Shift fine drag on the track, group and Master faders (Live §42.6).
  - The split keeps each round's test edits small enough to list. Neither half is deferred.
  - Group faders keep showing `%` for one round (interim, recorded).
- **Not in this round:** group fader, Shift fine on any mixer fader (a Shift drag on a lane fader still equals a plain drag), waveform gain/zoom (stage 4), automation, crossfades, Utility (`awaiting_user`), and the pending-preview machine merge (a root checkpoint question, §8).

## 1. B rulings (D-29z81)
Each open UI contract gets the smallest honest behaviour. Rationale is in `b-round-115.md` §4.

- **R1 — dB is a UI contract; storage stays linear.**
  - `ArrangementTrack.volume` stays the linear multiplier. `model.ts`, `groups.ts`, `schedule.ts`, `graph.client.ts`, the export path and the context API (`previewTrackVolume(trackId, linear)`, `commitTrackVolume`, `beginTrackVolumeGesture`, `blurTrackVolume`) **do not change**.
  - The conversion lives in a new pure module, `app/lib/arrangement/track-volume-db.ts`. A names the exports per `AGENT_DISCOVERABLE_CODE.md`.
  - Why: the engine already silences a track on an exact linear 0, and every context-level test keeps its meaning. T12.24's `trackVolumeDb` is recorded as a representation suggestion; it is not user-visible behaviour.
- **R2 — range and the −∞ position.**
  - The lane fader works in dB: `min = −60`, `max = 0`, `step = 0.1`.
  - **The slider minimum (−60) means −∞.** The stored volume is exactly `0`, and the finite floor is −59.9 dB.
  - The top is **0 dB** (stored `1`). There is no boost: the Live range is unconfirmed (§6) and +6 dB would unfreeze `model.ts`/`groups.ts`. "+6 dB boost" is a signal (TRACK-VOLUME-BOOST), not deferred scope.
- **R3 — conversion (exact).**
  - Slider dB → stored: `db ≤ −60` or non-finite → `0`; otherwise `10 ** (min(db, 0) / 20)`. The linear value is not rounded.
  - Stored → slider position:
    - `v ≤ 0` or non-finite → `−60`;
    - otherwise `clamp(round1(20·log10 v), −59.9, 0)`.
  - Stored → readout: `v ≤ 0` or non-finite → −∞; otherwise `round1(20·log10 v)` **without clamping**, so a fixture at 1e-4 reads −80.0, not −59.9.
  - Examples: `1` → 0.0; `0.5` → −6.0; `0.6` → −4.4; `0` → −∞.
- **R4 — gesture contract (unchanged apart from the scale).**
  - It is the same `useRelativeFaderDrag` call: `readStoredValue` = the R3 position, `previewValue(db)` = `previewTrackVolume(id, R3(db))`.
  - Everything else stays as today:
    - no jump on press;
    - the touch guard;
    - one `Volume` entry per drag;
    - press without move = no entry;
    - refusal during another gesture;
    - blur, pointercancel and keyup commit as today.
  - **A press or commit without a value change must not rewrite the stored linear value.** A track at `0.6` stays exactly `0.6`, not `10^(−4.4/20)`.
  - Undo restores the exact previous linear value.
  - `TRACK_VOLUME_STEP`/`TRACK_VOLUME_DEFAULT` become the new dB step and the 0 dB default.
- **R5 — keyboard.** The native range in dB:
  - ArrowRight/Left = ±0.1 dB.
  - From −∞, ArrowRight → −59.9 dB; from −59.9, ArrowLeft → −∞.
  - Home → −∞, End → 0 dB.
  - One entry per key press (keyup commit, as today).
- **R6 — reset.** Double-click → 0 dB (stored `1`), one entry; no entry when already at 0 dB. Unchanged.
- **R7 — what is shown (exact strings).**
  - **Finite text:** `formatMasterGainDb(db)`, for example `+0.0 dB`, `−4.4 dB`, `−59.9 dB`.
  - **−∞ text:** `−∞ dB` (U+2212 U+221E).
  - **Slider:** `aria-valuetext` = the full text. The native `value` = the R3 position as a string, e.g. `"-4.4"`, `"0"`, `"-60"`.
  - **Visible readout** (the span that shows `NN%` today): the same text **without** the trailing ` dB`, e.g. `−4.4`, `−∞`, `+0.0`. Its `title` is the full text.
  - The slider's existing `title`/`aria-label` (video `VIDEO_MIX_LABEL`, `Volume — {name}`) stay unchanged.
- **R8 — layout.**
  - The header width stays `ARRANGEMENT_HEADER_WIDTH_PX`.
  - The readout span may grow from `w-9` to at most `w-10`. Tailwind only, tokens only, no CSS file.
  - The widest readout is five characters (`−59.9`, `−80.0`; tabular-nums gives equal width).
  - At 1440×900 and 1280×720:
    - the readout is not clipped (`scrollWidth ≤ clientWidth`) and stays on one line;
    - the Volume slider stays **≥ 24 px** wide;
    - this holds at default height and at a nested lane (depth 1, inside a group), at every density where the fader is shown.
  - A measures the slider width before (baseline `d5de68f`) and after, and reports both. If R8 cannot be met, A stops and reports with measurements; A does not move controls to a new row.
- **R9 — gate-115 #4 (doc).** Doc 099 l.4 → „Round 115 — C PASS (`c-round-115.json`, gate 115 `d5de68f`).“

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/track-volume-db.ts` (**new**) | R2/R3/R7 pure helpers and constants. |
| `app/components/arrangement/ArrangementLane.tsx` | Volume fader (R2–R8). Nothing else (pan, mute, solo, meter and fold stay untouched). |
| `app/lib/arrangement/__tests__/track-volume-db.test.tsx` (**new**) | §3 |
| `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md` (**new**) | Georgian, per `docs/implementation/TEMPLATE.md`. l.4: „Round 116 — C-ის შემოწმებას ელოდება (D-29z81; T12 ეტაპი 3a).“ |
| `docs/implementation/2026/quarter-IV/099-studio-multi-clip-gain.md` | R9 only. |
| **Granted scale edits** in 11 existing tests (below) | Only lines whose expected value depends on the **lane Volume slider scale or readout**. |

**Granted scale edits: the rule.**
- **Files:** `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `pan-release-recovery`, `gesture-guard`, `context-hygiene`, `pending-status`, `track-group-collapse-ui`, `clip-gain-fader`, `clip-gain-multi` (all `app/lib/arrangement/__tests__/*.test.tsx`).
- **What A may change, only in these files:**
  - (a) a value written into a **lane** Volume slider: `fireEvent.change` value, or a key press count;
  - (b) an expected stored track `.volume` that was produced **through the lane slider** (drag, change, key, double-click);
  - (c) an expected lane slider `value` string or lane readout text.
- **New expectations:** write each as an exact `toBe` against the module's conversion of the dB literal, e.g. `toBe(trackVolumeFromDb(-19.4))` (name A's). No `toBeCloseTo`, no looser matcher. An import of the module's helpers in these files is part of the grant.
- **Must stay the same:** the steps, pixel deltas, pointer ids, assertion count and test titles (unless a title names a linear value).
- **Fixtures stay linear** (`volume: 0.6` stays).
- **Must stay unchanged:**
  - every line that drives the **context directly** (`live(api).previewTrackVolume(...)`, `result.current.previewTrackVolume(...)`) and its expectations;
  - every group fader line;
  - every Master line;
  - every Clip Gain line.
- **Candidate lines** (B's grep at `d5de68f`; not every line needs a change, and a line outside the list may only change if it meets (a)–(c)):
  - `fader-click` l.189–192, 358–392, 422–487, 517–623
  - `fader-guards` l.224–225, 272, 352, 500–534, 623–740, 791–844, 1218, 1377–1427, 1465–1494, 1599–1604 (group/video lines there only if lane-driven)
  - `fader-touch` l.161–216, 344–387
  - `fader-focus-order` l.173–184, 215–216, 265–360
  - `pan-release-recovery` l.204, 283–284
  - `gesture-guard` l.143–151, 218–225, 481–493
  - `context-hygiene` l.274–284, 356–376, 395–469 (PV5 l.412 onward: the `live(api).previewTrackVolume('music', 0.72)` lines stay)
  - `pending-status` l.226–240, 401–404 (l.540–586 drive the context: unchanged)
  - `track-group-collapse-ui` l.575–607
  - `clip-gain-fader` CF11 l.484–499
  - `clip-gain-multi` MG13 l.662–666
- **CF11 and MG13:** only the lane volume expectations change (e.g. 0.35 → the dB result). The "Shift equals plain on the Volume fader" meaning **stays in 3a**; it is inverted in 3b.
- **Report:** list every changed line as `file:line old → new` with the formula, e.g. `0.6 → −4.4 dB; −25/100 × 60 = −15 → −19.4 dB`. This includes every `fireEvent.change` value such as `'0.4'`, which the new range would clamp to `0`, and its dB replacement.
- **A stops and reports (file, line, assertion; no edit; B rules) if:**
  - any other test fails;
  - a needed change is outside (a)–(c);
  - `track-group-mix-ui` / `master-ui` / `track-layout` would need an edit;
  - `npm run test:e2e:smoke` would change. B grepped `e2e/agent-system-smoke.spec.ts` and found no `Volume` or `%` match.
- **Frozen:** `tmp/studio-real-loop/b-round-115-r116-tree-sha256.txt`, 914 of 927 tracked files: every tracked file except the 13 owned/granted tracked paths above.
  - A runs `sha256sum -c --quiet` at the start and the end and reports OK/FAIL.
  - The 3 new files are the only allowed untracked files.
- **Expected end state:** ` M` for `ArrangementLane.tsx`, doc 099 and the granted tests A actually touched; `??` for the 3 new files.
- **Before editing, read:**
  - `.claude/primitives-map.json`
  - `AGENT_DISCOVERABLE_CODE.md`
  - `FORWARDREF_COMPONENT.md`
  - `AUDIO_ARCHITECTURE.md`
  - `DESIGN_TOKENS.md`
  - `TAILWIND_FIRST.md`
  - `TESTING_QUALITY_GATES.md`
  - `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md`
  - `.claude/prompts/studio-feature.md`
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, **no type assertions**, semicolons, Tailwind-first, no code comments.
- **Forbidden:**
  - Everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`, including the protected auth/purchase files. B checked them at `d5de68f`:
    - `app/routes/studio.$productId.tsx` `fa2cf0bc`
    - `app/routes/api.studio-token.ts` `13914809`
    - `app/lib/auth.ts` `56f5b76f`
    - `app/contexts/AuthContext.tsx` `bf9ee257`
  - These files: `ArrangementContext.tsx`, `model.ts`, `groups.ts`, `schedule.ts`, `graph.client.ts`, `fader.ts`, `useRelativeFaderDrag.ts`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx`, and every other test.
  - These actions: commit, push, stash, checkout, deploy, dev-server restart, `npm run check` (`--write`), `npm run format`.

## 3. A — tests and checks
**New `track-volume-db.test.tsx`.** Pure tests plus the workspace harness of `fader-click.test.tsx`; mock `getBoundingClientRect` width 100 for the fader.
- **TV1 (pure, dB → stored):**
  - −60 → exactly `0`; −60.5 → `0`.
  - −59.9 → `10 ** (−59.9/20)`; −6 → `10 ** (−0.3)`; 0 → `1`; +3 → `1` (clamped).
  - NaN → `0`.
- **TV2 (pure, stored → position/readout):**
  - `1` → 0 / `+0.0 dB`.
  - `0.5` → −6 / `−6.0 dB`.
  - `0.6` → −4.4 / `−4.4 dB`.
  - `0` → −60 / `−∞ dB`.
  - `1e-4` → position −59.9, readout `−80.0 dB`.
  - Negative or NaN → −60 / `−∞ dB`.
  - The visible text drops ` dB`.
- **TV3 (lane display):**
  - Music at `0.6`: slider `value` `"-4.4"`, `min` `-60`, `max` `0`, `aria-valuetext` `−4.4 dB`, readout `−4.4` with `title` `−4.4 dB`.
  - Default `1`: `"0"` / `+0.0 dB` / `+0.0`.
  - A track at `0`: `"-60"` / `−∞ dB` / `−∞`.
  - The video lane gets the same mapping, and its slider `title` stays `VIDEO_MIX_LABEL` in compact density.
- **TV4 (drag):**
  - −25 px from `0.6` → stored `trackVolumeFromDb(−19.4)`, **one** `Volume` entry.
  - Undo → exactly `0.6`; Redo → the same value.
  - A press without move, and a press-move-back-to-start, both leave exactly `0.6` with no entry. History compares by value (`isSameArrangement`, JSON). The round trip therefore needs the lane to map the gesture's start position back to the start linear value it captured at `beginGesture`; A's mechanism, inside `ArrangementLane.tsx` only.
- **TV5 (−∞):**
  - A far-left drag → exactly `0`, readout `−∞`.
  - Focus + ArrowRight (change + keyup) → `trackVolumeFromDb(−59.9)`.
  - ArrowLeft → `0`.
- **TV6 (top):** a far-right drag from `0.6` → exactly `1`.
- **TV7 (keyboard):** from `1`, ArrowLeft ×3 (change + keyup each) → −0.3 dB, 3 entries.
- **TV8 (reset):** double-click from `0.6` → `1`, one entry; again → no entry.
- **TV9 (video):** the video lane slider change to `-6` + keyup → video track volume `10 ** (−0.3)`, one entry.
- **TV10 (playback):** a drag during playback reaches the graph's track gain with the linear value and does not restart sources (the existing schedule-spy pattern, as CF12/MG12).
- **TV11 (must-not):**
  - The group fader still shows `%`, and its drag values are the same as at baseline.
  - The Master drag is the same as at baseline (CF11 pattern).
  - Context-level `previewTrackVolume(id, 0.72)` stores exactly `0.72`.
  - A Shift drag on the lane fader equals a plain drag.

**Mutation proof.** Use a scratch copy under `tmp/studio-real-loop/a-round-116/`, or a temporary local edit that you revert and report. Each mutation must turn its test red:
- (m1) slider −60 maps to `10^(−3)` instead of `0` → TV1/TV5;
- (m2) a press/commit without change rewrites the rounded value → TV4;
- (m3) power formula `10 ** (db / 10)` → TV1/TV4/TV9;
- (m4) the readout clamps to −59.9 → TV2;
- (m5) the readout still uses `%` → TV3;
- (m6) the context is called with dB instead of linear → TV4/TV11.

**Honest limit:** jsdom has no native thumb and no layout. Real drag, layout, audio and export are C's rows.

**Checks A runs (speed rules):**
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on `track-volume-db` plus the 11 granted files, plus `track-group-mix-ui`, `master-ui`, `track-layout`, `clip-gain`, `status-announcement-ui`, `self-disabling-focus`, `render-budget`.
- All green; report counts.
- No full suite and no `npm run verify` (that is the gate's job).
- **Code-reviewer:** ask it if 3+ files change, and pass its Architecture note to B.

**A's report** (`a-round-116.md`) contains:
- start HEAD and status;
- the module API;
- slider/readout widths before and after at both viewports (A's own Playwright probe is a sanity check, not C acceptance);
- a diff summary per file;
- every granted line, old → new;
- test counts and mutation results;
- typecheck and lint results;
- frozen list at start and end;
- end status;
- the reviewer's score, notes and Architecture note;
- deviations.

## 4. C — rows (real browser, Playwright Chromium, fresh context per session, 1440×900 and 1280×720)
**Setup:**
- Tracks: music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s, SFX `demo-soft-impact` @4 s, all added from the library at the insert marker. Load `beeps-6s-vp9-opus.webm` on the video lane when a row needs it.
- Snap off, Stop state.
- `w` = the measured width of the lane Volume slider.
- Read values from the slider's `value`, its `aria-valuetext` and the readout.
- Read history from the Undo button title and Ctrl+Z.
- Drag rows: 3× at 1440 and 1× at 1280 unless stated.

| ID | Action | Expected (PASS) |
|---|---|---|
| **TV-PRESENT** | load | Every lane slider has `min -60`, `max 0`, `value "0"`, `aria-valuetext` `+0.0 dB`, readout `+0.0`. Group faders (if a group is made) still show `%`. |
| **TV-LAYOUT** (both viewports) | worst cases: drag far left then ArrowRight once (`−59.9`), and far left (`−∞`); default height; then a lane inside a group (Ctrl+G on two lanes) | Readout not clipped (`scrollWidth ≤ clientWidth`), on one line. Slider ≥ 24 px. Header width = the other headers'. Screenshots. A hidden/clipped readout or a slider < 24 px = Medium. |
| **TV-DRAG** | music lane: drag −20 px | Δ = `20/w × 60` ± (0.1 + `60/w`) dB. Readout and `aria-valuetext` agree. Exactly one `Volume` entry. Ctrl+Z restores `+0.0`. |
| **TV-INF** | drag far left | Readout `−∞`, `aria-valuetext` `−∞ dB`. ArrowRight → `−59.9`; ArrowLeft → `−∞`. |
| **TV-KEY** | from `+0.0`, ArrowLeft ×3 | `−0.3`; 3 entries. |
| **TV-DBL** | from a dragged value, double-click; then double-click again | `+0.0`, one entry; the second adds none. |
| **TV-PLAY** (1440 ×3) | play; drag the music lane −30 px while it sounds; keep playing 1 s | The output peak drops by ≥ 10 dB, or by ≥ (dragged dB − 8), whichever is smaller. The live level is content-dominated (C-R82-LIVE-ORACLE-PAIRED; round-115 MC-PLAY measured 28.6 for −35). **0** new `createBufferSource` between press and release (instrumented before load). Playhead monotonic. |
| **G-T3** (T12.26 Test 3) | Baseline: export the music track alone (others muted) at 0 dB. Set music to `−6.0` (from `+0.0` ArrowLeft ×60, or drag then arrow-correct; read `−6.0 dB`). Export again. | Peak and RMS ratio = `10^(−6/20)` = 0.501187 ±0.5 %. |
| **G-T4** (T12.26 Test 4) | Baseline as G-T3. Clip Gain of that clip `+6.0` (field + Enter), track `−3.0`. Export. | Ratio = `10^(3/20)` = 1.41254 ±0.5 %. 0 clipped samples. |
| **G-INF** | music alone, lane at `−∞`, export | Expected: every sample exactly 0 (0 LSB). A residual with peak ≤ −120 dBFS is recorded as an observation for B's ruling (candidate Low), not an automatic FAIL. Above −120 dBFS = FAIL (Medium). |
| **G-VIDEO** | video loaded, audio tracks muted. Export at video lane `+0.0` and at `−6.0`. During a drag on the video lane, read the dock video `currentTime` while playing. | Ratio 0.501187 ±0.5 %. The video keeps playing (currentTime advances) and is not muted by the fader. |
| **NB-GROUP** | Ctrl+G two lanes; drag the group fader −20 px; Undo | Group readout/`aria-valuetext` still `%`, the value changes, one entry. The lanes inside keep their dB readouts. |
| **NB-TRACK-SHIFT** | lane fader: Shift drag −20 px vs a plain drag −20 px | Same value (Shift fine arrives in 3b). |
| **NB-MASTER** | as round 115 | Same values as round 115 (−13.5 plain = Shift). |
| **NB-CLIP** | single stems Clip Gain drag +20 px; stems + SFX multi drag +20 px | Round-115 formulas (Δ 17.5 at w 96; differences kept). |
| **NB-PAN-MS** | pan drag + double-click; Mute and Solo on a lane | Same as before; readouts unaffected. |
| **SOURCE-SCOPE** | `git status`, `git diff --stat d5de68f`, frozen list | Only §2 paths; frozen OK; protected hashes unchanged. |
| **T116-TARGETED** | re-run A's vitest list (targeted only) | Green, same counts as A. |
| **AN-REVIEW** | read A's diff | R1: no change to the context, model, groups, schedule, graph or export. The granted test edits are scale-only (a)–(c), exact `toBe`, same steps and assertion count. Context-driven lines are unchanged. No type assertion; no CSS file. |
| **PX-NET** | every session | 0 forbidden-host requests (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token) and 0 `Authorization` headers. |
| **REG-HYD** | every session | 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise. |
| **G116-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. Product route shows "Sign in required", no workspace, 0 `audio[src]`. Token API returns **401**. Fake-Bearer 403 sub-check **BLOCKED (backend unavailable in cloud)**. |
| **DOC-100 / DOC-099** | read both | 100 follows the template, l.4 as in §2; 099 l.4 as in R9. |

- **Export harness (authorised in advance):** all G-* exports use **Master −12 dB** for the baseline and the measured export (round-29 R13-M1 and round-115 precedent).
  - A baseline with clipped samples is invalid. Replace the source with stems or SFX, or mark the row inconclusive.
  - G-T4 additionally needs baseline peak + 3 dB ≤ −1 dBFS.
- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Tolerances are fixed now.**
- **Neighbours that could break, and where they are checked:**
  - gesture mechanics: TV-DRAG, TV-KEY, TV-DBL, and the 11 granted files;
  - scheduling: TV-PLAY;
  - export level: G-*;
  - video sound path: G-VIDEO;
  - group and Master: NB-GROUP, NB-MASTER;
  - Clip Gain: NB-CLIP;
  - pan, mute and solo: NB-PAN-MS;
  - header layout: TV-LAYOUT.

## 5. Outcome
- **C PASS** → T12 stage 3a `c_pass`. Next planning: the REGRESSION round (on or after 2026-10-24), then stage 3b.
- **FAIL severities:**
  - TV-DRAG / G-T3 / G-T4 / G-INF (above −120 dBFS) / G-VIDEO / TV-PLAY FAIL → finding, at least Medium (level or data).
  - TV-LAYOUT: a hidden control is Medium; cosmetic is Low.
  - An Undo that does not restore the exact value is Medium.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Volume adjusts the track's output level | Live 12 Reference Manual §18.1 "The Live Mixer", https://www.ableton.com/en/live-manual/12/mixing/ (B capture `b-round-78/ableton-mixing-20261022.txt` l.40, 2026-10-22) | Confirmed | Lane fader, after clip gain and fades (order unchanged) | G-T3, G-T4 |
| Range −∞…+6 dB, bottom = −∞ | not in the saved captures; no web tool on this runner | **დაუდასტურებელი** | −∞ (T12.3 requirement) … 0 dB; boost recorded as signal TRACK-VOLUME-BOOST | TV-INF, G-INF |
| Numeric volume field in the extended mixer | §18.1 (capture l.48) | Confirmed (exists in Live) | Readout only in the lane; no typing field: **შეგნებული განსხვავება** (narrow header), signal | TV-PRESENT |
| Multi-track selection adjusts all, keeping differences | §18.1 (capture l.40, l.82) | Confirmed | Not in T12 stage 3 (T12.7 is multi-**clip**); signal MIXER-MULTI-TRACK | — |
| Shift = finer resolution when dragging | §42.6 (capture `b-round-71/ableton-shortcuts-20261021.txt`, 2026-10-21) | Confirmed | Stage 3b; unchanged in 3a | NB-TRACK-SHIFT |
| Double-click reset | §42.4 device text (plan.md l.775) | Unconfirmed for mixer faders | Kept (existing CZABA behaviour) | TV-DBL |

`ableton-notes-source.txt` stays **დაუდასტურებელი**. ABLETON-EXPERT-REVIEW covers it after T12 V1. C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- **C writes** `c-round-116.md` and `c-round-116.json` (`taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`), with evidence under `c-round-116/{tools,out,shots}/`. Write as you go.
- New findings get a new ID and a severity.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- Inconclusive rows are listed as inconclusive, never under `passed`.
- Consult only the read-only agents in your list. No `store/` writes by C.

## 8. Root / architecture (not A's work)
- The focused frontend-architect checkpoint request is sent to root with this plan: addendum (aa) of `b-round-91-checkpoint-request.md`, covering (z) plus the two round-115 reviewer proposals.
- Round 116 **does not touch the Volume/Master/Clip Gain pending machines**: the dB conversion is UI-only (R1).
- It is non-blocking and does not change this round's ownership.
