---
name: facebook-pixel
description: Facebook/Meta Pixel for conversion tracking, retargeting audiences, and e-commerce events. Use when implementing Facebook tracking, ad conversion, or marketing pixel integration.
---

# Facebook Pixel

Facebook Pixel for conversion tracking, retargeting, and lookalike audiences.

## Key Concepts

- **FacebookPixelService** — singleton class, consent-gated (`marketing_consent`)
- **Standard events** — `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Lead`, `CompleteRegistration`, `Search`
- **Custom events** — `StudioOpen`, `MixdownExport`, `AudioPreview`, `LicenseSelect`
- **Page views** — tracked in `root.tsx` via `useLocation()` hook
- **E-commerce flow** — `ViewContent` → `AddToCart` → `InitiateCheckout` → `Purchase`

## Retargeting Audiences

| Audience | Event | Window |
|----------|-------|--------|
| Site visitors | PageView | 180 days |
| Product viewers | ViewContent | 30 days |
| Cart abandoners | AddToCart (no Purchase) | 14 days |
| Purchasers | Purchase | 180 days |
| Studio users | StudioOpen | 60 days |

## Implementation Details

Full FacebookPixelService + events + e-commerce hook: `references/pixel-implementation.md`

## References

- [Facebook Pixel Docs](https://developers.facebook.com/docs/meta-pixel)
- [Standard Events](https://developers.facebook.com/docs/meta-pixel/reference)
- `docs/technical/features/facebook-pixel.md` - CZABA pixel setup
