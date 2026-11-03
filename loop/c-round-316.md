# C round 316: PERF-7 self-hosted fonts (verification)

**Verdict: FAIL.** One Medium finding, **C-R316-01**: 4 of the 25 mirrored woff2 files (all Playfair Display) are not the files browsers get from Google at HEAD. FONT-PIXEL fails by its own rule. The round promises "every face byte-identical to today", and that is false for these 4 files. Every other row passes. `browserVerified` / `realVerified` = true (every browser row ran).

Tree: HEAD `c136dfd` plus A's 40 entries. The tree was unchanged from start to end (`c-round-316/git-status-start.txt` = `git-status-end.txt`). Protected files: 11/11 OK at start and at end. C changed no app source.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. Exactly 40 entries: the 7 M files plus fonts.css, 25 woff2, 5 OFL, the test file and doc 229. Protected 11/11 OK | `c-round-316/git-status-start.txt`, `protected.txt` |
| CLAIMS | PASS. Differs from `claims-316-sketch-output.txt` only by design: K2 `40 c136dfd`, K9 `229-perf-self-hosted-fonts.md`, K10 gains `## Fonts (SIL Open Font License 1.1)`. Took under 1 s | `c-round-316/claims-c.txt` |
| SKETCH-EQUAL | PASS. The 6 §4.1 files are `cmp`-equal to the sketch; 25/25 woff2 and 5/5 licences match the `fonts-src` sha lists. **Note:** the pinned list itself holds the wrong Playfair bytes (C-R316-01) | — |
| UNIT | PASS. On C's scratch `/tmp/c316u`, the 16 files give 236/236. `unit-mutants-316.py` output is identical to `precheck-unit-mutants-316.txt` (12 red, restored 17 passed). A's MU-NOTICES-DROP-FAMILY (drop the Inter bullet) is red on TL5 and TL10. C's own mutant MU-C-FONTS-BEFORE-LAME (render the fonts section before LAME) is red on TL5 and on TL10 "comes after the LAME section". Restored: 70/70 | `unit.log`, `unit-mutants.txt`, `c-own-mutants.txt` |
| FONT-NET | PASS as written (the byte problem is reported under C-R316-01). At 1440, 3 cache-disabled fresh loads per route plus `/studio-lab` at 1280. A: 0 Google requests and 0 render-blocking third-party resources on every route (HEAD: 3/2/2/2 blocking, 6/4/4/3 Google). The only third-party resource left in A is the non-blocking `localhost:5199/api/cart` fetch (backend absent; expected). The loaded `document.fonts` set per route is equal HEAD vs A. Files fetched: `/studio-lab` instrument-sans-latin, ibm-plex-mono-latin, noto-sans-georgian-latin; `/` and `/store` inter-latin, playfair-display-latin; `/studio/middle-east` inter-latin. Each is fetched once, with 0 preload console warnings and 0 page errors. Decoded woff2 bytes on `/studio-lab` = 69,732 in every run, at both viewports | `fontnet-{head,a}-{1440,1280}.json`, `fontnet-summary.txt` |
| FONT-PRELOAD | PASS. The SSR HTML has exactly 2 `<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous">` (instrument-sans-latin-BbzFLZTg, ibm-plex-mono-latin-DMJ8VG8y); `document.head` holds both. They are the same hashed URLs the page fetches, each once. `/`, `/store` and `/studio/middle-east` have 0 font preloads | `preload-ssr.txt`, `fontnet-a-*.json` (`preloads`, `fontReqCounts`) |
| FONT-CACHE | PASS. The hashed woff2 and `fonts-BUj7rCxx.css` both send `Cache-Control: public, max-age=31536000, immutable`. The woff2 has `Content-Type: font/woff2` | `font-cache.txt` |
| FONT-PIXEL | **FAIL (C-R316-01).** `/studio-lab`: 0 px at 1440 and 1280 in all three pairs. `/store`: HEAD-vs-HEAD control = **0 px** at both viewports, but HEAD vs A = **2,015 px** at both viewports (bbox 374,185–1067,232 at 1440), in both comparisons. That region is the Playfair heading "Curated Sound Collections". `/`: no conclusion is possible. The hero animates, and HEAD-vs-HEAD already differs over the whole area below y=81 (24k–194k px), so the home row is neither clean nor a finding | `pxdiff.txt`, `shots/`, `store-heading-crop-head1-a-head2.png` |
| FONT-GLYPHS | PASS. CDP `getPlatformFontsForNode` on every element with direct text gives an equal `{family:glyphCount}` list HEAD vs A on `/studio-lab` 1440 (167 nodes), 1280 (166) and `/store` 1440 (28). The only per-node difference is the inline Remix manifest `<script>` text (its hash), which renders no glyphs. Non-ASCII glyphs on `/studio-lab` and their platform fonts, the same in both builds: — “ ” → Instrument Sans; · → Instrument Sans / IBM Plex Mono; − ∞ → IBM Plex Mono + DejaVu Sans Mono (a system fallback, the same at HEAD); ½ × → no platform font (not rendered). No visible node renders in Noto Sans Georgian, so which glyph pulls `noto-sans-georgian-latin` was **not determined**. The same request happens at HEAD | `glyphs-*.json`, `glyphs-summary.txt` |
| FCP | PASS (gate rows). FCP − DCL medians in A: `/` −2 ms, `/store` 0 ms (< 150). `/studio-lab` absolute FCP median: A 260 vs HEAD 304 at 1440, A 252 vs HEAD 268 at 1280 (≤ 1.3×). Reported only (PERF-11): `/studio-lab` FCP − DCL in A is 199 ms at 1440 and 149 ms at 1280 (HEAD 128 / 109). DCL fell (61–114 ms vs 151–185 ms) while FCP stayed, as D-29z851 says | `fontnet-summary.txt` |
| PERF-LOAD | PASS. Run alone (no other job) on A's tree: rc 0, 1 passed (6.9 min), `failures` empty, `harness.loaf-scripts-live` = 80 (≥ 50). `rowcmp.py c-round-315/perf-harness.json`: ref-det 164, run-det 164, equal 164, differ 0, extra 0. The warm-up script (`c-round-314/warm.cjs`) waited 302 s without seeing "collection ready", exactly as in round 315 (`c-round-315/warm-perf.log`). It is a pre-existing harness quirk; the dev page was loaded either way | `perf-harness.json`, `perf-harness.log`, `rowcmp.txt`, `perf-driver.status`, `warm-perf.log` |
| NOTICES | PASS as written. The section appears once, between LAME and MPL-2.0. It names the 5 families, each licence path (all 5 exist), "unmodified", Google Fonts, sha256, and both RFNs. It has no `@fontsource` or Google host text, and the diff is +19 lines only. **Caveat:** "as served by Google Fonts, unmodified" is true of Google's kit endpoint, but not of what browsers received at HEAD for Playfair (C-R316-01) | `THIRD_PARTY_NOTICES.md` l.31–49 |
| DOC | PASS on structure: l.4 is exact, the 7 TEMPLATE headings are in order, and FN1–FN5, TH7 and TL10 exist. D-29z851 and the STORE-2c handoff are stated. The doc's "byte-identical" statements (title, l.24, l.54) are wrong for Playfair; they are part of C-R316-01 | doc 229 |
| G316-AUTH | PASS, both viewports, fresh anonymous contexts on `:5173`. `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401, no token in any body. A fake bearer gets 500 "Unable to prepare Studio access": the backend is absent and nothing is granted, the same as round 315. Premium access is not bypassed | `g316-auth.json`, `g316-auth.log`, `warm-auth.log` |

**Gate rows (not claimed):** full vitest, build in `store/`, Biome, `npm run verify`, e2e smoke. C ran production builds only on scratch copies (`/tmp/c316h`, `/tmp/c316a`), both rc 0 (`build-head.log`, `build-a.log`).

## C-R316-01 (Medium, origin: B pre-check / B spec): the 4 Playfair Display woff2 files are Google's "kit" variants, not the files browsers load today

**What I did, step by step**
1. I loaded `/` at HEAD (prod build, :5326) in Playwright Chromium and logged the gstatic URLs. Playfair came from `https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2`, 38,404 B.
2. I downloaded that file and compared it with `app/assets/fonts/playfair-display-latin.woff2` (39,172 B): **different**.
3. I fetched the 3 HEAD Google CSS URLs with a Chrome UA, mapped every face to its mirror file through `fonts-src/manifest.json` and compared the bytes. **21/25 are identical; 4/25 differ**, all of them Playfair: latin 38,404 vs 39,172; latin-ext 21,140 vs 50,272; cyrillic 21,152 vs 55,840; vietnamese 9,112 vs 42,892 (`byte-identity-all.txt`).
4. **Root cause.** I downloaded today the manifest URL `https://fonts.gstatic.com/l/font?kit=…` for playfair-display-latin, and it is **byte-identical to the mirror**. B's `fonts-src/playfair.css` is the only fetched CSS with `/l/font?kit=` URLs (16 of them; inter.css and studio.css have 0). With a Chrome UA, the same CSS URL gives `/s/playfairdisplay/v40/…woff2`, and with no UA it gives `.ttf`. B's fetch hit Google's kit endpoint for Playfair only.
5. **Effect.** I loaded both files as FontFaces and rendered text (`playfair-compare.json`):
   - weight 400: 0 px differ, equal width;
   - weights 500/600/700: equal advance widths, but 1,558 / 2,461 / 3,333 px differ (max alpha Δ 62–63/255), which is different outline rasterization;
   - weights 800/900: the mirror stops at 700 (width 1195 vs 1217/1229), so the kit file is a 400–700 axis instance. `fonts.css` declares only discrete weights 400/500/600/700, so 800/900 are not reachable through our faces.
   - In the app, `/store`'s Playfair heading differs by 2,015 px at both viewports, while the HEAD-vs-HEAD control is 0 px (FONT-PIXEL).

