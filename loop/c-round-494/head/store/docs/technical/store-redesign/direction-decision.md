# Store Redesign Direction Decision

**თარიღი:** 2026-11-05
**გადაწყვეტილება:** **A — Obsidian & Brass**
**სტატუსი:** Approved (Saba delegated choice to root, 2026-11-05)

## არჩეული მიმართულება

**A — Obsidian & Brass gallery**

მუქი, კინემატოგრაფიული გალერეის თემა ოქროსფერი აქცენტით.

## რატომ A

### 1. Brand vision-თან თანხვედრა
Brand manifest (`docs/design/brand-vision.md`) პირდაპირ აღწერს:
- "მუქი, კინემატოგრაფიული, მინიმალისტური"
- "მონოქრომული (შავი, ნაცრისფერი, თეთრი) + ერთი მკვეთრი აქცენტი (ოქროსფერი)"
- "ციფრული არტ-გალერეა" — gallery კონცეფცია

### 2. Store-Studio ვიზუალური ერთიანობა
- Studio უკვე Obsidian & Brass თემაზეა (STORE-2a, რაუნდი 192-195)
- ტოკენები `app.css`-ის `@theme`-შია: `--color-brand`, `--color-brand-hover`, `--color-brand-rgb`, `--color-background`, `--color-surface`
- F6 (Store/Studio ვიზუალური mismatch) ავტომატურად იხურება

### 3. კონკურენტული პოზიციონირება
- Premium audio marketplace = dark theme + gold accent (industry standard: Splice, Artlist premium tiers)
- "ციფრული არტ-გალერეა" ≠ liner notes (B) ≠ tool-first (C)

## უარყოფილი ვარიანტები

### B — Ivory & Ink liner notes
- ღია თემა ვინილის ალბომის ესთეტიკით
- პრობლემა: არ ემთხვევა brand vision-ს ("მუქი"), Studio-სთან ვიზუალური კონფლიქტი

### C — Graphite Studio-first
- Studio-ს ინტერფეისის გაფართოება მთელ საიტზე
- პრობლემა: Store და Studio სხვადასხვა ფუნქციაა — Store = გალერეა, Studio = სამუშაო სივრცე. ერთი UI ორივესთვის = არცერთისთვის ოპტიმალური

## STORE-2b–5 განბლოკვა

ეს ფაილი განბლოკავს:
- **STORE-2b:** homepage hero და category sections Obsidian თემით
- **STORE-2c:** product page Obsidian & Brass palette
- **STORE-2d:** checkout და account pages
- **STORE-3–5:** hero, product/listening, loading/docs

## ტოკენები (STORE-2a-დან)

უკვე არსებობს `app.css`-ის `@theme`-ში (მიმდინარე მნიშვნელობები — `docs/design/DESIGN_SYSTEM.md`):
```
--color-background: #0e0d0c;    /* Obsidian */
--color-surface: #161412;
--color-elevated: #1d1a17;
--color-brand: #c9a46a;         /* Brass */
--color-brand-hover: #d9b87f;
--color-brand-rgb: 201, 164, 106;
```

ახალი ტოკენები STORE-2b+-ში: hero gradient, card hover, category badge ფერები.
