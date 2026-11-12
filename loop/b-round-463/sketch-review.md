# Sketch review: round 464 (STORE-2b-3d-3)

Dispatched sketch: `sketch-464.patch.txt` **v3**, sha256 35f0fb1f846d4cbc588966674e0f459807c4e566fb857bbb02d8a0affd488f7d. Verdict on v3: **APPROVE** (tech-lead delta review, below).

## v1 (superseded; files in `v1-superseded/`, patch sha 68335b75…)
`tech-lead` (read-only, 2026-11-12) reviewed v1: **APPROVE WITH CHANGES**, no High and no Medium.
- (a) None of float, grain, fadeInUp or fadeOut is used. tech-lead checked CSS custom properties and `var()`, `element.animate`, `animationName`, the inline scripts in `app/root.tsx` (GA4 and Pixel only), the pre-hydration `ENTRANCE_COVER_CSS` string in `EntranceCover.tsx` (it defines its own failsafe keyframes, which replaced the old fadeOut), and `public/` (images and media only).
- **Low 1, latent false negative:** `withoutComments` read `/*` inside strings as a comment start. `accept="video/*,…"` at `ArrangementLane.tsx:1055` hid the source up to the next `*/`. That fails safe (DC2 red), but a red could later be misread as "unused" and lead to deleting live CSS. **Fixed in v2.**
- **Low 2:** `@keyframes pulse` survives only through the named-utility branch (Tailwind's `animate-pulse`); the unlayered project keyframes overrides Tailwind's. **Ruled:** documented in doc 303 (§2.2 of the task) and recorded as SIG-R464-PULSE-KEYFRAMES-SHADOW (info). Changing it would be a visible change that needs a design ruling.
- Missed forms (multi-line comma lists, template-built names, `animate-${x}`) all fail red, the safe direction. None exists in the tree. **Recorded, not fixed.** The custom-property form (`--x: name 1s` with `animation: var(--x)`) is in the same class.
- **Low 3:** doc 303 must not quote the arbitrary-utility fixture. This is already a task rule (§2.2) and C6's `added=0`.
- (d) The root-chunk diff is acceptable: the chunk embeds the hashed CSS URL, so esbuild's name assignment shifts. The 29 swaps form a closed identifier cycle at the same length, and the HEAD-vs-HEAD control is equal. `removed=5` counts unique percent selectors (only grain's 10/30/70/80/90 %), not blocks. The 568-byte drop matches all 4 keyframes.
- Architecture note: syntax-based consumption is the right direction, but the comment stripper was its weak spot. That is fixed in v2.

## v2 (superseded; `v1-superseded/sketch-464-v2.patch.txt`, sha256 940c0993b54962142286811c959f31d1d5eb942e4edf020cf5810ec88834df42; delta `sketch-464-delta-v1-v2.diff.txt`)
Delta from v1, test file only:
- `withoutComments` now starts a block comment only at the start of the source or after whitespace or one of `{ } ; , (`, so `video/*` inside an attribute string is kept.
- DC4 gains a positive fixture: one source string with `accept="video/*,audio/*"`, then an inline animation style, then a JSX comment. The style's name must count as used.
- New mutant **M8**, the v1 string-unaware stripper: DC4 turns red.

Re-run on v2:
- covering set: 14 files / 149 tests green (`precheck-covering.log`);
- tsc rc 0; lint 192 warnings (as at HEAD); Biome on the test rc 0;
- mutants: BASE green, M1–M8 each red (`mutants/mutants.txt`);
- prod build: the built `app-*.css` is byte-identical to the v1 tree build (`cmp`), so the v1 browser probe (`probe/run1`, `probe/nonvacuity`) still holds for v2. `build-compare.txt` and `root-chunk-diff.txt` were regenerated on v2 (server 0; JS root identifier-only, `non-identifier-changes=0`; CSS 5 removed, 0 added).


## v3 (dispatched; sha256 35f0fb1f846d4cbc588966674e0f459807c4e566fb857bbb02d8a0affd488f7d; delta `sketch-464-delta-v2-v3.diff.txt`)
The advisor noted that the v2 line-comment stripper was as string-unaware as the v1 block stripper had been. Delta from v2, test file only:
- line comments now use the same boundary rule as block comments, so `'//cdn…'` inside a string is kept;
- a new DC4 positive fixture: `href='//cdn.example'` followed by an inline animation style;
- a new mutant **M9**, the v2 line stripper: DC4 turns red.

Re-run on v3:
- covering set 14 / 149 green; tsc rc 0; lint 192;
- **full suite 285 files / 4186 tests green** (`precheck-full.log`);
- mutants: BASE green, M1–M9 red (`mutants/mutants.txt`);
- v3's DC2 on HEAD `app.css` fails with exactly the 4 names (`dc2-v3-on-head.log`);
- the built CSS is byte-identical to v1's (`css-v3-vs-v1.txt`), so `probe/run1` and `probe/nonvacuity` hold for v3;
- `build-compare.txt` and `root-chunk-diff.txt` were regenerated on v3;
- the built HEAD client and server bundle has no animation consumer of the 4 names; the single regex hit is the keyframes definition itself (`bundle-animation-grep.txt`).

**tech-lead delta review of v3: APPROVE**, with no Medium or above.
- Low 1 is fixed: `accept="video/*"` (ArrangementLane.tsx:1055, SfxVideoSync.tsx:46), `'audio/*'`, `@ffmpeg/*` and `href='//…'` are kept.
- Remaining Low, ruled **accepted and recorded**: a comment directly after a character that is not on the list (`"x"/* … */`, `)// …`) is kept, so a commented-out use could keep a dead keyframe alive. There are 0 such cases in `app/` today.
- Quoted `/*` after a space would still be stripped. This fails loudly (DC2 red). tech-lead found no current hit that hides a real use.
- The existing Low on `*.test.*` files outside `__tests__` being scanned is TL-R463-L3 / A-R463-REVIEW-L6, already deferred.
