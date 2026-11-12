# tech-lead consult (RETRO 465), returned 2026-11-12

Input: b-round-464/consult-inputs.md. Everything is tech-lead's opinion; facts cite files. Recorded close to verbatim.

## 1. Rulings on candidates
Four of the five share one root: a guard that cannot disagree with what it checks. One combined clause goes into **L52** (l.36), not L23/L58 (near the 5100 B counter).
- **L52 clause** (EXCLUSION-LIST-AS-STRONGER, GENERATOR-TEST-SHARED-RULE, the resolver half of WALKER-STOP-LOSS):
  "**A guard must be able to disagree with what it checks (RETRO 465):** a guard never shares its rule with the generator or analyser it guards (it uses an independent, stricter or syntax-based rule); every HEAD exclusion, allow or skip list is swept HEAD vs sketch, and a wider one is never "stronger"; a regex analyser that imitates a resolver is compared with each real resolver it imitates (tsc, Vite). Each gets one mutant on which guard and subject disagree. Evidence: A-R451-REVIEW-M1-GT5-BARREL-SCOPE, A-R456-REVIEW-M1, A-R457-REVIEW-M1, A-R463-REVIEW-M1 (4×)."
- **WALKER-STOP-LOSS, stop-loss half:** reject as a lesson: already a D-ID ruling in TL-R455-WALKER-LIMITS (D-29z1621/1623), used once.
- **PRECHECK-TREE-NOT-DELIVERED:** adopt, merged into **L56** (l.40):
  "**Pre-check tree = delivered tree (RETRO 465):** B's claims and build-compare run on a tree that holds every granted path in its delivered form, docs included (Tailwind v4 scans `docs/*.md`); a doc A writes gets a placeholder with its exact required lines and literals. Evidence: A STOP 462 (K23), C-R462-01 (2×)."
- **PREHYDRATION-HANDSHAKE:** different root, 1×; merge into **L18** "First painted frame" (l.53):
  "A pre-hydration DOM handshake keeps its state off React-owned nodes and gets a browser row with a node injected before hydration (React #418, document client re-render). Evidence: C-R459-01 (1×)."
- **INFO-A451-L60-SED-DOC:** L60 rule already existed; add as evidence to L60's store-tree clause, "(1×)" -> "(2×)".

## 2. Causes
Inputs undercount STOPs: a-round-457.md and a-round-459.md also open with "STOP — needs B ruling": 5 STOPs, four the same events as the four C FAILs.
- 451 (FAIL+STOP): sketch v4 widened shared BARREL_FILES 3 -> 5, GT5 skipped 2 files HEAD scanned (a-round-451.md; b-round-451/scope-sweep.md). L52 clause.
- 456 (FAIL+STOP): IMPORT_STATEMENT dropped brace lists with a comment; B's sketch made the walker verdict gating (origin B spec, a-round-456.md). L52 clause.
- 457 (FAIL+STOP): resolveSpecifier sent ./u/ to sibling u.ts, tsc resolves u/index.ts (a-round-457.md; b-round-457.md shows Vite and tsc disagree). L52 clause.
- 459 (FAIL+STOP): hydrateRoot(document) client-rendered the document after a mismatch and replaced the boot-mutated <style> (a-round-459.md, c-round-459.json, tasks/round-460.md "Why we missed it"). L18 addition.
- 462 (STOP, PASS): B's placeholder doc 301 lacked line 4, so expected K23 was wrong (a-round-462.md); C-R462-01 same root. L56 addition.

## 3. Trims (net bytes down)
- l.3 (2023 B) -> pointer ~350 B; history kept in b-round-464/lessons-before-465.md (~1650 B saved).
- l.41 (L58): drop the RETRO 401 sentence on a `[K#]` claim that sketch-review.md exists (covered by the RETRO 416 l58-check clause); shorten the "dispatches 388, 391, 394, 395…" parenthetical (~400 B).
- l.16 (L23): shorten the GATE276-T1, C-R258-01, gate 262 evidence parentheses to bare ids (~450 B).
- ~2500 B removed vs ~1150 B added; line count unchanged.

## 4. Systemic task
Do not dispatch now. Trigger, whichever first: root answers ARCH-CHECKPOINT-STYLE-SCAN; the next dead-CSS deletion stage is planned; round 480 (deadline in the spirit of L46). Reasons: all these Lows are 0 cases in app/ today; unify-then-split = two ports, each needing an L4 golden test + HEAD-pin mutants; walker precedent 3 rounds, $60.82, 2 FAILs.
When it runs: **SYS-R465-DEAD-CSS-MATCHER** — store-dead-css.test.ts private withoutComments (l.115) replaced by one exported string-aware stripper + one isUsedInSource from helpers/style-scan. Closes TL-R464-L1, A-R464-REVIEW-L3/L4/L5/L6, SIG-R464-THIRD-COMMENT-STRIPPER. SIG-R463-USED-DEFINED-TWICE only if css-prune.py's rule is retired or calls the helper. Does not close A-R463-REVIEW-L1/L6, TL-R464-L2, TL-R458/C-R458 walker Lows. Risk: the port silently changes DC1/DC2 verdicts (the L52 clause guards it).

## 5. Cost
RETRO 450 reuse hypothesis not confirmed: B average over 2b-3b..3d (453, 454, 456-458, 462-464) $15.08 vs $13.73.
Levers: (1) review cap: one full tech-lead review + at most one delta review per sketch; a third needs a written reason in sketch-review.md (count review headings). (2) promote the one-off retro/planning collectors to tools/; new .py per b-round-N/ <= 2.
Counters for RETRO 480: round median <= $18.00; B median <= $13.00; B share <= 68 %; C FAIL <= 2; new deferred Lows <= 35 (<= 30 missed: 49 classify.txt; 45 before); l58-check 15/15 (458 INCOMPLETE); lessons <= 60 lines and <= 57,500 B, L23 and L58 each < 5100 B.

## 6. Patterns
- Hash-pinned sketches turn every reviewer Medium into STOP + FAIL (451, 456, 457, 459 fix sat in pinned code); a ruled micro-fix allowance may be worth discussing.
- Collectors miss things: stops-count.txt misses 457 and 459; B cost for 459 is a lower bound (0-byte cost file). Check collectors against head -1 a-round-N.md.
- One owner three rounds in a row (2b-3c-2a, 2b-3d, ~$61 each) again before the architecture answer; an unanswered root checkpoint should get a deadline.
