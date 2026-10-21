# C — Round 66 verification: SRW-15 stage 2 (FB-09): metronome (D-29z31)

Verifier: C · Date: 2026-10-20 · Task: `current-task.md` (round 66) · A report: `a-round-66.md`. I re-ran everything myself and did not treat any A claim as evidence.

**Verdict: PASS. `browserVerified: true`.**
- Every §4.6, §4.7 and G66-3 REAL-browser row ran. The starred rows ran at both 1440×900 and 1280×720.
- I found no bug of any severity.
- There is one unit-test gap, recorded as info: **INFO-C66-UI9-NO-PLAY**. The browser MT-EXPORT row covers the same risk with real audio.
- Round 66 is **commit-ready** for root: 8 paths (§1).

Evidence is in `c-round-66/`: `checkpoint.md`, `gates/`, `runs/`, `shots/`, `tools/`, `mut/`, `mutations.txt`.

## 0. Environment

| When | :5173 `/studio-lab` | :5199 `/api/products` | node.exe |
|---|---|---|---|
| start (13:12 +04) | 200 | 200 | 7 |
| mid, before the browser rows (13:19) | 200 | 200 | 7 |
| end (13:31) | 200 | 200 | 7 |

`env-status.json`: round 66, attempt 1, store 200, backend 200.

**Browser tools:**
- **REAL-mouse/keyboard (PW):** standalone Playwright from `store/node_modules` with the installed chromium, a fresh context and no credentials (`tools/mt66.cjs`, `tools/tb66reg.cjs`, `tools/ru66reg.cjs`).
  - The only in-page code is a read-only DOM sampler. Every 10 ms it reads `arrangement-position`, the master meter's `data-level-db` and the SFX track meter.
  - For MT-PERF-INFO only, I added a keydown listener and a MutationObserver on the position readout.
  - Nothing writes app state.
- **gstack `/browse`:** own state file `c-round-66/c-browse.json`.
  - The CLI daemon started normally, so no fallback was needed.
  - At the end, `browse stop` printed `[browse] Unable to connect`: the daemon had already exited. The state file was gone, no browse process remained, and node.exe was 7.
  - I killed no process.
- **node.exe** was recorded at start, mid and end and around verify (7 every time), not after every single PW run.
- **ENV-EXT-LOAD-HANG:** the selector appeared after 0.6–3.7 s, and I then waited 4 s every time.
- **Forbidden-host filter:** includes `r2-proxy|workers.dev` (INFO-C65-HARNESS-R2-REGEX).

## 1. G66-2 — tree: PASS

Start (13:12) and end (13:31), `gates/g66-2-end.txt`:
- HEAD `3e55c5c` at both.
- `git status --short` shows exactly the 8 §3.1 lines:
  - ` M` for `ArrangementTempoRow.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx` and `graph.client.ts`;
  - `??` for `metronome.ts`, the two test files and doc 059.
- Frozen list: 0 not OK (426/426).
- Snapshot `SHA256SUMS.txt`: 4/4 OK.
- Protected files: 4/4 OK.
- The owned files' sha256 did not change during my run (`gates/owned-sha-start.txt`; `diff` at the end was empty).
- **EOL:** CR = 0 in all 8 owned files (`gates/eol.txt`).

## 2. R66-S — static: PASS

**`diff -u` against the snapshots** (`gates/diff-*.txt`): **0 removed lines** in all four files.

| File | Added lines | What they are |
|---|---|---|
| `graph.client.ts` | 63 | `import type { MetronomeClick }`; optional `ApplyScheduleOptions.metronome`; `ScheduleHandle.appendClicks`; `ScheduledClickState`; a metronome gain created only when `options.metronome` is given → `connect(master)`; click sources in their own `clickSources` list with `onended`; `appendClicks` prunes ended clicks and is a no-op after `disconnect`/without a metronome; `stop(when)` loops over the clicks with the same `when`; `disconnect` covers the clicks and the gain. `renderArrangementWav`, `measureExportOverload` and `ScheduleAudioContext` are unchanged. |
| `ArrangementContext.tsx` | 55 | Exactly the seven §0.3 edits (import; `metronomeBpmRef` and `metronomeBuffersRef`; lazy buffers and the `metronome` option in `startGraph`; `appendClicks` in `fillLoopIterations`; `setMetronomeBpm`; value + deps; cache reset in the unmount cleanup). |
| `ArrangementTempoRow.tsx` | 19 | Two props and the button. `gap-1.5` unchanged. |
| `StudioWorkspace.tsx` | 18 | The six §0.3 edits. |

