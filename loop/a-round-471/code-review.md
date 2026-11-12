# code-reviewer — round 471 (A's condensed summary of the subagent hand-back; read-only reviewer, run once after sketch + doc)

Limitation stated by the reviewer: it had no shell and reviewed the working-tree files, not `git diff`.
A verified its Medium with mutants (see a-round-471.md).

Reviewer's own unverified claims: obsidian block byte-unchanged (supported indirectly by ST4 at store-theme-tokens.test.ts:616), HEAD's FN4/body stack (not seen), 126 passed / typecheck / lint (not run). A verified these separately (see a-round-471.md).
Score 8/10. Findings:
- M1 (Medium) FN4 scans the whole of app.css; the obsidian block alone yields the same 3 families, so store `@theme`
  font tokens are unguarded (delete l.124 `--font-mono`, or `--font-serif: Georgia, serif;` pass). ST1 compares only `--color-`.
  Suggested fix: in store-theme-tokens.test.ts via loadStoreThemeBlocks(): theme --font-sans === obsidian --font-sans,
  theme --font-mono === obsidian --font-mono, theme --font-serif === theme --font-sans.
- L (Low) app.css:746 `.artist-title { font-family: var(--font-serif) }` is a CSS rule, not a class; add to the 2c-2 sweep list.
- L FN4 l.192-194: constant-vs-constant containment check, no real coverage (the fonts.css loop is the real check).
- L FN6 l.209 literal: first declaration, LF, 2-space indent dependent; l.210 catches only single-quoted names.
- L doc "no fake bold" true for Latin only (Noto Sans Georgian 400/500) — fixed in doc by A.
- L doc FN4 wording overstated — fixed in doc by A.
- L CommandPalette.tsx:189,192,195 bare <kbd> now Plex Mono via preflight; ↵ (U+21B5) falls back on the same chip.
- L also: protected studio.$productId.tsx:138 has a bare <kbd>, covered by R-471-3 (no edit).
- Info: fixed-width mono sites now Plex Mono: StudioTrack.tsx:307 (w-8), VideoPlayer.tsx:242 (w-12), StudioMockup.tsx:129.
- Good practices noted: body uses the token (single source); store stack == obsidian; FN4 checks fonts.css faces per token family; 2c split traceable; no protected edit.
- Info: Tailwind v4 @theme --font-mono feeds --default-mono-font-family (theme.css:446,449) — override works.
- Info: no other hard-coded stacks in app.css; Plex Mono 0.6em ~9% wider than Consolas (Windows unmeasured);
  no font-mono element with bold; italic unchanged (synthetic before and after); Cyrillic/Greek lose Inter coverage.
- Info: stale Playfair/Inter mentions: store.tsx:535, PremiumProductCard.tsx:7,81 comments; docs/design/DESIGN_SYSTEM.md:755-762;
  .claude/primitives/DESIGN_TOKENS.md:57-63; .claude/primitives/TAILWIND_FIRST.md:101-105.
Architecture note: none — token values plus one test file; keep. The store font-token pin belongs in this round's test fix, not an extraction.