**Expected:** every shipped woff2 is byte-identical to the file a browser receives from Google at HEAD (task title, §0.2, FONT-PIXEL). FN3, doc 229 and the notices assert this.

**Actual:** 4 Playfair files differ. The `/store` heading renders differently from HEAD. FN3 pins the wrong sha256 values. The test name "byte-identical to the pinned Google Fonts file" and doc 229 (title, l.24, l.54) state something false about the bytes browsers received.

**Why Medium, not Low:** the visual difference is anti-aliasing only, and Playfair is due for deletion in STORE-2c. But a Low would be deferred past the gate, so the round would publish a sha pin of the wrong files and false claims in a test name, the doc and the notices.

**Bounded fix proposal for B:**
- re-fetch the 4 Playfair files from the `/s/` URLs (Chrome-UA CSS);
- update the 4 lines in `fonts-sha256.txt` and the FN3 pins;
- keep the faces' weight declarations;
- re-run FN2–FN4, TH7 and FONT-PIXEL `/store`.

The 4 replacement files are already in `c-round-316/gfonts-dl/` (from `https://fonts.gstatic.com/s/playfairdisplay/v40/`): latin `nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2`, latin-ext `nuFiD-vYSZviVYUb_rj3ij__anPXDTLYgFE_.woff2`, cyrillic `nuFiD-vYSZviVYUb_rj3ij__anPXDTjYgFE_.woff2`, vietnamese `nuFiD-vYSZviVYUb_rj3ij__anPXDTPYgFE_.woff2`. The Chrome-UA CSS maps 25 unique URLs 1:1 onto the 25 mirror files, so the `fonts.css` face declarations need no change. Once the 4 files are replaced and their 4 sha lines updated, FN3's name, doc 229 and the notices become true as written; they need no text edits beyond the sha pins.

