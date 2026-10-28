# C — Round 38 ვერიფიკაცია: TM-B40 (D-45)

**taskStatus: PASS** · realVerified: **true** · ბაგები: 1 low (C-R38-01, test gap) · BLOCKED: Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).

ყველა evidence `c-round-38/`-შია. A-ს რიცხვებს არ დავეყრდენი; ყველაფერი თავიდან გავუშვი.

## R38-1 ownership — PASS
- HEAD `ea4a1cb`. `git status`: 7 `M` (მხოლოდ owned path-ები) + 1 untracked (`tests/renderer/components/busy-buttons-focus.test.ts`). `git diff --quiet ea4a1cb -- . ':!<8 owned>'` → 0.
- `src/`-ის `+`/`-` ხაზები == `b-round-37-exp/prototype-src.diff` (diff ცარიელი). ახალი ტესტი == `busy-buttons-focus.test.ts.txt` (byte-იდენტური). ორივე test diff == B-ის `*.test.diff.txt`: 12 mapped assertion + 1 ჩასმული ხაზი (`reads[2].schema` toEqual `reads[1].schema`, 295-ე ხაზი).
- `head -n 279` SchemaEditor / `head -n 372` MetadataPanel: განსხვავდება მხოლოდ 138, 149, 186, 194 / 143.
- comment, `any`, ახალი export, `{ timeout }` არ არის.
- source fingerprint (status + diff + new test sha256) phase-ის დასაწყისში და ბოლოს ერთნაირია (`src-fingerprint-start.txt`).

## R38-2 red → green — PASS
- **Red** (throwaway copy `/tmp/c38/old`: A-ს ტესტები + `ea4a1cb`-ის 3 src ფაილი): **30 failed / 274 passed of 304**, 3 failed file (`red-run.log`).
  - (f1), (f4)–(f7): `not.toHaveAttribute("disabled")`; (f3): `aria-disabled` "false" received null; (f8): `expected [true,true,true,true,true,…] to deeply equal [true,false,false,false,…]`. (f2) გადის (pin).
  - დანარჩენი 23 failure (20 `metadata-panel-batch-save`, 3 `schema-editor-done-busy`): ყველა `aria-disabled` assertion-ზე (23/23). სხვა failure არ არის.
- **Green** A-ს tree-ზე: renderer **304/304, 20 ფაილი, ორჯერ** (`green-run-1.log`, `green-run-2.log`).
- ცალ-ცალკე (`each-alone.log`): busy-buttons-focus 8/8, metadata-panel-batch-save 49/49, schema-editor-done-busy 8/8. ახალი ტესტები 15–99 ms (< 1.5 s).

## R38-3 mutants — PASS (1 low finding)
`mutants.log`, script `mut.py.txt` (B-ის GM-1…11 + C-ის CM-1…7), A-ს tree-ის ასლზე; ასლი ბოლოს აღდგა (`diff -r` ცარიელი).
| Mutant | Killed by |
|---|---|
| GM-1 | (b2)(f2) |
| GM-2 | (f4)(f5)(f6)(f7) |
| GM-3 | (f5)(f6) |
| GM-4 | (f4)(f7) |
| GM-5 | (f4)(f7) |
| GM-6 | (b4)(f3) |
| GM-7 | (f8) |
| GM-8 | 24 tests incl. (f4)–(f7) |
| GM-9 | (f1) |
| GM-10 | (b1)(b3)(b4)(f1)(f3) |
| GM-11 | (b2)(f2) |
| CM-1 `button.tsx` class removed | survives — მოსალოდნელია; R38-4 ფარავს (real app-ში opacity 0.5, `cursor: not-allowed`) |
| CM-2 Save `aria-disabled={isSaving}` | (c)(d)(f5)(f6)(y4)(y5) |
| CM-3 Done `aria-disabled={isApplying}` | **survives** → C-R38-01 (low) |
| CM-4 Done guard inverted | 32 tests |
| CM-5 Save guard blocks when dirty | 73 tests |
| CM-6 edge class `disabled:opacity-30` | survives — **ეკვივალენტური**: კიდის ისარი ყოველთვის native `disabled`-ია, ამიტომ `disabled:opacity-30` == `opacity-30`; შუა ისარს class არ აქვს |
| CM-7 Down edge off-by-one | (f8) |

