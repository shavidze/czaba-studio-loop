# A — Round 25 ანგარიში (TM-B28)

Implementer: A · თარიღი: 2026-10-27 · Baseline: `3d27ba921ab2f27e4b02a8e6bb220c2fad5850d5` (HEAD, working tree თავიდან სუფთა) · src/ უცვლელია (`git diff --quiet 3d27ba9 -- src` → 0)

## 1. Primitive-ების წაკითხვა (process)
- 14:32Z — `TESTING.md` (Read), `AGENT_DISCOVERABLE_CODE.md` (Read), `TYPESCRIPT_STRICT.md` და `GEORGIAN_DOCS.md` (`cat`, read-only). ოთხივე პირველ edit-მდე წავიკითხე.
- read-primitives PreToolUse hook **არ ამოქმედდა**: პირველი Write (`window-api-mocks.ts`) და ყველა შემდეგი Edit გავიდა primitive-ის inject-ის ან block-ის გარეშე (A-R17-02 ისევ ღიაა).
- რეპოზიტორიაში ყველა ჩაწერა Edit/Write tool-ით გაკეთდა. Bash-ით რეპოში ჩაწერილი მხოლოდ gitignored output-ია (`out/`, `test-results/`, `tests/fixtures/*.wav`). mutant-ები `/tmp/a25-mut/*` ასლებში გაეშვა (rsync + node_modules symlink). mutant script: `/tmp/a25-scripts/mutants.sh`. `git stash` არ გამოყენებულა. permission-ის უარყოფა არ ყოფილა.

## 2. შეცვლილი ფაილები
`git status --porcelain --untracked-files=all`:
```
 M docs/bugs/001-save-and-selection-known-limits.md
 M tests/renderer/components/metadata-panel-batch-save.test.ts
 M tests/renderer/components/metadata-panel-schema-change.test.ts
?? tests/renderer/helpers/window-api-mocks.ts
```
- **`tests/renderer/helpers/window-api-mocks.ts`** (ახალი):
  - ერთი export, `resetWindowApiMocks(): void`;
  - ექვსი `mockReset().mockResolvedValue(<setup.ts default>)` სტრიქონი B-ის რიგით;
  - `window.api` call time-ზე იკითხება;
  - import მხოლოდ `vi`;
  - comment, `any`, `@ts-ignore` და `as` არ არის.
- **batch-save test:**
  - წაიშალა local helper (8 სტრიქონი, მათ შორის ცარიელი);
  - დაემატა import;
  - (i3)-ს სახელი შეიცვალა: "five" → "six";
  - დაემატა `saveSchema` once-value და `saveSchema` assertion.
- **schema-change test:**
  - ექვსი inline reset სტრიქონი შეიცვალა `resetWindowApiMocks();`-ით და დაემატა import;
  - დაემატა `PATH_C`, `FILE_C` და (s8), describe-ის ბოლო test;
  - (s1)–(s7) უცვლელია.
- **docs/bugs/001:** D-33-ის note, entry 3-ის title, entry 9-ის step 4 და decision line, entry 10-ში (s7).
- სრული diff: `a-round-25/diff.patch`.

## 3. Green, უცვლელ src-ზე (parts A+B)
- `npm run test:renderer` → **208/208**, 11 file (`a-round-25/green-renderer.log`).
- `-t "i3"` → 1 passed, 207 skipped.
- `-t "s8"` → 1 passed, 207 skipped.
- `tsc --noEmit -p tsconfig.test.json` → 0.

## 4. Mutant-ები (`a-round-25/mutants.log`)
| Mutant | ცვლილება | შედეგი |
|---|---|---|
| MI-1…MI-6 | helper-ის სტრიქონი n: `mockReset`→`mockClear`; batch-save file `-t "i3"` | 6-ვე **killed** (i3, 1 failed). MI-6 = `saveSchema` |
| MB | batch-save `beforeEach`-დან `resetWindowApiMocks()` წაშლილია | **killed**, 24 test ვარდება |
| MBS | schema-change `beforeEach`-დან `resetWindowApiMocks()` წაშლილია | **survives** (8/8) |
| MA-1 | src: `if (!previous[path]) continue;` წაშლილია | **killed**, (s8) |
| MA-2 | იგივე + `previous[path] ?? {}` | **killed**, (s8) |
| MW | helper: `const capturedApi = window.api;` module load-ზე | **survives**: schema-change 8/8, batch-save 49/49 |

- **MBS-ის ახსნა:** schema-change file-ში ყველა `*Once` value (`deferSingleWrite`/`deferBatchWrite`-ის `mockReturnValueOnce`) თავისივე test-ში იხარჯება, ამიტომ once-value არ ჟონავს. persistent override-ები (`mockRejectedValue`, `mockImplementation`, `mockResolvedValue`) ჟონავს, მაგრამ ყოველი test, რომელსაც mock სჭირდება, საკუთარ override-ს თვითონ აყენებს. `mock.calls`-ის დაგროვება (s1)-ის `toHaveLength(1)`-ს ვერ არღვევს, რადგან (s1) პირველი test-ია. ეს B-ის მოლოდინს ემთხვევა: RR-R24-03-ის gap ამ file-ისთვის, finding და არა FAIL.
- **MW:** ცარიელი შედეგია. setup.ts-ის window და hoisted swap-ის შემდეგ `globalThis` ერთსა და იმავე `mockApi`-ს აჩვენებს, ამიტომ call-time წესი მხოლოდ style-ია.

