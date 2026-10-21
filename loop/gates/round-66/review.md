COMMIT: OK

## Code Review: SRW-15 ეტაპი 2 — მეტრონომი (round-66, HEAD 3e55c5c)

კომიტი შეიძლება. ბლოკერი არ ვიპოვე. Auth, purchase ან download კოდს ცვლილება არ ეხება: შეცვლილია მხოლოდ `arrangement/*`, `ArrangementContext`, `graph.client` და doc 059. Verify ჩავარდნის გარეშე დასრულდა: 93/93 test file, `tsc` შეცდომა არ არის, build ორივე ეტაპზე დასრულდა. Lint-ის 218 warning ძველი ფაილებიდანაა და ამ diff-ს არ ეკუთვნის.

### Critical Issues
- არ არის.

### Suggestions (რანჟირებული)

1. **Medium (perf, ტესტით არ ჩანს) — ArrangementContext.tsx:753-763 + graph.client.ts:168-184.** Loop-ის გარეშე `startGraph` კლიკებს პროექტის ბოლომდე ერთბაშად გეგმავს (`from → projectEnd`), თითო კლიკზე ერთი `AudioBufferSourceNode`-ით. 10 წუთიან პროექტზე 120 BPM-ით ეს 1200 node-ია, და ეს ყველაფერი თავიდან იქმნება ყოველ resync-ზე: Play, seek, schedule-key ცვლილება, მეტრონომის ან ტემპის ცვლილება.
   - Scrub-ის დროს graph ყოველ 100 ms-ში თავიდან იგეგმება (`SCRUB_RESCHEDULE_INTERVAL = 0.1`), ხოლო retired graph-ები 250 ms ცოცხლობს (`RETIRED_GRAPH_GRACE = 0.25`). ასე რომ, scrub-ისას ერთდროულად ~3 graph არსებობს, თითოეულში ~N click source, და წამში ~10×N node იქმნება. Loop-ის გზა კი უკვე horizon-ით ივსება (`appendClicks`). ეს ასიმეტრიაა.
   - **გამოსწორება:** loop-ის გარეშეც დაგეგმე კლიკები შეზღუდულ ფანჯარაში (`from → min(end, from + LOOP_SCHEDULE_HORIZON)`). დანარჩენი `pumpPlaybackAudio`-დან `appendClicks`-ით მიაბი, `nextClickFrom` ref-ის გამოყენებით. ცალკე დავალებაა, ამ რაუნდის ბლოკერი არ არის.

2. **Low (UX, შეგნებული გადაწყვეტილება) — graph.client.ts:165.** `metronomeGain → master`-ის გამო კლიკი master tap-შიც ხვდება. Accent-ის peak 0.5-ია (−6 dBFS) და ხმამაღალ mix-ზე Master Peak/over latch-ს რთავს, მაშინ როცა export-ში ის არ იქნება. Doc 059-ის §6 ამას შეგნებულად აღწერს, ამიტომ finding-ად არ ვთვლი. მაგრამ meter, რომელიც export-ზე მეტყველებს, ფაქტობრივად შეცდომაში შეჰყავს მომხმარებელი. **წინადადება:** მომდევნო ეტაპზე metronome გაატარე ცალკე post-master gain-ით პირდაპირ `destination`-ზე. ის `setMasterGain`-ის მნიშვნელობას უნდა მიჰყვებოდეს და tap-ში არ უნდა ხვდებოდეს. ან title-ში მიაწერე „master meter კლიკსაც აჩვენებს“.

3. **Low (a11y) — ArrangementTempoRow.tsx:167-180.** `h-4` (16 px) WCAG 2.5.8-ის 24 px მინიმუმზე ნაკლებია. ამასთან disabled ღილაკის `title` („ჯერ მიუთითე BPM“) keyboard და screen-reader მომხმარებლებს არ მიუვა. **გამოსწორება:** სიმაღლე იმავე რიგის BPM input-ს გაუთანაბრე. Disabled-ის მიზეზი `aria-describedby`-ით ან `sr-only` ტექსტით გადაეცი.

4. **Nit — StudioWorkspace.tsx:851-858.** `toggleMetronome` deps-ში `metronomeOn` აქვს, ამიტომ ყოველ toggle-ზე callback-ის identity იცვლება და `ArrangementTempoRow` re-render-დება. ეს toggle-ზე ხდება და არა playback frame-ზე, ამიტომ პრაქტიკული ღირებულება უმნიშვნელოა. Functional `setMetronomeOn(prev => …)` ამას მოაგვარებს, მაგრამ status-ის გამოთვლა მაშინ effect-ში უნდა გადავიდეს. ასე დატოვება სჯობს.

