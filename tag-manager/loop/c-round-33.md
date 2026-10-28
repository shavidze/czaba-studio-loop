# C — Round 33 ვერიფიკაცია: TM-B35 / D-40 (schema-ს ცვლილება მიმდინარე folder load-ის დროს)

Verifier: C · თარიღი: 2026-10-28 · Baseline: `ee15e6c` (HEAD = baseline, release commit არ არის)

**VERDICT: PASS** — R33-1…R33-6 ყველა PASS, `realVerified=true`. ორი ახალი **low** finding round 34-ისთვის (არცერთი არ არის ამ round-ის acceptance-ის FAIL): C-R33-01 (DM-3-ის killer, test gap) და C-R33-02 (= QA-R33-01, real app-ში დადასტურდა, pre-existing, D-40-მა ფანჯარა გააფართოვა).
Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).

Evidence: `c-round-33/` (logs, screenshots, `r33-5-*.json`, `harness.cjs`, `drive.mjs`, `mut.py`, `mutants/*.diff`, `c-dm3-probe.test.ts.txt`, `refs-old.txt`/`refs-new.txt`).
Source fingerprint (`git diff ee15e6c` + untracked test) start = end: `57f4d297…a8d9`. ჩემს phase-ში src არ შეცვლილა.

## R33-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all`: 4 M (`STATE_MANAGEMENT.md`, `001-…md`, `README.md`, `MetadataPanel.tsx`) + 1 `??` (`schema-change-during-folder-load.test.ts`).
- `git diff --quiet ee15e6c -- . ':!<5 owned>'` → exit 0. `App.tsx`, `stores/**`, `FolderBrowser.tsx`, `SchemaEditor.tsx`, `tests/**` (ძველი), `src/main/**`, protected ფაილები byte-identical.
- src diff ზუსტად D-40-ია: `waitForFolderLoadIdle` (body task-ის ტექსტის იდენტური, `isListedPath`-ის შემდეგ), `allFiles` selector წაიშალა, სამი ახალი start ხაზი, `files.map`, deps `[setMetadata, setEditingMetadata, showToast]`. toast-ის ტექსტი არ შეცვლილა. დამატებულ src ხაზებში comment / `any` / `@ts-ignore` / ახალი `as` არ არის.
- `STATE_MANAGEMENT.md`: D-39 ხაზში ერთი ფრაზა შეიცვალა, ზუსტად ერთი D-40 ხაზი დაემატა (task-ის ტექსტი სიტყვასიტყვით).
- Test file: copied leftover ვერ ვიპოვე (`App`, `STANDARD_FIELDS`, `PATH_SUB`… არ არის; ყველა helper გამოიყენება).
- Bash write repository-ში: **unknown** — `a-round-33-result.json`-ს სრული transcript არ აქვს (`permission_denials: []`). FAIL არ არის.

## R33-2 red → green — PASS
- Throwaway copy (`/tmp/c33/red`: A-ის tree + `ee15e6c`-ის `MetadataPanel.tsx`): **Tests 3 failed | 272 passed (275)**, Files 1 failed | 15 passed (`r33-2-red.log`). (w4)–(w7) და 268 ძველი green.
  - (w1) `:181` — `metadata`-ში `/fa/a.wav` (`r33note "AN"`) და `/fa/a2.wav` (`"A2N"`) `/fb/b.wav`-ის ნაცვლად (A-ის map B-ის სიის ქვეშ; `:180` `files=[FILE_B]` გაიარა).
  - (w2) `:213` — `expected 'Failed to read 2 files' to be null` (stale toast).
  - (w3) `:236` — `/fa/a.wav`, `/fa/a2.wav` entries `r33note`-ის გარეშე.
- A-ის tree (`/tmp/c33/new`): **275/275, 16 files** (`r33-2-green.log`).
- ცალკე (`-t`, `r33-2-alone.log`): (w1) 2112 ms, (w2) 2071, (w3) 2087, (w4) 2019, (w5) 2141, (w6) 1500, (w7) 1690. ყველა < 4 s. შენიშვნა: `-t "(w1)"` regex-ია, (w2)-საც ემთხვევა; (w1) ცალკე `^schema change … \(D-40\) \(w1\)` pattern-ით გავუშვი.

## R33-3 mutations — PASS (DM-3-ზე killer დასახელებულია → C-R33-01)
7 ფაილი (ახალი + `reread-after-folder-switch`, `folder-read-during-save`, `metadata-panel-schema-change`, `metadata-panel-batch-save`, `folder-read-overlap`, `folder-read-rejected-chunk`), 117 ტესტი, თითო mutant (`mutants.log`, ზუსტი edit-ები `mutants/DM-*.diff`):
| Mutant | შედეგი | მოსალოდნელი |
|---|---|---|
| BASE (`ee15e6c` src) | 3 failed: (w1)(w2)(w3) | ✓ |
| DM-0 control | 117/117 | ✓ |
| DM-1 wait removed | (w1)(w2)(w3) | ✓ |
| DM-2 closure `allFiles` after wait | (w1)(w2)(w4)(w5) | ✓ |
| DM-3 `loadId` before wait | **survives** 117/117 | ✓ (survives) |
| DM-4 `if (isScanning) return;` | (w3) | ✓ |
| DM-5 `files` identity guard | (w1)(w3)(w7) | ✓ |
| DM-6 wait resolves on any change | (w5) | ✓ |
| DM-7 D-39(b) guard removed | (v6)(v7)(v8) | ✓ |

