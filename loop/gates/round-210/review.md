COMMIT: OK

## Code Review: round-210 (PERF-FADER-a — fader-ის pointer preview draft store-ით)

აუთენტიფიკაციის, შეძენის ან ჩამოტვირთვის კოდს ეს diff არ ეხება. ყველა path არის `app/components/arrangement/*`, `ArrangementContext.tsx`, ტესტები, docs ან `perf/budgets.json`. verify.log-ში ტესტის 198 ფაილი და 2834 ტესტი გავიდა, ორივე build დასრულდა. 205 Biome warning სხვა ფაილებშია, ახალ ფაილებში არ არის. C round 210 = PASS.

### Critical Issues
- არ არის.

### Suggestions (რიგით, file:line → fix)
1. **`docs/implementation/2026/quarter-IV/165-fader-pointer-preview.md:4`**: სტატუსი წერია „In Progress (C round 210 check pending)“, C კი უკვე PASS-ია. ეს სტრიქონი კომიტამდე განაახლე: „C round 210 PASS“, published hash-ით ან Completed სტატუსით. 163-ში ახლა წერია „PERF-FADER-a (round 210) … გადავიდა“, ამიტომ ორი doc ერთმანეთს ეწინააღმდეგება.
2. **`app/contexts/ArrangementContext.tsx:453`**: `export function withMixOverride` მხოლოდ ამ ფაილში გამოიყენება. context-ის მოდული component-ის გარდა სხვა helper-საც აექსპორტებს. ეს Remix dev-ში Fast Refresh boundary-ს არღვევს და `useArrangement`-ის მოდულის საჯარო ზედაპირს ზრდის. Fix: `export` წაშალე. თუ ტესტს დასჭირდება, `withMixOverride` + `MixOverride` გადაიტანე `lib/arrangement/mix-draft-store.ts`-ში.
3. **`ArrangementContext.tsx:2436-2450` + `2407-2422`**: ყოველ pointermove-ზე arrangement ორჯერ კოპირდება: ჯერ `setTrackMix` preview-ში, მერე `withMixOverride` `writeLiveMixGains`-ში. ერთი track-ის drag-ზეც `setTrackGain` ყველა track-ზე იწერება, O(tracks) ჯერ თითო move-ზე. render-ის ბიუჯეტზე ეს გავლენას არ ახდენს, მაგრამ main thread-ს 6×-ზე ტვირთავს. Fix (low): track-ის კატეგორიაზე ჩაწერე მხოლოდ `target.id`, group-ზე კი მისი წევრები, ხოლო უკვე გამოთვლილი `previewed` arrangement ხელახლა გამოიყენე.
4. **`ArrangementContext.tsx:2526-2531` / `2886-2891`**: commit-ს თეორიულად ორი `applyEdit` შეუძლია ზედიზედ: ჯერ `before`, მერე `override`, ანუ undo-ს ორი ჩანაწერი. დღეს ეს მიუღწეველია: `begin*Gesture` ჯერ pending-ს ასუფთავებს, ხოლო gesture-ის გარეთ preview უარყოფილია. Fix (optional): `before && override` შემთხვევაში dev invariant, ან ერთ `applyEdit`-ად გაერთიანება `before ?? present`-დან.
5. **ბრაუზერში მოვლენების რიგი (გადამოწმდა, რეგრესია არ არის)**: commit-ისას `takeMixOverride()`-ის draft clear (`useSyncExternalStore`) და history-ს `setState` ერთ discrete flush-ში ხვდება, რადგან `window.event`-ის ტიპია `pointerup`, `pointercancel` ან `blur`. ამიტომ ძველი მნიშვნელობა ერთი frame-ითაც არ ჩანს. controlled range input-ის native `input` event-ზე React restore-მდე sync lane-ს ასრულებს, ამიტომ thumb არ ხტება. Watch item: draft-ის ნებისმიერ მომავალ clear-ს event-ის გარეთ (timer, rAF, promise) ერთი frame-ით ძველი მნიშვნელობის „ხტომა“ მოჰყვება. ეს perf smoke-ში დაამატე, თუ ასეთი path გაჩნდება.
6. **Listener/timer leak**: შენახული listener არ რჩება. mix-draft-store-ის `subscribe` ცარიელ Set-ს შლის, ხოლო provider-ის unmount override-ს და pan draft-ს ასუფთავებს (`3600-3612`). FP11 ამას window listener-ის დონეზე ამოწმებს.
7. **A11y**: `aria-valuetext` ახლა drag-ის დროს draft-ს მიჰყვება, ეს გაუმჯობესებაა. pan-ის reset ღილაკი drag-ის დროს `disabled={storedPan === 0}` რჩება, ტექსტი კი draft-ს აჩვენებს. ეს ძველი ქცევაა და უცვლელია.
8. **Tailwind/TS**: კლასები უცვლელად გადავიდა, ახალი ფერი ან custom CSS არ დამატებულა. `any`, `@ts-ignore` და type assertion არ არის. Omit-ის წყალობით `{...props}` ვერ გადაფარავს `value`/`style`/`title`/`aria-valuetext`-ს.

