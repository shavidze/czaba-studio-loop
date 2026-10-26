---
name: ga4-analytics
description: Google Analytics 4 event tracking - page views, e-commerce events, custom Studio events. Use when implementing analytics, tracking user actions, or adding e-commerce conversion tracking.
---

# Google Analytics 4 (GA4)

GA4 event tracking for CZABA - page views, e-commerce, custom events.

## Setup

GTM script tag with `G-XXXXXXXXXX` measurement ID. Consent-gated via `localStorage.analytics_consent`.

## Event Naming Conventions

| Category | Event Name | Parameters |
|----------|------------|------------|
| E-commerce | `view_item`, `add_to_cart`, `purchase` | Standard GA4 |
| Studio | `studio_open`, `stem_toggle`, `mixdown_export` | Custom |
| Audio | `audio_play`, `audio_pause`, `audio_complete` | Custom |
| Navigation | `page_view` | Standard GA4 |
| Search | `search` | Standard GA4 |

## Key Concepts

- **AnalyticsService** — singleton class, consent-gated (`hasConsent()`)
- **Page views** — tracked in `root.tsx` via `useLocation()` hook
- **E-commerce flow** — `view_item` → `add_to_cart` → `begin_checkout` → `purchase`
- **Consent** — `CookieConsent` component sets `analytics_consent` in localStorage
- **Debug mode** — `debug_mode: true` in dev environment

## Implementation Details

Full AnalyticsService + events + consent component: `references/events-reference.md`

## References

- [GA4 Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- `docs/technical/features/analytics-ga4.md` - CZABA analytics
