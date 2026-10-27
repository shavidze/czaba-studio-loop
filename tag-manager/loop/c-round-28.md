# C — Round 28 ვერიფიკაცია: TM-B30 (D-35) — stale folder read during a pending save

**ვერდიქტი: PASS** (R28-1…R28-6). ბაგი: 0. realVerified=true: real app, ორი build (old `6c956b4` და new = A-ს tree), xvfb + Playwright `_electron`; ფაილი ორმა დამოუკიდებელმა reader-მა წაიკითხა (music-metadata, ffprobe).
Source-ს არ შევხებივარ. ყველა build/mutant გაეშვა `/tmp`-ის copy-ებში. repo-ში gate-მა მხოლოდ gitignored output დაწერა (`out/`, `test-results/`, fixtures). `git diff 6c956b4 -- src .claude`-ის sha256 იგივეა ჩემი phase-ის დასაწყისსა და ბოლოს (`ecdda51c…`).
Evidence: `c-round-28/`.

## R28-1 ownership + process — PASS
- `git status`: 9 `M` (owned) და 1 `??` (`tests/renderer/components/folder-read-during-save.test.ts`). HEAD `6c956b4`.
- `git diff --quiet 6c956b4 -- . ':!<10 owned>'` → exit 0. ესე იგი MetadataPanel, ორივე metadata-panel test, helpers, setup, `src/main/**`, types და preload byte-identical-ია.
- `grep -n "stores/" src/renderer/src/lib/utils.ts` → ცარიელი. `getWriteGeneration: () => number` სავალდებულოა (`?` და default არ აქვს).
- `file-store.ts`-ში დაემატა მხოლოდ `applyMetadataRead`: interface `:32-35` და implementation `:132-145`. ახალი state არ არის.
- სამივე caller-ში შეიცვალა მხოლოდ success-path read და store write. error, empty, close, clearSelection და toast უცვლელია. full diff: `c-round-28/src.diff`.
- ტესტების diff არსებულ ფაილებში: `-` ხაზი 0, დამატებულია მხოლოდ import-ის `readMetadataChunked`.
- `src/`-ის `+` ხაზებში comment, `any` და `@ts-ignore` არ არის. `as` გვხვდება 3-ჯერ: სამივე არსებული `meta as Record<…>` cast-ია, ახალ ხაზზე გადატანილი.
- `STATE_MANAGEMENT.md`-ში დაემატა ერთი ხაზი.
- A-ს transcript (`49171cb1….jsonl`) წავიკითხე: repo-ს ფაილები შეიცვალა მხოლოდ Edit/Write-ით. Bash ჩანაწერები მიდიოდა loop folder-ში და `/tmp`-ში, mutation-ები `/tmp/a28-mut`-ში. red run-მა src-ზე შეხებამდე `git diff --quiet -- src` გაიარა. `permission_denials`: [].

## R28-2 red → green — PASS
- baseline src (4 ფაილი `git show 6c956b4:`-დან) და A-ს ტესტები, `/tmp/c-r28-red`: **7 failed | 219 passed (226)**, Test Files 3 failed | 9 passed. log: `r28-2-old-src-new-tests.log`.
  - (r1) `:149` — `category` "ACat", მოსალოდნელი "R28Cat". წინა assertion-ები (batch call 1×, `:146` save re-read = NEW_A) გავიდა.
  - (r2) `:171`, (r3) `:192`, (r6) `:252` — `'ACat'`, მოსალოდნელი `'R28Cat'`.
  - (r7) `:282` — `'/music/a.wav-cat'` (a-ს stale seed/read), მოსალოდნელი R28Cat.
  - (g2) `file-store.test.ts:352` — `applyMetadataRead is not a function`.
  - (u1) — `expected undefined to deeply equal {…}` (`readGenerations` undefined).
  - ყველა ჩავარდნა სიმპტომზეა და არა setup-ზე. (r4), (r5) და (r8) მწვანეა, 216 ძველი ტესტიც მწვანეა.
- A-ს tree: renderer **226/226** (12 files). ეს gate-ის log-იდანაა.
- `-t` ცალკე, `/tmp/c-r28-new`-ში: ათივე ტესტი "1 passed | 225 skipped". log: `r28-2-alone.log`.