Consider fetching the CSS with a pinned Chrome UA and adding a manifest row "no `/l/font?kit=` URL".

**Evidence:** `c-round-316/byte-identity.txt`, `byte-identity-all.txt`, `gfonts-dl/` (Chrome-UA CSS, `/s/` files, `kit-playfair-latin.woff2`, `playfair-defaultUA.css`, `playfair-chromeUA.css`), `playfair-compare.cjs/.json`, `pxdiff.txt`, `store-heading-crop-head1-a-head2.png`.

## Observations (no defect)
- B's own HEAD-vs-HEAD control (`b-round-315/probe/pxdiff-head-vs-head.txt`) showed the same 2,015 px `/store` band at 1280, and B attributed it to a band that "moves by itself". In C's run, head1 vs head2 on `/store` is 0 px at both viewports. The band is the Playfair heading. Inference, not proven: B's HEAD-vs-HEAD band probably came from a load where Playfair had not swapped in yet, and that masked the defect.
- A-R316-REVIEW-P1…P5 (proposals) are left to B. P4 (CSP needs `font-src data:`) is confirmed: the build has 4 `data:font/woff2` references in `fonts-*.css`.
- Studio product flow (find sound → add → fit video → export) is untouched this round (fonts only). Only the auth guard and the `/studio-lab` load/perf path were exercised. No Ableton comparison applies: this is a performance round, with no reference behaviour.

## Harness fields
`assertsSpecified` 7 (FN1–FN5, TH7, TL10), `mutantsRecorded` 13 (12 + A's MU-NOTICES-DROP-FAMILY; C's own MU-C-FONTS-BEFORE-LAME recorded separately), `mutantRedOnSketch` 12.
