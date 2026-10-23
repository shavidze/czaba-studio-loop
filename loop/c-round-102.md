# C round 102 — independent verification (Export dialog: focus guard measures the option card; progress text read once; doc 089 l.4)

Verifier: C · Date: 2026-10-23 · Environment: cloud runner, real headless Chromium (Playwright from store devDependencies), fresh incognito context per session, no credentials, Decline consent. Server `:5173/studio-lab` 200 (`env-status.json`, copied to `c-round-102/env-status-copy.json`). Backend `:5199` unavailable (expected).
Tools: `c-round-102/tools/` (`run102.cjs`, `lib102.cjs`, `run-g1023.cjs`, `mut102.cjs`, `setup-scratch.sh`, `wav.cjs`). Raw results: `c-round-102/out/`. Screenshots: `c-round-102/shots/`.

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. Every REAL-browser row of this round was run.

## Source state (SOURCE-UNCHANGED) — PASS
- Start and end: HEAD `56231c0`, `git status --short` = 3 M + 1 ?? (dialog, test file, doc 089, new doc 090). Frozen list 533/533 OK at start and end. Protected hashes unchanged (fa2cf0bc, 13914809, caa388e7, 0995ae78, 741c2341, ddb70919, 56f5b76f, bf9ee257, 23468664, 280fe7f2).
- End hashes match A: dialog `37be31c4`, test `b231b9b5`, doc 089 `a8fcdc92`, doc 090 `53e116a2`.
- Dialog hunks: `@@ -233 +233,7` (inside guard l.222–237), `@@ -241,0 +248` (one `progressText` line directly before `const handleClose`), `@@ -505,2 +512,6` and `@@ -511 +522` (inside l.503–517). Test file: one pure addition `@@ -491,0 +492,92 @@` (0 removed lines). Doc 089: `@@ -4 +4` only. C changed no source.

## Browser rows
| ID | Result | Evidence |
|---|---|---|
| **CARD-1280** | **PASS** | `out/run102-done1280.json`, `shots/done1280-scope-project-focused.png`. One clip (Enter on Middle East: 0→1 clips), real click on WAV-ის ექსპორტი, done `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.` Footer 163 px, top 520, panel top 36, max scroll 137. Tab from initial focus (დახურვა) → WAV-ის ექსპორტი → Close(X) → format-wav → **scope-project**: scrollTop **0 → 59** (≤ 137), radio bottom −24.5 px vs footer top, **card bottom −8 px** (B before +8, expected −8 ± 1), `elementFromPoint` at card bottom-centre −2 px = the card, card top 466 > panel top 36 (no overshoot). |
| **CARD-IDLE-REG** | **PASS** | `run102-idle1280.json`: scope-project card −41, format-wav card −389, scrollTop 0 throughout. `run102-idle1440.json`: cards −86 / −434, scrollTop 0. `run102-done1440.json`: cards −86 / −434, scrollTop 0 (max scroll 0). Every focused body control (or its card) clear of the footer. |
| **AX-ONCE** | **PASS** | WAV render (`done1280` `exp.ax[0]`, DOM label `რენდერი · 24%`): 0 non-ignored StaticText hits, exactly 1 progressbar named `ექსპორტის პროგრესი` with valuetext, the dialog's aggregated generic name holds the progress string **once** (`… მონაკვეთი რენდერი · 19% გაუქმება …`; B baseline had it twice). `<p>` has `aria-hidden="true"`, rect 494×16, visibility visible, text = `aria-valuetext`. MP3 path (`run102-mp3.json` `exp.ax`): mp3-phase sample `MP3-ის შექმნა · 0%` — 0 StaticText hits, 1 progressbar `ექსპორტის პროგრესი`, count 1. The second MP3 sample was taken when the DOM label already read `MP3 encoder-ის ჩატვირთვა…`, but the AX tree (fetched a moment earlier) still held `WAV-ის ჩაწერა · 59%`; it also shows the text once. So the valid MP3 sample is the mp3 phase; a load-phase AX snapshot was not captured cleanly (DOM-side load sample: label hidden, valuetext = label). |
| **VALUETEXT-REG** | **PASS** | MutationObserver sampler on every attribute/text change. 1280 WAV: 121 busy samples (render 20, wav 101), 1440 WAV: 121, MP3: 126 (render 20, wav 101, load 1, mp3 4). 0 valuetext≠label, 0 `"null"` strings, 0 `aria-live`/`role`, 0 wrong aria-label, label `aria-hidden="true"` and non-zero rect in every sample. |
| **FOCUS-REG** | **PASS** | 1280 idle: დახურვა → WAV-ის ექსპორტი → Close → format-wav → scope-project → დახურვა → WAV-ის ექსპორტი; Shift+Tab → დახურვა. Focus always in dialog. Same order at 1440 idle and in both done walks. |
| **STRIP-REG** | **PASS** | 1280 idle, wheel to max (45/45): gap 0, three probes hit the footer. 1440 done (max scroll 0): gap 0. Also 1280 done at max (137): gap 0; 1440 idle: gap 0. |
| **EXPORT-REG** | **PASS** | WAV (1280 and 1440, one download each): RIFF/WAVE, PCM tag 1, 2 ch, 48 kHz, 24-bit, 4 864 896 frames = 101.352 s, NaN 0, RMS 0.172. MP3: one file `czaba-studio-lab.mp3` 3 291 117 B, ID3 header, decodes in Web Audio (48 kHz, 2 ch, 101.352 s, peak 0.9987). ffmpeg core loaded from unpkg (CDN reachable). |
| **PX-NET** | **PASS** | All 7 sessions (4 layout/export, mp3, G102-3 ×2): 0 requests to studio-token/R2/recording-*/api/download from the page, 0 `Authorization` headers. Third-party: Google Fonts, `localhost:5199/api/cart` (cloud noise), unpkg ffmpeg (MP3 only), unsplash image on `/`. |
| **REG-HYD** | **PASS** | 0 non-noise console errors/warnings, 0 pageerror, no hydration warning in every session. |
| **G102-3** | **PASS** (+1 sub-check BLOCKED) | Run alone, last of the browser rows, 1280 and 1440 (`out/g1023-*.json`). Header link → `/studio-lab`, workspace 1, badge `დემო კოლექცია`. `/studio/middle-east`: "Sign in required", 0 workspace, 0 `audio[src]`. Anonymous `/api/studio-token` → **401** `Please sign in to access Studio.` localStorage holds no auth entry. Premium auth not bypassed. Fake-Bearer sub-check **BLOCKED: backend unavailable in cloud**. |

