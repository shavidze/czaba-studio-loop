COMMIT: OK (არაფერი ბლოკავს: auth, purchase და download კოდს ეს ცვლილება არ ეხება; TypeScript strict-ის წესი არ ირღვევა; window listener-ები და store subscription-ები სწორად იხსნება; Undo ატომური რჩება)

## Code Review: Clip Gain pointer preview (PERF-FADER-b, round 211)

წინასწარ წავიკითხე `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` და `architecture-checkpoint.md`. ეს diff-ის review-ა; მოდულები სრულად არ შემიმოწმებია. ბრაუზერში ხელით არაფერი გამიშვია. მოვლენების თანმიმდევრობაზე ქვემოთ დაწერილი კოდის წაკითხვით დავადგინე.

### Critical Issues
- არცერთი.

### Suggestions (რიგით, ყველაზე მნიშვნელოვანი პირველია)

1. **Medium: `app/components/arrangement/ArrangementDetailPanel.tsx:313-324, 364`.** `draftedClipGains` render-ის დროს იძახებს `getArrangement()`-ს, ანუ render-ში mutable ref-ს (`historyRef.current.present`) კითხულობს. ახლა ეს მუშაობს, რადგან gesture-ის შუაში history არ იცვლება. თუმცა:
   - render სუფთა აღარ არის;
   - prop optional-ია, და `getArrangement === undefined`-ზე draft-ის არმქონე clip-ები `0 dB`-ად ჩაითვლება. MG11-ის სცენარში (მონიშვნა drag-ის შუაში იცვლება) range-ის ტექსტი არასწორი იქნება.

   **Fix:** parent-მა ჩვენებული clip-ების შენახული gain-ები prop-ად გადასცეს (მაგ. `storedGains: readonly number[]`, ან `clipIds`-ის მიხედვით დალაგებული `ReadonlyMap`). მერე ეს block-ის prop-ებიდან ამოიღე: `getArrangement` ↔ `storedGains`.

2. **Low: `app/contexts/ArrangementContext.tsx:3158-3166`.** თუ `before` და `pointerOverride` ერთად არსებობს, ორი `applyEdit` გაეშვება და Undo-ში ორი entry ჩაიწერება. ახლა ეს ვერ ხდება, რადგან `beginClipGainGesture` (3228) ჯერ `flushPendingClipGain()`-ს იძახებს. მაგრამ ამ invariant-ს მხოლოდ თანმიმდევრობა იცავს და კოდში ის არსად მოწმდება.

   **Fix:** განშტოება ცალსახა გახადე: `if (pointerOverride) { … } else if (before) { … }`.

3. **Low: `ArrangementContext.tsx:2990`.** `10 ** (gainDb / 20)` იმეორებს `clipLinearGain`-ის ფორმულას (`model.ts:523`), revert-ის გზა (3057) კი `clipLinearGain`-ს იყენებს. თუ ფორმულა ოდესმე შეიცვლება (curve, mute), preview და revert სხვადასხვა მნიშვნელობას გამოთვლიან.

   **Fix:** `model.ts`-ში შექმენი `dbToLinearGain(db)` და ორივე ადგილას ის გამოიყენე.

4. **Low: `perf/studio-lab.perf.spec.ts:selectClipGainMembers`.** `page.waitForTimeout(2000)` ფიქსირებული ლოდინია: 6×-ზე ან ნელ CI-ზე შეიძლება არ იყოს საკმარისი, სწრაფ მანქანაზე კი დროს ფლანგავს.

   **Fix:** დაელოდე კონკრეტულ პირობას, მაგ. დამატებული clip-ის `arrangement-clip-waveform`-ის გამოჩენას, `toHaveCount(2)`-ის შემდეგ. `verify`-ში ეს ფაილი არ შედის, ამიტომ commit-ს არ ბლოკავს.

