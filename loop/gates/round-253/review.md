COMMIT: OK

## Code Review: round-253 candidate (SABA-B-10a stage 2b + fix-up)

Nothing here blocks the commit. The diff doesn't touch auth, purchase or download code, and it adds no listeners or timers. There are no new `any`, ts-ignore or type assertions, and no styles or Tailwind classes changed. `untracked.txt` is empty. The verify log shows 215 test files / 3143 tests passing and both builds succeeding.

**რა წავიკითხე:**
- მთლიანი `diff.patch`.
- `StudioWorkspace.tsx`: ხაზები 640–655, 1250–1490 და 1825–1985.
- `ArrangementContext.tsx`: `setInsertMarker`, `placeInsertMarker`, `getLocatorPosition` და `playFrom`.
- `ArrangementMarkerRow.tsx`: ხაზები 144–330.

ეს მხოლოდ diff-ის review-ა; მოდული მთლიანად არ შემიმოწმებია.

**ორი ცალკე შემოწმება:**
- `workspaceRef.current = workspace` render-ის დროს ენიჭება (`StudioWorkspace.tsx:642`). ამიტომ Stop effect-ი (`:1917`) კითხულობს იმ render-ის `status`-ს, რომელშიც `isPlaying` გახდა `false`.
- `stepMarker` keyboard-იდან `useImperativeHandle` ref-ით გამოიძახება (`ArrangementMarkerRow.tsx:328`, `StudioWorkspace.tsx:2395`), ამიტომ ძველი (stale) callback არ ჩაირჩება.

### Critical Issues
- არცერთი.

### Suggestions (რანჟირებული)
1. **Low — `StudioWorkspace.tsx:1424-1439`.** როცა Follow უკვე `paused`-ია (scroll-ით) და playback-ის დროს ruler-ზე დააწკაპუნებ, `pausing` false-ია. მაშინ ხაზზე რჩება მხოლოდ `setInsertMarker`-ის ჩვეულებრივი ტექსტი: `… playback continues. Stop, then …`. ღილაკი კი `Follow ‖`-ს აჩვენებს. ტექსტი Follow-ის მდგომარეობას არ ასახელებს.
   - **Fix:** ტექსტი აირჩიე `followModeRef.current !== 'off' && current.isPlaying`-ით, მაგრამ `setFollowMode('paused')` დატოვე მხოლოდ `=== 'on'`-ზე. Stop-ის guard ორივე ტექსტს უკვე ფარავს, ასე რომ რეგრესიის რისკი არ არის.
   - **ტესტი:** FW3-ის ვარიანტი: scroll-ით pause, შემდეგ lower-zone click, შემდეგ ტექსტის შემოწმება.
2. **Low — `ArrangementMarkerRow.tsx:276`.** "none" ტექსტი context-ის `isPlaying` state-ზე ირჩევა, საწყისი წერტილი კი `isPlayingRef`-ზე (`getLocatorPosition`-ის შიგნით). ერთი commit-ის ფანჯარაში მათ შორის განსხვავება თეორიულად შესაძლებელია: play იწყება, render ჯერ არ მომხდარა და იმავე frame-ში Ctrl+→ დაეჭირა. თუ ასე მოხდა, ტექსტი იტყვის "insert marker", ნავიგაცია კი live position-იდან დაითვლება.
   - **Fix (არასავალდებულო):** context-მა გაიტანოს `isPlayingNow()` ref-reader და ორივე გადაწყვეტილება მასზე დაეყრდნოს. სხვაგვარად დატოვე, როგორც არის.
3. **Low — `StudioWorkspace.tsx:1427` და `:1412` ↔ context `setInsertMarker` (`ArrangementContext.tsx:1463`).** `pausing`/`resuming` React state-ის `current.isPlaying`-ს კითხულობს, `setInsertMarker` კი `isPlayingRef`-ს. იგივე ერთ-render-იანი ფანჯარაა: play-ის დაწყებისთანავე ruler click-ზე შეიძლება ჩაიწეროს `insertMarkerWhilePlaying` ისე, რომ Follow არ შეჩერდეს. ეს რეალურად ვერ შემოწმდა; შეიძლება Playwright probe-ში დაემატოს: Space და მაშინვე click.
4. **Low (docs) — `191-saba-b-10a-insert-marker.md`, TODO.** ხაზი "Stop-ის შემდეგ status: … B-ის გადასაწყვეტი" ახლა ეწინააღმდეგება მის შემდეგ მოსულ "Round 253: … დაიხურა"-ს. ძველი ხაზი წაშალე ან მონიშნე როგორც ისტორიული.
5. **Info — `bars-ruler-ui.test.tsx`.** FW7 FW10-ის შემდეგ დგას. ეს მხოლოდ რიგის საკითხია, ქცევა არ იცვლება.
6. **უკვე ჩაწერილია, ახლად არ ვაყენებ:**
   - playback-ის დროს marker-ის გადაადგილება status-ის გარეშე (Ctrl+→) guard-ს არ ემთხვევა.
   - თუ marker project end-ზე ან მის იქითაა, "Space plays from the insert marker" არაზუსტია.
   - ორივე doc-ის residual-ებშია.

