const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let lines = fs.readFileSync(path, 'utf8').split('\n');
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
const idx = (pred, m) => { const i = lines.findIndex(pred); must(i >= 0, m); return i; };
const starts = (p) => (l) => l.startsWith(p);

lines[idx(starts('განახლდა: 2026-10-14 · ავტორი: B (round 41'), 'header')] =
  'განახლდა: 2026-10-14 · ავტორი: B (round 42 → round 43 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`';

const c23 = idx(starts('- **C-R23-01 ისევ ღიაა (C-R38-01).**'), 'C-R23 TL line');
lines[c23] = lines[c23].replace('C round 41-ში **3 NUL byte**-ია', 'C round 41–42-ში **3 NUL byte**-ია');

const r38 = idx(starts('- **R38-T (ახლა შესამოწმებელია'), 'R38-T TL line');
lines[r38] = lines[r38] + ' **Round 43-იდან (A-R33-REVIEW-TOUCH):** touch მოწყობილობაზე fader-ზე კლავიატურის ნაბიჯის შემდეგ timeline-ის touch scroll — ჩანაწერი ადრე ხომ არ იწერება. `pointerType touch`-ის გამორიცხვა capture handler-ში touchscreen ლეპტოპზე C-R32-01-ს დააბრუნებდა, ამიტომ ცვლილება მხოლოდ მოწყობილობის მტკიცებულებით.';

const r41 = idx(starts('- **Round 41 დაკომიტებულია და გამოქვეყნებულია**'), 'root r41 line');
lines.splice(r41 + 1, 0,
  '- **Round 42 დაკომიტებულია და გამოქვეყნებულია** — `b6a96f8` (`fix(studio): recover pan controls and scope deployment triggers`). commit-ში round 42-ის 3 ფაილია C-ის sha-ებით (`855bc517`, `de42634f`, `9b15bc74`) და root-ის `.github/workflows/ci.yml` + `vercel.json`. B-მ 19:27-ზე `git ls-remote`-ით ორივე master remote `b6a96f8`-ზე ნახა; `publication-checkpoint.json`-ში `round42Checkpoint` ჯერ არ არის — root-მა უნდა ჩაწეროს. FOREIGN-CI-YML დახურულია root-ის მტკიცებულებით (განზრახ commit). **GSTACK-ACL (root):** C round 42-მა `tmp/studio-real-loop`-სა და `tmp`-ზე ერთი non-inherited owner-only ACE აღმოაჩინა (დრო უცნობია) — inheritance-ის აღდგენა root-ის გადასაწყვეტია. Round 43-ის baseline — HEAD `b6a96f8`.');

const dev = idx(starts('- Dev server: B-ის დაგეგმვისას (2026-10-14 17:33)'), 'dev line');
lines[dev] = '- Dev server: B-ის round-42 დაგეგმვისას ერთხელ `000` (19:2x), შემდეგ gate-ებზე 200 (19:27). Round 42-ში `$B restart`-მა gstack daemon ორჯერ გატეხა (ENV-BROWSE-DAEMON) — Round 43-იდან წესია: `$B restart` არა, მხოლოდ ახალი `BROWSE_STATE_FILE`. B-ის gate-ებისას `node.exe` 32–36.';

