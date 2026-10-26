# Store — D10 შესასვლელი loader: ≤ 1.2 წმ, გამოტოვებადი, სესიაში ერთხელ, reduced motion-ზე გამორთული (STORE-1d)

**თარიღი:** 2026-10-26
**სტატუსი:** In Progress (awaiting C round 190)
**შეცვლილი პროექტი:** Store

## კონტექსტი

Store redesign-ის STORE-1 ეტაპის მეოთხე ნაწილი. spec-ის D10 პუნქტი ითხოვს: „entrance loader ≤ 1.2 s, skippable, once per session, off under `prefers-reduced-motion`“. კვლევა (`research/luxury-and-galleries.md`) იგივეს ამბობს: მოკლე, შეწყვეტადი reveal spinner-ის ნაცვლად.

დასაწყისში (`850445c`) `SpotlightLoader`, რომელიც მხოლოდ მთავარ გვერდზე (`_index.tsx`) არის mount-ებული, ამ მოთხოვნებს არ აკმაყოფილებდა:

- **ხანგრძლივობა 5.6 წმ** იყო (800 ms სიბნელე, 1.2 წმ spotlight, 600 ms ლოგოს დაყოვნება, 2 წმ ჩვენება, 1 წმ გასვლა). C-მ რაუნდ 188-ში 0.64 → 6.3 წმ გაზომა.
- **ჩვენების წესი** `localStorage`-ის 5–7 საათიანი შემთხვევითი ინტერვალი იყო და არა სესია. reduced motion არ მოწმდებოდა.
- **C-R187-I1:** overlay (`fixed inset-0 z-50`) მთელი 5.6 წმ ყლაპავდა hover-სა და click-ს, ამიტომ ბარათის Play preview ვერ ჭერდა. გამოტოვების საშუალება არ არსებობდა.
- **C-R188-I1:** overlay-ში `motion.h1` „CZABA“ იყო, ამიტომ loader-ის დროს გვერდზე ორი h1 ჩანდა.

## მიდგომა

იცვლება მხოლოდ `SpotlightLoader.tsx`. export-ის სახელი და props (არცერთი) იგივე დარჩა. ვიზუალი (შავი სცენა, spotlight cone, glow, ლოგო, ხაზი, tagline, მტვერი, vignette, grain) და არსებული inline ფერები უცვლელია; მხოლოდ დრო შეიკუმშა.

- **დრო (K1):** ერთი მუდმივა `SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150` (≤ 1200) mount-იდან unmount-მდე, exit fade-ის ჩათვლით. 50 ms-იანი მარაგი ფარავს იმას, რომ timer-ები effect-ში, commit-ის შემდეგ იწყება (ბრაუზერში +15–20 ms). ფაზები: spotlight 100 ms-ზე, ლოგო 250 ms-ზე (fade 0.25 წმ), ხაზი და tagline 450 ms-ზე, გასვლა 900 ms-ზე (fade 0.25 წმ), unmount 1150 ms-ზე. framer-ის `transition.duration` მნიშვნელობები შესაბამისად შემცირდა, რომ ლოგო ნამდვილად გამოჩნდეს.
- **არ ბლოკავს (K2):** გასვლის ფაზიდან overlay-ს აქვს `pointer-events-none`, ამიტომ fade-ის დროს click და hover ქვემოთ გვერდს აღწევს.
- **გამოტოვება (K3):** overlay-ზე `click` ან document-ზე `Escape`, `Tab` ან `Shift+Tab` (რაუნდი 190, R67) loader-ს მაშინვე ხურავს, fade-ის გარეშე. ყველა timer, keydown და click listener ერთ effect-შია და მის cleanup-ში იშლება: გამოტოვებისას, ბუნებრივი დასრულებისას და unmount-ისას.
- **სესიაში ერთხელ (K4):** mount effect კითხულობს `sessionStorage`-ის `czaba_entrance_seen` გასაღებს. თუ `'1'`-ია, არაფერი ჩანს; თუ არა, loader ჩანს და გასაღები იწერება. storage-ის შეცდომა (დაბლოკილი storage) ნიშნავს loader-ის გარეშე, exception-ის გარეშე.
- **Reduced motion (K5):** იმავე effect-ში, გადაწყვეტილებამდე, `matchMedia('(prefers-reduced-motion: reduce)')` მოწმდება. თუ ემთხვევა, loader არ ჩანს და სესიის გასაღები არ იწერება. ერთი სინქრონული გადაწყვეტილებაა, ამიტომ overlay ერთ კადრსაც არ ჩნდება.
- **Portal (რაუნდი 190, C-R189-01):** overlay `createPortal`-ით `document.body`-ში რენდერდება და არა `_index.tsx`-ის ხეში. ასე `page-transition-wrapper`-ის შესვლის `transform` მას ვეღარ „იჭერს“ (იხ. პრობლემები). SSR-ზე `isVisible` false-ია და `null` ბრუნდება `createPortal`-მდე, ამიტომ სერვერზე `document` არ გამოიყენება.
- **heading-ის გარეშე (K6):** overlay root-ს აქვს `aria-hidden="true"` და `data-testid="entrance-loader"`. `motion.h1` შეიცვალა `motion.span`-ით (`block` + იგივე კლასები და სტილები), ამიტომ ვიზუალურად იგივეა. გვერდის ერთადერთი h1 hero-ს „CZABA“-ა.

