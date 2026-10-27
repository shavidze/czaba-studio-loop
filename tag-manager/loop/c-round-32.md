# C — Round 32 verification: TM-B34 / D-39 (გვიანი re-read-ები folder-ის შეცვლის შემდეგ)

**Verdict: PASS** — R32-1…R32-6 ყველა PASS, realVerified=true, ახალი ბაგი 0.
Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).

ყველა evidence: `c-round-32/`. C-ს source-ში არაფერი შეუცვლია; ყველა experiment `/tmp/c-r32-{old,new,red,mut}` copy-ებში გაეშვა. R32-4 gate repository-ში გაეშვა (მხოლოდ gitignored output: `out/`, `test-results/`, fixtures).
Tree-ის fingerprint (`git diff 7355d78` + ახალი test ფაილი, sha256) C-ს ფაზის დასაწყისში და ბოლოს იდენტურია: `2edef833…1c33` (`c-round-32/src-fingerprint-start.txt`); `git status` ბოლოს: იგივე 7 `M` + 1 `??`.

## R32-1 ownership + process — PASS
- HEAD `7355d78`; `git status --porcelain --untracked-files=all`: 7 owned `M` + `?? tests/renderer/components/reread-after-folder-switch.test.ts`.
- `git diff --quiet 7355d78 -- . ':!<8 owned paths>'` → exit 0 (`file-store.ts`, `FolderBrowser.tsx`, `utils.ts`, `types/**`, `src/main/**`, helpers, setup, e2e — byte-identical).
- src diff (`c-round-32/src-diff.txt`) ზუსტად D-39-ია: import `isFolderLoadCurrent`; `isListedPath` (60-62); single `if (isListedPath(path)) updateFileMetadata(path, updated);`; batch filter 3 ხაზად `!failedPaths.has(path) && isListedPath(path)`; `const loadId = useFileStore.getState().folderLoadId;` `allFiles` check-ის შემდეგ; `if (!isFolderLoadCurrent(loadId)) return;` chunk loop-ის შემდეგ, `currentMetadata`-მდე. `App.tsx`: ერთი guard ხაზი wait loop-ში `setTimeout`-ის შემდეგ. toast ტექსტი არ შეცვლილა; comment / `any` / `@ts-ignore` / ახალი `as` არ არის.
- `folder-read-overlap.test.ts`: მხოლოდ დამატება (0 წაშლილი ხაზი, ერთი hunk ფაილის ბოლოს). `file-store.test.ts`: მხოლოდ import-ის გაერთიანება. `STATE_MANAGEMENT.md`: ზუსტად 1 დამატებული ხაზი (D-39), ტექსტი task-ის იდენტური.
- ახალი test ფაილი byte-identical-ია B-ს `b-r32-reread.test.ts.txt`-თან (`cmp`).
- "No Bash write": **unknown** — A-ს სრული transcript არ მაქვს (A ამბობს, რომ მხოლოდ Edit/Write გამოიყენა). FAIL არ არის.

## R32-2 red → green — PASS
- `/tmp/c-r32-red` = A-ს tree, ოღონდ `MetadataPanel.tsx` და `App.tsx` `7355d78`-დან (`diff -r src` old copy-სთან ცარიელი). Renderer: **8 failed / 260 passed (268)**, 15 ფაილი (`r32-2-red.log`). ჩავარდნილი: (v1)–(v4), (v6)–(v9); (v5), (o17), (o18) და 257 ძველი მწვანე.
- პირველი ჩავარდნილი assertion (`r32-2-red-first-assert.txt`), ყველა სიმპტომია:
  | ტესტი | ხაზი | received |
  |---|---|---|
  | (v1) | 154 | `metadata` = `{/fa/a.wav: R32Cat, /fb/b.wav}` (stray key) |
  | (v2) | 174 | `metadata` = `{/fa/a.wav, /fa/a2.wav (R32Cat), /fb/b.wav}` |
  | (v3) | 190 | Close-ის შემდეგ `{/fa/a.wav: R32Cat}` ≠ `{}` |
  | (v4) | 213 | reject-ებული reopen-ის შემდეგ `{/fa/a.wav: R32Cat}` ≠ `{}` |
  | (v6) | 252 | `metadata` = A-ს map (`/fa/a.wav`, `/fa/a2.wav`), არა `{b}` |
  | (v7) | 270 | toast `Failed to read 2 files` ≠ null |
  | (v8) | 284 | Close-ის შემდეგ A-ს map ≠ `{}` |
  | (v9) | 306 | `scanFolder` calls `["/fb", "/fa"]` ≠ `["/fb"]` |
