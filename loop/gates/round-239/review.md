COMMIT: OK (no blockers. Two medium behaviour issues in the adaptive key flow should go to round 240. Auth, purchase and download code is untouched.)

## Code Review: SABA-B-11b ეტაპი 1 — adaptive grid (round 239)

ეს მხოლოდ diff-ის review-ა, მოდული სრულად არ შემოწმებულა. verify.log-ის მიხედვით 214 ფაილი და 3065 ტესტი გავიდა, build-იც წარმატებულია. e2e-ში grid-ზე მიბმული assertion-ები არ არის (`grid-division`/`gridSeconds`/`zoom`-ის ძებნამ არაფერი იპოვა). grid-ის division არსად ინახება, ამიტომ reload-ზე `gridMode`/`gridDensity`-ის დაკარგვა არსებული ქცევის მსგავსია.

### Critical Issues
- არ არის.

### Suggestions (რიგით, ყველაზე მნიშვნელოვანი პირველი)

1. **Medium — density "იპარება" clamp-ის მიღმა.** ფაილი: `StudioWorkspace.tsx:1548-1571`.
   - loop ინახული density-დან იწყებს, ეკრანზე ჩანს თუ არა ის, არ ამოწმებს. ამიტომ 1–2 ნაბიჯი, რომელიც ეკრანზე არაფერს ცვლის, ჩუმად იხარჯება.
   - GAU12-ის სცენარი: 40 px/s-ზე `1 1` (density −2) → zoom 320-მდე → `2 2`. ეკრანზე 0.1 → 0.25 → 0.5 ჩანს, მაგრამ density +2 ხდება.
   - შედეგი: 40 px/s-ზე დაბრუნებისას grid **5 s** იქნება. მომხმარებელი 0.25 s-ს მოელის, ანუ "1-ით დავავიწროვე" "უკიდურესად გავაფართოვე"-დ იქცევა. ტესტი ამას ვერ იჭერს, რადგან GAU12 zoom-ს უკან არ აბრუნებს.
   - Fix: სანამ ნაბიჯს გადადგამ, density გაასწორე იმაზე, რაც ეკრანზე ჩანს: `effective = base − family.indexOf(current)`, შემდეგ `density = clamp(effective + step)`. ამის შემდეგ `while`-loop საჭირო აღარ არის.
   - ამისთვის `adaptiveBaseIndex` + `gridDivisionFamilyIds` უნდა გამოვიდეს `grid-divisions.ts`-დან, ან დაემატოს helper `adaptiveGridDensityOf(id, bpm, px)`.
   - ტესტი: GAU12-ს დაამატე zoom 40-მდე დაბრუნება და შეამოწმე division.

2. **Medium — არსებულ flow-ში ქცევა შეიცვალა: `gridHandChosenRef`.** ფაილები: `StudioWorkspace.tsx:1547-1577`, `1505`.
   - HEAD-ზე `1`/`2` ყოველთვის `changeGridDivision`-ს გადიოდა (`:1410`) და `gridHandChosenRef = true`-ს აყენებდა. ამის გამო tempo seed მომხმარებლის grid-ს არ ცვლიდა.
   - ახლა default adaptive-ია და adaptive branch ამ flag-ს არ აყენებს. ამიტომ `1`, `1` → BPM-იანი stem-ის დამატება → seed family-ს `1/4`-ზე გადართავს.
   - doc (`186-…md`) ამ შემთხვევას არ ახსენებს. GAU6 მხოლოდ `5`-ის შემთხვევას ფარავს, ისიც, სავარაუდოდ, განზრახ.
   - ამ შემთხვევაზე ტესტი არ არსებობს.
   - Fix: adaptive branch-ში (და `toggleGridTriplet`-ის adaptive branch-ში) დაამატე `gridHandChosenRef.current = true;`. თუ ეს განზრახ ქცევაა, ჩაწერე doc-ის "მიდგომა" სექციაში და დაამატე ტესტი.

3. **Low — loop ზედმეტ სამუშაოს აკეთებს.** ფაილი: `StudioWorkspace.tsx:1550-1561`.
   - `next === null`-ის შემოწმება loop-ის **შემდეგ** ხდება, ამიტომ family-ის ბოლოზე loop ტყუილად ტრიალებს.
   - Fix: `next === null` ავიტანოთ loop-ის წინ. თუ #1-ს გამოასწორებ, ეს თავისით მოგვარდება.

4. **Low — a11y: რეჟიმი მხოლოდ `title`-ში ჩანს.** ფაილი: `StudioWorkspace.tsx:2637`.
   - adaptive/fixed რეჟიმი ჩანს მხოლოდ `title`-ში (hover-ზე) და დროებით status-ში. `data-grid-mode` მხოლოდ ტესტებისთვისაა.
   - screen reader focus-ზე `title`-ს შეიძლება წაიკითხავდეს, შეიძლება არა.
   - Fix (ეტაპი 2-ისთვის): რეჟიმი პროგრამულად ხელმისაწვდომი იყოს, მაგალითად `aria-describedby`-ით ან menu-ის adaptive/fixed პუნქტებით, რომლებიც ისედაც გეგმაშია.

