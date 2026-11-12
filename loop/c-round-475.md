# C round 475 — DPG-P0-2 (undefined tokens, card badge chip)

**Verdict: PASS.** Real Chromium (Playwright) on http://127.0.0.1:5173 at 1440x900 and 1280x720; mock API started on :5199. HEAD 297f5ae; tree = 7 sketch files + doc 308. Evidence in `c-round-475/`.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: 8 changed paths, all granted; 7 sha256 equal `sketch-475-files-sha256.txt` | sha-now.txt |
| C2 scans | PASS: via claims script, K3b/K4b lines equal the allowed deltas | claims-c.txt |
| C3 mutants | PASS: 11/11 red, identical red rows to B's summary (run on `cp -a` copy) | mutants.out, mutants/ |
| C4 unit | PASS: 16 files, 172 tests; UT2 2115 ms (<15 s) | unit.log |
| C5 consumers | PASS: trigger/input/close/item/.code-4 all rgb(236,230,218), same as HEAD; trigger-hover 1280/1440 and palette 1280 byte-equal; palette 1440 equal on 2 idle reruns (first run 4 px, delta 1, under parallel load: C-R475-02). 404 diff only inside the pulse404 box; search/login diff only in the paragraph line | head4.json, rerun/, diffpng |
| C6 badge | PASS: non-New bg oklab(0.1599 0.0010 0.0025 / 0.7), colour rgb(236,230,218); "New" unchanged; all 7 badge boxes equal HEAD; contrast 8.91-8.95:1 (>=4.5) | card.json, contrast.json |
| C7 | PASS: wrapper bg rgb(22,20,18), 320x320 both viewports | rows.json |
| C8 | PASS: h3 colour same before/after hover; card scale none→1.02; 0 primary/card classes | rows.json |
| C9 | PASS: .nav-loading-bar exists, display none, 0x0, animation none; top strip pixel-equal, header bbox unchanged | rows.json |
| C10 | PASS: both stub paragraphs rgb(163,155,142) | rows.json |
| C11 | PASS: border rgba(201,164,106,0.3); gradient starts brass 0.2, pink stop stays | rows.json |
| C12 | PASS: card → /products/middle-east (h1 "Middle East") → back; badge styles identical before/after | journey.json |
| C13 | PASS: TEMPLATE headings in order; l.4 exact | doc 308 |
| C14 | PASS anonymous: "Sign in required", 0 audio src, token API 401. Real-owner path BLOCKED (backend unavailable in cloud) | journey.json |
| C15 | PASS: claims output byte-equal to allowed deltas, last line `L58 OK` | claims-c.txt |

## Notes
- A's STOP note (§1.2 vs §1.6 conflict) is a spec ambiguity, not a product defect: A changed none of the reviewer-suggested Low items. Logged as C-R475-01 (low, B spec). Reviewer R1-R4 and UT3 title wording go to deferred_low_polish.
- Not checked by C (gate): full verify, code review, publish. Design-gate re-review of DPG-P0-2 is root's (rule 4); this is functional verification only, not "მზადაა".
- Not run: Safari/Firefox (Chromium only).