## R38-4 real app, old `ea4a1cb` vs new — PASS
- ორივე build `npm run build` (`build-old.log`, `build-new.log`, exit 0). Playwright `_electron`, `xvfb-run -a`, `--no-sandbox`, ცალკე `XDG_CONFIG_HOME` თითო scenario-ზე, stub-ირებული `dialog.showOpenDialog`. Harness (`harness.cjs`) scan-ს 4000 ms-ით, `meta:write` / `meta:write-batch`-ს 3500 ms-ით აყოვნებს, როცა arm ფაილი არსებობს. Driver `drive38.mjs`. Fixtures: `tests/fixtures/sample.wav`-ის ასლები (`fa`: a, a2, a3; `fb`: b, b2). მართვა მხოლოდ keyboard-ით (`focus()` + Enter/Space/Tab) და mouse-ით. JSON: `r38-4-<build>-K*.json`, stdout: `run-*.txt`.
- **K1 (Done busy):**
  - new: Enter-ის შემდეგ `activeElement` = BUTTON `Applying...`, `aria-disabled="true"`, `aria-busy="true"`, `disabled` attr არ აქვს. Enter + Space-ის შემდეგაც იგივე. editor იხურება `/fb`-ის load-ის შემდეგ (Done-დან 3694 ms).
  - IPC: Done-ის შემდეგ `/fb`-ზე 2 `meta:read-batch`: +3570 ms folder load-ის read (scan reply +3569) და +3590 ms Done-ის schema re-read. ეს ნიშნავს ზუსტად ერთ re-read-ს Done-ზე; Enter/Space-მა დამატებითი არ გამოიწვია. old-ში იგივე 2.
  - old: Enter-ის შემდეგ `activeElement` = **BODY**, ღილაკი native `disabled`.
  - ორივე: after-load focus BODY (Deviation 4, მოსალოდნელი). sha256 უცვლელი.
- **O (opacity, effective = ancestor-ების product):**
  | | rest: first Up / middle Up / last Down / Done | Applying: first Up / middle Up / last Down / Done |
  |---|---|---|
  | new | 0.3 / 1 / 0.3 / 1 | **0.18 / 0.6 / 0.18 / 0.5** |
  | old | 0.3 / 1 / 0.3 / 1 | 0.18 / **0.18** / 0.18 / 0.5 (native disabled) |
  - Rescan scan-ის დროს (native `disabled`): 0.5, `not-allowed` ორივე build-ში.
- **K2 (Save Tags single):**
  - new: write-ის დროს focus = `Saving...` (`aria-busy="true"`, `aria-disabled="true"`). მეორე Enter-ის შემდეგაც იგივე. save-ის შემდეგ focus = `Save Tags` (`aria-disabled="true"`, `aria-busy="false"`). დამატებითი Enter → არაფერი. **ერთი `meta:write`**, toast `Tags saved`, ფორმა Category `R38Focus`.
  - old: write-ის დროს და save-ის შემდეგ focus = **BODY**. ერთი write.
  - ფაილი `fa/a.wav`: ffprobe `{"IKEY":"","ICAT":"R38Focus"}`, music-metadata `exif:ICAT = R38Focus` (`exif:IKEY = ""`). ფორმას ემთხვევა. შეიცვალა მხოლოდ `a.wav`-ის sha256; a2, a3, b, b2 უცვლელია.
- **K3 (clean Save + Tab):**
  - new: Category input-იდან Tab → "Save as" → template ღილაკები → **Save Tags** (`aria-disabled="true"`), 11 Tab. Enter → 0 `meta:write`, focus რჩება. sha256 უცვლელი.
  - old: Tab Save Tags-ს **ტოვებს** (40 Tab: toolbar, list და ისევ panel, Save Tags-ზე არასდროს).
- **K4 (batch):**
  - new: clean `Save to 2 files` `aria-disabled="true"` (0.5). write-ის დროს focus = `Saving...` busy, მეორე Enter-ის შემდეგაც. save-ის შემდეგ focus `Save to 2 files` (`aria-disabled="true"`). **ერთი `meta:write-batch`**, toast `Tags saved to 2 files`.
  - old: write-ის დროს focus BODY; ერთი batch write.
  - ფაილები: `a.wav` და `a2.wav`: ffprobe `ICAT=R38Batch`, music-metadata `exif:ICAT=R38Batch` (ორივე build). `a3`, `b`, `b2` უცვლელია.
