---
name: tailwind-v4
description: Tailwind CSS v4 with CSS-first configuration and CZABA design tokens. Use when styling components, working with colors/spacing/typography, or applying design system tokens.
---

# Tailwind CSS v4

Tailwind CSS v4 for CZABA - new CSS-first configuration, design tokens, and best practices.

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `background` | #0a0a0a | Page background |
| `foreground` | #e5e5e5 | Primary text |
| `surface` | #141414 | Card/panel bg |
| `elevated` | #1e1e1e | Hover states |
| `border` | #262626 | Borders |
| `brand` | #13D9CC | Primary actions |
| `accent` | #F9A80C | Highlights |
| `error` | #EF4444 | Error states |
| `success` | #22C55E | Success states |

**Fonts:** `font-sans` (Inter), `font-serif` (Playfair Display)
**Spacing:** 4px base system (1=4px, 2=8px, 4=16px, 6=24px, 8=32px)
**Radius:** sm=6px, md=8px, lg=12px
**Duration:** fast=150ms, normal=250ms

## Rules

- Use design tokens, not hardcoded colors: `bg-brand` not `bg-[#13D9CC]`
- Use spacing scale: `p-4` not `p-[15px]`
- Dark theme is default
- No inline styles, no `!important`, no arbitrary values
- Use `cn()` helper for conditional classes
- Mobile-first responsive: `md:`, `lg:`, `xl:`

## Common Mistakes

```tsx
// Wrong
<div className="p-[17px] text-[#123456]" />
<div className="p-4" style={{ marginTop: '20px' }} />

// Correct
<div className="p-4 text-brand" />
<div className="p-4 mt-5" />
```

## Implementation Details

Full component patterns and CSS config: `references/component-patterns.md`

## References

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- `docs/design/DESIGN_SYSTEM.md` - CZABA design tokens
- `.claude/primitives/TAILWIND_FIRST.md` - Styling rules
