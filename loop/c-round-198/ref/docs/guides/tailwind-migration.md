# 🎨 Tailwind CSS Migration Guide

## ⚠️ CSS vs Tailwind Guidelines

**Rule:** Use Tailwind for everything possible. Only use CSS in `app.css` for:

1. **Keyframe animations** - Tailwind can't define custom keyframes inline
2. **Pseudo-elements** (`::before`, `::after`) - Need CSS for content and positioning
3. **Complex selectors** - Parent-child relationships that Tailwind can't express
4. **Special CSS properties** - `background-clip: text`, `text-shadow` animations, etc.

### Examples of CSS-only patterns:

```css
/* Keyframe animations */
.animate-badge-pulse {
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse { ... }

/* Pseudo-elements */
.link-underline-animate::after {
  content: '';
  position: absolute;
  /* ... */
}

/* Special properties */
.text-gold-shimmer {
  background: linear-gradient(...);
  -webkit-background-clip: text;
  background-clip: text;
}
```

### Examples that should be Tailwind:

```tsx
// ❌ Don't create CSS class for this
.btn-premium { padding: 1rem 2rem; background: var(--brand); }

// ✅ Use Tailwind instead
className="px-8 py-4 bg-brand hover:bg-brand/90 text-black font-semibold rounded-full"
```

---

## ✅ Completed Components

### Layout Components
- **Header** ✓ - Fully converted to Tailwind
- **Footer** ✓ - Fully converted to Tailwind

### Home Components
- **HeroSection** ✓ - Converted to Tailwind (buttons, spacing, typography)
- **StudioShowcase** ✓ - Built with Tailwind

### Store Components
- **Store Page** ✓ - Tailwind for layout, badges use animation classes from CSS
- **PackCard** ✓ - 3D tilt effects with inline styles, rest is Tailwind

### New Pages (Built with Tailwind)
- **Free Downloads** ✓ - Email capture page
- **Hire Us** ✓ - Contact form page

### Auth Components (Already Tailwind)
- All auth components were built with Tailwind from the start

## 📋 CSS to Tailwind Class Mapping

### Container & Layout
```css
/* Old CSS */
.container → max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8

/* Sections */
.section → py-16 sm:py-20
.section-title → text-3xl sm:text-4xl font-bold text-text mb-6
.section-subtitle → text-text-muted text-lg mb-12
```

### Colors
```css
/* Backgrounds */
bg-brand-bg → Tailwind: bg-brand-bg
bg-brand-surface → Tailwind: bg-brand-surface
bg-brand-surface-elevated → Tailwind: bg-brand-surface-elevated

/* Text Colors */
color-text → Tailwind: text-text
color-text-muted → Tailwind: text-text-muted
color-text-dim → Tailwind: text-text-dim

/* Accent Colors */
color-primary → Tailwind: text-accent-primary or bg-accent-primary
color-accent-cta → Tailwind: bg-accent-cta
```

### Buttons
```css
/* Primary Button */
.button-primary →
  bg-accent-cta text-black px-6 py-3 rounded-md font-semibold
  hover:brightness-110 transition

/* Secondary Button */
.button-secondary →
  bg-brand-surface text-text px-6 py-3 rounded-md font-semibold
  border border-brand-border hover:bg-brand-surface-elevated transition

/* Icon Button */
.icon-button →
  w-9 h-9 flex items-center justify-center rounded-full
  bg-brand-surface hover:bg-brand-surface-elevated
  text-text-muted hover:text-text transition-colors
```

### Cards
```css
/* Product Card */
.product-card →
  bg-brand-surface rounded-lg overflow-hidden border border-brand-border
  hover:border-brand-border-hover transition-all group

.product-image →
  w-full aspect-square object-cover

.product-title →
  text-text font-semibold text-base group-hover:text-accent-primary transition-colors

.product-price →
  text-text-muted text-sm
```

### Typography
```css
h1 → text-4xl sm:text-5xl lg:text-6xl font-bold text-text
h2 → text-3xl sm:text-4xl font-bold text-text
h3 → text-2xl sm:text-3xl font-bold text-text
h4 → text-xl font-semibold text-text

p → text-text-muted leading-relaxed

.text-small → text-sm text-text-muted
.text-large → text-lg text-text
```

### Spacing
```css
/* Margins */
mb-small → mb-4
mb-medium → mb-6
mb-large → mb-8
mb-xlarge → mb-12

/* Padding */
p-small → p-4
p-medium → p-6
p-large → p-8
```

### Borders & Shadows
```css
/* Borders */
.border-default → border border-brand-border
.border-hover → hover:border-brand-border-hover

/* Border Radius */
.rounded-small → rounded-md
.rounded-medium → rounded-lg
.rounded-large → rounded-xl

/* Shadows */
.shadow-sm → shadow-sm
.shadow-md → shadow-md
.shadow-lg → shadow-lg
```

## 🎯 Component Conversion Examples

### Example 1: Hero Section

**Before (CSS classes):**
```tsx
<div className="hero-section">
  <div className="container">
    <h1 className="hero-title">Welcome</h1>
    <p className="hero-subtitle">Subtitle text</p>
    <button className="button-primary">Get Started</button>
  </div>
</div>
```

