# B — Round 20-ის დახურვა და Round 21-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `b373b08f13069b26e89192a1229e3a4a31257e3e` (სუფთა tree, `git status --porcelain` ცარიელია; B-ის ფაზაში source არ შეცვლილა)

## 1. Round 20-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-20.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R20-1…R20-5. blocked მხოლოდ Windows packaging-ზეა (არა FAIL).
- **მთავარი evidence:**
  - Red `3006615` worktree-ზე: 7 failed / 27 passed. (x1)–(x6) და A-ს დამატებითი (x11) სიმპტომით ვარდება. (x2) `expected 'A-comment' to be 'B-comment'` = data corruption-ის მტკიცება. Green: 34/34.
  - M1–M3 და M5–M9 მოკლულია. M4 (ordered compare) equivalent-ია, როგორც დაგეგმილი იყო.
  - Gate: 173/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - Real built app, 3000 ms write delay (`-r delay-write.cjs`):
    - a.wav-ის save-ის დროს b.wav-ზე click (333 ms) → ფორმა b.wav-ის მნიშვნელობებს აჩვენებს;
    - ffprobe + music-metadata: b = B-title/B-comment/R20B, a = A-title/A-comment/R20A, genre R20Batch ორივეზე;
    - red reference `3006615` build-ზე: b.wav-ში A-title/A-comment ჩაიწერა ორივე reader-ით.
  - A-ს transcript ხელმისაწვდომი იყო: repo-ში ყველა write Edit-ით გაკეთდა.
- **Root gate:** `gate-round-20.json` → `published`, commit `b373b08`. Review COMMIT OK, finding-ები low/info (RR-R20-01…04). ეს არის შემდეგი baseline.
- **Archive:** `tasks/round-20.md`. ეს `current-task.md`-ის ასლია, ახალ ფაილად შექმნილი (`cmp` OK, ძველი archive არ გადაწერილა).

## 2. Backlog-ის განახლება (`b-round-20-update-backlog.py`, idempotent, ორჯერ გაეშვა, `cmp` OK)
- **TM-B23 → done:** `realVerified=true`, commit `b373b08`, C R20-ის evidence. D-29 → done R20.
- **TM-B24 → in_progress, round 21, D-30.** title გაფართოვდა C-ის/root-ის evidence-ით: batch all-succeeded (`:154`) და A → B → A + typing (RR-R20-02) იგივე ბაგია. acceptance დაიწერა. ეს scope-ის გაზრდაა, არა შემცირება.
- **A-R17-02:** ღია რჩება. A-ს თქმით hook R20-შიც არ ამოქმედდა. კვლავ root-ს გადაეცა.
- **B-R19-01:** დაემატა root-ის RR-R20-01 (იგივე toast) და მისი შეთავაზება. კვლავ Saba-ს კითხვაა.
- **A-R19-02:** R20 re-check. ფორმის ნაწილი D-29-მა გაასწორა ((x4)). stray key და ახალი folder-ის scan რჩება signal-ად.
- **TM-B06:** შენიშვნა `() => {}` placeholder-ებზე (A-ს code-reviewer).
- **ახალი signal-ები (არა task-ები):**
  - RR-R20-01 (low): discard toast save-ის დროს → B-R19-01;
  - RR-R20-02 (low): A → B → A + typing → TM-B24-ში შევიდა;
  - RR-R20-03 (info): conventions OK;
  - RR-R20-04 (info): არქიტექტურა. save token `{selectionKey, editVersion}`, store-ის ცვლილება სჭირდება;
  - A-R20-01 (low): sync effect `join('\0')`-ით, reorder (Select All) dirty batch edits-ს აგდებს;
  - C-R20-01 (info): A-ს (x11) მიღებულია.
- **D-30** დაემატა. rounds: 20 → published `b373b08`, დაემატა 21 planned. `current_task` განახლდა.
- **`feature-status.md`** (`b-round-20-update-feature-status.py`, idempotent, ორჯერ გაეშვა, `cmp` OK). backup: `b-round-20-feature-status-before.md`. ცვლილებები:
  - header და round 20-ის აბზაცი;
  - root-ის თხოვნა `b373b08`-ზე;
  - TM-B23 done, TM-B24 in_progress;
  - B-R19-01 და A-R19-02 განახლდა, 6 ახალი finding row;
  - D-29 done, ახალი row D-30.

## 3. B-ის probe (TM-B24, კოდის წაკითხვა `b373b08`-ზე)
- input-ები save-ის დროს disabled არ არის, მხოლოდ Save ღილაკი (`MetadataPanel.tsx:296`).
- single same-set (`:115-118`): `setEditingMetadata({...updated})` save-ის დროს აკრეფილს re-read-ით ცვლის. `modifiedFields`/`isDirty` reset-დება (`metadata-store.ts:32-33`).
- batch all-succeeded (`:154`): `setEditingMetadata({})` აკრეფილს წმენდს.
- "აკრეფილის" აღმოჩენა: `isDirty`/`modifiedFields` save-ის დასაწყისში არ reset-დება, ამიტომ ისინი მარტო არაფერს ამბობენ. D-30 იყენებს start snapshot-ს (closure `editingMetadata`, რომელიც იწერება) და მიმდინარე `modifiedFields`-ის key-ებს, რომელთა მნიშვნელობა snapshot-ისგან განსხვავდება.
  - A → B → A + no typing (x10 pin): `modifiedFields` ცარიელია, ამიტომ არაფერი merge-დება და x10 უცვლელად გადის. მარტო snapshot-ის diff (modifiedFields-ის გარეშე) x10-ს გატეხდა, რადგან store-ის ძველი A (`ACat`) snapshot-ს (`R20Cat`) არ უდრის.
  - tags: `TagsInput` ყოველ ცვლილებაზე ახალ array-ს ქმნის, ამიტომ შედარება შინაარსით.
