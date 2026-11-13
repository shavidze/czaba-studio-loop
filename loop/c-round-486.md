# C round 486 — B-R480-ORDER-CARD-KEYBOARD: **PASS** (browserVerified true)

HEAD `0341229`, tree = A's 3 files; source unchanged during C (claims start == end). Real Chromium (Playwright) on :5173 at 1440×900, 1280×720, 375×812. Evidence in `c-round-486/` (sketch.json, x-sketch.json, ax-sketch.json, pxdiff.txt, mutants/, auth.json, shots/).

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE | PASS | claims-start/end identical; only diff vs B's sketch output is the allowed K18 archive move; K17 `L58 OK`; 0 NOT-FOUND; K9 speakers 21 / 0 |
| C-APPLY | PASS | `cmp` both files with `b-round-485/sketch-486/` equal (2 of 2) |
| OC-TAB-STUBBED | PASS | both cards are Tab stops 12,13 (1440/1280), 8,9 (375); focusVisible true; outline solid brass ~0.8 alpha, offset −2px settled; HEAD had `[]` |
| OC-KEYS-STUBBED | PASS | Enter → expanded true, "Middle East" visible, focus on same button; Space → false, hidden, focus kept |
| OC-HELD | record | Enter×6 → false (toggles each repeat), Space×6 → true (once); focus never left the button |
| OC-RING | PASS | `shots/c-ring-*.png`: brass ring visible on all four sides inside the border |
| OC-PIXEL | PASS | 12/12 pairs 0 differing px vs B's HEAD shots (pxdiff.txt) |
| OC-BOX | PASS | card/header/title boxes, font, cardHeight equal HEAD at 3 viewports, collapsed+expanded; second card box equal; h3 cursor auto, button cursor pointer |
| OC-MOUSE-STUBBED | PASS | click expands, click collapses; after press `data-focus-source` pointer, focusVisible false |
| OC-PRESS | PASS | pressed transform `none` at all 3 viewports; press-release still expands |
| OC-SELECT | PASS | drag selects "Order #1001"; dblclick selects "#"; expanded states equal HEAD |
| OC-AX-STUBBED | PASS | `heading "Order #1001 Paid Nov 1, 2026 $49.00 1 item" [level=3]` > `button` same name; CDP expanded false; no region |
| OC-UNIT | PASS | C re-ran 5 covering files: 68/68; mutants M0–M8 re-run from scratch copy: summary identical to B's, all red on expected OC rows |
| DOC | PASS | l.4 byte-exact; 7 TEMPLATE headings in order; cites only OC1–OC4; APG/no-region/inset ring/jsdom-only OC4/TODO present |
| G486-AUTH | PASS | fresh context, no credentials, both viewports: `/account/orders` "Sign in required", 0 order buttons; `/studio-lab` opens the anonymous demo (auth_user null); `/studio/middle-east` "Sign in required", 0 audio[src]. Premium auth not bypassed |
| OWN-BACKEND | BLOCKED | backend unavailable in cloud; not PASS |
| gate | — | root gate only |

## Findings
No bugs. Observations (not bugs): computed ring width reads 1px at DPR1 (shared focus rule, not changed here); mid-transition samples show 1.84–1.94px offset, settled −2px. Reviewer's Medium (no unit guard for `select-text`, `active:transform-none!`, `[--focus-offset:-2px]`) is ruled by task §4 and covered by browser rows; B may track as a guard task (B-R486-FOCUS-OFFSET-GUARD already queued). Order rows use stubbed auth/orders: client path only.
