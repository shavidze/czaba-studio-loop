# C round 92 — SRW-21 stage 1 verification (D-29z57)

Verifier: C · 2026-10-22 · Target `http://127.0.0.1:5173/studio-lab` (env-status 200, round 92). Playwright + installed Chromium, headless, a fresh incognito context per session with no credentials. Warm-up hit `/` alone first. No app edits, commits or server actions.

**Verdict: PASS** · browserVerified = realVerified = **true** · **0 bugs**.

## SOURCE-UNCHANGED — PASS
- Start and end: HEAD `77cd5b668bb5`, 3 M + 5 ??, frozen `b-round-91-r92-tree-sha256.txt` 513/513 OK.
- The 8 owned files hash the same as A's report (`210cfdc0 1270f6c5 140f17ec 456335d4 637d9d88 2d95af25 72b7fd89 e6465055`). Start and end hashes are identical (`c-round-92/start-hashes.txt` = `end-hashes.txt`).
- All 10 protected hashes match the baseline. `grep -rn "lib/arrangement/collection" app/routes` is empty. Only `StudioWorkspace.tsx` and `ArrangementContext.tsx` import the module.
- `git diff -U0` touches only granted lines: the import; the h1 text node (now a template literal); the badge; the status initializer; the ready/failed `setStatus` lines; the WAV/MP3 names; and both dependency arrays. It adds two `const { fileStem } = …` reads, which A disclosed and the task requires ("read fileStem inside exportWav/exportMp3"). Doc 079 changes l.4 only.
- I extracted the demo literals from `git show HEAD:` and ran `grep -F` on `collection.ts`. The 3 fixed literals (loading, ready, badge) matched byte for byte, including `…` U+2026 and `＋` U+FF0B. For the `failed()` template (`${failed}` → `${count}`), both fixed fragments matched (`დემო კოლექციიდან ` and ` წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`), and DEMO-LOAD (b) produced the exact text in the browser.

## DEMO-COPY — PASS (1280×720 and 1440×900)
Evidence: `out/demo-copy.json`, `shots/demo-copy-*.png`, `shots/demo-header-*.png`.
- h1 `textContent` is exactly `CZABA Studio Lab · სამუშაო სივრცე`, with child nodes `[#text "CZABA Studio Lab ", SPAN]`.
- The badge reads exactly `დემო კოლექცია — ავტორიზაცია არ სჭირდება` and appears once.
- The status is the exact ready text. `document.title` is `Studio Lab — დემო სამუშაო სივრცე | CZABA`. The library notice matches exactly.
- Layout: the h1 is 20 px tall (line-height 20) and the badge 22 px (line-height 16), so each is one line. Both sit inside the 35 px header and neither overlaps `arrangement-master`. At 1280 the badge spans x 985–1268 and Master spans 564–973. The page has no `შეძენილი` text.

## DEMO-LOAD — PASS (1440)
Evidence: `out/demo-load.json`, `shots/load-held-1440x900.png`, `shots/load-fail-1440x900.png`.
- (a) I held `**/middle-east.mp3` for 6.2 s. The status was exactly `დემო კოლექცია იტვირთება…` and the row showed `იტვირთება…`. The exact ready text appeared 308 ms after release, and all 9 sources became draggable.
- (b) I aborted `**/videos/hero/hero-music.mp3`. The status was exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` The hero row showed `შეცდომა: Failed to fetch`, and the other 8 sources were draggable with no error. This runs all three X1 strings in a real browser.
- Observation (pre-existing, not this round): the demo loader shows the browser's English `Failed to fetch` text on a network failure. The purchased adapter maps the same case to `ფაილი ვერ ჩაიტვირთა (ქსელი)`.

## EXPORT-NAMES — PASS
Setup: three demo clips, no Ctrl+D, project 00:00.000 — 01:41.702. Range 00:04.000 — 00:09.000, made by a real drag on the music clip. Evidence: `out/export-*.json`, the downloaded files in `out/`, `shots/export-done-*.png`.

| VP | Export | suggestedFilename | File | Done message (exact) |
|---|---|---|---|---|
| 1280 | WAV project | `czaba-studio-lab.wav` | RIFF/WAVE PCM 24-bit/48k/2ch, 4 881 696 frames = 101.702 s, NaN 0 | `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.` |
| 1280 | WAV range | `czaba-studio-lab-range.wav` | 24/48k/2ch, 240 000 frames = 5.000 s | `WAV შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 24-bit · 48 kHz · stereo.` |
| 1440 | MP3 project | `czaba-studio-lab.mp3` | ID3, decodes 48k/2ch, 101.702 s | `MP3 შეიქმნა: 01:41.702, 48 kHz · stereo.` |
| 1440 | WAV+MP3 range | `czaba-studio-lab-range.wav`, `czaba-studio-lab-range.mp3` | WAV 240 000 frames; MP3 decodes 48k/2ch, 5.000 s | `WAV და MP3 შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.` |

Every file reaches peak 1.0 (some full-scale samples). Rounds 90–91 show the same with this setup, so this is not new and not caused by this round.

## PX-NET — PASS (every session)
- No request to R2 or workers.dev, `/api/studio-token`, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers on page requests.
- Audio requests are only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`.
- unpkg requests before the first MP3 click: 0.
- Other third-party requests: Google Fonts, plus the known failing `localhost:5199/api/cart`.
- The only Bearer request was my own deliberate fake-Bearer call through `ctx.request` in G92-3.

