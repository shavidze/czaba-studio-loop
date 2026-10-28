# Studio-ს რესურსების baseline-ები (PERF-1b-ii): WAV export, memory, DOM, JS bytes

**თარიღი:** 2026-10-28
**სტატუსი:** Completed (C round 216 PASS)
**შეცვლილი პროექტი:** Store (მხოლოდ სატესტო ინფრასტრუქტურა და docs; `app/` არ შეცვლილა)

## კონტექსტი

perf-plan-ის PERF-1-ის მოთხოვნაა: harness-მა "prints and checks every baseline below". PERF-1a (doc 163) fader-ებს ზომავს, PERF-1b-i (doc 168) interaction-ებს. PERF-1b-ii (D-29z206, D-29z217) PERF-1b-ის ბოლო ნახევარია: WAV export-ის long task-ები და peak memory, backing store ready-ზე, DOM-ის რაოდენობა clip-ზე და JS bytes route-ზე. ეს რიცხვები შემდეგი PERF ეტაპების (PERF-11…PERF-14) საწყისი წერტილია. ამ რაუნდში ბიუჯეტები არ აწესდება: ყველა მეტრიკა `record`-ია.

## მიდგომა

- **მესამე, თვითკმარი spec** (D-29z217, tech-lead): `perf/studio-lab-resources.perf.spec.ts`, ერთი ტესტი `studio-lab perf harness PERF-1b-ii`. PERF-1b-i-დან გადმოკოპირდა მხოლოდ საჭირო helper-ები (`nowIn`, `snapshot`, `waitForQuiet`, `blurActive`, `reactRendererProblem`, `rateRowId`, `formatLimit`, `audioClips`, ready-ის ლოდინი და report-ის ლოგიკა: budget id-ების შემოწმება, 3-ის median, determinism, `complete`, `failures`). playback helper-ები არ გადმოსულა. ორი არსებული spec და `perf/lib/**` უცვლელია; მესამე ასლი ცნობილი ვალია (PERF-HARNESS-SHARED-LIB, D-29z215).
- **ცალკე budget-ები და შედეგები.** `perf/budgets.resources.json` (61 სტრიქონი, ყველა id `res.`-ით იწყება, owner `PERF-1b-ii`), იტვირთება `loadPerfBudgets`-ით; override: `PERF_BUDGETS_RESOURCES`. შედეგები: `test-results/perf/perf-1b-ii-<ISO>.json` და `test-results/perf/latest-resources.json`, `harness: 'PERF-1b-ii'` და `reactRenderer` ველით. `latest.json` და `latest-interactions.json` ამ spec-ს არ ეხება. ორი წესი იგივეა: "measured row without a budget row" და "row not measured 3 times".
- **Pass-ები.** 3 pass 1×-ზე, შემდეგ 3 pass 6×-ზე. თითო pass ახალი browser context-ია, 1440×900, `acceptDownloads: true`. 6×-ზე `Emulation.setCPUThrottlingRate` ირთვება ready-ისა და Add-ის შემდეგ (როგორც PERF-1a-სა და PERF-1b-i-ში) და მხოლოდ ორი export იზომება.
- **`.6x` სუფიქსის წესი.** `.6x` აქვს ყველა `res.export.1.*` და `res.export.2.*` სტრიქონს და იმ liveness სტრიქონებს, რომლებიც 6×-ის export-ს სჭირდება (`res.harness.clips-1`, `clips-2`, `export-1-produced`, `export-2-produced`, `mem-polls-1`, `mem-polls-2`). მხოლოდ 1×-ზეა: `res.mem.*`, `res.dom.*`, `res.js.*` და `res.harness.js-*-seen`.
- **Row design (D-29z174).** ყველა მეტრიკა `record`-ია; `assert` მხოლოდ liveness სტრიქონებია. deterministic: DOM-ის რაოდენობები, bytes (`res.export.*.bytes`, `res.js.*`), 1-clip-იანი `longtasks-over-50` 1×-ზე და MiB სტრიქონები (0.1-მდე დამრგვალებული). trend (±30 %): `wall-ms`, `longtask-max`, `loaf-blocking-max` და ყველა `.6x` მეტრიკა.
- **Determinism-ის შემოწმების სიმკაცრე.** harness-ის შიდა შემოწმება frozen `countsAgree`-ს იყენებს (±max(2, 10 %)), ამიტომ მცირე რაოდენობებზე (0/1) და MiB სტრიქონებზე ის თითქმის ვერასდროს ჩავარდება. რეალური determinism-ის მტკიცებულებაა A-ისა და C-ის run-ების median-ების ხელით შედარება (იხ. ცხრილი).
- **დროის ლიმიტი.** მოთხოვნა: report-ის `durationMs` ≤ 8 წთ. გაზომილი ≈ 1 წთ, ამიტომ წინასწარ დაშვებული fallback (6×-ის 2-clip-იანი export-ის მოხსნა) არ დასჭირდა. დაცვისთვის spec ახალ pass-ს აღარ იწყებს, თუ ტესტი 8 წთ-ზე მეტია (failure "time guard"; pass-ის უარესი შემთხვევა ≈ 6 წთ, ასე რომ 15 წთ-იან Playwright limit-მდე არ მიდის). `durationMs ≤ 8 წთ`-ს spec თავად არ ამოწმებს; ის C-ის row-ია.

