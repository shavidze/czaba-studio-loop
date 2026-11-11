COMMIT: OK

I read the diff and the new files. I also grepped the tree for remaining uses of the glow tokens, `isHovered`, `BRAND_COLOR` and `justAdded`. I did not run the app or any tests. That means I did not check real-browser event ordering, and the gate results (c-round-453 PASS, verify.log) are taken as reported.

The round removes the teal glow from the store. It deletes the `--shadow-glow` and `--shadow-glow-accent` tokens and every glow `box-shadow`, and it turns `.button-primary` into a flat brand fill. It adds a test (`store-glow-shadow.test.ts`) and an implementation doc.

**Findings, ranked**

1. **Low – `app/components/product/PurchaseHeader.tsx:426`.** This is the one touch of a purchase-area file. It removes only the `justAdded` glow class from `CartButton`'s className. There is no handler, cart or checkout logic change, and `justAdded` is still used at lines 279, 347, 420 and 433, so there is no unused state. The change is cosmetic and listed as granted in the new test, so I don't treat it as a block. If root reads "none" literally for any purchase-component file, split this hunk out. No fix is needed otherwise.

2. **Low – `app/components/studio/GlobalPlayhead.tsx:42`.** It still uses `bg-brand shadow-glow`. With the token gone, Tailwind v4 generates no `shadow-glow` utility, so the playhead silently loses its glow. The new test allow-lists this as frozen legacy Studio. Check visually that the playhead is still legible without the glow. Later, drop the class when the legacy Studio is removed.

3. **Low – `app/components/ui/IconButton.tsx:39`, `app/components/chat/ChatButton.tsx:25`, `app/components/home/VideoShowcase.tsx:99`.** These still name `shadow-glow`. The test records them as dead components, and the class is now inert. Delete them together with the dead components so the allow-list shrinks.

4. **Low – `app/styles/app.css:408-416` (UX).** Hover on `.btn-primary` used to change opacity and glow, and now it only changes the background to `brand-hover`. Check that the contrast between `brand` and `brand-hover` is visible enough on dark backgrounds. The `:active` opacity 0.8 remains, so press feedback is unchanged.

5. **Info – `app/styles/app.css:2269-2275`.** Other brand-tinted `box-shadow` rules remain, and the line 210 pulse keyframes have the same kind of glow. They are outside this round's grant. The GS4 zero-offset scan covers only the granted files.

**What I checked and found clean**
- **Dead code in `store.tsx`:** after the hover-glow div is removed, `isHovered` and `BRAND_COLOR` are still used elsewhere in `PackCard`, so there are no unused variables. The removed element was `pointer-events-none`, so no hit-testing changes. No listeners or timers were added or removed.
- **Tokens:** `--color-brand-foreground` exists (`app.css:65`). The raw colors replaced in `.button-primary` are gone, and the new test checks that no teal remains in the primary button rules.
- **TypeScript and Tailwind:** no `any` or assertions, no new custom CSS, and the diff removes hardcoded colors. The test uses `// @vitest-environment node` and the shared helpers.
- **Auth and download:** untouched. The changes involve no secrets, no `dangerouslySetInnerHTML` and no network code.
- **Accessibility:** focus styles are not changed. The `Button` primary variant keeps `shadow-sm`.

**Architecture note**
- Signal: `app/styles/app.css` (about 3,900 lines, with the `:root` token block duplicated around lines 65 and 3885) and the repeated STORE-2b rounds on the same styling region. Keep it for now. This round only deletes code, and the duplicated brand-foreground declaration is covered by the token tests.
- Proposal for the planner: one bounded task to delete the dead `shadow-glow` components (`IconButton`, `ChatButton`, `VideoShowcase`) and the frozen `GlobalPlayhead` class, then shrink `RETIRED_UTILITY_ALLOW_LIST` to empty.
- This is a note on the diff only, not an audit of the module.

### Score: 8/10