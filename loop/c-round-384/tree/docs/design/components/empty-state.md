# EmptyState

ცარიელი მდგომარეობის კომპონენტი — აიქონი, ტექსტი, მოქმედებები.

## Props

| Prop | ტიპი | აღწერა |
|------|------|--------|
| `icon` | `LucideIcon` | custom აიქონი |
| `preset` | `string` | წინასწარ განსაზღვრული აიქონი (ქვემოთ) |
| `title` | `string` | **სავალდებულო** — სათაური |
| `description` | `string` | **სავალდებულო** — აღწერა |
| `actionLabel` | `string` | პირველადი ღილაკის ტექსტი |
| `actionHref` | `string` | პირველადი ღილაკის ლინკი |
| `onAction` | `() => void` | პირველადი ღილაკის callback |
| `secondaryActionLabel` | `string` | მეორადი ღილაკის ტექსტი |
| `secondaryActionHref` | `string` | მეორადი ღილაკის ლინკი |
| `onSecondaryAction` | `() => void` | მეორადი ღილაკის callback |

## Preset აიქონები

| Preset | აიქონი | გამოყენება |
|--------|--------|------------|
| `cart` | ShoppingBag | ცარიელი კალათა |
| `downloads` | Download | ჩამოტვირთვები არ არის |
| `library` | FileMusic | ბიბლიოთეკა ცარიელია |
| `orders` | Package | შეკვეთები არ არის |
| `search` | Search | ძებნას შედეგი არ აქვს |
| `favorites` | Heart | ფავორიტები ცარიელია |
| `notifications` | Bell | შეტყობინებები არ არის |

## სტრუქტურა

```
┌─────────────────────────┐
│      ┌──────────┐       │
│      │  Icon    │       │  20×20, rounded-2xl, bg-elevated
│      │  w-10    │       │  border-outline
│      └──────────┘       │
│                         │
│     Title (xl, medium)  │  text-foreground
│   Description (muted)   │  max-w-sm
│                         │
│  [Primary] [Secondary]  │  flex, gap-3
└─────────────────────────┘
```

## ღილაკების სტილი

| ღილაკი | კლასები |
|--------|---------|
| Primary | `bg-brand text-background rounded-lg px-6 py-3` |
| Secondary | `bg-elevated text-foreground border border-outline rounded-lg px-6 py-3` |

## გამოყენება

```tsx
import { EmptyState } from '~/components/ui/EmptyState';

// preset-ით
<EmptyState
  preset="cart"
  title="კალათა ცარიელია"
  description="დაამატეთ პროდუქტები კალათაში"
  actionLabel="მაღაზია"
  actionHref="/products"
/>

// custom icon-ით
<EmptyState
  icon={Music}
  title="ტრეკები არ მოიძებნა"
  description="სცადეთ სხვა ფილტრები"
  actionLabel="ფილტრების გასუფთავება"
  onAction={clearFilters}
  secondaryActionLabel="მთავარი"
  secondaryActionHref="/"
/>
```

## Layout

- **Padding:** `py-20 px-4`
- **Alignment:** `flex-col items-center justify-center text-center`
- **Actions:** `flex-col sm:flex-row gap-3` (მობილზე ვერტიკალური)
