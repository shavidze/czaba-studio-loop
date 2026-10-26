# Checkout Flow

## სრული პროცესი:

```
1. კალათაში დამატება
   └─ POST /api/cart/items
      └─ Body: { productId, productVariantId, quantity: 1 }

2. Checkout-ის დაწყება
   └─ POST /api/cart/checkout
      └─ Response: { orderId, orderNumber }

3. Stripe Session შექმნა
   └─ POST /api/payments/checkout
      └─ Body: { orderId }
      └─ Response: { sessionUrl }

4. Stripe-ზე გადამისამართება
   └─ window.location.href = sessionUrl

5. გადახდის შემდეგ
   ├─ Success → /checkout/success?session_id=xxx&order_id=xxx
   └─ Cancel → /checkout/cancel?order_id=xxx

6. Webhook (Backend)
   └─ Stripe → POST /api/payments/webhook
      └─ Order status: "Paid"
      └─ Email: გადახდის დადასტურება

7. Downloads ხელმისაწვდომი
   └─ /account/downloads
```
