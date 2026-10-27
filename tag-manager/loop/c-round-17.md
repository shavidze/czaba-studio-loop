# C — Round 17 ვერიფიკაცია: TM-B20 (D-26)

Verifier: C · თარიღი: 2026-10-27 · HEAD `cb2d76b0b1dbb0e5e73a70ace2c8c618c0a68ffd` · A-ს working tree diff sha256 (`git diff cb2d76b | sha256sum`) ბოლოს: `d201b25d…8754`

**შედეგი: PASS, realVerified=true, 0 bug.** ყველა evidence: `c-round-17/`.

## R17-1 ownership — PASS
- `git status --porcelain --untracked-files=all` → მხოლოდ 3× `M` (`src/renderer/src/lib/file-row-display.ts`, `tests/renderer/components/file-list.test.ts`, `tests/renderer/utils/file-row-display.test.ts`), untracked არ არის.
- `git diff --stat cb2d76b` → 3 files, +100/−2 (src +4/−2, file-list +35, file-row-display test +61).
- `git diff --quiet cb2d76b -- . ':!…3 owned paths'` → exit 0.
- `git diff cb2d76b -- tests/ | grep '^-[^-]'` → ცარიელი (grep exit 1). ტესტებში მხოლოდ დამატებაა (ცალკე `import type { WavMetadata }` ხაზი, რომ არსებული import byte-identical დარჩეს).
- src diff წავიკითხე: ორი `typeof … === 'string'` guard, ზუსტად D-26-ის მიხედვით. კომენტარი, `any`, `@ts-ignore` და `as` cast არ არის. Export-ების სახელი და signature უცვლელია. `FileList.tsx`, `FieldValue` და stores უცვლელია.
- `a-round-17-result.json` → `permission_denials: []`.
- ტესტებში cast არ არის. Malformed data იქმნება `JSON.parse`-ით typed return-ის helper-ში, B-ის ინსტრუქციის მიხედვით.

## R17-2 red/green — PASS
Worktree: `git worktree add --detach /tmp/c-r17-old cb2d76b`, `node_modules` symlink, A-ს ორი ტესტ-ფაილი დაკოპირდა. A-ს tree-ს არ შევხებივარ. ბოლოს worktree წაიშალა.
- **ძველი კოდი** (`red-old.log`): exit 1, **12 failed | 31 passed (43)**.
  - (a) `{"artists":[null]}` → `TypeError: Cannot read properties of null (reading 'trim')`.
  - (a) `[5]`, `[{}]`, `[true]` → `TypeError: item.trim is not a function`.
  - (b) `[null," y "]` და (c)×2 → `reading 'trim'`.
  - (d) `[5]`/`[{}]`/`[true]`/`[{},"A"]` → `expected 'number'|'object'|'boolean' to be 'string'`.
  - (R17-e) → `expected [Function] to not throw … 'TypeError: item.trim is not a function'`. ძველზე `hasAnyTagValue` ისვრის მანამ, სანამ React-ის object-child შეცდომამდე მივა.
  - უკვე გადიოდა ძველზე: (b) `["x",null]`, (d) `[null]`, (d) `["A",null]`. ტასკი ამას უშვებს.
- **ახალი კოდი:** იგივე ორი ფაილი A-ს tree-ზე (`green-new.log`): exit 0, **2 files, 43/43**. worktree-ში A-ს src-ით (`green-worktree.log`): 43/43. სრულ gate-ში: renderer 135/135.

## R17-3 mutations — PASS (4/4 killed)
გაშვებულია throwaway worktree-ში. A-ს ფაილი ყოველი mutant-ის შემდეგ აღდგა (`cmp` OK). ლოგები: `M1.log`…`M4.log`.
| Mutant | შედეგი | Killing tests |
|---|---|---|
| M1 `item.trim()` typeof-ის გარეშე | 8 failed | (a)×4, (b) `[null," y "]`, (c)×2, (R17-e) |
| M2 `value[0] ?? ''` | 5 failed | (d) `[5]`,`[{}]`,`[true]`,`[{},"A"]`; (R17-e) — `Error: Objects are not valid as a React child (found: object with keys {})` |
| M3 `value.length > 0` | 10 failed | არსებული "array with empty string", "only blank strings", "every field is an empty default", file-list (d); ახალი (a)×4, (c) defaults, (R17-e) |
| M4 პირველი string ელემენტი სადმე (`find`) | 1 failed | (d) `[{},"A"]` |

## R17-4 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გავუშვი სრული `verifyCommand`: **exit 0**, 25 წმ (`verify.log`).
- Biome: Checked 34 files, **0 errors, 9 warnings**. სია იგივეა, რაც `cb2d76b`-ზე (`biome-old.txt` == `biome-new.txt`, `diff` ცარიელი).
- Typecheck: `tsconfig.node/web/test.json`, 0 შეცდომა.
- Renderer: **10 files, 135/135** (120 + 15). Main: **11 files, 93/93**. E2E: **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → exit 0, **7 passed** (`e2e-retries0.log`).
- Build-ში fix ჩანს: `out/renderer/assets/index-*.js` შეიცავს `typeof item==="string"&&item.trim()`-ს.

