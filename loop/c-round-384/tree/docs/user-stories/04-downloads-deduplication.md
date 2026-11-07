# Downloads - დუბლიკატების თავიდან აცილება

## User Story: ერთიანი პროდუქტი Downloads-ში

**As a** მომხმარებელი, რომელმაც შეიძინა Premium (ან გააკეთა Upgrade),
**I want to** ვნახო მხოლოდ ერთი პროდუქტის ჩანაწერი My Downloads-ში,
**So that I can** არ დავიბნეთ და მარტივად ვიპოვო რაც მჭირდება.

---

## ლოგიკა:

| შეძენილი ვერსია | Downloads-ში ჩანს | Download ოფციები |
|-----------------|-------------------|------------------|
| Standard | 1 პროდუქტი | Standard Pack (ZIP) |
| Premium | 1 პროდუქტი | Standard Pack + Premium Pack |
| Standard → Premium (Upgrade) | 1 პროდუქტი | Standard Pack + Premium Pack |

---

## Download Popup ლოგიკა:

```
Premium მფლობელისთვის Download ღილაკზე დაჭერა → Popup:
┌─────────────────────────────────────┐
│  Choose Download                     │
├─────────────────────────────────────┤
│  ○ Standard Pack (150 MB)           │
│    WAV, MP3 - Full Mix              │
│                                     │
│  ○ Premium Pack (800 MB)            │
│    Stems, 96kHz WAV                 │
│                                     │
│  [Download Selected]                │
└─────────────────────────────────────┘
```

---

## Backend ლოგიკა (OrderItem შენახვა):

```csharp
// თუ Upgrade ხდება:
// 1. შეამოწმე, მომხმარებელს აქვს თუ არა ამ პროდუქტის Standard
// 2. თუ აქვს - განაახლე არსებული ჩანაწერი Premium-მდე
// 3. არ შექმნა ახალი OrderItem - განაახლე არსებული

// Database: OwnedProducts ტაბულა
// productId | userId | versionType | purchasedAt | upgradedAt
// 1         | 100    | premium     | 2025-01-01  | 2025-01-15 (upgrade date)
```
