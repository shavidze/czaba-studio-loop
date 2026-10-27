# B — Round 16 დახურვა და Round 17-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `cb2d76b0b1dbb0e5e73a70ace2c8c618c0a68ffd` (სუფთა tree, B-ის ფაზაში source არ შეცვლილა)

## 1. Round 16-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-16.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R16-1…R16-6, blocked `[]`.
- **გადამოწმებისა და მტკიცებულების ძირითადი პუნქტები:**
  - Red: `5854d45` worktree-ზე → `ERR_MODULE_NOT_FOUND`. Green: 17/17.
  - M1–M5 unit ტესტებით მოკვდა, M6 (phase იწყება `window`-ით) კი რეალური launch-ით.
  - Gate: 120/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - Real built app, რეალური budget-ებით:
    - block → `electron.launch did not finish within 60000 ms`;
    - `exit(3)` → `electron.launch failed: …` 216 ms-ში;
    - slow load → domcontentloaded 15000 ms;
    - hung main → `first window did not appear`, 70 s-ზე; pid catch-მდე უკვე მკვდარია, orphan 0.
  - Red reference `5854d45`-ის build-ზე: hung case-ში pid catch-ზე ცოცხალი იყო.
- **Root gate:** `gate-round-16.json` → `published`, commit `cb2d76b`. Review COMMIT OK, critical/high/medium 0. ეს არის შემდეგი baseline.
- **Archive:** `tasks/round-16.md` (`current-task.md`-ის ასლი, ახალი ფაილი; ძველი archive არ გადაწერილა).

## 2. Backlog-ის განახლება (`b-round-16-update-backlog.py`, idempotent)
- **TM-B19 → done:** `realVerified=true`, commit `cb2d76b`, C R16-ის evidence. D-25 → done R16.
- **D-25-ის ტექსტი გასწორდა (C-R16-01):** `ELECTRON_REQUIRE_ENV` re-export არ არის. ის `electron-launch.ts`-შივე რჩება, რადგან byte-identical `getElectronRequireArgs` მას იყენებს. C-R16-01 closed.
- **closed (TM-B19):** RR-R10-01, RR-R10-02, RR-R10-04, A-R10-01, B-R15-01.
- **ახალი signal-ები (არა task-ები):**
  - RR-R16-01: Biome ტესტებს არ ამოწმებს → TM-B06.
  - RR-R16-02: `getElectronLaunchArgs` `try`-მდე ეშვება.
  - RR-R16-03: `kill` → `false` მაინც 5 s ელოდება. B-ის შენიშვნა: null `exitCode`/`signalCode`-ის დროს ეს ნიშნავს, რომ `exit` ჯერ არ ამოსულა.
  - RR-R16-04: არქიტექტურა, საკუთარი spawn + CDP; RR-R10-03-ს უერთდება.
  - A-R16-01: `kill()` throw.
  - A-R16-02: `organizeImports` assist → TM-B06.
- **ახალი B finding B-R16-01** (E1): `formatFirstFieldValue` არა-string პირველ ელემენტს აბრუნებს.
- **ახალი item TM-B20** (RR-R5-02 + B-R16-01) და **D-26**. RR-R5-02 → in_progress.
- **rounds:** 16 → published, დაემატა 17 planned.
- **`feature-status.md`** (`b-round-16-update-feature-status.py`):
  - header, round 16-ის აბზაცი;
  - root-ის თხოვნა `cb2d76b`-ზე;
  - TM-B19 done, ახალი row TM-B20;
  - finding-ები;
  - D-15-ზე მინიშნება D-26-ისკენ, D-25 done + დაზუსტება, ახალი row D-26.

## 3. B-ის ექსპერიმენტები (round 17-ისთვის)
- **E1** (`b-round-16-exp-row-display.mts.txt`, `npx --yes tsx@4`, რეალური `cb2d76b` module repo-ს გარეთიდან):
  | შემავალი | `hasAnyTagValue` | `formatFirstFieldValue` |
  |---|---|---|
  | `[null]` | THROW `Cannot read properties of null (reading 'trim')` | `""` |
  | `[5]` | THROW `item.trim is not a function` | number `5` |
  | `[{}]` | THROW `item.trim is not a function` | object `{}` (`FileList.tsx:91` React child-ად ჩააგდებდა) |
  | `['A']` | `true` | `"A"` |