### გადაწყვეტილებები (Saba-ს შეუძლია უარყოს)

- **R61: „სესიაში ერთხელ“ ნიშნავს `sessionStorage`-ს** (`czaba_entrance_seen`). tab-ის სესიაში `/`-ზე პირველი ვიზიტი loader-ს ერთხელ აჩვენებს, მაშინაც კი, თუ ვიზიტორმა ჯერ სხვა გვერდები გახსნა. reload, client navigation `/`-ზე და შემდეგი ვიზიტები იმავე სესიაში მას აღარ აჩვენებს. ახალი tab ან ფანჯარა ახალი სესიაა. დაბლოკილი storage ნიშნავს loader-ის გარეშე.
  - უარყოფილია: `localStorage` ინტერვალით, რადგან spec სესიას ამბობს.
  - უარყოფილია: დაბლოკილ storage-ზე ყოველ ვიზიტზე ჩვენება, რადგან `/`-ზე ყოველ გადასვლაზე განმეორდებოდა.
  - ძველი `localStorage` გასაღები (`czaba_spotlight_last_shown`) აღარ იკითხება და აღარ იწერება, მაგრამ არც იშლება: უვნებელია, წაშლა კი ზედმეტ ჩაწერას დაამატებდა.
  - კომპრომისი Saba-სთვის: სერვერი `sessionStorage`-ს ვერ კითხულობს, ამიტომ overlay მხოლოდ hydration-ის შემდეგ ჩნდება (პირველი paint-იდან დაახლოებით 0.6–0.7 წმ-ში). სერვერზე რენდერი ყოველ ვიზიტზე აჩვენებდა მას, „სესიაში ერთხელ“-ის საწინააღმდეგოდ.
- **R62: ≤ 1.2 წმ იზომება mount-იდან unmount-მდე, exit fade-ის ჩათვლით.** გვერდი ინტერაქტიულია გასვლის ფაზის დასაწყისიდან (K2). უარყოფილია: „≤ 1.2 წმ fade-ის დაწყებამდე“, რადგან overlay 1.2 წმ-ზე მეტხანს დარჩებოდა.
- **R63: გამოტოვება overlay-ზე click-ით ან Escape-ით, ხილული ღილაკის გარეშე.** გამოტოვების click overlay-ზე სრულდება და გვერდამდე არ აღწევს. გამოიყენება `click` და არა `pointerdown`: pointerdown-ზე unmount-ისას pointerup და compatibility click ქვემოთ მდებარე ელემენტზე მოხვდებოდა. უარყოფილია:
  - ხილული „Skip“ ღილაკი — 1.2 წამიან reveal-ს focus target-სა და ვიზუალურ ხმაურს უმატებს;
  - ნებისმიერი ღილაკით გამოტოვება — Tab-სა და screen reader-ის ღილაკებს გვერდითი ეფექტი არ უნდა ჰქონდეს (Tab-ის ნაწილი R67-მა შეცვალა);
  - click-ის გატარება გვერდზე — ვიზიტორი უხილავ ღილაკს დააჭერდა.
