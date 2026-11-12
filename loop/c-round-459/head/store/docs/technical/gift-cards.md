# ციფრული სასაჩუქრე ბარათები

## აღწერა

ციფრული სასაჩუქრე ბარათების ფუნქციონალი საშუალებას აძლევს მომხმარებლებს შეიძინონ და გამოიყენონ სასაჩუქრე ბარათები CZABA store-ზე.

## დენომინაციები

| ღირებულება | აღწერა |
|------------|--------|
| $19 | სრულად ფარავს Standard ვერსიას |
| $25 | უნივერსალური თანხა |
| $49 | სრულად ფარავს Premium ვერსიას |
| $50 | უნივერსალური თანხა |
| $100 | მაღალი ღირებულების საჩუქარი |

## Shopify Admin Setup

1. **Gift Cards ჩართვა:** Settings > Gift Cards > Enable
2. **პროდუქტის შექმნა:** Products > Gift Cards > Create
   - Handle: `gift-card`
   - ვარიანტები: $19, $25, $49, $50, $100
3. **Email Template:** Settings > Notifications > Customize

## ტექნიკური დეტალები

### Shopify Storefront API

გამოყენებული მუტაცია: `cartGiftCardsUpdate`

```graphql
mutation cartGiftCardsUpdate($cartId: ID!, $giftCardCodes: [String!]!) {
  cartGiftCardsUpdate(cartId: $cartId, giftCardCodes: $giftCardCodes) {
    cart {
      ...CartFragment
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

### კომპონენტები

| კომპონენტი | მდებარეობა |
|------------|------------|
| GiftCardInput | `app/components/cart/GiftCardInput.tsx` |

### CartContext ცვლილებები

დაემატა მეთოდები:

```typescript
// სასაჩუქრე ბარათის გამოყენება
applyGiftCard: (code: string) => Promise<void>

// სასაჩუქრე ბარათის ამოღება
removeGiftCard: (giftCardId: string) => Promise<void>
```

დაემატა state:

```typescript
isApplyingGiftCard: boolean  // მიმდინარეობს თუ არა გამოყენება
giftCardError: string | null // შეცდომის შეტყობინება
```

### Types

```typescript
// app/types/cart.ts
export interface AppliedGiftCard {
  id: string;
  lastCharacters: string;  // ბოლო 4 სიმბოლო
  amountUsed: {
    amount: string;
    currencyCode: string;
  };
  balance: {
    amount: string;
    currencyCode: string;
  };
}
```

## სცენარები

### სრული დაფარვა
- მომხმარებელს აქვს $49-იანი ბარათი
- ყიდულობს $49-იან Premium პროდუქტს
- Total = $0.00
- გადახდის გვერდზე არ სთხოვენ ბარათის მონაცემებს

### ნაწილობრივი დაფარვა
- მომხმარებელს აქვს $25-იანი ბარათი
- ყიდულობს $49-იან Premium პროდუქტს
- Total = $24.00
- დარჩენილს იხდის ბარათით

### ბალანსის შენარჩუნება
- მომხმარებელს აქვს $25-იანი ბარათი
- ყიდულობს $19-იან Standard პროდუქტს
- Total = $0.00
- იგივე კოდზე რჩება $6 ბალანსი

## ფაილების სია

| ფაილი | ცვლილება |
|-------|----------|
| `app/types/cart.ts` | AppliedGiftCard type, CartContextValue update |
| `app/services/shopify/cart/cart.ts` | CART_FRAGMENT, mutations, methods |
| `app/contexts/CartContext.tsx` | State და methods |
| `app/lib/shopify.queries.ts` | CART_GIFT_CARDS_UPDATE_MUTATION |
| `app/components/cart/GiftCardInput.tsx` | NEW - Input კომპონენტი |
| `app/components/cart/index.ts` | NEW - Barrel export |
| `app/routes/cart.tsx` | OrderSummary integration |
| `app/components/layout/Footer.tsx` | Gift Cards link |
| `app/routes/terms.tsx` | Gift Cards section |

## შეზღუდვები

1. **Shopify API-ს შეზღუდვა:** API არ აბრუნებს სრულ gift card კოდს, მხოლოდ ბოლო 4 სიმბოლოს (`lastCharacters`). ამიტომ gift card-ის ამოღების ლოგიკა შეზღუდულია.

2. **Email მიწოდება:** Shopify-ს native email template იგზავნება მყიდველის email-ზე. კასტომიზაცია ხდება Shopify Admin-იდან.
