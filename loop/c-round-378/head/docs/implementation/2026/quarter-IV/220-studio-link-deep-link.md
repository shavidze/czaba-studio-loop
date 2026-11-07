# პროდუქტის გვერდიდან Studio-ში და უკან: "Try it in the Studio" და "View in store" (STUDIO-LINK)

**თარიღი:** 2026-10-31
**სტატუსი:** Completed (C round 300 PASS)
**შეცვლილი პროექტი:** Store

## კონტექსტი

PD-REVIEW-2026-10-31-ის F1-მა აჩვენა, რომ მყიდველს პროდუქტის გვერდიდან Studio-მდე პირდაპირი გზა არ ჰქონდა. Saba-მ 2026-10-31-ს დაამტკიცა STUDIO-LINK: პროდუქტის გვერდზე "Try it in the Studio", რომელიც `/studio-lab`-ს ხსნის ამ პროდუქტის public preview-ით მონიშნულად, ხოლო Studio-ს library-ში "View in store". D-29z749-ით ეს ორ ეტაპად გაიყო; ეს დოკუმენტი ორივე ეტაპს აღწერს: STUDIO-LINK-a (product-page link + deep link, რაუნდები 296–299) და STUDIO-LINK-b (library-დან მაღაზიაში, რაუნდი 300).

დაპირება: მყიდველი ტრეკის გვერდიდან ერთი click-ით მიდის Studio-ში, სადაც ამ ტრეკის preview მონიშნული და focused არის, და Enter-ით ემატება lane-ზე.

## მიდგომა

- **Static map (D-29z750).** Studio-ს demo-ში დღეს მხოლოდ ერთი პროდუქტის preview არსებობს: `demo-middle-east`. ახალი მოდული `studio-lab-links.ts` ინახავს `ReadonlyMap`-ს `middle-east → demo-middle-east`. პროდუქტს, რომელსაც mapping არ აქვს, link არ უჩანს.
- **უარყოფილი: dynamic preview.** პროდუქტის `audioPreviewUrl`-ის ჩატვირთვა `/studio-lab`-ს backend-ზე დამოკიდებულს გახდიდა და R2-ზე განთავსებული cross-origin MP3-ის Web Audio decode-ს მოითხოვდა; R2 CORS cloud-ში ვერ მოწმდება. ჩაწერილია როგორც STUDIO-LINK-DYNAMIC.
- **უარყოფილი: საერთო "Try the Studio" link ყველა პროდუქტზე.** ის per-product დაპირებას არღვევს.
- **მონიშვნა და არა დამატება.** Deep link source-ს მხოლოდ ირჩევს და focus-ს აძლევს. URL-ით lane-ზე clip-ის დამატება edit იქნებოდა, რომელსაც Undo დასჭირდებოდა.
- **Status line არ იწერება.** focus `role=option`-ზე `aria-selected`-ით არჩევანს თავად აცხადებს; ახალი status ჩანაწერი loading/ready და collection notice-ის ჩანაწერებს შეეჯახებოდა.
- **Param:** `?preview=<handle>` — public handle და არა შიდა source id.
- **Link-ის ადგილი:** მშვიდი ტექსტური link სათაურისა და არტისტის ქვეშ, იმავე tab-ში, მხოლოდ design tokens-ით. Buy ღილაკს არ ეჯიბრება.
- **STUDIO-LINK-b: context menu (D-29z771).** mapped library option-ზე მარჯვენა click, Shift+F10 ან ContextMenu ღილაკი ხსნის `role=menu`-ს ერთი item-ით "View in store". Item ნამდვილი `<a role="menuitem" href="/products/<handle>" target="_blank" rel="noopener noreferrer">`-ია: Ctrl-click, middle-click და URL preview მუშაობს, popup blocker არ ერევა. ახალი tab საჭიროა, რადგან `/studio-lab` არაფერს ინახავს.
- **უარყოფილი: მხოლოდ tooltip.** `title` link-ს ვერ შეიცავს, ხოლო "Right-click…" ტექსტი title-ში მხოლოდ თაგვისთვისაა და option-ის აღწერად იკითხება (product-designer).
- **Unmapped source-ზე custom menu არ არის** — ბრაუზერის native menu რჩება. Disabled item უარყოფილია: ის თითქმის ყველა row-ზე ჩიხს ასწავლის.
- **Reverse map.** `resolveStudioLabProductHandle` იმავე `ReadonlyMap`-იდან აგებს source → handle map-ს, ამიტომ ორი მიმართულება ვერ დაშორდება ერთმანეთს (VS1b).
- **ახალი menu component, ArrangementMarkerMenu-ის retrofit-ის გარეშე.** Marker menu-ს item-ები მუდმივია და Enter-ზე `preventDefault`-ს აკეთებს, რაც `<a>`-ის ნავიგაციას დაბლოკავდა. ორი მსგავსი menu-ის გაერთიანება frontend-architect checkpoint-ის საკითხია (B-R299-LIBRARY-MENU-DUPLICATION).
- **Focus.** Menu-ის ნებისმიერი დახურვისას (Esc, Tab, გარე click, window blur ან resize, link-ის გააქტიურება) focus option-ზე ბრუნდება. Link-ის click handler menu-ს იმავე event-ში ხურავს და option-ს focus-ს აძლევს, ამიტომ ახალი tab-ის `blur` უკვე დახურულ menu-ს ხვდება.
- **მარჯვენა click option-ს ირჩევს,** როგორც მარცხენა click; აქტიური preview, მარცხენა click-ის მსგავსად, ამ source-ზე გადადის.
- **Space** link-ს ერთხელ ააქტიურებს (`click()`); Enter ბრაუზერის საკუთარ link activation-ს ტოვებს. ორივე კლავიში Studio-ს shortcut-ებამდე არ აღწევს.
- **`?preview=`-ის შეცვლა mounted route-ზე (gate-296 S4):** ეფექტი მხოლოდ პირველ load-ზეა და ასე რჩება. პროდუქტის გვერდიდან ახალი გადასვლა route-ს თავიდან mount-ავს.
- **ეკრანზე მუდმივად არაფერი ემატება:** menu დროებითია, ხოლო ახალი row მხოლოდ `?` sheet-შია (`library-view-in-store`).

