# A — Round 32 report: TM-B34 / D-39 (გვიანი re-read-ები folder-ის შეცვლის შემდეგ)

STATUS: DONE (review findings section ქვემოთ)

## Baseline
- HEAD `7355d78cecfd24bc895c29b3cc84b8e905283d58`, working tree სუფთა იყო round-ის დაწყებისას (`git status --porcelain --untracked-files=all` ცარიელი).

## შეცვლილი ფაილები (მხოლოდ owned paths)
| ფაილი | ცვლილება |
|---|---|
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | import `isFolderLoadCurrent`; `isListedPath` (60-62); single `if (isListedPath(path)) updateFileMetadata(path, updated);` (158); batch filter 3 ხაზად (186-188); `const loadId = useFileStore.getState().folderLoadId;` (217); `if (!isFolderLoadCurrent(loadId)) return;` (235) |
| `src/renderer/src/App.tsx` | ერთი guard ხაზი 55 schema-ს ლოდინის loop-ში |
| `tests/renderer/components/reread-after-folder-switch.test.ts` (ახალი, untracked) | (v1)–(v9); byte-identical B-ს `b-round-31-exp/b-r32-reread.test.ts.txt`-თან (`diff` ცარიელი) |
| `tests/renderer/components/folder-read-overlap.test.ts` | (o17), (o18) ბოლოში, მხოლოდ დამატება |
| `tests/renderer/stores/file-store.test.ts` | ხაზები 2–3 → `import { isFolderLoadCurrent, useFileStore } from "~/stores/file-store";` |
| `docs/bugs/001-save-and-selection-known-limits.md` | ჩანაწერი 15, D-39 bullet, header, entry 14 pointer + (o17)/(o18) სრული სახელები, line shifts |
| `docs/bugs/README.md` | row 001: `ცნობილი შეზღუდვების სია (15 ჩანაწერი; 7 გასწორდა, 5 მათგანი Saba-ს კითხვაა)` |
| `.claude/primitives/STATE_MANAGEMENT.md` | ერთი D-39 ხაზი D-38-ის შემდეგ (Edit tool, path (b)) |

- src diff-ის `+`/`-` ხაზები იდენტურია B-ს `prototype.diff.txt`-ისა (შედარებულია `diff`-ით).
- ყველა repository ფაილი Edit/Write tool-ით შეიცვალა; Bash-ით repository-ში არაფერი დაწერილა (Bash მხოლოდ ტესტებს, grep-ს და loop folder-ის ლოგებს).
- frozen ფაილები (`file-store.ts`, `FolderBrowser.tsx`, `utils.ts`, `types/**`, `src/main/**`, helpers, setup, e2e, …) არ შეხებია: `git status` მხოლოდ ზემოთ ჩამოთვლილ 8 path-ს აჩვენებს.

## Red run (baseline src, ახალი ტესტებით) — `a-round-32/red-run.log`
**260 passed / 8 failed of 268, 15 files.** (v5), (o17), (o18) მწვანე. პირველი ჩავარდნილი assertion (ყველა სიმპტომია, არა setup):
| ტესტი | ხაზი | assertion |
|---|---|---|
| (v1) | 154 | `metadata` შეიცავს stray `/fa/a.wav` (R32Cat) + `/fb/b.wav` |
| (v2) | 174 | `metadata` შეიცავს `/fa/a.wav`, `/fa/a2.wav` (R32Cat) + `/fb/b.wav` |
| (v3) | 190 | Close-ის შემდეგ `metadata` = `{ /fa/a.wav: R32Cat }`, მოსალოდნელი `{}` |
| (v4) | 213 | `/fa` reject-ის შემდეგ `metadata` = `{ /fa/a.wav: R32Cat }` (stray entry kept by D-36) |
| (v6) | 252 | `metadata` = A-ს map (`/fa/a.wav`, `/fa/a2.wav`), არა `{b}` |
| (v7) | 270 | toast `Failed to read 2 files`, მოსალოდნელი null |
| (v8) | 284 | Close-ის შემდეგ `metadata` = A-ს map |
| (v9) | 306 | `scanFolder` calls `["/fb", "/fa"]`, მოსალოდნელი `["/fb"]` |

