# C — Round 30 ვერიფიკაცია: TM-B32 (D-37) + C-R29-01 (u3)

**ვერდიქტი: PASS** (R30-1…R30-6), realVerified=true. ახალი ბაგი: 0.
Evidence: `c-round-30/` (logs, screenshots, `r30-5-*.json`, scripts `mut.py`, `drive.mjs`).
Source C-ის ფაზაში არ შეცვლილა (`git status`/`git diff` hash იგივეა დასაწყისში და ბოლოს).

## R30-1 ownership + process — PASS
- HEAD `20967a0` (release commit არ არის). `git status --porcelain --untracked-files=all`: მხოლოდ 7 owned path, untracked არ არის.
- `git diff --quiet 20967a0 -- . ':!<7 owned>'` → exit 0 (frozen/protected ხელშეუხებელია).
- src diff: ზუსტად ორი `} else {\n setMetadata({});` ბლოკი (`FolderBrowser.tsx:127-129`, `App.tsx:79-81`), dependency array უცვლელი, comment/`any`/`@ts-ignore`/`as` არ დამატებულა.
- ორივე test ფაილი: `git diff` არცერთ `-` ხაზს არ შეიცავს (მხოლოდ დამატება). `dropFolder` და (k1)–(k7) უცვლელია.
- `STATE_MANAGEMENT.md`: მხოლოდ D-35 ხაზის ბოლო clause შეიცვალა, ზუსტად task-ის ტექსტით; ახალი ხაზი არ არის.
- Bash write repository-ში: **unknown** (A-ის transcript არ მაქვს; A ამბობს, რომ არა).

## R30-2 red → green — PASS
- Throwaway `/tmp/c-r30-red` = A-ის tree + `20967a0`-ის `FolderBrowser.tsx`/`App.tsx` → **3 failed / 237 passed (240)** (`r30-2-red.log`).
  - (e1): `expectEmptyFolderState` `:264` `expect(state.metadata).toEqual({})` (გამოძახება `:280`); მიღებული `{'/music/a.wav': {ACat…}, '/music/b.wav': {BCat…}}`.
  - (e2): იგივე `:264` (გამოძახება `:295`), იგივე მიღებული.
  - (e3): `:310` `expect(state.metadata).toEqual({})`, მიღებული OLD a/b. readMetadataBatch 1× assertion (`:309`) გაიარა.
  - სამივე ვარდება symptom-ზე, არა setup-ზე. (e4), (u3) და 235 ძველი ტესტი გადის.
- A-ის tree (`/tmp/c-r30-new`): **240/240**, 13 ფაილი (`r30-2-green.log`).
- თითოეული ცალკე `-t '\(eN\)'`/`\(u3\)`: 1 passed | 239 skipped (`r30-2-alone.log`).

## R30-3 mutations — PASS (7/7 killed)
`mut.py`, 4 ფაილი (82 ტესტი), copy `/tmp/c-r30-mut`; diff-ები `mutants.log`-ში. baseline 82/82.
| Mutant | ზუსტი edit | შედეგი | Killer |
|---|---|---|---|
| EX-1 | `utils.ts:72` `failedPaths.push(...chunk);` → `failedPaths.splice(0, failedPaths.length, ...chunk);` | 1 failed | (u3) |
| EX-2 | → `if (failedPaths.length === 0) failedPaths.push(...chunk);` | 1 failed | (u3) |
| ME-1 | `handleOpenFolder`-ის `} else { setMetadata({}); }` → `}` | 2 failed | (e1), (e3) |
| ME-2 | App `openFolder`-ის იგივე `else` ამოღებული | 1 failed | (e2) |
| ME-3 | `handleRescan`-ის `else` ამოღებული | 1 failed | (e4) |
| ME-4 | ახალ `else`-ში + `useMetadataStore.getState().showToast('Folder is empty', 'error');` | 1 failed | (e1) |
| ME-5 | `else` ამოღებული + `setMetadata({});` `scanFolder`-ის შემდეგ, `setFiles`-მდე, უპირობოდ | 1 failed (4 ფაილი) და 1 failed / 240 (სრული suite) | (k2) მხოლოდ; (r*) killer **არ არის** |

შენიშვნა (signal, არა ბაგი): ME-5-ს მხოლოდ (k2) კლავს; არცერთი (r*) — A-ის დაკვირვება დადასტურდა.

## R30-4 gate — PASS
სუფთა state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), repository-ში:
- `verifyCommand` → **exit 0**, 42.6 s (`verify.log`). Biome 0 errors, **8 warnings**, სია = `c-round-29/biome-new.txt` (`biome-new.txt`, diff ცარიელი). Typecheck 0; `tsc --noEmit -p tsconfig.test.json` → 0 (`tsc-test.log`).
- Renderer **240/240** (13 files), main **93/93**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7** (`e2e-retries0.log`).

## R30-5 real app, old vs new — PASS
Builds: `/tmp/c-r30-old` (`git archive 20967a0`), `/tmp/c-r30-new` (A-ის tree), ორივე `electron-vite build` exit 0. Playwright `_electron`, `xvfb-run`, `--no-sandbox`, isolated `XDG_CONFIG_HOME`, `-r c-round-29/harness.cjs` (marker file → `meta:read-batch` throw; ყოველი call log-ში). UI-ით მართვა; მხოლოდ `dialog.showOpenDialog` stub-ია. Folders: `m/` (a,b = sample.wav), `empty/` (`notes.txt`), `o/` (c,d). Setup: open m → a.wav → Category `R30Cat` → Save Tags → `Tags saved`.

