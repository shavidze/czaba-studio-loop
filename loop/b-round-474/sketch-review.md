# Sketch review: round 475 (DPG-P0-2)

**Dispatched sketch:** `sketch-475.patch.txt` sha256 `d2385ffc2e62c654a8d3827dd02d80c760661257521b33a88dad25ec1824f7bd` (v2).

Reviewer: `tech-lead` (read-only), twice:
- **Review 1** on v1, sha256 `50bdba43ed61e35f7ac00a72611c6ea746dca89e740ef7579355c05ae50055da`;
- **Review 2** is a delta review, v1 → v2 (see the bottom).

## Review 1 (v1): APPROVE WITH CHANGES
| # | Sev | Finding | Ruling |
|---|---|---|---|
| 1 | Medium | UT2 pinned counts per file, so swapping one undefined class for another in `UserDropdown` stayed green | **Fixed in v2.** UT2 pins the sorted token list per file. The new mutant M-UT2-SWAP-DEAD-TOKEN is red |
| 2 | Medium | The nav-bar C row "0 nodes" (from `pd-p0-2.md`) fails, because `root.tsx` still renders the node | **Fixed in the task.** C9 now expects the node to exist with `display: none`, a 0×0 box, the top 4 px pixel-equal and the header box unchanged. The `root.tsx` removal is ROOT-REQ-NAV-LOADING-BAR-RENDER, tied to SABA-Q-PENDING-NAV-FEEDBACK |
| 3 | Medium | Confirm the `app.css` grant (`app/styles/**` is globally forbidden) | **Fixed.** A `narrow_grants` entry for round 475 (D-29z1681) names the three app.css regions byte for byte |
| 4 | Medium | UT2 timing: 8.46 s in B's v1 full run, 9.45 s in the reviewer's run, against "3 s" | **Fixed in v2.** The emission check is batched: one `build()` over the unique tokens, then a test of each candidate's escaped selector in the output. Alone, UT2 is about 1.8 s. The full-run time is K14 |
| 5 | Low | The plain-class fallback stripped the variant, so `hover:<plain-class>` counted as emitted | **Fixed in v2.** There is no fallback any more: the build output includes the app CSS, so a plain class matches by its own selector. A UT4 fixture adds a plain `.text-sheen` to the fixture theme; `text-sheen` is clean and `hover:text-sheen` is flagged |
| 6 | Low | Guard blind spots: the `bg-(--x)` shorthand; `getPropertyValue('--x')` counting as a declaration; template-piece noise | **Recorded, not fixed.** None occurs in `app/**` today. They go into doc 308 as known limits and are logged as the signal SIG-R475-TOKEN-GUARD-LIMITS |

While making change 4, the batch matcher first missed `2xl:text-2xl`, because CSS escapes a leading digit as `\32 `. UT2's exact pin caught it. v2 escapes a leading digit, and the new mutant M-HELPER-NO-DIGIT-ESCAPE is red.

## Review 2 (delta v1 → v2, sha `d2385ffc…`): APPROVE
- **Escaping was checked against the real compiler** on 16 candidates in one batch: arbitrary hex, rgb and percent values, opacity `/50` `/[0.3]` `/2.5`, `!` as prefix and suffix, `2xl:`, stacked variants, `[&>svg]:`, `group-hover/item:`, `data-[state=open]:`, `bg-(--x)` and `-mt-1`. All of them match. The leading-digit escape equals Tailwind's own.
- **No false negatives from batching:** each pattern needs a literal `.` immediately before the escaped class.
- **The fixture is valid:** a v4 plain class takes no variants without `@utility`.
- **The condition** is a green full suite on v2: K12.
- **Lows,** recorded as signal SIG-R475-TOKEN-GUARD-LIMITS (not a change):
  1. Non-ASCII class names are escaped differently from Tailwind. It fails loudly, and there are none today.
  2. A leading `-` followed by a digit fails the same way. Colour classes never take that shape.
  3. `bg-(--x)` and `text-[color:var(--x)]` emit even when `--x` is undefined. `definesProperty` covers only `var(--x)` reads, so the `bg-(--x)` shorthand stays a blind spot. There are none in `app/**` today.
  4. Both `emitsUtility` (used by UT3) and `emittingUtilities` (UT2, UT4) exist. They share `classSelectorPattern`, and each is exercised.

**Final verdict: APPROVE.** The dispatched sha equals the delta-reviewed sha.
