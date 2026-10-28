# A — Round 38 ანგარიში: TM-B40 (D-45) — busy Done / Save Tags focus-ს ინარჩუნებს

STATUS: DONE (implementation). real-app R38-4 A-ს არ გაუშვია; ის C-ს საქმეა.

**Baseline:** HEAD `ea4a1cb`. დაწყებისას `git status --porcelain --untracked-files=all` ცარიელი იყო.

## შეცვლილი ფაილები (მხოლოდ owned)
| ფაილი | ცვლილება |
|---|---|
| `tests/renderer/components/busy-buttons-focus.test.ts` (ახალი) | `b-round-37-exp/busy-buttons-focus.test.ts.txt`-ის byte-იდენტური ასლი, (f1)–(f8) (`diff` ცარიელია) |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | B-ის diff `patch`-ით: მხოლოდ ხაზები 99, 171, 193, 211, 381, 953, 994, 1006, 1071 |
| `tests/renderer/components/schema-editor-done-busy.test.ts` | B-ის diff `patch`-ით: 158/189/207 და 294-ის შემდეგ ჩასმული `expect(reads[2].schema).toEqual(reads[1].schema);` |
| `src/renderer/src/components/schema/SchemaEditor.tsx` | `prototype-src.diff` `patch -p1`-ით: guard `:138`, deps `:149`, ისრები `:186`/`:194`, `aria-disabled`/`aria-busy` `:280-281`, `reorderArrowClassName` `:290-292` |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | იგივე patch: guard `:143`, `:373-374`, `isSaveBlocked` `:384-387` |
| `src/renderer/src/components/ui/button.tsx` | იგივე patch: class-ის ხაზი `:35` |
| `docs/bugs/001-save-and-selection-known-limits.md` | §3 (a)–(d), დეტალები ქვემოთ |
| `docs/bugs/README.md` | row 001: `21 ჩანაწერი; 12 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა` |

src-ის `+`/`-` ხაზები B-ის `prototype-src.diff`-ს ემთხვევა (`diff` ცარიელია).

**Docs-ის დეტალები (`001`):**
- **Header:**
  - fixed სიაში დაემატა (20) და (21);
  - `წყარო`-ს დაემატა TM-B39 (round 37) და TM-B40 (round 38);
  - `კოდი`-ს დაემატა `isSaveBlocked`, `withListedSelection`, `reorderArrowClassName` და `ui/button.tsx`;
  - D-41: deps-ის წინადადება ახლა ამბობს, რომ D-45-მა დაამატა `isApplying` (`:149`);
  - D-42: `:280-282` → `:280-283`; native-disabled-ის წინადადება D-45-ზე მითითებით შეიცვალა; deps-ის წინადადება განახლდა;
  - D-44 და D-45 bullet-ები დაემატა D-43-ის შემდეგ.
- **Entry 18:** Deviations-ს ერთი წინადადება დაემატა.
- **Entry 20:** `ea4a1cb`-ზე FolderBrowser-ის და App-ის ref-ებს უკვე ჰქონდათ `handleOpenFolder` / `handleRescan` / `openFolder`. აკლდა მხოლოდ `FileList.tsx:68`-ს, ამიტომ დაემატა `handleClick`.
- **Entry 21:** ახალია, §3(d)-ის ყველა ველით.
- **ხელახალი დათვლა:**
  - 21 `## N.` ჩანაწერი;
  - 12 `გასწორდა`;
  - 5 `Saba-ს კითხვა`;
  - 4 `ცნობილი შეზღუდვა`.
- 8 ტესტის სახელიდან თითოეული: docs-ში 1 დამთხვევა, ტესტის ფაილში 1.
- **Ref-ები, რომლებიც `sed -n`-ით შევამოწმე:**
  - `SchemaEditor.tsx` 138, 149, 186, 194, 280-283, 290-292;
  - `MetadataPanel.tsx` 143, 373-374, 384-387;
  - `button.tsx` 35;
  - `file-store.ts` 55, 242-250;
  - `FolderBrowser.tsx` 103/108/161/166;
  - `App.tsx` 48/61;
  - `FileList.tsx` 68 (`handleClick` იწყება 56-ზე).