- **R67 (რაუნდი 190): Tab და Shift+Tab loader-ს Escape-ის მსგავსად მაშინვე ხურავს, `preventDefault`-ის გარეშე.** ცვლის R63-ის პუნქტს „Tab არ გამოტოვებს“. R63 ეყრდნობოდა ვარაუდს, რომ Tab-ს გვერდითი ეფექტი არ აქვს; C-მ (C-R189-02) აჩვენა, რომ Tab focus-ს შავი overlay-ის ქვეშ ბარათის ბმულზე გადაიტანს, 375-ზე კი carousel-საც გადაახვევს. ახლა focus-ის გადატანა მაშინვე ხილულია. Escape და overlay-ზე click კვლავ გამოტოვებს; სხვა ღილაკები (მაგ. `a`, `ArrowDown`, `Shift`) — არა. უარყოფილია:
  - გვერდის `inert` overlay-ის დროს — სჭირდება frozen `_index.tsx`/`root.tsx` ან loader-ის ჩარევა მეზობელ DOM-ში, და keyboard-ის მომხმარებელს 1.2 წმ-ით დააყოვნებდა;
  - `preventDefault` Tab-ზე overlay-ის დროს — 1.2 წამიანი keyboard trap;
  - Low-ის გადადება — ფიქსი ერთი ხაზია კოდში, რომელიც ამ რაუნდს ეკუთვნის.
- **R64: reduced motion ნიშნავს loader-ის სრულ არარსებობას**, არა უფრო მოკლე ან მხოლოდ fade ვერსიას, და სესიის გასაღები არ იწერება. თუ ვიზიტორი იმავე სესიაში reduced motion-ს გამორთავს, loader შეიძლება ერთხელ გამოჩნდეს.
- **R65: overlay დეკორატიულია:** `aria-hidden="true"`, heading-ის გარეშე. tagline-ის `<p>` რჩება.
- **R66: ვიზუალი რჩება, მხოლოდ დრო იკუმშება.** ფერები, glow და gradient text STORE-2-ის (მიმართულება A) საქმეა; ახალი hardcoded ფერი ან custom CSS არ დამატებულა.

## არქიტექტურა

```mermaid
flowchart TD
  Mount["mount effect"] --> RM{"prefers-reduced-motion: reduce?"}
  RM -->|კი| Null["null, გასაღები არ იწერება"]
  RM -->|არა| SS{"sessionStorage czaba_entrance_seen = '1'?"}
  SS -->|კი ან შეცდომა| Null2["null"]
  SS -->|არა| Show["გასაღების ჩაწერა, isVisible = true"]
  Show --> Timers["timers: 100 spotlight · 250 ლოგო · 450 hold · 900 exit + pointer-events-none · 1150 დამალვა"]
  Show --> Skip["click overlay-ზე, Escape, Tab ან Shift+Tab"]
  Show --> Portal["overlay → createPortal(document.body)"]
  Timers --> Hide["isVisible = false → cleanup: timers, keydown, click"]
  Skip --> Hide
```

## შეცვლილი ფაილები

