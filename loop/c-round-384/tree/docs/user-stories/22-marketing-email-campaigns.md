---

# Marketing Email Campaigns

### **დავალება: მარკეტინგული Email კამპანიების სისტემის იმპლემენტაცია**

**User Story:**

**As a** CZABA-ს მარკეტინგის გუნდი,
**I want to** შევქმნა და ვმართო email კამპანიები სხვადასხვა აუდიტორიის სეგმენტებისთვის,
**So that** გავზარდო გაყიდვები, შევინარჩუნო მომხმარებლები და მოვიზიდო ახალი.

---

## **სისტემის მოკლე მიმოხილვა**

| კომპონენტი | აღწერა |
|------------|--------|
| **Lists** | სეგმენტირებული აუდიტორიის სიები |
| **Campaigns** | Email კამპანიები (one-time + automated) |
| **Templates** | Handlebars ბაზირებული email templates |
| **Analytics** | Opens, Clicks, Conversions ტრეკინგი |
| **Triggers** | ავტომატური კამპანიები behavior-ზე დაყრდნობით |

---

## **Phase 1: Foundation (MVP)**

### **1.1 აუდიტორიის სეგმენტაცია**

#### მთავარი სეგმენტები:

| სეგმენტი | კრიტერიუმი | პრიორიტეტი |
|----------|------------|------------|
| **Newsletter Subscribers** | გამოწერილები, არ უყიდიათ | საშუალო |
| **First-Time Buyers** | 1 შეკვეთა | მაღალი |
| **Repeat Buyers** | 2-4 შეკვეთა | მაღალი |
| **VIP Buyers** | 5+ შეკვეთა ან $500+ | ძალიან მაღალი |
| **Inactive Users** | 60+ დღე არააქტიური | საშუალო |

#### კატეგორიის მიხედვით:

| სეგმენტი | აღწერა |
|----------|--------|
| **Cinematic Music Lovers** | ძირითადად ტრეკებს ყიდულობენ |
| **SFX Hunters** | ხმოვანი ეფექტების მყიდველები |
| **Preset Collectors** | პრესეტებით დაინტერესებულები |
| **Loop Artists** | ლუპებით მომუშავეები |

---

### **1.2 მონაცემთა მოდელი**

```sql
-- მარკეტინგული სიები
CREATE TABLE MarketingList (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    SegmentRules NVARCHAR(MAX),          -- JSON სეგმენტაციის წესები
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2
);

-- სიის წევრები
CREATE TABLE MarketingListMember (
    Id INT PRIMARY KEY IDENTITY,
    ListId INT FOREIGN KEY REFERENCES MarketingList(Id),
    UserId INT FOREIGN KEY REFERENCES [User](Id),
    Email NVARCHAR(255) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active',  -- Active, Unsubscribed, Bounced
    SubscribedAt DATETIME2 DEFAULT GETUTCDATE(),
    UnsubscribedAt DATETIME2 NULL
);

-- კამპანიები
CREATE TABLE MarketingCampaign (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(200) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    PreviewText NVARCHAR(200),
    TemplateId INT FOREIGN KEY REFERENCES EmailTemplate(Id),
    ListId INT FOREIGN KEY REFERENCES MarketingList(Id),
    Status NVARCHAR(20) DEFAULT 'Draft',  -- Draft, Scheduled, Sending, Sent, Cancelled
    ScheduledAt DATETIME2 NULL,
    SentAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- მიმღებები
CREATE TABLE MarketingCampaignRecipient (
    Id INT PRIMARY KEY IDENTITY,
    CampaignId INT FOREIGN KEY REFERENCES MarketingCampaign(Id),
    Email NVARCHAR(255) NOT NULL,
    UserId INT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending', -- Pending, Sent, Failed, Bounced
    SentAt DATETIME2 NULL,
    TrackingId UNIQUEIDENTIFIER DEFAULT NEWID()
);

-- ივენთები (opens, clicks)
CREATE TABLE MarketingEmailEvent (
    Id INT PRIMARY KEY IDENTITY,
    RecipientId INT FOREIGN KEY REFERENCES MarketingCampaignRecipient(Id),
    EventType NVARCHAR(20) NOT NULL,       -- Open, Click, Unsubscribe
    Metadata NVARCHAR(MAX),                -- JSON (link URL, IP, etc.)
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- სტატისტიკა (aggregated)
CREATE TABLE MarketingCampaignStats (
    CampaignId INT PRIMARY KEY FOREIGN KEY REFERENCES MarketingCampaign(Id),
    TotalRecipients INT DEFAULT 0,
    TotalSent INT DEFAULT 0,
    TotalOpens INT DEFAULT 0,
    UniqueOpens INT DEFAULT 0,
    TotalClicks INT DEFAULT 0,
    UniqueClicks INT DEFAULT 0,
    Unsubscribes INT DEFAULT 0,
    Bounces INT DEFAULT 0,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Unsubscribe სია (გლობალური)
CREATE TABLE MarketingUnsubscribe (
    Id INT PRIMARY KEY IDENTITY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Reason NVARCHAR(500),
    UnsubscribedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

---

### **1.3 API Endpoints**

```
# Lists
GET    /api/marketing/lists                -- ყველა სია
POST   /api/marketing/lists                -- ახალი სიის შექმნა
GET    /api/marketing/lists/{id}           -- სიის დეტალები
PUT    /api/marketing/lists/{id}           -- სიის რედაქტირება
DELETE /api/marketing/lists/{id}           -- სიის წაშლა
GET    /api/marketing/lists/{id}/members   -- სიის წევრები
POST   /api/marketing/lists/{id}/members   -- წევრის დამატება
DELETE /api/marketing/lists/{id}/members/{memberId} -- წევრის წაშლა

