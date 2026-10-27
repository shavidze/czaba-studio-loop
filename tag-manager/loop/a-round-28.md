# A — Round 28: TM-B30 (D-35) — stale folder read overwrites a save

**სტატუსი:** implementation დასრულდა; ყველა local შემოწმება მწვანეა. R28-5 (real app, old vs new build) A-ს არ გაუშვია — ეს C-ის შემოწმებაა.
Baseline: HEAD `6c956b4`, tree სუფთა იყო დაწყებისას (შემოწმდა). commit/push არ გაკეთებულა. ყველა repo-ს ფაილი შეიცვალა მხოლოდ Edit/Write tool-ით (Bash-ით repo-ში არაფერი ჩაწერილა). `.claude/primitives/STATE_MANAGEMENT.md` — Edit tool, path (b) permission.

## შეცვლილი ფაილები (10, ყველა ownership-ში)
| ფაილი | ცვლილება |
|---|---|
| `src/renderer/src/lib/utils.ts` | `readMetadataChunked(paths, schema, getWriteGeneration: () => number)` — სავალდებულო პარამეტრი; `getWriteGeneration()` ერთხელ ყოველი chunk-ის `readMetadataBatch`-ის წინ (`:63`); `readGenerations` მხოლოდ result-ის path-ებზე (`:67-69`); reject → `failures += chunk.length`, არაფერი `readGenerations`-ში. store import არ არის. |
| `src/renderer/src/stores/file-store.ts` | interface: `applyMetadataRead` `markPathsWritten`-ის შემდეგ (`:32-35`); implementation `:132-145`. ახალი state არ არის. |
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | `handleOpenFolder` (`:111-118`), `handleRescan` (`:153-160`): success path → `readMetadataChunked(..., () => useFileStore.getState().writeGeneration)` + `useFileStore.getState().applyMetadataRead(meta as Record<string, WavMetadata>, readGenerations)`. error/empty/close path-ები, clearSelection, toast, isScanning უცვლელი; deps უცვლელი (`setMetadata` ისევ გამოიყენება). |
| `src/renderer/src/App.tsx` | `openFolder` (`:63-70`) — იგივე. |
| `tests/renderer/components/folder-read-during-save.test.ts` (ახალი) | (r1)–(r8), 8 `it` |
| `tests/renderer/stores/file-store.test.ts` | ახალი `describe("applyMetadataRead (TM-B30, D-35)")` — (g2), 1 `it`, მხოლოდ დამატება |
| `tests/renderer/utils/utils.test.ts` | import სიაში `readMetadataChunked`; ახალი `describe("readMetadataChunked (TM-B30, D-35)")` — (u1), 1 `it` |
| `docs/bugs/001-save-and-selection-known-limits.md` | header "(3), (9) და (11)"; წყარო + TM-B30 (round 28); კოდი + 4 ფაილი; D-35 bullet; entry 11; shifted refs (ქვემოთ) |
| `docs/bugs/README.md` | row 001: `ცნობილი შეზღუდვების სია (11 ჩანაწერი; 3 გასწორდა, 5 მათგანი Saba-ს კითხვაა)` |
| `.claude/primitives/STATE_MANAGEMENT.md` | ერთი დამატებული ხაზი D-34-ის შემდეგ: "Stale folder read (D-35): …" |

Shifted line refs entries 1–10-ში (file-store.ts-ში interface-ს +4 ხაზი დაემატა):
- entry 6: `file-store.ts:79-93` → `:83-97` (`selectRange`)
- D-34 bullet და entry 9: `file-store.ts:118-126` → `:122-130` (`markPathsWritten`)
სხვა ცვლილება entries 1–10-ში არ არის. MetadataPanel.tsx refs უცვლელია (ფაილი frozen).

