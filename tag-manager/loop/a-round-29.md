# A — round 29 ანგარიში: TM-B31 (D-36) — reject-ებული folder-read chunk

Implementer: A · 2026-10-27 · baseline `b182557` (HEAD = b182557baf43…, tree clean at start, verified)

## შეცვლილი ფაილები (10, ყველა ownership-ში)
- `src/renderer/src/lib/utils.ts` — `readMetadataChunked` აბრუნებს `failedPaths`-ს (`:72` push, `:75` return; `failures = failedPaths.length`). `data`/`readGenerations` უცვლელია, store import არ არის.
- `src/renderer/src/stores/file-store.ts` — `applyMetadataRead(read, readGenerations, keptPaths)`; `keptPaths: string[]` სავალდებულოა (`:35`, no `?`/default); D-35 loop უცვლელია, შემდეგ kept loop (`:145-148`) იღებს `state.metadata[path]`-ს იმავე `set`-ში.
- `src/renderer/src/components/sidebar/FolderBrowser.tsx` — `handleOpenFolder` (`:111-126`), `handleRescan` (`:161-176`): destructure `failures`/`failedPaths`, 3rd arg, `failures > 0` → `showToast(\`Failed to read ${failures} files\`, 'error')`. error paths, empty folder, deps უცვლელია.
- `src/renderer/src/App.tsx` — `openFolder` (`:63-78`) იგივე.
- `tests/renderer/components/folder-read-rejected-chunk.test.ts` (ახალი) — (k1)–(k7), 7 `it`.
- `tests/renderer/stores/file-store.test.ts` — (g3) ახალი describe + (g2)-ის ერთი call-ის `[]` არგუმენტი (`:352`).
- `tests/renderer/utils/utils.test.ts` — (u2) ახალი describe (მხოლოდ დამატება).
- `docs/bugs/001-save-and-selection-known-limits.md` — header ((3),(9),(11),(12); წყარო + TM-B31), D-35 bullet (signature + line refs, **და ერთი დამატებითი clause**: "(`read`-ში არმყოფი path ქრება, თუ ის `keptPaths`-ში არ არის, D-36)" — task-ის ზუსტ ჩამონათვალზე მეტი; დავამატე, რადგან სამ-პარამეტრიანი signature-ით ძველი "read-ში არმყოფი path ქრება" უკვე არასწორი იქნებოდა. B/C-ს შეუძლია ჩათვალოს ზედმეტად და მოითხოვოს წაშლა), ახალი D-36 bullet, entry 11 (refs, (r8) სახელი, pointer entry 12-ზე, ორი known-limit წინადადება A-R28-01/RR-R28-02 და RR-R28-01), ახალი entry `## 12.`; shifted refs: entry 6 `file-store.ts:83-97→84-98`, entry 9 და D-34 `122-130→123-131`.
- `docs/bugs/README.md` — row 001: `ცნობილი შეზღუდვების სია (12 ჩანაწერი; 4 გასწორდა, 5 მათგანი Saba-ს კითხვაა)`.
- `.claude/primitives/STATE_MANAGEMENT.md` — D-35 line: მხოლოდ signature token; ერთი ახალი D-36 line (Edit tool, path (b)).

Bash-ით repository ფაილებში არაფერი ჩამიწერია (ყველა ცვლილება Edit/Write). Bash-ით მხოლოდ ტესტები/build/lint გავუშვი და /tmp-ში throwaway ასლი შევქმენი (წაშლილია).

## რეალურად გაშვებული ტესტები
| ნაბიჯი | შედეგი | log |
|---|---|---|
| fixtures `npx --yes tsx@4 tests/fixtures/create-fixtures.ts` | ok | — |
| Red run (baseline src, ახალი ტესტები, src-ის შეხებამდე) `npx vitest run --config vitest.config.renderer.ts` | **8 failed / 227 passed (235), 13 files** | `a-round-29/red-run.log` |
| Red re-run (k6-ის დამატებითი assertion-ის შემდეგ; /tmp ასლი, 4 src `git show b182557:`) | **8 failed / 227 passed** | `a-round-29/red-run-2.log` |
| `npm run check` (biome src/ + typecheck node/web/test + test) | exit 0; Biome 0 errors, **8 warnings** (იგივე სია რაც `c-round-28/biome-new.txt`, `diff` ცარიელი); renderer **235/235** (13 files); main **93/93** (11 files) | `a-round-29/check.log`, `check2.log`, `biome-new.txt` |
| `xvfb-run -a npm run test:e2e` (clean `out test-results playwright-report`) | build ok, **7/7** | `a-round-29/e2e.log` |
| `xvfb-run -a npx playwright test --retries=0` | **7/7** | — |
| ყოველი ახალი ტესტი ცალკე `-t "(kN)"`, `-t "(g3)\|(u2)"` | ყველა 1 passed (g3+u2: 2 passed) | — |

