# B — round 45-ის დახურვა / round 46-ის დაგეგმვა (2026-10-28)

## Round 45 შედეგი
- **C: PASS** (R45-1…R45-7, `realVerified=true`, bugs 0). წყარო: `c-round-45.md`/`.json`.
- **R45-1, ownership:** შეიცვალა მხოლოდ 5 owned path. frozen და protected path-ები `git diff --quiet`-ით სუფთაა.
- **R45-2, red/green და mutants:**
  - red d886bef-ის `src/`-ზე: 10 failed / 10 passed (T1-10a/b, e1–e5, e7, e10, e11). green: 31/31.
  - M1 (trim) და M2 (`['']` `removeValue`-ის ნაცვლად) მოკლულია.
  - M3 (workaround ყოველთვის) **ცოცხალი დარჩა**. მიზეზი: real WAV-ზე InfoTag ყოველთვის არსებობს (A F1), ამიტომ ეს branch, სავარაუდოდ, არ მიიღწევა. → RR-R45-02, signal.
- **R45-3, gate:** verifyCommand EXIT=0. renderer 320/320, main 109/109, E2E 7/7 (`--retries=0`-ითაც 7/7). Biome 8 warning.
- **real app (Playwright `_electron`, xvfb; სამი reader: raw INFO, ffprobe, music-metadata):**
  - R45-4: Keywords-ის გასუფთავება IKEY-ს შლის; ICAT და ICMT უცვლელია.
  - R45-5: ახალ WAV-ზე და ცარიელი custom Note-ით IKEY, ICAT და NOTE არ იწერება.
  - R45-6: 3-file batch-ში IKEY ქრება, თითოეული ფაილი თავის ICAT-ს ინარჩუნებს, მოუნიშნავი ფაილები sha256-ით იდენტურია.
  - contrast: d886bef build-ზე `IKEY:0` და `ICAT:0` ჩნდება.
- **R45-7, docs:** OK.
- **root gate:** `published`, commit **c822d7f1a60a03741c5c1052f19e934d39a85d08**. root review: COMMIT OK, 1 medium (FYI), 3 low, 1 architecture note.
- **archive:** `tasks/round-45.md`. ეს ახალი ასლია, round-45 archive მანამდე არ არსებობდა.

## Backlog / feature-status (მხოლოდ C-ის მტკიცებულებით)
სკრიპტები: `b-round-45-update-backlog.py`, `b-round-45-update-feature-status.py`. ასლები ცვლილებამდე: `b-round-45-*-before.*`.

- **TM-B11 რჩება `in_progress`.** stage 1 = verified + published c822d7f. stage 2 (numbers, D-50) = round 46.
- **D-49 → verified + published.** Q20 (whitespace-only = ცარიელი) ისევ ღიაა.
- **closed:** RR-R3-03, C-R27-02, B-R42-02.
- **C-R1-01 მხოლოდ ნაწილობრივ დაიხურა.** დაიხურა `IKEY=""`-ის ნაწილი. დამატებითი `id3 `/`LIST/MID`/`IDVX`/`JUNK` chunk-ები ბიბლიოთეკის ქცევაა და ღია signal-ად რჩება, რადგან round 45-ის scope-ში არ შედიოდა.
- **C-R6-01 და RR-R5-03 → `in_progress`** (round 46, D-50).
- **ახალი signal-ები (task-ები არ არის):**
  - **RR-R45-01 (medium, root):** ცარიელ ფაილზე `LIST/INFO` size 4-ია. B-ის round-45 probe-მა აჩვენა, რომ d886bef-ზე standard ველებით უკვე იგივე ხდებოდა, ამიტომ editor path-ისთვის ეს ახალი არ არის. importer-ის წესი („არ არის = მნიშვნელობა არ არის“) ამას ფარავს. FYI Saba-ს და importer-ის owner-ს.
  - **RR-R45-02:** workaround branch-ი, სავარაუდოდ, მკვდარია (C O1 და A F1 გაერთიანებულია).
  - **RR-R45-03:** trim-ის ასიმეტრია.
  - **RR-R45-04:** renderer-ის whitespace ტესტი არ არსებობს.
  - **RR-R45-05:** `toRiffWriteOp`.
  - **C-R45-01:** shape validation (C O4 = code-reviewer (1)).
  - **C-R45-02:** batch clear → Q21.
  - **A-R45-01:** (e9)–(e11) დამატებით ტესტებად მიღებულია.
