# C — Round 114 verification: T12 stage 1, the Clip Gain fader (D-29z79)

**Verifier:** C (independent, read-only for source) · **Date:** 2026-10-23 · **Verdict: PASS** · `browserVerified: true`, `realVerified: true`
**Env:** `env-status.json` `{"checkedUtc":"2026-10-23T17:28:27.6731142Z","round":114,"attempt":1,"store":200}`; store dev server http://127.0.0.1:5173 (200). Playwright Chromium (headless, `--autoplay-policy=no-user-gesture-required`), a fresh context per session, no credentials.
**Evidence:** `c-round-114/tools/` (scripts), `c-round-114/out/` (JSON, logs, exported WAVs), `c-round-114/shots/` (screenshots).

## Method
- **Layout:** music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s and SFX `demo-soft-impact` @4 s, all added from the library at the insert marker. Snap off, Stop state, detail panel open at its default height (144 px at 1440, 120 px at 1280). The stems clip is selected by clicking its body.
- **Readings:**
  - values from the fader's `value` / `aria-valuetext` and from the field;
  - history from the Undo button title, checked with Ctrl+Z after a blur (the round-113 recipe).
- **Drags:** real mouse in 1 px steps, with the value read after every step. The fader width is measured each run (`w` = 96 px at both viewports), and the Δ formulas use it. The tolerances in §4 were written into the scripts before any run and never changed.
- **Audio:**
  - `BaseAudioContext.prototype.createBufferSource` is counted from an init script that runs before the app loads.
  - The real master output is tapped by mirroring every `AudioNode.connect(destination)` into an AnalyserNode.
  - Exports are real downloads from the Export dialog (24-bit PCM WAV, 48 kHz, stereo), parsed sample by sample with `wav.cjs`.
- **Runs:** `ui.cjs` 3× at 1440 and 1× at 1280. `touch.cjs` 1× at 1440. `play.cjs` 3× at 1440. `export.cjs` 1× (export does not depend on the viewport). `g114-3.cjs` alone, last.

## Row results
"CZABA" = the CZABA requirement is met. "Ableton" = correspondence status per §6.