**DM-3 არ არის მკაცრად equivalent.** B-ის არგუმენტი ("wait-ის დროს დაწყებული load უკვე ახალი schema-თი კითხულობს") სწორია, როცა ეს load წარმატებით კითხულობს. D-36-ის rejected chunk-ზე ასე აღარ არის: Killer **(k1)** (`c-dm3-probe.test.ts.txt`, მხოლოდ `/tmp/c33/mut`-ში): `/fa` ღიაა, Customize → Open Folder `/fb` (scan pending) → `R33note` → Done → Open Folder `/fc` (scan `[c]`, C-ის პირველი `readMetadataBatch` reject-დება, მეორე წარმატებულია) → `/fb` scan resolves. A-ის კოდი: `metadata = {c: C + "CN"}` (green). DM-3: `metadata = {}` (`expected {} to deeply equal { '/fc/c.wav': … }`). ანუ D-40-ის re-read C-ის ფაილს ავსებს, DM-3 კი re-read-ს აგდებს და C ცარიელი რჩება. ეს test gap-ია (C-R33-01, low), არა D-40-ის ბაგი.

## R33-4 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), repository-ში: verifyCommand **exit 0**, 50 s (`verify.log`). Biome `Checked 34 files`, 0 errors, **8 warnings**, იგივე სია რაც `c-round-31/biome-new.txt` (`biome-new.txt`). typecheck node/web/test 0. Renderer **275/275** (16), main **93/93** (11), E2E **7/7**. `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`e2e-retries0.log`).

## R33-5 real app, old vs new — PASS
ორი build (`/tmp/c33/old` = `git archive ee15e6c`, `/tmp/c33/new` = A-ის tree), `electron-vite build` exit 0 ორივეზე. Playwright `_electron`, `xvfb-run`, `--no-sandbox`, იზოლირებული `XDG_CONFIG_HOME`, `-r harness.cjs` (scan delay `fast/` 2000 ms, batch delay/reject `slow/` 6000 ms, old-schema delay `slow/` read-batch, რომლის schema-ში `R33N` არ არის). მხოლოდ UI; `dialog.showOpenDialog` stub. ყოველ scenario-ს ახალი ფაილები და config.

| Scenario | Old (`ee15e6c`) | New (A) |
|---|---|---|
| **W** | Done-ზე (Open-იდან 265 ms) `meta:read-batch ['slow/s.wav'] DELAYED` იწყება (+369 ms); `fast` 1.8 s-ზე ჩანს Tagged-ით; slow read 6.37 s-ზე ჯდება → `f.wav` **Tagged-ს კარგავს**, ფორმა Category `""`; editor 6.08 s-ზე იხურება | Done-ის შემდეგ `slow/`-ზე `meta:read-batch` **არ არის**; scan 2.13 s → `fast/f.wav` load read, მერე schema re-read `fast/f.wav`; editor **1.81 s**-ზე იხურება (fast load-ის შემდეგ); 8 s-ზე `f.wav` Tagged, ფორმა Category `R32Fast`; toast არ არის |
| **WJ** | (re-run, screenshots scroll-ით) იგივე + ~6.3 s-ზე throw → toast **`Failed to read 1 files`**, `f.wav` Tagged-ის გარეშე | იგივე რაც W; `Failed to read` არ ჩანს 8 s განმავლობაში; editor 1.79 s |
| **R** | Rescan → old-schema read DELAYED; Done (+563 ms) → new-schema read მაშინვე (`R33Val`), editor 3 ms-ში იხურება; 6.1 s-ზე Rescan read (`r33note` None) ჯდება → `s.wav` ფორმა R33note **`""`**, თუმცა ffprobe/mm/raw `R33N=R33Val` | Rescan-ის old-schema read 6.14 s-ზე ჯდება, მხოლოდ მერე new-schema re-read (`R33Val`); editor **5.51 s**-ზე Done-იდან (≈6 s Rescan-იდან); `s.wav` ფორმა R33note **`R33Val`** (screenshot `r33-5-new-R-02-click-s-form.png`) |
| **N** | editor 9 ms | editor 11 ms |

