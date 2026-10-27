# C — round 29 ვერიფიკაცია: TM-B31 (D-36) — reject-ებული folder-read chunk

Verifier: C · 2026-10-27 · baseline `b182557` · **შედეგი: PASS** (R29-1…R29-6), realVerified=true. Acceptance-ის ბაგი 0. ორი low signal არის (C-R29-01 test gap, C-R29-02 docs, ძველი ტექსტი). ორივე A-მ უკვე აღნიშნა, და C-მ ორივე დაადასტურა.

ყველა მტკიცებულება `c-round-29/`-შია.

## R29-1 ownership + process — PASS
- HEAD = `b182557`. `git status`: 9 `M` + 1 `??` (`tests/renderer/components/folder-read-rejected-chunk.test.ts`). ყველა 10 owned path-ია.
- `git diff --quiet b182557 -- . ':!<10 owned paths>'` → exit 0. MetadataPanel, `folder-read-during-save.test.ts`, metadata-panel ტესტები, helpers, `src/main/**`, types, preload და package.json byte-identical-ია.
- src diff (სრულად წაკითხული):
  - `lib/utils.ts`: მხოლოდ `failedPaths` (type, `push(...chunk)`, `failures: failedPaths.length`). store import არ არის. generation კვლავ ერთხელ იღება chunk-ზე, `readMetadataBatch`-მდე.
  - `file-store.ts`: interface-ში `keptPaths: string[]` (`?`/default არ აქვს) და implementation-ში ერთი loop (`:145-148`), რომელიც `state.metadata`-ს კითხულობს იმავე `set`-ში. სხვა action არ შეცვლილა.
  - callers (`FolderBrowser.tsx` ×2, `App.tsx`): მხოლოდ success path იცვლება — destructure, 3rd arg `failedPaths`, და `if (failures > 0) showToast(\`Failed to read ${failures} files\`, 'error')`. ტექსტი = `MetadataPanel.tsx:252`. error path-ები, empty folder, deps და casts უცვლელია.
  - comment, `any`, `@ts-ignore` ან ახალი `as` არ დამატებულა.
- ტესტების diff: `file-store.test.ts`-ში ერთადერთი წაშლილი/შეცვლილი ხაზი (g2)-ის call-ია (`, []`), დანარჩენი მხოლოდ დამატებაა. `utils.test.ts`-ში მხოლოდ დამატებაა.
- `STATE_MANAGEMENT.md`: D-35 line-ში შეიცვალა მხოლოდ signature token, და დაემატა ერთი D-36 line.
- C-ის ფაზის ბოლოს (gate-ის, build-ების და mutant-ების შემდეგ) `git status --porcelain --untracked-files=all` და `git diff --stat b182557` იგივეა, რაც დასაწყისში: 9 M + 1 ??, `9 files changed, 118 insertions(+), 22 deletions(-)`. `git diff b182557 | sha256sum` = `7d857150…`. ახალი ტესტი და 4 src ფაილი byte-identical-ია ფაზის დასაწყისში გადაღებულ `/tmp/c-r29-new` ასლთან. ე.ი. C-ს source არ შეუცვლია.
- Bash write repository-ში: **unknown** — A-ს transcript-ში command-ები არ ჩანს (`a-round-29-result.json` session dump-ია). A აცხადებს, რომ მხოლოდ Edit/Write გამოიყენა. ეს FAIL არ არის.

## R29-2 red → green — PASS
- `/tmp/c-r29-oldsrc`: 4 src ფაილი აღებულია `git show b182557:`-ით, ტესტები — A-ს. შედეგი: **8 failed / 227 passed (235)**, 13 files (`r29-2-old-src-new-tests.log`). პირველი ჩავარდნილი assertion თითოეულ ტესტში:
  - (k1)/(k2)/(k3): `metadata` → `{}` (`:123` via `:151/:163/:178`);
  - (k4): `metadata[z.wav]` → `undefined` (`:200`);
  - (k5): toast → `null` (`:218`);
  - (k6): `metadata[a]` reject-ის შემდეგ → `undefined`, expected NEW_A (`:240`); წინა assertion-ები, OLD_A და NEW_A, გავიდა;
  - (g3): `{d: D1}`, expected `{a: A0, d: D1}`;
  - (u2): `failedPaths` → `undefined`.
  - ყველა ჩავარდნა symptom-ზეა, setup-ზე არცერთი. (k7) და 226 ძველი ტესტი green-ია.
- A-ს tree: **235/235**, 13 files (`r29-2-new.log`). თითო ახალი ტესტი ცალკე `-t`-ით: 1 passed (`r29-2-alone.log`).

