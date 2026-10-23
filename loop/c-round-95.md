# C round 95 — verifier report (C-R92-N1 demo loader Georgian error text + doc status lines, D-29z60)

Verifier: C · 2026-10-23 · **Verdict: PASS** · `browserVerified=true`, `realVerified=true` · 0 bugs · 1 Low observation for B (existing behaviour).
Environment: `env-status.json` round 95, store 200. Real Playwright Chromium (headless), a fresh incognito context per session, no credentials. Server warmed once (`tools/warm.cjs`). Source was read-only; scratch work only in `c-round-95/mut/`.

## Source state (start and end): SOURCE-UNCHANGED, PASS
- HEAD `0513439`. `git status --short` shows 3 M + 2 ?? exactly as the task says. Frozen list 522/522 OK at start and end. A's `end-hashes.txt` matches 5/5 at start and end.
- `git diff -U0`: `studio-lab-demo.ts` changes only at baseline l.106 and l.110, both inside `loadDemoSource` (l.99–126). Doc 082 changes only l.4. `arrangement-workspace.md` changes only l.44–45, plus one appended bullet at l.46.
- The diff is the planned E1: fetch and body-read errors map to `ფაილი ვერ ჩაიტვირთა (ქსელი)` unless the signal is aborted (then the same error is rethrown); decode errors map to `ფაილი ვერ გაიშიფრა`, with the `await` inside the `try`; `credentials:'omit'` and `signal` are unchanged.

