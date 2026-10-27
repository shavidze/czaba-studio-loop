# A round 202 — SABA-B-4 stage 2 (store focus ring), D-29z167

A, 2026-10-27. **No STOP.** R93–R99 are applied inside the 31 grants plus the 3 new files. No commit or push.
Status: implementation done; code review done (§6). Mock on :5199 stopped at the end.

## 1. Start checks (step 1)
- HEAD was `5b1a2bb` and `git status --short --untracked-files=all` was empty.
- The frozen list (1001 entries) checked OK, and so did the grant start hashes.

## 2. Inventory (steps 2–3)
| Scan | Before (HEAD) | After (tree) | Expected |
|---|---|---|---|
| store-focus-inventory.py | store 155 / 31, studio 13 / 5 | **store 16 / 6, studio 13 / 5** | 16 / 6, 13 / 5 ✓ |
| hidden-focusable-scan.py | 6 sites (§0 list) | **5 sites**: SfxVideoSync gone; `ProductCard.tsx:132 reveal=True`; VideoShowcase:107, Header:107, NewsletterSection:68 and free-downloads:303 unchanged | 5 ✓ |

The 16 remaining store tokens:
- 8 × `peer-focus:*` in `Input.tsx` (now on l.58, 64, 133 and 243);
- `Card.tsx:15` `outline`;
- `ProductCard.tsx:132` `focus-within:opacity-100`;
- `StudioTrack.tsx:214` `ring-1` / `ring-inset` / `ring-brand/50`;
- `StemsLoadingAnimation.tsx`, 2 × `ring`;
- `CustomCursor.tsx:90` `ring`.

Other checks:
- **R97 uses: 0** (see §4, R96).
- **R95 precondition:** `newsletter-input-large` and `glass-input` appear only in app.css (their definitions and `:focus` rules). This is the same as round 201.
- **L12 grep:** I searched every `*.test.*` file for the removed tokens, `Choose video`, `Choose local video` and the retired CSS class names.
  - Outside arrangement there is one hit: `sfx-video-transport.test.tsx:74`, `getByLabelText('Choose local video')`. It still holds, because the hidden input keeps that aria-label.
  - The arrangement-test hits are about arrangement sources, which are unchanged.

## 3. Changed files
**Sweep (R94 tokens only).** The 26 granted sweep files other than SfxVideoSync; 140 tokens removed in total.
- `cn()`/array elements left empty were deleted: ChatButton, ChatInput ×2, GuestForm ×3, Button, IconButton, Input ×2, RecordingCatalogRow.
- Trailing spaces inside class strings were trimmed.
- The empty line left in the LeadMagnetPopup template literal was removed.
- **Biome reflow (L5):** in `GuestForm.tsx` the formatter put each of the two `errors.x ? 'border-destructive' : 'border-outline-strong'` ternaries on one line. There is no other reflow.
- **Error borders:** the base `border-destructive` is kept (GuestForm ×2, Input ×2). Only the `focus:border-destructive` and `focus:ring-destructive/10` tokens were removed.

**`SfxVideoSync.tsx`.** R94 (the inputClass constant, the 2 tab buttons, the 3 marker buttons, l.278) and R98 exactly as ruled:
- `useRef` added to the React import;
- `const fileInputRef = useRef<HTMLInputElement>(null);`;
- the `<label>` is replaced by `<button type="button" className="relative inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-outline px-4 text-sm text-foreground" onClick={() => fileInputRef.current?.click()}>Choose video</button>`;
- a sibling `<input ref aria-label="Choose local video" type="file" accept="video/*" tabIndex={-1} className="hidden" onChange={unchanged}>`.

**`ProductCard.tsx`.** R96 adds `className="block rounded-xl"` to the `<Link>`. R99 adds `focus-within:opacity-100` to the l.132 overlay.

**`app.css` (R95).** 22 lines deleted, 0 added:
- 5 × `outline: none;` removed: audio-player-progress, audio-player-volume-slider, video-player-slider, video-volume-slider and command-palette-input;
- the `.newsletter-input-large:focus`, `.sort-select:focus` and `.glass-input:focus` rules removed, with their trailing blank lines.

**R93.**
- `root.tsx`: the import plus a `useFocusSourceAttribute();` call after `useSmoothScroll();` in `AppContent`.
- `StudioWorkspace.tsx`: the import line and the call line removed. Nothing else changed.

**New files:**
- `app/lib/__tests__/store-focus-ring.test.ts`;
- `app/lib/__tests__/sfx-video-choose-button.test.tsx`;
- `docs/implementation/2026/quarter-IV/160-saba-b-4-store-focus-ring.md`.