- `app/components/loading/SpotlightLoader.tsx` — დრო, `pointer-events-none` გასვლისას, click/Escape გამოტოვება, `sessionStorage` სესია, reduced motion, `aria-hidden` და h1 → span. ახალი export: მხოლოდ `SPOTLIGHT_ENTRANCE_TOTAL_MS`.
- `app/lib/__tests__/store-entrance-loader.test.tsx` — ახალი, 15 ტესტი (L1–L11, L10b); რაუნდ 190-ში 17 (იხ. ტესტირება).
- რაუნდი 190: `SpotlightLoader.tsx` — portal: `createPortal(…, document.body)` (C-R189-01) და Tab/Shift+Tab გამოტოვება (K3, R67); keydown handler-ს ეწოდა `handleEntranceSkipKey`. ვიზუალური ელემენტები, კლასები, სტილები და დრო უცვლელია.
- `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md` — სტატუსი Completed და C-ის რაუნდ 188-ის შედეგი (ორი ხაზი).
- ეს დოკუმენტი.

## პრობლემები და გადაწყვეტები

- **Problem:** ძველი timer-ები `phase`-ს ცვლიდნენ; გამოტოვების შემდეგ დარჩენილი timer-ი overlay-ს დააბრუნებდა. → **Solution:** დასრულება და გამოტოვება ერთ `isVisible` state-ს ცვლის, ხოლო timer-ები და listener-ები იმ effect-შია, რომელიც `isVisible`-ზეა დამოკიდებული, ამიტომ cleanup ყველაფერს ერთად შლის.
- **Problem:** `onClick` სტატიკურ `div`-ზე Biome-ის `useKeyWithClickEvents` warning-ს იწვევს, overlay კი `aria-hidden`-ია და focus არ უნდა მიიღოს. → **Solution:** click listener ref-ით იმავე effect-ში ემატება და cleanup-ში იშლება.
- **Problem:** პირველ ვარიანტში (ლოგო 350 ms-ზე) dev რეჟიმში მთავარი thread-ის ~200 ms-იანმა შეფერხებამ ლოგოს ≥ 0.9 opacity-ის ფანჯარა 245 ms-მდე შეამცირა. → **Solution:** ლოგო 250 ms-ზე გადავიდა; საბოლოო სამ გაზომვაში ფანჯარა 506–525 ms-ია.
- **Problem:** code-reviewer-მა აღნიშნა, რომ 1200 ms-იან მუდმივაზე ბრაუზერში 1215–1217 ms გაიზომა, მარაგის გარეშე. → **Solution:** სრული ხანგრძლივობა 1150 ms-მდე შემცირდა (exit fade 0.25 წმ); გაზომვა 1166–1171 ms.
- **Problem:** listener-ების hygiene ტესტები ცარიელ სიაზე მწვანე იქნებოდა, L11 კი React 18-ზე ვერ ჩავარდებოდა. → **Solution:** hygiene შემოწმება ჯერ ამოწმებს, რომ keydown listener საერთოდ დაემატა; L5 და L11 ამოწმებს `vi.getTimerCount() === 0`-ს გამოტოვებისა და unmount-ის შემდეგ; L5 ამოწმებს, რომ `pointerdown` არ ხურავს loader-ს; დაემატა L10b (`setItem`-ის შეცდომა).
- **Problem:** rAF-ში წაკითხული ლოგოს opacity ერთ sample-ში 0-ზე ეცემოდა. framer-motion 12 WAAPI ანიმაციის `onfinish`-ში motion value-ს აყენებს და ანიმაციას მაშინვე `cancel()`-ს უკეთებს; style framer-ის მომდევნო batch-ში იწერება. → **Solution:** კოდი არ შეცვლილა; ResizeObserver-ით paint-მდე (ყველა rAF callback-ის შემდეგ) წაკითხვამ სამივე გაზომვაში 0 dip აჩვენა, ანუ დახატულ კადრში ლოგო არ ქრება. ეს probe-ის რიგითობის არტეფაქტია.

