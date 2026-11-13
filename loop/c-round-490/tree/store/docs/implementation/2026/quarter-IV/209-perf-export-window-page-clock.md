# Perf harness: export-ის heap ნიმუშები page-ის საათზე, request-response-ის შუა წერტილით (PERF-HARNESS-SHARED-LIB-b-ii-2)

**თარიღი:** 2026-10-31
**სტატუსი:** Completed (C round 280 PASS)
**შეცვლილი პროექტი:** Store

## კონტექსტი

PERF-1b-ii-ის (`perf/studio-lab-resources.perf.spec.ts`) export-ის ფანჯარაში heap-ის ნიმუში (`Runtime.getHeapUsage().backingStorageSize`, poll ყოველ 50 ms-ში) ითვლებოდა მხოლოდ მაშინ, თუ მისი CDP request-ი ფანჯრის დაწყების შემდეგ **გაიგზავნა** და პასუხი ფანჯრის დასრულებამდე **მოვიდა**. ფანჯარა page-ის `performance.timeOrigin`-ით გადაიყვანებოდა epoch-ზე, ნიმუშებს კი Node-ის `Date.now()` stamp-ები ჰქონდა: ორი საათი ერთმანეთს ედარებოდა, და ნიმუში, რომლის round trip-იც ფანჯრის კიდეს კვეთდა, იკარგებოდა მაშინაც, როცა ფანჯრის შიგნით იყო წაკითხული. `endSampleLagMs`-იც იმავე ორ საათს ურევდა.

liveness სტრიქონი `res.harness.mem-polls-1` 7–11 ნიმუშს ითვლიდა `>= 5`-იანი assert-ის წინააღმდეგ (R216-MEM-POLLS-HEADROOM). ეს რაუნდი PERF-HARNESS-SHARED-LIB-b-ii-ის მეორე, ბოლო ეტაპია (D-29z636; პირველი: `208-perf-harness-state-waits.md`). ამით PERF-HARNESS-SHARED-LIB-b დასრულდა. `app/**` არ შეცვლილა; ეს test-only რაუნდია.

## მიდგომა

- **ერთი საათი (D-29z646).** `probePageClock(page)` თითო export-ზე ერთხელ, `try`-ის შიგნით, `timeOrigin`-ის წაკითხვისთანავე და poll loop-ის დაწყებამდე ეშვება: 5 probe ზედიზედ (`sentAt = Date.now()`, `performance.now()` page-ში, `receivedAt = Date.now()`). ირჩევა უმცირესი round trip-ის probe; `offsetMs = (sentAt + receivedAt) / 2 − pageNow`, ამიტომ Node-ის stamp `x` page-ის საათზე არის `x − offsetMs`. ფანჯრის შიგნით probe არ ეშვება.
- **ცუდი probe ჩუმად არ გადის.** თუ საუკეთესო round trip > `clockProbeMaxRttMs` (20 ms), `result.problems`-ში იწერება `export N: the page clock probe's best round trip was X ms (limit 20 ms)`. სხვა offset-ზე ჩუმი fallback არ არის. reading-ის გარეშე probe აგდებს `the page clock probe took no reading`.
- **ფანჯრის წესი.** `heapSamplesInWindow(samples, offsetMs, from, to)` ნიმუშს ტოვებს, თუ `midpoint = (sentAt + receivedAt) / 2 − offsetMs` აკმაყოფილებს `from ≤ midpoint ≤ to`-ს; `measureExport` იძახებს `clock.offsetMs`, `t0`, `windowEnd`-ით. ორივე კიდე ერთნაირად მუშავდება.
- **უცვლელი (tech-lead-ის hard limits):** `t0`, `t1`, `windowEnd`, `wall-ms`; observer-ის დაყენება და გათავისუფლება; `observerSettleMs` (200); `snapshot`/`blockingFramesIn`; `readyBackingBytes`; `heapPollMs` (50); poll loop-ის სხეული; `< 5` და no-peak problem-ის ტექსტები; ყველა სხვა სტრიქონი.
- **Detail (სტრიქონის ველები უცვლელია).** `mem-polls-N`-ის detail: `errors`, `allSamples`, `endpointRule` (ძველი წესის რაოდენობა იმავე ნიმუშებზე), `clockOffsetMs` (probe-ის offset მინუს `timeOrigin`, 0.01-მდე; დიაგნოსტიკაა, filter მას არ იყენებს), `clockRttMs`, `expectedPolls` (ფანჯარა ÷ 50 ms). `endSampleLagMs = endSentAt − clock.offsetMs − windowEnd`.
- **`heapPollMs` 50 რჩება.** უფრო მოკლე პერიოდი ფანჯრის შიგნით main thread-ზე CDP-ის სამუშაოს გააორმაგებდა, ზუსტად იმ ფანჯარაში, რომელსაც `wall-ms`, `longtask-*` და `loaf-blocking-max` ზომავს, და peak-ს უფრო დეტერმინისტულს არ გახდიდა (`tech-lead`, `performance-optimizer`).
- **ალტერნატივები, რომლებიც არ მივიღეთ:** probe ფანჯრის შიგნით (გაზომვას ცვლის); `timeOrigin` როგორც offset (MU-ORIGIN-ის კონტროლი აჩვენებს, რომ probe მას რამდენიმე ms-ში ეთანხმება, მაგრამ ცალკე გაზომვა ცუდ საათს ასახელებს); `heapSamplesInWindow`-ის vitest unit ტესტი (`perf/**` vitest-ის include-ში არ შედის, ROOT-REQ-VITEST-PERF-INCLUDE; სიგნალს live mutant-ები იძლევა).
- **ეკვივალენტობის contract-ი (D-29z647):** named exception-ები მხოლოდ: 8 სტრიქონის `note` (4 `peak-backing-delta-mib`, 4 `mem-polls`) და `res.export.1.peak-backing-delta-mib` / `res.export.2.peak-backing-delta-mib`-ის median ±0.1. დანარჩენი ყველაფერი B-ის HEAD oracle-ის (`1dbf3af`) ტოლი.

