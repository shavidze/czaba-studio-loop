# B round 438 → 439 planning (2026-11-10)

**Decision: CONTINUE.** Round 439 is a **re-do of SYS-R435-SOURCE-SCAN-HELPER** with a v4.1 delta. It is test-only and targets C's round-438 Medium first.
- **Task:** `current-task.md`.
- **Decisions:** D-29z1560 … D-29z1562. `backlog.json` is now v425.
- **Archive:** `tasks/round-438.md` is a byte-identical copy of the round-438 task [K12]. Nothing was deleted.
- **Pre-edit copies:** in `b-round-438/` (`*-before-439.*`). Checkpoint: `b-round-438/checkpoint.md`.
- **Advisor:** available, and used after orientation and at the close review. The close review's fixes were applied: the HEAD assertion map and ruling (i), the M21/M24 wording, the exact doc-285 edits E1–E8 with an expected file, the L31 loaded headroom, and the review files relabelled as condensed.
- **Consults:** `tech-lead` reviewed v4 and v4.1; both verdicts were approve-with-lows. `product-designer`, `ableton-arrangement-expert` and `performance-optimizer` were not needed, because this is a test-only round.

## 1. Round 438 result (from C's evidence)
- **C's verdict:** `c-round-438.json` is **FAIL**, with `browserVerified` and `realVerified` both true.
- **The bug:** **C-R438-01-NF2-WRAPPER-TAG-NARROWING** (Medium, origin B spec).
  - A's code-reviewer found it, and A stopped under L11.
  - C reproduced it independently: mutant M17 is rc 1 at HEAD and rc 0 on v3 (`c-round-438/m17-*.log`).
  - The cause is in B's v3 sketch. The ported NF2 selected only lowercase `<input>` tags, while HEAD matched `type="number"` on any element.
- **Gate 438** was `skipped`. The baseline HEAD stays `142918b`, and the tree keeps A's round-438 work (the v3 sketch and doc 285).
- **Not done:** SYS-R435 and its 9 Lows plus the GATE434-S2 subfolder half stay open until a C PASS. C's auth, play and export browser rows on v3 are evidence only.
- **A's reviewer Lows:**
  - L1 (PG2 string markup): fixed in v4.
  - L2 (DS4/SF2 text containment, equal to HEAD): deferred.
  - L3 (parse diagnostics; typecheck covers it): deferred.
- **A's Architecture note:** recorded as `confirmedBy` on SIG-R438-OTHER-SCANNERS. It is a signal, not a task.

## 2. The ruling and the v4.1 sketch (D-29z1561)
**Ruling: option (2).** Accepting the narrowing would lose a HEAD assertion on a Medium that came from the spec.

Following the advisor, B also diffed every HEAD scanner against its port in the reverse direction: what did HEAD catch that the port drops? That found the same class beyond NF2: `<input>` and `<progress>` markup inside strings and comments.

**v4.1 changes:**
- **Helper:**
  - an any-tag query, `allJsxOpeningTags` / `scanAllJsxOpeningTags`, with a `name` field;
  - `jsxOpeningTags` is now a filter over it;
  - a new fixture, SS9.
- **NF2:**
  - selects number fields by `type` on any tag;
  - pins the non-`input` list to `[]`;
  - adds a raw-count guard (lookbehind `(?<![\w-])`).
- **PG2 and IN1:** raw-count guards.

**Evidence** (B's scratch runs under `/tmp/b439`, results in `b-round-438/`):
- Mutants on HEAD, v3 and v4.1 for M1–M25 and M21b, plus H1–H10. On v4.1, M17, M18, M22 and M23 are red NF2, M19 is red PG2, and M20 and M21b are red IN1. The only mutants red at HEAD and green on v4.1 are M1, M2, M4, M5 and M12, which were already accepted.
- typecheck rc 0.
- lint: 205 warnings, the same as HEAD.
- Covering set: 7 files, 24/24.
- Full suite: 273 files, 4029 tests, rc 0.
- B simulated A's apply plus E1/E4 on a scratch copy of `store/`. The claims diff it produces is saved as `claims-439-expected-after-A.diff.txt`.
- `l58-check`: L58 OK. `sketch-review.md` names both shas.

**Rulings (h) and (i).** After the advisor's close review, B mapped every HEAD `expect(` in the six tests to its v4.1 counterpart (`b-round-438/head-assertion-map.md`). Three HEAD checks only measured the old scanner's coverage and are deliberately not ported:
- **(h)** DS4's `<Modal` text inside strings. A component cannot render from a string.
- **(i)** PG2's self-closing-only and no-`</progress>` checks. The parser reads paired tags. M24 (a paired tag with the class) is red at HEAD and green on v4.1, which is accepted; M25 (no class) is red on both.
- **(j)** reading top-level `*.test.tsx` (SF2, DS4) and `*.spec.tsx` (NF2, RD2, PG2). The helper skips test files, which are never rendered in the UI.

**Red at HEAD, green on v4.1 in the same suite:** M1, M2, M4, M5, M12, M21 (IN1 catches it through M21b) and M24.

**Doc 285:** B applied the exact edits E1–E8 by script, giving `doc285-expected.md`. A's doc must `cmp` equal to it. The old "no assertion lost" line is reworded (E4).

**New deferred Low:** TL-R439-N1-NF2-RAW-SPELLING.

**RETRO-450 candidate:** B-R438-REVERSE-DIRECTION-MATRIX. `lessons.md` is not edited.

## 3. Order after round 439 (D-29z1562, unchanged)
1. REGRESSION-2026-11-13 at the first planning on or after 2026-11-13.
2. SYS-1.
3. SYS-3.
4. STORE-REDESIGN 2b–5.
5. ARCH-SPLIT, after a frontend-architect checkpoint through root. ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS is still open.
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2, under the skip rule.

STEM-LANES jumps ahead once Saba answers. Next RETRO: round 450. No new architecture checkpoint is requested: this is a test-only helper with one owner.

## 4. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - C-R438-01 is open (Medium);
  - SYS-R435, SYS-1/3, the STORE stages, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 queues, STEM-LANES (Saba) and SRW-21 (deferred_user) remain;
  - every deferred Low must be fixed before final acceptance.
- **Not BLOCKED.** Every round-439 row runs in the cloud except the fake-bearer backend row.

## 5. Readiness for commit
Nothing is ready to publish. Round 439 publishes after C PASS and the gate.

This planning wrote only loop artifacts. The store tree is unchanged since A's round 438 (9 granted paths; K2). Scratch copies are under `/tmp/b439`, outside the store. No server was started.