## R29-3 mutations — PASS (11/11 killed)
სკრიპტი: `c-round-29/mut.py`, diff-ები `mutants.log`-შია. გაშვებული ტესტები: rejected-chunk, during-save, file-store, utils (77 ტესტი). baseline: 77/77.

| mutant | edit | killed by |
|---|---|---|
| MK-1 | `file-store.ts:145-148` kept loop წაშლილი | (g3)(k1)(k2)(k3)(k4)(k6) |
| MK-2 | `metadata[path] = current ?? {}` | (g3)(k5) |
| MK-3 | სამივე caller-ში `before = getState().metadata` `readMetadataChunked`-მდე; `applyMetadataRead`-ის შემდეგ kept path-ებს `before`-იდან უწერს (ან შლის) | (k6) |
| MK-4 | `failures >= 0` (ყველგან) | (k7) |
| MK-5 | handleRescan toast-ის `if` წაშლილი | (k1)(k4)(k6) |
| MK-6 | handleOpenFolder toast-ის `if` წაშლილი | (k2)(k5) |
| MK-7 | App toast-ის `if` წაშლილი | (k3) |
| MK-8 | `failedPaths.push(...chunk)` try-შიც | (k4)(k7)(r4)(r7)(r8)(u1)(u2) |
| MK-9 | handleRescan `[]` | (k1)(k4)(k6) |
| MK-9b | handleOpenFolder `[]` | (k2) |
| MK-9c | App `[]` | (k3) |
| EX-1 (A-R29-01) | `failedPaths.splice(0, len, ...chunk)` | **survives** (77/77) → C-R29-01 |

ყველა ჩამოთვლილი mutant მოკვდა მოსალოდნელი killer-ებით (MK-2-ს დამატებით (k5) კლავს, MK-8-ს — ძველი D-35 ტესტებიც). EX-1 task-ის სიაში არ არის: ეს test gap-ია round 30-ისთვის და FAIL-ად არ ითვლება.

## R29-4 gate — PASS
- გაშვება clean state-იდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), სრული braced `verifyCommand`: **EXIT=0** (`verify.log`).
  - Biome: 0 errors, **8 warnings**. სია იგივეა, რაც `c-round-28/biome-new.txt` (line შესწორების შემდეგ `diff` ცარიელია; `biome-new.txt`).
  - typecheck: node, web და test — 0 შეცდომა.
  - renderer: **235/235** (13 files); main: **93/93** (11 files); E2E: **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7**, EXIT=0 (`e2e-retries0.log`).

## R29-5 real app, old vs new — PASS
- old build = `git archive b182557`, new build = A-ს tree-ის ასლი; ორივე `/tmp`-ში აიწყო `electron-vite build`-ით (`build-old.log`, `build-new.log`, EXIT=0).
- Electron `_electron` გაეშვა `xvfb-run`-ით, პარამეტრებით `--no-sandbox`, იზოლირებული `XDG_CONFIG_HOME` და `-r c-round-29/harness.cjs`.
  - harness: როცა marker ფაილი არსებობს, `meta:read-batch` real listener-მდე **throw**-ს აკეთებს; ყველა call ილოგება.
  - folder dialog stub-ირებულია. UI იმართება მხოლოდ `drive.mjs`-ით.
- Setup: `sample.wav` → a.wav, b.wav. Open Folder → a.wav → Category `R29Cat` → `Save Tags` → `Tags saved`. შემდეგ arm → action → disarm → a.wav-ზე click (C-ში — c.wav-ზე).

| build/scenario | harness threw | a.wav `Tagged` action-ის შემდეგ | form Category | toast | sha256 უცვლელი | ffprobe / music-metadata ICAT | pageErrors |
|---|---|---|---|---|---|---|---|
| new A (Rescan) | a,b | **კი** | **R29Cat** | **Failed to read 2 files** | კი | R29Cat / R29Cat | [] |
| new B (Open Folder, same) | a,b | **კი** | **R29Cat** | **Failed to read 2 files** | კი | R29Cat / R29Cat | [] |
| new C (Open Folder → other) | c,d | — (c,d listed, badge არ აქვთ, ცარიელი ფორმა) | "" | **Failed to read 2 files** | კი | R29Cat / R29Cat | [] |
| old A | a,b | **არა** (badge გაქრა) | "" (ცარიელი) | არა | კი | R29Cat / R29Cat | [] |
| old B | a,b | **არა** | "" | არა | კი | R29Cat / R29Cat | [] |
| old C | c,d | — (c,d listed) | "" | **არა** | კი | R29Cat / R29Cat | [] |

