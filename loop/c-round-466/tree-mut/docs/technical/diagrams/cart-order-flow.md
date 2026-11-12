# Cart → Checkout → Order Lifecycle

## აღწერა

CZABA Store-ის სრული შეკვეთის ციკლი: პროდუქტის კალათაში დამატებიდან გადახდის დასრულებამდე.
სისტემა იყენებს session-based კალათას (localStorage `czaba_session_id`), Czaba .NET Backend API-ს
და Stripe Checkout-ს გადახდებისთვის.

---

## 1. კალათის მართვა (Cart Management)

```mermaid
flowchart TD
    START([მომხმარებელი ხსნის საიტს]) --> INIT_SESSION{sessionId არსებობს<br/>localStorage-ში?}
    INIT_SESSION -- არა --> GEN_SESSION[გენერაცია: sess_timestamp_random]
    GEN_SESSION --> SAVE_SESSION[შენახვა localStorage<br/>key: czaba_session_id]
    SAVE_SESSION --> LOAD_CART
    INIT_SESSION -- კი --> LOAD_CART

    LOAD_CART[GET /api/cart<br/>Header: X-Session-Id] --> LOAD_OK{წარმატებით?}
    LOAD_OK -- კი --> TRANSFORM[transformCart: API → Frontend Cart]
    LOAD_OK -- არა --> EMPTY_CART[ცარიელი Cart: items=0]
    TRANSFORM --> READY([კალათა მზადაა])
    EMPTY_CART --> READY

    AUTH_CHANGE([ავტორიზაციის ცვლილება]) --> RELOAD[loadCart ხელახლა]
    RELOAD --> LOAD_CART
```

---

## 2. პროდუქტის კალათაში დამატება (Add to Cart)

```mermaid
flowchart TD
    ADD_START([addToCart: productId, handle, variantId]) --> IS_GIFT{Gift Card?}

    IS_GIFT -- არა --> CHECK_DUP{ეს ვარიანტი<br/>უკვე კალათაშია?}
    CHECK_DUP -- კი --> TOAST_EXISTS[Toast: 'Already in cart']
    CHECK_DUP -- არა --> CHECK_REPLACE{სხვა ვარიანტი<br/>იგივე პროდუქტის<br/>უკვე კალათაშია?}

    CHECK_REPLACE -- კი --> REMOVE_OLD[DELETE /api/cart/items/:oldItemId<br/>ძველი ვარიანტის წაშლა]
    REMOVE_OLD --> API_ADD
    CHECK_REPLACE -- არა --> API_ADD

    IS_GIFT -- კი --> API_ADD

    API_ADD[POST /api/cart/items<br/>Body: productId, variantId, qty=1<br/>Header: X-Session-Id] --> ADD_OK{წარმატებით?}

    ADD_OK -- კი --> UPDATE_STATE[Cart state განახლება]
    UPDATE_STATE --> TOAST_SUCCESS[Toast: 'Added to cart!']

    ADD_OK -- არა --> ERROR_TYPE{შეცდომის ტიპი}
    ERROR_TYPE -- Network --> ERR_NET[Toast: 'Unable to connect']
    ERROR_TYPE -- 401 --> ERR_AUTH[Toast: 'Please sign in']
    ERROR_TYPE -- 404 --> ERR_404[Toast: 'Product not available']
    ERROR_TYPE -- 503 --> ERR_503[Toast: 'Service unavailable']
    ERROR_TYPE -- სხვა --> ERR_GEN[Toast: 'Could not add item']
```

---

## 3. კალათის რედაქტირება (Update & Remove)

```mermaid
flowchart TD
    subgraph რაოდენობის_ცვლილება [რაოდენობის ცვლილება]
        UPD_START([updateQuantity: itemId, qty]) --> QTY_CHECK{qty < 1?}
        QTY_CHECK -- კი --> REMOVE_FLOW
        QTY_CHECK -- არა --> API_UPDATE[PUT /api/cart/items/:itemId<br/>Body: quantity]
        API_UPDATE --> UPD_OK{წარმატებით?}
        UPD_OK -- კი --> UPD_STATE[Cart state განახლება]
        UPD_OK -- არა --> UPD_ERR[Toast: 'Could not update quantity']
    end

    subgraph წაშლა [ელემენტის წაშლა]
        REMOVE_FLOW([removeFromCart: itemId]) --> CONFIRM_DIALOG[ConfirmDialog მოდალი]
        CONFIRM_DIALOG -- Cancel --> CANCEL_REMOVE([გაუქმება])
        CONFIRM_DIALOG -- Confirm --> API_DELETE[DELETE /api/cart/items/:itemId<br/>Header: X-Session-Id]
        API_DELETE --> DEL_OK{წარმატებით?}
        DEL_OK -- კი --> DEL_STATE[Cart state განახლება<br/>Toast: 'Item removed']
        DEL_OK -- არა --> DEL_ERR[Toast: 'Could not remove']
    end

    subgraph ფასდაკლებები [კუპონი / Gift Card]
        COUPON([applyCoupon: code]) --> API_COUPON[POST /api/cart/coupon<br/>Body: code]
        API_COUPON --> C_OK{წარმატებით?}
        C_OK -- კი --> C_STATE[Cart state განახლება<br/>Toast: 'Coupon applied!']
        C_OK -- არა --> C_ERR[Toast: error message]

        GIFTCARD([applyGiftCard: code]) --> API_GIFT[POST /api/cart/gift-card<br/>Body: code]
        API_GIFT --> G_OK{წარმატებით?}
        G_OK -- კი --> G_STATE[Cart state განახლება<br/>Toast: 'Gift card applied!']
        G_OK -- არა --> G_ERR[Toast: error message]
    end
```

