# product-designer consult: DPG-BUTTON-CLEANUP-2-NONBRAND (B round 506 -> 507, 2026-11-14)

Input: `b-round-506/scan-nonbrand-head.json` (58 tags at HEAD 3021b30) + LeadMagnet Close X by name = 59. Recorded from the consult's final answer (B's transcription; read-only consult, no files written by the agent).

## 1. Rulings (59)
**B: move onto Button (16).**
- account.reset l.150: accent lg, fullWidth.
- free-downloads l.319 (keep-list): primary lg pill.
- RecordingCatalogRow l.121 and SfxVideoSync l.35: secondary md + `min-h-11`.
- StemsPlayerModal l.153: secondary md.
- HeroSection l.138: secondary sm pill. Flagged as needing a variant (an overlay fill over the hero video), so it goes last.
- SpecialOffers l.37 and l.65 (keep-list): secondary lg through `buildButtonClassName`.
- ForgetPassword l.145 / l.152: accent sm / secondary sm.
- CookieConsent l.79: secondary sm pill (this removes the hardcoded `bg-white text-black`).
- PlayStemsButton l.18: secondary lg, fullWidth.
- ProductSidebar l.75: primary lg, fullWidth. **It has no onClick, so "Complimentary Download" does nothing.** That is a root issue, not a restyle.
- PurchaseHeader l.182 and l.224: secondary lg. The brand/accent outline is lost; Saba is asked whether an `outline` variant is wanted (default no).
- PurchaseHeader l.363 Buy Now: buy lg. Its `aria-disabled:` classes must come along: `isPriceUnknown` is not part of `isDisabled` (l.146).

**I: move onto IconButton (13).**
- AudioPlayer l.70: ghost sm.
- AudioPlayer l.83, l.117 and l.162: ghost md.
- StemsPlayerModal l.54: ghost md.
- ChatHeader l.28 and l.40: ghost sm.
- account l.254 and l.263: ghost sm.
- cart l.114 and l.123: default sm.
- cart l.136 Remove: ghost sm. The red hover is lost; keeping it needs a danger tone, a shared-primitive change.
- LeadMagnet l.150 (keep-list): ghost lg with a 24px X.

**Root (2).** studio.$productId l.348 and l.356 (protected): IconButton ghost sm. Recorded only, not edited.

**K: keep hand-rolled (28).** Each class is listed with its later home, a signal only.
- Selectable card (SelectableCard): gift-cards l.285, hire-us l.171, VersionSelector l.59, FXSoundPreviewGrid l.70.
- Filter row / disclosure (FilterOption + Disclosure): store l.227, l.246 and l.268.
- Nav card (NavCard): support l.93, l.106, l.119 and l.132.
- Menu row (MenuItem): Header l.154, l.161, l.168, l.176, l.270, l.277 and l.284.
- Tab (Tabs): SfxVideoSync l.114 and l.126.
- Accordion trigger (Disclosure): ProductAccordion l.19.
- Marker chip (Chip): SfxSceneBuilder l.834.
- Social-provider button (move SignIn/SignUp onto SocialAuthButtons): SignIn l.94 and l.114; SignUp l.101 and l.121; SocialAuthButtons l.19 and l.40.

**Scanner misses** controls that have no padding or no rounded corners:
- CookieConsent Decline l.73 and Close X l.88;
- the StemsPlayerModal play button l.92, which is also hardcoded `bg-white text-black`.

The cookie stage is therefore 3 tags.

## 2. Stages (by user visibility)
1. Global audio (AudioPlayer, StemsPlayerModal): 6 tags. Needs no primitive change if rounded-lg; circles need a `shape` prop.
2. Product page (PurchaseHeader ×3, PlayStems, Sidebar): 5 tags. **Purchase entry.**
3. Cookie banner (+2 missed tags): 3 tags. Needs a Saba decision on prominence.
4. Home (SpecialOffers ×2, LeadMagnet X): 3 tags.
5. Cart: 3 tags. **Purchase surface**; a danger tone is needed for Remove.
6. Auth/account (reset, account ×2, ForgetPassword ×2): 5 tags.
7. Free downloads + ChatHeader: 3 tags.
8. Recordings: 2 tags.
9. Hero mute: 1 tag; needs an overlay variant.

