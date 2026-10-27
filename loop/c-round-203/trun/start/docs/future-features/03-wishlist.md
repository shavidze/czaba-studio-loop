# Wishlist - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🟡 საშუალო
> სავარაუდო დრო: 3-5 დღე

---

## Overview

მომხმარებელს შეუძლია შეინახოს პროდუქტები "Wishlist"-ში მოგვიანებით შესაძენად.

---

## User Stories

### US-1: პროდუქტის Wishlist-ში დამატება

```
როგორც: ვიზიტორი
მინდა: შევინახო პროდუქტი Wishlist-ში
რათა: მოგვიანებით ვიყიდო
```

**Acceptance Criteria:**
- [ ] Heart/Bookmark icon პროდუქტის card-ზე
- [ ] Click → დაემატა (icon fills)
- [ ] გაუთხოვრებული users-ისთვის: LocalStorage
- [ ] Logged-in users-ისთვის: Firebase/Account

---

### US-2: Wishlist-ის ნახვა

```
როგორც: მომხმარებელი
მინდა: ვნახო ჩემი Wishlist
რათა: გადავხედო და ვიყიდო
```

**Acceptance Criteria:**
- [ ] `/wishlist` გვერდი
- [ ] პროდუქტების სია (image, title, price)
- [ ] "Add to Cart" button თითოეულზე
- [ ] "Remove" button
- [ ] Empty state: "Your wishlist is empty"

---

### US-3: Wishlist-ის შენარჩუნება Login-ზე

```
როგორც: მომხმარებელი
მინდა: Login-ის შემდეგ ჩემი Wishlist შენარჩუნდეს
რათა: არ დავკარგო შენახული პროდუქტები
```

**Acceptance Criteria:**
- [ ] Guest wishlist (LocalStorage) merges with account wishlist
- [ ] No duplicates after merge

---

## Technical Design

### Storage Strategy

```typescript
// Guest users: LocalStorage
const WISHLIST_KEY = 'czaba_wishlist';
// Value: ["product-handle-1", "product-handle-2"]

// Logged-in users: Firebase
// Collection: users/{userId}/wishlist
interface WishlistItem {
  productHandle: string;
  addedAt: Timestamp;
}
```

### Components

```
app/
├── components/
│   └── wishlist/
│       ├── WishlistButton.tsx    # Heart icon button
│       ├── WishlistPage.tsx      # Full page list
│       └── WishlistCount.tsx     # Badge in header
├── hooks/
│   └── useWishlist.ts            # Wishlist logic
├── contexts/
│   └── WishlistContext.tsx       # State management
└── routes/
    └── wishlist.tsx              # /wishlist page
```

### Hook API

```typescript
const {
  items,           // string[] - product handles
  isInWishlist,    // (handle: string) => boolean
  addToWishlist,   // (handle: string) => void
  removeFromWishlist, // (handle: string) => void
  clearWishlist,   // () => void
  count            // number
} = useWishlist();
```

---

## UI Design

### Wishlist Button (on product card)

```
[ ♡ ]  → Empty (not in wishlist)
[ ❤️ ]  → Filled (in wishlist)
```

### Header Badge

```
[ ♡ 3 ]  → Shows count if > 0
```

---

## Launch Checklist

1. [ ] Create useWishlist hook
2. [ ] Create WishlistContext
3. [ ] Add WishlistButton to ProductCard
4. [ ] Create /wishlist page
5. [ ] Add to header (icon + count)
6. [ ] LocalStorage implementation
7. [ ] Firebase sync for logged-in users
8. [ ] Test merge logic
9. [ ] Deploy

---

*Created: 2026-01-10*
