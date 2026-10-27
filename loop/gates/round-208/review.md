COMMIT: OK (ცვლილება მხოლოდ perf harness-სა და დოკუმენტაციას ეხება; `app/`, auth, შეძენა და download ხელშეუხებელია; blocking finding არ მოიძებნა)

## Code Review: round 208 — PERF-FADER-a0 (`perf/lib/instrumentation.ts`, `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`, docs 163/164)

ეს მხოლოდ diff-ის review-ა. მოდული სრულად არ შემოწმებულა. budgets.json-ის diff სრულად არ წამიკითხავს: ხელით ვნახე პირველი ~520 სტრიქონი, დანარჩენი grep-ით შევამოწმე. სტრიქონები 266-ია (161 − 20 + 120 + 5). `assert` სტრიქონი 18-ია (14 ძველი + 4 ახალი). diff-ში წაშლილი `"mode": "assert"` სტრიქონი არ არის, ამიტომ R-2-ის მტკიცება სწორია. `paths.txt`-ში `app/` path არ არის, `untracked.txt` ცარიელია. verify.log აჩვენებს `fail 0`-ს და agent references-ის PASS-ს.

### Critical Issues
- არ არის.

### Suggestions (რანჟირებული)
1. **Low — `perf/budgets.json`: ყველა `*.move-to-paint-samples.*` სტრიქონს აქვს `"kind": "wallclock"`.** ეს მიღებული sample-ების რაოდენობაა და არა wall-clock მნიშვნელობა. `wallclockFaderMetrics`-ში (spec.ts:~2295 diff-ში) ის მხოლოდ `.1x` suffix-ისთვის მოხვდა.
   **ფიქსი:** `kind` შეცვალე `deterministic`-ზე და suffix-ის წესი `faderRowId`-ში (spec.ts:195) ცალკე set-ით დაამატე. ან note-ში ახსენი, რატომ არის ის wallclock. შედეგზე ახლა არ მოქმედებს, რადგან `determinismMetrics`-ში არ არის.
2. **Low — `perf/studio-lab.perf.spec.ts:84–85` (`passSequence`):** `'Space -> stopped'` პირობის გარეშე წერია, მაგრამ runPass:685-ში მხოლოდ 1×-ზე სრულდება. 6×-ის report-ის `sequence` ამიტომ არ ემთხვევა იმას, რაც რეალურად მოხდა.
   **ფიქსი:** სტრიქონი შეცვალე `'1x only: Space -> stopped'`-ით ან გააერთიანე მომდევნო სტრიქონთან.
3. **Low — `spec.ts:~507` (`windowListenerCount`):** CDP-ს მთვლელი ამოწმებს მხოლოდ start = after-ს. ეს ამტკიცებს, რომ listener წაიშალა, მაგრამ არ ამტკიცებს, რომ მთვლელი injected listener-ს საერთოდ ხედავს. `listenersAtStart = 1` ირიბად მიუთითებს, რომ main world ჩანს.
   **ფიქსი:** `injectBusyListener`-ის შემდეგ დაამატე ერთი count. მოსალოდნელია `start + 1`, შეუსაბამობა კი `problems`-ში ჩაწერე.
4. **Low — `spec.ts:~2612–2616` (diff) liveness loop:** `finally`-ში `removeBusyListener` page.evaluate-ია. თუ page უკვე ჩავარდნილია, ის თვითონ ისვრის და `dragFader`-ის თავდაპირველ შეცდომას ფარავს. `abortedAt` სწორი რჩება, შეტყობინება კი არასწორი იქნება.
   **ფიქსი:** `removeBusyListener(page).catch(() => false)`.
5. **Info — `instrumentation.ts:192` + `spec.ts:128`:** `event` PerformanceObserver და `events` snapshot ისევ ივსება, მაგრამ `event-share-16`-ის წაშლის შემდეგ spec მათ აღარ კითხულობს. ეს dead path-ია.
   **ფიქსი:** PERF-FADER-a-ში წაშალე ან detail-ში დატოვე, ახლა არა.
6. **Info — `moveWindow` (`spec.ts:~2436`):** `release` = `commit.t >= up` ითვლის move-ის continuous-lane render-საც, თუ ის pointerup-ის შემდეგ შესრულდა. `release-commits` ამიტომ არ არის მკაცრად „release-ის“ commit. ის determinism-ის შემოწმების გარეშეა და record-ია, ასე რომ ეს მისაღებია. note-ში ამის ერთი წინადადებით ხსენება საკმარისია.
7. **Info — doc 163:3:** სტატუსში წერია „C round 208 check pending“, თუმცა C PASS-ია. ეს ემთხვევა 164-ის კონვენციას (სტატუსი მომდევნო რაუნდში ახლდება), ამიტომ finding არ არის.

