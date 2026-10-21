const fs = require('fs');
const p = 'feature-status.md';
let lines = fs.readFileSync(p, 'utf8').split('\n');
if (lines.some((l) => l.startsWith('**Round 38-ის შედეგი**'))) throw new Error('already applied');
const idx = (prefix) => {
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i < 0) throw new Error('missing: ' + prefix);
  return i;
};
const setLine = (prefix, text) => {
  lines[idx(prefix)] = text;
};
const insertBefore = (prefix, block) => {
  lines.splice(idx(prefix), 0, ...block);
};
const insertAfter = (prefix, block) => {
  lines.splice(idx(prefix) + 1, 0, ...block);
};

setLine('განახლდა:', 'განახლდა: 2026-10-14 · ავტორი: B (round 38 → round 39 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`');
setLine('- **C-R23-01 ისევ ღიაა.**', '- **C-R23-01 ისევ ღიაა და გაუარესდა (C-R38-01).** `/studio-lab`-ის SSR HTML-ში ახლა 5 NUL byte-ია (11729, 28025/28026, 58745/58746; 63 611 byte; B-ის curl 2026-10-14 — იგივე). ორი მათგანი `aria-label`-შია (ბიბლიოთეკის დაკეცვის ღილაკი, range-ის დასაწყისის ველი) და hydration-ის შემდეგაც დაზიანებული რჩება — screen reader-ი გატეხილ სახელს კითხულობს. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.');
setLine('- **R38-T (Round 38-ის C PASS-ის შემდეგ):**', '- **R38-T (ახლა შესამოწმებელია — Round 38 C PASS, `6c7b4bb`-შია):** რეალური მაუსით ყველა fader-ზე (Volume, ვიდეოს Volume, Pan, Master): click არ ხტება, drag მდორედ მიჰყვება მაჩვენებელს, რეალური ორმაგი click საწყისს აბრუნებს (100 %, 0.0 dB, C); touch მოწყობილობაზე fader-ის drag გვერდს არ ასქროლებს **და მნიშვნელობა დაჭერისას არ ხტება** (A-R38-REVIEW-TOUCH, Medium, დაუდასტურებელი: თუ ხტება, B-ს წინასწარ აქვს განსაზღვრული ცვლილება — non-passive `touchstart` + `preventDefault` სამ fader-ზე). headless-ში რეალური ორმაგი click, drag და touch შეუძლებელია (gstack/CDP allowlist).');
setLine('- **Round 31–37 დაკომიტებულია**', '- **Round 31–38 დაკომიტებულია** — round 31–37: `134b4ab`; round 38: `6c7b4bb` (`feat(studio): refine relative fader drag and reset`), ორივე remote (`publication-checkpoint.json` → `round38Checkpoint`; root-ის verify 1290 + 2 smoke). B-მა 2026-10-14-ს commit-ის 7 ფაილის sha256 C-ის მიერ შემოწმებულს შეადარა — იდენტურია. B-ის `git ls-remote` ამჯერად „Empty reply from server“-ით ჩავარდა (ქსელი, დროებითი) — remote-ების hash root-ის ჩანაწერიდანაა. review: `checkpoint-r38-review.md` — დახარისხდა (`b-round-38.md` §5). შუალედური commit release არ არის.');
setLine('- Round 38 ცვლის `ArrangementLane.tsx`-ს', '- Round 39 ცვლის `ArrangementContext.tsx`-ს, `ArrangementDetailPanel.tsx`-ს (მხოლოდ Clip Gain-ის ველი), doc 037-ის სტატუსის ხაზს და ქმნის `pending-status.test.tsx`-სა და doc 038-ს: შემდეგი checkpoint — მხოლოდ C-ის round-39 PASS-ის შემდეგ. 17 untracked `.codex/agents/*.toml` root-ისაა (2026-10-14 10:02) — round-ის ფაილებში არ შედის, root ცალკე წყვეტს.');
setLine('- Dev server B-ის დაგეგმვისას', '- Dev server B-ის დაგეგმვისას (2026-10-14 13:05) მუშაობდა (200); B-ის gate-ებისას `node.exe` 5 → 5.');

