# უცნობი ფასი ბარათებზე: version card, `/store` card და home card (FIX-PD-1a2, F9)

**თარიღი:** 2026-10-31
**სტატუსი:** Completed (C round 288 PASS)
**შეცვლილი პროექტი:** Store (`product-utils`, `VersionSelector`, `store.tsx`, `ProductCard`, tests, docs)

## კონტექსტი

რაუნდ 286-მა purchase panel-ში უცნობი ფასისთვის „Price unavailable“ მდგომარეობა შემოიღო, მაგრამ ბარათებზე იგივე ფასი ისევ `0`-ად იქცეოდა `?? 0`-ის გამო:

- **C-R286-01 (Medium):** ფასის გარეშე Track-ის (`priceless-track`) Standard version card-ზე ეწერა `Standard $0`, მაშინ როცა იმავე გვერდის panel-ში — `Price unavailable`.
- **C-R286-02 (Low):** `/store` card-ზე `priceless-pack` აჩვენებდა `$0`-ს, მისი გვერდი კი — `Price unavailable`.
- **Home card-ის რისკი:** იგივე ჯაჭვი `ProductCard`-ში (home `ProductSection`) უცნობ ფასს `Complimentary`-ად აქცევდა, ანუ ფასიან პროდუქტს უფასოდ არეკლამებდა.

## მიდგომა

- `DisplayVersion.price` გახდა `number | undefined`: `undefined` ნიშნავს უცნობ ფასს, `0` რჩება „უფასოდ“.
- Synthetic Standard ფასს იღებს `resolveCatalogPrice`-დან (იგივე resolver, რასაც panel და sidebar იყენებს). რეალური variant-ის არავალიდური ფასი (`NaN`, უარყოფითი) ხდება `undefined`.
- ახალი export `formatCatalogPriceLabel` ერთ ადგილას აფორმებს ბარათის ტექსტს: `undefined` → `Price unavailable`, სხვა შემთხვევაში `$N`.
- სამივე ბარათი უცნობ ფასს აჩვენებს არსებულ price slot-ში, ჩამქრალი სტილით (`text-sm font-light text-muted`), რომ ფასად არ აღიქმებოდეს. ცნობილი ფასის markup და კლასები უცვლელია.
- უარყოფილი ვარიანტები:
  - **„—“** — ორაზროვანია და panel-ის სიტყვისგან განსხვავდება;
  - **price slot-ის დამალვა** — ბარათის layout ხტება და გვერდისგან განსხვავებული მდგომარეობაა;
  - **თითო ბარათზე საკუთარი fallback ჯაჭვი** (A-R286-ARCH-ONE-RESOLVER) — სწორედ ამან გამოიწვია განსხვავება; ახლა ყველა ერთ resolver-ს იყენებს.
- აშკარა `0` უცვლელია: `/store`-ზე `$0`, home-ზე `Complimentary`, panel-ში `$0.00`.

## არქიტექტურა

```mermaid
flowchart LR
  P[Product] --> R[resolveCatalogPrice]
  R --> F[formatCatalogPriceLabel]
  R --> DV[createDisplayVersions: synthetic Standard price]
  DV --> VS[VersionSelector card]
  F --> SC[/store card]
  F --> HC[home ProductCard]
  R --> PH[PurchaseHeader — უცვლელი]
```

## შეცვლილი ფაილები

- `app/lib/product-utils.ts`
- `app/components/product/VersionSelector.tsx`
- `app/routes/store.tsx`
- `app/components/product/ProductCard.tsx`
- `app/lib/__tests__/product-utils.test.ts`
- `app/lib/__tests__/product-price-cards.test.tsx` (ახალი)
- `docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md`

## პრობლემები და გადაწყვეტები