- A-ს tree (`/tmp/c-r32-new`): **268/268, 15 ფაილი** (`r32-2-green.log`).
- თითო ახალი ტესტი ცალკე `-t "(id)"`: (v1)–(v9), (o17), (o18) — თითო `1 passed | 267 skipped` (`r32-2-alone.log`).
- შენიშვნა (info, არა FAIL): პირველი green run red run-თან **პარალელურად** გავუშვი 4-core runner-ზე და (s1) (`metadata-panel-schema-change.test.ts`) 5000 ms timeout-ით ჩავარდა; მარტო გაშვებისას 268/268, gate-შიც 268/268. ეს load-ის ეფექტია, არა D-39; ჩავწერე, რადგან ნელ CI-ზე (s1)/(v9) timing-ზე დამოკიდებულია (A-ც აღნიშნავს (v9)-ს).

## R32-3 mutations — PASS
`c-round-32/mut.py` (B-ს `mut.py.txt`-ის edit-ები, target `/tmp/c-r32-mut`, დამატებული SM-0 control), ექვსი ფაილი ერთად, 110 ტესტი (`mutants.log`):
| mutant | ზუსტი edit | შედეგი |
|---|---|---|
| SM-0 control | არაფერი | 110/110 pass |
| SM-1 | `if (isListedPath(path)) updateFileMetadata(...)` → `updateFileMetadata(path, updated);` | KILLED (v1)(v3)(v4) |
| SM-2 | `!failedPaths.has(path) && isListedPath(path)` → `!failedPaths.has(path)` | KILLED (v2) |
| SM-3 | save-ის დასაწყისში `saveLoadId = folderLoadId`; ორივე branch `isFolderLoadCurrent(saveLoadId)` | KILLED (k6)(r1)(r2)(r3)(r6)(r7)(v5) |
| SM-4 | save-ის დასაწყისში `saveFolder = folderPath`; ორივე branch `folderPath === saveFolder` | KILLED (v5) |
| SM-5 | schema guard წაშლილი | KILLED (v6)(v7)(v8) |
| SM-6 | guard → `isCurrent`, მხოლოდ `if (isCurrent) setMetadata(...)` | KILLED (v7) |
| SM-7 | `loadId` აღებული loop-ის შემდეგ (guard-ის წინ) | KILLED (v6)(v7)(v8) |
| SM-8 | App wait-loop guard წაშლილი | KILLED (v9) |
| SM-9 | App guard loop-ის **შემდეგ** (`}` შემდეგ), არა შიგნით | SURVIVED — ეკვივალენტური |
- SM-9 ეკვივალენტურობა (`App.tsx:44-60`): loop-ის შიგნით store-ში არაფერი იწერება; loop-ის შემდეგ პირველი ნაბიჯი `scanFolder`-ია. ორივე ვარიანტში superseded load `return`-ით გადის `try`-მდე (ამიტომ `finally` არც ერთში არ სრულდება) და `scanFolder` არ იძახება. ერთადერთი განსხვავება: superseded load ≤5 s-ს ზედმეტად poll-ავს (`isLoaded`-ს ან `maxWait`-მდე), რაც გარედან უხილავია. მოსალოდნელი killers ყველა ემთხვევა.

