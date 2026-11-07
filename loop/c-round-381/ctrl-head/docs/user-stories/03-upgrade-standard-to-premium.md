# Upgrade ლოგიკა (შეძენის შემდეგ)

## User Story: Standard → Premium Upgrade

**As a** მომხმარებელი, რომელმაც უკვე შეიძინა Standard ვერსია,
**I want to** განვაახლო Premium-მდე, ფასთა სხვაობის გადახდით,
**So that I can** მივიღო დამატებითი ფუნქციები (Stems, 96kHz) იმაზე მეტის გადახდის გარეშე.

---

## Acceptance Criteria:

### პროდუქტის გვერდზე (თუ Standard ნაყიდი):
1. Standard ტაბზე ჩანს: "Owned ✓" badge
2. Standard-ზე ღილაკი: "Go to Downloads" (არა Add to Cart)
3. Premium ტაბზე ჩანს: "Upgrade" badge
4. Premium-ზე ფასი: `$20` (= $49 - $29 გადახდილი)
5. ღილაკი: "Upgrade to Premium" ან "Unlock Premium"

### პროდუქტის გვერდზე (თუ Premium ნაყიდი):
1. ორივე ტაბი დამალულია ან დისეიბლირებული
2. ერთი მესიჯი: "You own Premium - includes everything"
3. ღილაკი: "Go to Downloads"

---

## Upgrade Price Formula:
```typescript
const upgradePrice = premiumPrice - ownedStandardPrice;
// მაგ: $49 - $29 = $20
```

---

## UI კომპონენტები:

```tsx
// PurchaseHeader - Upgrade შემთხვევა
if (isUpgrade && upgradePrice > 0) {
  return (
    <div className="upgrade-banner">
      <div className="upgrade-price">${upgradePrice.toFixed(2)}</div>
      <div className="note">Standard credit applied</div>
      <Button onClick={handleUpgrade}>Unlock Premium</Button>
    </div>
  );
}
```