- **Problem:** synthetic Standard-ის ჯაჭვი `?? 0`-ით მთავრდებოდა და `VersionSelector` `$0`-ს ხატავდა. **Solution:** `resolveCatalogPrice(product)` და ცალკე „unknown“ შტო price slot-ში.
- **Problem:** upgrade card-ზე უცნობი Premium ფასი `+$NaN`-ს ან უარყოფით რიცხვს მისცემდა. **Solution:** `getUpgradePrice` უცნობ ფასზე აბრუნებს `undefined`-ს და card აჩვენებს `Price unavailable`-ს, `+$`-ისა და გადახაზული ფიგურის გარეშე.
- **Problem:** home card-ზე უცნობი ფასი `Complimentary` badge-სა და ტექსტს იღებდა. **Solution:** `isFree` რჩება `priceAmount === 0`; `undefined` უფასო არ არის, ამიტომ `Pack` badge რჩება.
- **Problem:** Remix testing stub პროექტში არ არის. **Solution:** SC1 route-ს არენდერებს `@remix-run/react`-ის mock-ით და რეალური `loader`-ით (mocked `apiClient.getProducts`), `mapProductToPack`-ის export-ის გარეშე.
- **Problem (C-R287-01, D-29z705):** უცნობი ფასის `text-sm` 20px-იან line box-ს ქმნიდა, ცნობილი ფასისა კი 32px (`/store`, `text-2xl`) და 28px (home, `text-lg`) იყო. ამიტომ ფასის გარეშე ბარათი 12/8px-ით დაბალი იყო და grid-ის რიგი ირღვეოდა. **Solution:** unknown შტოს დაემატა line-height utility: `/store`-ზე `leading-8`, home-ზე `leading-7`. ტექსტი კვლავ `text-sm font-light text-muted`-ია, ბარათის სიმაღლე კი ცნობილი ფასის ბარათისას უდრის (589.6 / 417.6). ცნობილი ფასის შტო byte-identical-ია.
- **Problem (A-R287-PREMIUM-UNVALIDATED):** synthetic Premium `product.premiumPrice`-ს ვალიდაციის გარეშე იღებდა, ამიტომ `premiumPrice: -5` card-ზე `$-5`-ად ჩანდა, panel-ში კი `Price unavailable`-ად (card ≠ page). **Solution:** `price` ხდება `isValidCatalogPrice(product.premiumPrice) ? product.premiumPrice : undefined`. არსებობის წესი (`if (product.premiumPrice)`) უცვლელია: 0 Premium-ს არ ამატებს, −5 და `Infinity` კი Premium-ს `Price unavailable`-ით აჩვენებს. დამალვა უარვყავით, რადგან მაშინ panel-ი Premium-ს შესთავაზებდა, ბარათები კი არა.

## ტესტირება

- **PR5** (ერთი შეცვლილი ხაზი): priceless Track-ის synthetic Standard-ის ფასი `undefined`-ია.
- **PR7–PR9:** synthetic Standard (unknown / 19 / 7 / აშკარა 0), რეალური variant-ის ფასი (49, 0, `NaN`, `-1`), `formatCatalogPriceLabel`.
- **VC1–VC4:** version card-ის price slot (unknown, unknown Standard + `$99` Premium, unknown upgrade, ცნობილი ფასების რეგრესია `+$149` / `$199` / `$49`).
- **PC1–PC2:** home card (unknown → `Price unavailable` + `Pack`, აშკარა 0 → `Complimentary`, 9 → `$9`).
- **SC1:** `/store` route: priceless pack → `Price unavailable`, ცნობილი → `$29`.
- **PR10:** synthetic Premium: `-5` და `Infinity` → Premium არსებობს `undefined` ფასით, `59` → 59, `0` → მხოლოდ `Standard`.
- **VC5:** `premiumPrice: -5` → Premium card-ზე `Price unavailable`, Standard card-ზე `$19`, markup-ში `$-5` და `NaN` არ არის.
- PC1, PC2 და SC1-ის class pin-ები განახლდა `leading-7` / `leading-8`-ზე (ჩანაცვლება და არა წაშლა).
- **Mutants N1–N6:** თითოეული წითელია მინიმუმ მოთხოვნილ row-ებზე.
- **Mutants N7–N10:** N7 (`leading-8`-ის მოხსნა) → SC1; N8 (`leading-7`-ის მოხსნა) → PC1; N9 (`price: product.premiumPrice`) → PR10, VC5; N10 (Premium-ის დამალვა არავალიდურ ფასზე) → PR10, VC5.
- Typecheck, lint, 8 covering ფაილი; browser smoke 1440-ზე standard და priceless mock-ით.
- რაუნდი 288: browser smoke 1440-ზე `bad-premium-track` fixture-ით. Computed `line-height` 32px (`/store`) და 28px (home), ბარათები 589.6 / 417.6, Premium-ის არჩევისას panel-ში `Price unavailable` და ორივე ღილაკი `aria-disabled`.

## TODO / შემდეგი ნაბიჯები

- **FIX-PD-1b** — FIX-PD-1-ის შემდეგი ეტაპი.
- **PD-FREE-HEADER** (STORE-4) — panel-ის `$0.00` უფასო პროდუქტისთვის.
- **B-R286-UNUSED-PRICE-RENDERERS** — `RelatedTracksCarousel` და `TrackRow` გამოუყენებელი price renderer-ები.
- **A-R287-ARCH-ADAPTER-ZERO** (signal) — `productAdapter.ts`-ში `(variant.price ?? 0)` კიდევ ერთი `?? 0`-ია ამ diff-ის გარეთ. ამჟამად consumer არ ჰყავს, ცალკე შეზღუდულ შემოწმებას მოითხოვს.
