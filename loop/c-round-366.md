# C round 366 — PERF-9b-i (stem-cache perf rows on the production build)

Verdict: **PASS**. browserVerified true. Evidence is in `c-round-366/`; the machine-readable result is `c-round-366.json`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. Output is byte-equal to `a-round-366/claims-final-v3.txt`: K2 `413218e 3`, K3 1/1, K4 46 rows / 7 asserts, K5 11, K7 all 0, K8 `pending 0`, K12 7, K13 empty | `c-round-366/claims.txt` |
| SOURCE-SCOPE | PASS. 2 untracked perf files plus doc 236 modified, no other path. sha256 equals `a-round-366/final.sha256` | `git status` in this report |
| PERF (1440×900, alone, production build :5188) | PASS. exit 0, `failures: []`, 3 samples per row, 7/7 asserts PASS. Medians: cold-body-live 1, warm.body-bytes 0, warm.status-304 2, cold.entries-stored 2, **warm-ready-ratio 0.184** (0.183–0.189, budget ≤ 0.5), blocked.ready 1, blocked.entries 2. cdp-mp3 bytes 0 on warm and warm-http. audio-requests rows are `wallclock` | `perf.log`, `latest-stem-cache.json` |
| MUTANT-OWN | PASS. Predicted in `progress.json` before the run: removing the offline fallback `return cachedResponse(entry)` in the fetch catch of `stem-cache.client.ts` turns `stem.blocked.ready` red and leaves the others green. Observed: blocked.ready 0 (FAIL ×3, "2 sounds failed to load"), the other 6 asserts PASS. Scratch deleted | `mutant-own.log` |
| PROBE 1440×900 and 1280×720 (prod :5189) | PASS at both viewports. Cold: 1 fetch per stem, 200 (4,054,384 / 3,610,981 B), OPFS 4,054,080 + 3,610,677 B. warm-evicted and warm-http: 304 with If-None-Match. warm-nocache: 200 with `Cache-Control: no-cache` (the DevTools case, record only). Blocked: "Demo collection ready", both entries present. Cache 304s are reported as `net::ERR_ABORTED` (expected per task) | `stem-prod-*.json`, `stem-prod-*-warm-evicted.png`, `-blocked.png` |
| AUDIO 1440×900 | PASS. cold / warm-evicted / blocked each add "Middle East — public preview" (Enter), play 2.2 s: playhead 00:00.000 → 00:02.89–02.90, analyser peaks 0.05–0.31, 1 source start. Exported WAV is 24-bit / 48 kHz stereo, 101.352 s, rms −15.29 dB, 0 non-finite samples, and **identical sha256 across all three opens** | `audio.json`, `audio-*.png`, `audio.mjs` |
| G366-AUTH both viewports | PASS. Anonymous `/studio-lab` opens the demo (no auth_user). `/studio/middle-east` shows sign-in required with 0 audio sources. `/api/studio-token` without credentials is 401 and the body holds no token. Premium auth is not bypassed | `auth.json` |
| DOCS | PASS. l.4 is byte-exact (`In Progress (stage 2 of 3; C round 366 PASS)`). The 7 headings match TEMPLATE order. `C round N pending` hits: 0. Every `stem.*` row named in the doc exists in the budgets file | commands in this run |

**Gate (not claimed by C):** full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke, A-TYPE/A-LINT. See `gates/gate-round-366.json`.

**Blocked (backend unavailable in the cloud):** a fake-bearer `/api/studio-token` request returns 500. It fails closed and no token is returned; this is recorded, not claimed.

**Observations (info, no bug against A):**
- The cold open also makes the 206 Media request (`<audio preload=metadata>`, aborted) at 1440×900, not only on narrow screens. This is the known B-R364-DEMO-DOUBLE-FETCH and is recorded in `audio-requests`.
- The exported WAV peak is 1.0 for the 101 s project. Pre-existing and unrelated to the cache; it is identical in all three opens.
- A changed the sketch (code-reviewer Mediums: audio-requests re-kinded to wallclock; the CDP byte window). The task allows this (§1.1), and C ran the final files. Under L58 the unruled sketch Mediums are RETRO 368 input (B origin).
- A's reviewer Lows (A-R366-REVIEW-*) are routed to B for 9b-ii.
- C ran the PERF run and MUTANT-OWN once each (a single 3-pass run; budget not exhausted).
