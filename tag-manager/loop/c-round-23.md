# C — round 23 შემოწმება (TM-B26)

თარიღი: 2026-10-27 · Verifier: C · **taskStatus: PASS** · **realVerified: true** · bugs: 0

ლოგები და screenshot-ები: `c-round-23/`. სკრიპტები: `c-round-23/drive-r23-5.mjs`, `c-round-23/delay-write.cjs`, mutation runner `c-round-23/mut.py` (გაშვებულია `/tmp/c-r23-mut` ასლში, repository-ს გარეთ).
source-ში C-ს არაფერი ჩაუწერია. `git diff 9d1c97e -- src tests docs` C-ის phase-ის დასაწყისსა და ბოლოს ერთნაირია (`SAME_AS_START`). worktree `/tmp/c-r23-old` წაიშალა (`git worktree list` = მხოლოდ მთავარი).

## Baseline
- HEAD `bb4671d` = root-ის `chore(release): v1.4.0`, პირდაპირ `9d1c97e`-ზე. `git diff 9d1c97e bb4671d` ცვლის მხოლოდ 3 `version` ხაზს (`package.json`, `package-lock.json` ×2). baseline rule-ის მიხედვით ეს baseline-ად ითვლება.

## R23-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all`: 4 `M` (`docs/bugs/README.md`, `MetadataPanel.tsx`, `file-list.test.ts`, `metadata-panel-batch-save.test.ts`) და 1 `??` (`docs/bugs/001-save-and-selection-known-limits.md`).
- `git diff --quiet 9d1c97e -- . ':!<4 owned>' ':!package.json' ':!package-lock.json'` → 0. package*.json root-ის release commit-ია.
- `git diff 9d1c97e -- tests/ | grep '^-[^-]'`: მხოლოდ 5 `beforeEach` `mockClear` ხაზი. `file-list.test.ts`-ში წაშლილი ხაზი არ არის (0).
- (z12) არის TM-B25 describe-ის ბოლო `it`, (z11)-ის შემდეგ, წინ ერთი ცარიელი ხაზით. (i1)/(i2) არის ერთ ახალ describe-ში `mock isolation (A-R21-04)`, ფაილის ბოლოს. ორმაგი ბრჭყალები შენარჩუნებულია.
- src diff: მხოლოდ D-32. ერთი `getState()` snapshot გამოიყენება single payload-ში, batch loop-ში და D-30-ში. deps ერთ ხაზზეა, `editingMetadata`-ის გარეშე. 6 cast წაიშალა. კომენტარი, `any`, `@ts-ignore`, ახალი `as` და ახალი export არ არის. `grep -c " as "`: `9d1c97e` **8** → A **2**.
- README: +1 row, სხვა ცვლილება არ არის.
- `a-round-23-result.json` → `permission_denials: []`. **A-ს transcript ხელმისაწვდომი იყო** (`375165ac-….jsonl`). repository-ში ჩაწერა მხოლოდ Edit/Write-ით მოხდა: `MetadataPanel.tsx` (12 Edit), `001-…` (1 Write + 6 Edit), batch-save test (4 Edit), `file-list.test.ts` (2 Edit), README (2 Edit). Bash-ში `cp`/`sed -i` მხოლოდ `/tmp/a-r23-*` ასლებზე იყო, ან ეს იყო gitignored output-ის `rm`. `git stash` არ გამოყენებულა.

## R23-2 red/green + equivalence — PASS
1. `git worktree add --detach /tmp/c-r23-old 9d1c97e` + `node_modules` symlink + A-ს ორი test ფაილი → renderer **201/201, 10 ფაილი**. D-32 behaviour-neutral-ია, (z12) pin-ია.
2. A-ს ხის ასლი (`/tmp/c-r23-mut`), ხუთივე `beforeEach` ხაზი `mockClear`-ზე (MI-all) → **1 failed / 49 passed**. ვარდება (i2): `AssertionError: promise rejected "Error: leaked" instead of resolving` (`:1150:67`, Caused by `:1142:68`).
3. A-ს ხე (gate-ში) → renderer **201/201, 10 ფაილი**.

