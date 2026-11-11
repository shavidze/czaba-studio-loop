# Sketch review: round 449 (STORE-2b-3a, gradient text)

Dispatched sketch: `b-round-448/sketch-449.patch.txt` (v3) sha256 288ad78b26355bd7ce7b8e34bcf07c6da5cf5e675a4e5fc4d873aae0acaf5fab

- **Reviewer:** `tech-lead` (read-only; it worked on its own copies, `/tmp/tl449` and `/tmp/tl449b`).
- **Scratch:** `/tmp/b449-scratch`. Base `48e16b8`. v2 is commit `b8a3e3e`, v3 is commit `52d59bb`.

## Review 1: v2, sha256 0d541ec03b40bf5aedc2411901ba997bfba4e802697dbfc755cf6868a98bd27d (`v2-superseded/sketch-449-v2.patch.txt`)

**Verdict:** APPROVE-WITH-CHANGES. The removal is correct and nothing is left invisible. The reviewer verified the sha and that `git diff 48e16b8 b8a3e3e` is byte-identical.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Medium | `GRADIENT_TEXT_PATTERN` is case-sensitive, allows only a lone `text` value and no space before the colon. `background-clip : text`, `BACKGROUND-CLIP:text`, `background-clip: padding-box, text` and `-webkit-text-fill-color:#0000` give 0 hits, so GT1 could false-pass | **Fixed in v3.** The reviewer's regex, plus `#00000000`, with `gi`. The GT4 probe line covers the variants. Mutant M9 turns GT1 red and M11 (the v2 regex restored) turns GT4 red |
| 2 | Medium | The allow-lists rest on "0 importers", and nothing guards that. Re-importing `ArtistBioSection` would bring live gradient text back while GT1/GT3 stay green | **Fixed in v3.** New GT5: the 4 dead components have no word-bounded reference outside their own file and the 3 barrels. Mutant M10 turns GT5 red |
| 3 | Low | GT1 cut the scan at the first obsidian marker, and GT4 only checked that the marker exists. `studio.css`, `pages/studio.css` and TSX `bg-clip-text` are unguarded (0 cases) | **Partly fixed in v3:** the slice is gone and GT1 scans the whole of `app.css` and `styles/base/*`. The legacy Studio CSS (frozen) and TSX `bg-clip-text` (0 hits [K3]) stay unscanned → deferred Low TL-R449-L3-SCAN-ROOTS |
| 4 | Low | A quoted `{` or `;` misfiles a hit's selector. The test still fails, so it fails safe; 0 such strings | accepted (fails safe) → deferred Low TL-R449-L4-PARSER-QUOTES |
| 5 | Low | Bare `<span>`s are now inert | accepted. The product-designer kept the spans, and NM2 reads `heading.querySelector('span')` |
| 6 | Low | `docs/design/star-brand-audit.md:182-184` still calls `text-glow` part of the brand | A's doc 294 marks it superseded (task step 4). Design-doc updates belong to STORE-5 |
| — | — | Host: GT1–GT5 read files only; the probe and the `/studio-lab` pixel check are Chromium-only | WebKit → TLM-R449-WEBKIT-HEADING-INK |
| — | Arch | The dead-component allow-list now lives in two tests under one reason string. Deleting those components later is cheaper than guarding them in more tests | signal SIG-R449-DEAD-ALLOWLIST-TWO-TESTS → LEGACY-DEAD-STORE-COMPONENTS |

**B's own addition in v3:** the `studio-naming.test.tsx` NM2 title "with the glow on Studio" becomes "with the emphasised span on Studio". Only the title changes; the assertions are byte-identical.

## Review 2: delta v2 → v3, sha256 288ad78b26355bd7ce7b8e34bcf07c6da5cf5e675a4e5fc4d873aae0acaf5fab

**Verdict:** APPROVE. The reviewer verified the sha, saw that `git diff --stat b8a3e3e 52d59bb` touches only the two test files, and ran 2 files / 7 tests green in its own clone.

| v2 finding | Status |
|---|---|
| Medium 1 (regex) | resolved (`store-gradient-text.test.ts:15`). The probe checks selectors, not declaration text, which is slightly weaker than v2, but M11 still turns it red |
| Medium 2 (importer guard) | resolved. GT5 is name-based, so it catches barrel, namespace and lazy imports. M10 turns it red |
| Low 3 (slice) | resolved. All of `app.css` is scanned |
| Low 4 / Low 5 | accepted |
| Low 6 (star-brand-audit doc) | open as A's doc step 4 |

| # | Sev | New finding (delta) | Disposition |
|---|---|---|---|
| D1 | Low | GT5 guards the `PianoLoadingAnimation` component, not the `.loading-brand` class. A live `className="loading-brand"` would bring gradient text back with every test green. Today it is only at `PianoLoadingAnimation.tsx:49` | deferred Low TL-R449-D1-LOADING-BRAND-CLASS (LEGACY removal deletes the rule) |
| D2 | Low | Barrel files are excluded wholesale, so `export { ArtistBioSection as Bio }` in a barrel would slip past GT5. It fails open but is unlikely | deferred Low TL-R449-D2-BARREL-ALIAS |
| D3 | Info | `precheck-full-raw.log` was still running at review time | the full-suite summary is in `precheck-full.log` before dispatch (claim K14b) |
