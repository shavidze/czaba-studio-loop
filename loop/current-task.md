# CURRENT TASK — Round 202: SABA-B-4 stage 2, re-dispatched with B's ruling on A's STOP (store pages: one focus style on every store focusable, including the hidden ones)

Decision: **D-29z167** · Planned by B on 2026-10-27 (from 02:05 UTC) · Dispatcher B · Implementer A · Verifier C.

**Read first:** `lessons.md` (loop root). This planning step changed L1 (it now includes a hidden-focusable scan) and the L12 evidence wording.

## Baseline: HEAD `5b1a2bb`, clean tree
- Gate 199 published `5b1a2bba0c98dcc86564be8441fbdf989cc8f7b8`. Gates 200 and 201 were `skipped` (C FAIL; no source changed), so **`5b1a2bb` stays the baseline**.
- **Frozen list:** `b-round-201-r202-tree-sha256.txt`, **1001 entries** (the 1032 tracked files minus the 31 grants). Check it from `store/` with `sha256sum -c --quiet`.
- **Grants:** `b-round-201-r202-grants.txt`, 31 files. These are the same 31 files as round 201, and two of them now have wider permissions (§2). The start copies are in `b-round-201/r202-granted-start/`, with hashes in `b-round-201-r202-granted-start-sha256.txt`. They are byte-identical to the round-201 start copies.
- **New files:** `b-round-201-r202-new-files.txt`, now **3** files: `app/lib/__tests__/store-focus-ring.test.ts`, `app/lib/__tests__/sfx-video-choose-button.test.tsx`, `docs/implementation/2026/quarter-IV/160-saba-b-4-store-focus-ring.md`.
- **Protected, unchanged as always:** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.
- **Also unchanged:** `.claude/**`, `CLAUDE.md`, the obsidian block in `app.css`, `CookieConsent.tsx`, `app/components/ui/Modal.tsx`, `app/components/layout/Header.tsx`, `app/components/home/VideoShowcase.tsx`, `app/lib/arrangement/**`, and every arrangement file. The one exception is the R93 lines of `StudioWorkspace.tsx`.

## 0. Why this round
- **Round 201:** A reported **STOP — needs B ruling on R94 × `SfxVideoSync.tsx:34`**, and changed nothing (`a-round-201.md`). C ran the short round (L22): SOURCE-SCOPE, G201-3 and RT-FIX passed. All feature rows were marked "FAIL not implemented (A STOP)". `browserVerified` was false. Gate 201 was skipped.
- **The collision:** R94 removes the label's `focus-within:ring-*`. After that, the only focus target is an `opacity-0` file input, and its outline is not painted (A's probe: 69 brass px when focused, the same 69 px when unfocused, against 693 px in ref).
- **Whose gap:** B's (B-R200-HIDDEN-FOCUSABLE-GAP, info). The round-201 inventory did not scan for visually hidden focusables. **L10:** B now rules before re-dispatch, and **L1** now requires that scan.
- **B's hidden-focusable scan at HEAD** (`b-round-201/tools/hidden-focusable-scan.py`): it finds 6 sites (`b-round-201/out/hidden-focusable-scan-head.txt`). Each one has a ruling:

| Site | What it is | Ruling |
|---|---|---|
| `SfxVideoSync.tsx:34–47` | `opacity-0` file input inside a label with a `focus-within` ring | **R98** |
| `ProductCard.tsx:132` | md+ hover-only overlay (`opacity-0 group-hover:opacity-100`) around the tabbable "Play preview" button | **R99**. Browser probe at HEAD: on `/`, all 7 card "Play preview" buttons get keyboard focus at effective opacity 0, at 1280×720 and 1440×900 (`b-round-201/out/hidden-focus-probe-head.json`) |
| `VideoShowcase.tsx:107` | md+ hover-only controls | **R100**. The component is **imported nowhere** (`grep -rn VideoShowcase app` finds only its own file), so it never renders. No change this round. Recorded as a deferred Low |
| `Header.tsx:107` | Signed-in user menu with `opacity-0 invisible group-hover:visible`. Its 4 items can't be reached with the keyboard at all | Not a focus-style bug: it is keyboard reachability, and only signed-in users see it (BLOCKED-AUTH). Recorded as **B-R201-HEADER-USERMENU-KEYBOARD** (Medium, open, backend-blocked). Scheduled after this stage. **Not in this round** |
| `NewsletterSection.tsx:68`, `free-downloads.tsx:303` | Honeypot inputs with `tabIndex={-1}` | Not tabbable. No change |