## Green — ჩემ მიერ რეალურად გაშვებული
- renderer suite: **268/268, 15 files** (`a-round-32/green-run.log`).
- თითოეული ახალი ტესტი ცალკე `-t`-ით: (v1)–(v9), (o17), (o18) — თითო `1 passed | 267 skipped` (`a-round-32/alone.log`).
- სრული `verifyCommand` სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`): **EXIT 0** (`a-round-32/gate.log`):
  - `Fixtures created successfully`;
  - Biome: 0 errors, **8 warnings** — იგივე სია, რაც `c-round-31/biome-new.txt` (`a-round-32/biome-warn.txt`, ფაილი+rule-ით შედარებული);
  - typecheck (node + web + test tsconfig) 0;
  - renderer **268/268**, main **93/93**;
  - E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7**, EXIT 0 (`a-round-32/e2e-retries0.log`).

## Line map (before → after)
**MetadataPanel.tsx:** old 1–59 → უცვლელი (import ხაზი 7 თავის ადგილზე); old 60–181 → +4; old 182 (1 ხაზი) → 186–188; old 183–210 → +6; old 211–227 → +7; old ≥228 → +8.
კონკრეტულად docs-ში: 106-107→110-111, 116→120, 140→144, 144→148, 155→159, 162-164→166-168, 170→174, 177→181, 209-254→215-262, 219→226, 221→228, 232→240, 239-242→247-250, 239-243→247-251, 243→251, 247→255, 249→257, 252→260; 48 უცვლელი. ახალი: `isListedPath` 60-62, single use 158, batch filter 186-188, `loadId` 217, guard 235.
**App.tsx:** old 1–54 უცვლელი; ახალი guard 55; old ≥55 → +1. docs-ში: 59→60, 65-81→66-82, 75→76, 78→79, 79-81→80-82, 82-84→83-85, 85-91→86-92, 86→87, 93→94; 44 უცვლელი.
- ყოველი `MetadataPanel.tsx`/`App.tsx` ref (bare `:N`-ის ჩათვლით) შემოწმდა სკრიპტით (`/tmp/a32/refs.py`, read-only): ყველა აღწერილ კოდზე მიუთითებს. `FileList.tsx`, `FolderBrowser.tsx`, `file-store.ts`, `metadata-store.ts`, `utils.ts`, `src/main` refs არ შეცვლილა (`metadata.ts:289`, `:243` — main ფაილი, ხელუხლებელი).
- grep: (v1)–(v9), (o17), (o18) თითოეული სრული სახელი docs ფაილში ზუსტად 1-ჯერ, ტესტებში 1-ჯერ.

## Known gaps / შენიშვნები
- R32-5 (real app, old vs new build, harness), R32-2-ის throwaway-copy red run და R32-3 მუტანტები C-ის საქმეა; მე red run baseline src-ზე working tree-ში გავაკეთე src-ის შეცვლამდე, არა ცალკე copy-ში.
- `isListedPath` batch `.filter`-ში O(files × paths) — task-ის მიხედვით reviewer nit, არა scope.
- reverse race (schema ცვლილებამდე დაწყებული folder load, რომელიც schema re-read-ის შემდეგ სრულდება) — არ შემოწმებულა, task-ის მიხედვით scope-ის გარეთ.
- Windows packaging: BLOCKED — Windows packaging is not available in the cloud.

## C-სთვის შემდეგი შემოწმებები
1. R32-1: `git status --porcelain --untracked-files=all`; `git diff --stat 7355d78`; `git diff --quiet 7355d78 -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!src/renderer/src/App.tsx' ':!tests/renderer/components/folder-read-overlap.test.ts' ':!tests/renderer/stores/file-store.test.ts' ':!docs/bugs/001-save-and-selection-known-limits.md' ':!docs/bugs/README.md' ':!.claude/primitives/STATE_MANAGEMENT.md'`.
2. R32-2: throwaway copy, `git show 7355d78:` ორი src ფაილი + ჩემი ტესტები → 260/8; შემდეგ A-ს tree 268/268.
3. R32-3: SM-1…SM-9 (`b-round-31-exp/mut.py.txt`) ექვს ფაილზე.
4. R32-4: სრული verifyCommand + `--retries=0`.
5. R32-5: real app V / SC / SJ ორივე build-ზე, ffprobe + music-metadata.
6. R32-6: docs refs (`/tmp/a32/refs.py`-ის ანალოგი), grep counts, README row, STATE_MANAGEMENT ხაზი.