Any change to `IconButton.tsx` must update `store-focus-ring.test.ts`, `store-glow-shadow.test.ts` and `store-button-cleanup-2d` B2D-0/B2D-8.

## 3. Stage 1 detail
**Sizes.**
- Previous, Next and Mute become ghost md (40px, 20px icons). The row height does not change, because Play is 42px.
- Close becomes ghost sm (32px, X at 16px). It is absolutely positioned over the title column.

**Shape.**
- Keep `rounded-lg` (DESIGN_SYSTEM l.850: "Square buttons for icons only").
- Do not override it with `rounded-full` in className: there is no class merging.
- If Saba wants circles, add a `shape` prop to IconButton as its own stage.

**Close button.** Drop `hover:text-error` (closing is not destructive), `opacity-60` and `scale-110`. Ghost's `active:scale-95` is fine, but check the Close button's vertical position while pressed.

**Colour.** Previous, Next and Mute go from foreground to muted at rest, so Play becomes the dominant control.

**Tooltip.** Accept IconButton's `title`. Mute's tooltip follows its label.

**Stems modal.**
- The X becomes ghost md, and the error-state Close becomes secondary md.
- "Please try again" has no retry action; this is a question for Saba.

**States:** rest, hover (`bg-elevated`, text to foreground), press (scale-95), keyboard focus (shared ring), disabled: none, loading: Play only (out of scope), reduced motion (the scale still applies).

**Browser rows:**
1. The transport row height and Play's x-centre change by 0 px at 1440/1280/375.
2. Previous, Next, Mute and the Stems X are 40×40; Close is 32×32. Radius 8px.
3. Hover background = `--color-elevated` and text = `--color-foreground`. No rgba(255,255,255,0.1) remains.
4. The muted icon's contrast at rest is ≥ 3:1.
5. Tab shows the shared outline on all controls; a mouse click shows none.
6. At 375 px with the longest title, the title is not under the Close X.
7. Each control's aria-label equals its title, and Mute's label flips.
8. In the Stems error state, Close is secondary md and Esc still closes the modal.

## 4. Is stage 1 the right first?
Yes, if Saba accepts rounded-lg. If circles are required, ship the StemsPlayerModal pair plus ChatHeader first. Do not lead with the cookie banner: equal Accept/Decline weight changes consent rates, which is Saba's decision.

**Questions for Saba:**
- Player icon shape: rounded-lg or circles? Recommended: rounded-lg.
- Cookie Accept/Decline both secondary sm pill? Recommended: equal weight.
- An `outline` variant for the 3 brand-outline hits? Recommended: no.

## B's rulings on this consult (D-29z1829)
- **Stage N1 = AudioPlayer only (4 tags).** The StemsPlayerModal pair moves out, because `PlayStemsButton` renders only when the selected version has stems, and no mock fixture has stems (`mock-api/server.mjs` `includesStems`; the first SSR document request cannot be `page.route`-stubbed; stubbing a client-side navigation is not tried yet, D-29z1832). It waits for ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE. A browser row that can run must not be replaced by jsdom (V2).
- **Radius:** the consult wrote 8px, but Chromium measures `rounded-lg` = 12px in this theme (`probe/sketch/sketch.jsonl` radius). The task asserts 12px.
- **Row 1:** the consult wrote 0 px at 375, but the measurement is +4 px player height there (Mute row 36 → 40; `probe/head/layout.json` vs `probe/sketch/layout.json`). This is accepted as D5. At 1440/1280 the change is 0 px, and Play's centre is unchanged at all three widths.
- **ProductSidebar dead button:** filed as Medium B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD.