- **Saba (2026-10-26, binding), unchanged:**
  - One shared focus style site-wide: an outline on `:focus-visible` only, 1.5px brass at ≤ 80 % opacity, 2px offset, following the element's own radius. Layout never moves.
  - No filled background, no thick pill and no glow on focus. No ring after a mouse or pointer press.
  - Contrast ≥ 3:1, and every focusable element shows the ring.
  - At most 2 rounds: stage 1 (Studio) is done; this is stage 2 (the store), re-dispatched.
  - R90 stands: Chromium paints the declared 1.5px as 1px. The criterion is "≥ 1px painted" (L9).

## 1. Rulings
All are recorded in `backlog.json` → `SABA-B-4.stage2_rulings_d29z166` (R92–R97) and `stage2_rulings_d29z167` (R98–R100). Saba or root may veto any of them.

**R92–R97 stand unchanged from round 201.** Read their full text in `tasks/round-201.md` §1. In short:

| ID | Ruling |
|---|---|
| R92 | The global rule stays unlayered and unchanged. No new `:focus-visible` text goes into `app.css`. |
| R93 | Mount `useFocusSourceAttribute()` once, in `root.tsx` `AppContent`, and remove it from `StudioWorkspace.tsx` (2 lines). |
| R94 | Store token sweep. **Remove:** `focus-visible:ring-*`, `focus:ring-*`, focus-variant `*ring-offset*`, `focus-within:ring-*`, `focus:outline-none`, `focus-visible:outline-none`, bare `outline-none`, `focus:border-*`. **Keep:** `peer-focus:*` and non-focus `ring-*`. |
| R95 | `app.css`: delete the 5 `outline: none;` declarations, the `.sort-select:focus` rule, and the two unused glow rules. |
| R96 | C-R196-03: give the card link a visible ring with no layout move. A confirms the cause in the browser first. |
| R97 | Where an `overflow` ancestor clips the ring, use `[--focus-offset:-2px]` on that element only, listed with its measurement. |

New rulings:

