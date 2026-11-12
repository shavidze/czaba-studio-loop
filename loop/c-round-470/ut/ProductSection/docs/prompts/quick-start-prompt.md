# Quick Start Prompt - Copy & Paste Ready

## მინიმალური Prompt (Core Features)

```
Build a [PRODUCT_TYPE] e-commerce store called [BRAND_NAME].

Tech: Remix 2 + React 18 + TypeScript + Tailwind CSS v4 + Shopify Storefront API

Features:
1. Product catalog with collections, filtering, search
2. Product pages with gallery, variants, add-to-cart
3. Shopping cart (drawer style, persistent)
4. Auth: Shopify Customer API for email/password, Firebase Auth for Google/Facebook social login
5. User account: profile edit, password change (email users only), order history
6. GA4 analytics with cookie consent

Design: Dark theme, primary color [HEX], [FONT] font, minimal/premium style
Mobile-first responsive, Framer Motion animations

Structure the project with:
- /app/components (auth, cart, product, ui, layout)
- /app/contexts (Auth, Cart, Toast)
- /app/hooks (useAuth, useCart, useToast)
- /app/lib (shopify API, auth functions, firebase)
- /app/routes (pages)
- /app/styles/app.css (@theme design tokens)
```

---

## სრული Prompt (All Features)

```
Create [BRAND_NAME] - a premium [PRODUCT_TYPE] e-commerce platform.

## Stack
- Remix 2.x + React 18 + TypeScript (strict mode)
- Tailwind CSS v4 with @theme design tokens
- Shopify Storefront API (GraphQL)
- Hybrid Auth: Shopify Customer API + Firebase Auth
- Firebase Firestore for user backups
- Framer Motion for animations

## Design System
Theme: Dark cinematic
Colors: background #080a0c, surface #111318, brand [PRIMARY_HEX]
Font: [FONT_NAME]
Border radius: rounded-xl default
Animations: subtle, Apple-style micro-interactions

## Auth Architecture
- Email/Password → Shopify Customer API directly
- Social (Google/Facebook) → Firebase popup → create Shopify customer with password "{Provider}_{FirebaseUID}"
- Store in localStorage: { user, accessToken }
- registrationSource field to track auth method

## Required Pages
1. Homepage - Hero, featured products, collections preview
2. /collections/:handle - Grid/list view, filters (price, tags), sort
3. /products/:handle - Gallery, variants, specs, add-to-cart, related
4. /cart - Full cart page OR drawer
5. /account - Profile (name editable, email readonly), password change (email users), logout
6. /account/orders - Order history from Shopify
7. /account/downloads - If digital products

## Components Structure
```
components/
  auth/ - AuthModal, SignInForm, SignUpForm, ForgotPassword, RequireAuth
  cart/ - CartDrawer, CartItem, CartSummary, AddToCartButton
  product/ - ProductCard, ProductGallery, VariantSelector, PriceDisplay
  layout/ - Header, Footer, MobileNav
  ui/ - Button, Input, Modal, Toast, Skeleton
```

## Key Functionality
- Persistent cart (localStorage + Shopify Cart API)
- Optimistic UI updates
- Form validation with error messages
- Toast notifications for actions
- Loading skeletons
- SEO meta tags
- Structured data for products

## Analytics
- GA4 with Consent Mode v2
- Events: page_view, view_item, add_to_cart, begin_checkout, purchase
- Cookie consent banner (GDPR)

## GraphQL Queries Needed
- GET_PRODUCTS, GET_PRODUCT_BY_HANDLE
- GET_COLLECTION, GET_COLLECTIONS
- CART_CREATE, CART_ADD, CART_UPDATE, CART_REMOVE
- CUSTOMER_CREATE, CUSTOMER_LOGIN, CUSTOMER_UPDATE

## Env Vars
SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN
VITE_FIREBASE_* (client), FIREBASE_* (admin)
VITE_GA_MEASUREMENT_ID
```

---

## Industry Modifiers

დაამატე ერთ-ერთი ამათგანი prompt-ის ბოლოს:

### Music/Audio
```
Additional: WaveSurfer.js audio preview, waveform visualization, BPM/key metadata, instant download system, license selection (Standard/Extended)
```

### Fashion
```
Additional: Size guide, color swatches, zoom gallery, wishlist, stock alerts, recently viewed
```

### Digital Products
```
Additional: Download manager, license keys, usage limits, subscription support
```

### Food
```
Additional: Allergen info, nutrition facts, delivery scheduling, subscription boxes
```

---

## Prompt ფორმულა

```
Create [NAME] - [TYPE] e-commerce.
Stack: [TECH]
Design: [THEME], [COLOR], [FONT]
Features: [CORE] + [INDUSTRY_SPECIFIC]
```

### მაგალითი:

```
Create CZABA - premium drum samples e-commerce.
Stack: Remix + Tailwind v4 + Shopify API + Firebase Auth
Design: Dark cinematic, cyan #13ecda, Inter font
Features: Product catalog, cart, hybrid auth, user account, order history, GA4 + Audio preview with waveforms, BPM/key display, instant downloads
```
