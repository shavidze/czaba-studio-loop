# C — Round 21: TM-B24 / D-30 — დამოუკიდებელი ვერიფიკაცია

**ვერდიქტი: PASS**, realVerified=true, 0 ბაგი. ყველა მტკიცებულება `c-round-21/`-შია.

## R21-1 ownership + process — PASS
- HEAD `b373b08f13069b26e89192a1229e3a4a31257e3e`.
- `git status --porcelain --untracked-files=all` აჩვენებს მხოლოდ 3 `M` ფაილს: `MetadataPanel.tsx`, `metadata-panel-batch-save.test.ts`, `STATE_MANAGEMENT.md`. untracked ფაილი არ არის.
- `git diff --quiet b373b08 -- . ':!…3 owned…'` → exit 0.
- `git diff b373b08 -- tests/ .claude/ | grep '^-[^-]'` ცარიელია.
- ახალი `describe("typing while the save is pending (TM-B24, D-30)")` იწყება `:892`-ზე, TM-B23 describe-ის (`:618`) შიგნით. ის იხურება `:1137`-ზე, გარე describe კი `:1138`-ზე.
- src diff:
  - კომენტარი, `any`, `@ts-ignore` და ახალი `as` არ არის.
  - ახალი export არ არის: სამი helper module-private-ია.
  - import-ს დაემატა მხოლოდ type `FieldValue`, იმავე ხაზზე.
  - Stores, main, preload და types ხელუხლებელია.
- `STATE_MANAGEMENT.md`-ში დაემატა ერთი ხაზი D-29-ის შემდეგ, სიტყვასიტყვით task-ის ტექსტით.
- `git diff b373b08`-ის sha256 ემთხვევა A-ს `a-round-21/full.diff`-ს (`46912eb4…`). source ჩემი ფაზის დროს არ შეცვლილა.
- A-ს result JSON-ში `permission_denials: []`.
- **Transcript ხელმისაწვდომი იყო:** `~/.claude/projects/…/a7056825-….jsonl`. მასში repo-ში წერა მხოლოდ Edit tool-ით ხდება: test-ზე 2, MetadataPanel-ზე 5, STATE_MANAGEMENT-ზე 1, ყველა წარმატებული. ეს A-ს ანგარიშს ემთხვევა.
  - Bash ბრძანებები წერდნენ მხოლოდ loop folder-ში, gitignored output-ში და `/tmp/a-r21-mut`-ში.

## R21-2 red/green — PASS (`red.log`, `green.log`)
- worktree `/tmp/c-r21-old` (`b373b08`) node_modules-ის symlink-ით, მასში A-ს test ფაილით. `git stash` არ გამოიყენებოდა.
- **ძველი კოდი:** `9 failed | 39 passed (48)`. ჩავარდნები symptom-ით:
  - (y1) `expected 'A-title' to be 'TypedTitle'`
  - (y2) `expected "vi.fn()" to be called 2 times, but got 1 times`
  - (y3) `expected 'R20Cat' to be 'R21Again'`
  - (y5b) `expected [] to deeply equal [ 'G2', 'G1' ]`
  - (y6) `expected [] to deeply equal [ 'R21Tag' ]`
  - (y7) `expected +0 to be 128`
  - (y8) `expected 'A-title' to be 'BackTyped'`
  - (y9) `expected {} to deeply equal { title: 'BatchTitle' }`
  - (y10) `called 2 times, but got 1 times`
- ძველ კოდზე გადის (y4), (y5), (y11), (y12), (y13), (a)–(w), (s6) და (x1)–(x11). harness error არ ყოფილა.
- **ახალი კოდი:** `48 passed (48)`.

