# B — Round 46 დახურვა / Round 47 დაგეგმვა

თარიღი: 2026-10-28 · decision: **CONTINUE**

## Round 46 შედეგი (მხოლოდ C-ის evidence-ით)
- **C PASS**, R46-1…R46-8, `realVerified=true`, bugs 0 (`c-round-46.md`/`.json`).
- Gate: renderer 326/326, main 120/120, E2E 7/7 (`--retries=0`-ითაც 7/7). Biome: 0 errors, 8 warnings.
- Red/green:
  - c822d7f-ის `src`-ზე main 9 failed / 13 passed, renderer 6 failed;
  - mutant-ები M1, M1b, M2, M3, M4, M5 ყველა მოკლულია.
- Real app (Playwright `_electron`, xvfb, custom Number `Take`/`TAKE`):
  - **R46-4:** Title-only save `TAKE`-ს აღარ წერს. c822d7f build-ის contrast-ში `TAKE='0'` იწერებოდა.
  - **R46-5:** აკრეფილი `0` იწერება `'0'`-ად (size 1) სამივე reader-ში. ფაილზე დაბრუნების შემდეგ `0` ჩანს და მწკრივი Tagged-ია.
  - **R46-6:** single და 2-file batch გასუფთავება `TAKE`-ს შლის. ფაილს თავისი ICAT რჩება, არაარჩეული ფაილები byte-identical-ია.
  - **R46-7:** Year `0` არ ინახება (Deviation 1, FYI).
- Root gate: **published `1ea34df`**. Review COMMIT OK, critical/high/medium არ არის.

## Backlog ცვლილებები
- **TM-B11 → done** (`realVerified=true`, closed_round 46): stage 1 (D-49, c822d7f) და stage 2 (D-50, 1ea34df) ორივე C-ის real-app evidence-ითაა დადასტურებული.
- **D-50 → verified.** შენიშვნაში წერია, როგორ აიგო input: `value={v}`, `String(v)`-ის ნაცვლად (A F1, C-მ მიიღო; A-R46-01).
- **D-15:** number წესის ცვლილება verified-ად მოინიშნა.
- **C-R6-01, RR-R5-03 → closed.**
- ახალი signal-ები (task-ები არ არის):
  - **RR-R46-01:** standard ველში `0` ჩუმად ქრება → **Q24**;
  - **RR-R46-02:** სორტირების ტესტი აკლია;
  - **RR-R46-03:** ნაწილობრივი აკრეფა `''`-ს იძლევა;
  - **RR-R46-04:** ძველი `ITKN='0'`;
  - **RR-R46-05:** architecture. number-ის ლოგიკა სამ ადგილასაა; template dialog-ის `parseInt` `1.5`-ს ჭრის;
  - **C-R46-01** (process): A-მ `sed -i` გამოიყენა. round 47-ში წესი ხელახლა წერია და A-მ მისი დაცვა ანგარიშში უნდა დაადასტუროს;
  - **C-R46-02:** (r3)-ის red სია B-ის შეცდომა იყო;
  - **C-R46-03:** music-metadata latin1;
  - **B-R46-01** (B probe): `msg.includes('Corrupt')` branch ბიბლიოთეკის შეცდომებზე არ ირთვება.
- **B-R0-03 → in_progress** (routed TM-B05, round 47).
- `rounds[46]` = published, `rounds[47]` = planned.

## Round 47: TM-B05 (Saba Q5) — რატომ ეს
- Saba-ს რიგი: Q2 → Q8 → Q4/Q1 → **Q5** → Q3 → Q6.
  - Q2 (r42), Q8 (r43–44), Q4 (r45–46) და Q1 (TM-T1-MIG) დახურულია.
  - critical/high bug ღია არ არის.
- **B probe** (`b-round-46-exp-empty-audio-probe.cjs.txt`), node-taglib-sharp 6.0.1. ერთსა და იმავე `CorruptFileError: WAV file is missing data chunk`-ს სამი შემთხვევა იძლევა, read-ზეც და write-ზეც:
  - ბოლოში მდგარი ცარიელი `data`;
  - `data` chunk-ის გარეშე ფაილი;
  - ფაილზე დიდი `data` size.
- probe-ის დანარჩენი შედეგები:
  - 0-sample ფაილი, რომლის ცარიელ `data`-ს `LIST` მოსდევს, იხსნება და tag-ი ეწერება;
  - `corrupt.wav` → `WAV file is missing header chunk`;
  - `CorruptFileError` package index-იდან export-დება.
- **D-51 (planned):** მხოლოდ write path-ში, ზუსტი message-ის map-ით: `Audio data is empty, cannot tag`.
  - single save აჩვენებს `Failed to write metadata: …`-ს;
  - batch შეცდომას `failed[].error`-ში წერს.
  - read უცვლელია, ტესტი აფიქსირებს.
- **ღიად ჩაწერილი deviation-ები:**
  - სამ შემთხვევას ერთი ტექსტი აქვს;
  - sentence case;
  - Electron-ის prefix toast-ში;
  - read-ის ნახევარი → **Q22**;
  - batch toast-ში მიზეზები → **Q23**.
  - scope არ შემცირებულა. Saba-ს Q5 პასუხი write-ის შეცდომას ეხება, read-ის ნაწილი კი ცალკე კითხვად წავიდა.
- Reference-first: exempt (pure fix, ახალი UX არ არის).

## Saba-სთვის ახალი კითხვები (არ ბლოკავს)
- **Q22:** tag-ის ჩაწერა შეუძლებელია (ცარიელი აუდიოს გამო). ფაილი წაკითხვისას უნდა მოინიშნოს? დღეს ცარიელი ველები ჩანს და შეცდომა მხოლოდ save-ზე ამოდის.
- **Q23:** batch toast-მა (`1 saved, 1 failed`) ფაილების მიზეზებიც აჩვენოს?
- **Q24:** standard Year/Track #/BPM-ში `0` ვერ ინახება. რა ვქნათ: `min=1`, მინიშნება თუ დავტოვოთ როგორც არის (RR-R46-01)?
- **FYI:** ძველი build-ების `ITKN='0'` ახლა `0`-ად ჩანს და Tagged-ია (RR-R46-04).

## დარჩენილი
- TM-B05 (round 47);
- TM-B08 (Q3, pin/doc);
- TM-B06 (Q6);
- TM-T2-DATA → TM-T2 (Q7-ს ელოდება, blocked).

## ფაილები
- `tasks/round-46.md`: არქივი, ასლი.
- `b-round-46-backlog-before.json`, `b-round-46-feature-status-before.md`: snapshot-ები.
- `b-round-46-update-backlog.py`, `b-round-46-update-feature-status.py`.
- `current-task.md` (round 47), `b-next.json`.
