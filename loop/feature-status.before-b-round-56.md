# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-17 · ავტორი: B (round 54 → round 55 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება `tmp/studio-real-loop/`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში:**
- **C-R23-01 ისევ ღიაა (C-R38-01).** `/studio-lab`-ის SSR HTML-ში C round 41–43-ში **3 NUL byte**-ია (11729, 28025, 28026; 64 312 byte; round 40-ის 58745/58746 წყვილი round 41-ის byte-ებით გადაინაცვლა — offset-ები ფიქსირებულია, შინაარსი მათ ქვეშ იცვლება), hydration-ის შემდეგ **1** U+FFFD `aria-label` (ბიბლიოთეკის დაკეცვის ღილაკი; round 40-ში 2). screen reader-ი გატეხილ სახელს კითხულობს. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **C-R27-01 (Medium)** quiet Chrome-ს ელოდება (D-29t), C-R6-02/C-R8-01-თან ერთად.
- **ახალი კითხვა TL-Q-VIEWPORT (C-R41-01, Low, არ ბლოკავს):** 1280 px-ზე ვიწრო სიგანე (მაგ. 1024×768) Studio-ს ფარგლებშია? თქვენ დაასახელეთ 1280×720 და 1440×900. 1024×768-ზე detail panel-ის ვიდეოს მიზეზი ყუთში 4.5 px-ით იჭრება (scroll-ის გარეშე), ჯგუფის მიზეზი scroll-ით ჩანს; ტექსტი `title`-შიც არის. თუ „დიახ“ — ის ჯგუფ 3-მდე დაიგეგმება (კანდიდატი `b-round-41.md` §4).
- **საინფორმაციო კითხვა TL-Q-FB05-FB11 (არ ბლოკავს):** `2.mp4` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. B scope-ს არ ამცირებს: ტრეკის Pan (FB-05, `1.mp4` 03:39) უკვე გაკეთდა, Tempo-ს ბადე (FB-11) რჩება, თუ Tech Lead სხვას არ იტყვის.
- **R31-T:** Pan რეალური მაუსით და ყურსასმენით; ასევე — რეალურ Chrome-ში range აგრძელებს თუ არა `input`-ს focus-ის დაკარგვის შემდეგ, როცა ღილაკი დაჭერილია. **Round 42-ის შემდეგ:** Pan-ის drag → Alt+Tab ღილაკის დაჭერით → ფანჯრის გარეთ აშვება → დაბრუნება → ArrowRight Pan-ს ამოძრავებს (D-29z7).
- **R33-T:** რეალური მაუსით: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება.
- **R35-T (ახლა შესამოწმებელია — Round 36–37 C PASS, `134b4ab`-შია):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს). **Round 38-ის შემდეგ** fader-ის click აღარ ხტება, ამიტომ fader-ის ჩანაწერი აღარ იწერება — მხოლოდ `Clip Gain`. სურვილისამებრ: touch მოწყობილობაზე ორი თითით C-R36-01.
- **R38-T (ახლა შესამოწმებელია — Round 38 C PASS, `6c7b4bb`-შია):** რეალური მაუსით ყველა fader-ზე (Volume, ვიდეოს Volume, Pan, Master): click არ ხტება, drag მდორედ მიჰყვება მაჩვენებელს, რეალური ორმაგი click საწყისს აბრუნებს (100 %, 0.0 dB, C); touch მოწყობილობაზე fader-ის drag გვერდს არ ასქროლებს **და მნიშვნელობა დაჭერისას არ ხტება** (A-R38-REVIEW-TOUCH, Medium, დაუდასტურებელი: თუ ხტება, B-ს წინასწარ აქვს განსაზღვრული ცვლილება — non-passive `touchstart` + `preventDefault` სამ fader-ზე). headless-ში რეალური ორმაგი click, drag და touch შეუძლებელია (gstack/CDP allowlist). **Round 43-იდან (A-R33-REVIEW-TOUCH):** touch მოწყობილობაზე fader-ზე კლავიატურის ნაბიჯის შემდეგ timeline-ის touch scroll — ჩანაწერი ადრე ხომ არ იწერება. `pointerType touch`-ის გამორიცხვა capture handler-ში touchscreen ლეპტოპზე C-R32-01-ს დააბრუნებდა, ამიტომ ცვლილება მხოლოდ მოწყობილობის მტკიცებულებით.
- **R34-T:** რეალური მაუსით: (1) ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნის ტექსტი უცვლელია; (2) Clip Gain-ში მნიშვნელობა Enter-ის გარეშე → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება (ერთი `Clip Gain` ჩანაწერი); (3) ძებნაში focus-ით timeline-ის scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის — Chrome-შიც და Firefox-ში overlay scrollbar-ებით. headless 10 px gutter-ს იტოვებს, მაგრამ scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს, ამიტომ (3)-ს მხოლოდ რეალური scrollbar ამტკიცებს.

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX `Soft impact` full scale-ს აღწევს (DEMO-SFX-FULL-SCALE): (a) ნორმალიზების grant ან (b) მიღება.

**⚠ Root:**
- **Round 31–38 დაკომიტებულია** — round 31–37: `134b4ab`; round 38: `6c7b4bb` (`feat(studio): refine relative fader drag and reset`), ორივე remote (`publication-checkpoint.json` → `round38Checkpoint`; root-ის verify 1290 + 2 smoke). B-მა 2026-10-14-ს commit-ის 7 ფაილის sha256 C-ის მიერ შემოწმებულს შეადარა — იდენტურია. B-ის `git ls-remote` ამჯერად „Empty reply from server“-ით ჩავარდა (ქსელი, დროებითი) — remote-ების hash root-ის ჩანაწერიდანაა. review: `checkpoint-r38-review.md` — დახარისხდა (`b-round-38.md` §5). შუალედური commit release არ არის.
- **Round 39–40 დაკომიტებულია და გამოქვეყნებულია** — `63ce722` (`fix(studio): preserve pending edits and clarify gain status`), ორივე master remote (`publication-checkpoint.json` → `round40Checkpoint`; root-ის verify 72 / 1319, build/types/lint, 2 smoke, ორივე pre-push gate). B-მ publication-ის შემდეგ გადაამოწმა: commit-ში ზუსტად 6 ბილიკია C-ის sha-ებით (`91fa12d6`, `dbcd5c2f`, `9d9f2122`, `f2cd4b53`, `dac18003`, `947d9f83`), `git status` — მხოლოდ root-ის 17 `.codex`, 384 OK, protected 4/4, `/studio-lab` 200. Review `checkpoint-r40-reviews.md` დახარისხებულია `b-round-40.md` §Addendum-ში (ახალი ID არ დაემატა; ყველა პუნქტი უკვე დახურული ან აღრიცხულია). ROOT-ROUND39-40-CHECKPOINT — **მზადაა** (root-ის მტკიცებულება). Round 41-ის baseline — HEAD `63ce722`.
- **Round 41 დაკომიტებულია და გამოქვეყნებულია** — `ea35611` (`fix(studio): show detail reasons and style panel scrolling`), ორივე master remote (`publication-checkpoint.json` → `round41Checkpoint`; root-ის verify 73 / 1325, lint/types/build, 2 smoke, ორივე pre-push gate; review `checkpoint-r41-review.md` — No High/Medium, 2 Low: red-run-ის provenance (A-მ გაასწორა, `a-round-41/red-run-final.txt`) და ვიწრო viewport (= C-R41-01)). B-მ გადაამოწმა: HEAD-ის 3 ფაილი C-ის sha-ებითაა (`61834b2a`, `cf894ea3`, `b919643f`), `git status` ცარიელია, 386 OK, protected 4/4. Agent-ის კონფიგები — `54922e6` (`agentConfigCheckpoint`; 17 `.codex/agents/*.toml` ახლა tracked-ია) → ROOT-CODEX-AGENT-FILES **მზადაა** (root-ის მტკიცებულება). Round 42-ის baseline — HEAD `ea35611`.
- **Round 42 დაკომიტებულია და გამოქვეყნებულია** — `b6a96f8` (`fix(studio): recover pan controls and scope deployment triggers`). commit-ში round 42-ის 3 ფაილია C-ის sha-ებით (`855bc517`, `de42634f`, `9b15bc74`) და root-ის `.github/workflows/ci.yml` + `vercel.json`. B-მ 19:27-ზე `git ls-remote`-ით ორივე master remote `b6a96f8`-ზე ნახა; `publication-checkpoint.json`-ში `round42Checkpoint` უკვე ჩაწერილია (ROOT-ROUND42-CHECKPOINT-RECORD — **მზადაა**). FOREIGN-CI-YML დახურულია root-ის მტკიცებულებით (განზრახ commit). **GSTACK-ACL (root):** C round 42-მა `tmp/studio-real-loop`-სა და `tmp`-ზე ერთი non-inherited owner-only ACE აღმოაჩინა (დრო უცნობია) — inheritance-ის აღდგენა root-ის გადასაწყვეტია. Round 43-ის baseline — HEAD `b6a96f8`.
- **Round 43 დაკომიტებულია და გამოქვეყნებულია** — `2c0f800` (`fix(studio): keep master peak marker inside meter`): round 43-ის 5 ფაილი C-ის sha-ებით (`849e6b40`, `f60b34d9`, `93eb697a`, `113d74b4`, `f91ab6cb`). B-მ 2026-10-15 12:06-ზე `git ls-remote`-ით ორივე master remote `2c0f800`-ზე ნახა. Root-ის review (`checkpoint-r43-root-review.json`): blocking finding არ არის; პირველი verify დატვირთვით ჩავარდა (11 timeout), იზოლირებული და სრული retry გავიდა; smoke 2 PASS. `publication-checkpoint.json`-ში `round43Checkpoint` ჯერ არ არის (ROOT-ROUND43-CHECKPOINT-RECORD — root). Round 44-ის baseline — HEAD `2c0f800`.
- **Round 44 დაკომიტებულია და გამოქვეყნებულია** — `ca85109` (`perf(studio): skip unchanged volume previews`): ზუსტად round 44-ის 3 ფაილი C-ის sha-ებით (`623f381e`, `63b5dbe5`, `5dadac1f`). ROOT-ROUND44-CHECKPOINT დაიხურა.
- **Round 45 დაკომიტებულია და გამოქვეყნებულია** — `8b9c813` (`fix(studio): preserve client layout effects during server rendering`; round 45-ის ზუსტად 12 ბილიკი) და ცალკე root-ის `1381b0b` (`chore(store): route architecture risks through agent checkpoints` — `.claude`/`.codex`/`scripts`, ის უცხო ბილიკები, რომლებიც C-მ round 45-ში ჩაწერა). B-ის `git ls-remote` 15:11 — ორივე master remote `1381b0b`-ზეა. Root-ის review (`checkpoint-r45-root-review.json`): High/Medium არ არის; verify 79 / 1357 (პირველ push-ზე 2 timeout დატვირთვით, იზოლირებული 22/22 და სრული retry 1357), 2 smoke.
- **Round 46 დაკომიტებულია და გამოქვეყნებულია** — `d2f6715` (`fix(studio): restore export opener focus and skip hidden controls`). B-ის `git ls-remote` 2026-10-16 ორივე URL-ზე (TCzaba, shavidze) — `d2f6715`. Root-ის review (`checkpoint-r46-root-review.json`): Critical/High/Medium არ არის; verify 80 / 1364, 2 smoke; push ჰოსტის პაუზის გამო ერთხელ გაჩერდა და root-მა თავიდან გაუშვა (`checkpoint-r46-push-resume.log`). ROOT-ROUND46-CHECKPOINT დაიხურა.
- **REMOTE-DIVERGENCE-SHAVIDZE — დაიხურა (root-ის მტკიცებულება):** `publication-checkpoint.json` → `round48Reconciliation`: ff-only `d2f6715` → `08b6a5e` (root-ის fix pass round 47-ის კოდზე), შემდეგ `05e1bc0` (2 local assertion + doc 044-ის round-48 ფაქტები); root-ის verify 82 / 1396, smoke, reviewer-ს blocker არ აქვს (`../studio-remote-reconcile/review-original.md`, 8.5/10), ორივე remote root-მა გადაამოწმა; stash `e4e64e0` შენახულია. B-ის `git ls-remote` 2026-10-16 19:57-ზე DNS-ით ჩავარდა — remote-ის hash root-ის ჩანაწერიდანაა.
- **Round 47 + 48 დაკომიტებულია და გამოქვეყნებულია** (`08b6a5e` + `05e1bc0`, root). **მნიშვნელოვანი:** C47/C48-ის ქცევის მტკიცებულება reconciliation-მდე tree-ზეა; `grid.ts`, `StudioWorkspace.tsx`, `ArrangementLane.tsx` და ორივე grid ტესტი ახლა სხვა blob-ია. ამიტომ round 49 §4.6 ეტაპი 1-ის ქვესიმრავლეს (SN-1, SN-GROUP, SN-LANE, NU-1, UI-1, UI-5, LN-1) ხელახლა ამოწმებს (RECONCILE-STAGE1-RECHECK).
- **Round 49 დაკომიტებულია და გამოქვეყნებულია** — `038ed5a` (`feat(studio): snap trim edges and ranges with Alt override`; ზუსტად round 49-ის 7 ბილიკი). Root: verify 83 / 1418, 2 smoke, actual code-reviewer — code blocker არ არის (8.5/10), doc 045-ის ოთხი სიზუსტის შესწორება (სტატუსი „C PASS (2026-10-17)“, red 16/6, (n)/(p), PW-ის მეთოდის შენიშვნა). B-ის `git ls-remote` 2026-10-17 11:22-ზე ორივე URL-ზე — `038ed5a`. DOC045-STATUS-LINE root-მა დახურა.
- **Round 50–54 — ჯერ არ დაკომიტდება (root):** round 54 C-ის შედეგი **FAIL**-ია: round 54-ის ცვლილებამ შემოიტანა C-R54-01 (Medium, Shift-ის დროის ჩაკეტვა sub-ms start-ზე), ბრაუზერი მესამე რაუნდია არ გაშვებულა და C-ის ორივე მშვიდი `npm run verify` rc 1 იყო (C-R48-01). შემდეგი სუფთა ერთეული — round 50–55 (17 ბილიკი) round 55-ის სრული C PASS-ის შემდეგ, ბრაუზერისა და G55-3-ის ჩათვლით (ROOT-COMMIT-ROUND51).
- **ENV-DEV-SERVER-DOWN-R52 — ზედიზედ მესამე რაუნდი (root, სასწრაფო):** `http://127.0.0.1:5173` და `:5199` არ მუშაობდა round 52, 53 **და** 54-ში (C round 54: 000 18:47, 19:09, 19:18; B 19:25: ორივე 000). ეტაპი 4a-ს ბრაუზერის არც ერთი ID და შესყიდვის დაცვის ბრაუზერული შემოწმება (G-3) სამი რაუნდია არ გაშვებულა. **სავარაუდო მიზეზი (ENV-VITE-ENOMEM-R53):** vite-ის FSWatcher-ის `ENOMEM … scandir playwright-report` (`r42-vite.err.log`). **C round 55-მდე root-მა Store dev server-ი და backend უნდა გაუშვას.** ეს გარემოა, არა BLOCKED; ბრაუზერის მტკიცებულების გარეშე B 4b-ს არ გაგზავნის.
- **ARCH-CHECKPOINT-SRW14-PREFS (თხოვნა root-ს, არ აჩერებს):** შეზღუდული frontend-architect checkpoint — `StudioWorkspace`-ის view/edit preference-ები (`followMode`, `snapEnabled`, `gridSeconds` + ref-ები) vs history-ს გარეშე „edit preferences“ slice; `trimRequestOnGrid` / `rangeEndsOnGrid`; ტესტის harness-ის ასლები; **ახალი შენიშვნა (A-ს reviewer, round 52):** `ArrangementClip`-ის move/trim ნაწილი round 47–52-ში ექვსჯერ გაიხსნა — 4c-ის შემდეგ სუფთა `resolveSingleMoveTarget` `lib/arrangement`-ში. Round 53 მხოლოდ `grid.ts`/`ArrangementClip`-ის შესწორებაა და პასუხს არ საჭიროებს; სასურველია **4b-მდე (Round 56/57; D-29z20)**; round 54 მხოლოდ `selection.ts`-ის ერთ ხაზს ცვლის. B extraction-ს თავად არ გეგმავს. **Round 55-ის დაგეგმვისას გაფართოვდა:** ერთი owner (`ArrangementClip.tsx` / `selection.ts` / `grid.ts`) round 52–55-ში იცვლება და მათ საზღვარზე ორი სიზუსტის ბაგი იყო (C-R53-01, C-R54-01). დამატებითი კითხვა: დროის სიზუსტის ერთი წესი — keep თუ extract (`roundTime` ms, `roundGridTime` ms, `toWholeMicroseconds`, `selection.ts`-ის inline µs). პასუხი: keep/extract, ღირებულება, რისკი, ≤ 3 წინადადება. Round 55-ში საერთო helper არ შედის.
- **C-R48-01 (root-ის კონფიგი, Medium):** round 54-ში C-ის სამივე სრული გაშვება ჩავარდა 5000 ms timeout-ებით უცვლელ, StudioWorkspace-ს mount-ის ფაილებში (`track-layout` „folds a lane…“ — C-ის 5 გაშვებიდან 4-ში; `sfx-library`, `master-ui`, `fader-guards`); ცალკე ~2.1 s. ბერკეტი root-ისაა (`vitest.config` `testTimeout` / worker-ების ლიმიტი). თუ root კონფიგით არ გაასწორებს, Round 56 — A-ს შეზღუდული დავალება ამ ფაილებში per-file timeout-ით.
- **GSTACK-NO-MOUSE (root/მომხმარებელი, info):** gstack browse-ს, მის CDP allowlist-სა და `server-node.mjs` fallback-ს მაუსის down/move/up არ აქვს. C round 47-მა REAL-mouse drag-ები standalone Playwright 1.57-ით გააკეთა (დაყენებული chromium, ახალი context). ეს gstack-only წესიდან გადახვევაა და თანხმობას ელოდება; დამტკიცებულ გზად არ ჩაითვლება.
- **არქიტექტურული checkpoint (ARCH-CHECKPOINT-SRW13, არ აჩერებს):** root-ს ეთხოვა `b-round-45.md` §6-ში; პასუხი loop-ის ფაილებში ჯერ არ ჩანს. მსგავსი შეფასება არსებობს — `docs/technical/studio-independent-reviews/frontend-architecture-pragmatic-2026-10-15.md` (`ca85109`, root-ის შეფასებით): P1 საერთო fake Web Audio harness, P2 shortcut-ების წმინდა resolver, P3 drag-ის render-budget ტესტი. ისინი backlog-ის სიგნალებია და ავტომატურად არ იგეგმება; root-მა ჯერ არ დაადასტურა, რომ ეს თხოვნის პასუხია. Round 47 `ArrangementContext.tsx`-ს არ ეხება.
- **BIOME-HOOKS-DEPS (Low, `biome.json` — root):** Biome-ის `useExhaustiveDependencies` custom effect hook-ებს არ ამოწმებს (`useIsomorphicLayoutEffect` — 8 site, C round 46-მა დაადასტურა; `usePositionWriterEffect` — 3). წინადადება: `options.hooks`-ში ორივე `{closureIndex: 0, dependenciesIndex: 1}`-ით.
- Merge-ით შემოსული `app/lib/auth.ts` და `auth-bugs.test.ts` working copy-ში CRLF-ია: Biome 2 format error (B round 37 gates-შიც).
- Tracked `frontend-architect.md` Write/Bash-ს იძლევა.
- Dev server: B-ის round-43 დაგეგმვისას `/studio-lab` 200 (2026-10-15 12:06), `node.exe` 15. ENV-BROWSE-DAEMON: C round 43-ში CLI-ით გაშვებული 7 daemon 60–90 წამში კვდებოდა, `about:blank`-ზე უმოქმედოდაც. მუშა გზა იყო საკუთარი `server-node.mjs` (`BROWSE_PARENT_PID=0`, ახალი state file, log). Round 44-იდან ეს **დამტკიცებული fallback-ია** ერთი წარუმატებელი CLI-მცდელობის შემდეგ. `$B restart` ისევ აკრძალულია; უცხო პროცესს არავინ კლავს.