## R28-3 mutations — PASS (10/10 killed)
ფაილები: new test + `file-store.test.ts` + `utils.test.ts` (68 ტესტი). script: `mut.py`; edit-ები და diff-ები: `mutants.log`. mutation-ის გარეშე: 68/68.

| Mutant | ზუსტი edit | Killed by |
|---|---|---|
| MR-1 | `isSuperseded = false` | (g2)(r1)(r2)(r3)(r6)(r7) |
| MR-2 | `) > (` → `) >= (` | (g2)(r4)(r6)(r8) |
| MR-3 | `chunkGeneration` loop-ის წინ ერთხელ | (r8)(u1) |
| MR-4 | `chunkGeneration` `await readMetadataBatch`-ის შემდეგ | (r1)(r2)(r3)(r6)(r7)(u1) |
| MR-5 | `metadata[path] = current ?? meta` | (g2) |
| MR-6 | handleRescan (2nd occurrence) → `setMetadata(meta …)` | (r1)(r2)(r7) |
| MR-7 | handleOpenFolder (1st) → `setMetadata(meta …)` | (r3) |
| MR-8 | App openFolder → `setMetadata(meta …)` | (r6) |
| MR-9 | `{}` → `{ ...state.metadata }` | (g2)(r5) |
| MR-10 | ორივე ფაილში `() => 0` | (r4)(r8) |

ყველა მოსალოდნელი killer ამ სიაშია. survivor არ არის.

## R28-4 gate — PASS
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გაეშვა სრული verifyCommand → **EXIT=0** (`verify.log`).
- Biome: 0 errors, **8 warnings**. სია იგივეა, რაც `c-round-27/biome-new.txt`-ში (`biome-new.txt`); ერთადერთი სხვაობაა `FolderBrowser.tsx:213` → `:225`, იგივე `useKeyWithClickEvents`, +12 ხაზის shift.
- typecheck (node, web, test): 0.
- renderer **226/226** (12), main **93/93** (11), E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7 passed**, EXIT=0 (`e2e-retries0.log`).

## R28-5 real app, old vs new — PASS
- build-ები: `/tmp/c-r28-old` (`git archive 6c956b4`) და `/tmp/c-r28-appnew` (A-ს tree). ორივე `electron-vite build`-ით აეწყო. renderer bundle-ში `applyMetadataRead` new-ში 4-ჯერ გვხვდება, old-ში 0-ჯერ.
- harness: `c-round-28/harness.cjs`.
  - `meta:write` და `meta:write-batch` 3 s-ით ყოვნდება real listener-მდე.
  - პირველი `meta:read-batch`, რომელიც pending write-ის დროს იწყება (`pendingWrites>0`), listener-ს მაშინვე უშვებს, reply-ს კი 6 s-ით აყოვნებს.
  - ყველა call log-დება timestamp-ით.
- driver: `drive.mjs`. `--no-sandbox`, იზოლირებული `XDG_CONFIG_HOME`, 1400×900. dialog stub აბრუნებს test folder-ს. `a.wav` და `b.wav` = `tests/fixtures/sample.wav`-ის ასლები. UI იმართება მხოლოდ click/fill-ით.

| Run | log: read start / listener-done / write end / save re-read / late reply (ms Save-დან) | step4 Category ფორმაში | ffprobe ICAT / mm `exif:ICAT` | ffprobe title / mm INAM | pageErrors |
|---|---|---|---|---|---|
| new A (Rescan) | 614 / 616 / 3049 / 3053 / 6617 | **R28Cat** | R28Cat / R28Cat | R28T2 / R28T2 | [] |
| new B (Open Folder) | 611 / 613 / 3050 / 3055 / 6613 | **R28Cat** | R28Cat / R28Cat | R28T2 / R28T2 | [] |
| old A (Rescan) | 615 / 617 / 3049 / 3053 / 6618 | `''` (stale) | `''` / `''` (R28Cat დაიკარგა) | R28T2 / R28T2 | [] |
| old B (Open Folder) | 610 / 612 / 3046 / 3051 / 6612 | `''` (stale) | `''` / `''` | R28T2 / R28T2 | [] |

