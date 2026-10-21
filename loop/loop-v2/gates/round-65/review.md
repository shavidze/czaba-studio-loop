COMMIT: OK

## Code Review: SRW-15 ეტაპი 1 — ტემპის რიგი და ტაქტების სახაზავი (round 65, HEAD f9d768c + 6 path)

ეს მხოლოდ diff-ის review-ა და მოდულის სრულ შემოწმებას არ ნიშნავს. ბრაუზერი არ გამიშვია, ამიტომ ბრაუზერზე დამოკიდებული პუნქტები კოდის წაკითხვით და DOM/ref-ის შემოწმებითაა დადგენილი.

### Critical Issues
- არ არის.

### შემოწმებული რისკები (ტესტები ამას ვერ იჭერს)
- **Chrome-ის სიმაღლე და lane-ების fit:** `ref={timelineChromeRef}` დგას `StudioWorkspace.tsx:1592`-ზე და ახალ `<ArrangementTempoRow>`-ს (1678) შიგნით მოიცავს. სიმაღლე იზომება გამოძახების დროს (`offsetHeight`, 495), ჰარდკოდირებული სიმაღლე ან offset არ არის. ახალი `h-5` რიგი fit-ის გამოთვლაში ავტომატურად შედის.
- **Event-ების თანმიმდევრობა:** Enter იძახებს `blur()`-ს, React-ის `onBlur` სინქრონულად ეშვება და შენახვა ერთხელ ხდება. Escape ჯერ ჩაწერს `skipCommitRef`-ს, მერე აკეთებს `blur()`-ს და შენახვა არ ხდება. ref ნულდება `onFocus`-ზე, ამიტომ ვერ გაიჭედება. Global keydown გამოდის `isTypingTarget`-ზე (`StudioWorkspace.tsx:1184`), ამიტომ G, 1, 2 და Space ველში ხელს არ უშლის.
- **Focus guard (`StudioWorkspace.tsx:1048`):** `input`-სა და `textarea`-ს შვილი ელემენტები არ აქვს, loop brace კი წინა პირობით უკვე გამორიცხულია. ამიტომ ცვლილება ქცევას ცვლის მხოლოდ `<select>`-ზე და contentEditable-ზე. ბადის `<select>`-ზე მეორედ დაწკაპუნებისას ფოკუსი ახლა რჩება. ეს გაუმჯობესებაა და რეგრესია არ არის. ლაინზე დაწკაპუნება focus-ს ისევ ათავისუფლებს (U12).
- **Listener/timer leaks:** diff არ ამატებს `useEffect`-ს, timer-ს ან `addEventListener`-ს. ლოკალური state არის მხოლოდ `draft` და ერთი ref.
- **Auth / purchase / download:** არცერთს არ ეხება. ახალი network call არ არის.
- **TS strict, კომენტარები, semicolon-ები:** `any`, `@ts-ignore` და type assertion არ არის, ტესტებშიც კი (`instanceof` guard-ებია). კომენტარები არ არის.

### Suggestions (რიგით)
1. **Medium — render cost. `app/lib/arrangement/tempo.ts:61-84`.** Beat-ებს სიმჭიდროვის ქვედა ზღვარი არ აქვს. როცა `barStep === 1`, ტაქტებს შორის ≥40 px-ია, მაგრამ beat-ებს შორის შეიძლება მხოლოდ ~10 px იყოს.
   - უარეს შემთხვევაში (999 BPM, `TIMELINE_ZOOM_MAX = 320`, 10 წთ ტაიმლაინი) ეს არის ~19k absolute `div`. წამების სახაზავი იმავე პირობებში ~1.2k-ს ხატავს.
   - ზოლი `memo`-ა და მხოლოდ zoom-ზე ან ტემპის ცვლილებაზე იხატება, playhead-ზე არა. ამიტომ Medium-ია და commit-ს არ ბლოკავს, მაგრამ wheel-zoom შეიძლება შეფერხდეს.
   - **Fix:** beat-ები დახატე მხოლოდ მაშინ, როცა `(60 / bpm) * pxPerSecond >= TEMPO_BEAT_MIN_PX`, მაგალითად 16. სხვა შემთხვევაში დახატე მხოლოდ ტაქტები. ეს შეზღუდვა T-ტესტით დაფიქსირდეს.
2. **Low — a11y target size. `ArrangementTempoRow.tsx:158`.** ველი არის `h-4 w-14` (16 px), რაც WCAG 2.5.8-ის 24 px-ზე ნაკლებია. ახლომდებარე `<select>` არის `h-6`. focus ring არის `ring-1`, `<select>`-ს კი `ring-2` აქვს.
   - **Fix:** `focus-visible:ring-2` paritet-ისთვის. სიმაღლის გაზრდას რიგის `h-5`-ის შეცვლა სჭირდება, ამიტომ ეს დიზაინის გადაწყვეტილებაა და planner-მა უნდა გადაწყვიტოს.
3. **Low — არავალიდური მდგომარეობა a11y-ში. `ArrangementTempoRow.tsx:97-100`.** არავალიდური ტექსტის შესახებ მხოლოდ status ზოლი იუწყება. ველზე `aria-invalid` არ ჩნდება და ველი მაშინვე უბრუნდება შენახულ მნიშვნელობას.
   - ეს მისაღებია, თუ `arrangement-status` არის `aria-live`.
   - **Fix (თუ ასე არ არის):** status-ს დაემატოს `aria-live="polite"`. ეს ცალკე დავალებაა.
