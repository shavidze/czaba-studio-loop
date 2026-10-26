# B — Round 8-ის დახურვა, Round 9-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `4a2062d9258cb97e3d45866d553c58bdbdf65498`. root-მა round 8 გამოაქვეყნა, tree სუფთაა (`git status --porcelain` ცარიელია). წყაროს არ შევხებივარ. ექსპერიმენტი რეპოზიტორიის გარეთ, `/tmp/b-r8`-ში გავუშვი.

## Round 8: შედეგი
- **C: PASS** (R8-1…R8-7), **realVerified=true**, ბაგი 0.
  - red `28ad3ab`-ის `metadata.ts`-ზე: 3 failed (a), (c1), (d) / 8 passed → green 11/11;
  - mutation-ები M1–M5 მოკლულია, ყველა `tsc`-ს გადის;
  - gate: renderer 107, main 62 (55 + 7), E2E 7/7 `--retries=0`;
  - რეალური app, ცუდი schema (`riffChunkId: 'AB'`):
    - after: toast `… Failed to write metadata: RIFF INFO fields could not be written: AB`, sha256 უცვლელია;
    - before (`28ad3ab`): `Tags saved`, `ICAT`=`DOORWood`, `AB` არ იწერება. **ჩუმი დანაკარგი რეალურ app-ში დადასტურდა** (R7-ის დასკვნა ახლა ფაქტია);
    - batch: მხოლოდ Category → `Tags saved to 2 files`; Bad-ის შეცვლით → `0 saved, 2 failed`;
    - ჩვეულებრივი schema: ICAT 8 / IKEY 10 / ICMT 10, ffprobe და music-metadata ეთანხმება.
- **Root gate:** published `4a2062d`, review COMMIT OK, critical/high არ არის.
- **არქივი:** `tasks/round-8.md` არის `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp` OK).

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-B13 | **done**, realVerified=true, `4a2062d` | C R8-1…R8-7 |
| D-18 | **done** R8 | C R8 |
| RR-R7-01, RR-R7-02, RR-R7-03, RR-R6-04 | **closed** | C R8-7 (docs, `grep '//'` ცარიელი), R8-1…R8-5 |
| RR-R8-01…03 | low signal-ები: `String()` ზედმეტია; ორმაგი ბრჭყალები (→ TM-B06); ცარიელი read `catch {}` | root review R8 |
| RR-R8-04 | არქიტექტურის **signal**: schema-ს ვალიდაცია load-ზე. ემთხვევა B-R7-02-ს → Saba-ს კითხვა | root review R8 |
| A-R8-01 | info: contract doc-ის header/`## შემოწმება` D-17/D-18-ს არ ახსენებს | A R8 |
| A-R8-02 | low: ბიბლიოთეკა ID-ს JS string length-ით ამოწმებს და არა ბაიტებით | A R8, C R8 შენიშვნა |
| C-R8-01 | low, **დაუდასტურებელი**: batch-ის ჩავარდნის შემდეგ panel-ში „Multiple values“ ჩანს. ბაგია თუ არა, უცნობია | C R8 შენიშვნა |
| TM-T0-CI / TM-T0 | უცვლელად `in_progress` | root-ს `7879ee0`-ის შემდგომი Actions run ჯერ არ მიუბამს |
| TM-T0-CI-FU | todo → **in_progress R9**; RR-R1-01, C-R4-01, RR-R4-02, RR-R4-05 → R9 | ქვემოთ |
| D-19 (ახალი) | ქვემოთ | B |
| rule (R8) | `npm run x -- args` args-ს სკრიპტის **ბოლო** ბრძანებას აწვდის | B ექსპერიმენტი |

**თხოვნა root-ს (განმეორებით):** მიაბით `Check` run-ის id და შედეგი ნებისმიერ commit-ზე: `7879ee0`, `a8c1b53`, `d52354d`, `28ad3ab`, `4a2062d` ან round 9-ის commit. ეს BLOCKED არ არის: გადაწყვეტა root-ზეა და არა Saba-ზე.