- folder read ოთხივე run-ში დაიწყო და წაიკითხა ფაილი write-ის დასრულებამდე: read-ის values a/b `category ''`. reply მოვიდა save-ის `meta:read`-ის შემდეგ.
- old build-მა bug-ი გაიმეორა: data loss, `ICAT` დისკზე ისევ `''`-ს უდრის. new build ინახავს `R28Cat`-ს.
- screenshot-ები: `r28-5-{old,new}-{A,B}-NN-*.png`, ყოველ run-ზე 8. მაგალითად `…-06-step4-click-a.png`: new-ში Category = R28Cat და a.wav-ს `Tagged` badge აქვს; old-ში Category ცარიელია და badge არ ჩანს.
- სრული შედეგი: `r28-5-*.json`.
- Artists მხოლოდ ჩანაწერია: ffprobe/mm artist = undefined ყველა run-ში (TM-B08).
- დაკვირვება (ახალი ბაგი არ არის): ოთხივე run-ში, old-შიც, Rescan/Open Folder save-ის დროს აჩვენებს toast-ს `Unsaved changes were discarded`, თუმცა save წარმატებით სრულდება. ეს D-29-ის baseline ქცევაა და round 20-ის შემდეგ დოკუმენტირებულია (`c-round-20.md`, active-backlog).

## R28-6 docs — PASS
- ქართულ ენაზეა, English technical terms-ით.
- entry `## 11.`: `გასწორდა (D-35, TM-B30)`. (r1), (r2), (r3), (r6) და (r7) სრული სახელით წერია; ყოველი grep test ფაილში 1 match-ს იძლევა. reachability (`metadata.ts:289` = `i % 5` write-batch, `:243` = `i % 10` read-batch) და B-R27-01 როგორც დარჩენილი limit ადგილზეა.
- header: "(3), (9) და (11)". `წყარო` შეიცავს TM-B30 (round 28). `კოდი` შეიცავს 4 ფაილს. D-35 bullet არის.
- ყოველი `file:line` grep-ით შევამოწმე A-ს tree-ზე, ყველა სწორია:
  - `utils.ts:63`, `:67-69`;
  - `file-store.ts:132-145`, `:136`, `:141-142`, `:83-97` (`selectRange`), `:122-130` (`markPathsWritten`);
  - `FolderBrowser.tsx:111-118`, `:153-160`;
  - `App.tsx:63-70`.
- entries 1–10-ში შეიცვალა მხოლოდ ორი file-store ref, A-ს მიერ ჩამოთვლილი shift-ები (D-34 bullet და entry 9 `118-126→122-130`, entry 6 `79-93→83-97`).
- README row ზუსტად ემთხვევა task-ის ტექსტს. `STATE_MANAGEMENT.md`-ის D-35 ხაზი 4-ივე მოთხოვნილ პუნქტს შეიცავს.
- D-35-ის ჩანაწერი არის `backlog.json` `decisions`-ში და `feature-status.md` TM-B30 row-ში.

## Blocked
- Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).

## B-სთვის (არა-blocking)
- A-R28-01 და A-R28-02 (A-ს შენიშვნები) ვალიდურია. (r8) ერთადერთი component-level killer-ია MR-3-ისთვის, ამიტომ entry 11-ში მისი დამატება ღირს.

## დამატება: (g2)/(u1) ტესტების შინაარსი
- (g2) და (u1) body-ები წავიკითხე. ორივე ზუსტად მიჰყვება spec-ს.
- (g2) ამოწმებს: metadata `{a:A0,d:D1,e:E1}`; writeGeneration 2; pathWriteGenerations უცვლელია; `files` toBe; `selectedPaths` უცვლელია.
- (u1) ამოწმებს: failures 50; readGenerations = chunk-1 → 0, `/m/100.wav` → 1, chunk-2 არ არის; getWriteGeneration 3×; batch call-ები 50/50/1; data-ს key-ები; chunk-2 ჩანაწერი data-ში არ არის.
