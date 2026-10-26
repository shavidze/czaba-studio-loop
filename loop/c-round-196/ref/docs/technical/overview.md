# Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Authentication System](#4-authentication-system)
5. [Audio System (Studio)](#5-audio-system-studio)
6. [Export System](#6-export-system)
7. [Lead Magnet System](#7-lead-magnet-system)
8. [Shopify Integration](#8-shopify-integration)
9. [Firebase Integration](#9-firebase-integration)
10. [Styling System](#10-styling-system)
11. [Debugging Guide](#11-debugging-guide)

---

## 1. Project Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Remix (React) + Vite |
| Styling | Tailwind CSS v4.0 (CSS-first) |
| Commerce | Shopify Storefront API (Headless) |
| Database | Firebase Firestore (Shadow DB) |
| Auth | Shopify Customer Accounts + Firebase Auth |
| Email | Brevo (Transactional) |
| File Storage | Cloudflare R2 |
| Deployment | Vercel |

### Key Principles

1. **Headless Commerce** - Shopify handles products/orders, we handle UI
2. **Shadow Database** - Firebase backs up all customer data
3. **Sticky Player** - Audio never stops during navigation
4. **Modal Auth** - Login/signup in modal, not separate page

---

## 2. Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Remix)                         │
├─────────────────────────────────────────────────────────────────┤
│  Components    │   Contexts      │   Routes                     │
│  - Header      │   - AuthContext │   - _index (Home)            │
│  - Player      │   - PlayerContext│  - products.$handle         │
│  - Studio      │   - StudioContext│  - studio.$productId        │
│  - AuthModal   │   - CartContext │   - account.*                │
└───────┬────────┴────────┬────────┴──────────┬───────────────────┘
        │                 │                    │
        ▼                 ▼                    ▼
┌───────────────┐ ┌───────────────┐ ┌─────────────────────────────┐
│   Shopify     │ │   Firebase    │ │      Cloudflare R2          │
│   Storefront  │ │   Firestore   │ │   (Audio Files / Stems)     │
│   API         │ │   + Auth      │ │                             │
└───────────────┘ └───────────────┘ └─────────────────────────────┘
```

### Data Flow: Purchase → Download → Studio

```
1. User purchases on Shopify
         ↓
2. Shopify creates Order
         ↓
3. Filemonk delivers download link (email)
         ↓
4. User downloads stems (ZIP from R2)
         ↓
5. User opens Studio (/studio/{product-handle})
         ↓
6. Studio loads stems from R2 CDN
         ↓
7. User edits (mute/solo/volume/trim)
         ↓
8. Export as WAV/MP3 or Ableton .als
```

---

## 3. Directory Structure

```
czaba-store/
├── app/
│   ├── components/          # React components
│   │   ├── auth/           # AuthModal, LoginForm, etc.
│   │   ├── home/           # Hero, ProductSection, etc.
│   │   ├── layout/         # Header, Footer, StickyPlayer
│   │   ├── product/        # ProductCard, AssetListingPage
│   │   ├── studio/         # StudioTrack, PlaybackControls, ExportDialog
│   │   └── ui/             # Button, Modal, Input (design system)
│   │
│   ├── contexts/            # React Contexts (global state)
│   │   ├── AuthContext.tsx      # User auth state
│   │   ├── PlayerContext.tsx    # Global audio player
│   │   ├── StudioContext.tsx    # Studio editing state
│   │   ├── CartContext.tsx      # Shopping cart
│   │   └── FiltersContext.tsx   # Product filters
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useLeadMagnet.ts
│   │
│   ├── lib/                 # Core utilities
│   │   ├── shopify.ts           # Shopify API client
│   │   ├── firebase.client.ts   # Firebase client SDK
│   │   ├── firebase.server.ts   # Firebase Admin SDK
│   │   └── storefront.server.ts # Storefront API queries
│   │
│   ├── routes/              # Remix routes (pages)
│   │   ├── _index.tsx           # Home page
│   │   ├── products.$handle.tsx # Product detail
│   │   ├── studio.$productId.tsx# Studio page
│   │   ├── account.*.tsx        # Account pages
│   │   └── api.*.tsx            # API endpoints
│   │
│   ├── styles/              # CSS files
│   │   └── app.css              # Main stylesheet (Tailwind)
│   │
│   ├── types/               # TypeScript types
│   │   ├── audio.ts
│   │   ├── product.ts
│   │   ├── studio.ts
│   │   └── user.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── ableton-export.ts    # ALS file generator
│   │   ├── audio-encoder.ts     # WAV encoding (uses worker)
│   │   └── ffmpeg.ts            # MP3 conversion
│   │
│   └── workers/             # Web Workers
│       └── audio-encoder.worker.ts
│
├── public/                  # Static files
├── docs/                    # Documentation
└── build/                   # Build output
```

---

## 4. Authentication System

### Overview

We use a **"Shadow Account"** strategy:
- Primary auth: Shopify Customer Accounts
- Social auth: Firebase Auth (Google)
- Backup: All users synced to Firebase Firestore

### Flow: Email/Password Login

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AuthModal  │────▶│   Shopify    │────▶│   Firebase   │
│   (Form)     │     │   Login API  │     │   (Backup)   │
└──────────────┘     └──────────────┘     └──────────────┘
      │                    │                    │
      │              accessToken           sync user
      │                    │                    │
      ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              AuthContext (logged in state)              │
└─────────────────────────────────────────────────────────┘
```

### Flow: Google Login

```
1. User clicks "Sign in with Google"
         ↓
2. Firebase Auth popup opens
         ↓
3. User authenticates with Google
         ↓
4. Firebase returns user info + token
         ↓
5. Check Firestore for "shadow password"
         ↓
6. If exists: Login to Shopify with shadow password
   If not: Create Shopify account + save shadow password
         ↓
7. User is logged in to both systems
```

### Key Files

| File | Purpose |
|------|---------|
| `contexts/AuthContext.tsx` | Global auth state, login/logout functions |
| `components/auth/AuthModal.tsx` | Modal wrapper |
| `components/auth/LoginForm.tsx` | Email/password form |
| `components/auth/GoogleLoginButton.tsx` | Google OAuth |
| `lib/firebase.client.ts` | Firebase client SDK |
| `lib/firebase.server.ts` | Firebase Admin (server-side) |

### Firestore Schema: Users

```typescript
// Collection: users
{
  odqIhJMsY1UdQ4f2fH5e: {           // Document ID = Shopify Customer ID
    odqIhJMsY1UdQ4f2fH5e: string,   // Email
    odqIhJMsY1UdQ4f2fH5e: string,   // First name
    odqIhJMsY1UdQ4f2fH5e: string,   // Last name
    shadowPassword?: string,         // For Google login users
    createdAt: Timestamp,
    lastLoginAt: Timestamp,
    authProvider: 'email' | 'google',
  }
}
```

---

## 5. Audio System (Studio)

### Overview

The Studio is a DAW-like interface for editing purchased stems:
- Play/pause all stems synchronized
- Mute/solo individual stems
- Adjust volume per stem
- Trim start/end points
- Loop regions
- Export mixed audio

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      StudioContext                               │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                          │
│  - stems: StudioStemState[]                                      │
│  - isPlaying, currentTime, masterDuration                        │
│  - zoomLevel, splitMode                                          │
├─────────────────────────────────────────────────────────────────┤
│  Refs:                                                           │
│  - audioContextRef: AudioContext                                 │
│  - audioBuffersRef: Map<stemId, AudioBuffer>                     │
│  - sourceNodesRef: Map<stemId, AudioBufferSourceNode>            │
│  - gainNodesRef: Map<stemId, GainNode>                           │
│  - waveformInstancesRef: Map<stemId, WaveSurfer>                 │
└─────────────────────────────────────────────────────────────────┘
```

### Audio Graph (per stem)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ AudioBuffer  │────▶│ SourceNode   │────▶│  GainNode    │────▶ destination
│ (WAV data)   │     │ (playback)   │     │  (volume)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Playback Flow

```typescript
// 1. Load stems (on page load)
loadProduct(product) {
  for each stem:
    fetch(stem.audioUrl)           // Download WAV from R2
    audioContext.decodeAudioData() // Decode to AudioBuffer
    audioBuffersRef.set(stemId, buffer)
}

// 2. Play
togglePlayPause() {
  if (isPlaying) {
    // Stop all source nodes
    sourceNodesRef.forEach(source => source.stop())
  } else {
    for each stem:
      source = audioContext.createBufferSource()
      source.buffer = audioBuffersRef.get(stemId)
      gainNode = audioContext.createGain()
      gainNode.gain.value = stem.volume
      source.connect(gainNode).connect(destination)
      source.start(0, currentTime)

    // Start time tracking animation loop
    requestAnimationFrame(updateTime)
  }
}
```

### Mute/Solo Logic (Ableton-style)

```typescript
// Solo takes priority over Mute
shouldStemBeAudible(stem, anySoloed) {
  if (anySoloed) {
    return stem.isSoloed    // Only soloed stems play
  }
  return !stem.isMuted      // Otherwise, respect mute state
}

// Multi-solo (Ctrl+Click)
toggleSolo(stemId, isMultiSelect) {
  if (isMultiSelect) {
    // Toggle this stem's solo, keep others
  } else {
    // Exclusive: solo only this stem
  }
}
```

### Key Files

| File | Purpose |
|------|---------|
| `contexts/StudioContext.tsx` | All studio state and audio logic |
| `components/studio/StudioTrack.tsx` | Individual track UI + waveform |
| `components/studio/PlaybackControls.tsx` | Play/pause/stop buttons |
| `components/studio/TransportBar.tsx` | Timeline + time display |
| `components/studio/ExportDialog.tsx` | Export options modal |
| `routes/studio.$productId.tsx` | Studio page route |

---

## 6. Export System

### Overview

Two export types:
1. **Audio Export** - Render stems to WAV/MP3
2. **Ableton Export** - Generate .als project file

### Audio Export Flow

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ ExportDialog │────▶│ OfflineAudioCtx  │────▶│  Web Worker  │
│ (config)     │     │ (fast render)    │     │ (WAV encode) │
└──────────────┘     └──────────────────┘     └──────────────┘
      │                      │                       │
      │                      │                       │
      ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Download WAV/MP3                            │
└─────────────────────────────────────────────────────────────────┘
```

### Why OfflineAudioContext?

```javascript
// OfflineAudioContext renders FASTER than real-time
// 3-minute song renders in ~2 seconds

const offlineCtx = new OfflineAudioContext({
  numberOfChannels: 2,
  length: sampleRate * duration,  // Total samples
  sampleRate: 48000,
});

// Build audio graph (same as normal playback)
stems.forEach(stem => {
  source.connect(gain).connect(offlineCtx.destination)
});

// Render (returns AudioBuffer immediately, not real-time)
const renderedBuffer = await offlineCtx.startRendering();
```

### Web Worker for WAV Encoding

**Problem:** Converting AudioBuffer to WAV is CPU-intensive, blocks main thread

**Solution:** Web Worker

```
Main Thread                          Worker Thread
     │                                    │
     │  postMessage(channelData)          │
     │ ──────────────────────────────────▶│
     │                                    │ encode WAV
     │                                    │ (CPU work)
     │  postMessage(progress: 50%)        │
     │ ◀──────────────────────────────────│
     │                                    │
     │  postMessage({ blob })             │
     │ ◀──────────────────────────────────│
     ▼                                    ▼
```

**Memory Optimization - Transferable Objects:**

```typescript
// BAD: Copies data (doubles memory)
worker.postMessage({ channelData });

// GOOD: Transfers ownership (zero-copy)
worker.postMessage({ channelData }, [channelData[0].buffer, channelData[1].buffer]);
// channelData is now empty on main thread, worker owns it
```

### Ableton Export (.als)

**What is .als?**
- Gzipped XML file
- Contains: tracks, volumes, mute states, audio references

**Generation Flow:**

```typescript
// 1. Build XML with track info
const xml = generateALSXml({
  projectName: "Middle East",
  bpm: 120,
  stems: [
    { name: "Bass Drum", volume: 0.8, isMuted: false },
    { name: "Bass", volume: 1.0, isMuted: false },
    ...
  ]
});

// 2. Gzip compress
const compressed = pako.gzip(xmlBytes);

// 3. Create Blob and download
const blob = new Blob([compressed], { type: 'application/x-ableton-liveset' });
downloadAbletonLiveSet(blob, "Project.als");
```

### Key Files

| File | Purpose |
|------|---------|
| `utils/audio-encoder.ts` | Worker wrapper for WAV encoding |
| `workers/audio-encoder.worker.ts` | Actual WAV encoding logic |
| `utils/ableton-export.ts` | ALS XML generation |
| `utils/ffmpeg.ts` | WAV to MP3 conversion |

---

## 7. Lead Magnet System

### Overview

Popup for new visitors offering free download in exchange for email.

### Flow

```
1. User visits site (first time)
         ↓
2. LeadMagnetPopup appears (after delay)
         ↓
3. User enters email
         ↓
4. POST /api/subscribe
         ↓
5. Save to Firestore (leads collection)
         ↓
6. Send to Brevo API
         ↓
7. Brevo sends automated email with download link
```

### Frequency Capping

```typescript
// localStorage tracks when popup was shown
const STORAGE_KEY = 'leadMagnet_lastShown';
const COOLDOWN_DAYS = 7;

function shouldShowPopup() {
  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (!lastShown) return true;

  const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
  return daysSince > COOLDOWN_DAYS;
}
```

### Key Files

| File | Purpose |
|------|---------|
| `hooks/useLeadMagnet.ts` | Popup logic, timing |
| `components/LeadMagnetPopup.tsx` | Popup UI |
| `routes/api.subscribe.tsx` | API endpoint |

---

## 8. Shopify Integration

### Storefront API

We use Shopify's **Storefront API** (GraphQL) for:
- Product listing
- Product details
- Cart management
- Customer authentication
- Checkout

### Key Queries

```graphql
# Get products
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        handle
        priceRange { ... }
        images { ... }
        metafields { ... }
      }
    }
  }
}

# Customer login
mutation CustomerAccessTokenCreate($email: String!, $password: String!) {
  customerAccessTokenCreate(input: { email: $email, password: $password }) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      message
    }
  }
}
```

### Product Metafields for Stems

```
Metafield: studio.stems_folder = "middle-east"
Metafield: studio.stems = [
  { "file": "Bass Drum.wav", "name": "Bass Drum", "order": 1 },
  { "file": "Bass.wav", "name": "Bass", "order": 2 },
  ...
]
```

See: `docs/STEMS_SETUP.md`

### Key Files

| File | Purpose |
|------|---------|
| `lib/shopify.ts` | API client, fetch wrapper |
| `lib/storefront.server.ts` | GraphQL queries |
| `contexts/CartContext.tsx` | Cart state |

---

## 9. Firebase Integration

### Client vs Server SDK

| | Client SDK | Admin SDK |
|---|---|---|
| File | `firebase.client.ts` | `firebase.server.ts` |
| Runs on | Browser | Vercel serverless |
| Auth | Firebase Auth (Google) | Service account |
| Use | Google login, real-time | Backup writes, admin ops |

### Firestore Collections

```
firestore/
├── users/              # Customer backups
│   └── {odqIhJMsY1UdQ4f2fH5e}/
│       ├── odqIhJMsY1UdQ4f2fH5e
│       ├── firstName
│       ├── lastName
│       └── shadowPassword?
│
├── leads/              # Lead magnet signups
│   └── {odqIhJMsY1UdQ4f2fH5e}/
│       ├── odqIhJMsY1UdQ4f2fH5e
│       ├── createdAt
│       └── source
│
└── studio-edits/       # Saved studio states (future)
    └── {odqIhJMsY1UdQ4f2fH5e}_{odqIhJMsY1UdQ4f2fH5e}/
        ├── stems[]
        └── lastModified
```

---

## 10. Styling System

### Tailwind CSS v4.0 (CSS-first)

Unlike v3, configuration is in CSS:

```css
/* app/styles/app.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-background: #0A0A0A;
  --color-surface: #1A1A1A;
  --color-brand: #00D9FF;       /* Teal - Revenue actions */
  --color-marketing: #FFB800;   /* Gold - Marketing actions */

  /* Typography */
  --font-family-sans: 'Inter', sans-serif;
}
```

### Button Hierarchy

| Type | Color | Use Case |
|------|-------|----------|
| Primary (Commerce) | Blue `#006AFF` | Buy Now - მთავარი შესყიდვის ღილაკი |
| Secondary | Transparent/Outline | Add to Cart, Sign In, Back, Cancel |
| Marketing | Gold `#FFB800` | Sign Up, Start Free |

### Premium Color System

```css
/* Commerce Blue - მთავარი აქცენტი Buy Now ღილაკებისთვის */
--color-blue-60: #006AFF;
--color-blue-50: #3388FF;

/* Crystal Gradient Colors - პრემიუმ ვიზუალებისთვის */
--color-crystal-cyan: #22d3ee;
--color-crystal-blue: #3b82f6;
--color-crystal-purple: #8b5cf6;
--color-crystal-green: #10b981;
```

### Design Decisions (დიზაინის გადაწყვეტილებები)

| გადაწყვეტილება | მიზეზი |
|----------------|--------|
| Pack Artwork 420px | უფრო დიდი ზომა ზრდის აღქმულ ღირებულებას (პრემიუმ აესთეტიკა) |
| Buy Now = Commerce Blue | მანიფესტი: "მკვეთრი აქცენტი მნიშვნელოვანი ღილაკებისთვის" |
| Custom SVG Icons | უნიკალური იდენტობა, არა generic ბიბლიოთეკები (იხ. `app/components/icons/`) |
| Audio Preview = Metafield | `audioPreviewUrl` metafield-ით კონტროლდება, არა productType-ით |

---

## 11. Debugging Guide

### Common Issues

#### Audio not playing

```javascript
// Check 1: AudioContext state
console.log(audioContextRef.current?.state);
// Should be "running", not "suspended"

// Fix: Resume on user interaction
audioContextRef.current?.resume();
```

#### Stems not loading (404)

```javascript
// Check R2 URL
console.log(stem.audioUrl);
// Should be: https://pub-xxx.r2.dev/{folder}/Studio-Assets/{file}.wav

// Check: File exists in R2?
// Check: File name matches exactly (case-sensitive)?
```

#### Export freezes browser

```javascript
// Check: Is Web Worker being used?
// Look for: "Converting to WAV (Web Worker)..." in console

// If not, the synchronous audioBufferToWav is being used
// Fix: Ensure audio-encoder.ts is imported correctly
```

#### Google login fails

```javascript
// Check Firebase config
console.log(import.meta.env.VITE_FIREBASE_API_KEY);

// Check: Firebase Auth enabled in console?
// Check: Google provider enabled?
// Check: Authorized domains configured?
```

### Useful Console Commands

```javascript
// Check audio context
window.__AUDIO_CTX__ = audioContextRef.current;

// Check loaded stems
window.__STEMS__ = audioBuffersRef.current;
console.log([...window.__STEMS__.keys()]);

// Force garbage collection (Chrome DevTools)
// Memory tab > Collect garbage
```

### Performance Profiling

1. Open Chrome DevTools
2. Performance tab
3. Record while exporting
4. Look for:
   - Long tasks (red bars) = main thread blocking
   - Memory growth = potential leak

---

## Appendix: Environment Variables

```env
# Firebase Client (VITE_ prefix = exposed to browser)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Admin (server only)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Shopify
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=

# Brevo
BREVO_API_KEY=
BREVO_LIST_ID=
BREVO_TEMPLATE_ID=
```
