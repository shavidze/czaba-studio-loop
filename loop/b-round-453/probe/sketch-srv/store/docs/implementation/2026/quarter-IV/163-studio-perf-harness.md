# Studio-ს performance harness (PERF-1a): fader drag-ის გაზომვა

**თარიღი:** 2026-10-27
**სტატუსი:** Completed (PERF-1a C round 206 PASS, published 60c82ed; PERF-FADER-a0 C round 208 PASS, published f535ab3)
**შეცვლილი პროექტი:** Store (მხოლოდ სატესტო ინფრასტრუქტურა; `app/` არ შეცვლილა)

## კონტექსტი

საბამ Studio ნელად შეაფასა და მაგალითად fader-ის drag დაასახელა (SABA-B-5, Medium). სანამ რამეს გავასწორებთ, საჭიროა გამეორებადი გაზომვა, რომელიც PERF-FADER-ის ფიქსამდე და შემდეგ ერთსა და იმავე რიცხვებს გვაჩვენებს. PERF-1 ორად გაიყო: PERF-1a (ეს რაუნდი) ზომავს load-ს, playback-ს და ხუთ fader-ს; PERF-1b დაამატებს zoom-ს, clip click-ს, range/fade/trim drag-ს, export-ს, bytes-ს, DOM-სა და memory-ს.

## მიდგომა

- **ცალკე testDir.** სპეციფიკაციები `perf/`-შია და არა `e2e/`-ში, ამიტომ ჩვეულებრივი `playwright test`, `npm run test:e2e` და smoke gate მათ ვერ ხედავს. `playwright.perf.config.ts` ცალკე config-ია; `npm run test:perf` არ შედის `verify`-ში.
- **Production build.** config-ის `webServer` ასრულებს `npm run build`-ს და შემდეგ `remix-serve`-ს `PORT=5188`-ზე; `reuseExistingServer: false`. root-ის dev server (:5173) უცვლელი რჩება.
- **აპის კოდის გარეშე.** ყველა საზომი `addInitScript`-ით ჩაიდგმება: React devtools hook-ის stub, `AudioContext`-ის subclass, `start()`-ის patch, PerformanceObserver-ები და rAF loop. `page.route`/`context.route` არ გამოიყენება (perf-plan-ის gotcha: გვერდი "Loading…"-ზე რჩებოდა). `localStorage.czaba_analytics_consent = 'denied'` დაშვებულია (smoke-ის პრეცედენტი).
- **Budget-ის ფაილი.** `perf/budgets.json` — 316 სტრიქონი (PERF-1a-ში 161; PERF-FADER-a0-მა 266-მდე გაზარდა; PERF-FADER-b-მ clip gain members სცენარის 50 სტრიქონით 316-მდე). ყოველი: `id, scenario, metric, unit, kind, mode, budget, owner, note`. `budget` არის `null` ან `{ "op": "<" | "<=" | "==" | ">=" | ">", "value": number }`. ვარდნა შეუძლია მხოლოდ `mode: "assert"` სტრიქონს; `record` იბეჭდება და იწერება. PERF-1a-ში არცერთი `wallclock` სტრიქონი assert არ იყო; PERF-FADER-a0-იდან ერთადერთი გამონაკლისია `harness.move-latency-live.sync` და `.deferred` (იხ. "wall-clock assert-ის გამონაკლისი"). `PERF_BUDGETS=<path>` ცვლის ფაილს (C-ის red-proof-ისა და შემდეგი PERF დავალებებისთვის).
- **სამი pass თითო CPU rate-ზე.** pass = ერთი ახალი browser context, რომელიც მთელ თანმიმდევრობას ასრულებს. 1×-ზე 3 pass და 6×-ზე (`Emulation.setCPUThrottlingRate`) 3 pass, სულ 6 page load. 6×-ზე throttle ირთვება ready-სა და Add-ის შემდეგ, ამიტომ load/playback/harness სტრიქონები მხოლოდ 1×-ზე იწერება.
- **ალტერნატივა, რომელიც უარვყავით.** `pointermove`-ის capture/bubble wrapper ზომავს მხოლოდ handler-ს (~0.1 ms): React native listener-ის update-ს შემდეგ task-ში არენდერებს. ამიტომ wall-clock მტკიცებულება rAF ინტერვალებიდან, LoAF-იდან და PERF-FADER-a0-იდან `move-to-paint` sampler-იდან (rAF → `MessageChannel`, იხ. მეტრიკების ცხრილი) მოდის.

### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)

ამოცანა ითხოვს "group last"-ს, რადგან Ctrl+G lane tree-ს ცვლის. აქედან გამომდინარე, ჯგუფი იქმნება მხოლოდ მას შემდეგ, რაც დანარჩენი ოთხი fader გაიზომა ორივე მდგომარეობაში; შემდეგ ჯგუფის fader-ი იზომება stopped და playing მდგომარეობაში. ასე რვა არაჯგუფური სცენარი B-ის probe-ის მსგავსად ჯგუფის გარეშე იზომება. ზუსტი თანმიმდევრობა ინახება შედეგის JSON-ის `sequence` ველში:

