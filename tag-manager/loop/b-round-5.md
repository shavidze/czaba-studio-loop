# B — Round 5-ის დახურვა, Round 6-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `a8c1b53ed043560569dd528e2bc2e5190b63333a`. root-მა round 5 გამოაქვეყნა, tree სუფთაა. წყაროს არ შევხებივარ. ჩემი ექსპერიმენტები `/tmp/b-r6`-ში გავუშვი, რეპოზიტორიის გარეთ.

## Round 5: შედეგი
- **C: PASS** (R5-1…R5-7), **realVerified=true**.
  - red/green: 4/2 → 28/28.
  - mutation-ები M1, M2, M2b.
  - gate: renderer 107, main 42, E2E 7/7 `--retries=0`.
  - რეალური app: ffmpeg-ით ჩაწერილი ICMT-only ფაილი და UI-ით ჩაწერილი ICAT-only ფაილი ჩანს `Tagged`-ად. ცარიელი ICAT-ის მქონე ფაილი untagged რჩება. ძველ build-ზე badge არ ჩანდა.
- **Root gate:** verify მწვანეა, review COMMIT OK (medium/high არ არის), publish `a8c1b53`.
- **არქივი:** `tasks/round-5.md` არის `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp`).

## Backlog-ის ცვლილებები (C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-B09 | **done**, realVerified=true, `a8c1b53`. D-15 კვლავ B-ის default-ია, Saba-ს დასადასტურებელი | C R5-1…R5-7 |
| RR-R2-02 | **closed** | C R5-2 M1 |
| C-R3-01 | **closed** (TM-B09) | C R5-4…R5-6 |
| TM-T0-CI / TM-T0 | უცვლელად `in_progress`: root-ს `7879ee0`-ის ან `a8c1b53`-ის Actions run არ მიუბამს | policy.local.md, root-review.md |
| C-R5-01, C-R5-02 | დაემატა, routed → TM-B10 | C R5 |
| **TM-B10** (ახალი, **medium**) | `meta:read` NUL terminator-ს ინარჩუნებს | C R5 + B ექსპერიმენტები (ქვემოთ) |
| RR-R5-01…05 | დაემატა signal-ებად (low/info) | root review R5 |
| RR-R5-06 | **არქიტექტურის signal**, არა task: „ცარიელია თუ არა“ წესი სამ ადგილასაა, საჭიროა ერთი საერთო `isEmptyFieldValue` | root review R5 |
| B-R6-01 (ახალი, low) | node-taglib-sharp INFO-დან `IBPM`/`ITRK`-ს არ კითხულობს (bpm/track = 0, NUL-ით და მის გარეშეც). Saba-ს კითხვაა D-12/TM-B08-თან ერთად | B ექსპერიმენტი |
| RR-R2-01 | routed → round 6 | — |
| D-16 (ახალი) | reader-ში trailing NUL-ის მოშორების წესი | B |
| rules (R5) | (1) NUL მტკიცებულებად ითვლება მხოლოდ raw INFO ბაიტები, რადგან ffprobe NUL-ს მალავს. (2) `Number("120\0")` = NaN → 0, ხოლო save მთელ `editingMetadata`-ს აგზავნის | B ექსპერიმენტი |

## B ექსპერიმენტები (ფაქტი / დასკვნა ცალ-ცალკე)
სკრიპტები ინახება loop folder-ში: `b-round-5-exp-nul-read.cjs`, `-nul-writeback.cjs`, `-nul-number.cjs`, `-nonul-number.cjs`, `-nul-interior.cjs`. არგუმენტად რეპოზიტორიის path გადაეცით. გაშვებამდე საჭიროა `mkdir -p /tmp/b-r6`; writeback სკრიპტი read სკრიპტის შემდეგ გაუშვით.
- შიდა NUL ბიბლიოთეკის წაკითხვისას რჩება: `ICMT "a\0b\0"` → `"a\u0000b\u0000"`. ამიტომ (g) და M4 ვალიდურია.

