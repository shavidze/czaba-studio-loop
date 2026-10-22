# C round 90 — independent verification of SRW-20 stage 3b-1 (Export Cancel, D-29z55)

Verifier: C · 2026-10-22 · **Verdict: PASS** · browserVerified = realVerified = **true** · bugs: **0**

## Environment and method
- `env-status.json`: `{"checkedUtc":"2026-10-22T21:12:39.8287900Z","round":90,"attempt":1,"store":200}`. `curl :5173/studio-lab` → 200.
- **Browser:** standalone Playwright from `store/node_modules`, installed headless Chromium (gstack is not available in the cloud). Every session used a **new incognito context with no storage state and no credentials**. `c-browse.json` only records that choice; no state was persisted between sessions.
- **Clicks and keys:** every Export, Cancel and keyboard action was a real `page.mouse` / `page.keyboard` event.
  - HR-PHASE evidence is captured in the page: a capture-phase `pointerdown` / Enter listener records the progress label **at the moment of the event**, with `isTrusted = true`.
  - That is stronger than the poll just before the click. Both values are in the JSON.
- **CX-UNMOUNT:** the exit link was DOM-clicked with `element.click()`, as the task specifies.
- **Demo setup:** the three demo sources are dragged from the library (music, stems, sfx). Then the music clip is selected and duplicated with Ctrl+D ×2. The scope reads `მთელი პროექტი · 00:00.000 — 05:04.406` (5M).
  - 10M was never needed.
  - Media are demo assets only; nothing was uploaded.
- **Tools:** `c-round-90/tools/` (`lib90.cjs`, `run-render.cjs`, `run-mp3.cjs`, `run-keys.cjs`, `run-unmount.cjs`, `wav.cjs`).
- **Raw evidence:** `c-round-90/out/*.json` and `*.log`. The downloaded WAV/MP3 files (727 MB, C-generated) were deleted after parsing; their header, frame and decode results are in the JSON. Screenshots are in `c-round-90/shots/`.

## SOURCE-UNCHANGED — PASS
`c-round-90/start-hashes.txt` and `c-round-90/end-hashes.txt` are identical (`diff` empty):
- HEAD is `eb1d0c0319b2…`. `git status` shows exactly 5 M + 4 ?? (the granted files).
- Frozen list: **505/505 OK**. A's 9 end hashes: OK.
- Protected hashes: `Modal.tsx 741c2341`, `ffmpeg.ts 0995ae78`, `StudioContext caa388e7`, `mp3-encoder.client.ts ddb70919`.

C made no source edits.

## Acceptance results (both 1440×900 and 1280×720 unless noted)