### Pass-ის თანმიმდევრობა (1×)

1. **Ready.** `/studio-lab`, PERF-1b-i-ის იგივე ready სიგნალი (ბიბლიოთეკის Add enabled, preview waveform-ის bar-ები დახატულია). CDP `HeapProfiler.collectGarbage`, შემდეგ `Runtime.getHeapUsage` → `res.mem.backing-ready-mib`, `res.mem.used-ready-mib`; `res.dom.page-0`.
2. **Add.** clip, მისი waveform და "სიჩუმე" (React commit-ების გარეშე ≥ 200 ms). `res.harness.clips-1`, `res.dom.page-1`, `res.dom.clip-subtree` (პირველი `[data-clip-kind="audio"]` + შთამომავლები), `res.dom.ruler-1` (`[data-testid="arrangement-ruler"]` + შთამომავლები; ატრიბუტი `ArrangementRuler.tsx`-ის root `div`-ზეა, early return-ის გარეშე, და `StudioWorkspace.tsx`-ში უპირობოდ არის mount-ებული — A-მ ხელახლა შეამოწმა grep-ით).
3. **Export WAV, 1 clip.** `Export` ღილაკი → dialog; `arrangement-export-format-wav` checked-ია (default; მოწმდება, არ იკლიკება). მოწმდება, რომ dialog-ში "WAV created" ჯერ არ წერია (თორემ pass წყდება). click-მდე იდგმება ერთჯერადი `MutationObserver`, რომელიც ტექსტის გამოჩენის `performance.now()`-ს იწერს, და რეგისტრირდება `waitForEvent('download')`; შემდეგ click `Export WAV`-ზე. **ფანჯარა:** click-ის `pointerdown`-იდან (instrumentation-ის `downs`; click-ის task-ის long task ამით არ იკარგება) MutationObserver-ის დრომდე. ფანჯრის დახურვის შემდეგ 200 ms ლოდინია, რომ ბოლო `longtask`/LoAF entry მოვიდეს (ფილტრი კვლავ `startTime ≤ ფანჯრის ბოლო`). შემდეგ `Done`.
4. **Export-ის შემდეგ.** ისევ GC → `res.mem.backing-after-export-delta-mib` (leak სტრიქონი).
5. **Ctrl+D და მეორე export.** clip header-ზე click, blur, Ctrl+D (dialog დახურულია; ღია dialog-ზე Ctrl+D იგნორდება). `res.harness.clips-2`, `res.dom.page-2`, `res.dom.ruler-2`, `res.dom.page-per-added-clip` (= page-2 − page-1). შემდეგ იგივე export → `res.export.2.*`.
6. **JS bytes.** თითო route-ზე ახალი context, cache გამორთულია (`Network.setCacheDisabled`), CDP `Network` ჩართულია `goto`-მდე; ლოდინი `load` + 1 s ქსელის სიჩუმე (მაქს. 8 s). route-ის key-ები: `studio-lab`, `home`, `studio-guard`.

```mermaid
flowchart LR
  A[ready + GC heap] --> B[Add: DOM rows]
  B --> T{6x?}
  T -- yes --> TH[CPU throttle 6x]
  T -- no --> C
  TH --> C[Export WAV 1 clip: long tasks, LoAF, heap poll, header]
  C --> D[1x: GC leak row]
  D --> E[Ctrl+D: DOM rows]
  E --> F[Export WAV 2 clips]
  F --> G[1x: JS bytes per route, fresh contexts]
```

