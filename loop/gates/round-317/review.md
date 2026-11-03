COMMIT: OK (no blocking issues; nothing touches auth, purchase or download code)

## Code Review: round 317 — self-hosted fonts (PERF-7)

This review covers the diff only, not the whole module. The diff touches 40 paths. In `app/root.tsx`, only `links` changed. The other paths are fonts and licences, the notices generator, `studio-lab.tsx` `links`, one line in `app.css`, and tests. `verify.log` shows 237 of 237 test files and 3512 tests passing. The build passed, and both preloads resolve to the same hashed asset that `fonts.css` uses: `instrument-sans-latin-BbzFLZTg.woff2` and `ibm-plex-mono-latin-DMJ8VG8y.woff2`. None of the lint warnings in `verify.log` come from the files this round touched.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Low, real browser:** `app/routes/studio-lab.tsx:13-27` preloads `ibm-plex-mono-latin` on every load, including the `StudioNarrowScreen` branch (`studio-lab.tsx:103/118/125`). `StudioNarrowScreen.tsx` has no `font-mono`, so on a narrow viewport the mono file is fetched for nothing. Chrome also logs "preloaded but not used within a few seconds". Fix: accept it and note it in doc 229, or keep only the Instrument Sans preload. Mono is used only after the workspace renders.
2. **Low, lost test guard:** `studio-theme-obsidian.test.tsx` TH7 (diff lines 97-129) dropped the old check that `/studio-lab` doesn't load Inter, Playfair or Cormorant. Behaviour is still correct, because faces are declared on every route but only fetched when used. Now only C's FONT-NET browser check protects this. Fix, if wanted: assert that every TH7 href matches only `instrument-sans|ibm-plex-mono`. This already holds, but making it explicit documents the intent.
3. **Low, brittle test:** `self-hosted-fonts.test.ts:203-208` (FN5) compares the exact source text of the `links` block. The `rootLinks()` call right after it already checks the same thing at runtime, so the text comparison will break on any formatting change and protects nothing extra. Fix: keep the `fontStyles` import check and the descriptor check, and drop the text comparison.
4. **Cosmetic, TS strict:** in TH7, `expected` is inferred as `string[][]`, so the destructured `file` and `family` can be `string | undefined`. Fix: annotate it as `ReadonlyArray<readonly [string, string]>`, like `SELF_HOSTED_FONT_SHA256` does. That's a type annotation, not an assertion, so it stays within the rules.
5. **Note for later:** two 1,760 B Noto stubs (`cyrillic-ext` and `greek-ext`, which have the same sha256) are inlined as `data:` URIs. There is no CSP in the repo today, so nothing breaks. If a CSP is added later, `font-src` must include `'self' data:`. One line in doc 229's TODO would cover it.

### What I checked and found fine
- **Studio routes:** Studio families now have `@font-face` rules on every route, but the `--font-sans/--font-mono` tokens only take effect under `[data-studio-theme="obsidian"]` (`app.css:3904-3926`). Only `studio-lab.tsx` sets that attribute, so `/studio/$productId` and the store routes look the same as before.
- **Weights:** the weights match the old Google URLs (Inter 300-800, Playfair 400-700, Instrument Sans 400-600, Plex 400, Noto 400-500), so there's no faux bold or regression.
- **Licence notice:** the two Reserved Font Names are correct. `Reserved Font Name` appears on line 1 only in `OFL-playfair-display.txt` and `OFL-ibm-plex-mono.txt`; the other three files contain only the generic definition.
- **Not this diff:** the CSS minify warning `[file:line]` (`verify.log:4742`) comes from a class name scanned elsewhere and is unrelated to this round.
- **No runtime risk:** the round adds no listeners, timers, re-renders or accessibility changes. It's only link descriptors and static CSS. The added `fonts.css` is a 4.2 kB gzip same-origin stylesheet on every route, cached as `immutable`.

### Good Practices Found
- The files are byte-identical copies of Google's, with sha256 pins (FN3). The fix for the `/l/font?kit=` mismatch is documented with measurements.
- Fonts are imported with `?url` from `app/assets` rather than `public/`, so file names are hashed and cached as immutable. Preloads include `crossOrigin: 'anonymous'`, which stops the file from downloading twice.
- `unicode-range` subsets are kept as served, so users download only the subsets they need.
- FN1 adds a regression guard: no non-test `.ts`, `.tsx` or `.css` file under `app/` may contain a Google Fonts host.
- The notices are generated (TL10), not hand-edited.
- Doc 229 is in Georgian and explains the honestly-moved FCP target (PERF-11).

### Architecture note
- signal 1 (mild): `app/assets/fonts/fonts.css:1-685` holds the store families (Inter and Playfair, owned by STORE-2c) and the Studio families in one file. FN2's `83` and FN3's 25 pins are tied to that file. → **keep it, because** it's one stylesheet and one request with no runtime cost, and splitting it would add a second render-blocking link. **Proposal for the planner:** STORE-2c must edit `fonts.css`, FN2/FN3/FN4 and `NOTICES_FONTS_SECTION` together. Flag that as expected scope so the change isn't mistaken for drift. This is not a refactor instruction.

### Alternative Approach
- Current: self-hosted woff2 files plus a global `fonts.css` linked from root, and two route-level preloads on `/studio-lab`.
- Alternative: link a separate `studio-fonts.css` only from the `studio-lab` route, so store pages never parse the Studio faces.
- Verdict: keep the current approach. The faces cost nothing until a page uses them. One global sheet also avoids a stylesheet being added late during client-side navigation into `/studio-lab`, which could cause a flash of unstyled text.

### Score: 9/10