# Campaigns
GET    /api/marketing/campaigns            -- ყველა კამპანია
POST   /api/marketing/campaigns            -- ახალი კამპანია
GET    /api/marketing/campaigns/{id}       -- კამპანიის დეტალები
PUT    /api/marketing/campaigns/{id}       -- კამპანიის რედაქტირება
POST   /api/marketing/campaigns/{id}/send  -- კამპანიის გაგზავნა
POST   /api/marketing/campaigns/{id}/schedule -- კამპანიის დაგეგმვა
POST   /api/marketing/campaigns/{id}/cancel   -- კამპანიის გაუქმება
GET    /api/marketing/campaigns/{id}/stats    -- კამპანიის სტატისტიკა

# Tracking (public, no auth)
GET    /api/marketing/track/open/{trackingId}  -- open pixel
GET    /api/marketing/track/click/{trackingId}/{linkId} -- click tracking
GET    /api/marketing/unsubscribe/{trackingId} -- unsubscribe page

# Templates (extends existing)
GET    /api/email/templates?type=Marketing -- მარკეტინგული templates
```

---

### **1.4 Admin Panel (მარკეტინგის სექცია)**

#### Navigation:
```
📧 Marketing
├── 📋 Lists (აუდიტორია)
├── 📨 Campaigns (კამპანიები)
├── 📊 Analytics (სტატისტიკა)
└── ⚙️ Settings (პარამეტრები)
```

#### Lists Page:
- სიების ჩამონათვალი (სახელი, წევრების რაოდენობა, სტატუსი)
- ახალი სიის შექმნა (Manual ან Segment Rules)
- სიის წევრების მართვა

#### Campaigns Page:
- კამპანიების ჩამონათვალი (სახელი, სტატუსი, გაგზავნის თარიღი)
- ახალი კამპანიის შექმნა:
  1. სახელი და Subject line
  2. Template-ის არჩევა
  3. აუდიტორიის (List) არჩევა
  4. Preview და Test Send
  5. Schedule ან Send Now

#### Analytics Page:
- Overview: ბოლო 30 დღის სტატისტიკა
- Open Rate, Click Rate, Conversion Rate graphs
- Top Performing Campaigns
- Subscriber Growth chart

---

## **Phase 2: Automation**

### **2.1 ავტომატური Triggers**

| Trigger | კამპანია | Timing |
|---------|----------|--------|
| New Registration | Welcome Series | მყისიერად |
| Cart Abandoned | Cart Recovery | 1სთ, 24სთ, 72სთ |
| Purchase Complete | Post-Purchase | მყისიერად |
| 60 Days Inactive | Re-engagement | Day 60 |
| VIP Status Reached | VIP Welcome | მყისიერად |

### **2.2 Email Series (Drip Campaigns)**

#### Welcome Series (5 emails):
```
Email 1 (Day 0): Welcome + 10% ფასდაკლება
Email 2 (Day 2): Free Resources
Email 3 (Day 5): Social Proof / Reviews
Email 4 (Day 8): Category Exploration
Email 5 (Day 14): First Purchase Push
```

#### Cart Abandonment (3 emails):
```
Email 1 (1 საათი): Gentle Reminder
Email 2 (24 საათი): Value Add + Reviews
Email 3 (72 საათი): Urgency + 5% ფასდაკლება
```

---

## **Phase 3: Personalization**

- Product recommendations based on purchase history
- Dynamic content blocks
- A/B testing framework
- Send time optimization

---

## **KPIs და Metrics**

| Metric | Target | აღწერა |
|--------|--------|--------|
| **Open Rate** | 25-35% | email-ის გახსნის % |
| **Click Rate (CTR)** | 3-5% | კლიკების % |
| **Conversion Rate** | 1-3% | შეძენების % |
| **Unsubscribe Rate** | <0.5% | გამოწერის გაუქმება |
| **Bounce Rate** | <2% | მიუწვდომელი emails |

---

## **ტექნიკური დეტალები**

### Tracking System:

```
Open Tracking:
<img src="https://api.czaba.store/api/marketing/track/open/{trackingId}"
     width="1" height="1" />