### Export-ის მეტრიკები

| მეტრიკა | წესი |
|---|---|
| `wall-ms` | page-ის საათით click-იდან "WAV created" ტექსტამდე |
| `longtasks-over-50` | `longtask` entry-ები > 50 ms ფანჯარაში (instrumentation-ის `longtask` observer) |
| `longtask-max` | უდიდესი `longtask` (0, თუ არ არის) |
| `loaf-blocking-max` | უდიდესი LoAF `blockingDuration` ფანჯარაში. spec-ს აქვს საკუთარი `long-animation-frame` observer, რადგან `perf/lib/instrumentation.ts` მხოლოდ `duration`-ს ინახავს. თუ entry-ს `blockingDuration` არ აქვს, failure იწერება. LoAF `duration` არ გამოიყენება (ის ყოველთვის > 50 ms-ია) |
| `peak-backing-delta-mib` | `Runtime.getHeapUsage().backingStorageSize`: ფანჯრის ნიმუშებისა და ერთი **ფანჯრის ბოლოს ნიმუშის** max, მინუს ready-ის მნიშვნელობა. ბოლოს ნიმუში იკითხება ტექსტის აღმოჩენისთანავე (საბოლოო run-ებში 23–50 ms ტექსტის შემდეგ, scratch run-ში 61 ms-მდე; `detail.endSampleLagMs`). `detail`-ში ცალკეა `windowPeakMib` და `endSampleMib` |
| `bytes` | ჩამოტვირთული ფაილის ზომა (მხოლოდ მაშინ, თუ header-ის შემოწმება გავიდა) |
| `mem-polls-N` (liveness) | ნიმუშები, რომელთა CDP request-ი ფანჯრის დაწყების შემდეგ გაიგზავნა და პასუხი ფანჯრის დასრულებამდე მოვიდა (Node `Date.now()` შედარებულია page-ის `performance.timeOrigin + t`-თან; ერთი მანქანის საათი). loop-ის პერიოდი max(50 ms, CDP round trip)-ია: request-ის დაწყებიდან 50 ms, და ახალი request წინას დასრულებამდე არ იწყება |

### WAV header-ის შემოწმება (`export-N-produced`)

`export-N-produced` = 1 მხოლოდ მაშინ, თუ:

- download 60 s-ში მოვიდა (თუ არა: 0, failure და ტესტი შემდეგ ნაბიჯზე გადადის, dialog Escape-ით იხურება);
- ფაილის სახელია `czaba-studio-lab.wav`;
- RIFF/WAVE/`fmt `/`data` ჭდეები სწორია; PCM (format 1), 2 არხი, 48 000 Hz, 24 bit;
- data chunk-ის ზომა = ფაილის ზომა − 44;
- frames = data / 6 და frames = `Math.round(seconds × 48000)` ან +1. +1 ცნობილი float `Math.ceil` არტეფაქტია (B-R215-EXPORT-CEIL-FRAME), ამ რაუნდში არ სწორდება. `seconds` იკითხება dialog-ის ტექსტიდან "WAV created: mm:ss.mmm".

გაზომილი: 1 clip 29 189 420 B (4 864 896 frame = 101.352 s), 2 clip 58 378 796 B (9 729 792 frame = 202.704 s); ორივე `Math.round`-ს ზუსტად ემთხვევა.

### Memory API-ის არჩევანი და შეზღუდვები

