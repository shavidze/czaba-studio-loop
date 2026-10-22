# C round 82: independent verification of SRW-18 stage 1 (clip fade in / fade out) and X1 (C-R80-O3)

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`. No new bugs.
- **BLOCKED:** one sub-check, the fake-Bearer case in G82-3, because the backend is unavailable in the cloud.
- **Gate rows:** not claimed here.
- **Scope:** stage 1 of SRW-18 only. Stage 2, the clip volume envelope (R18-A2), is still open.

## Environment
- `env-status.json`: store 200, round 82.
- Browser: Playwright Chromium (headless), anonymous fresh context, real `page.mouse` and keyboard. Both viewports were tested: **1440x900** and **1280x720**.
- Warm-up: one throw-away load first, as A asked. Every evidence session had a clean console apart from the expected cart/backend noise.
- Media:
  - built-in `/studio-lab` demo sources: Middle East on music @0.35, `ღამის პულსი · პულსი` on stems @2–18, Soft impact on sfx @4;
  - `media/beeps-6s-h264-aac.mp4`, an owned synthetic file, used only for FD-HANDLES.
  - Nothing was uploaded externally.
- Scripts are in `c-round-82/tools/` (`r1`–`r4`, `g82`, `tok`, `lib82`). Raw results are in `c-round-82/*.json`, screenshots in `c-round-82/shots/`.

## Source unchanged (start = end)
- HEAD is `efbed86` at both start and end.
- `git status` shows **8 M + 4 ??**.
- Frozen list: **467/467 OK**.
- The 12 owned files match A's `end-hashes.txt` byte for byte, at start and at end (`c-round-82/hashes-start.txt`, `sha256sum -c` OK).
- Protected files: 4/4 (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`).
- The two doc grants were checked:
  - doc 071 l.4 is exactly the line the task specifies;
  - doc 070 l.72 now describes round-81 X1;
  - new doc 072 l.4 has the required status `Round 82 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z47)`.

## Acceptance results (both viewports unless noted)
| ID | Result | Evidence |
|---|---|---|
| FD-HANDLES | PASS | Handles are 10×10 px, 21 px below the clip top (under the 20 px header), 1 px inside each edge, and topmost at their own point. They are hidden (opacity 0) when idle and shown on hover; a selected clip also shows them. The video clip has none; a folded stems lane (27 px) has none, and they return after unfolding. `data-fade-in/out="0.000"`. Screenshots: `fd-handles-{hover,video,folded}-*.png`. |
| FD-IN (R18-A1) | PASS | Real drag of +40 px at 40 px/s gives v = 1.000, status `Fade In: 1.000 წმ.`, undo `Undo: Fade In`. Export is 24-bit / 48 kHz stereo with the same frame count as the reference (4,881,696). Over [2, 3] with \|ref\| > 1e-3: 68,826 samples, 0 outside 0.01, max \|x/ref − (t−2)/v\| = 9.9e-5. Over [3, 3.5]: ratio exactly 1 (max error 0). Before 2.0, both files are exactly 0. |
| FD-OUT | PASS | v = 2.000. Over [16, 18]: 137,712 samples, max error 1.0e-4. Over [12, 16]: 275,380 samples, ratio exactly 1. |
| FD-CLIPGAIN | PASS | Clip Gain −6 dB (`Clip Gain: … — −6.0 dB.`) multiplies the ramp: max \|x/ref − 0.5012·(t−2)/v\| = 7.7e-5, and the flat part is 0.5012 within 8e-5. At 1280x720 the detail panel starts collapsed; C expanded it with `arrangement-detail-toggle`, which is existing behaviour. |
| FD-LIVE | PASS (music) | **Stems was rejected per §5:** the no-fade control Δ(2.95 − 2.15) was −6.0 dB at both viewports (> 3 dB). **On music** (fade at 0.35): control Δ −1.7 dB, faded Δ +16.9 dB (≥ 12 dB), second control −1.7 dB. Paired (faded minus control at the same position): −20.9 dB at +0.15 s (theory −16.5 dB). The extra attenuation fits the meter's release-limited fall (`meter.ts` l.73–74: level = max(block peak, previous − release·elapsed)): the reading tracks a decaying earlier peak, and the faded run's earlier peaks are lower and −2.3 dB at +0.95 s. |
| FD-MIDSTART | PASS (music) | Started at clip +0.5 s: the reading at +0.6 s is 9.8 dB (1440) / 10.4 dB (1280) below the reading at +1.3 s, inside 2–12 dB, and the playback was not silent (−21.8 dB). **Caveat:** the music content alone moves 5.2–5.5 dB between those positions, so the discriminating evidence is the paired comparison: −4.6 dB at +0.6 s (theory −4.44 dB) and 0.0 / +0.3 dB after the fade ends. On stems, the paired value was −6.0 / −6.3 dB and 0.0 / +0.3 dB. |
| FD-LIMITS | PASS | With fade-out 2, dragging the fade-in +1200 px gives `14.000` and status `Fade In: 14.000 წმ.`; both handles stay inside the clip. Dragging left past the start gives `0.000`. Fade-out dragged right past the edge gives `0.000`. M2: with fade-out 0, dragging the fade-in to the edge gives 16.000; that handle is still topmost and can be dragged back to 12.000. |
| FD-UNDO | PASS | Drag in: one `Fade In` entry. Drag out: one `Fade Out` entry. Ctrl+Z / Ctrl+Y restore the exact values and the previous label. A real `dblclick` on the in-handle gives 0.000, status `Fade In: 0.000 წმ.`, one entry (Ctrl+Z returns 1.000, label `Fade Out`); this confirms A's H1 fix. A double-click on a zero fade adds no entry and no new clip. A press without moving adds no entry. A drag that returns to its start value shows `Fade Out: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` |
| FD-EDITS | PASS | Fresh clip 2–18 with in 1 / out 2, with Ctrl+Z back after each edit (restore verified each time):<br>(a) move → 3–18+, 1/2;<br>(b) to sfx @7 (`გადატანა ხაზზე — SFX: start 00:07.000.`) → 1/2;<br>(c) Ctrl+D → both clips 1/2;<br>(d) Ctrl+C / Ctrl+V @18.5 → both 1/2;<br>(e) Ctrl+E @10 → 2–10 1/0 and 10–18 0/2;<br>(f) trim start to 5 → 5–18 1/2;<br>(g) Delete on range 8–9 → 2–8 1/0 and 9–18 0/2.<br>Export after (e): [16, 18] follows the fade-out (max error 1.0e-4); [9.9, 10] and [10, 10.1] ratio exactly 1, so there is no fade at the cut. |
| FD-PLAY-EDIT | PASS (stems) | Dragging the fade-out handle at pos 5.31 gives `1.000` and one `Fade Out` entry. Playback continued: position monotonic, advance 2.58 s over 2.59 s wall time. The buffer-source count went from 15 to 20; the contract allows a preview to reschedule (C did not count reschedules per move). Ctrl+Z restores 0.000 and the previous label. No console error. |
| FD-NEIGHBOURS | PASS | Body drag 6→8 gives the range `00:06.000 — 00:08.000`. The trim strip below the handle (cursor ew-resize) gives `Trim — მარცხენა კიდე: start 00:03.000, length 00:15.000…`. Header move gives `კლიპის გადატანა: start 00:03.000…`. Click-seek in the body gives pos 10.000. Fades are kept in every case. |
| X1-STATUS | PASS | Music @0.35 dragged 1 s right, then down onto the occupied stems lane and released: the clip stays on music at `data-clip-start` 1.350, with status exactly `აქ ადგილი არ არის — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:01.350.` and undo `კლიპის გადატანა`. Refused hover, then back to its own lane: normal `კლიპის გადატანა: start 00:01.350…` with no refusal text. First move straight into the refused lane: `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` and the clip stays at 0.35. Free lane: `გადატანა ხაზზე — სტემები: start 00:20.000.` |
| REG-HYD | PASS | Every session had no hydration or `useLayoutEffect` warning and no non-noise console error or warning. |
| G82-3 | PASS, plus 1 BLOCKED sub-check | Anonymous `/studio/middle-east` shows "Sign in required" and 0 workspace. `/api/studio-token?product=middle-east&file=stem1.wav` returns 401, both anonymously and from inside the page. `/studio-lab` made no token/R2/download request and sent no Authorization header. The header link opens `/studio-lab` with the demo badge. **Fake Bearer returns 500 "Unable to prepare Studio access": BLOCKED, backend unavailable in cloud.** |
| T82-TARGETED | PASS | A's 74-file list: **74 files, 1366 tests passed** (`c-round-82/vitest-targeted.txt`). |
| SOURCE-UNCHANGED | PASS | See above. |
| Gate rows | `gate` | Full vitest, typecheck, build, Biome, verify, e2e smoke: these belong to the root gate. |

## Ableton match (Live 12 manual §6.8, B's capture; not re-browsed by C)
| Behaviour | Match status |
|---|---|
| Fades at clip start and end (audio clips) | Confirmed (manual text; CZABA behaviour verified) |
| Handles appear on hover as small squares; hidden on a short track | Confirmed (folded lane and video clip show none) |
| Drag across the clip to change the length | Confirmed. No snapping is a conscious CZABA choice; Live's snapping is unconfirmed |
| Start and end fades cannot overlap | Confirmed (`in + out ≤ duration`; 14.000 limit) |
| Fade Curve handle | Conscious difference (linear only; the export shows an exact linear ramp) |
| Select a handle + Delete deletes the fade | Conscious difference (double-click resets) |
| Crossfades | Not applicable |
| Automatic 4 ms edge fades | Conscious difference (not added; the split cut shows ratio exactly 1, i.e. no edge fade) |
| Fades are a clip property (move/copy with the clip) | Confirmed |
| Behaviour under split / trim / delete-time | Unconfirmed in Live; CZABA rules F3 verified |
| X1 | Not applicable (Live overwrites on overlap; FB-03 decision) |

## Signals for B (not bugs)
- **Live-meter oracle design:** on rhythmic material, and even on music near an onset, the "reading at t1 vs reading at t2" oracle can be dominated by the content itself. A paired fade-vs-control comparison at the same position is the discriminating test, and C recommends it for SRW-18 stage 2 (envelope) live rows.
- **A-reported items C did not measure:**
  - the ramp-overlay SVG is about 2 px off near the right edge (cosmetic);
  - L2: a hidden handle still catches presses, and there is no `touch-none`;
  - fades have no keyboard path (SRW18-KEYBOARD-FADES).
  - These remain for the Lows batch / stage 2 as A recorded them.
- **Root follow-up carried:** the purchased `/studio/*` Lenis check and the fake-Bearer 403 still need a backend-enabled run.
