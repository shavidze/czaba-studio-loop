# B — Round 15 დახურვა / Round 16 დაგეგმვა

თარიღი: 2026-10-27 · Planner: B

## Round 15: შედეგი
- **C: PASS**, realVerified=true (R15-1…R15-7), bugs 0. წყარო: `c-round-15.md`, `c-round-15.json`.
  - red/green: `a4ad852` worktree-ზე ახალი ტესტებით 3 failed / 10 passed. (j) და (k) ვარდება `read-batch down`-ზე, (l) `read down`-ზე, სამივე toast-ის ტექსტზე. A-ს ხეზე 13/13.
  - მუტაციები: M1s, M1b, M2, M3, M4, M5 ყველა მოკლულია.
  - gate: 120/76/7, `--retries=0` 7/7. Biome-ის 9 warning-ის სია იგივეა, რაც `a4ad852`-ზე.
  - real app: გაშვებულ main-ში `meta:read-batch` და `meta:read` handler-ები throw-ის მქონე handler-ით შეიცვალა. ეს harness-ის ცვლილებაა, source არ შეცვლილა.
    - toast-ი ზუსტად ერთია და D-24-ის ტექსტს ემთხვევა. row-ები უცვლელია, edits რჩება.
    - ffprobe და music-metadata ორივე აჩვენებს `ICAT=R15Batch` და `ICAT=R15Single`.
    - relaunch-ის შემდეგ ახალი მნიშვნელობები ჩანს.
    - red reference `a4ad852`-ზე: toast-ში ნედლი rejection-ის ტექსტია, ფაილები კი ჩაწერილია.
  - regression batch-ზე, single-ზე და `chmod 000`-ზე OK-ია.
- **Root gate:** published `5854d45` (base `a4ad852`), review COMMIT OK. ეს commit round 16-ის baseline-ია.
- არქივი: `tasks/round-15.md`. ეს `current-task.md`-ის byte-identical ასლია (`cmp`-ით შემოწმდა), არსებული არქივი არ გადაწერილა.

## Backlog-ის განახლება (მხოლოდ C-ის მტკიცებულებით)
სკრიპტები: `b-round-15-update-backlog.py`, `b-round-15-update-feature-status.py`.
- **TM-B18 → done**, realVerified=true, commit `5854d45`.
- **D-24 → done** R15.
- **RR-R13-03, B-R14-01 → closed**.
- **RR-R13-02 re-route:** მისი წინაპირობა მცდარი იყო.
  - `src/preload/index.d.ts` უკვე აბრუნებს `readMetadata: Promise<WavMetadata>`-ს და `readMetadataBatch: Promise<Record<string, WavMetadata>>`-ს (B-მ `5854d45`-ზე წაიკითხა).
  - ამიტომ cast-ების წაშლას protected ფაილი არ სჭირდება და Saba-ს აღარ ელოდება. ეს renderer-ის polish-ია RR-R15-01/02-თან ერთად.
- **ახალი signal-ები** (task-ები არ არის):
  - root review: RR-R15-01 (`catch {}` მიზეზს კარგავს), RR-R15-02 (ზედმეტი cast-ები), RR-R15-03 (dirty რჩება დადასტურებული write-ის შემდეგ, Saba-ს კითხვა), RR-R15-04 (`1 files` grammar, UI-დან ახლა არ მიიღწევა), RR-R15-05 (არქიტექტურა: `resolveSaveOutcome`, ან write-მა re-read დააბრუნოს).
  - C-R15-01: error toast ფარავს Save ღილაკს. UX/layout საკითხია, reference-first ეხება.
  - A-R15-01: ტექსტი `0 saved, N failed. Reloading failed.`.
  - B-R15-01: ექსპერიმენტების ფაქტი (იხ. ქვემოთ).
- **ახალი item TM-B19** (RR-R10-01, RR-R10-02, RR-R10-04 + A-R10-01) და **decision D-25**. ორივე ტექნიკურია, შექცევადი და მხოლოდ test harness-ს ეხება. K-4 კონტრაქტს არ ეხება.
  - RR-R10-03 ცალსახად გარეთაა: Playwright `app.process()`-ს მხოლოდ launch-ის შემდეგ იძლევა.
- `rounds[15]` → published; `rounds[16]` → planned. `feature-status.md`: header, round 15-ის შეჯამება, TM-B18/TM-B19 row-ები, finding-ები, D-24 done და D-25.

## B-ის ექსპერიმენტები (`5854d45` build, `out/main/index.js`, `xvfb-run`)
injector-ები: `b-round-15-exp-*.cjs.txt`. driver-ები: `b-round-15-exp-driver.mjs.txt` (args: `<injector> <launchTimeout> <firstWindowTimeout>`, `domcontentloaded` 3 s, close race 4 s, საჭიროების შემთხვევაში SIGKILL + `exit`-ის მოლოდინი) და `b-round-15-exp-driver2.mjs.txt`. ყველა ექსპერიმენტი ფორმატითაა: საწყისი მდგომარეობა → მოქმედება → შედეგი. ფაქტები ცალკეა, inference-ები ცალკე. ექსპერიმენტებს შორის ობოლი Electron არ დარჩენილა: E1–E6-ის შემდეგ `pgrep electron` ცარიელი იყო.