1. `/studio-lab` → ready (`load.ready-ms`, `load.longtask-max`, `load.longtasks-over-50`, `load.commits`, `load.components`); მხოლოდ 1×-ზე, PERF-2-იდან (round 282): status ready-მდე და 200 ms სიჩუმემდე (settled) — `load.settled-ms`, `load.script-max`, `load.settled.longtask-max`, `load.settled.longtasks-over-50`
2. მხოლოდ 1×-ზე, round 313-იდან (C-R312-01): settled-ის შემდეგ და Add-მდე გვერდში ერთი injected `setTimeout` callback, რომელიც 80 ms busy-loop-ს აკეთებს და თავად აფიქსირებს `start`/`end`-ს; 500 ms ლოდინის შემდეგ იკითხება ის LoAF entry, რომელიც ამ callback-ს შეიცავს (`harness.loaf-scripts-live`). 6× pass-ებს ეს ნაბიჯი არ აქვს
3. ბიბლიოთეკის Add click (`harness.hook-live`)
4. track → pan → master → clip gain, stopped (clip gain-ის წინ click ირჩევს დამატებულ clip-ს)
5. Space → playing (`harness.audio-running`); 1 s settle, 5 s idle (`play.idle-commits`, `play.idle-components`, `play.idle-longtasks-over-50`). idle ფანჯრის დაწყებამდე იკითხება timeline scroller-ის (`arrangement-timeline-scroller`) `scrollLeft`
6. round 314-იდან (C-R313-01): Follow off. `arrangement-follow` ღილაკზე click, სანამ `data-follow-mode` არ გახდება `off` (მაქსიმუმ 2 click: paused → on → off), შემდეგ blur (Space ღილაკს აღარ აჭერს) და `waitForStudioQuiet`. ამის შემდეგ idle bracket: `scrollLeft` უნდა უდრიდეს ნაბიჯი 5-ის მნიშვნელობას (`timelineScrollProblem('idle playback and Follow off', …)`). Follow გამორთული რჩება შემდეგი Stop/Play-ის დროსაც (აპი მხოლოდ `paused`-ს აბრუნებს), ამიტომ group და members playing drag-ებიც Follow off-ით იზომება
7. track → pan → master → clip gain, playing
8. დამატებული clip-ის header-ის drag 40 px-ით (1 s, 40 px/s-ზე) playing-ის დროს (`harness.restart-live`)
9. Space → stopped; Stems ხაზის სახელის click, SFX-ზე Shift+click, Ctrl+G
10. group, stopped → Space → group, playing
11. PERF-FADER-b-დან: ბიბლიოთეკაში Soft impact → Add აქტიურ SFX ხაზზე; დამატებული clip-ის click და Soft impact-ზე Shift+click (members, N = 2); clip gain members, playing → Space → stopped → clip gain members, stopped (`fader.clipgain-members.*`)
12. მხოლოდ 1×-ზე (PERF-FADER-a0-იდან): Pan — Music-ის სამი liveness drag: `.sync`, `.deferred` და injection-ის გარეშე `.control` (`harness.move-latency-live.sync`, `harness.move-latency-live.deferred`, `harness.move-latency-control`)

Drag: `mouse.down` შუაში, 60 step 5 %-მდე, 60 step 95 %-მდე, `mouse.up` — 121 pointermove. Drag-ის წინ fader უნდა იყოს enabled; slider-ის მნიშვნელობა იკითხება down-ის შემდეგ, 5 %-ზე და 95 %-ზე, და თუ ის არ ჩამოვიდა და არ ავიდა, run ვარდება ("did not move"). ასე გაცდენილი ან disabled fader ვერ გაივლის "0 კომპონენტად".

**Settle.** pointerup-ის შემდეგ ფანჯარა იხურება, როცა გვერდი "ჩუმდება": მინიმუმ 600 ms (clip drag-ზე 500 ms), შემდეგ 200 ms ახალი commit-ისა და `start()`-ის გარეშე, მაქსიმუმ 3 s. ფაქტობრივი დრო იწერება `components-per-commit`-ის detail-ში (`settleMs`).

## არქიტექტურა

```mermaid
flowchart LR
  CFG[playwright.perf.config.ts] -->|build + remix-serve :5188| APP[/studio-lab prod/]
  SPEC[perf/studio-lab.perf.spec.ts] -->|addInitScript| INS[perf/lib/instrumentation.ts]
  INS -->|hook stub, AudioContext, start, observers, rAF| APP
  SPEC -->|3 pass × 1×, 6×| APP
  SPEC --> BUD[perf/lib/budgets.ts ← perf/budgets.json / PERF_BUDGETS]
  SPEC --> ST[perf/lib/stats.ts]
  SPEC --> PG[perf/lib/page.ts]
  SPEC --> RP[perf/lib/report.ts]
  RP --> BUD
  RP --> ST
  SPEC --> OUT[test-results/perf/perf-1a-ISO.json + latest.json]
```

round 223-იდან (PERF-HARNESS-SHARED-LIB) საერთო page helper-ები (`nowIn`, `snapshot`, `blurActive`, `waitForQuiet`, `reactRendererProblem`, `playButton`, `audioRunning`, `isPlaying`, `setPlayback`, `startTasks`) `perf/lib/page.ts`-შია, report-ის ბირთვი (`buildPerfReportCore`, `formatLimit`, `PerfSample`) კი `perf/lib/report.ts`-ში. spec-ში რჩება report-ის envelope (`harness` … `rows`), საკუთარი `faderRowId`, fader locator-ები და `storeRoot`. PERF-1a ბირთვს გადასცემს: `determinismRequiresKind: false`, `assertWhenPartial: false`, `crossRateMetrics` (1×/6× შედარება). დეტალები: `175-perf-harness-shared-lib.md`.

## მეტრიკების განმარტება და ზღვრები

