COMMIT: OK (blocker არ არის; ყველა finding არის Medium ან Low და ამ რაუნდის commit-ს არ აჩერებს)

## Code Review: Round 89 — Studio Lab export (progress store, WAV worker, lab MP3 encoder, footer/tab-stops)

ეს არის candidate commit-ის diff-ის review (`paths.txt`-ის 20 path, HEAD `971141d`). მოდული სრულად არ შემოწმებულა. წავიკითხე `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` და `architecture-checkpoint.md`. ERROR_TAXONOMY აქ არ ეხება საქმეს, რადგან backend-ის error code-ები არ შეცვლილა. **Auth, purchase და დაცული download არ შეხებულა.** ყველა path არის `components/arrangement`, `contexts/ArrangementContext`, `lib/arrangement/*` ან docs. ერთადერთი download არის ადგილობრივად შექმნილი blob, ზუსტად ისე, როგორც მანამდე.

### Critical Issues
- არცერთი.

### Suggestions (რიგით)
1. **Medium — `app/lib/arrangement/graph.client.ts:981-990` (`scheduleArrangementRenderProgress`).** ყოველი chain მთავრდება `.catch(() => undefined)`-ით. თუ `suspend()` წარმატებით დასრულდა, მაგრამ `ctx.resume()` უარყოფილია, offline render შეჩერებული რჩება. ამ დროს `startRendering()` არასდროს სრულდება, ღილაკი „დახურვა“ კი `disabled={isRendering}`-ის გამო გათიშულია. მომხმარებელი dialog-ში იჭედება.
   **Fix:** resume-ის promise-ები შეაგროვე და `startRendering()` გაუშვი `Promise.race`-ში მათ rejection-თან ერთად. ასე resume-ის შეცდომა `renderArrangementWav`-ს reject-ით დაასრულებს და error ტექსტი გამოჩნდება.
   Firefox-ზე `OfflineAudioContext.suspend` არ არსებობს. `typeof` guard ამას სწორად ამუშავებს, მაგრამ იქ render ფაზის progress არ ჩანს: bar პირდაპირ `render 100%` / `wav`-ზე ჩნდება. ეს მისაღებია, უბრალოდ ცოდნისთვის.
2. **Medium (მეხსიერება) — `graph.client.ts:1040` + `export-wav.ts:49-55`.** `slice()`-ით აღებული ასლი worker-ში გადაეცემა (transfer), worker კი clamp-ისთვის კიდევ ერთ `Float32Array`-ს ქმნის. მთავარ thread-ზე `rendered` AudioBuffer encode-ის ბოლომდე ცოცხალია. ამიტომ peak მეხსიერებაში ძველთან შედარებით ორარხიანი float-ის ერთი დამატებითი ასლია. 10 წუთიან პროექტზე ეს დაახლოებით 230 MB-ია.
   **Fix:** `encodeArrangementWav`-მა მისთვის გადაცემული (owned) buffer clamp-ოს ადგილზე, ახალი array-ის შექმნის გარეშე. ორივე caller ასლს გადასცემს. `export-wav.test` უნდა შემოწმდეს, ხომ არ ამოწმებს ის, რომ input არ იცვლება.
3. **Low — `app/lib/arrangement/export-wav.client.ts:27-57`.** worker-ს timeout არ აქვს, ხოლო buffer-ები `postMessage`-ისას sync-ად გადაეცემა. ამიტომ `onerror`-ის შემდეგ main-thread fallback შეუძლებელია. ეს `sfx-export.client.ts:19-47`-ის მიდგომას ემთხვევა და `onerror` სწორად მიდის error path-ზე, რომელიც Close-ს ხელახლა რთავს. რისკი მხოლოდ worker-ის „ჩუმი“ გაჩერებაა.
   **Fix (სურვილისამებრ):** watchdog timer, რომელიც `terminate()`-ს და reject-ს გამოიძახებს.
   იმავე ფაილში `fail()` worker-ის `{type:'error', message}` ტექსტს ყრის და მხოლოდ ზოგად შეტყობინებას აჩვენებს. ტექსტი ფრჩხილებში შეიძლება მიეწეროს.
4. **Low — `ArrangementExportDialog.tsx:178-180` (footer: `sticky bottom-0 -mx-8 … px-8`).** `-mx-8` პირდაპირ არის მიბმული `ModalBody`-ის `px-8`-ზე (`Modal.tsx:218`). `ModalBody`-ის `py-4`-ის გამო scroll-ის ბოლოს footer-ის ქვეშ 16px `bg-surface` ზოლი რჩება.
   **Fix:** `ModalBody`-ს მიეცი `className="space-y-4 pb-0"`, ან footer გადაიტანე `ModalBody`-ის გვერდით, `ModalFooter`-ის ფორმით. Tokens სწორია: `bg-surface`, `border-outline` და `accent-brand` ყველა იხსნება `app.css`-ში.
5. **Low — `ArrangementExportDialog.tsx:99-116` (focusin scroll).** ბრაუზერში event-ების რიგი ასეთია: focusin პირველი, native scroll-into-view შემდეგ. handler-ი overlap-ს native scroll-მდე ითვლის და `scrollTop`-ს თავად ასწორებს, ამიტომ შედეგი სწორია. native scroll შემდეგ no-op ხდება.
   მცირე UX ეფექტი: footer-ის ნაწილობრივ ქვეშ მოქცეულ ელემენტზე მაუსით დაწკაპუნებაც გადაახვევს content-ს. CSS `scroll-pb-*` ალტერნატივა არ ვარგა, რადგან footer-ის სიმაღლე დინამიკურია (message, progress, warning). ამიტომ JS აქ გამართლებულია.