| run | mid folder | armed Open m: toast | a.wav Tagged | click a: Category | R: Rescan disarmed |
|---|---|---|---|---|---|
| new E | `empty`: 0 row, toast არ არის | `Failed to read 2 files` | **არა** | `""` | a Tagged, `R30Cat`, error toast არ არის |
| new O | `o`: c,d, toast არ არის | `Failed to read 2 files` | არა | `""` | — |
| old E (red) | `empty`: 0 row, toast არ არის | `Failed to read 2 files` | **კი (stale)** | **`R30Cat` (stale)** | a Tagged, `R30Cat` |
| old O | `o`: c,d | `Failed to read 2 files` | არა | `""` | — |

- new E == new O; old E აჩვენებს ბაგს (stale entry ბრუნდება), old O == new O. ეს ზუსტად task-ის მოლოდინია.
- ყველა run: harness-მა ესროლა `[a.wav, b.wav]`-ზე; sha256 a/b setup-ის შემდეგ და ბოლოს იგივე (`9e4a8ca1…`, `cbac699b…`); `ffprobe` `ICAT=R30Cat` და `music-metadata` `exif:ICAT=R30Cat` setup-ის შემდეგ და ბოლოს; `pageErrors` ცარიელი.
- Screenshots: `r30-5-{new,old}-{E,O}-NN-*.png` (მაგ. `r30-5-new-E-02-open-empty-list.png`, `r30-5-new-E-03-armed-open-m-list-toast.png`, `r30-5-old-E-04-click-a-form.png`, `r30-5-new-E-05-rescan-click-a-form.png`). JSON: `r30-5-*.json`, console: `run-*.txt`.
- Drop რეალურ app-ში არ იმართება (Playwright native file path-ს drop-ზე ვერ აყენებს); (e2) ფარავს. Artists მხოლოდ record (TM-B08).

## R30-6 docs — PASS
- ქართული, English technical terms.
- Entry 13: `გასწორდა (D-37, TM-B32)`; (e1)–(e4) სრული სახელით, თითო 1 match docs-ში და 1 tests-ში; "დისკზე არაფერი იცვლება" არის. Entry 12-ში (u3) სრული სახელით (1 match).
- D-35 bullet შეესაბამება კოდს: Open Folder catch `FolderBrowser.tsx:130-135` (`setFiles([])`+`setMetadata({})`+toast), App catch `App.tsx:82-87` (იგივე), Rescan catch `:182-185` (მხოლოდ toast), სამივე `else` `:127-129`, `:179-181`, `App.tsx:79-81`.
- ყველა ახალი/შეცვლილი `file:line` grep-ით შემოწმდა A-ის tree-ზე: `:111-126`, `:123`, `:124-126`, `:163-178`, `:175`, `:176-178`, `App.tsx:63-78`, `:75`, `:76-78` — სწორია. სხვა ref-ები frozen ფაილებზეა (უცვლელი).
- Header: (3),(9),(11),(12),(13) + წყარო TM-B32; title უცვლელი; D-37 bullet არსებობს და ემთხვევა `backlog.json` D-37-ს და `feature-status.md:352`-ს.
- Entries 1–10: diff მათ არ ეხება.
- README row ზუსტად: `ცნობილი შეზღუდვების სია (13 ჩანაწერი; 5 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- STATE_MANAGEMENT D-35 ხაზი აღარ ამბობს, რომ error path ერთნაირია.
- A-ის კითხვაზე (D-36 bullet-ის ბოლო წინადადება): owned ფაილშია, ფაქტობრივად ზუსტია (D-36-მა ისინი არ შეცვალა, ცარიელი folder D-37-მა შეცვალა). მისაღებია, ბაგი არ არის.

## Signals (არა ბაგი, B-სთვის)
- ME-5-ს მხოლოდ (k2) კლავს — (r*) ტესტები Open Folder-ის უპირობო `setMetadata({})`-ს ვერ ხედავს. თუ B-ს ორი killer სურს, round 31+ test gap.
- RR-R28-03 (save re-read ცარიელ folder-ზე გადასვლის შემდეგ stray key-ს ამატებს) უცვლელია და asserted არ არის, როგორც task-ში წერია.

## Blocked / not run
- Windows packaging BLOCKED: Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).
- Drop რეალურ app-ში (იხ. ზემოთ).

## დამატებითი sweep (R30-6)
- `docs/bugs/001`-ის ყველა ხაზი, სადაც `FolderBrowser`/`App.tsx` წერია (5, 14, 15, 16, 159, 173, 187), შემოწმდა, შეცვლილი ხაზების გარდაც. ყველა FolderBrowser/App ref სწორია. bare ref-ები `:68-70`, `:75`, `:137`, `:142-143`, `:145-148` ეხება frozen `utils.ts`/`file-store.ts`-ს.
- ძველ QA report-ებში (`docs/bugs/qa-*-2026-02-2*.md`) არის ისტორიული ref-ები (`FolderBrowser.tsx:204`, `:92`, `App.tsx:30`). ეს ფებრუარის snapshot-ებია, ამ round-ის scope-ში არ შედის. ბაგად არ ჩაითვლება.
