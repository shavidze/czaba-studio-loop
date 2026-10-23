# C round 96 — verification of A round 96 (C-R95-N1 failed-source refusal text + GATE95-S1 doc 083 l.4)

**Verdict: PASS.** browserVerified=true, realVerified=true. Bugs: 0. Date 2026-10-23.
Environment: env-status.json `{"checkedUtc":"2026-10-23T02:03:15.1472705Z","round":96,"attempt":1,"store":200}`. Real Playwright Chromium (installed), headless. Each run used a fresh incognito context with no credentials. Input was real mouse and keyboard (click, Enter, ArrowUp, dblclick). Tools: `c-round-96/tools/r96.cjs`, `run-g933*.cjs`, `mut96.py`. Raw results: `c-round-96/out/*.json`. Screenshots: `c-round-96/shots/`.

Notation: F(t) = `„t“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`, ME = `Middle East — საჯარო preview`, HERO = `CZABA hero — საჯარო preview`. Every text comparison below is strict string equality.

## SOURCE-UNCHANGED (start and end) — PASS
- HEAD `e3e528821292705a8298e4fcc2f90986375496e4`. `git status --short` shows exactly 2 M (ArrangementContext.tsx, doc 083) and 2 ?? (failed-source-refusal.test.tsx, doc 084). The frozen list is 524/524 OK at both start and end. A's `end-hashes.txt` matches all 4 files (db7a477d / ab7c5d7b / d4bb4199 / 869f9238).
- `git diff -U0` hunks in ArrangementContext.tsx:
  - `@@ -166,0 +167,2` adds a module-level helper. It lies inside the l.158–186 range.
  - `@@ -1201` is inside the allowed l.1199–1203.
  - `@@ -1314` is inside the allowed l.1312–1316.
- Doc 083 changes only at l.4 (`C PASS (Round 95), გამოქვეყნდა e3e5288 (D-29z60)`).
- `stopLibraryPreview()` is still the first statement of the preview refusal block. No source edits were made by C.

