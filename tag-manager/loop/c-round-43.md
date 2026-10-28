# C — Round 43 შემოწმება: TM-B44 / D-48 (`fs:stat-files`)

**taskStatus: FAIL** (ერთადერთი მიზეზი: gate წითელია unowned ტესტის (w7) გამო, C-R43-01). **realVerified: true.** პროდუქტის ქცევა რეალურ აპში სწორია. სიჩქარის მიზანი დიდი მარჟით სრულდება.

## მოკლედ B-სთვის
- A-ს კოდი Scope A–C-ს ზუსტად მიჰყვება. ყველა რეალური შემოწმება (R43-4/5/6) PASS-ია.
- Gate წითელია: `schema-change-during-folder-load.test.ts` (w7) ჩავარდა, რადგან ის stats refresh-ს `scanFolder` mock-ით კვებავს. B3-მა ეს ფაილი არ მისცა A-ს, და A-მ წესის მიხედვით შეაჩერა მუშაობა. ეს დაგეგმვის ხარვეზია და არა პროდუქტის ბაგი.
- რეკომენდაცია: მომდევნო round-მა (w7)-ის ერთი ხაზის ownership მისცეს: `:315` → `vi.mocked(window.api.statFiles).mockResolvedValue([{ ...FILE_A, size: 2 }])`. ამის შემდეგ C ხელახლა გაუშვებს gate-ს.

## Gates (C-მ თვითონ გაუშვა)
| შემოწმება | შედეგი | Log |
|---|---|---|
| verifyCommand | **rc=1**: fixtures OK, Biome 0 errors / 8 warnings (baseline 8), tsc OK, renderer **319/320** ((w7) `expected 1 to be 2`, :328). chain აქ გაჩერდა | `c-round-43/verify.log` |
| `npm run test:main` | 98/98 (93 + 5) | `c-round-43/test-main.log` |
| `xvfb-run -a npm run test:e2e` | 7/7, flaky არ იყო | `c-round-43/e2e.log` |
| `xvfb-run -a npx playwright test --retries=0` | 7/7 | `c-round-43/e2e-noretry.log` |

## R43-1 ownership + preload — PASS
- HEAD `cf4e147`. შეცვლილია მხოლოდ owned ფაილები (13), untracked ფაილი არ არის. numstat A-ს ცხრილს ემთხვევა.
- `src/preload`: `-` ხაზი არცერთია. `+` ხაზები A3 ბლოკებს ზუსტად ემთხვევა (`11 0`, `1 0`). `channels.ts`, `setup.ts`, `window-api-mocks.ts`, `app-launch.spec.ts` = `1 0`, ზუსტად მითითებული ხაზით.
- batch-save test: ყველა hunk ძველი 403–614 ხაზების შიგნითაა (D-28 describe, 403-დან 616-მდე). `file-system.test.ts`: `-1` მხოლოდ import-ის ხაზია.
- Frozen/protected ფაილები (`package*.json`, `.github`, `app.css`, `main/index.ts`, `metadata.ts`, `schema.ts`, `templates.ts`, `shared`, `stores`, `lib`, `App.tsx`, `sidebar`, `schema`, `playwright.config.ts`, `biome.json`): `git diff --quiet` OK. `src/`-ში კომენტარი არ დამატებულა.

## R43-2 tests + code — not PASS (only because of (w7))
- Handler: `unknown` → type guard (array, ≤50, non-empty string), სხვა შემთხვევაში `Invalid paths`. თანმიმდევრული `stat`, `isFile()` + `.wav` case-insensitive, `path` უცვლელია, `name=basename`. `scanFolderRecursive` უცვლელია.
- `refreshSavedFileStats`: guard `folderPath === null` დარჩა. chunk-ები 50-50-ით მიდის, თითოეულს `await` ელოდება. rejected chunk → `catch {}`, მომდევნო chunk-ები მაინც სრულდება. caller-ები უცვლელია.
- (m1)–(m5), (n)–(z) არსებობს და გაივლის. **მაგრამ `npm run test:renderer` 319/320-ია** (C-R43-01).

## R43-3 red proof — PASS
- Worktree `/tmp/c43-base` (`cf4e147`) + A-ს 4 ტესტ-ფაილი.
- Renderer: 10 failed / 42 passed. ჩავარდა (n), (o), (p), (s), (t), (u), (w), (x), (y), (z). (u) და (w) baseline-ზე ჩავარდა, რადგან ახლა ისინიც ამოწმებენ, რომ `scanFolder` არ გამოიძახება. ეს მოთხოვნას აჭარბებს და არ ეწინააღმდეგება. (q), (r), (v) გაივლის. A-ს tree-ზე 52/52.
- Main: 5 failed / 10 passed, `No handler for channel: fs:stat-files` (structural red).
- Log: `c-round-43/red-renderer.log`, `red-main.log`.

