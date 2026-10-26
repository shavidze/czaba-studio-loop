# B — Round 10-ის დახურვა, Round 11-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `35ed18b9211f0da3d7c23e10af5b431d6f33540f`. root-მა round 10 გამოაქვეყნა (`gates/gate-round-10.json`: published, review COMMIT OK). რეპოზიტორიაში არაფერი შემიცვლია, working tree სუფთაა. ექსპერიმენტები რეპოზიტორიის გარეთ გავუშვი, `/tmp/b-r10`-ში (`git archive 35ed18b` + `node_modules` symlink).

## Round 10: შედეგი
- **C: PASS** (R10-1…R10-8), **realVerified=true** ლოკალურ შემოწმებებზე, ბაგი 0.
  - red: `499a6f3`-ის ასლზე 40 s delay-ით 7/7 ჩავარდა `firstWindow: Timeout 30000ms`-ით;
  - green: `launchTagManagerApp`-ით ×2 → 7/7;
  - 75 s delay → `first window did not appear within 60000 ms` + output tail, orphan process 0;
  - mutation (b) და (c) დაიჭირა;
  - injector-ის contract სწორია, D-06 უცვლელია;
  - gate 107/62/7, `--retries=0` ×3, CI replay;
  - real app: DOORWood → ffprobe და music-metadata `ICAT`.
- **A Step 0 cold sample:** ეს job-ის პირველი Electron launch იყო. შედეგი 7/7, C-R9-02 არ განმეორდა. ეს მონაცემია და არაფერს ამტკიცებს.
- **Root gate:** published `35ed18b`. critical, high ან medium არ არის. 4 low + 1 architecture note.
- **არქივი:** `tasks/round-10.md` არის `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp` OK, overwrite-მდე).

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-B14 | **in_progress რჩება.** acceptance-ის 1–4 ხაზს რეალური ლოკალური მტკიცებულება აქვს. ხაზი „real: cold-runner Check run green“ realVerified=false-ია და TM-T0-CI-სთან ერთად იხურება | C R10 |
| RR-R9-01, RR-R9-02 | **closed** R10 | C R10-1, R10-8 |
| C-R9-02 | fix დასრულდა. ღიაა მხოლოდ Actions run-მდე (TM-B14) | C R10-2/3/4 |
| D-20 | **done** R10. A-ს გადახრები **მივიღე**: `domcontentloaded` 15 s, close race 10 s → `SIGKILL`, სამი error ტექსტი. worst case 85 s < 90 s (root-მაც დაადასტურა). მოთხოვნილი ტექსტი ზუსტია (C R10-4a). D-20-ს `amendment` დაემატა | A, C, root review |
| rule R9 → შესწორება | `NODE_OPTIONS`-ის ეფექტს Electron არ იწვევს: Playwright თავად შლის `env.NODE_OPTIONS`-ს (`playwright-core/lib/server/electron/electron.js:164`, A R10). ჩემი R9-ის ახსნა არასწორი იყო. მექანიზმი `-r` entry-მდე სწორი რჩება | A R10 |
| rule R10 (ახალი) | MetadataPanel-ის component ტესტს `vi.hoisted` window workaround სჭირდება. მის გარეშე ტესტი ცრუ-მწვანეა | B ექსპერიმენტი |
| RR-R10-01…04 | low signals: `cause`, launch TimeoutError-ის არასწორი შეტყობინება, output launch-მდე არ იჭერება, `SIGKILL` exit-ს არ ელოდება | root review R10 |
| RR-R10-05 | architecture **signal**: worker-scoped Playwright fixture | root review R10 |
| A-R10-01 | info: გამოუცდელი failure path-ები (launch timeout, 15 s DOM, `SIGKILL`) | A R10 |
| C-R10-01 | info: un-delayed E2E 3.2 s (R9-ში 2.5 s), მიზეზი უცნობია | C R10 |
| C-R8-01 → **TM-B15** (ახალი, low) | batch-ის ჩავარდნისას აკრეფილი მნიშვნელობები იკარგება. R11 | C R8 screenshot-ები + B R10 ექსპერიმენტი |
| D-21 (ახალი) | ქვემოთ | B |
| TM-T0-CI, TM-T0, TM-T0-CI-FU | უცვლელად in_progress | `gate-round-10.json`-ში Actions run არ არის |

**`feature-status.md` გასწორდა.** round 9-ის რედაქტირებამ A-R9-01-ის ხაზი შუაში გაწყვიტა, `{0,5}$`-ზე. სავარაუდოდ ეს JS `replace`-ის `$`-pattern-მა გამოიწვია. შემდეგ ფაილის ძველი სრული ასლი ბოლოში მიეწება, ამიტომ items და findings ცხრილები ორჯერ იყო. ფაილი ხელახლა ავაწყე script-ით:
- ახალი ნაწილი შევინარჩუნე;
- A-R9-01-ის ხაზი აღვადგინე backlog-იდან;
- ძველი ასლიდან ავიღე C-R9-01, C-R9-02 და გადაწყვეტილებების ცხრილი;
- ძველი ასლის დანარჩენი წავშალე.