## R32-4 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), `verify.log`:
- `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **VERIFY_EXIT=0** (45 s).
- Biome: 0 errors, **8 warnings** — ფაილი+rule-ის სია `c-round-31/biome-new.txt`-ის იდენტურია (FileList, TagsInput, AudioPlayer, FolderBrowser, TemplatePicker, input, select — a11y; toast — useExhaustiveDependencies).
- typecheck (`tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.test.json`) 0.
- Renderer **268/268** (15 ფაილი), main **93/93**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7**, RETRIES0_EXIT=0.

## R32-5 real app, old vs new — PASS
- Builds: `/tmp/c-r32-old` (`git archive 7355d78`) და `/tmp/c-r32-new` (A-ს tree-ს copy), `npx electron-vite build` exit 0 ორივეზე (`build-old.log`, `build-new.log`).
- გაშვება: Playwright `_electron`, `xvfb-run -a`, `--no-sandbox`, ყოველ სცენარზე ახალი `XDG_CONFIG_HOME` და ახალი folder copy-ები, `-r c-round-32/harness.cjs` (R31-ის adaptation): read-one marker → `meta:read` `slow/`-ზე 5000 ms; batch delay / reject markers → `meta:read-batch` `slow/`-ზე; ყოველი `meta:read`, `meta:read-batch`, `meta:write`, `fs:scan-folder` call log-ში. Driver: `c-round-32/drive.mjs`; მხოლოდ UI (Open Folder ღილაკი, row click, Category input, Save Tags, gear → Add Field → Done), `dialog.showOpenDialog` stubbed. Viewport 1400×900.
- Setup (ყველა run, disarmed): fast → `f.wav` → `R32Fast` → Save → `Tags saved`; slow → `s.wav` → `R32Slow` → Save → `Tags saved`. ორივე reader setup-ის შემდეგ: ffprobe `ICAT` და music-metadata `exif:ICAT` = `R32Slow` / `R32Fast`.

| სცენარი | old (`7355d78`) | new (A) |
|---|---|---|
| **V** | save-ის `meta:read` delayed (Open fast 50 ms-ში); reopen slow (batch delay+reject) → `Failed to read 1 files` (~5.0 s); **`s.wav` `Tagged`, ფორმის Category `R32Slow2`** — stray entry (red ✔) | იგივე toast; **`s.wav` არ არის `Tagged`, Category ცარიელი** |
| **SC** | schema re-read delayed, fast გაიხსნა `f.wav` `Tagged`-ით; 7 s-ის შემდეგ **`f.wav` კარგავს `Tagged`-ს, Category ცარიელი** (red ✔); toast არ არის | 7 s-ის შემდეგ `f.wav` `Tagged`, Category `R32Fast`, toast არ არის |
| **SJ** | **`Failed to read 1 files` fast-ის ჩატვირთვის შემდეგ**, `f.wav` კარგავს `Tagged`-ს, Category ცარიელი (red ✔) | `Tagged`, `R32Fast`, toast არ არის |

- ყველა run (6/6): `Tags saved` V-ში ორივე build-ზე; `f.wav` sha256 setup-ის შემდეგ უცვლელი; `s.wav` sha256 SC/SJ-ში უცვლელი, V-ში ერთხელ იცვლება (save-ით) და მერე აღარ; საბოლოო ffprobe + music-metadata field-by-field: `ICAT=R32Fast` (`f.wav`), `R32Slow2` (V) / `R32Slow` (SC/SJ) (`s.wav`); `R32note` არცერთ reader-ის output-ში; `pageErrors` ცარიელი. JSON: `r32-5-{old,new}-{V,SC,SJ}.json`, stdout: `run-*.txt`.
- Screenshots: `r32-5-{old,new}-V-0[0-4]-*.png`, `r32-5-{old,new}-{SC,SJ}-0[0-3]-*.png`. Category ველი 1400×900 viewport-ში fold-ის ქვემოთაა; მისი მნიშვნელობა DOM-იდანაა (`inputValue`, JSON-ში `clickS.form` / `clickF.form`); `Tagged` badge screenshot-ებზე ჩანს.
- მხოლოდ unit-ით დაფარული (real app-ში არ შემოწმდა): Close save-ის ან schema re-read-ის დროს ((v3), (v8)); drop schema-ს ჩატვირთვის დროს ((v9)); parent-folder pin ((v5)). Artists — მხოლოდ ჩანაწერი (TM-B08).
- დაკვირვება (უკვე ცნობილია, C-R28-01 / B-R19-01): V-ში Open Folder pending save-ის დროს `Unsaved changes were discarded` ჩნდება ორივე build-ზე, თუმცა save სრულდება. ახალი ბაგი არ არის.

## R32-6 docs — PASS
- `docs/bugs/001-…md`: ქართული, English technical terms. ჩანაწერი `## 15.` ზუსტად task-ის layout-ით: ID-ები, severity low, `file:line`, მიღწევადობა (save / schema C-R27-01 / drop მხოლოდ start-ზე), reproduction (a)(b)(c), "დისკზე არაფერი იცვლება", რატომ "listed path" (D-35/Rescan, (v5)), D-39, `გასწორდა (D-39, TM-B34)`.
- grep: (v1)–(v9), (o17), (o18) თითოეული სრული სახელი docs ფაილში ზუსტად 1-ჯერ და ყველა test ფაილში ზუსტად 1-ჯერ; (o17)/(o18) სრული სახელები ჩანაწერ 14-შია, ჩანაწერ 15-ში მხოლოდ ID + "(იხ. (14))".
- ჩანაწერი 14: `გადაწყვეტილება` → "ის ჩანაწერ (15)-შია და D-39-მა გაასწორა"; ტესტების სიაში (o17), (o18).
- D-39 bullet კოდს ემთხვევა; backlog-ის `decisions` D-39-ს ემთხვევა.
- Header: fixed "(3), (9), (11), (12), (13), (14) და (15)"; `წყარო` → `TM-B34 (round 32)`; `კოდი` → `isListedPath` და App `openFolder`-ის "schema-ს ლოდინის loop".
- `file:line`: `c-round-32/refs.py` ყოველ `MetadataPanel.tsx` / `App.tsx` ref-ს (bare `:N`-ების ჩათვლით, 61 + 2 orphan bare ref ხაზებზე 138/140 → `:251` `setMetadata(accumulated)`, `:255` `setEditingMetadata`) A-ს tree-ზე ხსნის (`refs.txt`); ყველა აღწერილ კოდზე მიუთითებს. Frozen-ფაილების refs (FileList, FolderBrowser, file-store, metadata-store, utils, metadata.ts, reset-stores) multiset old = new.
- ჩანაწერები 1–13: ციფრების მოცილების შემდეგ diff ცარიელია — მხოლოდ line shift-ები. უფრო მკაცრი check: მხოლოდ `:N(-M)` token-ების normalize-ით (სხვა ციფრები ხელუხლებელი) old↔new diff-ის hunk-ები მხოლოდ header (3-5), D-39 bullet (18), ჩანაწერი 14-ის `გადაწყვეტილება`/`ტესტი` (209-210→210-211) და ჩანაწერი 15 (213-227) — ჩანაწერებში 1–13 სხვა რიცხვი (test ID, D-ID, count) არ შეცვლილა.
- README row: ზუსტად `ცნობილი შეზღუდვების სია (15 ჩანაწერი; 7 გასწორდა, 5 მათგანი Saba-ს კითხვაა)` (1 match).
- `STATE_MANAGEMENT.md`: D-39 ხაზი 1-ჯერ.

