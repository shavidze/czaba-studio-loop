# B — Round 9-ის დახურვა, Round 10-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `499a6f3c8867ed7e9356371df9e83713b652265a`. root-მა round 9 გამოაქვეყნა (`gates/gate-round-9.json`: published, review COMMIT OK). წყაროს არ შევხებივარ. ექსპერიმენტები რეპოზიტორიის გარეთ, `/tmp/b-r9`-ში გავუშვი. ერთადერთი გამონაკლისი: Electron-ს ვუშვებდი უკვე არსებულ `out/`-ზე (gitignored, build არ გამიკეთებია).

## Round 9: შედეგი
- **C: PASS** (R9-1…R9-8), **realVerified=true** ლოკალურ შემოწმებებზე, ბაგი 0.
  - shellcheck 0. shim (d) ყველაფერი hang-ში და TERM-ს აიგნორებს → wall 14.03 s = დაბეჭდილი W 14. (h) N=3 → 21.03 s = W;
  - 12 ცუდი knob → rc 2, 0 system call. mutation R→T დაიჭირა (16 → 20 s > W);
  - default-ებით `worst case 640s` < 780 s (13 წთ). real apt: `attempt 1/2 ok after 2s`, debconf `man-db/auto-update` true → false;
  - CI replay ×3: ყველა step 0-ით გავიდა, E2E step `out/`-ს თავად აშენებს, `--retries=0` Playwright-ამდე აღწევს, `playwright-report/index.html` იქმნება;
  - gate 107/62/7; real app DOORWood → ffprobe და music-metadata `ICAT`.
- Actions run C-ს არ უმტკიცებია, ეს სწორია.
- **Root gate:** published `499a6f3`, critical/high/medium არ არის, 3 low + 1 architecture note.
- **არქივი:** `tasks/round-9.md` = `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp` OK, overwrite-მდე).

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| RR-R1-01, C-R4-01, RR-R4-02, RR-R4-05 | **closed** R9 | C R9-1/R9-2/R9-3/R9-5/R9-8 |
| D-19 | **done** R9 | C R9 |
| TM-T0-CI-FU | **in_progress რჩება.** acceptance-ის 1–3 ხაზს რეალური ლოკალური მტკიცებულება აქვს. მე-4 ხაზი („hardened step Actions-ზე მწვანე“) realVerified=false-ია და TM-T0-CI-სთან ერთად იხურება | C R9 |
| TM-T0-CI, TM-T0 | უცვლელად in_progress | root-ს `7879ee0`…`499a6f3`-ის Actions run ჯერ არ მიუბამს |
| RR-R9-01 | low → **R10**: job 30 წთ, setup step-ებს 13 + 10 = 23 წთ შეუძლიათ დაიკავონ | root review R9 |
| RR-R9-02 | low → **R10**: `docs/ci-cd.md:239`-ის run-id წინადადება მოძველდება | root review R9 |
| RR-R9-03 | low signal: apt script-ის knob ვალიდაციას ავტომატური ტესტი არ აქვს | root review R9 |
| RR-R9-04 | architecture **signal**: W და `timeout-minutes` ხელით სინქრონდება | root review R9 |
| A-R9-01 | low signal: ძალიან დიდი knob → arithmetic overflow | A R9 code review |
| C-R9-01 | info: `Killed …` stderr ხმაური | C R9 |
| C-R9-02 → **TM-B14** (ახალი, low) | cold-start `firstWindow` 30 s; R10 | A R9 run1, C R9 |
| D-20 (ახალი) | ქვემოთ | B |
| rule (R9) | Electron main `NODE_OPTIONS=--require`-ს აიგნორებს; `-r <file>` entry-მდე args-ში მუშაობს. `retries: 1` verifyCommand-ში first-attempt ჩავარდნას მალავს | B ექსპერიმენტი |

**თხოვნა root-ს (განმეორებით, BLOCKED არ არის):** მიაბით `Check` run-ის id და შედეგი `499a6f3`-ზე ან ნებისმიერ ადრინდელ published commit-ზე. თუ run `firstWindow`-ზე წითელია, ეს TM-B14-ის რეალური ნიმუშია, ჩაწერეთ step log-ის ბოლო ხაზები.

## რატომ TM-B14 ახლა
- critical/high ბაგი ღია არ არის. დამოკიდებულებების ჯაჭვის ფესვი TM-T0-CI-ა (TM-T0 მასზეა დამოკიდებული). ის რეალური Actions run-ით იხურება `--retries=0`-ით. C-R9-02 ერთადერთი ცნობილი მიზეზია, რომელიც ამ run-ს cold runner-ზე წითლად აქცევს. Saba-ს გადაწყვეტილება არ სჭირდება.
- RR-R9-01 და RR-R9-02 იმავე ორ CI ფაილს ეხება, ამიტომ round-ში სულ სამი ერთმანეთთან მჭიდროდ დაკავშირებული item-ია.
- სხვა გადაწყვეტილების გარეშე low-ები (C-R8-01, RR-R5-02, RR-R1-04/05) R11-ის კანდიდატებად დარჩა. არცერთი არ გადადებულა.