## R17-5 real app regression — PASS
აშენებული აპი (A-ს tree, `out/`) გავუშვი Playwright `_electron`-ით `xvfb-run`-ის ქვეშ, 1400×900. `sample.wav` დაკოპირდა temp საქაღალდეში ორ ფაილად, `a-target.wav` და `b-untagged.wav`. `XDG_CONFIG_HOME` იზოლირებულია. ნაბიჯები UI-ით: Open Folder (მხოლოდ dialog-ია stub-ით), row click, TagsInput (ტექსტი + Enter), Save Tags. Driver: `drive-r17-5.mjs`, შედეგი: `r17-5-result.json`, `r17-5.log`, pageErrors `[]`.
1. სკანის შემდეგ ორივე row untagged-ია: badge არ არის, artist და genre უჯრები ცარიელია. → `r17-5-1-untagged.png`
2. `a-target.wav`: Artists = `R17 Artist A`, `R17 Artist B` (2 chip), Genres = `R17Genre`, Category (UCS) = `R17Cat` → Save Tags → toast "Tags saved". → `r17-5-2-before-save.png`
3. row: `Tagged`, artist უჯრა **`R17 Artist A`** (მხოლოდ პირველი), genre **`R17Genre`**. `b-untagged.wav` უცვლელია. → `r17-5-3-after-save.png`
4. დამოუკიდებელი reader-ები (save-მდე ორივე ცარიელი იყო):
   | ველი | ffprobe `format_tags` | music-metadata |
   |---|---|---|
   | category | `ICAT: "R17Cat"` ✅ | native exif `ICAT: "R17Cat"` ✅ |
   | genre | `genre: "R17Genre"` ✅ | `common.genre: ["R17Genre"]`, native `IGNR: "R17Genre"` ✅ (+ ID3 `TCON`) |
   | artists (record only) | `artist: "R17 Artist A"`, `ISTR: "R17 Artist B"` (მხოლოდ ბოლო ISTR) | `common.artist: "R17 Artist A"`, `common.artists: ["R17 Artist A","R17 Artist B"]` (ID3v2.4 `TPE1`×2-დან); native exif `ISTR`×2 |
   - raw ბაიტებში ჩანს `IART "R17 Artist A"` და `ISTR`×2. ფაილს ასევე აქვს ID3v2.4 chunk (`TPE1`×2, `TCON`) და `IKEY: ""` ცარიელი chunk. ეს TM-B08 / C-R1-01 signal-ია და არ არის ამ რაუნდის FAIL.
   - განსხვავება B-ის ექსპერიმენტთან: music-metadata-ს აქ **აქვს** `common.artists`. ის ID3 chunk-იდან მოდის, რომელსაც აპის save ამატებს (C-R1-01).
5. Relaunch + Open Folder: row იგივეა (`Tagged`, `R17 Artist A`, `R17Genre`). editor-ში chips `R17 Artist A`, `R17 Artist B`, `R17Genre`, category `R17Cat`. → `r17-5-5-relaunch.png`

**მკაფიოდ:** malformed-element შემთხვევა (`[null]`, `[5]`, `[{}]`, `[true]`) მოწმდება **მხოლოდ** R17-2/R17-3-ით. რეალური აპიდან ის მიუღწეველია, რადგან main ყოველ ელემენტს string-ად აქცევს. რეალურ აპში malformed მნიშვნელობა არ გამიყალბებია. R17-5 მხოლოდ regression-ია well-typed მონაცემზე.

## Signal-ები B-სთვის (არა ამ რაუნდის bug)
- **A-R17-01 დადასტურდა კოდის წაკითხვით** (`src/renderer/src/stores/file-store.ts:125-127`). sort artists/genres-ით იყენებს `aVal[0] ?? ''`-ს და `.localeCompare`-ს. როცა პირველი ელემენტი number ან object-ია, `TypeError` მოხდება. იგივე კლასის defensive low-ია და რეალური აპიდან მიუღწეველია. runtime-ზე არ გამიშვია.
- Size სვეტი save-ის შემდეგ ძველ ზომას აჩვენებს (86.2 KB) rescan-მდე. relaunch-ის შემდეგ 87.6 KB-ია. როგორც ჩანს, ეს წინა რაუნდებიდან მოდის და `FileList.tsx`/stores frozen-ია. low UX signal-ია, ამ რაუნდთან კავშირი არ აქვს.

- **Process (A-ს disclosure, root/B-სთვის):** A-ს სესიაში read-primitives PreToolUse hook არ ამოქმედდა. src ფაილი Bash heredoc-ით დაიწერა და არა Edit/Write-ით. `TESTING.md`, `TYPESCRIPT_STRICT.md` და `AGENT_DISCOVERABLE_CODE.md` A-მ რედაქტირების შემდეგ წაიკითხა. C-მ diff გადაამოწმა: D-26-ის, style-ის და TS strict-ის ყველა პირობა სრულდება (R17-1). ეს hook enforcement-ის გამოტოვებაა და არა product defect. დაბლოკვა არ სჭირდება.

## BLOCKED (არა FAIL)
- Windows packaging: Windows packaging is not available in the cloud.
- Actions `Check` run: TM-T0-CI/TM-B14-ის ნაწილია, root აკავშირებს.

## Source-ის მთლიანობა
C-ს source-ში არაფერი შეუცვლია. A-ს tree ბოლოს: იგივე 3× `M`, diff sha256 `d201b25d98619a20390bc9eef24bbcbd3b4d95ecb61f07c8c41064bd78b28754`. Worktree `/tmp/c-r17-old` წაიშალა. `git worktree list` აჩვენებს მხოლოდ მთავარ tree-ს.