## R23-3 mutations — PASS (`c-round-23/mutants.log`)
| mutant | შედეგი |
|---|---|
| M7 (`if (!e.shiftKey) anchorPathRef.current = file.path;`) | killed, 1/19: (z12) `expected [ 'dx.wav' ] to deeply equal [ 'cx.wav', 'dx.wav' ]` |
| MI-1 writeMetadataBatch | killed by (i2): `promise rejected "Error: leaked" instead of resolving` |
| MI-2 readMetadataBatch | killed by (i2): `expected { '/leaked.wav': { title: 'leaked' } } to deeply equal {}` |
| MI-3 writeMetadata | killed by (i2): `promise rejected "Error: leaked"…` (`:1152`) |
| MI-4 readMetadata | killed by (i2): `expected { title: 'leaked' } to deeply equal {}` |
| MI-5 scanFolder | killed by (i2): `promise rejected "Error: leaked"…` (`:1154`) |
| MS-1 (`startEditingMetadata = editingMetadata` + `editingMetadata` deps-ში, cast-ები წაშლილი) | **გადარჩა**, 50/50. ეს დაგეგმილი equivalent-ია: click-ის მომენტში closure = store. იგივეს ადასტურებს R23-2 ნაბიჯი 1 |

სხვა survivor არ არის.