| მეტრიკა | განმარტება | ცნობილი ზღვარი |
|---|---|---|
| `components-per-commit` | drag-ის დროს (pointerdown-იდან pointerup + 600 ms-მდე) თითო commit-ში ხელახლა დარენდერებული კომპონენტების მედიანა; detail: `max`, `commits` | fiber walk ითვლის კომპონენტს (tag 0, 1, 11, 14, 15), თუ ის ახალია ან PerformedWork flag (1) აქვს, და ჩადის მხოლოდ იქ, სადაც `child !== alternate.child`. ევრისტიკაა: hook bailout-ებს შეიძლება ოდნავ ნაკლებად ითვლიდეს, `memo(forwardRef(…))`-ს კი შეიძლება ორჯერ ითვლიდეს (wrapper და შიდა fiber). შეცდომა ყოველ run-ში ერთნაირია. ეყრდნობა React 18-ის შიდა tag/flag-ებს: React-ის განახლებისას ხელახლა უნდა შემოწმდეს. PERF-FADER-a0-იდან: pointerdown-ისა და release-ის commit-ებსაც შეიცავს, ამიტომ per-move ბიუჯეტის მეტრიკა არ არის; `budget` = `null` |
| `commits-per-move` | commit-ები ÷ გაგზავნილი move-ები; detail: `commits`, `moves` (round 224-იდან) | მხოლოდ ზედა ზღვარია: Scheduler commit-ებს აერთიანებს. Determinism: ratio contract `commits`/`moves` წყვილზე, მრიცხველი და მნიშვნელი pass-ებს შორის ზუსტად უნდა ემთხვეოდეს (`176-perf-determinism-contract.md`) |
| `moves-dispatched` | window-მდე მისული `pointermove` (1 + 60 + 60) | — |
| `restarts` | `start()` გამოძახებები არა-offline context-ზე drag-ის ფანჯარაში; detail აჯგუფებს მათ task-ების მიხედვით (`tasks`, `startsPerTask`) | export-ის `OfflineAudioContext` არ ითვლება; task-ის საზღვარი მიახლოებითია (`MessageChannel`-ის შეტყობინება): უკვე რიგში მდგომი task (input, timer) შეიძლება იმავე ჯგუფში მოხვდეს, 6×-ზე უფრო ხშირად; `start()` ითვლება native გამოძახების წარმატების შემდეგ |
| `frame-p95`, `frames-over-33` | rAF ინტერვალების p95 და 33.4 ms-ზე გრძელი ინტერვალების რაოდენობა pointerdown-იდან pointerup-მდე | wall-clock; მხოლოდ ტრენდი (±30 % ხმაური) |
| `loaf-count` | `long-animation-frame` entries, რომლებიც drag-ის დროს იწყება | wall-clock; ტრენდი |
| `move-to-paint-p95`, `move-to-paint-over-16` | თითო `pointermove`-ზე: capture-phase window listener-ში `t0 = performance.now()`, შემდეგ `requestAnimationFrame`, მის შიგნით `MessageChannel`-ის შეტყობინება; `onmessage`-ში იწერება `performance.now() - t0` (move-ის ინდექსით). სტრიქონები: drag-ის sample-ების p95 და 16 ms-ზე გრძელი sample-ების წილი | wall-clock; მხოლოდ ტრენდი (±30 %). ითვლის handler-ს, შემდეგ task-ში გადადებულ React render-ს და მომდევნო frame-მდე დროს; რეალური paint-ის დასრულებას პირდაპირ არ ზომავს. რამდენიმე move ერთ frame-ში ერთსა და იმავე rAF-ს იზიარებს. Policy target: p95 < 16 ms (SABA-B-5). ცოცხალი რომაა, ამტკიცებს `harness.move-latency-live.sync` / `.deferred`. ძველი `event-share-16` (20 სტრიქონი) წაიშალა: Event Timing `pointermove`-ს არ აქვეყნებს და fader-ები mouse drag-ის დროს native `input`-ს არ აგზავნიან (C-R206-01), ამიტომ ის ყოველთვის 0 იყო |
| `load.ready-ms` | navigation start → ready. Ready = ბიბლიოთეკის Add ღილაკი enabled და preview waveform-ის ზოლები დახატულია | wall-clock |
| `load.longtask-max`, `load.longtasks-over-50` | ready-მდე ყველაზე გრძელი long task და 50 ms-ზე გრძელების რაოდენობა | wall-clock. `load.longtasks-over-50` round 224-იდან `wallclock`-ია: ერთი run-ის შიგნით იცვლებოდა ([1, 1, 2], [1, 2, 1], [1, 2, 2]) |
| `load.commits`, `load.components` | ready-მდე commit-ები და დარენდერებული კომპონენტების ჯამი | record. PERF-2-იდან (round 282) `wallclock`-ია: demo synth-ის worker-ის შეტყობინება mp3 decode-ს ეჯიბრება, ამიტომ მნიშვნელობა pass-ებს შორის იცვლება (B-ის sketch run: [5, 5, 6] / [371, 371, 464]; C round 282: [5, 6, 5] / [371, 464, 371]; `211-perf-demo-synth-worker.md`) |
| `load.settled-ms` | მხოლოდ 1×: navigation start → settled (status ready + 200 ms სიჩუმე) | wall-clock, record |
| `load.script-max` | მხოლოდ 1×: `[0, settled]` ფანჯრის LoAF entry-ებიდან ყველაზე დიდი `scriptMax` (entry-ის ყველაზე გრძელი script-ის `duration`; `perf/lib/instrumentation.ts` მას მხოლოდ მაშინ ინახავს, როცა entry-ს `scripts` აქვს) | wall-clock, `assert` `< 100` (PERF-2-იდან; პირველი ceiling assert wall-clock სტრიქონზე, მედიანა 3 pass-იდან). detail: `loafEntries` — ფანჯრის LoAF entry-ების რაოდენობა. round 313-იდან (C-R312-01) settled ფანჯარაზე vacuity guard აღარ ეშვება: PERF-5a-ის შემდეგ ფანჯარაში შეიძლება არცერთი LoAF entry არ იყოს, ამიტომ 0 ნამდვილი შედეგია. `scripts` ველის სიცოცხლეს ახლა `harness.loaf-scripts-live` ამტკიცებს (ქვემოთ). assert-ის სიცოცხლეს ამტკიცებს MU-SYNC-FALLBACK (მედიანა 371–372). 50 ms-ზე მოკლე task LoAF entry-ს არ ტოვებს, რაც ceiling-ისთვის მისაღებია |
| `harness.loaf-scripts-live` | მხოლოდ 1×, round 313-იდან: pass-ის ნაბიჯი 2-ის injected 80 ms callback-ის შემცველი LoAF entry-ის ყველაზე დიდი `scriptMax` (დამრგვალებული). entry-ები ირჩევა `injectedLoafEntries`-ით (`perf/lib/report.ts`): entry უნდა იწყებოდეს callback-ის `start`-მდე და მთავრდებოდეს `end`-ის შემდეგ, 1 ms ტოლერანსით (`LOAF_EDGE_TOLERANCE_MS`); უბრალოდ გადამკვეთი entry არ ითვლება. detail: `injectedBusyMs`, `callbackMs`, `spins`, `loafEntries`, `scriptCount`, `frameStartedBeforeCallback` | wall-clock, `assert` `>= 50`. შემცველი entry ზუსტად 1 უნდა იყოს, და მას `scripts` უნდა ჰქონდეს (`loafScriptsProblem`, problem `harness.loaf-scripts`), თორემ pass ვარდება. ასე `scripts`-ის გარეშე observer `load.script-max`-ს „0 ms“-ად ვერ გაატარებს. Add-იდან მოყოლებული 1× pass-ის ისტორიაში ეს დამატებითი 80 ms ბლოკია, 6×-ში — არა |
| `load.settled.longtask-max`, `load.settled.longtasks-over-50` | მხოლოდ 1×: `[0, settled]` ფანჯრის ყველაზე გრძელი long task და 50 ms-ზე გრძელების რაოდენობა | wall-clock, record. PERF-2-ის შემდეგ აქ ძირითადად პირველი frame-ის task ჩანს (hydration-მდე, synth არ არის; PERF2-FIRST-FRAME-LONGTASK) |
| `play.idle-commits`, `play.idle-components`, `play.idle-longtasks-over-50` | 5 s playback-ის დროს | idle long task assert მხოლოდ 1×-ზე |
| `harness.hook-live`, `harness.audio-running`, `harness.restart-live` | hook-ს ნამდვილად მოსდის commit-ები; playback ნამდვილად მუშაობს (GATE206-S6, round 214-იდან; round 259-იდან სიგნალი Play ღილაკის `data-playing` attribute-ია: მისი `true`-ზე გადასვლიდან 1 s-ის შემდეგ (Space-ის დაჭერის შემდეგ attribute-ს 15 s-მდე ელოდება) `data-playing` არის `true`, tracked context არის `running` და Space-იდან 5 s idle ფანჯრის ბოლომდე ჩაწერილია მინიმუმ 1 `start()`); restart-ის მთვლელი ნამდვილად ითვლის (clip-ის start უნდა შეიცვალოს, თორემ run ვარდება) | assert; გამორთული hook ვერ გაივლის "0 commit"-ად. autoplay flag-ით ნებისმიერი context შეიძლება `running` იყოს; ამიტომ round 214-იდან `start()` ≥ 1-იც სავალდებულოა და მხოლოდ flag-ით row ვეღარ გაივლის. `harness.restart-live` deterministic `count` სტრიქონია და round 224-იდან ზუსტ (exact) შემოწმებას ექვემდებარება |
| `move-to-paint-samples` | drag-ის `pointermove`-ებისთვის მიღებული sample-ები; detail: `movesDispatched`, `missing` | მოსალოდნელია = `moves-dispatched`; ცოცხალი რომაა, ამტკიცებს `harness.move-samples-live` |
| `move-components-max`, `move-components-per-move` | move-ის ფანჯარა: commit-ები in-page pointerdown-ის შემდეგ პირველი `pointermove`-ის შემდეგ და in-page `pointerup`-მდე (capture-phase window listener-ები). `-max` = ერთ commit-ში ყველაზე დიდი `rendered` (commit-ის გარეშე 0); `-per-move` = ფანჯრის `rendered`-ის ჯამი ÷ ფანჯრის move-ები (120; down-მდე hover move არ ითვლება); detail: `windowCommits`, `downCommits`, `movesInWindow` | pointerdown-ისა და release-ის commit-ები განმარტებით გამორიცხულია. deterministic, `assert` `<= 3`: track, group, master და pan-ისთვის PERF-FADER-a-დან, clip gain-ისთვის (single და members) PERF-FADER-b-დან; members-ზე ზღვარი N + 1-ია (N = 2). Determinism: `-max` ზუსტი (exact), `-per-move` ratio contract `componentsSum`/`movesInWindow` წყვილზე; ორივეს 1×/6× მედიანების ზუსტი შედარებაც ეხება. pointerup-ის timestamp-ის გარეშე run ვარდება |
| `release-commits` | commit-ები in-page `pointerup`-იდან "ჩუმობამდე"; detail: `releaseComponentsMax` | deterministic, `assert` `>= 1` (history entry და draft-ის გასუფთავება release-ზე): track, group, master და pan-ისთვის PERF-FADER-a-დან, clip gain-ისთვის (single და members) PERF-FADER-b-დან; round 224-იდან ზუსტი (exact) determinism-ის შემოწმებით |
| `harness.move-latency-live.sync`, `harness.move-latency-live.deferred`, `harness.move-latency-control` | მხოლოდ 1×, pass-ის ბოლოს (clip gain members stopped-ის შემდეგ): Pan — Music-ის drag injected bubble-phase window `pointermove` listener-ით, რომელიც 30 ms busy-wait-ს აკეთებს სინქრონულად (`.sync`) ან `MessageChannel`-ის handler-ში (`.deferred`); შემდეგ listener-ები იშლება და იგივე drag injection-ის გარეშე (`.control`) | `.sync`/`.deferred` assert `>= 30`; `.control` record, detail-ში `pointermove` listener-ების რაოდენობა დასაწყისში და წაშლის შემდეგ (CDP `DOMDebugger.getEventListeners`); შეუსაბამობა run-ს აგდებს. მნიშვნელობები მხოლოდ `harness.*` სტრიქონებში იწერება, არა `fader.pan.*`-ში |
| `harness.move-samples-live`, `harness.move-window-live` | track stopped drag, 1×: `moves-dispatched − move-to-paint-samples` და `move-components-max` | assert `<= 2` და `>= 1`. `move-window-live` baseline-ზე ≈ 83-ია, PERF-FADER-a-ს შემდეგ 1. სტრიქონი უცვლელი რჩება და ცოცხალია, რადგან მნიშვნელობის შემცვლელი ყოველი move კვლავ leaf-ის commit-ს აკეთებს |