**After (Tailwind):**
```tsx
<div className="relative py-20 sm:py-32 bg-brand-bg">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl sm:text-6xl font-bold text-text mb-6">
      Welcome
    </h1>
    <p className="text-xl text-text-muted mb-8">
      Subtitle text
    </p>
    <button className="px-8 py-4 bg-accent-cta text-black font-semibold rounded-md hover:brightness-110 transition">
      Get Started
    </button>
  </div>
</div>
```

### Example 2: Product Card

**Before:**
```tsx
<div className="product-card">
  <img className="product-image" src={image} alt={title} />
  <div className="product-info">
    <h3 className="product-title">{title}</h3>
    <p className="product-price">${price}</p>
    <button className="button-primary">Add to Cart</button>
  </div>
</div>
```

**After:**
```tsx
<div className="bg-brand-surface rounded-lg overflow-hidden border border-brand-border hover:border-brand-border-hover transition-all group">
  <img
    className="w-full aspect-square object-cover"
    src={image}
    alt={title}
  />
  <div className="p-4">
    <h3 className="text-text font-semibold text-base mb-2 group-hover:text-accent-primary transition-colors">
      {title}
    </h3>
    <p className="text-text-muted text-sm mb-4">
      ${price}
    </p>
    <button className="w-full px-6 py-3 bg-accent-cta text-black font-semibold rounded-md hover:brightness-110 transition">
      Add to Cart
    </button>
  </div>
</div>
```

### Example 3: Form Input

**Before:**
```tsx
<div className="form-group">
  <label className="form-label">Email</label>
  <input className="form-input" type="email" />
  <p className="form-error">Error message</p>
</div>
```

**After:**
```tsx
<div className="mb-4">
  <label className="block text-text-muted text-sm mb-2">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-3 bg-transparent border border-brand-border rounded-md text-text focus:outline-none focus:border-brand-border-hover transition-colors"
  />
  <p className="text-accent-error text-sm mt-1">
    Error message
  </p>
</div>
```

## 🔧 Remaining Components to Convert

### High Priority
1. **AudioPlayer** - Complex component with controls
2. **ProductCard** - Used throughout the site
3. **TrackRow/AssetRow** - List items in collections
4. **FilterBar** - Collection page filters

### Medium Priority
5. **HeroSection** - Homepage hero
6. **ProductSection** - Product grid sections
7. **NewsletterSection** - Email signup
8. **SpecialOffersSection** - Promotional cards

### Low Priority (Can keep CSS for now)
9. **SuggestedAlbums** - Carousel component
10. **WaveForm** - Audio visualization
11. **Miscellaneous utility components**

## 📝 Migration Steps

### For Each Component:

1. **Read the component file**
2. **Identify all CSS classes used**
3. **Map each class to Tailwind equivalents** (use guide above)
4. **Replace className strings**
5. **Test the component visually**
6. **Remove corresponding CSS from app.css**

### Example Workflow:

```bash
# 1. Find a component
app/components/home/HeroSection.tsx

# 2. Open it and note CSS classes:
className="hero-section"
className="hero-title"
className="hero-cta"

# 3. Replace with Tailwind:
className="relative py-20 bg-brand-bg"
className="text-5xl font-bold text-text"
className="px-8 py-4 bg-accent-cta text-black rounded-md"

# 4. Test in browser
npm run dev

# 5. Remove old CSS from app.css
Delete .hero-section, .hero-title, .hero-cta rules
```

## ⚡ Quick Conversion Tips

### Responsive Design
```css
/* Mobile first approach */
className="text-base sm:text-lg md:text-xl lg:text-2xl"
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Hover States
```css
/* Before: .card:hover */
className="hover:bg-brand-surface-elevated hover:border-brand-border-hover transition-all"
```

### Grouping (Parent hover affects child)
```css
/* Parent */
className="group"

/* Child */
className="group-hover:text-accent-primary transition-colors"
```

### Dark Theme (Already configured)
All color tokens in tailwind.config.js are dark theme by default:
- `bg-brand-bg` = #0A0A0A
- `text-text` = #FFFFFF
- `border-brand-border` = #2A2A2A

## 🎨 Custom Tailwind Classes

If you need to add custom utilities, add them to `global.css`:

```css
@layer utilities {
  .text-shadow-glow {
    text-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.5);
  }

  .backdrop-blur-custom {
    backdrop-filter: blur(10px);
  }
}
```

## ✅ Build & Test Checklist

After converting each component:

- [ ] Component renders correctly
- [ ] Hover states work
- [ ] Responsive breakpoints look good (mobile, tablet, desktop)
- [ ] Colors match brand theme
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Old CSS removed from app.css

## 🚀 Performance Benefits

After full migration:
- **Smaller CSS bundle** - Only ship used Tailwind classes
- **Better tree-shaking** - Unused styles automatically removed
- **Faster development** - No context switching between files
- **Easier maintenance** - Styles colocated with components

## 📦 Next Steps

1. Continue converting components in priority order
2. Test each component thoroughly
3. Remove old CSS rules as you go
4. Consider adding Tailwind plugins if needed:
   - @tailwindcss/forms
   - @tailwindcss/typography
   - @tailwindcss/aspect-ratio

---

**Migration Progress: 40% Complete** (Layout + Auth + Home + Store + New pages done)