### Real-browser / leak / regression შემოწმება
- **Event ordering:** sampler-ის `pointermove` listener capture-phase-ზეა window-ზე, ამიტომ `t0` ყველაზე ადრე იწერება. injected listener bubble-phase-ზეა, ამიტომ busy-wait `t0`-ის შემდეგ ხდება და liveness-ის სქემა სწორია. `pendingPaints.shift()`-ის დაწყვილება ეყრდნობა ორ FIFO-ს: rAF callback-ებისას და MessageChannel-ისას. ორივე მოქმედებს ხილულ გვერდზე. დამალულ tab-ში rAF არ გაეშვება და ამას `harness.move-samples-live` დაიჭერს.
- **`passive: true`:** ძველ `true` (capture) listener-თან შედარებით ქცევა არ იცვლება, რადგან listener-ი `preventDefault`-ს არ იძახებს.
- **Leaks:** injected listener და `port1` `finally`-ში იშლება, CDP session `finally`-ში `detach`-დება, `Runtime.releaseObject` გამოძახებულია. instrumentation-ის listener-ები context-ზეა მიბმული და context ყოველ pass-ზე იხურება. `moveLatency` შეუზღუდავად იზრდება, მაგრამ მხოლოდ ერთი pass-ის განმავლობაში, ამიტომ მისაღებია.
- **`atMax` შემოწმება (`spec.ts:283`):** `valueLow < valueStart` გამორიცხავს „არ განძრეულა“ შემთხვევას, ხოლო `valueHigh === valueMax` მოითხოვს, რომ ზემოთ drag-იც იმუშავოს. რეგრესიას არ ფარავს.
- **TS strict:** ახალი `any`, assertion ან suppression არ ჩანს. `let drag: FaderDrag` + try/finally tsc-მ მიიღო. `declare global` augmentation იმავე პატერნით არის, როგორც `__czabaPerf`. Biome-მა გაიარა.
- **Render cost / a11y / Tailwind / tokens:** არ ეხება, რადგან UI არ შეცვლილა.
- **Auth / purchase / download:** არ შეხებია.

### Good Practices Found
- `dragFader`-ის გამოყოფამ `measureFader`-ის და liveness drag-ების დუბლირება მოხსნა.
- liveness შემოწმებას აქვს control drag. ის run-ს აგდებს, თუ control p95 ≥ 30 ms-ია, ასე რომ liveness ცარიელად ვერ გაივლის.
- doc-ში red-proof დოკუმენტირებულია: rAF-ის ამოღება `.deferred`-ს ჩააგდებს.
- `components-per-commit`-ის budget `null`-ზე გადავიდა და ეს ახსნილია. assert მეტრიკა ჩუმად არ შეცვლილა.

### Architecture note
- სიგნალი 4: `perf/lib/instrumentation.ts:~2212–2247` (diff). არსებულ install-ს ემატება ორი window listener და ერთი MessageChannel. **keep:** ეს harness-ის ერთადერთი install წერტილია და lifetime-ით context-ზეა მიბმული. გამოყოფა მხოლოდ plumbing-ს დაამატებდა. `app/`-ის invariant-ებს (audio timing, refs, gesture lifecycle, Undo/Redo) არ ეხება.
- სიგნალი 3 (მცირე): `perf/studio-lab.perf.spec.ts` ზედიზედ რამდენიმე რაუნდში იცვლება (206, 208). **keep, რადგან** ცვლილება ახლა ერთ ახალ ბლოკშია (liveness) და `dragFader`-ის გამოყოფამ ღირებულება შეამცირა. ჯერ proposal არ მჭირდება. თუ PERF-1b-მაც იგივე ფაილი გაზარდა, planner-მა შეიძლება განიხილოს ერთი დავალება: `perf/lib/metrics.ts`-ში გაიტანოს `moveWindow`/`moveToPaint`, როგორც pure ფუნქციები, და მისცეს მათ unit ტესტები. ეს მხოლოდ წინადადებაა.

### Alternative Approach (move-to-paint-ის მეთოდი)
- **Current:** capture listener-ში იწერება `t0`, შემდეგ `rAF`, შემდეგ MessageChannel, ბოლოს `now − t0`. გადადებულ React render-ს ითვლის. sample-ების რაოდენობა და liveness შემოწმებულია.
- **Alternative:** CDP `Tracing`-ით (`devtools.timeline`) ზუსტი input-to-presentation, ან Event Timing-ის `presentationTime`.
- **Verdict:** მიმდინარე სჯობს. Tracing ნელია, დიდ არტეფაქტებს ქმნის და CPU throttling-ს აუარესებს. Event Timing კი უწყვეტ `pointermove`-ს არ აქვეყნებს (C-R206-01). შეზღუდვა, რომ რეალურ paint-ს პირდაპირ არ ზომავს, doc-ში მითითებულია.

### Score: 9/10