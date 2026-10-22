ფაილები წავიკითხე და verify log შევამოწმე. ახლა ვწერ ვერდიქტს.

COMMIT: OK

## Code Review: round-92 — შეძენილი კოლექციის adapter, ტექსტი და ექსპორტის ფაილის სახელი collection-ის origin-ის მიხედვით (SRW-21 ეტაპი 1)

წინასწარ წავიკითხე `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` და `architecture-checkpoint.md`. ეს მხოლოდ diff-ის review-ა; მოდული სრულად არ შემიმოწმებია. `verify.log`-ში ყველა 137 ტესტ-ფაილი გავიდა და ორივე build წარმატებულია.

### Critical Issues
- არ არის.
- **Auth, შეძენის და download-ის კოდს ცვლილება არ შეხებია.** `collection.ts`-ს მხოლოდ `ArrangementContext.tsx:24` და `StudioWorkspace.tsx:19` აიმპორტებენ, ორივე მხოლოდ `workspaceCollectionCopy`-სთვის. `createPurchasedWorkspaceCollection`-ს კოდში არც ერთი route არ იძახებს, ამიტომ `studio.$productId.tsx`, studio-token და `RequireAuth` უცვლელია. ცვლილება ექსპორტის მხრიდან მხოლოდ ლოკალურად შექმნილი blob ფაილის სახელს ეხება.

### Suggestions (პრიორიტეტით)
1. **Low — ძველი სტატუსი, თუ collection შეიცვლება, როცა workspace უკვე mount-ებულია.** პრობლემა `ArrangementContext.tsx:3000-3046`-შია. Load effect წყაროების მდგომარეობას `loading`-ზე აბრუნებს, მაგრამ `setStatus(copy.loading)`-ს არ იძახებს. `useState`-ის initializer კი (`:533`) მხოლოდ პირველ render-ზე მუშაობს. ეს ქცევა ადრეც იყო, მაგრამ ახლა origin ცვალებადია, და რეალური რისკი ჩნდება. მაგალითად: route-მა token-ის განახლებისას `useMemo`-თი ახალი კოლექცია შექმნა. ამ დროს ეკრანზე ძველი „…მზადაა“ რჩება, სანამ ახალი settle არ მოვა. **გამოსწორება:** effect-ის დასაწყისში `setStatus(workspaceCollectionCopy(collection.origin).loading)`. ეს mount-ის ეტაპზე უნდა გაკეთდეს, COLLECTION-EMPTY-STATUS-თან ერთად (ორივე ერთ effect-ს ეხება).
2. **Low — შეძენილი MP3-ის სახელები ტესტით არ მოწმდება.** კოდი არის `ArrangementContext.tsx:2907-2920`, დოკი ამას აღიარებს (080, „ტესტირება“). `fileStem`-ის ლოგიკა WAV-ის იდენტურია, ამიტომ blocker არ არის. მაინც ღირს PW5-ში ერთი `exportMp3`-ის assertion-ის დამატება, რომ არჩეულ სტრიქონზე ცალკე რეგრესია არ დაიმალოს.
3. **Nit — copy ორჯერ ითვლება ერთ render-ში.** `StudioWorkspace.tsx:2137` და `:2144` თითოეული ცალკე იძახებს `workspaceCollectionCopy(collection.origin)`-ს. ფუნქცია მუდმივ ობიექტს აბრუნებს, ამიტომ render-ის ფასი თითქმის ნულია. წაკითხვადობისთვის სჯობს ერთხელ `const copy = …` header-ის ზემოთ.
4. **Nit — URL და token console-ში ჩანს.** Adapter შეცდომის ტექსტიდან URL-ს და token-ს სწორად აშორებს (PC5–PC10 და PW3 DOM-ზე). მაგრამ ბრაუზერი ჩავარდნილ `fetch`-ს მაინც წერს console-ში და Network tab-ში სრული `?token=`-იანი URL-ით. ეს მოცემულ კოდში ვერ გამოსწორდება და token-ის მიწოდების გზის (query-ში) შედეგია. ღირს მისი ჩაწერა mount-ის დოკის „ღია წინაპირობებში“, რომ token-ის სიცოცხლე მოკლე დარჩეს.

