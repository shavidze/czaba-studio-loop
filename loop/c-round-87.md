# C round 87: SRW-20 stage 3a (WAV worker, export progress, lab MP3 encoder)

Verifier: C · Date: 2026-10-22 · Real browser: Playwright Chromium (headless, Linux), fresh anonymous incognito context per session, `http://127.0.0.1:5173/studio-lab`, real `page.mouse` and keyboard. `env-status.json`: store 200 (round 87, attempt 1).

## Verdict: **FAIL**, with one medium bug
- **taskStatus FAIL.** `browserVerified = true`, `realVerified = true`.
- Every runnable browser row ran at both viewports; PX-RETRY ran at 1440 only, and PX-X3 at 1280 only, as specified.
- **All 18 B acceptance rows pass on their written evidence.**
- **The bug:** at **1280×720** the new progress label and bar sit below the dialog panel's visible area during an export (bug R87-PROGRESS-BELOW-FOLD-1280).
  - The progress display is this stage's main visible result, and 1280×720 is a required viewport.
  - So the feature is not delivered at that viewport, even though PX-PHASES passes on DOM evidence.
- **R20-X4:** the main-thread part is achieved. The worst frame gap is now about 100–110 ms (it was 445 ms). R20-X4 as a whole still needs stage 3b (Cancel).

## Bug for B: R87-PROGRESS-BELOW-FOLD-1280 (medium)
**Steps:**
1. 1280×720, anonymous `/studio-lab`.
2. Demo music at 0.35 s, stem at 2 s, sfx at 4 s.
3. Click the music clip, then press Ctrl+D twice.
4. Export → WAV or MP3 → click the export button.

**Measured during `rendering`** (`vis-1280x720.json`, `wheel-1280x720.json`):

| Element | Position | Visible? |
|---|---|---|
| Dialog panel (`max-h-[90vh] overflow-auto`) | 36–684 px; `clientHeight` 646, `scrollHeight` 758, `scrollTop` 0 | — |
| Progress label | 677–693 px | Cut off |
| `<progress>` bar | 709–717 px | No, fully below the fold |
| Busy button `მიმდინარეობს…` | 740–778 px | No, hidden |

- A 200 px wheel scroll over the panel (scrollTop 112) brings the bar to 597–605 px. So it can be reached by scrolling, but nothing shows the user it is there.
- C measured this on the 5M project only. The layout should not depend on project length, but that was not measured separately.
- At 1440×900 all three are visible: the bar is at 743–751 px inside a panel of 70–830 px.
- **Context:** at `971141d` the 1280 panel already overflowed by 12 px before any export (658 vs 646). The new label and bar add about 100 px.
- **Expected:** the label and bar are visible during every export at both viewports without scrolling. For example, scroll them into view, or place them where they cannot fall below the fold. Choosing the fix is B's call.
- **Evidence:** `c-round-87/shots/progress-1280x720-{0,1,2}.png`, `vis-1280x720.png`, `wheel-1280x720.png`; compare `progress-1440x900-2.png`.

