# 🎵 Music & Audio Store Starter Kit

> Premium digital music store template - loops, samples, presets, SFX

---

## Quick Start Prompt

```markdown
შექმენი [BRAND_NAME] - Premium Digital Music Store შემდეგი სპეციფიკაციით:

## Brand Identity
**ტიპი:** Digital Audio Marketplace
**Audience:** Music Producers, Film Composers, Content Creators, Sound Designers
**Value Prop:** Curated, professional-grade sounds with unique tools

## Design Philosophy
"ჩვენ არ ვართ აუდიო ფაილების სუპერმარკეტი. ჩვენ ვართ კურატორული გალერეა."

**Visual:**
- Theme: Dark cinematic, minimal
- Primary: Cyan (#13ecda) ან Amber (#f9a91f)
- Vibe: Professional studio environment
- Typography: Clean sans-serif (Inter)

## Product Categories
1. **Music Packs** - Loops, stems, full tracks
2. **Presets** - Synth presets, effect chains
3. **SFX** - Sound effects, foley, transitions
4. **Bundles** - Curated collections

## Industry-Specific Features

### 1. Audio Preview System
```typescript
// WaveSurfer.js integration
- Waveform visualization
- Play/pause on hover or click
- Seek functionality
- Volume control
- Preview duration limit (30-60 sec)
```

### 2. Product Metadata Display
```typescript
interface AudioProduct {
  bpm?: number;           // 80-180
  key?: string;           // "Am", "C#m", "F"
  duration: string;       // "3:24"
  format: string;         // "WAV 24-bit/48kHz"
  stemCount?: number;     // 8 stems
  loopCount?: number;     // 15 loops
  genre: string[];        // ["Cinematic", "Epic"]
  mood: string[];         // ["Dark", "Intense"]
  instruments: string[];  // ["Strings", "Brass"]
}
```

### 3. License Selection
```typescript
type LicenseType = 'standard' | 'premium' | 'unlimited';

interface License {
  type: LicenseType;
  price: number;
  features: string[];
  usageRights: string[];
}

// Standard: Personal projects, YouTube
// Premium: Commercial use, unlimited projects
// Unlimited: Full buyout, stems included
```

### 4. Personal Mixdown Studio (Premium Feature)
```typescript
// Real-time stem mixing in browser
- Individual stem volume control
- Solo/mute per stem
- Export custom mix as WAV/MP3
- Save mix presets
- FFmpeg integration for processing
```

### 5. Instant Download System
```typescript
// After purchase
- Immediate access to downloads
- Download page with all purchased products
- Re-download anytime
- License PDF generation
- Cloudflare R2 / S3 signed URLs
```

### 6. Collection Filtering
```typescript
interface FilterOptions {
  genre: string[];
  mood: string[];
  bpm: { min: number; max: number };
  key: string[];
  format: string[];
  priceRange: { min: number; max: number };
}
```

## Page Requirements

### Product Page Sections
1. **Hero:** Title, Artist, Price, License selector
2. **Preview:** Large waveform player, track list
3. **Details:** BPM, Key, Duration, Format, Stems
4. **What's Included:** File breakdown
5. **License Info:** Usage rights comparison
6. **Related:** Similar packs

### Downloads Page (/account/downloads)
1. **Tabs:** All, Music, Presets, SFX
2. **Product Cards:** Thumbnail, name, purchase date
3. **Actions:** Download Files, Download License, Open in Studio

## Tech Specifics

### Audio Libraries
```json
{
  "wavesurfer.js": "^7.x",
  "@ffmpeg/ffmpeg": "^0.12.x",
  "@ffmpeg/util": "^0.12.x"
}
```

### File Storage Structure (R2/S3)
```
/{product-handle}/
├── Preview/
│   └── preview.mp3          # 30-60 sec preview
├── Downloads/
│   ├── standard.zip         # Standard license files
│   └── premium.zip          # Premium with stems
├── Stems/                   # Individual stems for Studio
│   ├── drums.wav
│   ├── bass.wav
│   └── ...
└── license-template.pdf
```

### API Endpoints
```
POST /api/download        # Generate signed URL
POST /api/studio/export   # Export custom mix
GET  /api/products/audio  # Get audio metadata
```

## Pricing Strategy
- Music Packs: $29 - $149
- Presets: $19 - $59
- SFX: $15 - $49
- Bundles: 30-40% discount

## Marketing Copy Examples
- "Cinematic sounds for visionary creators"
- "Studio-quality, royalty-free, forever yours"
- "Every pack tells a story. What's yours?"
- "Professional composers use these. Now you can too."
```

---

## Example: CZABA Store

```markdown
# CZABA - Premium Drum Samples & Cinematic Music

## Brand
- Name: CZABA (ჭაბა)
- Tagline: "Cinematic sounds for visionary creators"
- Primary: Cyan #13ecda
- Audience: Film/game composers, beat makers

## Special Features
- Personal Mixdown Studio with stem separation
- BPM/Key metadata on all products
- Waveform preview with WaveSurfer.js
- Instant download after purchase
- License PDF auto-generation

## Categories
- Drum Kits & Loops
- Cinematic Scores
- Ambient Textures
- Production Presets
```
