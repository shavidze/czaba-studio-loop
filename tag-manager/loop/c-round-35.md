# C — Round 35 ანგარიში: TM-B37 (D-42, D-43)

**სტატუსი: PASS.** R35-1…R35-6 ყველა გავიდა, realVerified=**true**. ორივე build რეალურ Electron app-ში გაეშვა (P/PB/X/N + idle look), ფაილები შემოწმდა sha256-ით, ffprobe-ით და music-metadata-თი.
- Baseline: HEAD `3035ffca98bbb8af4020c3a799b0d5b20515dacf`. release commit-ი არ არის.
- Source fingerprint (`git diff 3035ffc` + ახალი test) დასაწყისში და ბოლოს ერთნაირია: `1146314b…2d66` (`c-round-35/fingerprint-start.txt`, `fingerprint-end.txt`). C-მ source არ შეცვალა.
- Evidence ფოლდერი: `c-round-35/`. throwaway copy-ები: `/tmp/c35/{red,old,new,mut}`.
- Windows packaging: BLOCKED, Windows packaging is not available in the cloud. ამ round-ის ნაწილი არ არის.

## R35-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all` აჩვენებს 4 `M`-ს (SchemaEditor.tsx, MetadataPanel.tsx, docs/bugs/001…, docs/bugs/README.md) და 1 `??`-ს (`tests/renderer/components/schema-editor-done-busy.test.ts`). `git diff --quiet 3035ffc -- . ':!<owned>'` → exit 0.
- `git diff -w 3035ffc -- src/`:
  - `SchemaEditor.tsx` შეიცავს ზუსტად D-42-ს: `isApplying` state `:45`-ზე, უშუალოდ `}, []);`-ის შემდეგ; `handleSave` ზუსტად task-ის ტექსტით, deps `[fields, onSave, onClose]`; wrapper `flex-1 overflow-y-auto p-3`; `<fieldset disabled={isApplying} className="min-w-0 space-y-4 disabled:opacity-60">` open/close; Done-ის `disabled={isApplying || fields.length === 0}` და label.
  - `MetadataPanel.tsx` შეიცავს ზუსტად D-43-ის 4 ხაზს.
- fieldset-ის შიგთავსი (ახალი `:166-270`) 2 space-ის მოშორების შემდეგ byte-identical-ია ძველ `:157-261`-თან. ესე იგი non-`-w` diff მხოლოდ indent-ით განსხვავდება.
- Done-ს `aria-*` არ აქვს (DOM-შიც `ariaAttrs: []`). comment, `any`, `@ts-ignore` და custom CSS არ არის. ` as `-ის რაოდენობა უცვლელია: SchemaEditor 3/3, MetadataPanel 2/2.
- ახალ test-ში `screen.getByRole` არ არის: buttons იძებნება `buttonByText`-ით, ანუ `querySelectorAll`-ით. ყველა import და helper გამოიყენება.
- Bash-ით repo-ში ჩაწერა: **unknown**, რადგან A-ს transcript არ მაქვს (A აცხადებს Edit/Write-ს). FAIL არ არის.

## R35-2 red → green — PASS
- **Red** (`/tmp/c35/red` = `3035ffc` archive + A-ს test, `r35-2-red.log`): **284 passed / 3 failed (287), 18 files + 1 Unhandled Rejection.** პირველი failing assertion თითოეულისთვის:
  - (b1) `expect(element).toBeDisabled()` @ `:163:18`. Done disabled არ არის, ეს სიმპტომია.
  - (b2) `expected 3 to be 2` @ `:182:37`. `b`-ის reads რაოდენობაა.
  - (b5) `metadata` deep-equal @ `:240:46`. `qtwo` აკლია.
  - (b4) Unhandled Rejection `Error: reread failed` @ `:204:47` via `SchemaEditor.tsx:138:11`. Vitest მას (b4)-ს მიაწერს.
  - (b3) და (b6) green-ია.
