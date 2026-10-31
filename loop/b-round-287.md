# B round 287 → 288 planning (2026-10-31)

**Decision: CONTINUE.** Next task: round 288, the FIX-PD-1a2 fix-up (`current-task.md`). Advisor: available and consulted once before writing; a second call follows hand-off.

## 1. Evidence read
- **`c-round-287.json`:** `taskStatus: FAIL`, with `browserVerified: true` and `realVerified: true`.
  - **12 rows passed:** CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT (8 files / 134), UNIT-MUTANTS N1–N6, B-VERSION-CARD, B-FREE, B-REGRESS, B-JOURNEY, R286-KEEP, G287-AUTH and DOC-215.
  - **Failed:** only the bbox/height clauses of B-STORE-CARD and B-HOME-CARD (C-R287-01, Low). The text and colour of those two rows passed.
  - **BLOCKED (backend unavailable in cloud):** the owned-Standard upgrade state and the real-backend 403.
- **`gates/gate-round-287.json`:** `skipped` (C taskStatus FAIL). The baseline stays `096fa4b`, and A's 7 round-287 paths remain uncommitted. Their sha256 values equal `a-round-287.md` (claims K2).
- **`a-round-287.md`:** the code-reviewer scored 7/10.
  - Medium 1: the synthetic Premium is unvalidated, which is out of grant.
  - Medium 2: A fixed it in its own tests.
  - Lows and one Architecture note.
  - A's L12 question.

## 2. Backlog changes (`b-round-287/backlog-update.py`, D-29z704…D-29z706; backup `b-round-287/backlog-before-288.json`)
| Id | Change |
|---|---|
| FIX-PD-1a2 | **ბაგია**. Fix-up round 288 under the same stage id |
| C-R286-01 / C-R286-02 | Fixed in the tree; C's text and colour rows passed. They close with 288 PASS and publish. **Not მზადაა yet** |
| C-R287-01 (Low) | New, open. Fixed now in round 288 (D-29z705): it is the round's own regression from B's spec conflict, and the owned files make it cheap |
| A-R287-PREMIUM-UNVALIDATED | Ruled Low; folded into round 288 (D-29z706) |
| A-R287-ARCH-ADAPTER-ZERO | Signal only. No consumer outside the adapters (K10), and `app/services` is frozen |
| A-R287-L12-CLASS-PINS | Ruled: the class pins are allowed here |
| INFO-C287-L29-PROTECTION-CLAUSE | Noted. Round 288 protection clauses carry K tags |
| A-R287-REVIEW-UPGRADE-NEGATIVE, A-R287-REVIEW-DECIMAL-FORMAT | → `deferred_low_polish` |

`feature-status.md` is updated (rows 194–196 and the PD-REVIEW row). `lessons.md` is unchanged at 60 lines; L3 and L4 already cover this miss.

## 3. Ruling on C-R287-01 (L4/L10)
- **Option (a) wins.** The unknown branch adds the known line's height: `leading-8` on `/store` and `leading-7` on home.
- **B's own sketch** on A's dev tree with C's mock and inline 2rem/1.75rem gave 589.6 / 417.6 at both viewports, equal to HEAD (`b-round-287/probe/lh-sketch.json`). The standard mock was restored afterwards (`products: 8`).
- **Rejected (b):** visibly ragged card bottoms in one grid row.
- **VersionSelector stays frozen;** C measured 124 px, equal to HEAD.
- **The cause was B** (L4, L3).

## 4. Next round (288) in one paragraph
Round 288 makes two class-string edits on the unknown branches (`store.tsx:559`, `ProductCard.tsx:162`) and one validation at `product-utils.ts:105`. In the tests, three pins in A's new test file are replaced (listed before/after) and PR10 and VC5 are added. Mutants N7–N10 cover the new code, and N1–N6 are re-run. Doc 215 line 4 becomes `Completed (C round 288 PASS)`. C's rows are B-LINE-BOX (computed line-height 32/28 px and card heights equal to HEAD ±1), B-PREMIUM (a new `bad-premium-track` fixture in C's scratch mock), B-KEEP-287, B-JOURNEY (10 fixtures), G288-AUTH and DOC-215.

## 5. Queue and cadence
- **REGRESSION** is not due: the last sweep was 2026-10-30 and the next is due on or after 2026-11-02. If round 289 is planned on or after that date, it is a REGRESSION round.
- **RETRO** runs at 290.
- **After FIX-PD-1a2 closes:** FIX-PD-1b → FIX-PD-1c → STUDIO-LINK → NAME-AND-HINT → PERF-3c …, as before.
- **No frontend-architect checkpoint:** this is a small Store fix-up with one owner and no structural risk accumulating.
- **Ready for commit?** No. Nothing is verified for publication until C passes round 288.

## 6. Hand-off notes (after the advisor's second review)
- **The K2 baseline is preserved as files** in `b-round-287/k2-snapshot/`: the 7 paths, with sha256 equal to K2. C's CLAIMS and SOURCE-SCOPE rows diff against it, because each job runs on a fresh machine.
- **The `bad-premium-track` fixture** must be a Track with no variants [K14]. Otherwise it tests real variants, not the synthetic Premium.
- **The page opens on Standard** by default [K13], so B-JOURNEY selects Premium second.
