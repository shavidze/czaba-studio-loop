# C round 490 — verdict: PASS (browserVerified true)

Scope: test-only fix-up (real WheelEvent/TouchEvent in entrance tests) + doc 316. Components are byte-equal to round 489's v3. Store HEAD `73f994d`, 4 uncommitted paths. Production build of the tree served on :5191; HEAD controls carried from `c-round-489/head-table.txt`. Evidence under `c-round-490/`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: exactly 4 paths (3 ` M`, 1 `??`); `root.tsx` + protected files no diff | claims-start.txt |
| C2 claims | PASS: start and end output equal to `claims-490-sketch-output.txt`, stderr empty | claims-start.txt/.err |
| C3 apply | PASS: K9 `====` in the claims output | claims-start.txt |
| C4 covering | PASS: 4 files / 94 tests | covering.log |
| C4 mutants | PASS: 30 lines, equal to `b-round-489/mutants/mutants-summary.txt`, 0 NONE/BAD-ANCHOR; MA,MB red at S1; MC,MD at E8c; ME,MG at S3; MF,MH at E8e. Run on a scratch clone (`/tmp/c490-scratch`), never on store | mutants/ |
| C4b real-event rows | PASS: `new Event(` count 0; S1,S2,E8c,E8d,E8c... call `dispatchScrollGesture`; K5/K5b equal | claims |
| C5 1× | PASS: 1440 remDs 3475 / remFc 3459 / logo 1650 / tag 983; 1280 remDs 3484 / remFc 3473 / logo 1752 / tag 1102; state live, gaps 0, firstCovered < fp | tree-table.txt |
| C5b clientnav | PASS: remDs 3488, remFc 3478, coveredAfterMark 0, url / | tree-table.txt |
| C6 4× | PASS: remDs 3864 / 3686; logo 1538 / 1523; tag 895 / 872 | tree-table.txt |
| C7 slow first visit | PASS: net4g cpu1 live (3676, 1502, 869); cpu4 live (4164, 1550, 895); delay800 live (3957, 1518, 850). Recorded: delayjs live, net3g expired (as B predicted) | tree-table.txt |
| C7b | PASS: delay3000 1440/1280 expired, logo 0 tag 0, remFc 2293/2314, last sample cover 0 | tree-table.txt, f-1440-cpu1-delay3000.json |
| C8 wheel | PASS: scrollY 0; wheel removed 897/831 ms after firstCovered, state live; wheel50 logo 0, skipped | tree-table.txt |
| C8t real CDP touch | PASS: 24 scroll events, 0 while covered, both start offsets (100, 1200); first scroll event with empty cover field | touch.txt |
| C9 / C10 | PASS: reload, rm no cover; blockjs remFc 2301, logo 0, state null | tree-table.txt |
| C11 | PASS: esc50/tab50/click50 skipped, logo 0, remFc 96/171/274, scrollY 0, tab50 focus A, click50 url / | tree-table.txt |
| C11b | PASS: live, logo 217/217/234, removedAfterMark 13/17/68 ms, scrollY 0, tab1500 focus A, url / | tree-table.txt |
| C12 arrive | PASS: logo 1983, remFc 3482 | tree-table.txt |
| C13 recording | PASS: webm 946331 B, sha256 `b5c47655…1ea7` (webm.sha), copied to `user-review/img/`; still 2.0 s shows wordmark; 3.2 s shows wordmark mid-fade over the hero | rec/ |
| C14 hydration | PASS: hydErr 0 in all 25 rows | tree-table.txt |
| C15 Studio + purchase protection | PASS at 1440×900 and 1280×720 in fresh contexts without credentials: `/account` "Sign in required", no "Full Name"; `/studio/middle-east` "Sign in required", 0 `audio[src]` (premium auth not bypassed); `/studio-lab` opens anonymously (`auth_user` null), "Demo collection ready", Enter on first library item → 1 clip; Space → state `Playing`, clock `00:01.471` after ~1.5 s (round 482 reference 00:01.271); Space → `Stopped`. Screenshots per step | c15/c15.json, c15/*.png |
| C16 doc | PASS: l.4 byte-exact `Completed (C round 490 PASS)`; 7 TEMPLATE headings in order; no "pending"; cited row ids exist; "30" matches summary | doc 316 |
| C17 lessons | PASS: 60 lines; "real event" ×1, "example number" ×1 | lessons.md |
| C18 L57 | PASS rc 0 | l57-check.txt |

## Observations (not bugs, no gate impact)
- **click50 gapsWhileCovered** was 1 here (0 in round 489), re-runs 0 and 2: one or two sampled frames at the cover→overlay hand-off on a pre-hydration skip click; blackFrames 0. Not a C11 condition; code unchanged. Recorded as info `C-R490-INFO-CLICK50-HANDOFF-GAP`.
- At 3.2 s the entrance wordmark and the hero's own "CZABA" headline are visible together mid-crossfade. Left to Saba's manual feel check (TLM-R489-SABA-ENTRANCE-FEEL).
- C15 verified the transport state and clock in headless Chromium; it did not capture real audio output or an export WAV (not part of this round's rows). Premium purchase protection verified on the prod build of the tree, not the dev server.

## Not run by C (gate)
Full vitest, typecheck, build, Biome, `npm run verify`. Manual: TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE (real phone).

## Outcome (task §5)
SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER and A-R489-REVIEW-NONZOOM-CLASSIFY: browser + unit evidence satisfied. A-R490-REVIEW-NOCTRL-NEG-WHEEL (Low; no-ctrl wheel at deltaY −100 not pinned in S1/E8c) is B's to rule; it is below the STOP threshold and not a C finding. A-R490-REVIEW-TOUCH-DELTA-LABEL and A-R490-REVIEW-E18-LITERAL: B's (Low).
