# C — Round 37 ვერიფიკაცია: TM-B39 (D-44)

**Verdict: PASS** (R37-1…R37-6 ყველა), realVerified = **true**. ორი low finding (C-R37-01 mutant survivor, C-R37-02 docs header); round-ს არ აფერხებს.
Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).

Baseline: HEAD `51969a2`. src fingerprint (`git status` + `git diff 51969a2 | sha256sum`) C-ის phase-ის დასაწყისში და ბოლოს იგივეა (`src-status-start.txt`, `src-fingerprint-start.txt`). C-მ source არ შეცვალა.
ყველა evidence არის `c-round-37/`-ში.

## R37-1 ownership — PASS
- `git status --porcelain --untracked-files=all`: 3 `M` (`file-store.ts`, `docs/bugs/001…`, `docs/bugs/README.md`) + 1 `??` (ახალი test file).
- `git diff --quiet 51969a2 -- . ':!<4 owned>'` → 0.
- `file-store.ts`-ის diff-ის `+/-` ხაზები byte-ზე ემთხვევა `prototype.diff.txt`-ს (`PROTO_EQ`). `head -n 240` ძველისგან განსხვავდება მხოლოდ line 55-ით.
- export-ების რაოდენობა 6 → 6. comment, `any`, `{ timeout }` / `testTimeout` არსად არის.
- test file `cmp`-ით identical-ია B-ის `.txt`-თან, ამიტომ (x1)–(x7)-ის სახელები და assertion-ები ზუსტად ემთხვევა.

## R37-2 red → green — PASS
- **Red:** throwaway copy, `51969a2` `file-store.ts` + ახალი ფაილი → **7/7 fail**, ყველა symptom-ზე (`mut-red.log`):
  - (x1)(x3)(x4)(x5)(x6): `expected [ '/fa/a.wav' ] to deeply equal []`;
  - (x2): `[a, a2]` vs `[a2]`;
  - (x7): `[a2, a]` vs `[a2]`.
  - სხვა failure არ ყოფილა.
- **Green:** renderer **296/296**, 19 files, ორჯერ: gate (`gate.log`) და `renderer-run2.log`.
- **ახალი ფაილი ცალკე:** 7/7, max 195 ms. 19-ვე ფაილი ცალკე green-ია (`each-alone.log`, ჯამი 296).

## R37-3 mutants — PASS (`mut-*.log`, `mutants.diff`)
| Mutant | Killed | Required |
|---|---|---|
| PM-1 prune-ის გარეშე | x1–x7 (7/7) | x1–x7 ✔ |
| PM-2 `[]`, როცა selection non-empty | x2, x6, x7 | x2 x6 x7 ✔ |
| PM-3 identity early return-ის გარეშე | x6 | x6 ✔ |
| PM-4 prune მხოლოდ `handleOpenFolder`-ში (store reverted) | x2, x3, x4, x6, x7 | ≥ x2 x3 ✔ |
| PM-5 (C) clear მხოლოდ prune-ის დროს (B-ის PM-2) | x2, x7 | — |
| PM-6 (C) prune `files`-ის რიგით | **survives** | → C-R37-01 (low) |

PM-6 ეკვივალენტურია დღევანდელ ქცევაზე:
- რიგს მხოლოდ `MetadataPanel.tsx:130` იყენებს (`selectedPaths[0]`, როცა length 1-ია);
- D-29-ის შედარება set-ზეა დაფუძნებული.

## R37-4 real app, old `51969a2` vs new — PASS
Setup:
- ორივე build `/tmp` copy-ში აიწყო (`build-old.log`, `build-new.log`); `withListedSelection` მხოლოდ new bundle-შია.
- Playwright `_electron`, `xvfb-run -a`, `--no-sandbox`, თითო scenario-ს თავისი `XDG_CONFIG_HOME`.
- harness: task `c-round-33/harness.cjs`-ს ასახელებს, მაგრამ ის მხოლოდ `/fast`-ით დამთავრებულ path-ს აყოვნებს. ამიტომ C-მ დაწერა `c-round-37/harness.cjs`, რომელიც **ნებისმიერ** `fs:scan-folder`-ს 4000 ms-ით აყოვნებს, სანამ ARM ფაილი არსებობს.
  - ARM ფაილი იქმნება მხოლოდ `/fa`-ის პირველი load-ის შემდეგ, ამიტომ დაყოვნება ეხება მხოლოდ target scan-ს (`/fb` ან Rescan `/fa`).
  - ყველა `r37-4-*.json`-ის IPC log-ში პირველ scan-ს აქვს `delayed: false`, მეორეს `delayed: true`, reply-მდე ~4005 ms.
  - ეს task-ის ≥ 3000 ms მოთხოვნის ეკვივალენტია.
- `dialog.showOpenDialog` stub-ია. app იმართება მხოლოდ UI-ით. ფაილები `tests/fixtures/sample.wav`-ის ასლებია.

