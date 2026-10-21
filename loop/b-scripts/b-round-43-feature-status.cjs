const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let t = fs.readFileSync(path, 'utf8');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISSING:', a.slice(0, 120)); process.exit(1); } t = t.replace(a, b); };
const lineStartingWith = (prefix) => {
  const line = t.split('\n').find((l) => l.startsWith(prefix));
  if (!line) { console.error('NO LINE', prefix); process.exit(1); }
  return line;
};

rep('განახლდა: 2026-10-14 · ავტორი: B (round 42 → round 43 დაგეგმვა)', 'განახლდა: 2026-10-15 · ავტორი: B (round 43 → round 44 დაგეგმვა)');

rep('C-R23-01 ისევ ღიაა (C-R38-01).** `/studio-lab`-ის SSR HTML-ში C round 41–42-ში', 'C-R23-01 ისევ ღიაა (C-R38-01).** `/studio-lab`-ის SSR HTML-ში C round 41–43-ში');

const r42root = lineStartingWith('- **Round 42 დაკომიტებულია და გამოქვეყნებულია**');
rep(r42root, r42root.replace('`publication-checkpoint.json`-ში `round42Checkpoint` ჯერ არ არის — root-მა უნდა ჩაწეროს.', '`publication-checkpoint.json`-ში `round42Checkpoint` უკვე ჩაწერილია (ROOT-ROUND42-CHECKPOINT-RECORD — **მზადაა**).') + '\n- **Round 43 დაკომიტებულია და გამოქვეყნებულია** — `2c0f800` (`fix(studio): keep master peak marker inside meter`): round 43-ის 5 ფაილი C-ის sha-ებით (`849e6b40`, `f60b34d9`, `93eb697a`, `113d74b4`, `f91ab6cb`). B-მ 2026-10-15 12:06-ზე `git ls-remote`-ით ორივე master remote `2c0f800`-ზე ნახა. Root-ის review (`checkpoint-r43-root-review.json`): blocking finding არ არის; პირველი verify დატვირთვით ჩავარდა (11 timeout), იზოლირებული და სრული retry გავიდა; smoke 2 PASS. `publication-checkpoint.json`-ში `round43Checkpoint` ჯერ არ არის (ROOT-ROUND43-CHECKPOINT-RECORD — root). Round 44-ის baseline — HEAD `2c0f800`.');

const devLine = lineStartingWith('- Dev server: B-ის round-42 დაგეგმვისას');
rep(devLine, '- Dev server: B-ის round-43 დაგეგმვისას `/studio-lab` 200 (2026-10-15 12:06), `node.exe` 15. ENV-BROWSE-DAEMON: C round 43-ში CLI-ით გაშვებული 7 daemon 60–90 წამში კვდებოდა, `about:blank`-ზე უმოქმედოდაც. მუშა გზა იყო საკუთარი `server-node.mjs` (`BROWSE_PARENT_PID=0`, ახალი state file, log). Round 44-იდან ეს **დამტკიცებული fallback-ია** ერთი წარუმატებელი CLI-მცდელობის შემდეგ. `$B restart` ისევ აკრძალულია; უცხო პროცესს არავინ კლავს.');

