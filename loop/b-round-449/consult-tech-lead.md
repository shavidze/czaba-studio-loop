# tech-lead consult — RETRO 450 (B round 449 -> 450 planning, 2026-11-11)

Prompt input: `b-round-449/consult-inputs.md`. Read-only; no edits. Verbatim summary of the returned report (structure and every ruling kept):

## 1. Candidates
- 1-4 (B-R438-REVERSE-DIRECTION-MATRIX, B-R439-SIBLING-SUITE-GAP, A-R441-REVIEW-L1-OUTLINE-ORDER, RETRO450-B-SKETCH-NO-GOLDEN): one cause (rounds 438, 439, 441, 448 rewrote/ported/extracted tests or code and checked only what HEAD got wrong, never what HEAD already pinned; backlog 441: "A dropped HEAD pin (L4)"). Merge into L4, no new line:
  > **Port preserves HEAD (RETRO 450):** when a sketch rewrites, ports or extracts a test or module, B lists every assertion, position and output HEAD pins (sibling suites included) and maps each to a row or a ruled drop. Mutants run both ways: red where HEAD was wrong, and red when a HEAD pin is removed. Extraction gets a golden test. Evidence: C-R438-01, A-R439-REVIEW-M1, A-R441-REVIEW-L1, RETRO450-B-SKETCH-NO-GOLDEN (4×).
  Ask Saba to rule SIG-R441-SOURCE-PIN-RULING together with this.
- 5 (RETRO450-B-INVENTORY-TOOL-FIRST-PASS): already covered by L1 ("test the scanner on one known-shape mutant"); add the id as evidence only.
- 6 (RETRO450-Q-STOP-THEN-PUBLISH): adopt as a clause in L22 (see §5).
- 7 (RETRO450-A-SHELL-EDITS-BYPASS-HOOK): loop-rule question for Saba + one clause in L60:
  > Never use `git stash`, `git checkout --` or shell string-replace edits in the store tree; source edits go through the editor tools or a reviewed `git apply` sketch, after the mapped primitives are read. Evidence: RETRO450-A-SHELL-EDITS-BYPASS-HOOK (1×).
  Question for Saba: does applying a reviewed sketch with `git apply` count as a hook-equivalent edit?
- 8 (RC-R305-LESSON-CHAR-CAP): keep watching, becomes a counter. L23 5058, L58 4988 vs 5100 cap; neither can take a merge.
- 9 (INFO-C447-L57-ABSENT): drop as a lesson; covered by L22/L57; tracked with the L57 counter.

## 2. Lessons to free (optional, only if room is needed)
L5 (lineWidth, round 193: 1×, never cited in 435-449, Biome enforces width); L24 (round 202: 1×, never cited in the window).

## 3. Store style-scan tests
- `store-teal-sweep.test.ts` and `store-gradient-text.test.ts` each walk the tree with their own copy of the code and their own allow-lists; no shared scanner.
- Removed by deleting dead files: A-R447-REVIEW-L1, TL-R449-D1, TL-R449-D2.
- Scanner bugs that stay either way: TL-R449-L3, A-R447-REVIEW-L3, TL-R449-L4, the fill regex (A-R449-REVIEW-L-FILL-REGEX), A-R447-REVIEW-L2, A-R449-REVIEW-L-TEST-HYGIENE, Medium A-R449-REVIEW-GT1-TSX.
- Deletion needs Saba (CLAUDE.md "არაფერი წაშალო … ჩემი ნებართვის გარეშე"); Testimonials keep-list question open. The dead set is bigger: all 8 LEGACY-DEAD-STORE-COMPONENTS files are exported only via `app/components/{home,loading,common,audio}/index.ts`, incl. `Timeline`, `email.server.ts` (0 importers) and `PianoCurtainLoader`.
- **Recommendation:** one bounded systemic task SYS-STORE-STYLE-SCAN **before STORE-2b-3b**: move the file walk and roots (`app/` + `perf/`) into `app/lib/__tests__/helpers/style-scan.ts` with a quote-aware CSS rule reader and a TSX `className` + `style={{}}` scanner; closes the scanner-bug group and GT1-TSX, one mutant per Low; separate from the arrangement `source-scan.ts` helper (~10 open Lows of its own). Value: 2b-3b/3c/3d would otherwise extend both copies three more times. Risk: low (test-only); prove hit counts equal to HEAD. Ask Saba to approve deletion in parallel; run it in 2b-3d with allow-list removal as acceptance.

## 4. Counters for RETRO 465
1. Round median ≤ $17.00 and B median ≤ $12.50. 2. B share ≤ 70 %. 3. l57-check rc 0 on 15/15 rounds incl. short routes. 4. Every A STOP naming an unruled Medium gets a short FAIL with `origin`: 100 %. 5. Fix-up chains ≤ 1, net new deferred Lows ≤ 30 (window: 45). 6. L23 and L58 < 5100 bytes, lessons ≤ 60 lines.
Cost lever (a guess, no breakdown of B cost exists): for consecutive stages of one feature (2b-3b..3d) B starts from the previous stage's claims, pre-check and mutant scripts and edits only the changes; every row still runs on the new sketch. Measure B cost per stage vs the 446-449 average of $13.73.

## 5. RETRO450-Q-STOP-THEN-PUBLISH
Yes. L58: an unruled Medium A's reviewer finds on B's sketch is a planning FAIL; L10: nothing re-dispatched before B rules. Round 442: C wrote PASS while recording C-R442-M1 as an unruled Medium with no `origin`; the gate published before B ruled (skipped L10); no harm only because the end state equalled HEAD. Ruling: an A STOP naming an unruled Medium+ takes the L22 short route even if every row passes (SOURCE-SCOPE, CLAIMS, auth guard, the STOP's check; FAIL "STOPPED — routed to B", `origin: B spec`, all L57 fields); the claim-value exception keeps the full run. Clause for L22:
  > A STOP naming an unruled Medium+ is a short FAIL even when every row passes; the gate never publishes an unruled Medium. Evidence: C-R442-M1 (1×).

## 6. Architecture note
One, on the store's test ratchets: gate 447 called the store-teal-sweep allow-list a cross-cutting ratchet needing edits at every stage; gate 449 proposed a dead-code clean-up; all allow-list growth sits on two `app/lib/__tests__` files with duplicated scanning code. Response = §3. Smaller signals, keep: `useLeadMagnet.ts` takes on route awareness (gate 446); the hairline-handle class is duplicated in two places (gate 437).
