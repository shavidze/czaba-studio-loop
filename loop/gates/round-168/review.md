COMMIT: OK (the diff only changes classNames on Lane and Group header buttons, plus tests and docs. It doesn't touch auth, purchase, download, the API client or any context. verify.log shows 171 files and 2562 tests passing, plus a successful build, and c-round-168 is PASS.)

## Code Review: ArrangementLane.tsx, ArrangementGroupHeader.tsx (+3 ტესტი, 2 doc)

**Scope:** ეს diff-ის review-ა, მოდული სრულად არ შემოწმებულა. paths.txt-ში 7 ფაილია: 2 arrangement component, 3 test და 2 implementation doc. Auth, purchase, download, `services/api` და `contexts/` არ შეცვლილა.

**ჩემი შემოწმებები:**
- **Radius:** `app/styles/app.css:130-131`-ში `--radius-sm: 6px` და `--radius-md: 8px` წერია. ესე იგი `rounded-sm` → `rounded-md` მართლაც 6 → 8 px-ია, როგორც doc და ტესტები ამბობს.
- **Disabled მდგომარეობა:** Mute/Solo ღილაკებს (`ArrangementLane.tsx:605-639`, GroupHeader) `disabled=` არ აქვთ. ამიტომ რომ disabled ღილაკი enabled-ს ჰგავდეს, ასეთი რისკი არ არსებობს.
- **twMerge:** on-state-ის `bg-accent` / `bg-brand` / `border-*` / `enabled:hover:bg-*` ცვლის base-ის fill-ს, border-ს და hover-ს. mixed მდგომარეობაში `bg-gradient-to-r` შლის `bg-foreground/5`-ს (doc 137 R8 ამას აღწერს, ტესტიც ამოწმებს).
- **დანარჩენი:** listener, timer, effect, hook და state ცვლილება არ არის. აუდიოს timing-ს, refs-ს და Undo/Redo-ს diff არ ეხება.

### Critical Issues
- არ არის.

### Suggestions (რიგით, ყველა Low, commit-ს არ აჩერებს)
1. **`ArrangementLane.tsx:613` და `:631`:** SURF+MOTION სტრიქონი (~300 სიმბოლო) ორჯერ წერია inline, და თითქმის იგივე ასლი `:723` და `:731`-ზეცაა (import ღილაკები). GroupHeader-ს ეს უკვე `TRACK_GROUP_MIX_BUTTON_CLASS`-ში აქვს გატანილი.
   - **გამოსწორება:** ფაილის დონეზე `const LANE_MIX_BUTTON_CLASS`, GroupHeader-ის მსგავსად. ქცევა არ შეიცვლება, LSU7 token-ებს მაინც ამოწმებს.
2. **ბრაუზერის ქცევა, რომელსაც ტესტები ვერ ხედავს:** ამ ღილაკებს აქამდე transition არ ჰქონდა, ახლა `transition-[background-color,color]` აქვთ. Mute/Solo-ს toggle ახლა 180 ms-ში ანიმირებს 5% → accent/brand გადასვლას. ეს spec-ს ემთხვევა და `motion-reduce:transition-none!` დაცვა ადგილზეა. Focus ring (`box-shadow`) transition-ში არ შედის, ამიტომ მყისიერად ჩნდება, და ეს სწორია.
3. **A11y (WCAG 1.4.11), `ArrangementGroupHeader.tsx:10`, `ArrangementLane.tsx:613/631`:** off მდგომარეობაში border გამჭვირვალეა. ღილაკის საზღვარს მხოლოდ fill აჩენს, რომლის კონტრასტი ფონთან 1.12–1.13:1-ია. ღილაკს M/S ტექსტი მაინც ამოიცნობს, ხოლო `aria-pressed` და focus ring შენარჩუნებულია. Spec ამას შეგნებულად იღებს (4a-ს პრეცედენტი) და ეს trade-off-ად უნდა დარჩეს. Saba-ს veto-სთვის ღიაა.
4. **On-state hover:** `enabled:hover:bg-accent/brand` hover-ზე არაფერს ცვლის. ეს განზრახ არის (Q-R167-ON-HOVER) და რეგრესია არ არის, ძველ on-state-საც hover არ ჰქონდა.
5. **`docs/.../137-...md:4`:** სტატუსი ჯერ კიდევ „In Progress (awaiting C round 168)“-ია, მიუხედავად იმისა, რომ c-round-168 PASS-ია. 136-ში სტატუსი publish-ის შემდეგ შეიცვალა commit hash-ით, ამიტომ ეს იმავე წესს მიჰყვება და commit-ს არ აჩერებს. შემდეგ რაუნდში სტატუსი Completed-ზე უნდა გადავიდეს.

### Good Practices Found
- Tailwind-first: hardcoded ფერი არ არის, მხოლოდ token-ები (`foreground/5|8|12`, `accent`, `brand`). arbitrary მნიშვნელობა მხოლოდ easing curve-შია, რომელიც spec-იდან მოდის.
- TS strict და semicolons დაცულია. ტესტის helper-ები `as`-ის ნაცვლად throw-ით ამოწმებენ null-ს.
- Import ღილაკების სტრიქონები სტატიკურია (`cn` არ გადის), ამიტომ `border-transparent` მათ შეგნებულად არ დაემატა, რომ `border-brand`-თან CSS-ის რიგის კონფლიქტი არ გაჩენილიყო (R6).
- TH10-ის substring შენარჩუნდა, რადგან ახალი token-ები `leading-none`-ის შემდეგ ჩაჯდა.
- Mutation-ები m199–m205 ყველა მოკლულია. ტესტები ამოწმებს ჩამოშორებულ token-ებსაც (`not.toContain`) და მთელ toggle ციკლს.
- Layout-ის probe-ის შედეგი 0.000 px-ია. Layout shift არ არის, რადგან 1 px border გამჭვირვალედ დარჩა.

### Architecture note
- **სიგნალი 3 (ერთი რეგიონის განმეორებითი ძვირი ცვლილება):** SURF+MOTION recipe-ს ასლები უკვე სამ ადგილასაა:
  - `ArrangementTransport` (round 167);
  - `ArrangementLane.tsx:613/631/723/731`;
  - `ArrangementGroupHeader.tsx:10`.

  V-3c-4c-ში (Detail, Library, Export dialog, video-dock) კიდევ 4+ ადგილი ემატება. ყოველ რაუნდში იგივე token-ები თავიდან იწერება ახალ ტესტებში და TH10-ის substring-ებში.
  - **ახლა დავტოვოთ:** ეს მხოლოდ className-ებია, lifecycle-ს, audio timing-ს და hook-ის ფორმას არ ეხება. doc 137 გადაწყვეტილებას ასახელებს (checkpoint Q1 fallback (c)), ამიტომ ამ რაუნდში გამოყოფა არ ღირს.
  - **წინადადება planner-ისთვის (V-3c-4c-მდე):** `app/components/arrangement/`-ში ერთი export (`studioButtonSurfaceClass` / `studioButtonMotionClass`) თავისი ერთი token-ტესტით, რომელსაც Transport, Lane და GroupHeader გამოიყენებენ.
    - მიღების კრიტერიუმი: LSU7, UM11 და TH10 უცვლელად მწვანეა.
    - იმავე დავალებაში უნდა დაიხუროს Q2: რატომ სჭირდება motion token-ებს `!`. თუ ის რომელიმე base `transition`-ს ებრძვის, ეს ერთ ადგილას უნდა გადაწყდეს.
    - ღირებულება: low–medium. ეს მხოლოდ წინადადებაა, scope-ს root ან მომხმარებელი წყვეტს.

### Alternative Approach
- კრიტიკული ლოგიკა (auth, checkout, audio pipeline) diff-ში არ არის. კლასების სტილისტიკის ალტერნატივა („მხოლოდ radius + motion“ import ღილაკებზე) doc 137 R6-შია განხილული და სწორად არის უარყოფილი.

### Score: 9/10