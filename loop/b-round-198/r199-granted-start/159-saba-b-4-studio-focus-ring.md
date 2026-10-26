# SABA-B-4, ეტაპი 1 — Studio-ს ერთი თხელი focus ring და ერთი slider thumb

**თარიღი:** 2026-10-26
**სტატუსი:** In Progress (ელოდება C-ის შემოწმებას, რაუნდი 196)
**შეცვლილი პროექტი:** Store (Studio, `/studio-lab`)

## კონტექსტი

საბამ 2026-10-26-ს აღნიშნა, რომ Pan slider-ზე keyboard focus-ის დროს ჩანს სქელი brass „აბი“ ფართო ღრეჩოთი, ხოლო slider-ების thumb-ები ერთმანეთს არ ემთხვევა: Pan-ის thumb სუფთა თეთრი და დიდია, Volume-ის კი კრემისფერი. შემდეგ მოთხოვნა გააფართოვა: „ყველგან გაასწორე, მარტო აქ არ არის“. პოლიტიკით სამუშაო ორ რაუნდად იყოფა: ჯერ Studio (ეს დოკუმენტი), შემდეგ store-ის გვერდები.

ძირითადი მიზეზი: `app.css`-სა და `base/utilities.css`-ში არსებობდა ორი **unlayered** `:focus-visible { outline: 2px … }` წესი. Tailwind v4-ის utility-ები `@layer utilities`-შია, ამიტომ unlayered წესი ყოველთვის იმარჯვებდა `focus-visible:outline-none`-ზე. Studio-ს დაახლოებით 50 control-ზე ერთდროულად ჩანდა ორი ზოლი: გლობალური outline და საკუთარი `ring-2` box-shadow. Pan-ის „აბი“ კი reset ღილაკის `::before` ელემენტი იყო (`w-12 h-4 rounded-full`).

## მიდგომა

გადაწყვეტილებები R83–R87 (B-ის D-29z161; საბას შეუძლია ნებისმიერის ვეტო):

- **R83 — ერთი საერთო focus style = ერთი გლობალური წესი.** `app.css`-ში რჩება ერთი unlayered წესი: `outline: 1.5px solid color-mix(in srgb, var(--color-brand) 80%, transparent); outline-offset: var(--focus-offset, 2px);`. `utilities.css`-ის დუბლიკატი წაიშალა. Studio-ს control-ებს საკუთარი ring recipe აღარ აქვთ. Outline layout-ს არ ცვლის და ელემენტის `border-radius`-ს მიჰყვება.
  - უარყოფილი ალტერნატივები: (a) `@layer base`-ში გადატანა ახლავე — store-ის 27 `focus:outline-none` ველი ერთადერთ ინდიკატორს დაკარგავდა (ეს მე-2 ეტაპის საქმეა); (b) `!important`-იანი `@utility focus-ring` — მეორე მექანიზმი, რომელიც გლობალურ წესს ეჯიბრება; (c) `[data-studio-theme]`-ზე შეზღუდული selector — ST6/TH4 ტესტები `app.css`-ში marker-ების რაოდენობას 2-ზე კეტავს.
  - **ცნობილი ეფექტი (არა FAIL):** store-ის გვერდებზე ring ახლავე თხელდება. store-ის control-ები, რომლებსაც თავისი `ring-2` აქვთ, მე-2 ეტაპამდე ორ ზოლს აჩვენებს.