შედარებით დავადასტურე, რომ items ცხრილის ორი ასლი იდენტური იყო. findings ცხრილებში მხოლოდ C-R8-01 განსხვავდებოდა, ამიტომ ახალი ვერსია დავტოვე. დუბლირებული ID ახლა არ არის. ფაილის ძველი ვერსია: `/tmp/b-r10/feature-status.before.md` (job-ის შემდეგ არ შენარჩუნდება).

**თხოვნა root-ს (განმეორებით, BLOCKED არ არის):** მიაბით `Check` run-ის id და შედეგი `35ed18b`-ზე ან `499a6f3`-ზე. `35ed18b`-ის მწვანე run ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს. თუ run launch-ზე წითელია, ჩაწერეთ step log-ის ბოლო ხაზები.

## რატომ TM-B15 ახლა
- critical ან high ბაგი ღია არ არის. ყველა feature item ან Saba-ს გადაწყვეტილებას ელოდება (D-07, D-10/TM-B11, D-12/TM-B08, TM-T1-DUP, TM-B05, TM-B06), ან დაბლოკილია (TM-T2-DATA).
- გადაწყვეტილების გარეშე დარჩენილ low-ებს შორის C-R8-01 ერთადერთია, რომელიც მომხმარებლის save flow-ს ეხება: აკრეფილი მნიშვნელობები ჩავარდნისას იკარგება და Save გათიშულია. ეს რეალური UX/data-entry დანაკარგია.
- R10-ის „Next“-ში ეწერა: „ჯერ რეპროდუქცია“. ეს გავაკეთე:
  - C R8-ის screenshot-ები: Save-მდე `BATCHCat`, შემდეგ ყველაფერი ცარიელია;
  - კოდში `handleSave` batch-ში `setEditingMetadata({})`-ს უპირობოდ იძახებს;
  - ექსპერიმენტი რეალური MetadataPanel-ით და store-ებით, `35ed18b`-ზე: all-failed და partial → value `""`, isDirty false, modifiedFields `[]`.
- RR-R5-02, RR-R1-04/05 და RR-R10-* სხვა ფაილებს ეხება, ამიტომ ერთად არ დავაჯგუფე. ისინი R12-ის კანდიდატებია. არცერთი არ გადადებულა.

## B ექსპერიმენტები (`/tmp/b-r10`, ასლები loop folder-ში)
- `b-round-10-exp-batch-save.test.ts.txt`, რეალური MetadataPanel + store-ები, მხოლოდ `window.api` mock (ცხრილი `current-task.md`-შია). **დადასტურებული:** სამივე შემთხვევაში ფორმა იწმინდება, `writeMetadataBatch` იღებს `{category: 'BATCHCat'}`-ს.
- `b-round-10-exp-nohoist.test.ts.txt`, იგივე ტესტი `vi.hoisted` workaround-ის გარეშე. **დადასტურებული:** ტესტი ცრუ-მწვანეა: input-ში ტექსტი ჩანს, მაგრამ store, IPC და toast არ მოქმედებს. ამიტომ task-ი workaround-ს და IPC call-ის assertion-ს ითხოვს, C კი M4 mutation-ით ამოწმებს.

## D-21 (B, ტექნიკური, შექცევადი)
- batch save:
  - `writeMetadataBatch`-ის შემდეგ refresh რჩება როგორც დღეს;
  - `failed` ცარიელია → ფორმა იწმინდება (დღევანდელი ქცევა);
  - `failed` არ არის ცარიელი (ყველა ან ნაწილი) → `editingMetadata`, `modifiedFields` და `isDirty` რჩება, Save ჩართულია, retry ყველა არჩეულ ფაილზე წერს.
- toast-ის ტექსტები უცვლელია. single-file-ის არსებულ ქცევას ემთხვევა.
- არჩევანის ჩავარდნილ ფაილებამდე შევიწროება **არ** შედის, ეს პროდუქტის გადაწყვეტილებაა. K-4 კონტრაქტს არ ეხება.

## Round 11: გეგმა (`current-task.md`)
- **ფაილები:**
  - `MetadataPanel.tsx` (მხოლოდ batch branch);
  - ახალი `tests/renderer/components/metadata-panel-batch-save.test.ts`;
  - `docs/learning/data-flow.md`;
  - `.claude/primitives/STATE_MANAGEMENT.md` (მხოლოდ `### Save flow`, რომ primitive არ მოძველდეს).

  store-ები, main, preload და დანარჩენი tests frozen-ია.
- **Acceptance:**
  - R11-1: static + ownership;
  - R11-2: red `35ed18b`-ზე (a/b/c), green;
  - R11-3: mutation-ები M1–M4, მათ შორის workaround-ის წაშლა;
  - R11-4: gate 107+N/62/7, `--retries=0`;
  - R11-5: real app, read-only ფაილით partial → edits რჩება → retry → ffprobe + music-metadata;
  - R11-6: bad schema-თი all failed → edits რჩება, შემდეგ selection change → discard toast;
  - R11-7: regressions (batch success, single-file, template apply, folder close);
  - R11-8: docs.

## Scope-ის შემცირება
არ არის. ყველა ღია item ბექლოგშია. არცერთი არ გადამიდია და Saba-ს გარეშე deferred არ გამიხდია.