- **`backingStorageSize`** (`Runtime.getHeapUsage`) page-ის JS heap-ის ArrayBuffer backing store-ია. ის **მხოლოდ page-ის main thread-ს** ფარავს: worker-ის ასლები (WAV encode worker-ში მიდის) და Web Audio-ს შიდა მეხსიერება (rendered `AudioBuffer`) მის გარეთაა. ამიტომ `peak-backing-delta-mib` export-ის მთლიანი memory არ არის, არამედ page-ის მხარე (`.slice()`-ის ასლები და `getChannelData`).
- ready-ის 140.3 MiB Add-მდე უკვე არსებობს (ბიბლიოთეკის წყაროები ready-ზევე decode-დება).
- **უარყოფილი:** renderer-ის RSS (`/proc/<pid>/status` VmRSS) — B-ის probe-ში ±5 MiB ხმაური და სხვა process-ების გავლენა; `performance.memory` — Chromium-ში ფიქსირებული 157 000 000 (bucketing), გამოუსადეგარია.
- `usedSize` ≈ 5 MiB, ერთ run-ში ერთ pass-ზე 5.2 იყო (იხ. ქვემოთ).
- **Polling თავად main thread-ზე მუშაობს:** `Runtime.getHeapUsage` renderer-ში სრულდება, ამიტომ მისი მცირე ხარჯი 1×-ისა და 6×-ის long task-ის რიცხვებშიც შედის.
- **რატომ ბოლოს ნიმუში.** მხოლოდ ფანჯრის ნიმუშები 1 clip-ზე ხან 37.2, ხან 65 MiB-ს აჩვენებდა (scratch run, `[74.4, 74.4, 129.9]` 2 clip-ზე), ანუ არადეტერმინისტული იყო. 37.2 MiB ემთხვევა float `.slice()` ასლებს (4 864 896 frame × 2 არხი × 4 B), 65 MiB კი მათ + worker-იდან დაბრუნებულ WAV ArrayBuffer-ს (≈ 27.8 MiB), რომელიც ფანჯრის ბოლოს, `anchor.click()`-თან ახლოს ჩნდება და GC-მდე ცოცხალია. ბოლოს ნიმუშით სტრიქონი დეტერმინისტული გახდა (ყველა pass-ზე 65 / 129.9).

### Determinism-იდან გასული სტრიქონები

წესი: თუ A-ის ორ run-ში რაოდენობა pass-ებს შორის განსხვავდება, სტრიქონი deterministic სიმრავლიდან გადის `note`-ით (STOP არ არის).

| სტრიქონი | დაკვირვება | მიზეზი |
|---|---|---|
| `res.mem.used-ready-mib` | [5.1, 5.2, 5.1] | 0.1 MiB-ის საზღვარზე GC-ის შემდეგი ნარჩენი |
| `res.export.2.longtasks-over-50` | [0, 0, 0] და [0, 0, 1] (51 ms) | 2-clip-იანი export-ის ერთი task 50 ms-ის ზღვარზეა (calibration run-ში 50 ms) |

ორივე `kind: "wallclock"`-ია და `note`-ში ეს მნიშვნელობები წერია.

### GATE206-S5: საერთო `build/` საქაღალდე

- `test:perf`-ის webServer უშვებს `npm run build && npx remix-serve build/server/index.js`-ს, `reuseExistingServer: false`-ით (`playwright.perf.config.ts` l.27–33), port 5188.
- ამიტომ ყოველი perf run თავიდან წერს საერთო `store/build/`-ს.
- ამიტომ perf run არ უნდა დაემთხვეს `npm run build`-ს, `npm run verify`-ს, gate-ის build-ს ან `build/`-ზე გაშვებულ სხვა `remix-serve`-ს.
- config ამ რაუნდში არ შეცვლილა (frozen). ეს სექცია GATE206-S5-ს ხურავს.

## გაზომილი სტრიქონები (A-ის ორი run-ის median)

წყარო: A-ის ორი საბოლოო run (`a-round-216/final-run-1.json`, `final-run-2.json`; Chromium 143, 1440×900, production build). deterministic სტრიქონების median-ები ორ run-ში ერთნაირია; ერთადერთი სხვაობა ცალკეულ ნიმუშებში: `res.export.1.peak-backing-delta-mib` [65, 65, 65] და [65.1, 65, 65] (0.1 MiB-ის დამრგვალება).

