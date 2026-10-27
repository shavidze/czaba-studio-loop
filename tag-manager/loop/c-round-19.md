# C — Round 19: TM-B22 / D-28 — Size და Date სვეტები save-ის შემდეგ ახლდება

**taskStatus: PASS** · realVerified: **true** · bugs: 0
BLOCKED (round-ის ნაწილი არ არის): Windows packaging is not available in the cloud.

ყველა შემოწმება თავად გავუშვი (2026-10-27, ~11:05–11:20 UTC). A-ს რიცხვებს არ ვენდე. Source-ში არაფერი შემიცვლია: md5 დასაწყისში და ბოლოს ემთხვევა (`c-round-19/md5-start.txt`). Worktree `/tmp/c-r19-old` და mutant ასლი `/tmp/c-r19-mut` წაშლილია. `git stash` არ გამომიყენებია.

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R19-1 ownership + process | PASS | `diff.patch`, `a-transcript-bash.txt` |
| R19-2 red/green | PASS | `red-old.log`, `green-new.log` |
| R19-3 mutations | PASS (M1–M8 + M3b ყველა killed) | `mutants-summary.txt`, `M*.diff`, `M*.log`, `mutate.py` |
| R19-4 gate | PASS | `verify.log`, `e2e-retries0.log`, `biome-old.txt`/`biome-new.txt` |
| R19-5 real app | PASS | `drive-r19-5.mjs`, `r19-5-result.json`, `r19-5-*.png` |

## R19-1
- HEAD `d015470`. `git status --porcelain --untracked-files=all`: ზუსტად 5 owned path, ყველა `M`, untracked ფაილი არ არის. `git diff --stat`: 5 files, +310/−1.
- `git diff --quiet d015470 -- . ':!…5 owned…'` → exit 0. main, preload, types, FileList, App, FolderBrowser უცვლელია.
- `git diff d015470 -- tests/ .claude/ | grep '^-[^-]'` ცარიელია. src-ში ერთადერთი `-` ხაზი არის `failedPaths`-ის ხაზი, რომელიც უცვლელად ზემოთ გადავიდა.
- test diff-ში: `beforeEach`-ში ზუსტად ერთი ხაზი (`scanFolder` mockClear/mockResolvedValue([])) და ორი ახალი describe. ზედმეტად დამატებულია (s6) და (o)-ს order assertion. ორივე ახალ describe-შია (additions only).
- src diff-ში არ არის კომენტარი, `any`, `@ts-ignore` ან ახალი `as`. `as Partial<WavMetadata>` ძველი ხაზია. ახალი export არ არის: `refreshSavedFileStats` module-level ფუნქციაა, export-ის გარეშე. დამატებულია მხოლოდ store-ის `updateFileStats` member.
- `STATE_MANAGEMENT.md`: მხოლოდ ერთი ხაზი დაემატა, task-ის ტექსტი სიტყვასიტყვით.
- `a-round-19-result.json`: `permission_denials: []`.
- **A-ს transcript ხელმისაწვდომი იყო** (`613dc199…jsonl`, ამონაწერი `a-transcript-bash.txt`):
  - repo-ში ყველა write Edit tool-ით გაკეთდა, 5 owned ფაილზე.
  - Bash-ის ბრძანებებში repo-ზე `sed -i`, `tee`, `cat >`, `cp`, `mv` ან heredoc არ ჩანს. `git stash`, `checkout` და `worktree` არ გამოუყენებია.

## R19-2 (worktree d015470 + node_modules symlink + A-ს ორი test ფაილი)
- **ძველი კოდი: 11 failed | 46 passed (57)**, exit 1.
  - Primary red — (n), (o), (p), (s), (t): `AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times`. scan არ ხდება, ანუ Size/Date stale რჩება — ეს თავად ბაგია.
  - (s1)–(s6): `TypeError: …updateFileStats is not a function`. ეს missing API-ა.
  - Pins (q), (r), (u), (v), (w) და ძველი (a)–(m) გაიარა.
- **A-ს tree: 57/57** გაიარა.

## R19-3 (throwaway ასლი, ორივე test ფაილი თითო mutant-ზე)
| Mutant | ჩავარდა |
|---|---|
| M1 refresh არ არის | (n), (o), (p), (s), (t) |
| M2 batch-ში ყველა path, failed-ის ჩათვლით | (p), (t) |
| M3 (single) refresh წარმატებული re-read-ის შემდეგ | (n) order, (s) |
| M3b (batch) refresh `readMetadataBatch`-ის try/catch-ის შემდეგ | (o) `expected 46 to be greater than 47` (order), (t) `called 1 times, but got 0 times` |
| M4 `files = entries` | (n), (p), (s), (t), (w), (s1), (s2), (s3), (s5), (s6) |
| M5 scan reject არ იჭერება | (u) |
| M6 მხოლოდ size | (n), (o), (p), (s), (t), (s1), (s3) |
| M7 refresh `succeeded === 0`-ზეც | (q) |
| M8 (დამატებით) no-match guard ამოღებულია | (s6) |

M3-ის პირველ ვერსიაში batch refresh ისევ re-read-მდე იძახებოდა, ამიტომ batch ცალკე, სწორად გავუშვი როგორც M3b (`M3b.diff`, `M3b.log`). შედეგი: survivor არ არის.