## B ფაქტები და ექსპერიმენტები (`/tmp/b-r9`)
- **დადასტურებული:** A R9 run1-ში იმავე ფაილის იმავე app-ზე შემდეგი ტესტი 227 ms-ში გავიდა, ანუ ფანჯარა დაგვიანდა და არ დაკარგულა. ლოგში ორი timeout-ია: `firstWindow` 30000ms და `Test timeout of 30000ms`. ამიტომ მხოლოდ `firstWindow`-ის timeout-ის გაზრდა არ კმარა. ლოდინი `beforeAll`-ში უნდა გადავიდეს, hook timeout-ის გაზრდით.
- **დადასტურებული:** cold start-ს ვერ ვიმეორებ:
  - fresh `HOME`/`XDG_*` ×2: first window 0.66–0.73 s;
  - warm ×2: 0.64–0.69 s;
  - `drop_caches` ×3: 2.67 / 1.13 / 1.18 s.
  ამ job-ის ერთადერთი cold ნიმუში A-მ R9-ში უკვე გამოიყენა. ჩემმა გაშვებებმაც ეს machine გაათბო. ამიტომ R10-ის Step 0 cold sample შემდეგი job-ის A-ს სთხოვს.
- **დადასტურებული:** `NODE_OPTIONS='--require …'` Electron main-ზე არ მოქმედებს: 5 s delay-ით ფანჯარა 0.48 s-ში გაიხსნა. `-r <file>` args-ში entry-მდე მოქმედებს: 5 s delay → 5.46 s; `firstWindow({timeout: 2000})` → Timeout, 0 windows. ეს deterministic injector-ია red/green-ისთვის.
- **hypothesis:** cold start-ის მიზეზია fontconfig/shader cache-ის აგება. task-ში მიზეზად არ ჩამიწერია.

## D-20 (B, ტექნიკური, შექცევადი)
- `tests/e2e/electron-launch.ts`:
  - `launchTagManagerApp()` = launch + `firstWindow` + `domcontentloaded`;
  - `FIRST_WINDOW_TIMEOUT_MS = 60000` (launch-იდან ფანჯრამდე მთლიანი budget-ი);
  - `LAUNCH_HOOK_TIMEOUT_MS = 90000` (`test.setTimeout` `beforeAll`-ში);
  - timeout-ზე app იხურება და Error ასახელებს budget-ს, elapsed-ს და main process-ის output-ის ბოლოს.
- test-only opt-in env `TAG_MANAGER_E2E_ELECTRON_REQUIRE`: absolute path, უნდა არსებობდეს, სხვა შემთხვევაში throw. unset → args უცვლელია (D-06).
- retry fix არ არის. `playwright.config.ts` frozen რჩება.
- `check.yml`: job `timeout-minutes` 30 → 40. importer-ის კონტრაქტს არ ეხება.

## Round 10: გეგმა (`current-task.md`)
- **ფაილები:**
  - `tests/e2e/electron-launch.ts` და სამი `*.spec.ts`;
  - `.github/workflows/check.yml` (მხოლოდ job timeout);
  - `docs/ci-cd.md`.
  `src/**`, `playwright.config.ts` და დანარჩენი `tests/**` frozen-ია.
- **A Step 0:** cold sample ნებისმიერ edit-მდე (data, არა gate).
- **Acceptance:**
  - R10-1: static + ownership, spec-ებში `firstWindow` არ რჩება;
  - R10-2: red `499a6f3`-ის ასლზე 40 s delay-ით;
  - R10-3: green 7/7 ×2;
  - R10-4: 75 s → 60000 ms შეტყობინება, orphan არ რჩება; mutation-ები: `setTimeout`-ის წაშლა, ლოდინის test body-ში დაბრუნება;
  - R10-5: injector-ის კონტრაქტი;
  - R10-6: gate 107/62/7, `--retries=0` ×3, CI replay;
  - R10-7: real-app smoke;
  - R10-8: docs.
- „მწვანე cold GitHub runner-ზე“ TM-T0-CI-სთან ერთად რჩება (root). C-ს ის PASS-real-ად არ ჩაეთვლება.

## Scope-ის შემცირება
არ არის. ყველა ღია item ბექლოგშია. არცერთი არ გადამიდია და Saba-ს გარეშე deferred არ გამიხდია.

## Saba-ს კითხვები (უცვლელი)
- D-07 (TM-T1-MIG);
- D-10 + TM-B11;
- D-12/TM-B08 + B-R6-01;
- TM-T1-DUP (RR-R3-01);
- D-15 + RR-R5-01;
- B-R7-02/RR-R8-04;
- TM-B05, TM-B06, RR-R1-07, RR-R3-05;
- TM-T2-DATA.
