# C round 100 — verification of B-R98-H1-PREVIEW-TOGGLE-HOLD + GATE99-S1-DOC087-STATUS

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. Date 2026-10-23. Verifier C (read-only for source).

Environment (`env-status.json`, copy in `c-round-100/env-status-copy.json`): store 200, round 100, attempt 1. Backend :5199 unavailable (cloud, expected). Playwright with installed Chromium (headless), a fresh incognito context per scenario, no credentials, consent declined. Tools: `c-round-100/tools/` (`lib100.cjs` copied from lib99, `run100.cjs`, `run-g1003.cjs`, `mut100.cjs`, `setup-scratch.sh`). Raw results: `c-round-100/out/`. Screenshots: `c-round-100/shots/`.

## Method
- **Input:** real Playwright keyboard and mouse. "Held Enter" means `keyboard.down('Enter')`, then 3 more `down` 50 ms apart, then `up`, then a 1.2 s wait. That is 4 keydowns, per the task.
- **Recorder:** a capture-phase recorder from `addInitScript` logs keydown (key, repeat, activeElement, isTrusted) and clicks (target and data-testid).
- **Label timeline:** a MutationObserver records the ▶/■ label of the toggle with `performance.now()` stamps.
- **defaultPrevented:** read by a bubble listener installed late, after app load (C-R98-N4).
- **Audio:** output RMS uses the C round 96 method, copied verbatim from `c-round-96/tools/r96.cjs`. An init script adds an AnalyserNode tap on every connect to `AudioDestinationNode`, and `rms()` takes the best of 6 reads over 2048 samples. Thresholds are also from r96: playing > 0.001, stopped < 0.0005.
- **Order:** rows ran one after another. G100-3 ran alone, after all held-key runs (C-R99-N1).

## Results

| ID | Result | Evidence |
|---|---|---|
| **HOLD-TOGGLE 1280×720** | PASS | `out/run100-1280x720-holdtoggle.json`, `shots/holdtoggle-1280x720.png`, `holdtoggle-stopped-1280x720.png` |
| **HOLD-TOGGLE 1440×900** | PASS | `out/run100-1440x900-holdtoggle.json`, `shots/holdtoggle-1440x900.png` |
| **FRESH-TOGGLE** (1280) | PASS | tight run: `out/run100-1280x720-freshtight.json`, `shots/freshtight-1280x720.png`; first, looser run: `out/run100-1280x720-freshtoggle_….json` |
| **WAVE-REG** (1280) | PASS | same JSON, `shots/wavereg-1280x720.png` |
| **HOLD-PLUS-REG** (1280) | PASS | same JSON, `shots/holdplus-1280x720.png` |
| **HOLD-ROW-REG** (1280) | PASS | same JSON, `shots/holdrow-1280x720.png` |
| **EXPORT-REG** (1280) | PASS | same JSON, `out/holdrow-1280x720-1-czaba-studio-lab.wav`, `shots/exportreg-1280x720.png` |
| **PX-NET** | PASS | all 9 sessions |
| **REG-HYD** | PASS | all 9 sessions |
| **G100-3** (1440 and 1280) | PASS; fake-Bearer sub-check BLOCKED | `out/g1003-1440x900.json`, `out/g1003-1280x720.json`, `shots/g1003-*.png` |
| **AN-REVIEW** | PASS | `out/mut100.json` |
| **T100-TARGETED** | PASS | `out/targeted.log` |
| **SOURCE-UNCHANGED** | PASS | `c-round-100/start-hashes.txt` = `end-hashes.txt` |

### HOLD-TOGGLE (both viewports, identical results)
- **Focus:** the Middle East row was clicked, then the toggle got focus with `locator.focus()`. activeElement = `BUTTON[arrangement-library-preview-toggle]:▶ მოუსმინე`. The toggle itself was not clicked.
- **Keydowns:** 4 Enter keydowns, all on the toggle, `repeat` false/true/true/true. Late `defaultPrevented` was false/true/true/true.
- **Clicks:** exactly **1** click (trusted, detail 0) on the toggle, 1 ms after the first keydown.
- **Label:** it changed once, ▶ მოუსმინე → ■ შეჩერება, about 25 ms after the keydown. It was still **■ შეჩერება** 1.2 s after keyup.
- **Output RMS:** 0 before the hold, **0.17319 at 1.2 s**.
- **Clips:** 0 → 0.
- **Stop:** one `keyboard.press('Enter')` gave 1 keydown (repeat=false) and 1 click. The label went to ▶ მოუსმინე, and RMS was **0** after 400 ms.
- A's before-fix run (`a-round-100/repro-before.json`) recorded 4 clicks and an end state of ▶. On the fixed code the hold now **discriminates**: it ends ■ and audible.