- **R84 — ერთი ვარიანტი, inset.** `app/components/arrangement/studio-focus.ts` → `STUDIO_FOCUS_RING_INSET_CLASS = '[--focus-offset:-2px]'`. ის აქვს ყველა ყოფილ `ring-inset` ადგილს (11). გარდა ამისა, ბრაუზერში გაზომვამ 11 ადგილზე აჩვენა, რომ default ring-ს overflow-იანი მშობელი ჭრის (8) ან შემდეგი რიგი ფარავს (group M/S, group name editor, marker flag); ესენიც inset-ზე გადავიდა. ჯამში კონსტანტა 22-ჯერ გამოიყენება. Playhead handle default-ზე რჩება: inset ring brass ფონზე brass იქნებოდა.
- **R85 — mouse press-ის შემდეგ ring არ ჩანს.** `app/lib/focus-source.ts`: `document`-ზე capture ფაზაში `pointerdown` წერს `html[data-focus-source="pointer"]`-ს, ხოლო ნებისმიერი არა-modifier `keydown` წერს `keyboard`-ს. CSS: `html[data-focus-source="pointer"] :focus-visible { outline: none; }`. Hook (`useFocusSourceAttribute`) მიმაგრებულია `StudioWorkspace`-ში. Unmount-ზე listener-ები და ატრიბუტი იშლება. შედეგი, რომლის ვეტოც შეიძლება: mouse-ით აღებულ fader-ზე arrow key-ის დაჭერა ring-ს აჩენს. ეს `:focus-visible`-ის ევრისტიკას ემთხვევა და text field-ებზეც იგივე წესი მოქმედებს.
- **R86 — ერთი thumb, ერთი track.** `studio-fader.ts`: `STUDIO_SLIDER_THUMB_CLASS` (14 px, `bg-foreground` #ECE6DA, hover/active ცვლილება არ აქვს), `STUDIO_SLIDER_TRACK_CLASS` (`h-1 bg-outline-hover`), `STUDIO_NEUTRAL_SLIDER_CLASS` (Pan, Zoom — brass fill-ის გარეშე), `STUDIO_LEVEL_FADER_CLASS` (+ brass fill, რომელიც thumb-ის ცენტრამდე აღწევს: `1.75 / 3.5 × spacing`). ექვსივე range input-ს ერთი box აქვს, `h-4`. წაიშალა `STUDIO_FADER_FOCUS_*` სამივე კონსტანტა და ყველა `!` focus modifier.
- **R87 — focus არ ცვლის fill-ს, border-ს ან shadow-ს.** Library separator-ს მოეხსნა `focus-visible:bg-brand`, search ველს `focus:border-brand`, clip-gain pending-ს `focus-visible:ring-warning` (`border-warning` რჩება), ხოლო marker flag-ს `ring-offset-*`. გამონაკლისია ExportDialog-ის `focusTrapRef` კონტეინერი (`focus:outline-none`), რომელიც უცვლელია.

## არქიტექტურა

```
keydown / pointerdown (capture, document)
        │
        ▼
html[data-focus-source = keyboard | pointer]
        │
        ▼
:focus-visible { outline 1.5px brass 80%, offset var(--focus-offset, 2px) }
html[data-focus-source="pointer"] :focus-visible { outline: none }
        │
        ├── default sites: offset +2px
        └── inset sites:  [--focus-offset:-2px]
```

## შეცვლილი ფაილები

- `app/styles/app.css`, `app/styles/base/utilities.css`
- `app/components/arrangement/studio-fader.ts`, ახალი `studio-focus.ts`
- `app/lib/focus-source.ts` (ახალი)
- Studio-ს 17 კომპონენტი: DetailPanel, ExportDialog, GridMenu, GroupHeader, Lane, Library, LibraryPreview, LoopBrace, MarkerMenu, MarkerRow, Master, Overview, Ruler, TempoRow, Transport, VideoDock, StudioWorkspace
- ტესტები: ახალი `app/lib/__tests__/focus-source.test.tsx` და `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`. ძველი focus token-ების assertion-ები განახლდა 11 granted ტესტში.

## პრობლემები და გადაწყვეტები

- **Problem:** default ring Snap/Grid/Env/Waveform Zoom-ზე, tempo ველზე და marker ღილაკებზე overflow-იანი მშობლის მიერ ზემოდან იჭრებოდა (T1.5 px), Library separator-ზე კი R2/T3/B3. → **Solution:** ეს ადგილები inset ვარიანტზე გადავიდა. გაზომვა: `a-round-196/r84-clip-1440.json`.
- **Problem:** Chromium 143 `outline-width: 1.5px`-ს ითვლის როგორც `1px` (computed), DPR 2-ზე კი ხატავს 2 device px-ს. stylesheet-ში მნიშვნელობა `1.5px` რჩება, ანუ ეს build-ის ბრალი არ არის. Chromium სიგანეს მთელ CSS px-მდე ამრგვალებს ქვემოთ (`2.5px` → `2px`, border `1.5px` → `1px`). → **Solution:** კოდი B-ის R83 მნიშვნელობას იცავს. საკითხი B-ს გადაეცა: ან მიიღოს 1 px-იანი ფაქტობრივი ring, ან R83 შეცვალოს 2px-ზე.
- **Problem:** ახალი import-ის შემდეგ Vite-ის პირველი ცივი ჩატვირთვა ცარიელ გვერდს და „Invalid hook call“-ს აჩვენებს (dependency re-optimization). → **Solution:** ეს გარემოს ერთჯერადი მოვლენაა (ENV-FIRST-LOAD); მეორე ჩატვირთვაზე console-ში შეცდომა 0-ია.

## ტესტირება

- ახალი სუიტები: SFR1–SFR5 + walker guard, FS-a…FS-g. Red proof: start copies-ზე SFR1–SFR5 წითელია, `focus-source` კი ვერ იტვირთება. მუტანტები m1–m6 ყველა დაიჭირა.
- სრული `app/lib/arrangement` + `app/components` (vitest), typecheck, Biome შეცვლილ ფაილებზე, `npm run lint` (214 warning + 1 info, round 195-ის ტოლი).
- Playwright Chromium, :5173, DPR 2, 1440×900 და 1280×720. Rest diff მხოლოდ range input-ების box-ებშია, მათ გარეთ 0 px. Thumb-ები 14 px-ია, #ECE6DA. Mouse press-ის შემდეგ outline არ ჩანს, ArrowUp/Tab-ის შემდეგ ჩანს.

## TODO / შემდეგი ნაბიჯები

- მე-2 ეტაპი (store): გლობალური წესის `@layer`-ში გადატანა, store-ის token-ების sweep, R85-ის store mount-ის გადაწყვეტა.
- `C-R191-01` (ivory thumb vs brass fill 1.82:1) რჩება `awaiting_user`.
- 1.5px vs Chromium-ის computed 1px — B/საბას გადაწყვეტილება.

## Round 197 — marker flag-ის ring, focus-ის გამოჩენა sticky chrome-ის ქვეშ, 1.5px-ის გადაწყვეტილება

**თარიღი:** 2026-10-26 · **სტატუსი:** R88 და R90 A-მ დაასრულა და C-ის შემოწმებას ელოდება; R89 stop rule-ით დაბრუნდა · **გადაწყვეტილება:** D-29z162 (R88–R90, საბას ვეტოს უფლებით)

### კონტექსტი

C-ის round 196-მა ორი Medium იპოვა. **C-R196-01:** marker flag-ის inset ring (−2px) pill-ის brass border-ზე ჯდებოდა (1.45:1), მარცხნივ კი brass stem-ს ეკვროდა. **C-R196-02:** 1280×720-ზე, როცა detail panel ღიაა და ჯგუფი არსებობს, Tab-ით მიღწეული Video row-ის კონტროლები sticky tempo/marker/loop strip-ის ქვეშ რჩებოდა და ring სულ არ ჩანდა. ეს პრობლემა round 196-მდეც არსებობდა.

### R88 — ring flag-ის საკუთარი box-ის კიდეზე (ვარიანტი a)

- გაზომვა ცვლილებამდე (1440): flag 61×20, pill 57×16. Clearance: ზემოთ 2, ქვემოთ 2, მარცხნივ 4 (stem x 0–1), მარჯვნივ 0. Loop strip იწყება ზუსტად flag-ის ქვედა კიდეზე (y 259).
- flag ღილაკს დაემატა `pr-1` (გამჭვირვალე, box 65×20). Ring მოთავსდა box-ის ყველაზე გარე პიქსელზე ახალი მუდმივით `STUDIO_FOCUS_RING_EDGE_CLASS = '[--focus-offset:-1px]'` (`studio-focus.ts`). გაზომილი offset: computed `-1px`. Ring 2 device px-ია (1 CSS px).
- **გაზომვის შედეგად დამატებული ნაწილი:** Chromium ჯერ ხატავს ელემენტის საკუთარ outline-ს, შემდეგ კი positioned შთამომავლებს. ამიტომ `absolute` stem ring-ის მარცხენა მხარეს ფარავდა: unselected flag-ზე ცვლილება 0 px იყო. flag ღილაკმა მიიღო `isolate`, stem-მა კი `-z-1`. Stem ახლა ring-ის ქვეშ იხატება, ღილაკის stacking context-ის შიგნით. ღილაკის ფონი გამჭვირვალეა, ამიტომ rest-ში ცვლილება 0 px-ია.
- შედეგი (1440 და 1280, selected/unselected): ზედა მხარე 4.73 (გარე) / 5.43 (შიდა), ქვედა 5.59/5.59, მარჯვენა 5.43/5.43, მარცხენა (unselected, stem-ზე) 6.63/7.61. Ring-სა და pill border-ს შორის background-ის ზოლია: ზემოთ და ქვემოთ 2 device px, გვერდებზე 6 device px. Flag box-ის გარეთ ცვლილება 0 px-ია. Loop strip ring-ს არ ფარავს.
- Selected flag-ზე brass ring 80%-ით brass stem-ზე იმავე ფერს იძლევა. ამიტომ მარცხენა სვეტი stem-ის brass-ად იკითხება (შეცვლილი 0 px), მეზობლებთან კონტრასტი > 3:1.
- **უარყოფილი:** offset −2px (pill-ის border-ს ერწყმის), 0 / +2px (ქვედა მხარეს loop strip ფარავს), ვარიანტი (b) (button = pill; +2px აქაც დაიფარება, inset კი border-ს შეერწყმის), `group-focus*` / `ring-*` (მეორე recipe, SFR2 კრძალავს).

### R89 — განხორციელდა, გაიზომა და stop rule-ით დაბრუნდა (C-R196-02 ღია რჩება)

- ცდა: `refreshTrackLaneLayout`-ში, panel-animation-ის early return-მდე, `scroller.style.scrollPaddingTop = `${metrics.timelineChromeHeight}px``. ახალი listener, focusin handler ან `scrollIntoView` არ დამატებულა.
- Tab-ის ნაწილი იმუშავა: Chromium-ის focus-scroll scroll-padding-ს ითვალისწინებს. 1280-ზე წინ 6 და უკან 6 დამალული stop (i69–74) 0-მდე ჩამოვიდა, 1440-ზეც 0 დარჩა. Load-ზე scrollTop/scrollLeft 0/0 იყო. Lane-ის კონტროლზე mouse click scroller-ს არ ამოძრავებდა (46 → 46).
- **რეგრესია (code-reviewer-მა მიუთითა, live გაზომვამ დაადასტურა):** როცა timeline ქვემოთაა გადახვეული (1280, rich scene, scrollTop 46), sticky chrome-ის კონტროლზე focus-ისას ხედი ზემოთ ხტება. Playhead handle-ის mouse grab: 46 → 0, drag-ის შუაში. Marker flag-ის focus: 46 → 0. F2 rename input: 46 → 0. Ref ყველა შემთხვევაში 46-ზე რჩება (`a-round-197/pre-revert/chrome-focus-5173-1280.json` და `a-round-197/chrome-focus-5183-1280.json`).
- გამოსწორება ownership-ის გარეთაა: chrome-ის შვილებზე `scroll-margin` ან `preventScroll` `ArrangementRuler.tsx`-სა და `ArrangementMarkerRow.tsx`-ის rename-ში. ამიტომ task-ის stop rule-ის მიხედვით R89 დაბრუნდა: `StudioWorkspace.tsx` start copy-ს ბაიტ-ბაიტ ემთხვევა. დაბრუნების შემდეგ chrome-focus 46-ზე რჩება, როგორც ref-ში, ხოლო C-R196-02 (6 დამალული stop) ისევ ღიაა.
- სრული FR-a/b/c სუიტი შენახულია `a-round-197/focus-reveal-ui.test.tsx.r89-full`-ში. `focus-reveal-ui.test.tsx` ახლა მხოლოდ სამ `it.todo`-ს შეიცავს. მომდევნო რაუნდის FR-c-მ sticky chrome-ის focus-იც უნდა შეამოწმოს.
- Chrome-ის სიმაღლე 84 px-ია ყველა შემოწმებულ მდგომარეობაში: default, BPM 90, marker, detail.

### R90 — 1.5px რჩება

წყაროში დეკლარირებული `1.5px` რჩება (საბას მნიშვნელობა). Chromium 143 ხატავს `1px`-ს. მიღების პირობაა computed `1px` ან `1.5px` და ≥ 3:1. `2px` უარყოფილია, რადგან უფრო მძიმეა. `1px` წყაროში უარყოფილია, რადგან Firefox/Safari 1.5px-ს ხატავს. C-R196-04 გადაწყვეტილებით დაიხურა.

### ტესტირება (Round 197)

- SFR3 განახლდა: `studio-focus.ts`-ში ორი მუდმივაა, MarkerRow-ში 1 inset გამოყენებაა, ჯამი 21. დაემატა SFR6 (flag: `pr-1`, `pl-1`, `isolate`, edge მუდმივა, stem `-z-1`, recipe token-ის გარეშე; edge მუდმივა მხოლოდ MarkerRow-ში). `focus-reveal-ui.test.tsx`: R89-ის დაბრუნების შემდეგ სამი `it.todo`.
- Start copies-ზე SFR3 და SFR6 წითელია. მუტანტები: m10 → SFR3 + SFR6; m12 → SFR2 + SFR6; m13 (stem `-z-1`-ის გარეშე) → SFR6; m2 → SFR1. R89-ის დაბრუნებამდე m9 და m11 FR-a/b/c-მ დაიჭირა; ახლა ეს მუტანტები არ ეხება.
- მეზობელი 24 ფაილიდან 23 მწვანეა (441 ტესტი), ერთი კი 3 todo-ს შეიცავს. Typecheck სუფთაა. Lint: 214 warning + 1 info. Biome შეცვლილ ფაილებზე 0 შეცდომაა.

### შენიშვნები

- თუ ორი marker ერთმანეთთან ახლოსაა და label მაქსიმალურ სიგანემდეა შეკვეცილი, `pr-1`-ის გამო გამჭვირვალე box შემდეგი flag-ის პირველ 4 px-ს ფარავს. შემდეგი flag DOM-ში მოგვიანებით დგას, ამიტომ hit-test-ში ის იგებს. Ring-ის მარჯვენა კიდე (D+3) შემდეგი pill-ის border-ს (D+4) ეკვრის, შემდეგი flag-ის stem კი ring-ის ზედა და ქვედა ხაზს კვეთს. ეს code-reviewer-ის Low-ია, გაზომილი არ არის.
- Marker t=0-ზე, როცა ხედი ჰორიზონტალურად გადახვეულია (მაგ. scrollLeft 2 ruler-ზე click-ის შემდეგ), sticky header-ის ქვეშ ნაწილობრივ იმალება. ეს ქცევა R88-მდეც არსებობდა.
- Firefox-ში 1.5px-იანი ring −1px offset-ით box-ის გარეთ 0.5px-ით გავა. ქვედა მხარეს ეს ნახევარი პიქსელი loop strip-ის ქვეშ მოხვდება. შემოწმებულია მხოლოდ Chromium.

## Round 198 — R91: keyboard focus-ის გამოჩენა sticky chrome-ის ქვეშ (C-R196-02)

### კონტექსტი

C-R196-02 (Medium, WCAG 2.4.11 Focus Not Obscured): 1280×720-ზე, rich scene-ში, როცა timeline ქვემოთაა გადახვეული (scrollTop 46), Tab-ით მიღწეული Video ხაზის ექვსი კონტროლი (i69–74) sticky chrome-ის (ruler, marker row, grid) ქვეშ ექცევა. მათი top 267–293 px-ია, chrome-ის ქვედა კიდე კი 313 px. Round 197-ის R89 (`scroll-padding-top`) stop rule-ით დაბრუნდა, რადგან chrome-ის კონტროლზე focus-ისას ხედი ზემოთ ხტებოდა.

### R91 — რა გაკეთდა

- Timeline scroller-ს (`arrangement-timeline-scroller`) დაემატა ერთადერთი React `onFocus` handler, `revealKeyboardFocusBelowChrome`. ის bubbling focus-ს იჭერს და ახალ `addEventListener`-ს, effect-ს ან cleanup-ს არ საჭიროებს.
- Handler მუშაობს მხოლოდ მაშინ, როცა `html[data-focus-source="keyboard"]`. ეს R85-ის იგივე სიგნალია, რომლითაც ring ჩანს. Pointer-ით მიღებული focus და attribute-ის არქონა ხედს არ ამოძრავებს.
- Chrome-ის შიგნით მიღებული focus (Snap, marker flag, F2 rename, playhead handle, BPM) გამოტოვებულია (`timelineChromeRef.current.contains(target)`).
- გამოტოვებულია ისიც, რაც DOM-ში scroller-ის გარეთაა, და თავად scroller (`target === scroller || !scroller.contains(target)`). მიზეზი: code-reviewer-ის High H1. Marker-ის context menu `document.body`-ში portal-ით ირენდერება, მაგრამ React-ის `onFocus` component tree-ით scroller-მდე მაინც bubble-დება. Shift+F10-ით გახსნილი მენიუს პირველი item chrome-ის ქვედა კიდის ზემოთ დგას, ამიტომ ამ guard-ის გარეშე ხედი გადაიხვეოდა. ეს იმავე handler-ის ნაწილია და მეორე მექანიზმი არ არის.
- გამოთვლა წმინდა helper-შია: `resolveFocusRevealScrollTop` (`app/lib/arrangement/focus-reveal.ts`). `delta = chromeBottom − targetTop`. თუ `delta ≤ 0.5` ან რომელიმე input არასასრულია, შედეგი `null`-ია. სხვა შემთხვევაში `max(0, scrollTop − delta)`. იცვლება მხოლოდ `scrollTop`; `scrollLeft`-ს handler არ ეხება.
- Chrome-ის div-ს დაემატა `data-testid="arrangement-timeline-chrome"` ტესტებისა და C-სთვის.
- Handler-ის პარამეტრი სტრუქტურულად არის აკრეფილი (`{ target: Element }`), რომ `react`-ის import-ის ხაზი არ შეცვლილიყო. React-ის `FocusEvent` მას სრულად აკმაყოფილებს.

### უარყოფილი ალტერნატივები (B-ის probe, `b-round-197/`)

| ვარიანტი | დამალული stop (Tab / Shift+Tab) | Chrome-ის focus scrollTop 46-ზე | მიზეზი |
|---|---|---|---|
| არაფერი (HEAD) | 6 / 6 | 46 | C-R196-02 |
| `scroll-margin-top` lane-ის შვილებზე | 6 / 6 | 46 | Chromium 143 `focus()`-სა და `block:'nearest'`-ზე scroll-margin-ს არ ითვალისწინებს, თუ element-ის box უკვე scrollport-შია |
| `scroll-padding-top` = 84 px (R89) | 0 / 0 | **0** | chrome-ის კონტროლები padded ზოლშია, focus ხედს ზემოთ აგდებს |
| `scroll-padding` + chrome-ზე უარყოფითი `scroll-margin` | 0 / 0 | F2 და Tab chrome-ში → **0** | ნაწილობრივ მუშაობს |
| keyboard-gated reveal (R91) | 0 / 0 | 46 | არჩეულია |

### გაზომვები (A, Playwright Chromium 143.0.7499.4, DPR 2, `--disable-lcd-text`, `:5173`)

- 1280 rich: 82 stop, მათგან 33 scroller-ში, chrome-ის გარეთ. დამალული stop: წინ 0, უკან 0 (ref: 6 / 6). i69–74-ის top ახლა 313.0-ია, ზუსტად chrome-ის კიდეზე. ყველა scroller stop-ზე ring-ის changed px > 0 (286–7920). Stop-ების რიგი და რაოდენობა ref-ს ემთხვევა, წინ და უკან. scrollTop განსხვავდება მხოლოდ Video ხაზის განზრახ გამოჩენისას (46 → 0). scrollLeft ყოველთვის 0-ია.
- 1280 rich, scrollTop 46: playhead grab 46, drag 46, flag-ის `focus()` keyboard წყაროთი 46, F2 46, Shift+F10 marker menu (ღიაა, focus მენიუშია) 46, ArrowDown 46, Escape 46, Snap mouse click 46, lane Mute click 46 → 46, Tab Snap-ზე 46 → 46, ხუთი Tab chrome-ში 46. ნაწილობრივ დაფარული (6 px) Video fold ღილაკზე mouse click: scrollTop 6 → 6, outline `none`, წყარო `pointer`.
- 1440 rich: 0 / 0 დამალული stop, scrollTop-ის მიმდევრობა ref-ს ზუსტად ემთხვევა (0 განსხვავება).
- Default scene, 1280 და 1440: 68 stop, 0 / 0 დამალული, ring ყველგან ჩანს.
- Load: scrollTop/scrollLeft 0/0 ორივე viewport-ზე. pageerror 0, hydration 0. Console-ში მხოლოდ მოსალოდნელი cart `ERR_CONNECTION_REFUSED`.
- ფაილები: `a-round-198/probe-a198-{rich,default}-{1280,1440}.json`.

### ტესტირება (Round 198)

- `focus-reveal.test.ts`: FRU-1, FRU-1b, FRU-2, FRU-3, FRU-4, FRU-5.
- `focus-reveal-ui.test.tsx`: სამი `it.todo` შეიცვალა FR-a…FR-f-ით (jsdom; scroller-ის `scrollTop`/`scrollLeft` instance getter/setter-ით, chrome-ისა და target-ის `getBoundingClientRect` stub-ით). FR-f: keyboard-ით (Shift+F10) გახსნილი portal marker menu ხედს არ ამოძრავებს.
- Red proof: HEAD-ზე FRU ვერ იტვირთება (module არ არსებობს), FR ყველა წითელია. m1 (`onFocus`-ის გარეშე) → FR-a, FR-e წითელი. მუტანტები: m2 → FR-b, m3 → FR-c + FR-f, m4 → FRU-3, m5 → FRU-2 + FRU-4, m6 (`scroller.contains`-ის გარეშე) → FR-e + FR-f.
- FR-e-ზე შენიშვნა: jsdom-ში stub-ებული `scrollTop` scroll event-ს არ იწვევს, ამიტომ ტესტი scroll-ს ხელით აგზავნის. Follow-ის შემოწმება playback-ის გარეშე მხოლოდ smoke-ია; რეალური შემოწმებაა C-ის SIDE-198.
- მეზობელი 25 ფაილი მწვანეა (465 ტესტი). Typecheck სუფთაა. Lint: 214 warning + 1 info. Biome შეცვლილ ფაილებზე 0 შეცდომაა.

### შენიშვნები

- Ableton-თან შესაბამისობა: **არ ეხება**. Live 12-ის manual-ი keyboard focus-ის ring-სა და მის scroll-ს არ აღწერს. წყაროა WCAG 2.4.11 და საბას SABA-B-4.
- ჰორიზონტალური გამოჩენა sticky lane header-ის ქვეშ და ქვედა კიდე ამ რაუნდის ფარგლებს გარეთაა. ქვედა კიდეს Chromium-ის საკუთარი focus-scroll ფარავს.
- R91 საბას ვეტოს ექვემდებარება, R83–R90-ის მსგავსად.
- `data-focus-source="keyboard"` რჩება შემდეგ pointerdown-მდე. ამიტომ keyboard ქმედების შემდეგ კოდიდან გამოძახებული `focus()` (მაგ. Escape-ის შემდეგ focus-ის დაბრუნება) ასევე ამოაჩენს element-ს chrome-ის ქვემოდან. WCAG 2.4.11-ისთვის ეს სწორი ქცევაა (code-reviewer L2).
- Live ბრაუზერში H1-ის გადახვევა guard-ის გარეშე არ გაზომილა: საერთო `:5173` სერვერზე mutant არ გაშვებულა. Guard-ის საჭიროებას ადასტურებს jsdom-ის m6.
