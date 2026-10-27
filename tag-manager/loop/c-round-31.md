# C — Round 31 verification: TM-B33 / D-38 (overlapping folder loads latest-wins)

**შედეგი: PASS** (R31-1…R31-6). realVerified = **true**. ახალი ბაგი: 0.
Windows packaging: BLOCKED — Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).
ყველა evidence: `c-round-31/`. C-ს source-ში არაფერი შეუცვლია; ყველა experiment `/tmp/c-r31-{old,new,red,mut}` copy-ებში გაეშვა.

## R31-1 ownership + process — PASS
- HEAD `bf83c7d`. `git status --porcelain --untracked-files=all`: 7 `M` (მხოლოდ owned path-ები) + 1 `??` `tests/renderer/components/folder-read-overlap.test.ts`.
- `git diff --quiet bf83c7d -- . ':!<8 owned paths>'` → exit 0.
- src diff (`c-round-31/src-diff.txt`) ზუსტად D-38-ია:
  - store: `folderLoadId` field + initial `0`, `beginFolderLoad: () => number` (set + `get()`), `(set, get)`, `export function isFolderLoadCurrent`.
  - `handleOpenFolder` / `handleRescan` / App `openFolder`: თითო `beginFolderLoad()`, 3 `return` guard (post-scan, post-read, catch-ის პირველი ხაზი) და guarded `finally`.
  - `handleCloseFolder`: 2 ხაზი + `setIsScanning` dependency. 2 import ხაზი.
  - `beginFolderLoad` `if (!path) return;`-ის შემდეგაა (FolderBrowser.tsx:97→99).
- comment, `any`, `@ts-ignore` და ახალი `as` src-ში არ არის. src-ში single quotes, semicolons.
- `file-store.test.ts`: მხოლოდ დამატებები (0 წაშლილი ხაზი).
- C-ს ფაზის ბოლოს ხელახლა: `git status` იგივე 7 `M` + 1 `??`, `git diff bf83c7d` იგივეა, რაც `c-round-31/src-diff.txt` (SRC_DIFF_SAME), `folder-read-overlap.test.ts` byte-identical C-ს copy-სთან — tree C-ს ფაზაში არ შეცვლილა.
- `STATE_MANAGEMENT.md`: ზუსტად 1 დამატებული ხაზი, task-ის ტექსტი სიტყვასიტყვით.
- A-ს transcript-ის (`7b249612…jsonl`) Bash ბრძანებები გადავამოწმე. repository ფაილში Bash-ით არაფერი ჩაწერილა; `rm -rf` მხოლოდ gitignored output-ზე იყო, `tee`/`sed -i` კი მხოლოდ loop folder-ში. Edit/Write მხოლოდ 8 owned path-სა და A-ს loop ფაილებზე გაკეთდა.

## R31-2 red → green — PASS
- `/tmp/c-r31-red` = `git archive bf83c7d` + A-ს ორი test ფაილი. შედეგი: **Test Files 2 failed | 12 passed (14); Tests 16 failed | 241 passed (257)**. (o8) მწვანეა (`c-round-31/r31-2-red.clean.log`).
- პირველი ჩავარდნილი assertion. ყველა symptom-ია, არა setup:

| ტესტი | ხაზი | პირველი ჩავარდნა |
|---|---|---|
| (o1) | 123 | `metadata` `{'/fa/a.wav': A}`, expected `{'/fb/b.wav': B}` |
| (o2) | 137 | `files` `[a.wav]`, expected `[b.wav]` |
| (o3) | 151 | `isScanning` false, expected true |
| (o4) | 169 | toast `'Failed to read 1 files'`, expected null |
| (o5) | 187 | `metadata` `{'/fa/a.wav': A}`, expected `{}` |
| (o6) | 207 | `metadata` A, expected B |
| (o7) | 224 | `metadata` A, expected B |
| (o9) | 253 | `files` `[]`, expected `[b.wav]` |
| (o10) | 268 | `isScanning` false, expected true |
| (o11) | 288 | `files` `[a.wav]`, expected `[b.wav]` |
| (o12) | 302 | `files` `[]`, expected `[b.wav]` |
| (o13) | 318 | `files` `[a.wav]`, expected `[b.wav]` |
| (o14) | 332 | toast `'Rescan late'`, expected null |
| (o15) | 347 | `isScanning` false, expected true |
| (o16) | 360 | `TypeError: isFolderLoadCurrent is not a function` (missing export) |
| (f1) | 395 | `TypeError: …beginFolderLoad is not a function` (missing export) |

- A-ს tree (`/tmp/c-r31-new`): **257/257, 14 files** (`r31-2-green.log`).
- თითოეული ახალი ტესტი `-t`-ით ცალკე: 17 × `1 passed` (`r31-2-alone.log`).

