# Design System Module

> მოდულური პრომპტი Tailwind v4 Design System-ის იმპლემენტაციისთვის

---

## 🎨 Prompt: Premium Dark Theme Design System

```markdown
შექმენი Tailwind CSS v4 Design System შემდეგი სპეციფიკაციით:

## @theme Configuration

```css
@import "tailwindcss";

@theme {
  /* ===================================
     COLORS - Dark Cinematic Theme
     =================================== */

  /* Background Layers */
  --color-background: #080a0c;      /* Deepest - page bg */
  --color-surface: #111318;         /* Cards, modals */
  --color-elevated: #191d24;        /* Hover states, elevated cards */
  --color-outline: #272c35;         /* Borders */
  --color-outline-hover: #363d49;   /* Border hover */

  /* Brand Colors */
  --color-brand: [PRIMARY_HEX];              /* Primary action color */
  --color-brand-foreground: [TEXT_ON_PRIMARY]; /* Text on brand */
  --color-accent: [ACCENT_HEX];              /* Secondary accent */

  /* Semantic Colors */
  --color-positive: #00d26a;        /* Success */
  --color-destructive: #ef4343;     /* Error, danger */
  --color-error: #ff6b6b;           /* Error text */
  --color-error-bg: rgba(255, 68, 68, 0.05);
  --color-error-border: rgba(255, 68, 68, 0.2);

  /* Text Colors */
  --color-foreground: #eeeff1;      /* Primary text */
  --color-muted: #818898;           /* Secondary text */

  /* ===================================
     TYPOGRAPHY
     =================================== */

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ===================================
     SPACING
     =================================== */

  --spacing-xs: 0.5rem;    /* 8px */
  --spacing-sm: 1rem;      /* 16px */
  --spacing-md: 1.5rem;    /* 24px */
  --spacing-lg: 2rem;      /* 32px */
  --spacing-xl: 3rem;      /* 48px */
  --spacing-2xl: 4rem;     /* 64px */

  /* ===================================
     BORDER RADIUS
     =================================== */

  --radius-sm: 0.375rem;   /* 6px - small buttons */
  --radius-md: 0.5rem;     /* 8px - inputs */
  --radius-lg: 0.75rem;    /* 12px - cards */
  --radius-xl: 1rem;       /* 16px - modals */
  --radius-2xl: 1.5rem;    /* 24px - large cards */
  --radius-full: 9999px;   /* Pills, avatars */

  /* ===================================
     SHADOWS
     =================================== */

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba([PRIMARY_RGB], 0.3);

  /* ===================================
     CONTAINER WIDTHS
     =================================== */

  --max-width-modal: 420px;
  --max-width-modal-lg: 560px;
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;

  /* ===================================
     TRANSITIONS
     =================================== */

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}
```

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  @apply px-6 py-3 bg-brand text-brand-foreground font-medium
         rounded-xl hover:bg-brand/90 transition-colors
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Secondary Button */
.btn-secondary {
  @apply px-6 py-3 bg-white/5 text-foreground font-medium
         rounded-xl border border-outline hover:bg-white/10
         hover:border-outline-hover transition-colors;
}

/* Ghost Button */
.btn-ghost {
  @apply px-4 py-2 text-muted hover:text-foreground
         hover:bg-white/5 rounded-lg transition-colors;
}

/* Icon Button */
.btn-icon {
  @apply p-2 text-muted hover:text-foreground
         hover:bg-white/5 rounded-lg transition-colors;
}
```

### Form Inputs

```css
/* Text Input */
.input {
  @apply w-full px-4 py-3 bg-white/5 border border-outline
         rounded-xl text-foreground placeholder:text-muted
         focus:outline-none focus:border-brand/50
         focus:ring-1 focus:ring-brand/50 transition-colors;
}

/* Input with error */
.input-error {
  @apply border-error focus:border-error focus:ring-error/50;
}

/* Select */
.select {
  @apply input appearance-none cursor-pointer;
  background-image: url("data:image/svg+xml,...");
  background-position: right 1rem center;
  background-repeat: no-repeat;
}
```

### Cards

```css
/* Base Card */
.card {
  @apply bg-surface border border-outline rounded-xl
         overflow-hidden transition-all;
}

/* Interactive Card */
.card-interactive {
  @apply card hover:border-brand/30 cursor-pointer;
}

/* Elevated Card */
.card-elevated {
  @apply bg-elevated border border-outline rounded-xl
         shadow-md;
}
```

### Modals

```css
/* Modal Backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black/70 backdrop-blur-sm z-50;
}

/* Modal Content */
.modal-content {
  @apply fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
         w-full max-w-modal bg-surface border border-outline
         rounded-2xl p-6 z-50;
}
```

## Utility Classes

```css
/* Text Gradients */
.text-gradient {
  @apply bg-gradient-to-r from-brand to-accent
         bg-clip-text text-transparent;
}

/* Glow Effects */
.glow-brand {
  box-shadow: 0 0 20px rgba(var(--color-brand-rgb), 0.3);
}

/* Glass Effect */
.glass {
  @apply bg-white/5 backdrop-blur-md border border-white/10;
}

/* Skeleton Loading */
.skeleton {
  @apply bg-white/5 animate-pulse rounded;
}
```

## Animation Patterns

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in { animation: fadeIn 0.2s ease-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
```

## Responsive Patterns

```css
/* Container */
.container {
  @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Grid */
.grid-products {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

/* Stack */
.stack {
  @apply flex flex-col gap-4;
}
```

## Dark Mode Best Practices

1. **Layer Backgrounds:** background < surface < elevated
2. **Subtle Borders:** Use outline colors, not stark whites
3. **Muted Secondary Text:** Not too bright, not too dim
4. **Colored Accents Sparingly:** Brand color for CTAs only
5. **Sufficient Contrast:** 4.5:1 minimum for text
6. **Hover States:** Slightly lighter, not color shifts
7. **Focus States:** Ring instead of outline for accessibility

## Framer Motion Integration

```tsx
// Page Transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Stagger Children
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

// Hover Scale
const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};
```

## Color Palette Generator

```
Primary Color: [HEX]
├── brand: [HEX]
├── brand/90: slightly transparent
├── brand/50: 50% opacity
├── brand/20: subtle background
└── brand/10: very subtle

Background Scale:
├── background: hsl(H, S%, 4%)   ← darkest
├── surface: hsl(H, S%, 7%)
├── elevated: hsl(H, S%, 10%)
├── outline: hsl(H, S%, 15%)
└── outline-hover: hsl(H, S%, 20%)
```
```

---

## გამოყენების მაგალითი

```
"დააკონფიგურირე Tailwind v4 Design System design-system.prompt.md-ის მიხედვით.
Primary color: #13ecda (Cyan)
Theme: Dark cinematic
Font: Inter"
```