- **Problem (C-R189-01, Medium):** `/`-ზე სესიის პირველ ვიზიტზე fresh-mode CLS 0.62 (375), 0.27–0.29 (1280), 0.19 (1440) იყო; ერთი shift insertion-იდან ~490 ms-ზე, წყარო — `top-1/2 left-1/2` div-ები (მთავარი glow 500 px), previousRect 0×0. C-ის ჰიპოთეზა იყო framer-ის opacity/scale/`y` ანიმაციის დასრულება. **Bisect (375, თითო ჩატვირთვა):** მთავარი glow-ის სრული, მხოლოდ scale-ის და მხოლოდ opacity-ის „გაყინვა“, მეორე glow, ლოგოს wrapper, ხაზი და tagline — ყოველ ვარიანტში CLS 0.6158 დარჩა, ანუ loader-ის შვილების ანიმაცია მიზეზი **არ** არის (ჰიპოთეზა უარყოფილია). **დადასტურებული მიზეზი (კადრობრივი probe):** წინაპარი `DIV.page-transition-wrapper` (`PageTransition.tsx`, frozen) შესვლისას ~500 ms-ის განმავლობაში ანიმირებს `opacity` 0→1 და `transform: translateY(8px)→0`. სანამ `transform ≠ none`, ის `position: fixed` overlay-ის containing block-ია: overlay 375×5564 px იყო (მთელი დოკუმენტი), ცენტრში მოთავსებული glow და ლოგო კი დოკუმენტის შუაში, ეკრანს გარეთ. როცა framer `transform`-ს ასუფთავებს, overlay 375×812-ზე ხტება და glow viewport-ში „შემოდის“ — ეს ერთი layout shift-ია. → **Solution:** overlay `createPortal`-ით `document.body`-ში რენდერდება, ამიტომ არცერთი transform-იანი წინაპარი მას ვეღარ შეიცავს; probe-ში overlay პირველივე კადრიდან viewport-ის ზომისაა, წინაპრების ჯაჭვი ცარიელია. **შედეგი (3 ჩატვირთვა თითო viewport-ზე):** fresh median 375: 0.6158 → 0.00005; 1280: 0.2934 → 0.0014; 1440: 0.1938 → 0.0009; overlay-დან წამოსული `value ≥ 0.005` shift აღარ არის. seen mode უცვლელი დონეზეა (header-ის 0.0198–0.0221 shift-ი overlay-ს გარეთაა და ადრეც არსებობდა). **ინფორმაცია:** `850445c`-ის ძველ loader-ზე (375, ერთი ჩატვირთვა, 4 წმ ფანჯარა) CLS 0.0000 იყო; დასკვნა (არა დადასტურებული): ძველ, გრძელ timeline-ში glow მაშინ ჩნდებოდა, როცა wrapper-ის transform უკვე გასუფთავებული იყო.
- **ფიქსის ვიზუალური შედეგი (გამჟღავნება, screenshot-ებით):** სანამ wrapper-ის transform მოქმედებდა, overlay wrapper-ის ზომას იღებდა: 375-ზე ის header-ის ქვემოთ, y = 81-დან იწყებოდა, ამიტომ header (wrapper-ის გარეთაა) overlay-ის ზემოთ ჩანდა, ლოგო კი ეკრანს გარეთ იდგა (y ≈ 2860). portal-ის შემდეგ overlay პირველივე კადრიდან მთელ viewport-ს ფარავს, header-ის ჩათვლით (`sticky z-50`; cookie banner `z-50`-იც), ლოგო ცენტრშია. Toast (`z-[100]`), modal-ები (`z-[1000]`), LeadMagnet popup (`z-[9999]`) და custom cursor (`z-[10000]`) კვლავ overlay-ზე მაღლაა. wrapper-ის opacity insertion-ის მომენტში გაშვებიდან გაშვებამდე იცვლება (პირველ sample-ში 0-დან 0.97-მდე გავზომეთ), ამიტომ ადრე overlay ზოგჯერ ნახევრად გამჭვირვალედ ჩანდა; screenshot-ის გაშვებაში ის უკვე 0.97 იყო. 1440-ზე, „თბილ“ სერვერზე, wrapper-ის transform insertion-მდე იყო გასუფთავებული და before/after ერთნაირია. ელემენტები, ფერები, კლასები და დრო არ შეცვლილა; ეს თავად ფიქსის შედეგია და შეესაბამება R66-ის „შავ სცენას“.
- **Problem (C-R189-02, Low):** loader-ის დროს Tab focus-ს შავი overlay-ის ქვეშ ბარათის ბმულზე გადაიტანდა, 375-ზე carousel-საც გადაახვევდა. → **Solution:** R67 — keydown handler-ში `Tab` (Shift-ით ან მის გარეშე) loader-ს Escape-ის მსგავსად ხურავს, `preventDefault`-ის გარეშე; ბრაუზერის ჩვეულებრივი focus-ის გადატანა უკვე ხილულ გვერდზე ხდება.
- **Problem:** portal-ის გამო overlay ტესტის `container`-ში აღარ არის, ამიტომ `container.firstElementChild` ცარიელი იქნებოდა. → **Solution:** T1-ის `findOverlay` helper `document.querySelector('[data-testid="entrance-loader"]')`-ს იყენებს (პარამეტრი დარჩა, რომ დანარჩენი შემთხვევები უცვლელი იყოს). L2-ის heading-ის query ახლა overlay-ით შემოიფარგლება (ადრე container იყო; შედეგი იგივეა, რადგან კომპონენტი მხოლოდ overlay-ს რენდერს). სხვა assertion-ები არ შეცვლილა და helper start კოდზეც მუშაობს.

