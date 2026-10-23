# C round 94: verification report (D-29z59: collection load status + purchased MP3 names test)

Verifier: C · 2026-10-23 · **Verdict: PASS** · `browserVerified=true`, `realVerified=true` · bugs: 0

Environment: `env-status.json` round 94, store 200. Playwright Chromium was run headless, one session at a time. Every session used a fresh incognito context with no storageState and no credentials (`c-browse.json` records this). One warm-up load of `/` and `/studio-lab` ran first. The backend `:5199` is unavailable, as expected. Tools are in `c-round-94/tools/`, measurements in `c-round-94/out/`, screenshots in `c-round-94/shots/`.

## Source state (start = end)
- HEAD `85fcb05`. `git status --short` shows exactly 5 M + 2 ??.
- The frozen list `b-round-93-r94-tree-sha256.txt` is 518/518 OK at start and at end. It includes every protected file in the Baseline table, so the protected hashes are covered. I grepped the list and found all 13 protected or frozen-this-round files, each with its Baseline prefix (`fa2cf0bc`, `13914809`, `caa388e7`, `0995ae78`, `741c2341`, `ddb70919`, `56f5b76f`, `bf9ee257`, `23468664`, `280fe7f2`, `69ac90f7`, `1270f6c5`, `0040e050`).
- A's `end-hashes.txt` is 7/7 OK at start and at end.
- `git diff -U0` hunks:
  - ArrangementContext: `@@ -3001,0 +3002,6` and `@@ -3014 +3019,0`, both inside l.3000–3016.
  - collection.ts: @9, @19 and @29, inside l.4–29.
  - collection.test.ts: @378 and @388. These only add the two `empty:` lines (PC9).
  - Doc 081: @4. Workspace doc: @44.
- Mutations and fail-before ran only in `c-round-94/mut/`. `store/` was unchanged afterwards.