### FRESH-TOGGLE (1280)
**First run (looser spacing, kept as extra evidence).** Each step slept 300 ms and then read RMS, which itself takes about 300 ms (6 × 50 ms). The real gap between inputs was therefore about 600–700 ms, not 300 ms. Each of the 4 steps made 1 click on the toggle and 1 label change.

| Step | Label | RMS | Keydown |
|---|---|---|---|
| press 1 | ▶ → ■ | 0.11343 | 1, repeat=false |
| press 2 | ■ → ▶ | 0 | 1, repeat=false |
| mouse click 1 | ▶ → ■ | 0.11356 | none |
| mouse click 2 | ■ → ▶ | 0 | none |

**Tight run (the acceptance; `out/run100-1280x720-freshtight.json`, raw `performance.now()` stamps kept).**
- **Single press:** one `press('Enter')` gave ■ with RMS **0.11343**. The next press gave ▶ with RMS 0.
- **Two presses 300 ms apart:**
  - keydowns at 10772 and 11079, both repeat=false;
  - clicks on the toggle at 10773 and 11080 (gap **307 ms**);
  - label timeline ▶ (10771) → ■ (10777) → ▶ (11084);
  - RMS 0 afterwards.
- **Two mouse clicks 300 ms apart:**
  - clicks on the toggle at 11829 and 12163 (gap **334 ms**), no keydown;
  - label ▶ → ■ (11834) → ▶ (12166);
  - RMS 0 afterwards.
- Each input made exactly 1 click and 1 label change. A deliberate fast second press is not blocked.

### WAVE-REG (1280)
- The waveform (tabindex 0) got focus with `locator.focus()`.
- **Keydowns:** 4 Enter keydowns on the waveform, repeat F/T/T/T.
- **Label:** it changed once (▶ → ■) and was still ■ at 1.2 s. RMS was **0.16198**.
- **Clicks:** 0. As expected, the waveform handler prevents and stops the Enter itself, so the late bubble listener was never reached ("NOT-REACHED"). This matches l.202–204, which were not changed.
- **Stop:** one more Enter gave ▶, RMS 0.

### HOLD-PLUS-REG / HOLD-ROW-REG / EXPORT-REG (1280)
- **＋ დამატება:** 4 keydowns (F/T/T/T). The 3 repeats had `defaultPrevented=true`. Exactly 1 click on ＋, and clips went 0 → **1**. The preview label stayed ▶.
- **Middle East row:** 4 keydowns (F/T/T/T) on the row, and clips went 0 → **1**. Status: „Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.
- **Export:** opened with a click, WAV format, run to the end.
  - Status: `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.`
  - **One** download: `czaba-studio-lab.wav`, 29 189 420 B.
  - Parsed header: RIFF/WAVE, PCM (tag 1), 2 ch, 48 000 Hz, 24-bit, 4 864 896 frames = **101.352 s** (matches the status).
  - Samples: 0 NaN, RMS 0.172, peak 1.0.
  - 30 full-scale samples. This is the known pre-existing level of the stock demo (C round 99 measured the same 30, DEMO-SFX-FULL-SCALE / C-R99 N3). It was not introduced this round.

### PX-NET / REG-HYD (all 9 sessions)
- **Network:** 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. PX-NET counts only requests the app page makes. The G100-3 token probe (401, below) is the test's own Playwright `APIRequestContext` call, which G100-3 requires. It is not an app request, so there is no contradiction.
- **Third-party requests:** only Google Fonts, the homepage Unsplash image (G100-3) and `localhost:5199/api/cart` (expected cloud noise).
- **Console:** 0 non-noise console errors or warnings and 0 pageerrors. The noise was 2 messages per session (cart/connection refused).
- **Noise filter check:** the filter regex (`cart|ERR_CONNECTION|…|Download the React DevTools`) does not match React hydration warnings ("Warning: Text content did not match…", "Hydration failed…"), so REG-HYD is not blind.