**ზოგადი ზღვრები.** fiber walk სინქრონულად ეშვება ყოველ commit-ში, ამიტომ მისი მცირე ღირებულება wall-clock სტრიქონებშიც ხვდება. Ctrl+G (`Control+g`) Linux/Windows-ის კომბინაციაა; macOS-ზე harness არ გაშვებულა. `commits-per-move` commit-ებს ითვლის settle-ის ჩათვლით, move-ებს კი მხოლოდ pointerup-მდე. ის მხოლოდ ზედა ზღვარია. wall-clock სტრიქონებს, რომლებსაც determinism-ის შემოწმება არ ეხება, მედიანა ერთ ცუდ pass-ს უმალავს (R-D). playing მდგომარეობა ცალკე მოწმდება ყოველი drag-ის წინ და შემდეგ.

**Follow-ისა და scroll-ის guard-ები (round 314-იდან).** ყველა `fader.*.playing.*` სტრიქონი Follow off-ით იზომება (pass-ის ნაბიჯი 6). ორი guard: (1) ყოველი playing fader drag-ის წინ `data-follow-mode` უნდა იყოს `off`, თორემ problem `Follow is <mode> before <label>`; (2) ყოველი fader drag-ის (stopped და playing) `t0`-მდე და `tEnd`-ის შემდეგ იკითხება `scrollLeft`, ხოლო idle bracket ადარებს idle-ის დაწყებას Follow off-ის შემდგომ მნიშვნელობას; ნებისმიერი განსხვავება (ზუსტი შედარება) იძლევა `timeline scrolled during <label>: scrollLeft <before> -> <after>` (`timelineScrollProblem`, `perf/lib/report.ts`). `play.idle-*` სტრიქონები Follow on-ით, click-მდე იზომება.

