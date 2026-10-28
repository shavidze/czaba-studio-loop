# B — Round 34 დახურვა / Round 35 გეგმა

Planner: B · თარიღი: 2026-10-28 · Repository HEAD: `3035ffc` (root-მა round 34 გამოაქვეყნა; working tree სუფთაა; B-ის phase-ში repository-ის src არ შეცვლილა — ყველა ექსპერიმენტი throwaway copy-ში, `/tmp/b35`)

## 1. Round 34 შედეგი (C-ის მტკიცებულებიდან)
- **C: PASS**, R34-1…R34-6, `realVerified=true` (`c-round-34.md`/`.json`). root gate: `published`, commit `3035ffc`; review COMMIT OK (`gates/round-34/review.md`: 0 critical/high/medium, 4 low, 1 არქიტექტურის შენიშვნა).
- **TM-B36 → done** (D-41 verified). დაიხურა: C-R33-02, QA-R33-01, C-R33-01, RR-R33-03, A-R33-04. A-R33-02-ის ნაწილი (2) დაიხურა, ნაწილი (1) TM-B37-შია.
- ძირითადი მტკიცებულება:
  - red 279/2 `9f5ac51`-ზე, symptom-ზე: (e1) `:166:37`, (e2) `:179:37`; green 281/281.
  - SM-1…SM-5 და DM-3 მოკლულია; CM-7 ეკვივალენტურია, C-ის არგუმენტით.
  - gate: 281/93/7, `--retries=0` 7/7.
  - real app Q/QD: ძველ build-ზე editor თავისით იხურება (+4012 / +3252 ms), ახალზე ღია რჩება `QTyped`-ით. N ორივეზე ~136 ms-ია.
  - sha256 უცვლელია; ffprobe + music-metadata ველ-ველ ემთხვევა.
- **B-ის შეცდომა, ღიად (B-R34-01):** round 34-ის task-ში RR-R33-03 ასე ჩამოვაყალიბე: "schema fails to load". ეს მცდარია, რადგან reject-ებული `loadSchema` `isLoaded`-ს მაშინვე true-ზე აყენებს (`App.tsx:37-39`). 5 s ლოდინი მხოლოდ ნელი ან დაუსრულებელი `loadSchema`-ს დროს ხდება. A-მ და code-reviewer-მა docs სწორად დაწერეს, C-მ კოდთან შეამოწმა. დახურულია.

## 2. ახალი finding-ები და მარშრუტი
| ID | Severity | მარშრუტი |
|---|---|---|
| QA-R34-01 | low | **TM-B37, round 35** (D-43). B-მ red-ად reproduce გააკეთა: (b5) |
| RR-R34-01 | low | **TM-B37** (D-42-ის catch). (b4) baseline-ზე Unhandled Rejection-ს იძლევა |
| RR-R34-02 | low | **TM-B37** (= QA-R33-02) |
| C-R34-02 | low | **TM-B38** (ახალი, test-only). მიზეზის hypothesis ქვემოთაა, §3 |
| C-R34-03 | info | **TM-B38**: (e5)-ის სახელი docs-თან ერთად |
| C-R34-01 | low | **TM-B39** (ახალი). selection-ის ქცევა იცვლება, ამიტომ reference-first წესი მოქმედებს |
| RR-R34-03, RR-R34-04 | info | დახურულია (root-ის commit message / დაკვირვება) |
| RR-R34-05 | info | signal. B round 35-ისთვის უფრო მცირე D-42 + D-43-ს ირჩევს, რადგან D-41 instance-ებს უკვე იზოლირებს |
| B-R34-02 | info | TESTING.md წესის კანდიდატი → TM-B38 |
| B-R34-03 | low | ცნობილი შეზღუდვა, docs entry 19 (round 35) |

## 3. Round 35 = TM-B37 (D-42, D-43)
round-ში სამი მჭიდროდ დაკავშირებული ბაგია (policy-ის ზღვარი), სამივე Done-ის flow-ში:
1. busy state / re-entrancy (RR-R33-01 medium, QA-R33-02, RR-R34-02);
2. last-writer-wins (QA-R34-01);
3. `onSave`-ის reject (RR-R34-01).