მიმდინარე რაუნდი: **Round 55** (`current-task.md`, D-29z20) — **SRW-14 ეტაპი 4a-ს დასრულება III (FB-13):** Shift-ით დროის ჩაკეტვამ sub-ms start ზუსტად უნდა შეინარჩუნოს.
- **C-R54-01 (Medium, round 54-ის რეგრესია):** Shift-ით სხვა ხაზზე გადატანისას `moveStartOnGrid` start-ს ms-მდე ამრგვალებს (`roundTime`), delta −0.0004 ხდება და µs-ის planner-ი მას ინახავს: მეზობელთან შეხებისას გადატანა უარყოფილია, ცარიელ ხაზზე კლიპი 6-ზე ხვდება. **C-R54-02 (Low, ძველი):** იმავე ხაზზე Shift-drag start-ს 6-ზე ცვლის და ისტორიას წერს.
- **შესწორება:** `ArrangementClip.tsx`-ში ერთი კლიპის გადატანისას `timeLocked` → `requestedStart = original.start` (სხვა ხაზზე delta ზუსტად 0; იმავე ხაზზე ცვლილება და ისტორია არ არის). `selection.ts`/`grid.ts` გაყინულია.
- **ტესტები:** CM9c, CM9d, CM9e (`grid-snap-clip-edges.test.tsx`); mutation-ები (b)/(c) სხვა ხაზისა და იმავე ხაზის დაფარვას ცალ-ცალკე ამტკიცებს.
- **C:** R55-SHIFT + round 52–54-ის ბრაუზერის მთელი შემოწმება (R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY — რეალური აუდიო, R52-REG, REG-HYD) + G55-3 (შესყიდვის დაცვა). Root-მა სერვერები უნდა გაუშვას.
- **შემდეგ:** Round 56 — C-R48-01 (თუ root კონფიგით არ გაასწორებს) ან 4b (მხოლოდ 4a-ს ბრაუზერის მტკიცებულებით); შემდეგ 4c. მოცულობა არ მცირდება.
- **Baseline:** HEAD `038ed5a` + round 50–54-ის 17 ბილიკი; frozen `b-round-54-r55-tree-sha256.txt` (410), snapshot-ები `b-round-54-r55-snapshots/` (3 ფაილი).

**Round 54-ის შედეგი** (A `a-round-54.md`, C `c-round-54.md`): **C FAIL.** PASS: G54-2, R54-S, R54-U (mutation-ები (a)(b)(c)(g) მოკლულია, (e) — CM16-ით). **C-R53-01 unit/probe დონეზე გასწორდა** (P3x → stems 6.0004, P3x-END → 8.4004; ბრაუზერის CX-VIDEO რჩება). ახალი: **C-R54-01** (Medium, რეგრესია), **C-R54-02** (Low, ძველი). G54-1 FAIL — C-R48-01 (C-ის 3/3 სრული გაშვება timeout-ით; A-ს ერთი მშვიდი verify rc 0). ბრაუზერის არც ერთი ID არ გაშვებულა (გარემო, მესამე რაუნდი).

**Round 53-ის შედეგი** (A `a-round-53.md`, C `c-round-53.md`): **C BLOCKED (გარემო).** PASS: R53-S, R53-U (mutation-ები მოკლულია, გარდა (g)-სი CT8-ზე — სპეციფიკაციის შეუსაბამობა, SPEC-R53-G-CT8), G53-1 (მშვიდი verify rc 0, 87 / 1497 / 0; პირველ გაშვებაში C-R48-01-ის 2 timeout), G53-2. C-R52-01 და C-R52-02 (იმავე ხაზზე) **დაიხურა**, C-R52-03 unit-ითა და probe-ით გასწორდა (ბრაუზერის LN-SHORT რჩება). ბრაუზერის არც ერთი ID არ გაშვებულა. ახალი: C-R53-01 (Medium), INFO-R53-NARROW-GAP (დიზაინით; R52-T(1)-ის მასალა).

**Round 52-ის შედეგი** (A `a-round-52.md`, C `c-round-52.md`): **C FAIL.** PASS: R52-S, G52-2; R52-U ნაწილობრივ — red run ემთხვევა, mutation-ები (a)–(q) მოკლულია (q — მოსალოდნელი survivor, info), **C-R51-T1 დაიხურა** (mutation (n) მოკლულია). G52-1 FAIL — GS3/GS13 (`grid-snap-ui`) → **C-R52-01**, `verify` exit 1 (B-მაც გაიმეორა: 2 failed / 41). ახალი: **C-R52-02** (Medium), **C-R52-03** (Low), C-R52-T1 (ტესტის ხარვეზი → 4c). ბრაუზერის ყველა ID **არ გაშვებულა** — dev server არ მუშაობდა. შესყიდვის დაცვა ამ რაუნდში თავიდან არ შემოწმებულა (4 დაცული ფაილი sha256-ით უცვლელია).


**Round 51-ის შედეგი** (A `a-round-51.md`, C `c-round-51.md`): **C PASS round 51-ის ცვლილებაზე** — R51-S, R51-U (a–m, x1, C-ის o), LD-OFF/1/ALT/ALT-ON/VIDEO/1280, LB-OFF/MOVE/ALT/ALT-ON/END/START/CLAMP/SAME/1280, LK-OFF/1/SHIFT/ZERO/025/CLIP, LP-LOOP (შემობრუნება 15-ზე: 14.982 → 11.301), LP-LOOP-ALT (14.85-ზე), LP-DROP (SFX 9.022-დან), LP-DROP-OFF (9.401-დან), REG-HYD, RU-1, LA-1, CL-RANGE, NU-1, G-TEXT, G51-1 (85 / 1461, verify exit 0), G51-2, G51-3. **LD-BLOCK — ნაწილობრივ:** ghost და „კლიპი არ დაემატა“ PASS, სტატუსი ბრაუზერში არ ჩანს → **C-R51-01** (Low, ძველი). **ახალი Low:** C-R51-02 (brace-ის focus კლიპზე click-ის შემდეგ რჩება, ძველი), C-R51-T1 (ტესტის ხარვეზი → Round 52).

**Round 50-ის შედეგი** (A `a-round-50.md`, C `c-round-50.md`): **C PASS** ყველა გაშვებულ ID-ზე, პროდუქტის ბაგი არ არის — R50-S, R50-U (mutation a–r + C-ის q, s, t1), R50-RULER, R50-DRAG (DR-PLAY: აუდიო 10.000-დან), R50-LANE, R50-CLIP, R50-PASTE, R50-PLAY (PL-1: SFX 4.022-ზე ჟღერს; PL-OFF: 3.990-მდე ჩუმია), R50-REG, REG-HYD, G50-1 (84 / 1438, verify exit 0), G50-2, G50-3. **დაიხურა:** C-R49-01 (SE20), C-R49-02 (SE21). **info:** C-R50-N1 (B-ის fixture trim-ის ზონაში იყო → harness-ის წესი), C-R50-N2 (playhead-ის drag დაკვრისას ყოველ ხაზზე აუდიოს თავიდან იწყებს → R50-T). **Low (reviewer):** A-R50-REVIEW-CLIP-CANCEL-SEEK → ეტაპი 4.

**Round 49-ის შედეგი** (A `a-round-49.md`, C `c-round-49.md`): **C PASS** ყველა გაშვებულ ID-ზე — R49-S, R49-U (mutation a–m), R49-TRIM, R49-RANGE, R49-ALT, R49-GROUP, R49-S1 (ეტაპი 1 ხელახლა reconcile-ის შემდეგ კოდზე, AU-1-ის ჩათვლით: onset 6.000 წმ), REG-HYD, G49-1 (83 / 1418, verify exit 0), G49-2, G49-3. **დაიხურა:** GROUP-LANE-REFUSAL-TEXT, LANE-RANGE-OVERLAY-60, DOC044-STATUS-LINE, DOC044-FINDINGS-PATH, RECONCILE-STAGE1-RECHECK. **ახალი Low (ტესტის ხარვეზები, ქცევა ბრაუზერში სწორია):** C-R49-01, C-R49-02 → Round 50. Root: `038ed5a`, ორივე remote.

**Round 48-ის შედეგი** (A `a-round-48.md`, C `c-round-48.md`): **C PASS** — R48-S, R48-U (a)–(e), G48-1 (82 / 1387, `npm run verify` exit 0), G48-2, G48-3 (ხელახლა: ანონიმური `/studio-lab`, token 401, `/studio/middle-east` → Sign in required). **დაიხურა:** B-EXPECT-R47-RB. **ახალი Low:** C-R48-01 (`render-budget.test.tsx:547`, cold run-ის flake). შემდეგ root-მა remote შეათანხმა (`08b6a5e` + `05e1bc0`, 82 / 1396). შენიშვნა: `tasks/round-48.md` l.76 unnamed query-ს აღწერს, მიღებულ კოდში named query-ა (`{ name: 'ხმები' }`) — archive არ გადაიწერა, ფიქსირდება D-29z14-ში.

