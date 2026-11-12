# Genesis Prompt - E-Commerce Project Generator

> მასტერ-პრომპტი, რომელიც აგენერირებს სრულ premium e-commerce პროექტს ნულიდან.

---

## როგორ გამოვიყენოთ

დააკოპირე ქვემოთ მოცემული პრომპტი და შეცვალე `[PLACEHOLDERS]` შენი პროექტის მონაცემებით.

---

## 🚀 The Genesis Prompt

```markdown
# Project Genesis: [PROJECT_NAME]

შექმენი premium e-commerce პლატფორმა შემდეგი სპეციფიკაციით:

## 🎯 Brand Identity

**სახელი:** [PROJECT_NAME]
**ტიპი:** [PRODUCT_TYPE] (მაგ: Digital Music Store, Fashion Boutique, Course Platform)
**Tagline:** [ONE_LINE_DESCRIPTION]
**Target Audience:** [WHO_IS_THIS_FOR]

## 🎨 Design Philosophy

**ხედვა:** ჩვენ არ ვართ "[WHAT_WE_ARE_NOT]". ჩვენ ვართ "[WHAT_WE_ARE]".

მაგალითი: "ჩვენ არ ვართ აუდიო ფაილების სუპერმარკეტი. ჩვენ ვართ კურატორული გალერეა."

**Visual Identity:**
- **Theme:** [Dark/Light] - [MOOD_DESCRIPTION] (მაგ: cinematic, minimal, playful)
- **Primary Color:** [HEX_CODE] - [COLOR_NAME]
- **Secondary Color:** [HEX_CODE] (optional)
- **Typography:**
  - Headings: [FONT_NAME] (Serif/Sans-serif)
  - Body: [FONT_NAME]
- **Border Radius:** [Sharp/Rounded/Pill] (მაგ: rounded-xl)
- **Animations:** [Subtle/Dynamic] - Framer Motion

**Design Principles:**
1. **ნეგატიური სივრცე** - ბევრი "breathing room", არა cluttered
2. **ფოკუსირება** - თითო გვერდს ერთი მიზანი
3. **მიკრო-ინტერაქციები** - მდოვრე, Apple-style ანიმაციები
4. **სისწრაფე** - მყისიერი რეაქცია, lazy loading

## 🛠 Tech Stack

```
Framework:     Remix 2.x + React 18 + TypeScript (strict)
Styling:       Tailwind CSS v4 (@theme design tokens)
E-Commerce:    Shopify Storefront API (GraphQL)
Auth:          Hybrid - Shopify Customer API + Firebase Auth (social)
Database:      Firebase Firestore (backup/shadow)
Storage:       [Cloudflare R2 / AWS S3]
Hosting:       [Vercel / Cloudflare Pages]
Analytics:     GA4 + Facebook Pixel + Cookie Consent (GDPR)
```

## 📁 Project Structure

```
app/
├── components/
│   ├── auth/           # AuthModal, SignIn, SignUp, RequireAuth
│   ├── cart/           # CartDrawer, CartItem, CartSummary
│   ├── product/        # ProductCard, Gallery, VariantSelector
│   ├── layout/         # Header, Footer, Navigation
│   ├── home/           # Hero, Features, Testimonials
│   └── ui/             # Button, Input, Modal, Toast, Skeleton
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ToastContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useToast.ts
├── lib/
│   ├── auth.ts              # Shopify Customer API
│   ├── firebase.client.ts   # Social login
│   ├── shopify.ts           # Storefront client
│   └── shopify.queries.ts   # GraphQL
├── routes/
│   ├── _index.tsx           # Homepage
│   ├── collections.$handle.tsx
│   ├── products.$handle.tsx
│   ├── cart.tsx
│   ├── account.tsx
│   ├── account.downloads.tsx
│   ├── account.orders.tsx
│   └── api/                 # API routes
├── styles/
│   └── app.css              # @theme design tokens
├── types/
│   ├── auth.ts
│   ├── cart.ts
│   └── shopify.ts
docs/
├── design/
│   ├── DESIGN_SYSTEM.md     # ⚠️ Single Source of Truth
│   └── design-systems-reference.md
├── prompts/                  # Prompt templates
└── technical/                # Architecture docs
```

## 📐 Design System (MANDATORY)

> ⚠️ **AI MUST READ**: `docs/design/DESIGN_SYSTEM.md` before writing any styles

### Design Tokens (@theme)
```css
/* Spacing Scale (4px base) */
--spacing-1: 4px     --spacing-4: 16px    --spacing-8: 32px
--spacing-2: 8px     --spacing-5: 20px    --spacing-10: 40px
--spacing-3: 12px    --spacing-6: 24px    --spacing-12: 48px