| # | Injector (`-r`) | მოქმედება | შედეგი (ფაქტი) |
|---|---|---|---|
| E1 | `block`: `Atomics.wait` 20 s require-ის დროს | `electron.launch` timeout 3000 | 3019 ms: `TimeoutError electron.launch: Timeout 3000ms exceeded.` app object არ არის |
| E2 | `exit`: `process.exit(3)` | launch 3000 | 211 ms: `Error electron.launch: Process failed to launch!` |
| E3 | `slowload`: `BrowserWindow.prototype.loadFile` 20 s-ით იგვიანებს | launch 10000, firstWindow 5000 | launch 455 ms, შემდეგ `firstWindow` TimeoutError. `loadFile`-ის დაყოვნებისას `window` event არ ჩნდება, ამიტომ load phase ამ გზით **არ** მიიღწევა |
| E4 | `slowdcl`: ready-ზე `webRequest.onBeforeRequest`-ით renderer-ის `.js` 20 s-ით იგვიანებს | launch 10000, firstWindow 5000, dcl 3000 | window 621 ms (`index.html`), შემდეგ `page.waitForLoadState: Timeout 3000ms exceeded.`, close 46 ms, exit 0. load phase მიიღწევა |
| E5 | `hangafter`: `whenReady` არასდროს resolve-დება, ready-დან 1 ms-ში 30 s `Atomics.wait` | launch 10000, firstWindow 2000 | launch 474 ms, `firstWindow` TimeoutError. `app.close()` 4 s-ში არ დასრულდა, `exitCode` null, `signalCode` null. `kill('SIGKILL')`-ის შემდეგ `exit` event მოვიდა, `signalCode === 'SIGKILL'`. RR-R10-04 რეალურია |
| E7 | injector არ არის | `/tmp`-ის driver (`b-round-15-exp-helper-smoke.ts.txt`) იმპორტს აკეთებს რეალური `launchTagManagerApp`-ის, `xvfb-run -a npx --yes tsx@4` | `title Czaba Tag Manager`, `closed`. top-level await-ით `TransformError` მოდის, რადგან repo CJS-ია; `async main()`-ით მუშაობს. C-ის R16-5 recipe მოქმედია |
| E6 | `blockpid`: pid ფაილში + 40 s block | launch 3000 | TimeoutError. pid უკვე 0 ms-ზე აღარ არსებობს, ესე იგი Playwright launch timeout-ზე process-ს თვითონ კლავს. launch phase-ში ობოლი პროცესი არ რჩება |

- Inference: დღევანდელი helper E1-ს წერს როგორც `first window did not appear within 60000 ms`, რადგან `windowAppeared=false` და `TimeoutError`. E2-ს წერს როგორც `first window failed before 60000 ms: electron.launch: Process failed to launch!`. ორივე შეცდომაში შემყვანია.
- E5 ერთი გაშვებაა. რამდენ ხანს რჩება process ცოცხალი SIGKILL-ის შემდეგ `exit`-ის მოლოდინის გარეშე, არ გამიზომავს, ამიტომ round 16-ში red ამ ნაწილზე unit ტესტით (g) მოწმდება, real ნაწილი კი მხოლოდ ინფორმაციულია.

## Round 16: არჩევანი და მიზეზი
- critical/high bug ღია არ არის. Saba-სგან დამოუკიდებელი low-ები იყო RR-R5-02 და E2E launch helper-ის ჯგუფი.
- **TM-B19 პირველია**, რადგან ექსპერიმენტებმა აჩვენა, რომ ყველა failure path რეალურ build-ზე მიიღწევა და C-ს შეუძლია მისი real შემოწმება.
- **RR-R5-02** (`file-row-display.ts`, array-ში null) რეალური app-იდან ახლა არ მიიღწევა: main ყველა მნიშვნელობას `getValuesAsStrings`/`stripRiffNulTerminator`-ით ატარებს. მისი acceptance მხოლოდ unit იქნება და task-ში ეს პირდაპირ ეწერება.
- ეს ორი ერთმანეთთან მჭიდროდ დაკავშირებული არ არის (სხვადასხვა ფაილი, სხვადასხვა layer), ამიტომ ერთ round-ში არ შევაერთე.
- scope: სამი bug (RR-R10-01, RR-R10-02, RR-R10-04) და მათი ტესტები (A-R10-01). ეს policy-ის „≤3 მჭიდროდ დაკავშირებული bug“-ის ფარგლებშია.
  - RR-R10-03 და RR-R10-05 ცალსახად გარეთაა, მიზეზით.
  - scope ჩუმად არ შემცირებულა: A-R10-01-ის ოთხივე path დაფარულია. launch timeout, non-timeout და SIGKILL unit ტესტით და real-ით მოწმდება, domcontentloaded კი unit-ით და real E4-ით.
- **D-25-ის მთავარი არჩევანი:**
  - ტექსტი phase-ის მიხედვით იცვლება, ახალია მხოლოდ launch phase-ის ორი ტექსტი, დანარჩენი უცვლელია;
  - `{ cause }`;
  - SIGKILL-ის შემდეგ `exit`-ის მოლოდინი ≤5 s;
  - `LAUNCH_HOOK_TIMEOUT_MS` 90→100 s, რადგან worst case 90 s ხდება და hook-ის ტოლი ზღვარი margin-ს აღარ ტოვებს;
  - Playwright-ის გარეშე module, რომ main-env Vitest-მა შეამოწმოს. injector-ები repo-ში არ ინახება (D-20).
- reference-first: pure test-harness fix-ია, ამიტომ გამონაკლისი ეხება (ტექსტი task-შია).
- docs-explorer-ის კონსულტაცია საჭირო არ გახდა: Playwright-ის ქცევა პირდაპირი ექსპერიმენტით დადასტურდა (E1–E7).

## ღია / ლოდინში
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14: root-მა უნდა მიაბას მწვანე `Check` Actions run (`5854d45`, `a4ad852` ან `35ed18b`-ის შემდეგ ნებისმიერი commit).
- Saba-ს კითხვების პაკეტი: სია `current-task.md`-ის „Next“ სექციაშია. დაემატა RR-R15-03, RR-R15-05 და C-R15-01.

## b-next
CONTINUE → round 16 = TM-B19 (D-25).