**Round 47-ის შედეგი** (A `a-round-47.md`, C `c-round-47.md`): **C FAIL მხოლოდ ერთ gate-ზე; ქცევის ყველა ID PASS-ია REAL შეყვანით.**
- **PASS:** G47-2, G47-3 (ანონიმური `/studio-lab`, token 401, `/studio/middle-east` → Sign in required), R47-S, R47-U (23 ახალი `it`, mutation a–k), UI-1…UI-6 (უჯრა 224×28, toolbar 49/87 უცვლელი), reload-ზე Snap გამორთულია, SN-OFF 4.750 / SN-1 5.000 / SN-025 4.500 / SN-GROUP 5.000+7.700 / SN-LANE / SN-SHIFT / SN-MID / SN-BLOCK / SN-VIDEO (1440×900, 1280×720), NU-1…NU-3, LN-1…LN-4 (ხაზი = ruler-ის tick, Δ 0 px), AU-1 (export-ში SFX ზუსტად 6.000 წმ-ზე), AU-2, REG-HYD/TRIM/RANGE/KEYS, R47-Doc.
- **FAIL — B-EXPECT-R47-RB (Medium, B-ის დავალების წინააღმდეგობა):** frozen `render-budget.test.tsx:309` ყველა option-ს ითვლის; ახალი `<select>`-ის 7 option-ით 9 გამოდის. vitest 1 failed / 1386. → Round 48.
- **B-ის გადაწყვეტილება:** C-R47-01 = A-R47-GROUP-LANE-DELTA **მიღებულია** (Snap-ის გარეშეც იგივე ჯგუფური გადატანა ხაზს არ იცვლის; round 47-ის §0.4-ის ტექსტი გასწორდა). დარჩენილი ნაკლი — GROUP-LANE-REFUSAL-TEXT (Low, round 49).
- **დაიხურა C-ის მტკიცებულებით:** DOC043-STATUS-LINE, CLIP-RANGE-OVERLAY-60.
- **ახალი:** LANE-RANGE-OVERLAY-60 (Low, round 49), GSTACK-NO-MOUSE, REMOTE-DIVERGENCE-SHAVIDZE (root), SHIFT-BEFORE-DOWN-NOTE, GRID-LINE-CONTRAST (Tech Lead R47-T).
- **Ableton:** C-ის ორი ვერდიქტის ცხრილი (`c-round-47.md` §11) — მიბმა/Snap-ის გადამრთველი/ბადის ბიჯი ruler-თან დადასტურებულია; G (Ctrl+4-ის ნაცვლად) და წამების დანაყოფები შეგნებული განსხვავებაა; ჩაჩოჩების ბიჯი, ხაზები Snap-ის გარეშე, Undo-ს გარეშე და ნაგულისხმევად გამორთვა — დაუდასტურებელი (CZABA-ს გადაწყვეტილება).

შემდეგ: Round 49 — SRW-14 ეტაპი 2 (trim, კლიპის body-ში დროის მონიშვნა, Alt-ით დროებითი გამორთვა/ჩართვა — Live 6.10; + GROUP-LANE-REFUSAL-TEXT, LANE-RANGE-OVERLAY-60, doc 044-ის სტატუსი); შემდეგ ეტაპები 3–4, SRW-15 (+ ეტაპი 5), SRW-16..20, SRW-21, სრული რეგრესია, T12. C-R41-01 — TL-Q-VIEWPORT-ის მიხედვით.

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 51 -StartPhase A`.

**Round 46-ის შედეგი** (A `a-round-46.md`, C `c-round-46.md`): **C PASS ყველა კონტრაქტულ ID-ზე, bugs `[]`.** G46-1 (tsc 0, vitest 80/1364, build, Biome 2 baseline), G46-2, G46-3 (ანონიმური `/studio-lab`, token 401, `/studio/middle-east` → Sign in required), R46-S, R46-U (mutation a–e + f1/f2), R46-FOCUS (Esc/✕/`დახურვა` → `Export`, Tab wrap, render-ის დროს focus dialog-შია, Space transport-ს არ რთავს, 1280), R46-SSR (Δ 0 ×3), REG-HYD/PLAY/KEYS, R46-Doc. F-VIDEO-ს „✕ opener-ად“ — მხოლოდ unit. A-R46-RESTORE-SELECTION მიღებულია დოკუმენტირებულ საზღვრად.

**Round 45-ის შედეგი** (A `a-round-45.md`, C `c-round-45.md`): **C PASS ყველა კონტრაქტულ ID-ზე, bugs `[]`.** G45-1 (tsc 0, vitest 79/1357, build, Biome 2 baseline), G45-2, G45-3, R45-S, R45-U (mutation a–h), R45-SSR (Δ 0 ×3), R45-REG (1440/1280), R45-Doc.

შემდეგ: Round 48 — SRW-14 ეტაპი 2 (trim, დროის მონიშვნა, range overlay, Alt-ით დროებითი გამორთვა); შემდეგ ეტაპები 3–4, SRW-15 (+ ეტაპი 5: მუსიკალური დანაყოფები, R14-G1), SRW-16..20 (FB-10, FB-12, FB-06, FB-07), SRW-21, სრული რეგრესია, T12. C-R41-01 — Tech Lead-ის პასუხის მიხედვით (TL-Q-VIEWPORT).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 47 -StartPhase A`.

**Round 43-ის შედეგი** (A `a-round-43.md`, C `c-round-43.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**
- **PASS:**
  - G43-1: tsc 0; vitest 76 ფაილი 1341/1341; frozen 12 ფაილი 227; build; `npm run verify` exit 0; Biome — 2 baseline CRLF error, 218 warning.
  - G43-2: 5 კონტრაქტული ბილიკი, 387 OK, protected 4/4.
  - G43-3: ანონიმური `/studio-lab` პირდაპირ და header-იდან; 0 token/recording/download/R2; Authorization 0; token 401; fake Bearer → 500 ტოკენის გარეშე; `/studio/middle-east` → Sign in required.
  - R43-S.
  - R43-HT, რეალური დაკვრით: ≥ +6 dB-ზე tick ყველა sample-ში ყუთშია (1440 და 1280); ≤ +5 dB-ზე max |Δ| 0.061 px; 0 dB-ზე 0 dBFS ნიშნულს ფარავს; ტრეკის meter უცვლელია.
  - R43-U: mutation a–e; A-R38-ის ეკვივალენტობა C-მ დამოუკიდებლად დაადასტურა.
  - R43-REG: METER, FADERS, PAN, DEL, CG.
  - R43-Doc.
- **დაიხურა:**
  - MASTER-HOLD-TICK-EDGE;
  - A-R37-TEST-HARDENING;
  - A-R38-TEST-ORDER — ეკვივალენტობა დადასტურდა: S1–S5 contract pin-ებია და რიგს ვერ იჭერენ;
  - TASK-R43-HTZERO (task-ის ტექსტი);
  - ROOT-ROUND42-CHECKPOINT-RECORD.
- **ახალი:**
  - A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT — მიღებულია;
  - ROOT-ROUND43-CHECKPOINT-RECORD (root);
  - ENV-BROWSE-DAEMON — ახალი სიმპტომი.
- **Ableton:** სამივე სტრიქონი „არ ეხება“.
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-15 12:06, `b-round-43/`): HEAD `2c0f800` ორივე remote-ზე, `git status` ცარიელი, 391 OK (ახალი სია `b-round-43-tree-sha256.txt`), protected 4/4, tsc 0, vitest 76/1341, `/studio-lab` 200, `node.exe` 15.

**Round 42-ის შედეგი** (A `a-round-42.md`, C `c-round-42.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**
- **PASS:** G42-1 (tsc 0; 10 suite 270/270; vitest 74 ფაილი 1333/1333; build; `npm run verify` exit 0; Biome — 2 baseline CRLF error, 218 warning); G42-2 (3 კონტრაქტული ბილიკი, 386 OK, protected 4/4; + root-ის უცხო `ci.yml`, ხელშეუხებელი); G42-3 (ანონიმური `/studio-lab` პირდაპირ და header-იდან, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required); R42-S (4 hunk, +7/−0); R42-U (ძველ Lane-ზე PK1/PK3/RW1/RW2 წითელია; mutation a–f); R42-Doc; R42-PK (PK-B, PK-LATE, PK-NEG, PK-1280; ცოცხალი StereoPanner მიჰყვება); R42-RW (RW-B, RW-KEY, RW-GESTURE, RW-NORMAL); R42-REG (KEYS, RESET, DEL — გასწორებული მოლოდინით, DRAG, FADERS).
- **დაიხურა:** A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES; TASK-R42-REGDEL (B-ის task-ის ტექსტის შეცდომა: fader-ზე focus-ით Delete კლიპს **ინარჩუნებს**, C-R31-02); FOREIGN-CI-YML (root-ის მტკიცებულება, `b6a96f8`).
- **ახალი:** GSTACK-ACL (Low, root/გარემო). ENV-BROWSE-DAEMON განმეორდა.
- **Ableton:** ორივე სტრიქონი „არ ეხება“.
- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 19:27, `b-round-42/gates.txt`): HEAD `b6a96f8` ორივე remote-ზე, `git status` ცარიელი, 387 OK (ახალი სია `b-round-42-tree-sha256.txt`), protected 4/4, tsc 0, vitest 74/1333, `/studio-lab` 200, `node.exe` 32–36.


**Round 41-ის შედეგი** (A `a-round-41.md`, C `c-round-41.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**
- **PASS:** G41-1 (დატვირთვის გარეშე: `npm run verify` exit 0, 73 ფაილი, 1325/1325; Defender-ის დატვირთვით პირველი გაშვება timeout-ებით ჩავარდა — ორივე ანგარიშშია); G41-2; G41-3 (ანონიმური `/studio-lab` პირდაპირ და header-იდან, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required); R41-S; R41-U (ძველ კოდზე RF1/RF2/RF5 წითელია, mutation a–h); R41-Doc; R41-RV 6/6 (ვიდეო და ჯგუფი 1440-ზე, 1280-ზე — panel 122-ითაც — და 120 px მინიმუმზე, ყველა მიზეზი `scrollTop` 0-ზე ჩანს; RV-SWITCH); R41-SB (10 px stable gutter, 15 წესი; სვეტები 288/490/176/128 და 288/330/176/128); R41-NONE; R41-PM; R41-MN-1..4; R41-K.
- **დაიხურა:** C-R40-01, DOC038-STALE-LINES.
- **ახალი:** C-R41-01 (Low, 1024×768 — Tech Lead-ის კითხვა TL-Q-VIEWPORT); ESC-DESELECT-NOTE (info, C-ის harness-ის შენიშვნა); R41-RECORDS (info: SB-4, 120 px-ზე none-ის მიზეზი 7/13 px, MN-4-ის overlay).
- **Ableton:** ორივე სტრიქონი „არ ეხება“ (CZABA-ს layout და მომხმარებლის scrollbar-ის მოთხოვნა).
- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 17:33, `b-round-41/gates.txt`): HEAD `ea35611`, `git status` ცარიელი, 3 ფაილი C-ის sha-ებით, 386 OK (ახალი სია `b-round-41-tree-sha256.txt`), protected 4/4, tsc 0, vitest 73/1325, `/studio-lab` 200, `node.exe` 32–44.


**Round 38-ის შედეგი** (A `a-round-38.md`, C `c-round-38.md`): **C PASS — ყველა ID.**
- **PASS:** G38-1..3 (vitest 1290/1290, 376 OK, protected 4/4, ანონიმური `/studio-lab` header-იდან და პირდაპირ, 0 token/recording/download/R2 მოთხოვნა, Authorization 0, studio-token 401, `/studio/middle-east` → Sign in required); R38-S; R38-PG (რეალური click: Volume/SFX/ვიდეო 1, Master 0, Pan 10R რჩება, 0 ჩანაწერი, focus fader-ზე; round 37: 0.5 / −27 dB); R38-DR (synthetic; ფორმულა ზუსტია 107/96/48 px-ზე; ცოცხალი `setTargetAtTime` 0.92→0.83→0.75 და pan 0.14→0.26→0.40, 0 ახალი `start`); R38-DC (synthetic dblclick; რეალური ორმაგი click harness-ით შეუძლებელია → R38-T); R38-MN; R38-CR; R38-K; R38-U (mutation a–h მოკლულია; (i) `focus`/`begin` რიგი ცოცხალი → A-R38-TEST-ORDER); R38-Doc.
- **ახალი:** C-R38-01 (Low, C-R23-01 `aria-label`-ებში); A-R38-TEST-ORDER (Low); A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი, R38-T); PREVIEW-VOLUME-IDENTITY (info, 4c).
- **Ableton:** Pan-ის double-click reset — დადასტურებული (§18.1); Volume/Master reset და click-ზე არ ხტომა — დაუდასტურებელი (CZABA-ს მოთხოვნა); Delete → default — შეგნებული განსხვავება.
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-14, `b-round-38/gates.txt`): HEAD `6c7b4bb`, 17 untracked `.codex` (root), 380 OK (ახალი სია), protected 4/4, tsc 0, vitest 70/1290, build ✓, Biome 2 CRLF error + 218 warning + 1 info, NUL 5.

**Round 37-ის შედეგი** (A `a-round-37.md`, C `c-round-37.md`): **C PASS — ყველა ID.**
- **PASS:** G37-1..3 (vitest 1264/1264, 376 OK, protected 4/4, ანონიმური `/studio-lab` header-იდან და პირდაპირ, studio-token 401, `/studio/middle-east` → Sign in required); R37-S; R37-PG (PG-1/2/3 + 1280: ველი `3`-ს ინარჩუნებს, release-ის შემდეგ Enter ან blur ერთხელ წერს); R37-MN (MN-2b-ის ჩათვლით); R37-CR; R37-K; R37-U (mutation a–e; a = snapshot, ზუსტად N1–N3 წითელი); R37-Doc.
- **დაიხურა:** C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE; C-R37-02 (B-ის ფორმულირება — გასწორდა `plan.md` D-29z3-ში).
- **ახალი Low:** C-R37-01 (შენახულ ტექსტს pending ნიშანი არ აქვს → 4b-2), DOC036-R37-TAIL, DOC036-ROUND-REF (→ polish), A-R37-TEST-HARDENING. checkpoint-r37 review: CP-R37-PAN-KEY-LOCK (→ 4b-2), CP-R37-DRAG-ENTRIES (info), CP-R37-PAN-CLAMP (მიღებულია).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-37/gates.txt`): HEAD `134b4ab`, სუფთა ხე, 376 OK (ახალი სია), protected 4/4, tsc 0, vitest 69/1264, build ✓, Biome 2 CRLF error + 218 warning + 1 info.