5. **Low: `ArrangementDetailPanel.tsx:278-308` (`parseClipGainIdsKey`).** stable deps-ისთვის `JSON.stringify` → `JSON.parse` round-trip ცოტა უცნაურია, თუმცა სწორად მუშაობს: array-ის გარდა სხვა მნიშვნელობაზე `[]`-ს აბრუნებს, type assertion არ აქვს და ღირებულება უმნიშვნელოა. დატოვება მისაღებია. უფრო მარტივი გამოსავალია `join('\u0000')` / `split`.

6. **Low: `docs/implementation/2026/quarter-IV/166-clip-gain-pointer-preview.md:4`.** სტატუსი ისევ „In Progress (C round 211 check pending)“-ია, თუმცა C-მ round 211 უკვე PASS-ით შეამოწმა. 165-ის მსგავსად შემდეგ რაუნდშიც შეიძლება განახლდეს, მაგრამ commit-მდე სჯობს `Completed (C round 211 PASS)`.

7. **Info, ქცევა.** gesture-ის შუაში `getArrangement()`, export და status შენახულ მნიშვნელობას კითხულობენ, ეკრანი და audio კი dragged მნიშვნელობას აჩვენებენ. ეს D-29z189 item 5-ში დოკუმენტირებული და მიღებულია. რეგრესიად არ ვთვლი.

### ბრაუზერის რისკები (ტესტები ამას ვერ ხედავენ)
- **მოვლენების თანმიმდევრობა.** window capture-ის `pointerup` (3204) ყველაზე ადრე ეშვება და commit-ს აკეთებს. მის შემდეგ მოსული `lostpointercapture` → `commitClipGainPending`-ში `gesture === null`-ია და `before === null`, ამიტომ არაფერს აკეთებს. ორმაგი entry არ ჩნდება.
- **Release-ისას ძველი მნიშვნელობა არ ციმციმებს.** draft-ების `clear` (`takeMixOverride`) და `applyEdit` ერთ task-ში ხდება, React მათ ერთ commit-ში აერთიანებს და ძველი მნიშვნელობა ერთი frame-ითაც არ ჩანს. ამას perf-ის `release-commits` (1 ან 2, ორივე paint-მდე) ადასტურებს.
- **Leak-ები.** `release`/`detach` (3214-3234) ორივე window listener-ს ხსნის, მათ შორის stolen claim-ზე. per-key `useSyncExternalStore` subscription-ები cleanup-ში იხსნება. unmount-ზე draft-ები `mixOverrideDraftKeys`-ით იშლება (3693).
- **Restart გესტის შუაში.** `startGraph` (`clipLinearGains(mixed)`) და `syncPlayback`-ის setter loop (`mixed.clips`) override-ს იყენებენ, ამიტომ Space და loop wrap dragged მნიშვნელობას არ კარგავენ.
- **Render-ის ღირებულება.** თითო move-ზე იხატება 3 leaf (perf-ის assert-ით). ყოველი lane clip ახლა ერთ store key-ს გამოიწერს, რაც იაფია, რადგან listener-ები key-ების მიხედვით ინახება.
- **Accessibility.** `aria-valuetext` drag-ის დროს ცოცხლად განახლდება. ველი draft-ს აჩვენებს, ხოლო pending-ის `aria-describedby` draft-ის დროს ჩართული არ არის (`isPending` false-ია). ARIA რეგრესია არ ვნახე.
- **Tailwind / tokens.** კლასები სიტყვასიტყვით არის გადმოტანილი, ახალი hardcoded ფერი ან custom CSS არ არის.