4. **Low — commit ფანჯრის blur-ზე. `ArrangementTempoRow.tsx:115-125`.** Alt-Tab ნახევრად აკრეფილი `9`-ით ახდენს commit-ს და ჩნდება არავალიდურის status. DAW-ებში ეს ჩვეულებრივი ქცევაა, ამიტომ fix აუცილებელი არ არის. სურვილისამებრ: `if (!document.hasFocus()) return;` blur-ის დასაწყისში.
5. **Low — IME. `ArrangementTempoRow.tsx:128`.** Enter `event.nativeEvent.isComposing`-ს არ ამოწმებს. ციფრულ ველში პრაქტიკული რისკი თითქმის ნულია. **Fix:** `if (event.nativeEvent.isComposing) return;`.
6. **Low — docs.**
   - `058-studio-lab-tempo-bars-ruler.md:4`: სტატუსში ჯერ კიდევ წერია „C-ის შემოწმებას ელოდება“, თუმცა `c-round-65.json` PASS-ია. commit-მდე განაახლე.
   - `tempo-ui.test.tsx`: U12 განსაზღვრულია U11-მდე. ეს მხოლოდ კოსმეტიკაა.

### Good Practices Found
- `tempo.ts` სუფთა pure მოდულია. დრო ინდექსიდან ითვლება და არ გროვდება, ამიტომ float drift არ ხდება. `Number.isFinite` guard-ი ხურავს Infinity-ის შემთხვევაში მარყუჟის უსასრულოდ გაგრძელებას. `RULER_*` მუდმივები `view.ts`-დან არის აღებული და დუბლირებული არ არის.
- `draft` ლოკალურია, ამიტომ აკრეფა მთელ `StudioWorkspace`-ს თავიდან არ ხატავს. `changeTempo`/`rejectTempo` სტაბილური `useCallback`-ებია (ref-ის საშუალებით).
- Commit-ის ერთადერთი გზა blur-ია, ამიტომ ორმაგი შენახვა გამორიცხულია.
- ტემპი history-ში არ შედის (U3 ამოწმებს მოდელს, Undo-ს, Snap-ს და წამების ტიკებს). D-29z30-ის ინვარიანტი დაცულია.
- ყველა ფერი token-ია (`border-outline`, `bg-surface`, `bg-background`, `text-muted`, `ring-brand`). `role="presentation"` ემთხვევა `ArrangementRuler.tsx:411`-ს.

### Architecture note
- **სიგნალი 4 (ახალი state არსებულ owner-ში) — `StudioWorkspace.tsx:333`.** `tempoBpm` ემატება `snapEnabled`/`gridSeconds`-ს. ეს უკვე მესამე „ბადის პარამეტრია“ `StudioWorkspace`-ში.
  - **keep ახლა**, რადგან ჯერ ერთი lifecycle-ია (UI-only, history-ს გარეშე) და მხოლოდ ერთი მომხმარებელი ჰყავს.
  - **proposal planner-ისთვის:** SRW-15 ეტაპ 2-მდე (მეტრონომი = audio engine-ის მომხმარებელი, მფლობელობა გადაინაცვლებს) ჩატარდეს უკვე დაგეგმილი ARCH-CHECKPOINT-SRW14-PREFS (a). კანდიდატი ერთი შეზღუდული დავალებაა: `snap`, `gridSeconds` და `tempoBpm` გადავიდეს ერთ preferences hook-ში ან slice-ში, ისე რომ `useArrangement()`-ის ფორმა უცვლელი დარჩეს. მიღების კრიტერიუმი: U1–U12 და grid/snap-ის არსებული ტესტები უცვლელად გადის.
- **სიგნალი 3 (განმეორებითი ცვლილება) — `StudioWorkspace.tsx:1038-1054`.** `releaseEditFocusOnTimelinePointerDown`-ის პირობა რამდენიმე რაუნდში იზრდება და უკვე 6 clause-ია.
  - **keep**, რადგან ცვლილება ერთხაზიანია და ტესტით დაფარული.
  - **proposal:** checkpoint-ზე განიხილონ, ხომ არ ღირს ეს პირობა სუფთა predicate-ად გამოიტანონ unit-ტესტით. ეს მხოლოდ წინადადებაა, მიმდინარე რაუნდის დავალება არ არის.

### Alternative Approach
- **Current:** commit ხდება მხოლოდ blur-ზე. Enter იწვევს blur-ს, Escape ref-ით გამოტოვებს შენახვას. state ცხოვრობს `StudioWorkspace`-ის `useState`-ში.
- **Alternative:** შენახვა ცალსახად Enter-ზე, blur-ზე კი გაუქმება (revert).
- **Verdict:** მიმდინარე მიდგომა უკეთესია. „Commit on blur“ ემთხვევა clip gain-ის ველის (`ArrangementDetailPanel`) და DAW-ების ქცევას, აკრეფილი მნიშვნელობა არ იკარგება და ორმაგი commit სტრუქტურულადაა გამორიცხული. ფასი არის Low #4 (ფანჯრის blur).

### Score: 8.5/10