6. **Low (a11y) — `ArrangementExportDialog.tsx:197-206`.** `<progress>`-ის ცვლილებები არ ცხადდება. ეს ჩაფიქრებულია და სწორიც არის: `aria-live` ყოველ პროცენტს გამოაცხადებდა, ხოლო `role="status"`-იანი message ფაზის ცვლილებას უკვე აცხადებს. სურვილისამებრ `aria-valuetext={formatArrangementExportProgress(progress)}` screen reader-ს label-ს წააკითხებს.
7. **Low — `StudioContext.tsx:25` (`~/utils/ffmpeg`) და `mp3-encoder.client.ts`.** ეს ახლა ორი დამოუკიდებელი FFmpeg singleton-ია. თუ ერთ session-ში ორივე feature გამოიყენება, wasm ორჯერ ჩაიტვირთება. მიმდინარე scope-ში ეს მისაღებია. PU5 შეგნებულად იცავს ამ იზოლაციას.

### Good Practices Found
- `useSyncExternalStore` + store-ის dedupe მთელ პროცენტებზე (`export-progress.ts:50-57`). progress-ის ცვლილება provider-ს და `useArrangement()` consumer-ებს ხელახლა არ არენდერებს (PU3 ამას ამტკიცებს). context value-ში store stable ref-ია.
- `finally { exportProgress.setProgress(null) }` ორივე export-ზე. ყველა error/timeout გზა progress-ს ასუფთავებს.
- MP3 load race: generation counter-ი და `resetArrangementMp3Encoder` გვიან მოსულ import-ს/load-ს სწორად აუქმებს. 120 s timer მოიცავს dynamic import-საც (PU4).
- `mp3-encoder.client.ts:79-83` core/wasm blob URL-ებს revoke-ს უკეთებს. ძველი `utils/ffmpeg.ts:38-41` მათ ტოვებდა (leak). `encode()` progress listener-ს `finally`-ში `off`-ით ხსნის და FS ფაილებს შლის.
- Listener-ები სწორადაა დაწყვილებული: `keydown`/`focusin` cleanup ხდება `isOpen`-ზე, worker კი ყოველ terminal გზაზე `terminate()`-ს იღებს.
- Radio group როგორც ერთი tab stop (`dialog-tab-stops.ts`) native ქცევას ემთხვევა. focus trap disabled ელემენტებს ფილტრავს (`ArrangementExportDialog.tsx:57`), ამიტომ checked-მაგრამ-disabled radio Tab-ს ვერ გააჩერებს.
- Worker build-ში ნამდვილად გამოდის (`verify.log:1352`, `export-wav.worker-*.js` 1.46 kB). `.client.ts` ფაილები SSR bundle-ში არ ხვდება.
- TS strict: ახალი `any`, `@ts-ignore` ან assertion არ არის. Semicolons და Tailwind-only დაცულია.

### Architecture note
- **სიგნალი 4 (ახალი state/lifecycle არსებულ owner-ში): `app/contexts/ArrangementContext.tsx:2688-2880`.** `exportMp3` ახლა დაახლოებით 150 ხაზია: timer + import-race + generation reset + progress store. **keep** ამ რაუნდში: ერთი lifecycle-ია `exportState`-თან, store stable-ია და `useArrangement()`-ის ფორმა მხოლოდ ფართოვდება.
  **proposal planner-ისთვის:** `exportWav`/`exportMp3`-ის orchestration გადაიტანოს `lib/arrangement/export-orchestration.ts`-ში. შემავალი: `{ getArrangement, buffers, videoSources, setExportState, progress }`. invariants: ზუსტი message string-ები (ტესტები მათ აფიქსირებს), 120 s timeout, hook-ის ფორმა, ტესტები export-mp3/export-progress-ui/export-range-ui ცვლილების გარეშე.
- **სიგნალი 3 (განმეორებითი ძვირი ცვლილება):** export რეგიონი შეიცვალა რაუნდებში 85, 86 და 89 (docs 076, 077). ყოველ ჯერზე საჭირო გახდა fake AudioContext და provider mock-ები. planner-ისთვის backlog-ში ერთხაზიანი სიგნალი.
- **სიგნალი 2 (ownership-ის ცვლილება): `graph.client.ts:76-77`.** `measureExportOverload` და `ExportOverloadReport` გადავიდა `export-wav.ts`-ში და `graph.client`-ში re-export shim დარჩა. **keep.** shim მოსაშორებელია, როცა importer-ები გადავლენ.

### Alternative Approach (Studio audio pipeline: WAV encode)
- **Current:** OfflineAudioContext render (suspend-ზე დაფუძნებული progress) → არხების ასლი → module Worker (clamp + 24-bit encode) → transfer back.
- **Alternative:** encode დარჩეს main thread-ზე, ციკლი დაიყოს chunk-ებად `await`/`setTimeout` yield-ებით, progress იმავე callback-ით.
- **Verdict:** მიმდინარე მიდგომა უკეთესია. UI მთლიანად თავისუფალია, worker-ის pattern უკვე გამოცდილია (`sfx-export.client.ts`), ხოლო transfer-ის ღირებულება ერთი ასლია, რომლის მოხსნაც in-place clamp-ით შეიძლება (Suggestion 2). Chunked main-thread ვარიანტი უფრო მარტივი იქნებოდა და worker-ის „ჩუმი“ გაჩერების რისკი არ ექნებოდა, მაგრამ დიდ პროექტზე input და scroll მაინც შეჭრიალდებოდა.

### Score: 8/10