| სტრიქონი | ერთეული | kind / mode | median, run 1 | median, run 2 |
|---|---|---|---|---|
| `res.mem.backing-ready-mib` | MiB | deterministic / record | 140.3 | 140.3 |
| `res.mem.used-ready-mib` | MiB | wallclock / record | 5.1 | 5.1 |
| `res.mem.backing-after-export-delta-mib` | MiB | deterministic / record | 0 | 0 |
| `res.dom.page-0` | elements | deterministic / record | 666 | 666 |
| `res.dom.page-1` | elements | deterministic / record | 906 | 906 |
| `res.dom.clip-subtree` | elements | deterministic / record | 17 | 17 |
| `res.dom.ruler-1` | elements | deterministic / record | 267 | 267 |
| `res.dom.page-2` | elements | deterministic / record | 1126 | 1126 |
| `res.dom.ruler-2` | elements | deterministic / record | 469 | 469 |
| `res.dom.page-per-added-clip` | elements | deterministic / record | 220 | 220 |
| `res.export.1.wall-ms` | ms | wallclock / record | 389 | 452 |
| `res.export.1.longtasks-over-50` | count | deterministic / record | 0 | 0 |
| `res.export.1.longtask-max` | ms | wallclock / record | 0 | 0 |
| `res.export.1.loaf-blocking-max` | ms | wallclock / record | 0 | 0 |
| `res.export.1.peak-backing-delta-mib` | MiB | deterministic / record | 65 | 65 |
| `res.export.1.bytes` | bytes | deterministic / record | 29189420 | 29189420 |
| `res.export.2.wall-ms` | ms | wallclock / record | 751 | 747 |
| `res.export.2.longtasks-over-50` | count | wallclock / record | 0 | 0 |
| `res.export.2.longtask-max` | ms | wallclock / record | 0 | 0 |
| `res.export.2.loaf-blocking-max` | ms | wallclock / record | 0 | 0 |
| `res.export.2.peak-backing-delta-mib` | MiB | deterministic / record | 129.9 | 129.9 |
| `res.export.2.bytes` | bytes | deterministic / record | 58378796 | 58378796 |
| `res.harness.clips-1` | count | deterministic / assert | 1 | 1 |
| `res.harness.clips-2` | count | deterministic / assert | 2 | 2 |
| `res.harness.export-1-produced` | count | deterministic / assert | 1 | 1 |
| `res.harness.export-2-produced` | count | deterministic / assert | 1 | 1 |
| `res.harness.mem-polls-1` | count | deterministic / assert | 7 | 9 |
| `res.harness.mem-polls-2` | count | deterministic / assert | 14 | 14 |
| `res.export.1.wall-ms.6x` | ms | wallclock / record | 836 | 862 |
| `res.export.1.longtasks-over-50.6x` | count | wallclock / record | 2 | 2 |
| `res.export.1.longtask-max.6x` | ms | wallclock / record | 141 | 136 |
| `res.export.1.loaf-blocking-max.6x` | ms | wallclock / record | 94 | 91 |
| `res.export.1.peak-backing-delta-mib.6x` | MiB | wallclock / record | 65 | 65 |
| `res.export.1.bytes.6x` | bytes | wallclock / record | 29189420 | 29189420 |
| `res.export.2.wall-ms.6x` | ms | wallclock / record | 1383 | 1458 |
| `res.export.2.longtasks-over-50.6x` | count | wallclock / record | 2 | 2 |
| `res.export.2.longtask-max.6x` | ms | wallclock / record | 247 | 260 |
| `res.export.2.loaf-blocking-max.6x` | ms | wallclock / record | 200 | 211 |
| `res.export.2.peak-backing-delta-mib.6x` | MiB | wallclock / record | 129.9 | 129.9 |
| `res.export.2.bytes.6x` | bytes | wallclock / record | 58378796 | 58378796 |
| `res.harness.clips-1.6x` | count | deterministic / assert | 1 | 1 |
| `res.harness.clips-2.6x` | count | deterministic / assert | 2 | 2 |
| `res.harness.export-1-produced.6x` | count | deterministic / assert | 1 | 1 |
| `res.harness.export-2-produced.6x` | count | deterministic / assert | 1 | 1 |
| `res.harness.mem-polls-1.6x` | count | deterministic / assert | 11 | 11 |
| `res.harness.mem-polls-2.6x` | count | deterministic / assert | 19 | 20 |
| `res.js.studio-lab.encoded-bytes` | bytes | deterministic / record | 355155 | 355155 |
| `res.js.studio-lab.decoded-bytes` | bytes | deterministic / record | 1127433 | 1127433 |
| `res.js.studio-lab.scripts` | count | deterministic / record | 43 | 43 |
| `res.js.studio-lab.third-party-scripts` | count | deterministic / record | 0 | 0 |
| `res.harness.js-studio-lab-seen` | count | deterministic / assert | 43 | 43 |
| `res.js.home.encoded-bytes` | bytes | deterministic / record | 263099 | 263099 |
| `res.js.home.decoded-bytes` | bytes | deterministic / record | 825803 | 825803 |
| `res.js.home.scripts` | count | deterministic / record | 41 | 41 |
| `res.js.home.third-party-scripts` | count | deterministic / record | 0 | 0 |
| `res.harness.js-home-seen` | count | deterministic / assert | 41 | 41 |
| `res.js.studio-guard.encoded-bytes` | bytes | deterministic / record | 287429 | 287429 |
| `res.js.studio-guard.decoded-bytes` | bytes | deterministic / record | 921569 | 921569 |
| `res.js.studio-guard.scripts` | count | deterministic / record | 42 | 42 |
| `res.js.studio-guard.third-party-scripts` | count | deterministic / record | 0 | 0 |
| `res.harness.js-studio-guard-seen` | count | deterministic / assert | 42 | 42 |