**Determinism (round 224-იდან).** ყოველ `kind: "deterministic"` სტრიქონს აქვს contract: `exact` (count, components და სხვა მთელი ერთეულები: სამი sample ზუსტად ტოლია), `tenths` (MiB) ან `ratio` (`commits-per-move`, `move-components-per-move`: detail-ის მრიცხველი და მნიშვნელი ზუსტად ტოლია). უცნობი ერთეული run-ს აგდებს (fail-closed). წესი და failure-ის ტექსტები: `176-perf-determinism-contract.md`. `components-per-commit`, `restarts`, `move-components-max` და `move-components-per-move` სტრიქონების 1×-ისა და 6×-ის მედიანები ზუსტად უნდა ემთხვეოდეს. სტრიქონის id-ები: deterministic fader სტრიქონი 1×-ზე სუფიქსის გარეშეა (`fader.track.stopped.components-per-commit`), 6×-ზე აქვს `.6x`; wall-clock სტრიქონებს ყოველთვის აქვს `.1x` ან `.6x`.

## შეცვლილი ფაილები

- `playwright.perf.config.ts` — ახალი: perf config (testDir `./perf`, 1 worker, retries 0, Chromium, autoplay flag, :5188 webServer, `outputDir` `test-results/perf-artifacts`)
- `perf/studio-lab.perf.spec.ts` — ახალი: სცენარები, აგრეგაცია, assert-ები, შედეგების ჩაწერა
- `perf/lib/instrumentation.ts` — ახალი: in-page საზომები
- `perf/lib/stats.ts` — ახალი: median/percentile/თანხვედრა
- `perf/lib/budgets.ts` — ახალი: `budgets.json`-ის ვალიდაცია
- `perf/budgets.json` — ახალი: 161 სტრიქონი (PERF-1a); PERF-FADER-a0-ის შემდეგ 266 (იხ. ქვემოთ); PERF-FADER-b-ის შემდეგ 316
- `package.json` — `test:perf` script
- `docs/implementation/2026/quarter-IV/162-lead-magnet-dialog-focus.md` — მხოლოდ სტატუსის ხაზი (R112)

## პრობლემები და გადაწყვეტები