## ტესტირება

- `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx`: 15/15 მწვანე. start კოდზე (`b-round-188/r189-granted-start/SpotlightLoader.tsx`) 12 ჩავარდა: L2, L3, L4, L5, L6-ის სამივე hygiene/Escape შემთხვევა, L7, L8, L9, L10, L10b. მწვანე დარჩა L1 (SSR), L6 Tab და L11 (start კოდიც ასუფთავებდა timer-ებს unmount-ზე). start კოდს `SPOTLIGHT_ENTRANCE_TOTAL_MS` არ აქვს, ამიტომ L3/L4 იქ ნაწილობრივ ამ მიზეზითაც ჩავარდა. Mutant-ები: click → `pointerdown` აწითლებს L5-ს; `removeEventListener`-ის წაშლა აწითლებს L6-ის სამ hygiene შემთხვევას.
- `npm run typecheck` exit 0; `npm run lint` 214 warning + 1 info (იგივე, რაც რაუნდ 188-ში). Biome ორ ფაილზე: 0 error, 1 წინასწარ არსებული `noArrayIndexKey` warning უცვლელ მტვრის ბლოკში.
- **Playwright Chromium, 1440×900, `/` (mock :5199, dev :5173):** overlay-ის insertion → removal 1166 / 1171 / 1168 ms (insertion გვერდის ჩატვირთვიდან 0.65–0.9 წმ-ზე, hydration-ის შემდეგ); h1-ის მაქსიმუმი ყველა კადრში 1; ლოგოს opacity 1-ს აღწევს, ≥ 0.9 ფანჯარა 506–525 ms; `pointer-events: none` insertion-იდან 919–935 ms-ზე; იმავე context-ში reload: 0 insertion 3 წმ-ში; `reducedMotion: 'reduce'` context: 0 insertion, გასაღები არ ჩაიწერა. `sessionStorage.czaba_entrance_seen = '1'`, ძველი `localStorage` გასაღები არ არსებობს. pageerror 0.
- C რაუნდ 189-ში: FAIL — C-R189-01 (Medium, fresh-mode CLS) და C-R189-02 (Low, Tab); დანარჩენი 15 სტრიქონი PASS.
- **რაუნდი 190 (A):** T1 17/17 მწვანე: L6-ის „Tab does not skip“ შეიცვალა ორი შემთხვევით „Tab / Shift+Tab ends it like Escape“ (overlay ქრება, `fireEvent` აბრუნებს `true`-ს — preventDefault არ არის, timer-ები 0, keydown listener მოხსნილია) და დაემატა „other keys do not skip“ (`a`, `ArrowDown`, `Shift`). start კოდზე (`b-round-189/r190-granted-start/`) მხოლოდ ორი Tab შემთხვევა ჩავარდა; `preventDefault`-ის mutant-ი ორივე Tab შემთხვევას აწითლებს. **portal-ს (C-R189-01) unit ტესტი არ აქვს:** jsdom layout-ს ვერ ხედავს, ხოლო `parentElement === document.body` assertion start კოდზე L2-ს გააწითლებდა, რაც ამ რაუნდის პირობას („start-ზე მხოლოდ ორი Tab შემთხვევა წითელია“) ეწინააღმდეგება. portal-ის მოხსნის mutant-ს T1 ვერ იჭერს; K1 მხოლოდ Playwright-ით მოწმდება (მშობელი `body`, სიმაღლე = viewport, CLS). გადაწყვეტა B-ს ეკუთვნის. `npm run typecheck` exit 0; `npm run lint` 214 warning + 1 info (უცვლელი); Biome ორ ფაილზე 0 error, 1 წინასწარ არსებული `noArrayIndexKey`.
- **რაუნდი 190, Playwright Chromium (mock :5199, dev :5173):** CLS ზემოთ (პრობლემები). 1440-ზე insertion → removal 1164 / 1164 / 1167 ms; ლოგოს opacity ≥ 0.9 paint-მდე sampler-ით 475–503 ms; overlay-ის სიმაღლე ყველა sample-ში 900 (viewport), მშობელი `body`. Mid-loader screenshot 375 და 1440: „CZABA“, ხაზი და tagline ცენტრში. Tab 375/1440-ზე ~300 ms-ზე: overlay 4–7 ms-ში ქრება, focus header-ის „CZABA“ ბმულზეა (ხილული); Shift+Tab: overlay ქრება, focus `footer`-ის „Cookie Policy“ ბმულზეა, ბრაუზერი მას ხილვად არეში გადაახვევს (`scrollY` 4900 / 4121); Escape ქრება 4–6 ms-ში; `ArrowDown` არ გამოტოვებს (loader თავისით მთავრდება 1163–1166 ms-ზე; დამალული გვერდი 40 px-ით ჩამოიწევს — R67-ის ფარგლებს გარეთ, ინფორმაცია). audio 0, URL უცვლელი, pageerror 0.
- C-ის დამოუკიდებელი ბრაუზერის შემოწმება (რაუნდი 190) ჯერ არ ჩატარებულა.

