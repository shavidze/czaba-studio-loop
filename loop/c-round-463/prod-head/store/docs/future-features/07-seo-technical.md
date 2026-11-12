# Technical SEO - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🔴 მაღალი
> დამოკიდებულება: დომეინის შეძენა (czaba.com)
> სავარაუდო დრო: 1 დღე

---

## Overview

Google და სხვა search engine-ებისთვის საიტის ოპტიმიზაცია. SIZMARA პროექტში უკვე დაწერილია - იგივე პრინციპები.

**რეფერენსი:** `C:/music-store/sizmara/docs/technical/SEO.md`

---

## რა აკლია CZABA-ს

### Critical (დომეინის შემდეგ დაუყოვნებლივ)

| კომპონენტი | სტატუსი | აღწერა |
|------------|---------|--------|
| robots.txt | ❌ | Search engine-ებს უთითებს რა დაინდექსონ |
| sitemap.xml | ❌ | ყველა გვერდის სია Google-სთვის |
| Canonical URLs | ❌ | Duplicate content-ის თავიდან აცილება |

### Important

| კომპონენტი | სტატუსი | აღწერა |
|------------|---------|--------|
| JSON-LD Schema | ❌ | Structured data (Store, Product) |
| og:image dimensions | ⚠️ | og:image:width/height არ აქვს |

### Nice-to-have

| კომპონენტი | სტატუსი | აღწერა |
|------------|---------|--------|
| PWA manifest.json | ❌ | "Add to Home Screen" |
| apple-touch-icon | ❌ | iOS home screen icon |

---

## Implementation Plan

### 1. robots.txt

```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /studio/

Sitemap: https://czaba.com/sitemap.xml
```

**შენიშვნა:** `/studio/` დაბლოკილია - authenticated გვერდია.

### 2. sitemap.xml (Dynamic Route)

Remix-ში dynamic sitemap: `app/routes/sitemap[.]xml.tsx`

```typescript
export async function loader() {
  const products = await ProductService.getAllHandles();

  const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/store', priority: 0.9 },
    { url: '/about', priority: 0.7 },
    { url: '/faq', priority: 0.5 },
    { url: '/hire-us', priority: 0.6 },
  ];

  const productPages = products.map(handle => ({
    url: `/products/${handle}`,
    priority: 0.8,
  }));

  // Generate XML...
}
```

### 3. JSON-LD Schemas

#### Store Schema (root.tsx)
```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "CZABA",
  "description": "Premium Cinematic Sound Design",
  "url": "https://czaba.com",
  "logo": "https://czaba.com/logo.png",
  "sameAs": [
    "https://instagram.com/czaba",
    "https://youtube.com/czaba"
  ]
}
```

#### Product Schema (products.$handle.tsx)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Middle East Pack",
  "description": "...",
  "image": "https://czaba.com/images/packs/middle-east.png",
  "brand": { "@type": "Brand", "name": "CZABA" },
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

### 4. Canonical URLs

root.tsx-ში meta function:
```typescript
{ rel: 'canonical', href: `https://czaba.com${pathname}` }
```

---

## Launch Checklist

- [ ] დომეინი შეძენილი და configured
- [ ] `public/robots.txt` შექმნა
- [ ] `app/routes/sitemap[.]xml.tsx` შექმნა
- [ ] JSON-LD Store schema root.tsx-ში
- [ ] JSON-LD Product schema products.$handle.tsx-ში
- [ ] Canonical URLs ყველა გვერდზე
- [ ] Google Search Console-ში დარეგისტრირება
- [ ] sitemap.xml submit Search Console-ში
- [ ] Rich Results Test გატარება

---

## Testing Tools

| ინსტრუმენტი | მისამართი |
|-------------|-----------|
| Google PageSpeed | pagespeed.web.dev |
| Meta Tags Preview | metatags.io |
| Schema Validator | validator.schema.org |
| Rich Results Test | search.google.com/test/rich-results |
| Google Search Console | search.google.com/search-console |

---

*რეფერენსი: SIZMARA SEO implementation*