| Scen | old | new |
|---|---|---|
| S1 | `1 selected · 1 files`, highlighted row არ არის, "Select a file to edit metadata" (red) | `1 files`, `selected` არ ჩანს, highlighted row არ არის, იგივე panel ✔ |
| S2 | `2 selected · 1 files`, ერთი highlighted (`a2.wav`) | `1 selected · 1 files`, `a2.wav` highlighted, form `a2.wav`-ისაა, `Save Tags` ✔ |
| S2p (a2 წინასწარ tag-ით: Title `PreA2Title`) | batch mode, form ცარიელია | form Title = `PreA2Title` (a2-ის მნიშვნელობა) ✔ |
| S3 | toast არ ჩანს, `1 selected · 1 files` | toast `Unsaved changes were discarded`, ცარიელი panel, `1 files` ✔ |
| S4 (C: Shift-click გადარჩენილი anchor-ით, a/a2/a3/a4, a წაშლილია) | `2 selected · 3 files` → Shift a4 → `3 selected` | `1 selected · 3 files` → Shift a4 → **range** a2, a3, a4, `3 selected · 3 files` ✔ |

**S2-save (new):**
- Category `R37Kept` აიკრიფა; 1 s-ის შემდეგ form ისევ `R37Kept`-ს აჩვენებს. Save Tags → `Tags saved`. ერთადერთი `meta:write` წავიდა `a2.wav`-ზე.
- ffprobe: `ICAT=R37Kept`; music-metadata: `exif:ICAT=R37Kept`.
- S2p-ში ასევე: ffprobe `title=PreA2Title`, mm `exif:INAM=PreA2Title`. ორივე field-ით ემთხვევა form-ს (Title `PreA2Title`, Category `R37Kept`).
- field-by-field შედარების ფარგლები: შევადარე form-ის ორი field, Title და Category. შენახულ ფაილში არის `IKEY=""` (ffprobe და mm). ეს Keywords-ის ცარიელი მნიშვნელობაა, რომელსაც writer წერს. დამოუკიდებლად შევამოწმე მხოლოდ Title და Category.
- `fb/b.wav`-ის sha256 უცვლელია.

**sha256 და errors:**
- S1/S3 (old და new): ყველა ფაილის sha256 უცვლელია და write არ მომხდარა.
- S2/S4: შეიცვალა მხოლოდ წაშლილი `a.wav` და შენახული `a2.wav`.
- `pageErrors` და `consoleErrors` ყველა **10** run-ში ცარიელია: S1, S2, S3, S4 × {new, old} + S2p × {new, old}.

Screenshots: `r37-4-<build>-<scen>-NN.png` (before, during-scan, after-load, after-shift, typed, after-save). JSON: `r37-4-*.json`.

## R37-5 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand` → **exit 0** (`gate.log`):
- Biome: 0 errors / 8 warnings, file/rule სია = `c-round-35/biome-new.txt` (`biome-warn.txt`, `SAME_LIST`);
- typecheck node/web/test OK;
- renderer 296/296 (19), main 93/93 (11), E2E 7/7.

`xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`e2e-retries0.log`).

## R37-6 docs — PASS
- `git diff --word-diff 51969a2 -- docs/`: დამატებულია მხოლოდ entry 20 და README row 001. entries 1–19 byte-identical-ია.
- entry 20 ქართულადაა, English ტერმინებით, და აქვს §3-ის ყველა ველი.
- ყველა `file:line` შემოწმდა `sed -n`-ით: `file-store.ts:55`, `:242-250`, `:93`; `FolderBrowser.tsx:103/:108/:161/:166`; `App.tsx:48/:61`; `FileList.tsx:68`; `MetadataPanel.tsx:120-121`, `:124-127`, `:143`.
- 7 ტესტის სახელიდან თითო 1 match-ია docs-ში და 1 test file-ში.
- recount: 20 `##` ჩანაწერი; 11 `გასწორდა`; 5 Saba-ს კითხვა + 4 ცნობილი შეზღუდვა = 9. README `20 / 11 / 5` სწორია.
- Reference, URL-ებით შემოწმებული:
  - R1 Qt: `reset()` "Clears the selection model. Does not emit any signals.", signal-ები "will not be emitted when the item model is reset" ✔;
  - R2 Kid3 man: "If one or more file paths are given, their common folder is opened and the files are selected." ✔;
  - R3 Mp3tag: "automatic selection of files that are added…", default მითითებული არ არის ✔.
- Deviations 1–4 app-ში ასე მუშაობს:
  - (1) S2 new;
  - (2) ძველი სია scan-ის დროს click-ადია, ორივე build-ში;
  - (3) new S1-ის შემდეგ ავტომატური selection არ ჩნდება;
  - (4) S3 new-ში ჩანს toast.
- A-ის დამატებული წინადადება Deviation (1)-ში (anchor) S4-ით და (x7)-ით დადასტურდა; entry 20-ის ფარგლებშია.

## Findings
- **C-R37-01 (low):** PM-6 (prune-ის რიგი) survives. ეკვივალენტურია (იხ. R37-3); სურვილისამებრ რიგი test-ით დაფიქსირდეს.
- **C-R37-02 (low, docs, = A-R37-01):** `001`-ის header (`:3-22`) entry 20 / D-44-ს არ ასახელებს. task-მა ეს ნაწილი გაყინა, ამიტომ A-ს შეცდომა არ არის; B-ის follow-up-ია.

## "What could break" შემოწმებები
- S2 new-ში form-მა აკრეფილი ტექსტი შეინარჩუნა, როცა load არ მიმდინარეობდა.
- გადარჩენილი anchor-ით Shift-click range-ს იძლევა (S4).
- Close Folder, batch save, D-29 / D-39 და E2E folder workflow: ამას ფარავს მწვანე სრული suite (296 + 93 + E2E 7). ცალკე real-app შემოწმება ამ ნაწილზე არ გამიშვია.