### შემოწმდა, პრობლემა არ არის
- **ბრაუზერში მოვლენების რიგი და leak-ები:** ახალი listener, timer ან effect არ დამატებულა. Abort-ის გზა არსებულ `controller`-ს იყენებს. PW4 ამოწმებს, რომ unmount-ის შემდეგ ყველა signal aborted-ია და გვიანი პასუხები `console.error`-ს არ იწვევს.
- **Hydration:** initializer სუფთა და დეტერმინისტულია, ამიტომ SSR და კლიენტი ერთსა და იმავე ტექსტს იღებენ. ნაგულისხმევი `fetchAudio` `fetch`-ს გამოძახების დროს იძახებს, ამიტომ SSR-ზე უსაფრთხოა.
- **Deps:** `exportWav` და `exportMp3` callback-ებს `collection.origin` სწორად აქვთ deps-ში. Load effect-ის deps-ში `collection` უკვე იყო.
- **Accessibility:** `h1`-ის textContent-ის ფორმა უცვლელია. დემოს ტექსტი ბაიტამდე იგივეა (PW6, PC9).
- **TS და სტილი:** strict რეჟიმში სუფთაა: `any` და type assertion არ არის, `WorkspaceOrigin` union-ია, semicolon-ები ყველგან დგას. Tailwind-ის კლასები უცვლელია.
- **სორტირება:** `Array.prototype.sort` ES2019-დან stable-ია. URL-ები factory-ის დროს კერძო `Map`-ში კოპირდება, ამიტომ შესავალი მასივის მოგვიანებითი ცვლილება კოლექციაზე არ მოქმედებს.
- **ERROR_TAXONOMY:** backend-ის error code-ებს ეს ცვლილება არ ეხება. Adapter-ის ტექსტები მხოლოდ UI-ში ჩანს.

### Good Practices Found
- `credentials: 'omit'`, header-ის გარეშე. ეს ზუსტად PC3-ით მოწმდება და Bearer token არ გაჟონავს stem-ის host-ზე.
- აბორტის შემთხვევაში თავდაპირველი შეცდომა უცვლელად ბრუნდება, provider კი aborted signal-ზე მას არ აჩვენებს. ტექსტში საიდუმლო არ ხვდება.
- დემოს საქციელი ცალკე ჩაკეტილია (PW6), დოკში კი ღიად წერია, რომ შეძენილი გზა მხოლოდ unit ტესტით მოწმდება.

### Architecture note
- **სიგნალი 2 (coupling):** `ArrangementContext.tsx:24`. Provider ახლა presentation-ის ტექსტს `lib/arrangement/collection.ts`-იდან იღებს, ხოლო ამავე მოდულში purchased fetch-ის adapter-იც დევს. **Keep:** დამოკიდებულება ცალმხრივია (lib → context, უკან არა), ფუნქცია სუფთაა და timing, refs, gesture-ები და Undo/Redo-ს ატომურობა უცვლელია. ღირებულება low.
- **Proposal planner-ისთვის (არა მიმდინარე scope):** V-0-ის strings მოდულზე გადასვლისას `workspaceCollectionCopy` adapter-ისგან ცალკე ფაილში გავიდეს (`collection-copy.ts`). მიღების კრიტერიუმები: PC9 და PW1–PW6 მწვანეა, საჯარო `useArrangement()`-ის ფორმა უცვლელია.

### Alternative Approach (ეს ცვლილება შეძენილ Studio-ს გზას ეხება)
- **Current:** ტექსტი `origin`-დან ცენტრალური lookup-ით მოდის (`workspaceCollectionCopy`). დემოსა და შეძენილს თითო ფიქსირებული ნაკრები აქვს.
- **Alternative:** `WorkspaceCollection`-ს ჰქონდეს ველი `copy: WorkspaceCollectionCopy`, რომელიც factory-ში შეივსება. ასე პროდუქტზე დამოკიდებული ტექსტი შესაძლებელი გახდება (მაგ. `fileStem`-ში პროდუქტის slug).
- **Verdict:** ამ ეტაპისთვის მიმდინარე მიდგომა უკეთესია. ტიპის ფორმა უცვლელი რჩება, ტექსტი ერთ ადგილას გროვდება (V-0-თან თავსებადია), და შეძენილ ფაილის სახელში პროდუქტის მონაცემი ვერ მოხვდება. ველზე გადასვლა მხოლოდ მაშინ ღირს, თუ პროდუქტზე დამოკიდებული ფაილის სახელი ცალკე მოთხოვნად დაისმება.

### Score: 9/10