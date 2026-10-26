# B — Round 6-ის დახურვა, Round 7-ის გეგმა

Planner: B · 2026-10-26 · baseline HEAD `d52354da08ca15692338c254f43cd6b9a1d2774e`. root-მა round 6 გამოაქვეყნა, tree სუფთაა (`git status` ცარიელია). წყაროს არ შევხებივარ. ექსპერიმენტები `/tmp/b-r6`-სა და `/tmp/b-r7-spy`-ში გავუშვი, რეპოზიტორიის გარეთ. `/tmp/b-r7-spy` წაშლილია.

## Round 6: შედეგი
- **C: PASS** (R6-1…R6-7), **realVerified=true**.
  - red 8/8 → green 8/8; mutation-ები M1–M4 მოკლულია.
  - gate: renderer 107, main 50, E2E 7/7 `--retries=0`.
  - რეალური app:
    - NUL-only ფაილები untagged-ია;
    - Comment = `მძიმე კარი`, code 0-ის გარეშე;
    - Take `120` save-ის შემდეგაც რჩება (raw `ITKN` 3 byte, `313230`).
  - **ძველი `a8c1b53` build-ზე** Take იყო `0`, save-ის შემდეგ კი raw `ITKN` = `30` (`"0"`). data loss დადასტურდა, ამიტომ TM-B10-ის medium შეფასება სწორი იყო.
- **Root gate:** verify მწვანეა, review COMMIT OK, publish `d52354d`.
- **არქივი:** `tasks/round-6.md` არის `current-task.md`-ის ზუსტი ასლი (`cp -n` + `cmp` OK).

## Backlog-ის ცვლილებები (მხოლოდ C-ის და root-ის მტკიცებულებით)
| ID | ცვლილება | წყარო |
|---|---|---|
| TM-B10 | **done**, realVerified=true, `d52354d` | C R6-1…R6-7 |
| RR-R2-01 | **closed** | C R6-1 (h), R6-2 M3 |
| C-R5-01, C-R5-02 | **closed** | C R6-4 |
| D-16 | დაემატა implementation note. Biome `noControlCharactersInRegex` regex-ს კრძალავს, ამიტომ დაწერილია charCode loop-ით | A R6, C R6-2 |
| TM-T0-CI / TM-T0 | უცვლელად `in_progress`. root-ს `7879ee0`-ის, `a8c1b53`-ის ან `d52354d`-ის Actions run არ მიუბამს | root-review.md, policy.local.md |
| **TM-B12** (ახალი, medium, in_progress R7) | write path custom INFO ველებს ჩუმად ტოვებს | RR-R6-01 + B ექსპერიმენტი |
| **TM-B11** (ახალი, low, todo, needs_user) | custom Number ველი ყოველ save-ზე `"0"`-ად იწერება | C-R6-01 |
| C-R6-01, C-R6-02, RR-R6-01…05 | დაემატა findings-ში | C R6, root review R6 |
| D-17 (ახალი) | write guard-ის წესი (ქვემოთ) | B |
| rules (R6) | (1) `music-metadata` RIFF INFO-ს UTF-8 ქართულს mojibake-ად კითხულობს, ამიტომ INFO text მოწმდება hex-ითა და ffprobe-ით. (2) `src/`-ში NUL regex-ს task-ში არ დავწერ, რადგან Biome მას კრძალავს | C R6, A R6 |

`RR-R6-05` **არქიტექტურის signal-ია**, არა task: საჭიროა ერთი `readRiffValue` normalisation layer, write-side შემოწმება და პატიოსანი per-file `BatchWriteResult`. `RR-R6-04` (ორი ძველი `//` კომენტარი) signal-ად რჩება. მისი მოშორება ცარიელ `catch {}`-ს დატოვებს, ამიტომ ის per-field status-ის სამუშაოსთან ერთად უნდა დაიგეგმოს.

## B ექსპერიმენტები (ფაქტი / დასკვნა ცალ-ცალკე)
**ფაქტები** (`d52354d`, node-taglib-sharp 6.0.1):
- `b-round-6-exp-nontag-write.cjs`: `File.createFromPath(...)` instance-ზე `Object.defineProperty(f, 'tag', …)` მუშაობს. ამის შემდეგ `f.tag instanceof CombinedTag === false`.
- `b-round-6-exp-spy-write.test.ts.txt` (vitest main config, `/tmp` ასლი): `vi.spyOn(TagFile, 'createFromPath')` handler-ის გამოძახებას იჭერს, `calls 1`.
  - `meta:write` `{category:'DOORWood'}` resolve-ს აკეთებს `undefined`-ით;
  - `save()` 1-ჯერ გამოიძახება;
  - ფაილის ბაიტები შეიცვალა, ICAT კი არ ჩაწერილა.
  - RR-R6-01 რეალურია, red ტესტის აწყობა შესაძლებელია.