## Findings for later PERF stages

- **PERF-14 (DOM):** clip-ის subtree 17 ელემენტია (`res.dom.clip-subtree`), მაგრამ ერთი 101 s-იანი clip-ის დამატება გვერდს ~220 ელემენტით ზრდის (`res.dom.page-per-added-clip`); მისი უმეტესი ნაწილი ruler-ია (`res.dom.ruler-2` − `res.dom.ruler-1` ≈ 202). ruler პროექტის სიგრძესთან ერთად იზრდება, ამიტომ 200 clip-ზე ≤ 2000 ელემენტის მიზანი მხოლოდ clip-ების virtualization-ით ვერ მიიღწევა; ruler-ის tick-ებიც უნდა virtualize-დეს ან ხილულ არეზე შეიზღუდოს.
- **PERF-12 (export):** 1×-ზე long task > 50 ms არ არის (`res.export.1.longtasks-over-50`; ძველი 123 ms task აღარ ჩანს), მაგრამ 6×-ზე ჩანს: `res.export.1.longtask-max.6x` ≈ 140 ms და `res.export.2.longtask-max.6x` ≈ 250–260 ms (median-ები), ანუ უდიდესი task clip-ების რაოდენობასთან ერთად იზრდება; `res.export.1.longtasks-over-50.6x` და `res.export.2.longtasks-over-50.6x` 2–3-ია. 1×-ზე 2-clip-იანი export-ის ერთი task 50 ms-ის ზღვარზეა (`res.export.2.longtasks-over-50`, ერთ pass-ზე 52 ms). peak memory წრფივია: `res.export.1.peak-backing-delta-mib` 65 MiB და `res.export.2.peak-backing-delta-mib` 129.9 MiB (≈ 0.64 MiB პროექტის წამზე) — PERF-12-ის მიზანი ≤ 40 MB. leak არ არის (`res.mem.backing-after-export-delta-mib` = 0). 6× PERF-12-ისთვის "before/after"-ის გასარჩევად საჭიროა.
- **PERF-13 (backing store):** `res.mem.backing-ready-mib` = 140.3 MiB Add-მდე (perf-plan-ის 140 MB დადასტურდა); მიზანი ≤ 60 MB.
- **PERF-11 (JS bytes):** `res.js.studio-lab.encoded-bytes` = 355 155 B (headers-ის ჩათვლით, 43 script, third-party 0); perf-plan-ის მიზანი ≤ 230 KB. შედარებისთვის: `res.js.home.encoded-bytes` 263 099 B, `res.js.studio-guard.encoded-bytes` 287 429 B (ეს sign-in guard-ის ეკრანია, არა Studio). PERF-11-მა უნდა დააზუსტოს, 230 KB headers-ით ითვლება თუ body-ით.

## შეცვლილი ფაილები

- `perf/studio-lab-resources.perf.spec.ts` (ახალი) — PERF-1b-ii harness.
- `perf/budgets.resources.json` (ახალი) — 61 budget სტრიქონი.
- `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` (ახალი) — ეს დოკუმენტი.
- `docs/implementation/2026/quarter-IV/160-…`, `161-…`, `162-…`, `168-…` — მხოლოდ l.4 (SYS-4 სტატუსის განახლება).

## პრობლემები და გადაწყვეტები

