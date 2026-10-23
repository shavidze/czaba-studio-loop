# Arrangement workspace — შეძენილი route-ის mount-ის გზამკვლევი (SRW-21)

**სტატუსი:** mount ჯერ არ გაკეთებულა. `app/routes/studio.$productId.tsx` auth-ის მფლობელს ეკუთვნის და მისი ნებართვის გარეშე არ იცვლება.

## მიმოხილვა

`/studio-lab` და მომავალი შეძენილი Studio ერთ სამუშაო სივრცეს იყენებს (`ArrangementProvider` + `StudioWorkspace`). განსხვავება მხოლოდ `WorkspaceCollection`-შია:

- დემო: `app/data/studio-lab-demo.ts` (origin `demo`);
- შეძენილი: `createPurchasedWorkspaceCollection` (`app/lib/arrangement/collection.ts`, origin `purchased`).

სათაური, badge, ჩატვირთვის სტატუსები და ექსპორტის ფაილების სახელები `workspaceCollectionCopy(collection.origin)`-დან მოდის, ამიტომ შეძენილ mount-ზე დემოს ტექსტი არ ჩანს.

## სცენარი: მარიამი შეძენილ სტემებს ხსნის

1. მარიამი შესულია სისტემაში და ხსნის `/studio/middle-east`-ს.
2. `RequireAuth` ამოწმებს სესიას. Route ითხოვს `/api/studio-token`-ს `Authorization: Bearer`-ით და შეძენის შემოწმება backend-ზე ხდება.
3. Route ყოველ stem URL-ს `?token=`-ს უმატებს (არსებული flow).
4. Route ქმნის კოლექციას და workspace-ს `ArrangementProvider`-ში ახვევს. ეკრანზე ჩანს „CZABA Studio · სამუშაო სივრცე“ და badge „შეძენილი კოლექცია“.

## Mount-ის ნაბიჯები

1. **კოლექცია:** `createPurchasedWorkspaceCollection({ productId, productTitle, stems })`, სადაც `stems` არის loader-ის `AudioStem[]`, რომლის `audioUrl`-ებსაც route-ის client effect-მა `/api/studio-token`-ის პასუხის შემდეგ `?token=` დაუმატა. Adapter URL-ს არაფერს უმატებს.
2. **მეხსიერება:** კოლექცია ერთხელ შეიქმნას (`useMemo` token-ის მიღების შემდეგ). ახალი ობიექტი provider-ის load effect-ს ხელახლა უშვებს.
3. **Provider:** `<ArrangementProvider collection={collection}><StudioWorkspace /></ArrangementProvider>`.
4. **ცარიელი stems:** factory `Error`-ს აგდებს. Route-მა ეს loader-ის 404-ამდე უნდა დაიჭიროს (ახლა loader ცარიელ stems-ზე უკვე 404-ს აბრუნებს).

## რა უნდა დარჩეს უცვლელი

- `RequireAuth` route-ის გარშემო.
- `/api/studio-token`-ის request `Authorization: Bearer`-ით. ეს **route-ის** პასუხისმგებლობაა და არა adapter-ის. Adapter-ის request-ში მხოლოდ `credentials: 'omit'` და `signal` გადაეცემა: header არ არის.
- შეძენის შემოწმება backend-ზე (`api.studio-token.ts`).
- შეცდომის ტექსტებში URL, query და token არ ჩანს. ახალი შეცდომის ტექსტიც ამ წესს უნდა მიჰყვეს.
- `/studio-lab` შეძენილ კოლექციას არასდროს ქმნის. Route-ები `collection.ts`-ს ჯერ არ აიმპორტებენ.

## ღია წინაპირობები

- **ნებართვა auth-ის მფლობელისგან** `studio.$productId.tsx`-ის შესაცვლელად.
- **Hardcoded loader:** loader-ში `stemsFolder = 'middle-east'` და სტემების სია ფიქსირებულია. ნებისმიერი `productId` ერთსა და იმავე სტემებს იღებს. Mount-მდე საჭიროა პროდუქტზე დამოკიდებული წყარო.
- შეძენილი Studio ჯერ ისევ `StudioContext`-ს იყენებს. Mount-ის შემდეგ საჭიროა R21-I2 სრული რეგრესია.

## შენიშვნები

- ჩატვირთვის სტატუსი: ცარიელ კოლექციაზე provider-ი კოლექციის origin-ის `empty` ტექსტს აჩვენებს (`loadSource` არ იძახება), კოლექციის შეცვლისას კი სტატუსი ახალი origin-ის „იტვირთება…“ ტექსტზე ბრუნდება. COLLECTION-EMPTY-STATUS და GATE92-S1 round 94-ში გასწორდა; დაიხურება C-ის შემოწმების შემდეგ.
- დეტალები: `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md`.