/* Colors */
--color-background: hsl(220, 20%, 4%);   /* Page bg */
--color-surface: hsl(220, 18%, 8%);      /* Cards */
--color-brand: hsl(175, 85%, 46%);       /* Primary accent */
--color-foreground: hsl(220, 10%, 94%);  /* Text */
--color-muted: hsl(220, 10%, 55%);       /* Secondary text */

/* Border Radius */
--radius-md: 8px   /* Buttons, inputs */
--radius-lg: 12px  /* Cards */

/* Animation */
--duration-fast: 150ms
--duration-normal: 250ms
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

### Rules
1. **NO arbitrary values** - use tokens only
2. **NO pure white/black** - use foreground/background
3. **Playfair Display** for headlines only
4. **Inter** for all body text

## 📄 Core Pages

### 1. Homepage (`/`)
- Hero section with compelling headline
- Featured products carousel
- Value proposition sections
- Newsletter signup
- Footer with links

### 2. Collection Page (`/collections/:handle`)
- Product grid (responsive: 1-2-3-4 columns)
- Filtering (price, category, tags)
- Sorting (newest, price, popularity)
- Pagination or infinite scroll

### 3. Product Page (`/products/:handle`)
- Image gallery with zoom
- Variant selector (size, color, license)
- Price display with sale support
- Add to cart button
- Product description
- Related products
- [INDUSTRY_SPECIFIC_FEATURES]

### 4. Cart (`/cart` or Drawer)
- Line items with quantity adjustment
- Remove items
- Subtotal calculation
- Proceed to checkout button
- Empty cart state

### 5. Account (`/account`)
- Profile information (name editable, email readonly)
- Password change (email users only)
- Registration source badge (social users)
- Tab navigation to Orders/Downloads

### 6. Orders (`/account/orders`)
- Order history list
- Order details (items, totals, status)
- Reorder functionality

## 🔐 Authentication System

**Architecture: Hybrid Auth**

```
Email/Password → Shopify Customer API directly
Social Login   → Firebase popup → Create Shopify Customer
                 Password: "{Provider}_{FirebaseUID}"
```

**User Object:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  accessToken: string;
  registrationSource: 'email' | 'google' | 'facebook';
}
```

**Features:**
- Sign in / Sign up modal
- Social login (Google, Facebook)
- Password reset via email
- Protected routes (RequireAuth wrapper)
- Session persistence (localStorage)

## 🛒 Cart System

- Shopify Cart API integration
- Persistent cart (localStorage + API sync)
- Optimistic UI updates
- Cart drawer (slide-out)
- Redirect to Shopify Checkout

## 📊 Analytics

- Google Analytics 4 with Consent Mode v2
- Facebook Pixel (optional)
- Cookie consent banner (GDPR)
- E-commerce events:
  - `view_item`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`

## 🌐 Environment Variables

```env
# Shopify
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=

# Firebase Client
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Analytics
VITE_GA_MEASUREMENT_ID=
VITE_FB_PIXEL_ID=
```

## ✅ Quality Checklist

- [ ] Mobile-first responsive design
- [ ] Loading skeletons for all async content
- [ ] Error states with retry options
- [ ] Toast notifications for actions
- [ ] Form validation with error messages
- [ ] SEO meta tags on all pages
- [ ] Structured data for products
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance (lazy loading, code splitting)

## 🎯 Industry-Specific Features

[ADD_FEATURES_BASED_ON_INDUSTRY]

---

**დაიწყე პროექტის შექმნა ზემოთ მოცემული სპეციფიკაციით.**
```

---

## Example: Music Store

```markdown
# Project Genesis: CZABA Store

## 🎯 Brand Identity
**სახელი:** CZABA
**ტიპი:** Premium Digital Music Store
**Tagline:** "Cinematic sounds for visionary creators"
**Target Audience:** Film composers, music producers, content creators

## 🎨 Design Philosophy
**ხედვა:** ჩვენ არ ვართ "აუდიო ფაილების სუპერმარკეტი". ჩვენ ვართ "კურატორული გალერეა".

**Visual Identity:**
- Theme: Dark - cinematic, minimal
- Primary: #13ecda (Cyan)
- Typography: Inter (both)
- Border Radius: rounded-xl
- Animations: Subtle, Apple-style

## 🎯 Industry-Specific Features
- Audio preview with WaveSurfer.js waveforms
- BPM/Key metadata display
- License type selection (Standard/Premium)
- Instant download after purchase
- Personal Mixdown Studio (stem separation)
```
