# License Certificate PDF - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🟡 საშუალო
> სავარაუდო დრო: 2-3 დღე

---

## Overview

შეძენის შემდეგ მომხმარებელი იღებს PDF license certificate-ს, რომელიც ადასტურებს მის უფლებას გამოიყენოს პროდუქტი.

---

## User Stories

### US-1: Certificate-ის მიღება

```
როგორც: მყიდველი
მინდა: მივიღო ოფიციალური license certificate
რათა: შევძლო დავამტკიცო ჩემი უფლება ამ sounds-ის გამოყენებაზე
```

**Acceptance Criteria:**
- [ ] PDF გენერირდება ავტომატურად შეძენისას
- [ ] იგზავნება email-ით order confirmation-თან ერთად
- [ ] ხელმისაწვდომია account dashboard-ში
- [ ] შეიცავს: Customer name, Order #, Date, Product, License type

---

### US-2: Certificate-ის ხელახლა ჩამოტვირთვა

```
როგორც: მომხმარებელი
მინდა: ჩამოვტვირთო ჩემი certificates ნებისმიერ დროს
რათა: მქონდეს backup და წვდომა
```

**Acceptance Criteria:**
- [ ] /account/downloads გვერდზე "Download License" button
- [ ] ყოველი შეძენილი პროდუქტისთვის ცალკე certificate

---

## Certificate Design

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                    [LOGO]                       │
│                    CZABA                        │
│                                                 │
│         ─────────────────────────────          │
│                                                 │
│            LICENSE CERTIFICATE                  │
│                                                 │
│         ─────────────────────────────          │
│                                                 │
│  This certifies that:                          │
│                                                 │
│  Customer: John Smith                           │
│  Email: john@example.com                        │
│                                                 │
│  Has purchased a license for:                   │
│                                                 │
│  Product: MIDDLE EAST - Cinematic Sound Library │
│  License Type: Premium (Unlimited)              │
│  Order Number: #CZABA-1234                      │
│  Purchase Date: January 10, 2026                │
│                                                 │
│         ─────────────────────────────          │
│                                                 │
│  License Terms:                                 │
│  • Unlimited commercial & personal use          │
│  • No attribution required                      │
│  • Worldwide, perpetual license                 │
│  • Full terms: czaba.com/license                │
│                                                 │
│         ─────────────────────────────          │
│                                                 │
│  Certificate ID: CERT-ABC123XYZ                 │
│  Verification: czaba.com/verify/ABC123XYZ       │
│                                                 │
│                    [QR CODE]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Technical Design

### PDF Generation

**Option A: @react-pdf/renderer (Recommended)**

```typescript
import { Document, Page, Text, View } from '@react-pdf/renderer';

const LicenseCertificate = ({ order, product, customer }) => (
  <Document>
    <Page size="A4">
      <View style={styles.header}>
        <Text>CZABA</Text>
        <Text>LICENSE CERTIFICATE</Text>
      </View>
      <View style={styles.content}>
        <Text>Customer: {customer.name}</Text>
        <Text>Product: {product.title}</Text>
        <Text>Order: #{order.number}</Text>
        <Text>Date: {order.date}</Text>
      </View>
    </Page>
  </Document>
);
```

**Option B: jsPDF**

```typescript
import jsPDF from 'jspdf';

function generateCertificate(order) {
  const doc = new jsPDF();
  doc.text('LICENSE CERTIFICATE', 105, 20, { align: 'center' });
  doc.text(`Customer: ${order.customerName}`, 20, 50);
  // ...
  return doc.output('blob');
}
```

### API Endpoint

```typescript
// /api/certificate/$orderId.ts
export async function loader({ params, request }) {
  const { orderId } = params;

  // Verify user owns this order
  // Generate PDF
  // Return as download

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CZABA-License-${orderId}.pdf"`,
    },
  });
}
```

### Certificate Verification

```typescript
// /api/verify/$certificateId.ts
// Returns JSON with certificate validity
{
  valid: true,
  customer: "John S.",
  product: "MIDDLE EAST",
  date: "2026-01-10"
}
```

---

## Storage

```
Firebase:
  certificates/
    {certificateId}/
      orderId: string
      customerId: string
      productHandle: string
      createdAt: Timestamp
      downloadCount: number
```

---

## Launch Checklist

1. [ ] Design certificate template
2. [ ] Install @react-pdf/renderer
3. [ ] Create PDF generation function
4. [ ] Create /api/certificate endpoint
5. [ ] Add download button to /account/downloads
6. [ ] Generate on order.paid webhook
7. [ ] Send with order confirmation email
8. [ ] Create verification endpoint
9. [ ] Test & deploy

---

*Created: 2026-01-10*