**Other static checks:**
- **`metronome.ts`:** pure; imports only `./model` and `./tempo`; `time = (k * SECONDS_PER_MINUTE) / bpm` computed from the index on every step. A's deviations 1 and 2 are present and harmless (a guard for non-finite `from`/`until`; `k` starts at `max(0, floor(from·bpm/60) − 1)`).
- **Laziness:** `ensureAudioContext` (l.1019–1035) has no `AudioBuffer`/`copyToChannel`. The buffers are created in `startGraph` only when the BPM is non-null, and the cache is reset on unmount.
- **Export:** `exportWav` calls `renderArrangementWav(arrangement, buffersRef.current)` with 2 arguments. The graph module has no metronome reference in the render path.
- **Context value:** only `setMetronomeBpm` was added; there is no metronome state.
- **Banned patterns** (`gates/static.txt`): none in the new files or the added diff lines (`any`, ` as `, `@ts-`, comments, hex/rgb colours, `.skip/.only/.todo`, `retry`, `setConfig`, per-`it` timeouts). There are 11 + 10 `it`.
- **Literals:** every UI string matches §0.1 byte for byte (MT-ON/MT-DISABLED in the browser, and M8). No character outside Georgian, ASCII and `„“—·…–`.
- **Pressed styling:** uses tokens only (`border-accent bg-accent/20 text-accent`, `disabled:` tokens).
- **Doc 059:** has the date, status (`Round 66 — D-29z31; C-ის შემოწმებას ელოდება`), project, context, approach, architecture (2 Mermaid diagrams), files, problems, testing, Ableton table and TODO.

## 3. R66-U — unit and mutation: PASS (one test gap, info)

**Red run** (`gates/red-run.txt`): run in my scratch (`c-round-66/scratch`: `app/` copy, a `node_modules` junction, my own config), without `metronome.ts` and with the four snapshot files. Result: `Test Files 2 failed`, `Failed to resolve import "../metronome"`, no tests ran. Afterwards the scratch was restored to equal the store (`diff -rq` empty).

**Mutations** (`tools/muts66.cjs` + `tools/cmut66.cjs` → `mutations.txt`, JSON in `mut/`):
- Each run covered the 8 files from §2.3 (121 tests).
- The unmutated run passed 121/121, twice.
- Each pattern matched exactly once, and the scratch was restored after every run.

| # | Mutation | Failing tests (C) |
|---|---|---|
| a | accent on every beat | M1, M2, M3, M4, M5, M9 |
| b | `time += 60/bpm` | M2 |
| c | EPS removed | M4 |
| d | no truncation at `until` | M5 |
| e | metronome gain → `destination` | M9 |
| f | clicks → first track gain | M9 |
| g | clicks pushed into `sources` | M10 |
| h | metronome gain always created | M11 + 2 frozen `graph.test.ts` |
| i | `setMetronomeBpm` never resyncs | UI3, UI4, UI5 |
| j | clearing the tempo keeps it on | UI6 |
| k | eager click buffer in `ensureAudioContext` | 3 frozen `master-ui` + 4 frozen `render-budget` |
| l | loop refill without `appendClicks` | UI7 |
| m | toggle never disabled | UI1, UI6 |
| n | toggle writes no status | UI2, UI3 |
| o1 | export gets a 3rd argument (the click buffers) | UI9 |
| p1 | clicks `stop()` immediately | M10 |
| p2 | clicks skipped by `stop(when)` | M10 |
| q (extra) | `when = time` (no clamp) | M4 |
| r (extra) | resync without `force` | UI3, UI4, UI5 |
| s (extra) | accent on `k % 4 === 1` | M1, M2, M3, M4, M9 |
| t (C extra) | loop iteration 0 planned to `projectEnd` instead of `loop.end` | UI7 |
| u (C extra) | effect passes `tempoBpm` regardless of `metronomeOn` | UI3, UI4, UI6 |
| v (C extra) | `disconnect` leaves the metronome gain connected | M10 |