**Round 36-ის შედეგი** (A `a-round-36.md`, C `c-round-36.md`): **C PASS — ყველა ID.**
- **PASS:** G36-1..3 (vitest 1259/1259, 376 OK, protected 4/4, ანონიმური `/studio-lab`, studio-token 401, `/studio/middle-east` → Sign in required); R36-CR (Volume, Pan-ის ცენტრი, Master, ვიდეოს Volume, Zoom + ორი Undo + 1280); R36-OT (7 სტრიქონი); R36-CL (3/3 ვალიდური, 2 `setTargetAtTime` ფანჯარაში, 0 restart); R36-R34; R36-K; R36-S; R36-U (mutation a–f მოკლულია); R36-Doc.
- **დაიხურა:** C-R34-01, C-R34-02.
- **ახალი:** C-R36-01 (Medium, არსებული, = A-R36-REVIEW-1); A-R36-TEST-NITS (Low); DOC036-R36-REVIEW-SENTENCE (Low). stale refusal status ისევ ჩანს (→ 4b).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-36/gates.txt`): HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4, tsc 0, vitest 69/1259, build ✓, Biome 2 CRLF error + 218 warning + 1 info.

**Round 35-ის შედეგი** (A `a-round-35.md`, C `c-round-35.md`): **A გაჩერდა §1.4-ზე, `store/` უცვლელია; C — BLOCKED.**
- A-მ იპოვა frozen ტესტი, რომელიც ძებნის focus-ის შენარჩუნებას ელოდება Pan-ზე დაჭერისას; C-მ საკუთარ scratch-ში დაადასტურა (1 failed | 776 passed, მხოლოდ l.1265).
- **PASS:** G35-2 (HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4), G35-3 (ანონიმური `/studio-lab` header-იდან და პირდაპირ; token/recording/download/R2 მოთხოვნა არ არის; Authorization 0 drag-ის დროსაც; `/studio/middle-east` → Sign in required).
- **არ გაშვებულა** (ცვლილება არ იყო): R35-OT, CL, R34, K, S, U, Doc. G35-1 — baseline მწვანეა (1247/1247), მაგრამ ახალი ტესტები არ არის.
- **სტატუსები:** არაფერი გადავიდა „მზადაა“-ში. C-R23-01: 2 NUL 28013/28014 (63 520 byte, უცვლელი).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-35/gates.txt`): ხე უცვლელია, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info.
**Round 34-ის შედეგი** (C, `c-round-34.md`): **PASS** — ყველა ID.
- **PASS:** G34-1..3 (vitest 1247/1247, 376 OK, protected 4/4, ანონიმური `/studio-lab`); R34-TS (ძებნა → header/lane/clip body/ruler, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280); R34-CG (CG-1..5, unchanged contract, CG-6 ცოცხალი: 2 `setTargetAtTime` ფანჯარაში — მიმდინარე + დაგეგმილი source, 1 გარეთ, 0 restart); R34-SB (gutter synthetic, ცარიელი ადგილი რეალური click-ით); R34-R33; R34-K; R34-S; R34-U (mutation a–g მოკლულია); R34-Doc.
- **დაიხურა:** FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR (რეალური scrollbar — Tech Lead-ის R34-T).
- **ახალი:** C-R34-01 (Medium), C-R34-02 (Low, doc), A-R34-REVIEW-RESIDUALS (Low: RTL, overlay scrollbar, მარჯვენა ღილაკი).
- **Ableton:** სამივე ქცევა დაუდასტურებელია (§18.1 focus-ზე და value box-ის commit-ზე არაფერს ამბობს).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-34/gates.txt`): 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info. Frozen სია: `b-round-34-tree-sha256.txt` (376).
## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი ID PASS-ია, Round 28–29; C-R28-01/02 დაიხურა. R29-NE და არანულოვანი no-op UI-დან მიუღწეველია — მხოლოდ provider ტესტები) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12; SRW-24: `c-round-28.md` §1–§5, `c-round-29.md` §1–§8. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36–41 ID-ები PASS-ია; C-R40-01 დაიხურა Round 41-ში. ღიაა Low C-R41-01 — მხოლოდ 1024×768-ზე, Tech Lead-ის კითხვა) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN; `c-round-38.md` R38-CR; `c-round-39.md` R39-PM/ST; `c-round-40.md` R40-PM; `c-round-41.md` R41-RV/PM | Tech Lead: R30-T, R34-T, R35-T, TL-Q-VIEWPORT. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |
| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. double-click reset და click-ზე არ ხტომა — Round 38 C PASS. Round 42 C PASS: keydown-ით აღდგენა დაკარგული release-ის შემდეგ და window blur-ზე drag-ის დასრულება — A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES დაიხურა) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G); `c-round-38.md` (PG-P, DR-P, DC-P, MN-RESET); `c-round-42.md` §4 (R42-PK, R42-RW, R42-REG) | Tech Lead: R31-T (Alt+Tab-ის ნაბიჯითაც), R33-T, R38-T |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია**. ღიაა C-R8-01 (Medium, Tech Lead quiet Chrome). SRW-11B end to end milestone run 2-ში PASS-ია; A-ს round-11-ის ყველა follow-up დახურულია (round 23 + round 24 C PASS) | ეტაპები 1–3 და polish: `c-round-8.md`, `c-round-9.md`, `c-round-11.md`, `c-round-13.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; a11y: `c-round-23.md` §2.1–§2.4, `c-round-24.md` §3–§5 | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8 → SRW-13 ეტაპი 4. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **მუშავდება** (ეტაპი 1, 2 — C PASS, `038ed5a`; 3a, 3b — C PASS Round 50–51, კომიტს ელოდება; 3b-ის LD-BLOCK სტატუსი — C-R51-01; 4a — Round 54 C FAIL: C-R53-01 unit/probe-ით გასწორდა, Shift-ის რეგრესია C-R54-01 → Round 55 (D-29z20); ბრაუზერი სამი რაუნდია არ გაშვებულა) | `c-round-47.md`, `c-round-49.md`–`c-round-54.md` | 4a-ს დასრულება III (Round 55) → C-R48-01 ან 4b (Round 56) → 4b/4c → 5 (SRW-15-ის შემდეგ) |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მოწმდება** (C-ის ყველა ID PASS-ია: Master Volume/Mute, export-ის გადატვირთვის გაფრთხილება, ცოცხალი meter და latch-იანი Clip; დარჩა მხოლოდ Tech Lead-ის R25-T/R26-T) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L); ეტაპი 2a: `c-round-26.md` §3–§12 (R26-ML/MP/C0/C6/CR/CM/RB/X/E) | Tech Lead: R25-T, R26-T. ტრეკების meter-ები (SRW-13 ეტაპი 2b) ცალკეა |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md`, `c-round-4.md`, `c-round-6.md`, `c-round-7.md`, `c-round-10.md` §4, `c-round-12.md` §3, `c-round-13.md` §4, `c-round-14.md`; milestone run 2: `c-round-21.md` §2.1 (R2-V1) | Tech Lead: MP4/MOV-ის დადებითი გზა რეალურ Chrome-ში |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (მხოლოდ C-R6-02 — Tech Lead; C-R21-01 დაიხურა Round 22-ში) | `c-round-7.md` §2; `c-round-9.md`; `c-round-12.md` §2.1; `c-round-13.md` §2.5, §3; `c-round-21.md` §2.2–§2.5; mute: `c-round-22.md` §2.1–§2.6 (R22-M1/M2/V/A1..A3 PASS) | C-R6-02: Tech Lead quiet Chrome (RF7-2/RF7-3). R22-T: click ყურით |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 26-ში 4, ერთი ხილულ ტექსტში) | `c-round-1.md` (24/24); `c-round-10.md` §5–6; `c-round-13.md` §4–§5; `c-round-14.md`; `c-round-16.md`–`c-round-20.md` (G-3, WAV 18.000 წმ); `c-round-21.md` §1, §2.8; `c-round-23.md` §2.5–§2.6 (G23-3, WAV 864 000 frame); ბაგი: `c-round-23.md` §3 | C-R23-01: Tech Lead-ის არჩევანი (React 19 ან `entry.server.tsx`-ის grant), შემდეგ ცალკე რაუნდი SSR-ის ფართო რეგრესიით |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md`; `c-round-21.md` §2.1 (R2-V1) | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (მხოლოდ C-R6-02) | `c-round-7.md` §2; `c-round-9.md`; `c-round-10.md`; `c-round-12.md`; `c-round-13.md`; `c-round-21.md` §2.2–§2.5; `c-round-22.md` §2 (mute, C-R21-01 დაიხურა) | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. R22-T |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** | `c-round-10.md` §4; `c-round-12.md` §2.1, §3; `c-round-13.md` §3; `c-round-21.md` §2.4 (R5-L3 seam 0, R5-E1 maxDiff 0) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md`; `c-round-20.md` §2.5 | — |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.6–§2.9 | — |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md`; `c-round-20.md` §2.10–§2.11 | — |
| SRW-09 | Clipboard (FB-02) | **მოწმდება** (C-R28-01 დაიხურა Round 29-ში: ყველა ხაზის clipboard ორიგინალ ხაზებზე, D-25 ერთხაზიან/კლიპების clipboard-ზე) | `c-round-5.md`; `c-round-20.md` §2.12; `c-round-28.md` §3, §11; `c-round-29.md` §3 | Tech Lead: R28-T. Round 30-ში clipboard gain-ს ატარებს (R30-GN) |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3; `c-round-13.md` §2.2 | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; `c-round-6.md`; `c-round-13.md` §2.4; `c-round-14.md`, `c-round-16.md`, `c-round-17.md`; `c-round-20.md` §2.15 | — |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (C-ის ყველა ID PASS-ია, მათ შორის end to end და follow-up-ების ორივე ნაწილი; ღიაა C-R8-01, Medium) | ეტაპები 1–3, polish: `c-round-8.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; follow-up-ები: `c-round-23.md`, `c-round-24.md`; D-29..D-29o (`plan.md`) | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8: SRW-13 ეტაპი 4. Doc 029 TODO: დაკეცილი ხაზის clip-ები accessibility tree-ში (SRW-17) |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მოწმდება** (FOCUS-TEXT-STALE დაიხურა Round 34-ში — C R34-TS; ფუნქციები C-ით დადასტურებულია; დარჩა Tech Lead-ის ხელით შემოწმება) | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17; `c-round-34.md` R34-TS | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Windows-ის ფონტები. R34-T(1)/(3) |
| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5, 4b-1, 4b-2 ჯგუფი 1 (Round 39–41), ჯგუფი 2 (Round 42), ჯგუფი 4 (Round 43), 4c (Round 44), polish ნაწილი 1 (Round 45) და 2 (Round 46) მზადაა; ჯგუფი 3 კოდის გარეშე გადაწყდა (D-29z8); 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R41-01 (Low, Tech Lead-ის viewport-ის კითხვა)) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md`; 4b-2 ჯგუფი 1: `c-round-39.md`, `c-round-40.md`, `c-round-41.md`; ჯგუფი 2: `c-round-42.md`; ჯგუფი 4: `c-round-43.md`; 4c: `c-round-44.md`; polish 1: `c-round-45.md`; polish 2: `c-round-46.md` | კოდის ეტაპები დასრულდა; ARCH-CHECKPOINT-SRW13 root-ს ეთხოვა (არ აჩერებს). C-R27-01, C-R41-01: Tech Lead |
| SRW-14 | Grid/Snap | **მუშავდება** (ეტაპი 1, 2 — C PASS, `038ed5a`; 3a, 3b — C PASS Round 50–51, კომიტს ელოდება; 4a — Round 54 C FAIL (C-R54-01); ბრაუზერი არ გაშვებულა) | `c-round-47.md`, `c-round-49.md`–`c-round-54.md` | Round 55: Shift-ის ჩაკეტვა sub-ms start-ზე + round 52–54-ის ბრაუზერის შემოწმება; 4b (56/57, მხოლოდ ბრაუზერის მტკიცებულებით): right-click მენიუ, დანაყოფის კლავიშები, C-R51-02; 4c: ჯგუფი და drop კიდეებზე (C-R52-T1) |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | SRW-14-ის შემდეგ |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | SRW-15-ის შემდეგ |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | SRW-18-ის შემდეგ |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-13.md` §5; `c-round-14.md`–`c-round-18.md`; `c-round-21.md` §1 (G21-3, header-ის ბმული) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS) | Tech Lead: რეალური Windows Chrome |
| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი R28/R29 ID PASS-ია; fader → კლიპი → Delete Round 33-ში PASS; ძებნა → კლიპი → Delete/Backspace Round 34-ში PASS — R34-TS) | `delete-selection-update.md`; `c-round-28.md` §1–§9; `c-round-29.md`; `c-round-33.md` R33-FT; `c-round-34.md` R34-TS; `tasks/round-28.md`, `tasks/round-29.md` | Tech Lead: R28-T, R34-T(1). DOC034-UNREACHABLE-NOTE |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| B-EXPECT-R47-RB | Medium | **დაიხურა** (Round 48: R48-S, R48-U a–e, G48-1 82 / 1387, verify exit 0; root-ის tree-ში უფრო მკაცრი named query) | `c-round-48.md` §1–§3 | — |
| C-R48-01 | Medium | **ბაგია** (გამეორებადი: სრული ტესტების gate დატვირთვისას უსაიმედოა — 5000 ms timeout-ები უცვლელ StudioWorkspace-ის ფაილებში: `track-layout`, `sfx-library`, `master-ui`, `fader-guards`; ცალკე ~2.1 s; თავდაპირველად `render-budget.test.tsx:547`) | `c-round-54.md` §4; `c-round-54/gates/`; `c-round-48.md` §8 | root-ის კონფიგი (`testTimeout`) ან Round 56: per-file timeout |
| RECONCILE-STAGE1-RECHECK | Medium | **დაიხურა** (Round 49 R49-S1: SN-1, SN-GROUP, SN-LANE, NU-1, UI-1, UI-5, LN-1, AU-1 reconcile-ის შემდეგ კოდზე) | `c-round-49.md` §9 | — |
| F1-ABSOLUTE-SNAP | Medium | **მიღებულია** (B, D-29z14: დოკუმენტირებული თვისება; reopen მხოლოდ R49-T-ის მტკიცებულებით) | root-r47 review F1 (quarantine); `review-original.md` | Tech Lead R49-T |
| ALT-CHROME-MENU | Info | **დაუდასტურებელი** (CDP კლავიში browser accelerator-ს არ აღწევს) | `b-round-48.md` §4 | Tech Lead R49-T |
| VIDEO-CLIP-TRANSLUCENT-GRID | Low | **ბაგია** (design: ბადის ხაზები ვიდეოკლიპის გამჭვირვალე ფონში ჩანს) | root-r47 review (design-philosopher) | backlog, არ იგეგმება ჯერ |
| C-R47-01 / A-R47-GROUP-LANE-DELTA | Low | **მიღებულია** (B, D-29z13; Snap-off-ის პარიტეტი; §0.4-ის ტექსტი გასწორდა) | `c-round-47.md` §5; `runs/grouplane2-*.txt` | — |
| GROUP-LANE-REFUSAL-TEXT | Low | **დაიხურა** (Round 49 GR-BEFORE: ghost-ები არ ჩანს, ზუსტი `before-start` ტექსტი) | `c-round-49.md` §8 | — |
| C-R49-01 | Low | **დაიხურა** (Round 50 SE20: მწვანეა და mutation (n)-ს კლავს) | `c-round-50.md` §3 | — |
| C-R49-02 | Low | **დაიხურა** (Round 50 SE21: მწვანეა და mutation (p)-ს კლავს) | `c-round-50.md` §3 | — |
| A-R50-REVIEW-CLIP-CANCEL-SEEK | Low | **დაიხურა** (Round 53 gate: მშვიდი verify 87 / 1497 / 0, CC1 მწვანე; C-ის mutation (i) CC1-მა მოკლა; რეალური `pointercancel` ბრაუზერში ვერ მოწმდება) | `c-round-53.md` §3, §4 | — |
| C-R52-01 | Medium | **დაიხურა** (Round 53: GS3/GS13 ხელახლა განისაზღვრა; მშვიდი verify rc 0, 87 / 1497 / 0) | `c-round-53.md` §4; `c-round-53/gates/verify-2.txt` | — |
| C-R52-02 | Medium | **დაიხურა იმავე ხაზზე** (Round 53: CM12, CM13, CT8, CE4, CE6; probe-ები P1m, P1s, P4); სხვა ხაზის ნარჩენი — C-R53-01 | `c-round-53.md` §3 | — |
| C-R52-03 | Low | **მოწმდება** (Round 53: unit/probe — CE5, CM14, CM15, CT7, P2, P2m; ბრაუზერის LN-SHORT არ გაშვებულა) | `c-round-53.md` §3 | Round 55: LN-SHORT ბრაუზერში |
| C-R52-T1 | Low | **აღრიცხულია** (ჯგუფის mutation (j) CM10-ს გადაურჩა) | `c-round-52.md` §3 | 4c (4b-ის შემდეგ): ტესტში დასაწყისის და დასასრულის სამიზნე |
| C-R53-01 | Medium | **მოწმდება** (Round 54: unit/probe — SL1, CM16, mutation-ები (a)(c)(e), P3x → stems 6.0004, P3x-END → 8.4004; ბრაუზერის CX-VIDEO/EP-CROSS არ გაშვებულა) | `c-round-54.md` §3 | Round 55: CX-VIDEO, EP-CROSS ბრაუზერში |
| C-R54-01 | Medium | **ბაგია** (round 54-ის რეგრესია: Shift-ით სხვა ხაზზე გადატანა sub-ms start-ს ვერ ინახავს — მეზობელთან უარი, ცარიელ ხაზზე 6-ზე ხვდება) | `c-round-54.md` §3, §6; `c-round-54/runs/probes.txt` (PS-TOUCH, PS-FREE) | Round 55 (D-29z20): CM9c, CM9d |
| C-R54-02 | Low | **ბაგია** (ძველი: იმავე ხაზზე Shift-drag sub-ms start-ს 6-ზე ცვლის და ისტორიას წერს) | `c-round-54.md` §6; `c-round-54/runs/probes.txt` (PS-SAME) | Round 55 (D-29z20): CM9e |
| C-R51-01 | Low | **ბაგია** (დაბლოკილი drop-ის სტატუსი რეალურ ბრაუზერში არ ჩანს — `dropEffect = 'none'`-ის გამო `drop` არ ხდება; ძველია). B: Q1 შესწორდა — უარს ghost-ის წითელი ტექსტი და კურსორი ატარებს (D-29z17) | `c-round-51.md` §6.1 | 4b (Round 56/57): C-ის `dragleave` probe, შემდეგ B-ის გადაწყვეტილება |
| C-R51-02 | Low | **ბაგია** (brace-ზე focus-ის შემდეგ კლიპზე click ისრებს brace-ს უტოვებს; ძველია). B: დეფექტია — კლავიატურა ბოლო დაჭერილ ობიექტს მიჰყვება | `c-round-51.md` §8.1 | 4b (Round 56/57): `releaseEditFocusOnTimelinePointerDown` |
| C-R51-T1 | Low | **დაიხურა** (Round 52: SL10/SL11 C-ის mutation (n)-ს კლავს) | `c-round-52.md` §3 | — |
| R51-ALT-NATIVE-DRAG | info | **აღრიცხულია** (Windows Chrome-ში Alt ნამდვილი drag-ისას drop effect-ს შეიძლება ცვლიდეს; PW/CDP ამას ვერ ამტკიცებს) | Round 51 D-29z16 Q1 | Tech Lead R51-T |
| ABLETON-LOOP-KEYS-NOT-REQUESTED | info | **აღრიცხულია** (Live 6.6-ის ↑/↓ და Ctrl-ის ვარიანტები მომხმარებელს არ უთხოვია) | `2.srt`, Live 6.6 | სიგნალი, არ იგეგმება |
| R49-OUTWARD-TRIM-SHRINK | Low | **აღრიცხულია** (root reviewer: აბსოლუტური snap-ით გარეთ trim კლიპს შეიძლება ამოკლებდეს — F1-ის შედეგი; ეტაპ 4-ის განხილვა: კიდეებზე snap ამას არ ცვლის) | `../studio-root-r49/review-result.json` | Tech Lead R49-T(3); კოდი არა (D-29z17) |
| R49-WIDE-DIVISION-RANGE | Low | **აღრიცხულია** (დანაყოფი კლიპზე გრძელია → body-ში შიდა მონიშვნა Alt-ის გარეშე შეუძლებელია; ეტაპ 4-ის განხილვა: Alt და 4b-ის დანაყოფის კლავიშები) | `../studio-root-r49/review-result.json` | Tech Lead R49-T(3); კოდი არა (D-29z17) |
| LANE-RANGE-OVERLAY-60 | Low | **დაიხურა** (Round 49 RG-USE: ოთხივე ხაზზე `/30`, computed alpha 0.3) | `c-round-49.md` §7 | — |
| DOC043-STATUS-LINE, CLIP-RANGE-OVERLAY-60 | Info / Low | **დაიხურა** (Round 47: R47-Doc, REG-RANGE — `oklab(… / 0.3)`) | `c-round-47.md` §9–§10 | — |
| **C-R27-01** | Medium | **ბაგია** (round 28, r26 layout: vm-3 125.4 off-procedure, vm-4 19.0, vm-5 287.6 ms; hardSeek 0 ყველგან; row 3) | `c-round-27.md` §7; `c-round-28.md` §6; `c-round-28/runs/vm-*.txt` | Tech Lead quiet Chrome (C-R6-02/C-R8-01-თან ერთად). A-ს რაუნდი არ ინიშნება მექანიზმის ჰიპოთეზის გარეშე (D-29t) |
| C-R27-02 | Low | **დაიხურა** (Round 29: round-27-ის 8 ფაილიანი batch 152/152 ×3, `node.exe` 10 < 30 — D-29t-ის წესი) | `c-round-29/gates/vitest-r27batch-1..3.txt` | — |
| C-R28-01 | Low | **დაიხურა** (Round 29: R29-PA/PB/PC/PD; mutation a–c) | `c-round-29.md` §3 | — |
| C-R28-02 | Low | **დაიხურა** (Round 29: R29-NO zero-width გაჩერებული და დაკვრისას; არანულოვანი — მხოლოდ provider ტესტი) | `c-round-29.md` §4 | — |
| A-R28-REVIEW-4 | Low | **დაიხურა** (Round 29: R29-FT, geometry = round 28) | `c-round-29.md` §4 | — |
| A-R29-REVIEW-1 | Low | **მიღებულია** (B, D-29z8; კოდის გარეშე; C-ის მტკიცებულება არ არის) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | flush-ით ჩაწერილი pending Volume/Master ნამდვილი, შეუნახავი ცვლილებაა; no-op Cut Time-ის შემდეგ undo label მას სწორად ასახელებს, status Cut Time-ზე ლაპარაკობს. მიღწევადია მხოლოდ key rollover-ით (fader-ზე ისარი დაჭერილი + Ctrl+Shift+X) |
| C-R31-02 | Medium | **დაიხურა** (Round 33: C-R32-01-თან ერთად — რეალური click-ების მატრიცა შლის, round-32-ის must-not 5/5) | `c-round-33.md` R33-FT | — |
| C-R31-01 | Low | **დაიხურა** (Round 32: R32-BC PASS) | `c-round-32/runs/bc-*.txt` | — |
| R31-U-GAP-B2 | Low (ტესტის ხარვეზი) | **დაიხურა — მიღებულია დამცავ კოდად** (Round 32: A-ს ჩამონათვალმა reachable გზა ვერ იპოვა; C-ის b2 გადარჩა, როგორც მოსალოდნელი იყო) | `a-round-32.md` §1.4; `c-round-32.md` R32-U | — |
| A-R31-REVIEW-2 | Low | **დაიხურა** (Round 42: C R42-RW, R42-U) | `c-round-42.md` §4.2, §5 | — |
| C-R32-01 | Medium | **დაიხურა** (Round 33: R33-FT PASS — 5 fader × 4 სამიზნე, Delete და Backspace) | `c-round-33/runs/ft-matrix.txt`, `ft-clipbody-ruler.txt`, `dk-retention-rerun.txt` | — |
| A-R32-REVIEW-1 | Low | **დაიხურა** (Round 42: C R42-PK, R42-U) | `c-round-42.md` §4.1, §5 | — |
| FOCUS-TEXT-STALE | Medium | **დაიხურა** (Round 34: R34-TS — ძებნა → 4 სამიზნე, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280; must-not) | `c-round-34/runs/ts-1440.txt`, `ts-1280.txt`, `ts-mustnot.txt` | — |
| CLIP-GAIN-CLICK-DISCARD | Medium | **დაიხურა** (Round 34: R34-CG — კლიპის/lane-ის სამიზნეები; range სამიზნე → C-R34-01) | `c-round-34/runs/cg-1to4.txt`, `cg5.txt`, `cg-unchanged.txt`, `cg6-1..4.txt` | — |
| A-R33-REVIEW-SCROLLBAR | Low | **დაიხურა კოდისთვის** (Round 34: gutter synthetic, ცარიელი ადგილი რეალური click-ით, mutation b/c/g მოკლულია) | `c-round-34/runs/sb-*.txt` | რეალური scrollbar — Tech Lead-ის R34-T(3), Firefox-ის overlay ვარიანტით |
| A-R33-REVIEW-TOUCH | Low | **Tech Lead-ის შემოწმება** (R38-T; D-29z8) | `a-round-33.md` §4; `a-round-34.md` §4 R4 | touch scroll timeline-ზე fader-ს/ტექსტურ ველს ათავისუფლებს, pending ადრე იწერება (მონაცემი არ იკარგება). `pointerType touch`-ის გამორიცხვა touchscreen ლეპტოპზე C-R32-01-ს დააბრუნებდა → ცვლილება მხოლოდ მოწყობილობის მტკიცებულებით |
| C-R34-01 | Medium | **დაიხურა** (Round 36: R36-CR 5/5 + ორი Undo + 1280, R36-CL 3/3, mutation a–f) | `c-round-36/runs/cr-1440.txt`, `cr-1280.txt`, `cl.txt` | — |
| C-R34-02 | Low | **დაიხურა** (Round 36: R36-Doc) | `c-round-36/gates/snap-036.diff` | — |
| C-R36-01 | Medium | **დაიხურა** (Round 37: R37-PG PG-1/2/3 + 1280, mutation a = snapshot → ზუსტად N1–N3 წითელი) | `c-round-37/runs/pg-1440.txt`, `pg-1280.txt` | — |
| A-R36-TEST-NITS | Low | **დაიხურა** (Round 37: R37-S, mutation e) | `c-round-37/gates/snap-*.diff` | — |
| DOC036-R36-REVIEW-SENTENCE | Low | **დაიხურა** (Round 37: R37-Doc) | `c-round-37.md` §8 | — |
| C-R37-01 | Low | **დაიხურა** (ნაწილები 1–2 — Round 39 PASS; ნაწილი 3 მიღებულია; ხილვადობა — Round 40 R40-PM PASS) | `c-round-39.md` R39-PM, R39-ST; `c-round-40.md` §2 | — |
| C-R39-01 | Low | **დაიხურა** (Round 40: R40-PM PASS — 1 ხაზი, 69.8 × 16, scroller +0 1440-ზე და 1280-ზე) | `c-round-40.md` §2; `c-round-40/runs/pm-1440.txt`, `pm-1280.txt`; `shots/pm1-1440.png` | — |
| DETAIL-REASON-FIT | Low | **გადაკეთდა C-R40-01-ად** (Round 40: C-მ რეალური მდგომარეობები გაზომა, R40-RS) | `c-round-40.md` §3 | → C-R40-01 |
| C-R40-01 | Low | **დაიხურა** (Round 41: R41-RV 6/6 — ყველა მიზეზი `scrollTop` 0-ზე ჩანს 1440-ზე, 1280-ზე და 120 px-ზე; R41-SB) | `c-round-41.md` §4.1, §4.2; `c-round-41/shots/rv-*.png` | — |
| **C-R41-01** | Low | **ბაგია** (Tech Lead-ის კითხვა TL-Q-VIEWPORT; 1280×720 და 1440×900-ის გარეთ) | `c-round-41.md` §9; `c-round-41/runs/narrow-1024.txt`; `shots/narrow-grp-1024.png`; `checkpoint-r41-review.md` Low 2 | 1024×768: ვიდეოს მიზეზი `overflow-hidden` ყუთში ზემოდან/ქვემოდან 4.5 px-ით იჭრება (scroll არ არის), ჯგუფის — 28 px-ით ქვემოთ (scroll-დება). თუ ვიწრო სიგანე ფარგლებშია — ჯგუფ 3-მდე; კანდიდატი `b-round-41.md` §4 (ჰიპოთეზა) |
| DOC038-STALE-LINES | Low | **დაიხურა** (Round 41: R41-Doc PASS) | `c-round-41.md` §5 | — |
| DETAIL-RESET-SHRINK | info | **არ დაწყებულა** (დეფექტი არ გაზომილა) | `a-round-40.md` §5 #4; `c-round-40.md` §2 | `0 dB`-ს `shrink-0` — B-ის არჩევანი, თუ ნიშანი ~80 px-ს გადააჭარბებს |
| ENV-BROWSE-DAEMON | info | **არ ეხება კოდს** (გარემო) | `c-round-40.md` §0, §10; `c-round-42.md` §1; `c-round-43.md` §8, `c-round-43/runs/daemon-diag.txt` | Round 43-ში CLI-ით გაშვებული daemon-ები უმოქმედოდაც კვდებოდა. Round 44-იდან დამტკიცებული fallback: საკუთარი `server-node.mjs` (`BROWSE_PARENT_PID=0`, ახალი state, log); `$B restart` აკრძალულია |
| ESC-DESELECT-NOTE | info | **აღრიცხულია** (არ იგეგმება) | `c-round-41.md` §0; `c-round-41/runs/esc-record.txt` | Playhead-ზე focus-ით REAL Escape ჯგუფს არ აუქმებს; round 40-ში იგივე თანმიმდევრობით გაუქმდა; C — focus-ზე დამოკიდებული, ბაგი არ არის |
| TASK-R42-REGDEL | Low | **დაიხურა** (task-ის ტექსტი) | `c-round-42.json`; `a-round-42.md` §7 | B-ის შეცდომა: fader-ზე focus-ით Delete/Backspace კლიპს ინარჩუნებს, 0 ჩანაწერი, Space მუშაობს (C-R31-02). Round 43-ის REG-DEL სწორია |
| FOREIGN-CI-YML | Low | **დაიხურა** (root-ის მტკიცებულება) | `c-round-42/gates/ci-yml-foreign-diff.txt`; commit `b6a96f8` | root-მა `ci.yml` და `vercel.json` განზრახ დააკომიტა |
| GSTACK-ACL | Low | **root** (გარემო) | `c-round-42/gates/acl-record.txt` | `tmp/studio-real-loop` და `tmp` — ერთი non-inherited owner-only ACE; დრო უცნობია; A/C ACL ბრძანებას არ უშვებს |
| R41-RECORDS | info | **აღრიცხულია** | `c-round-41.md` §4.2–§4.4 | SB-4 (Shift+Tab scroller-ს აღწევს, ArrowDown scroll-ავს); 120 px-ზე none-ის მიზეზი 7/13 px (info hint იგივეს ამბობს); MN-4 overlay მიზეზს ნაწილობრივ ფარავს, იკითხება |
| SSR-LAYOUT-EFFECT-WARN | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §2–5 (R45-S, R45-U mutation a–h, R45-SSR Δ 0 ×3, R45-REG) | — |
| C-R31-INFO-REFUSAL-STATUS | info | **დაიხურა** (Round 39: R39-ST-1..6 + ST-1280 PASS) | `c-round-39.md` R39-ST; `c-round-39/runs/st-1440.txt` | — |
| PENDING-COMMIT-ORDER | Low | **დაიხურა — მხოლოდ unit** (Round 39: R39-PO, PO1 წითელია snapshot-ზე, mutation g/h; ბრაუზერში აუგებელია) | `c-round-39.md` R39-PO; `c-round-39/runs/mut-red-snapshot.txt` | — |
| C-R38-01 | Low | **ბაგია** (Tech Lead-ს ელოდება, C-R23-01-თან ერთად) | `c-round-38/runs/studio-lab.html`, `sl1-3.html`, `c-r23-01-dom.txt` | NUL byte-ები ორ `aria-label`-შია, hydration ვერ ასწორებს; round-38-ის ლოგიკა მიზეზი არ არის (მხოლოდ offset-ის გადაწევა); production build არ შემოწმებულა |
| A-R38-TEST-ORDER | Low | **მზადაა** (Round 43; ეკვივალენტობა დადასტურდა) | `c-round-43.md` §4; doc 040 | mutation (i) 155/155 ცოცხალია, მაგრამ განსხვავებული შემთხვევა არ არსებობს: root capture და begin-ის flush-ები ერთსა და იმავე შედეგს იძლევიან. S1–S5 — contract pin-ები |
| A-R38-REVIEW-TOUCH | Medium (დაუდასტურებელი) | **Tech Lead-ის შემოწმება** (R38-T) | `checkpoint-r38-review.md` Medium; `a-round-38.md` §4 | touch-ზე range-ის native slide შეიძლება დარჩეს; მოწყობილობაზე დადასტურებისას: non-passive `touchstart` + `preventDefault` სამ fader-ზე (Zoom გარდა). ბრმად არ კეთდება |
| PREVIEW-VOLUME-IDENTITY | info | **მზადაა** (Round 44; `ca85109`) | `c-round-44.md` §2–5 (R44-U PV1–PV8, mutation a–h; REG-VOL-DBL, REG-VOL-PLAY) | — |
| C-R37-02 | Low | **დაიხურა** (B: `plan.md` D-29z3 — ადრინდელი D-29z2 მე-5 სტრიქონი ნედლ ტექსტს ადარებს) | `c-round-37/runs/mn.txt` MN-2b | — |
| DOC036-R37-TAIL | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §6 | — |
| DOC036-ROUND-REF | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §6 | — |
| A-R37-TEST-HARDENING | Low | **მზადაა** (Round 43; `2c0f800`) | `c-round-43.md` §2, §4 (e) | N5 ახალ pin-ზე წითლდება, snapshot-ზე — არა; N1/N2 focus-ს რეალურად გადაიტანს |
| CP-R37-PAN-KEY-LOCK | Low | **დაიხურა** (Round 42, A-R32-REVIEW-1-თან ერთად) | `c-round-42.md` §4.1 | — |
| CP-R37-DRAG-ENTRIES | info | **დაიხურა** (Round 42, A-R31-REVIEW-2-თან ერთად) | `c-round-42.md` §4.2 | — |
| CP-R37-PAN-CLAMP | info | **მიღებულია** | `checkpoint-r37-review.md` #3, #4 | `trackPanValue`/`handle.setTrackPan` clamp-ის გარეშე; დღეს ყველა გამომძახებელი ნორმალიზებულ მნიშვნელობას აწვდის, import/persistence არ არის |
| DOC015-DELETE-GAP-NOTE | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §6 | — |
| EXPORT-DIALOG-FOCUS-RESTORE | Low | **მზადაა** (Round 46; `d2f6715`) | `c-round-46.md` §2–4 (R46-S, R46-U mutation a–e + f1/f2, R46-FOCUS); `[hidden]` — მხოლოდ unit (HD1–HD3) | — |
| A-R34-REVIEW-RESIDUALS | Low | **არ დაწყებულა** | `a-round-34.md` §4 R2, R3, N | RTL-ის მარცხენა scrollbar, Firefox-ის overlay scrollbar (R34-T), მარჯვენა ღილაკი Clip Gain-ს commit-ს უკეთებს (native blur-ის ტოლი), `transform`/zoom → 4b-2 ან საბოლოო რეგრესია |
| OUTSIDE-SCROLLER-DELETE | info | **მიღებულია** (D-29y 4) | `c-round-33/runs/rec-outside.txt` | ბიბლიოთეკის item-ზე click-ის შემდეგ Delete timeline-ის მონიშვნას შლის: ბიბლიოთეკას წაშლის მოქმედება არ აქვს |
| C-R30-01 | Low | **დაიხურა** (Round 40: R40-INFO PASS — 16 px ხაზები, გადაფარვა არ არის, scroll ბოლომდე) | `c-round-40.md` §4; `shots/info-music-range-1280.png`, `info-music-range-scrolled-1280.png` | — |
| DOC035-NOTES | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §6 (status string byte-equal to the live status) | — |
| FADER-KEY-ENTRIES | Low | **მიღებულია** (B, D-29z8; კოდის გარეშე) | `c-round-30.md` §7; `c-round-42.md` §4.3 (REG-FADERS, REG-KEYS) | Volume/Master keyup-ზე, Pan — ყოველ ცვლად კლავიშზე: სამივე fader-ზე ერთი კლავიში = ერთი ჩანაწერი (D-29v). C ხელახლა აღრიცხავს Round 43 REG-FADERS-ში. Ableton-ის მტკიცება არ კეთდება |
| DOC034-UNREACHABLE-NOTE | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §6 | — |
| L3-REMOVED-TRACK-TAPS | Low | **არ დაწყებულა** | `a-round-27.md` §4 (L3); doc 033 | წაშლილი ხაზის tap/state არ იწმინდება (ხაზები დღეს ფიქსირებულია) → საბოლოო რეგრესიამდე |
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout |
| C-R8-01 | Medium | **ბაგია** (R9-D3 PASS; mode D info round 21: max .0183, LoAF 0) | `c-round-9.md` §2, §7; `c-round-21.md` §2.7 (მხოლოდ ინფორმაცია) | Tech Lead quiet Chrome, R3-V1 D layout. L2/L3 მასთან ერთად (D-29h) |
| **C-R23-01** | Medium | **ბაგია** (round 38: 5 NUL — 11729, 28025/28026, 58745/58746, 63 611 byte; ორი `aria-label` hydration-ის შემდეგაც დაზიანებულია = C-R38-01; round 28: 2 NUL — 28013/28014; round 27-ის 58733/58734 footer-ის ტექსტის შეცვლით გაქრა — offset-ის გადაწევა, არა გამოსწორება) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-26.md` §16; `c-round-26/runs/c-r23-01-record.txt` | Tech Lead: (a) React 19 ან (b) `entry.server.tsx`-ის ვიწრო grant A-სთვის NUL-ის ფილტრისთვის (`b-round-23.md` §3). C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს |
| R9-REVIEWER-M1-L8 | Low | **მზადაა** (Round 44; `ca85109`) | `c-round-44.md` §2–5 (R44-S, R44-U, R44-TR) | — |
| R26-M1 | Low | **არ დაწყებულა** | `a-round-26.md` §4 (M1); `c-round-26.md` §17.5 | rAF-ზე მიბმული sampling-ი > 85 ms stall-ზე ან დამალულ tab-ში over-ს შეიძლება გამოტოვებს (C: max gap 28.8 ms). AudioWorklet module URL-ს საჭიროებს, `public/**` კი აკრძალულია → hardening SRW-13 ეტაპი 4-ის შემდეგ, ან Tech Lead-ის მიღება |
| DEMO-SFX-FULL-SCALE | Low | **დაბლოკილია** (Tech Lead-ის გადაწყვეტილება) | `c-round-26.md` §17.3 | `Soft impact` თავისთავად full scale-ს აღწევს (`+0.0` Clip, export 2 sample). (a) `lib/sfx-*`-ის grant ნორმალიზებისთვის ან (b) მიღება. პრედიკატი უცვლელია |
| MASTER-HOLD-TICK-EDGE | Low | **მზადაა** (Round 43; `2c0f800`) | `c-round-43.md` §3, §4 | ≥ +6 dB-ზე tick მთლიანად ყუთშია (1440 და 1280); ≤ +5 dB-ზე პოზიცია უცვლელია (max 0.061 px) |
| A-R43-EXACT-5DB | Low | **მიღებულია** (D-29z9) | `a-round-43.md` §5 | ზუსტად +5.0-ზე ორივე branch წესებს აკმაყოფილებს (Δ 0.21 ≤ 0.5, ყუთში) |
| A-R43-REVIEW-W66 | Low | **მიღებულია** (დაკვირვებით, D-29z9) | `a-round-43.md` §5; doc 040 | meter `w-20` (80 px); სიგანის ცვლილებისას R43-HT თავიდან |
| A-R43-REVIEW-ROOTFONT | info | **მიღებულია** (D-29z9) | `a-round-43.md` §5; doc 040 | 16 px root-ზე; zoom px-სა და rem-ს თანაბრად ცვლის |
| ROOT-ROUND43-CHECKPOINT-RECORD | info | **დაიხურა** (Round 44) | `publication-checkpoint.json` → `round43Checkpoint` | — |
| LIB-SEP-REASON | Low | **მზადაა** (Round 45; `8b9c813`) | `c-round-45.md` §2 (R45-S) | — |
| SETTRACKMIX-NAN-IDENTITY | Low | **არ დაწყებულა** | `a-round-44.md` §5 (code-reviewer, არსებული); `c-round-44.md` §8 | `setTrackMix`: `isFinite` guard + უცვლელზე იგივე ობიექტი (`setMasterMix`-ის მსგავსად) — პირველ რაუნდში, რომელიც `model.ts`-ს ხსნის |
| DOC036-STATUS-LINE | info | **მზადაა** (Round 46; `d2f6715`) | `c-round-46.md` §7 | — |
| DOC042-STATUS-LINE | info | **მზადაა** (Round 46; `d2f6715`) | `c-round-46.md` §7 | — |
| BIOME-HOOKS-DEPS | Low | **root** (`biome.json`) | `a-round-45.md` §5; `c-round-46.md` §2 (8 site) | `useExhaustiveDependencies.options.hooks`-ში `useIsomorphicLayoutEffect` და `usePositionWriterEffect` |
| A-R45-SSR4 | info | **მიღებულია** (B, D-29z11) | `a-round-45.md` §2; `c-round-45.md` §3 | positive control; 1357-ში ითვლება |
| B-EXPECT-RANGE-TEXT, B-EXPECT-DP-START-1280, REG-ZOOM-HISTORY-NOTE | info | **დაიხურა** (task-ის ტექსტი; `harness_rules`) | `c-round-45.md` §5, §8 | — |
| ARCH-CHECKPOINT-SRW13 | info | **root-ს ეთხოვა** (არ აჩერებს; პასუხი ჯერ არ ჩანს) | `b-round-45.md` §6; მსგავსი შეფასება `frontend-architecture-pragmatic-2026-10-15.md` (`ca85109`) | P1–P3 backlog-ის სიგნალებია; extraction მხოლოდ ცალკე დავალებით |
| ROOT-ROUND45-CHECKPOINT | info | **დაიხურა** (root: `8b9c813` + `1381b0b`, ორივე remote) | `publication-checkpoint.json` → `round45Checkpoint` | — |
| ROOT-ROUND46-CHECKPOINT | info | **დაიხურა** (root: `d2f6715`, ორივე remote) | `publication-checkpoint.json` → `round46Checkpoint` | — |
| A-R46-RESTORE-SELECTION | Low | **მიღებულია** (B, D-29z12 — დოკუმენტირებული საზღვარი) | `a-round-46.md` §5; `c-round-46.md` §4 (Chrome, მხოლოდ SYNTHETIC) | REAL შეყვანით მიუღწეველია; ხელახლა იხსნება მხოლოდ REAL გზის მტკიცებულებით |
| B-EXPECT-R46-F | info | **დაიხურა** (task-ის ტექსტი; `harness_rules`) | `c-round-46.md` §3 | — |
| F-VIDEO-OPENER-UNIT-ONLY | info | **ჩაწერილია** | `c-round-46.md` §4 | ვიდეოს ✕-ზე დაბრუნება მხოლოდ unit-ით (REAL გზა არ არსებობს) |
| DOC043-STATUS-LINE | info | **მუშავდება** (Round 47, D-29z12 §0.6) | `c-round-46.md` §7 | doc 043 l.4. C: R47-Doc |
| CLIP-RANGE-OVERLAY-60 | Low | **მუშავდება** (Round 47, D-29z12 §0.4) | `plan.md` l.395 (round 18-ის ვალდებულება) | `ArrangementClip.tsx` l.589 `/60` → `/30`. C: R47-S, REG-RANGE |
| SSR-HTML-OFFSETS-R47 | info | **ჩაწერილია** | `current-task.md` §4.10 | Round 47 SSR HTML-ს ცვლის — C-R23-01-ის offset-ების გადაადგილება გამოსწორება არ არის |
| ROOT-ROUND44-CHECKPOINT | info | **დაიხურა** (root: `ca85109`, ორივე remote) | `publication-checkpoint.json` → `round44Checkpoint` | — |