## რეალურად გაშვებული ტესტები
**Red:** ახალი და migrated ტესტები `ea4a1cb`-ის src-ზე, `src/`-ის ცვლილებამდე.
- renderer: **30 failed / 274 passed of 304**; 3 file failed / 17 passed (`a-round-38/red-run.log`). B-ის რიცხვს ემთხვევა.
- (f1): `expect(element).not.toHaveAttribute("disabled")`.
- (f2): გადის (pin).
- (f3): `expect(element).toHaveAttribute("aria-disabled", "false")`, received null.
- (f4)–(f7): `expect(element).not.toHaveAttribute("disabled")`.
- (f8): `expected [ true, true, true, true, true, …(8) ] to deeply equal [ true, false, false, false, …(9) ]`.
- დანარჩენი 23: migrated assertion-ებია, `aria-disabled` received null (მაგ. `metadata-panel-batch-save.test.ts:1071`, `schema-editor-done-busy.test.ts:158/189/207`).

**Green:**
- renderer **304/304, 20 ფაილი, ორჯერ** (`green-run-1.log`, `green-run-2.log`).
- ცალ-ცალკე:
  - `busy-buttons-focus` 8/8;
  - `metadata-panel-batch-save` 49/49;
  - `schema-editor-done-busy` 8/8.
- ახალი ტესტების ხანგრძლივობა (`new-tests-timing.txt`), ყველა < 1.5 s:

  | f1 | f2 | f3 | f4 | f5 | f6 | f7 | f8 |
  |---|---|---|---|---|---|---|---|
  | 97 ms | 50 | 73 | 46 | 33 | 15 | 32 | 51 |

**სხვა შემოწმებები:**
- **Biome `src/`:** 0 error, 8 warning; rule/file წყვილები იგივეა, რაც `c-round-35/biome-new.txt`-ში (`biome.txt`).
- **`npm run typecheck`** (node/web/test): exit 0.
- **main:** 93/93.
- **სრული `verifyCommand`** სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`): **exit 0**. renderer 304, main 93, E2E 7/7 (`verify.log`).
- **`xvfb-run -a npx playwright test --retries=0`:** 7/7, exit 0 (`e2e-retries0.log`).

**Code review** (`code-reviewer` subagent): correctness, TS, security და წესების defect არ არის. შენიშვნები:
1. **low:** aria-disabled Button-ზე hover style კვლავ მუშაობს. Tailwind v4-ში native `disabled`-ზეც ასეა, ამიტომ regression არ არის; არ შემიცვლია.
2. **low:** კიდის ისარი Applying-ის დროს 18%-ზეა. ეს დიზაინით ასეა (D-45 / (f8)).
3. **nit:** (b1)-ის სახელში ისევ წერია "is disabled". task ტესტის სახელის შეცვლას კრძალავს, ამიტომ არ შეიცვალა. TM-B41-ის კანდიდატია.

## რა არ გაუშვია A-ს / ცნობილი ხარვეზები
- **R38-3 mutants** (GM-1…GM-11): C-ს საქმეა.
- **R38-4 real app, ძველი vs ახალი** (K1–K4, O, focus, ffprobe და music-metadata): C-ს საქმეა. jsdom focus-ის დაკარგვას არ აჩვენებს, ამიტომ RR-R35-01-ს მხოლოდ real app ადასტურებს.
- **Windows packaging:** BLOCKED — Windows packaging is not available in the cloud.
- **RR-R35-02** (timeout): Saba-ს ღია კითხვად რჩება.

## C-ს შემდეგი შემოწმებები
1. **R38-1:**
   - `git diff ea4a1cb -- src/` == `b-round-37-exp/prototype-src.diff`;
   - ახალი ტესტი == `busy-buttons-focus.test.ts.txt`;
   - ტესტის diff-ები == B-ის `*.test.diff.txt`.
2. **R38-2:** red (30/274), მერე green ორჯერ.
3. **R38-3:** GM-1…GM-11.
4. **R38-4:** K1–K4 და O. aria-disabled ღილაკებს `focus()` + Enter/Space-ით ამოძრავე და არა `locator.click()`-ით.
5. **R38-5:** gate.
6. **R38-6:** ზემოთ ჩამოთვლილი ref-ები `sed -n`-ით; entries 1–17 და 19 byte-იდენტური.

## Acceptance ID-ები
A-მ R38-1, R38-2 და R38-5 ლოკალურად გაუშვა და რიცხვები მოსალოდნელს ემთხვევა, მაგრამ C-ს ისინი ჯერ არ დაუდასტურებია. R38-3 და R38-4 A-ს არ გაუშვია. **A არცერთ acceptance-ს PASS-ად არ ნიშნავს**: ამას C ადასტურებს.
