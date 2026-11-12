# Sketch review — round 481 (B-R478-DEAD-MUSIC-LINK)

- Reviewer: `tech-lead` (read-only consult, 2026-11-12, B round 480 -> 481 planning), on the first patch
  sha256 11eacab78c2c495320eeaaa608d416bd95d7e2d552ca98126f971c5df9f4a200.
- **Verdict: APPROVE.** Keeping `<a>` (full document load, title announced) is right until an announcer exists; revisit then.
  Mock value matches `PagedResult<Order>` (client.ts:42-47); tsc clean; 2 Biome warnings are pre-existing (l.59, l.188).
- Reviewer notes applied by B (no logic change), giving the dispatched patch:
  sha256 8e1b7b6d72575086b7b7f2460c2f008630cfe32375f27865b5ef30a38d0f1362
  1. removed the vacuous `expect(link.tagName).toBe('A')` (a `<Link>` renders `<a>` too);
  2. AO1 title no longer claims "full document load" (M2 turns it red only through a `useHref outside Router` crash; the
     `data-discover` assert is a belt, not a proven branch — L58);
  3. AO2 renamed to what it pins: "the empty state has exactly one link, to /store".
- Reviewer follow-up: `account.downloads.tsx:290` still links to `/music` (protected) -> ROOT-REQ-DOWNLOADS-MUSIC-LINK (D-29z1710).
- Re-run on the final patch: `sketch-vitest-final.log` 2/2 pass; `mutant-M1-music-href.log` 2 failed; `mutant-M2-router-link.log` red; `sketch-tsc.log` rc 0; Biome rc 0.
