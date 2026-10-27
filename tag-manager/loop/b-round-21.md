# B — Round 21-ის დახურვა და Round 22-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `601dc4aad7e9416b8f3c690ba5ec68cccb98490d`. tree სუფთაა (`git status --porcelain` ცარიელია). B-ის ფაზაში source არ შეცვლილა: ყველა experiment `/tmp/b-r22`-სა და `/tmp/b-r22-old`-ში გაეშვა.

## 1. Round 21-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-21.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R21-1…R21-5. blocked მხოლოდ Windows packaging-ზეა (ეს FAIL არ არის).
- **მთავარი evidence:**
  - **Red** `b373b08` worktree-ზე: 9 failed / 39 passed. სიმპტომით ვარდება (y1)–(y3), (y5b) და (y6)–(y10). მაგალითად (y1): `expected 'A-title' to be 'TypedTitle'`.
  - **Green:** 48/48.
  - **Mutation-ები:** M1–M7 მოკლულია. M8 equivalent-ია, როგორც დაგეგმილი იყო, და run-მაც დაადასტურა.
  - **Gate:** 187/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - **Real app (3000 ms write delay):** save-ის დროს აკრეფილი Comment, Title და Copyright ფორმაში რჩება. ffprobe-ით და music-metadata-ით ჩანს:
    - a: comment `R21Typed`, ICAT `R21A`;
    - b: title `R21Back`, ICAT `R21Batch`, copyright `R21Copy`;
    - c: comment `R21C`, ICAT `R21Batch`, copyright `R21Copy`.
  - **Red reference** `b373b08` build-ზე: Comment ცარიელია, Save disabled-ია.
  - A-ს transcript ხელმისაწვდომი იყო: repo-ში ყველა write Edit-ით გაკეთდა.
- **Root gate:** `gate-round-21.json` → `published`, commit `601dc4a`. ეს შემდეგი baseline-ია. Review: COMMIT OK, low-ები RR-R21-01…03, არქიტექტურა RR-R21-04.
- **Archive:** `tasks/round-21.md` ახალ ფაილად შეიქმნა, `cmp` OK. ძველი archive არ გადაწერილა.

## 2. Backlog-ის განახლება
script: `b-round-21-update-backlog.py`. ის idempotent-ია: ორჯერ გაეშვა, `cmp` OK. backup: `b-round-21-backlog-before.json`.
- **TM-B24 → done:** `realVerified=true`, commit `601dc4a`, C R21-ის evidence. **D-30 → done R21.**
- **rounds:** 21 → published `601dc4a`, c_result დაემატა. 22 → planned.
- **ახალი item TM-B25** (bug, low, RR-R19-02-იდან): in_progress, round 22, D-31. RR-R19-02-ის routed_to → TM-B25.
  - **რატომ გახდა signal ბაგი:** B-მ component ტესტით გაიმეორა `601dc4a`-ზე. ყოველი save-ის შემდეგ Shift-click მხოლოდ ერთ ფაილს ირჩევს. ეს შემდეგ batch edit-ს მომხმარებლის მიერ ჩაფიქრებული range-ის ნაცვლად ერთ ფაილზე აგზავნის.
- **ახალი D-31** (ტექნიკური, შექცევადი, მხოლოდ renderer).
- **ახალი finding-ები (signal-ები, არა task-ები):**
  - RR-R21-01 (low): snapshot render closure-იდან მოდის და არა `getState()`-იდან → hygiene round.
  - RR-R21-02 (low), A-R21-02-თან გაერთიანებული: revert + writer-ის ნორმალიზაცია → `docs/bugs/` ჩანაწერი.
  - **RR-R21-03 → record only:** B-მ test ფაილი წაიკითხა. (x11) (`:870-890`) ზუსტად batch AB → A + typing შემთხვევას ფარავს. changed-set branch-ზე merge იქ no-op იქნებოდა, ამიტომ ახალი pin საჭირო არ არის.
  - RR-R21-04 (info, არქიტექტურა): pure post-save reconciliation → უერთდება RR-R12-04/R13-04/R15-05/R20-04.
  - A-R21-01, A-R21-03, A-R21-04: signal-ები. A-R21-04 hygiene round-ს ეკუთვნის.
  - C-R21-01 → B-R19-01. C-R21-02 → C-R15-01. C-R21-03 (C-ის harness: music-metadata `exif:` namespace) → record only.
  - **B-R21-01 (info):** A-R20-01 დღევანდელი UI-დან მიუღწეველია. `toggleSelection` ბოლოში ამატებს, `selectRange` არსებულ რიგს ინარჩუნებს, ხოლო Select All მხოლოდ მაშინ ეშვება, როცა ყველა ხილული ფაილი მონიშნული არ არის (ესე იგი set განსხვავდება). ეს კოდის წაკითხვაა, არა C-ის მტკიცებულება; signal-ად რჩება.
  - **B-R21-02 (low):** D-31-ის reference-ისგან გადახვევები → Saba-ს კითხვა.
  - **B-R21-03 (info):** `App.tsx`/`FolderBrowser.tsx`-ის `as Record<string, WavMetadata>` cast-ები **საჭიროა**: `readMetadataChunked` `Record<string, Record<string, unknown>>`-ს აბრუნებს. B-ის experiment-ში ამ cast-ების წაშლამ TS2345 მოგვცა.