Click Tracking:
Original: https://czaba.store/product/xyz
Tracked:  https://api.czaba.store/api/marketing/track/click/{trackingId}/{linkId}
          → Redirect to original URL
```

### Segmentation Rules (JSON):

```json
{
  "operator": "AND",
  "conditions": [
    { "field": "totalOrders", "operator": ">=", "value": 1 },
    { "field": "lastPurchaseDate", "operator": ">", "value": "30d" },
    { "field": "preferredCategory", "operator": "in", "value": ["Track", "SFX"] }
  ]
}
```

---

## **Implementation Roadmap**

### Phase 1 (MVP) - Weeks 1-4:
- [ ] Database tables creation
- [ ] List CRUD API
- [ ] Campaign CRUD API
- [ ] Basic send functionality
- [ ] Open/Click tracking
- [ ] Admin UI: Lists management

### Phase 2 (Automation) - Weeks 5-8:
- [ ] Trigger-based campaigns
- [ ] Welcome series automation
- [ ] Cart abandonment emails
- [ ] Scheduled campaigns
- [ ] Admin UI: Campaign builder

### Phase 3 (Analytics) - Weeks 9-12:
- [ ] Stats aggregation
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] Performance reports

---

## **არ შედის V1-ში (მომავალი):**

- ❌ AI-based send time optimization
- ❌ Predictive analytics
- ❌ Multi-language campaigns
- ❌ SMS marketing integration
- ❌ Push notification campaigns

---

## **დამოკიდებულებები**

- ✅ Email System (EmailQueue, EmailTemplate) - უკვე არსებობს
- ✅ User System - უკვე არსებობს
- ✅ Order/Purchase tracking - უკვე არსებობს
- ⏳ Admin Panel Marketing section - საჭიროა შექმნა

---

## **დოკუმენტაცია**

| ფაილი | აღწერა |
|-------|--------|
| `backend/docs/marketing/EMAIL_CAMPAIGN_STRATEGY.md` | სტრატეგია და სეგმენტაცია |
| `backend/docs/marketing/EMAIL_SYSTEM_ARCHITECTURE.md` | ტექნიკური არქიტექტურა |
| `backend/docs/email-templates/TEMPLATES_READY.md` | მზა templates |

---
