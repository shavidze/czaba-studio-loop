# უცნობი ფასი ბარათებზე: version card, `/store` card და home card (FIX-PD-1a2, F9)

**თარიღი:** 2026-10-31
**სტატუსი:** Completed (C round 287 PASS)
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

## ტესტირება

- **PR5** (ერთი შეცვლილი ხაზი): priceless Track-ის synthetic Standard-ის ფასი `undefined`-ია.
- **PR7–PR9:** synthetic Standard (unknown / 19 / 7 / აშკარა 0), რეალური variant-ის ფასი (49, 0, `NaN`, `-1`), `formatCatalogPriceLabel`.
- **VC1–VC4:** version card-ის price slot (unknown, unknown Standard + `$99` Premium, unknown upgrade, ცნობილი ფასების რეგრესია `+$149` / `$199` / `$49`).
- **PC1–PC2:** home card (unknown → `Price unavailable` + `Pack`, აშკარა 0 → `Complimentary`, 9 → `$9`).
- **SC1:** `/store` route: priceless pack → `Price unavailable`, ცნობილი → `$29`.
- **Mutants N1–N6:** თითოეული წითელია მინიმუმ მოთხოვნილ row-ებზე.
- Typecheck, lint, 8 covering ფაილი; browser smoke 1440-ზე standard და priceless mock-ით.

## TODO / შემდეგი ნაბიჯები

- **FIX-PD-1b** — FIX-PD-1-ის შემდეგი ეტაპი.
- **PD-FREE-HEADER** (STORE-4) — panel-ის `$0.00` უფასო პროდუქტისთვის.
- **B-R286-UNUSED-PRICE-RENDERERS** — `RelatedTracksCarousel` და `TrackRow` გამოუყენებელი price renderer-ები.