### Good Practices Found
- PERF-FADER-a-ს pattern-ი (override + draft store + leaf subscription) აქ თანმიმდევრულად გავრცელდა. `withMixOverride` აღარ არის export-ი და clip-gain-ის commit-ი pending გზის შედეგის იდენტურია (`applyClipGainTargets`).
- Trap 1 გათვალისწინებულია: საწყის მნიშვნელობაზე დაბრუნებისას draft იწერება, ამიტომ ეკრანზე ძველი draft არ რჩება.
- Cancel-ზე live graph-ში მხოლოდ შეცვლილი clip-ების gain ბრუნდება (3054-3059).
- `ArrangementPeakPath`-ის detail-ის scale (`clipWaveformScale(clip, false, 1)`) უდრის ძველ `clipLinearGain(clip)`-ს, ვიზუალური drift არ არის.
- Import cycle-ის თავიდან აცილება დოკუმენტირებულია (166, „ორივე leaf granted ფაილშია“).
- perf-ის 12 სტრიქონი `assert`-ზე გადავიდა და ციფრებით დადასტურდა: `move-components-max` 95-დან 3-მდე ჩამოვიდა.

### Architecture note
- **სიგნალი 4 (ახალი state/lifecycle არსებულ owner-ში): `ArrangementContext.tsx:2979-3180`.** Clip Gain-ს ახლა ორი პარალელური machine აქვს: pending (`clipGainBeforeRef` / `MemberKeyRef` / `MemberIdsRef`) და pointer (`mixOverrideRef` `clip-gain`). ორივეს ერთი `commitClipGainPending` ამთავრებს, და ის invariant, რომ ორივე ერთად არ არსებობს, თანმიმდევრობით არის დაცული (Suggestion 2). ამავე რეგიონს რამდენიმე რაუნდი ზედიზედ ცვლის (210, 211). ეს სიგნალი 3-ცაა.
  → **proposal planner-ისთვის** (B-ის მიერ უკვე მოთხოვნილ frontend-architect-ის checkpoint-თან ერთად): Clip Gain-ის gesture-ის ლოგიკა გადავიდეს `lib/arrangement/clip-gain-gesture.ts`-ში სუფთა ფუნქციებად `preview` / `commit` / `cancel`, რომლებიც `(present, override) → { next, drafts, liveGains }`-ს აბრუნებენ. ref-ები, `handle` და timing context-ში რჩება. მიღების კრიტერიუმები: CP1–CP14, CF / MG / WG / WZ ტესტები და perf-ის assert-ები უცვლელად გადის; `useArrangement()`-ის ფორმა არ იცვლება. ღირებულება: medium, რისკი: medium, რადგან gesture-ის lifecycle-ს ეხება.
- **სიგნალი 2 (coupling): `ArrangementDetailPanel.tsx:245-275`.** `ArrangementDetailClipGain` 30 prop-ს იღებს. ეს prop-ების plumbing-ია, მაგრამ DXL8/SFR4 repo-scan ტესტები block-ს ამ ფაილში ეძებენ.
  → **keep:** ერთი lifecycle-ია და ახლა ზიანი არ ჩანს. ხელახლა განიხილეთ მხოლოდ მაშინ, თუ checkpoint ზემოთ აღწერილ extraction-ს დაამტკიცებს.

### Alternative Approach (Studio audio pipeline)
- **Current:** pointer move-ზე იწერება override და per-clip draft (`useSyncExternalStore` leaf-ები), live `setClipGain` ხდება მხოლოდ playing-ის დროს, release-ზე კი ერთი `applyEdit`.
- **Alternative:** waveform-ის `d` ატრიბუტის imperative ჩაწერა ref-ით, rAF coalescing-ით, draft store-ის გარეშე.
- **Verdict:** მიმდინარე მიდგომა უკეთესია. render-ების რაოდენობა დეტერმინისტულია და 1×/6×-ზე assert-ით მოწმდება, parent-ის re-render drawing-ს ვერ დააბრუნებს, და Undo ატომური რჩება. ალტერნატივა wall-clock-ს ოდნავ შეამცირებდა, მაგრამ assert-ის ფორმას დაარღვევდა. single Clip Gain-ის playing p95 ≈ 60 ms ახლაც React commit-ის გარეთაა (166-ში ჰიპოთეზაა, რომ მიზეზი paint-ია). ჯერ ეს უნდა გაიზომოს, მიდგომის შეცვლა კი არ ღირს.

### Score: 8.5/10