## არქიტექტურა

```mermaid
flowchart LR
  P[ProductSidebar: getStudioLabPreviewHref] -->|mapped handle| L["Link /studio-lab?preview=middle-east"]
  P -->|unmapped| N[link არ რენდერდება]
  L --> R[studio-lab route: useSearchParams]
  R --> M[resolveStudioLabPreviewSourceId]
  M -->|source id| C[ArrangementProvider initialSelectedSourceId]
  M -->|null| D[default: sources 0]
  C --> S[SSR-ში უკვე selected]
  S --> F[პირველი hydrated commit: wide და focus Studio-ს გარეთ → option.focus]
  O[library option: right-click / Shift+F10] --> H[getStudioLabProductHref]
  H -->|mapped| MN["ArrangementLibraryMenu: a role=menuitem target=_blank"]
  H -->|null| NM[native menu]
  MN -->|activate / Esc / Tab / outside / blur| FO[option.focus]
```

## შეცვლილი ფაილები

- `app/data/studio-lab-links.ts` — ახალი: `STUDIO_LAB_PREVIEW_PARAM`, `resolveStudioLabPreviewSourceId`, `getStudioLabPreviewHref`. არაფერს import-ს არ აკეთებს, რომ demo synth პროდუქტის გვერდის bundle-ში არ მოხვდეს.
- `app/contexts/ArrangementContext.tsx` — provider-ის optional prop `initialSelectedSourceId` და `selectedSourceId`-ის lazy initializer.
- `app/routes/studio-lab.tsx` — `?preview=`-ის წაკითხვა, provider-ისთვის გადაცემა და ერთჯერადი focus პირველ hydrated commit-ზე.
- `app/components/product/ProductSidebar.tsx` — "Try it in the Studio" link (`data-testid="product-studio-link"`).
- `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` — `@remix-run/react` mock-ში `useSearchParams`.
- `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx` — იგივე mock line.
- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` — იგივე mock line; round 299-ში NG9 server HTML-ს `applyBrowserParsedMutedState`-ით ამზადებს და warning-ს `muted`-ის გამონაკლისის გარეშე ამოწმებს.
- `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` — იგივე mock line.
- `app/lib/arrangement/__tests__/studio-link-ui.test.tsx` — ახალი: LK1–LK7.
- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` — ახალი: LH1–LH4 (round 297); round 298-ში LH3 ცალკე ფაილში გადავიდა, unmount-ები `afterEach`-ში; round 299-ში unmount hydration-მდე რეგისტრირდება.
- `app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx` — ახალი: LH3 თავის ფაილში (round 298); round 299-ში warning-ის სრული regex, ნულოვანი tolerance და `applyBrowserParsedMutedState`.
- `app/data/studio-lab-links.ts` (round 300) — `resolveStudioLabProductHandle` და `getStudioLabProductHref`.
- `app/components/arrangement/ArrangementLibraryMenu.tsx` — ახალი (round 300): ერთ-item-იანი library menu.
- `app/components/arrangement/ArrangementLibrary.tsx` (round 300) — option-ის `onContextMenu`, Shift+F10 / ContextMenu, menu-ის state და focus-ის დაბრუნება.
- `app/lib/arrangement/strings.ts` (round 300) — `studioLibraryMenuStrings`.
- `app/lib/arrangement/shortcuts.ts` (round 300) — `library-view-in-store` row.
- `app/lib/arrangement/__tests__/shortcuts.test.ts` (round 300) — ახალი id ID-ების სიაში.
- `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` (round 300) — library menu მეათე `rounded-panel` site-ია, მისი row `rounded-sm`-ს ინარჩუნებს.
- `app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx` — ახალი (round 300): VS1–VS8.
- `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` — ეს დოკუმენტი.

