# C — Round 109 verification: SSR HTML carries no NUL bytes (C-R23-01 + C-R38-01)

**Verdict: PASS** · browserVerified = realVerified = **true** · 2026-10-23 ~12:48–13:00 UTC
Environment: dev server `:5173` (env-status 200, round 109), Node v22.23.3, Playwright Chromium headless, a fresh incognito context per session with no credentials. Backend `:5199` is down, as expected.
Evidence root: `c-round-109/` (`tools/`, `out/`, `shots/`, `ssr/`, `mut/`). I re-ran every check myself; none of A's claims were taken as given.

## Results

| ID | Result | Evidence |
|---|---|---|
| SOURCE-UNCHANGED | PASS | Start and end are the same:<br>• HEAD `32a6b08`; status is exactly 2 M + 3 ?? (`--untracked-files=all`).<br>• Frozen list: `sha256sum -c` is OK (542).<br>• Diff of `entry.server.tsx` against the snapshot: only the import block (PassThrough import removed, stripper import added) and the `body` line.<br>• All 12 protected hashes are unchanged; package.json `cf14e3b1` and the lockfile `74a5f435` are unchanged.<br>• The 5 end hashes equal A's `end-hashes.txt`. |
| NUL-HTTP | PASS | `ssr/` (B's `ssr-baseline.cjs`, run from C's own directory). 5 paths × Chrome/Googlebot × 2 runs = 20 responses.<br>• Every response: 200, `text/html`, NUL **0** (re-counted on the raw bytes in `tools/equiv.cjs`), and U+FFFD 0.<br>• `/studio-lab` is **69 303** bytes (B: 69 307 − 4). |
| NUL-EQUIV | PASS | `out/nul-equiv.json`: in 20/20 responses the raw-body sha256 equals B's `sha256Stripped` for the same path, UA and run. No diff was needed. |
| STREAM-KEPT | PASS | `/studio-lab` with the Chrome UA: `transfer-encoding: chunked`, **36** data events (B: 36). The other pages: 20, 5, 10 and 3 events. |
| AX-NOJS 1280 / 1440 | PASS | `out/axnojs-*.json`. Page scripts really did not run (`window.__remixContext` is undefined).<br>• outerHTML: U+FFFD 0 and U+0000 0; no attribute or text node contains either.<br>• The ⌫ `aria-label` is exactly `⌫ წაშლა — კლიპის წაშლა — სიცარიელე დარჩება`.<br>• The heading text contains `Arrangement · მთლიანი პროექტი`.<br>• Screenshots: `shots/axnojs-*.png` (black; see C-R109-OBS-01). |
| AX-HYDRATED 1280 / 1440 | PASS | `out/axhyd-*.json`, after Decline and the library load.<br>• 0 `[aria-label]`, `[title]`, other attributes or text nodes with U+FFFD.<br>• The ⌫ label is exact.<br>• 0 hydration warnings and 0 errors.<br>• 1280 attempt 1 threw inside my scan (`createTreeWalker`: the document was momentarily without `documentElement`, which looks like a dev-server reload). Two retries both PASS. All attempts are kept (`axhyd-1280x720-attempt1.json`, `log-axhyd-1280x720*.txt`). |
| REG-FLOW 1280 | PASS | `out/flow-1280x720.json`; screenshots `shots/flow-*.png`.<br>• Focusing the Middle East row and pressing Enter adds 1 clip (music, 0.000).<br>• Fit sets zoom to 7.4 px/s; the project ends at 01:41.352.<br>• Play for 2.05 s of wall time: the position goes 00:00.000 → 00:01.970 and the playhead moves 512 → 526.7 px. The page's AudioContext is `running`, its `currentTime` advances 0.53 → 2.03, and it runs at 44.1 kHz. After Pause the position stays at 00:02.022.<br>• Real WAV export: RIFF/WAVE, PCM, 24-bit, 48 kHz, 2 channels, 4 864 896 frames = **101.352 s**, which equals the scope `00:00.000 — 01:41.352`. NaN 0, RMS 0.172.<br>• The file was deleted after measuring. |
| REG-PAGES 1280 | PASS | `out/pages-1280x720.json`: `/`, `/products` and `/about` return 200 with 0 pageerrors, 0 hydration warnings and 0 U+FFFD.<br>• Note: `/products` shows a "404 - Page Not Found" title. Its bytes are identical to B's pre-change baseline (NUL-EQUIV), so it predates this round and is related to the missing backend. It is not a finding of this round. |
| PX-NET | PASS | In every session: 0 requests to studio-token, recording-*, `/api/download` or R2, and 0 `Authorization` headers. The only third-party requests are Google Fonts, Unsplash and `localhost:5199/api/cart` (expected noise). |
| REG-HYD | PASS | 0 hydration warnings, 0 pageerrors and 0 non-noise console errors in every session (the axhyd retry is described above). |
| G109-3 (run alone, last browser row) | PASS | `out/g1093-1440x900.json`.<br>• The visible header link "Studio Lab Demo" opens `/studio-lab` with the workspace and the demo badge.<br>• `/studio/middle-east` shows "Sign in required", 0 workspace and 0 `audio[src]`.<br>• Anonymous `/api/studio-token` returns **401**.<br>• The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud). |
| AN-REVIEW | PASS | **The test file:**<br>• SN3 makes 6 separate `write()` calls with no concat, and the first `0x00 0x00` pair sits between bytes 0 and 1 of `წ`.<br>• SN6 and SN7 assert `toBe(renderToString(fixture))`.<br>• Only exact matchers, apart from SN5's documented `toBeGreaterThan(0)`. No `as`, `@ts-` or `any`.<br>**C's own mutations** (`tools/mut109.py`, scratch `mut/`, own cacheDir; controls 8/8 before and after):<br>• m1, the stream pushes the chunk untouched: SN2b, SN3, SN4, SN6, SN7 red. SN2a stays green because the pure function is untouched.<br>• m2, per-chunk `toString` / split-join / re-encode: SN3 red.<br>• m3, only the first NUL is removed: SN2a, SN2b, SN3, SN6, SN7 red.<br>• m4, entry back to PassThrough: SN7 red.<br>These are the same kills as A's. A's fail-before list matches §1. The extra SN7 red is explained by SN7 being written. |
| T109-TARGETED | PASS | My grep gives the same 3 files as A's list. In scratch: 3 files / 20 tests passed (`out/targeted-c.log`). |
| DOC-094 | PASS | The TEMPLATE sections are present (context, approach, architecture, changed files, problems, testing, TODO). The doc gives the "lossless byte filter" reasoning, the rejected alternatives (React 19, `renderToString`, string replace / StringDecoder) and the ownership note ("Root may refuse"). Its status line says it waits for C. |
| DOC-093-L4 | PASS | `git diff`: one line changed (l.4). It now reads "Round 108 — C PASS, გამოქვეყნებულია `32a6b08`-ში (gate 108…)". |