## R21-3 mutations — PASS (`mutants.log`, script `c-round-21/mut.py`, რომელიც ქმნის ასლს `/tmp/c-r21-mut`-ში)
- (y12)-ის setup (`:1104-1119`) `readMetadata`-ს once-რიგში აღარ აყენებს, როგორც A-მ აღნიშნა (`mockResolvedValueOnce` მხოლოდ `startSingleSave`-შია). (y12)→(y13) leak აღარ არის.
| Mutant | შედეგი | მომკვლელები |
|---|---|---|
| M1 merge-ის გარეშე | killed (9 failed) | (y1) (y2) (y3) (y5b) (y6)–(y10) |
| M2 value compare-ის გარეშე | killed (11) | (y1) (y4) (y5) (y5b) (y6) (y7) (y9) (y10) (c) (d) (u) |
| M3 მასივები reference-ით | killed (1) | (y5) |
| M4 მთელი editingMetadata-ს merge | killed (14) | (y8), (x10) და სხვები |
| M5 batch-ში merge-ის გარეშე | killed (2) | (y9) (y10) |
| M6 snapshot await-ების შემდეგ | killed (9) | (y1) … |
| M7 merge setEditingMetadata-მდე | killed (9) | (y1) … |
| M8 skipSyncRef არ ყენდება, როცა typed key-ები არსებობს (single + batch) | **survived (48/48), მოსალოდნელი equivalent** | — |

M8-ის მიზეზი: `mergeFields`-ის შემდეგ `isDirty=true` და `editingMetadata` არაცარიელია. sync effect ხედავს `!selectionChanged && isDirty && hasEditingData` და return-ს აკეთებს, ამიტომ საბოლოო მდგომარეობა იგივეა. ეს run-მა დაადასტურა.