const cur = idx(starts('მიმდინარე რაუნდი: **Round 42**'), 'current round');
let end = cur + 1;
while (end < lines.length && !lines[end].startsWith('**Loop runner:**')) { end += 1; }
must(end < lines.length, 'loop runner line');
lines.splice(cur, end - cur + 1,
  'მიმდინარე რაუნდი: **Round 43** (`current-task.md`, D-29z8) — SRW-13, ეტაპი 4b-2, ჯგუფი 4 (სამი Low; ერთი ვიზუალური შესწორება `ArrangementMaster.tsx`-ში + ორი მხოლოდ ტესტის გამკვრივება + doc 040):',
  '- **MASTER-HOLD-TICK-EDGE:** Master-ის hold tick ≥ +6 dB-ზე მთლიანად (2 px) meter-ის ყუთშია; ≤ +5 dB-ზე პოზიცია უცვლელია (0.5 px-ის ფარგლებში, 0 dB-ზე 0 dBFS ნიშნულს ფარავს). ტრეკის meter უცვლელია.',
  '- **A-R38-TEST-ORDER:** jsdom ტესტი, რომელიც `focus()` → `beginGesture` რიგის შებრუნებას (C-ის mutation (i)) იჭერს, ან წერილობითი დასაბუთება, რომ დღეს განსხვავება არ ჩანს (C ადასტურებს ან უარყოფს).',
  '- **A-R37-TEST-HARDENING:** `fader-guards`-ის C-R36-01 describe-ში N5-ს შუალედური `"3"` pin, N1/N2-ში focus-ის რეალური გადატანა; არსებული `expect`-ები უცვლელია.',
  '- **C:** R43-HT (geometry `getBoundingClientRect`-ით, 1440 + 1280, რეალური დაკვრით), R43-U (mutation a–e, A-R38-ის შედეგის დამოუკიდებელი შემოწმება), R43-REG (meter, fader-ები, Pan, Delete fader-ზე focus-ით → კლიპი რჩება, Clip Gain), R43-S, R43-Doc, G43-1..3.',
  '',
  '**ჯგუფი 3 — კოდის გარეშე (B-ის გადაწყვეტილება D-29z8, დასაბუთება `b-round-42.md` §3):** FADER-KEY-ENTRIES — **მიღებულია** (სამივე fader: ერთი კლავიში = ერთი ჩანაწერი, D-29v; C round 42 REG-FADERS/REG-KEYS); A-R29-REVIEW-1 — **მიღებულია** (flush-ით ჩაწერილი fader-ის ცვლილება ნამდვილია, label სწორად ასახელებს; C-ის მტკიცებულება არ არის, ამიტომ „მიღებულია“, არა „დახურულია“); A-R33-REVIEW-TOUCH — Tech Lead-ის R38-T.',
  '',
  'შემდეგ: Round 44 — 4c (R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY); Round 45 — polish (SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, doc-ების შენიშვნები); შემდეგ SRW-14 ეტაპი 1 (FB-13 Grid/Snap), SRW-15..20 (FB-09/11, FB-10, FB-12, FB-06, FB-07), SRW-21, სრული რეგრესია, T12. C-R41-01 — Tech Lead-ის პასუხის მიხედვით (TL-Q-VIEWPORT).',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 43 -StartPhase A`.',
  '',
  '**Round 42-ის შედეგი** (A `a-round-42.md`, C `c-round-42.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**',
  '- **PASS:** G42-1 (tsc 0; 10 suite 270/270; vitest 74 ფაილი 1333/1333; build; `npm run verify` exit 0; Biome — 2 baseline CRLF error, 218 warning); G42-2 (3 კონტრაქტული ბილიკი, 386 OK, protected 4/4; + root-ის უცხო `ci.yml`, ხელშეუხებელი); G42-3 (ანონიმური `/studio-lab` პირდაპირ და header-იდან, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required); R42-S (4 hunk, +7/−0); R42-U (ძველ Lane-ზე PK1/PK3/RW1/RW2 წითელია; mutation a–f); R42-Doc; R42-PK (PK-B, PK-LATE, PK-NEG, PK-1280; ცოცხალი StereoPanner მიჰყვება); R42-RW (RW-B, RW-KEY, RW-GESTURE, RW-NORMAL); R42-REG (KEYS, RESET, DEL — გასწორებული მოლოდინით, DRAG, FADERS).',
  '- **დაიხურა:** A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES; TASK-R42-REGDEL (B-ის task-ის ტექსტის შეცდომა: fader-ზე focus-ით Delete კლიპს **ინარჩუნებს**, C-R31-02); FOREIGN-CI-YML (root-ის მტკიცებულება, `b6a96f8`).',
  '- **ახალი:** GSTACK-ACL (Low, root/გარემო). ENV-BROWSE-DAEMON განმეორდა.',
  '- **Ableton:** ორივე სტრიქონი „არ ეხება“.',
  '- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 19:27, `b-round-42/gates.txt`): HEAD `b6a96f8` ორივე remote-ზე, `git status` ცარიელი, 387 OK (ახალი სია `b-round-42-tree-sha256.txt`), protected 4/4, tsc 0, vitest 74/1333, `/studio-lab` 200, `node.exe` 32–36.',
  '');