Critical/High ღია ბაგი არ არის.

**Round 44:** დაიხურა R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY (C), ROOT-ROUND43-CHECKPOINT-RECORD (root-ის ჩანაწერი). ახალი: SETTRACKMIX-NAN-IDENTITY (Low, არსებული), ROOT-ROUND44-CHECKPOINT (root). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026), 1 U+FFFD `aria-label` (უცვლელი).

**Round 43:** დაიხურა MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING, A-R38-TEST-ORDER (ეკვივალენტობა), TASK-R43-HTZERO, ROOT-ROUND42-CHECKPOINT-RECORD. მიღებულია (B, D-29z9): A-R43-EXACT-5DB, A-R43-REVIEW-W66 (დაკვირვებით), A-R43-REVIEW-ROOTFONT. ახალი: ROOT-ROUND43-CHECKPOINT-RECORD (root). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (უცვლელი).

**Round 42:** დაიხურა A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES, TASK-R42-REGDEL, FOREIGN-CI-YML. მიღებულია (B, D-29z8): FADER-KEY-ENTRIES, A-R29-REVIEW-1. Tech Lead-ს: A-R33-REVIEW-TOUCH. ახალი: GSTACK-ACL (root). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (უცვლელი).

**Round 41:** დაიხურა C-R40-01, DOC038-STALE-LINES. ახალი: C-R41-01 (Low, 1024×768, Tech Lead-ის კითხვა), ESC-DESELECT-NOTE და R41-RECORDS (info). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (round 40: 2).

