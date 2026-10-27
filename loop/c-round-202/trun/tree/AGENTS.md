# CZABA Store

ციფრული არტ-გალერეა კინემატოგრაფისტებისთვის - premium cinematic audio assets with Personal Mixdown Studio.

## წესები

- **არაფერი წაშალო/დააკომიტო/დაფუშო** ჩემი ნებართვის გარეშე
- **შემეკამათე** - თუ რამე არ მოგწონს, თქვი
- **დოკუმენტაცია** ქართულად `docs/technical/`-ში
- **Tailwind-first** - არა custom CSS, არა hardcoded ფერები
- **კომენტარები არ მჭირდება** კოდში (გამონაკლისი: TODO, ქართული კონტექსტი)
- **Semicolons** - ყველა statement უნდა დამთავრდეს `;` სიმბოლოთი
- **TypeScript strict** - no `any`, no `@ts-ignore`, no type assertions
- **Biome** - linting/formatting, run `npm run check` before commit

## Commands

```bash
npm run dev         # Development
npm run build       # Production
npm run test:run    # Tests
npm run lint        # Biome lint
npm run check       # Biome lint + format + fix
```

## Tech Stack

Remix + React + TypeScript + Tailwind v4 + Czaba .NET Backend + Firebase (Social Auth)

## არქიტექტურა (feature/backend-integration)

**Backend-Centric:** Frontend უკავშირდება Czaba API-ს (localhost:5199).

```
Frontend (Remix) ──► Czaba .NET Backend (localhost:5199)
                         │
                         ├── Products: /api/products
                         ├── Auth: /api/auth/*
                         ├── Cart: /api/cart/*
                         └── Orders: /api/orders/*

Firebase (czaba-api) ──► მხოლოდ Google Sign-In popup
```

### ავტორიზაცია

| Flow | აღწერა |
|------|--------|
| Email/Password | Frontend → `/api/auth/login` → JWT tokens |
| Google OAuth | Firebase popup → ID Token → `/api/auth/social` → JWT tokens |
| Token Storage | `localStorage.auth_user` (accessToken, refreshToken) |

### ძირითადი ფაილები

| ფაილი | აღწერა |
|-------|--------|
| `app/services/api/client.ts` | Backend API client (Products, Auth, Cart) |
| `app/lib/auth.ts` | Auth ფუნქციები (signIn, signUp, signInWithGoogle) |
| `app/lib/firebase.client.ts` | Firebase config (მხოლოდ Google Sign-In) |
| `app/contexts/AuthContext.tsx` | Auth state management |
| `app/contexts/CartContext.tsx` | Cart state management |

### API Client მეთოდები

```typescript
import { apiClient } from '~/services/api';

// Products
apiClient.getProducts({ category, genre, minBpm, maxBpm });
apiClient.getProductByHandle(handle);

// Auth
apiClient.login({ email, password });
apiClient.register({ email, password, firstName, lastName });
apiClient.socialLogin({ idToken });  // Firebase ID token
apiClient.refreshToken(refreshToken);

// Cart
apiClient.getCart(sessionId);
apiClient.addToCart({ productId, quantity }, sessionId);
apiClient.removeCartItem(itemId, sessionId);
apiClient.checkout();
```

### Firebase კონფიგურაცია

- **Project:** czaba-api
- **გამოყენება:** მხოლოდ Google Sign-In popup
- **არ გამოიყენება:** Firestore, data storage

## Documentation

| Topic | Location |
|-------|----------|
| Vision & Brand | `docs/design/brand-vision.md` |
| Design System | `docs/design/DESIGN_SYSTEM.md` |
| Design Audit | `docs/design/audit-design.md` |
| Architecture | `docs/technical/architecture/` |
| Auth System | `docs/technical/architecture/auth-system.md` |
| Auth Debugging | `docs/technical/debug-auth.md` |
| Studio Debugging | `docs/technical/debug-studio.md` |
| Service Layer | `docs/technical/architecture/service-layer.md` |
| UI Components | `~/components/ui` (Button, Modal, Input, Card...) |

## Auto-Load Templates (Single-File)