## Offline rows
| ID | Result | Evidence |
|---|---|---|
| **AN-REVIEW** | **PASS** | C's own scratch `c-round-102/mut/` (copy of store `app/`, verified identical by `diff -rq`, Vitest cacheDir in scratch), `out/mut102.json`: control 15/15; **fail-before** (snapshot `c2c32e1c` + new tests) red = FC1, FA1 (13 green) — matches §1, FC4 is A's extra test (green on baseline, explained); **a** target-only → FC1; **b** label-only → FT4 "scrolls the panel by overlap + margin", FC2, FC4; **d** no aria-hidden → FA1; **e** second format call → none (equivalence, refactor-only). Same reds as A. Added lines: 23 `expect` calls, all `toBe`/`toBeNull`; no `as` assertion (only the English word in FA1's title), no `@ts-`; `closest<HTMLElement>('label')` is a generic type argument, not an assertion. Mutation c not tested by C (A reports it untestable; agreed: no reachable DOM). |
| **T102-TARGETED** | **PASS** | C re-ran the §1 grep: 13 files, identical to `a-round-102/targeted-list.txt`. `npx vitest run` (in scratch, identical to store) → 13 files, **143/143** pass (`out/targeted.log`). |

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Ableton correspondence
Both rows: **არ ეხება** (no Ableton source; CZABA's own a11y/layout decisions, WCAG 2.4.11 aim and WAI-ARIA `aria-valuetext`). CZABA requirement: met in Chromium.

## Notes (not defects)
- **INFO-B101-VALUETEXT-CDP: confirmed as a CDP serialization artifact.** The CDP `valuetext` property is mojibake (`á ááááá á Â· 19%`), but re-decoding it as Latin-1 → UTF-8 gives exactly `რენდერი · 19%` (also for `WAV-ის ჩაწერა · 59%` and `MP3-ის შექმნა · 0%`). The DOM attribute is correct Georgian. A real screen-reader check stays a Tech Lead item.
- **Code-reviewer Low carried by A (open, unverified):** screen readers that ignore `aria-valuetext` on native `<progress>` (historically VoiceOver/Safari) would now lose the phase text, notably in the MP3 load phase. Not testable here (Chromium only, no screen reader). Keep for the Tech Lead with GATE97-S2/GATE101-S3.
- After CARD-1280, Tab onward to the Modal X scrolls the panel back to 0 (native focus scroll of a control at the top); returning to scope-project scrolls to 59 again. Expected behaviour.
- The 1-clip WAV has peak 1.0 with 30 full-scale samples; identical to C round 101's WAV (same demo source), so not a round-102 change. Recorded only.
- `root-pre-push-review.md` and `publication-checkpoint.json` are the round-3 (2026-10-07) records; they contain no finding relevant to this round's files.
- Architecture note (from A's code-reviewer, a proposal only): fold the dialog's four focus effects into one local hook if the region is touched again. For B's backlog.
- **Doc 090 check:** it has every TEMPLATE.md section and all five §1 items (B's +8/−8/≈59 measurements, the "larger of target and label" reason, the AX result with `aria-hidden` vs `aria-labelledby`, A-R88 #2/#3 closed by decision, INFO-B101-VALUETEXT-CDP). CR = 0 in doc 090 and in the test file. Its status line still says it waits for C, which is correct until the gate.
- **Not re-measured this round:** whether the footer (status, label, bar, Cancel) stays visible via `elementFromPoint` during a render. The round 101 evidence (`c-round-101/out/run101-strip*.json`, `notVisible` 0) still holds, and this diff changes no footer layout. VALUETEXT-REG here checks only the text/attribute equality, `aria-hidden`, and that the label rect is non-zero.
