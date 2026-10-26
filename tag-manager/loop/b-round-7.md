# B — Round 7-ის დახურვა, Round 8-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `28ad3ab15dc10a9dd83a23d43994dfc71313cbf9`. root-მა round 7 გამოაქვეყნა, tree სუფთაა (`git status` ცარიელია). წყაროს არ შევხებივარ. ექსპერიმენტი რეპოზიტორიის გარეთ, `/tmp/b-r7`-ში გავუშვი (repo-ს `node_modules`-ით, `NODE_PATH`-ით).

## Round 7: შედეგი
- **C: PASS** (R7-1…R7-6), **realVerified=true**, ბაგი 0.
  - red `d52354d`-ზე: 2 failed (a), (c) / 11 passed → green 13/13.
  - mutation-ები M1, M2, M2b, M3, M4 მოკლულია.
  - gate: renderer 107, main 55, E2E 7/7 `--retries=0`.
  - რეალური app:
    - single save: raw `ICAT` 8 / `IKEY` 10 / `ICMT` 10 byte, NUL-ის გარეშე; ffprobe და music-metadata ეთანხმება;
    - batch: `Tags saved to 2 files`;
    - read-only ფაილით (uid 1001, `chmod 444`): `1 saved, 1 failed`, sha256 უცვლელია.
- **Root gate:** published `28ad3ab`, review COMMIT OK.
- **არქივი:** `tasks/round-7.md` არის `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp` OK).

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-B12 | **done**, realVerified=true, `28ad3ab` | C R7-1…R7-6 |
| D-17 | **done** R7. ტექსტში `meta:writeBatch` → `meta:write-batch` | C R7, A R7 |
| RR-R6-01 | **closed** (TM-B12) | C R7-1, R7-2 |
| RR-R6-02 | **closed**: pin ტესტი (i) მწვანეა `d52354d`-ზეც და `28ad3ab`-ზეც | C R7-1 |
| RR-R6-04 | → **R8** (TM-B13) | B ფაქტი (ქვემოთ) |
| RR-R7-01…05 | დაემატა: 01 docs → R8, 02 → TM-B13 R8, 03 → R8, 04 signal, 05 არქიტექტურის signal | root review R7 |
| A-R7-01 | signal: INFO-ს გარეშე WAV-ზე InfoTag title workaround-მდეც არსებობს | A R7 M2, C R7-2 M2/M2b |
| B-R7-01 | **closed**: B-ის შეცდომა task-ში (`meta:writeBatch`) | A R7 |
| B-R7-02, B-R7-03 | signal-ები: `schema.ts` `riffChunkId`-ს არ ამოწმებს; ველი `riffChunkId`-ის გარეშე ჩუმად გამოიტოვება | B კოდის წაკითხვა |
| **TM-B13** (ახალი, low, in_progress R8) | per-field catch write-ის შეცდომას ყლაპავს | RR-R7-02 + B ექსპერიმენტი |
| D-18 (ახალი) | ქვემოთ | B |
| rule (R7) | INFO-ს გარეშე WAV-ზე InfoTag უკვე არსებობს; batch channel = `meta:write-batch` | A/C R7 |
| TM-T0-CI / TM-T0 | უცვლელად `in_progress` | root-ს Actions run ჯერ არ მიუბამს |

**თხოვნა root-ს:** `7879ee0`-ის შემდეგ ოთხი publish გავიდა (`a8c1b53`, `d52354d`, `28ad3ab` და თვითონ `7879ee0`). მიაბით ნებისმიერი მათგანის `Check` run-ის id და შედეგი, რომ TM-T0-CI/TM-T0 დაიხუროს. ეს BLOCKED არ არის: გადაწყვეტა root-ზეა, არა Saba-ზე.

RR-R7-05 (`planTagWrite` + `applyTagWrite`) არქიტექტურის **signal-ია**, არა task. R8 მის ერთ ნაწილს აკეთებს (write-ის შეცდომა `save()`-მდე ჩანს), refactor-ს კი არა.

## B ექსპერიმენტი (ფაქტი / დასკვნა ცალ-ცალკე)
**ფაქტი** (`b-round-7-exp-bad-chunkid.cjs`, node-taglib-sharp 6.0.1, `sample.wav`-ის ასლები):

| `riffChunkId` | `setValuesFromStrings` | `save()` |
|---|---|---|
| `AB` | `Argument error: ID must be 4 bytes` | ხდება |
| `ICAT5` | იგივე | ხდება |
| `''` | `Argument null: id was not provided` | ხდება |
| `abcd`, `IC T`, `ქართ` | throw არ არის | ხდება |