### Red run, თითო ტესტზე (baseline src) — პირველი ჩავარდნილი assertion
- (k1) `expect(state.metadata).toEqual({a: OLD_A, b: OLD_B})` → received `{}`.
- (k2) იგივე → `{}`.
- (k3) იგივე → `{}`.
- (k4) `expect(metadata[z]).toEqual(oldMetaFor(z))` → `undefined` (chunk-1 50 path-მა გაიარა).
- (k5) `toastMessage toBe 'Failed to read 2 files'` → `null` (metadata `{}` baseline-ზეც სწორია).
- (k6) `expect(metadata[a]).toEqual(NEW_A)` reject-ის შემდეგ → `undefined` (წინა assertion-ები — OLD_A write-მდე, NEW_A re-read-ის შემდეგ — გაიარა).
- (g3) `expect(state.metadata).toEqual({a: A0, d: D1})` → `{ d: D1 }`.
- (u2) `expect(result.failedPaths).toEqual(paths.slice(50,100))` → `undefined`.
- (k7) green (pin). ყველა ძველი ტესტი, (r1)–(r8), (g2), (u1) ჩათვლით, green.

## Code review
`code-reviewer` subagent (read-only) გაეშვა: blocking/medium არ არის. მივიღე nit 2: (k6)-ში `metadata[a] toEqual OLD_A` write-ის resolve-მდე დავამატე (MK-3-ის დამოკიდებულება ცხადია). დანარჩენი — ქვემოთ gaps.

## Known gaps / signals B-სთვის (ownership-ის გარეთ ან გეგმის რაოდენობის შეცვლა)
- **A-R29-01 (low, test gap, CONFIRMED):** ორი reject-ებული chunk არ არის დატესტილი. mutant `failedPaths.splice(0, failedPaths.length, ...chunk)` (`utils.ts:72`, ინახავს მხოლოდ ბოლო reject-ებულ chunk-ს) მთელ renderer suite-ს გადაურჩება — გავუშვი /tmp ასლში: **235/235 passed**. R29-3-ის სიაში არ არის. fix: 151 path, chunk 1 და 3 reject → `[...slice(0,50), ...slice(100,150)]`. დავტოვე, რადგან ახალი `it` 235-ის რაოდენობას შეცვლიდა.
- **A-R29-02 (low, docs wording, pre-existing):** D-35 bullet (`001:14`) და STATE_MANAGEMENT D-35 line ამბობს "empty-folder → setMetadata({})"; ეს მხოლოდ `handleRescan`-ზეა სიმართლე (`FolderBrowser.tsx:177-179`). ცარიელ folder-ზე `handleOpenFolder` და App `openFolder` ძველ `metadata`-ს ტოვებს (RR-R28-03-ს ეხება). ტექსტი task-ის მიხედვით არ შემიცვლია.
- R29-5 (real app, old vs new build, harness) მე არ გამიშვია — ეს C-ის შემოწმებაა. **realVerified UI-ზე: არა A-ს მიერ.**
- Windows packaging: BLOCKED — Windows packaging is not available in the cloud.

## C-სთვის შემდეგი შემოწმებები
1. R29-1: `git status --porcelain --untracked-files=all` (9 M + 1 ??), `git diff --quiet b182557 -- . ':!src/renderer/src/lib/utils.ts' ':!src/renderer/src/stores/file-store.ts' ':!src/renderer/src/components/sidebar/FolderBrowser.tsx' ':!src/renderer/src/App.tsx' ':!tests/renderer/components/folder-read-rejected-chunk.test.ts' ':!tests/renderer/stores/file-store.test.ts' ':!tests/renderer/utils/utils.test.ts' ':!docs/bugs/001-save-and-selection-known-limits.md' ':!docs/bugs/README.md' ':!.claude/primitives/STATE_MANAGEMENT.md'`.
2. R29-2: baseline src + A tests → 227/8; A tree → 235/235.
3. R29-3 mutants, A-ს კოდის ფორმა: MK-1 წაშალე `file-store.ts:145-148`; MK-2 `if (current) metadata[path] = current;` → `metadata[path] = current ?? {};` (`:147`); MK-3 caller-ში `const before = useFileStore.getState().metadata` readMetadataChunked-მდე და kept-ის ხელით ჩასმა before-იდან (ან store-ში snapshot); MK-4 `failures > 0` → `failures >= 0`; MK-5/6/7 წაშალე toast `if` (`FolderBrowser.tsx:174-176` / `:124-126` / `App.tsx:76-78`); MK-8 `utils.ts:66` შემდეგ `failedPaths.push(...chunk)` try-ში; MK-9/9b/9c `failedPaths` → `[]` (`FolderBrowser.tsx:173` / `:123` / `App.tsx:75`). დამატებით: A-R29-01-ის splice mutant.
4. R29-4: სრული verifyCommand clean state-იდან + `--retries=0`.
5. R29-5: real app old vs new (harness, sha256, music-metadata + ffprobe).
6. R29-6: docs grep — (k1)–(k6), (r8) სახელები 1 match თითო (ჩემი grep: ყველა 1).

## Acceptance, რომელიც A-მ რეალურად გაიარა (საკუთარი შემოწმებით, არა C-ის ნაცვლად)
- R29-2 (red→green ნაწილი): დიახ — 8/227 baseline-ზე, 235/235 A tree-ზე, თითო ტესტი ცალკე.
- R29-4 (gate ნაწილი): დიახ — სრული braced verifyCommand clean state-იდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) ერთ გაშვებაში: exit 0, Biome 8 იგივე warning, renderer 235/235, main 93/93, E2E 7/7 (`a-round-29/verify.log`); ცალკე `--retries=0` 7/7.
- შენიშვნა: `a-round-N-result.json` წინა რაუნდებში runner-ის session-result dump-ია (harness წერს), A-ს მიერ არ იწერება; ამიტომ ხელით JSON არ შემიქმნია.
- R29-1, R29-3, R29-5, R29-6: არ გამივლია (C).
