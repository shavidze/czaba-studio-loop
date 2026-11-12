# Pre-Production Checklist

Last Updated: 2026-01-06

## Critical - Must Fix Before Production

### Security
- [x] Remove hardcoded Shopify tokens from code
- [x] Remove `debugger` statement from auth.ts
- [x] Add environment variable validation on server startup
- [x] Create Vite env types (env.d.ts)
- [ ] Verify all env vars are set in production environment

### Architecture Improvements
- [x] Create Service Layer for Shopify API (see [Service Layer docs](technical/architecture/service-layer.md))
- [x] Add Error Boundaries with styled error pages
- [x] Fix circular dependency (usePurchases <-> hooks/index)

### Environment Variables Required
```bash
# Server-side (Remix/Node)
SHOPIFY_STORE_DOMAIN=czaba.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token

# Client-side (Vite - exposed to browser)
VITE_SHOPIFY_STORE_DOMAIN=czaba.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token

# Firebase Admin
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# Firebase Client
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# R2 Storage
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_ENDPOINT=https://your_account.r2.cloudflarestorage.com
R2_BUCKET_NAME=your_bucket
R2_TOKEN_SECRET=your_secret

# Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=XXXXXXXXXXXXXXX

# Email (Brevo)
BREVO_API_KEY=your_key
BREVO_LIST_ID=7
```

## Build Status
- [x] TypeScript compilation passes
- [x] Production build succeeds
- [x] No critical runtime errors
- [x] Circular dependency warnings resolved

## Testing
- [x] Vitest configured
- [x] ProductService unit tests (7 tests)
- [ ] CustomerService tests
- [ ] CartService tests
- [ ] E2E tests with Playwright

## Code Quality

### Service Layer
New centralized service layer for all Shopify API calls:
```
app/services/shopify/
├── client.ts      # Unified GraphQL client (retry logic, error handling)
├── products.ts    # ProductService
├── customers.ts   # CustomerService
├── cart.ts        # CartService
└── index.ts       # Barrel exports
```

**Routes Updated:**
- [x] `collections.music.tsx` - Uses ProductService
- [x] `collections.presets.tsx` - Uses ProductService
- [ ] `_index.tsx` - Still uses old pattern
- [ ] Other routes - Migration in progress

### Error Handling
- [x] RootErrorBoundary with styled UI (404, 500, etc.)
- [x] RouteErrorBoundary for nested route errors
- [ ] Add Sentry/error monitoring integration

### Console Logging
- [x] Created debug utility (app/lib/debug.ts)
- [ ] Replace StudioContext console.log (24 instances) with debug.log
- [ ] Replace other debug console.logs with debug.log
- [x] console.error statements kept for error tracking

### TODO Comments to Address
| Priority | Location | Task |
|----------|----------|------|
| High | _index.tsx:90 | Implement newsletter subscription |
| High | hire-us.tsx:36 | Send contact form via Brevo |
| High | free-downloads.tsx:63 | Add email to Brevo and return download link |
| Medium | api.shopify-webhook.tsx:118 | Send download email when order is paid |
| Medium | studio.$productId.tsx:108 | Replace mock data with Shopify API |
| Low | ExportDialog.tsx:89 | Get BPM from product metadata |
| Future | StudioContext.tsx:1169 | Firebase save/load (Phase 5) |

## TypeScript Issues

### `any` Types Progress
**Before:** 26 occurrences in 15 files
**After:** 13 occurrences (50% reduction)

**Fixed:**
- [x] SignInForm.tsx, SignUpForm.tsx - proper error handling with `getErrorMessage()`
- [x] collections.music.tsx, collections.presets.tsx - Uses typed ProductService
- [x] shopify.mappers.ts - Type-safe metafield helpers

**Remaining:**
- [ ] StudioContext.tsx - webkitAudioContext, FFmpeg workers
- [ ] firebase-shopify-auth.ts - Firebase response types
- [ ] Other utility files

### TypeScript Warnings (Non-blocking)
- Framer Motion `ease` type warnings - partially fixed with `as const`
- Some interface property mismatches - needs cleanup
- Build succeeds with warnings

## Bundle & Dependencies

### Bundle Size Analysis
| File | Size | Status |
|------|------|--------|
| index.js (React) | 196KB | ⚠️ |
| Firebase SDK | 157KB | ⚠️ Consider lazy loading |
| proxy.js | 114KB | Check usage |
| wavesurfer | 39KB | ✅ |
| Service Layer | ~10KB | ✅ New |

## API Routes Checklist
| Route | Auth | Error Handling | Rate Limit |
|-------|------|----------------|------------|
| api.download.ts | Bearer token + ownership check | Yes | No |
| api.studio-token.ts | Bearer token | Yes | No |
| api.backup-user.ts | None (internal) | Yes | No |
| api.subscribe.tsx | None | Yes | No |
| api.shopify-webhook.tsx | HMAC signature | Yes | No |
| api.proxy.audio.ts | None | Yes | No |
| api.sync-shopify.tsx | API key | Yes | No |

## Recommended Pre-Launch Tasks

### Immediate (Before Launch)
1. Set all environment variables in production
2. Test checkout flow end-to-end
3. Verify R2 download URLs work
4. Test social auth (Google, Facebook)
5. Test error pages (404, 500)

### Short-term (First Week)
1. Implement newsletter subscription
2. Implement hire-us form email
3. Add rate limiting to public APIs
4. Set up error monitoring (Sentry)
5. Migrate remaining routes to Service Layer

### Medium-term (First Month)
1. Replace console.log with debug utility
2. Fix remaining TypeScript warnings
3. ~~Add unit tests for critical paths~~ Started - ProductService tests added
4. Implement order paid email notifications
5. Auth system consolidation (Firebase/Shopify)

## Deployment Notes
- Build command: `npm run build`
- Build output: `build/` directory
- Server bundle: `build/server/index.js` (~620KB)
- Client assets: `build/client/`

## Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerting
- [ ] Set up analytics dashboards