- old build-მა ბაგი ზუსტად task-ის აღწერით აჩვენა, new build-მა — გასწორება.
- a.wav-ის sha256: setup-ის შემდეგ და action-ის შემდეგ ერთნაირია (`26f47bbe…`). დისკზე არაფერი შეცვლილა, ბაგი მხოლოდ ჩვენებას ეხებოდა.
- Artists: მხოლოდ ჩაწერილია (TM-B08); ორივე reader-ში ცარიელია.
- მტკიცებულება: `r29-5-{old,new}-{A,B,C}.json`, `run-*.txt`, screenshots `r29-5-*-02-action-*-list-toast.png` (list + toast) და `*-03-click-*-form.png` (ფორმა).

## R29-6 docs — PASS
- ტექსტი ქართულია, ტექნიკური ტერმინები — ინგლისურად.
- Entry 12:
  - მონიშნულია `გასწორდა (D-36, TM-B31)`;
  - (k1)–(k6)-ის სრული სახელები: grep-ით თითოეული 1 match;
  - reachability: IPC-level reject, display-only (`metadata.ts:233-247`, `:170-171` სწორია);
  - დარჩენილ შეზღუდვად დასახელებულია RR-R13-01.
- Entry 11:
  - (r8)-ის სრული სახელი: 1 match;
  - ორი known-limit წინადადება (A-R28-01/RR-R28-02, RR-R28-01) არის;
  - "B-R27-01 დარჩენილი" ჩანაცვლებულია pointer-ით entry 12-ზე.
- Header-ში (3), (9), (11) და (12) არის; `წყარო`-ში — TM-B31; D-36 bullet არის.
- ყოველი `file:line` grep-ით შემოწმდა A-ს tree-ზე, და ყველა სწორ კოდზე მიუთითებს:
  - `file-store.ts`: `:35`, `:84-98`, `:123-131`, `:133-150`, `:137`, `:142-143`, `:145-148`;
  - `utils.ts`: `:64`, `:68-70`, `:72`, `:75`;
  - `FolderBrowser.tsx`: `:111-126`, `:123`, `:124-126`, `:161-176`, `:173`, `:174-176`;
  - `App.tsx`: `:63-78`, `:75`, `:76-78`;
  - `MetadataPanel.tsx:252`.
- Entries 1–10: შეიცვალა მხოლოდ entry 6-ის (`84-98`) და entry 9-ის / D-34-ის (`123-131`) ხაზის ნომრები. ორივე ახალ კოდზე სწორად მიუთითებს.
- A-მ D-35 bullet-ს დაუმატა clause "(read-ში არმყოფი path ქრება, თუ ის keptPaths-ში არ არის, D-36)". clause ზუსტია და სამ-პარამეტრიან signature-ს შეესაბამება, ამიტომ C მას დატოვებას ეთანხმება.
- README row ზუსტად ემთხვევა: `ცნობილი შეზღუდვების სია (12 ჩანაწერი; 4 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- D-36 ემთხვევა `feature-status.md:342`-ს და `backlog.json` `decisions` D-36-ს.

## Signals B-სთვის (low, acceptance-ის FAIL არ არის)
- **C-R29-01 (= A-R29-01, CONFIRMED):** ორი reject-ებული chunk-ის შემთხვევა დატესტილი არ არის, ამიტომ EX-1 splice mutant გადარჩება. ტესტის შემოთავაზება: 151 path; chunk 1 და chunk 3 reject-დება → `failedPaths` toEqual `[...slice(0,50), ...slice(100,150)]`, `failures === 100`.
- **C-R29-02 (= A-R29-02, ძველი ტექსტი):** D-35 bullet (`001:14`) და STATE_MANAGEMENT-ის D-35 line ამბობს, რომ "ცარიელი folder → setMetadata({})". ეს მხოლოდ `handleRescan`-ზეა სწორი (`FolderBrowser.tsx:177-179`). ცარიელ folder-ზე `handleOpenFolder` და App `openFolder` ძველ `metadata`-ს ტოვებს. ეხება RR-R28-03-ს.

## "What could break"
- D-35 (r1)–(r8), (g2), (u1), D-33/D-34 (s1)–(s15), (g1) green-ია (235/235 renderer).
- error path-ების toast-ები, empty folder, close folder, D-29 discard toast და D-28 ძველი ტესტებით (235/235) და E2E-ით (7/7, `folder-workflow.spec.ts` ჩათვლით) შემოწმდა.
- real app-ში ეს შემთხვევები ცალკე არ გამიშვია; real app-ში დამატებით შემოწმდა მხოლოდ R29-5-ის სცენარები.

## BLOCKED
- Windows packaging is not available in the cloud (ამ round-ის ნაწილი არ არის).