- **პრობლემა:** `perf/lib/instrumentation.ts`-ის LoAF ჩანაწერს `blockingDuration` არ აქვს, lib კი frozen-ია. **გადაწყვეტა:** spec-ის საკუთარი init script, რომელიც `blockingDuration`-ს ინახავს; ველის არქონა failure-ია.
- **პრობლემა:** "WAV created" ტექსტის ლოდინი raf polling-ით ყოველ frame-ზე DOM-ს ეძებს და 6×-ზე long task-ებს დაამატებდა; Node-ის polling კი ფანჯრის ბოლოს 100 ms-მდე აგვიანებდა. **გადაწყვეტა:** page-ის `MutationObserver` ტექსტის გამოჩენის ზუსტ დროს იწერს, Node მხოლოდ ამ ცვლადს კითხულობს (code-reviewer M1).
- **პრობლემა:** heap-ის loop click-მდე იწყებოდა, ამიტომ `mem-polls` ფანჯრის გარეთა ნიმუშებსაც ითვლიდა (code-reviewer H1). **გადაწყვეტა:** თითო ნიმუშს დროის ნიშნული აქვს და მხოლოდ ფანჯრის შიგნით ითვლება.
- **პრობლემა:** Playwright-ის action-ებს default-ად timeout არ აქვთ; დაკარგული download ან dialog ტესტს 15 წთ-მდე გაჭედავდა. **გადაწყვეტა:** action-ებზე `page.setDefaultTimeout(30 s)` (`expect`-ებს Playwright-ის ცალკე 5 s-იანი timeout აქვს), download 60 s, `download.path()` 30 s, ტექსტი 15 s, dialog-ის დახურვა 10 s; ჩავარდნილი ნაბიჯი pass-ს `abortedAt`-ით წყვეტს. დამატებით: 8 წთ-ის time guard ახალ pass-ებზე. CDP-ის `send`-ს საკუთარი timeout არ აქვს (ცნობილი, დაბალი რისკი).
- **პრობლემა:** heap-ის წაკითხვა შეიძლება არარიცხვითი იყოს. **გადაწყვეტა:** ერთი `readHeap` helper `Number.isFinite` შემოწმებით. ready-ზე და export-ის შემდეგ GC-ზე `null` failure-ს წერს; polling-ში `null` ნიმუშად არ ითვლება და failure მხოლოდ მაშინ იწერება, თუ ფანჯარაში 5-ზე ნაკლები ვალიდური ნიმუში დარჩა. არცერთი სტრიქონი `NaN`-ს არ ჩაწერს (M3 mutant).
- **შეზღუდვა:** frame-ის შემოწმება (`round` ან +1) ზუსტია მხოლოდ მაშინ, როცა clip-ის სიგრძე მილიწამების მთელი რიცხვია (ტექსტი ms-მდე მრგვალდება; demo 101.352 s ასეთია). სხვა სიგრძეზე ~24 frame-მდე სხვაობა შეიძლება. `data:` script URL third-party-ად ჩაითვლებოდა (origin `null`); დღეს ასეთი არ არის.

## ტესტირება

- `npm run typecheck` rc 0 (`perf/**` შედის `tsconfig.json`-ში). Biome `perf/`-ს არ ამოწმებს (L30), ამიტომ სტილი ხელით არის დაცული.
- `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` ორჯერ, exit 0, `failures []`, `complete: true`; `durationMs` და დეტალები A-ის ანგარიშშია (`a-round-216.md`).
- Red-proof (scratch ასლზე `/tmp`-ში): M1 "Export WAV" click-ის გამოტოვება → `res.harness.export-1-produced` ვარდება, ტესტი არ იჭედება; M2 16 bit-ის მოლოდინი → `export-1-produced`/`export-2-produced` ვარდება; M3 `backingStorageSizeX` → "no finite backingStorageSize" failure, `NaN` არცერთ სტრიქონში; M4 `PERF_BUDGETS_RESOURCES`-ით `res.harness.clips-2 == 3` → ვარდება მხოლოდ ეს სტრიქონი.

## TODO / შემდეგი ნაბიჯები

- PERF-11…PERF-14-მა ამ სტრიქონებზე ბიუჯეტები (`assert`) უნდა დააწესოს თავიანთი ფიქსებით.
- PERF-HARNESS-SHARED-LIB: სამი spec-ის საერთო helper-ების `perf/lib/`-ში გატანა (OSS-LIC-ის შემდეგ).
- B-R215-EXPORT-CEIL-FRAME (+1 frame) ღიაა.
