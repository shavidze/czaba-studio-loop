# Email Sequences (Brevo Automation) - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🔴 მაღალი
> სავარაუდო დრო: 2-3 დღე

---

## Overview

ავტომატური email sequences Brevo-ში ახალი subscribers-ისთვის, მყიდველებისთვის და სხვა triggers-ისთვის.

---

## Sequences

### 1. Welcome Sequence (New Subscriber)

**Trigger:** Newsletter signup

```
Day 0 (Immediately):
  Subject: "Welcome to CZABA! Here's your free pack"
  Content:
    - Welcome message
    - Free download link
    - What to expect from emails

Day 3:
  Subject: "How creators use CZABA sounds"
  Content:
    - Customer testimonials/examples
    - YouTube video showcases
    - Browse store CTA

Day 7:
  Subject: "Your exclusive 15% off"
  Content:
    - Discount code: WELCOME15
    - Expires in 48 hours
    - Featured products

Day 14 (if no purchase):
  Subject: "We miss you! Here's 20% off"
  Content:
    - Stronger discount: COMEBACK20
    - Last chance messaging
```

---

### 2. Post-Purchase Sequence

**Trigger:** Order completed (Shopify webhook → Brevo)

```
Day 0 (Immediately):
  Subject: "Your download is ready!"
  Content:
    - Download links
    - How to use guide
    - Support contact

Day 3:
  Subject: "How's it going with [Product Name]?"
  Content:
    - Tips for using the pack
    - Tutorial links
    - Ask for feedback

Day 7:
  Subject: "Complete your collection"
  Content:
    - Related products
    - Bundle deals
    - 10% off next purchase

Day 30:
  Subject: "Leave a review, get $5"
  Content:
    - Review request
    - $5 credit incentive
```

---

### 3. Abandoned Cart Sequence

**Trigger:** Cart abandoned (Shopify built-in + Brevo)

```
Hour 1:
  Subject: "You left something behind"
  Content:
    - Cart contents
    - One-click return to cart

Hour 24:
  Subject: "Still thinking about it?"
  Content:
    - Cart contents
    - Customer testimonials
    - FAQ answers

Hour 48:
  Subject: "10% off to complete your order"
  Content:
    - Discount code
    - Urgency (48hr expiry)
```

---

### 4. Re-engagement Sequence

**Trigger:** No open in 60 days

```
Day 1:
  Subject: "We've missed you!"
  Content:
    - What's new
    - Special comeback offer

Day 7 (if no open):
  Subject: "Should we part ways?"
  Content:
    - Last chance to stay subscribed
    - Unsubscribe option prominent
```

---

## Brevo Setup

### Step 1: Create Automation Workflow

```
Brevo Dashboard → Automation → Create Workflow
```

### Step 2: Set Trigger

```
Trigger Type: Contact added to list
List: Newsletter Subscribers
```

### Step 3: Add Delays & Emails

```
[Trigger] → [Wait 0 days] → [Send Email 1]
                ↓
         [Wait 3 days] → [Send Email 2]
                ↓
         [Wait 4 days] → [Send Email 3]
                ↓
         [Condition: Purchased?]
            Yes → Exit
            No → [Wait 7 days] → [Send Email 4]
```

---

## Email Templates

### Design Guidelines

- Dark theme (match website)
- CZABA logo header
- Teal (#13D9CC) accent color
- Mobile-responsive
- Unsubscribe footer

### Template Structure

```html
[Logo]
[Hero Image - optional]
[Headline]
[Body Text]
[CTA Button - teal]
[Footer: Social links, Unsubscribe]
```

---

## Tracking & Attributes

### Brevo Contact Attributes

```
SOURCE: newsletter | free-download | purchase
SIGNUP_DATE: ISO date
FIRST_PURCHASE_DATE: ISO date
TOTAL_PURCHASES: number
LAST_EMAIL_OPENED: ISO date
```

### Conditions for Sequences

```
- Has purchased? → Skip discount emails
- Opened last email? → Continue sequence
- On suppression list? → Exit
```

---

## Launch Checklist

1. [ ] Design email templates in Brevo
2. [ ] Create Welcome sequence (4 emails)
3. [ ] Create Post-Purchase sequence (4 emails)
4. [ ] Setup Shopify → Brevo webhook for purchases
5. [ ] Test all sequences with test email
6. [ ] Create discount codes in Shopify
7. [ ] Activate workflows
8. [ ] Monitor open/click rates

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Welcome sequence open rate | 40%+ |
| Welcome → Purchase conversion | 10% |
| Post-purchase open rate | 50%+ |
| Repeat purchase rate | 15% |

---

*Created: 2026-01-10*