---

## 4. Checkout პროცესი (Cart → Order → Stripe → Result)

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant FE as Frontend (Remix)
    participant API as Czaba API (.NET)
    participant S as Stripe

    Note over U,FE: Cart გვერდზე "Proceed to Checkout" ღილაკი

    U->>FE: Checkout ღილაკზე დაჭერა
    FE->>FE: ავტორიზაცია შემოწმება

    alt არ არის ავტორიზებული
        FE->>U: Sign In მოდალის გახსნა
    else ავტორიზებულია
        FE->>FE: Ownership შემოწმება
        alt აქვს ownership პრობლემები
            FE->>U: Warning: "Resolve issues"
        else პრობლემა არ არის
            FE->>API: POST /api/cart/checkout
            API->>API: Order შექმნა (Pending)
            API-->>FE: CheckoutResponse {id, orderNumber, total}
            FE->>API: POST /api/payments/checkout {orderId}
            API->>S: Stripe Checkout Session შექმნა
            S-->>API: CheckoutSessionResponse {sessionUrl}
            API-->>FE: {sessionId, sessionUrl, publishableKey}
            FE->>S: Redirect → sessionUrl (Stripe Checkout)

            alt გადახდა წარმატებული
                S->>API: Webhook: payment_intent.succeeded
                API->>API: Order status → Paid
                S-->>U: Redirect → /checkout/success
                U->>FE: Success გვერდი
                FE->>U: "Go to Downloads" / "Continue Shopping"
            else გადახდა გაუქმდა
                S-->>U: Redirect → /checkout/cancel
                U->>FE: Cancel გვერდი
                FE->>U: "Return to Cart" / "Continue Shopping"
                Note over FE: კალათა უცვლელია
            end
        end
    end
```

---

## 5. Buy Now Flow (სწრაფი შეძენა)

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant FE as Frontend
    participant API as Czaba API
    participant S as Stripe

    U->>FE: Buy Now ღილაკი (productId, variantId)

    FE->>FE: isInCart(productId) შემოწმება
    alt არ არის კალათაში
        FE->>API: POST /api/cart/items {productId, variantId, qty=1}
        API-->>FE: Cart (განახლებული)
    end

    FE->>API: POST /api/cart/checkout
    API-->>FE: CheckoutResponse {id, orderNumber}
    FE->>API: POST /api/payments/checkout {orderId}
    API-->>FE: {sessionUrl}
    FE->>S: window.location.href = sessionUrl
```

---

## 6. Order Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> Pending : POST /api/cart/checkout

    Pending --> Paid : Stripe Webhook<br/>payment_intent.succeeded
    Pending --> Failed : Stripe Webhook<br/>payment_intent.failed
    Pending --> Cancelled : გადახდის გაუქმება<br/>(Stripe cancel redirect)

    Paid --> Refunded : Admin ან Stripe<br/>refund

    Paid --> [*] : შეკვეთა დასრულებულია<br/>Downloads ხელმისაწვდომი

    Failed --> [*]
    Refunded --> [*]
    Cancelled --> [*]
```

---

## 7. Order Payment Status Badge-ები

| სტატუსი | ფერი | აღწერა |
|---------|------|--------|
| **Paid** | Emerald | გადახდილი - downloads ხელმისაწვდომია |
| **Pending** | Yellow | მოლოდინში - გადახდა პროცესშია |
| **Failed** | Red | ვერ გადაიხადა |
| **Refunded** | Orange | თანხა დაბრუნებულია |

---

## 8. სრული არქიტექტურის დიაგრამა

```mermaid
graph TB
    subgraph Frontend ["Frontend (Remix)"]
        CC[CartContext]
        CP[CartProvider]
        UC[useCart Hook]
        CR[/cart Route/]
        CS[/checkout/success Route/]
        CX[/checkout/cancel Route/]
        AO[/account/orders Route/]
        CU[cart-utils.ts]
    end

    subgraph Backend ["Czaba .NET API"]
        CART_API["/api/cart/*"]
        PAY_API["/api/payments/*"]
        ORD_API["/api/orders/*"]
        DL_API["/api/downloads/*"]
    end

    subgraph External ["გარე სერვისები"]
        STRIPE[Stripe Checkout]
        R2[Cloudflare R2<br/>Signed URLs]
    end

    subgraph Storage ["მონაცემთა შენახვა"]
        LS["localStorage<br/>czaba_session_id<br/>auth_user"]
        MSSQL[(MSSQL<br/>Orders, Cart,<br/>Products)]
    end

    CC --> CP
    CP --> UC
    UC --> CR
    CR --> CS
    CR --> CX

    CP -- "X-Session-Id Header" --> CART_API
    CP -- "Bearer Token" --> PAY_API
    AO -- "Bearer Token" --> ORD_API

    CART_API --> MSSQL
    PAY_API --> STRIPE
    PAY_API --> MSSQL
    ORD_API --> MSSQL
    DL_API --> R2

    STRIPE -- "Webhook" --> PAY_API
    STRIPE -- "Success/Cancel redirect" --> Frontend

    CP --> LS
```