## არქიტექტურა

```mermaid
sequenceDiagram
  participant S as measureExport (Node)
  participant P as page
  S->>P: try: install WAV created observer
  S->>P: timeOrigin
  loop 5 probes
    S->>P: Date.now() / performance.now() / Date.now()
  end
  S->>S: clock = smallest RTT probe; RTT > 20 ms -> problem
  S->>P: start heap poll loop (sentAt, receivedAt per sample)
  S->>P: click primary (t0)
  P-->>S: WAV created text (t1 = windowEnd)
  S->>S: inWindow = samples with t0 <= (sentAt + receivedAt) / 2 - offsetMs <= windowEnd
  S->>S: endpointRule = old count (sentAt >= timeOrigin + t0, receivedAt <= timeOrigin + windowEnd)
```

## შეცვლილი ფაილები

- `perf/studio-lab-resources.perf.spec.ts`: `clockProbeCount`, `clockProbeMaxRttMs`, `PageClock`, `probePageClock`, `heapSamplesInWindow`; `measureExport`-ში probe და მისი problem, ფანჯრის filter, `mem-polls` detail და `endSampleLagMs`.
- `perf/budgets.resources.json`: 8 სტრიქონის მხოლოდ `note`.
- `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md`: §Export-ის მეტრიკები (`peak-backing-delta-mib` და `mem-polls-N`) და b-ii-ის TODO bullet.
- `docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md` და `176-perf-determinism-contract.md`: სტატუსი და b-ii-ის TODO bullet; 208-ში lane id-ის bullet-იც.
- `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md`, `168-perf-interactions-baseline.md`: მხოლოდ b-ii-ის TODO bullet.

## პრობლემები და გადაწყვეტები

- **Problem:** ორი საათი (Node `Date.now()` და page-ის `timeOrigin + t`) ერთმანეთს ედარებოდა. **Solution:** ერთი გაზომილი offset, ყველა შედარება page-ის საათზე; `clockOffsetMs` detail-ში აჩვენებს, რამდენით განსხვავდება probe `timeOrigin`-ისგან.
- **Problem:** კიდეზე round trip-ის მქონე ნიმუში იკარგებოდა, თუმცა ფანჯარაში იყო წაკითხული. **Solution:** შუა წერტილის წესი; ძველი რაოდენობა `endpointRule`-ში რჩება, ასე რომ სხვაობა ყოველ run-ში ჩანს.
- **Problem:** headroom-ის მოლოდინი. `tech-lead` ფიქრობდა, რომ ფანჯრის გასწორება headroom-ს მისცემდა, `performance-optimizer` — დაახლოებით +1-ს. **Solution:** გაზომვამ `performance-optimizer`-ს დაუჭირა მხარი (+0…+2 export-ზე), ამიტომ R216-MEM-POLLS-HEADROOM watch რჩება და headroom არ ცხადდება. 6×-ზე ნიმუშები `expectedPolls`-ზე ნაკლებია (export 1: 14–16 vs 21.5–23.2; export 2: 22–25 vs 32.2–36.2). B-ის დასკვნით მიზეზი ისაა, რომ throttling-ის დროს CDP round trip 50 ms-ზე გრძელია; ეს ჰიპოთეზაა: თითო ნიმუშის round trip detail-ში არ იწერება (`clockRttMs` მხოლოდ click-მდე probe-ს ეხება, 1–3 ms).
- **Problem:** შუა წერტილით "WAV created" ტექსტის წინა ნიმუში შეიძლება ფანჯარაში მოხვდეს და მისი peak (`windowPeakMib` 65.1) ბოლოს ნიმუშზე (65) მაღალი იყოს. **Solution:** `res.export.1/2.peak-backing-delta-mib`-ის median-ზე ±0.1 named tolerance (D-29z647); HEAD-ის 6× სტრიქონსაც ერთხელ უკვე ჰქონდა 65.1.

## ტესტირება

