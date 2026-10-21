# B — Round 23-ის შედეგი → Round 24-ის დაგეგმვა (D-29o)

ავტორი: B · თარიღი: 2026-10-11 · წყაროები: `tasks/round-23.md` (არქივი, sha `ec319195…` = dispatch-ის `current-task.md`), `a-round-23.md`, `c-round-23.md`, `c-round-23.json`, `backlog.json`, `plan.md`, `feature-status.md`, `root-pre-push-review.md`, `publication-checkpoint.json`.

**Advisor:** ხელმისაწვდომი იყო. B-მ ის ორჯერ გამოიძახა: orientation-ის შემდეგ, წერამდე, და ხელახლა წერის შემდეგ. ორივე რჩევა გამოიყენა.

პირველი გამოძახების შედეგად:
- C-R23-01 A-ს არ გადაეცა და არც გადაიდო — ის Tech Lead-ის კონკრეტულ კითხვად ჩამოყალიბდა;
- SRW-01-ის სტრიქონი დაფაზე „ბაგიაა“;
- round 24-ის ტესტები `track-layout.test.tsx`-შია;
- C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს.

მეორე გამოძახების შედეგად:
- ყველა consumer შემოწმდა. გაყინული `render-budget.test.tsx` render-ებს `fiber.type.name`-ით ითვლის, ამიტომ `forwardRef` მას ჩააგდებდა და მთელ body-საც ხელახლა დააშორებდა (re-indent). B-მ `forwardRef`-ის ნაცვლად `panelRef` prop აირჩია (§4.1);
- R24-* ID-ების კოლიზია არ არის;
- library separator-ის expand-ის შენიშვნა დაემატა.

**სარეზერვო ასლები შესწორებამდე:** `feature-status.before-b-round-23.md`, `backlog.json.bak-before-b-round-23`, `plan.before-b-round-23.md`.

## 1. რა დაადასტურა C-მ (მხოლოდ დამოუკიდებელი მტკიცებულება)

C round 23: **PASS** + ერთი ახალი Medium ბაგი.

| ID | C-ის შედეგი | მტკიცებულება |
|---|---|---|
| R23-F1 | PASS: 4 უნიკალური `aria-controls` lane body-ზე resolve-დება (`= header.nextElementSibling`, header-ის გარეთ, clip-ებს შეიცავს). Fold/unfold click-ით და Space-ით მუშაობს, transport გაჩერებული რჩება | `c-round-23.md` §2.1 |
| R23-F2 | PASS: drag-ის დროს fold-ზე უარის ტექსტი ჩანს, სიმაღლე უცვლელია; release-ის შემდეგ ერთი click fold-ს აკეთებს | §2.2 |
| R23-N | PASS: inset ring-ი, `box-shadow … inset`; folded 36-ზე და tight video 52-ზე (top inset 0), 1440-სა და 1280-ზე. Crop-ებზე ჩარჩო სრულია | §2.3 |
| R23-R | PASS: file drop, library drop, Tab-ის რიგი, M/S დაკეცილზე, ±8 | §2.4 |
| R23-S / R23-U / R23-Doc | PASS: diff +6/−2; C-ის mutation scratch copy-ში — 1 failed თითოეულზე | §1.3–§1.4 |
| G23-1..3 | PASS: tsc 0, vitest **1007/1007**, build, Biome 0 error (218 warning, უცვლელი); 50 OK, 46 ხაზი; ანონიმური `/studio-lab` სუფთაა, studio-token 401 | §1, §2.6 |
| Export sanity | გაიარა `lay11`-ზე: 864 000 frame, NaN 0, 1800 FS (R13-M4) | §2.5 |

**B-ის დამოუკიდებელი შემოწმება (2026-10-11):**
- live tree = C-ის ბოლო მდგომარეობა: HEAD `c5ed47b`, `git status` 46 ხაზი, რომელიც `c-round-23/gates/git-status-end.txt`-ის იდენტურია;
- round 22-ის 50 ფაილი OK;
- owned sha-ები ემთხვევა (`cdaf07f4…`, `fba42d8a…`, `38414675…`).

## 2. C-R23-01 — დადასტურება

B-მ ბაგი დამოუკიდებლად გაიმეორა:
- **C-ის ფაილები:** `c-round-23/runs/ssr-1..3.html` — თითოეული 55 611 B, NUL = 4.
- **Live curl** `http://127.0.0.1:5173/studio-lab`: 55 611 B, **NUL = 4**. `/`, `/studio/middle-east`, `/products`, `/about`-ზე NUL = 0.
- **მიზეზი:** `react-dom` 18.3.1-ის `react-dom-server.node.development.js` l.128–131, `writeStringChunk`. როცა `read < stringChunk.length`, ფუნქცია `writeToDestination(destination, currentView)`-ს იძახებს, ანუ **მთელ** view-ს წერს, შეუვსებელი ნულოვანი byte-ების ჩათვლით. `app/entry.server.tsx` სტანდარტული `renderToPipeableStream` + `PassThrough`-ია.

