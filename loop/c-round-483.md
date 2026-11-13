# C round 483 — REGRESSION-2026-11-13 part 2 (HEAD 751e30e, A changed nothing)

Verdict: `taskStatus` PASS, 0 bugs, no Critical/High/Medium. **`browserVerified` = false** only because three record-only browser sub-rows did not run (see "Not run"). Everything else ran in real Chromium (Playwright) at 1440×900 and 1280×720 on the dev server :5173 (+ scratch production builds for R-RVM(a), HEAP, export-trunc, fonts-prod, STEM-CACHE), mock API :5199. Gate rows are not claimed. Work folder: `c-round-483/` (scripts are copies with redirected outputs, `cmp2.py` / `logcmp.py` = normalising oracle compare). Machine-readable result: `c-round-483.json`.

| Row | Result | Evidence |
|---|---|---|
| G483-SCOPE start / end | PASS (end differs only in K20 ports: my mock) | claims-start.txt, claims-end.txt |
| G483-AUTH (premium NOT bypassed) | PASS both vp, twice (start, end): demo workspace + badge, auth_user null; legacy route "Sign in required", 0 audio[src]; token API 401 / 400, no token; fake Bearer 403 (mock) | out/g483-auth.json, out/g483-auth-final.log |
| R-DEV-WARMUP | done LATE, page load only (no MP3 export before timed rows); deps mtime changed 01:58:25 mid-chain | warmup.txt |
| R-RVM (a) production | PASS 8/8 per viewport "Sign in required", 0 audio[src], 0 errors | out/rvm-prod-*.json |
| R-RVM (b) cold dev ×5 | FAILS as C-R425-01 describes in 5/5, **with** the Vite "optimized dependencies changed. reloading" line → hypothesis D-29z1488 confirmed, stays **Low** | rvm-cold/load-*.json, vite-deps-*.txt |
| R-EVICT-PIN | PASS: stop() = 0, Add plays live, Undo removes; HEAP live [2,5,16,16,16,16,16] | t389/out/evict-b2-count.json, heap-1440.json |
| R-CROSS-LANE-FIBERS | behaviour equal; rendered counts 12 / 44 / 1 equal round 425 (mounted-lane count not recorded) | out/cross-*.json |
| R-FOLLOW-OFFSET | record: scrollLeft 1180 (1440; r425 1180) / 1445 (1280; r425 1452, r389 1447); attribution not captured | t389/out/follow-*.json |
| R423-HELD-ENTER | PASS ALL OK (12 cells) | 423out/held-enter-compare.txt |
| R423-MARKER-SEEK / METER / LANE / LEAF-ACTIONS / SCALE-EXPORT / VIDEO-DOCK / SYNTH / PEAKS / PEAKS-FALLBACK / SCALE | PASS, 0 diffs except timing jitter (meter Stop 5–6 ms, -inf track meters) | marker/, meter/, lane/, s423/, export/, vid/, r397/, pk/, sc/ |
| R423-PREVIEW-LIFECYCLE | PASS 418 and 421 ALL EQUAL | 423out/p418-compare.txt, p421-compare.txt |
| R423-STEM-CACHE (production) | PASS ALL EQUAL (8 cells) | 423out/probe419-compare.txt |
| R423-STEM-WORKER | PASS proxy throw equal; short equal except audioSeek 2 vs 3 range requests (known variance, round 414); alt worker not run | worker414/ |
| R423-PREVIEW-STREAM / DECODE-STATUS | PASS (r393/r395/r396/r392 0 non-timing diffs; b7-replay2 0 diffs per D-29z1486) | r39*/ |
| R423-JOURNEY | covered by R340-JOURNEY | out/journey-full.json |
| R425-WAV-3CLIP-LEN | PASS both vp: sha256 37c56490… equal to r389/390/425; PCM 24-bit 48 kHz stereo 2,304,000 frames = 48.000 s, 99.98 % non-zero, peak 0.2967 | out/export-det-*.json, out/det-*.wav |
| R425-VIDEO-SOUND | PASS (tone onset 0.31 s → 3.06–3.14 s after move → 0.31 s after Undo) | out/vsound-tone-*.json |
| R389-* / R340-* / RG-* / RS-4B / R301-* / R-SABA-B-7 taper | PASS vs oracle (jitter + attributed renames only); taper −15.003 / −29.999 / −44.999 dB | t389/, out/b2-b4, t258/, t301/, t301x/ |
| R340-FONTS | PASS: 0 render-blocking third party, common font bytes equal r425, 2 preloads | out/fonts/ |
| R301-PRICE | PASS 0 diffs on c288 mock; standard mock restarted (200) | price/known.json |
| R425-NOSHIFT-BOXES | recorded (21 / 25 diff lines, Store restyle) | noshift/ |
| RR-PERF / PERF-LIB / RG-SMOKE | carried from round 482 | — |

## Findings
None new. Observations (details in the JSON): C-R425-01 reproduces on cold dev 5/5 with a re-optimise line (Low, dev only, production 16/16 clean); the c250 `splitPlaying` single-sample assert is phase-sensitive (continuous probe: audio keeps playing after Split, post max 0.154); c295 LoAF probe saw 0 entries at 1280 (inconclusive probe, not a product failure).

## Invalid runs (replaced, logged)
warmup first attempt; g483-auth first attempt (cold compile 60 s); t389 cache rows (wrong base); mp3 row (harness drift); R340-NAME `.text-glow` selector (468–470 removed it); R340-WORKER-R2 missing `R2_STRICT=1 R2_SWAP=1`; RG-20-1440 rerun used the wrong script; leaf.cjs wrong cwd.

## Not run (why browserVerified=false)
R-FOLLOW-OFFSET attribution fields; R-CROSS-LANE-FIBERS mounted-lane count; R423-STEM-WORKER alt-worker variants. All record-only; no failure attached.

Process note: dev rows ran before production rows (section 7 order); one functional probe (r392) overlapped a scratch production build.