## პრობლემები და გადაწყვეტები

- **Problem:** route-მა `useSearchParams` რომ გამოიძახა, ოთხივე route test ფაილი ჩავარდა, რადგან მათ `@remix-run/react` mock-ს ეს ფუნქცია არ ჰქონდა. **Solution:** თითო ფაილში ერთი mock line ცარიელი `URLSearchParams`-ით; assertion-ები არ შეცვლილა.
- **Problem:** object literal lookup-ზე `__proto__`, `constructor` და `toString` prototype-იდან მნიშვნელობას აბრუნებს. **Solution:** `Map`, რომელიც ამ key-ებზე `null`-ს იძლევა (LK1).
- **Problem:** jsdom-ის hydration ტესტებში video dock-ის ორი `<video muted>` ``Prop `muted` did not match. Server: "false" Client: "true"`` warning-ს ბეჭდავდა (GATE297-S5-VIDEO-MUTED-SSR). Server HTML-ში `muted=""` attribute არის, მაგრამ React `muted`-ს property-ით ადარებს, ხოლო jsdom attribute-იდან `muted` property-ს არ აყენებს (`defaultMuted` არის `true`, `muted` — `false`). Chromium HTML spec-ის მიხედვით property-ს attribute-იდან აყენებს, ამიტომ ბრაუზერში warning არ ჩანს (C round 298: 0). ტესტებში ეს warning React-ის ერთჯერად flag-ს ხარჯავდა და dock-ის შემდეგ hydrate-ებული mismatch-ები არ ჩანდა. **Solution (round 299):** production კოდი არ შეცვლილა. ტესტის helper `applyBrowserParsedMutedState` server HTML-ის ყოველ `<video>`-ს hydration-მდე `muted = defaultMuted`-ს უწერს, როგორც ბრაუზერის parser აკეთებს. `suppressHydrationWarning` უარყოფილია, რადგან ის `<video>`-ის სხვა attribute-ების ნამდვილ mismatch-ებსაც დამალავდა.
- **Problem:** `demo-middle-east` demo collection-ში პირველია, ამიტომ მისი მონიშვნა default-ისგან ბრაუზერში არ განსხვავდება. **Solution:** ბრაუზერში დაკვირვებადი კონტრაქტი focus-ია (LK5), ხოლო `initialSelectedSourceId` jsdom-ში მოწმდება სამ-source collection-ზე, სადაც სამიზნე პირველი არ არის (LK4).