**Deliverables:** `a-round-202/end-sha256.txt` and `a-round-202/diff-vs-start.patch` (the grants against `b-round-201/r202-granted-start/`, plus the new files in full).

## 4. R96 cause (C-R196-03), measured
Scripts: `a-round-202/r96-cause.cjs` and `r96-variants.cjs`. Data: `r96-variants.json`. Screenshots: `r96-*.png`.

**Cause.** The `/` home card `<Link>` is `display: inline` around a block `div`. It has 3 client rects: 0×0, 320×417.6 and 0×0. **0 brass px are painted on every side**, for both cards, at 1280, 1440 and 375.

**Fix measured: `block rounded-xl`, offset 2px.**
- 1280, card 2: top 306 / bottom 310 / left 410 / right 400 brass px.
- 1280, card 1: top 267 / bottom 305 / right 401, **left 0**. The left side is clipped by the `flex gap-6 overflow-x:auto` carousel, whose edge sits on the card. The ring shows on 3 sides; the clipping is pre-existing.
- 375: top and bottom are clearly brass. The sides are thin or clipped by the carousel (seen in `r96-375-1-block.png`).

**Rejected: `block rounded-xl` + `[--focus-offset:-2px]`.** The top side drops to 0 px on every card, because the image's positioned `div` covers the inset ring. R97 is not used for this element.

**Layout.** The Link, article and grid rects are identical before and after: 320×417.6 at x=32 (1280).

## 5. Tests actually run
**New suites.**
- `store-focus-ring.test.ts`: 10/10 green on the tree. On a HEAD copy (`/tmp/refstore`, made with `git archive HEAD`), STF2, STF3, STF4 and STF6 a/b/c are red. STF1 and the 3 STF5 self-tests are green there.
- `sfx-video-choose-button.test.tsx`: 5/5 green. On the HEAD copy, SV1, SV2, SV3 and SV5 are red. SV4 is green there, because the `change` path is unchanged.

**Covering tests.** B's command plus the re-derived covering list: **30 files, 357 tests, all green.**
- `grep -rlE` of the granted component names in `*.test.*` gives B's 25 files (`b-round-201/out/covering-tests.txt`) exactly, plus the 2 new suites.
- B's explicit list adds studio-focus-ring, focus-source, focus-reveal-ui, store-theme-tokens, store-header-footer, product-presentation and audio-preview-player.
- No frozen test turned red.

**Static checks.**
- `npm run typecheck`: clean.
- `npm run lint`: 215 warnings and 1 info, identical to the HEAD copy; 0 errors.
- `npx biome check` on the 31 grants and the 2 new tests: 0 errors. The 46 warnings in the grants all exist at HEAD (the same set; only line numbers shift). The 2 new tests have 0 diagnostics.

**Mutants** (`a-round-202/mutants.txt`). Each file was backed up, mutated and restored; the tree hash was re-verified afterwards.

| Mutant | Change | Red row(s) |
|---|---|---|
| m1 | `focus-visible:ring-2` put back in Button | STF2 |
| m2 | `outline: none` put back in `.video-volume-slider` | STF3 |
| m3 | hook call put back in StudioWorkspace | STF4 |
| m4 | `root.tsx` call removed | STF4 |
| m5 | `focus-within:ring-2` in a multi-line `cn()` in ChatInput | STF2 |
| m6 | `focus-within:opacity-100` removed | STF6c |
| m7 | `opacity-0` file input without `tabIndex={-1}` | STF6a and STF6b |
| m8 | `onClick` made a no-op | SV2 |

## 6. Code review (actual `code-reviewer` subagent, read-only, score 8/10, 0 Critical/High)
**Medium findings.** None was fixed in this round. Each needs a change outside the R94/R98 permissions, so each goes to B to rule on:
- **A-R202-REVIEW-INPUT-ERROR-BORDER (Medium, partly pre-existing).** In `ui/Input.tsx`, the base style `border-outline-strong` overrides `error && 'border-destructive'`.
  - Browser-verified (`a-round-202/errborder.cjs`): with both classes the border colour is rgb(115,107,96), the outline-strong colour; `border-destructive` alone is rgb(210,119,106).
  - At HEAD the unfocused error border was already invisible. While focused it showed through `focus:border-destructive`, and R94 removed that token. So the red border now never shows in `Input`/`Textarea`.
  - Consumers: `auth/SignInForm`, `SignUpForm` and `ForgetPassword` (the AuthModal). GuestForm is not affected, because it uses a ternary.
  - Proposed fix: in `Input` and `Textarea`, make it `error ? 'border-destructive' : 'border-outline-strong'`. This is not an R94 token, so it needs a ruling. The ERROR-BORDER row on `/support` and `/hire-us` uses other fields; C should also check the auth modal.