- **Problem:** Playwright რაუნდის დასაწყისში `test-results/`-ს შლის, ამიტომ წინა run-ის JSON იკარგებოდა. **Solution:** config-ის `outputDir` არის `test-results/perf-artifacts`; შედეგები `test-results/perf/`-ში რჩება.
- **Problem:** `biome.json` მხოლოდ `app/**`-ს მოიცავს, ამიტომ `npx biome format perf …` ფაილებს არ ამუშავებს. **Solution:** ფორმატი შემოწმდა ფაილების ასლზე იმავე formatter/linter პარამეტრებით; ყველა შესწორება დაბრუნდა ფაილებში.
- **Problem:** LoAF და Event Timing entries ასინქრონულად მოდის და "მიმდინარე mark"-ით მიკუთვნება აცდენს. **Solution:** ყველა ჩანაწერს აქვს `performance.now()`/`startTime`, ფანჯრები `[t0, t1]`-ით იჭრება.
- **Problem:** 6×-ზე playing drag-ები დიდხანს გრძელდება. **Solution:** ყოველი playing drag-ის წინ და შემდეგ მოწმდება Play ღილაკის `data-playing="true"` (round 259-იდან; Play-ის სახელი მუდმივად `Play`-ია) და `running` context; დარღვევა run-ს აგდებს.
- **Problem (code-review H1):** pass-ის შიგნით ამოგდებული შეცდომა შედეგის ჩაწერას გამოტოვებდა. **Solution:** ყოველი pass-ის შეცდომა იწერება `aborted at <step>`-ად, ხოლო JSON იწერება ყოველი pass-ის შემდეგ (`complete: false`, სანამ ექვსივე არ დასრულდება). შეწყვეტილი pass-ის გამო დაკლებული სტრიქონები ერთ შემაჯამებელ ხაზად იწერება; ცარიელ სტრიქონს მედიანა არ ენიჭება და cross-rate შემოწმებაში არ მონაწილეობს (მეორე code-review). ამიტომ timeout-ის შემთხვევაშიც რჩება ნაწილობრივი შედეგი.
- **Problem:** 6×-ზე pass უფრო დიდხანს გრძელდება, ამიტომ playhead ხილულ არეს (1152 px ÷ 40 px/s ≈ 29 s) სცდება და Follow timeline-ს გადაახვევს. ამის შემდეგ `clip.x + 200` (ან timeline scroller-ის მარცხენა კიდე) ხვდებოდა sticky lane header-ზე (288–512 px), ამიტომ clip-ის drag clip-ს ვერ ამოძრავებდა. ჯერ ეს აპის ბაგი ეგონათ, მაგრამ 1×-ზეც მეორდება იგივე scroll-ის შემდეგ, ანუ harness-ის გეომეტრიის შეცდომაა. **Solution:** grab point ირჩევა `document.elementFromPoint`-ით: პირველი წერტილი, რომელიც ნამდვილად clip-ს ეკუთვნის, + 200 px. clip-ის მოძრაობა (`data-clip-start`) მოწმდება და თუ არ შეიცვალა, run ვარდება.
- **Problem (code-review M3):** მიუწვდომელი PerformanceObserver ტიპი ჩუმად ნულებს მისცემდა. **Solution:** `observerErrors` გადადის pass-ის problems-ში და run-ს აგდებს.
- **Problem (C-R312-01, round 312):** `harness.loaf-scripts` guard settled load ფანჯარაზე ეშვებოდა. PERF-5a-მ peaks main thread-იდან worker-ში გადაიტანა, ამიტომ ამ ფანჯარაში ხშირად აღარ რჩებოდა `scripts`-ის მქონე LoAF entry, და guard ამ გაუმჯობესებას მკვდარ ინსტრუმენტად კითხულობდა (A-ის tree 2/2 ვარდებოდა, HEAD-ის ასლი — არა). **Solution (round 313):** guard საკუთარ injected frame-ზე გადავიდა: pass-ის ნაბიჯი 2, `injectedLoafEntries` და `harness.loaf-scripts-live` (`>= 50`). `load.script-max` იმავე `[0, settled]` ფანჯარაზე რჩება და შეიძლება 0 იყოს; detail-ში `loafEntries`.
- **Problem (C-R313-01, round 313):** `fader.clipgain.playing.commits-per-move.6x` და `fader.clipgain.playing.release-commits.6x` ერთი run-ის შიგნით ხან 91 / 1-ს, ხან 92 / 2-ს აჩვენებდა, და ზუსტი determinism-ის შემოწმება run-ს აგდებდა. იგივე ხდებოდა HEAD-ის harness-ითა და HEAD-ის აპით, ანუ round 312/313-ს არ გამოუწვევია. **დადასტურებული (B-ის probe):** 92 / 2 pass-ში მეორე release commit (+28 ms) არის `ArrangementRuler`, მისი ticks და playhead (minified `_0, D0, A0`), და არა clip gain-ის ბლოკი. **დასკვნა (კოდითა და sketch run-ებით გამყარებული, პირდაპირ არ გაზომილა):** Follow ნაგულისხმევად `on`-ია, ხოლო Follow-ის subscriber pointer gesture-ის დროს page turn-ს აჩერებს; ამიტომ drag-ის დროს მოსული page turn pointerup-ის შემდეგ პირველ position tick-ზე სრულდება და ხვდება release ფანჯარაში თუ არა, run-ის ხანგრძლივობაზეა დამოკიდებული. აპის ქცევა სწორია. **Solution (round 314):** harness playing fader-ების წინ Follow-ს გამორთავს (ნაბიჯი 6) და ყოველ ფანჯარაში `scrollLeft`-ის ცვლილებაზე ხმამაღლა ვარდება (ზემოთ, "Follow-ისა და scroll-ის guard-ები"). სტრიქონების contract და `perf/budgets.json` უცვლელია; ტოლერანსი არ შესუსტებულა.

## ტესტირება

`npm run test:perf` რეალურ headless Chromium-ში (cloud runner, 1440×900), საბოლოო კოდზე ორჯერ, ცალ-ცალკე გაშვებით: ორივე exit 0. ხანგრძლივობა build-ის ჩათვლით: 383 s და 422 s; თავად ტესტი: 369.5 s და 407.9 s. deterministic მედიანები ორ run-ს შორის ზუსტად ემთხვევა (`commits-per-move` გარდა, ის ისედაც record-ია). B-ის probe (c274930, prod build) და A-ის მედიანები (3 pass; 1× და 6× ერთნაირია):

| სცენარი | B: კომპონენტი/commit | A: კომპონენტი/commit (stopped / playing) | A: restarts playing (1× / 6×) | A: frame p95 playing (1× / 6×; 6× wall-clock-ია და run-ებს შორის იცვლება) |
|---|---|---|---|---|
| track volume "Volume — Music" | 83 | 83 / 83 | 0 / 0 | 16.8 / 33.4–50 ms |
| master "Master Volume" | 80 | 80 / 80 | 0 / 0 | 16.7 / 33.4–50 ms |
| pan "Pan — Music" | 4 | 4 / 4 | 0 / 0 | 16.7 / 16.8–33.4 ms |
| group volume (Stems + SFX) | — | 85 / 85 | 0 / 0 | 16.7 / 33.4–50 ms |
| clip gain "Clip Gain — fader" | — | 79 / 87 | 0 / 0 | 33.4 / 66.6–66.7 ms |

Harness: `harness.hook-live` = 2, `harness.audio-running` = 1, `harness.restart-live` = 1 (ერთი task, clip start 0.000 → 1.000). Load: `load.ready-ms` ≈ 1.01–1.16 s, `load.longtask-max` ≈ 359–366 ms, `load.longtasks-over-50` = 2, `load.commits` = 5, `load.components` = 320. perf-plan-ის baseline (463–491 ms / 2.3–2.5 s) სხვა მანქანაზე და სხვა ready-ის განმარტებით იყო გაზომილი, ამიტომ პირდაპირ არ ედრება. `play.idle-commits` = 0, `play.idle-longtasks-over-50` = 0.

**Red-proof.** `PERF_BUDGETS` ასლით, სადაც `harness.restart-live`-ს `>= 1000` სჭირდება და `fader.track.stopped.components-per-commit` არის `assert` (`<= 3`), run ვარდება (exit 1) და ორივე სტრიქონს ასახელებს გაზომილი მნიშვნელობით (1 და 83).