**Survivors:**
- **o2 (invalid):** my variant added a fake key to the export map unconditionally. It is then present in the "off" call as well, so UI9's off-versus-on key comparison cannot see it. A real click leak only exists after click buffers have been created, so this variant does not test a realistic leak.
- **o3 (survives; test gap, INFO-C66-UI9-NO-PLAY):** the export map gets the click buffer **when the cache is filled**. UI9 never presses Play before exporting, so the cache is always empty and its `isClickBuffer` check cannot fire.
  - Real risk is low: the code passes only `buffersRef.current`.
  - The browser covers this risk. In MT-EXPORT (b), I played with the metronome on (the cache was filled, and the clicks were seen on the meter) and then exported. The result was byte-identical to (a).
  - **B:** add a Play before the "on" export in UI9 (Lows batch).
- **w (info):** removing the cache reset on unmount survives. It cannot be observed in jsdom, and the static check confirms the reset is present.

**Durations:** the two new files alone ran 21/21 in 2.71 s. The slowest test was UI1 at 151 ms (`gates/alone.txt`).

## 4. G66-1 — gates: PASS

- `npx tsc --noEmit` → rc 0 (`gates/tsc.txt`).
- **`npm run verify`, attempt 1:** rc 0 (`gates/verify-1.txt`, `.meta`).
  - **Test Files 93 passed (93), Tests 1626 passed (1626).**
  - Build ran twice (✓ 7.64 s, 2.31 s).
  - 0 `Test timed out`.
  - node.exe 7 before and after; 13:13:24 → 13:14:46.
- **Biome `./app`, read-only:** **4 errors / 218 warnings / 1 info**. The 4 errors are exactly the baseline CRLF `format` list (`auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`), confirmed by a separate run on those 4 files.
- **Biome on the 7 owned code/test files:** 0 diagnostics, rc 0.

## 5. §4.6 — metronome browser rows: all PASS

**Run files:**
- `runs/mt66-1440x900-full.txt`: main audio rows.
- `runs/mt66-1440x900-loop.txt`: MT-LOOP and MT-UNDO.
- `runs/mt66-1440x900-clear.txt`: MT-CLEAR (clean re-run).
- `runs/mt66-1440x900-export.txt`: MT-EXPORT, PLAY-REG and MT-PERF-INFO.
- `runs/mt66-{1440x900,1280x720}-keys.txt`: the starred rows.
- `runs/mt66-1440x900-bd*.txt`: BD-INFO.

**Measurement method:**
- **Live audio:** the master meter's `data-level-db`, sampled every 10 ms, with the position readout recorded in the same sample.
- **Rise:** a sample at least 10 dB above the previous one. Its peak is the maximum over the next 150 ms.
- **Playback control:** REAL Space and REAL mouse clicks.

**F-SILENT fixture:** a REAL-mouse (PW) drop with no BPM and Snap on gave `„Soft impact“ დაემატა SFX ხაზზე 00:20.000-ზე.`, a clip at 20.000.

**Invalid attempts, all harness errors, replaced within the budget:**
1. `keys` 1440 attempt 1: the arrangement was empty, so Space correctly did nothing. The harness now drops F-SILENT first. The file is kept as `*-attempt1-harness-noclip.txt`.
2. `full` run, MT-LOOP: I dragged a range on an **empty** lane. The app correctly answered `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.` because a range needs a clip waveform. The replacement run (`loop`) used a **muted** music clip (Middle East at 0, track Mute on) as the range carrier. That clip contributes nothing to the master, so the window still contains only clicks.
3. `full` run, MT-CLEAR: the sampling window ran with a **stalled transport** (1639 samples, all at 0.219, `reached: null`), so its "0 rises" was vacuous. The cause was the invalid MT-LOOP attempt before it: the project ended on its own, and the harness's trailing stop-Space restarted playback. The clean re-run is in `runs/mt66-1440x900-clear.txt`, and it now also checks that the position advanced.
4. `full` run, MT-UNDO: my oracle compared the Undo title from before MT-MASTER. MT-MASTER's track mute/solo clicks legitimately add history entries. In that same run, the per-toggle titles were identical and the toggle was unchanged after Ctrl+Z. The clean re-run is in `loop`.