| ID | Result | Evidence |
|---|---|---|
| CX-RENDER | **PASS** both | Label at the click: `რენდერი · 4%` (trusted). Exact status `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.` appeared in 19 ms (1440) / 16 ms (1280). Class `text-sm text-muted`, `role=status`, no alert. No progress bar or label, no Cancel. Buttons `[დახურვა, WAV-ის ექსპორტი]` are enabled. Focus is on დახურვა. **0 downloads in 15 s.** Re-export gives one `czaba-studio-lab.wav`: RIFF/WAVE, PCM 24-bit, 48 kHz, 2 ch, **14 611 488 frames = ceil(304.406×48000)**, NaN 0. The status is exactly `WAV შეიქმნა: 05:04.406, 24-bit · 48 kHz · stereo.` (`out/render-*.json`) |
| CX-WAVPHASE | **PASS** both | Label at the click: `WAV-ის ჩაწერა · 1%` at both viewports, in the first attempt. Same status, focus and 0-download evidence as CX-RENDER. A separate wav-phase cancel (`out/unmount-*.json`) shows the WAV worker `close` event about 520–560 ms after the worker was created, so the worker was terminated, not run to completion |
| CX-LOAD | **PASS** both | Taken from the `HUNG=1` runs (`out/mp3-{1280x720,1440x900}-hung.json`): `page.route(unpkg)` never responds, and the Cancel click was gated until `ffmpeg-core.js` was actually pending (`hungAtCancel = 1`). Label at the click: `MP3 encoder-ის ჩატვირთვა…`. The exact encoder message appeared in 15 / 13 ms, with no alert. **0 downloads in 15 s.** After the unroute, the next MP3 re-fetches `ffmpeg-core.js` + `.wasm` from unpkg and gives one `.mp3` that decodes to 48 kHz / 2 ch / **304.406 s**. The status is exactly `MP3 შეიქმნა: 05:04.406, 48 kHz · stereo.` (The first 1440 run, `out/mp3-1440x900.json`, cancelled in the load phase before any unpkg request. It is recorded as an extra pre-fetch load-phase cancel with the same result, not as the hung-CDN evidence) |
| CX-MP3 | **PASS** both | Label at the click: `MP3-ის შექმნა · 0%`. Encoder message, 0 downloads in 15 s. The ffmpeg worker `close` event fires at the cancel. The next MP3 re-fetches the core and succeeds: `.mp3` 304.406 s, exact message. Recorded cancel %: **0%** at all 4 runs |
| CX-BOTH (1440; also run at 1280) | **PASS** | WAV + MP3, label at the click `MP3-ის შექმნა · 0%`. Encoder message, **neither `.wav` nor `.mp3`** in 15 s. Buttons `[დახურვა, WAV + MP3 ექსპორტი]` |
| CX-MP3-RENDER (1440; also run at 1280) | **PASS** | This MP3 export followed a completed MP3 in the same page. Label at the click: `რენდერი · 4%`. The **plain** message, without the encoder sentence. The next MP3 made **0 unpkg requests** (the cached encoder was kept) and succeeded: 304.406 s, exact message |
| CX-KEYS | **PASS** both | Open from the toolbar Export with Enter; initial focus is დახურვა. Tab → WAV-ის ექსპორტი, Enter. During the render: Tab trap → X → `format-wav` → Cancel, busy before and after every press. The trusted Enter landed at `რენდერი · 4%` (1440) / `რენდერი · 9%` (1280). Result: the cancelled message, Cancel gone, `activeElement` = დახურვა, 0 downloads in 15 s. Escape closes the dialog, and focus is on the toolbar `Export` button (`out/keys-*.json`) |
| TRAP-CANCEL | **PASS** both | Fresh page, keyboard start, 10/10 valid presses (busy before and after), all inside. Tab: wrapper → X → `format-wav` → Cancel → X → `format-wav` → Cancel. Shift+Tab: Cancel → `format-wav` → X → **Cancel** → `format-wav`. Cancel was not activated; the export completed with one `.wav` (24-bit/48k/2ch, 14 611 488 frames) and the WAV done message |
| CX-ESC | **PASS** both | Escape ×2 during the render (`რენდერი · 4%` / `9%`): the dialog stays open, still busy, with focus on the trap wrapper. The export completes: the WAV done message and one `.wav` with 14 611 488 frames |
| CX-UNMOUNT | **PASS** both | `/` was warmed in a separate context first. **mp3 phase** (`MP3-ის შექმნა · 0%`): exit was clicked and the URL is now `/`, with **`window.__cx === 1`** (a client navigation, not a reload). **0 downloads in 15 s**, no console error. The ffmpeg worker closed 2.6 s (1280) / 2.2 s (1440) after the exit click, before a 5M conversion could finish (about 7.5 s). **render phase** (`რენდერი · 4%`): `__cx === 1`, 0 downloads, and **no WAV worker was ever created**, so the render did not continue into the wav phase. See note N2 (`out/unmount-*.json`) |
| CX-DONE-REG | **PASS** both | Complete 5M WAV and MP3 without a cancel: exact done messages, correct files. After done there is no Cancel and focus is on დახურვა, inside the dialog. The overload warning is still shown after done (`გადატვირთვა: პიკი +1.7 dBFS — 498 sample…`), unchanged neighbour behaviour |
| PX-NET | **PASS** | All sessions: 0 unpkg requests before the first MP3 click (0 after only selecting the MP3 radio). After that, only `ffmpeg-core.js` / `ffmpeg-core.wasm`, including the expected re-fetch after a load or mp3 cancel. Workers are same-origin only (`export-wav.worker.ts`, `@ffmpeg/ffmpeg/dist/esm/worker.js`). 0 studio-token / recording / download / R2 requests from the pages and 0 `Authorization` headers. Other hosts are the known-allowed set: Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) and the root `localhost:5199/api/cart`, which fails as expected. Precedent: c-round-41 l.290 |
| REG-HYD | **PASS** | No hydration / `useLayoutEffect` warning and no non-noise console error or pageerror in any session (`errors: []` in every JSON) |
| VIS-RENDER sample | **PASS** (1280, and 1440 too) | During `რენდერი · 4%`, status, label, bar, Cancel, დახურვა and the busy button are all HR-VISIBLE (inside the scroller and the viewport, and `elementFromPoint` hits each one). The row order is `გაუქმება, დახურვა, მიმდინარეობს…`, in one row with the same top (629 px at 1280) and the same parent as დახურვა. Screenshots: `shots/vis-render-{1280x720,1440x900}.png` |
| C5 class parity | **PASS** (code read) | The Cancel `className` is character-identical to დახურვა's; no new colours |
| G90-3 | **PASS**; the fake-Bearer part is **BLOCKED** | Anonymous `/studio/middle-east` shows "Sign in required" with no workspace (0 grid controls). Anonymous `/api/studio-token?product=middle-east&file=stem1.wav` → **401** `Please sign in to access Studio.` The visible header link "Studio LabDemo" opens `/studio-lab` with the workspace and the demo badge (`დემო კოლექცია`). localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id`, no auth. Fake Bearer → **500** `Unable to prepare Studio access`, not 403, because the backend is unavailable in the cloud: **BLOCKED**, the same as round 89 |
| T90-TARGETED | **PASS** | `npx vitest run $(cat a-round-90/targeted-list.txt)` → **65 files, 1129 tests passed** (`c-round-90/targeted-c.log`). It includes `export-cancel.test.ts` (19), `export-cancel-ui.test.tsx` (11) and `export-dialog-tab-stops.test.tsx` (14) |

**Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, production bundle (PROD-MP3-UNVERIFIED).

**Unit only, not browser-reachable (not PASS):**
- GATE89-S1 (a rejected `resume()`, EC3);
- L5 (encoder reset after a failed conversion, CU8);
- the no-`suspend` fallback.

They are covered by A's unit tests, which C re-ran green, and by A's mutation table (j, i). C did not re-run the mutations.

## Exact-string check
A node `===` comparison over every captured status in `c-round-90/out/*.json` found **53 exact matches and 0 mismatches**:
- the cancelled message and the encoder message, chosen by the phase at the click;
- the WAV and MP3 done messages.

The comparison constants are `MSG` in `tools/lib90.cjs`, copied from task §1 C1, plus the done strings.

## Neighbour behaviour (§5 list)

| Neighbour | How it was checked |
|---|---|
| Frozen focus rules (initial Close, focus on Close at render end, a radio keeps focus) | **Browser.** CX-KEYS: initial focus is დახურვა. CX-DONE-REG: focus is on დახურვა after done. The "a radio keeps focus" case rests on frozen focus l.458 in T90-TARGETED only |
| Sticky footer | **Browser.** VIS-RENDER at 1280 and 1440, with Cancel in the row |
| 120 s timeout message | **Unit only:** frozen tests in T90-TARGETED (export-mp3 MX). Not browser-checked in this round |
| CDN failure | **Browser, 1280** (`out/cdnfail-1280x720.json`, `tools/run-cdnfail.cjs`). Setup: `page.route(unpkg).abort()`, then a 5M MP3 export with no cancel. Result: the exact existing `role="alert"` text `MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. …` with `text-destructive`, no `status`, 0 files, no Cancel, დახურვა enabled and focused. After the unroute, the next MP3 re-fetches the core and succeeds (304.406 s, exact message). The changed load-failure `catch` keeps its behaviour. The harness did not time the failure, because its done-poll watched `role=status` |
| Range-export file names | **Unit only:** frozen range tests in T90-TARGETED. Not browser-checked in this round |
| Overload warning after done | **Browser.** CX-DONE-REG / CX-LOAD / CX-MP3 next exports all show the unchanged `გადატვირთვა: პიკი +1.7 dBFS — 498 sample…` alert after done |

## Ableton comparison (§4)
- **Does the CZABA requirement work?** Yes. Cancel works in every phase that can be reached: render, wav, load and mp3, plus WAV + MP3.
- **Ableton match — "Cancel leaves no partial file":** **confirmed** against the source.
  - Source: Live 12 Reference Manual, Managing Files and Sets §5.1.3.5, read in B's stored copy `b-round-84/web/managing-files.txt` l.282: "Cancel button to stop the process completely and delete any partially rendered file". C re-read that line.
  - The quote covers **real-time rendering only**. CZABA never delivers a file after a cancel (0 downloads in every run).
- **Ableton match — Cancel during an offline export:** **unconfirmed**. The manual does not say whether Live's offline render has a Cancel, and C makes no claim either way.
- **Escape does not cancel:** a CZABA contract, not an Ableton comparison ("does not apply / no source").
- **Encoder reload after a cancel:** does not apply (CZABA's ffmpeg.wasm).

## Notes (not bugs)
- **N1 — Harness.** In CX-KEYS the Enter probe logged each event twice, because the probe was installed twice (once by setup's `openDlg` and again by `openKbd`). One physical key press happened.
- **N2 — Unmount timing.** In CX-UNMOUNT the ffmpeg worker was terminated about 2.2–2.6 s after the exit click, not at once. Hypothesis, **not verified**: Remix keeps the old route mounted until the new route's modules load in a fresh dev context, so the provider unmounts, and aborts, only at the navigation commit. 0 downloads and the absent WAV worker show that the abort happened before any delivery.
- **N3 — Memory.** Review finding 7 / the doc 078 hypothesis (a suspended, dropped `OfflineAudioContext` may stay in memory) was **not measured** in this round and remains unverified.
- **N4 — Cancel percentages.** The render-phase cancels always landed at 4% or 9%, and the mp3-phase cancels at 0%. 5M renders in about 1 s, so later percentages were not targeted. The required rows do not need them.
- **N5 — Carried findings.** Carried items from `root-pre-push-review` / the active summary (for example `lenis-purchased-studio`, `shared-modal-no-focus-management`) were not re-tested; they are outside this round's scope.

## Return to B
- No reproducible bugs.
- The Cancel part of R20-X4 (stage 3b-1) is C-verified in a real browser at both viewports.
- 3b-2 (GATE86-S2 note, R87-L-TIMEOUT-RELOAD-TEXT, GATE89-S2) stays open as planned.
- A's own note stands: mutation b did not turn CU4 red. B may want a dedicated pre-download check test on the mp3 path. That is a test gap, not a behaviour bug; in the browser, CX-BOTH showed 0 files.
