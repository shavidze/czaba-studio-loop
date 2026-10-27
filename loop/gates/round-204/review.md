COMMIT: BLOCK (implementation doc-ი ამბობს, რომ ტესტი არსებობს, რეალურად კი ასეთი ტესტი არ არის. გამოსწორება ერთი ტესტის დამატება ან ერთი ხაზის წაშლაა, შემდეგ კი commit OK არის.)

## Code Review: Header.tsx, StudioShowcase.tsx, store-hidden-focusables.test.tsx, 161-hidden-focusables-runtime.md

ეს მხოლოდ diff-ის review-ა. მოდულები სრულად არ შემომიმოწმებია.

### Critical Issues
1. **დოკუმენტი ამბობს, რომ ტესტი არის, ტესტი კი არ არის.** `docs/implementation/2026/quarter-IV/161-hidden-focusables-runtime.md:111`-ის მიხედვით jsdom ტესტი ამოწმებს, რომ user menu იხურება, როცა `isAuthenticated` ხდება `false`. ტესტ ფაილში 10 ტესტია (HF1–HF9 და HF8b), verify.log-შიც 10 ტესტი წერია. არცერთი არ ხსნის მენიუს და მერე არ ცვლის auth-ის მდგომარეობას. `store-header-footer.test.tsx`-შიც ასეთი ტესტი არ არის. ამიტომ effect `Header.tsx:43-45` ტესტით დაფარული არ არის, docs კი ამ პროექტში regression dataset-ად გამოიყენება.
   **Fix (რომელიმე ერთი):**
   - დაამატე HF6b: `renderSignedInHeader` → click → `authMock.state.isAuthenticated = false; rerender` → `= true; rerender` → `aria-expanded === 'false'`;
   - ან წაშალე ხაზი 111.
   - ამასთან, სტატუსი (`:4` „In Progress… C-ის browser შემოწმებას ელოდება“) განაახლე, რადგან c-round-204 PASS-ია.

### Suggestions (რიგით, ყველა Low)
1. **`Header.tsx:130-134`: მენიუ იხურება, როცა `relatedTarget` არის `null`.**
   - **პრობლემა:** Safari-სა და iOS-ზე click ან tap ბმულს focus-ს არ აძლევს. თუ ღილაკზე keyboard focus იყო, თანმიმდევრობაა: pointerdown (შიგნით, იგნორირდება) → blur(null) → დახურვა → click.
   - **რატომ არ ტყდება ახლა:** desktop-ზე panel-ს `group-hover:` ინარჩუნებს. lg+ touch მოწყობილობაზე (iPad) tap-ს მხოლოდ `transition-all` ინახავს, რომელიც 200ms-ით აყოვნებს `visibility`-ის ცვლილებას. თუ ვინმე `transition-all`-ს property-ების სიით შეცვლის, ეს tap-ები აღარ იმუშავებს.
   - **Fix:** `null` შემთხვევაში დახურვა ერთი frame-ით გადადე (`requestAnimationFrame`) და შემდეგ შეამოწმე `userMenuRef.current?.contains(document.activeElement)`.
2. **`Header.tsx:177-186`: auth-თან ახლოს მდგარი ცვლილება.** ამ ცვლილებაში „none“ ზუსტი პასუხი არ არის:
   - Logout-ის onClick ახლა ჯერ `setIsUserMenuOpen(false)`-ს იძახებს, მერე `signOut()`-ს. თვითონ `signOut`, `~/lib/auth` და `AuthContext` არ შეცვლილა.
   - Downloads/Orders ბმულებს მხოლოდ menu-ს დამხურავი `onClick` დაემატა. route-ები და purchase/download ლოგიკა იგივე დარჩა.
   - HF6 ამოწმებს, რომ `signOut` ზუსტად ერთხელ იძახება.
   - ეს მისაღებია, მაგრამ commit message-ში ასე უნდა ეწეროს, „auth-ს არ შევხებივართ“ ფორმულირების გარეშე.
3. **`StudioShowcase.tsx:155`: `transition-[background-color,transform] duration-200` არაფერს აკეთებს.** doc-ის საკუთარი გაზომვით, global `a, button` წესი (`app.css:307`) ყოველთვის იმარჯვებს. ან ამოიღე, ან დატოვე TODO B-სთვის. ამავე ხაზზე დაამატე `motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none]`. ძველი `whileHover`-იც reduced-motion-ს არ ითვალისწინებდა, ასე რომ ეს რეგრესია არ არის.
4. **`store-hidden-focusables.test.tsx:317`: HF8b-ში რეალური `setTimeout(50)` არის**, რაც ტესტს შემთხვევით ჩავარდნის მცირე რისკს აძლევს. `vi.useFakeTimers()`-ით შედეგი დეტერმინისტული გახდება. ანიმაციები `skipAnimations`-ით უკვე გამორთულია.
5. **`StudioShowcase.tsx:71`: `onFocus`-ით reveal-ის შემდეგ observer კვლავ აკვირდება.** ის მხოლოდ შემდეგ intersection-ზე ითიშება. ეს უვნებელია, რადგან `setIsInView(true)` ხელახლა გამოძახებისას React re-render-ს არ აკეთებს. თუ გინდა, observer ref-ში შეინახე და focus-ის დროსაც გათიშე.