### Good Practices Found
- თითო key-ზე ცალკე store და `useSyncExternalStore` ნიშნავს, რომ move-ზე მხოლოდ leaf ხელახლა რენდერდება. `ArrangementLane`, `GroupHeader`, `Master` და `StudioWorkspace`-ის re-render-ს FP1, FP6 და FP10 ასერტავს (`parentRenders() === 0`).
- startGraph (`903`), resync (`1129`) და loop wrap override-ს ითვალისწინებენ (FP7, FP8). ამიტომ drag-ის დროს გრაფის ხელახლა აწყობა შენახულ მნიშვნელობას არ აღადგენს.
- cancel, blur და claim-steal live gain-ს და display-ს აღადგენს, undo-ში ჩანაწერი არ იწერება (FP3, FP4, FP5, FP14a–c). FP12 ამოწმებს, რომ pointer-ით commit და pending-ით commit dB-ის ყველა ბიჯზე ერთსა და იმავე მნიშვნელობას იძლევა.
- clip gain-ის budget-ის სტრიქონები სწორად დარჩა `record`-ზე (PERF-FADER-b).

### Architecture note
- **სიგნალი 2 + 4: `ArrangementContext.tsx:682` (`mixOverrideRef`) პარალელურად `panOverrideRef`-თან (`:681`), და `ArrangementLane.tsx:145`, სადაც `panDraft` state Lane-იდან context-ის store-ში გადავიდა.** ახლა context-ს gesture-ის preview-სთვის ორი ცალკე override ref აქვს და draft clear რვა ადგილიდანაა გამოძახებული.
  - keep: ერთი lifecycle (`begin/preview/commit/revert`) და აუდიოს timing უკვე ტესტებითაა დაცული. გაერთიანება ახლა მხოლოდ რისკია.
  - proposal planner-ისთვის (ცალკე დავალება, არა ამ რაუნდში): pan გადაიყვანე `MixOverride` union-ზე (`kind: 'pan'`) და draft clear ერთ helper-ში მოაქციე. მიღების კრიტერიუმები: FP1–FP14 და gesture-guard მწვანეა, `useArrangement()`-ის ფორმა უცვლელია, perf-ის assert-ები უცვლელია. ღირებულება: low–medium.
- ეს diff-ის review-ა. `ArrangementContext` სრულად არ შემოწმებულა.

### Alternative Approach (კრიტიკული ლოგიკა: Studio audio pipeline)
- **Current:** drag-ის დროს history არ იცვლება. override ref-ში ინახება, AudioParam-ზე პირდაპირ იწერება, draft კი leaf store-ში; history-ში ერთი entry pointerup-ზე იწერება.
- **Alternative:** `useTransition` ან `startTransition` history-ს ყოველი move-ის განახლებაზე, plus `React.memo` parent-ებზე.
- **Verdict:** მიმდინარე მიდგომა უკეთესია. transition მაინც მთელ ხეს არენდერებს, უბრალოდ ნაკლები პრიორიტეტით. `<= 3` component-ის assert ასე ვერ შესრულდება, ხოლო history-ს ყოველ move-ზე შეცვლა undo-ს ატომურობას აფერხებს. ref + leaf store-ით ორივე პრობლემა ქრება და `useArrangement()`-ის ფორმა უცვლელი რჩება.

### Score: 9/10