## B-სთვის (არა FAIL, ამ round-ში არ შემოწმებულა)
- **A-R32-01 — D-39(b)-ის gap, რომელსაც acceptance არ ასახელებს (round 33-ის კანდიდატი, low).** task-ის გამორიცხვა ("folder load, რომელიც schema-ს ცვლილებამდე დაიწყო და schema re-read-ის **შემდეგ** სრულდება") ამ შემთხვევას არ ფარავს: აქ load re-read-ის **წინ** სრულდება. კოდის მიხედვით (`MetadataPanel.tsx:216-235`) guard ვერ დაიჭერს: `loadId` აიღება მაშინ, როცა `beginFolderLoad()` უკვე გაეშვა (ე.ი. ის მიმდინარეა), ხოლო `allFiles` ჯერ კიდევ ძველი folder-ის სიაა. sequence: საწყისი — folder A გახსნილია, schema editor ღიაა, custom field დამატებულია → მოქმედება — sidebar-ში Open Folder B (scan/read ჯერ pending; sidebar გამოყენებადია, C-R27-01) → `Done` B-ის `setFiles`-მდე → B-ის load სრულდება → A-ს path-ების schema re-read chunk-ები resolve-დება → მოსალოდნელი შედეგი: `setMetadata(accumulated)` B-ის map-ს A-ს entry-ებით ცვლის (B კარგავს `Tagged`/ფორმის მნიშვნელობებს; reject-ზე stale toast). C-ს ეს real app-ში ან unit-ით **არ** reproduce-ა — კოდის წაკითხვაზე დაფუძნებული inference-ია. A-ს შემოთავაზებული ტესტი (v10): (v6)-ის ფორმა, ოღონდ `Done` `beginFolderLoad`-ის შემდეგ და `setFiles(B)`-მდე. შესაძლო fix-ები (A): `files !== allFiles` შემოწმება guard-თან, ან ადრეული return `isScanning`-ზე. PASS-ს არ ცვლის (acceptance table-ში არ არის).
- A-R32-02 (single save-ში `skipSyncRef` დგება მაშინაც, როცა `isListedPath` false-ია) C-მ არ reproduce-ა; B-მ ჩაწეროს backlog-ში.
- (v9)/(s1) timing-ზე დამოკიდებულია (50 ms poll / 5000 ms timeout); პარალელური load-ის ქვეშ (s1) ერთხელ ჩავარდა (იხ. R32-2). info.
