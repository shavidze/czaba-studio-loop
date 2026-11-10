# Sketch review — round 439 (SYS-R435-SOURCE-SCAN-HELPER re-do, v4.1)

**Dispatched delta (A applies on the v3 tree):** `b-round-438/sketch-439-delta.patch.txt`, sha256 `4596eec7f9ea8c88aa466b88cfa800231fe5431c4a298a2bb37fa7d4d8a4a7cb` (5 `diff ` headers).
**Full HEAD → v4.1 patch (C2 identity only):** `b-round-438/sketch-439.patch.txt`, sha256 `adef90283d28d7224f80a5f7c66d7be1685a9fcf327b24dc65bfe3ce5d489ad4` (8 `diff ` headers).
**Final verdict (tech-lead, v4.1): approve-with-lows.** Reviewed equals dispatched: the reviewer named and re-hashed both shas (`tech-lead-review-v41.md`).

Review chain (tech-lead, read-only): v1–v3 in `b-round-437/sketch-review.md`; v4 `a03d0ad6…`/`c7cbb400…` approve-with-lows, 3 Low (`tech-lead-review-v4.md`); v4.1 approve-with-lows, 1 new Low (`tech-lead-review-v41.md`).

## Dispositions (D-29z1561)
| Finding | Severity | Disposition |
|---|---|---|
| C-R438-01 / A-R438-REVIEW-M1 NF2 selects lowercase `input` only | Medium | **Fixed in v4** (any-tag query, non-input list pinned `[]`; M17, M18 red NF2) |
| A-R438-REVIEW-L1-PG2-STRING-MARKUP | Low | **Fixed in v4** (PG2 raw-count guard; M19) and the same class for inputs in v4.1 (IN1 raw guard; M20, M21b; NF2 raw guard M22) |
| A-R438-REVIEW-L2-DS4-SF2-TEXT-CONTAINMENT | Low | Deferred Low (equal to HEAD) |
| A-R438-REVIEW-L3-PARSE-DIAGNOSTICS | Low | Deferred Low (typecheck covers it) |
| v4-L1 wrapper with non-literal type | Low | **Fixed in v4.1** (NF2 raw guard; M23) |
| v4-L2 NF2 string markup | Low | **Fixed in v4.1** (M22) |
| v4-L3 duplicated visitor | Low | **Fixed in v4.1** (`jsxOpeningTags` filters `allJsxOpeningTags`; H7 re-anchored, H10 added) |
| v4 PG2 raw guard false-red risk | Low at most | Accepted, no change (fails safe with a message; HEAD counted the same text in top-level `.tsx`) |
| v4.1-N1 AST vs regex spelling (`type={ "number" }`) can cancel a string-markup count | Low | **TL-R439-N1-NF2-RAW-SPELLING** deferred Low (needs two deliberate changes) |
| DS4 `<Modal` text in strings (HEAD counted it) | — | Ruling (h): not ported; a React component cannot render from a string |
| HEAD PG2 self-closing-only and no-`</progress>` checks (scanner coverage) | — | Ruling (i): not ported; the parser reads paired tags and applies the class/hazard/count rules (M24 HEAD red / v4.1 green, accepted; M25 red on both). Full HEAD assertion map: `head-assertion-map.md` |
| HEAD file lists read top-level `*.test.tsx` (SF2, DS4) / `*.spec.tsx` (NF2, RD2, PG2); the helper skips test and spec files | — | Ruling (j): not ported; test files are not rendered in the Studio UI; none exists today |
| Uppercase markup in strings (`<INPUT`, `<Progress`) | — | Equal to HEAD; not a finding |
| A's Architecture note (element classification lives per suite) | — | `confirmedBy` on SIG-R438-OTHER-SCANNERS; signal only |
| A-only rule: any code-reviewer Medium+ not in this table is a STOP (L11) | — | — |