## REG-HYD — PASS
- Every session had 0 non-noise console errors or warnings, and no hydration or `useLayoutEffect` warning. Each had 2 noise messages: cart / connection refused.
- The raw SSR HTML h1 is `CZABA Studio Lab <span class="font-normal text-muted">· სამუშაო სივრცე</span>`, with no `<!-- -->`. The badge is in the SSR output, the SSR status is the loading text, and the first client read was the loading text.

## G92-3 — PASS (one sub-check BLOCKED)
Evidence: `out/g923.json`, `shots/g923-*.png`.
- The header link `Studio LabDemo` opens `/studio-lab` with the workspace and the demo badge.
- Anonymous `/studio/middle-east` shows "Sign in required", with 0 workspace and 0 audio elements.
- Anonymous `/api/studio-token` returns 401 `Please sign in to access Studio.`
- **BLOCKED:** the fake-Bearer request returned 500 `Unable to prepare Studio access`, because the backend is unavailable in the cloud. This sub-check is not counted as passed.

## PC-REVIEW — PASS
- I read both test files. Each PC/PW row asserts behaviour, not just rendering:
  - exact `toStrictEqual` shapes and texts;
  - the exact fetch init `{credentials:'omit', signal}`, with the key set checked and `signal` checked with `toBe`;
  - the lazy global fetch;
  - the decode argument (`ArrayBuffer`, 16 bytes);
  - exact error texts for 401/403/404/500 with URL/`token`/`SECRET` absent;
  - the aborted case rethrowing the original error (`toBe`);
  - every `init.signal.aborted === true` after unmount, with no `console.error`;
  - download names `czaba-studio.wav` and `czaba-studio-range.wav`, and the demo lock.
- I re-ran mutations in my own scratch copy (`c-round-92/mut/`, copied from the current store, vitest `cacheDir` inside the scratch folder, script `tools/run-mutations-c.py`, results `c-round-92/mutation-results.json`):
  - **b** (`headers: {Authorization}`) → PC3 red; PW6 green.
  - **f** (`fileStem` hardcoded `czaba-studio-lab`) → PW5 red; PW6 green.
  - The unmutated control is 20/20 green.
- **The purchased path is unit-only and not reachable in the browser** while the route mount stays blocked. That covers P1(b), the purchased copy and the purchased file names. The browser proves only that the demo path through the new code is byte-identical.
- Open evidence for B (A's Low 2): no test backs the purchased MP3 names (`czaba-studio.mp3` / `-range.mp3`); they are covered by reading the code only. This is not a criterion of this round.

## T92-TARGETED — PASS
A's `targeted-list.txt`: 68 files / 1126 tests passed, exit 0 (`c-round-92/targeted-c.log`).

## Docs (read)
- Doc 079 l.4 has the gate-91 status.
- Doc 080 has every TEMPLATE section. It covers the adapter contract, what is not done (the route mount blocked and StudioContext), COLLECTION-EMPTY-STATUS and V-0 compatibility.
- `arrangement-workspace.md` covers the mount guide, RequireAuth, the route-owned Bearer request, the purchase check and the hardcoded `middle-east` loader prerequisite.

## Ableton conformance
Every row is **not applicable** (CZABA plumbing, copy and file names; see task §4). No Ableton claim is made.

## Gate rows (not claimed by C)
full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, production bundle (PROD-MP3-UNVERIFIED).

## Notes for B
- No new bug.
- Open signals:
  - purchased MP3 names not test-backed (A Low 2);
  - COLLECTION-EMPTY-STATUS (Low);
  - the provider status does not reset on a collection swap (pre-existing);
  - the demo loader shows the raw English `Failed to fetch` in its error row (pre-existing, Low copy item for the Lows batch if B wants it);
  - the fake-Bearer 403 is still waiting for a backend-enabled run.