**ის, რასაც ტესტები ვერ იჭერს, მაგრამ შემოწმდა:**
- **Event ordering:** ruler-ის ორი status write ერთ handler-შია. React 18-ის automatic batching (hydrateRoot) native handler-შიც ერთ commit-ს აკეთებს, ამიტომ aria-live region ერთ ტექსტს იღებს. FW1 ამას MutationObserver-ით ამოწმებს.
- **Effect mount:** `isPlaying=false` effect-ი mount-ზეც ეშვება, მაგრამ ცარიელი ან სხვა status guard-ს არ ემთხვევა, ამიტომ ჩაწერა არ ხდება.
- **Render cost:**
  - `barsRulerGestures` memo-ს deps სტაბილურია (`placeInsertMarkerFromRuler` → `setInsertMarker` და `setFollowMode`).
  - `stepMarker` ახლა play/stop-ზე ხელახლა იქმნება `isPlaying` dep-ის გამო. ეს ხელახლა ქმნის imperative handle-ს და marker-ის prev/next ღილაკების inline handler-ებს. ხარჯი უმნიშვნელოა.
- **Accessibility:** `aria-keyshortcuts` და title-ები უცვლელია, გარდა copy-ისა. ახალი title-ები ("click = insert marker") ქცევას ახლა სწორად აღწერს.
- **TS strict, semicolons, Tailwind:** შესაბამისობაშია; className არ შეცვლილა.

### Good Practices Found
- Stop-ის guard ზუსტი ტექსტით ადარებს და prefix-ს არ იყენებს. სხვა status-ები (`followResumed`, tempo, edit) ხელუხლებელი რჩება, რასაც FW10 `statusSequence`-ით ამტკიცებს.
- `autoScrollLeftRef` resume-მდე ახლდება (`:1414`), ამიტომ შემდეგი Follow-ის scroll ხელით scroll-ად არ ჩაითვლება. ეს mutant-ით არის დაფარული (MU-FW-NO-AUTOSCROLL-RESET).
- `setInsertMarker`-ის side effect-ები შეცვლის გარეშე დარჩა: წესი call site-ში ცხოვრობს, context-ში არა. lane/clip click-ის ქცევა არ შეცვლილა (FW7).
- Copy მთლიანად `strings.ts`-შია და ST-ის ზუსტი key-ების ტესტებით არის დაცული. IM22-ის ცარიელი assertion გამოსწორდა.

### Architecture note
- **სიგნალი 2 (coupling) + 4 (ახალი lifecycle არსებულ owner-ში): `StudioWorkspace.tsx:1917-1930`.** Stop effect-ი context-ის ავტორობის სამ ტექსტს თავიდან აწყობს და `current.status`-ს მათთან string-ით ადარებს. ანუ status ხაზი state-ად გამოიყენება. ამასთან, Follow-ის pause/resume ახლა StudioWorkspace-ის ოთხ ადგილზე ცხოვრობს: scroll (`:1887`), ruler (`:1430`), strip (`:1418`) და stop (`:1920`).
  - **Keep, რადგან:** ცვლილება ლოკალურია და MU-STOP-* mutant-ებით არის დაფარული. Extraction შეეხება `followModeRef`-ს, `autoScrollLeftRef`-ს და scroll refs-ს, ანუ timing და gesture-ის invariants-ს. ახლა ეს ზიანს არ აყენებს. ღირებულება: low–medium.
  - **Proposal planner-ისთვის** (არსებულ ARCH-CHECKPOINT-TRANSPORT-POSITIONS-ში ჩასართავად): context-მა `setStatus`-ს მისცეს scope (`playing` vs `sticky`), რომ stop-მა playing-scoped ტექსტი string-ის შედარების გარეშე ჩაანაცვლოს. მიღების კრიტერიუმი: FW6, FW8, FW9 და FW10 უცვლელად მწვანეა და `useArrangement()`-ის საჯარო ფორმა უცვლელია. ეს წინადადებაა და დამტკიცებული scope არ არის.

### Alternative Approach (Studio transport — კრიტიკული ლოგიკა)
- **Current:** Stop-ზე status-ის ზუსტი შედარება სამ playing-only ტექსტთან და მისი პირობითი ჩანაცვლება `insertMarkerAfterStop`-ით.
- **Alternative:** status-ს ჰქონდეს lifetime-ის tag-ი (`expiresOnStop`), რომელსაც context-ში ჩაწერის ადგილი სვამს. Stop მხოლოდ tag-ით მონიშნულ ტექსტს ცვლის.
- **Verdict:** ამ რაუნდისთვის მიმდინარე მიდგომა უკეთესია. ის `useArrangement()`-ის ფორმას არ ცვლის, frozen-თან ახლოს მდგომ context-ს არ ეხება და ტესტებით ზუსტად არის დაცული. მისი სისუსტე ისაა, რომ string-ის შედარება მყიფეა marker-ის გადაადგილებისას (უკვე ჩაწერილი residual). Tag-ზე დაფუძნებული ალტერნატივა ამას ხურავს, მაგრამ ის architecture checkpoint-ის დავალებაა და round-253-ის fix არ არის.

### Score: 8/10