COMMIT: OK

## Code Review: round-197. Studio-ს focus ring (SABA-B-4 R83–R90), slider thumb-ის გაერთიანება, `focus-source`

ეს review მხოლოდ diff-ს ეხება (`diff.patch` და 6 ახალი ფაილი). მოდული მთლიანად არ შემიმოწმებია. Auth, purchase და download კოდს diff არ ეხება: ყველა path არის `app/components/arrangement/*`, `app/lib/focus-source.ts`, Studio-ს ტესტები, `app.css`/`utilities.css` და implementation doc.

### Critical Issues
- არ არის.

### Findings (რანჟირებული)

1. **Low/Medium: გარე click-ით მენიუს დახურვისას focus source არ ახლდება.** მიზეზი: `ArrangementMarkerMenu.tsx:68-69` და `ArrangementGridMenu.tsx:116-117` `window`-ის capture ფაზაში იძახებენ `stopPropagation()`-ს. `window` capture `document`-ის capture-ზე ადრე სრულდება, ამიტომ `focus-source.ts:34`-ის `pointerdown` handler ამ click-ს ვერასდროს ხედავს. სცენარი: მენიუ გაიხსნა ან ისრებით გადაიარეს, რაც `keyboard`-ს წერს. შემდეგ მომხმარებელი მაუსით მენიუს გარეთ აწკაპუნებს და მენიუ იხურება. მნიშვნელობა რჩება `keyboard`, ამიტომ ring ჩანს მაუსის მოქმედების შემდეგ. ტესტი FS-e ამას ვერ იჭერს, რადგან ის React-ის bubble-stop-ს ამოწმებს და არა `window` capture-ს. **Fix:** `installFocusSourceTracking`-მა listener-ები `doc.defaultView`-ზე (`window`) დააყენოს, capture ფაზაში. `StudioWorkspace`-ის effect მენიუს effect-ზე ადრე რეგისტრირდება, ამიტომ პირველი გაეშვება. FS-e-ს დაემატოს შემთხვევა, სადაც `window`-ის capture listener `stopPropagation`-ს იძახებს.

2. **Low: text field-ზე მაუსით შესვლისას ინდიკატორი არ ჩანს.** `ArrangementLibrary.tsx:361` search ველიდან მოიხსნა `focus:border-brand`. ამავდროულად `app.css:384`-ის წესი `pointer` მდგომარეობაში `:focus-visible` outline-ს თიშავს, ხოლო ბრაუზერები text input-ზე `:focus-visible`-ს მაუსის click-ზეც ააქტიურებენ. შედეგად search, tempo და clip-gain ველებზე click-ის შემდეგ პირველ აკრეფამდე მხოლოდ caret ჩანს. ეს R85/R87-ის ცნობიერი გადაწყვეტილებაა და doc-შიც წერია, ამიტომ commit-ს არ ბლოკავს. **Fix (B/საბა წყვეტს):** `html[data-focus-source="pointer"] :focus-visible:not(input:not([type=range]), textarea)`.

3. **Low: `--focus-offset` ყველა შთამომავალზე გადადის.** `studio-focus.ts:1-2`-ში custom property არის inherited. დღეს 22+1 ადგილიდან თითოეული leaf control-ია, ამიტომ პრობლემა არ ჩანს. მაგრამ თუ inset კლასი container-ს მოხვდება, ყველა შიდა focusable ელემენტი ჩუმად მიიღებს −2px offset-ს. **Fix:** `app.css`-ში `@property --focus-offset { syntax: '<length>'; inherits: false; initial-value: 2px; }`. ST6/TH4 marker-ების რაოდენობა ჯერ უნდა გადამოწმდეს.

4. **Low: გლობალური წესი store-ის ყველა გვერდზე მოქმედებს.** `app.css:397-399` ring-ს ყველგან 1.5px/80%-მდე ათხელებს, მათ შორის login-სა და checkout-ზეც, ოღონდ მხოლოდ ვიზუალურად. იქ, სადაც control-ს საკუთარი `ring-2` აქვს, მე-2 ეტაპამდე ორი ზოლი გამოჩნდება. Doc ამას „ცნობილ ეფექტად“ აღწერს (`159-…md:19`), ასე რომ რეგრესია არ არის. ერთადერთი მოთხოვნა: მე-2 ეტაპი ამ commit-ის შემდეგ არ გადაიდოს, რადგან სუსტ ring-ზე WCAG 2.4.13-ის რისკი რჩება.

5. **Low: მხოლოდ `it.todo`-სგან შემდგარი ფაილი.** `focus-reveal-ui.test.tsx:3-9` სამ todo-ს შეიცავს და ღია C-R196-02-ის ერთადერთი კვალია. მისაღებია, თუ planner-ის backlog-ში ცალკე ჩანაწერი არსებობს. სხვა შემთხვევაში ფაილი commit-იდან ამოიღე და მასალა `a-round-197/*.r89-full`-ში დატოვე.