## რატომ TM-T0-CI-FU ახლა (გეგმის ცვლილება, ღიად)
ბექლოგის შენიშვნა ამბობდა: „დაიგეგმოს `7879ee0`-ის Actions run-ის შემდეგ“. B ამ რაუნდს **წინ წევს**. მიზეზები:
- ეს ერთადერთი scope-ია, რომელსაც Saba-ს გადაწყვეტილება არ სჭირდება. დანარჩენი ღია item-ები D-07, D-10/TM-B11, D-12/TM-B08, TM-T1-DUP, TM-B05, TM-B06 ან TM-T2-DATA-ს ელოდება.
- root-ის run-ის მიბმა შედეგს ადასტურებს, მაგრამ ლოკალურ fix-ს არ ბლოკავს. TM-T0-CI-ის acceptance „`7879ee0` ან მოგვიანებით“-ია, ასე რომ round 9-ის commit-იც ითვლება.
- RR-R1-01 (medium) round 1-იდან ღიაა და იმავე ფაილს ეხება.

ეს არც scope-ის შემცირებაა და არც გადადება. root-ს ან Saba-ს შეუძლია უარი თქვას.

## B ფაქტები (`4a2062d`)
- `apt-install.sh` worst case = 2 × (240 + 10) + recovery (240 + 10) = **750 s** > 600 s (step `timeout-minutes: 10`).
- `disable_man_db_triggers`-ში `sudo debconf-communicate` timeout-ის გარეშე ეშვება (ხაზი 20). ამიტომ ბიუჯეტი საერთოდ არ არის შეზღუდული.
- kill-after hard-coded `10`-ია, ამიტომ shim-ებით პატარა T-ის run ფორმულას მთლიანად ვერ ამოწმებს.
- `/tmp/b-r8` ექსპერიმენტი: `"a": "echo first && echo second"`, `npm run a -- --retries=0 --reporter=list,html` → `second --retries=0 --reporter=list,html`. ესე იგი `npm run test:e2e -- …` flag-ებს Playwright-ს აწვდის.

## D-19 (B, ტექნიკური, შექცევადი)
- **knob-ები:**
  - `APT_ATTEMPT_TIMEOUT_SECONDS`: T, 240;
  - `APT_ATTEMPTS`: N, 2;
  - `APT_KILL_AFTER_SECONDS`: K, 10. ადრე hard-coded იყო;
  - `APT_RECOVERY_TIMEOUT_SECONDS`: R, 60. ახალია.
- `dpkg --configure -a` და `debconf-communicate` R + K-ით არის შეზღუდული.
- პირველი ხაზია `apt-install: worst case Ws`, სადაც W = (R+K) + N(T+K) + (N−1)(R+K). default-ებით ეს **640**-ია. `check.yml`-ის apt step-ს აქვს `timeout-minutes: 13` (780 s).
- `check.yml`: Build step ამოღებულია. `Build and E2E tests` = `xvfb-run -a npm run test:e2e -- --retries=0 --trace=retain-on-failure --reporter=list,html`. ffprobe step E2E-მდე რჩება.
- importer-ის კონტრაქტს არ ეხება. D-ID მხოლოდ CI-ის გადაწყვეტილების ჩასაწერადაა.

## Round 9: გეგმა (`current-task.md`)
- **ფაილები:** `.github/scripts/apt-install.sh`, `.github/workflows/check.yml`, `docs/ci-cd.md` (ქართული სექცია). `src/**` და `tests/**` გაყინულია.
- **Acceptance:**
  - R9-1: static + diff;
  - R9-2: shim-ები a–h + mutation; wall ≤ დაბეჭდილი W + 3 s;
  - R9-3: ბიუჯეტი default-ებით, 640 < 780;
  - R9-4: real apt;
  - R9-5: CI-რიგის replay, `playwright-report/index.html` და `--retries=0`;
  - R9-6: gate (107 / 62 / 7);
  - R9-7: real-app smoke;
  - R9-8: frozen ფაილები + docs.
- TM-T0-CI-FU-ის Actions ნაწილი TM-T0-CI-სთან ერთად რჩება, სანამ root run-ს არ მიაბამს. C-ს ის PASS-real-ად არ ჩაეთვლება.

## Scope-ის შემცირება
არ არის. ყველა ღია item ბექლოგშია. არცერთი არ გადამიდია და არც deferred გამიხდია Saba-ს გარეშე.

## Saba-ს კითხვები (უცვლელია, ერთი დამატებით)
- D-07 (TM-T1-MIG);
- D-10 + TM-B11;
- D-12/TM-B08 + B-R6-01;
- TM-T1-DUP;
- D-15 + RR-R5-01;
- **B-R7-02/RR-R8-04** (`riffChunkId`-ის ვალიდაცია schema-ს load-ზე);
- TM-B05, TM-B06, RR-R1-07, RR-R3-05;
- TM-T2-DATA.
