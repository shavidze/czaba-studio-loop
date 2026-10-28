# B — Round 35 დახურვა და round 36-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. Round 35 შედეგი
- **C: PASS**, R35-1…R35-6, realVerified=**true** (`c-round-35.md`/`.json`).
- **Root gate:** published `46bd74b4f8d18121e981038c9b8a0659070f017e` (`gates/gate-round-35.json`). Review **COMMIT OK** (`gates/round-35/review.md`): 0 critical/high/medium. ეს არის round 36-ის baseline.
- **TM-B37 → done.** D-42 და D-43 → verified, published `46bd74b`.
- Archive: `tasks/round-35.md` (ახალი ასლი; ძველი archive არ გადაწერილა).
- **დახურული finding-ები:** RR-R33-01 (medium), QA-R33-02, A-R33-02 (ორივე ნაწილი), RR-R34-01, RR-R34-02, QA-R34-01, B-R32-01.
- **ღია record-ებად რჩება:**
  - QA-R33-03: ახლა `Applying...` ჩანს; optional timeout გადავიდა TM-B40-ში.
  - B-R34-03: ცნობილი შეზღუდვა, docs entry 19.

## 2. ახალი finding-ები და მათი მიმართულება
| ID | severity | სად მიდის |
|---|---|---|
| C-R35-01 | low | TM-B40 (ისრების ორმაგი opacity, cosmetic) |
| C-R35-02 | low | TM-B38 round 36 (D-40/D-41 docs ფორმულირება) |
| C-R35-03 | low | TM-B38 round 36 ((k1)/(k2) → (b7)/(b8)) |
| RR-R35-01 | low | TM-B40 (focus `aria-disabled`-ით) |
| RR-R35-02 | low | TM-B40 optional (timeout; Saba-ს კითხვის კანდიდატი) |
| RR-R35-03 | info | record: by design, არ „გაასწორო“ |
| RR-R35-04 | low | TM-B40 ((b2) აზრს `aria-disabled`-ის შემდეგ იძენს) |
| RR-R35-05 | info | არქიტექტურის signal (RR-R34-05 / RR-R32-05 ოჯახი), არა task |

**ახალი item TM-B40** (todo, low, UX, TM-B39-ის შემდეგ). შემდეგ round-ში reference-first სჭირდება: R35-ის R4/R5 წყაროები.

## 3. Round 36 = TM-B38 (test-only)
**B-ის გაზომვა** (`b-round-35-exp/`). baseline `46bd74b`, ორი run, 287/287:
- ფაილები:
  - `schema-change-during-folder-load`: 23.1/22.1 s;
  - `metadata-panel-schema-change`: 21.2/24.4 s;
  - `schema-editor-stale-close`: 14.8/14.3 s;
  - `reread-after-folder-switch`: 10.1/9.5 s.
- ყველაზე ნელი ტესტი: 4.05 s.

**Prototype.** საერთო `getButtonByText` helper (`proto/dom-queries.ts.txt`, ზუსტად ერთი match) ცვლის ყველა `screen.getByRole("button", …)`-ს (24 call site, 10 ფაილი).
- იგივე ფაილები: 1.9 / 1.7–2.0 / 1.0–1.6 / 1.2 s.
- ყველაზე ნელი ტესტი: 0.61 s.
- 287/287 ×3, (b7)/(b8)-ით 289/289.
- `tsc -p tsconfig.test.json`: სუფთა.

**Pin-ების red მტკიცებულება:**
- (b7): red `3035ffc`-ის src-ზე (`expected 'STALE1' to be 'B'`).
- (b8): red BM-6 mutant-ზე.
- migrate-ებულ done-busy ფაილზე `3035ffc`-ზე (b1)(b2)(b5) ისევ red-ია, (b4) კი ისევ Unhandled Rejection-ს იძლევა.

**(e5)-ის ახალი სახელი:** `…the re-read still applies and the editor stays closed`. ტესტის body ამოწმებს `fieldNameInput()`-ის null-ობას და store-ს; ცარიელ panel-ს არ ამოწმებს. ამიტომ ახალი სახელი მხოლოდ იმას ამბობს, რაც მოწმდება.

**Docs:**
- `docs/bugs/001`: ზუსტად სამი ტექსტური ცვლილება (D-40, D-41, (e5)). ref-ები უცვლელია, რადგან src არ იცვლება.
- TESTING.md: წესი 6 (path (b), Edit tool).

**realVerified ამ round-ში:** src byte-identical-ია, ამიტომ real-app მტკიცებულება gate-ის E2E-ა (Electron xvfb-ში, 7/7 + `--retries=0`). ეს task-ში პირდაპირ წერია.

**Scope.** ხუთი finding (C-R34-02, B-R34-02, C-R34-03, C-R35-02, C-R35-03) ერთი hygiene item-ია, ქცევის ცვლილების გარეშე. TM-B39/TM-B40-ის კოდი ამ round-ში არ შედის.

## 4. დარჩენილი
- **B შემდეგ დაგეგმავს:**
  - TM-B39: reference-first, red repro;
  - TM-B40.
- **ელოდება Saba-ს ან root-ს:**
  - Saba-ს კითხვების batch (`b-round-23.md` §5: TM-T1-MIG, TM-T1-DUP, TM-B08 და D-31 deviations);
  - TM-T2 / TM-T2-DATA: blocked, საჭიროა Saba-ს UCS სია და ლიცენზია;
  - TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14: root-ის Actions link-ი და CI follow-up.
- **დამოუკიდებლად შესრულებადი:** TM-B05, TM-B06, TM-B11.
- **Out of scope:** OOS-01…03.
- Critical ან high bug ღია არ არის. COMPLETE ჯერ არ არის, რადგან ზემოთ ჩამოთვლილ scope-ს ჯერ რეალური მტკიცებულება არ აქვს.