**Round 40:** დაიხურა C-R39-01, C-R30-01, C-R37-01; DETAIL-REASON-FIT → C-R40-01 (Low, Round 41). ახალი: DOC038-STALE-LINES (Low), DETAIL-RESET-SHRINK (info), ENV-BROWSE-DAEMON (გარემო). C-R23-01/C-R38-01: 5 NUL იგივე offset-ებზე (63 654 byte), 2 U+FFFD `aria-label` (round 39: 1).

**Round 39:** დაიხურა C-R31-INFO-REFUSAL-STATUS, PENDING-COMMIT-ORDER (unit-only), C-R39-INFO-KEPT-PREMISE. C-R37-01 — მხოლოდ ხილვადობა დარჩა (C-R39-01). ახალი: C-R39-01 (Low), DETAIL-REASON-FIT (Low, B probe), SSR-LAYOUT-EFFECT-WARN (Low). MARKER-LIVE-REGION უარყოფილია (D-29z5).

**Round 38:** ბაგი არ დახურულა (ერთი ფუნქცია). ახალი: C-R38-01 (Low, C-R23-01 `aria-label`-ებში), A-R38-TEST-ORDER (Low), A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი), PREVIEW-VOLUME-IDENTITY (info). PENDING-COMMIT-ORDER backlog-ში ცალკე ID-ით ჩაიწერა (oct13 review #5). C-R23-01: 5 NUL (63 611 byte).

**Round 37:** დაიხურა C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE, C-R37-02 (B-ის ფორმულირება). ახალი Low: C-R37-01, DOC036-R37-TAIL, DOC036-ROUND-REF, A-R37-TEST-HARDENING; checkpoint-r37 review: CP-R37-PAN-KEY-LOCK, CP-R37-DRAG-ENTRIES (info), CP-R37-PAN-CLAMP (მიღებულია). C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 36:** დაიხურა C-R34-01 და C-R34-02. ახალი: C-R36-01 (Medium, არსებული, multi-pointer), A-R36-TEST-NITS და DOC036-R36-REVIEW-SENTENCE (Low). checkpoint-oct13 review-ის Low-ები დახარისხდა (`b-round-36.md` §6): #1 → DOC015-DELETE-GAP-NOTE, #2 = L3, #3/#4 → 4c ან მიღება, #5 = 4b, #6 → EXPORT-DIALOG-FOCUS-RESTORE, #7 მიღებულია, #8 → C-R6-02/C-R8-01, #9 → root. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 35:** A §1.4-ზე გაჩერდა (frozen ტესტი), `store/` უცვლელია; C BLOCKED; C-R34-01 ისევ მეორდება; G35-2/G35-3 PASS. C-R23-01: 2 NUL (უცვლელი).

**Round 34:** დაიხურა FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR. ახალი: C-R34-01 (Medium), C-R34-02 (Low), A-R34-REVIEW-RESIDUALS (Low). C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 33:** დაიხურა C-R32-01 და C-R31-02. ახალი: FOCUS-TEXT-STALE დადასტურდა (Medium), CLIP-GAIN-CLICK-DISCARD (Medium), A-R33-REVIEW-SCROLLBAR და A-R33-REVIEW-TOUCH (Low); OUTSIDE-SCROLLER-DELETE მიღებულია. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 32:** დაიხურა C-R31-01, R31-U-GAP-B2 (მიღებულია), R24-HC-COVERAGE. C-R31-02 იზოლირებულად გასწორდა. ახალი: C-R32-01 (Medium), A-R32-REVIEW-1 (Low), FOCUS-TEXT-STALE (დაკვირვება). C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 31:** ბაგი არ დახურულა. ახალი: C-R31-02 (Medium, არსებული ქცევა — A-მ იპოვა, C-მ ბრაუზერში დაადასტურა), C-R31-01 (Low), R31-U-GAP-B2, A-R31-REVIEW-2. ინფორმაცია: refusal status drag-ის შემდეგაც ჩანს (→ 4b); 50L-ზე track meter-ის over-0 მოსალოდნელია (pre-Master). C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 30:** ბაგი არ დახურულა (რაუნდის scope-ში ახალი არ იყო). ახალი Low: C-R30-01 (არსებული ქცევა), DOC035-NOTES, FADER-KEY-ENTRIES. C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 29:** დაიხურა C-R28-01, C-R28-02, A-R28-REVIEW-4 და C-R27-02. ახალი Low: A-R29-REVIEW-1, DOC034-UNREACHABLE-NOTE. C-R23-01: 2 NUL 28013/28014 (უცვლელი). ინფორმაცია: C-ის პირველი არავალიდური mutation მცდელობისას `npx`-მა `vitest@5.0.4` npm cache-ში ჩამოტვირთა (store უცვლელია) → root-ის ჩანაწერი.

**Round 28:** ბაგი არ დახურულა. ახალია C-R28-01 და C-R28-02 (Low); A-R28 review finding 4 ბაგად ჩაიწერა (Low), finding 5 მიღებულია (Split ღილაკი enabled რჩება და click-ზე status-ით უარს ამბობს). ინფორმაცია: Ctrl+Shift+L-ის შემდეგ ცარიელ ადგილზე click-ზე status ძველია (ცნობილი pattern); ჭრის კიდეებზე fade არ არის → SRW-18. C-R23-01: 2 NUL.

**Round 27:** ბაგი არ დახურულა. ახალია C-R27-01 (Medium) და C-R27-02 (Low). C-R23-01: 4 NUL 28013/28014 და 58733/58734 — offset ისევ გადაინაცვლა, ეს გამოსწორება არ არის.

**Round 26:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01: 8 → 4 NUL (28013/28014, 44397/44398) — offset-ების გადაწევა, არა გამოსწორება. ახალი Low ჩანაწერები: R26-M1, DEMO-SFX-FULL-SCALE, MASTER-HOLD-TICK-EDGE.

**Round 25:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01 გაუარესდა: 4 → 8 NUL (3536/3537, 11728/11729, 26924/26925, 43308/43309), სამი ხილულ ტექსტში hydration-მდე.

**Round 24:** ბაგი არ დახურულა და ახალი არ არის. C-R23-01 უცვლელია (4 NUL, იგივე offset-ები).

**Round 23:** ბაგი არ დახურულა (ახალია C-R23-01).

**Round 22-ში დაიხურა:** C-R21-01 — mute-ის de-click (`c-round-22.md` §2.1–§2.2: −240 dBFS beep-ზე, რომელიც mute-იდან 60.7 ms-ში დაიწყო; ramp 2.9 dB/ms).

**Round 21-ში დაიხურა:** C-R12-01. Decision table-ის მე-2 სტრიქონით: ყველა pre-arm ჩაწერა |d_dock| > 0.02-ზე იყო (min 0.020129, ზღვარი 0.13 ms; `c-round-21.md` §2.5). ცხრილი წესად რჩება ყოველი მომავალი RF5-3-ისთვის.

**ადრე დაიხურა:** C-R18-01 (Round 19); C-R16-01, M-R10-1/M2 (Round 17); C-R11-01..03, C-R15-02/03 (Round 16); C-R14-01/02 (Round 15); C-R13-01..03 (Round 14); C-R7-01 headless (Round 12; Tech Lead RF7-3 რჩება); C-R7-02 (Round 10).

**მიღებული (კოდი არ იცვლება):** იხ. `feature-status.before-b-round-21.md` §3 (D-29g..D-29j-ის deviation-ები, C-R15-01, C-R11-04, `export-clip-onset-1lsb`, round-12 reviewer Low 1 და სხვ.). სია უცვლელია.

**ჩანაწერები (ბაგი არ არის):**
- C round 21: R11-P3-ის body rect round 15-ის შემდეგ შეიცვალა (1440-ზე body.b 664, round 15-ში 684). D-29f-ის ფორმულა ორაკულია და Δ ≤ 0.02-ით დაემთხვა.
- C round 21: Escape ჯგუფის მონიშვნას არ ხსნის (deselect = click ცარიელ ადგილას). ეს კონტრაქტის ნაწილია.
- C round 21: 1280-ზე detail panel persisted-ად დაკეცილი იტვირთება, cap 142.
- D-29g residual; harness-ის წესი H3; `sfx-library` flake (round 12–21-ში არ განმეორდა); hard seek 8.44–8.48 წმ-ზე Pause-ის snap-ია.
- Lane-ის overlay `/60` → Round 47-ში სწორდება (CLIP-RANGE-OVERLAY-60, `ArrangementClip.tsx` იხსნება).
- `ArrangementLane.tsx:661`-ის მიზეზის ტექსტი → Round 23-ში გასწორდა (C R23-S PASS).
- C round 23: tight video ხაზზე სახელის ღილაკის top = header-ის top (inset 0) — inset ring-ით უსაფრთხოა.
- `entry.server.tsx` `Content-Type: text/html`-ს charset-ის გარეშე აგზავნის — დაკვირვება, C-R23-01-ის Tech Lead-ის კითხვის ნაწილი.
- C round 22: demo ცარიელი arrangement-ით იტვირთება; export-ის 864 000-იანი reference `lay11`-ს ეკუთვნის (`acceptance_amendments`).
- C round 22: volume slider-ზე click მნიშვნელობას click-ის წერტილზე სვამს (native range) — **გამოსწორდა Round 38-ში** (C R38-PG: რეალური click აღარ ხტება).
- A round 22 deviation 4: in-place mutation dev server-მა შეიძლება დაინახა; round 23-იდან mutation მხოლოდ `store/`-ის გარეთ.
- **Root-ისთვის:** უცხო agent ფაილები; round 6–21-ის დაუკომიტებელი სამუშაო; A-ს round-17 deviation 4 და round-19 deviation 5; C-ის round-21 გაჭედილი python probe (pid 1045, C-მ თავისი პროცესი თავად გათიშა).

## 4. რეგრესიის ვალი

Milestone-ის სრული რეგრესია **დასრულდა** (D-29k, D-29l):
- **Run 1 (Round 20):** C PASS, 17/17.
- **Run 2 (Round 21):** ყველა ID გაეშვა. ერთადერთი ჩავარდნაა R3-V2 → C-R21-01. Not-run ID არ არის.

R3-V2 Round 22-ში ხელახლა შემოწმდა (R22-M1 + R22-V, PASS).

სრული რეგრესია ისევ საჭიროა ეტაპის დასრულებისას (SRW-13..20-ის შემდეგ) და საბოლოოდ, root-ის შემოწმებამდე.

## 5. Tech Lead-ის ხელით შემოწმებები (რეალური Chrome/მაუსი)

| ID | რა | რატომ |
|---|---|---|
| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag (Round 41-იდან detail panel-ის content-იც — 1280×720, ჯგუფი) | headless native scrollbar-ს მალავს |
| R12-L4 | ბიბლიოთეკიდან ხაზზე HTML5 drag რეალური მაუსით | C synthetic DragEvent-ს იყენებს |
| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, **mode D**-ის ჩათვლით) და loop wrap-ის landing სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის |
| R8-M1 / R8-M2 | ხაზებს შორის drag Shift-ით რეალური მაუსით | synthetic pointer |
| R10-N1 / R10-N2 | Ruler drag, რეალური Ctrl+wheel და pinch | gstack-ს wheel არ აქვს |
| R30-H1 | Volume slider რეალური მაუსით / multi-touch / focus-ის რიგით | synthetic pointer |
| R11-P3m | Detail-ის გამყოფის, ხაზის სიმაღლის და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit რეალური 10 px scrollbar-ით | headless 10 px gutter-ს იტოვებს (`scrollbar-gutter: stable`), მაგრამ scrollbar-ს არ ხატავს; ჰორიზონტალური 0 px-ია (C round 34) |
| R13-RM | ნამდვილი `prefers-reduced-motion` | CDP emulation დაბლოკილია |
| R15-SB | ბიბლიოთეკის 10 px scrollbar-ები გაფართოებული ვიდეოს დროს | headless native scrollbar-ს მალავს |
| R17-T | Preview-ის ორხაზიანი row Windows-ის Georgian font-ებით | font metrics |
| R18-T | რეალური wheel detail-ის ველზე | gstack-ს wheel არ აქვს |
| R19-T | Detail-ის ქართული label-ები რეალურ Chrome-ში | font metrics |
| Lenis `/studio/*` | Purchased Studio-ს wheel | protected route |
| MP4/MOV | H.264/AAC-ის დადებითი import | headless Chromium-ის კოდეკები |
| **R22-T** | Mute/unmute-ზე click არ ისმის: მოსმენა ყურსასმენით რეალურ Chrome-ში (τ 3 ms) | headless-ში მოსმენა შეუძლებელია |
| **R25-T** | Master-ის fader რეალური მაუსით; Master Mute/unmute-ზე click არ ისმის (ყურსასმენი) | synthetic pointer; headless-ში მოსმენა შეუძლებელია |
| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე: 0 dB-ზე Clip **~2.0 წმ-ზე** ინთება (stems-ის შემოსვლა), `+5.0` მაქსიმუმი ~4.0 წმ-ზეა; −6 dB-ზე არ ინთება; meter-ის მოძრაობა იკითხება (ტექსტი გასწორდა C round 26 §17.1-ით) | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |
| **R28-T** | რეალურ Chrome-ში, რეალური მაუსით/კლავიატურით: Delete/Backspace მონაკვეთზე სიცარიელეს ტოვებს; Ctrl+Shift+L-ს browser არ იჭერს და ყველა ხაზზე ავრცელებს; Ctrl+Shift+X ხურავს სიცარიელეს; ყველა ხაზის overlay (`/60`) იკითხება; Round 29-ის შემდეგ — Ctrl+Shift+L → Ctrl+X → Ctrl+V სხვა active lane-ზე მასალას თავის ხაზზე აბრუნებს | browser-ის რეზერვირებული მალსახმობები და რეალური input headless-ში ვერ დამტკიცდება |
| **R30-T** | Clip Gain-ის ცვლილება დაკვრისას ყურსასმენით: click/zipper არ ისმის (τ 15 ms); +6 dB ერთ კლიპზე მხოლოდ იმ კლიპს ხდის ხმამაღლა | headless-ში მოსმენა შეუძლებელია |
| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში. დამატებით: focus-ის დაკარგვისას (მაგ. Alt+Tab) დაჭერილი ღილაკით range აგრძელებს თუ არა `input`-ს (C-R31-01). Round 42-ის შემდეგ: Alt+Tab ღილაკის დაჭერით → გარეთ აშვება → დაბრუნება → ArrowRight Pan-ს ამოძრავებს | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია; C-მ synthetic event-ები გამოიყენა |
| **TL-Q-VIEWPORT** | 1280 px-ზე ვიწრო სიგანე (1024×768) ფარგლებშია? (C-R41-01) | მომხმარებელმა 1280×720 და 1440×900 დაასახელა; B viewport-ების მატრიცას თვითონ არ აფართოებს |
| **R33-T** | რეალური მაუსით რეალურ Chrome-ში: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება; ასევე ArrowRight კლიპს აჩოჩებს | C-R32-01: headless-ში click-ის focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |
| **R34-T** | რეალური მაუსით რეალურ Chrome-ში: ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნა უცვლელია; Clip Gain-ში Enter-ის გარეშე აკრეფა → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება; ძებნაში focus-ით scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის (Firefox-ში overlay scrollbar-ებითაც) | headless scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს; focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |
| **R35-T** | რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume/Pan-ზე ან Master-ზე click → +3.0 dB რჩება; ისტორია `[Clip Gain, fader]` `134b4ab`-ზე, Round 38-ის შემდეგ მხოლოდ `[Clip Gain]` (click აღარ ხტება) | synthetic/CDP pointer; focus-ის გადატანა რეალურ Chrome-ში |
| **R38-T** | რეალური მაუსით: fader-ზე (Volume, ვიდეოს Volume, Pan, Master) click არ ხტება; drag მდორედ მიჰყვება; რეალური ორმაგი click → 100 % / 0.0 dB / C; touch-ზე fader-ის drag გვერდს არ ასქროლებს და დაჭერისას მნიშვნელობა არ ხტება (A-R38-REVIEW-TOUCH); Round 43-იდან — fader-ზე კლავიატურის ნაბიჯის შემდეგ timeline-ის touch scroll: ჩანაწერი ადრე ხომ არ იწერება (A-R33-REVIEW-TOUCH) | gstack-ს dblclick/drag არ აქვს, CDP `Input.dispatchMouseEvent` allowlist-შია დაბლოკილი |
| **R27-T** | ტრეკების meter-ები რეალურ Chrome-ში: იკითხება ყველა სიმჭიდროვეზე (folded/tight/regular/full); ტრეკის over (warning) Master-ის Clip-ისგან (destructive) განირჩევა; hover `title` Peak-ს აჩვენებს | headless-ში ვიზუალური მოძრაობის შეფასება შეუძლებელია |
| **R47-T** | კლიპების drag რეალური მაუსით Snap-ით და მის გარეშე (ერთი, ჯგუფი, სხვა ხაზზე, Shift); G ქართულ კლავიატურის განლაგებაზე და ბიბლიოთეკის ძებნის ველში; ბადის ხაზები ბადედ იკითხება და waveform-ს არ ფარავს | headless pointer და მხოლოდ US layout |
| **R49-T** | (1) რეალური მაუსით კლიპზე select-click 10 წმ და 1 წმ ბადით, Snap ჩართული — შემთხვევითი ნახტომი ხომ არ არის (F1); (2) რეალურ Windows Chrome-ში Alt+drag → მაუსის აშვება → Alt-ის აშვება → Space: დაკვრა ირთვება და Chrome-ის app menu focus-ს არ იღებს; (3) trim-ისა და body-ში მონიშვნის snap-ის შეგრძნება | CDP-ის კლავიში browser-ის accelerator-ს არ აღწევს; headless pointer |
| **R50-T** | რეალური მაუსით, Snap ჩართული: (1) ruler-ზე, ცარიელ ხაზზე და კლიპის body-ში click — playhead მოსალოდნელ ხაზზე ჯდება; (2) ასეთი click-ის შემდეგ paste ბადეზე ჯდება; თქვით, უნდა მიებას თუ არა paste ბადეს Stop-ის / ←/→-ის / დაკვრის შემდეგაც (B-ის P4: არა); (3) Alt+click რეალურ Windows Chrome-ში (app menu, როგორც R49-T(2)) | CDP-ის click/კლავიში რეალური შეყვანა არ არის; P4 CZABA-ს კონტრაქტია და Tech Lead-ს შეუძლია შეცვალოს |
| **R51-T** | რეალური მაუსით, Snap ჩართული: (1) ბიბლიოთეკიდან ხმის ჩაგდება — ghost და კლიპი ერთ ხაზზე იწყება; Alt-ით drag Windows Chrome-ში — ხდება თუ არა drop და თავისუფალია თუ არა (R51-ALT-NATIVE-DRAG); (2) loop brace-ის და მისი კიდეების drag ხაზებზე ჯდება; (3) brace-ის ისრები ხაზიდან ხაზზე; გინდათ თუ არა Live-ის ↑/↓ ან Ctrl+ისრები; (4) R50-T-დან: playhead-ის drag დაკვრისას ყოველ ხაზზე აუდიოს თავიდან იწყებს (C-R50-N2) | PW/CDP drag OS-ის ნამდვილი drag-and-drop არ არის |
| **R52-T** | რეალური მაუსით, Snap ჩართული: (1) ხმა სხვა კლიპთან ან ვიდეოს ბოლოსთან მიტანისას „იკეტება“ თუ არა მასზე და 5–10 წმ დანაყოფზე ხომ არ არის ზედმეტად ძლიერი; (2) გინდათ თუ არა მაგნიტი Snap-ის გამორთვისასაც (Live-ის ქცევა დაუდასტურებელია; CZABA-ში Snap გამორთულია = სრულიად თავისუფალი) | PW/CDP drag OS-ის ნამდვილი drag არ არის |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead; round 21-ის mode-D rAF სიაშიც ჩანს `/studio-lab`-ზე);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, PASS): Round 25-იდან ხილულია export-ში (R25-EO), Round 26-იდან ცოცხლადაც (R26-C0, Clip `+5.0`). Clamp რჩება, limiter ფარგლებს გარეთაა;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–30-ის სამუშაო დაკომიტდა (`08b9e53`, შემდეგ merge `1cefea1`). მეორე remote-ის push თავიდან non-fast-forward-ით უარყოფილი იყო; ახლა ორივე remote `1cefea1`-ზეა (B-ის `git ls-remote`, 2026-10-13) — მოგვარებულია. ეს შუალედური checkpoint-ია, არა release;
- merge-ის შემდეგ `app/lib/auth.ts` და `auth-bugs.test.ts` working copy-ში CRLF-ია (`core.autocrlf`): Biome `./app` 2 format error-ს აჩვენებს (Studio-ს ფაილები არ არის);
- tracked `.claude/agents/frontend-architect.md` Write/Bash-ს იძლევა (checkpoint review 9);
- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe`; round 29-ში 10–12 (C-R27-02 დაიხურა); B-ის round-30 დაგეგმვისას 12; round 37-ში 6–8;
- dev server round 27–29-ში A/C-ის დაწყებისას რამდენჯერმე გაჩერებული იყო (round 29: 16:51–17:08) — C-მდე root-მა უნდა შეამოწმოს;
- fake Bearer → 500 (token არ გაიცემა);
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს;
- საერთო `components/ui/Modal.tsx`-ის focus gap;
- root GA consent-denied-ით `scroll`-ს აგზავნის;
- agent ფაილები ახლა tracked-ია (root-ის commit-ები); C round 29-ის `npx` cache-ის ჩამოტვირთვა (vitest 5.0.4, store უცვლელი);
- round 31–37 დაკომიტდა (`134b4ab`), round 38 — `6c7b4bb` (ორივე remote; root-ის verify 1290 + 2 smoke); review `checkpoint-r38-review.md` — დახარისხდა (`b-round-38.md` §5). Round 39-ის ფაილები checkpoint-ისთვის მხოლოდ C PASS-ის შემდეგ; 17 untracked `.codex/agents/*.toml` root-ის გადასაწყვეტია;
- `publication-checkpoint.json`-ის მოთხოვნები: ბიბლიოთეკა/სტემები (SRW-12 მზადაა), scrollbar-ები (SRW-23, Tech Lead), T12, საბოლოო commit/push.

- round 39–40 — `63ce722`, round 41 — `ea35611`, round 42 — `b6a96f8` (ორივე remote; round 42 B-მ `git ls-remote`-ით გადაამოწმა; `round42Checkpoint` ჩანაწერი root-ს ეკუთვნის). GSTACK-ACL — loop-ის ფოლდერის ACL root-ის გადასაწყვეტია.
- **`root-pre-push-review.md` (round 3) — ID-ების რუკა (C round 48-ის თხოვნა):** RF3-1, RF3-2 და R5-L6 (ვიდეოს sync, A-ს საკუთარი გაზომვებით FAIL) შემდგომ C-ის ანგარიშებში by-ID არ დახურულა; ისინი **C-R27-01**-ის ნაწილია (Medium, Tech Lead quiet Chrome, C-R6-02/C-R8-01-თან ერთად) და დახურულად არ ითვლება. R5-L3 და R5-E1 — `c-round-21.md` §2.4 (seam 0, maxDiff 0); R5-L5 — c-round-29-მდე; R6-S2 — c-round-11-მდე; R6-S3 — c-round-6.
Root M1–M3, L1–L4, L6, L7 და L8 დახურულია.

## 7. შემდეგი ეტაპი

| ID | სტატუსი | შენიშვნა |
|---|---|---|
| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..24) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |

ფარგლებს გარეთაა მთელი პროექტისთვის: plugins/effects, pitch, ვიდეოს რამდენიმე ფენა და აუდიოს time-stretch. Grid-ის tempo აუდიოს stretch არ არის.

Round 55-ის შემდეგ: Round 56 — C-R48-01 (თუ root კონფიგით არ გაასწორებს) ან SRW-14 ეტაპი 4b; 4b (ხაზის right-click მენიუ, დანაყოფის კლავიშები — ჯერ Chrome-ში Ctrl+1/2-ის შემოწმება, C-R51-02, C-R51-01-ის probe; **მხოლოდ 4a-ს ბრაუზერის მტკიცებულებით**; თუ root უპასუხებს, მანამდე ARCH-CHECKPOINT-SRW14-PREFS) → 4c (ჯგუფი და drop კიდეებზე, C-R52-T1) → SRW-15 (+ ეტაპი 5) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20 → Low-ები → SRW-21 → სრული რეგრესია და root-ის შემოწმება → T12.

## 8. დასრულების პირობა

COMPLETE დგება მხოლოდ მაშინ, როცა ყველა პირობა შესრულებულია:
- FB-01..16 და SRW-01..24 C-ის მტკიცებულებით (SRW-24 — მომხმარებლის 2026-10-11-ის წაშლის კონტრაქტი) „მზადაა“ სტატუსშია (SRW-21-ის route mount მხოლოდ ნებართვით);
- critical/high ღია ბაგი არ არის;
- build, tsc, check და ტესტები მწვანეა;
- შესყიდვის დაცვა უცვლელია;
- `/studio-lab` ანონიმურად იხსნება (C round 21-ში G21-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
