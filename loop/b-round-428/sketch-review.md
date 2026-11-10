# Sketch review — round 429 (SYS-2 stage 5, 2b-ii-b)

Dispatched sketch: `b-round-428/sketch-429.patch.txt`, sha256 `c75c618623938ab16162760a9f7719175a9f312b923904c76e16245424d9d429`.

## Review 1 — v1 `4a52f8235e08e87393bada38a7fb6b2058aaf816831b3ecf712080759eec6fc1` (`sketch-429-v1-4a52f823.patch.txt`)
Reviewer: `tech-lead` (read-only). **Verdict: approve-with-lows.** No Critical, High or Medium.
- TL-R429-01 Info: the editor branch calls `preventDefault` twice on a repeated Enter. No effect; a repeated Escape still settles, as at HEAD.
- TL-R429-02 Info: the flag guard stays the first statement, so the order is unchanged. The LibraryMenu return value is ignored harmlessly. The handler types fit `KeyboardEvent<HTMLElement>`.
- TL-R429-03 Low: HS1 was line-based and missed wrapped, reversed-operand, `==` and template forms. **Fixed in final** (whole-file regex; HS2 positives; mutant MU-FORM-WRAPPED-OPERAND).
- TL-R429-04 Low: HS1 pinned the helper's exact source text. **Fixed in final** (export-name match; HK1–HK4 pin the behaviour).
- TL-R429-05 Low: HK3's `toBe(false)` is not the discriminator, because the editor prevents every Enter. **Fixed in final** (the title names the real evidence; MU-EDITOR is red on the editor-open/no-marker/no-undo lines).
- Info: the delegated "prevent always, act once" forms (DetailPanel, Library, GroupHeader, GridMenu, MarkerMenu) are rightly left alone. Everything `/studio-lab` renders is under `app/`.

## Review 2 — delta v1 → final (`sketch-delta-4a52f823-to-final.patch.txt`, test-only; source byte-identical)
Reviewer: `tech-lead`. **Verdict: approve-with-lows.** No Medium or above.
- TL-R429-06 Low: some exotic forms still pass HS1:
  - a parenthesised operand;
  - a third operand between the two;
  - bracket access (`e['key']`);
  - a named constant instead of `'Enter'`.

  **Ruling (B, D-29z1508):** none exists in `app/**` or `perf/**` today. Doc 277 states the scan's literal-form scope in its TODO. HS1's title is not changed, to avoid a third review; the doc carries the limit. The item joins ARCH-CHECKPOINT-SYS-2, which weighs a lint rule against the scan.
- TL-R429-07 Low: two possible false positives, commented-out code and an unrelated `.repeat(` after `&&`. Neither is hit today, and both fail red, which is the safe direction. Accepted.
- TL-R429-08 Info: the export-name helper check is enough, because HK1–HK4 pin the behaviour.

## Ordering matrix
Not applicable: no concurrency or ordering contract (L58).