| ID | Result | Measured |
|---|---|---|
| **MT-DISABLED*** | PASS at 1440 and 1280 | Text `მეტრონომი`, `disabled`, `aria-pressed="false"`, title `მეტრონომი — ჯერ მიუთითე BPM`. Shots: `shots/mt-disabled-*.png`. |
| **MT-ON*** | PASS at 1440 and 1280 | BPM 40 + Enter, then a REAL click. Status verbatim `მეტრონომი ჩართულია — 40 BPM, 4/4: …ექსპორტში არ შედის.`, `aria-pressed="true"`, the enabled title verbatim. gstack cross-check gave the same (`runs/g66-3-direct.txt`). Shots: `shots/mt-on-*.png`. |
| **MT-BEATS (real audio)** | **PASS** | Details below. |
| MT-OFF | PASS | Space from 0 to 8.04 s: 667 samples, 0 rises, the meter at the floor (`-inf`) in every sample. |
| MT-LOOP | PASS | Details below. |
| MT-SEEK | PASS | Playing with the metronome on, a REAL ruler click at 7.0 (Snap on) at pos 5.2. The next rises were at **7.510, 9.011, 10.510**. No rise between 4.51 and 7.51 (the 6.0 beat was skipped by the seek, as it should be). |
| MT-LIVE-TOGGLE | PASS | Details below. |
| MT-TEMPO-CHANGE | PASS | Details below. |
| MT-MASTER | **PASS** | Details below. |
| MT-CLEAR | PASS (clean re-run) | F-SILENT, BPM 40, metronome on. Emptying the field + Enter gives status `ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა.` and the toggle `disabled`, `false`. Setting `40` again: enabled, still `false`. REAL Space from 0: the position moved 0 → 4.502 (328 samples) with **0 rises**. The first attempt was invalid (stalled transport). |
| **MT-EXPORT (real audio)** | **PASS** | Details below. |
| MT-UNDO | PASS | With a loop created, the Undo title was `Undo: Loop შეიქმნა` before on, after on and after off. Ctrl+Z (title recorded before it) undid the loop; `aria-pressed` stayed `true`. |
| **MT-KEYS*** | PASS at 1440 and 1280 | Details below. |
| **MT-LAYOUT*** | PASS at 1440 and 1280 | Details below. |
| MT-PERF-INFO (info) | info | Details below. |
| BD-INFO (info) | info | Details below. |

**MT-BEATS (real audio):**
- F-SILENT, BPM 40, metronome on, REAL Space from 0, sampled to 13.0 s (888 samples).
- **9 rises at 0.001, 1.502, 3.001, 4.502, 6.001, 7.502, 9.001, 10.502, 12.001**, all within ±0.002 s of the expected 0, 1.5 … 12. **No other rise.**
- The bar downbeats (0, 6, 12) peaked at **−6.3 dB** and the six other beats at **−12.5 dB**: **6.2 dB** higher, well above the required 4 dB. This matches the specified −6 / −12 dBFS clicks.
- The master peak readout shows `−6.3`, `clear` (no Clip).

**MT-LOOP:**
- The range drag (Snap on) + Ctrl+L created `Loop 00:02.000 — 00:05.000`, status `Loop შეიქმნა და ჩაირთო: …`.
- REAL Space from 2. My wait ran longer than planned, so the loop played **40 wraps**.
- There were 41 rises at 3.0 (±0.02) and 40 at 4.5. **No other rise**, and none at the wrap.

**MT-LIVE-TOGGLE:**
- Space from 0 with the metronome off. A REAL click turned it on at pos 3.71 and off again at 8.019.
- Rises: none before the on click; **4.51, 6.011 (accent), 7.51**; none after the off click.
- The position never went backwards (0 backward steps in 879 samples).