## R21-4 gate — PASS (`verify.log`, `e2e-retries0.log`, `biome-old.txt`, `biome-new.txt`)
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand` → **exit 0**, ~27 s.
- Biome: 0 error, 9 warning. ფაილებისა და წესების სია იდენტურია `b373b08`-ისა (diff ცარიელია, ხაზების ნომრების გარეშე შედარებით). მასში 2 `useExhaustiveDependencies` warning-ია, და არცერთი MetadataPanel-ში.
- typecheck 0.
- Renderer **187/187** (10 ფაილი, 173+14). Main **93/93**. E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0.

## R21-5 real app — PASS (`drive-r21-5.mjs`, `delay-write.cjs` (R20-ის ასლი), `r21-5-new.json`, `r21-5-old.json`, screenshots `r21-5-*.png`)
- Built app გაეშვა Playwright `_electron`-ით `xvfb-run`-ში, args `--no-sandbox -r c-round-21/delay-write.cjs out/main/index.js`. `meta:write` და `meta:write-batch` დაყოვნებულია 3000 ms-ით.
- folder dialog stub-ირებულია. `sample.wav` დაკოპირდა როგორც a/b/c.wav. აკრეფა ხდება ნამდვილი keystroke-ებით (`keyboard.type`, 30 ms).

| ნაბიჯი | დრო (Save → ბოლო keystroke / → toast) | შედეგი |
|---|---|---|
| 1 a.wav Category `R21A`, Save, აკრეფა Comment `R21Typed` | 551 ms / 3101 ms | აკრეფა toast-მდე დასრულდა |
| 2 ფორმა | — | Category `R21A`, Comment `R21Typed`, `Save Tags` **enabled** ✔ |
| 3 მეორე Save | toast `Tags saved` | ორივე მნიშვნელობა დარჩა, Save disabled ✔ |
| 4 b.wav Category `R21B`, Save → a.wav → b.wav, Title `R21Back` | 887 ms / 3049 ms | ფორმა: b.wav, Title `R21Back`, Category `R21B`, Save enabled ✔. ხელახალი Save → `Tags saved`, disabled ✔. `Unsaved changes were discarded` გამოჩნდა a.wav-ზე click-ისას (მოსალოდნელია, B-R19-01) |
| 5 b+c batch Category `R21Batch`, `Save to 2 files`, Copyright `R21Copy` | 502 ms / 3076 ms | toast `Tags saved to 2 files`. Copyright `R21Copy`, Category `""`, `Save to 2 files` enabled ✔. მეორე batch Save → `Tags saved to 2 files`, disabled ✔ |
| 6 c.wav Comment `R21C`, Save (აკრეფის გარეშე) | `Tags saved` | `R21C`, disabled. `Unsaved changes` toast არ გამოჩენილა ✔ |

**ნაბიჯი 7, დამოუკიდებელი reader-ები (ffprobe `format_tags` / music-metadata):**
| ფაილი | ffprobe | music-metadata |
|---|---|---|
| a.wav | comment `R21Typed`, ICAT `R21A` | comment `R21Typed`, ICAT (`exif:ICAT`) `R21A` |
| b.wav | title `R21Back`, ICAT `R21Batch`, copyright `R21Copy` | title `R21Back`, ICAT `R21Batch`, copyright `R21Copy` |
| c.wav | comment `R21C`, ICAT `R21Batch`, copyright `R21Copy` | comment `R21C`, ICAT `R21Batch`, copyright `R21Copy` |

- Artists (record only, TM-B08): ის ველი არ შეცვლილა და ორივე reader-ში ცარიელია.
- `pageErrors` ცარიელია ყველა ფაზაში.

**ნაბიჯი 8, red reference (`b373b08` build, იგივე harness, ნაბიჯები 1, 2 და 7):**
- ბოლო keystroke 548 ms-ზე, toast 3081 ms-ზე.
- ფორმა `Tags saved`-ის შემდეგ: Comment `""`, Category `R21A`, `Save Tags` **disabled**. ბაგი რეალურია.
- a.wav-ზე ffprobe და music-metadata აჩვენებს მხოლოდ ICAT `R21A`-ს, comment `R21Typed` არ არის.
- ნაბიჯი 3 ძველ build-ზე ვერ გაეშვება, რადგან Save disabled-ია. ეს თავად symptom-ია და არა harness-ის პრობლემა.
- Screenshot-ების შედარება: `r21-5-new-2-after-tags-saved.png` (Comment `R21Typed`) და `r21-5-old-2-after-tags-saved.png` (Comment ცარიელი).

**Harness შენიშვნა:** პირველ ახალ run-ში ჩემმა reader helper-მა music-metadata-ს `exif:` namespace (RIFF INFO) გამოტოვა. შედეგად 7-a/b/c false იყო, თუმცა ffprobe ყველა მნიშვნელობას აჩვენებდა.
- ეს run შენახულია: `r21-5-new-run1-harness-bug.json`. ის ძველმა `nat()` helper-მა შექმნა.
- შენახული `drive-r21-5.mjs` უკვე გასწორებული ვერსიაა (`m[`exif:${id}`]`). მისგან მიღებულია `r21-5-new.json` და `r21-5-old.json`.
- helper გასწორდა და მთელი ნაბიჯები 1–7 ხელახლა გაეშვა ახალ ფაილებზე. შედეგი ყველგან PASS-ია. ეს ჩემი harness-ის ბაგი იყო და არა აპლიკაციის.

## დაკვირვებები (ბაგი არ არის)
- **C-R21-01 (info):** ნაბიჯ 4-ში a.wav-ზე გადასვლისას ჩანს `Unsaved changes were discarded`, თუმცა b-ს ცვლილებები იწერება. ეს უცვლელია და უკვე Saba-ს კითხვაა (B-R19-01 / RR-R20-01).
- **C-R21-02 (info):** `Tags saved` toast ~3 s ფარავს Save ღილაკს (`r21-5-new-2-after-tags-saved.png`). ეს არსებული C-R15-01-ია, ახალი არ არის.
- A-ს qa-engineer-ის შენიშვნები A-R21-01…04 B-მ backlog-ში უნდა შეიყვანოს. D-30-ის ფარგლებში ისინი FAIL-ს არ იწვევს.

## Blocked
- Windows packaging is not available in the cloud (build:win / NSIS). ეს ამ რაუნდის ნაწილი არ არის.