const fb05 = idx(starts('| FB-05 | Pan |'), 'FB-05');
lines[fb05] = '| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. double-click reset და click-ზე არ ხტომა — Round 38 C PASS. Round 42 C PASS: keydown-ით აღდგენა დაკარგული release-ის შემდეგ და window blur-ზე drag-ის დასრულება — A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES დაიხურა) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G); `c-round-38.md` (PG-P, DR-P, DC-P, MN-RESET); `c-round-42.md` §4 (R42-PK, R42-RW, R42-REG) | Tech Lead: R31-T (Alt+Tab-ის ნაბიჯითაც), R33-T, R38-T |';

const srw13 = idx(starts('| SRW-13 | Clip gain, pan, master, meters |'), 'SRW-13');
lines[srw13] = '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5, 4b-1, 4b-2 ჯგუფი 1 (Round 39–41) და ჯგუფი 2 (Round 42) მზადაა; ჯგუფი 3 კოდის გარეშე გადაწყდა (D-29z8); 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R41-01 (Low, Tech Lead-ის viewport-ის კითხვა)) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md`; 4b-2 ჯგუფი 1: `c-round-39.md`, `c-round-40.md`, `c-round-41.md`; ჯგუფი 2: `c-round-42.md` | Round 43 — ჯგუფი 4 (D-29z8) მუშავდება; 44: 4c (R9 M1/L8, PREVIEW-VOLUME-IDENTITY); 45: polish. C-R27-01: Tech Lead |';

const setRow = (id, text) => { const i = idx(starts(`| ${id} |`), id); lines[i] = text; };
setRow('A-R29-REVIEW-1', '| A-R29-REVIEW-1 | Low | **მიღებულია** (B, D-29z8; კოდის გარეშე; C-ის მტკიცებულება არ არის) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | flush-ით ჩაწერილი pending Volume/Master ნამდვილი, შეუნახავი ცვლილებაა; no-op Cut Time-ის შემდეგ undo label მას სწორად ასახელებს, status Cut Time-ზე ლაპარაკობს. მიღწევადია მხოლოდ key rollover-ით (fader-ზე ისარი დაჭერილი + Ctrl+Shift+X) |');
setRow('A-R31-REVIEW-2', '| A-R31-REVIEW-2 | Low | **დაიხურა** (Round 42: C R42-RW, R42-U) | `c-round-42.md` §4.2, §5 | — |');
setRow('A-R32-REVIEW-1', '| A-R32-REVIEW-1 | Low | **დაიხურა** (Round 42: C R42-PK, R42-U) | `c-round-42.md` §4.1, §5 | — |');
setRow('A-R33-REVIEW-TOUCH', '| A-R33-REVIEW-TOUCH | Low | **Tech Lead-ის შემოწმება** (R38-T; D-29z8) | `a-round-33.md` §4; `a-round-34.md` §4 R4 | touch scroll timeline-ზე fader-ს/ტექსტურ ველს ათავისუფლებს, pending ადრე იწერება (მონაცემი არ იკარგება). `pointerType touch`-ის გამორიცხვა touchscreen ლეპტოპზე C-R32-01-ს დააბრუნებდა → ცვლილება მხოლოდ მოწყობილობის მტკიცებულებით |');
setRow('ENV-BROWSE-DAEMON', '| ENV-BROWSE-DAEMON | info | **არ ეხება კოდს** (გარემო) | `c-round-40.md` §0, §10; `c-round-42.md` §1 | browse daemon-ის არასტაბილურობა; Round 42-ში `$B restart`-მა ორჯერ გატეხა → Round 43-იდან მხოლოდ ახალი `BROWSE_STATE_FILE` |');
setRow('A-R38-TEST-ORDER', '| A-R38-TEST-ORDER | Low | **მუშავდება** (Round 43, D-29z8) | `c-round-38.md` §9.1 (i); `a-round-38.md` known gaps | ტესტი, რომელიც mutation (i)-ს იჭერს, ან დასაბუთებული ეკვივალენტობა (root capture ტექსტურ ველს ადრე ათავისუფლებს, begin pending-ს flush-ავს) |');
setRow('A-R37-TEST-HARDENING', '| A-R37-TEST-HARDENING | Low | **მუშავდება** (Round 43, D-29z8) | `a-round-37.md` §4 R4, R5 | N5-ს შუალედური `"3"` pin; N1/N2-ში focus-ის რეალური გადატანა; ვიწრო grant `fader-guards`-ის C-R36-01 describe-ზე |');
setRow('CP-R37-PAN-KEY-LOCK', '| CP-R37-PAN-KEY-LOCK | Low | **დაიხურა** (Round 42, A-R32-REVIEW-1-თან ერთად) | `c-round-42.md` §4.1 | — |');
setRow('CP-R37-DRAG-ENTRIES', '| CP-R37-DRAG-ENTRIES | info | **დაიხურა** (Round 42, A-R31-REVIEW-2-თან ერთად) | `c-round-42.md` §4.2 | — |');
setRow('FADER-KEY-ENTRIES', '| FADER-KEY-ENTRIES | Low | **მიღებულია** (B, D-29z8; კოდის გარეშე) | `c-round-30.md` §7; `c-round-42.md` §4.3 (REG-FADERS, REG-KEYS) | Volume/Master keyup-ზე, Pan — ყოველ ცვლად კლავიშზე: სამივე fader-ზე ერთი კლავიში = ერთი ჩანაწერი (D-29v). C ხელახლა აღრიცხავს Round 43 REG-FADERS-ში. Ableton-ის მტკიცება არ კეთდება |');
setRow('MASTER-HOLD-TICK-EDGE', '| MASTER-HOLD-TICK-EDGE | Low | **მუშავდება** (Round 43, D-29z8) | `c-round-26.md` §9 | ≥ +6 dB-ზე tick მთლიანად ყუთშია; ≤ +5 dB-ზე პოზიცია უცვლელია (0.5 px) |');