const curStart = idx('მიმდინარე რაუნდი:');
const curEnd = idx('**Loop runner:**');
lines.splice(curStart, curEnd - curStart + 1,
  'მიმდინარე რაუნდი: **Round 39** (`current-task.md`, D-29z4) — SRW-13 ეტაპი 4b-2, ჯგუფი 1 (სამი დაკავშირებული ბაგი, ჯერ C-ის ბაგი):',
  '- **C-R37-01 (C-ის ბაგი):** Clip Gain-ის ველში შეუნახავ ტექსტს ნიშანი უჩნდება (ყვითელი ჩარჩო + „შეუნახავია — Enter ინახავს, Esc აბრუნებს“); მე-3 ნაწილი (ტექსტი დადასტურებისას იწერება) მიღებულია.',
  '- **ძველი უარის status (C-R31-INFO-REFUSAL-STATUS + C-R37-01-ის მე-2 ნაწილი):** „რედაქტირება drag-ის დროს არ მუშაობს…“ ან Undo-ს უარი ბოლო gesture-ის დასრულებისას წინა status-ს უბრუნდება; თუ შუაში სხვა status დაიწერა, ის რჩება.',
  '- **PENDING-COMMIT-ORDER:** ძველი pending Master preview ახალ Volume preview-მდე იწერება, ამიტომ Undo Master-საც აბრუნებს (B-ის probe: დღეს სრული Undo-ს შემდეგ Master −3-ზე რჩება).',
  '- **B-ის probe:** სამივე ცვლილება scratch ასლში — vitest 1290/1290; frozen ტესტის ცვლილება არ არის.',
  '- **C:** R39-ST (უარის status რეალური click/Ctrl+Z-ით synthetic gesture-ის დროს), R39-PM (ნიშანი, screenshot 1440/1280, panel-ის სიმაღლე), R39-PO (unit + mutation), MN, CR, K, S, U (mutation a–g), Doc, G39-1..3.',
  '',
  'შემდეგ: Round 40 — Pan (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES); Round 41 — FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; Round 42 — MASTER-HOLD-TICK-EDGE + test hardening; შემდეგ 4c + polish.',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 39 -StartPhase A`.',
);

insertBefore('**Round 37-ის შედეგი**', [
  '**Round 38-ის შედეგი** (A `a-round-38.md`, C `c-round-38.md`): **C PASS — ყველა ID.**',
  '- **PASS:** G38-1..3 (vitest 1290/1290, 376 OK, protected 4/4, ანონიმური `/studio-lab` header-იდან და პირდაპირ, 0 token/recording/download/R2 მოთხოვნა, Authorization 0, studio-token 401, `/studio/middle-east` → Sign in required); R38-S; R38-PG (რეალური click: Volume/SFX/ვიდეო 1, Master 0, Pan 10R რჩება, 0 ჩანაწერი, focus fader-ზე; round 37: 0.5 / −27 dB); R38-DR (synthetic; ფორმულა ზუსტია 107/96/48 px-ზე; ცოცხალი `setTargetAtTime` 0.92→0.83→0.75 და pan 0.14→0.26→0.40, 0 ახალი `start`); R38-DC (synthetic dblclick; რეალური ორმაგი click harness-ით შეუძლებელია → R38-T); R38-MN; R38-CR; R38-K; R38-U (mutation a–h მოკლულია; (i) `focus`/`begin` რიგი ცოცხალი → A-R38-TEST-ORDER); R38-Doc.',
  '- **ახალი:** C-R38-01 (Low, C-R23-01 `aria-label`-ებში); A-R38-TEST-ORDER (Low); A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი, R38-T); PREVIEW-VOLUME-IDENTITY (info, 4c).',
  '- **Ableton:** Pan-ის double-click reset — დადასტურებული (§18.1); Volume/Master reset და click-ზე არ ხტომა — დაუდასტურებელი (CZABA-ს მოთხოვნა); Delete → default — შეგნებული განსხვავება.',
  '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-14, `b-round-38/gates.txt`): HEAD `6c7b4bb`, 17 untracked `.codex` (root), 380 OK (ახალი სია), protected 4/4, tsc 0, vitest 70/1290, build ✓, Biome 2 CRLF error + 218 warning + 1 info, NUL 5.',
  '',
]);

const rowFix = (prefix, text) => setLine(prefix, text);
rowFix('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36, 37 და 38 (CR-1..4) ID-ები PASS-ია. ღიაა მხოლოდ Low C-R37-01 — შენახულ ტექსტს pending ნიშანი არ აქვს, მონაცემი არ იკარგება → Round 39 მუშავდება) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN; `c-round-38.md` R38-CR | Tech Lead: R30-T, R34-T, R35-T. C-R37-01 — Round 39 (D-29z4). T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');
rowFix('| FB-05 |', '| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. double-click reset და click-ზე არ ხტომა — Round 38 C PASS (synthetic dblclick, რეალური click). A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK review-ის Low-ებია → Round 40) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G); `c-round-38.md` (PG-P, DR-P, DC-P, MN-RESET) | Tech Lead: R31-T, R33-T, R38-T. A-R32-REVIEW-1, A-R31-REVIEW-2 — 4b-2 ჯგუფი 2 (Round 40) |');
rowFix('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5 და 4b-1 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead). 4b-2 ჯგუფი 1 მუშავდება — Round 39) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md` | Round 39 — 4b-2 ჯგუფი 1: C-R37-01, უარის status, pending რიგი (D-29z4). Round 40: Pan-ის ჯგუფი; 41: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; 42: Master-ის hold tick + test hardening. შემდეგ 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY. C-R27-01: Tech Lead |');
rowFix('| A-R29-REVIEW-1 |', '| A-R29-REVIEW-1 | Low | **არ დაწყებულა** (არსებული ქცევა; ბრაუზერში არ შემოწმებულა) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | pending Volume/Master preview `applyEdit`-ში ცალკე ჩანაწერად იწერება, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ს აჩვენებს → 4b-2 ჯგუფი 3 (Round 41) |');
rowFix('| A-R31-REVIEW-2 |', '| A-R31-REVIEW-2 | Low | **არ დაწყებულა** | `a-round-31.md` §4 finding 2 | lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური); B-ის ანალიზი: Lane-ის Pan bookkeeping window blur-ზეც უნდა დასრულდეს → 4b-2 ჯგუფი 2 (Round 40) |');
rowFix('| A-R32-REVIEW-1 |', '| A-R32-REVIEW-1 | Low | **არ დაწყებულა** | `a-round-32.md` §4 finding 1; `c-round-32/runs/bc-pid1-realclick.txt` | Pan-ის blur suppression შეიძლება დარჩეს, თუ ღილაკი ფანჯრის გარეთ აუშვეს; რეალური მაუსის click მას ხსნის (C). B-ის გეგმა: Pan-ზე keydown suppression-ს ხსნის (frozen l.363–430 მწვანე რჩება) → 4b-2 ჯგუფი 2 (Round 40) |');
rowFix('| A-R33-REVIEW-TOUCH |', lines[idx('| A-R33-REVIEW-TOUCH |')].replace(/→ [^|]*\|\s*$/, '→ 4b-2 ჯგუფი 3 (Round 41) |'));
rowFix('| **C-R37-01** |', '| **C-R37-01** | Low | **მუშავდება** (Round 39, D-29z4) | `c-round-37/runs/kept.txt` KEPT-1/2; `c-round-37.json` bugs[0]; ხელახლა `c-round-38.md` DC-G/MN-G | (1) შეუნახავი ტექსტის ნიშანი და (2) ძველი status — Round 39-ში სწორდება; (3) ტექსტი დადასტურებისას იწერება, შუალედური ჩანაწერების შემდეგ — მიღებულია (D-29z4) |');
rowFix('| A-R37-TEST-HARDENING |', '| A-R37-TEST-HARDENING | Low | **არ დაწყებულა** | `a-round-37.md` §4 R4, R5 | N5-ს შუალედური `\'3\'` pin აკლია; jsdom-ში `fireEvent.blur`-ის შემდეგ `field.focus()` no-op-ია → 4b-2 ჯგუფი 4 (Round 42, A-R38-TEST-ORDER-თან ერთად) ან საბოლოო რეგრესია |');
rowFix('| CP-R37-PAN-KEY-LOCK |', '| CP-R37-PAN-KEY-LOCK | Low | **არ დაწყებულა** | `checkpoint-r37-review.md` #1 | Pan-ის blur suppression-ის დროს ისრებიც იგნორდება; დაკარგული release-ის შემდეგ კლავიატურა მკვდარია ახალ დაჭერამდე (A-R32-REVIEW-1-ის იგივე მიზეზი) → 4b-2 ჯგუფი 2 (Round 40) |');
rowFix('| CP-R37-DRAG-ENTRIES |', '| CP-R37-DRAG-ENTRIES | info | **არ დაწყებულა** (B-მა ხელახლა შეაფასა — კოდის კითხვით, არა C-ის მტკიცებულებით) | `checkpoint-r37-review.md` #2; `backlog.json` → `round38_reeval` | Round 38-ის შემდეგ მაუსით native drag აღარ არის; რჩება: window blur-ის abort element blur-ის გარეშე → Lane-ს draft და cleanup რჩება, სანამ ის pointer არ აუშვებს → A-R31-REVIEW-2-თან ერთად, Round 40 |');
rowFix('| FADER-KEY-ENTRIES |', '| FADER-KEY-ENTRIES | Low | **არ დაწყებულა** (არსებული ქცევა) | `c-round-30.md` §7 | Volume/Master fader-ზე თითო კლავიში = ერთი ჩანაწერი → 4b-2 ჯგუფი 3 (Round 41; ჯერ C-ის R30-K ჩანაწერი ხელახლა წაიკითხება, timer-ით გაერთიანება არ ივარაუდება) |');
rowFix('| MASTER-HOLD-TICK-EDGE |', '| MASTER-HOLD-TICK-EDGE | Low | **არ დაწყებულა** | `c-round-26.md` §9 | Master-ის hold tick ≥ +6 dBFS-ზე 1 px ჩანს → 4b-2 ჯგუფი 4 (Round 42) |');
const c23 = idx('| **C-R23-01** |');
lines[c23] = lines[c23].replace('| **C-R23-01** | Medium | **ბაგია** (', '| **C-R23-01** | Medium | **ბაგია** (round 38: 5 NUL — 11729, 28025/28026, 58745/58746, 63 611 byte; ორი `aria-label` hydration-ის შემდეგაც დაზიანებულია = C-R38-01; ');
insertAfter('| **C-R37-01** |', [
  '| C-R31-INFO-REFUSAL-STATUS | info | **მუშავდება** (Round 39, D-29z4) | `c-round-31.md` §6; `c-round-36.md` OT-5b; `c-round-38.md` DC-G, MN-G | უარის status drag-ის დასრულების შემდეგაც ჩანს → ბოლო gesture-ის დასრულებისას წინა status ბრუნდება |',
  '| PENDING-COMMIT-ORDER | Low | **მუშავდება** (Round 39, D-29z4) | `checkpoint-oct13-review.md` #5; B probe `b-round-38/probe-order.test.snippet` (დღევანდელ კოდზე წითელი) | ძველი pending Master preview ახალ Volume preview-მდე არ იწერება → სრული Undo-ს შემდეგ Master −3-ზე რჩება |',
  '| C-R38-01 | Low | **ბაგია** (Tech Lead-ს ელოდება, C-R23-01-თან ერთად) | `c-round-38/runs/studio-lab.html`, `sl1-3.html`, `c-r23-01-dom.txt` | NUL byte-ები ორ `aria-label`-შია, hydration ვერ ასწორებს; round-38-ის ლოგიკა მიზეზი არ არის (მხოლოდ offset-ის გადაწევა); production build არ შემოწმებულა |',
  '| A-R38-TEST-ORDER | Low | **არ დაწყებულა** | `c-round-38.md` §9.1 (i); `a-round-38.md` known gaps | `focus()` → `begin`-ის რიგს jsdom ტესტი არ იცავს (mutation (i) ცოცხალია); ბრაუზერში რიგი სწორია (CR-1/CR-2) → 4b-2 ჯგუფი 4 (Round 42) |',
  '| A-R38-REVIEW-TOUCH | Medium (დაუდასტურებელი) | **Tech Lead-ის შემოწმება** (R38-T) | `checkpoint-r38-review.md` Medium; `a-round-38.md` §4 | touch-ზე range-ის native slide შეიძლება დარჩეს; მოწყობილობაზე დადასტურებისას: non-passive `touchstart` + `preventDefault` სამ fader-ზე (Zoom გარდა). ბრმად არ კეთდება |',
  '| PREVIEW-VOLUME-IDENTITY | info | **არ დაწყებულა** | `checkpoint-r38-review.md` #6 | `previewTrackVolume`-ს identity short-circuit არ აქვს — default-ზე ორმაგი click ერთ ზედმეტ render-ს იწვევს (0 ჩანაწერი) → 4c |',
]);
insertBefore('**Round 37:** დაიხურა', ['**Round 38:** ბაგი არ დახურულა (ერთი ფუნქცია). ახალი: C-R38-01 (Low, C-R23-01 `aria-label`-ებში), A-R38-TEST-ORDER (Low), A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი), PREVIEW-VOLUME-IDENTITY (info). PENDING-COMMIT-ORDER backlog-ში ცალკე ID-ით ჩაიწერა (oct13 review #5). C-R23-01: 5 NUL (63 611 byte).', '']);
setLine('- C round 22: volume slider-ზე click', '- C round 22: volume slider-ზე click მნიშვნელობას click-ის წერტილზე სვამს (native range) — **გამოსწორდა Round 38-ში** (C R38-PG: რეალური click აღარ ხტება).');
const r6 = idx('- round 31–37 დაკომიტდა (`134b4ab`');
lines[r6] = '- round 31–37 დაკომიტდა (`134b4ab`), round 38 — `6c7b4bb` (ორივე remote; root-ის verify 1290 + 2 smoke); review `checkpoint-r38-review.md` — დახარისხდა (`b-round-38.md` §5). Round 39-ის ფაილები checkpoint-ისთვის მხოლოდ C PASS-ის შემდეგ; 17 untracked `.codex/agents/*.toml` root-ის გადასაწყვეტია;';
const r38t = idx('| **R38-T** |');
lines[r38t] = lines[r38t].replace('touch-ზე fader-ის drag გვერდს არ ასქროლებს', 'touch-ზე fader-ის drag გვერდს არ ასქროლებს და დაჭერისას მნიშვნელობა არ ხტება (A-R38-REVIEW-TOUCH)');
fs.writeFileSync(p, lines.join('\n'));
console.log('ok', lines.length);
