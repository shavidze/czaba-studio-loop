# Store Page - Pack-ების გვერდი

> შექმნილია: 2026-01-08
> სტატუსი: აქტიური

---

## მოკლე მიმოხილვა

Store გვერდი (`/store`) აჩვენებს Pack-ებს (Sound Libraries, Loop Kits, etc.) პრემიუმ 3D ვიზუალიზაციით.

**ფაილი:** `app/routes/store.tsx`

---

## Box Color System

Pack-ებს აქვთ 3D ყუთის ვიზუალიზაცია ფერების სისტემით.

### ფერები

| ფერი | გამოყენება | Shopify Tag |
|------|------------|-------------|
| **Gold** | Featured, Premium | `box:gold` |
| **Silver** | Standard releases | `box:silver` |
| **Copper** | Limited Edition | `box:copper` |
| **Midnight Blue** | Music category | `box:midnight` |
| **Emerald** | SFX category | `box:emerald` |
| **Crimson** | Loops category | `box:crimson` |
| **Obsidian** | Sounds category | `box:obsidian` |

### ფერის არჩევის პრიორიტეტი

```
1. pack.boxColor (explicit override)
2. pack.isFeatured → gold
3. pack.isLimited → copper
4. pack.category → category-based color
```

### ფაილების ლოკაცია

```
/public/images/packs/boxes/
├── gold.png
├── silver.png
├── copper.png
├── midnight.png
├── emerald.png
├── crimson.png
└── obsidian.png
```

---

## Pack Interface

```typescript
type PackCategory = 'sfx' | 'loops' | 'sounds' | 'music';
type BoxColor = 'gold' | 'silver' | 'copper' | 'midnight' | 'emerald' | 'crimson' | 'obsidian';

interface Pack {
  id: string;
  title: string;
  subtitle: string;
  handle: string;
  image: string;           // Custom image (overrides box)
  price: string;
  originalPrice?: string;  // For sale display
  isNew: boolean;
  isLimited?: boolean;     // Limited edition → copper box
  isFeatured?: boolean;    // Featured → gold box
  limitedStock?: number;   // "Only X remaining"
  category: PackCategory;
  itemCount?: number;
  format?: string;         // "24-bit WAV"
  boxColor?: BoxColor;     // Explicit box color override
}
```

---

## Shopify Integration

### Tags to Use

```
box:gold      → Gold box
box:silver    → Silver box
box:copper    → Copper box
box:midnight  → Midnight Blue box
box:emerald   → Emerald box
box:crimson   → Crimson box
box:obsidian  → Obsidian box
featured      → isFeatured = true
limited       → isLimited = true
```

### Product Type

```
product_type: "Pack" ან "Bundle"
```

---

## UI კომპონენტები

### PackCard

3D ყუთის ქარდი perspective ეფექტით.

**Features:**
- `rotateY(-4deg) rotateX(1deg)` - 3D perspective
- Hover: `scale(1.05)` + glow effect
- Ground shadow blur
- "NEW RELEASE" vertical badge (left side)
- "Limited" badge (top right)

### Filter Bar

Multi-select category filter (იგივე სტილი რაც Music გვერდზე).

```tsx
const CATEGORIES = [
  { value: 'music', label: 'Music' },
  { value: 'sfx', label: 'SFX' },
  { value: 'loops', label: 'Loops' },
  { value: 'sounds', label: 'Sounds' },
];
```

---

## ახალი Pack-ის დამატება

### Shopify-ში:

1. შექმენი პროდუქტი `product_type: "Pack"`
2. დაამატე tags: `box:gold` (ან სხვა ფერი)
3. Optional: `featured`, `limited`

### კოდში (მანამ Shopify integration არ არის):

```typescript
// loader()-ში დაამატე:
{
  id: '7',
  title: 'NEW PACK NAME',
  subtitle: 'Description here',
  handle: 'new-pack-handle',
  image: '',  // ცარიელი = box system გამოიყენება
  price: '$49',
  isNew: true,
  category: 'music',
  boxColor: 'gold',  // Optional override
  itemCount: 100,
  format: '24-bit WAV',
}
```

---

## TODO

- [ ] Shopify-დან Pack-ების fetch
- [ ] 7 ახალი box რენდერის შექმნა
- [ ] `LEGACY_BOX_FALLBACK`-ის მოშლა ახალი რენდერების შემდეგ

---

## დაკავშირებული ფაილები

| ფაილი | აღწერა |
|-------|--------|
| `app/routes/store.tsx` | მთავარი გვერდი |
| `docs/design/box-render-specs.md` | Box რენდერის სპეციფიკაციები |
| `docs/design/store-cards-audit.md` | დიზაინის აუდიტი |
| `public/images/packs/boxes/` | Box სურათები |
