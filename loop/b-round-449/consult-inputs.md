# RETRO 450 consult inputs (B, round 449 -> 450 planning, 2026-11-11)

Window: rounds 435-449 (15 rounds). HEAD a8599a2 (gate 449 published). All paths relative to /home/runner/czaba-project/tmp/studio-real-loop.

## Numbers (each from the named file)
- Cost (`b-round-449/data/cost.txt`): total $264.79; B $198.56, A $55.61, C $10.62; median round $17.87; B median $13.11 (min 8.14 / max 19.78); A avg FAIL 5.47 / PASS 3.58. RETRO 435 window: total $255.35, median $15.62, B median $11.63, B share 70.5 %.
- Stage sums (`data/stage-sums.txt`): RETRO 435 $14.68; COPY-PD-VIS (436-437) $35.47; SYS-R435-SOURCE-SCAN-HELPER (438-439) $43.67; SYS-1 (440-441) $34.28; SYS-3 (442-445) $62.04; STORE-2b (446-449) $74.65; B share 75.0 %.
- Verdicts: 14 PASS, 1 FAIL (438, origin B spec C-R438-01). Gate skipped 435 (no source), 438 (FAIL). browserVerified 15/15. Fix-up rounds: 439 (re-do of 438), 443 (fix-up of 442) = 2/15 = 13.3 %.
- A STOPs (`data/stops-count.txt`): 439 and 442 (1 each).
- C bugs (`data/fails-detail.txt`): C-R437-01 low, C-R438-01 medium (B spec), C-R439-01 low, C-R442-M1 medium (no origin field), C-R446-01 low.
- L57 checker (`data/l57-check-window.txt`): INCOMPLETE on 442, 443, 447; OK on the other 12. L58 (`data/l58-check-window.txt`): OK 14/14 tasks 436-449.
- Gate reviews (`data/gate-reviews.txt`): 13 reviews, 54 numbered items (low 21, info 14, unlabelled 19); 0 Critical/High.
- Deferred Lows in window (`data/classify.txt`): 45 (A 25, gate 18, B 1, C 1); categories by regex: tests/harness 13, focus 9, timing/audio 6, keyboard 5, uncategorised 6, copy 3, layout 2, docs 1. Archive window 11 (3 medium closed: C-R438-01, C-R442-M1, B-R447-HIREUS-EMAIL-LIGHT-CLIENT).
- Saba-found new issues in window: 0.
- Screen (`b-round-449/screens/capture.log`): persistent lines 138/168/118/144, outside timeline+library 97/124/86/101 = identical to RETRO 435 and 420. Journey: stems still one after another on one Stems lane (F2, STEM-LANES awaiting Saba).

## Counters set at RETRO 435 for RETRO 450 (`backlog.json` retro_policy.signals_for_next_retro[0])
l58 rc0 on 100 % of sketches: MET (14/14). l57 rc0 with origin enum: NOT MET (3 of 15 incomplete: 442, 443, 447; C-R442-M1 without origin). Fiber-structure rounds have test:perf log: no ARCH-SPLIT stage in the window. C FAIL <= 1: MET (1). Fix-up chain < 15 %: MET (13.3 %). Round median <= $17.00: NOT MET ($17.87). B median <= $14.50: MET ($13.11). L23/L58 < 5100 bytes, lessons <= 60 lines: see `data/lesson-bytes.txt`.