const curStart = t.indexOf('მიმდინარე რაუნდი: **Round 43**');
const curEnd = t.indexOf('**Round 42-ის შედეგი**');
if (curStart < 0 || curEnd < 0 || curEnd < curStart) { console.error('current block'); process.exit(1); }
const newCurrent = `მიმდინარე რაუნდი: **Round 44** (\`current-task.md\`, D-29z9) — SRW-13, ეტაპი 4c. ორი Low და ერთი info, სამივე \`ArrangementContext.tsx\`-ში; ემატება ახალი ტესტი და doc 041:
- **R9-REVIEWER-M1:** \`transportRunningRef\`/\`markTransportRunning\` იშლება. მას საკუთარი guard-ის გარდა არავინ კითხულობს, ამიტომ ქცევა არ იცვლება. C ამოწმებს grep 0-ს და transport-ს ბრაუზერში: play/stop/resume, ბოლომდე დაკვრა, loop, seek, preview.
- **R9-REVIEWER-L8:** \`useArrangementPositionStore\`-ის შეცდომის ტექსტი საკუთარ სახელს ასახელებს.
- **PREVIEW-VOLUME-IDENTITY:** Volume-ის preview, რომელიც მნიშვნელობას არ ცვლის, აღარ იწვევს render-სა და \`syncPlayback\`-ს. ასეთია clamp-ის შემდეგ იგივე მნიშვნელობა ან არარსებული ტრეკი. შემოწმება \`flushPendingMaster\`-ის შემდეგ ხდება, \`previewMasterGain\`-ის მსგავსად. \`model.ts\` უცვლელია.
- **C:** R44-S, R44-U (mutation a–f), R44-TR, R44-REG (ორმაგი click 100 %-ზე → 0 ჩანაწერი; Mute; Master; Delete fader-ზე focus-ით), R44-Doc, G44-1..3.

**Round 43-ის დახარისხება კოდის გარეშე (B, D-29z9; დასაბუთება \`b-round-43.md\` §3):**
- TASK-R43-HTZERO — დახურულია (task-ის ტექსტი). Harness-ის წესი: ≈ 0 dBFS-ის fixture-ში ვიდეო Mute-ზეა.
- A-R43-EXACT-5DB — **მიღებულია**: ზუსტად +5.0-ზე ორივე branch წესებს აკმაყოფილებს.
- A-R43-REVIEW-W66 — **მიღებულია, დაკვირვებით**: Master meter-ის სიგანის ცვლილებისას R43-HT თავიდან იზომება.
- A-R43-REVIEW-ROOTFONT — **მიღებულია** (info).

შემდეგ: Round 45 — polish (SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, doc-ების შენიშვნები); შემდეგ SRW-14 ეტაპი 1 (FB-13 Grid/Snap), SRW-15..20 (FB-09/11, FB-10, FB-12, FB-06, FB-07), SRW-21, სრული რეგრესია, T12. C-R41-01 — Tech Lead-ის პასუხის მიხედვით (TL-Q-VIEWPORT).

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 44 -StartPhase A\`.

**Round 43-ის შედეგი** (A \`a-round-43.md\`, C \`c-round-43.md\`): **C PASS ყველა კონტრაქტულ ID-ზე.**
- **PASS:**
  - G43-1: tsc 0; vitest 76 ფაილი 1341/1341; frozen 12 ფაილი 227; build; \`npm run verify\` exit 0; Biome — 2 baseline CRLF error, 218 warning.
  - G43-2: 5 კონტრაქტული ბილიკი, 387 OK, protected 4/4.
  - G43-3: ანონიმური \`/studio-lab\` პირდაპირ და header-იდან; 0 token/recording/download/R2; Authorization 0; token 401; fake Bearer → 500 ტოკენის გარეშე; \`/studio/middle-east\` → Sign in required.
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
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-15 12:06, \`b-round-43/\`): HEAD \`2c0f800\` ორივე remote-ზე, \`git status\` ცარიელი, 391 OK (ახალი სია \`b-round-43-tree-sha256.txt\`), protected 4/4, tsc 0, vitest 76/1341, \`/studio-lab\` 200, \`node.exe\` 15.

`;
t = t.slice(0, curStart) + newCurrent + t.slice(curEnd);

const srw13 = lineStartingWith('| SRW-13 |');
let s = srw13.replace('4b-2 ჯგუფი 1 (Round 39–41) და ჯგუფი 2 (Round 42) მზადაა; ჯგუფი 3 კოდის გარეშე გადაწყდა (D-29z8);', '4b-2 ჯგუფი 1 (Round 39–41), ჯგუფი 2 (Round 42) და ჯგუფი 4 (Round 43) მზადაა; ჯგუფი 3 კოდის გარეშე გადაწყდა (D-29z8);');
s = s.replace('ჯგუფი 2: `c-round-42.md` |', 'ჯგუფი 2: `c-round-42.md`; ჯგუფი 4: `c-round-43.md` |');
s = s.replace('Round 43 — ჯგუფი 4 (D-29z8) მუშავდება; 44: 4c (R9 M1/L8, PREVIEW-VOLUME-IDENTITY); 45: polish.', 'Round 44 — 4c (R9 M1/L8, PREVIEW-VOLUME-IDENTITY; D-29z9) მუშავდება; 45: polish.');
if (s === srw13) { console.error('SRW-13 unchanged'); process.exit(1); }
rep(srw13, s);