**MT-TEMPO-CHANGE:**
- Playing at 40 with the metronome on, a REAL click into the BPM field at pos 2.209, then `60` + Enter (committed at pos 2.459).
- The next rises were at **3.009 (within 0.55 s), 4.009 (accent: bar 2 at 60 BPM), 5.009, 6.009, 7.009**: whole seconds.
- Status `ტემპი 60 BPM · 4/4 — …`; the toggle is still pressed.

**MT-MASTER:**
- Playing at 40 with the metronome on, from 0. The rise at 0 is present.
- REAL Master Mute at pos 0.8 (`aria-pressed=true`): **no rise** at 1.5 or 3.0.
- Unmute at 3.6: rises at **4.502, 6.001, 7.502**.
- SFX track Mute at 5.2, then SFX unmute + SFX **Solo** at 8.2: rises unchanged at **9.001, 10.502**.
- So the Master volume/mute applies, and the track mute/solo does not affect the metronome.

**MT-EXPORT (real audio):**
- F-R65 fixture by REAL drops: Soft impact on SFX at 4.000 and Middle East on music at 7.000; video Mute on.
- **(a)** metronome off, no BPM: Export → WAV.
- **(b)** BPM 120 and metronome on. I first played 0–3.2 s, and the live clicks were seen on the meter, so the click buffers existed. Then I exported again.
- **Both WAVs are byte-identical:** sha256 `525958b4f0a721f9059b092ece6652538dcf6d8469cbb1f7e2707eb554e97ec6`, 31,205,420 bytes, 24-bit, 48 kHz, stereo, **5,200,896 frames (108.352 s)**.
- They are **also identical to round 65's** hash.
- Decode of (b): **every sample before frame 192000 (4.000 s) is exactly 0** (0 non-zero of 384,000).
- First audible frame 4.000 s in both.
- Files: `runs/export-1440x900-{a-off,b-on120}.wav`.

**MT-KEYS\*:**
- A REAL click on the toggle leaves focus on `arrangement-metronome-toggle`.
- REAL Space: playback starts (the position advances). Space again: it stops.
- `aria-pressed` was unchanged across both Spaces.
- `g` then toggled Snap (`on → off`).

**MT-LAYOUT\*:**
- At both viewports, with no BPM, with BPM 40 and with the metronome on:
  - the button is 416.25–496.73 px inside the cell 288–512 px;
  - button `scrollWidth` 78 = `clientWidth`; cell `scrollWidth` 223 = `clientWidth`;
  - the BPM input and `4/4` are visible;
  - chrome height **64 px**.