- **Green** (`/tmp/c35/new`, `r35-2-green.log`): **287/287, 18 files**, unhandled error არ არის.
- **ცალკე** (`-t "^.*\(bN\) "`, `r35-2-alone.log`): (b1) 260 ms, (b2) 247 ms, (b3) 300 ms, (b4) 119 ms, (b5) 309 ms, (b6) 306 ms. ყველა < 1 s.

## R35-3 mutations — PASS
- `mutants.log`; script `c-round-35/mut.py`, cwd `/tmp/c35/mut`, ზუსტი edit-ები `mutants/*.diff`-შია.
- ექვსი task-ის ფაილის გარდა გაეშვა C-ის probe ფაილიც `c-probes.test.ts.txt` ((k1), (k2)). ის მხოლოდ copy-შია, repo-ში არა.
- ბოლოს `diff -r new/src mut/src` ცარიელია.

| mutant | edit | შედეგი |
|---|---|---|
| BM-0 control | — | 49/49 pass |
| BM-1 | `disabled={fields.length === 0}` | killed (b1)(b2) |
| BM-2 | `<fieldset disabled={false}` | killed (b1) |
| BM-3 | catch → მხოლოდ `return;` | killed (b4) |
| BM-4 | label `Done` | killed (b1) |
| BM-5 | `setIsApplying(true);` წაშლილი | killed (b1)(b2) |
| BM-6 | `setIsApplying(false);` `onClose()`-მდე წაშლილი | 6 ფაილში **survives**; killed მხოლოდ C probe (k2)-ით (standalone `SchemaEditor`, no-op `onClose`) |
| BM-7 (C) | catch-ში `return` წაშლილი (fall-through `onClose`-ზე) | killed (b4) |
| BM-8 (C) | catch: `setIsApplying(false)` mounted check-ის გარეშე | survives — ეკვივალენტური |
| BM-9 (C) | `disabled:opacity-60` წაშლილი | survives — მხოლოდ style; R35-5 P ამოწმებს (`opacity: 0.6`) |
| BM-10 (C) | try/catch წაშლილი | killed (b4) + Unhandled error |
| BM-11 (C) | `setIsApplying(true)` `await`-ის შემდეგ | killed (b1)(b2) |
| DM-8 | id guard წაშლილი | killed (b5)(k1) |
| DM-9 | id ლოდინის შემდეგ | survives — ეკვივალენტური (იხ. ქვემოთ, (k1) green) |
| DM-10 | guard უშუალოდ ლოდინის შემდეგ | killed (b5)(k1) |
| DM-11 (C) | id guard `isFolderLoadCurrent` guard-ის შემდეგ | survives — ეკვივალენტური |
| DM-12 (C) | `!==` → `<` | survives — ეკვივალენტური |
| DM-13 (C) | `+= 1` წაშლილი | killed (b5)(k1) |
| SM-1 (D-41) | `if (!isMountedRef.current) return;` წაშლილი | killed (b3)(e1)(e2) |
| SM-2 (D-41) | `useRef(true)` + effect არ აყენებს true-ს | killed (e3) |