## TODO / შემდეგი ნაბიჯები

- **არქიტექტურის შენიშვნა B-სთვის:** ნებისმიერი `position: fixed` ელემენტი, რომელიც `PageTransition`-ის (`page-transition-wrapper`) შიგნით რენდერდება, viewport-ის ზომას მხოლოდ შესვლის transform-ის დასრულების შემდეგ იღებს. loader-მა ეს portal-ით აირიდა; სხვა fixed overlay-ებს (modal, popup) იგივე რისკი შეიძლება ჰქონდეს.
- `ArrowDown`/Space/PageDown loader-ის დროს დამალულ გვერდს ახვევს (C-R189-02-ის კლასი, R67-ის გარეთ) — Low-ად აღრიცხვის კანდიდატი.

- **STORE-2:** loader-ის hardcoded teal, glow და gradient text მიმართულება A-ზე (Obsidian & Brass).
- **STORE-5:** `CinemaCurtainLoader`, `PianoCurtainLoader` და `PianoLoadingAnimation` ორივე barrel-იდან exported-ია, მაგრამ არცერთი route არ იყენებს.
- `noArrayIndexKey` მტვრის ნაწილაკებზე და render-ში `Math.random()` წინასწარ არსებული საკითხებია; შეიძლება STORE-2-ის retheme-თან ერთად გასწორდეს.