| ID | Ruling | Why |
|---|---|---|
| **R98** (A's STOP) | **SfxVideoSync "Choose video" becomes a real button.** Replace the `<label …>` wrapper (l.34–47) with:<br>(1) `<button type="button" className="relative inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-outline px-4 text-sm text-foreground" onClick={() => fileInputRef.current?.click()}>Choose video</button>`. This is the label's class list with the two `focus-within:ring-*` tokens removed.<br>(2) A sibling `<input ref={fileInputRef} aria-label="Choose local video" type="file" accept="video/*" tabIndex={-1} className="hidden" onChange={…unchanged…} />`.<br>(3) `const fileInputRef = useRef<HTMLInputElement>(null);` with `useRef` added to the React import.<br>Nothing else in the file changes, apart from the R94 tokens. Behaviour: Tab lands on the visible button, and the global outline paints on it. Enter, Space and mouse click open the file chooser. The tabbable control's accessible name is now "Choose video". The hidden input keeps `aria-label="Choose local video"`, so the frozen `sfx-video-transport.test.tsx` (`getByLabelText('Choose local video')` + `change`) still holds. `<fieldset disabled={busy}>` also disables the button. | A's options (a)/(b) need an STF2 exception and a second copy of the ring values on the label. Option (c) leaves a Medium WCAG 2.4.7 loss, and option (d) keeps a box-shadow ring against Saba's "outline, no ring". R98 needs no exception, keeps the one shared rule, and keeps the visible look. B checked it on a scratch copy (R94 sweep + R98 + R99): store-focus inventory **16/6**; 27 covering test files green (336 tests) including `sfx-video-transport`, `sfx-scene-route`, `sfx-library` and `store-theme-tokens`; `tsc --noEmit` clean. In a Chromium harness (`b-round-201/tools/filechooser-probe.cjs`, `out/filechooser-probe.json`), Tab reaches the button with a solid 1px brass outline, and Enter, Space and mouse each fired `filechooser`, with a fresh page per method. Tab stops: `prev`, `choose`, and the hidden input is not one. |
| **R99** | **ProductCard md+ overlay is revealed on focus.** Add exactly one token, `focus-within:opacity-100`, to the overlay `div` at `ProductCard.tsx:132`. Nothing else changes in that line. The overlay's scrim (`bg-background/60 backdrop-blur-sm`) then shows while its "Play preview" button has focus, the same as on hover. **L4 (one element, one rule):** KEY-RING's "no background or border change on focus" applies to the **focused element itself**. Revealing a hover-only parent container is allowed and is not a focus fill. The focused button keeps only the global outline. | "Every focusable shows it": today the ring paints at opacity 0 (probe above). This is the smallest change that makes the control visible when it holds focus. `opacity` is not an indicator kind in STF2, so no exception is needed. |
| **R100** | **The CSS-CONTROLS row drops the VideoShowcase sliders.** `VideoShowcase` is not rendered anywhere. R95 still deletes its two `outline: none` declarations, and STF3 checks them at code level. Do not touch `VideoShowcase.tsx`. | The round-201 task wrongly placed those sliders on `/`. B's import grep shows the component is unused. |

**Ableton:** does not apply (store pages, no DAW behaviour). Do not claim Ableton parity.

## 2. A — files you own (everything else is frozen)
**Grants (31), the same files as round 201:**
- **Sweep (27):** `app/components/cart/GiftCardInput.tsx`, `app/components/chat/{ChatButton,ChatInput,GuestForm}.tsx`, `app/components/home/NewsletterSection.tsx`, `app/components/marketing/LeadMagnetPopup.tsx`, `app/components/product/{ProductAccordion,VersionSelector}.tsx`, `app/components/recordings/{RecordingCatalogRow,SfxQuickEdit,SfxSceneBuilder,SfxSceneExport,SfxSoundLibrary,SfxVideoSync}.tsx`, `app/components/studio/{ExportDialog,VideoUploadZone}.tsx`, `app/components/ui/{Button,IconButton,Input}.tsx`, `app/routes/{account,cart,free-downloads,gift-cards,hire-us,recordings.$productId,scenes.$productId,store}.tsx`. In these files change **only R94 tokens** (and R97 where measured). **Exception: `SfxVideoSync.tsx` also gets R98.**
- `app/styles/app.css`: R95 only.
- `app/root.tsx`: the R93 import and call only.
- `app/components/arrangement/StudioWorkspace.tsx`: the R93 removal only (the import line and the call line).
- `app/components/product/ProductCard.tsx`: **R96 + R99** only.

**New files (3):**
- `app/lib/__tests__/store-focus-ring.test.ts`
- `app/lib/__tests__/sfx-video-choose-button.test.tsx`
- `docs/implementation/2026/quarter-IV/160-saba-b-4-store-focus-ring.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. It covers:
  - R92–R100;
  - the rejected alternatives: "layer the rule", and options (a)–(d) for SfxVideoSync;
  - the inventory numbers and the hidden-focusable scan;
  - the C-R196-03 cause as you measured it.

**Primitives to read first:**
- `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`;
- `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-test.md`.

**Pre-work from round 201 that you may reuse (do not repeat the analysis; just re-run the commands):**
- the step-2 inventory: `store 155 / 31`, `studio 13 / 5`;
- the R95 grep: only the definitions and `:focus` rules use `newsletter-input-large` and `glass-input`;
- the R93 call sites: `StudioWorkspace.tsx:461`, import at l.121.

**Steps:**
1. **Start checks**, from `store/`:
   - HEAD is `5b1a2bb`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen list checks OK;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-201-r202-granted-start-sha256.txt` is OK.
2. **Inventory:**
   - Run `python3 -I ../tmp/studio-real-loop/b-round-200/tools/store-focus-inventory.py . /tmp/inv.json /tmp/sites.tsv`. Expect `store 155 tokens / 31 files` and `studio 13 / 5`.
   - Run `python3 -I ../tmp/studio-real-loop/b-round-201/tools/hidden-focusable-scan.py . /tmp/hid.json`. Expect exactly the 6 sites in §0.
   - If either result differs, STOP (L11).
3. **Apply R93–R99.** Then re-run both scanners.
   - **Expected focus inventory after the change: store 16 tokens in 6 files**, exactly these and nothing else:
     - the 8 `peer-focus:*` tokens in `Input.tsx`;
     - `Card.tsx:15` `outline` (a variant name);
     - `ProductCard.tsx` `focus-within:opacity-100` (R99);
     - `StudioTrack.tsx:214` `ring-1 ring-inset ring-brand/50` (selection);
     - `StemsLoadingAnimation.tsx`, 2× `ring`;
     - `CustomCursor.tsx:90` `ring`.
   - The last four files are not granted. R97 uses (`[--focus-offset:-2px]`) are listed separately and may add to the count; name each one.
   - Studio stays 13 / 5.
   - **Expected hidden-focusable scan after the change: 5 sites.** `SfxVideoSync` is gone. `ProductCard.tsx:132` now shows `reveal=True`. VideoShowcase, Header and the two honeypots are unchanged.
   - Put the before and after numbers in the report.
4. **`store-focus-ring.test.ts`** (node environment, like `studio-focus-ring.test.ts`). Rows:
   - **STF1 walker:** scans every `app/**/*.{ts,tsx}` outside `app/components/arrangement/`, `app/lib/arrangement/`, `app/routes/studio-lab.tsx`, `__tests__` and `*.test.*`. It must include each of the 29 granted `.tsx` paths other than `StudioWorkspace.tsx`, and it must find ≥ 200 source files. B counted 238.
   - **STF2:** no scanned source has a token with a focus variant (`focus:`, `focus-visible:`, `focus-within:`, `group-focus*`, `peer-focus-visible:`) of kind ring, ring-offset, outline, border, bg or shadow. There is also no bare `outline-none`.
     - `peer-focus:*` is allowed.
     - Focus-variant `opacity-*` is allowed: a reveal is not an indicator (R99).
     - The scanner reads whole class text (multi-line `cn()` arrays, constants, template literals), not single lines.
   - **STF3:** in `app.css` (comments stripped):
     - `outline: none` occurs exactly once, inside the `html[data-focus-source="pointer"] :focus-visible` rule;
     - no selector contains `:focus` other than the two `:focus-visible` rules;
     - `.sort-select:focus`, `.newsletter-input-large:focus` and `.glass-input:focus` are gone.
   - **STF4:** `useFocusSourceAttribute(` has exactly one call site in `app/`, outside `app/lib/focus-source.ts` and tests. That call site is in `root.tsx`; `StudioWorkspace.tsx` has none.
   - **STF5 (scanner self-test):**
     - **Flags:** a `focus-visible:ring-2` inside a multi-line `cn([...])`; a `const X = 'focus:outline-none'`; a `hover:focus:ring-brand/20` in a template literal; a bare `outline-none`; a `focus-within:ring-2`.
     - **Passes:** `peer-focus:text-brand`; `ring-1 ring-inset ring-brand/50` with no focus variant; a class named `ring`; `focus-within:opacity-100`.
   - **STF6 (hidden focusables), parsing whole JSX elements, tag to `>` (L13):**
     - (a) every scanned `<input` element whose class text contains `opacity-0` or `invisible` also has `tabIndex={-1}`;
     - (b) in `SfxVideoSync.tsx`, the `type="file"` element has `tabIndex={-1}` and `className="hidden"`, and has no `opacity-0`; a `<button` element with `type="button"` and the text `Choose video` exists;
     - (c) in `ProductCard.tsx`, the element whose class contains `opacity-0 group-hover:opacity-100` and wraps `AudioPreviewButton` also contains `focus-within:opacity-100`.
     - Self-test fixtures: an `<input className="absolute inset-0 opacity-0" type="file">` with the class on an earlier line than `type` is flagged by (a). A honeypot with `tabIndex={-1}` passes.
5. **`sfx-video-choose-button.test.tsx`** (jsdom). Render `SfxVideoSync` with minimal props (`url=""`, `position={0}`, `busy={false}`, `vi.fn()` handlers).
   - **SV1:** `getAllByRole('button', { name: 'Choose video' })` has length 1 (L14).
   - **SV2:** with `vi.spyOn(HTMLInputElement.prototype, 'click')`, `fireEvent.click` on that button calls the spy exactly once, with `this` being the element that `getByLabelText('Choose local video')` returns.
   - **SV3:** that input has `type="file"`, `accept="video/*"` and `tabIndex === -1`.
   - **SV4:** a `change` with a `File` calls `onChoose` once with that file, and the input's `value` is reset to `''`.
   - **SV5:** with `busy={true}`, the button is disabled (`toBeDisabled()`, which follows the `<fieldset disabled>` ancestor). Do not assert on a synthetic click here: React and jsdom do not suppress `fireEvent.click` on a button that is disabled only through its fieldset, so a spy assertion would be a false red. The browser checks "busy → no chooser" (step 8).
6. **Covering tests** (speed rule; no full suite, no `npm run verify`). Run:
   ```
   npx vitest run app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/sfx-video-choose-button.test.tsx app/lib/arrangement/__tests__/studio-focus-ring.test.ts app/lib/__tests__/focus-source.test.tsx app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-header-footer.test.tsx app/lib/__tests__/product-presentation.test.tsx app/lib/__tests__/audio-preview-player.test.tsx
   ```
   - Also run every test file that imports or names a granted component. B's list is the 25 files in `b-round-201/out/covering-tests.txt`; re-derive it with `grep -rl` and list it in the report.
   - Then run `npm run typecheck` and `npm run lint`.
   - **No frozen test is expected to turn red.** If one does, STOP and name the test (L11/L12). Do not edit a frozen test.
7. **Mutants.** Keep each one out of the final tree, and report each result:
   - m1: put `focus-visible:ring-2` back on `Button.tsx` → STF2 red.
   - m2: put `outline: none;` back in `.video-volume-slider` → STF3 red.
   - m3: put the hook call back in `StudioWorkspace.tsx` → STF4 red.
   - m4: remove the `root.tsx` call → STF4 red.
   - m5: add `focus-within:ring-2` inside a multi-line `cn([...])` in `ChatInput.tsx` → STF2 red.
   - m6: remove `focus-within:opacity-100` from `ProductCard.tsx` → STF6 red.
   - m7: restore the `opacity-0` file input without `tabIndex={-1}` in `SfxVideoSync.tsx` → STF6 red.
   - m8: make the button's `onClick` a no-op → SV2 red.
8. **Browser self-check, before handover (L15)**, at 1280×720, with the mock on :5199, which you start and stop:
   - **`/store` and `/`:** Tab to the search input, a Button, the sort select, a product card link, and the next card's "Play preview" button. For each, report:
     - computed `outline-style`, `outline-width` and `box-shadow`;
     - the effective opacity (the product of ancestor opacities) after ≥ 400 ms;
     - the ring-vs-background contrast.
   - **Mouse:** click the search input and the sort select. Report the `data-focus-source` value and the computed outline.
   - **SfxVideoSync:** if `/scenes/pulse-loop-kit` renders it with the mock, Tab to "Choose video" and press Enter; Playwright's `filechooser` must fire. Measure the button's bounding box against the ref label box (the same page on the start copy) and report the delta. If a busy state can be reached, a click must not fire `filechooser`. Otherwise say so, and run B's harness pattern on the real component markup.
9. **Code review:** 3+ files change, so use the `code-reviewer` subagent. Pass its Architecture note to B verbatim. Fix Medium+ findings inside the grants.
10. **Write the deliverables:**
    - `a-round-202.md`;
    - `a-round-202/end-sha256.txt` (grants + new files);
    - `a-round-202/diff-vs-start.patch` (grants vs `b-round-201/r202-granted-start/`, new files in full).
    No commit, no push.

**STOP rules (L11).** STOP when any of these happens:
- a frozen test turns red;
- a step-2 count differs;
- a store control loses its only visible indicator and R96–R99 inside the grants cannot fix it;
- you need to edit a file outside the grants.

Write "STOP — needs B ruling on <id>" at the top of `a-round-202.md`, and leave the tree at the last consistent state. **The SfxVideoSync collision is ruled (R98). Do not STOP on it again.**

## 3. Baseline B measured at HEAD (facts, not acceptance; C re-measures)
- **Focus inventory** (`b-round-200/out/focus-inventory.json`): store 155 tokens in 31 files.
- **Hidden-focusable scan:** 6 sites (§0).
- **Keyboard probe** on `/`, mock on :5199 (`b-round-201/out/hidden-focus-probe-head.json`): Tab ×120 with a 900 ms settle after each press. All 7 product-card "Play preview" buttons are focused at effective opacity 0 at both 1280×720 and 1440×900, and again on every lap.
  - At 1280 only, "Browse the Collection" was at effective opacity 0 on both probe runs (Tab indices 26/27 with the 900 ms settle). It did not show at 1440. The cause is unconfirmed: it is probably a scroll-reveal animation still running. C checks it after a longer settle (≥ 2 s). If it still holds, it is the same class as B-R201-PRODUCTCARD-HIDDEN-PREVIEW (Medium, pre-existing). It is recorded under RING-VISIBLE's "listed with its ref result" clause and does not fail the row in this round. B schedules it.
- **Round 201's sticky probe** (`b-round-200/out/sticky-probe*.json`): 3 inputs on `/store` draw a double indicator. 0 elements are obscured by the sticky header.
- **Scratch copy** (R94 sweep + R98 + R99; R93/R95/R96 not applied):
  - inventory 16/6;
  - 27 test files (336 tests) green;
  - tsc clean;
  - Biome on SfxVideoSync, ProductCard and VideoShowcase: only the 3 existing `useButtonType` warnings in VideoShowcase, unchanged.
  - The round-200 B scratch run had already shown copy 1 (the R94 sweep, full suite green) and copy 2 (R93 + R95: 58 tests green).

## 4. C — what to verify
- Write `c-round-202.md` and `c-round-202.json` as you go.
- Start the mock (`node mock-api/server.mjs`) on :5199, and stop it at the end.
- **Ref:** HEAD `5b1a2bb` as a scratch copy, with the 31 grants restored from `b-round-201/r202-granted-start/` and the 3 new files removed, checked against the frozen list. Serve it on a separate port with its own `cacheDir`.
- **Viewports:** 1440×900 and 1280×720; also 375×812 where a row says so.
- **Keyboard focus** means a real Tab/Shift+Tab sequence. **Pointer** means a real mouse click.
- **Crops and opacity:** take them only after transitions settle (≥ 400 ms; ProductCard's overlay uses `duration-300`).

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SCOPE-202** | Frozen list (1001) at C's start and end; A's `end-sha256.txt`; `git status`; each grant's diff vs its start copy. | `git status` shows ` M` on granted paths only and `??` on the 3 new files. The 26 sweep files other than SfxVideoSync remove only R94 tokens (plus listed R97). `SfxVideoSync.tsx` is R94 + exactly the R98 shape. `ProductCard.tsx` is R96 + the one R99 token. `app.css` is R95 only. `StudioWorkspace.tsx` is only the 2 R93 lines, and `root.tsx` only the R93 import and call. Protected files, `Header.tsx`, `VideoShowcase.tsx`, `Modal.tsx` and `.claude/**` are unchanged. | Any other change. |
| **KEY-RING** | Pages: `/`, `/store`, one `/products/:handle` (mock), `/support` (chat open, guest form), `/free-downloads`, `/gift-cards`, `/hire-us` and `/cart`, plus the ⌘K palette, the LeadMagnet popup and the cookie banner, at 1440 and 1280. Also `/` and the mobile menu at 375. Tab through every tabbable element and record the computed outline and box-shadow. | Every focused element: outline solid and brass, ≥ 1px painted, offset 2px (or −2px where R97 is listed). `box-shadow` equals its unfocused value (no ring, no glow). The focused element's own background and border do not change. One band per element. R99's parent overlay reveal is allowed. | A second band, a glow, a fill or border change on the focused element itself, or a focusable element without an outline. |
| **RING-VISIBLE** | For each KEY-RING element, crop a screenshot around it, count brass pixels per side, and record the effective opacity. Compare with ref. | A ring shows on ≥ 3 sides of every element at effective opacity 1, or the element is listed with its ref result. An element whose only indicator showed in ref and does not show in the tree is a regression. | A lost indicator (Medium, WCAG 2.4.7). Pre-existing clipping that stays clipped is a new Low: it is recorded and does not fail the row. |
| **HIDDEN-FOCUS (R99)** | `/` and `/store` at 1440 and 1280: Tab to each product card's "Play preview" button. At 375: the mobile overlay button. Same in ref. | Ref: effective opacity 0 (confirms B's probe). Tree: overlay effective opacity 1 while the button has focus; ring visible on the button, ≥ 3:1. Tab away and the overlay returns to opacity 0. Mouse hover behaves as in ref. 375: unchanged from ref. | The button is still invisible on focus, the overlay stays visible after focus leaves, or 375 changed. |
| **CHOOSE-VIDEO (R98)** | First try `/scenes/pulse-loop-kit` with the mock at 1440 and 1280. If SfxVideoSync renders there: Tab to "Choose video", check the ring, and record `filechooser` on Enter, Space and mouse click (a fresh page per method). Shift+Tab/Tab must not stop on an invisible element. If it does not render: run the same three activations on a harness page that loads the built component's markup, and mark the in-app row BLOCKED "backend unavailable in cloud". | The ring paints on the button (≥ 1px, ≥ 3:1). Each of the 3 activations fires `filechooser`. No invisible tab stop. The visible box matches the ref label box (±0 px) when rendered in-app. | No ring, an activation that does not open the chooser, or an invisible tab stop. |
| **CSS-CONTROLS** | Keyboard-focus the global AudioPlayer progress and volume sliders (start a preview on `/store` or a product page), the `/store` sort select and the ⌘K palette input. Same in ref. VideoShowcase is excluded (R100: never rendered). | Ref: no outline, confirming the R95 cause. Tree: ring visible, contrast ≥ 3:1. | No ring in the tree. |
| **CARD-RING (C-R196-03)** | The `/` "Latest" product card link and one `/store` card, keyboard focus, at 1440, 1280 and 375. | The ring is visible around the card image box and follows its radius; ≥ 3:1. The card and grid boxes are identical to ref (±0 px). | No ring, or a layout change. |
| **CONTRAST** | Ring vs the adjacent background for each KEY-RING element: the page `background`, `surface`/`card` panels, the LeadMagnet popup, the chat panel, brass pill buttons and the R99 overlay scrim. | ≥ 3:1 everywhere (WCAG 1.4.11 / 2.4.11). | Any ratio < 3:1. |
| **POINTER** | Mouse-click the search input, a Button, the sort select, a header nav link, the newsletter field and a product card. Then press Tab once. | After the click: `html[data-focus-source="pointer"]` and no painted outline. After Tab: `keyboard`, and the ring shows on the next element. On a fresh load with no input yet, the first Tab shows the ring. | A ring after a mouse press, or no ring after Tab. |
| **STUDIO-NEIGHBOUR** | `/studio-lab` at 1440 and 1280: repeat the stage-1 checks on 6 controls (Play, Volume fader, Pan, library search, a marker flag, the tempo field), keyboard and mouse. Then client-navigate `/studio-lab` → `/` (the CZABA link) and `/` → `/studio-lab`. | The same ring as ref on all 6 (one band, ≥ 3:1, inset where it was inset), and no ring after a mouse press. After each navigation the attribute is still set and keeps updating (the stage-1 "null after navigation" state is gone). | Any Studio difference from ref, or the attribute lost after navigation. |
| **NO-SHIFT** | Element boxes of headers, nav, cards, fields and buttons on `/`, `/store` and `/support` in the unfocused state, tree vs ref, at 3 viewports. | ±0 px. | Any box moves. |
| **ERROR-BORDER** | One invalid field on `/support` (guest form) or `/hire-us`, focused and unfocused. | The error border (`border-destructive`) shows in both states. | The error border is lost. |
| **KEEP-LIST** | The LeadMagnet "FREE DOWNLOAD" popup, the Free Samples nav link, SpecialOffers and the "Limited" badges. | Present, with unchanged text. | Removed or reworded. |
| **BLOCKED-AUTH** | `/account` (name fields), `/account/downloads` (DownloadDialog), `app/components/studio/*` under `/studio/:id`, the Header user menu, and `/recordings/:id` and `/scenes/:id` if the mock cannot render them. | Recorded under `"blocked"` with "backend unavailable in cloud". Their code is covered by STF2/STF6. Not PASS, not FAIL. | — |
| **T-RUN-202** | On a scratch copy: the two new suites green; on the start copy, STF2/STF3/STF4/STF6 red. Run A's 8 mutants plus 2 of C's own, for example `focus:border-brand` back on `GuestForm`, and `useFocusSourceAttribute` called twice. | Each mutant turns its row red. | A mutant stays green. |
| **AN-REVIEW-202** | Added lines: 0 `as`, `any` or `@ts-ignore`; 0 hex or colour functions in `.tsx`. Doc 160 is in Georgian and covers R92–R100, options (a)–(d) and the measured C-R196-03 cause. | True. | Otherwise. |
| **G202-3** | Fresh anonymous context, both viewports: the `/studio-lab` workspace + demo badge; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `GET /api/studio-token` with no header → 401, with a fake Bearer → 403. | As stated. | Any bypass is Critical. |

- **Gate rows** (`"gate"`, never in `"passed"`): full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED.
- **`browserVerified`:** true only if every browser row above that can run here was run. BLOCKED-AUTH rows, and the in-app half of CHOOSE-VIDEO when it does not render, do not make it false.
- **Consults (optional):** `accessibility-auditor` and `design-auditor` on screenshots. A disagreement is a finding, not an edit.
- **Probe first (L17, L19):**
  - the inputs inside panels (chat, LeadMagnet, ⌘K);
  - cards inside `overflow` containers at 1280×720;
  - the R99 overlay;
  - the "Browse the Collection" link at 1280 after ≥ 2 s settle (§3).

## 5. Neighbour risk
- **Studio:** the R93 mount move is the only Studio change. If the attribute is not set when Studio mounts, mouse presses in Studio show rings again. STUDIO-NEIGHBOUR covers this.
- **SfxSceneBuilder video flow (R98):**
  - The `change` path is unchanged, and the frozen `sfx-video-transport` test pins it.
  - The flex row (`justify-between`) is unaffected, because a `hidden` input takes no space.
  - Programmatic `input.click()` on a `display:none` file input opens the chooser in Chromium (B's harness).
- **ProductCard (R99):** with hover, the overlay behaves as before. The nested button-inside-link structure is pre-existing and not touched.
- **The protected purchased Studio** (`/studio/:id`) renders `app/components/studio/*`. Their ring changes can't be tested in a browser here (BLOCKED-AUTH). A changes nothing in them except R94 tokens.
- **Error states:** removing `focus:border-destructive` must leave the base `border-destructive` in place (ERROR-BORDER).
- **STORE-2b and later** will restyle the same components and must keep STF green. That is a future constraint, not this round's work.

## 6. Outcome, fixed in advance
| C result | B at round-203 planning |
|---|---|
| All rows PASS | SABA-B-4 is complete, and GLOBAL-FOCUS-VISIBLE-UNLAYERED, C-R196-03 and B-R200-HIDDEN-FOCUSABLE-GAP close. Round 203 = **B-R201-HEADER-USERMENU-KEYBOARD** (Medium, a small bounded task; the browser half is BLOCKED-AUTH, the static/jsdom half is testable). Then SYS-1, SYS-2, SYS-3, then STORE-2b. The frontend-architect checkpoint request goes to root at this feature boundary. |
| A store FAIL (Medium+) | Round 203 = a bounded fix-up of those rows only (2026-10-23 bug gate). New Lows go to `deferred_low_polish`. |
| A STOP | B rules (L10) before anything is re-dispatched. C runs the short round (L22). |
| SCOPE-202 fails | Root inspects; nothing is published. |

## 7. Deliverables and root notes
- **A:** `a-round-202.md`, `a-round-202/end-sha256.txt`, `a-round-202/diff-vs-start.patch`, and the 3 new files.
- **C:** `c-round-202.md` and `c-round-202.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), with evidence under `c-round-202/`.
- **Root:** on C PASS, publish the 31 granted paths and the 3 new files against `5b1a2bb`. The loop state commit includes `retros/retro-200.md` (§10 wording), `lessons.md`, `b-round-201/` and `tasks/round-201.md`.
- **Pending and non-blocking:** the frontend-architect checkpoint request (`b-round-197.md` §6 + ARCH-R198-FOCUS-REGION). It is repeated at this feature boundary in `b-round-201.md` §6.