**იზოლაცია.** `npx playwright test --list` (default config) და smoke config-ის `--list` `perf/`-ის ფაილს არ აჩვენებს.

**Rounds 313–314 (guard-ები).** `perf/lib/report.test.ts`-ში LOAF2 (`injectedLoafEntries`, 6 შემთხვევა) და SCROLL1 (`timelineScrollProblem`, 5 შემთხვევა) scratch `vitest.perf-scratch.config.ts`-ით ეშვება (`perf/**` vitest-ის include-ში არ არის, ამიტომ `verify` მათ არ უშვებს; scratch config და unit mutant-ების `b-round-313/unit-mutants.sh` loop-ის ფოლდერშია, repo-ში არა). Round 314-ის A run-ები (2, ცალ-ცალკე): `failures` ცარიელია; `fader.clipgain.playing.commits-per-move.6x` 91 / 121 და `release-commits.6x` 1 ყველა pass-ში; 164 deterministic სტრიქონი ზუსტად ემთხვევა HEAD-harness control-ს. C round 314 PASS. Browser mutant-ები: MU-LIVE-BUSY0 (injected callback busy-loop-ის გარეშე → `harness.loaf-scripts`, "0 … entries contain the injected callback" და `harness.loaf-scripts-live` assert ვარდება) და MU-FOLLOW-SCROLL (Follow-off ნაბიჯის გარეშე და `scrollLeft += 50` pointerup-ის შემდეგ → "timeline scrolled during …" და "Follow is … before …").

## PERF-FADER-a0 (round 208): per-move მეტრიკა

**რატომ.** fader-ის ფიქსი (PERF-FADER-a/b) ისეთ ბიუჯეტზე უნდა შემოწმდეს, რომელსაც ნამდვილად შეუძლია ჩავარდნა. `event-share-16` ყოველთვის 0 იყო (C-R206-01). `components-per-commit` კი pointerdown-ისა და release-ის commit-ებს ურევს, ამიტომ ფიქსის შემდეგ "≤ 3 კომპონენტი თითო move-ზე"-ს ვერ აჩვენებს. ამ რაუნდში იცვლება მხოლოდ harness-ი; `app/` უცვლელია.

**რა შეიცვალა.**
- `instrumentation.ts`: capture-phase, passive window listener-ები `pointerdown` (`downs`) და `pointerup` (`ups`) timestamp-ებისთვის; `move-to-paint` sampler (`moveLatency`). ზედა ცხრილის აღწერილობები: `move-to-paint-*`, `move-components-*`, `release-commits`, `harness.move-*`.
- `budgets.json`: 20 `event-share-16` სტრიქონი წაიშალა; დაემატა 120 fader სტრიქონი (6 მეტრიკა × 5 fader × 2 მდგომარეობა × 2 rate) და 5 `harness.move-*` სტრიქონი, სულ **266**. ზედა "161 სტრიქონი" ეხება PERF-1a-ს. 20 `components-per-commit` სტრიქონის `budget` = `null`, note კი განმარტავს, რომ ის per-move მეტრიკა არ არის. არცერთი არსებული `assert` სტრიქონი არ შეცვლილა (R-2).
- pass-ის თანმიმდევრობას (ზემოთ, 1–8) **მხოლოდ 1×-ზე ემატება მე-9 ნაბიჯი**: Space → stopped, შემდეგ Pan — Music-ის სამი liveness drag: `.sync`, `.deferred` და injection-ის გარეშე `.control`. ზუსტი სია ინახება JSON-ის `sequence`-ში.
- Determinism-ის და 1×/6×-ის შემოწმება (ზემოთ) ახლა `move-components-max`-სა და `move-components-per-move`-საც ეხება. 1×/6× გაყოფა არ გამოჩნდა, ამიტომ fallback (-per-move-ის ჩვეულებრივ record-ად გადაყვანა) არ გამოგვჭირდა.
- **move-ის ფანჯრის ინტერპრეტაცია (B-მ უნდა დაადასტუროს).** task-ის ტექსტი ამბობს: "after the first pointermove". გაგზავნილი პირველი move კი pointerdown-მდე hover move-ია, ამიტომ ფანჯარა იწყება in-page pointerdown-ის შემდეგ პირველი move-იდან. pointerdown-ის commit-ები გამოთვლაში არ შედის, მაგრამ detail-ში იწერება (`downCommits`, `downComponentsMax`). `-per-move` იყოფა 120-ზე (ფანჯრის move-ები). `move-to-paint` კი ყველა 121 move-ს ითვლის.
- **I-206-d (drag-ის ორივე ბოლო).** შემოწმება: `valueLow < valueStart < valueHigh` ან `valueStart = valueHigh = max`; detail `endsCase` = `strict` | `max`. გზა (50 % → 5 % → 95 %) და 121 move უცვლელია. fader-ები relative drag-ით მოძრაობს, ამიტომ `max` შემთხვევა მოდის: track და group ორივე მდგომარეობაში (0 dB = max), master და clip gain — playing-ში (stopped drag max-ზე მთავრდება). pan და stopped master/clip gain — `strict`.

**შედეგები (round 208; ორი საბოლოო `npm run test:perf`, run3/run4, ორივე exit 0, 18/18 assert PASS, deterministic მედიანები ზუსტად ემთხვევა).**

| fader | `move-components-max` | `move-components-per-move` | `release-commits` | `move-to-paint-p95` 1× (ms, stopped / playing) | 6× (ms, stopped / playing) |
|---|---|---|---|---|---|
| track | 83 | 62.25 | 1 | 4.1–4.4 / 5.5–5.6 | 30.2–30.8 / 36.5–36.7 |
| group | 85 | 63.75 | 1 | 3.1–3.2 / 5.3–5.7 | 27.3–27.9 / 35.9–37.3 |
| master | 80 | 63.333 (stopped) / 59.333 (playing) | 1 | 2.9 / 4.9–5.3 | 23.5–24.3 / 35.4–36.1 |
| pan | 4 | 3.5 / 2.6 | 2 | 1.3 / 3.2–3.3 | 7.5 / 21.9–23.5 |
| clip gain | 87 | 82.5 / 67.5 | 1 | 27.6–30.3 / 64.4–66.2 | 56.8–59.1 / 76.7–78.2 |