**ეკვივალენტობის არგუმენტები:**
- **BM-6.** app-ში ეკვივალენტურია. `MetadataPanel`-ის `onClose` (`setShowSchemaEditor(false)`) editor-ს unmount-ს უკეთებს, ამიტომ `isApplying` აღარ ჩანს. standalone `SchemaEditor`-ზე no-op `onClose`-ით (k2) ის კვდება: label `Applying...` რჩება. probe-ის draft B-ს ეკუთვნის: `c-round-35/c-probes.test.ts.txt` (k2). low test-gap-ია, FAIL არა.
- **BM-8.** React 18+ unmounted component-ზე setState-ს no-op-ად ასრულებს და warning-ს არ აჩვენებს. ხილული განსხვავება არ არის.
- **DM-11.** ორივე guard არაფერს წერს და ბრუნდება, ამიტომ მათი რიგი შედეგს არ ცვლის.
- **DM-12.** `schemaReadIdRef` მხოლოდ იზრდება. თითოეული run-ის `schemaReadId ≤ current`, ამიტომ `!==` ⇔ `<`.
- **DM-9 (B-ის claim დადასტურდა, killing sequence ვერ ვიპოვე).** `waitForFolderLoadIdle` (`MetadataPanel.tsx:64-73`):
  - თუ `isScanning` false-ია, აბრუნებს `Promise.resolve()`-ს. DM-9-ით increment-ი ერთი microtask-ის შემდეგ ხდება, ანუ შემდეგ macrotask-მდე. UI-ის ყოველი click ცალკე macrotask-ია, ამიტომ მეორე click-ს ვერ დაასწრებს.
  - თუ `isScanning` true-ია, `useFileStore.subscribe` listener-ები (Set, insertion order = click order) ერთსა და იმავე `isScanning → false` update-ში `resolve()`-ს ამ რიგით იძახებენ. continuation-ებიც ამ რიგით სრულდება.
  - ერთი Done ვერ დაელოდება, როცა მეორე უკვე "გაუშვებელი" ელოდება სხვა load-ს: listener სინქრონულად ერთი update-იდან resolve-დება.
  - probe **(k1)**: ორი Done ერთსა და იმავე pending Open Folder-ს ელოდება, #2-ის read ჯერ სრულდება, #1-ისა (`title: "STALE1"`) ბოლოს. ის A-ს tree-ზე და DM-9-ზე green-ია, DM-8/DM-10/DM-13-ზე და `3035ffc`-ზე red (`expected 'STALE1' to be 'B'`).
  - ერთადერთი არამიღწევადი გამონაკლისი: qa-engineer-ის "ორი click ერთ synchronous task-ში". UI-დან მიღწევადი არ არის, და D-43 იქაც ზედმეტ შედეგს აგდებს.

## R35-4 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გაეშვა სრული `verifyCommand` (`verify.log`, `verify.clean.log`) და მერე `--retries=0` (`e2e-retries0.log`).
- exit 0.
- Biome: "Found 8 warnings", 0 errors. ფაილებისა და rule-ების სია იგივეა, რაც `c-round-31/biome-new.txt`-ში (`c-round-35/biome-new.txt`).
- `tsc` node/web/test: 0 error.
- Renderer **287/287 (18 files)**, main **93/93**, build OK, E2E **7/7**. `--retries=0`: **7/7**.

## R35-5 real app, old vs new — PASS
- Build-ები: `/tmp/c35/old` (`git archive 3035ffc`) და `/tmp/c35/new` (A-ს tree). `build-old.log`, `build-new.log`.
- გაშვება: `_electron` + `xvfb-run`, `--no-sandbox`, `-r c-round-35/harness.cjs`, იზოლირებული `XDG_CONFIG_HOME`, viewport 1400×900.
- Harness: scan delay 4000 ms `fast/`-ზე; ახალი per-call knob (`R35_NTH_FILE` = `N:ms:token`) დაგვიანებას მხოლოდ arm-ის შემდეგ N-ე `meta:read-batch`-ს აძლევს; log-ში ყოველი `meta:read-batch` ჩანს თავისი paths-ით და schema keys-ით.
- UI მხოლოდ Playwright-ით იმართება, `dialog.showOpenDialog` stub-ია. Driver: `drive35.mjs`. შედეგები: `r35-5-<build>-<scen>.json`, `run-*.txt`, screenshot-ები `r35-5-*.png`.
- Setup ყველა სცენარში (fresh copy + config) გაიარა: `Tags saved` ×2, Qone/Qtwo დაემატა და მერე trash-ით მოიხსნა.