## Acceptance rows
| ID | Result | Evidence (1440 / 1280) |
|---|---|---|
| PX-WAV5 | PASS | Dialog shows `მთელი პროექტი · 00:00.000 — 05:04.406`. `czaba-studio-lab.wav` is 24-bit, 48 kHz, 2 ch, **14 611 488 frames**, 87 668 972 B, with the exact message. **Max rAF gap: 106.6 / 105.0 ms** (baseline 445). Top 5 gaps: 106.6, 79.3, 70, 68.6, 65.8 / 105, 93.8, 73.2, 53.5, 52.1. Overload warning: +1.7 dBFS, 498 samples |
| PX-MP35 | PASS | Fresh page. `czaba-studio-lab.mp3` is 9 903 165 B, decoded **304.406 s**, Xing VBR. Oracle: lag 0, correlation 0.99998 on the 3–4.5 s window and 0.99984 on the 250–251.5 s window (L 0.99971, R 0.99978). Exact message. **Max rAF gap: 97.2 / 111.4 ms**. Duration 10.5 / 10.3 s |
| PX-PHASES | PASS | **WAV:** render (20 values) → wav (101). **MP3:** render 20 → wav 101 → load (2 records, **no `value` attribute**) → mp3 (12–13 values). 0 decreases. Label percent = floor(value × 100) in every record. Absent before the click and after done. The status message sequence is byte-identical to round 86. The `<progress>` has tabIndex −1, `aria-label` `ექსპორტის პროგრესი`, `max=1` |
| PX-WORKER | PASS | One same-origin `/app/lib/arrangement/export-wav.worker.ts?worker_file&type=module` per export. It starts about 0.86–0.9 s after the click, right after render reaches 100%, and is closed about 0.7 s later. No worker exists before the click |
| PX-WAV-SAME | PASS | 4 881 696 frames. Peak **+1.7 dBFS (= round 86)**, 470 clipped samples (reported, not asserted). Exact messages and filenames. Hashes: 33fea9e8 / 882cd6db; round 86 had 6061a245 / 33fea9e8. These are ≤ 1 LSB variants; an LSB diff against round 86 is not possible because that file was deleted. Within one session, the WAV-only file vs the WAV from WAV + MP3: maxLSB 1, 3 254 non-zero samples, identical warning text. Range 4–9: 240 000 frames |
| PX-MP3-SAME | PASS | MPEG-1 L3 Xing **VBR**, 48 kHz stereo, 3 311 037 B (round 86 size), average 260.4 kbps, decoded 101.702 s. Correlation 0.99984 / 0.99987, lag 0. Exact message |
| PX-BOTH | PASS | Downloads in order `.wav` then `.mp3`. 4 881 696 frames. Exact both-message. Progress: render → wav → load → mp3 |
| PX-REUSE | PASS | `ffmpeg-core.wasm` requests stay at 1 → 1. Load phase 10–11 ms. First export 10.3–10.5 s, second 6.8–6.9 s |
| PX-CDNFAIL | PASS | Exact load-failure alert for both MP3 and WAV + MP3. 0 files, Close enabled, progress cleared. WAV still works. After unroute, MP3 succeeds in the same page (correlation 0.99984) |
| PX-RETRY (1440) | PASS | The `ffmpeg-core.js` request hung at 543 ms. Timeout alert came exactly **120 000 ms** after the encoder-loading message. 0 downloads, progress cleared. Hung requests: 1 at the alert and still 1 three seconds later, so no late load started. After unroute, **the second MP3 completed in 7.5 s** with a fresh load phase, exact message, 101.702 s |
| PX-RANGE-SHORT | PASS | Range 4–9 s. WAV: 240 000 frames. MP3: 157 965 B, 5.000 s, correlation 0.99997. Progress appears and clears. 0 pageerrors |
| PX-KEYS | PASS | Enter → ArrowDown (MP3) → Tab to the export button → Enter. The 3 Tabs during the render landed on X, format-mp3 and scope-range, all inside the dialog; the progress element never took focus. Downloaded `-range.mp3`; Escape returned focus to Export |
| PX-X3 (1280) | PASS | With a video clip, the video option is disabled with the unchanged reason. Downloads were only `.mp3`, `.wav` and `.mp3` |
| PX-NET | PASS | 0 unpkg requests before the first MP3 (page load and WAV exports make none). Afterwards only `@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.{js,wasm}`. Workers are same-origin. 0 studio-token / R2 / download requests, 0 auth headers |
| REG-HYD | PASS | Every session is clean: no hydration warnings and no non-noise errors. The CDN-abort sessions had no console errors this time (the lab encoder does not log) |
| G87-3 | PASS (one sub-check BLOCKED) | Anonymous `/studio/middle-east` shows "Sign in required" with 0 workspace. `/api/studio-token?product=middle-east&file=stem1.wav` returns **401**. The header link "Studio Lab Demo" opens `/studio-lab` with the demo badge. Fake-Bearer → 500 (`Unable to prepare Studio access`): **BLOCKED, backend unavailable in cloud** |
| T87-TARGETED | PASS | C ran A's list: 70 files / 1195 tests passed (`c-round-87/targeted-c.log`) |
| SOURCE-UNCHANGED | PASS | HEAD `971141d`. 7 M + 10 ??. Frozen list 490/490 at start and end. Owned, protected and `ffmpeg.ts` (`0995ae78`) hashes match at start, at end, and against A's end-hashes |

**Extra (not a B row): EXTRA-WORKER-FAIL (1440), PASS.**
- C aborted the worker script (2 requests blocked).
- WAV and MP3 both showed the exact alert `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker).`
- 0 files, no unpkg request, progress cleared, and no silent main-thread fallback.
- After unroute, the next WAV works.

**Gate rows** (root's job, not claimed here): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

**Not run:** the worker and MP3 in the production bundle (no preview server in the cloud). Only the dev server was verified.

## Ableton match (separate from PASS; B's source §4)
| Behaviour | Status |
|---|---|
| Progress bar in the export dialog | Confirmed for real-time and video rendering. **Unconfirmed** for ordinary offline audio export |
| Bar resets for each pass | Conscious adaptation: one pass per CZABA phase, and the label names the phase |
| UI does not freeze | Ableton: not stated. It is a CZABA requirement (R20-X4), measured above |
| CBR 320 | Conscious difference: VBR averaging about 260 kbps, same as round 86 |
| Cancel | Stage 3b, not applicable this round |

## Observations (not bugs)
- **Fill colour unconfirmed.** The computed `accent-color` is `rgb(18,217,200)`, which is the correct brand token. Headless Linux Chromium paints the fill `#008000` on a `#808080` track. This needs a check in headed Windows Chromium. The classes are the same as the published `SfxSceneExport` precedent.
- **Timeout message text.** It still says "reload the page" (`გადატვირთე გვერდი`), but PX-RETRY shows a retry now works in the same page. The text is unchanged by spec; a candidate for the Lows batch.
- **Brief stall at 100%.** The label stays at `რენდერი · 100%` for about 0.27 s on the 5M project before the WAV phase starts (reviewer L6, conforms to the spec).
- **WAV hash jitter.** The 5M WAV hash differed across runs (64aa7efb / 7058a2e7 / 1844d3d6) with identical size and stats. This is the known ≤ 1 LSB render jitter.

## Harness notes (C's own, not app defects)
- **m5 attempt 1 (both viewports): invalid.** In-page decoding of a 304 s MP3 plus an 87 MB WAV made the browser run out of memory. The exports themselves had completed. C replaced it with a window oracle that cuts the WAV windows in Node (`m5-*.attempt1.json`).
- **std attempt 1: invalid.** C left the dialog open before the range drag (`std-*.attempt1-harness.json`). The rerun is valid.
- The app page never crashed in any run once a crash handler was attached.
- All exported audio files were deleted; hashes and stats are kept in the JSON.

## Files
- **Reports:** `c-round-87.json`, `c-browse.json`.
- **Evidence (`c-round-87/`):** `m5-*.json`, `std-*.json`, `fail-*.json`, `wfail-1440x900.json`, `g87-*.json`, `token-api.json`, `vis-*.json`, `wheel-1280x720.json`, `*-progress.json`, `targeted-c.log`, `start-hashes.txt`, `shots/`, `tools/`.