## R43-4 real app, correctness — PASS
- Harness: `c-round-43/r43-probe.mjs correct`. Built app, Playwright `_electron`, `xvfb-run`, temp `XDG_CONFIG_HOME`, schema-ში ჩართულია Category (UCS).
- Fixture: 398 B WAV-ები (ffmpeg), mtime 2020-01-15, ასე რომ Size და Date ცვლილება UI-ში ჩანს.
- **(a)** `a1.wav` Category=`DOORWood` → toast `Tags saved`. Row 398 B / 1/15/2020 → 1.6 KB / 10/28/2026 = `formatFileSize(statSync.size)` + ახალი mtime.
- **(b)** `sub/nested.wav` → იგივე შედეგი.
- **(c)** a2–a4, Keywords `door, slam`, `Save to 3 files` → toast `Tags saved to 3 files`, სამივე row განახლდა.
- შეუნახავი row-ები ყველა ნაბიჯზე უცვლელი დარჩა.
- დამოუკიდებელი reader-ები (raw INFO, music-metadata, ffprobe):
  - (a)/(b): `ICAT=DOORWood` სამივე reader-ში.
  - (c): `IKEY=door, slam` სამივე ფაილზე, სამივე reader-ში.
  - (a)/(b)-ში `IKEY=""` წინასწარ არსებული C-R1-01 ქცევაა და ახალი არ არის.
- `pageErrors=[]`, console errors არ არის.
- Screenshots: `r43-4-before.png`, `r43-4a-after.png`, `r43-4b-after.png`, `r43-4c-after.png`.

## R43-5 IPC + speed — PASS
- **(a)** `statFiles([a1, missing, dir.wav, x.txt, UPPER.WAV, nested, a1])` → a1, UPPER.WAV, nested, a1, input order-ით. size/mtime ISO/name/path `fs.statSync`-ს ემთხვევა.
  - 51 path, `"x"`, `null`, `[""]`, `[5]` → `Invalid paths`. 50 path → 50 entry, `[]` → `[]`.
  - Keys = baseline-ის 16 key + `statFiles`. ორივე build-ზე შემოწმდა.
- **(b)** 5000 WAV (5 × 10 dir × 100 ფაილი, depth 3), ორივე build, ორი მონაცვლე ჯერი:

| | T_scan median | single save click→toast median |
|---|---|---|
| base1 / base2 | 382 / 359 ms | **388 / 376 ms** |
| new1 / new2 | 345 / 367 ms | **19 / 17 ms** |

  - T_base ≈ 382 ms, T_new ≈ 18 ms, სხვაობა ≈ 364 ms ≥ 0.5 × T_scan (≈ 180 ms). T_scan ≥ 150 ms, ამიტომ ხის გაზრდა საჭირო არ იყო.
  - Probe-ის artefact: new-ის პირველ ცდაში ველის მნიშვნელობა უკვე ჩაწერილს ემთხვეოდა, ამიტომ save no-op იყო და დრო ამოიწურა. მეორე ცდაში ყოველ ჯერს უნიკალური მნიშვნელობა მიეცა. ეს აპის ბაგი არ არის.
  - დიდ ხეში fresh ფაილი (1.6 KB, mtime 2020) save-ის შემდეგ გახდა 2.8 KB / 10/28/2026 (`r43-5b-new-saved.png`).
- შედეგები: `r43-results-speed-*.json`.

## R43-6 regression — PASS (drop მხოლოდ კოდით)
- Partial batch (a5 + `chmod 000` ro.wav) → toast `1 saved, 1 failed`. შეიცვალა მხოლოდ a5-ის Size/Date, ro.wav უცვლელია (`r43-6-partial.png`).
- Rescan-მა ჩატვირთვის შემდეგ დამატებული `late.wav` აჩვენა (`r43-6-rescan.png`). Open Folder-ის ხელახლა გახსნამ `later2.wav` აჩვენა.
- Drop ნამდვილი OS drag-drop-ით ვერ გავტესტე. `FolderBrowser.tsx`/`App.tsx` frozen-ია და byte-identical, და ისევ `scanFolder`-ს იძახებს.
- D-07/D-47 ფაილები frozen-ია.
- Batch რეჟიმში "Multiple values" placeholder სტატიკურია (`MetadataPanel.tsx:349,360`) და ეს ქცევა ამ round-მდეც იყო.

## R43-7 docs — PASS
- `STATE_MANAGEMENT.md`-ის ხაზი და `ELECTRON_IPC.md`-ის bullet Scope C-ს ტექსტს ემთხვევა.
- 001-ის diff მხოლოდ entry 23-ის Reference და Deviation (1) ხაზებს ეხება. README უცვლელია (23 ჩანაწერი / 14 გასწორდა).
- ორივე Mp3tag URL ხელახლა წავიკითხე:
  - thread: custom ველები, რომლებიც სიაში არ არის, TXXX-ად იწერება;
  - mapping: ჩამოთვლილია თითო ველის ID3/RIFF INFO mapping, და შესაძლებელია user-defined mapping;
  - same-name შემთხვევას არცერთი წყარო არ ეხება.
  - ახალი ტექსტი წყაროებზე მეტს არაფერს ამტკიცებს.

## R43-8 gate — FAIL
- იხ. C-R43-01. `build:win`/`build:mac` BLOCKED: "Windows packaging is not available in the cloud".

## C-ის კვალი
- Repository source არ შემიცვლია.
- `/tmp/c43-base` worktree შემოწმების შემდეგ ამოვშალე (`git worktree remove`).