## Retro candidates to rule (backlog.json retro_candidates)
1. B-R438-REVERSE-DIRECTION-MATRIX: round-438 port of tests; B's mutant matrix only tested where HEAD was wrong, never what HEAD caught that the port dropped (C-R438-01 NF2 wrapper narrowing, round 438 FAIL).
2. B-R439-SIBLING-SUITE-GAP: the fix for NF2 did not ask the same question of sibling suites RD2/SF2 (A-R439-REVIEW-M1, ruled Low).
3. A-R441-REVIEW-L1-OUTLINE-ORDER: B sketch dropped a positional pin (outline-before-lanes) in the full Overview state.
4. RETRO450-B-SKETCH-NO-GOLDEN: round 448 extracted an e-mail template with no golden/text-order test (reviewer Medium, re-graded Low).
5. RETRO450-B-INVENTORY-TOOL-FIRST-PASS: round 449 planning, first inventory grep was wrong (-- before --include; -glow matched text-glow); advisor caught it.
6. RETRO450-Q-STOP-THEN-PUBLISH: round 442 A wrote STOP (unruled Medium) but C ran full rows, PASS, and the gate published before B ruled (end state equal to HEAD, no loss). Existing L22 says a STOP on a ruled clause with a diff gets a short FAIL.
7. RETRO450-A-SHELL-EDITS-BYPASS-HOOK: round 447 A edited source via python string replaces in the shell (primitives hook did not fire), read primitives after editing, used git stash in the store tree. Note: the sketch workflow itself uses `git apply` (also a shell edit); round 449 A read the pre-flight skill after applying the sketch.
8. RC-R305-LESSON-CHAR-CAP: watch L23/L58 bytes.
9. INFO-C447-L57-ABSENT: c-round-447.json had no L57 fields.

## Deferred-Low root-cause clusters B sees (for a systemic-task decision)
- **Store style scan tests** (store-teal-sweep TS*, store-gradient-text GT*), hand-rolled regex/CSS parsers: A-R447-REVIEW-L1 (TS2 >=1 hit per allow-listed file), A-R447-REVIEW-L2 (no inline boxShadow / drop-shadow scan), A-R447-REVIEW-L3 (walks app/ only), A-R449-REVIEW-L-FILL-REGEX, A-R449-REVIEW-L-TEST-HYGIENE, TL-R449-L3-SCAN-ROOTS, TL-R449-L4-PARSER-QUOTES, TL-R449-D1-LOADING-BRAND-CLASS, TL-R449-D2-BARREL-ALIAS, plus Medium A-R449-REVIEW-GT1-TSX (GT1 CSS-only; scheduled as GT1b in STORE-2b-3b). The next stages 2b-3b (glow shadows), 2b-3c (remaining teal rules) and 2b-3d (dead tokens) each extend these scanners. The allow-lists exist only for dead components (LEGACY-DEAD-STORE-COMPONENTS: ArtistBioSection, TestimonialsSection [keep-list content, Saba question], VideoShowcase, PianoLoadingAnimation + .loading-brand, CinemaCurtainLoader).
- **Source-scan helper residue** (helpers/source-scan.ts from SYS-R435): A-R438-REVIEW-L2/L3, A-R439-REVIEW-M1/L2/L3/L4/L5, GATE439-L1/L2/L4/L5.
- **IME / held keys (SYS-3 residue)**: A-R442/443/445 Lows, GATE442/443/445, GATE444-L1-MACOS-OPTION, A-R444-REVIEW-L1-ALTGRAPH-META; platform half = TLM-SYS3-IME-PLATFORMS (deadline RETRO 450).
- **LeadMagnet lifecycle** (STORE-2b-1): C-R446-01 stale error, A-R446-REVIEW-L1, GATE446-L1 scroll-lock ref in render, GATE446-L2 navigate-to-Studio scroll restore.
- **Studio visual misc (437)**: B-R437-BUTTON-CURSOR-UNLAYERED, GATE437-S1/S4/S5, A-R437-REVIEW-CR3/CR6, C-R437-01 (first Play after add while decoding does nothing).

## L46 deadlines that fall at RETRO 450 (`data/retro450-deadlines.txt`)
TLM-PERF15-FIREFOX (asked RETRO 416, 420, 435; reopened as task blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX), TLM-SABA-B-12-FIREFOX-SAFARI (asked RETRO 435 Q1), TLM-SYS3-IME-PLATFORMS + TL-R444-L1 (first deadline), STUDIO-PERFORMANCE parked remainders (asked RETRO 435 Q3), SIG-R441-SOURCE-PIN-RULING (RETRO-450 question), RC-R305-LESSON-CHAR-CAP (watch).

## Lessons file
`lessons.md` is at 60 lines (the cap). Any new lesson must replace or merge an old one.