rep(lineStartingWith('| MASTER-HOLD-TICK-EDGE |'), '| MASTER-HOLD-TICK-EDGE | Low | **მზადაა** (Round 43; `2c0f800`) | `c-round-43.md` §3, §4 | ≥ +6 dB-ზე tick მთლიანად ყუთშია (1440 და 1280); ≤ +5 dB-ზე პოზიცია უცვლელია (max 0.061 px) |');
rep(lineStartingWith('| A-R38-TEST-ORDER |'), '| A-R38-TEST-ORDER | Low | **მზადაა** (Round 43; ეკვივალენტობა დადასტურდა) | `c-round-43.md` §4; doc 040 | mutation (i) 155/155 ცოცხალია, მაგრამ განსხვავებული შემთხვევა არ არსებობს: root capture და begin-ის flush-ები ერთსა და იმავე შედეგს იძლევიან. S1–S5 — contract pin-ები |');
rep(lineStartingWith('| A-R37-TEST-HARDENING |'), '| A-R37-TEST-HARDENING | Low | **მზადაა** (Round 43; `2c0f800`) | `c-round-43.md` §2, §4 (e) | N5 ახალ pin-ზე წითლდება, snapshot-ზე — არა; N1/N2 focus-ს რეალურად გადაიტანს |');
rep(lineStartingWith('| R9-REVIEWER-M1-L8 |'), '| R9-REVIEWER-M1-L8 | Low | **მუშავდება** (Round 44, D-29z9) | `a-round-9.md` l.227–237 | M1: `transportRunningRef` იშლება (წამკითხველი არ ჰყავს); L8: `useArrangementPositionStore`-ის შეცდომის ტექსტი. C: R44-S, R44-U, R44-TR |');
rep(lineStartingWith('| PREVIEW-VOLUME-IDENTITY |'), '| PREVIEW-VOLUME-IDENTITY | info | **მუშავდება** (Round 44, D-29z9) | `checkpoint-r38-review.md` #6 | `previewTrackVolume` უცვლელ (clamp-ის შემდეგ) მნიშვნელობაზე ან არარსებულ ტრეკზე render-ის გარეშე ბრუნდება; `flushPendingMaster`-ის შემდეგ; `model.ts` უცვლელია. C: R44-U (render-count pin-ები), R44-REG |');
rep(lineStartingWith('| ENV-BROWSE-DAEMON |'), '| ENV-BROWSE-DAEMON | info | **არ ეხება კოდს** (გარემო) | `c-round-40.md` §0, §10; `c-round-42.md` §1; `c-round-43.md` §8, `c-round-43/runs/daemon-diag.txt` | Round 43-ში CLI-ით გაშვებული daemon-ები უმოქმედოდაც კვდებოდა. Round 44-იდან დამტკიცებული fallback: საკუთარი `server-node.mjs` (`BROWSE_PARENT_PID=0`, ახალი state, log); `$B restart` აკრძალულია |');

const r42notes = lineStartingWith('**Round 42:** დაიხურა');
rep(r42notes, '**Round 43:** დაიხურა MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING, A-R38-TEST-ORDER (ეკვივალენტობა), TASK-R43-HTZERO, ROOT-ROUND42-CHECKPOINT-RECORD. მიღებულია (B, D-29z9): A-R43-EXACT-5DB, A-R43-REVIEW-W66 (დაკვირვებით), A-R43-REVIEW-ROOTFONT. ახალი: ROOT-ROUND43-CHECKPOINT-RECORD (root). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (უცვლელი).\n\n' + r42notes);

const tableAnchor = lineStartingWith('| MASTER-HOLD-TICK-EDGE |');
rep(tableAnchor, tableAnchor + '\n| A-R43-EXACT-5DB | Low | **მიღებულია** (D-29z9) | `a-round-43.md` §5 | ზუსტად +5.0-ზე ორივე branch წესებს აკმაყოფილებს (Δ 0.21 ≤ 0.5, ყუთში) |\n| A-R43-REVIEW-W66 | Low | **მიღებულია** (დაკვირვებით, D-29z9) | `a-round-43.md` §5; doc 040 | meter `w-20` (80 px); სიგანის ცვლილებისას R43-HT თავიდან |\n| A-R43-REVIEW-ROOTFONT | info | **მიღებულია** (D-29z9) | `a-round-43.md` §5; doc 040 | 16 px root-ზე; zoom px-სა და rem-ს თანაბრად ცვლის |\n| ROOT-ROUND43-CHECKPOINT-RECORD | info | **root** | `b-round-43/gates.txt` | `2c0f800` ორივე remote-ზეა; `publication-checkpoint.json`-ში `round43Checkpoint` ჯერ არ არის |');

fs.writeFileSync(path, t);
console.log('feature-status updated');