| | new | old |
|---|---|---|
| **P** DOM 3–4 ms Done-ის შემდეგ | Done `Applying...`, `disabled` (prop + `:disabled`), `aria-*` არ აქვს; fieldset `disabled`, `opacity 0.6`; field-name, RIFF, type select და Add Field `:disabled`; fieldset-ის 46/46 control disabled; Back enabled, fieldset-ის გარეთ (`new-P-01-pending.png`) | Done `Done`, enabled; fieldset არ არის |
| **P** მეორე click (`force: true`, 118 ms) | Done ისევ `Applying...` | — |
| **P** read-batch log `fast/f.wav`-ზე arm-ის შემდეგ | **2** (load seq 5 + ერთი re-read seq 6, ორივე `r35note`-ით) | **3** (seq 5, 6, 7): მეორე click-მა მეორე re-read დაიწყო |
| **P** load + 2 s | editor დახურულია; `f.wav` ფორმა: Category `R35Fast`, `R35note` input არსებობს (ცარიელი) (`new-P-03-f-form.png`) | იგივე |
| **PB** reopened | Done `Done`, enabled, inputs enabled; load + 2 s-ის შემდეგ editor ისევ ღიაა (D-41) (`new-PB-02-reopened.png`) | იგივე |
| **X** read #1 (keys …`qone`, nth 1, 4000 ms) → Back → reopen → Qtwo → Done #2 (634 ms-ში; keys …`qone,qtwo`) | #2-ის შემდეგ editor 35 ms-ში იხურება; #1-ის გვიანი reply-ის (3999 ms) + 2 s-ის შემდეგ ფორმა (წაკითხულია `s.wav`-ის row-ზე ხელახალი click-ის შემდეგ, ანუ store-ის მდგომარეობა; click-მდე, #2-ის შემდეგ, ფორმაც V1/V2 იყო): **Qone=V1, Qtwo=V2** (`new-X-01-…png`) | #1-ის გვიანი reply-ის შემდეგ **Qtwo=""**, Qone=V1 (`old-X-01-…png`): red, როგორც მოსალოდნელი იყო |
| **N** | editor 34 ms-ში იხურება | 16 ms |

**ორივე build-ზე:**
- **Idle look** (`r35-5-{old,new}-N-01-idle-editor.png`):
  - PSNR 47.96 dB. diff mask (`r35-5-idle-diff.png`) მხოლოდ sidebar-ის folder path-ის ტექსტს აჩვენებს (`/tmp/c-r35-<random>/slow`, mkdtemp-ის სახელი). editor-ის არე pixel-identical-ია.
  - fieldset: border, padding და margin `0px`, width 295. scroller `overflow-y: auto` გარე div-ზე რჩება.
- **sha256** setup-ის შემდეგ და ბოლოს ერთნაირია ყველა სცენარში (s `1e59b1f0…`, f `82f8ba99…`). P/PB/X/N-ში save არ ყოფილა.
- **ორი reader** field by field (ffprobe `format_tags` და music-metadata `exif:*`), ყველა run-ში:
  - `s.wav`: ICAT=`R35Slow`, QONE=`V1`, QTWO=`V2`;
  - `f.wav`: ICAT=`R35Fast`;
  - არცერთ ფაილში არ არის `R35note`-ის key ან value.
- `pageErrors` ცარიელია ყველა run-ში.
- Artists: setup-ში არ დაყენებულა, ამიტომ ჩასაწერი არაფერია (record only, TM-B08).

