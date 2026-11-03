# C round 317 — PERF-7 fix-up (C-R316-01) — **PASS**

**Verdict: PASS.** browserVerified = realVerified = true. 13/13 C rows pass; no findings. Ableton conformance: not applicable (no user-visible behaviour).

The changed bytes now equal what Chrome receives from Google at HEAD. `/store` renders pixel-identical to HEAD, and the C-R316-01 2,015 px band is gone. All round-316 network, preload and cache properties hold. Premium auth is not bypassed.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 40 entries, same list as c-round-316/git-status-end.txt; tree-316 34 OK / 6 FAILED (4 Playfair woff2, test, doc 229); protected 11/11 OK | c-round-317/git-status-start.txt, protected.txt |
| CLAIMS | PASS: equal to a-round-317-claims-after.txt; vs sketch only K7/K14(2)/K15(34/6) | c-round-317/claims-c.txt |
| BYTE-IDENTITY | PASS: own fetch, HEAD CSS URLs derived from `git grep c136dfd`; Playwright Chromium 143 UA and B's Chrome 141 UA: 83→83 faces, 25 files, 25/25 identical, 0 kit URLs; manifest.json 0 kit | c-round-317/byte-identity.txt, byte-identity-b-ua.txt |
| UNIT | PASS: scratch /tmp/c317u 3 files 87/87; unit-mutants-316.py output equal to precheck-unit-mutants-317.txt; MU-KIT-BACK red FN3; C own MU-C-KIT-BACK-VIETNAMESE and MU-C-SWAP-LATIN-CYRILLIC red FN3; restored 5/5 | c-round-317/unit.log, unit-mutants.txt, mutants-kit-own.txt |
| builds | HEAD /tmp/c317h and A /tmp/c317a: rc 0, 23 hashed woff2 | c-round-317/build.status |
| FONT-BYTES | PASS: per route the sorted sha256 of received woff2 bodies HEAD (fonts.gstatic.com) = A (our origin): /studio-lab 3, / 2, /store 2, /studio/middle-east 1; document.fonts loaded set equal; A 0 Google requests; Playfair latin body 38,404 B both | c-round-317/font-bytes-summary.txt, font-bytes-head.json, font-bytes-a.json |
| FONT-PIXEL | PASS: /store HEAD1 vs HEAD2 control 0 px and HEAD vs A 0 px at 1440 and 1280; /studio-lab HEAD1 vs A 0 px both; control HEAD1 vs HEAD2 at 1440 had 4 px (x=260,y=606-609); control rerun HEAD3 vs HEAD1 0 px at both viewports, and HEAD3 vs A 0 px at both (L37 rerun 1 of 2); / numbers only (control 95k px, animated hero) | c-round-317/pxdiff.txt, pxdiff-rerun.txt, shots/ |
| FONT-NET / FONT-PRELOAD / FONT-CACHE | PASS on A build (3 runs each; /studio-lab at 1440 and 1280, others 1440): 0 Google requests, 0 render-blocking third-party; file set per route unchanged (studio-lab 3, / and /store inter-latin + playfair-display-latin, middle-east inter-latin); each file fetched once; exactly 2 CORS (anonymous) font preloads on /studio-lab; `public, max-age=31536000, immutable`; /studio-lab decoded 69,732; 0 page errors, 0 preload warnings | c-round-317/fontnet-summary.txt, fontnet-*.json |
| FCP | PASS: FCP−DCL A / max 0, /store max 4 ms (<150); /studio-lab FCP A median 428 vs HEAD 448 @1440 (0.96×), 388 vs 396 @1280 (0.98×) | fontnet-summary.txt |
| DOC | PASS (structural check; doc 229 is an untracked new file, so there is no round-316 copy to diff): title l.1 and l.54 still say byte-identical, l.71 RFN unchanged; l.4 `Completed (C round 317 PASS)`; new Problem→Solution after the RFN entry with the 4 sizes (39,172/38,404, 50,272/21,140, 55,840/21,152, 42,892/9,112) and 2,015 px, all equal to c-round-316.md; testing names BYTE-IDENTITY and FONT-BYTES; 7 TEMPLATE headings in order | doc 229 l.4, l.73–74, l.87 |
| PERF-LOAD | PASS: perf spec run alone on /tmp/c317a (no overlap; 14:25:03–14:33:07, rc 0, 1 passed); `failures` []; `harness.loaf-scripts-live` samples 79/80/80 (≥ 50); rowcmp vs c-round-315/perf-harness.json 164/164 deterministic equal, 0 differ | c-round-317/perf-harness.json, perf-harness.log, rowcmp.txt |
| G317-AUTH | PASS on :5173 (fresh anonymous contexts, 1440 and 1280): /studio-lab workspace + demo badge, `auth_user` null, 0 page errors; /studio/middle-east "Sign in required", 0 `audio[src]`; `/api/studio-token` no header → 401, fake bearer → 500, bare → 400, no token in any body. Attempt 1 timed out on a cold compile of the legacy route (environment-invalid, L38, kept); the replacement run passed | c-round-317/g317-auth.json, g317-auth-attempt1-coldstart.log, probe-legacy.log, shots/lab-*.png, legacy-*.png |
| SOURCE-SCOPE (end) | git status list unchanged start→end (40); tree-316 34 OK; protected 11/11; fonts-sha256 25 OK. C changed no source | c-round-317/git-status-end.txt |

**Gate rows (not claimed):** full vitest, build in `store/`, Biome, `npm run verify`, e2e smoke. C built only on the scratch copies `/tmp/c317h` and `/tmp/c317a`.

**L57 fields:** assertsSpecified 1 (FN3); mutantsRecorded 13 (12 + MU-KIT-BACK); mutantRedOnSketch 13. C's own mutants: MU-C-KIT-BACK-VIETNAMESE and MU-C-SWAP-LATIN-CYRILLIC, both red on FN3. manifestPaths: c-round-317.md, c-round-317.json, c-round-317/; missingPaths, countMismatches: none.

**Observations (not findings):**
- `/studio-lab` HEAD-vs-HEAD control at 1440 showed 4 px (x=260, y=606–609) in one pair. The control rerun (head3) measured 0 px against both HEAD1 and A at both viewports (`pxdiff-rerun.txt`).
- UNIT and the mutants ran on `/tmp/c317u` with `store/node_modules` symlinked, so vitest/Vite caches may have been written under `store/node_modules/.vite`. This is cache only and untracked: `git status` was unchanged start → end. A disclosed the same thing.
- `/` is report only (animated hero): control 95k px; HEAD vs A 123k / 32k px, all at y ≥ 81. FONT-BYTES covers it.
- `/studio-lab` FCP−DCL on A is 269–334 ms, versus HEAD at 159–293. It stays with PERF-11; FCP itself is 0.96–0.98 × HEAD.
- The perf warm-up script timed out on "collection ready". This is pre-existing (rounds 315/316); the spec passed.

**For B:** PERF-7 can close once gate 317 passes. Root's diff review uses `b-round-316/fonts-src/fonts-sha256.txt` (25 OK in `store/` at the end of C's phase).
