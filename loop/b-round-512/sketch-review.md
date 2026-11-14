# Sketch review — round 513 (NONBRAND N3, cookie banner)

Reviewed sketch: `b-round-512/sketch-513.patch.txt`, sha256 `cd99584499de805a5b7c554b0b6308de458ebff94f5056e4dde9ce87a7ef81d8` (the dispatched file; no edit after the review).
Reviewer: `tech-lead` (read-only), one pass on the frozen sketch after B's mutants and pre-check. It also ran `biome check` (clean) and the CookieConsent test file (15/15) on B's applied copy.

**Verdict: approve.** 0 Critical/High/Medium; 6 Lows.

| # | Reviewer finding | Severity | B ruling |
|---|---|---|---|
| 1 | N3-3 couples the consumer test to IconButton's ghost/sm internals (literal pins `bg-transparent`, `w-8`, `h-8`) | Low | Accepted as written. The literal pins are the independent anchor L52 asks for (a guard must be able to disagree with the shared builder). A future IconButton redesign turning N3-3 red is the intended signal. No change |
| 2 | N3-5 denylist misses `text-white`, `bg-black`, `border-white` | Low | Not applied (the sketch stays frozen). Recorded as A-R512-TL-N3-5-DENYLIST-NARROW (Low, deferred_low_polish); DPG-BUTTON-CONTRACT-TABLE may absorb it. The removed classes are exactly the denylisted ones (K5) |
| 3 | N3-5 depends on `process.cwd()` | Low | Accepted: existing pattern in the suite; vitest runs from `store/` in every documented command. No id |
| 4 | Button/IconButton have no `focus-visible` ring | Low | **Rejected by measurement.** The global `:focus-visible` rule in `app.css` paints both pills and Close: outline `solid 1px` brass 0.8, offset 2px, at HEAD and on the sketch (`probe/sketch/n3.json` `keyboard`, K17). No id |
| 5 | Button sets no explicit `type` | Low | Pre-existing shared-system behaviour; no `<form>` ancestor here. Recorded under SIG-R507-NONBRAND-KEEP-PRIMITIVES as `confirmedBy` input (no new id) |
| 6 | Weak separation of the equal-weight secondary pills on the near-black banner | Low | Same as product-designer's Low → B-R512-COOKIE-PILL-LOW-SEPARATION (deferred_low_polish); measured bg vs black 1.21:1 (`probe/sketch/n3.json` contrast). Text contrast 13.94:1. Joins the SABA-Q-507-COOKIE-WEIGHT note for Saba |

Project-rule compliance (L10) on every touched line: confirmed by the reviewer (Tailwind-first, semicolons, no `any`, no assertion, no comments added, barrel imports, role/name selectors).
