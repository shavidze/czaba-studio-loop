# tech-lead sketch review, round 500 delta (B, round 499 -> 500 planning, 2026-11-13)

Real subagent run (read-only, on scratch `/tmp/b500/s`) on the frozen dispatched delta `b-round-499/sketch-500.patch.txt`, sha256 79835ecda0c3636fff487ac3562a891d9a4e3ccc794da2b259bbc2dd38f012ea (reviewer confirmed the sha). Reviewed = dispatched; no edit after the review.

**Verdict: APPROVE.** No Medium. A-R499-CR-STORE-TRY-UNPINNED is closed by SE1 (real loader error branch, exact class, href, text). Biome on the 5 files rc 0, 6 warnings, all `useButtonType` at store.tsx:227-323, outside the delta.

## Site x attribute matrix (reviewer's; B's mutant ids added)
| Site | class | href/to | element | type | handler | order | label | icon |
|---|---|---|---|---|---|---|---|---|
| EmptyState links | B2B-1 (N1, N2) | B2B-1 | B2B-1 | n/a | n/a | B2B-1 (N16) | B2B-1 | n/a |
| EmptyState buttons | B2B-2 | n/a | B2B-2 | B2B-2 (N3) | B2B-2 (N4) | B2B-2 (N16) | B2B-2 | n/a |
| ErrorDisplay Try Again | B2B-3/4 (N5b) | n/a | B2B-3/4 | B2B-3/4 (N15) | B2B-5 source pin (N14); ruled #8 | B2B-3 (N18) | B2B-3/4 | count B2B-3 (N9); identity: TL-R500-ICON-IDENTITY |
| ErrorDisplay Go Home | B2B-3 (N6) | B2B-3 | B2B-3 | n/a | n/a | B2B-3 (N18) | B2B-3 | count B2B-3 (N9); identity: same |
| RouteErrorBoundary Try Again | B2B-4 (N5b) | n/a | B2B-4 | B2B-4 (N15) | B2B-5 (shared) | n/a | B2B-4 | shared |
| /store Try again | SE1 (N10, N11, N13; N7 B2B-5) | SE1 (N12) | SE1 | n/a | n/a | n/a | SE1 (N17) | none at HEAD (no icon) |

## Findings and B's rulings (all pre-ruled in task 500; a re-raise is "For B", not a STOP)
1. Low, product-price-cards.test.tsx SE1: console spy restored inline, leaks only if the assert fails. -> TL-R500-SE1-SPY-FINALLY, deferred_low_polish (failure path only; sketch stays frozen; fix with the next owner of this file).
2. Low, the Remix `Link` mock forwards only `to`, `className`, `children`, so an added `reloadDocument`/`replace`/`prefetch` passes. Not a regression of this change (no such prop at HEAD or in the sketch). -> TL-R500-LINK-MOCK-DROPS-PROPS, deferred_low_polish; C6 NAV (client vs full load) covers the behaviour in the browser.
3. Low, icons only counted in B2B-3. -> confirmedBy on the existing A-R498-CR-ICON-ASSERT (L7), not a new id.
4. Info, `STORE_ERROR_TRY_AGAIN_CLASS` duplicates `PRIMARY_LG_PILL`. -> pre-ruled #3 (intended independent literal oracles).
5. Low, doc 321 D1 phrase "denied წყვილში 52-დან". It is A's proposed text and is true per `b-round-498/measure/summary.txt`. -> TL-R500-DOC321-D1-WORDING, deferred_low_polish.
6. Info, doc 321 l.4 says "C round 500 PASS" before C ran. -> ruled by L28 (post-PASS form, true only at HEAD; nothing reaches HEAD without C PASS).
