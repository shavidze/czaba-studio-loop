# New Store Feature

ახალი feature-ის შესაქმნელად გამოიყენე ეს primitives:

## გამოსაყენებელი Primitives

1. `primitives/FORWARDREF_COMPONENT.md` - UI კომპონენტები
2. `primitives/TAILWIND_FIRST.md` - არა hardcoded ფერები
3. `primitives/DESIGN_TOKENS.md` - ფერები, spacing
4. `primitives/REACT_CONTEXT.md` - თუ state საჭიროა
5. `AGENTS.md` (TypeScript strict rules) - Types

## თუ Audio/Studio feature:

6. `primitives/AUDIO_ARCHITECTURE.md` - 3-layer system

## შესაქმნელი ფაილები

1. **Components:** `app/components/[feature]/`
2. **Context (optional):** `app/contexts/[Feature]Context.tsx`
3. **Hooks:** `app/hooks/use[Feature].ts`
4. **Types:** `app/types/[feature].ts`
5. **Route (optional):** `app/routes/[feature].tsx`

## Checklist

- [ ] Tailwind-first (no custom CSS)
- [ ] Design tokens (no hardcoded colors)
- [ ] TypeScript strict (no any)
- [ ] forwardRef UI კომპონენტებისთვის
- [ ] useCallback context actions-ისთვის
