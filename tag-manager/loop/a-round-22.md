# A — Round 22: TM-B25 / D-31 — Shift-click anchor გადარჩება save-ს, sort-ს და search-ს

თარიღი: 2026-10-27 · Implementer: A · Baseline HEAD `601dc4aad7e9416b8f3c690ba5ec68cccb98490d` (pre-flight-ზე `git status --porcelain` ცარიელი იყო).

## შეცვლილი ფაილები (მხოლოდ owned)
| ფაილი | სტატუსი | რა |
|---|---|---|
| `src/renderer/src/components/file-list/FileList.tsx` | M | anchor = file path (`useRef<string \| null>(null)`); Shift-click-ზე lookup rendered `useFilteredFiles()` სიაში (`findIndex`, მხოლოდ `shiftKey`-ზე); ვერ მოიძებნა → Ctrl toggle / plain select; ყოველი click ბოლოს `anchorPathRef.current = file.path`; `useEffect([hasSelection])` წმენდს anchor-ს, როცა selection ცარიელია; ძველი index reset effect და `searchQuery`/`sortField`/`sortDirection` selector-ები წაშლილია. `FileRow` module-private რჩება, props: `visibleFiles` (memoised `files` მასივი, ახალი memo არ არის), `anchorPathRef`. |
| `tests/renderer/components/file-list.test.ts` | M | ერთი ახალი `describe("FileList Shift-click anchor (TM-B25, D-31)")` ფაილის ბოლოს, (z1)–(z11); პირველ import ხაზს დაემატა `act`. სხვა არსებული ხაზი არ შეცვლილა (`git diff tests/ \| grep '^-[^-]'` → მხოლოდ import ხაზი). |

`git status --porcelain --untracked-files=all` → მხოლოდ ეს 2 `M`, untracked არაფერი. Store-ები, Toolbar, MetadataPanel, docs, `.claude` — შეუხებელი. src diff-ში: კომენტარი, `any`, `@ts-ignore`, ახალი `as`, ახალი export — არცერთი (grep-ით შემოწმდა). Diff: `a-round-22/full.diff` (`src.diff` — მხოლოდ src).

## Red (601dc4a src, ახალი ტესტებით) — `a-round-22/red.log`
`npx vitest run -c vitest.config.renderer.ts tests/renderer/components/file-list.test.ts` → **6 failed / 13 passed (19)**.
- **Primary red (TM-B25 სიმპტომი — მხოლოდ დაკლიკული ფაილი):**
  - (z2) `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`
  - (z3) `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`
  - (z4) `expected [ 'e.wav' ] to deeply equal [ 'b.wav', 'c.wav', 'd.wav', 'e.wav' ]`
  - (z5) `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`
  - (z11) `expected [ 'd.wav' ] to deeply equal [ 'a.wav', 'd.wav' ]`
- **ახალი D-31 ქცევა (არა TM-B25 სიმპტომი):** (z8) `expected [ 'a.wav', 'b.wav', 'c.wav' ] to deeply equal [ 'c.wav' ]`.
- **Pin-ები 601dc4a-ზე გადიან:** (z1), (z6), (z7), (z9), (z10), და ძველი 8 ტესტი ((a)–(f), (R17-e), (R18-e)).
- ყველაფერი ზუსტად ემთხვევა task-ის ცხრილს; expectation არ შეცვლილა.

## Green — `a-round-22/green.log`
იგივე ბრძანება fix-ის შემდეგ → **19 passed (19)**.

## src diff (`git diff 601dc4a -- src`)
```diff
@@ FileRow props
-  lastClickRef,
+  visibleFiles,
+  anchorPathRef,
 }: {
   file: WavFileEntry;
   index: number;
-  lastClickRef: React.MutableRefObject<number>;
+  visibleFiles: WavFileEntry[];
+  anchorPathRef: React.MutableRefObject<string | null>;
@@ handleClick
-      if (e.shiftKey && lastClickRef.current >= 0) {
-        selectRange(lastClickRef.current, index);
+      const anchorPath = anchorPathRef.current;
+      const anchorIndex =
+        e.shiftKey && anchorPath !== null
+          ? visibleFiles.findIndex((visibleFile) => visibleFile.path === anchorPath)
+          : -1;
+      if (anchorIndex >= 0) {
+        selectRange(anchorIndex, index);
       } else if (e.ctrlKey || e.metaKey) {
         toggleSelection(file.path);
       } else {
         setSelectedPaths([file.path]);
       }
-      lastClickRef.current = index;
+      anchorPathRef.current = file.path;
     },
-    [file.path, index, toggleSelection, setSelectedPaths, selectRange, lastClickRef],
+    [file.path, index, visibleFiles, toggleSelection, setSelectedPaths, selectRange, anchorPathRef],
@@ FileList
-  const searchQuery = useFileStore((s) => s.searchQuery);
-  const sortField = useFileStore((s) => s.sortField);
-  const sortDirection = useFileStore((s) => s.sortDirection);
-  const lastClickRef = useRef(-1);
+  const hasSelection = useFileStore((s) => s.selectedPaths.length > 0);
+  const anchorPathRef = useRef<string | null>(null);
 
   useEffect(() => {
-    lastClickRef.current = -1;
-  }, [files, searchQuery, sortField, sortDirection]);
+    if (!hasSelection) anchorPathRef.current = null;
+  }, [hasSelection]);
@@ rows
-          <FileRow key={file.path} file={file} index={i} lastClickRef={lastClickRef} />
+          <FileRow
+            key={file.path}
+            file={file}
+            index={i}
+            visibleFiles={files}
+            anchorPathRef={anchorPathRef}
+          />
```
სრული diff (ტესტების ჩათვლით): `a-round-22/full.diff`.

