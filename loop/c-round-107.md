# C — Round 107 verification: held shortcuts (HK), held Enter (HE), time-0 refusal (NZ), doc 092

Verifier: C · 2026-10-23 · Task: `current-task.md` (round 107, D-29z72). Source was read-only. There were no commits, pushes, server starts or settings changes.
- **Browser:** real Chromium through Playwright, a fresh incognito context per row, no credentials, `http://127.0.0.1:5173/studio-lab`.
- **Artifacts:** `c-round-107/` (`tools/`, `out/`, `shots/`, `checkpoint.md`) and `c-round-107.json`.

## Verdict: **PASS**
- `browserVerified=true`, `realVerified=true`.
- Every browser row that can run here was run: 27 sessions, at 1280×720 and 1440×900 where the task asks.
- I found one new bug, **C-R107-01** (Medium). It is pre-existing, not a round-107 regression, and is filed for B.
- One acceptance row (HE-CLIPGAIN-RESET) passed only with a deviation: B's literal setup cannot run.

## SOURCE-UNCHANGED: PASS
- **Start:** HEAD `35112cd`, `git status` 6 M + 0 ??, frozen list 536/536, and the six owned files equal A's `end-hashes.txt`.
- **End:** HEAD `35112cd`, 6 M + 0 ??, frozen list 536/536 OK, A's end hashes OK.
- **Diff vs B's snapshots** (`out/diff-code.txt`): every hunk lies inside the narrow ranges.
  - Workspace: the import, the deleted local constant, and the E/L/C branches.
  - Context: the constant at l.171 and the `nudgeSelectedClip` single-clip lines.
  - MarkerRow: the three buttons and the editor `onKeyDown`.
  - DetailPanel: the two buttons.
  - `toggleLoopSelection`, `splitSelection`, `extendRangeToAllTracks`, `copySelection` and the reducer have no hunks.
- The Ctrl+C `getSelection` early return is still before `preventDefault`.

## Browser rows

