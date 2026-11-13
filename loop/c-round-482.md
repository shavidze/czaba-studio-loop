# C round 482 — REGRESSION-2026-11-13 part 1 (rounds 426–481)

**Verdict: PASS, 0 bugs, browserVerified true.** HEAD `751e30e`, tree clean at start and end (claims output equal to planning output both times). Real Chromium (Playwright), dev server :5173, mock API :5199 for the Store rows. Ableton conformance: does not apply (regression round). Part 2 (round 483) is still owed; `regression-last.json` is not updated.

| Row | Result | Evidence (under `c-round-482/`) |
|---|---|---|
| G482-SCOPE start/end | PASS | `claims-start.txt`, `claims-end.txt` (equal to `b-round-481/claims-482-planning-output.txt`) |
| RR-PERF | PASS: 5 specs, 95 asserts, 0 failures, `complete` true, 0 components rows changed vs round 424 | `perf.log`, `perf-results/`, `perf-compare.txt` |
| PERF-LIB | PASS 54 tests | `perf-lib.log` |
| R482-SCROLL | PASS both viewports, **9 passes per viewport** (3 runs): tree `/` p95 16.7–16.8 in 9/9, over33 median 0, finalY 2400; free-downloads 9/9, 0 slow, finalY==max; full `/` median 0.5; gift-cards 0 slow; control 9ba13ac p95 33.3–33.4 (6/6). Look band 0.88–1.04 (record) | `scroll/tree-head*.json`, `scroll/full-head.json`, `scroll/tree-ctl.json`, `look/` |
| R482-HELD-ENTER | PASS 426: 28 (after 1 cold-start replacement; it overlapped other probes, L38), 427: 18, 428: 13, 429: 8 | `held-4*.compare.txt`, `p426/LMUTE-1440x900.attempt1-error.json` |
| R482-SPIN | PASS ALL OK (6 cells) | `p430/`, `spin.log` |
| R482-RADIOS | PASS ALL OK (2×6) + EXTRA ALL OK (2) | `p431/`, `radio*.log` |
| R482-PROGRESS | PASS ALL OK (2 cells, 4 states); attempt 1 failed (MP3 warm-up) while another probe chain ran, L38; replacement alone passed | `p432/`, `progress.log`, `progress2.log` |
| R482-SEARCH-CLEAR | PASS ALL OK (2) | `p433/` |
| R482-DIALOG-SCROLLBAR | PASS ALL OK (2) | `p434/` |
| R482-COPY | PASS deep-equal to round 436 | `copy/` |
| R482-EXPORT-VIS | PASS summary identical to 437; narrow identical; WAV 24-bit/48k stereo 101.352 s RMS 0.172 | `vis/summary.txt`, `narrow/`, `wav/wav.json` |
| R482-IME | PASS sites 18, held 18, plain SAME 18, stage2 18, focus SAME 6, video 14 | `ime/` |
| R482-OVERVIEW (record) | recorded: Ctrl+Alt+O hides/shows, box 956×64 / 796×64 | `ov/` |
| R482-FONTS | PASS Instrument Sans everywhere, 0 inter/playfair woff2 | `store/type.json`, `store/fonts-check.txt` |
| R482-LEADMAGNET | PASS 30/30 cells equal round 446 | `store/lm-compare.txt` |
| R482-STORE-COLOUR | PASS (a) K15 20/yes; (b) ALL SAME 18; (c) rows 66/66 and card 116/116 equal round 475; (d) /hire-us form loads; (e) re-recorded on the primary Button and the whole page: box-shadow none, 0 zero-offset coloured glows | `store/`, `glow/glow2.json` |
| R482-SEEK-THUMB | PASS lead 0.00 ×10 at both viewports | `seek/` |
| R482-ENTRANCE | PASS cover/overlay/body rgb(14,13,12); wordmark brass 700 318×72; header logo brass 800; offAt 1676–1749 (6/6 in window); journey no second entrance | `entrance/` |
| R482-CLIENT-NAV | PASS: real generator (`c-round-479/scripts/nav.mjs` copy), mock API off, 31 runs deep-equal to `c-round-479/nav.json` minus date | `nav2/nav.out` (`nav/` is a superseded first probe) |
| R482-ORDERS | PASS C4/C5 equal round 481; unstubbed "Sign in required" | `orders/` |
| REG-CART | PASS styled-scrollbar; scrollbar-color rgb(115,107,96)/transparent equals the `.styled-scrollbar` rule (#736b60) (stubbed path) | `cart/cart.json` |
| R482-JOURNEY | PASS product → Studio → Enter → Space 00:01.271 → Stop → WAV not silent → View in store opener null | `jn/` |
| RG-SMOKE | PASS 2 tests | `smoke.log` |
| G482-AUTH | PASS (anon lab opens, auth_user null; /studio/middle-east "Sign in required", 0 audio[src]; token 401 no leak). Fake Bearer: BLOCKED backend unavailable | `auth/auth.json` |
| Gate rows | not claimed (root): full vitest, typecheck, build, Biome, verify | — |

Open known items unchanged (not findings): B-R478-DEAD-MUSIC-LINK protected half, B-R478-DEAD-LICENSE-LINK, GATE479-M1. Observation: home StudioShowcase mock shows saturated yellow Solo / red Mute chips (design-gate question, not a regression).