## Red run (baseline src, A-ს ტესტები, src-ზე შეხებამდე)
`npx vitest run --config vitest.config.renderer.ts` → **Tests 7 failed | 219 passed (226)**, Test Files 3 failed | 9 passed (12). Log: `a-round-28/red-run.txt`.
| ტესტი | შედეგი | პირველი ჩავარდნილი assertion / სიმპტომი |
|---|---|---|
| (r1) | red | `:149` `metadata[a]` toEqual NEW_A → received `category: "ACat"` (stale) |
| (r2) | red | `:171` `metadata[a].category` expected `R28Cat`, received `ACat` |
| (r3) | red | `:192` expected `R28Cat`, received `ACat` |
| (r4) | green (pin) | — |
| (r5) | green (pin) | — |
| (r6) | red | `:252` expected `R28Cat`, received `ACat` |
| (r7) | red | `:282` expected `R28Cat`, received `/music/a.wav-cat` (a-ს pre-save seed/read მნიშვნელობა = stale) |
| (r8) | green (pin) | — |
| (g2) | red | `TypeError: ...applyMetadataRead is not a function` (`file-store.test.ts:352`) |
| (u1) | red | `:148` `result.readGenerations` expected object, received `undefined` |
ყველა 216 ძველი ტესტი მწვანე იყო. ყველა ჩავარდნა სიმპტომზეა, არა setup-ზე (ყოველ (r*)-ში წინა assertion-ები — `readMetadataBatch` called 1× write-ის resolve-მდე, save-ის re-read store-ში — გაიარა).

## Green / gate (A-ს tree)
- `npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check` → EXIT 0. Biome: 0 errors, **8 warnings**, იგივე სია რაც `c-round-27/biome-new.txt` (ერთადერთი სხვაობა: `FolderBrowser.tsx:213:11` → `:225:11`, იგივე pre-existing `useKeyWithClickEvents`, +12 ხაზის shift). typecheck (node, web, test) 0. Renderer **226/226** (12 files), main **93/93** (11 files). საბოლოო run: `a-round-28/check-final.log`.
- `xvfb-run -a npm run test:e2e` → build OK, **7 passed**, EXIT 0 (`a-round-28/e2e.log`). შემდეგ `xvfb-run -a npx playwright test --retries=0` (იგივე `out/`) → **7 passed**.
- თითო ტესტი ცალკე (`-t`): (r1)…(r8), (g2), (u1) — თითოეული 1 passed.
- `folder-read-during-save.test.ts` 5× ზედიზედ: 8/8 ყოველ ჯერზე (r6-ის flakiness შემოწმება).
- frozen: `git diff --quiet 6c956b4 -- MetadataPanel.tsx, metadata-panel-*.test.ts, tests/renderer/helpers, src/main, src/preload, src/renderer/src/types, package*.json` → სუფთა. `grep -n "stores/" src/renderer/src/lib/utils.ts` → ცარიელი.

## Mutation self-check (A, არაოფიციალური; /tmp copy, უკვე წაშლილი)
new test file + file-store.test.ts + utils.test.ts, თითო mutant-ზე:
| Mutant | Edit | Killed by |
|---|---|---|
| MR-1 | `const isSuperseded = false;` | (g2)(r1)(r2)(r3)(r6)(r7) |
| MR-2 | `>` → `>=` | (g2)(r4)(r6)(r8) |
| MR-3 | `getWriteGeneration()` loop-ის წინ ერთხელ | (u1)(r8) |
| MR-4 | generation `readMetadataBatch`-ის resolve-ის შემდეგ | (u1)(r1)(r2)(r3)(r6)(r7) |
| MR-5 | `metadata[path] = current ?? meta;` | (g2) |
| MR-6 | `handleRescan` → `setMetadata(meta …)` | (r1)(r2)(r7) |
| MR-7 | `handleOpenFolder` → `setMetadata(meta …)` | (r3) |
| MR-8 | App `openFolder` → `setMetadata(meta …)` | (r6) |
| MR-9 | `{ ...state.metadata }`-დან დაწყება (merge) | (g2)(r5) |
| MR-10 | callers `() => 0` | (r4)(r8) |
survivor არ არის; ყველა მოსალოდნელი killer-ი შედის.

## code-reviewer (project subagent) — შედეგი
blocking finding არ არის; ყველა doc `file:line` ref სწორია. დამუშავება:
1. low — `file-store.test.ts` `expect(state.files).toEqual(mockFiles)` → **`toBe`** (გასწორდა, ჩემი ახალი ტესტი).
2. low — entry 11-ის ტესტების სიაში (r8) არ არის. **არ შევცვალე**: task ზუსტად (r1)(r2)(r3)(r6)(r7)-ს ითხოვს. B-სთვის შეთავაზება: (r8) ერთადერთი component-level killer-ია MR-3-ისთვის, docs-ში დამატება ღირს.
3. low — `utils.test.ts` `vi` global-ით გამოიყენება (import-ის გარეშე; `globals: true` + `vitest/globals` types). **არ შევცვალე**: task ცვლილებას მხოლოდ `~/lib/utils` import-ზე უშვებს, `vitest` import ხაზი ძველია.
4. info — single-chunk read write-მდე + save-ის re-read reject (D-24) → path superseded-ია და save-მდე entry-ს ინარჩუნებს შემდეგ Rescan-მდე (D-34 (a)-ს ანალოგი). docs-ში და ტესტში არ არის; multi-chunk ვარიანტს (r8) ფარავს. შეთავაზება B-ს (A-R28-01).

