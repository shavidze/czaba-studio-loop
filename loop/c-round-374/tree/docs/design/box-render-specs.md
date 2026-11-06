# 3D Box Render Specifications
## CZABA Pack Visualization System

**თარიღი:** 2026-01-08
**სტატუსი:** To Be Created

---

## Overview

7 ფერის 3D ყუთის რენდერი, რომელიც გამოყენებული იქნება Store გვერდზე Pack-ების ვიზუალიზაციისთვის.

---

## Technical Specifications

### Image Format

| პარამეტრი | მნიშვნელობა |
|-----------|-------------|
| Format | PNG (transparent background) |
| Resolution | 800 x 800 px (minimum) |
| Recommended | 1200 x 1200 px |
| Color Space | sRGB |
| Bit Depth | 8-bit (24-bit color) |

### 3D Model Specifications

| პარამეტრი | მნიშვნელობა |
|-----------|-------------|
| Box Shape | Software box / Product package |
| Aspect Ratio | ~4:5 (tall rectangle) |
| Perspective | 3/4 view, slight rotation |
| Camera Angle | rotateY(-4deg) rotateX(1deg) |
| Lighting | Soft, cinematic, single key light |
| Shadow | Soft drop shadow (separate or integrated) |

### Material Properties

| პარამეტრი | მნიშვნელობა |
|-----------|-------------|
| Surface | Matte with subtle sheen |
| Reflection | Minimal, ~5-10% |
| Texture | Smooth, premium cardboard feel |
| Edge | Slightly rounded corners |

---

## Color Variants

### 1. Gold (Premium/Featured)

```
Primary: #C7A235 (hsl(43, 74%, 49%))
Gradient: #D4AF37 → #B8860B
Usage: Featured products, Premium packs
Shopify Tag: box:gold
```

### 2. Silver (Standard)

```
Primary: #A8A9AD (hsl(225, 3%, 67%))
Gradient: #C0C0C0 → #808080
Usage: Standard releases, default
Shopify Tag: box:silver
```

### 3. Copper (Limited Edition)

```
Primary: #B87333 (hsl(25, 55%, 46%))
Gradient: #CD7F32 → #8B4513
Usage: Limited edition releases
Shopify Tag: box:copper
```

### 4. Midnight Blue (Music Category)

```
Primary: #1A237E (hsl(234, 66%, 30%))
Gradient: #283593 → #0D1442
Usage: Music packs
Shopify Tag: box:midnight
```

### 5. Emerald (SFX Category)

```
Primary: #1B5E20 (hsl(123, 56%, 24%))
Gradient: #2E7D32 → #0D3311
Usage: SFX packs
Shopify Tag: box:emerald
```

### 6. Crimson (Loops Category)

```
Primary: #8B0000 (hsl(0, 100%, 27%))
Gradient: #B71C1C → #5D0000
Usage: Loop packs
Shopify Tag: box:crimson
```

### 7. Obsidian (Sounds Category)

```
Primary: #1C1C1C (hsl(0, 0%, 11%))
Gradient: #2D2D2D → #0A0A0A
Accent: Subtle teal edge glow (#13D9CC at 10%)
Usage: Sound design packs
Shopify Tag: box:obsidian
```

---

## Visual Reference

### Existing Box Style

არსებული ყუთების სტილი (reference):
- `/public/images/packs/1.png` (Gold)
- `/public/images/packs/2.png` (Silver)
- `/public/images/packs/3.png` (Copper)

### Desired Aesthetic

```
┌─────────────────────────────────┐
│                                 │
│    ┌───────────────────────┐    │
│    │                       │    │
│    │      [BLANK FACE]     │    │  ← შეიძლება CZABA logo
│    │                       │    │
│    │                       │    │
│    └───────────────────────┘    │
│         ╲                       │
│          ╲  (side panel)        │
│           ╲                     │
└─────────────────────────────────┘
        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓           ← soft shadow
```

---

## File Naming Convention

```
/public/images/packs/boxes/
├── gold.png
├── silver.png
├── copper.png
├── midnight.png
├── emerald.png
├── crimson.png
└── obsidian.png
```

---

## Branding Elements (Optional)

თითოეულ ყუთს შეიძლება ჰქონდეს:

| ელემენტი | აღწერა |
|----------|--------|
| CZABA Logo | მინიმალისტური, ყუთის ქვედა კუთხეში |
| "SOUND LIBRARY" | პატარა ტექსტი logo-ს ქვეშ |
| Edge Highlight | ფერის მიხედვით subtle glow კიდეზე |

**Note:** ყუთის წინა მხარე ძირითადად ცარიელი უნდა იყოს - ფოკუსი ფერზე და ფორმაზე.

---

## Rendering Software Options

| Software | Difficulty | Quality |
|----------|------------|---------|
| Blender (Free) | Medium | Excellent |
| Cinema 4D | Medium | Excellent |
| KeyShot | Easy | Excellent |
| Photoshop 3D | Easy | Good |
| Figma + Plugins | Easy | Good |
| AI (Midjourney) | Easy | Variable |

---

## AI Prompt (თუ AI-ით შექმნი)

```
A premium software product box, 3/4 perspective view,
[COLOR] metallic matte finish, minimalist design,
dark background with subtle gradient, soft cinematic lighting,
professional product photography style, 8k quality,
transparent PNG background --ar 1:1
```

Replace [COLOR] with: gold, silver, copper, midnight blue, emerald green, crimson red, obsidian black

---

## Checklist

- [ ] Gold box render
- [ ] Silver box render
- [ ] Copper box render
- [ ] Midnight Blue box render
- [ ] Emerald box render
- [ ] Crimson box render
- [ ] Obsidian box render
- [ ] All files 1200x1200 PNG
- [ ] Transparent backgrounds
- [ ] Consistent lighting/angle
- [ ] Files in /public/images/packs/boxes/