## 5. საბოლოო gate (ბოლო edit-ის შემდეგ, სუფთა state-იდან)
- `rm -rf out test-results playwright-report tests/fixtures/*.wav`, შემდეგ სრული `verifyCommand` → **GATE_EXIT=0** (`a-round-25/gate.log`, 14:34:36–14:35:03Z):
  - Biome: 0 error, **8 warnings**:
    - FileList.tsx:82;
    - TagsInput.tsx:45;
    - AudioPlayer.tsx:138;
    - FolderBrowser.tsx:213;
    - TemplatePicker.tsx:195;
    - input.tsx:13;
    - select.tsx:13;
    - toast.tsx:12 (useExhaustiveDependencies).
    
    ეს 8 იგივეა, რაც `3d27ba9`-ზე. src უცვლელია და Biome `tests/`-ს არ ამოწმებს.
  - typecheck (node, web, test) 0;
  - renderer **208/208**;
  - main **93/93**;
  - E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, EXIT=0 (`a-round-25/e2e-retries0.log`).

## 6. code-reviewer (4 file)
ბლოკერი არ არის. (s8)-ის assertion-ებს, helper-ს, isolation-ს, line ref-ებს და D-33 note-ის სიზუსტეს reviewer-მა finding არ მისცა. ორი low doc finding ჩემი ownership-ის მიღმაა (task-ი ამ text-ს არ მაძლევს), ამიტომ დატოვებულია B-ისთვის:
- **A-R25-02 (low):**
  - სად: entry 3, step 3 (`docs/bugs/001…md:52`).
  - პრობლემა: წერია "(rescan ან სხვა ფაილზე გადასვლა და დაბრუნება)". სხვა ფაილზე გადასვლა disk-იდან არ კითხულობს (`MetadataPanel.tsx:111` store-ის entry-ს იღებს), ამიტომ ეს ახალ D-33 note-ს ეწინააღმდეგება.
  - რატომ არ შევცვალე: task-ი ამბობს "Nothing else in entry 3 changes".
- **A-R25-03 (low/info):**
  - სად: entry 10, step 3.
  - პრობლემა: "ფორმა არ იცვლება და edits რჩება" მხოლოდ single selection-ზეა სწორი. batch selection-ზე `:229-230` `setEditingMetadata({})` read-ის reject-ის დროსაც იძახება.
  - რატომ არ შევცვალე: task-ი entry 10-ში მხოლოდ (s7)-ის დამატებას მაძლევს.

## 7. Spec-იდან გადახვევა
- **A-R25-01:** task-ის Part C.1 note-ის მაგალითში წერია "switching to another file and back". ეს src-ზე სიმართლეს არ შეესაბამება: selection-ის შეცვლა ფორმას store-იდან ავსებს (`MetadataPanel.tsx:111`), disk-იდან არ კითხულობს. ამიტომ D-33 note-ში ჩავწერე read-ის რეალური გზები:
  - rescan ან folder-ის ხელახლა გახსნა;
  - ამ ფაილის save-ის re-read;
  - schema-ს შემდეგი ცვლილება წარმატებული read-ით.

  ასევე ცალკე ჩავწერე, რომ ფაილზე გადასვლა არ კითხულობს (`MetadataPanel.tsx:111`). reviewer-მა ეს გზები src-ში დაადასტურა (FolderBrowser.tsx:111/147, App.tsx:63, MetadataPanel.tsx:138/169/212).

## 8. Acceptance
R25-1, R25-2, R25-3, R25-4 და R25-6 ლოკალურად გავუშვი (ზემოთ), მაგრამ verdict C-ისაა. R25-5 (real-app smoke) **არ გამიშვია**: ეს C-ის შემოწმებაა და src უცვლელია. Windows packaging-ის შემოწმება BLOCKED-ია: Windows packaging is not available in the cloud.

## 9. შემდეგი შემოწმებები C-ისთვის
1. R25-1:
   - `git diff --quiet 3d27ba9 -- . ':!docs/bugs/001-save-and-selection-known-limits.md' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!tests/renderer/components/metadata-panel-schema-change.test.ts'`;
   - ერთადერთი untracked file არის helper-ი.
2. R25-2: renderer 208; `-t "i3"` და `-t "s8"` ცალ-ცალკე.
3. R25-3: `/tmp/a25-scripts/mutants.sh` შეიძლება იყოს მითითება, მაგრამ mutant-ები საკუთარ ასლებში გაუშვი. MBS-ისა და MW-ის survive ჩაწერე finding-ად.
4. R25-4: სრული gate + `--retries=0`.
5. R25-5: real app smoke (`R25T` → Save → `R25note` → `Done`; music-metadata + ffprobe).
6. R25-6:
   - grep-ით შეამოწმე (s6) და (s7);
   - გადაამოწმე A-R25-01-ის ტექსტი;
   - შეამოწმე `MetadataPanel.tsx:` ref-ები, ახალი `:111`-ის ჩათვლით.
   - A-R25-02 და A-R25-03 B-ს გადაეცი.