## ტესტირება

- `studio-link-view-in-store-ui.test.tsx` (round 300, 21 ტესტი): VS1/VS1b — reverse map, prototype key-ები და ორივე მიმართულების თანხვედრა; VS2 — მარჯვენა click: ერთი menu, ერთი `<a>` (`target=_blank`, `rel` noopener + noreferrer), focus item-ზე, option მონიშნული; VS3 — unmapped: menu არ არის, default არ არის prevented; VS4/VS4b — Shift+F10 და ContextMenu, held repeat არ ხსნის; VS5/VS5b — Esc, Tab, გარე pointer, window blur და resize: menu იხურება, focus option-ზე; VS6 — link-ის click იმავე event-ში ხურავს და focus option-ზეა; VS7/VS7b — Enter prevented არ არის, Space ერთხელ ააქტიურებს, არცერთი window-მდე არ აღწევს; VS8 — `?` sheet-ის row. ათი mutant scratch ასლზე წითელია (m1–m10: `target`, `rel`, refocus, Enter, unmapped, stopPropagation, reverse map, selection, repeat, Space).

- `studio-link-ui.test.tsx` (20 ტესტი):
  - LK1 / LK1b — handle-ის resolve, prototype key-ები და `null`.
  - LK2 — param-ის სახელი, href და mapped source-ის არსებობა demo-ში.
  - LK3 — sidebar link mapped პროდუქტზე და მისი არარსებობა unmapped-ზე.
  - LK4 — provider-ის საწყისი არჩევანი (`second`, `third`, `missing`, `null`, `undefined`).
  - LK5 — wide `?preview=middle-east`: option focused, `aria-selected="true"`, `tabindex="0"`.
  - LK6 — param-ის გარეშე, unmapped და `__proto__`: focus BODY-ზე, default არჩევანი.
  - LK7 — narrow: narrow heading, option focused არ არის.
- Covering set (round 296): 9 ფაილი, 89 ტესტი გადის. Round 298–299-ის covering set: 7 ფაილი, 58 ტესტი.
- ოთხი mutant scratch ასლზე: focus-ის მოხსნა (LK5 წითელი), `find`-ის მოხსნა (LK4 `second`/`third` წითელი), object literal (LK1-ის სამი prototype key წითელი), link ყოველთვის (LK3 წითელი).
- ბრაუზერის შემოწმება C-ის რაუნდ 296-ის რიგებშია.
- რაუნდ 297-ში `studio-link-hydrate-ui.test.tsx` (LH1–LH4) `~/data/studio-lab-demo`-ს რეალურ collection-ს `sources`-ის შებრუნებული რიგით იყენებს, ამიტომ `demo-middle-east` პირველი აღარ არის, და ყოველი row `renderToString` → `hydrateRoot` გზით გადის. LH1 — wide `?preview=middle-east`: მონიშნული და focused არის `demo-middle-east` და არა პირველი option. LH2 — param-ის გარეშე პირველი option მონიშნულია, focus BODY-ზეა. LH3 — server HTML-ში option უკვე `aria-selected="true"`-ია და hydration-ის შემდეგ focused-ია (round 298-დან hydration warning-ის შემოწმება ცალკე ფაილშია, იხ. ქვემოთ). LH4 — narrow hydrate: focus BODY-ზე, გაფართოების შემდეგ მხოლოდ `arrangement-exit`. Mutant-ები scratch ასლზე: (e) `initialSelectedSourceId`-ის prop-ის მოხსნა — LH1 და LH3 წითელი; (g) settle line-ის მოხსნა — LH4 წითელი; (f) `!isWide` guard-ის მოხსნა — მწვანე, equivalent mutant, რადგან hydrated narrow route workspace-ის mount-მდე `StudioNarrowScreen`-ს აბრუნებს და option, რომელსაც effect ეძებს, არ არსებობს.