## Biome — before / after
- Before (`biome-before.txt`): 0 error, **9 warnings** — FileList.tsx:75 useKeyWithClickEvents, **FileList.tsx:107 useExhaustiveDependencies**, TagsInput.tsx:45 noLabelWithoutControl, AudioPlayer.tsx:138 useKeyWithClickEvents, FolderBrowser.tsx:213 useKeyWithClickEvents, TemplatePicker.tsx:195 noLabelWithoutControl, input.tsx:13 noLabelWithoutControl, select.tsx:13 noLabelWithoutControl, toast.tsx:12 useExhaustiveDependencies.
- After (`biome-after.txt`): 0 error, **8 warnings** — იგივე სია `FileList.tsx useExhaustiveDependencies`-ის გარეშე (FileList.tsx useKeyWithClickEvents ახლა :82-ზეა, იგივე წესი/ელემენტი). ახალი წესი ან ფაილი არ გამოჩნდა.
- შუალედში ერთხელ formatter-მა deps მასივის multi-line ფორმატი უარყო; ერთ ხაზზე გადავწერე Edit-ით.

## Gate (ბოლო ტესტ-ედიტის შემდეგ) — `a-round-22/verify.log`, `a-round-22/e2e-retries0.log`
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), სრული `verifyCommand`:
  `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **exit 0**.
  - Fixtures created successfully;
  - Biome 0 error / 8 warnings; typecheck 0;
  - Renderer **198/198** (10 files); Main **93/93** (11 files);
  - E2E **7/7** (6.6 s).
- `xvfb-run -a npx playwright test --retries=0` → **7 passed** (3.1 s), exit 0.

## qa-engineer (read-only regression, bugfix rule)
- გაუშვა: file-list.test.ts 19/19, სრული renderer 198/198, mutant `/tmp` ასლში (anchor-clear effect გამორთული) → (z7) და (z8) ვარდება.
- დაადასტურა: open/close/rescan (`FolderBrowser.tsx:102,129,138`, `App.tsx:47`) `clearSelection()`-ს იძახებს → anchor იწმინდება; Ctrl-deselect ბოლო row → effect render-ის შემდეგ წმენდს (deviation 3); D-29 toast-ს false positive არ აქვს; deps სრულია; double-click უცვლელია.
- Low დაკვირვებები (არა ბაგი ამ რაუნდის scope-ში):
  1. **A-R22-01 / low / open** — Select All → Shift-click: anchor-ის გარეშე selection ერთ row-მდე იკუმშება, anchor-ით არაფერი იცვლება — deviation 2-ის შედეგი (range ემატება), B-R21-02 Saba-ს კითხვას ეკუთვნის.
  2. **A-R22-02 / low / open** — anchor იწმინდება მხოლოდ non-empty → empty გადასვლაზე; clear+reselect ერთ batch-ში anchor-ს დატოვებდა. ასეთი კოდი დღეს არ არსებობს.
  3. **A-R22-03 / info / open** — FileList ახლა re-render-დება selection empty↔non-empty გადასვლაზეც; `findIndex` O(n) მხოლოდ Shift-click-ზე; rows-ს ერთი, უკვე memoised `files` მასივი გადაეცემა (per-row O(n) გადათვლა არ არის).
- code-reviewer: არ გაშვებულა (2 ფაილი, task-ით optional).

## პროცესის განცხადება
- Primitives წავიკითხე პირველ edit-მდე, 12:42:56 UTC: `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`.
- read-primitives hook **არ ამოქმედდა** (არცერთი Edit არ დაიბლოკა, კონტექსტში inject არ ჩანს).
- რეპოზიტორიაში ყველა ჩაწერა Edit tool-ით (test: 3 Edit, src: 5 Edit). Bash-ით რეპოში არაფერი ჩაწერილა, გარდა gitignored output-ისა (`out/`, `test-results/`, `tests/fixtures/*.wav`, `playwright-report/`). Logs → loop folder `a-round-22/`.
- commit/push/install — არა. `git stash` არ გამოყენებულა.

## Acceptance (რა გავიარე რეალურად)
- R22-1: A-ს მხარე შესრულებულია (2 owned `M`, import-only removal, ერთი describe ბოლოს, src hygiene) — საბოლოო PASS C-ისაა.
- R22-2: red/green A-მ რეალურად გაუშვა (ზემოთ). C-ის worktree-ით გამეორება — C.
- R22-3: mutation-ები A-ს არ გაუშვია (გარდა qa-engineer-ის M3-ის მსგავსი mutant-ისა) — C.
- R22-4: გაშვებულია, ყველა რიცხვი ემთხვევა (198/93/7, 7/7 retries=0, Biome 8).
- R22-5: real app / ffprobe / music-metadata — **A-ს არ გაუშვია**, realVerified ამ ნაწილზე C-ზეა.

## C-სთვის შემდეგი შემოწმებები
1. `git diff --quiet 601dc4a -- . ':!src/renderer/src/components/file-list/FileList.tsx' ':!tests/renderer/components/file-list.test.ts'`.
2. R22-2 worktree red: 6 fail (z2–z5, z11 სიმპტომი; z8 ახალი ქცევა), 13 pass; green 19.
3. R22-3 M1–M6. შენიშვნა M4/M5-ზე: lookup ხდება მხოლოდ `e.shiftKey && anchorPath !== null` შემთხვევაში; miss → `-1` → Ctrl/plain branch.
4. R22-4 სუფთა მდგომარეობიდან.
5. R22-5 real app ნაბიჯები 1–7, red reference 601dc4a build-ზე.

## ცნობილი ხარვეზები
- Real-app (R22-5) და mutation (R22-3) A-ს მიერ არ შემოწმებულა.
- Deviations 1–3 განზრახ დატოვებულია (B-R21-02 Saba-ს კითხვა).
