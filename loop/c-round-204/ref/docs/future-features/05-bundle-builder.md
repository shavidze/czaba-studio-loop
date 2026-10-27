# Bundle Builder - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🟢 დაბალი
> სავარაუდო დრო: 1 კვირა

---

## Overview

მომხმარებელს შეუძლია აარჩიოს რამდენიმე pack და მიიღოს bundle discount.

---

## User Stories

### US-1: Bundle-ის შექმნა

```
როგორც: მომხმარებელი
მინდა: ავარჩიო 3+ pack და მივიღო discount
რათა: დავზოგო ფული ბევრი პროდუქტის ყიდვისას
```

**Acceptance Criteria:**
- [ ] "Build Your Bundle" გვერდი
- [ ] პროდუქტების არჩევა (checkboxes)
- [ ] Real-time price calculation
- [ ] Discount tiers visualization
- [ ] "Add Bundle to Cart" button

---

### US-2: Discount Tiers

```
როგორც: მომხმარებელი
მინდა: ვნახო რამდენს დავზოგავ
რათა: მივიღო საუკეთესო deal
```

**Acceptance Criteria:**
- [ ] 3 packs → 10% off
- [ ] 5 packs → 15% off
- [ ] 7+ packs → 20% off
- [ ] Progress indicator ("Add 2 more for 15% off!")

---

## UI Design

### Bundle Builder Page

```
┌─────────────────────────────────────────────────┐
│  BUILD YOUR BUNDLE                              │
│  Select 3+ packs and save up to 20%            │
├─────────────────────────────────────────────────┤
│                                                 │
│  [ ] Pack 1 ............... $29                │
│  [✓] Pack 2 ............... $49                │
│  [✓] Pack 3 ............... $39                │
│  [✓] Pack 4 ............... $29                │
│  [ ] Pack 5 ............... $49                │
│                                                 │
├─────────────────────────────────────────────────┤
│  Selected: 3 packs                              │
│  Subtotal: $117                                 │
│  Discount (10%): -$11.70                        │
│  ─────────────────                              │
│  Total: $105.30                                 │
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │ Add 2 more packs for 15% off! ████░░│       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  [ ADD BUNDLE TO CART ]                         │
└─────────────────────────────────────────────────┘
```

---

## Technical Design

### Discount Logic

```typescript
function calculateBundleDiscount(itemCount: number): number {
  if (itemCount >= 7) return 0.20; // 20%
  if (itemCount >= 5) return 0.15; // 15%
  if (itemCount >= 3) return 0.10; // 10%
  return 0;
}
```

### Shopify Implementation Options

**Option A: Automatic Discounts**
- Shopify Admin → Discounts → Automatic
- "Buy X get Y% off"
- Pros: Native, no code
- Cons: Limited flexibility

**Option B: Discount Codes**
- Generate unique code per bundle
- Apply at checkout
- Pros: Trackable
- Cons: Extra step for user

**Option C: Custom Cart Logic**
- Calculate discount in cart
- Apply as line item discount
- Pros: Full control
- Cons: Development effort

---

## Launch Checklist

1. [ ] Design bundle builder page
2. [ ] Create product selection UI
3. [ ] Implement discount calculation
4. [ ] Setup Shopify automatic discounts
5. [ ] Add "Build Bundle" to navigation
6. [ ] Test checkout flow
7. [ ] Deploy

---

*Created: 2026-01-10*