## R31-3 mutations — PASS (19/19 killed, survivor არ არის)
- script: `/tmp/c-r31-scripts/mut.py`. თითო mutant-ის ზუსტი diff ჩაწერილია `c-round-31/mutants.log`-ში.
- ოთხი test ფაილი, baseline 73/73.

| Mutant | Killers |
|---|---|
| GM-1 open post-scan guard removed | (o2) |
| GM-2 open post-read guard removed | (o1)(o3)(o4)(o5)(o6) |
| GM-3 open catch guard removed | (o9) |
| GM-4 open finally unconditional | (o3) |
| GM-5 close without beginFolderLoad | (o5) |
| GM-6 close without setIsScanning(false) | (o5) |
| GM-7 rescan uses `getState().folderLoadId` | (o16) |
| GM-8 rescan post-scan | (o13) |
| GM-9 rescan post-read | (o7) |
| GM-10 rescan catch | (o14) |
| GM-11 rescan finally | (o15) |
| GM-12 app uses `folderLoadId` | (o6) |
| GM-13 app post-scan | (o11) |
| GM-14 app post-read | (o10) |
| GM-15 app catch | (o12) |
| GM-16 app finally | (o10) |
| GM-17 beginFolderLoad before the dialog | (o8) |
| GM-18 pre-increment id | 34 tests, (f1)-ის ჩათვლით |
| GM-19 `>=` | 16 tests, (f1)-ის ჩათვლით |
| extra GM-7b: open uses `folderLoadId` | 12 tests |

ყველა killer task-ის მოლოდინს ემთხვევა.

## R31-4 gate — PASS
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გაეშვა სრული `verifyCommand`. შედეგი: **EXIT=0** (`c-round-31/verify.log`).
  - Fixtures created.
  - Biome: 34 files, 0 errors, **8 warnings**, იგივე სია, რაც `c-round-30/biome-new.txt`-შია (`c-round-31/biome-new.txt`, normalised); raw diff-ი მხოლოდ ხაზის ნომრებით და trailing `━`/`FIXABLE` დეკორაციით განსხვავდებოდა, rule+file სია იდენტურია.
  - typecheck node / web / `tsconfig.test.json`: 0 error.
  - renderer **257/257**, main **93/93** (11 files), build OK, E2E **7 passed**.
- `xvfb-run -a npx playwright test --retries=0` → **7 passed**, EXIT=0 (`e2e-retries0.log`).

## R31-5 real app, old vs new — PASS
- builds:
  - old = `git archive bf83c7d` → `/tmp/c-r31-old`;
  - new = A-ს working tree-ს copy → `/tmp/c-r31-new`;
  - ორივე `electron-vite build`-ით (`build-old.log`, `build-new.log`). `beginFolderLoad` მხოლოდ new bundle-შია.
- გაშვება: Playwright `_electron`, `xvfb-run`, `--no-sandbox`, იზოლირებული `XDG_CONFIG_HOME`, `-r c-round-31/harness.cjs` (`c-round-29/harness.cjs`-ის ადაპტაცია). harness ყველა IPC call-ს log-ავს:
  - delay marker: `meta:read-batch` `slow/`-ისთვის 5000 ms;
  - reject marker: ლოდინის შემდეგ throw;
  - scan marker: `fs:scan-folder` `slow`-ისთვის 5000 ms.
- driver: `c-round-31/drive.mjs`. მხოლოდ UI-ს ამოძრავებს; `dialog.showOpenDialog` stub-ია.
- setup: ყოველი სცენარი ახალ copy-ებზე იწყება, harness disarmed-ია. ნაბიჯები: `fast` → `f.wav` → Category `R31Fast` → Save → `Tags saved`; შემდეგ `slow` → `s.wav` → `R31Slow` → Save → `Tags saved`.
- harness log ადასტურებს, რომ timing no-op არ იყო: სწრაფი folder-ის click ნელი load-იდან ~0.1 s-ში მოხდა, ნელი read/scan კი ~5 s-ის შემდეგ, 7 s-იანი ფანჯრის შიგნით დასრულდა (`r31-5-*.json` → `ipc`).