- **Lanes:** at 1440, video, music, stems and sfx are 81 px each, with the detail panel open at 687, height 144. At 1280, video is 65 px and the others 81 px, with the detail panel collapsed at 615, height 36. All of these equal round 65 TB-LAYOUT.
- Page `scrollWidth` equals the viewport.
- The button is 16 px tall (A review #7, Lows batch).

**MT-PERF-INFO (info):**
- F-R65, Space ×5 from 3 s; time from keydown to the first position-readout change.
- **Off:** 61, 60.1, 46.3, 59.4, 71.3 ms.
- **On at 120 BPM:** 56.2, 75.9, 58.5, 63.8, 55.5 ms.
- No measurable difference at a 108 s project (about 216 click nodes).
- The scrub case (A review #5) was **not measured**.

**BD-INFO (info):**
- BPM 999, REAL `=` presses up to the maximum zoom of 320 px/s.
- **Empty demo (30 s timeline):** 500 bar/beat marks; one zoom step took 21–46 ms.
- **With Middle East (133 s timeline, 5320 px at 40 px/s):** **2215 marks** at ≥ 190.7 px/s. A zoom step took **69–107 ms** at the high zooms and 30–64 ms below. DOM size was 3789 elements.
- This is evidence for ROOT-R65-M1-BEAT-DENSITY: the cost is noticeable but not blocking at demo length.

**Info observation (not a row):** at 120 BPM, the master-meter rise detector catches only some beats (0.5 s spacing × 20 dB/s release ≈ the 10 dB threshold). This is why §4.6 uses 40 BPM, and it is not a defect.

## 6. §4.7 — regressions: PASS

**TB-REG** (`runs/tb66reg-1440x900-ui_full-attempt1.txt`, round 65's script unchanged except the log name), all PASS:
- **TB-SET90:** bar `2` at 106.66 px = 2.666667 × 40, bar `3` at 213.33 px.
- **TB-SECONDS:** 30 ticks identical before and after.
- **TB-ESC:** `92.5` kept, status unchanged, field blurred.
- **TB-KEYS:** the field holds `g12 `; Snap, grid and position unchanged.
- Also: TB-DEFAULT (the header now reads `BPM4/4მეტრონომი`), TB-LAYOUT, TB-120, TB-INVALID, TB-DECIMAL, TB-CLEAR, TB-ZOOM, TB-UNDO and FOCUS-REG.

**PLAY-REG:** metronome off, F-R65, REAL Space from 3 s. The SFX track meter onset was at **4.022 s** (last silent sample at 3.990), within 4.0 ± 0.15.

**RU-REG:** `tools/ru66reg.cjs` passed 3 runs × 6 tries = **18/18**, with no BPM and with BPM 120:
- the ruler click seeks to 00:03.000;
- the vertical ruler drag zooms (91.4 → 77);
- a double-click Fits (77 → 91.4).

The one RU check inside the TB script missed its double-click Fit (77 → 77; the hit target was `arrangement-ruler`). That is the same miss as INFO-C65-RU-DBLCLICK-MISS. That script waits only 400 ms after the double-click, versus 500 + 700 ms in the dedicated script, and the ruler code is frozen this round. I recorded it as watch **INFO-C66-RU-DBLCLICK-MISS-2** (2 misses in 28 tries over two rounds, both in the TB script).

**REG-HYD:** no `hydrat`, `did not match` or `server rendered` console line on any of 9 fresh PW loads, or in the gstack console. The only console errors were the known root `/api/cart` CORS errors.

## 7. G66-3 — anonymous workspace and purchase protection: PASS

gstack, fresh state `c-round-66/c-browse.json` (`runs/g66-3-*.txt`, `shots/g66-3-studio-lab-1440-on.png`):

**Pages:**
- **Direct `/studio-lab`** at 1440:
  - 4 lanes and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`;
  - cookie length 0, `localStorage` only `czaba_session_id` (INFO-C65-LS-SESSION, root);
  - `scrollWidth` 1440;
  - the metronome on via REAL gstack click/type, with the status verbatim.
- **Header link:** `Studio LabDemo` (`@e7`) from `/` lands on `/studio-lab` with 4 lanes, the badge and the toggle.
- **`/studio/middle-east`:** `Sign in required`, no workspace, no toggle.

**Network:**
- **gstack:** no `/api/studio-token`, `/api/recording-*` or `/api/download` request, and no `Authorization` header.
- **R2:** the one `czaba-r2-proxy…workers.dev/middle-east/cover.jpg` request is at line 184, inside the **homepage** segment that begins at line 168 (`GET /`). The `/studio-lab` segment (lines 1–166) has none. This matches rounds 64 and 65.
- **Every PW run:** `bad 0` (filter includes `r2-proxy|workers.dev`) and `withAuth 0`. Hosts were only 127.0.0.1:5173, localhost:5199 (cart), Google Fonts, GTM and GA.

**Token rows** (13:31, `runs/curl-token.txt`): anonymous **401**; fake Bearer **403**.

## 8. Findings

**No bugs.** Info notes for B:

| ID | Note |
|---|---|
| INFO-C66-UI9-NO-PLAY | Mutation o3 (export map gets the cached click buffer) survives because UI9 exports without playing first, so the click-buffer cache is always empty. The browser covers it: MT-EXPORT (b) played with the metronome on before exporting, and the WAV was byte-identical. Lows batch: add a Play (or a `startGraph`) before UI9's "on" export. |
| INFO-C66-RU-DBLCLICK-MISS-2 | The ruler double-click Fit missed once, again in the TB script (400 ms wait). The dedicated script got 18/18. The ruler code is unchanged. Watch; if it recurs, B can schedule a check of the double-click with a fast preceding drag. |
| INFO-C66-METER-120BPM | At 120 BPM the meter rise detector cannot resolve every beat (release 20 dB/s × 0.5 s = the 10 dB threshold). This is a measurement limit, not a defect. Keep timing rows at slow tempi. |
| INFO-C66-BD-COST | BD-INFO: 2215 marks and 69–107 ms per zoom step at 999 BPM, max zoom, on a 133 s timeline. This is the input for ROOT-R65-M1-BEAT-DENSITY. |

A's own open gaps (not re-tested): review #3 (UI7 has no mid-loop start), #5 (scrub re-plans every click; not measured), #6 (no guard if the `AudioBuffer` constructor throws), #7 (16 px button, below WCAG 2.5.8), #8 (no `setMetronomeBpm(null)` on workspace unmount).

## 9. Ableton (two verdicts per §0.2 row)

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Switch next to the tempo, ticks on Play | PASS (MT-ON, MT-BEATS, MT-OFF, MT-LIVE-TOGGLE) | confirmed (§19.4, §3.1). The location differs: the tempo row's header cell. |
| Metronome volume via Preview/Cue, separate from Master | PASS for CZABA's rule: Master mute silences the clicks, track mute/solo does not (MT-MASTER) | deliberate difference (fixed level through the Master) |
| Tick interval Auto follows the denominator | PASS: a click every quarter at 40 and 60 BPM (MT-BEATS, MT-TEMPO-CHANGE) | confirmed (§19.4.1, Auto in 4/4) |
| Count-in, sound choice, rhythm, "only while recording" | not offered | confirmed that they exist in Live; simplification |
| Accented downbeat | PASS: 6.2 dB louder on bars 1, 2, 3 (MT-BEATS) | unconfirmed (not in B's captured text); no Ableton claim |
| Metronome not in the export | **PASS: byte-identical WAV, zeros before 4.000 s** (MT-EXPORT) | unconfirmed; CZABA requirement R15-T2 |
| Needs a tempo | PASS (MT-DISABLED, MT-CLEAR) | not applicable (Live always has a tempo) |

I did not re-browse the Ableton manual this round; I used B's captures as cited in §0.2. A test PASS does not by itself show Ableton parity.

## 10. Not run (honest)

- Out of scope per §4.10:
  - video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
  - the "fit video" step of find → add → fit video → export. This round ran find, add (REAL drops) and actual export.
  - the full FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root's);
  - the round 57–61 menu browser re-run.
- The click's sound quality and loudness by ear → Tech Lead **R66-T** (headphones, BPM 90).
- MT-PERF-INFO for the scrub case (A review #5).

## 11. Carried items for B and root (not touched)

**Root:**
- ARCH-CHECKPOINT-SRW14-PREFS (a)–(e), third request, now with the audio consumer.
- INFO-R61-FAKEBEARER-500 (did not occur; the backend was up: 403).
- INFO-C65-LS-SESSION.
- The round-64 gate was `committed_not_pushed`. Root to confirm the remotes.

**root-pre-push-review:**
- Video sync RF3-1, RF3-2, R5-L6 are open.
- R5-L3 is partial.
- R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only.
- M1: loop refill. The 200 ms pump exists; re-measure before any work.
- M2.
- Lows L1–L4 and L6–L8.

**publication-checkpoint:**
- SRW-21: the purchased loader hardcodes `middle-east`.
- Portable instruction paths.
- The SRW-23 scrollbar check.
- SRW-11/12 parity.
- T12.

**Lows batch:** ROOT-R64-L2…L6, ROOT-R65-L2/L4/L5/L6, INFO-C65-SELECT-FOCUS, A-R65 tempo-hint anchoring, INFO-C66-UI9-NO-PLAY, and A-R66 review #3/#5/#6/#7/#8.

**Commit readiness:** round 66 is commit-ready for root. The 8 paths:
- `app/lib/arrangement/metronome.ts`
- `app/lib/arrangement/graph.client.ts`
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/ArrangementTempoRow.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`
- `app/lib/arrangement/__tests__/metronome.test.ts`
- `app/lib/arrangement/__tests__/metronome-ui.test.tsx`
- `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md`

Doc 059's status line still says "C-ის შემოწმებას ელოდება". Root or B updates it, as with doc 058.

**Next (orientation only):** SRW-14 stage 5 (musical grid divisions from the BPM).
