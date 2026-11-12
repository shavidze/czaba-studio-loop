# Changelog - Important Changes

## 2026-01-09

### Legal Pages (Termly-Style)
**სრული legal compliance გვერდები:**

**ახალი/განახლებული Routes:**
- `app/routes/privacy.tsx` - სრული Privacy Policy (GDPR, CCPA, US States)
- `app/routes/terms.tsx` - Terms of Service (Dispute Resolution, Arbitration)
- `app/routes/cookies.tsx` - Cookie Policy
- `app/routes/faq.tsx` - FAQ გვერდი

**Privacy Policy სექციები:**
- Summary of Key Points
- Information Collection (Personal, Payment, Social Login, Automatic)
- Legal Bases (GDPR: Consent, Contract, Legitimate Interests)
- Third-Party Sharing (Brevo, Firebase, GA4, FB Pixel, Shopify, Vercel, Cloudflare)
- International Data Transfers (US servers, SCCs)
- US State-Specific Rights (California CCPA + 15 states)

**Terms of Service სექციები:**
- User Representations
- Prohibited Uses (expanded)
- Dispute Resolution (30-day informal + arbitration in Georgia)
- Limitation of Liability (amount paid)
- Term and Termination

**Environment Variable:**
- `VITE_TERMLY_PRIVACY_POLICY_URL` - Termly iframe embed (optional, fallback to static)

---

### CollapsibleSocialLinks Component
**Expandable social links with brand colors on hover:**

**ახალი კომპონენტი:** `app/components/ui/CollapsibleSocialLinks.tsx`

