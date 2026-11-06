# Library-ის group heading accessibility tree-ში ერთხელ და სტაბილური focus (FIX-PD-1b2, GATE289-S1/S2/S3)

**თარიღი:** 2026-10-31
**სტატუსი:** Completed (C round 291 PASS)
**შეცვლილი პროექტი:** Store (`ArrangementLibrary.tsx`, tests, docs)

## კონტექსტი

რაუნდ 289-მა (doc 216) library-ის შედეგები `collectionLabel`-ის runs-ად დაყო და ≥ 2 run-ზე თითო run `role="group"`-ში მოაქცია, heading `div`-ზე `aria-labelledby`-ით. Gate 289-ის reviewer-მა სამი საკითხი დატოვა:

- **S1 (Medium):** heading `div` accessibility tree-ში ჩვეულებრივ generic კვანძად რჩებოდა. Chromium-ის `ariaSnapshot` group-ში option-ების გვერდით `text:` ხაზს აჩვენებდა, ანუ screen reader კოლექციის სახელს ორჯერ ისმენდა: ერთხელ group-ის სახელად და მეორედ ცალკე ტექსტად.
- **S2 (Medium):** doc 216-ის „დაპირება“ ამბობდა, რომ კოლექცია „ყოველთვის ჩანს“. ეს მცდარია ერთი კოლექციის ძიებასა და purchased library-ში, სადაც heading საერთოდ არ იხატება.
- **S3 (Low):** group-ის React `key` `runIndex`-ზე იყო აგებული. როცა ძიება შედეგებს ცვლიდა, ინდექსის წანაცვლებისას group თავის option-ებთან ერთად თავიდან mount-დებოდა, focused option DOM-იდან ქრებოდა და focus `body`-ზე ვარდებოდა.

ამასთან, `strings.test.ts`-ის ST47 და ST51 სათაურები ისევ ქართულ გამონაკლისებს ახსენებდა, რომლებიც რაუნდ 289-მა უკვე ამოიღო.

## მიდგომა

1. **S1:** heading `div`-ს დაემატა `aria-hidden="true"`. `aria-labelledby` aria-hidden შიგთავსსაც კითხულობს, ამიტომ group-ის accessible name იგივე რჩება, ხოლო ცალკე ტექსტური კვანძი tree-დან ქრება. `id`, კლასები და ტექსტი უცვლელია, ამიტომ ვიზუალურად არაფერი იცვლება.
2. **S3:** თითო run იღებს სტაბილურ `key`-ს: `${label}#${occurrence}`, სადაც `occurrence` არის იმავე label-ის მქონე წინა run-ების რაოდენობა (0-დან). ეს key უცვლელია ორ შემთხვევაში:
   - (a) როცა მის წინ მთელი run ქრება და ამ run-ს სხვა label აქვს;
   - (b) როცა საკუთარი run-ის პირველი option ქრება.

   **ზღვარი:** label, რომელიც სხვის შემდეგ ბრუნდება (A, B, A — doc 216-ის edge rule), სრულად არ არის დაცული. თუ პირველი A run ქრება, ბოლო group-ის key `#1`-დან `#0`-ზე გადადის და group remount-დება. თუ B ქრება, ორი A run ერთდება და option-ები ახალ parent-ში გადადის. ეს ვერცერთი group key ვერ დაიცავს. Demo-სა და purchased data-ში ეს შემთხვევა დღეს არ ხდება.

   `headingId` ინდექსზე დაფუძნებული რჩება, რადგან ის მხოლოდ `id`-სა და `aria-labelledby`-ს აკავშირებს, ორივეს mounted ელემენტზე.
3. **S2:** doc 216-ის მხოლოდ l.17 შეიცვალა. ახალი ტექსტი ამბობს, რომ heading მხოლოდ ≥ 2 კოლექციაზე ჩანს, ხოლო სრული სათაური hover `title`-ში, accessible description-სა და preview-ის სათაურში რჩება.
4. **ST47/ST51:** შეიცვალა მხოლოდ ორი სათაური. ტესტის body და მასივები უცვლელია.

