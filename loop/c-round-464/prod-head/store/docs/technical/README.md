# Technical Documentation

ეს ფოლდერი შეიცავს CZABA Store-ის ტექნიკურ დოკუმენტაციას. ყოველი ფუნქციონალის შეცვლისას აქ იქმნება/განახლდება შესაბამისი MD ფაილი.

**შენიშვნა:** დოკუმენტაცია დაწერილია ქართულად, კოდის დეტალური ახსნით.

## არქიტექტურა (feature/backend-integration)

**Backend-Centric მიდგომა:** Frontend უკავშირდება Czaba .NET Backend-ს (localhost:5199).

| კომპონენტი | აღწერა |
|------------|--------|
| **Backend API** | Products, Auth, Cart, Orders |
| **Firebase** | მხოლოდ Google Sign-In popup |
| **JWT Tokens** | localStorage-ში, AuthContext-ით მართული |

## ფაილების სტრუქტურა

```
docs/technical/
├── README.md
├── architecture/                  # არქიტექტურის აღწერები
│   ├── auth-system.md            # Backend Auth + Firebase Social
│   ├── service-layer.md          # API Client + Service Layer
│   ├── audio-system.md           # 3-დონიანი აუდიო არქიტექტურა
│   ├── state-management.md       # 8 React Context overview
│   ├── studio-layout.md          # Sticky header + scrollable content
│   └── StudioContext.md          # State management + Web Audio API
├── features/                      # ფუნქციონალის აღწერები
│   ├── cart-system.md            # Backend Cart API
│   ├── product-system.md         # Backend Products
│   ├── loop.md                   # Global Loop (Ableton-style)
│   ├── solo-mute.md              # Solo/Mute + Group Solo
│   └── ...
├── components/                    # კომპონენტების აღწერები
│   ├── TransportBar.md           # რულერი + Loop Zone + Seek Zone
│   ├── StudioTrack.md            # ინდივიდუალური ტრეკის კომპონენტი
│   └── ...
└── guides/
    └── ../guides/backend-integration.md  # Backend Integration Guide
```

## ფუნქციონალის ინდექსი

### Studio ფუნქციები

| ფუნქცია | ფაილი | სტატუსი | აღწერა | ბოლო განახლება |
|---------|-------|---------|--------|----------------|
| **Audio Cache** | [architecture/audio-cache.md](architecture/audio-cache.md) | ✅ ახალი | IndexedDB caching, 30-day expiry, optimistic loading | 2025-01-07 |
| Global Loop | [features/loop.md](features/loop.md) | ✅ დოკუმენტირებული | Ableton-style ლუპის შექმნა/რედაქტირება | 2024-12-27 |
| Solo/Mute | [features/solo-mute.md](features/solo-mute.md) | ✅ დოკუმენტირებული | Individual + Group Solo, GainNode მანიპულაცია | 2024-12-27 |
| Playback | features/playback.md | 📝 TODO | Play/Pause/Stop, requestAnimationFrame | - |
| Export | features/export.md | 📝 TODO | WAV/MP3 export ლოგიკა | - |
| Video Sync | features/video-sync.md | 📝 TODO | ვიდეო + აუდიო სინქრონიზაცია | - |

### Analytics & Tracking

| ფუნქცია | ფაილი | სტატუსი | აღწერა | ბოლო განახლება |
|---------|-------|---------|--------|----------------|
| Google Analytics 4 | [features/analytics-ga4.md](features/analytics-ga4.md) | ✅ დოკუმენტირებული | GA4 ინტეგრაცია, event tracking, consent | 2026-01-03 |
| Facebook Pixel | [features/facebook-pixel.md](features/facebook-pixel.md) | ✅ დოკუმენტირებული | FB Pixel, retargeting, conversion tracking | 2026-01-03 |
| Shopify Pixels | [features/shopify-pixels.md](features/shopify-pixels.md) | ✅ დოკუმენტირებული | Custom Pixels Shopify checkout-ზე | 2026-01-03 |

### E-commerce (Backend Integration)

| ფუნქცია | ფაილი | სტატუსი | აღწერა | ბოლო განახლება |
|---------|-------|---------|--------|----------------|
| **Service Layer** | [architecture/service-layer.md](architecture/service-layer.md) | ✅ განახლებული | Backend API Client + Shopify SSR | 2026-01-18 |
| **Auth System** | [architecture/auth-system.md](architecture/auth-system.md) | ✅ განახლებული | Backend Auth + Firebase Social | 2026-01-18 |
| Cart System | [features/cart-system.md](features/cart-system.md) | ✅ დოკუმენტირებული | Backend Cart API, CartContext | - |
| Shadow Database | [features/shadow-database.md](features/shadow-database.md) | ✅ დოკუმენტირებული | Firebase shadow DB for purchases | - |

