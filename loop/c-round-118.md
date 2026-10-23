# C — Round 118 verification: T12 stage 3b (group Volume in dB + Shift fine)

**Verdict: FAIL. The only failure is T118-TARGETED: CF11 l.501 is red because of a wrong test pin, not an app defect.** Every browser row passes at 1440×900 and at 1280×720 where required. `browserVerified = realVerified = true`.

The fix is B's one-line ruling (`CF11 l.501 → toBe(-1)`). It is not A's code. The root gate's full vitest fails until that ruling is applied.

## Environment
- `env-status.json`: store 200 (21:56Z).
- HEAD `9cb820b`.
- Headless Playwright Chromium, a fresh context per session, no credentials.
- The source hash (diff + untracked) was identical at C start and C end (`055087b8…`). C made no store writes.

## Bug for B
**C-R118-01 (Low for the app; it BLOCKS PUBLISH: the red test fails the gate's full vitest, so do not defer it to `deferred_low_polish`), CF11 l.501 pin**
- `toBe(-1.2)` received `-1`.
- Master is −60…+6 dB with step 0.5 (`ArrangementMaster.tsx` l.25). `relativeFaderValue` rounds to the step: −24 px × 66 / (132 × 10) = −1.2, which snaps to −1.0.
- B's §2.1 formula left out the Master step; R4 keeps that step.
- The browser confirms the app is right: SH-MASTER gives Shift −2.5 dB against plain −27.5 dB (theory −2.75, one 0.5 step).
- A correctly stopped and did not edit the pin.
- Evidence: `c-round-118/out/vitest-targeted.log`.

## Rows
| ID | Result | Evidence / measurement |
|---|---|---|
| T118-TARGETED | **FAIL** | 25 files, 452 tests: 451 passed, 1 failed (CF11). Same as A |
| AN-REVIEW | PASS | §2.1 lines only. TGM expect/it 131/10 unchanged; 27 changed lines = the §2.1 list. TV 99→100 (+1, TV11). CF 92/14 unchanged. No new `toBeCloseTo`. GV1–GV9 exist and match §3.2 (39 expect / 9 it). Doc 100 diff = 3 hunks (l.4, l.56, l.70). Deviations A reported (GV9 extra `plainPan` pin, GV5 retitled) are harmless |
| SOURCE-SCOPE | PASS | `git status` = the §2 end state. Frozen 922 OK. Protected files: `git diff 9cb820b` empty. Lane/Master diff = import + `fineDivisor` line only |
| GV-PRESENT (both) | PASS | `-60/0/0.1`, value `0`, `+0.0 dB`, `Volume +0.0 dB`. Row 28 px, fader 48 px, name 79 px, no visible dB/% text. `shots/GV-PRESENT-header-*.png` |
| GV-DRAG (both) | PASS | w 48. −20 px → −25.0 dB (expected −25 ± 1.35). One `Volume` entry (Pan sentinel). Ctrl+Z → `+0.0 dB`. Members stay `+0.0` |
| GV-INF (both) | PASS | `−∞ dB` (U+2212 U+221E), title matches, Undo → 0 |
| GV-DBL (reviewer extra) | PASS | A real dblclick → `+0.0 dB` with exactly one `Volume` entry. Undo → −25, Undo → sentinel |
| SH-LANE (both) | PASS | w 103: plain −23.3 / Shift −2.3 (−2.33). Lane selection unchanged by Shift-press |
| SH-GROUP (both) | PASS | w 48: plain −50.0 / Shift −5.0 |
| SH-MASTER (both) | PASS | w 96: plain −27.5 / Shift −2.5 (−2.75 ± 0.5) |
| SH-MID (both) | PASS | Last plain −11.7, first Shift −11.8 (1 step, no jump). Second half −1.2 (exp −1.165), ratio 0.103 |
| NB-PAN / NB-CLIP | PASS | Pan: plain = Shift = 42L. Clip Gain: +17.5 plain / +1.8 Shift |
| G-GROUP-T3 (1440) | PASS | Music muted, Master −12 harness, WAV 48k/24-bit/stereo, 101.352 s. Members start at 2.000 s. Peak and RMS ratio 0.501187 (0.000 %), max error 0.85 LSB, 0 clipped. Control (music + group Mute): 0 vs −6 dB identical, ratio 1.000000 |
| G-GROUP-INF (1440) | PASS | `−∞ dB`: 0 non-zero samples, same frame count |
| GV-PLAY (1440; 1280 also run) | PASS | Seek 8 s (stems only). Drag → −37.5 dB. Output drop 37.50 dB. 0 `createBufferSource` during the drag. Playhead 8.0→10.57, monotonic, still playing |
| GV-INF meters during play (1440 + 1280) | PASS (interpretation) | Output exactly 0 from +150 ms. The meters do **not** drop at once: they fall at the documented 20 dB/s release (1440 −20.02/−19.95; 1280 −20.03/−20.03 dB/s, never rising) and read −∞ at +1.96/+2.50 s (1440) and +1.97/+2.51 s (1280). C reads "stay silent" as "no signal" (meter ballistics). B may disagree on the wording without a re-run |
| TV-ANCHOR (both) | PASS | ArrowLeft×29 + Tab → `−2.9`. After the Master drag the readout is still `−2.9`. The lane drag is anchored at −2.9 (Δ −11.7 vs −11.65 ± 0.683). C also read the test helper: `undoChainLabels` undoes everything, so A's TV11 outcome (a) is correct |
| NB-TV-DRAG | PASS | −20 px → −11.7 dB, exact Undo |
| NB group Mute/Solo, U rescue | PASS | `aria-pressed` toggles. B's row text is imprecise (see below); both cases were checked |
| G118-3 (alone) | PASS (+ BLOCKED part) | Demo badge shown. `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]`. Token API 401. Fake-Bearer 403: BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | PASS | 14 sessions: 0 forbidden hosts, 0 Authorization headers, 0 hydration, 0 pageerror. Only the known 2 cart-noise errors per session |
| DOC-100/101 | PASS | Doc 100 l.4/56/70 as granted. Doc 101 has every TEMPLATE section (status In Progress, notes CF11) |
| Gate rows | gate | Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL |

## Notes for B
- **OBS-R118-DEMO-OVER** (existing gain staging; not caused by round 118):
  - At the default Master 0 dB, stems + SFX at about 4.0–4.6 s give a live output peak of +1.48 dBFS, and the SFX meter reads 0.
  - The export at Master −12 peaks at −10.52 dBFS, which is consistent.
  - Candidate signal or Low for the gain-staging and over-indicator work.
- **Neighbour row wording:** "U with the group fader focused → focus to the name" is not what UM9 tests.
  - The group's own fader stays visible on collapse and keeps focus. That is correct, and it was observed.
  - The UM9 case (a member lane fader focused → U) moves focus to `arrangement-group-name`. Observed and PASS.
- **Invalid runs (kept):**
  - `ui-1440-1-envfail.log`: first-load crash, as in round 117.
  - `gplay-1440-1-shortwindow.*`: the window was too short for the meter release, and the SFX clip is only 4–6 s.
  - `gplay-1440-2-parsebug.*`: C's tool bug (`-inf` attribute).
  - Valid runs: `ui-1440-2/3`, `ui-1280-1`, `gexp-1440-1`, `gplay-1440-3`, `gplay-1280-1`, `g118-3`.
- **Mutations:** C did not re-run A's m1–m5 (C makes no store writes).
- **Ableton** (rated separately from the CZABA requirement):
  - Shift = finer drag: **confirmed** (§42.6).
  - Group dB scale, factor 10, mid-drag re-anchor, −∞…0 range: **unconfirmed**.
  - Pan without fine: **deliberate difference** (R5).
  - Group dB in title/valuetext only: **deliberate difference** (GROUP-VOLUME-VISIBLE-READOUT).
- **To close this round:** B rules CF11 l.501 = `toBe(-1)` and an implementer applies that one line.
  - C's re-check is then T118-TARGETED only, because app source would be unchanged.
  - Every browser row above is then carried.