## Browser rows (tools `c-round-95/tools/err95.cjs`, `audio95.cjs`, `run-g933.cjs`; data `c-round-95/out/`; screenshots `c-round-95/shots/`)
| ID | VP | Result | Evidence (exact) |
|---|---|---|---|
| ERR-NET | 1280, 1440 | PASS | The row reads `Middle East — საჯარო preview მუსიკა შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`. `Failed to fetch` does not appear in `body.innerText`, and no other English error text either (regex Failed to fetch/decode/Unable/EncodingError/TypeError/DOMException/NetworkError/net::/Error: gives 0 hits). Status is exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`, both at first settle and 2.5 s later. The other 8 rows show durations (02:30.372, 00:02.000, 00:05.000, 5×00:16.000). Shots `net-1280x720.png`, `net-1440x900.png`. |
| ERR-DECODE | 1280, 1440 | PASS | Served with 200 / `audio/mpeg` / `not audio`. The row shows `შეცდომა: ფაილი ვერ გაიშიფრა`. No English decoder text. Status is `failed(1)` as above. The other 8 rows show durations. |
| ERR-HTTP | 1280 | PASS | Served with 404. The row shows `შეცდომა: ფაილი ვერ ჩაიტვირთა (404)`. Status is `failed(1)`. |
| ERR-BOTH | 1440 | PASS | Both URLs aborted. Both rows show `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`. Status is exactly `დემო კოლექციიდან 2 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. The 7 synthetic rows show durations. |
| ERR-ADD-REFUSED | 1280 | PASS (behaviour recorded) | After ERR-NET the row is `draggable=false` and `aria-selected=true`, and `＋ დამატება` is disabled. Clip count was 0 before, 0 after Enter, and 0 after a real mouse drag onto the music lane. Status after both attempts: `„Middle East — საჯარო preview“ ჯერ არ ჩატვირთულა.` (see N1). Shot `add-refused-1280x720.png`. |
| DEMO-LOAD-REG | 1280, 1440 | PASS | Status is exactly the demo ready text `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).`. All 9 rows show durations. `/middle-east.mp3` ×1 and `/videos/hero/hero-music.mp3` ×1. In every error session each demo URL was also requested exactly once (no retry and no double fetch). |
| AUDIO-REG | 1440 | PASS | Middle East added with Enter goes to `music` at 00:00.000 (1 clip). Project WAV export: `czaba-studio-lab.wav`, 29,189,420 B, RIFF/WAVE, PCM 24-bit, 48 000 Hz, 2 ch, 4,864,896 frames = 101.352 s, which equals the decoded source duration of 101.352 s. NaN 0, RMS 0.17199, peak 1.0. **Real decoded audio is present:** a normalised cross-correlation against `/middle-east.mp3`, decoded in the browser at 48 kHz (4 s window from 10 s, ±2 s search), gives **c = 1.0 at lag 0**. Status `WAV შეიქმნა: 01:41.352, 24-bit · 48 kHz · stereo.` (`out/audio-1440x900.json`). |
| PX-NET | all 10 sessions | PASS | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`. 0 `Authorization` headers. 0 unpkg requests. The only third parties are Google Fonts and `localhost:5199/api/cart` (expected cloud noise). |
| REG-HYD | all sessions | PASS | 0 hydration messages, 0 non-noise console errors, 0 pageerror. |
| G95-3 | 1440, anonymous | PASS (fake-Bearer BLOCKED) | The visible header link opens `/studio-lab`, with workspace 1 and the demo badge. `/studio/middle-east` shows `Sign in required` with workspace 0 and audio 0. `/api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`. Premium auth is not bypassed. The fake-Bearer request returned 500 `Unable to prepare Studio access`: **BLOCKED** (backend unavailable in cloud). localStorage holds no auth keys (`out/g953.json`). |

## Offline rows
- **AN-REVIEW: PASS.** C re-ran the mutations with its own regex edits (`tools/mut95.py`, scratch `c-round-95/mut/`, cacheDir in scratch; `c-round-95/mutation-results.json`). All runs used the 4 targeted files.
  - **a:** removing the fetch try/catch turns DL1 and DL8 red.
  - **b:** dropping the abort rethrow in the fetch catch turns "DL5 aborted fetch" and "DL5 any fetch error after abort" red.
  - **f:** changing `(ქსელი)` to `(ქსელo)` in the fetch catch turns DL1 and DL8 red.
  - **Control:** 0 failed / 42 passed.
  - **Fail-before** (B snapshot `studio-lab-demo.ts`): 5 red (DL1, DL2, DL3, "DL5 decode after abort", DL8) and 7 green. This matches A's report. The fifth red, beyond B's list of 4, comes from the extra review test; the baseline passed the raw DOMException through, so that test is red there. The difference is explained and accepted.
  - The test file has no `as` (grep 0) and 19 `toBe`/`toStrictEqual` calls. The fakes are injected through `vi.stubGlobal` (`fetch`, `OfflineAudioContext`, `AudioBuffer`) and restored with `vi.unstubAllGlobals`. There is no type assertion.
- **T95-TARGETED: PASS.** `npx vitest run $(cat a-round-95/targeted-list.txt)` in store gives 4 files / 42 tests passed: studio-lab-demo 12, collection 14, purchased-collection-ui 6, collection-load-status 10 (`c-round-95/targeted-c.log`).
- **Docs (diff read):** 082 l.4 now reads `C PASS (Round 94), გამოქვეყნდა 0513439 (D-29z59)`. Workspace doc l.44 says the unit tests prove the fix and the browser check waits for SRW-21; l.45 links 080 and 082; l.46 is the 083 bullet, correctly limiting the abort rethrow to fetch and body. Doc 083 exists.

## Gate rows (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED belong to the gate.

## Ableton correspondence
Demo loader error text: **არ ეხება**. This is CZABA's own web loader, no Ableton source applies, and no Ableton claim is made.

## Findings for B
- **C-R95-N1-FAILED-SOURCE-ADD-TEXT (Low, existing behaviour, not a round-95 fail).**
  - **Steps:** a source has failed (for example ERR-NET). The user selects its row and presses Enter, or drags it to a lane.
  - **What happens:** the add is correctly refused (0 → 0 clips), but the status says `„…“ ჯერ არ ჩატვირთულა.`, which means "not loaded yet". It suggests that waiting will help, while the row already says the load failed.
  - **Source of the text:** `ArrangementContext.tsx` l.1201 and l.1314 (frozen this round).
  - **Suggestion:** when the source is in the `error` state, use a failure-specific refusal text. Evidence: `out/err-net-1280x720.json` → `add`, `shots/add-refused-1280x720.png`.
- **Info (C-R95-N2):** the AUDIO-REG export shows the existing overload alert (`14 sample შეიზღუდა 0 dBFS-ზე`) for the Middle East preview at unity gain. The WAV matches the decoded source (xcorr 1.0), so the alert is truthful and not a bug.
- **Carried for root:** GATE95-DUP-ERROR-MAP (A's Architecture note) stays a nit until `collection.ts` comes back into ownership.

## Addendum
- **Byte-identity check:** grep over `collection.ts` and `studio-lab-demo.ts` finds the same strings in both files with the same counts per file: `'ფაილი ვერ ჩაიტვირთა (ქსელი)'` ×2, `'ფაილი ვერ გაიშიფრა'` ×1 and `` `ფაილი ვერ ჩაიტვირთა (${response.status})` `` ×1. The texts are byte-identical.
- **Screenshots:** C looked only at `net-1280x720.png`. The other screenshots are stored but were not looked at. The PASS rests on the DOM and file data in `out/*.json`.