| ID | CZABA | Ableton | Evidence |
|---|---|---|---|
| CG-PRESENT | PASS | არ ეხება | **B's literal "field → fader → `0 dB`" cannot hold on a fresh clip, because the pre-existing `0 dB` button is disabled while `gainDb` is undefined. The DOM order was verified at −6.0.** Enabled, value 0, `0.0 dB`, min −60, max 24, step 0.1, label `Clip Gain — fader` (4 sessions). **Tab:** field → fader in every run. At −6.0: field → fader → `0 dB`. On a fresh clip (`gainDb` undefined) the `0 dB` button is disabled. That is unchanged code since c2837f1 (same `disabled` expression, round-108 contract), so Tab goes field → fader → (next). Tabbing writes no entry. `out/ui-*.json` |
| CG-LAYOUT (1440, 1280) | PASS | არ ეხება | **1440:** fader 96×16 at x 1226 and `0 dB` at x 1326, both inside the visible box; block scrollW 192 = clientW 192; no document x-overflow. **1280:** fader at x 1066 and `0 dB` at x 1166, both inside; 192 = 192. Shots: `shots/layout-1440-*.png`, `shots/layout-1280-1(-panel).png`. **A's waveform-column check:** the waveform column is 266 px at 1280 (`contain-strict`, no overflow) and looks fine in the panel shots. The block's own 1 px vertical overflow at 1280 (scrollH 68 / clientH 67) is cosmetic and outside the row's horizontal criterion. See C-R114-01 (pre-existing) |
| CG-NOJUMP | PASS (4/4) | არ ეხება (CZABA D-29z3) | Press at 14.4 px (15 % from the far end), held 100 ms: value 0 during and after; Undo title unchanged |
| CG-DRAG | PASS (4/4) | დადასტურებული (§8.4.7 gain slider; 2026-10-12 capture, not re-opened) | +20 px: Δ = +17.5 (expected 17.5 ± 0.975); monotonic trace; field `17.5`; `+17.5 dB`; one `Clip Gain` entry; Ctrl+Z → 0.0 with the previous Undo title |
| CG-FINE | PASS (4/4) | დადასტურებული for controls in general (§42.6); the Clip Gain slider is not named | Shift held from before the press to after the release: Δ = +1.8 (expected 1.75 ± 0.188). 1.8 ≤ 17.5/5. One entry; Ctrl+Z → 0.0 |
| CG-FINE-TOGGLE (1440 ×3, plus 1280) | PASS (4/4) | შეგნებული განსხვავება (re-anchoring is a CZABA decision) | +10 px coarse (8.8), then Shift, then +10 px: total 9.7 (expected 9.625 ± 1.075). The step across the toggle move is 0.1 (limit 0.975). One entry |
| CG-KEY | PASS (4/4) | არ ეხება | ArrowRight ×3: 0.1, 0.2, 0.3. **3 entries.** Ctrl+Z ×3 gives 0.2 → 0.1 → 0.0, then the `დამატება` title. This equals A's CF7 rule (one entry per press) |
| CG-DBL | PASS (4/4) | დადასტურებული for parameters (§42.4); Clip Gain is not named explicitly | −6 via the field, then a double-click on the thumb gives 0.0. A second double-click at 0.0 adds no entry: one Ctrl+Z → −6.0, a second → 0.0 with the start title. The mouse stayed still between the clicks (review Low 5) |
| CG-SYNC | PASS (4/4) | არ ეხება | Field `-3.5` + Enter: fader −3.5, aria-valuetext `−3.5 dB` (U+2212) |
| CG-PENDING-DRAG (1440, 1280) | PASS (4/4) | არ ეხება | Typed `-3` (pending marker visible), then +20 px: the fader is at −3 at the press, and the final value is 14.5 (expected −3 + 17.5 = 14.5 ± 0.975). Ctrl+Z → −3.0, Ctrl+Z → 0.0 with the start title |
| CG-DISABLED | PASS (1440, 1280) | დადასტურებული (multi-clip is stage 2 per §8.13) | **Multi** stems+SFX: disabled; title, describedby id and text equal the field's (`Clip Gain ერთ აუდიო კლიპზე ისმება — აირჩიე ერთი`); a press+drag on it writes nothing. **None:** `ჯერ აირჩიე კლიპი`, same id. **Video** `beeps-6s-vp9-opus.webm`: `ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute`, same id. `out/ui-*-9.json` |
| CG-TOUCH (1440) | PASS | არ ეხება | CDP touch: touchStart at 15 % gives no change (0). Moves −4 px ×5: −3.5, −7, …, −17.5 (relative, limit 17.6). One `Clip Gain` entry; Ctrl+Z → 0 with the previous title. **Positive control:** Zoom jumped 678 → 63, so the harness is valid. `out/touch-1440.json` |
| CG-PLAY (1440 ×3) | PASS (3/3) | არ ეხება | Music and SFX muted; play from 2.05 s; −40 px drag during playback → −35.0 dB. **Master output peak** (300 ms windows): −12.16 dBFS before, −45.55 dBFS after, a **33.4 dB drop**. **0** `createBufferSource` calls between press and release (3 in total, all at play start). Playhead monotonic 2.551 → 4.70–4.75 s, still playing, still inside the clip. **The 33.4 vs 35 dB gap** is not a gain error. The before and after windows hold different pulses of the deterministic stem (the peaks are bit-identical across all 3 runs), so peak-vs-peak is not a gain measurement. The exact render-path gain is proven by G-T2 (0.50119). CG-PLAY proves that the live path responds without source restarts. `out/play-1440-*.json` |
| G-T1 | PASS | არ ეხება | Stems alone, 0.0. Valid baseline: 0 samples at full scale, no overload alert. Peak −10.554 dBFS, RMS −32.928 dBFS; 24-bit, 48 kHz, 2 ch, 101.352 s (project length); stems span 2.000–18.000 s |
| G-T2 | PASS | დადასტურებული (dB gain, §8.4.7) | −6.0 via ArrowLeft ×60: peak ratio 0.50119, RMS ratio 0.50119 (target 0.50119 ± 0.5 %). The source peak is ≤ −4 dBFS, so +3.0 also ran: ratios 1.41254 / 1.41254 (target 1.41254), 0 clipped samples, no alert |
| G-T8 | PASS | არ ეხება | Music + stems (SFX muted), stems at 0 vs −6. Outside the stems span ([0, 2 s) and [18.001 s, end)): **0 LSB**. Inside: 1 241 453 LSB, so the change is real. **Validity note:** this baseline has 30 samples ≥ 0.9999 FS (the alert says 14 over 0 dBFS). All 30 sit in the music source at 42.72–91.73 s, 25+ s away from the stems span, where stems gain has no way to reach. The other ~4.77 M outside frames are fully discriminating and show 0 LSB. **Deviation, named:** C applied the validity rule's intent (G-T8 is an equality test, not a ratio) rather than its letter. "Use the music clip instead" cannot apply when music is the subject. `out/wavcheck-1440.log` |
| G-T9 | PASS | არ ეხება | Fade-out dragged to `data-fade-out` 2.000 at 0.0 dB. The last 10 ms before the clip end (18.0 s): **−124.4 dBFS RMS** (limit −60). **Discrimination:** the baseline's same window is already −73.5 dBFS, so the window alone does not discriminate. Fade windows vs the baseline: −6.19 dB at 1 s before the end and −12.38 dB at 0.5 s before (a linear fade predicts −6.02 / −12.04), and 0.00 dB before the fade. Field `0.0` and fader `0.0 dB` after the export |
| G-NONDESTRUCT | PASS | არ ეხება | Field −8 + Enter, then a fader double-click → 0.0; export vs G-T1: same frame count, **max diff 0 LSB**. The two files are byte-identical (same sha256 `3946976d…`, `out/wav-sha256.txt`) |
| NB-TRACK-SHIFT | PASS (4/4) | არ ეხება | Music Volume −20 px (round-113 recipe), w 107: Δ −0.19 without Shift and −0.19 with Shift. Track faders do not opt in |
| NB-MASTER | PASS (4/4) | არ ეხება | Master −20 px: Δ −13.5 dB, one `Master Volume` entry, Ctrl+Z → 0. With Shift: also −13.5 |
| NB-RESET-BTN | PASS (4/4) | არ ეხება | From −6.0: focus `0 dB`, Enter → 0.0, focus moves to `arrangement-detail-clip-gain-input` (round-108 contract) |
| SOURCE-SCOPE | PASS | — | `git status` shows exactly the §2 set: 4 app files and doc 097 ` M`, test and doc 098 `??`. `git diff --stat c2837f1`: 5 files, +322/−15. Frozen list `sha256sum -c --quiet` OK at the start and at the end. Protected sha256 prefixes `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257` unchanged |
| T114-TARGETED | PASS | — | C re-ran the 16-file §3 list: **16 files, 277/277**, the same as A. `out/vitest-targeted.log` |
| AN-REVIEW | PASS | — | See below |
| PX-NET | PASS | — | 14 sessions: 0 forbidden-host requests, 0 `Authorization` headers |
| REG-HYD | PASS | — | 14 sessions: 0 hydration errors, 0 `pageerror`, 0 non-noise console errors (2 known cart/connection noise lines per session) |
| G114-3 | PASS (fake-Bearer 403 sub-check BLOCKED) | — | Fresh context with no credentials. `/studio-lab`: workspace present and badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ shown. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token?...`: **401** `Please sign in to access Studio.` The fake-Bearer 403 sub-check is **BLOCKED (backend unavailable in cloud)**. `out/g114-3.json` |
| DOC-098 / DOC-097-L4 | PASS | — | **Doc 098:** l.4 „Round 114 — C-ის შემოწმებას ელოდება (D-29z79; T12 ეტაპი 1).“; it has every template section (კონტექსტი … TODO). **Doc 097:** l.4 „Round 113 — C PASS (`c-round-113.json`, gate 113 `c2837f1`).“; the TC row is `[x]`; R38-T and TOUCH-DOUBLE-TAP-RESET stay open |

**Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## AN-REVIEW (read of A's diff)
- **Fine mode is opt-in.** `isFine = fineDivisor !== undefined && move.shiftKey`. With `fineDivisor` undefined, `anchorFine` stays false and no re-anchor happens: `anchorX` = press x, `anchorValue` = the stored value, and the width is unchanged. So the computed values are identical to the old code, which the browser confirms (NB-TRACK-SHIFT, NB-MASTER, CF11). Only the detail panel passes `fineDivisor: 10`.
- **Re-anchor.** On a Shift toggle the drag anchors at the previous pointermove x and the last previewed (stepped) value. The toggle move is then computed in the new mode, as A reports and as CG-FINE-TOGGLE confirms.
- **Live read.** `readStoredValue` reads `getArrangement()` = `historyRef.current.present`, not render props. `fader.focus()` runs inside `onPointerDown` before `readStoredValue`, so the field's blur commit lands first (confirmed in the browser by CG-PENDING-DRAG).
- **R7 option (b).** It is a separate Master-style pair. The track, group and Master paths only gained `flushPendingClipGain()` calls, which do nothing without a pending clip preview.
- **Blur** matches track Volume's `blurVolumeTarget`: commit when there is no gesture, cancel/revert during own gesture. Unmount cleanup releases the gesture.
- **Hygiene:** no type assertion, `any` or ts-ignore in the added lines; no CSS file; no comments; Tailwind classes only (`w-48`, `w-24`, `accent-brand`). No conditional test file was edited.

## Findings
- **C-R114-01 (Low, pre-existing, not caused by this round).** At 1280×720 with the detail panel open at its default height (120 px):
  - the content scrolls (scrollHeight 98 > clientHeight 83);
  - the info column's 5th line „წყარო უცვლელი რჩება“ (top 650, bottom 666) falls outside the visible box (bottom 651).
  - **Why it is pre-existing:** the info column is `w-72 shrink-0` at both c2837f1 and now, so its height does not depend on this round's `w-32` → `w-48` change. A also reported it.
  - **Recommendation:** B maps it to an existing detail-fit ID or adds it to `deferred_low_polish`. Evidence: `out/ui-1280-1.json` `rows.CG-LAYOUT.sourceLine`, `shots/layout-1280-1-panel.png`.
- **Info, no finding:**
  - On a fresh clip the `0 dB` button is disabled (round-108 behaviour), so the third Tab stop of CG-PRESENT exists only once the clip has a stored gain.
  - At 1280 with the panel open, the SFX lane sits partly under the detail panel header. Lanes scroll; this is the existing vertical-space behaviour and not this round.
  - A's review Low 5: a 1 px move between the two clicks of a double-click can add an extra entry. C kept the mouse still, so it is not exercised here.

## Harness notes (honesty)
- **First 1440 run** (`out/ui-1440-1-firstpass.*`):
  - CG-PRESENT was asserted with the literal field → fader → `0 dB` order on a fresh clip, which the pre-existing disabled `0 dB` makes impossible. The row now also checks the order at −6.0.
  - CG-DBL had a wrong title-equality check: both titles are `Undo: Clip Gain`. The values were correct; the check now counts undo steps.
- **The "nothing selected" state** of CG-DISABLED was first not reached. My deselect click landed on the detail panel header at 1280, and Escape does not clear a multi-selection. The fixed harness clicks timeline background and requires 0 selected clips; it was re-run at both viewports (`ui-*-9.json`).
- The tolerances themselves were never changed.

## Ableton correspondence summary
- **დადასტურებული:** the dB gain slider (§8.4.7, 2026-10-12 capture), multi-clip deferred (§8.13).
- **დადასტურებული for controls in general, not named for Clip Gain:** Shift fine drag (§42.6), double-click reset (§42.4).
- **შეგნებული განსხვავება:** re-anchoring at the Shift toggle, and Delete on a focused range input staying a browser no-op (plan.md l.775).
- **არ ეხება:** browser touch and no-jump.
- The manual was not re-opened this round (no web tool on this runner). `ableton-notes-source.txt` stays **დაუდასტურებელი**.

## Outcome for B
- T12 stage 1 (single-clip Clip Gain fader) is C PASS, browser-verified.
- Open from this round: only C-R114-01 (Low, pre-existing) → `deferred_low_polish`.
- Carry the reviewer's architecture note (three pending-preview machines; ARCH-R81 trigger) to the B/root checkpoint.

## Artifact note
The 7 exported WAVs (≈28 MB each) were removed after analysis, following the c-round-104 convention. Their sha256 and sizes are in `c-round-114/out/wav-sha256.txt`; per-file stats are in `out/exp-1440.json` and `out/export-1440.log`; window analyses are in `out/wavcheck-1440.log`. `tools/export.cjs` regenerates them.
