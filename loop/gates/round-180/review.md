COMMIT: OK (ცვლილება მხოლოდ className-ებშია; auth/purchase/download კოდს არ ეხება; verify-ში 178 ფაილი, 2620/2620 ტესტი წარმატებით გავიდა)

## Code Review: round-180 (DUX-R-5b-3b — drag feedback, import / Add ფერი)

ეს მხოლოდ diff-ის review-ა. `ArrangementLane.tsx`, `ArrangementLibraryPreview.tsx` და სატესტო მოდული მთლიანად არ შემიმოწმებია.

**რა შევამოწმე:**
- **Scope:** `paths.txt` ზუსტად ემთხვევა `diff.patch`-ს და `untracked.txt`-ს.
- **რა შეიცვალა:** მხოლოდ class token-ები. Handler, state, effect, listener/timer, `data-*` მნიშვნელობა, ტექსტი, layout და ზომა იგივე დარჩა. ამიტომ ბრაუზერში event-ების თანმიმდევრობას, leak-ებს ან render-ის ღირებულებას ეს ცვლილება ვერ შეეხება.
- **Tokens:** `muted`, `outline-strong` და `foreground` `app/styles/app.css`-ის `@theme`-ში (l.31–177) არის აღწერილი. ამიტომ Tailwind v4 `ring-muted`, `bg-muted/20`, `bg-foreground/15`/`/20` და `border-outline-strong` კლასებს შექმნის. Hardcoded ფერი და custom CSS არ დამატებულა.
- **Focus:** focus ring-ები (`focus-visible:ring-brand`, K10) და აქტიური lane-ის `bg-brand/5` (K7) ადგილზეა.
- **Security:** auth, purchase, download და დაცული ფაილები არ შეცვლილა. XSS ან input-ის ზედაპირიც არ ჩანს.
- **TS strict:** `any`, `@ts-ignore` და type assertion არ არის. ახალ ტესტში type guard-ები და labelled `Error`-ები გამოიყენება.

### Critical Issues
- არცერთი.

### Suggestions (რიგით; ოთხივე Low და არცერთი არ ბლოკავს)
1. **Doc 147-ში ერთი TODO ძველი დარჩა.** `docs/implementation/2026/quarter-IV/147-studio-dux-r5b3a-label-status-colour.md`, TODO სექციის პირველი bullet: „C round 178-ის ბრაუზერის მტკიცებულება; შემდეგ სტატუსი → Completed.“ იმავე diff-ში სტატუსი უკვე `Completed`-ზეა გადაყვანილი.
   - **Fix:** გადახაზე `~~…~~`-ით, როგორც ქვემოთ badge-ის bullet-ია გადახაზული, ან წაშალე.
2. **დაბლოკილ lane-move ghost-ს მხოლოდ სიკაშკაშე განასხვავებს** (`ArrangementLane.tsx:918-920`, label `:930-939`). Library ghost-ის label-ს ემატება „· ადგილი არ არის / audio video lane-ზე“. Lane-move ghost-ის label-ში კი მხოლოდ დრო და წყაროს სათაურია. ამიტომ valid და blocked მდგომარეობები მხოლოდ ფერით განსხვავდება (doc 148: 2.21:1), რაც WCAG 1.4.1-ს ეხება.
   - ეს ძველი პრობლემაა და ახლა გაუმჯობესდა: Obsidian-ში `accent == brand`, ამიტომ ამ რაუნდამდე ორი მდგომარეობა სულ ერთნაირი ჩანდა. ფერის გარდა უკვე არსებობს `data-blocked` და ბოლო ვალიდური ghost, რომელიც დაბლოკილის გვერდით ჩანს.
   - **Fix (planner-ისთვის, არა ამ რაუნდში):** lane-move label-ს დაემატოს უარის მოკლე სუფიქსი, Library ghost-ის მსგავსად.