6. **Info: მეზობელი marker-ების გადაფარვა.** `ArrangementMarkerRow.tsx:474`-ის `pr-1` გამჭვირვალე box-ს 4px-ით ზრდის და ის შემდეგ flag-ს ფარავს. Hit-test-ში DOM რიგი იგებს და ეს doc-შიც წერია (`159-…md:105`). `isolate` + `-z-1` stem სწორად არის გაკეთებული.

### Suggestions
- თითოეულ თემაზე კონკრეტული fix ზემოთ, Findings-შია.
- `studio-fader.ts` სწორად იყო გადამოწმებული: thumb-ის center (`-mt-1.25` = −5px, (4−14)/2) და fill-ის ნახევარი thumb-ი (1.75×spacing = 7px) ზუსტია. ცვლილება არ სჭირდება.

### Good Practices Found
- Root cause სწორად მოიძებნა: unlayered `:focus-visible` layered `focus-visible:outline-none`-ს ყოველთვის სჯაბნიდა. დუბლიკატი წაიშალა და ფენებად დაყოფილ ring recipe-ებს შორის კონფლიქტი აღარ არის.
- `installFocusSourceTracking` არის pure installer, რომელიც dispose-ს აბრუნებს. აქვს StrictMode ტესტი (FS-f), unmount-ზე იშლება ატრიბუტიც და listener-ებიც, ხოლო modifier key-ები გამორიცხულია. Listener ან timer არ რჩება.
- Hook ყოველთვის ერთსა და იმავე პოზიციაზე გამოიძახება (`StudioWorkspace.tsx:676`) და მხოლოდ ერთ route-ზეა მიმაგრებული (`studio-lab.tsx:30`). SSR უსაფრთხოა, რადგან კოდი მხოლოდ `useEffect`-შია.
- `STUDIO_FADER_FOCUS_*` სრულად წაიშალა და repo-ში მასზე არცერთი reference არ დარჩა. `!` modifier-ები გაქრა. Render cost-ს diff არ ზრდის: სტატიკური სტრიქონები module scope-შია.
- R89 stop rule-ით ბაიტ-ბაიტ დაბრუნდა და `StudioWorkspace`-ში scroll-padding აღარ არის.
- TS strict დაცულია: არ არის `any`, ignore ან assertion. Tailwind token-ები გამოყენებულია და hardcoded ფერი არ არის. `color-mix` `var(--color-brand)`-ს იყენებს.

### Architecture note
- **სიგნალი 4 (ახალი lifecycle არსებულ owner-ში):** `StudioWorkspace.tsx:676`-ზე `useFocusSourceAttribute()` დოკუმენტის დონის ქცევას workspace-ის lifecycle-ს უკავშირებს. **Keep:** ერთხაზიანი hook-ია, cleanup-ს თავად აკეთებს და Studio-ს გარეთ მისი მოქმედება მიზანშეწონილად ითიშება. ღირებულება low.
- **Proposal planner-ისთვის (მე-2 ეტაპში):** listener-ი `root.tsx`-ში ან app shell-ში გადავიდეს, `window` capture-ით (ამით finding 1-იც ქრება), ხოლო გლობალური წესი `@layer base`-ში. ownership: `focus-source.ts`, `root.tsx`, `app.css`. მიღების კრიტერიუმები: FS-a…g მწვანეა, `window` stopPropagation-ის ახალი შემთხვევა მწვანეა, ST6/TH4 marker-ების რაოდენობა უცვლელია. ეს წინადადებაა და არა მიმდინარე რაუნდის დავალება.

### Alternative Approach
- **ახლა:** `data-focus-source` ატრიბუტი `<html>`-ზე, რომელსაც `document` capture listener-ები წერენ, და `outline: none` წესი `pointer` მდგომარეობისთვის.
- **ალტერნატივა:** ჩავეყრდნოთ მხოლოდ ბრაუზერის `:focus-visible` heuristic-ს, JS-ის გარეშე. ამ შემთხვევაში fader-ზე mouse drag-ის შემდეგ ring მაინც ჩანს, რადგან range input-ზე Chromium focus-visible-ს არ თიშავს. სწორედ ეს იყო საბას საჩივარი.
- **ვერდიქტი:** მიმდინარე მიდგომა უკეთესია, რადგან მოთხოვნილ UX-ს აძლევს და JS მინიმალურია. ერთადერთი შესწორება ისაა, რომ listener-ები `window` capture-ზე გადავიდეს (finding 1).

### Score: 8/10