## კომპონენტების ინდექსი

### Studio კომპონენტები

| კომპონენტი | ფაილი | სტატუსი | აღწერა |
|------------|-------|---------|--------|
| TransportBar | [components/TransportBar.md](components/TransportBar.md) | ✅ დეტალური | Loop Zone, Seek Zone, Zoom, Time markers |
| StudioTrack | [components/StudioTrack.md](components/StudioTrack.md) | ✅ დეტალური | Waveform, Solo/Mute, Volume, Selection, Loop Mask |
| PlaybackControls | [components/PlaybackControls.md](components/PlaybackControls.md) | ✅ დეტალური | Play/Pause/Stop ღილაკები, Time display |
| GlobalPlayhead | [components/GlobalPlayhead.md](components/GlobalPlayhead.md) | ✅ დეტალური | Ableton-style playhead, Loop region color change |
| ScrubZone | [components/ScrubZone.md](components/ScrubZone.md) | ✅ ახალი | Video-Tracks შორის scrub area, drag-to-seek |

### SFX/FX კომპონენტები (Filmcrux-style)

| კომპონენტი | ფაილი | სტატუსი | აღწერა |
|------------|-------|---------|--------|
| SFX Components | [components/SFXComponents.md](components/SFXComponents.md) | ✅ დეტალური | SFXHero, SFXPackCard - კინემატიკური დიზაინი |
| FX Product Detail | [components/FXProductDetail.md](components/FXProductDetail.md) | ✅ დეტალური | FXPackFeatures, FXSoundPreviewGrid, FXWhatsIncluded |

## არქიტექტურის ინდექსი

| თემა | ფაილი | სტატუსი | აღწერა |
|------|-------|---------|--------|
| **Audio System** | [architecture/audio-system.md](architecture/audio-system.md) | ✅ ახალი | 3-დონიანი აუდიო არქიტექტურა: AudioContext, StemsContext, StudioContext | 2026-01-18 |
| **State Management** | [architecture/state-management.md](architecture/state-management.md) | ✅ ახალი | 8 React Context-ის overview და ურთიერთკავშირი | 2026-01-18 |
| **Audio Cache** | [architecture/audio-cache.md](architecture/audio-cache.md) | ✅ ახალი | IndexedDB-based stem caching, 30-day expiry, ArrayBuffer handling |
| **Service Layer** | [architecture/service-layer.md](architecture/service-layer.md) | ✅ ახალი | Shopify API centralization, ProductService, CustomerService, CartService |
| **Error Boundaries** | [architecture/error-boundaries.md](architecture/error-boundaries.md) | ✅ ახალი | Styled error pages, 404/500 handling |
| Auth System | [architecture/auth-system.md](architecture/auth-system.md) | ✅ დეტალური | Shopify + Firebase ჰიბრიდული auth, Social login |
| Studio Layout | [architecture/studio-layout.md](architecture/studio-layout.md) | ✅ დეტალური | Sticky header, z-index, scrollable content |
| StudioContext | [architecture/StudioContext.md](architecture/StudioContext.md) | ✅ დეტალური | State management, Web Audio API, Playback, Keyboard shortcuts |
| Audio Graph | architecture/audio-graph.md | 📝 TODO | Web Audio API node chain (ცალკე) |

## Testing

| თემა | ფაილი | სტატუსი | აღწერა |
|------|-------|---------|--------|
| **Testing Guide** | [testing.md](testing.md) | ✅ ახალი | Unit tests (Vitest) + E2E tests (Playwright) |

### ბრძანებები

```bash
npm run test:run    # Unit tests (30 ტესტი)
npm run test:e2e    # E2E tests (5 ტესტი)
```

## როგორ დავამატო ახალი დოკუმენტაცია

1. შექმენი ახალი MD ფაილი შესაბამის ფოლდერში
2. განაახლე ეს README ინდექსით
3. დაწერე აღწერა შემდეგი სტრუქტურით:

```markdown
# ფუნქციის სახელი

## მოკლე აღწერა
რას აკეთებს ეს ფუნქცია

## ფაილები
- `path/to/file.tsx` - აღწერა

## State
რა state-ს იყენებს

## მოქმედებები
| მოქმედება | რეაქცია |
|-----------|---------|
| Click | რა ხდება |

## Keyboard Shortcuts
- `Key` - აღწერა

## ტექნიკური დეტალები
კოდის მაგალითები და ახსნა
```