- merge: არსებული `mergeFields` ზუსტად საჭირო მდგომარეობას იძლევა (key-ები `modifiedFields`-ში, `isDirty` true). store-ის ცვლილება არ სჭირდება.
- `skipSyncRef`-ის გამოტოვება typed შემთხვევაში equivalent-ია (sync effect `!selectionChanged && isDirty && hasEditingData`-ზე ჩერდება), ამიტომ R21-3 M8 record only-ა.

## 4. Round 21-ის არჩევანი: TM-B24 (D-30)
- policy: critical/high ღია ბაგი არ არის. TM-B24 (medium, მომხმარებლის input-ის ჩუმი დაკარგვა) ყველაზე მაღალი ღია item-ია, რომელიც Saba-ს არ ელოდება. ის TM-B23-ზეა დამოკიდებული, რომელიც done-ა.
- **ფაილები:** `MetadataPanel.tsx`; `metadata-panel-batch-save.test.ts` (additions only, nested describe TM-B23 describe-ის შიგნით, რომ helper-ები არ გადაადგილდეს); ერთი ხაზი `STATE_MANAGEMENT.md`-ში. store-ები frozen-ია.
- **acceptance:**
  - R21-1: ownership და process;
  - R21-2: red/green `b373b08`-ზე. primary red (y1)–(y3), (y6)–(y10); pin-ები (y4), (y5), (y11)–(y13);
  - R21-3: M1–M7, M8 equivalent;
  - R21-4: gate, 173 + new / 93 / 7;
  - R21-5: real app delay harness-ით (single, A → B → A, batch, regression), ffprobe + music-metadata, red reference `b373b08` build-ზე.
- reference-first: pure fix, გამონაკლისია. ხილული UX არ იცვლება.

## 5. Saba-ს კითხვების პაკეტი (უცვლელი + განახლებული)
- **უცვლელი:**
  - D-07 (TM-T1-MIG)
  - D-10 + TM-B11
  - D-12/TM-B08 + B-R6-01
  - TM-T1-DUP (RR-R3-01, medium)
  - D-15 + RR-R5-01 + RR-R17-03
  - B-R7-02/RR-R8-04
  - TM-B05
  - TM-B06 (+ RR-R14-03/05, RR-R16-01, A-R16-02)
  - RR-R1-07
  - RR-R3-05
  - TM-T2-DATA
  - RR-R13-01
  - RR-R15-03
  - RR-R15-05
  - C-R15-01
  - optional RR-R12-02
  - B-R18-01 + RR-R19-01 (medium, preload `statFiles`)
- **განახლებული, B-R19-01 + RR-R20-01:** save-ის დროს selection-ის შეცვლისას `Unsaved changes were discarded` ჩანს, თუმცა edits იწერება. რომელი გზა ავირჩიოთ? (a) toast-ის გამოტოვება, სანამ დატოვებული selection-ის save მიმდინარეობს (root-ის შეთავაზება); (b) ტექსტის შეცვლა; (c) list-ის ჩაკეტვა save-ის დროს. (c) reference-first კვლევას სჭირდება (Mp3tag, Kid3).
- **ახალი, RR-R20-04 (არქიტექტურა):** შეიძლება თუ არა metadata-store-ში `editVersion`-ის დამატება? ის `skipSyncRef`-ს ჩაანაცვლებდა. ეს მომავალი refactor-ია, task არ არის.

## 6. Root-ისთვის
- `gate-round-20.json`-ში Actions run კვლავ არ არის. თხოვნა: მიაბით `Check` run `b373b08`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook R20-შიც არ ამოქმედდა. შეამოწმეთ, აყენებს თუ არა job-ის `~/.claude/settings.json` hook-ს `inject-primitives.mjs`.

## 6a. დამატება (advisor-ის შემოწმების შემდეგ, `current-task.md`-ში ჩასწორდა)
- Target 4: `mergeFields` წაიკითხება `useMetadataStore.getState()`-დან, ან დაემატება `useCallback`-ის deps-ში. ასე Biome `useExhaustiveDependencies` 9 warning-ზე რჩება.
- (y5) გამკაცრდა: genres `["G1", "G2"]` უკვე start snapshot-შია, შემდეგ ახალი array იგივე შინაარსით → pin. დაემატა (y5b): `["G2", "G1"]` → typed (რიგი მნიშვნელოვანია), `b373b08`-ზე ვარდება.
- R21-5 (8): ძველ build-ზე step 3 ვერ შესრულდება, რადგან Save disabled-ია (ეს თავად სიმპტომია). C ამას ჩაწერს, harness-ის პრობლემად არ ჩაითვლება.
- B-ის Edit tool loop folder-ზე კვლავ უარყოფილია; ეს დამატება script-ით ჩაიწერა.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task-ი: round 21, TM-B24 (D-30).

დარჩენილი item-ები:
- TM-B24
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
