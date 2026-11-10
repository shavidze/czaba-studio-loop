# Design System Audit

შეამოწმე მითითებული კომპონენტი ან გვერდი CZABA დიზაინ სისტემასთან შესაბამისობაზე.

## აუდიტის ჩეკლისტი

### 1. ფერები
- [ ] მხოლოდ ტოკენები გამოყენებულია (არა hex/rgb პირდაპირ)
- [ ] `--color-brand` (#13D9CC) მხოლოდ primary actions-ზე
- [ ] `--color-accent` (#F9A80C) მხოლოდ secondary accent-ზე
- [ ] ტექსტი: `foreground` (94%), `muted` (55%), `dim` (35%)
- [ ] Background: `background` (4%), `surface` (8%), `elevated` (12%)
- [ ] არ არის pure white (#FFF) ან pure black (#000)

### 2. Spacing (4px base)
- [ ] მხოლოდ spacing tokens: 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px)...
- [ ] Component padding: spacing-4 to spacing-6
- [ ] Section padding: spacing-12 to spacing-20
- [ ] Card padding: spacing-5 ან spacing-6
- [ ] არ არის arbitrary values (23px, 17px...)

### 3. Typography
- [ ] `font-serif` (Playfair) მხოლოდ headlines
- [ ] `font-sans` (Inter) ყველგან სხვაგან
- [ ] Font sizes მხოლოდ scale-დან: xs(12), sm(14), base(16), lg(20), xl(24)...
- [ ] Weights: 400(body), 500(UI), 600(headlines/buttons), 700(hero)

### 4. Border Radius
- [ ] `radius-sm` (6px) - small elements, tags
- [ ] `radius-md` (8px) - buttons, inputs
- [ ] `radius-lg` (12px) - cards, modals
- [ ] `radius-xl` (16px) - large cards
- [ ] არ არის შერეული radius-ები ერთ კომპონენტში

### 5. Animation
- [ ] `duration-fast` (150ms) - hover states
- [ ] `duration-normal` (250ms) - modals, dropdowns
- [ ] `duration-slow` (400ms) - page transitions
- [ ] `ease-out` - ძირითადი easing
- [ ] არ არის linear ანიმაციები

### 6. WCAG Accessibility
- [ ] Text contrast minimum 4.5:1
- [ ] Large text (18px+) minimum 3:1
- [ ] UI components minimum 3:1
- [ ] Focus states ყველა interactive element-ზე
- [ ] Touch targets minimum 44x44px

### 7. კომპონენტები (UI Library)
- [ ] Button: გამოყენებულია `~/components/ui/Button`
- [ ] Input: გამოყენებულია `~/components/ui/Input`
- [ ] Card: გამოყენებულია `~/components/ui/Card`
- [ ] Modal: გამოყენებულია `~/components/ui/Modal`
- [ ] IconButton: გამოყენებულია `~/components/ui/IconButton`

---

## ფერთა პალიტრა (სწრაფი რეფერენსი)

```
Backgrounds:
  background:    hsl(220, 20%, 4%)    #0A0B0F
  surface:       hsl(220, 18%, 8%)    #121318
  elevated:      hsl(220, 18%, 12%)   #1A1B21

Borders:
  outline:       hsl(220, 15%, 18%)   #292B33
  outline-hover: hsl(220, 15%, 25%)   #3B3E47

Brand:
  brand:         hsl(175, 85%, 46%)   #13D9CC (Teal)
  brand-hover:   hsl(175, 85%, 52%)   #1EEADB
  accent:        hsl(38, 95%, 55%)    #F9A80C (Orange)

Text:
  foreground:    hsl(220, 10%, 94%)   #EEEEF0
  muted:         hsl(220, 10%, 55%)   #85858F
  dim:           hsl(220, 10%, 35%)   #54545C

Semantic:
  positive:      #00D26A
  destructive:   hsl(0, 84%, 60%)
  warning:       #F59E0B
  buy:           #006AFF
```

---

## Button Variants

| Variant | გამოყენება |
|---------|-----------|
| `primary` | Revenue actions: Add to Cart, Buy Now, Submit |
| `secondary` | Supporting: Cancel, Back |
| `ghost` | Tertiary: Learn More, Skip |
| `accent` | Special promotions |

---

## Card Variants

| Variant | გამოყენება |
|---------|-----------|
| `default` | Standard cards (surface + border) |
| `elevated` | Prominent content (shadow) |
| `outline` | Form sections (transparent + 2px border) |
| `interactive` | Clickable cards (hover effects) |

---

## Input Variants

| Variant | გამოყენება |
|---------|-----------|
| `default` | Standard forms (surface bg) |
| `filled` | Elevated contexts |

---

## Modal Sizes

| Size | Width | გამოყენება |
|------|-------|-----------|
| `sm` | 360px | Confirmations, alerts |
| `md` | 420px | Forms, auth (default) |
| `lg` | 560px | Complex forms |
| `xl` | 720px | Large content |

---

## Brand Vision (მოკლედ)

- **არა:** "აუდიო ფაილების სუპერმარკეტი"
- **კი:** "კურატორული არტ-გალერეა კინემატოგრაფისტებისთვის"
- **თემა:** მუქი, კინემატოგრაფიული, მინიმალისტური
- **Negative space:** ბევრი სუნთქვა
- **ანიმაციები:** მდოვრე, 800ms+, ease-out
- **ვყიდით:** ასპირაციას და შედეგს, არა ფაილებს

---

## აუდიტის პროცესი

1. წაიკითხე მითითებული ფაილი/კომპონენტი
2. შეამოწმე თითოეული პუნქტი ზემოთ მოცემული ჩეკლისტიდან
3. დააფიქსირე პრობლემები კატეგორიების მიხედვით
4. შესთავაზე კონკრეტული გამოსწორებები კოდით

თუ $ARGUMENTS ცარიელია, მკითხე რომელი კომპონენტი ან გვერდი შევამოწმო.