## R23-4 gate — PASS (`c-round-23/verify.log`, `e2e-retries0.log`)
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand` → **EXIT=0**.
- Fixtures created. Biome: 0 error, **8 warning**, `9d1c97e`-ის სიის იდენტური (`c-round-22/biome-new-list.txt`):
  - FileList:82 useKeyWithClickEvents;
  - TagsInput:45, TemplatePicker:195, input:13, select:13 noLabelWithoutControl;
  - AudioPlayer:138, FolderBrowser:213 useKeyWithClickEvents;
  - toast:12 useExhaustiveDependencies.
  - `MetadataPanel.tsx`-ზე warning არ არის.
- typecheck (node/web/test) 0. renderer **201/201** (10). main **93/93** (11). E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, EXIT=0.
- შენიშვნა: `biome.json` `tests/**`-ს არ ამოწმებს, როგორც `9d1c97e`-ზე (`No files were processed`). ეს ცვლილება არ არის.

## R23-5 real app — PASS (`c-round-23/r23-5-new.json`, `r23-5-new-*.png`; პირველი run `r23-5-new-run1.json` იგივე შედეგით, reader-ის შუალედური შემოწმების გარეშე)
- აპი: A-ს ხის build (`out/`, gate-მა ააგო), Playwright `_electron`, `xvfb-run`, `--no-sandbox`, `-r delay-write.cjs` (3000 ms `meta:write`/`meta:write-batch`), იზოლირებული `XDG_CONFIG_HOME`. მხოლოდ folder dialog არის stub-ით.
- `sample.wav` → `a.wav`, `b.wav`, `c.wav` temp folder-ში. საწყისი ffprobe/mm: ICAT და comment არ აქვს.
1. a: Category `R23A`, Comment `R23Single` → `Tags saved`. ფორმა სწორია, Save disabled. **ffprobe ICAT=R23A, comment=R23Single; music-metadata `exif:ICAT`=R23A, comment=R23Single.**
2. b click → Shift-click c → header `2 files selected`. Category `R23Batch` → `Save to 2 files` → `Tags saved to 2 files`. **b, c: ffprobe + mm ICAT=R23Batch, comment უცვლელი (არ აქვს, როგორც თავიდან); a კვლავ R23A.**
3. a click, Category `R23Delay` → Save Tags. Comment `R23Typed` აიკრიფა 576 ms-ზე, ღილაკი იყო `Saving...`, toast მოვიდა 3066 ms-ზე. toast-ის შემდეგ ფორმა: Category `R23Delay`, Comment `R23Typed`, **Save enabled**. მეორე Save → `Tags saved` (3056 ms), Save disabled.
4. schema editor (`Customize Fields`) → `R23note` (Text) → `Add Field` → `Done`. ფორმა: header `a.wav`, Category `R23Delay`, Comment `R23Typed`, `R23note` ცარიელია, Save disabled, `Failed to read` toast არ ყოფილა. b click → Category `R23Batch`, comment ცარიელი.
5. საბოლოო reader-ები:
   - a: ffprobe `{comment: R23Typed, ICAT: R23Delay, IKEY: ""}`; music-metadata `exif:ICAT`=R23Delay, `exif:ICMT`=R23Typed, comment=R23Typed.
   - b, c: ICAT=R23Batch ორივე reader-ით, comment არ აქვთ.
   - ორივე reader ყველა ველზე ემთხვევა.
- `pageErrors` = []. toasts: `Tags saved`, `Tags saved to 2 files`, `Tags saved` (+ მეორე). `Unsaved changes` და `Failed` არ ყოფილა. Artists record only (TM-B08), არ შემოწმებულა.
- red reference საჭირო არ იყო: ყველა ნაბიჯი მოსალოდნელ (`9d1c97e`-ის) ქცევას ემთხვევა.

## R23-6 docs — PASS
- `docs/bugs/001-save-and-selection-known-limits.md`: ქართული, English ტექნიკური ტერმინებით. 8 ჩანაწერი, ყველა ID ადგილზეა (RR-R21-02, A-R21-02, A-R21-01, A-R21-03, B-R19-01, RR-R20-01, B-R21-02 ×3, RR-R22-01, A-R22-01, RR-R22-02, A-R22-02).
- თითო ჩანაწერს აქვს severity, file:line, reproduction (start → action → result), D-ID, test ან `ტესტი არ არის`, და სტატუსი.
- სტატუსები: 1–3, 8 = `ცნობილი შეზღუდვა`; 4–7 = `Saba-ს კითხვა`.
- `file:line` A-ს ხეზე შემოწმდა:
  - `MetadataPanel.tsx`: `:43` (isSameFieldValue vs startMetadata), `:101-102` (discard toast), `:138` (`readMetadata(path, fields)`), `:149` (`setEditingMetadata({ ...updated })`), `:156-158` (batch loop), `:201`/`:221`/`:228` (`handleSchemaChanged`);
  - `FileList.tsx`: `:63-66`, `:70` (anchor), `:109` (hasSelection), `:112-114` (effect);
  - `file-store.ts:74-88` (`selectRange`).
- test-ები grep-ით არსებობს: (y4) `metadata-panel-batch-save.test.ts:985`; (z8) `:308`, (z10) `:328`, (z12) `:361` `file-list.test.ts`-ში. სახელები სიტყვასიტყვით ემთხვევა.
- `feature-status.md:274-277` (სრული row-ები წაკითხულია) D-29 (toast უცვლელი, list არ იკეტება), D-30 („არარსებული key განსხვავებულად ითვლება“, რაც entry 2-ს ემთხვევა) და D-31 (anchor = path, ყოველი click, იწმინდება ცარიელ selection-ზე, `selectRange` უცვლელი) არ ეწინააღმდეგება. D-32-ის აღწერა task-ს ემთხვევა.
- README: +1 row `001`, სტატუსი = ცნობილი შეზღუდვების სია.

## Bugs
- არ არის.

## დაკვირვებები B-სთვის (არა bug)
- A-ს qa-engineer-ისა და code-reviewer-ის info: `selectedFiles`/`fields` `handleSave`-ში კვლავ closure-იდან მოდის, snapshot კი store-იდან. დღეს ერთმანეთისგან ვერ განსხვავდებიან. C ეთანხმება, რომ ეს scope-ს გარეთაა.
- `handleSchemaChanged` component ტესტით კვლავ დაფარული არ არის. real app-ში (ნაბიჯი 4) სწორად მუშაობს.

## BLOCKED (ამ round-ის ნაწილი არ არის)
- Windows packaging is not available in the cloud.
