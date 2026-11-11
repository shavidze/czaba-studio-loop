# Sketch 453 review record (tech-lead, read-only)

- **Dispatched sketch:** v2, `/tmp/b453-scratch` c6bb48d on ee7cf7c. `sketch-453.patch.txt` sha256 `6e7710919c8315eb6ef441956832e0cd71e66c56e16db394762bbebe8ad73935` (`sketch-453.sha256`).
- **Order (L58):** both reviews ran after the mutants, the HEAD control and the full-suite precheck of the sketch they reviewed.

## Review 1, on v1 (ab05aa1, sha 0fb3b11b…; artifacts in v1-superseded/)
**Verdict:** APPROVE-WITH-CHANGES. No Medium+. Five Lows:
1. GS3's exact-line matcher missed the `@media`, no-space, descendant and comma forms. → v2 `ruleBodiesFor`; mutants M14, M15, M16.
2. GS4 had no zero-offset check on the granted TSX. → v2 GS4; mutant M17 (arbitrary brass glow in ChatInput).
3. The D-29z1604-c inventory had no owner.
   - PurchaseHeader (live) and `routes/store.tsx` (inert) are fixed in v2 (mutants M18, M19).
   - CinemaCurtainLoader goes to 2b-3d; GlobalPlayhead stays frozen and allow-listed.
4. A-R451-REVIEW-L2 and INFO-TL-R451-GLOW-CALC still fail open (helper not granted). → owner STORE-2b-3c; doc 296 records it.
5. Doc 296 must state the GlobalPlayhead legacy visual change and the `.button-primary` `shadow-lg` removal. → A step 4.

No weakening found: the ST5 pin stays an exact literal, and the reviewer's mutant P8 turned it red.

## Review 2, delta v1 → v2 (ab05aa1 → c6bb48d)
**Verdict:** APPROVE. All 5 Lows resolved; no new issue.
- **Unused variables:** none. `justAdded`, `isHovered` and `BRAND_COLOR` stay in use.
- **Info only (no change required):** `ruleBodiesFor` fails open on CSS nesting (`&:hover`) and on `:is(.a .b)` selectors. Neither form exists in `app.css` today. If nesting is introduced later, add a self-test line. Logged as INFO-TL-R453-RULE-MATCHER-NESTING.