### G100-3 (anonymous, run alone after all held-key runs; 1440×900, then again at 1280×720 with identical results)
- **Header link:** the visible "Studio Lab" link in the header opened `/studio-lab` with the workspace (grid control present) and the demo badge ("დემო კოლექცია").
- **Protected route:** `/studio/middle-east` shows "Sign in required…" with 0 workspace and 0 `audio[src]`.
- **Token:** `GET /api/studio-token?product=middle-east&file=stem1.wav` → **401** `{"error":"Please sign in to access Studio."}`.
- **Storage:** localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id`. There is no `auth_user`.
- **Premium auth is not bypassed.**
- **Fake-Bearer sub-check:** BLOCKED (backend unavailable in cloud).

### AN-REVIEW (C's own scratch `c-round-100/mut`, Vitest cacheDir in scratch, store untouched)

| Variant | Red tests |
|---|---|
| unmutated control | none (7/7) |
| fail-before (B snapshot `f074a9bb` + extended test) | **HT1** only (6 pass / 1 fail) |
| a: toggle guard removed | **HT1** |
| b: guard without the `key` check | **HT3** |
| c: guard + `stopPropagation()` | **HT3** |
| d: guard on every Enter | HT1 + HT2 |

- The results match A's table and B's §1. Mutation d reddens HT1 as well as HT2, a superset of B's "→ HT2". That is acceptable: a guard on every Enter also prevents the first keydown, which HT1 asserts returns `true`.
- **The HT3 difference** that A reports is only against A's own stricter first draft. The final HT3 matches B's §1 wording: a repeated `q` is not prevented, and a `document` listener receives the repeated Enter. A also added a lock that a repeated Space is not prevented. That is extra, it is consistent with "Space is not touched", and it is green on the baseline.
- The mutation regex was anchored on the toggle's `startLibraryPreview(source.id, 0)` onClick, so the ＋ guard was never mutated. Mutation a turning only HT1 red confirms this.
- **Assertions:** they are exact (`toBe` / `toEqual`). The added lines have no `as` and no `@ts-` (grep of the `+` lines).
- **Test hunk:** `@@ -286,0 +287,39 @@` is one pure addition after the last existing `it` and inside the describe. In the snapshot the last `it` ends at l.286, not at l.285 as the task says. A explained this; it is consistent with the snapshot.
- **Component hunk:** `@@ -292,0 +293,5 @@` is a pure addition inside the toggle `<button>`, between `onClick` and `disabled`. It is the exact ＋ rule: `event.key === 'Enter' && event.repeat` → `preventDefault()`, with no stopPropagation.

### T100-TARGETED
- **Grep:** C re-ran the grep from §2 (`ArrangementLibraryPreview|preview-toggle|მოუსმინე|startLibraryPreview|stopLibraryPreview`). It returns `library-preview.test.tsx` and `failed-source-refusal.test.tsx`.
- **List:** with the two named files (held-enter-add, render-budget), that equals A's `targeted-list.txt`. No file is missing.
- **Run:** `npx vitest run $(cat a-round-100/targeted-list.txt)` from `store/` gave **4 files, 30/30 passed**:
  - library-preview 7;
  - held-enter-add 8;
  - render-budget 7;
  - failed-source-refusal 8.

### SOURCE-UNCHANGED (start and end identical)
- **HEAD:** e2412db337e9015def8dc6855358437b900ff51e.
- **Tree:** `git status --short` shows 3 M (`ArrangementLibraryPreview.tsx`, `library-preview.test.tsx`, doc 087) and 1 ?? (doc 088).
- **Frozen list:** 531/531 OK at start and end.
- **Hashes:** the 4 hashes equal `a-round-100/end-hashes.txt`: 2c475d18…, 7d0126be…, 61c3f646…, 0a77d036….
- **Hunks:** all lie in the allowed lines. Doc 087 changes only l.4: `**სტატუსი:** C PASS (Round 99), გამოქვეყნდა e2412db (D-29z64)`.
- **Doc 088:** in Georgian, LF (CR=0). Its status says the round is waiting for C (D-29z65).

## Gate rows (not claimed by C)
- full vitest;
- typecheck;
- build;
- Biome;
- `npm run verify`;
- `npm run test:e2e:smoke`;
- PROD-MP3-UNVERIFIED.

## Ableton correspondence
| Behaviour | Status | Note |
|---|---|---|
| One held Enter on the preview button toggles once | **დაუდასტურებელი** (unconfirmed) | This is CZABA's own rule (one press = one action, SRW-12 R12-L2). No Ableton source was consulted, and C makes no Ableton claim. |

Two things are assessed separately:
- **CZABA requirement:** met. The browser rows above show it.
- **Ableton behavioural match:** unconfirmed.

## Notes for B (no new bugs)
- **N1 (info):** the task text puts the last `it` at l.285, but the snapshot has it at l.286. This is a wording error in the task only.
- **N2 (info, pre-existing, also noted by A's reviewer):** ▶ მოუსმინე starts the preview from 0, while a waveform click or the waveform's Enter/Space starts from the cursor. This is not a regression and is outside this round.
- **N3 (info):** these remain untested:
  - Space on the focused toggle (unchanged by design);
  - browsers other than Chromium;
  - environments that send auto-repeat as `repeat=false` (the doc 085 boundary).
- **Regression round:** `regression-last.json` is 2026-10-21. The next B planning on or after 2026-10-24 is due to be a regression round, as the task says.