**დამატებით:**
- (b4) (reject path) და (b6) (#1 ჯერ, #2 ბოლოს) მხოლოდ unit-ით მოწმდება: harness-ს reject knob არ აქვს, (b6) კი ბუნებრივი რიგია.
- `main.tsx:7` `<React.StrictMode>`-ს იყენებს, მაგრამ production build-ში StrictMode-ის dev-only ორმაგი effect არ სრულდება. StrictMode-ის უსაფრთხოებას (e2)(e3) ამტკიცებს.

## R35-6 docs — PASS
- ტექსტი ქართულია, ტექნიკური ტერმინები ინგლისურად.
- Entry 18:
  - `გასწორდა (D-42, D-43, TM-B37)`;
  - (b1)–(b6)-ის სრული სახელები: თითოეულს 1 match აქვს docs-ში და 1 test-ში (`grep -cF`);
  - შეიცავს R1–R5-ს ერთ ხაზზე, Deviations 1–4-ს, "დისკზე არაფერი იცვლება"-ს და სამ reproduction-ს (საწყისი მდგომარეობა → მოქმედება → შედეგი).
- Entry 19: ორივე შემთხვევა, "მხოლოდ ჩვენებაა", "შემდეგი Done ან Rescan", ტესტი არ არის, სტატუსი `ცნობილი შეზღუდვა`.
- D-41: clause შეიცვალა "`Done`-ის busy state D-42-შია"-თი. D-42 და D-43 bullet-ები კოდს ემთხვევა.
- Line refs: ყოველი `SchemaEditor.tsx` ref და ყოველი `MetadataPanel.tsx` ref ≥225 `sed -n`-ით შემოწმდა: `:37`, `:39-44`, `:45`, `:137-149`, `:139`, `:142-145`, `:143`, `:146`, `:147`, `:148`, `:156`, `:165`, `:271`, `:280-282`; `:225`, `:226-277`, `:227-228`, `:229`, `:230`, `:231`, `:232`, `:233`, `:240`, `:242`, `:249`, `:250`, `:255`, `:262-266`, `:262-265`, `:266`, `:270`, `:272`, `:275`, `:277`. ყველა აღწერილ ხაზზე მიუთითებს.
- `git diff --word-diff` აჩვენებს, რომ მხოლოდ ეს ref-ები შეიცვალა, A-ს old → new სიის მიხედვით. დანარჩენი ref-ები byte-identical-ია.
- Header: (3), (9), (11)–(18) ფიქსირებულია; `წყარო`-ში არის TM-B37 (round 35); `კოდი` შეიცავს `schemaReadIdRef`-ს და `isApplying`-ს.
- README: ზუსტად `ცნობილი შეზღუდვების სია (19 ჩანაწერი; 10 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა)`. ჩემი recount: გასწორდა 3, 9, 11–18 = 10; Saba 4, 5, 6, 7, 10 = 5; შეზღუდვა 1, 2, 8, 19 = 4.

## Findings (ყველა low, FAIL არ არის)
- **C-R35-01 (low, cosmetic).** Applying-ის დროს fieldset-ის `opacity-60` მრავლდება ისრების `disabled:opacity-30`-ზე (~18%, გამოთვლილია `opacity-60 × opacity-30`-იდან, არა გაზომილი). ამიტომ ყველა ისარი თითქმის უხილავია (`new-P-01-pending.png`). ეს code-reviewer-ის low 4-ს ადასტურებს. B-ს გადასაწყვეტია.
- **C-R35-02 (low, docs).** ორი ფრაზა D-43-ის შემდეგ ზუსტი აღარ არის:
  - D-41 bullet ამბობს "pending re-read unmount-ის შემდეგაც ბოლომდე სრულდება და store-ში წერს". D-43-ის შემდეგ ის store-ში მხოლოდ მაშინ წერს, თუ შემდეგი Done არ დაწყებულა.
  - D-40 bullet ამბობს "პირველივე ხაზზე `await waitForFolderLoadIdle();`". ახლა მას D-43-ის ორი ხაზი უსწრებს.
  - task-მა ამ ორი ფრაზის შეცვლა აკრძალა, ამიტომ A-მ სწორად დატოვა (A-ს და code-reviewer-ის შენიშვნები). ერთხაზიანი დაზუსტება შემდეგ docs touch-ზე.
- **C-R35-03 (low, test gap).** BM-6-ს მხოლოდ C-ის probe (k2) კლავს, DM-9-ის ერთი და იმავე `isScanning`-ის shape-ს კი მხოლოდ (k1) ფარავს. ორივე draft `c-round-35/c-probes.test.ts.txt`-შია, თუ B pin-ად დამატებას გადაწყვეტს.