5. **Low — `title` template literal პირდაპირ JSX-შია.** ფაილი: `StudioWorkspace.tsx:2637`.
   - მეორე ფრჩხილებიანი გამოსახულება JSX-ში კითხვადობას ამცირებს.
   - Fix: `grid-divisions.ts`-ში შექმენი helper `gridDivisionTitle(id, linesVisible, mode)`.

6. **Trivial — decision ID-ები ერთმანეთს არ ემთხვევა.** describe label-ებში ერთგან `D-29z352` წერია (`grid-adaptive-ui.test.tsx:235`), მეორეგან `D-29z357` (`grid-adaptive.test.ts:22`). გადაამოწმე, რომელია სწორი.

### Good Practices Found
- **Event ordering:** Digit5 ორჯერ არ ირთვება. select-ის handler `preventDefault`-ს იძახებს, global handler კი `!event.defaultPrevented`-ს ამოწმებს (`:1994`). type-ahead-ის თავიდან აცილება GAU7-ით მოწმდება, typing target-ები და Export — GAU8-ით.
- **Gesture-ის დროს zoom:** wheel და keyboard zoom pointer gesture-ის დროს დაბლოკილია (`:1758`, `:1790`). ამიტომ snap-ის ნაბიჯი drag-ის შუაში ვერ შეიცვლება, gesture lifecycle-ის invariant დაცულია.
- **Refs:** refs სინქრონულად ახლდება (`resolveAdaptiveGrid`), ამიტომ შემდეგი pointer gesture ახალ grid-ს re-render-მდეც ხედავს.
- **ჩუმი zoom:** zoom status-ს არ წერს და announcement-ს არ იწვევს. GAU2 ამოწმებს, რომ `statusSequence` არ იცვლება.
- **Leak-ები:** ახალი effect, timer ან listener არ დამატებულა.
- **Render cost:** chooser ≤7 ელემენტს ათვალიერებს, ანუ ფასი უმნიშვნელოა. `gridSeconds` მხოლოდ division-ის ზღვრის გადაკვეთისას იცვლება.
- **TS strict:** `any`, type assertion და suppression არ არის. Semicolon-ები ადგილზეა. Tailwind და token-ები არ შეცვლილა.
- **Undo:** grid view state-ია, history-ში არ იწერება. GAU9 Undo-ს მოწმებს.
- **Doc:** ქართულადაა, TEMPLATE-ის სექციები ადგილზეა. Ableton-ის deviation-ები ჩამოწერილია და Saba-ს კითხვებად გადაცემული.

### Architecture note
- **სიგნალი 4 + 3:** `StudioWorkspace.tsx:549-573`, `1390-1603`.
  - grid-ის ბლოკს `gridMode`/`gridDensity` state და ორი mirror ref დაემატა. ახლა ბლოკში ~8 state/ref წყვილია.
  - ეს რეგიონი შეიცვალა SRW-14 1, 4b, 5a, 5b და ახლა 11b ეტაპებზე. ყოველ ჯერზე სხვა ტესტების title/aria მნიშვნელობების გასწორება სჭირდებოდა.
  - **keep ახლა:** gesture handler-ები `gridSecondsRef`-ს სინქრონულად კითხულობენ (`:1944`, `:2294`). feature-ის შუაში ამის გამოყოფა refs-ის invariant-ს არღვევს, ეტაპი 2 კი ისევ ამ რეგიონს შეეხება.
  - **proposal planner-ისთვის** (ეტაპი 2-ის შემდეგ): ერთი შეზღუდული დავალება — `useStudioGrid()` hook.
    - რას ფლობს: seconds/musical/mode/density state + refs, `resolveAdaptiveGrid`, `changeGridDivision`, `stepGridDivision`, `toggleGridTriplet`, `toggleGridMode`.
    - მიღების კრიტერიუმები: `useArrangement()`-ის ფორმა უცვლელია; ყველა `grid-*.test.tsx` ცვლილების გარეშე გადის.
    - ღირებულება: medium; რისკი: refs-ის timing.

### Alternative Approach
- **Current:** `gridDivisionId` ყოველ render-ზე ითვლება mode/density/zoom-იდან. ყოველი handler ref-ებს eager-ად აახლებს `resolveAdaptiveGrid`-ით.
- **Alternative:** grid-ის მთელი state ერთ `useReducer`-ში. resolved id reducer-ში ითვლება, zoom კი action-ად (`zoomChanged`) მიეწოდება.
- **Verdict:** ახლა მიმდინარე მიდგომა სჯობს.
  - eager ref write-ები შემდეგ gesture-ს re-render-მდე სწორ grid-ს აძლევს.
  - reducer-ს zoom-ის შესატყობად effect ან dispatch დასჭირდებოდა, რაც ზედმეტი render-ია და drag-ის pipeline-ში ახალი timing-ის რისკი.
  - reducer აზრიანი გახდება მხოლოდ ზემოთ შეთავაზებული hook-ის გამოყოფისას.

### Score: 8/10