**Extra check (not a task row):** `node:stream` Transform with `decodeStrings` turns a `Uint8Array`, a `Uint8Array` view with an offset, and a string into Buffers before `transform` runs (Node v22.23.3, `tools/u8.cjs`). A's `Buffer.isBuffer` → `TypeError` guard is therefore not reached on React's `Uint8Array` writes. The real HTTP responses confirm this.

**Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, **PROD-SSR-NUL** (the production build was not run here).

## Findings for B
- **C-R109-OBS-01 (Low, pre-existing, goes to deferred_low_polish):** with JS disabled, `/studio-lab` renders fully black.
  - Cause: `.page-transition-wrapper` (`PageTransition.tsx`, `app.css:279`) has a computed opacity of 0 until client JS runs.
  - The DOM and labels are correct.
  - The same wrapper is in B's `32a6b08` baseline body, so round 109 did not cause it.
  - Repro: `c-round-109/tools/nojsvis.cjs` → wrapper `opacity:0`; screenshot `shots/axnojs-1280x720.png`.
- **A's disclosed deviations (not FAILs; for B and root):**
  - The string→Buffer branch was removed, and SN4 was renamed. The extra check above shows that branch was unreachable.
  - A justified `biome-ignore lint/a11y/useButtonType` on the test fixture.
  - Reviewer L6 (`new Promise<Response>`) and the pre-existing `setTimeout(abort)` not being cleared are proposed to B.
- **Observation (not a round-109 bug, backend-dependent):** `/products` returns HTTP 200 with the title "404 - Page Not Found". Its bytes are identical to the `32a6b08` baseline. Recheck it when a backend is available; a 200 status on a 404 page is a semantic and SEO issue if it persists.
- **Ownership** of `entry.server.tsx` and `app/lib/ssr/` rests on B's reading of the user's decision (D-29z74). It is root's gate decision; C does not adjudicate it.
- The export alert said "14 sample შეიზღუდა" while my WAV scan counted 30 samples at |x| ≥ 0.9999. The two counts may use a different threshold or count per channel. This is observation only: it is outside this round and not investigated.

## Ableton correspondence
SSR byte integrity: **does not apply** (web delivery, not a DAW behaviour). No Ableton claim is made.
