# B — Round 38-ის დახურვა და round 39-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. Round 38-ის შედეგი
- **C: PASS** (`c-round-38.md` / `.json`): R38-1…R38-6, realVerified=**true**.
- **Real app, ძველი `ea4a1cb` vs ახალი, keyboard-ით:**

  | Scenario | ახალი | ძველი |
  |---|---|---|
  | K1 (Done) | focus Done-ზე რჩება (`Applying...`, `aria-disabled` + `aria-busy`); Done-ზე ერთი re-read | BODY |
  | K2 (Save Tags) | focus რჩება write-ის დროს და მის შემდეგ; ერთი `meta:write`; ffprobe და music-metadata ორივე: `ICAT=R38Focus` | BODY |
  | K3 (clean Save Tags) | Tab-ით მიღწევადია; Enter → 0 write | Tab გამოტოვებს |
  | K4 (batch) | ერთი `meta:write-batch`; ორივე ფაილში `ICAT=R38Batch` | — |
  | O (opacity, Applying-ის დროს) | შუა ისარი 0.6, კიდის ისარი 0.18, Done 0.5 | შუა ისარი 0.18 |

  `pageErrors` ცარიელია 8-ვე run-ში.
- **Gate:** 304/93/7, `--retries=0` 7/7, Biome 0/8.
- **Root gate:** published `96f1e45ff18fb23b77a348af90139a233f51f8e6` (`gates/gate-round-38.json`). Review **COMMIT OK**: 0 critical/high/medium, 4 low, 1 არქიტექტურის შენიშვნა. ეს არის round 39-ის baseline.
- **სტატუსები:**
  - TM-B40 → **done** (evidence C-ის R38-1…6-დან და root gate-დან);
  - D-45 → verified;
  - closed: RR-R35-01, RR-R35-04, C-R35-01, RR-R36-01, C-R37-02, A-R37-01, RR-R37-01.
- **RR-R35-02 დახურული არ არის.** Saba-ს კითხვაა (§4). D-45-მა მხოლოდ focus-ის ნაწილი დახურა.
- **Archive:** `tasks/round-38.md` ახალი ასლია (`cp -n`, `cmp` იდენტური). ძველი archive არ არსებობდა.

## 2. ახალი finding-ები და სად მიდის
| ID | Severity | რა | სად მიდის |
|---|---|---|---|
| C-R38-01 | low | CM-3 გადარჩა: ცარიელი field list-ის Done-ის `aria-disabled="true"`-ს ტესტი არ იცავს | TM-B41 (f9) |
| RR-R38-01 | low | `aria-disabled` Button-ს `hover:` ფერი რჩება. Review ამბობს, რომ ეს ახალია; A-ს reviewer ამბობს, რომ native disabled-ზეც ასე იყო. ჯერ არ არის გაზომილი | **ახალი TM-B42** (ჯერ გაზომვა; `src/`-ის ცვლილებაა, test-only round-ში ვერ შევა) |
| RR-R38-02 | low | Done-ის guard render closure-დან კითხულობს. დღეს სწორია, (f2) ფარავს | record |
| RR-R38-03 | low | (b1)-ის სახელში ისევ „is disabled“ წერია | TM-B41 |
| RR-R38-04 | low | შუა ისრებს fieldset-ში hover cue რჩება | TM-B42 |
| RR-R38-05 | info | `Button`-ის `busy`/`inert` prop | signal (task არ არის) |

C-ის ორი შენიშვნა ახალი finding არ არის:
- batch save-ის შემდეგ „Multiple values“ ჩანს: ეს არსებული C-R19-01 / D-21-ია;
- `IKEY=""` იწერება: ეს არსებული C-R1-01 / D-10-ია.

## 3. Round 39 = TM-B41 (test-only, `src/` უცვლელი)
**Reference-first:** გამონაკლისია, რადგან round-ში მხოლოდ test და docs იცვლება.