- რაუნდ 298-ში LH3 გადავიდა `studio-link-hydrate-ssr-ui.test.tsx`-ში, რადგან React 18 ერთ load-ზე prop mismatch-ის მხოლოდ ერთ warning-ს ბეჭდავს (`didWarnInvalidHydration`): ძველ ფაილში LH1-ის hydration ამ flag-ს ხარჯავდა და LH3-ის შემოწმება ვერაფერს იჭერდა. ახალ ფაილში LH3 ერთადერთი hydration-ია. Warning-ის regex შევიწროვდა `/did not match|Expected server HTML|Hydration failed/i`-მდე, ამიტომ server-ის "useLayoutEffect does nothing on the server" warning აღარ ითვლება. `afterEach` unmount-ს უკეთებს ყოველ root-ს, რომლის hydration დასრულდა. Mutant-ები scratch ასლზე: (h) option-ზე server/client-ით განსხვავებული attribute — ახალ ფაილში LH3 წითელი, HEAD-ის ძველ ფაილში ოთხივე მწვანე იყო; (e) — LH1 და LH3 წითელი; (g) — LH4 წითელი; reorder-ის მოხსნა — LH3 წითელი. შეზღუდვა round 298-ში: jsdom-ში video dock-ის `muted` warning (GATE297-S5-VIDEO-MUTED-SSR) იგივე flag-ს ხარჯავდა, ხოლო regex server-ის მხოლოდ ზედმეტ attribute-ს ("Extra attributes from the server") ვერ იჭერდა (C-R298-01).

- რაუნდ 299-ში (C-R298-01) LH3-ისა და NG9-ის regex React 18.3.1-ის ყველა hydration warning-ს ფარავს, რომელიც `didWarnInvalidHydration`-ს აყენებს: `/did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i`. `applyBrowserParsedMutedState`-ის შემდეგ jsdom-ში `muted` warning აღარ ჩნდება, ამიტომ LH3 და NG9 ნებისმიერ hydration warning-ზე წითლდება (`toEqual([])`, `muted`-ის გამონაკლისის გარეშე). `hydrateRoute` unmount-ს hydration-მდე არეგისტრირებს, ამიტომ hydration-ის throw-ის შემთხვევაშიც root `afterEach`-ში იხსნება. Mutant-ები scratch ასლზე: (x) option-ზე მხოლოდ server-ის attribute — LH3 და NG9 წითელი (HEAD-ზე 20-ვე მწვანე იყო); (v) იგივე standby `<video>`-ზე — LH3 და NG9 წითელი (HEAD-ზე მწვანე); (y) მხოლოდ server-ის node — LH3, NG9 და NG9c წითელი; (h) — LH3 და NG9 წითელი; (r) და (r2) helper-ის გამოძახების მოხსნა — შესაბამისად LH3 და NG9 წითელი; (e) — LH1 და LH3 წითელი; (g) — LH4 წითელი; reorder-ის მოხსნა — LH3 წითელი. LH1 და NG9c warning-ს არ ამოწმებენ და helper-ს არ იყენებენ.

## TODO / შემდეგი ნაბიჯები

- STUDIO-LINK-DYNAMIC: ნებისმიერი პროდუქტის preview, R2 CORS-ის რეალურ ბრაუზერში დადასტურების შემდეგ.
- `?preview=` მხოლოდ პირველ load-ზე მოქმედებს (gate-296 S4); Studio → "View in store" → "Try it in the Studio" მეორე, ცარიელ Studio-ს ხსნის. ეს ცალკე გადაწყვეტილებაა (SABA-Q-STUDIO-LINK).
- B-R299-LIBRARY-MENU-DUPLICATION (signal): library და marker menu-ს საერთო primitive — frontend-architect checkpoint.
- GATE296-ARCH-ROUTE-DOM-FOCUS (signal): option-ის focus library-ის `optionRefs`-ით და არა route-ის DOM query-ით.
- A-R298-ARCH-HYDRATE-HARNESS (signal): ორ hydrate ფაილს ~120 საერთო ხაზი აქვს; საერთო test helper-ის (`applyBrowserParsedMutedState`-ის ჩათვლით) გამოყოფა architecture checkpoint-ის საკითხია.
- NAME-AND-HINT: სახელი "CZABA Studio" (`<title>`, nav, header) და ერთჯერადი hint.