const esc = idx(starts('| ESC-DESELECT-NOTE |'), 'ESC row');
lines.splice(esc + 1, 0,
  '| TASK-R42-REGDEL | Low | **დაიხურა** (task-ის ტექსტი) | `c-round-42.json`; `a-round-42.md` §7 | B-ის შეცდომა: fader-ზე focus-ით Delete/Backspace კლიპს ინარჩუნებს, 0 ჩანაწერი, Space მუშაობს (C-R31-02). Round 43-ის REG-DEL სწორია |',
  '| FOREIGN-CI-YML | Low | **დაიხურა** (root-ის მტკიცებულება) | `c-round-42/gates/ci-yml-foreign-diff.txt`; commit `b6a96f8` | root-მა `ci.yml` და `vercel.json` განზრახ დააკომიტა |',
  '| GSTACK-ACL | Low | **root** (გარემო) | `c-round-42/gates/acl-record.txt` | `tmp/studio-real-loop` და `tmp` — ერთი non-inherited owner-only ACE; დრო უცნობია; A/C ACL ბრძანებას არ უშვებს |');

const r41res = idx(starts('**Round 41:** დაიხურა C-R40-01, DOC038-STALE-LINES.'), 'round 41 bug summary');
lines.splice(r41res, 0,
  '**Round 42:** დაიხურა A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES, TASK-R42-REGDEL, FOREIGN-CI-YML. მიღებულია (B, D-29z8): FADER-KEY-ENTRIES, A-R29-REVIEW-1. Tech Lead-ს: A-R33-REVIEW-TOUCH. ახალი: GSTACK-ACL (root). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (უცვლელი).',
  '');

const r38t = idx(starts('| **R38-T** |'), 'R38-T table');
lines[r38t] = lines[r38t].replace(' (A-R38-REVIEW-TOUCH) |', ' (A-R38-REVIEW-TOUCH); Round 43-იდან — fader-ზე კლავიატურის ნაბიჯის შემდეგ timeline-ის touch scroll: ჩანაწერი ადრე ხომ არ იწერება (A-R33-REVIEW-TOUCH) |');
must(lines[r38t].includes('A-R33-REVIEW-TOUCH'), 'R38-T replace');

const rootM = idx(starts('Root M1–M3, L1–L4, L6, L7 და L8 დახურულია.'), 'root M line');
lines.splice(rootM, 0,
  '- round 39–40 — `63ce722`, round 41 — `ea35611`, round 42 — `b6a96f8` (ორივე remote; round 42 B-მ `git ls-remote`-ით გადაამოწმა; `round42Checkpoint` ჩანაწერი root-ს ეკუთვნის). GSTACK-ACL — loop-ის ფოლდერის ACL root-ის გადასაწყვეტია.');

fs.writeFileSync(path, lines.join('\n'));
console.log('feature-status written', lines.length);
