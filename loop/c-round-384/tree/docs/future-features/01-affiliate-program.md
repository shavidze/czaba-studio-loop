# Affiliate Program - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🟡 საშუალო (Launch-ის შემდეგ)
> სავარაუდო დრო: 1-2 კვირა

---

## Overview

Affiliate Program საშუალებას აძლევს creators/influencers-ს გაავრცელონ CZABA პროდუქტები და მიიღონ კომისია ყოველ გაყიდვაზე.

---

## User Stories

### US-1: Affiliate რეგისტრაცია

```
როგორც: Content Creator
მინდა: დავრეგისტრირდე Affiliate პროგრამაში
რათა: მივიღო უნიკალური referral link და კომისია
```

**Acceptance Criteria:**
- [ ] ცალკე registration form (არა Shopify customer account)
- [ ] საჭირო ველები: სახელი, email, PayPal/Stripe email, social media links
- [ ] Application review process (manual approval)
- [ ] Approval email უნიკალური link-ით

---

### US-2: Affiliate Dashboard

```
როგორც: დამტკიცებული Affiliate
მინდა: ვნახო ჩემი სტატისტიკა
რათა: ვიცოდე რამდენი გავყიდე და რამდენს მივიღებ
```

**Acceptance Criteria:**
- [ ] Dashboard გვერდი: `/affiliate/dashboard`
- [ ] ჩანს: Total clicks, Conversions, Pending earnings, Paid earnings
- [ ] Unique referral link: `czaba.com?ref=USERNAME`
- [ ] Custom promo code: `CREATOR20`
- [ ] Marketing materials download (banners, logos)

---

### US-3: Referral Tracking

```
როგორც: სისტემა
მინდა: ვაკონტროლო referral clicks და purchases
რათა: სწორად გავანაწილო კომისიები
```

**Acceptance Criteria:**
- [ ] URL parameter tracking (`?ref=USERNAME`)
- [ ] Cookie storage (30 დღე)
- [ ] Order-ზე affiliate attribution
- [ ] Duplicate/fraud detection

---

### US-4: Commission Payout

```
როგორც: Affiliate
მინდა: მივიღო ჩემი კომისია
რათა: გამომადგეს ჩემი მარკეტინგული ძალისხმევა
```

**Acceptance Criteria:**
- [ ] Minimum payout threshold: $50
- [ ] Payout methods: PayPal, Bank Transfer
- [ ] Monthly payout schedule (1st of month)
- [ ] Payout history in dashboard

---

### US-5: Admin Management

```
როგორც: Admin
მინდა: ვმართო Affiliate პროგრამა
რათა: დავამტკიცო/უარვყო applications და ვაკონტროლო payouts
```

**Acceptance Criteria:**
- [ ] Pending applications list
- [ ] Approve/Reject functionality
- [ ] Affiliate performance overview
- [ ] Manual payout trigger
- [ ] Commission rate adjustment per affiliate

---

## Technical Design

### ვარიანტი A: Shopify App (რეკომენდებული)

**App:** GoAffPro (უფასო) ან UpPromote ($29/თვე)

```
Pros:
+ სწრაფი setup (1-2 საათი)
+ Shopify-თან ინტეგრაცია
+ Dashboard ready-made
+ Payout management

Cons:
- Monthly fee (paid plans)
- Limited customization
- Third-party dependency
```

### ვარიანტი B: Custom Build

```
Stack:
- Remix routes: /affiliate/*
- Firebase collection: affiliates, referrals, payouts
- Shopify webhooks: orders/paid

Pros:
+ Full control
+ No monthly fees
+ Custom branding

Cons:
- Development time (1-2 კვირა)
- Payout integration complexity
- Maintenance
```

---

## Database Schema (Custom Build)

### Firebase Collections:

```typescript
// affiliates collection
interface Affiliate {
  id: string;
  email: string;
  name: string;
  paypalEmail: string;
  referralCode: string;      // unique: "JOHNSMITH"
  promoCode?: string;        // optional: "JOHN20"
  commissionRate: number;    // 0.25 = 25%
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  socialLinks: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: Timestamp;
  approvedAt?: Timestamp;
}

// referrals collection
interface Referral {
  id: string;
  affiliateId: string;
  visitorId: string;         // anonymous tracking
  clickedAt: Timestamp;
  convertedAt?: Timestamp;
  orderId?: string;
  orderTotal?: number;
  commission?: number;
  status: 'clicked' | 'converted' | 'paid';
}

// payouts collection
interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  method: 'paypal' | 'bank';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  referralIds: string[];     // რომელი referrals შედის
  createdAt: Timestamp;
  completedAt?: Timestamp;
  transactionId?: string;
}
```

---

## Routes Structure (Custom Build)

```
/affiliate
  /apply              - Application form
  /dashboard          - Stats & links (protected)
  /materials          - Download banners/assets
  /payouts            - Payout history

/api/affiliate
  /track              - Click tracking endpoint
  /webhook            - Shopify order webhook
```

---

## Commission Structure

| Tier | გაყიდვები/თვე | კომისია |
|------|---------------|---------|
| Starter | 0-10 | 20% |
| Silver | 11-50 | 25% |
| Gold | 51+ | 30% |

**ალტერნატივა:** Flat 25% ყველასთვის (მარტივი)

---

## Fraud Prevention

- [ ] Same IP multiple accounts detection
- [ ] Self-referral blocking (affiliate ვერ იყიდის თავისი link-ით)
- [ ] Minimum order value for commission ($10)
- [ ] Cookie/referral expiry (30 days)
- [ ] Manual review for large commissions ($100+)

---

## Marketing Materials

Affiliates-ისთვის მზა assets:

```
/public/affiliate/
  banner-728x90.png
  banner-300x250.png
  banner-160x600.png
  logo-dark.png
  logo-light.png
  product-mockups/
```

---

## Launch Checklist

1. [ ] აირჩიე approach (App vs Custom)
2. [ ] Setup registration flow
3. [ ] Create dashboard
4. [ ] Test referral tracking
5. [ ] Setup payout method
6. [ ] Create marketing materials
7. [ ] Write affiliate terms & conditions
8. [ ] Recruit first 5-10 affiliates
9. [ ] Monitor & optimize

---

## Timeline

```
Week 1:
- Day 1-2: Setup app OR start custom build
- Day 3-4: Configure commission structure
- Day 5: Create marketing materials

Week 2:
- Day 1-2: Testing
- Day 3-4: Recruit beta affiliates
- Day 5: Launch publicly
```

---

## Success Metrics

| Metric | Target (Month 1) |
|--------|------------------|
| Affiliate signups | 20 |
| Active affiliates | 10 |
| Referral sales | 15% of total |
| Avg. commission/affiliate | $30 |

---

## Notes

- GoAffPro რეკომენდებულია დასაწყისისთვის - უფასო და სწრაფი
- Custom build მხოლოდ თუ scale გჭირდება ან specific features
- პირველი affiliates პირადად მოიწვიე (DM, email)

---

*Created: 2026-01-10*