**კომპონენტის შექმნამდე** - წაიკითხე `.claude/prompts/new-component.md`
**Context-ის შექმნამდე** - წაიკითხე `.claude/prompts/new-context.md`
**Hook-ის შექმნამდე** - წაიკითხე `.claude/prompts/new-hook.md`
**Route-ის შექმნამდე** - წაიკითხე `.claude/prompts/new-route.md`
**Service-ის შექმნამდე** - წაიკითხე `.claude/prompts/new-service.md`
**Test-ის შექმნამდე** - წაიკითხე `.claude/prompts/new-test.md`
**Studio Feature-ის შექმნამდე** - წაიკითხე `.claude/prompts/studio-feature.md`

---

## Compositions (Multi-File Tasks)

**როდის გამოვიყენოთ Composition:**
- ახალი feature რომელიც მოითხოვს Component + Hook + Context + Route
- რამდენიმე ფაილის შექმნა ერთდროულად
- მრავალ-ნაბიჯიანი workflow

**ახალი Feature-სთვის** - წაიკითხე `.claude/compositions/new-feature.md`

```
User: "შექმენი Wishlist feature"
Codex: [კითხულობს compositions/new-feature.md]
        [ქმნის: Components + Context + Hook + Route]
```

---

## Skills

| Skill | Description |
|-------|-------------|
| `pre-flight` | კოდამდე checklist — run before >30 lines or new file |
| `remix-framework` | SSR, loaders, actions, file-based routing |
| `firebase-auth` | Google Sign-In, ID token flow |
| `web-audio-api` | AudioEngine, stems mixing, waveforms |
| `wavesurfer-js` | Waveform visualization, regions, trim |
| `ffmpeg-wasm` | WAV→MP3 conversion, client-side encoding |
| `tailwind-v4` | CSS-first config, design tokens |
| `indexeddb-cache` | Audio file caching, 30-day expiration |
| `ga4-analytics` | GA4 events, e-commerce tracking |
| `facebook-pixel` | Conversion tracking, retargeting |

## Primitives (Internal Patterns)

| Primitive | Description |
|-----------|-------------|
| `AGENT_DISCOVERABLE_CODE.md` | Agent-friendly naming, comments, deprecation (grep-first navigation) |
| `FORWARDREF_COMPONENT.md` | UI component template |
| `TAILWIND_FIRST.md` | No custom CSS rules |
| `REACT_CONTEXT.md` | Context + Provider pattern |
| `AUDIO_ARCHITECTURE.md` | 3-layer audio system |
| `DESIGN_TOKENS.md` | Colors, spacing, typography |
| `GIT_RULES.md` | Git workflow, commit format |
| `ERROR_TAXONOMY.md` | Error code ranges (50001-50399) |
| `GEORGIAN_DOCS.md` | ქართული დოკუმენტაციის სტანდარტი |
| `API_ERROR_HANDLING.md` | Token refresh, retry, error display |
| `SKELETON_LOADING.md` | Loading states, shimmer animation |
| `SECURITY_AUDIT.md` | JWT, CORS, injection, Stripe, R2 უსაფრთხოება |
| `TESTING_QUALITY_GATES.md` | ტესტირების სტრატეგია, quality gates |
| `BUG_HUNTING_TESTS.md` | Bug-hunting ტესტების მეთოდოლოგია |

Remix + React + TypeScript + Tailwind v4 + Czaba .NET Backend

## Codex

`.claude/agents/` - სპეციალისტები, `.claude/prompts/` - single-file templates, `.claude/compositions/` - multi-file workflows, `.agents/skills/` - skills (external tech patterns + utilities)

## Philosophy review roles

Read `.claude/compositions/philosophy-review.md` for role selection and the review process.
Shared role files: `.claude/agents/flow-sage.md`, `.claude/agents/relational-architect.md`, `.claude/agents/polyphony-conductor.md`, `.claude/agents/first-visit-host.md`, `.claude/agents/consequence-tester.md`.
Claude can discover these as subagents; other assistants read them as role instructions. Do not assume automatic delegation. All five are read-only reviewers.

## Verification and portability

`npm run verify` checks agent references, lint, TypeScript, unit tests and the production build. `npm run test:e2e:smoke` runs the deterministic browser gate; the full browser suite is `npm run test:e2e` and may require backend data.
`npm run check` checks without changing files; `npm run check:fix` is the explicit fixing command.
Use `.claude/primitives-map.json` to select primitives before edits. Claude's project hook adds that reminder; other assistants must read the mapped files themselves. Hooks do not prove compliance or replace tests.
Read `docs/technical/agent-system.md` for setup and external Ableton evidence requirements.