- **`feature-status.md`:** script `b-round-21-update-feature-status.py`, idempotent, `cmp` OK, backup `b-round-21-feature-status-before.md`. ცვლილებები:
  - header და round 21-ის აბზაცი;
  - root-ის თხოვნა `601dc4a`-ზე;
  - TM-B24 → done, ახალი row TM-B25;
  - RR-R19-02 და A-R20-01 განახლდა, 14 ახალი finding row;
  - D-30 → done, ახალი row D-31.

## 3. B-ის experiment-ები (`b-round-21-exp/`)
- **`casts-snapshot.diff.txt`:**
  - შედეგი: MetadataPanel-ის 6 cast წაიშალა, snapshot ერთი `getState()`-ით აიღება და `editingMetadata` გავიდა deps-იდან. tsc web/test 0, renderer 187/187, Biome 9.
  - Biome-ის formatter deps array-ს ერთ ხაზზე მოითხოვს.
  - ეს hygiene round-ის მზა spec-ია.
- **`file-list-anchor-exp.test.ts.txt` + `anchor-old-output.txt` / `anchor-new-output.txt`:**
  - `601dc4a`-ზე 7 EXP ტესტი ვარდება, ზუსტად ის, რაც დაიგეგმა: (z2)–(z5), (z8), (z11), ასევე (z4) 5 ფაილით.
  - pin-ები (z1), (z6), (z7), (z9), (z10) ძველზე გადის.
  - path-anchor-იან კოდზე ყველა გადის.
- **`file-list-anchor-impl.diff.txt`:** path anchor + `hasSelection`-ზე reset. tsc 0, Biome **8** warning: `FileList.tsx:107` `useExhaustiveDependencies` ქრება. ეს მხოლოდ ორიენტაციაა, A-ს არ ევალდებულება.

## 4. Round 22-ის არჩევანი: TM-B25 (D-31)
- **policy:** critical/high ბაგი ღია არ არის. TM-B25 ერთადერთი ბაგია, რომელიც არც Saba-ს ელოდება და არც root-ს. მომხმარებლისთვის ის ხილულია: შემდეგი batch edit არასწორ ფაილებზე მიდის. ამიტომ ის hygiene/polish-ზე (casts) წინ დგას.
- **reference-first:** fix-ია, მაგრამ იცვლება ის, რასაც anchor მიჰყვება, ამიტომ reference მოიძებნა:
  - **GTK listview commit:** Explorer-ის იმიტაციაა და anchor-ად item tracker-ს იყენებს;
  - **Windows list box Shift-click:** range პირველად დაწკაპუნებული item-იდან Shift-click-ით არჩეულ item-მდე;
  - **Microsoft selection modes:** anchor-ს არ აკონკრეტებს.
  - ოფიციალური Microsoft ან Mp3tag წყარო refresh/sort-ის შემდეგ anchor-ზე ვერ ვიპოვე და არ გამოვიგონე.
  - 3 გადახვევა მიზეზით ჩაიწერა (B-R21-02).
- **ფაილები:** `FileList.tsx` და `tests/renderer/components/file-list.test.ts` (მხოლოდ დამატება, (z1)–(z11)). store-ები frozen-ია.
- **acceptance:**
  - R22-1: ownership;
  - R22-2: red/green `601dc4a`-ზე;
  - R22-3: M1–M6;
  - R22-4: gate 198/93/7, Biome 8 ან იგივე 9;
  - R22-5: real app — save → Shift-click → batch save → ffprobe + music-metadata a, b, c-ზე, d, e-ზე არა; sort და search ვარიანტები; red reference `601dc4a` build-ზე.

## 5. Saba-ს კითხვების პაკეტი
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
  - RR-R15-01 (D-24-ის ცვლილება)
  - RR-R15-03
  - RR-R15-05
  - C-R15-01
  - optional RR-R12-02
  - B-R18-01 + RR-R19-01 (medium, preload `statFiles`)
  - B-R19-01 + RR-R20-01 + C-R21-01
  - RR-R20-04
- **ახალი, B-R21-02:** Shift-click-ის სემანტიკა reference-ის მიხედვით შეიცვალოს? ორი ცვლილება იქნებოდა:
  - (a) Shift-click anchor-ს არ ცვლის;
  - (b) Shift-click Ctrl-ის გარეშე selection-ს ცვლის, ნაცვლად იმისა, რომ დაამატოს.
  - ეს UX ცვლილებაა და Saba-ს თანხმობა სჭირდება.

## 6. Root-ისთვის
- `gate-round-21.json`-ში Actions run კვლავ არ არის. **თხოვნა:** მიაბით `Check` run `601dc4a`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** შეამოწმეთ, აყენებს თუ არა job-ის `~/.claude/settings.json` `inject-primitives.mjs` hook-ს.
- **B-ის Edit tool loop folder-ზე:** `current-task.md`-ზე Edit კვლავ უარყოფილია, Write კი მუშაობს. ერთი ჩასწორება `python3`-ით გაკეთდა.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task: round 22, TM-B25 (D-31).

შემდეგი გეგმა:
- **round 23:** MetadataPanel hygiene.
- **round 24:** სავარაუდოდ **BLOCKED** Saba-ს კითხვების პაკეტზე, თუ მანამდე პასუხი არ მოვა. root-ის Actions link დამატებით TM-T0*/TM-B14-ს ხურავს. round-ებს ამის თავიდან ასაცილებლად არ ვიგონებ.

დარჩენილი item-ები:
- TM-B25
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