**უარყოფილი ალტერნატივა (M2):** `key={results[run.start].id}`, ანუ run-ის პირველი option-ის id, რომელიც gate reviewer-მა შემოგვთავაზა. შემთხვევა (a)-ს ფარავს, მაგრამ (b)-ში run-ის პირველი option ქრება, key იცვლება და group ისევ remount-დება. B-ის pre-check-ში ამ mutant-ზე LG8 `b-two` წითელია.

## არქიტექტურა

```
results ──► libraryResultRuns: { key: "Label B#0", label, start, end }[]
                │
                ├── runs ≥ 2 ──► <div role="group" key={run.key} aria-labelledby={headingId}>
                │                   ├── <div id={headingId} aria-hidden="true">{label}</div>
                │                   └── option × N
                └── runs < 2 ──► option × N (flat, უცვლელი)
```

Run-ების გამოთვლის რიგი, `resultIds`, roving focus და flat branch უცვლელია.

## შეცვლილი ფაილები

- `app/components/arrangement/ArrangementLibrary.tsx`: run-ის `key` და heading-ის `aria-hidden`.
- `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx`: fixture `threeRunSources`, LG8 (2 შემთხვევა) და LG9. LG1–LG7 უცვლელია.
- `app/lib/arrangement/__tests__/strings.test.ts`: ST47 და ST51-ის სათაურები.
- `docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md`: l.17.
- `docs/implementation/2026/quarter-IV/217-fix-pd-library-heading-a11y.md`: ეს doc.

## პრობლემები და გადაწყვეტები

- **Problem:** heading-ის ტექსტი accessibility tree-ში ორჯერ ჩანდა: group-ის სახელად და ცალკე `text:` კვანძად.
  **Solution:** `aria-hidden="true"` heading-ზე; სახელი `aria-labelledby`-ით რჩება (LG9).
- **Problem:** `runIndex`-ზე დაფუძნებული key ძიებისას group-ს remount-ს უწვევდა და focus `body`-ზე ვარდებოდა.
  **Solution:** `label#occurrence` key (LG8, ორივე შემთხვევა).
- **Problem:** პირველი option-ის id-ზე დაფუძნებული key (M2) ნაწილობრივი გამოსავალია.
  **Solution:** უარყოფილია; შემთხვევა (b) მას ვერ უძლებს.

## ტესტირება

- **LG8** (`it.each`, `c-two` და `b-two`): სამ run-იან fixture-ზე focused option ძიების `kick`-ის შემდეგ იგივე DOM node რჩება (`isConnected`) და `document.activeElement` მასზე რჩება; group-ები `['Label B','Label C']`.
- **LG9:** თითო label-ზე `getByRole('group', { name })` პოულობს group-ს, მისი heading-ის `textContent` label-ია და `aria-hidden` არის `true`.
- **ST47 / ST51:** იგივე assert-ები ახალი სათაურებით.
- Unit: `npm run typecheck`, `npm run lint` და 15 covering ფაილი.
- Browser: Chromium-ის AX tree, keyboard order, screenshots და journey 1440×900-სა და 1280×720-ზე (C round 291). რეალური screen reader cloud-ში ხელმისაწვდომი არ არის; Chromium-ის AX tree მისი გაზომვადი proxy-ა.

## TODO / შემდეგი ნაბიჯები

- **B-R290-LIB-SHAPE-SWITCH-FOCUS (Low, deferred):** grouped ↔ flat გადასვლისას (≥ 2 run → 1 და პირიქით) option-ები ახალ parent-ში გადადის, ამიტომ სია ისევ remount-დება და focused option იკარგება. Demo-ში ამის მიღწევა არ ხერხდება, რადგან ძიების აკრეფა focus-ს search box-ში ინახავს. `deferred_low_polish`-შია.
- LIVE-MEAS-BROWSER-SEARCH-LOCATION: group heading-ის Ableton-თან შესაბამისობა დაუდასტურებელი რჩება გაზომვამდე.
