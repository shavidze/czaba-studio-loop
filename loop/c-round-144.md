# C — Round 144 verification: V-0.4e close-out (D-29z109)

Date: 2026-10-24 · Verifier: C · Task: `current-task.md` (round 144) · Env: `env-status.json` store 200 (round 144, attempt 1)

**Verdict: PASS** · `browserVerified` = `realVerified` = **true** · no new bugs · C-R143-01 closes (D-29z109 R1 + this re-check).

## Rows
| Row | Result | Evidence |
|---|---|---|
| T144-TARGETED | PASS: 3 files, 64/64 (polish 16, strings 44, strings-ui 4) = A's counts | `c-round-144/out/vitest-targeted.json` |
| SOURCE-SCOPE | PASS: HEAD 6e9f9b1; frozen list 961 OK at start and end; the 2 granted end hashes = `a-round-144/end-sha256.txt` at start and end; protected diff vs 6e9f9b1 = 0 bytes; `git status --short` = the same 22 paths at start and end (= round-143 end) | `out/c-start-status.txt`, `out/c-end-status.txt` |
| AN-REVIEW | PASS: polish file 1 line (CL1 `Georgian`→`English`), `it` count 16 = 16. Doc 118 only CL2 (a) status, (b) `გადაუწყვეტელი, ` removed + D-29z108 sentence, (c) C-R143-01 entry with the correct numbers ([735.5,759.5,139,16] vs [719.5,759.5,171,16], d=(+16,0,−32,0), parent d=0, swap = baseline, D-29z109 R1), (d) round 143/144 testing lines (357/357, m88–m90, 20.03 dB match C's round-143 evidence), (e) 3 stale TODOs deleted, V-0.5 line + `LIB-SEARCH-KEYWORDS`. Georgian | `out/an-review.diff` |
| LAYOUT-1440 | PASS. (i) placeholder **[735.5,759.5,139,16]** (exact ruling box); parent `arrangement-detail-waveform` d=(0,0,0,0); Georgian swap → **[719.5,759.5,171,16]** (exact baseline). (ii) video reason 1 line, [640.5,779.5,329,16], d=(−1,0,+2,0), text width 329 vs Georgian 327. (iii) exempt: header label (−45,0,+43,0), apply (0,0,+22,0), toggle (−2,0,+2,0) in all 5 states. (iv) 0 breaches: panel d=0 in all 5 states, no other node moved, no more lines, group 87 px, contentScroll 107/107, clipped 0 in all 5 states; swap restore identical | `out/c144-1440-r2.json`, `out/layout-1440-r2.json`, `shots/video-1440-r2.png`, `shots/video-geoswap-1440-r2.png` |
| LAYOUT-1280-SPOT | PASS (full 5-state run done, video state compared): every node d=0 vs `c142-1280-r1` video, panel [288,531,992,120], reason 2 lines, contentScroll 98/83 (= baseline), clippedBelowPanel = [`The source file stays unchanged`] (= baseline), no new horizontal overflow. Panel started collapsed and was expanded | `out/c144-1280-r1.json`, `out/layout-1280-r1.json`, `shots/video-1280-r1.png` |
| VIDEO-REASON-TEXT-1440 | PASS: reason text, Clip Gain input `title` and fader `title` = `A video clip has no Clip Gain — use the track Volume/Mute`, dash U+2014, `aria-describedby` → reason id. Video+audio still shows the multi reason only | `out/c144-1440-r2.json` |
| G144-3 (alone, last) | PASS: fresh anonymous context, `/studio-lab` workspace + demo badge; `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]` at 1440 and 1280; `GET /api/studio-token` → 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud) | `out/g144-3.json`, `shots/g144-3-*.png` |
| PX-NET / REG-HYD | PASS: 3 instrumented contexts (1440 detail, 1280 detail, G144-3 1440 page), 0 forbidden requests, 0 Authorization headers, 0 hydration, 0 errors/pageerror (2 known cart noise per Studio context). The G144-3 1280 protected view was checked for workspace / `audio[src]` / sign-in text only; it had no network listeners (same as round 143) | `net` in each out JSON |

Harness also re-ran the DETAIL-TEXT/DETAIL-STATUS checks incidentally: 49/49 OK at both viewports (Snap off at start).

Gate rows (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
Not re-run by design (§4): NEIGHBOUR-SAMPLE, CLIP-GAIN-AUDIO, GEO-COUNT — round-143 PASS stands; SOURCE-SCOPE shows the app tree is unchanged since round 143.

## Invalid runs
- `c144-1440-r1`: ENV-FIRST-LOAD-GRID-NULL (grid-control null during the first-load snap read). Discarded and replaced once by `r2` (`out/INVALID-c144-1440-r1.json`).

## Ableton
- CZABA requirement: met (placeholder/reason text and layout per D-29z109).
- Ableton correspondence: **unconfirmed / not applicable** — CZABA-only placeholder, Live Clip View not in B's capture; no Live claim.

## Notes for B
- Per §7: V-0.4e → `c_pass`; root may publish rounds 142+143+144 together; then V-0.5.
- Regression round due on/after 2026-10-27.
- Carry-over unchanged: C-R142-02, C-R142-03 (Low). Library collection labels, `ყველა ფაილი` and the search placeholder are still Georgian (V-0.5 scope; visible in `shots/video-1440-r2.png`).
- Root artifacts `root-pre-push-review.md` / `publication-checkpoint.json` (2026-10-07) were read. They add nothing new for round 144. Their old items (scrollbar request, hard-coded `middle-east` loader, portable paths) stay backlog carry-over and were not re-checked here.