## R19-4 (clean: `rm -rf out test-results playwright-report tests/fixtures/*.wav`)
- სრული `verifyCommand` → **exit 0**.
  - Fixtures created.
  - Biome: 0 errors, **9 warnings**. file/rule სია ზუსტად იგივეა, რაც d015470-ზე (`diff` ცარიელია): FileList ×2, TagsInput, AudioPlayer, FolderBrowser, TemplatePicker, input, select, toast.
  - typecheck (node/web/test) 0.
  - Renderer **162/162** (10 files) = 146 + 16.
  - Main **93/93** (11 files).
  - E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7 passed**, exit 0.

## R19-5 real app
გარემო: built `out/main/index.js`, Playwright `_electron`, `xvfb-run -a`, `--no-sandbox`, სუფთა `XDG_CONFIG_HOME`. მხოლოდ folder dialog-ია stub-ით, დანარჩენი UI click/fill-ით მიმდინარეობს. `a/b/c.wav` არის `sample.wav`-ის ასლები, `touch -d '2020-01-02 12:00:00'`-ით.

- **Scan:** სამივე ფაილი `86.2 KB`, `1/2/2020`.
- **(1) single save** — `a.wav`, Category `R19Single` + 300-სიმბოლოიანი Comment → toast `Tags saved`.
  - `a`: Size `86.2 KB → 88.3 KB`, რაც `formatFileSize(stat.size=90422)`-ს უდრის. Date `1/2/2020 → 10/27/2026`, რაც page-ში გამოთვლილ `toLocaleDateString(stat.mtime)`-ს უდრის.
  - `b` და `c` უცვლელია.
  - selection მხოლოდ `a`-ზეა, Category input = `R19Single`, Comment 300 სიმბოლო. `Unsaved changes` toast არ გამოჩენილა (toast-ებს 3.5 წმ ვაკვირდებოდი).
- **(2) batch** — click `b`, Ctrl-click `c`, Genres `R19 Batch` → toast `Tags saved to 2 files`.
  - `b` და `c` = `87.4 KB` / `10/27/2026`, ორივე stat-ს ემთხვევა.
  - `a` ინარჩუნებს `88.3 KB`-ს. selection = 2 (`2 selected`).
- **(3) partial** — **`chmod 444 c.wav` საკმარისი იყო**, `000` არ დამჭირდა. select `b` + Ctrl `c`, Category `R19Partial` → toast `1 saved, 1 failed`.
  - `b`-ს Date და Size stat-ს ემთხვევა. mtime შეიცვალა (`11:16:26 → 11:16:31`). size ბაიტებში იგივე დარჩა (89520), რადგან ICAT padding-ში ჩაეტია, ამიტომ ხილული ტექსტი არ შეცვლილა. step 3-ის refresh-ს ამტკიცებს `fs.stat`-ის mtime-ის ცვლილება და cell-ის stat-თან თანხვედრა, ხილული ცვლილება არა. ხილულ refresh-ს step (1) და (2) ამტკიცებს.
  - `c`-ს cells step (2)-ისაა. მისი stat (size + mtimeMs) უცვლელია.
- **(4) Size header:** რიგია `b, c, a` (89520, 89520, 90422), ზრდადობით, tie დასაშვებია.
- **(5) დამოუკიდებელი reader-ები (ffprobe `format_tags` + music-metadata `exif`)** — hard check-ები ყველა ემთხვევა:
  - `a`: ICAT=`R19Single`.
  - `b`: ICAT=`R19Partial`, IGNR=`R19 Batch`.
  - `c`: IGNR=`R19 Batch`, ICAT არ აქვს (უცვლელია).
  - Comment ჩაიწერა (ICMT და ID3 COMM).
  - `a`-ზე `IKEY=""` ჩანს. ეს ცნობილი C-R1-01-ია და ამ round-ს არ ეხება.
- **(6) relaunch + rescan:** სამივე ფაილის Size და Date cell relaunch-მდე ნაჩვენების ტოლია.
- **pageErrors:** ცარიელია ყველა phase-ში. ნანახი toast-ები: `Tags saved`, `Tags saved to 2 files`, `1 saved, 1 failed`, `Tags saved` (step 7). `Unsaved changes` არც ერთხელ.
- **(7) timing (B-R18-01, მხოლოდ observation):** 200 ფაილიან folder-ზე ერთი single save, click-დან toast-მდე **169 ms**. d015470 build-თან შედარება არ გამიკეთებია (არასავალდებულო იყო).

## დაკვირვებები B-სთვის (ამ round-ის ბაგები არ არის)
- qa-engineer-ის P1 (A-ს ანგარიში): selection-ის შეცვლა save-ის await-ის დროს. ეს pre-existing პრობლემაა, მაგრამ refresh-ის ნაბიჯმა ფანჯარა გაზარდა (write + scan + read). real app-ში თავად არ გამიმეორებია. გთხოვთ backlog-ში შეიტანოთ.
- batch-ზე `scanFolder` reject-ის ცალკე ტესტი არ არის (A F2). helper საერთოა და M5-ს (u) კლავს, ასე რომ gap low-ა.
- step 3-ის screenshot-ზე, 2 file-ის batch-ში, Genres ველი `Add genres...`-ს აჩვენებს, თუმცა ორივე ფაილს `R19 Batch` აქვს. ეს ამ round-ის scope-ს გარეთაა (tags field-ის multi-select ჩვენება). ეს frozen კოდია (`TagsInput`/`MetadataPanel`-ის multi-value ჩვენება), ამიტომ pre-existing-ია. DOM-ში chip-ის არსებობა არ შემიმოწმებია. ეს მხოლოდ screenshot-ზე დაკვირვებაა, შესამოწმებლად.
- Shift-click range save-ის შემდეგ real app-ში ცალკე არ შემიმოწმებია. `lastClickRef`-ის ქცევა უცვლელია (FileList frozen-ია).
