# DESIGN_TOKENS

## Czaba Design System

### ფერები

| Token | Hex | გამოყენება |
|-------|-----|------------|
| `brand` | #13D9CC (Teal) | Primary actions, links |
| `accent` | #F9A80C (Orange) | Secondary accent, highlights |
| `background` | Dark theme | Page background |
| `surface` | Elevated dark | Cards, modals |
| `foreground` | 94% lightness | Primary text |
| `muted` | 55% lightness | Secondary text |
| `dim` | 35% lightness | Disabled, hints |

### გამოყენების წესები

```tsx
// სწორი - Design tokens
<div className="bg-brand text-foreground" />
<button className="bg-accent hover:bg-accent/90" />
<p className="text-muted" />

// არასწორი - Hardcoded values
<div style={{ background: '#13D9CC' }} />
<div className="bg-[#F9A80C]" />
<div className="text-gray-500" />
```

### Spacing (4px base)

| Token | Value | გამოყენება |
|-------|-------|------------|
| `p-1` | 4px | Tight spacing |
| `p-2` | 8px | Small elements |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Section spacing |
| `gap-2` | 8px | Element gaps |
| `gap-4` | 16px | Standard gaps |

```tsx
// სწორი
<div className="p-4 gap-2" />
<div className="space-y-6" />

// არასწორი
<div className="p-[15px]" />
<div style={{ padding: '17px' }} />
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headlines | Playfair Display | 700 | 2xl-4xl |
| Body | Inter | 400 | base |
| UI Labels | Inter | 500 | sm |

```tsx
// Headlines
<h1 className="font-serif text-4xl font-bold" />

// Body
<p className="font-sans text-base" />

// UI
<label className="font-sans text-sm font-medium" />
```

### Border Radius

| Token | Value |
|-------|-------|
| `rounded-sm` | 6px |
| `rounded` | 8px |
| `rounded-lg` | 12px |
| `rounded-xl` | 16px |
| `rounded-full` | 9999px |

### Shadows

```tsx
// Elevation levels
<div className="shadow-sm" />   // Subtle
<div className="shadow-md" />   // Cards
<div className="shadow-lg" />   // Modals
<div className="shadow-glow" /> // Special (brand color)
```

### WCAG AA Compliance

- **Text contrast:** 4.5:1 minimum
- **UI contrast:** 3:1 minimum
- **Touch targets:** 44×44px minimum
- **Focus states:** visible focus ring on all interactive elements

```tsx
// Focus states
<button className="focus-visible:ring-2 focus-visible:ring-brand" />
```

### Dark Theme Philosophy

Czaba იყენებს მუქ თემას "cinematic" განცდისთვის:
- Blue undertone backgrounds
- Teal + Orange complementary scheme
- High contrast for readability
- Glow effects for premium feel