| ID | VP | Result | Key measurement (out/*.json) |
|---|---|---|---|
| HK-CTRL-L | 1280, 1440 | PASS | Loop created by Ctrl+L after a 3→12 s range (Snap on). Hold 1+11 (11 Ctrl repeats): `aria-pressed` false at all 12 samples. One span `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`, `Undo: Loop გამორთვა`. Ctrl+Z → true; a separate Ctrl+L → false plus exactly one more span. Screenshot `shots/hk-ctrl-l-*.png` |
| HK-CTRL-E | 1280 | PASS | Playhead 00:09.947. Hold 1+11: clips 1→2 at every sample. One span `კლიპი გაიყო 00:09.947-ზე.`; no `Playhead არჩეული…`. Ctrl+Z → 1 clip. The first attempt was invalid (my recipe: a title-strip click moves the playhead to 2.688 s); re-run with the click at x(10 s). The first attempt's output was overwritten; only this description remains |
| HK-CTRL-SHIFT-L | 1280 | PASS | Hold 1+11 (key `L`, code KeyL; `shortcutLetter` uses `code`). One span `მონიშვნა ყველა ხაზზე: 00:02.957 — 00:11.963.` |
| HK-CTRL-C | 1280 | PASS | `isCollapsed=true` (valid). Hold 1+11: one `Copy: 1 კლიპი ბუფერშია.`; a separate press adds one more. All 13 Ctrl+C keydowns `defaultPrevented` |
| HK-UNDO-STILL-REPEATS | 1280 | PASS | 0.300 after 3×→; Ctrl+Z 1 down + 2 repeats → 0.000. Three `Undo: კლიპის ჩაჩოჩება` spans, one per step |
| HE-MARKER-PREV | 1280, 1440 | PASS | Hold Enter 1+11 on ◀ (focus stays on ◀ at all samples): `უკან მარკერი აღარ არის` once (B's pre-fix probe: 6/6). The separate Enter adds one more |
| HE-MARKER-NEXT | 1280 | PASS | Marker at 4.974 (ruler click at ≈5 s, M, Enter), then Home. Hold Enter 1+11 on ▶: the position is 00:04.974 at every sample and focus stays on ▶. **0 spans**; `წინ მარკერი აღარ არის` is never added |
| HE-MARKER-ADD | 1280, 1440 | PASS | Hold Enter 1+6 on `+`: the editor is open and focused at every sample, value `Marker 1` fully selected (0–8), 0 markers, Undo unchanged, 0 spans. Typing `Intro` + Enter gives one marker `Marker «Intro» — 00:00.000` and the span `მარკერი «Intro» დაემატა: 00:00.000.` |
| HE-DETAIL-APPLY | 1280 | PASS | Inputs 2 / 4 (Tab, no Enter). Hold Enter 1+11 on `მონიშვნა`: exactly one span `მონიშვნა: 00:02.000 — 00:04.000 · მუსიკა.`; range 2–4 |
| HE-CLIPGAIN-RESET | 1280 | **PASS with deviation** | B's literal setup cannot run: on a fresh clip `0 dB` is disabled (`gain-literal`). With A's corrected setup (gain 1 dB, focus `0 dB`, hold 1+11): one span `Clip Gain: Middle East — საჯარო preview — 0.0 dB.`, value 0.0, `Undo: Clip Gain`. After the first click the button is disabled and focus is BODY, so the browser cannot isolate R2 here (jsdom HE4 and h9 only). The following separate Enter **added a clip**, which is C-R107-01 |
| NZ-TIME0 | 1280, 1440 | PASS | The first ← adds `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.`. A hold of 1+31 (31 repeats) adds exactly 1; the press after 500 ms adds exactly 1. The clip stays 0.000 and the Undo label is unchanged. The `<output>` is the same node with 1 child at all 34 samples |
| NZ-MOVES | 1280 | PASS | Single clip 0.300. Hold ← 1+11: per sample 0.200, 0.100, 0.000, then 0.000 for the rest. The time-start text is added once, nothing else. Ctrl+Z ×3 → 0.100, 0.200, 0.300 |
| NZ-SNAPON-SAME | 1280 | PASS | Snap on, ← at 0: the text is byte-identical (Buffer.equals) to NZ-TIME0's |
| KR-NUDGE-NEIGHBOUR | 1280 | PASS | Two clips, second selected. Hold 1+31: the neighbour text once; the separate press adds one more; clips and Undo unchanged |
| SR-REPEAT-SPACE, HD-BLOCKED-HOLD | 1280 | PASS | `sr107.cjs` (a copy of sr106) |
| SR-TEXT-REG | 1280 | PASS | Every field equals `c-round-106/out/textreg-1280x720.json` except `startedUtc` |
| G107-3 | 1280, 1440 (run alone, last) | PASS | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", 0 workspace and 0 audio. `/api/studio-token` returns 401 `Please sign in to access Studio.`. localStorage holds only `czaba_spotlight_last_shown`, `czaba_session_id`. **Fake-Bearer sub-check: BLOCKED (backend unavailable in cloud)** |
| PX-NET | all 27 sessions | PASS | 0 requests to studio-token/R2/recording-*/download from the page; 0 `Authorization` headers (`out/px-net-reg-hyd.json`) |
| REG-HYD | all 27 sessions | PASS | 0 hydration warnings, 0 pageerrors, 0 non-noise console errors. The only noise is the expected `:5199` cart `ERR_CONNECTION_REFUSED`. No Vite re-optimisation was seen |

**User-flow smoke (extra; shared context file changed).** I added 3 demo sources, ran Fit and did a real WAV export (`flow107-1280x720.json`).
- The file: `czaba-studio-lab.wav`, 29 290 220 B, RIFF/WAVE PCM, 2 ch, 48 kHz, 24-bit, 4 881 696 frames = 101.702 s (= the 0.35 s offset + 101.352 s of the clip).
- Sample data: 0 NaN, rms 0.1746454881, peak 1.0, 486 full-scale samples.
- This is identical to C round 98 (rms equal to 1e-11), so the full-scale count is pre-existing, not new.

## Offline rows
- **AN-REVIEW: PASS.**
  - Test l.1–705 are byte-identical to the snapshot (`cmp`).
  - The lines added from l.706 on (one `describe`, HK1–HK6, HE1–HE4, NZ1–NZ4) use only `toBe` ×44, `toEqual` ×22 and `toBeNull` ×4. They contain no `as`, `@ts-` or `any`; the one regex hit is the word "as" inside the NZ4 test-name string.
  - A's fail-before list matches B's expectation, and A explains HK6.
  - **My own mutations** (`tools/mut107.py`, scratch `c-round-107/mut`, control 32/32 before and after):

    | Mutation (my string) | Red |
    |---|---|
    | h1: Ctrl+L without Shift toggles on every keydown; Shift keeps its guard | HK1 |
    | h5: Ctrl+Z returns on repeat | HK5 |
    | h8: drop the repeat return in the name editor | HE3 |
    | h10: R4 condition `&& delta === 0` | NZ1, NZ2, NZ3 |
    | h12: `if (!event.repeat)` around the arrow nudge | NZ3, SK7 |

    These match A's table. My first h12 string had a syntax error (`current.if`), so it was invalid and re-run.
  - **HE1 Space clause:** B's literal "repeated Space on ◀ returns true" cannot hold, because the workspace prevents Space on buttons at baseline too. A's `preventedBeforeWindow` assertion tests the intended property. This is a B spec wording error, not an A defect.
- **T107-TARGETED: PASS.** My grep gives the same 69 files as A's list. Run in scratch (scratch `app/` = store `app/`, `diff -rq`): **69 files, 1152 tests passed** (`out/targeted.log`).
- **DOC-092: PASS.**
  - l.4 names round 107 waiting for C and rounds 104–106 published in `35112cd`.
  - The A-R104-REPEAT-DRAG status (now l.103) reads "C PASS (C round 105), published in `35112cd`"; no "waiting for C" remains.
  - The HK (R1), HE (R2+R3) and NZ (R4, one exported constant) entries exist.
  - The changed-files list names HK1–HK6, HE1–HE4 and NZ1–NZ4; the testing section has fail-before, h1–h13 and 69/1152.
- **Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Bug for B

### C-R107-01 (Medium, a11y and an unintended edit; pre-existing, not caused by round 107)

"Pre-existing" is an **inference from the diff**: the disabling logic, the `onMouseDown` preventDefault and the Enter-on-body library add have no round-107 hunk. It was **not measured at baseline in the browser**.
**Steps:**
1. Add one clip and select it.
2. Open the detail panel, type 1 in the Clip Gain input and press Enter.
3. Tab to `0 dB` and press Enter.
4. Press Enter again.

**Actual:** the reset applies, then `0 dB` disables itself, because the model stores 0 dB as an undefined `gainDb`. `document.activeElement` becomes BODY. The next Enter reaches the workspace handler and adds the last library item as a new clip: `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 01:41.352-ზე …`, clips 1→2, `Undo: დამატება …`. A further Enter adds a third clip at 03:22.704.

**Expected:** keyboard focus is not lost when the activated control disables itself. For example, focus moves to the Clip Gain input. A follow-up Enter must not silently add clips.

**Evidence:** `out/gain-focus-1280x720.json`, `out/gain-reset-1280x720.json` (the separate-press step), `shots/gain-focus-1280x720.png`.

**Reach:** any keyboard user who resets Clip Gain and presses Enter again. The edit is visible in the status and undoable.

## Notes for B
- **F2 confirmed in the browser:** a time range (2.957–5.914) is kept after a time-0 refusal (`time0-range-1280x720.json`). This follows "writes nothing else". It is for B to decide; it is not filed as a bug.
- **HE-CLIPGAIN-RESET and HE1 (Space):** both are spec wording errors. Correct them in the task archive or plan when convenient.
- **A's reviewer sweep:** the transport Loop button held-Enter toggle and the other toolbar buttons remain open signals, outside this round's scope. I did not verify them in the browser this round.
- **Root review files:** root's pre-push findings are unchanged by this round and stay carried by B. The **next B planning (≥ 2026-10-24) is the regression round** (`regression-last.json` 2026-10-21).

## Ableton correspondence
- **HK and HE:** არ ეხება. This is a CZABA keyboard convention; no Live source was consulted, and no Live claim is made.
- **NZ:** არ ეხება (CZABA requirement). Live 12 manual §3.2 says the Status Bar shows error messages, but it does not cover this case.
- **CZABA requirement fulfilment:** met for HK, HE and NZ as measured above.