**B-ის probe და prototype** (`b-round-38-exp/`, `96f1e45`-ის `git archive` ასლზე; repository-ს არ შევხებივარ):
- **`gflag-probe.log` — RR-R36-03 რეალური ბაგია helper-ში:**
  - `/Done/g` მეორე call-ზე აგდებს `not found`;
  - ორი `Done` ღილაკის დროს `/Done/g` ერთს აბრუნებს, ანუ uniqueness ირღვევა;
  - `y` flag-ზეც იგივე ხდება.

  ამჟამინდელი caller-ებიდან მიუღწეველია (`g`/`y`-ს არავინ იყენებს), მაგრამ helper-ის defect-ია. ამიტომ სწორდება test-on-bugfix-ით: ჯერ (q4) red, მერე guard. ავირჩიე `g`/`y`-ის უარყოფა და არა `lastIndex`-ის reset: guard-ს state არ აქვს და caller-ის RegExp-ს ჩუმად არ ცვლის.
- **Red:** HEAD helper-ზე 1 failed ((q4)) / 309 passed of 310.
- **Green:** 310/310, 21 ფაილი, ორჯერ.
- **შემოწმებები:** `tsc` test/web 0; Biome `src/` 0/8.
- **Mutant-ები:** HM-1 (q1), HM-2 (q2), HM-3 (q3), HM-4 (q4), HM-5 (q4), PM-6 (x8), CM-3 (f9), CM-8 (f9). ყველა მოკვდა.
- **დაგეგმილი ცვლილებები:**
  - TESTING.md §6: ოთხი ცვლილება;
  - docs/bugs/001: მხოლოდ test-name-ების ინდექსის სამი ხაზი (279/310/328);
  - README არ იცვლება.
- `prototype.diff` `patch -p1 --dry-run`-ით სუფთად ედება `96f1e45`-ის ასლს.

**Policy:** ერთი round-ისთვის ბევრი პუნქტია (9 finding), მაგრამ ყველა low test gap ან test-helper-ის defect-ია. `src/`-ში ცვლილება არ არის; პრეცედენტია TM-B38. გარეთ დარჩა RR-R38-01/02/04/05.

## 4. Saba-ს კითხვები (ღიაა, ჩემი გადაწყვეტილება არ არის)
- **RR-R35-02:** როცა `onSave` არასოდეს სრულდება, `Applying...` / `Saving...` სამუდამოდ რჩება. Back, Open Folder და Close Folder მუშაობს. გინდა timeout (მაგ. 30 s), რომელიც busy მდგომარეობას მოხსნის და toast-ს აჩვენებს?
- ძალაში რჩება:
  - `b-round-23.md` §5;
  - B-R36-01: სიის ჩაკეტვა scan-ის დროს;
  - TM-T2-DATA: UCS სია და ლიცენზია.

## 5. დარჩენილი სამუშაო (dependency-ს რიგით)
- **TM-B41:** round 39.
- **TM-B42:** ახალია, low; TM-B41-ის შემდეგ. ჯერ hover-ის გაზომვა ძველ და ახალ build-ზე.
- **Saba-ს ან root-ის მოლოდინში:**
  - TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14: root-ის Actions-ის მტკიცებულება;
  - TM-T2, TM-T2-DATA: Saba.
- **todo, დაბალი პრიორიტეტი:** TM-T1-MIG, TM-T1-DUP, TM-B08, TM-B05, TM-B06, TM-B11.

## 6. Checkpoint
- [x] `tasks/round-38.md` (archive)
- [x] `backlog.json`:
  - TM-B40 done + evidence, D-45 verified, round 38 published;
  - 7 finding closed, RR-R35-02 → Saba;
  - C-R38-01 და RR-R38-01…05 დამატებულია;
  - TM-B41 in_progress (round 39), TM-B42 todo, round 39 planned.
- [x] `feature-status.md`
- [x] `current-task.md` (round 39)
- [x] `b-round-38-exp/`: probe, drafts, `prototype.diff`, red/green/mutant log-ები
- [x] `b-next.json`