### Good Practices Found
- `pointerdown` listener მხოლოდ მაშინ არსებობს, როცა მენიუ ღიაა, და cleanup მას შლის. HF5 ამოწმებს, რომ ის ნამდვილად იშლება. leak არ არის.
- Escape-ის `stopPropagation` მხოლოდ ღია მენიუზე მუშაობს. დახურულ მდგომარეობაში CommandPalette-ისა და სხვა global handler-ების Escape არ იბლოკება.
- სწორად შეირჩა disclosure pattern `role="menu"`-ის ნაცვლად, ასე რომ arrow-key-ის მხარდაჭერის ვალდებულება არ ჩნდება. `aria-expanded`/`aria-controls` ორივე ღილაკზეა, ყველა `<button>`-ს აქვს `type="button"`.
- `invisible` mobile menu-ზე: `visibility` transition-ის ბოლოს იცვლება, ამიტომ fade ანიმაცია რჩება. `inert` და type assertion არ დასჭირდა.
- motion-ის press gesture თავის target-ს `tabIndex=0`-ს ანიჭებს. მიზეზი სწორად მოიძებნა და wrapper ამოიღეს, `tabIndex=-1`-ით ნიღბვის ნაცვლად.
- TS strict-ია: `any`, type assertion და `@ts-ignore` არ არის. `instanceof Node` guard-ები სწორია. Tailwind class string-ები სრულადაა ჩაწერილი, ამიტომ scanner მათ იპოვის. hardcoded ფერები არ არის.
- verify.log-ში `Header.tsx`/`StudioShowcase.tsx`-ზე ახალი Biome შენიშვნები არ არის. იქ მხოლოდ ადრე არსებული SSR `useLayoutEffect` stack-ებია.
- reveal-once ქცევის ცვლილება შეგნებულია. HEAD-ის არცერთი ტესტი არ ამოწმებს, რომ content ხელახლა იმალება.
- SSR-ის თვალსაზრისით უსაფრთხოა: საწყისი state `false`-ია, ხოლო IntersectionObserver მხოლოდ `useEffect`-ში იქმნება.

### Architecture note
- სიგნალი 4 (არსებულ owner-ს ახალი state/lifecycle დაემატა): `Header.tsx:14-28, 43-45, 121-135`. ჩნდება `isUserMenuOpen`, ორი effect, document listener და keyboard/focus lifecycle owner-ში, რომლის როლი nav და cart badge იყო.
- **keep, რადგან** lifecycle ერთია, დახურვის გზები ერთმანეთზეა დამოკიდებული, ხოლო ახლა გამოყოფა prop-ების გადაცემას დაამატებდა. ღირებულება low-ია.
- **proposal (planner-ისთვის, დამტკიცებული scope არ არის):** გამოიყოს `HeaderUserMenu`, რომელიც თვითონ ფლობს `isUserMenuOpen`-ს, listener-ს და Escape/blur ლოგიკას და `useAuth`-ს პირდაპირ კითხულობს.
  - მიღების კრიტერიუმი: HF2–HF6 და HF6b უცვლელად გადის ახალ component-ზე, `Header`-ში რჩება მხოლოდ mobile toggle-ის state.
  - ასევე აქ შეიძლება დაემატოს B-R203-USERMENU-HOVER-ESCAPE (hover-ით გახსნილი panel-ის Escape-ით დახურვა).

### Alternative Approach (კრიტიკული UI ქცევა: auth-ის მენიუ)
- **Current:** click/keyboard state და ხელუხლებელი hover (`group-hover:`) ერთად მუშაობს. მენიუ ხუთი გზით იხურება: Escape, blur, pointerdown გარეთ, ბმულზე click და Logout.
- **Alternative:**
  - (a) hover-ზე მიბმული state (`onPointerEnter`/`Leave`);
  - (b) conditional render (`isUserMenuOpen && …`), hover-ის მოხსნით.
- **Verdict:** მიმდინარე მიდგომა უკეთესია.
  - (a) hover-ით გახსნის შემდეგ click მენიუს pointer-ის ქვეშ დახურავდა.
  - (b) კარგავს დახურვის ანიმაციას და mouse-ის ქცევას ცვლის, რაც არავის მოუთხოვია. ეს doc-ის უარყოფილი ალტერნატივების ცხრილშიცაა დასაბუთებული.
  - ფასი: hover-ის დროს `aria-expanded` `false` რჩება. ეს შეგნებულად მიღებული და დოკუმენტირებული trade-off-ია.

### Score: 8/10
კოდი და a11y ფიქსი კარგია. 8/10-ის მიზეზი doc-ში ტესტის დაფარვაზე გაკეთებული მცდარი მტკიცებაა. HF6b-ის დამატება ან `:111`-ის წაშლა და სტატუსის განახლება BLOCK-ს მოხსნის.