- **A-R202-REVIEW-TYPING-RING (Medium, design question).** Click a text field with the mouse, and the first printable key switches `data-focus-source` to `keyboard`, so the outline appears mid-typing. At HEAD the store showed a steady `focus:border-brand` instead.
  - The reviewer's option (a) is to exclude text-entry controls from the pointer rule. That changes the R92 CSS and SFR1/STF3. Option (b) is to ignore printable keys typed into editable targets, in `focus-source.ts`, which is not granted.
- **A-R202-REVIEW-SCROLL-CLIP (Medium per the reviewer; pre-existing).** Outlines are clipped in scroll containers with no padding: the `SfxVideoSync.tsx:143` tab panel (the Moment name input, marker buttons) and the `SfxSoundLibrary.tsx:133` row Buttons. The old ring-2 was clipped the same way.
  - The pages are BLOCKED-AUTH, so this could not be measured. R97 needs a measurement, so none was added.
- **A-R202-REVIEW-DROP-LOST (Medium per the reviewer).** R98 removes native drag-and-drop of a file onto "Choose video", because the old `opacity-0` input covered the label.
  - R98 says "Nothing else in the file changes", so no drop handler was added. Recorded in doc 160.

**Low findings, applied in my own new test files:**
- STF2 now also flags bare `outline-hidden` and `outline-0`, with an added fixture.
- SV2 now uses `toBe`, an identity check.
- Both suites are green again, and m1–m8 are still all red (re-run).

**Low findings not applied (noted for B):**
- STF2 misses arbitrary forms such as `[&:focus]:outline-none` and `focus:[outline:none]`, and inline style outlines.
- STF3 does not assert the rule is unlayered. The frozen SFR1 already pins it as top level.
- STF6(a) covers `<input>` only.
- Brittle substring and first-closing-tag assumptions; the scanners use class text (static source scan, not DOM queries).
- Info: `relative` and missing `disabled:` styles on the new button. That is the exact R98 class list, unchanged.

**Architecture note (verbatim from the reviewer):** "Signal 4 (new lifecycle in an existing owner): `app/root.tsx:136` — `AppContent` now owns two document-level capture listeners and the `html[data-focus-source]` attribute. Keep: a one-line hook for an app-wide concern, root is the natural owner, Studio no longer duplicates it; no new coupling, and `focus-source.test.tsx` covers it. Side effect: when `RootErrorBoundary` renders, `AppContent` is not mounted, so the error page shows the outline on mouse focus too (minor, no task needed)."

## 7. Browser self-check (step 8)
Setup: the mock on :5199 (started by A), the dev server on :5173 (not restarted), Playwright Chromium, 1280×720 unless noted. Scripts and JSON are in `a-round-202/`.

**Keyboard focus, tree** (`probe-tree.json`, `extra-probe-tree.json`, `audio-contrast-tree.json`):

| Element | Outline | box-shadow focused | Effective opacity | Ring contrast | Ref (`probe-ref.json`) |
|---|---|---|---|---|---|
| `/store` search input | solid 1px, offset 2px | **none** | 1 | 5.66 (computed vs background) | 1px brass box-shadow ring plus `focus:border-brand`: a double indicator |
| `/` header "Search (⌘K)" Button | solid 1px, offset 2px | none | 1 | 5.66 | same |
| `/` card link | solid 1px, offset 2px, `display:block`, radius 16px | none | 1 | 5.43 (pixel sample: ring 165,134,88 vs 21,19,15) | inline, 0 px painted |
| `/` Play preview (R99) | solid 1px, offset 2px | the existing teal shadow, the same as unfocused | **1** | 3.84 vs the outer scrim, 3.35 vs the inner pixel (pixel sample) | **opacity 0** |
| ⌘K palette input | solid 1px, offset 2px | none | 1 | 5.43 (pixel sample) | `outline:none` (R95 cause); not re-measured in ref by A |
| AudioPlayer progress / volume | solid 1px, offset 2px | none | 1 | ring visible in `slider-why.png` | `outline:none` in ref CSS; not browser-measured in ref by A |

- After Tab moves away from the Play preview button, the overlay opacity returns to 0.
- **AudioPlayer crops:** the first crops (`tree-audio-player-*.png`) counted 0 brass px. They were taken while the player bar was still animating in. The settled crop (`slider-why.png`) shows the rectangular ring. The brass fill of the track makes pixel counting ambiguous, so C should measure this.