## Browser rows
| ID | Viewport | Result | Evidence |
|---|---|---|---|
| FAIL-ADD | 1280, 1440 | PASS. The collection status is `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. Click ME, then Enter: status === F(ME), clips 0 → 0, the status contains no `ჯერ არ ჩატვირთულა`. The row still reads `… შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)` and has draggable=false. `＋ დამატება` and `▶ მოუსმინე` are disabled. | out/fail-*.json `failAdd`; shots/fail-add-*.png |
| FAIL-PREVIEW | 1280, 1440 | PASS. The status was first changed by a ready HERO add, so the before-text differs. HERO preview started: row `▶ ისმის`, toggle `■ შეჩერება`, **measured output RMS 0.031**. Refocusing the HERO row kept the preview. ArrowUp moved selection and focus to ME. Then: no row shows `▶ ისმის`, the toggle is `▶ მოუსმინე` and disabled, status === F(ME), **RMS 0 after 400 ms**, clip count unchanged (1). | out/fail-*.json `failPreview`; shots/fail-preview-*.png. **Departure from the row's wording:** B asked for a ready *synthetic* row. The synthetic rows are not next to ME in list order. HERO is ready and is next to ME, so one ArrowUp exercises the exact `selectLibraryOption → startLibraryPreview(ME)` path. The synthetic preview itself is covered by READY-REG. |
| FAIL-DBL | 1280 | PASS. The status was first set by a ready HERO add (`… 02:30.372-ზე (უახლოესი თავისუფალი ადგილი).`). Double-clicking ME gave status === F(ME), clips 2 → 2. | out/fail-1280x720.json `failDbl`; shots/fail-dbl-1280x720.png |
| FAIL-BOTH | 1440 | PASS. Both demo URLs were aborted. `failed(2)` appears first and stays after 2 s. Enter on ME gives F(ME), Enter on HERO gives F(HERO). Clips stay 0. | out/both-1440x900.json; shots/fail-both-1440x900.png |
| LOADING-REG | 1280, 1440 | PASS. The ME request was held for 6.0 s. While the row showed `იტვირთება…`, Enter gave exactly `„ME“ ჯერ არ ჩატვირთულა.` (unchanged) with 0 clips. After release, the status was the demo `ready` text, the row showed `01:41.352`, and Enter added 1 clip on `music` (`… დაემატა მუსიკა ხაზზე 00:00.000-ზე.`). | out/loading-*.json; shots/loading-*.png |
| READY-REG | 1280, 1440 | PASS. Normal load, Enter on ME: 0 → 1 clip on `music`. The synth-mix preview showed `▶ ისმის` / `■ შეჩერება` with **RMS 0.11964**. Stopping it gave RMS 0 and no `▶ ისმის`. | out/normal-*.json; shots/ready-*.png |
| DEMO-LOAD-REG | 1280, 1440 | PASS. The status is exactly `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).` and holds after 2 s. All 9 rows show durations. `/middle-east.mp3` and `/videos/hero/hero-music.mp3` were each requested exactly once, in every run including the abort and hold runs. | out/normal-*.json |
| PX-NET | all sessions | PASS. 0 app-initiated requests to studio-token, R2, recording or download URLs, and 0 Authorization headers. Third-party traffic was only Google Fonts, the Unsplash home image, and `localhost:5199/api/cart` (backend absent; expected noise). The two `/api/studio-token` probes in G96-3 are C's own `ctx.request` calls, not app traffic. | `forbidden`/`auth` in every out/*.json |
| REG-HYD | all sessions | PASS. 0 hydration messages, 0 non-noise console errors, 0 pageerrors. | `hyd`/`errors` in out/*.json |
| G96-3 | 1440, 1280 | PASS. The visible header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows `Sign in required` with 0 workspace and 0 `audio[src]`. Anonymous `/api/studio-token` returns 401 `Please sign in to access Studio.`. **Premium auth is not bypassed.** The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud; it returned 500 `Unable to prepare Studio access`, with no token and no audio). | out/g963.json, out/g963-1280.json; shots/g963-* |

Measurement method: an init script wraps `AudioNode.prototype.connect`. Whenever a node connects to `AudioContext.destination`, the script also connects it to one AnalyserNode per context, and C reads the max time-domain RMS over 6 × 50 ms. This measures only and does not change the app's routing.

Invalid attempt: the first `fail 1280` run hit a cold dev-server start. The library option locator timed out after 30 s, so no JSON was written. The rerun passed. This attempt is not counted, and the budget allows it.

## HISTORY-REG (neighbour: a refusal adds no Undo entry), 1280 and 1440 — PASS
`tools/undo96.cjs` aborts ME and reads the Undo button before and after each refusal:
- Enter on ME: `↶Undo` (disabled) → `↶Undo` (disabled).
- After a ready HERO add, double-clicking ME leaves `Undo: დამატება — CZABA hero — საჯარო preview` unchanged.
- HERO preview, then ArrowUp onto ME: the label is unchanged again.

Each refusal's status === F(ME). Evidence: out/undo-1280.json, out/undo-1440.json.

## AN-REVIEW — PASS
- My own scratch at `c-round-96/mut/` uses a copy of app/, a node_modules symlink and Vitest `cacheDir` in scratch. Results are in `c-round-96/mutation-results.json`. My mutations were written independently of A's patterns:
  - a (add-block condition forced false) → red FS1, FS2, FS8.
  - b (preview error branch made unreachable) → red FS4.
  - d (the `stopLibraryPreview()` call before the refusal status removed) → red FS4.
  - control → 8/8 green.
- Fail-before against B's baseline snapshot c98fc743: FS1, FS2, FS4 and FS8 are red, and FS3, FS5, FS6 and FS7 are green. This matches §1 and A exactly.
- The test file has no `as` or `as const`. The status assertions use `toBe` against local literal helpers (`failedText` and `loadingText` are defined in the test, not imported from the implementation). The file imports nothing from other test files. `afterEach` unstubs globals and restores mocks.

## T96-TARGETED — PASS
`npx vitest run $(cat a-round-96/targeted-list.txt)` passed: 6 files, 83 tests (failed-source-refusal 8, collection-load-status 10, grid-snap-loop-drop 36, purchased-collection-ui 6, library-preview 4, gesture-guard 19). The per-file counts are shown in the full log, `c-round-96/targeted-c.log`, re-run once with complete output. A `grep -rl` for the three patterns under app/ `__tests__` finds no file outside the list.

## Gate rows (not claimed)
These are left to the gate: full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Ableton correspondence
The refusal text for a failed library file is **არ ეხება** (not applicable). It is CZABA's own web-loader text, and no Ableton claim is made or checked.

## Notes for B
- No new bugs. C-R95-N1 is closed in the browser at both viewports.
- The drop and ghost texts were not exercised for a failed source. That path is unreachable, because the error row is draggable=false (re-confirmed). They stay covered by grid-snap-loop-drop (green).
- The Architecture note from A's reviewer (refusal-reason mapping as a pure function, keep for now) is a B signal only.
- Regression round: `regression-last.json` is 2026-10-21, so the first round planned on or after 2026-10-24 is the regression round.