| სცენარი | old build (red, მოსალოდნელი symptom) | new build |
|---|---|---|
| L | 7 s-ის შემდეგ `f.wav` `Tagged`-ს კარგავს, ფორმაში Category ცარიელია | `f.wav` `Tagged`, ფორმაში Category `R31Fast`, toast არ არის |
| J | ჩნდება `Failed to read 1 files`, `f.wav` `Tagged`-ს კარგავს, Category ცარიელია | `Tagged`, `R31Fast`, `Failed` toast არ არის |
| S | folder label `fast`, სიაში მხოლოდ `s.wav` (`Tagged`); sidebar tree-ც `slow`-ს აჩვენებს | სიაში მხოლოდ `f.wav`, `Tagged` |
| C | Close-დან 500 ms-ში spinner კვლავ ჩანს და prompt არ ჩანს; spinner read-ის დასრულებამდე (~5 s) რჩება, მერე prompt ჩნდება, სია ცარიელია | prompt "Open a folder to start tagging WAV files" 53 ms-ში, spinner არ ჩანს; 7 s-ის შემდეგ სია ცარიელია |

- ყველა 8 run-ში:
  - setup-ის შემდეგ `s.wav`/`f.wav`-ის sha256 უცვლელია;
  - `music-metadata` (`exif:ICAT`) და `ffprobe` (`ICAT`) setup-ის შემდეგაც და ბოლოსაც აჩვენებს `R31Slow` / `R31Fast`;
  - `pageErrors` ცარიელია.
- screenshots: `r31-5-{old,new}-{L,J,S,C}-NN-*.png`.
- შენიშვნა: form screenshot-ში Category ველი fold-ის ქვემოთაა. მნიშვნელობა DOM-იდან (`inputValue`) არის აღებული და JSON-შია ჩაწერილი.
- drop real app-ში არ გაშვებულა: Playwright drop-ზე native path-ს ვერ აყენებს. მას ფარავს (o6) და (o10)–(o12). Rescan→Open მხოლოდ unit-ით შემოწმდა: (o7), (o13)–(o15). Artists მხოლოდ ჩანაწერია (TM-B08).

## R31-6 docs — PASS
- `001-save-and-selection-known-limits.md` დაწერილია ქართულად, English technical terms-ით.
  - Header: fixed სია "(3), (9), (11), (12), (13) და (14)"; `წყარო`-ში არის `TM-B33 (round 31)`; `კოდი`-ში არის `handleCloseFolder` და `beginFolderLoad`/`isFolderLoadCurrent`.
  - Entry 14: მონიშნულია `გასწორდა (D-38, TM-B33)`. მასში აღწერილია reachability (Rescan→Rescan მიუღწეველია) და წერია, რომ დისკზე არაფერი იცვლება.
  - (o1)–(o16) და (f1) სრული სახელით: docs-ში და tests-ში თითო 1 match.
  - Entry 12 (k7)-ს ასახელებს (1 match).
- D-38 bullet კოდს ემთხვევა.
- ყოველი `file-store.ts` / `FolderBrowser.tsx` / `App.tsx` `file:line` grep-ით და კოდის დაბეჭდვით შევამოწმე A-ს tree-ზე. ყველა სწორ კოდზე მიუთითებს:
  - `file-store.ts`: 16, 36, 38, 52, 87-101, 126-134, 136-153, 140, 145-146, 148-151, 155-158, 161-163;
  - `FolderBrowser.tsx`: 99, 107, 113-129, 123, 126, 127-129, 130-132, 133-139, 134, 141, 146-147, 158, 165, 171-187, 181, 184, 185-187, 188-190, 191-195, 192, 197;
  - `App.tsx`: 44, 59, 65-81, 75, 78, 79-81, 82-84, 85-91, 86, 93.
- `--word-diff`-მა აჩვენა, რომ ძველ ტექსტში მხოლოდ ხაზის ნომრები შეიცვალა. ახალია D-38 bullet, entry 14, header-ის დამატებები და (k7). entries 1–10-ში სხვა ცვლილება არ არის. frozen ფაილებზე (`MetadataPanel.tsx`, `utils.ts`, `metadata.ts`, `FileList.tsx`) მიმავალი ref-ები უცვლელია.
- README row ზუსტად ასე იკითხება: `ცნობილი შეზღუდვების სია (14 ჩანაწერი; 6 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- STATE_MANAGEMENT-ის D-38 ხაზი ერთხელ გვხვდება.
- `feature-status.md`-ში D-38 იგივე shape-ისაა.

## Signals B-სთვის (ბაგი არ არის, C-ს მიერ დაუდასტურებელი)
- A-R31-01 (A-ს QA hypothesis): `handleSchemaChanged`-ის გვიანი re-read folder switch-ის შემდეგ. ეს RR-R28-03-ის ოჯახია, ტესტი არ არსებობს, C-ს არ შეუმოწმებია.
- CR-6: Close Folder pending **scan**-ის ან pending drop-ის დროს unit test-ით დაფარული არ არის. Close-ის ორივე mutant-ს (o5) კლავს, ამიტომ ეს test-gap მხოლოდ signal-ია.
