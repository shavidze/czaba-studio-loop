# B — round 44-ის დახურვა / round 45-ის დაგეგმვა (2026-10-28)

## Round 44 შედეგი
- **C: PASS** (R44-1…R44-5, `realVerified=true`, bugs 0). C-ის ზოგადი შედეგები (`c-round-44.md`/`.json`):
  - verifyCommand rc=0; renderer 320/320, main 98/98, E2E 7/7, `--retries=0` 7/7.
  - (w7) წითელია `cf4e147`-ის `MetadataPanel.tsx`-ზე და მწვანე fix-ზე.
  - 13 carried ფაილის hash ემთხვევა.
- **real app:**
  - single save → `ICAT=DOORWood`, 3-file batch → `IKEY=door, slam`. ორივე ემთხვევა raw INFO-ში, `music-metadata`-სა და `ffprobe`-ში.
  - Size/Date მხოლოდ შენახულ რიგებზე განახლდა.
  - `statFiles` edge case-ები ემთხვევა `fs.statSync`-ს.
  - partial batch: `1 saved, 1 failed`.
- **root gate:** `published`, commit **d886bef086628cd2b6a8efed3a7a98eeb8454480** (rounds 43–44). root review: COMMIT OK, critical/high/medium არ არის.
- archive: `tasks/round-44.md` (ასლი; round-44 archive მანამდე არ არსებობდა).

## Backlog / feature-status ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B44 → done** (C R43 + R44 real evidence, published d886bef). D-48 → verified + published.
- **closed:**
  - C-R43-01 (round 44 flip);
  - RR-R19-01 და B-R18-01 (TM-B44 done);
  - C-R42-01 (001 entry 23 შესწორდა, C R43-7/R44-5, published).
- **ახალი signal-ები root review R44-დან** (task-ები არ არის):
  - RR-R44-01: D-48 არ არის `docs/bugs/001`-ის D-სიაში;
  - RR-R44-02: `fs:stat-files` ნებისმიერ path-ს იღებს (A-R43-01-თან გაერთიანებულია);
  - RR-R44-03: chunk ზომა 50 ორ ფაილშია განსაზღვრული;
  - RR-R44-04: განზრახ ცარიელი `catch`.
- C-ის ორი შენიშვნა უკვე routed-ია:
  - ცარიელი `IKEY=` → TM-B11. B-R42-02-ს დაემატა note.
  - tests/ Biome → TM-B06.
- TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14 უკვე `done` იყო (შემოწმდა). ცვლილება არ დასჭირდა.
- round 44 entry → `published`. დაემატა round 45 entry და D-49 (planned).

## Round 45 = TM-B11 stage 1 (Saba Q4 / D-10 → D-49)
- **რიგი:** Saba-ს რიგი Q2 → Q8 → **Q4**/Q1 → Q5 → Q3 → Q6. Q2 და Q8 დასრულდა, ამიტომ ახლა Q4-ის ჯერია. critical ან high ბაგი ღია არ არის.
- **კოდის ანალიზი:**
  - `STANDARD_PROP_MAP`-ის setter-ები `''`/`[]`-ზე ელემენტს უკვე შლიან (node-taglib-sharp `infoTag.js:43`, `riffList.js:199`).
  - size-0 ჩანაწერს მხოლოდ `riffChunkId`-ის გზა წერს: keywords, category და custom ველები.
- **B-ის probe** (`/tmp/b45`, repository-ს გარეთ):
  - `removeValue('IKEY')` sub-chunk-ს და ბაიტებს შლის.
  - bare WAV-ზე დღეს `LIST/INFO` 12 ბაიტია. fix-ის შემდეგ 4 ბაიტი უნდა იყოს: ცარიელი INFO list-ს ბიბლიოთეკა ყოველთვის წერს, ეს არსებული ქცევაა და scope-ში არ შედის.
- **Staging (scope-ის შემცირება არ არის):**
  - stage 1 = text და tags;
  - stage 2 = number ველები (round 46). საჭიროა unset-ის ცალკე marker read path-ში, renderer-სა და `types.ts`-ში. თუ absent ველი ისევ 0-ად წაიკითხება, single save `0`-ს ისევ ჩაწერს და C-R6-01 დაბრუნდება.
  - TM-B11 რჩება `in_progress`, სანამ ორივე stage-ს C-ის რეალური მტკიცებულება არ ექნება.
- **B-ის არჩევანი D-49-ში:** whitespace-only მნიშვნელობა ცარიელად ითვლება. ეს D-15-ის „ცარიელის“ განმარტებას ემთხვევა. არაცარიელი მნიშვნელობა უცვლელად იწერება, trim-ის გარეშე.
- **ტესტების grep** (round 44-ის წესი B-R43-01): size-0 ჩანაწერს მხოლოდ T1-10a/b ამოწმებს. ორივე owned-ია. დანარჩენი main/e2e/contract ტესტები არაცარიელ მნიშვნელობებს წერენ და ჩამოთვლილია task-ში.
- **Reference-first:** exempt, რადგან ეს Saba-ს გადაწყვეტილი ქცევის bug fix-ია.

## Saba-სთვის (FYI, არ ბლოკავს)
- stage 2-ში standard year/track/bpm-ში `0`-ის შენახვა ვერ მოხერხდება: node-taglib-sharp `setValueFromUint(0)`-ზე ელემენტს შლის. „მნიშვნელოვანი `0`“ მხოლოდ custom number ველებზე იმუშავებს.
- **Q20 (ახალი, არ ბლოკავს):** D-49-ში whitespace-only მნიშვნელობა ცარიელად ითვლება და იშლება. ეს B-ის interpretation-ია Q4-ისა („empty values are not written“) და Saba-ს სიტყვებში პირდაპირ არ წერია. default ემთხვევა D-15-ს. თუ Saba სხვაგვარად გადაწყვეტს, (e2) და D-49 შეიცვლება.
- Q7, Q9–Q19 და Q20 ღიაა.

## გადაწყვეტილება
CONTINUE → round 45.
