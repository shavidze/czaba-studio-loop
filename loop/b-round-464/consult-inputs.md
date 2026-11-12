# RETRO 465 consult inputs (B round 464 -> 465 planning, 2026-11-12)

Loop root: /home/runner/czaba-project/tmp/studio-real-loop. Store: /home/runner/czaba-project/store (HEAD 6d321c7, clean). Everything below is data.

## Window 450-464 numbers (b-round-464/data/)
- cost.txt: 15 rounds, $282.31 (B 202.43, A 70.17, C 9.71); round median 20.25; B median 14.44 (min 1.51 = round 459 planning, an interrupted attempt whose cost file is 0 bytes, so a lower bound); B share 71.7 % (stage-sums.txt).
- RETRO 450 counters (backlog retro_policy.signals_for_next_retro[0]): round median <= 17.00 (MISSED 20.25), B median <= 12.50 (MISSED 14.44), B share <= 70 % (MISSED 71.7), l57 15/15 (MET, l57-check-window.txt), new deferred Lows <= 30 (window by id regex: 49 in classify.txt; check), lessons <= 60 lines (MET, but 58,399 bytes; L23 l.16 5033 bytes, L58 l.41 4971 bytes).
- Verdicts: 11 PASS, 4 FAIL (451, 456, 457, 459), gate skipped 450 (RETRO) + the 4 FAILs. browserVerified 15/15.
- A STOPs: 451 (A-R451-REVIEW-M1 GT5 barrel scope), 456 (A-R456-REVIEW-M1 walker comment in brace list), 462 (claim K23 only).
- Stage sums: STORE-2b-3c-2a (456-458) $60.82 for one test-only walker (2 FAILs); STORE-2b-3d (462-464) $60.95; SABA-B-13 (459-461) $43.35; SYS-R450 (451-452) $35.83.
- fails-detail.txt: C bugs and origins; gate-reviews.txt: 51 numbered review items (low 15, info 7, medium 1, unlabelled 28).
- l58-check-window.txt: task 458 INCOMPLETE, others OK.
- Saba-found issues in window: SABA-B-14 (seek thumb, round 455) and SABA-B-13 (entrance, rounds 459-461). Both tasks have a "Why we missed it" section; lessons L61 (painted range fill) and L18 (first painted frame) carry the clauses.

## Retro candidates to rule (backlog.json retro_candidates, last five)
RETRO465-B-EXCLUSION-LIST-AS-STRONGER, RETRO465-B-WALKER-STOP-LOSS, RETRO465-B-PREHYDRATION-HANDSHAKE, RETRO465-B-PRECHECK-TREE-NOT-DELIVERED, RETRO465-B-GENERATOR-TEST-SHARED-RULE. Texts: `python3 -I -c "import json;[print(x['id'],x['text']) for x in json.load(open('backlog.json'))['retro_candidates'][-5:]]"`. Also INFO-A451-L60-SED-DOC (open_findings, "retro input RETRO 465").

## Rounds to read for causes
- 451: a-round-451.md, c-round-451.json, b-round-451/scope-sweep.md
- 456/457/458: a-round-456.md, c-round-456.json, c-round-457.json, b-round-457.md, b-round-458.md
- 459: c-round-459.json (C-R459-01), b-round-459.md, tasks/round-460.md
- 462: a-round-462.md (STOP K23), c-round-462.json (C-R462-01)
- 463/464: a-round-463.md (M1), a-round-464.md, gates/round-464/review.md

## Deferred-Low clusters seen by B (for a systemic task)
- Dead-CSS / keyframes matcher Lows: TL-R464-L1, TL-R464-L2, A-R464-REVIEW-L3..L6, A-R463-REVIEW-L1, L6, SIG-R463-USED-DEFINED-TWICE, SIG-R464-THIRD-COMMENT-STRIPPER (three comment strippers, two "used" definitions).
- style-scan walker Lows: TL-R455-WALKER-LIMITS, TL-R458-L1..L4, C-R458-L1/L2.
- ARCH-CHECKPOINT-STYLE-SCAN (root, filed D-29z1619, unanswered) covers the helper split.

## lessons.md
60 lines, 58,399 bytes. Policy: <= 60 lines, replace obsolete lessons, do not append. Every added clause must merge or drop text.