- **`npm run typecheck`:** rc 0 (ფარავს `perf/**`-ს). **`npm run lint`:** rc 0 (`perf/`-ს არ ფარავს). vitest-ის ცვლილება არ არის: `perf/**` include-ში არ შედის.
- **რეალური perf run** (`CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources`, Chromium 143.0.7499.4, production build :5188-ზე, მარტო), ორჯერ: run 1 — 1 passed (1.3 წთ, real 1m20s); run 2 — 1 passed (1.3 წთ, real 1m19s).
- **ეკვივალენტობა** (`b-round-279/scripts/equiv-check-b2.py`, oracle `b-round-279/head-results-1/`, HEAD `1dbf3af`, §2.5-ის exception-ებით): run 1 — rc 0, 0 problem, 0 tolerated; run 2 — rc 0, 0 problem, 1 tolerated (`res.export.1.peak-backing-delta-mib`: 65 → 65.1). ორივეში 61 სტრიქონი, 37 deterministic.
- **საათის მონაცემები** (`b-round-279/scripts/mempolls-diff.py`): `clockOffsetMs` −0.6 … −1.6 ms, `clockRttMs` 1–3 ms ყველა 24 export-ზე; ყველგან `value ≥ endpointRule`; Σ(value − endpointRule) = 10 (run 1) და 12 (run 2). B-ის run-ები: offset −0.5 … −2.2 ms, RTT 1–3 ms, Σ = 11, 12, 11.
- **`mem-polls` დიაპაზონები (A-ის ორი run, ახალი წესი / ძველი `endpointRule` / `expectedPolls`):**

| სტრიქონი | ახალი წესი | `endpointRule` | `expectedPolls` |
|---|---|---|---|
| `res.harness.mem-polls-1` | 9–11 | 8–10 | 9.6–10.5 |
| `res.harness.mem-polls-2` | 17–19 | 16–18 | 17.7–19.2 |
| `res.harness.mem-polls-1.6x` | 14–16 | 12–15 | 21.5–23.2 |
| `res.harness.mem-polls-2.6x` | 22–25 | 20–25 | 32.2–36.2 |

- **Peak მნიშვნელობები (median, run 1 / run 2):** `res.export.1.peak-backing-delta-mib` 65 / 65.1; `res.export.2.peak-backing-delta-mib` 129.9 / 129.9; `.6x` სტრიქონები 65 / 65.1 და 129.9 / 129.9. `endSampleLagMs` 27–60 ms (B-ის run-ებში 33–59).
- **Named mutant-ები** (scratch ასლებზე repo-ს გარეთ: `git archive 1dbf3af` + ეს diff + mutant, მხოლოდ PERF-1b-ii, მარტო):

| Id | შედეგი |
|---|---|
| MU-SIGN | წითელი: ყველა `mem-polls` 0, 32 failure; problem-ები `export 1: only 0 valid backingStorageSize samples in the window (0 invalid)` და `export 1: no peak (0 window samples, end sample read)` (export 2-ზეც) |
| MU-RTT | წითელი: 12 failure, ყველა export-ში `the page clock probe's best round trip was N ms (limit -1 ms)` (N = 1–2) |
| MU-ENDPOINT | spec გადის (1 passed); Σ(value − endpointRule) = **0** |
| MU-ORIGIN (კონტროლი) | მწვანე (1 passed); EQUIV-B2 rc 0, 0 problem, 1 tolerated (65 → 65.1); Σ = 10 |
| MU-PROBE-THROW | წითელი: ყველა pass-ის `abortedAt` = `export 1 clip`; problem მხოლოდ `aborted at export 1 clip: MU-PROBE-THROW`, „was not released“ არ არის |

## TODO / შემდეგი ნაბიჯები

- **R216-MEM-POLLS-HEADROOM** watch-ად რჩება ამ დოკუმენტის მონაცემებით: ახალი წესი export-ზე დაახლოებით +1 ნიმუშს იძლევა. თუ რომელიმე run-ში `mem-polls-1` < 7 იქნება, ის ისევ დავალება ხდება (D-29z649).
- **Round 281 (D-29z645):** შესრულდა (`210-perf-harness-load-diagnostics.md`): GATE279-S1 (ჩავარდნილი demo source load-ზე დასახელებული შეცდომით წყვეტს pass-ს, generic 90 s ან 15 s timeout-ის ნაცვლად), B-R280-CLICK-LIVE-LANE-ID (`clipTrackId` და `emptyLaneTrackId` `interact.harness.click-live`-ის detail-ში) და A-R279-REVIEW-LANE-NULL (`emptyLanePointAfterClip`-ის ტექსტში „lane null“ აღარ ჩნდება).
- **არქიტექტურის სიგნალები (დაგეგმილი არ არის):** A-R279-ARCH-IDLESETTLE-ROLES (`idleSettleMs` სამჯერ, ორი მნიშვნელობით; როლის მიხედვით სახელები) და GATE279-ARCH-COPY-STRINGS (`perf/lib/app-labels.ts` runtime-ში `collection.ts`-ს იმპორტებს).
- ROOT-REQ-PERF-TIMEOUT და ROOT-REQ-VITEST-PERF-INCLUDE root-ის გადაწყვეტილებას ელოდება.
