# C round 498: DPG-BUTTON-CLEANUP-2 stage 2a — PASS (browserVerified true)

Evidence under `c-round-498/` (measure.log, measure2.log, after/after.json, after/after-nav.json, mutants.log, claims.txt, extra.json, extra.mjs, l57-check.txt, screenshots).

| Row | Result |
|---|---|
| C0 / C13 scope | git status = exactly 8 paths (6 M, 2 new); frozen checks 1,2,4 rc 0 |
| C1 REST 1440/1280/375 | 18/18 rows: primary bg rgb(201,164,106) text rgb(14,13,12); ghost transparent / rgb(163,155,142); radius 9999px, h 48, 16px/600, padding 12/24; boxes identical to sketch.json; FAQ 134 wide. First pass missed CANCEL-PRIMARY@1440 (cold server, as B warned); warmed re-run complete (measure2.log) |
| C2 HOVER | primary rgb(217,184,127) opacity 1; ghost bg/text per spec (after.json) |
| C3 FOCUS | keyboard: focus-visible true, solid 1px brass/0.8, offset 2px. Mouse press (recorded): focus-visible false, outline none, transform none |
| C4 STACK 375 | pairs 343x48 stacked, "Access Your Downloads" one line, not clipped (screenshots viewed). Ring on primary in pair shots = harness Tab focus before shot |
| C5 contrast | primary 8.32, ghost 7.06 (≥4.5) |
| C6 NAV | finals /cart,/store,/account/downloads,/store,/hire-us,/store; full-load false x5, true for orders; activeElement BODY x6 (= HEAD) |
| C7 JOURNEY | /checkout/cancel,/cart,/checkout/cancel,/store; 2 known cloud errors only |
| C8 | scanner 116 hits / 48 solid; builder calls 2+2+1+1=6 |
| C9 | 9 files, 120/120 |
| C10 | mutants N1–N11 all RED |
| C11 | DESIGN_SYSTEM hunks = pill row + Ghost line only; doc 320 has 7 headings; class tokens all found at HEAD (misses only paths/logs/hash/harness field) |
| C12 | claims rc 0, 0 MISSING; diff only K16 locations (archive) |

Extra: fresh no-credential context opens /studio-lab demo (1440 and 1280); /studio/some-product shows "Sign in required" — premium auth not bypassed.

Gate rows (not claimed): full vitest, build, Biome, verify.

Bugs: none. For B: status line of doc 320 lacks the L28 "C round 498 PASS" form (grant l.4); reviewer Lows from A report remain Low; harness "lines" field counts padding (artifact). Ableton conformance: n/a (Store round).