კიდევ ორი ფაქტი:
- Biome 2 ამ `biome.json`-ით ცარიელ `catch {}`-ს არ აგდებს (ერთფაილიანი `biome check`, exit 0). ამიტომ RR-R6-04-ის კომენტარის მოშორება lint-ს არ არღვევს.
- `schema.ts` `isValidField` `riffChunkId`-ს არ ამოწმებს. SchemaEditor ID-ს ამოწმებს (`isValidRiffId`), `generateRiffId` კი 4-სიმბოლოიან ID-ს ქმნის.

**დასკვნა:** ცუდი ID write path-ს მხოლოდ ხელით შეცვლილი ან სხვა წყაროდან მოსული `schema.json`-ით აღწევს. ამიტომ TM-B13 low-ია. რომ ეს რეალურ app-შიც ჩუმი დანაკარგია (`Tags saved`, `AB` არ იწერება), ჯერ დასკვნაა. C-ის R8-4 „before“ run ამას შეამოწმებს.

## D-18 (B, ტექნიკური, შექცევადი)
- **რას აკეთებს:** custom INFO loop ყველა ველს ცდის და აგროვებს ჩავარდნილ `String(riffChunkId)`-ებს schema-ს რიგით. თუ ერთი მაინც ჩავარდა, **`file.save()`-მდე** ისვრის `Error('RIFF INFO fields could not be written: AB, …')`-ს. ფაილში არაფერი იწერება (all-or-nothing, D-17-ის მსგავსად).
- **სად ჩანს:**
  - `meta:write` → `Failed to write metadata: …`;
  - `meta:write-batch` → ფაილი `failed`-შია, დანარჩენები გრძელდება.
- **არ იცვლება:**
  - `undefined` მნიშვნელობის ველს არ ცდის;
  - ველი `riffChunkId`-ის გარეშე ისევ გამოიტოვება (B-R7-03, signal);
  - read path.

## Round 8: გეგმა (`current-task.md`)
**TM-B13** (D-18, RR-R7-02) + ორი `//` კომენტარის წაშლა (RR-R6-04, RR-R7-03) + ქართული docs შენიშვნა all-or-nothing save-ზე (RR-R7-01).

- **ფაილები:**
  - `src/main/ipc/metadata.ts`;
  - ახალი `tests/main/metadata-write-field-errors.test.ts`, შემთხვევები (a)–(e), spy-ის გარეშე, რეალური WAV-ით;
  - `docs/recording-tag-contract.md`.
- **Acceptance:**
  - R8-1: red/green;
  - R8-2: mutation-ები M1–M5;
  - R8-3: gate;
  - R8-4: რეალური app ცუდი schema-თი, single save, before + after;
  - R8-5: batch ცუდი schema-თი, მხოლოდ შეცვლილი ველი წარმატებულია, `Bad`-ის შეცვლისას `0 saved, 2 failed`;
  - R8-6: ჩვეულებრივი schema-ს რეგრესია (raw INFO + ffprobe + music-metadata);
  - R8-7: frozen ფაილები და docs.

რატომ ეს და არა სხვა:
- კრიტიკული ან მაღალი ბაგი ღია არ არის.
- ღია item-ების უმეტესობას Saba-ს (D-07, D-10/TM-B11, D-12/TM-B08, TM-T1-DUP, TM-T2-DATA) ან root-ის (TM-T0-CI) პასუხი სჭირდება.
- TM-B13 რეპროდუცირებადი ბაგია, გადაწყვეტილებას არ ითხოვს და იმავე ფაილსა და თემას ეხება, რასაც R7.
- TM-T0-CI-FU root-ის Actions run-ს ელოდება (ბექლოგის შენიშვნა).

## Scope-ის შემცირება
არ არის. ყველა ღია item ბექლოგშია; არცერთი არ გადამიდია Saba-ს გარეშე.

## დამატებითი ფაქტი (advisor-ის შემოწმების შემდეგ)
- `b-round-7-exp-valid-values.cjs`: სწორი ID `ITKN` და მნიშვნელობები `[]`, `['']`, `['a','b']`, `['ქართული']`, `['0']`, `['3']`. throw არცერთზე არ ხდება. ამიტომ D-18 მხოლოდ ცუდ ID-ზე მუშაობს, ჩვეულებრივი panel save არ ჩავარდება.
- HEAD-ზე `grep -n '//' metadata.ts` → მხოლოდ ხაზები 148 და 200.
- batch path მხოლოდ `modifiedFields`-ს აგზავნის (`MetadataPanel.tsx:84-91`), ამიტომ R8-5 (i) `Tags saved to 2 files`-ია.
