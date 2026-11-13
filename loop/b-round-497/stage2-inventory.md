# DPG-BUTTON-CLEANUP-2: inventory and sub-stages (B, round 497 -> 498 planning, 2026-11-13)

**Scanner:** `b-round-497/scan-brand.py`, run at HEAD `5d12c75`. It scans token-level, over raw file text, so multi-line `cn()`, arrays and constants are covered.
- **Output:** `scan-head.json`, 121 `bg-brand` hits (any form, including `/NN` and variants) and 52 solid ones (bare `bg-brand`, no variant prefix, no opacity).
- **Scope:** every `app/**/*.tsx`, excluding `components/arrangement/`, `components/studio/` and `__tests__`.
- **Mutant proof** (`scan-mutant.txt`): adding a file with a multi-line array constant (`'bg-brand text-background'`) and a multi-line `cn()` holding `'hover:bg-brand/20'` raises the counts by +2 hits and +1 solid (118/49 on the sketch tree, against 116/48 without it).
- **Sketch tree:** 116/48. Five hits leave: the 4 solid primaries and the orders `hover:bg-brand/90`.

**Signature, stated honestly.** `bg-brand` only finds *brand-filled* hand-rolled buttons. Other hand-rolled buttons also break item 7 ("Use Button.tsx component only"). A record count (`other-handrolled-count.txt`, not mutant-proven) finds 30 `<button|Link|a>` with a literal className holding padding and `rounded` but no solid `bg-brand`, across 18 files. They are tracked as **DPG-BUTTON-CLEANUP-2-NONBRAND**. That is a counted follow-up, so the item is not narrowed silently.

## Classes and rulings (solid hits; the non-solid tints follow their element's class)
| Class | Sites (file:line at HEAD) | Ruling |
|---|---|---|
| A1 status-page CTA pairs and singles | checkout.cancel 43 (+ ghost partner 50), checkout.success 187 (+ ghost partner 194), faq 169, account.orders 238 | **Stage 2a = round 498.** Primary → primary/lg/pill; partner → ghost/lg/pill (product-designer, `consult-product-designer.md`) |
| A2 other route and section CTAs | store 355 ("Try again", error state), recordings.$productId 190 (sm, `min-h-11`), cart 162 (sm, `text-black`), ErrorBoundary 46 (`<a>`), EmptyState 63/70 (ui primitive), hire-us 279 (submit, w-full, pinned by ST5), free-downloads 284, NewsletterSection 84 (h-14 submit), StudioShowcase 155 (`px-8 py-4` Link) | **Stage 2b.** Each needs its own size ruling (sm/md/lg, fullWidth) and its ST5/test collisions handled. May be split 2b-1/2b-2 |
| A3 purchase-path CTAs | PurchaseHeader 191 / 231 / 293 | **Stage 2c.** Purchase protection: a click-still-works row against the mock API, buy/add-to-cart handlers unchanged, the `bg-buy` sibling untouched |
| A4 chat | GuestForm 96, ChatInput 82, ChatButton 20 | **Stage 2d.** The floating and icon send buttons are probably IconButton, not Button; product-designer rules at planning |
| A5 keep-list | LeadMagnetPopup 187 / 279 | **Stage 2e.** Restyle only (policy keep-list): copy, behaviour and the `bg-destructive` CONTINUE submit stay; the ST5 LeadMagnet pin is a row |
| B selected-state chips and toggles | store 311 / 328 (+ 253 / 273 tints), StemControl 23, RecordingCatalogRow 72, FXSoundPreviewGrid 82, VersionSelector 123 | **Not Button migrations.** These are segmented/toggle state paints (aria-pressed/selected). Recorded as SIG-R498-SELECTED-STATE-PAINTS, an input to DPG-COLOR-CONSOLIDATE. A Button `selected` API would be a new contract (product-designer question at that stage) |
| C non-button fills | account.tsx 51 / 68 / 85 (tab underline bars), scenes 152 (meter bar), free-downloads 162 (dot), ForgetPassword 79 (badge), RelatedTracksCarousel 101 (play disc inside a card), FXSoundPreviewGrid 103/107/111 (meter bars), Header 107 (cart count badge), Toast 19/37 (progress), StudioMockup 121/175, StudioShowcase 91, HeroSection 155 (dots), ChatMessage 25 (bubble) | **Not buttons: out of item 7.** No change |
| D ui primitives | Button.tsx 19, IconButton.tsx 36 | The owners. No change |
| E protected | studio.$productId 440 / 471 / 521, account.downloads 261 | **Never edited by the loop.** ROOT-REQ-DPG-BUTTONS-PROTECTED: root and Saba apply the same mapping outside the loop |
| F Studio | components/arrangement (17 hits) | Outside the Store block (Studio's own design, VISUAL-A). No change |

**account.tsx:** its 4 HEAD hits are three tab underline bars (class C) and one icon button, `p-1.5 text-brand hover:bg-brand/10` at l.259, which is a DPG-BUTTON-CLEANUP-2-NONBRAND / IconButton candidate. Stage 2a does not touch account.tsx. Under the D-29z1771 ruling line the account.tsx hold wins, so B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED stay deferred.