**ფუნქციონალი:**
- მინიმალისტური trigger ღილაკი
- Hover-ზე გაშლა Framer Motion ანიმაციით (300ms)
- Instagram gradient on hover (#FFD600 → #7638FA)
- YouTube red (#FF0000)
- Facebook blue (#1877F2)

**განახლებული ფაილები:**
- `app/lib/constants.ts` - SOCIAL_LINKS centralized (instagram, youtube, facebook)
- `app/components/icons/SocialIcons.tsx` - InstagramIcon (gradient prop), YouTubeIcon, SocialIcon
- `app/components/icons/index.ts` - exports განახლებული
- `app/components/layout/Footer.tsx` - 4 column → 3 column + CollapsibleSocialLinks
- `app/components/home/ArtistBioSection.tsx` - Twitter → Facebook

**Footer Layout:**
```
CZABA                    [●] ← hover → [●][IG][YT][FB]
Cinematic Sound Design...

Products    Support     Legal
```

---

## 2026-01-03

### Facebook Pixel Integration
**Facebook/Instagram რეკლამებისთვის და retargeting-ისთვის:**

**ახალი ფაილი:**
- `app/lib/facebook-pixel.ts` - Facebook Pixel wrapper ფუნქციები

**თრექირებული Events:**
- `PageView` - ყველა გვერდზე (ავტომატურად)
- `AddToCart` - კალათაში დამატება
- `InitiateCheckout` - "Buy Now" დაჭერა
- `Lead` - Newsletter გამოწერა
- `CompleteRegistration` - ახალი ანგარიშის შექმნა
- `PlayButtonClicked` (custom) - მუსიკის მოსმენა
- `StudioOpened` (custom) - Studio გახსნა

**ინტეგრირებული კომპონენტები:**
- `root.tsx` - Facebook Pixel script loading
- `AudioPreviewButton.tsx` - play tracking
- `PurchaseHeader.tsx` - AddToCart & InitiateCheckout
- `studio.$productId.tsx` - StudioOpened
- `useAnalytics.ts` - hook განახლებული FB Pixel-ით

**Environment Variable:** `VITE_FB_PIXEL_ID`

---

### Google Analytics 4 (GA4) Integration
**მომხმარებლის ქცევის ანალიზის ინსტრუმენტი:**

**ახალი ფაილები:**
- `app/lib/analytics.ts` - GA4 wrapper ფუნქციები და event tracking
- `app/hooks/useAnalytics.ts` - React hook კომპონენტებში გამოსაყენებლად
- `app/components/common/CookieConsent.tsx` - GDPR cookie consent banner
- `docs/technical/features/analytics-ga4.md` - დეტალური დოკუმენტაცია

**თრექირებული Events:**
- `play_button_clicked` - მუსიკის მოსმენა
- `add_to_cart` - კალათაში დამატება
- `begin_checkout` - "Buy Now" დაჭერა
- `studio_opened` - Personal Mixdown Studio გახსნა

**ინტეგრირებული კომპონენტები:**
- `AudioPreviewButton.tsx` - play tracking
- `PurchaseHeader.tsx` - add_to_cart & begin_checkout
- `studio.$productId.tsx` - studio_opened
- `root.tsx` - GA4 script loading

**Measurement ID:** `G-C1SGC7W3WV`

---

## 2026-01-02

### 3D Product Box Visualization
**Premium 3D rendered product boxes for Store and Product pages:**

User provided professional 3D rendered product box mockups (gold, silver, copper variants) for CZABA brand.

**Files:**
- `public/images/packs/1.png` - Gold 3D box
- `public/images/packs/2.png` - Silver 3D box
- `public/images/packs/3.png` - Copper 3D box

**Integration:**
- `app/routes/store.tsx` - PackCard uses 3D box images as fallback when product has no cover
- `app/components/product/ProductSidebar.tsx` - Uses Product3DBox component
- `app/components/product/Floating3DAlbum.tsx` - Simplified to display pre-rendered 3D images

**Store page sizing increased:**
- Grid: `max-w-6xl` → `max-w-7xl`
- Gap: `gap-16` → `gap-20 md:gap-24`
- Card padding: `py-8 px-10` → `py-12 px-12`
- Title: `text-lg` → `text-xl`
- Price: `text-lg` → `text-xl`

---

### Cart Remove Confirmation Modal
**Added confirmation dialog before removing items from cart:**

- Modal styled to match AuthModal (premium dark theme)
- Uses Tailwind design tokens: `bg-background`, `border-outline`, `text-muted`, `text-foreground`
- ESC key closes modal
- White "Remove" button (monochrome palette)

**File:** `app/routes/cart.tsx` - Added `ConfirmRemoveModal` component

---

### Buy Now Authentication Requirement
**Updated Buy Now to require authentication:**

- If user not authenticated, shows toast message and opens sign-in modal
- Prevents checkout without account

**File:** `app/components/product/PurchaseHeader.tsx`

---

### Cleanup
**Removed unused code:**
- Removed `float-slow` keyframes animation from `app/styles/app.css` (was for floating 3D effect that wasn't used)
- Removed `.animate-float-slow` utility class

---

## 2025-12-28

### Filmcrux-Inspired SFX Collection Page
**New dark, cinematic design for Sound Effects collection:**

Based on Filmcrux.com design philosophy - "Cinematic Dark Premium" aesthetic.

**New Components:**
- `app/components/sfx/SFXHero.tsx` - Hero section with 3D stacked mockup effect
- `app/components/sfx/SFXPackCard.tsx` - Dark pack cards with hover effects and preview button
- `app/components/sfx/index.ts` - Export barrel

**Route Updated:**
- `app/routes/collections.sfx.tsx` - Complete redesign with:
  - Full-height hero with gradient overlays
  - Category filter pills
  - Pack grid with cinematic styling
  - Custom CTA section

---

### FX-Specific Product Detail Components
**New components that appear ONLY on Sound Effects products:**

**New Components:**
- `app/components/product/fx/FXPackFeatures.tsx` - Stats grid (sound count, format, royalty status)
- `app/components/product/fx/FXSoundPreviewGrid.tsx` - Click-to-play sound preview grid
- `app/components/product/fx/FXWhatsIncluded.tsx` - File specs and compatibility info
- `app/components/product/fx/index.ts` - Export barrel

**Integration:**
- `app/components/product/ProductDetailPage.tsx` - Added conditional FX sections
  - Checks `product.productType === 'Sound Effects'`
  - Renders FX components only when product is SFX type

---

### SFXAsset Type Updates
**Extended type for SFX products:**

```typescript
// app/types/asset.ts
export interface SFXAsset extends BaseAsset {
  type: 'sfx';
  category: string;
  tags: string[];
  price: string;           // NEW: Display price
  soundCount?: number;     // NEW: Number of sounds in pack
  previewUrl?: string;     // NEW: Audio preview URL
}
```

**Mapper Updated:**
- `app/lib/shopify.mappers.ts` - `mapShopifyToSFXAsset()` now extracts:
  - `price` from `priceRange.minVariantPrice.amount`
  - `soundCount` from `custom.sound_count` metafield
  - `previewUrl` from `custom.audio_preview_url` metafield

---

## 2025-12-27

### Piano Curtain Loader Animation
**New elegant intro animation for homepage:**

- Animation shows once every 5-7 hours (tracked via localStorage)
- **Phases:**
  1. Growing (1.8s) - Piano keys grow from top to bottom
  2. Holding (1.2s) - CZABA logo appears
  3. Cracking (0.8s) - Horizontal crack lines appear on each key
  4. Falling (2.5s) - Keys break into 2 pieces and fall gracefully

**File:** `app/components/loading/PianoCurtainLoader.tsx`

---

### Product Section Background Glow
**Added same background glow effect as Newsletter section to Latest Releases:**

- Reused `newsletter-bg-glow` and `newsletter-center-glow` classes
- Added `position: relative` and `overflow: hidden` to `.product-grid-section`

**Files:**
- `app/components/home/ProductSection.tsx`
- `app/styles/app.css`

---

### Studio Loop Region Mask
**Waveform areas outside loop are now dimmed:**

- Semi-transparent overlay (`rgba(23, 23, 23, 0.75)`) covers areas before and after loop
- Waveform progress coloring only visible within loop region
- Click-to-seek on waveform added

**Files:**
- `app/components/studio/StudioTrack.tsx`
- `app/components/studio/TransportBar.tsx` - Simplified seek zone (removed drag-to-zoom)
- `app/contexts/StudioContext.tsx` - Fixed stop button bug, setTimeSelection interface

---

## 2024-12-27

### Studio Ableton-Style UX Improvements

**Added comprehensive DAW-like interactions to the Studio:**

#### Phase 1: Keyboard Shortcuts
```
Space         - Play/Pause
Enter         - Stop
← / →         - Seek 1s (Shift for 5s)
Home / End    - Go to Start/End
+ / -         - Zoom In/Out
0             - Reset Zoom
G             - Toggle Snap Grid
X             - Toggle Split Mode
M / S / L     - Mute/Solo/Loop selected
Ctrl+A        - Select All
Escape        - Deselect All
Ctrl+Z        - Undo
Ctrl+Shift+Z  - Redo
?             - Show Shortcuts Panel
```

#### Phase 2: Multi-Selection System
- **Click** - Select single track
- **Ctrl+Click** - Toggle selection (add/remove)
- **Shift+Click** - Range select
- Batch actions on selected tracks (M/S/L)

#### Phase 3: Snap to Grid
- Toggle with `G` key
- Configurable grid sizes (0.25s, 0.5s, 1s, 2s, 4s)
- Shows "Snap: Xs" indicator in toolbar

#### Phase 4: Undo/Redo System
- History tracking for mute, solo, loop, volume, trim changes
- Up to 50 entries in history
- Ctrl+Z / Ctrl+Shift+Z or Ctrl+Y

#### Phase 5: Visual Feedback
- Selected tracks have teal border and highlight
- Selection count badge in toolbar
- Snap status indicator
- Keyboard shortcuts panel (press ? or click keyboard icon)

**Files Modified:**
- `app/contexts/StudioContext.tsx` - Added selection, history, snap state + keyboard handler
- `app/components/studio/StudioTrack.tsx` - Added selection click handlers and visual styles
- `app/routes/studio.$productId.tsx` - Added shortcuts panel, status indicators
- `app/types/studio.ts` - Added SelectionMode, HistoryEntry, SnapSettings types

---

## 2024-12-26

### Shopify Hydrogen Dependencies Removal
**Problem:** Vercel build failing and dependency conflicts

**Root Cause:** Project had `@shopify/hydrogen`, `@shopify/cli-hydrogen`, `@shopify/remix-oxygen` packages installed, but we only use Shopify Storefront API (not Shopify Oxygen hosting). These packages were causing conflicts and were unnecessary.

**Files Changed:**

1. **`package.json`** - Removed dependencies:
   - `@shopify/cli-hydrogen`
   - `@shopify/hydrogen`
   - `@shopify/remix-oxygen`
   - `@shopify/oxygen-workers-types` (devDependencies)

2. **`app/routes/products.$handle.tsx`**
   - Changed `import { createShopifyClient } from '~/lib/shopify.server'`
   - To `import { getStorefrontClient } from '~/lib/storefront.server'`
   - `getStorefrontClient()` uses simple `fetch()` - no Hydrogen dependency needed

3. **Deleted:** `app/lib/shopify.server.ts` (was using `@shopify/hydrogen`)

**Lesson:** Shopify Storefront API can be used with plain `fetch()`. You don't need `@shopify/hydrogen` unless you're deploying to Shopify Oxygen.

---

### WaveSurfer.js SSR Fix
**Problem:** `ERR_MODULE_NOT_FOUND: Cannot find module 'wavesurfer.js/dist/plugins/regions.esm.js'` on Vercel

**Root Cause:** `wavesurfer.js` is a browser-only library. When imported at the top level of a component, Vite bundles it into the server build, but it fails at runtime because it requires browser APIs (DOM, Web Audio).

**Files Fixed:**

1. **`app/components/studio/StudioTrack.tsx`**
   ```tsx
   // BEFORE (breaks SSR):
   import WaveSurfer from 'wavesurfer.js';
   import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

   // AFTER (works with SSR):
   import type WaveSurfer from 'wavesurfer.js';
   import type RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

   useEffect(() => {
     // Dynamic import inside useEffect - runs only on client
     const initWaveSurfer = async () => {
       const [WaveSurferModule, RegionsModule] = await Promise.all([
         import('wavesurfer.js'),
         import('wavesurfer.js/dist/plugins/regions.js'),
       ]);
       const WaveSurfer = WaveSurferModule.default;
       const RegionsPlugin = RegionsModule.default;
       // ... use them here
     };
     initWaveSurfer();
   }, []);
   ```

2. **`vite.config.ts`** - Added to ssr.external:
   ```ts
   ssr: {
     external: ['firebase-admin', 'wavesurfer.js'],
   }
   ```

**Lesson:** Browser-only libraries (WaveSurfer, Three.js, Canvas libs, etc.) must use:
- `import type` for TypeScript types (doesn't include runtime code)
- Dynamic `import()` inside `useEffect` for actual code (runs only on client)
- Add to `ssr.external` in Vite config as extra safety

---

### Vercel Configuration Simplified
**Problem:** Custom `api/server.js` approach wasn't working reliably

**Solution:** Use Vercel's native Remix support instead of custom serverless function

**Files Changed:**

1. **Deleted:** `api/server.js` folder entirely

2. **`vercel.json`** - Simplified to:
   ```json
   {
     "buildCommand": "npm run build",
     "installCommand": "npm install",
     "framework": "remix"
   }
   ```

**Lesson:** Vercel has built-in Remix support. Don't overcomplicate with custom serverless functions unless necessary.

---

### Hydration Fix
**Problem:** `Target container is not a DOM element` error on local dev

**Root Cause:** `entry.client.tsx` was looking for `#root` element that no longer exists after server entry fix.

**File Fixed:** `app/entry.client.tsx`
- Changed `hydrateRoot(document.getElementById('root')!, ...)` to `hydrateRoot(document, ...)`
- This is the standard Remix hydration approach

---

### Vercel Deployment Fix
**Problem:** `500: INTERNAL_SERVER_ERROR` - Serverless function crash on Vercel

**Root Cause:** Project was mixing Shopify Oxygen runtime (Cloudflare Workers) with Vercel's Node.js runtime.

**Files Fixed:**

1. **`app/entry.server.tsx`**
   - Was using `@shopify/remix-oxygen` types
   - Had broken HTML structure (Links, Scripts, ScrollRestoration used outside React tree)
   - Replaced with standard Remix streaming server entry for Node.js

2. **`app/root.tsx`**
   - Changed `LinksFunction` import from `@shopify/remix-oxygen` to `@remix-run/node`
   - Added missing `<html>` and `<body>` tags in Layout component

3. **Route files** - Changed imports from `@shopify/remix-oxygen` to `@remix-run/node`:
   - `app/routes/_index.tsx`
   - `app/routes/products.$handle.tsx`
   - `app/routes/collections.music.tsx`
   - `app/routes/collections.sfx.tsx`
   - `app/routes/collections.presets.tsx`

---

### ProductDetailPage Null Safety Fix
**Problem:** `Cannot read properties of undefined (reading 'id')` on `/products/santa-swings`

**Root Cause:** Some products missing `versions`, `licenses`, or `variants` data.

**File Fixed:** `app/components/product/ProductDetailPage.tsx`
- Added null checks for `selectedVersion` and `selectedLicense`
- Added optional chaining (`?.`) on all array accesses
- Conditional rendering - sections only show if data exists

---

## Notes

### Vercel vs Shopify Oxygen
- `@shopify/remix-oxygen` = Cloudflare Workers runtime (Shopify Oxygen)
- `@remix-run/node` = Node.js runtime (Vercel, traditional servers)

Always use `@remix-run/node` for Vercel deployments.

### Environment Variables Required on Vercel
```
SHOPIFY_STORE_DOMAIN
SHOPIFY_STOREFRONT_ACCESS_TOKEN
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```