- **იერი:** new-ის busy/clean ღილაკი: own opacity 0.5, `cursor: not-allowed`, bg `rgb(18,217,200)`. ზუსტად ემთხვევა old-ის native disabled მდგომარეობას. screenshot-ები: `r38-4-{new,old}-K{1..4}-NN-*.png`.
- `pageErrors` და console errors ცარიელია ყველა 8 run-ში.

## R38-5 gate — PASS
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand`: **exit 0** (`gate.log`). Biome: 0 error / **8 warning**, rule/file სია == `c-round-35/biome-new.txt`. typecheck node/web/test: 0. renderer **304/304**, main **93/93**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7**, exit 0 (`e2e-retries0.log`).

## R38-6 docs — PASS
- diff: `docs-diff.txt`. ტექსტი ქართულია, ტექნიკური ტერმინები ინგლისურად.
- **Header:** (20), (21) fixed სიაშია. TM-B39/TM-B40 `წყარო`-შია. `isSaveBlocked`, `withListedSelection`, `reorderArrowClassName`, `ui/button.tsx` დამატებულია. D-41/D-42-ის deps-ის წინადადებები D-45-ზე მიუთითებს. D-42-ში `:280-283` და D-45-ის pointer. D-44 და D-45 bullet-ები კოდს ემთხვევა.
- **Entry 18:** მხოლოდ ერთი ბოლო წინადადება. **Entry 20:** მხოლოდ `handleClick` (დანარჩენ ref-ებს `ea4a1cb`-ზე უკვე ჰქონდა სახელები; ეს გადავამოწმე). **Entry 21:** §3(d)-ის ყველა ველი აქვს. 8 ტესტის სახელიდან თითოეული: docs-ში 1, test file-ში 1.
- **ref-ები `sed -n`-ით** A-ს tree-ზე სწორია:
  - SchemaEditor 37, 39-44, 45, 137-149, 138, 139, 143, 146-149, 156, 165, 186, 194, 271, 280-283, 290-292;
  - MetadataPanel 143, 373-374, 384-387;
  - button 35;
  - file-store 55, 242-250;
  - FolderBrowser 103/108/161/166;
  - App 48/61;
  - FileList 68.
- entries 1–17 და 19 byte-identical (`ea4a1cb`-თან section-ის sha256).
- **ხელახალი დათვლა:** 21 ჩანაწერი; 12 `გასწორდა`; 5 `Saba-ს კითხვა`; 4 `ცნობილი შეზღუდვა`. README `21 / 12 / 5` სწორია.
- **R4** (APG, WebFetch): "Browsers remove HTML input elements with the `disabled` attribute from the tab sequence"; Up button-ის მაგალითი არსებობს. დადასტურდა.
- **R5** (MDN, WebFetch): "does not change the focusability", "must manually ensure … functionality suppressed", native control-ისთვის `disabled`, contrast-ის შენიშვნა. დადასტურდა.
- **Deviations 1–6 app-ში:**
  1. დადასტურდა: `aria-disabled` + guard.
  2. დადასტურდა: K3, clean Save Tab-ის რიგშია.
  3. დადასტურდა: edge ისარს native `disabled` აქვს.
  4. დადასტურდა: K1-ში Done-ის შემდეგ focus BODY-ზეა.
  5. დადასტურდა: opacity 0.5.
  6. timeout არ არის; ეს არ შემიმოწმებია, რადგან scope-ის გარეთაა.

## ბაგები
- **C-R38-01 (low, test gap):** mutant CM-3 (`aria-disabled={isApplying}`, ანუ `fields.length === 0` ამოღებული) ცოცხალი რჩება. ცარიელი field list-ის `Done`-ის `aria-disabled="true"`-ს არცერთი ტესტი არ ამოწმებს. click guard მაინც ბლოკავს, ამიტომ user-visible ბაგი არ არის. კანდიდატია TM-B41-ისთვის (test-only).

## შენიშვნები (ბაგი არ არის)
- batch ფორმა save-ის შემდეგ ყველა ველზე "Multiple values" placeholder-ს აჩვენებს, თუმცა ორივე ფაილს `ICAT=R38Batch` აქვს. ქცევა old-შიც ზუსტად იგივეა, ანუ არსებული batch დიზაინია და ამ round-ს არ ეხება. B-მ შეიძლება გადახედოს, არის თუ არა ის მოსალოდნელი.
- Save Tags-ის დროს `IKEY=""` იწერება ცარიელ Keywords-ზე (old-შიც ასეა; WAV_METADATA-ის არსებული ქცევაა).
