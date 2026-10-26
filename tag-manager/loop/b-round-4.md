# B — Round 4-ის დახურვა, Round 5-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `7879ee03fce194ec9ccbd544ba862cad9e80e42c`. root-მა round 4 გამოაქვეყნა, tree სუფთაა. წყაროს არ შევხებივარ.

## Round 4: შედეგი
- **C: PASS** (R4-1…R4-8), **realVerified=false**. ყველა ლოკალური real check C-მ თავად გაუშვა:
  - shim case-ები a–f და mutation;
  - real sudo + apt: 16 s;
  - სუფთა `ubuntu:24.04` container: 26 s;
  - CI-რიგის replay: ყველა step exit 0;
  - real app smoke `xvfb`-ში.

  false ნიშნავს მხოლოდ ერთს: Actions run ჯერ არ ჩანს.
- **Root gate:** verify მწვანეა (renderer 79, main 42, E2E 7/7), review COMMIT OK, publish `7879ee0`.
- **არქივი:** `tasks/round-4.md`, `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp`).

## ჩემი შეცდომის გასწორება (round 3/4)
`policy.local.md`-ში root-ის 13:45 UTC update-ის მიხედვით, Actions run `40331357825` (`c768567`) **მწვანე იყო**, 1 წთ 24 წმ, apt step 19 s. B round 3-მა ეს გამოტოვა. ამიტომ round 4-ის ტექსტი („`check.yml` არასდროს დასრულებულა“, high) მოძველებული იყო. სწორი ფორმულირებაა: hang წყვეტილი იყო, round 4 კი fail-fast hardening-ია, root-ის მიერ დასახელებული follow-up. ის მაინც სასარგებლოა.

backlog-ში:
- round 3-ის rule-ს `superseded_by` დაემატა;
- ახალი rule (R4): Actions acceptance ითვლება მხოლოდ root-ის მიბმული run id + commit-ით, ხოლო `c768567`-ის შემდეგ შეცვლილი CI ნაწილებს (T1-6 ffprobe step, `apt-install.sh`) სჭირდება მწვანე run `7879ee0`-ზე ან მოგვიანებით.

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-T0-CI | რჩება `in_progress`, realVerified=false. evidence: run `40331357825` მწვანე + C R4. real acceptance დაზუსტდა: „მწვანე run `7879ee0`-ზე ან მოგვიანებით“ | root update, C R4-1…R4-8 |
| TM-T0 | evidence: `npm ci` + postinstall Actions run-ში დადასტურდა (`40331357825`). რჩება `in_progress`, რადგან depends_on TM-T0-CI | root update |
| TM-T0-CI-FU (ახალი, low) | step budget (C-R4-01/RR-R4-02) + docs შენიშვნა (RR-R4-05) | C R4, review R4 |
| TM-B09 | → `in_progress`, round 5, D-15 | — |
| RR-R3-02 | **closed** | C R4-5 |
| RR-R4-01 (medium) | **closed, უარყოფილი**: `apt-cache show xvfb` (ubuntu-24.04, სამივე ვერსია) `xauth`-ს Depends-ში აჩვენებს. C-ის container run-ში `--no-install-recommends`-ით xauth დაყენდა (`c-round-4/r4-4-container.txt`) | B + C R4-4 |
| C-R4-01, RR-R4-02…06 | დაემატა. RR-R4-06 (ffprobe-ის შემოწმება vitest-ში / `test:contract`) არის **არქიტექტურის signal**, არა task. RR-R1-01-თან ერთად განიხილება | C R4, review R4 |
| D-15 (ახალი) | „Tagged“ badge-ის წესი, B default, Saba-ს დასადასტურებელი (TM-B09 `needs_user_note`) | — |

## Round 5: TM-B09 + RR-R2-02
**რატომ ეს:** critical ან high ბაგი არ არის ღია. ღია medium-ები:
- **RR-R1-01:** ელოდება Actions run-ს.
- **RR-R2-01:** WAV-ზე მიუღწეველია, თან გაყინულ `metadata.ts`-ს ხსნის.
- **RR-R3-01:** Saba-ს გადაწყვეტილებას ელოდება.
- **RR-R4-01:** უარყოფილია.

ამიტომ TM-B09 ერთადერთი მომხმარებლისთვის ხილული ბაგია, რომლის დაგეგმვაც ახლა შეიძლება. RR-R2-02 იმავე `FileList.tsx`-შია.

**D-15:** `meta:read` ზუსტად schema-ს key-ებს აბრუნებს, default-ებით `''` / `[]` / `0` (`readTagsFromFile`). ამიტომ „`meta`-ს ნებისმიერი key“ = „ნებისმიერი schema ველი“, და recorder-ის chunk-ები, რომლებიც schema-ში არ არის, არ ითვლება. ცარიელი მნიშვნელობა არ ითვლება, მათ შორის D-10-ის `ICAT=""`.

**ახალი export-ები:** `src/renderer/src/lib/file-row-display.ts`:
- `hasAnyTagValue`;
- `formatFirstFieldValue`, რომელიც `FileList.tsx`-დან უცვლელად გადმოდის.

**ტესტები:**
- **TM-B09:** red-first render ტესტი რეალურ `FileList`-ზე.
- **RR-R2-02:** უკვე გასწორებული ბაგის regression ტესტი. მისი red-ს C ამოწმებს mutation-ით `/tmp`-ში (R5-2).
- **C-ის real app:** contract-only ფაილი ჩანს Tagged-ად (ffprobe + music-metadata), ცარიელი save რჩება untagged, title-only ფაილი Tagged-ად ჩანს.

## Saba-სთვის ღია კითხვები (round 5-ს არცერთი არ ბლოკავს)
1. **D-07** (TM-T1-MIG): ძველი `schema.json` ავტომატურად არ მიგრირდება.
2. **D-10:** ცარიელი ველი = `""` თუ sub-chunk-ის წაშლა?
3. **D-12 / TM-B08:** შედის თუ არა artists კონტრაქტში?
4. **TM-T1-DUP / RR-R3-01:** ძველი `ICAT` ან `category` custom ველი.
5. **D-15:** „Tagged“ = ნებისმიერი არაცარიელი ველი (ახალი).
6. **RR-R1-07:** required check + `needs: check`.
7. **RR-R3-05:** `tsx` devDependency.
8. **TM-B06:** Biome `tests/`-ზე. საჭიროა `package.json` (დაცულია).
9. **TM-T2-DATA:** UCS სია + ლიცენზია (T-2 BLOCKED).

## შემდეგი
- root მიაბამს `7879ee0`-ის Actions run-ს:
  - **მწვანე:** TM-T0-CI და TM-T0 იხურება, TM-T0-CI-FU მცირე CI round-ად იგეგმება;
  - **წითელი:** attempt-ების timing ხაზები განსაზღვრავს CI round-ის scope-ს.
- შემდეგ: Saba-ს კითხვების პასუხების მიხედვით.