## Results (CZABA requirements)
| ID | Result | Evidence |
|---|---|---|
| DEMO-LOAD-REG 1280 | PASS | `out/load-1280x720.json`. (a) SSR status: exactly `დემო კოლექცია იტვირთება…`, no NUL in the HTML. (b) Both audio files held: that text right after goto and 3 s later. Library rows showed `იტვირთება…` and were not draggable. After release: exactly the demo `ready` text, still the same 3 s later. (c) `/middle-east.mp3` aborted: exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`, still the same 2 s later (screenshot `load-abort-1280x720.png`). Each demo URL was requested once. |
| DEMO-LOAD-REG 1440 | PASS | `out/load-1440x900.json`, with identical results. |
| STATUS-PERSIST 1440 | PASS | `out/persist-1440.json`. After ready, Ctrl+L with no range gave `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.`. That text stayed byte-identical after a 5 s wait, Export open, Escape close, 1280×720 and back to 1440×900. `/middle-east.mp3` and `/videos/hero/hero-music.mp3` were each requested exactly once, so the load effect did not re-run. Export is enabled on an empty arrangement, which is existing behaviour. |
| EMPTY-SWAP-REACH | **unit-only** (not PASS, not FAIL) | `app/routes/studio-lab.tsx` passes the module constant `studioLabDemoCollection` (`app/data/studio-lab-demo.ts` l.128), and the purchased route is not mounted. An empty collection or a swap cannot be produced in the browser. Proof is LS1–LS5 and LS3b only. |
| EXPORT-REG 1280 (WAV range 4–9) | PASS | `out/export-1280x720.json`. Readout `00:04.000 — 00:09.000`; range scope checked. `suggestedFilename` was `czaba-studio-lab-range.wav`. Message exactly `WAV შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 24-bit · 48 kHz · stereo.`. File: RIFF/WAVE, PCM tag 1, 24-bit, 48 kHz, 2 ch, 240000 frames = 5.000 s, NaN 0, RMS 0.136. No unpkg request. |
| EXPORT-REG 1440 (MP3 project) | PASS | `out/export-1440x900.json`. Project `00:00.000 — 01:41.702`. File `czaba-studio-lab.mp3` (ID3 header). Message exactly `MP3 შეიქმნა: 01:41.702, 48 kHz · stereo.`. Decodes in Chromium to 48 kHz, 2 ch, 101.702 s. unpkg requests (`ffmpeg-core.js`/`.wasm`) happened only after the MP3 export click; 0 before it. |
| PX-NET | PASS | All sessions: 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. Audio came only from the two demo files. Other third-party requests were Google Fonts and `localhost:5199/api/cart`, which is expected noise in the cloud. |
| REG-HYD | PASS | The hydration/"did not match" console tap was empty in every load, persist and export session. No non-noise console error and no pageerror. |
| G94-3 | PASS (fake-Bearer part BLOCKED) | `out/g943.json`. The visible header link `Studio LabDemo` opens `/studio-lab` with the workspace and the demo badge. Anonymous `/studio/middle-east`: "Sign in required", no workspace, no `<audio src>`. Anonymous `/api/studio-token`: 401 `Please sign in to access Studio.`. Fake Bearer: 500 `Unable to prepare Studio access`, the same as round 93. **BLOCKED: backend unavailable in cloud.** No token was issued, so this is not an auth bypass. |
| AN-REVIEW | PASS | Details below. |
| T94-TARGETED | PASS | `npx vitest run $(cat a-round-94/targeted-list.txt)`: 39 files, 716 tests passed (`c-round-94/targeted-c.log`). |
| SOURCE-UNCHANGED | PASS | See above. |

### AN-REVIEW details
- **Fail-before** (C scratch, B's baseline snapshots; `c-round-94/fail-before.txt`): 7 red (LS1, LS2, LS3, LS3b, both LS4 cases, LS5) and 3 green (LS6, LS7, PM1). This matches A's report. A's explanation for LS4 is correct: the spec's post-swap `PURCHASED_LOADING` assertion cannot pass on the baseline.
- **Mutations re-run by C** (`c-round-94/mutations.log`, `c-round-94/mutation-results.json`):
  - a: red LS3, LS3b, LS4×2, LS5.
  - b: red LS1, LS2, LS5.
  - f: red PM1.
  - Unmutated control: 41/41 pass.
  - All three match A's table.
- **Assertion quality:**
  - Status checks use `toBe` against literal Georgian constants (l.49–58). They are not imported from `collection.ts`, so a copy drift would be caught.
  - `loadSource` call counts and `signal.aborted` are asserted.
  - PM1 asserts exact download arrays and `exportState.phase === 'done'`.
  - Row checks use `toContain('იტვირთება…')`, which is acceptable for a row fragment.
  - LS4 uses `not.toContain` on `['ready','error']` for the stale source. That is weaker by design, per the reviewer's fix; mutation e (A's run) covers the guard.

## Ableton correspondence
- **Collection load/empty status:** not applicable. This is CZABA's own web collection loader, and B's table has no source.
- **Export file names:** not applicable (CZABA naming).
- No claim of Ableton equivalence is made.

## Gate rows (not claimed by C)
- Full vitest
- typecheck
- build
- Biome
- `npm run verify`
- `npm run test:e2e:smoke`
- the production bundle (PROD-MP3-UNVERIFIED)

## Notes for B (not bugs of this round)
- `docs/technical/arrangement-workspace.md` l.45 still points to doc 080 rather than 082. It was outside A's grant.
- `sourceStates`, buffers, peaks and `selectedSourceId` are not cleared on a collection swap. This predates round 94 (reviewer note). Plan it before the SRW-21 mount.
- Known and intended: both exports show the demo-mix clipping alert (+1.7 dBFS; 456 and 470 samples clamped). After the aborted load, the demo row shows `შეცდომა: Failed to fetch` (C-R92-N1, Lows part 3).
- COLLECTION-EMPTY-STATUS and GATE92-S1 can close as **unit-proven**. Their browser half must be re-checked when SRW-21 mounts the purchased route. GATE92-S2 is closed by PM1 together with the browser demo-name regression.