**Severity:** Medium (C-ის შეფასება). ეს არ არის security, მონაცემების დაკარგვა ან payment, ამიტომ critical/high არ არის. მიუხედავად ამისა, ბაგი რეალურია: screen reader-ს დაზიანებული label მიეწოდება, და ქართული ტექსტის მქონე ნებისმიერი SSR გვერდი პოტენციურად დაზარალებულია.

## 3. Tech Lead-ის კითხვა (C-R23-01) — კონკრეტული

გამოსწორება ორ ფაილს შორის ერთ-ერთს სჭირდება:
- `app/entry.server.tsx` (store-ის საერთო SSR). ის A-ს მფლობელობაში არ არის (`plan.md` §6). ვიწრო grant-ის ერთადერთი precedent-ი (Header.tsx) მომხმარებლის აშკარა ნებართვას ეყრდნობოდა.
- `package.json`. ის გლობალურად აკრძალულია.

ამიტომ B ბაგს A-ს თავისით არ აძლევს. ის **არ არის გადადებული**: Tech Lead-ის პასუხისთანავე რაუნდი ახალ ფუნქციამდე იგეგმება.

**არჩევანი:**
- **(a) React 19-ზე გადასვლა.** იქ `writeStringChunk` მხოლოდ `subarray(0, writtenBytes)`-ს წერს. ეს dependency-ის ცვლილებაა მთელ store-ზე და Remix-თან თავსებადობის შემოწმებას მოითხოვს.
- **(b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის** (B-ის რეკომენდაცია, ყველაზე მცირე). `PassThrough` იცვლება პატარა `Transform`-ით, რომელიც HTML stream-იდან `0x00` byte-ებს შლის. Transform ცალკე module-შია, მაგ. `app/lib/ssr-nul-filter.server.ts`, თავისი ტესტებით. ვალიდურ UTF-8 HTML-ში `0x00` არასდროს გვხვდება, ამიტომ იშლება მხოლოდ React-ის შეცდომით გამოგზავნილი padding.

**Oracle ორივესთვის:**
- `/studio-lab`-სა და სხვა ქართულ SSR გვერდებზე NUL = 0;
- hydration-ის შემდეგ DOM attribute-ებში U+FFFD არ არის;
- unit ტესტი რეალური `renderToPipeableStream`-ით, სადაც ქართული ტექსტი 2048-byte-იან საზღვარს კვეთს: ტესტი padding-ს ამეორებს და აჩვენებს, რომ გაფილტრული output ზუსტია;
- streaming მუშაობს bot-ისთვისაც (`onAllReady`) და browser-ისთვისაც (`onShellReady`);
- SRW-ის ფართო რეგრესია: `/`, `/products`, პროდუქტის გვერდი, ანონიმური `/account`, `/studio/middle-east`, `/studio-lab`;
- შესყიდვის დაცვა უცვლელია (protected 4/4, studio-token 401).

დაკავშირებული დაკვირვება: `entry.server.tsx` `Content-Type: text/html`-ს charset-ის გარეშე აგზავნის. ამის გადაწყვეტა იმავე Tech Lead-ის კითხვის ნაწილია.

## 4. B-ის გადაწყვეტილებები (D-29o)

1. **Round 24 = A-ს round-11 follow-up-ების ნაწილი 2** (დაგეგმილი round 22-ში, D-29n):
   - **Home ფოკუსირებულ `role=separator`-ზე:**
     - ახლა: `StudioWorkspace.tsx:1125` → `seekTo(0)`. სამივე separator-ის handler მხოლოდ ისრებს ამუშავებს. ეს B-მ source-ში წაიკითხა.
     - კონტრაქტი: `preventDefault` რჩება, seek **არ** ხდება. ახალი Home/End ქცევა არ ემატება.
     - მიზეზი: ასე ერთადერთი ხილული ცვლილებაა „seek-ის გარეშე“. `preventDefault`-ის მოხსნისას Chrome-ის default Home timeline scroller-ს ზემოთ ააფურცლებდა, რაც ახალი ქცევა იქნებოდა.
     - გამოიყენება არსებული `isSeparatorTarget` (l.242).
   - **`nextElementSibling` (l.447, l.474) → `detailPanelRef`**, რომელიც `ArrangementDetailPanel`-ს optional `panelRef` prop-ით გადაეცემა. Precedent-ია `ArrangementLibrary`-ის `asideRef`/`bodyRef`. `forwardRef` არ გამოიყენება, რადგან:
     - გაყინული `render-budget.test.tsx` render-ებს ფუნქციის სახელით (`fiber.type.name`) ითვლის; `forwardRef` object-ის fiber-ზე ეს რაოდენობა 0 გახდებოდა და ტესტი ჩავარდებოდა;
     - inline wrap-ის გამო Biome ~250-ხაზიან body-ს ხელახლა დააშორებდა (re-indent).

     ქცევა არ იცვლება. Oracle-ებია არსებული R11-P2a ტესტი (l.543, უცვლელი), უცვლელი `render-budget`/`detail-panel` ტესტები და C-ის R24-F.
   - **ტესტები** `track-layout.test.tsx`-შია, რადგან იქაა `mountTrackLayout`, `LayoutProbe` და R11-P2a ტესტი. ახალი ბლოკები: R24-H (ძველ კოდზე წითელი), R24-HC (კონტროლი), R24-F (ref, ძველ კოდზე წითელი).
2. **Frozen list:** `b-round-23-tree-sha256.txt`, **51 ფაილი**. ეს არის round 22-ის 50, გამოკლებული `StudioWorkspace.tsx` და `ArrangementDetailPanel.tsx`, დამატებული:
   - `ArrangementLane.tsx` (`cdaf07f4…`);
   - doc 029 (`38414675…`);
   - `app/entry.server.tsx` (C-R23-01-ის გამო, აშკარად).

   B-მ live tree-ზე 51 OK შეამოწმა.
   - **Status:** ამჟამად 46 ხაზი (`b-round-23-git-status.txt`). დასასრულს მოსალოდნელია **47**: სამი owned ფაილი უკვე 46-შია, ემატება მხოლოდ doc 030.
   - **Snapshot-ები:** `b-round-23-snapshots/` — `StudioWorkspace.tsx` `47e33554…`, `ArrangementDetailPanel.tsx` `f28e069f…`, `track-layout.test.tsx` `fba42d8a…`.
3. **SRW-01 დაფაზე → „ბაგია“,** სანამ C-R23-01 ღიაა. ბირთვის ფუნქციები C-ის მტკიცებულებით რჩება დადასტურებული. ეს მხოლოდ დაფის პატიოსნებაა: C-ის მტკიცებულებიანი ბაგი მწვანე სტრიქონის ქვეშ არ დგას.
4. **LIB-SEP-REASON (Low, ახალი, B-ის წაკითხვით):** `ArrangementLibrary.tsx:549`-ის `biome-ignore` მიზეზი პროცესს ასახელებს („B task §9 requires …“). ეს იგივე კლასია, რაც l.661 და root L6. იგეგმება პირველ რაუნდში, რომელიც ამ ფაილს შეცვლის, ან საბოლოო რეგრესიამდე. Round 24-ში არ შედის, რადგან ის მეოთხე ფაილი იქნებოდა.
5. **Doc 029-ის TODO** (code-reviewer-ის Low 3): დაკეცილი ხაზის clip-ები accessibility tree-ში რჩება. ეს SRW-17-ის (ჯგუფები/დაკეცვა) კანდიდატია და არა ახალი ბაგი.
6. **SRW-13-ის ეტაპი 1** (round 24-ისა და C-R23-01-ის შემდეგ): master bus (gain/mute graph-სა და offline export-ში) + R13-M4-ის hard-clip. ამის შემდეგ overload indicator-ს რეალური სიგნალი აქვს. Clip gain, pan და meters ცალკე ეტაპებია. მოთხოვნა არ მცირდება.

## 5. სტატუსის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)

- **Lane header-ის a11y ნაწილი 1** (A-R11-FOLLOWUPS-LANE): **მზადაა** (`c-round-23.md`).
- **SRW-11B / FB-08:** უცვლელად **ბაგია** (C-R8-01, Tech Lead). Round 24 — ნაწილი 2.
- **SRW-01:** **ბაგია** (C-R23-01, Medium).
- **SRW-13..20 / FB-04..07, FB-09..14:** **არ დაწყებულა**.
- **`backlog.json`:**
  - version 25;
  - `vitest_floor_round23 = 1007`;
  - `baseline_tree_at_round23`;
  - round 23 → done, round 24 → dispatched;
  - C-R23-01 და LIB-SEP-REASON დაემატა `open_findings`-ში.

## 6. Root-ის carry (უცვლელი, გულწრფელად)

`root-pre-push-review.md` და `publication-checkpoint.json` არ შეცვლილა. ღიაა:
- SRW-21-ის hardcoded middle-east;
- Lenis `/studio/*`-ზე;
- portable paths;
- R13-M4-ის hard-clip;
- საბოლოო commit/push და round 6–23-ის დაუკომიტებელი tree;
- `Modal.tsx`-ის focus gap;
- GA `scroll` consent denied-ით;
- ორი უცხო agent ფაილი;
- fake Bearer → 500;
- CDP allowlist;
- publication-checkpoint-ის მოთხოვნები;
- A-ს round-17/19/22 deviation-ები და C-ის python probe-ები.

ახლად ემატება C-R23-01 და charset-ის დაკვირვება. ყველა ეს current-task-ის §4.7-შია.

## 7. გადაწყვეტილება

**CONTINUE.** მიზეზები:
- critical/high ღია ბაგი არ არის, მაგრამ:
  - round 24 (follow-up-ების ნაწილი 2) დარჩა;
  - C-R23-01 (Medium) Tech Lead-ის არჩევანს ელოდება;
  - SRW-13..20 (FB-04..07, FB-09..14) არ დაწყებულა;
  - დარჩენილია SRW-21-ის adapter, Tech Lead-ის შემოწმებები, საბოლოო რეგრესია, root-ის შემოწმება და T12.

**BLOCKED არ არის:** round 24-ს გარე ინფორმაცია, ნებართვა ან credentials არ სჭირდება. C-R23-01-ის ნებართვის კითხვა სხვა სამუშაოს არ აჩერებს.
