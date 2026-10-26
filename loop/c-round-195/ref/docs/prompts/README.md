# 📚 Prompt Library

> Premium E-Commerce პროექტების შექმნის prompt კოლექცია

---

## 🗂 Structure

```
docs/prompts/
├── README.md                    # ეს ფაილი
├── genesis-prompt.md            # მასტერ პრომპტი - სრული პროექტი
├── vision-framework.md          # Vision-First მეთოდოლოგია
├── quick-start-prompt.md        # სწრაფი დაწყების პრომპტი
├── shopify-remix-template.md    # Shopify + Remix template
│
├── modules/                     # მოდულური პრომპტები
│   ├── auth-system.prompt.md    # ავტორიზაციის სისტემა
│   ├── cart-checkout.prompt.md  # Cart & Checkout
│   ├── design-system.prompt.md  # Tailwind Design System
│   └── analytics.prompt.md      # GA4, Pixel, GDPR
│
├── industry-kits/               # ინდუსტრიის შაბლონები
│   ├── music-audio-store.md     # 🎵 Music & Audio
│   ├── fashion-apparel.md       # 👗 Fashion
│   ├── digital-products.md      # 📚 Courses & Digital
│   └── food-delivery.md         # 🍕 Food & Delivery
│
└── project-specific/            # CZABA-ს პრომპტები
    ├── prompt-template.txt      # დავალების შაბლონი
    ├── prompt.txt               # მიმდინარე დავალება
    └── vision.txt               # CZABA vision მანიფესტი
```

---

## 🚀 Quick Start

### ახალი პროექტის დაწყება

1. **Vision-First Framework** (`vision-framework.md`)
   - შეავსე Vision Discovery კითხვარი
   - განსაზღვრე brand identity და audience

2. **Genesis Prompt** (`genesis-prompt.md`)
   - შეავსე placeholders vision-დან
   - გაუშვი Claude-ში სრული პროექტის დასაგენერირებლად

### არსებულ პროექტზე ფუნქციის დამატება

გამოიყენე შესაბამისი მოდული:

| საჭიროება | მოდული |
|-----------|--------|
| Auth სისტემა | `modules/auth-system.prompt.md` |
| Shopping Cart | `modules/cart-checkout.prompt.md` |
| Design System | `modules/design-system.prompt.md` |
| Analytics | `modules/analytics.prompt.md` |

### ინდუსტრია-სპეციფიური პროექტი

აირჩიე starter kit:

| ინდუსტრია | Kit |
|-----------|-----|
| 🎵 მუსიკა/აუდიო | `industry-kits/music-audio-store.md` |
| 👗 ტანსაცმელი | `industry-kits/fashion-apparel.md` |
| 📚 ციფრული პროდუქტები | `industry-kits/digital-products.md` |
| 🍕 საკვები/მიტანა | `industry-kits/food-delivery.md` |

---

## 📝 Prompt Usage Examples

### მაგალითი 1: სრული პროექტი
```
"შექმენი premium music store genesis-prompt.md-ის მიხედვით.
Brand: SOUNDWAVE
Primary: #8b5cf6
Theme: Dark cinematic"
```

### მაგალითი 2: მოდულის დამატება
```
"დაამატე authentication სისტემა auth-system.prompt.md-ის მიხედვით.
Social login: მხოლოდ Google"
```

### მაგალითი 3: ინდუსტრია-სპეციფიური
```
"შექმენი fashion store fashion-apparel.md starter kit-ის მიხედვით.
სახელი: LUXE
აუდიტორია: 25-45 premium"
```

---

## 🎯 Best Practices

1. **Vision First** - ყოველთვის დაიწყე vision-framework.md-ით
2. **Specific > Generic** - გამოიყენე industry kit, თუ შეესაბამება
3. **Modular** - დიდი პროექტი დაყავი მოდულებად
4. **Iterate** - პირველი შედეგი არ არის საბოლოო

---

## 📦 Tech Stack (Default)

ყველა პრომპტი იყენებს:

```
Framework:    Remix 2.x + React 18 + TypeScript
Styling:      Tailwind CSS v4 (@theme)
E-Commerce:   Shopify Storefront API
Auth:         Shopify Customer + Firebase (social)
Hosting:      Vercel / Cloudflare
```

---

## 📐 Design System Documentation

> ⚠️ **AI ASSISTANTS**: ყოველთვის წაიკითხე ეს ფაილები სტილის დაწერამდე!

| ფაილი | აღწერა |
|-------|--------|
| `docs/design/DESIGN_SYSTEM.md` | **Single Source of Truth** - tokens, spacing, colors, typography |
| `docs/design/design-systems-reference.md` | კონკურენტების ანალიზი (Spotify, Epidemic, Splice) |
| `app/styles/app.css` | @theme tokens implementation |

### Quick Reference

```css
/* Spacing: 4px base */
spacing-1 → 4px    spacing-4 → 16px    spacing-8 → 32px

/* Colors */
--color-brand: #13D9CC (cyan)
--color-accent: #F9A80C (orange)
--color-background: hsl(220, 20%, 4%)

/* Fonts */
Headlines: Playfair Display (serif)
Body: Inter (sans-serif)

/* Border Radius */
--radius-md: 8px (buttons)
--radius-lg: 12px (cards)
```

### Rules for AI
1. **არასოდეს** გამოიყენო arbitrary pixel values - მხოლოდ tokens
2. **ყოველთვის** შეამოწმე DESIGN_SYSTEM.md კომპონენტის დაწერამდე
3. **გამოიყენე** semantic colors (brand, muted, destructive)
4. **დაიცავი** spacing scale - 4, 8, 12, 16, 20, 24, 32...

---

## 🔄 Changelog

| თარიღი | ცვლილება |
|--------|----------|
| 2025-01-03 | Design System v1.0 docs integration |
| 2025-01-03 | Prompt Library v1.0 - ყველა მოდული და kit |
| 2025-01-03 | Vision-First Framework დამატება |
| 2025-01-03 | Industry Kits (Music, Fashion, Digital, Food) |