- **E2** (`b-round-16-exp-untyped-probe.test.ts.txt`):
  - `const a: WavMetadata = JSON.parse(...)` და helper-ი `JSON.parse(json) as WavMetadata` type-check-ს გადის `tsconfig.test.json`-ის პარამეტრებით (`types: []`, `/tmp/b-r16/tc`).
  - ერთადერთი შეცდომა `utils.ts`-ის `window.api` იყო, რადგან probe-ში preload d.ts არ იყო ჩართული. ის probe-ს არ ეხება.
  - task-ი ამ გზას პირდაპირ უთითებს, რათა A-ს აკრძალული cast არ დასჭირდეს.
- **E3** (`b-round-16-exp-genre.cjs.txt`, node-taglib-sharp `node_modules`-იდან, ffmpeg-ით შექმნილ WAV-ზე `/tmp`-ში):
  - genres → `IGNR`; ffprobe `genre` და music-metadata `common.genre` ორივე `R17Genre`-ია. ამიტომ R17-5-ში genre მკაცრი შემოწმებაა.
  - performers → `ISTR` ×2. ffprobe აჩვენებს მხოლოდ `ISTR: "R17 Artist B"`-ს (ბოლო მნიშვნელობას, `artist` key-ის გარეშე). music-metadata-ს `common.artists` არ აქვს, მხოლოდ native `ISTR` ×2.
  - ამიტომ R17-5-ში artists მხოლოდ ჩასაწერია, PASS/FAIL-ის კრიტერიუმი არ არის (TM-B08). C-R2-01-ს დაემატა შენიშვნა.
- **advisor-ის შემდეგ:**
  - `code-reviewer` სავალდებულოა (3 ფაილი = „3+“);
  - red-ის პროგნოზი დაზუსტდა: (b)-ის `[null," y "]` ძველ კოდზე ისვრის;
  - backlog-ის `rules`-ს დაემატა `JSON.parse`-ის pattern-ი.
- **მიღწევადობა** (კოდის წაკითხვა, `src/main/ipc/metadata.ts:44,56,136`): main ყველა array ელემენტს `stripRiffNulTerminator`/`getValuesAsStrings`-ით ატარებს, store კი მხოლოდ main-ის შედეგს იღებს. ამიტომ რეალური app-იდან ეს **არ მიიღწევა**. Task-ი ამას პირდაპირ ამბობს, და C-ს არ სთხოვს malformed მნიშვნელობის რეალურ app-ში ხელოვნურად შეყვანას.
- `git status --porcelain` repo-ში ცარიელია (ექსპერიმენტები `/tmp/b-r16`-შია).

## 4. Round 17-ის არჩევანი: TM-B20 (D-26)
- critical/high ღია არ არის. Saba-სგან დამოუკიდებელი, round 16-ის „Next“-ში დაანონსებული low არის RR-R5-02.
- **B-R16-01 იმავე 18-ხაზიან ფაილშია, ამიტომ ორი ერთად „tightly related“-ია.** მათ გარეშე `[{}]` row-ს render-ს ჩააგდებდა.
- **ownership:** `file-row-display.ts`, `file-row-display.test.ts` და `file-list.test.ts` (მხოლოდ დამატებები). docs ცვლილება არ არის.
- **acceptance:**
  - R17-1 ownership;
  - R17-2 red/green `cb2d76b` worktree-ზე;
  - R17-3 მუტანტები M1–M4;
  - R17-4 gate: 120 + new / 93 / 7;
  - R17-5 real app regression: Artists/Genres/Category UI-დან, ffprobe + music-metadata, relaunch.
  - malformed case-ის მტკიცებულება მხოლოდ R17-2/3-ია, და task-ი ამას აღიარებს.
- **MetadataPanel-ის cast cleanup** (RR-R13-02/RR-R15-02) სხვა ფაილშია და არ არის დაკავშირებული. ის შემდეგ round-ად რჩება.

## 5. Saba-ს კითხვების პაკეტი (უცვლელი, + ახალი მინიშნებები)
- D-07 (TM-T1-MIG)
- D-10 + TM-B11
- D-12/TM-B08 + B-R6-01
- TM-T1-DUP (RR-R3-01, medium)
- D-15 + RR-R5-01, და D-26 ინფორმაციისთვის
- B-R7-02/RR-R8-04
- TM-B05
- TM-B06, + RR-R14-03/05, **RR-R16-01, A-R16-02**
- RR-R1-07
- RR-R3-05
- TM-T2-DATA
- RR-R13-01
- RR-R15-03
- RR-R15-05
- C-R15-01
- optional RR-R12-02

## 6. Root-ისთვის
- `gate-round-16.json`-ში Actions run კვლავ არ არის.
- თხოვნა: მიაბით `Check` run `cb2d76b`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task-ი: round 17 TM-B20 (D-26). დარჩენილი: TM-B20, TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14, TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08, TM-T2, TM-T2-DATA, TM-B05, TM-B06.