3. **Contrast-ის ცხრილი მხოლოდ Obsidian-ისაა** (doc 148, §Contrast). Default theme-ში მნიშვნელობები სხვაა: `--color-muted: hsl(220,10%,55%)`, `--color-outline-strong: hsl(220,15%,32%)`. თუ Studio route-ზე default theme-იც ჩნდება, import-ის border-ის 3.50:1 იქ შემოწმებული არ არის. ეს მე არ გამიზომავს; ის C-ის CONTRAST-DRAG row-ის საქმეა.
   - **Fix:** doc-ში დაწერე, რომელ theme-ზეა გაზომილი.
4. **სიმწყობრე ახალ ტესტში.** `drag-feedback-colour-ui.test.tsx` `view.unmount()`-ს არ იძახებს, მეზობელი suite-ები კი (მაგ. `library-row-strings-ui.test.tsx:595`) იძახებენ. ეს ბაგი არ არის: DXG5 „ზუსტად ერთ import ღილაკს“ ითხოვს და DOM-ის leak-ის შემთხვევაში ჩავარდებოდა. ესე იგი auto-cleanup მუშაობს.
   - **Fix:** სურვილისამებრ, სხვა suite-ებთან ერთნაირობისთვის.

### Good Practices Found
- H1-ში ზედმეტი `cn()` პირობა ჩვეულებრივ `className` სტრიქონად გადაკეთდა (gate-174 S1 წესი).
- DXG1–DXG7 ფერს ამოწმებს რეალური gesture-ით: `beginLibraryDrag`, pointer move და `dragEnter`/`dragOver`/`dragLeave`. ring და hint `dragLeave`-ის შემდეგ ქრება, ამიტომ ტესტი ასევე იცავს, რომ ეს მდგომარეობა არ რჩება.
- DXG6-ის source lock-ში ძველი recipe-ები 0-ზეა დაყენებული. `RETIRED_BRASS_SITES` ძველ TODO-ს ცვლის.
- Brass filter-ი (`NEUTRAL_BRAND_NAMED_TOKENS`) და lane body-ზე მხოლოდ `ring-*`-ის შემოწმება K7 tint-ზე ცრუ წითელს თავიდან იცილებს.
- Lane-move ghost მოიძებნება `data-blocked`-ის მნიშვნელობით, ამიტომ `keptGhosts`-ის ქცევა ტესტის გამო არ შეცვლილა.
- Mutation-ების შედეგი ჩაწერილია, მათ შორის მოულოდნელი წითლები m294 და m296.

### Architecture note
- **სიგნალი 3 (ერთი რეგიონის განმეორებითი ძვირი ცვლილება):** `ArrangementLane.tsx`-ის ghost/import className-ებს 5b-1-დან 5b-3b-მდე რამდენიმე რაუნდი ცვლიდა. ყოველ ჯერზე იმეორებს დაახლ. 80-ხაზიან fake AudioContext/ResizeObserver ბლოკს, workspace-ის mount-ის helper-ს (l.209–264) და საკუთარ token helper-ებს (`drag-feedback-colour-ui.test.tsx:30-107, 181-199`).
  - **Keep:** component-ში invariants (gesture lifecycle, refs, `useArrangement()`-ის ფორმა, audio timing) არ შეცვლილა. ფასი მხოლოდ ტესტებში იხდება.
  - **ღირებულება:** low–medium.
  - **Proposal planner-ისთვის:** ერთი შეზღუდული დავალება — საერთო workspace mount/fakes harness და token-assertion helper (`ROOT-RECON-GRID-HARNESS`).
    - Ownership: `app/lib/arrangement/__tests__/` (helper + 2–3 suite-ის მიგრაცია).
    - მიღების კრიტერიუმები: ტესტების რაოდენობა და შედეგი არ იცვლება; production კოდი ხელუხლებელია.
  - DUX-R-5-ის stage exit სწორედ ის checkpoint-ია, რომელსაც reference აღწერს. Doc 148-იც იგივეს გვთავაზობს, ამიტომ ეს მხოლოდ დადასტურებაა. ეს წინადადებაა და დამტკიცებული scope არ არის.

### Alternative Approach
- N/A. ეს კრიტიკული ბიზნეს-ლოგიკა არ არის (auth, checkout და audio pipeline არ შეცვლილა). ფერის ვარიანტები (warning/destructive vs foreground/muted) doc 148-შია განხილული.

### Score: 9/10