**დადასტურებული ფაქტები** (node-taglib-sharp 6.0.1, `sample.wav` + LIST/INFO):
- `tag.comment` = `"heavy door\u0000"`, `tag.title` = `"\u0000\u0000"`, `genres` = `["Foley\u0000"]`;
- `getValuesAsStrings('ICAT')` = `["DOORWood\u0000"]`;
- ffprobe იმავე ფაილზე აჩვენებს `comment:"heavy door"`, `title:""`.
- read → იგივე მნიშვნელობის ჩაწერა → save: raw `ICMT` size 11, შიგნით `\0`. `ICAT` 9 ბაიტია, `\0`-ით. ანუ NUL data-დ იწერება.
- custom INFO `ITST "120\0"` → `Number(...)` = NaN. `metadata.ts:131`-ის `|| 0` მას 0-ად აქცევს. `"120"` NUL-ის გარეშე → 120.
- `IBPM "120"` / `ITRK "7"` → `beatsPerMinute` / `track` = 0, NUL-ის გარეშეც. `ICRD "2024"` → year 2024.
- `Id3v2Tag.fromEmpty() instanceof CombinedTag` = false, ანუ RR-R2-01-ისთვის რეალური ობიექტით ტესტი შესაძლებელია.

**დასკვნა** (C ამოწმებს R6-4-ში):
- `MetadataPanel.tsx:76` მთელ `editingMetadata`-ს აგზავნის. ამიტომ NUL-იანი custom number ველი ნებისმიერ save-ზე 0-ით გადაიწერება, ანუ data loss.
- ამის გამო TM-B10 **medium**-ად შევაფასე, C-მ კი C-R5-02 low-ად შეაფასა. თუ C ძველ build-ზე data loss-ს ვერ დაადასტურებს, severity ხელახლა შეფასდება.

## Round 6: TM-B10 + RR-R2-01 (ორივე `metadata.ts`-ის reader-შია)
**რატომ ეს:** critical ან high ბაგი ღია არ არის. TM-B10 medium-ია და data loss-ს იწვევს, თან ყველა spec-შესაბამის recorder ფაილს ეხება. RR-R2-01 medium-ია, იგივე ფაილშია და round 2-დან „მომავალ `metadata.ts` round“-ს ელოდებოდა.

C-R5-01 მხოლოდ reader-ში სწორდება. `file-row-display.ts` გაყინულია, რომ ერთი ბაგი ორ ფენაში არ გასწორდეს და red proof ნათელი დარჩეს.

**დარჩენილი ღია medium-ები:**
- RR-R1-01 ელოდება Actions run-ს.
- RR-R3-01 / TM-T1-DUP ელოდება Saba-ს გადაწყვეტილებას.

**Ownership:**
- `src/main/ipc/metadata.ts`;
- ახალი `tests/main/riff-info-nul.test.ts`.

**Acceptance:**
- red/green ძველ `metadata.ts`-ზე, რომელსაც მხოლოდ export აქვს დამატებული;
- 4 mutation;
- gate;
- რეალური app:
  - NUL-only ფაილები badge-ის გარეშე ჩანს;
  - Comment-ის input-ში `\u0000` არ არის;
  - Take=120 save-ის შემდეგაც 120 რჩება; ძველ build-ზე 0 ხდებოდა;
  - ffmpeg ფაილის ICMT ზომა 29 → 28;
- T1-10 რეგრესია.

NUL-ის შესახებ ყველა მტკიცება უნდა ეყრდნობოდეს raw INFO ბაიტებს.

## Saba-სთვის ღია კითხვები (round 6-ს არცერთი არ ბლოკავს)
1. D-07 (TM-T1-MIG).
2. D-10: ცარიელი ველი = `""` თუ sub-chunk-ის წაშლა.
3. D-12 / TM-B08 + **B-R6-01**: შედის თუ არა artists და bpm/track INFO კონტრაქტში.
4. TM-T1-DUP / RR-R3-01.
5. D-15 + RR-R5-01: badge-ის წესი და docs შენიშვნა.
6. **D-16**: საინფორმაციოდ; ტექნიკური და შექცევადია.
7. RR-R1-07, RR-R3-05, TM-B06 (`package.json` დაცულია).
8. TM-T2-DATA (T-2 BLOCKED).

## შემდეგი
- root მიაბამს Actions run-ს (`7879ee0`/`a8c1b53`+):
  - **მწვანე:** TM-T0-CI და TM-T0 იხურება, შემდეგ TM-T0-CI-FU;
  - **წითელი:** run-ის timing-ები განსაზღვრავს CI round-ის scope-ს.
- პასუხების მოლოდინში შეიძლება ცალკე renderer round: RR-R5-02 (`typeof` guard). RR-R5-06 signal-ად რჩება.