- **Reference** (task-ის Reference სექცია):
  - R1: Save Tags-ის `disabled` + `Saving...` იმავე აპში;
  - R2: Mp3tag-ის "Writing tag-data" progress dialog (developer-მა non-blocking ვერსია უარყო);
  - R3: Microsoft-ის progress controls;
  - R4: W3C APG list (`aria-disabled` focusable control-ისთვის, სხვა შემთხვევაში HTML `disabled`);
  - R5: GitLab/Fluid (native `disabled` focus-ს კარგავს).

  Deviations 1–4 მიზეზებით task-შია. Kid3 და Soundminer სიღრმისეულად არ მოძებნილა; მათ ქცევას B არ იგონებს.
- **B-ის red reproduction** (`b-round-34-exp/`, throwaway copy `/tmp/b35`, `git archive 3035ffc`):
  - `red-run.log`: **284 passed / 3 failed of 287 + 1 Unhandled Rejection**. ჩავარდნილია (b1) (Done disabled არ არის), (b2) (`expected 3 to be 2`) და (b5) (`qtwo` აკლია); Unhandled Rejection (b4)-დან მოდის.
  - (b3) და (b6) green-ია.
- **Prototype** (`prototype.diff.txt`):
  - 287/287 18 ფაილში, სამჯერ ზედიზედ გაშვებით;
  - Biome 0/8, tsc web + test სუფთა.
  - შენიშვნა: prototype-ში `isApplying` `fieldError`-ის შემდეგ დგას, `schemaReadIdRef` კი `skipSyncRef`-ის შემდეგ. task-ი ორივეს სხვა ადგილს უთითებს (effect-ის შემდეგ და `handleSchemaChanged`-ის თავზე), რომ docs-ის line ref-ები ნაკლებად გადაიწიოს. ქცევა იგივეა.
- **Mutants** (`mutants.log`):
  - BM-1 → (b1)(b2), BM-2 → (b1), BM-3 → (b4), BM-4 → (b1), BM-5 → (b1)(b2), DM-8 → (b5), DM-10 → (b5);
  - BM-6 გადარჩა: ეკვივალენტურია მხოლოდ იმიტომ, რომ `onClose` unmount-ს აკეთებს;
  - DM-9 გადარჩა: B-ის ეკვივალენტობის არგუმენტი task-შია, C-მ უნდა შეამოწმოს ან უარყოს.
- **C-R34-02-ის მიზეზის hypothesis:** იგივე 6 ტესტი `screen.getByRole` button lookup-ით 11.8 s გრძელდება, `querySelectorAll('button')` text lookup-ით კი 0.84 s. B-ის პირველ სრულ prototype run-ში ტესტები ერთმანეთის მიყოლებით ჩავარდა: body ცარიელი იყო, რაც წინა ტესტის timeout-ზე მიუთითებს. მომდევნო სამი run 287/287 იყო. გაზომილია მხოლოდ ერთ ფაილზე, ამიტომ ეს hypothesis-ია და არა დადასტურებული ფაქტი → TM-B38.

## 4. ფაილები, რომლებიც B-მ შეცვალა
- `tasks/round-34.md`: round 34-ის task-ის ასლი (ადრე არ არსებობდა, byte-identical).
- `backlog.json`: `b-round-34-update-backlog.py`; წინა ვერსია `b-round-34-backlog-before.json`-შია.
  - TM-B36 done; D-41 verified;
  - TM-B37 in_progress (round 35, D-42, D-43);
  - ახალი: TM-B38, TM-B39, D-42, D-43;
  - 12 ახალი finding;
  - round 34 PASS, round 35 planned.
- `feature-status.md`: `b-round-34-update-feature-status.py`; წინა ვერსია `b-round-34-feature-status-before.md`-შია.
- `current-task.md`: round 35.
- `b-next.json`.
- `b-round-34-exp/`: test draft, prototype diff, red/green ლოგები, mutants.

## 5. COMPLETE / BLOCKED შემოწმება
- **COMPLETE არა:** ღიაა TM-B37 (medium), TM-B38, TM-B39, TM-T0/TM-T0-CI/TM-T0-CI-FU/TM-B14 (root-ის Actions link), TM-T1-MIG/TM-T1-DUP, TM-B05/06/08/11 და blocked TM-T2/TM-T2-DATA.
- **BLOCKED არა:** TM-B37-ს მომხმარებლის input არ სჭირდება. UX-ის არჩევანი reference-first წესით არის დასაბუთებული.
- Saba-ს კითხვების batch (`b-round-23.md` §5 და სხვ.) უცვლელად ღიაა.