**Pointer.**
- A mouse click on the `/store` search input gives `data-focus-source="pointer"`, outline `none 0px` and box-shadow none.
- On a fresh load the attribute is `null` until the first input, and the first Tab sets `keyboard`.
- **The sort select is not on `/store`.** `FilterBar` renders only inside `AssetListingPage`, and no route imports it. The CSS-CONTROLS and POINTER "sort select" items cannot run. This is a task inventory gap for B, like R100.

**Studio neighbour** (1280).
- `/studio-lab`: a mouse click on Play gives `pointer` and outline none. The next Tab reaches "Back to start" with `keyboard` and a solid 1px outline.
- `/studio-lab` → `/` through the CZABA link: `pointer`, then Tab gives `keyboard`.
- `/` → `/studio-lab` through the Studio nav link: `pointer`, then Tab gives `keyboard`.

**CHOOSE-VIDEO (R98).**
- **In-app:** `/scenes/pulse-loop-kit` shows "Sign in required" with the mock, so the in-app row is BLOCKED (backend/auth).
- **Harness** (`choose-video-harness.cjs`): the real `SfxVideoSync` module, imported from the Vite dev server and mounted on the real `/` page with the live app CSS.
- At 1280 and 1440, Tab from `prev` lands on the BUTTON "Choose video": outline solid 1px, offset 2px, box-shadow none, `keyboard`, ring contrast 5.43 (pixel sample).
- The next Tab goes to the "Moments" button, so there is no invisible stop. Shift+Tab returns to "Choose video".
- Enter, Space and mouse each fire `filechooser`, with a fresh page per method. `setFiles` calls `onChoose` with `Scene.mp4`.
- While busy (`fieldset disabled`), the button is `:disabled` and a mouse click opens no chooser.
- Box against a ref `<label>` with the same classes at the same spot: 123×44 vs 123×44, Δ 0.
- **One intermittent miss.** In the first harness run, Space at 1280 returned `none`. A rerun (3 × 1280 and 3 × 1440) gave 6/6 `filechooser` (`space-rerun.cjs`). The cause is not known: the first run did not log the active element before Space. C should repeat this check.

**Not run by A:** the 1440 and 375 card and preview probes, the full KEY-RING Tab sweep, NO-SHIFT, ERROR-BORDER and KEEP-LIST. These are C's rows.

## 8. Known gaps and notes for B
1. **The sort select is not rendered** (§7). The CSS-CONTROLS and POINTER rows name it, but it cannot be reached.
2. **The first carousel card's left edge** is clipped by the `ProductSection` `overflow-x:auto` carousel, which is pre-existing. R97 cannot fix it, because the inset ring loses its top side, and `ProductSection` is not granted. The ring shows on 3 sides. Proposed as a new Low.
3. **`/store` has no "Play preview" buttons with the mock** (0 found). I checked the R99 overlay on `/` instead.
4. **The Space intermittent in the harness** (§7).

## 9. Exact next C checks
- **SCOPE-202:** `a-round-202/end-sha256.txt` and `diff-vs-start.patch`. Expect ` M` on the 31 grants and `??` on the 3 new files.
- **HIDDEN-FOCUS:** at 1440 and 1280 on `/`, every card's Play preview: overlay opacity after ≥ 400 ms, then Tab away and back to 0. At 375: unchanged from ref.
- **CARD-RING:** at 1440, 1280 and 375. Card 1 should show the left side clipped; card 2 should show 4 sides. Boxes ±0.
- **CSS-CONTROLS:** the AudioPlayer sliders after the bar settles, the ⌘K input, and ref outline none. The sort select cannot be reached (gap 1).
- **CHOOSE-VIDEO:** in-app is BLOCKED. Re-run the harness pattern, including Space ×3.
- **The remaining rows:** KEY-RING, RING-VISIBLE, CONTRAST, POINTER, NO-SHIFT, ERROR-BORDER (GuestForm on `/support`, hire-us), KEEP-LIST, STUDIO-NEIGHBOUR at 1440, G202-3.

## 10. B acceptance criteria A actually passed
- Step 1: the start checks.
- Steps 2–3: the before-counts match, and so do the after-counts (16/6, 13/5, 5 sites).
- Steps 4–5: STF1–STF6 and SV1–SV5 are implemented and green on the tree. On the start copy they are red, except STF1, STF5 and SV4, which are expected to stay green there.
- Step 6: the covering tests are green; typecheck is clean; lint has no errors (its warnings match HEAD).
- Step 7: all 8 mutants turn their rows red.
- Step 8: partly done, see §7. All C rows are still C's.