## ცნობილი ხარვეზები / შენიშვნები
- **A-R28-01 (info):** ზემოთ (4) — D-35-ის D-34 (a)-ს მსგავსი შემთხვევა დოკუმენტირებული არ არის.
- **A-R28-02 (low):** entry 11 ტესტების სიაში (r8) არ არის (task-ის მიხედვით).
- Open Folder / drop ცარიელ folder-ზე `setMetadata`-ს არ იძახებს (ძველი metadata რჩება) — baseline ქცევაა, არ შეცვლილა (scope-ის გარეთ).
- B-R27-01 (reject-ებული chunk-ის path-ები ქრება, toast არ არის) — scope-ის გარეთ, docs-ში დარჩენილ შეზღუდვად წერია.
- R28-5 (real app) A-ს არ გაუშვია: realVerified A-ს მხრიდან მხოლოდ unit/component + E2E suite-ზე.

## Acceptance — რა გაიარა A-მ რეალურად
- R28-1: A-ს მხრიდან self-check (status: 10 path, 1 untracked; frozen diff სუფთა; no store import; `getWriteGeneration` სავალდებულოა; ახალი `as`/comment/any არ არის). საბოლოო ვერდიქტი — C.
- R28-2: red 7/219 baseline src-ზე, green 226/226, თითო ტესტი ცალკე — გაშვებულია A-ს მიერ. (C-მ throwaway copy-ში უნდა გაიმეოროს.)
- R28-3: A-ს არაოფიციალური mutation run — 10/10 killed. ოფიციალური — C.
- R28-4: `create-fixtures && npm run check` EXIT 0 + `test:e2e` 7/7 და `--retries=0` 7/7 — გაშვებული; სუფთა მდგომარეობიდან (`rm -rf out test-results …`) სრული verifyCommand — **არ** გამიშვია (C).
- R28-5: **არ გაშვებულა** (C).
- R28-6: docs დაწერილია; refs code-reviewer-მა შეამოწმა. ვერდიქტი — C.

## ზუსტი შემდეგი შემოწმებები C-სთვის
1. `git status --porcelain --untracked-files=all`; `git diff --stat 6c956b4`; `git diff --quiet 6c956b4 -- . ':!src/renderer/src/lib/utils.ts' ':!src/renderer/src/stores/file-store.ts' ':!src/renderer/src/components/sidebar/FolderBrowser.tsx' ':!src/renderer/src/App.tsx' ':!tests/renderer/components/folder-read-during-save.test.ts' ':!tests/renderer/stores/file-store.test.ts' ':!tests/renderer/utils/utils.test.ts' ':!docs/bugs/001-save-and-selection-known-limits.md' ':!docs/bugs/README.md' ':!.claude/primitives/STATE_MANAGEMENT.md'`.
2. throwaway copy: 4 src ფაილი `git show 6c956b4:` + A-ს ტესტები → მოსალოდნელი 219 passed / 7 failed (სიმპტომები ზემოთ ცხრილში).
3. MR-1…MR-10 ცხრილის edit-ებით.
4. `rm -rf out test-results playwright-report tests/fixtures/*.wav` → სრული verifyCommand → `xvfb-run -a npx playwright test --retries=0`.
5. R28-5 harness (old `6c956b4` vs new), Scenario A (Rescan) და B (Open Folder); music-metadata + ffprobe.
6. docs: grep ყოველი `file:line` (D-35 bullet: `lib/utils.ts:63`, `:67-69`, `file-store.ts:132-145`, `:136`, `:141-142`, `FolderBrowser.tsx:111-118`, `:153-160`, `App.tsx:63-70`; entry 11: იგივე + `src/main/ipc/metadata.ts:289`, `:243`; shifted `file-store.ts:83-97`, `:122-130`).