## Acceptance, რომელიც მე რეალურად გავიარე (A-ს მხარე, არა C-ის verdict)
- R32-1 (ownership/process): self-check გავლილია.
- R32-2: red 260/8 (baseline src, working tree) და green 268/268 + თითო ტესტი ცალკე — გაშვებული.
- R32-4: verifyCommand EXIT 0 + `--retries=0` 7/7 — გაშვებული.
- R32-6: refs სკრიპტით და grep-ით self-check.
- R32-3 და R32-5: **არ გამიშვია** (C).

## Review (code-reviewer + qa-engineer, ორივე დასრულდა)
code-reviewer: blocking finding არ არის; style/TS strict (no any/ts-ignore/new `as`/comments, semicolons, single quotes) OK; docs refs შეამოწმა და ემთხვევა. qa-engineer: renderer 268/268 თავისი გაშვებით; D-35 (r1–r8), D-29/D-30, D-33/D-34 (s1–s15), batch toasts — რეგრესია არ არის.

src-ში არაფერი შემიცვლია review-ის შემდეგ: task მოითხოვს, რომ src diff იყოს ზუსტად D-39 (`skipSyncRef` უცვლელი), ხოლო reverse race task-ში scope-ის გარეთაა მოხსენიებული. ამიტომ ეს ორი შემთხვევა B-სთვის **proposal**-ად ჩავწერე:
- **A-R32-01 (medium hypothesis, ორივე reviewer, დაუდასტურებელი):** schema re-read, რომელიც ახალი folder load-ის დაწყების **შემდეგ** იწყება (`beginFolderLoad` უკვე გაეშვა, მაგრამ `files` ჯერ კიდევ ძველია, scan ჯერ არ დასრულებულა), ძველი folder-ის path-ებს კითხულობს, და მისი `loadId` მიმდინარეა. როცა B-ს load სრულდება და ამის შემდეგ A-ს chunk-ები resolve-დება, `setMetadata(accumulated)` (`MetadataPanel.tsx:251`) B-ს `metadata`-ს A-ს entry-ებით ცვლის. ეს task-ში მოხსენიებული reverse race-ის ვარიანტია. შესაძლო fix-ები: `:235`-ზე დამატებით `useFileStore.getState().files !== allFiles` შემოწმება, ან ადრე დაბრუნება, როცა `isScanning` true-ა. შესაძლო ტესტი: (v10) — v6-ის მსგავსი, ოღონდ Done დაჭერილია `beginFolderLoad`-ის შემდეგ და `setFiles(B)`-მდე.
- **A-R32-02 (low hypothesis, ორივე reviewer, დაუდასტურებელი):** single save-ში `skipSyncRef.current = true` (`:157`) ისევ დგება, როცა `selectionUnchanged` true-ა, მაშინაც კი, როცა `isListedPath` false-ია და `updateFileMetadata` გამოტოვებულია. ასე ჩერჩეტი skip-ი შეიძლება დარჩეს და შემდეგი non-selection sync ერთხელ გადაიყლაპოს. მიღწევა: Open Folder B, scan-ის დროს X-ზე ხელახლა click A-ს list-ში, `setFiles(B)`, შემდეგ save-ის re-read. შედეგი ერთი გამოტოვებული sync-ია, დისკზე ცვლილება არ არის. შესაძლო fix: `if (selectionUnchanged && isListedPath(path)) skipSyncRef.current = true;` (batch-ის `savedEntries.length > 0` guard-ის მსგავსად).
- შენიშვნები: (v9) timing-ზე დამოკიდებულია (`waitMs(20)`/`waitMs(150)` 50 ms poll-ის მიმართ), ნელ CI-ზე შეიძლება flaky გახდეს. (v1)–(v3) success toast-ს folder-ის შეცვლის შემდეგაც აფიქსირებს: write მართლაც შესრულდა, ასე რომ ეს მიზანშეწონილია. pre-existing: Rescan/Open, დაწყებული schema-ს ცვლილებამდე, ძველი schema-თი წაკითხულ შედეგს წერს (D-39-მდეც არსებობდა).

## საბოლოო ownership check (subagent-ების შემდეგ)
`git status --porcelain --untracked-files=all` აჩვენებს მხოლოდ 7 შეცვლილ owned ფაილს და ერთ untracked `tests/renderer/components/reread-after-folder-switch.test.ts`-ს. 7 owned path-ის გარეთ `git diff --quiet 7355d78` → exit 0.