- **D-15:** შენიშვნა დაემატა, რომ D-50 number-ის წესს ცვლის (planned).
- **round 45 entry → `published`.** round 46 entry და D-50 (planned) დაემატა.

## Round 46 = TM-B11 stage 2 (D-50)
- **რიგი:** Saba-ს Q4 ჯერ ბოლომდე არ დასრულებულა, stage 2 დარჩა. critical ან high ბაგი ღია არ არის.
- **მიზეზი (კოდის ანალიზი c822d7f-ზე):**
  - absent custom number იკითხება `0`-ად;
  - single save მთელ snapshot-ს აგზავნის;
  - `String(0)` იწერება;
  - შედეგად ჩნდება `ITKN='0'` (C-R6-01).
  - renderer-ში `0` ცარიელად ჩანს, ცარიელი input კი `0`-ს აგზავნის. ამიტომ „მნიშვნელოვანი 0“ ვერ გამოიხატება.
- **გადაწყვეტა D-50:** unset = `''`. ეს მნიშვნელობა `FieldValue`-ში უკვე არსებობს, ამიტომ `types.ts` frozen რჩება.
  - read: absent ან non-finite → `''`; standard 0 → `''`.
  - write: `''`, whitespace ან non-finite → წაშლა; finite number (0-ის ჩათვლით) იწერება.
  - input: 0 ჩანს როგორც `0`, ცარიელი → `''`.
  - badge: finite number = tagged (D-15 იცვლება).
  - template: `0`-ს ინახავს.
  - sort და FileList უცვლელია (მიზეზი task-შია).
- **(e6) არ გადატრიალდება, მხოლოდ სათაური იცვლება.** Saba Q4-ის მიხედვით `{ take: 0 }` → `'0'` სწორი ქცევაა. round 45-ის „Next“ ტექსტი („e6 flips“) ამით ზუსტდება.
- **B probe** (`b-round-45-exp-number-probe.cjs.txt`):
  - standard year/track `0`-ზე იშლება (ICRD ქრება) და bare WAV-ზე 0-ად იკითხება;
  - `ITKN '0'` ინახება და ffprobe-ში ჩანს.
- **Reference:** Mp3tag-ის forum („ცარიელი ველი არ იწერება“) და Kid3/ID3 dev list („ცარიელი frame იშლება“). official დოკუმენტაცია ვერ ვიპოვე, ეს task-ში წერია. Deviations 1–3 მიზეზებით არის ჩამოთვლილი.
- **ტესტების grep (round-44-ის წესი):** owned გახდა `file-row-display.test.ts`-ის flip-ები, `file-list.test.ts:22`, `metadata-panel-batch-save.test.ts:44`, `busy-buttons-focus.test.ts:45` და (e6)-ის სათაური. დანარჩენი ჩამოთვლილია მიზეზით.

## Saba-სთვის (FYI, არ ბლოკავს)
- **Q21 (ახალი):** batch ფორმა ცარიელია, ამიტომ batch-ში ველის გასუფთავება მხოლოდ „აკრიფე და წაშალე“ ხერხით ხერხდება (C-R45-02). უნდა აჩვენოს თუ არა batch ფორმამ საერთო მნიშვნელობა?
- **RR-R45-01:** importer-ის owner-ს უნდა ვაცნობოთ, რომ `LIST/INFO` შეიძლება sub-chunk-ების გარეშე არსებობდეს.
- **D-50 Deviations:**
  - standard Year/Track/BPM-ში `0` ვერ შეინახება (ბიბლიოთეკის შეზღუდვა);
  - number input-ის placeholder `'0'` ცარიელ ველზე შეიძლება დამაბნეველი იყოს;
  - ძველი `ITKN='0'` ფაილები ახლა `0`-ად და Tagged-ად გამოჩნდება.
- Q7 და Q9–Q20 ღიაა.

## გადაწყვეტილება
CONTINUE → round 46.
