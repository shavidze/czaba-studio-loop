# Test Scenarios

## კალათა:
- [ ] Standard დამატება → "In Cart" ჩანს Standard-ზე
- [ ] Premium-ზე გადართვა → "Add to Cart" ჩანს (არა "In Cart")
- [ ] Premium დამატება → Standard იშლება, Premium ემატება
- [ ] Premium-ზე "In Cart", Standard-ზე "Add to Cart"

## Ownership:
- [ ] Standard ნაყიდი → Standard-ზე "Owned", Premium-ზე Upgrade price
- [ ] Premium ნაყიდი → "You own Premium", ორივე ვერსია ხელმისაწვდომი
- [ ] Upgrade → ფასი = სხვაობა, Downloads-ში 1 პროდუქტი

## Checkout:
- [ ] Cart → Checkout → Stripe → Success page
- [ ] Webhook → Order status "Paid"
- [ ] Downloads ხელმისაწვდომი დაუყოვნებლივ