### რეალური ბრაუზერის event-ების რიგი და leak-ები (შემოწმდა)
- **Resync handoff:** ძველი graph-ის კლიკები `stop(startAt)`-ით წყდება, ახალი `startAt`-დან იწყება და დუბლი არ ჩნდება. M4 (EPS clamp) boundary-ზე დარტყმის დაკარგვას გამორიცხავს.
- **Leak-ები:** `onended` closure მხოლოდ state flag-ს ცვლის. `disconnect()` ყველა click source-სა და `metronomeGain`-ს წყვეტს. Loop-ში დასრულებული კლიკები `appendClicks`-ზე იწმინდება. Unmount-ზე buffer cache `ctx.close()`-თან ერთად იშლება. ახალი timer ან listener არ დამატებულა.
- **Lifecycle:** `setMetronomeBpm` idempotent-ია (`bpm === ref`). ამიტომ mount-ის effect (`null`) resync-ს არ იწვევს. `StudioWorkspace` და provider ერთ route-ში ერთად იქმნება და ქრება, ამიტომ unmount-ზე „ჩარჩენილი“ მეტრონომი არ დარჩება.
- **Loop:** iteration 0 მუშავდება `from → loop.end` ფანჯარაში, დანარჩენი `loop.start → loop.end`-ში. დარტყმის დრო absolute grid-იდან ითვლება, ამიტომ ტაქტების ხაზს ემთხვევა.

### Good Practices Found
- დარტყმის დრო ინდექსიდან ითვლება (`k·60/bpm`) და დრეიფი არ გროვდება. M2 ამას ზუსტი ტოლობით ამოწმებს.
- Export იზოლირებულია (UI9). History-ში და მოდელში მეტრონომი არ ხვდება (UI8).
- გრაფის მარშრუტი ცალსახად ტესტით არის დაცული (M9, M11): მეტრონომის გარეშე node-ების რაოდენობა უცვლელია.
- Tokens: `outline`, `muted`, `foreground`, `brand`, `accent` ყველა `app.css`-ში არსებობს, hardcoded ფერი არ არის. `aria-pressed`, `type="button"` და Space-ის ქცევა (UI10) სწორია.
- TS strict: `any`, `@ts-ignore` და type assertion არ არის. `MetronomeClick` type-only import-ითაა.

### Architecture note
- **სიგნალი 4 (ახალი state/lifecycle არსებულ owner-ში): ArrangementContext.tsx:131-132, 722-737, 958-970.** Provider-ს ემატება `metronomeBpmRef`, buffer cache და resync trigger.
  → **keep:** ერთ playback lifecycle-ს ეკუთვნის (startGraph, fillLoopIterations, unmount close). გატანა refs-ისა და handoff timing-ის invariant-ებს გაყოფდა. გადაწყვეტილების ღირებულება low-ია.
- **სიგნალი 1 (შერეული პასუხისმგებლობა): ArrangementContext.tsx:725-735.** DSP buffer-ის შექმნა (`generate…Samples` + `new AudioBuffer`) inline-ადაა provider-ში.
  → **proposal planner-ისთვის (არა ამ რაუნდისთვის):** გადაიტანე `createMetronomeBuffers(ctx)` `metronome.ts`-ში ან `graph.client.ts`-ში, ქცევის ცვლილების გარეშე. სამიზნე ტესტებია UI1–UI10 და M1–M11. ამავე დავალებაში შეიძლება შევიდეს Suggestion #1 (loop-ის გარეშე horizon-based click refill). მიღების კრიტერიუმი: scrub-ის დროს ცოცხალი click node-ების რაოდენობა O(horizon·bpm) უნდა იყოს და არა O(projectEnd·bpm).
- ეს review მხოლოდ ამ diff-ს ეხება. მოდული სრულად არ შემომიწმებია.

### Alternative Approach (Studio audio pipeline)
- **Current:** წინასწარ დაგეგმილი `AudioBufferSourceNode`-ები ორი cache-ირებული click buffer-ით, routing master-ში. Loop ივსება horizon-ით, loop-ის გარეშე კი პროექტის ბოლომდე.
- **Alternative A:** ერთი lookahead scheduler (25 ms timer, 100 ms ფანჯარა; Chris Wilson-ის pattern). ის ყოველ pump-ზე მხოლოდ მომდევნო რამდენიმე კლიკს ქმნის, როგორც loop და non-loop რეჟიმში, ისე scrub-ის დროს.
- **Alternative B:** მეტრონომის რენდერი ერთ გრძელ `AudioBuffer`-ად (`OfflineAudioContext`). Node-ების რაოდენობა O(1)-ია, მაგრამ BPM-ის ყოველი ცვლილება და დიდი პროექტები ხელახალ რენდერს და მეხსიერებას ითხოვს.
- **Verdict:** მიმდინარე მიდგომა სწორია და იმ ჩვეულებრივ ზომებზე, რაც Studio Lab-ში გვაქვს, საკმარისია. ის უკვე იყენებს არსებულ handoff/stop/disconnect მექანიზმს და export-ის იზოლაციას. ჯობია ის ნაწილი, სადაც A და მიმდინარე მიდგომა ერთმანეთს ხვდება: არსებული `pumpPlaybackAudio` + `appendClicks` გამოიყენე loop-ის გარეშეც (Suggestion #1). ახალ timer-ს ეს არ მოითხოვს. B უარყოფილია BPM-ის ცვლილებისას ხელახალი რენდერის ღირებულების გამო.

### Score: 8.5/10