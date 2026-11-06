# C round 365 — PERF-9a persistent stem cache v2: PASS (browserVerified true)

Run: Playwright/Chromium, CDP only, fresh persistent profile per viewport, dev server warmed first (L38). Evidence under `c-round-365/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | Equals A's final. K11 = 12 (task said 10): the grep matches the 2 new required test files; info C-R365-INFO-01 for B's ruling | `/tmp` diff = SAME |
| SOURCE-SCOPE | PASS: 2 M + 6 new, exactly §1.1 | git status |
| UNIT | PASS 12 files 194/194; SC1–SC21 and SF1–SF6 exist | `unit.log` |
| MUTANT-OWN | PASS: 304 without touch → SC6 red; budget without 256 MiB cap → SC3 red; scratch deleted | — |
| CS-COLD (both vp) | PASS: one fetch-initiator 200 per URL; IDB 2 records (4,054,080 / 3,610,677 B) = 2 OPFS files of equal size | `cache-*.json` |
| CS-WARM (both vp) | PASS: HTTP cache on and off: 304, encodedBodySize 0, If-None-Match sent, ready, no failed text | same |
| CS-AUDIO 1440 | PASS: warm clip width 4054.078 = cold; playhead 2.89 s after 2.2 s play; analyser peak 0.05–0.31; export WAV 24-bit/48 kHz 101.352 s, sha256 **identical** for cold, warm (304) and mp3-blocked | `audio.json`, screenshots |
| CS-BLOCKED (both vp) | PASS: ready, no failed text, entries unchanged | `cache-*.json` |
| CS-CLEAR (both vp) | PASS: 200 full body, both stored again in new OPFS files | same |
| CS-LEGACY | PASS: only `czaba-stem-cache-v2` | same |
| ONE-FETCH | PASS: one fetch-initiator request per URL per open. `audio`-initiator `/middle-east.mp3` (status 0, 0 B) present in cold, warm-off and clear opens (B-R364-DEMO-DOUBLE-FETCH, info) | same |
| SSR | HTML half PASS (200, "CZABA Studio"). Dev-log half BLOCKED: server stdout not readable | — |
| G365-AUTH (both vp) | PASS: anonymous /studio-lab = demo, no auth_user; /studio/middle-east shows sign-in, 0 audio; token endpoint 401, no token; fake bearer 500 fails closed (not claimed) | `auth.json` |
| DOCS | PASS: l.4 byte-exact, 7 headings in order, 0 pending markers | — |

Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed.

## For B
- Rule on K11 = 12 and the sweep-error clause (STOP 1/2 in `a-round-365.md`); neither blocks the behaviour.
- Reviewer Lows L3–L6 and the browser-store integrity gap (no unit test for `get` on missing/mismatched file; the real check is CS-COLD/CS-CLEAR, which pass but do not exercise a corrupted file) go to 9b.
- Not tested: corrupted OPFS file in the real browser, quota exhaustion in the real browser.