კომპონენტების რიცხვები 1×-სა და 6×-ზე ერთნაირია. `move-to-paint-samples` = 121 ყველა drag-ში. Liveness: `harness.move-latency-live.sync` 31.6–32.0 ms, `.deferred` 31.2–31.3 ms (≥ 30), `harness.move-latency-control` 1.2–1.3 ms, `pointermove` listener-ები 1 → 1. `harness.move-samples-live` = 0, `harness.move-window-live` = 83. თითო run 419–421 s.

**Red-proof (scratch ასლზე, 1 pass, 1×; granted ფაილები უცვლელია).**
- (i) sampler-ის `requestAnimationFrame` ნაბიჯი ამოიღეს (შეტყობინება პირდაპირ listener-იდან იგზავნება): `harness.move-latency-live.deferred` = 0.8 ms → `assert failed` (exit 1). `.sync` = 30.9 ms, ისევ გადის.
- (ii) ფანჯარა release-ის commit-მდე გაფართოვდა: pan-ის `move-components-max` 4 → 83 (stopped და playing). `-per-move` შეიცვალა ათივე fader × მდგომარეობისთვის (მაგ. track 62.25 → 62.942). track/group/master/clip gain-ის max უცვლელია, რადგან release commit move-ის უდიდეს commit-ზე დიდი არ არის (`releaseComponentsMax`: track 83, clip gain stopped 79).
- scratch ორივე run-ში დამატებით ჩავარდა 6× `restarts` assert-ები 0 sample-ით. ეს 1×-only scratch-ის შედეგია და harness-ის ქცევას არ ეხება.

**wall-clock assert-ის გამონაკლისი.** `harness.move-latency-live.sync` და `.deferred` `wallclock` სტრიქონებია, მაგრამ `assert`. ეს შეგნებული გამონაკლისია PERF-1a-ის წესიდან („არცერთი `wallclock` სტრიქონი assert არ არის“): მათ ქვედა ზღვარს 30 ms busy-wait ადგენს და არა მანქანის სიჩქარე.

**ზღვარი.** `move-to-paint` სრულდება rAF-ის შემდეგ გაგზავნილი შეტყობინებით და frame-ის რეალურ paint-ს პირდაპირ არ ზომავს. ამ მეთოდით ამოიღება წინა ქვეთავში "ალტერნატივა, რომელიც უარვყავით" აღწერილი შეზღუდვა: handler-ის შემდეგ გადადებული render-იც ითვლება.

## TODO / შემდეგი ნაბიჯები

- **PERF-1b:** zoom, clip click, range drag, fade-handle drag, trim drag, play/pause commit size, export, bytes, DOM, memory. PERF-1b-i-ის (interaction baselines) აღწერა და შედეგები: `168-perf-interactions-baseline.md`.
- **PERF-FADER (SABA-B-5):** fader-ის preview-მ AudioParam პირდაპირ უნდა ჩაწეროს (pan-ის ნიმუში) და fader-ების `move-components-max` / `move-components-per-move` სტრიქონები `assert`-ზე (`<= 3`), ხოლო `release-commits` `assert`-ზე (`>= 1`) გადაიყვანოს. `components-per-commit` per-move მეტრიკა არ არის და `budget` = `null` რჩება; playing `restarts` სტრიქონები (მაგ. `fader.track.playing.restarts`) assert რჩება.
- **PERF-FADER-a (round 210):** track, group, master და pan fader-ების 48 სტრიქონი (`move-components-max`, `move-components-per-move`, `release-commits`; stopped/playing; 1× და `.6x`) `assert`-ზე გადავიდა; clip gain-ის სტრიქონები PERF-FADER-b-მდე `record` რჩება. დეტალები: `165-fader-pointer-preview.md`.
- **PERF-FADER-b (round 211):** clip gain-ის 12 სტრიქონი (`move-components-max`, `move-components-per-move`, `release-commits`; stopped/playing; 1× და `.6x`) `assert`-ზე გადავიდა და დაემატა members სცენარის 50 სტრიქონი (`fader.clipgain-members.*`). დეტალები: `166-clip-gain-pointer-preview.md`.
- **PERF-HARNESS-SHARED-LIB (round 223):** შესრულდა. სამი spec-ის გადაკოპირებული helper-ები და report builder `perf/lib/page.ts`-სა და `perf/lib/report.ts`-ში გადავიდა, report byte-identical დარჩა (`175-perf-harness-shared-lib.md`). ratio სტრიქონების determinism-ის ტოლერანსი (A-R214 M2) და GATE214-S1 გადადის stage b-ში (PERF-HARNESS-SHARED-LIB-b).
- **PERF-HARNESS-SHARED-LIB-b-i (round 224):** ±10 % / ±2 ტოლერანსი შეიცვალა სტრიქონის determinism contract-ით (exact / tenths / ratio, უცნობ ერთეულზე fail-closed), 1×/6× შედარება ზუსტი გახდა, `load.longtasks-over-50` `wallclock`-ზე გადავიდა (`176-perf-determinism-contract.md`). GATE214-S1-ის state wait-ები და export-ის ფანჯარა PERF-HARNESS-SHARED-LIB-b-ii-ში რჩება.
- `npx biome format perf` პროექტის `biome.json`-ით ფაილებს არ ამოწმებს; scope-ის გაფართოება root/B-ის გადაწყვეტილებაა.
- **PERF-2 (rounds 282–283):** demo synth module Web Worker-ში გადავიდა; დაემატა settled ფანჯრის ოთხი სტრიქონი (`load.script-max` `assert` `< 100`) და `load.commits` / `load.components` `wallclock`-ზე გადავიდა (`211-perf-demo-synth-worker.md`). პირველი frame-ის long task (PERF2-FIRST-FRAME-LONGTASK) ღიაა.