ყველა run: `f.wav`/`s.wav` sha256 setup-ის შემდეგ უცვლელი; ffprobe და music-metadata ველ-ველ: `ICAT=R32Fast` (`f.wav`), `ICAT=R32Slow` (`s.wav`); R-ში `R33N=R33Val` ffprobe-ით, music-metadata-ით (`exif:R33N` ხელმისაწვდომია) და raw LIST/INFO bytes-ით; `f.wav`-ში R33N/R33note არცერთ reader-ში; `pageErrors` ცარიელი. Artists მხოლოდ record (TM-B08).
B-R32-01 გაზომილი: new build-ზე Done pending load-ის დროს editor-ს ღიად ტოვებს load-ის დასრულებამდე (W 1.8 s, R 5.5 s); old-ზე W-ში editor მაინც 6.1 s ღია იყო (ნელი slow read-ის გამო).
**Unit-only** (real app-ში არ გამიშვია): Close ლოდინის დროს ((w4)), superseding Open Folder ((w5)), stats refresh schema read-ის დროს ((w7)), stuck wait (`isScanning` სამუდამოდ true მხოლოდ hanging IPC-ით; QA Q3).

## R33-6 docs — PASS
- ქართული, English technical terms.
- Entry 16: `გასწორდა (D-40, TM-B35)`; ID/severity; reachability; (a)/(b) reproduction; დისკზე არაფერი იცვლება; wait-then-read vs DM-4/(w3) და DM-5/(w7); B-R32-01; D-40. (w1)–(w7)-ის სრული სახელები: თითო 1 match docs-ში და 1 test-ში.
- D-39 (b) წინადადება ახალ კოდს ემთხვევა და "(D-40, ჩანაწერი (16))"-ს შეიცავს; D-40 bullet კოდს ემთხვევა.
- Header: (3), (9), (11)–(16); `წყარო` TM-B35 (round 33); `კოდი`-ში `waitForFolderLoadIdle`. README row ზუსტად `ცნობილი შეზღუდვების სია (16 ჩანაწერი; 8 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`. STATE_MANAGEMENT D-40 ხაზი ერთხელ, D-39 ახალი ფრაზით.
- Line refs (`refs.py`): ყოველი ძველი `MetadataPanel.tsx` ref (bare `:251`/`:255`→`:262`/`:266` ჩათვლით) A-ის tree-ზე იმავე კოდზე მიუთითებს, რაზეც baseline-ზე, გარდა D-40-ით შეცვლილი ხაზისა; ახალი refs (`:64-73`, `:226`, `:227`, `:228`, `:230`, `:246`, `:273`) აღწერილ კოდზეა. სხვა ფაილების refs უცვლელია (diff ცარიელი).
- Entries 1–15: მხოლოდ line shift-ები, ერთი გამონაკლისით, რომელიც A-მ თავად აღნიშნა: entry 15-ის `ფაილი`-ში `:217`→`:227` ref-ის ციტატა შეიცვალა ახალ კოდზე (`const { files, folderLoadId: loadId } = …`, "D-40-ის შემდეგ"). ვიღებ: ძველი ციტატა წაშლილ კოდს ეხებოდა და R33-6-ის "ref აღწერილ კოდზე მიუთითებს" სხვაგვარად დაირღვეოდა.

## Findings (round 34-ისთვის; ამ round-ს არ აგდებს)
- **C-R33-01 — low, test gap.** DM-3 (`folderLoadId` wait-მდე) ყველა არსებულ ტესტს გადის, მაგრამ equivalent არ არის: (k1) ზემოთ. შეთავაზება: (k1) როგორც pin test ახალ ფაილში.
- **C-R33-02 — low (= QA-R33-01; A's qa-engineer: medium — B წყვეტს), pre-existing, D-40-მა გააფართოვა.** ნაბიჯები real app-ში (new build, scan delay 4000): `slow` ღია, `s.wav` მონიშნული → Customize Fields → Open Folder `fast` (scan pending) → ველი `R33note` → Done (editor ღია რჩება) → Back (←) → `s.wav` (ძველი სია ჯერ ჩანს) → Customize Fields → აკრეფა `QTyped` (Open-იდან 1.05 s) → scan სრულდება (4.01 s) → ხელახლა გახსნილი editor **თავისით იხურება**, `QTyped` იკარგება (`r33-5-new-Q-*.png`, `r33-5-new-Q.json`). Old build-ზეც იგივე ხდება, როცა schema re-read ნელია (delay 3000: editor 3.3 s-ზე იხურება, `run-old-QD.txt`); new-ზე ფანჯარა ახლა მთელ folder load-ს მოიცავს. მიზეზი: `SchemaEditor.tsx` `handleSave` `await onSave()`-ის შემდეგ ძველ `onClose`-ს იძახებს. დისკზე არაფერი იცვლება.
- A-R33-02/QA-R33-02 (Done ორჯერ → ორი re-read) real app-ში არ შემიმოწმებია; A-ის unit Q2 ფაქტად ჩავთვალე მხოლოდ როგორც A-ის მონაცემი.