- `b-round-5-exp-nul-number.cjs` (ხელახლა გაშვებული): `ICRD "2024\0"` → year `2024`. `IBPM`/`ITRK` → 0 (B-R6-01). ამიტომ RR-R6-02 მხოლოდ pin ტესტია და bug არ არის.

**დასკვნა:** WAV ფაილისთვის RiffFile-ის tag ყოველთვის `CombinedTag`-ია, ამიტომ guard-ის branch რეალური ფაილით მიუღწეველია (defensive). ის ტესტით მხოლოდ override-ით მტკიცდება, რაც task-შიც ღიად წერია. რეალურ app-ში ვამოწმებ normal write path-ების რეგრესიას და batch failure UI-ს (`chmod 444`).

## D-17 (B, ტექნიკური, შექცევადი)
- **როდის მუშაობს:** `writeTagsToFile`-ში არის custom INFO ველი (`customFields.length > 0`), title workaround-ის შემდეგ კი `getRiffInfoTags` ისევ `[]`-ს აბრუნებს.
- **რას აკეთებს:** `file.save()`-მდე ისვრის `Error('RIFF INFO tag is not available; custom fields were not written')`-ს, ამიტომ ფაილში არაფერი იწერება.
- **სად ჩანს:**
  - `meta:write` → `Failed to write metadata: …`;
  - `meta:writeBatch` → ფაილი `failed`-შია, დანარჩენი ფაილები გრძელდება.
- **არ იცვლება:** custom ველის გარეშე schema-ს ქცევა. per-field catch-იც უცვლელია.

## Round 7: გეგმა (`current-task.md`)
**TM-B12** (D-17, RR-R6-01, medium) + **RR-R6-02** pin ტესტი (`ICRD "2024\0"`).

- **ფაილები:**
  - `src/main/ipc/metadata.ts` (მხოლოდ `writeTagsToFile`);
  - ახალი `tests/main/metadata-write-guard.test.ts`, შემთხვევები (a)–(d);
  - `tests/main/riff-info-nul.test.ts`, მხოლოდ ახალი შემთხვევა (i).
- **Acceptance:**
  - R7-1: red/green;
  - R7-2: mutation-ები M1–M4;
  - R7-3: gate;
  - R7-4: რეალური single save (raw INFO + ffprobe + music-metadata, ASCII მნიშვნელობებით);
  - R7-5: რეალური batch save + `1 saved, 1 failed` UI `chmod 444`-ით. თუ EACCES მიუღწეველია, ეს BLOCKED-ია და არა FAIL;
  - R7-6: frozen.

**რატომ ეს:** TM-B12 ერთადერთი ღია medium-ია, რომელიც Saba-ზე არ არის დამოკიდებული. სხვა ღია medium-ები:
- RR-R1-01 Actions-ს ელოდება;
- RR-R3-01 / TM-T1-DUP Saba-ს ელოდება.

critical/high bug ღია არ არის.

## Scope (არაფერი შემიმცირებია)
round 7-ში **არ შედის** (backlog-ში ღიად რჩება, არაფერი გადადებულა Saba-ს გარეშე):
- TM-B11 — Saba, D-10;
- B-R6-01, TM-B05, TM-B08;
- RR-R5-02 — renderer;
- RR-R6-04/05;
- TM-T0-CI-FU — Actions-ის შედეგის შემდეგ ან ცალკე მცირე CI round-ად;
- TM-T1-MIG/DUP, TM-T2/T2-DATA (Saba), TM-B06.

## Saba-ს კითხვები (არ ბლოკავს round 7-ს)
- D-07 (TM-T1-MIG).
- D-10 + **TM-B11**: ყოველი save `"0"`-ს წერს custom Number ველში, რომელიც არასდროს შეგივსიათ. რა უნდა მოხდეს: დარჩეს `"0"`, ჩაიწეროს ცარიელი sub-chunk, თუ საერთოდ არ ჩაიწეროს? თან `0` შეიძლება რეალური მნიშვნელობაც იყოს.
- D-12/TM-B08 + B-R6-01.
- TM-T1-DUP, D-15 + RR-R5-01.
- D-16/D-17 (ინფორმაციისთვის), RR-R1-07, RR-R3-05, TM-B06.
- TM-T2-DATA.

## გადაწყვეტილება
**CONTINUE** → round 7 (`b-next.json`).
