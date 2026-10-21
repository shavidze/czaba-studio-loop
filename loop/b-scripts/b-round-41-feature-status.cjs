const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let lines = fs.readFileSync(p, 'utf8').split('\n');
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(!lines.some((l) => l.includes('D-29z7')), 'already updated');
const idx = (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); must(i >= 0, 'missing ' + prefix); return i; };
const setLine = (prefix, text) => { lines[idx(prefix)] = text; };

setLine('განახლდა:', 'განახლდა: 2026-10-14 · ავტორი: B (round 41 → round 42 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`');

setLine('- **C-R23-01 ისევ ღიაა', '- **C-R23-01 ისევ ღიაა (C-R38-01).** `/studio-lab`-ის SSR HTML-ში C round 41-ში **3 NUL byte**-ია (11729, 28025, 28026; 64 312 byte; round 40-ის 58745/58746 წყვილი round 41-ის byte-ებით გადაინაცვლა — offset-ები ფიქსირებულია, შინაარსი მათ ქვეშ იცვლება), hydration-ის შემდეგ **1** U+FFFD `aria-label` (ბიბლიოთეკის დაკეცვის ღილაკი; round 40-ში 2). screen reader-ი გატეხილ სახელს კითხულობს. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.');
{
  const i = idx('- **C-R27-01 (Medium)**');
  lines.splice(i + 1, 0, '- **ახალი კითხვა TL-Q-VIEWPORT (C-R41-01, Low, არ ბლოკავს):** 1280 px-ზე ვიწრო სიგანე (მაგ. 1024×768) Studio-ს ფარგლებშია? თქვენ დაასახელეთ 1280×720 და 1440×900. 1024×768-ზე detail panel-ის ვიდეოს მიზეზი ყუთში 4.5 px-ით იჭრება (scroll-ის გარეშე), ჯგუფის მიზეზი scroll-ით ჩანს; ტექსტი `title`-შიც არის. თუ „დიახ“ — ის ჯგუფ 3-მდე დაიგეგმება (კანდიდატი `b-round-41.md` §4).');
}
setLine('- **R31-T:**', '- **R31-T:** Pan რეალური მაუსით და ყურსასმენით; ასევე — რეალურ Chrome-ში range აგრძელებს თუ არა `input`-ს focus-ის დაკარგვის შემდეგ, როცა ღილაკი დაჭერილია. **Round 42-ის შემდეგ:** Pan-ის drag → Alt+Tab ღილაკის დაჭერით → ფანჯრის გარეთ აშვება → დაბრუნება → ArrowRight Pan-ს ამოძრავებს (D-29z7).');

{
  const i = idx('- **Round 39–40 დაკომიტებულია და გამოქვეყნებულია**');
  lines.splice(i + 1, 0, '- **Round 41 დაკომიტებულია და გამოქვეყნებულია** — `ea35611` (`fix(studio): show detail reasons and style panel scrolling`), ორივე master remote (`publication-checkpoint.json` → `round41Checkpoint`; root-ის verify 73 / 1325, lint/types/build, 2 smoke, ორივე pre-push gate; review `checkpoint-r41-review.md` — No High/Medium, 2 Low: red-run-ის provenance (A-მ გაასწორა, `a-round-41/red-run-final.txt`) და ვიწრო viewport (= C-R41-01)). B-მ გადაამოწმა: HEAD-ის 3 ფაილი C-ის sha-ებითაა (`61834b2a`, `cf894ea3`, `b919643f`), `git status` ცარიელია, 386 OK, protected 4/4. Agent-ის კონფიგები — `54922e6` (`agentConfigCheckpoint`; 17 `.codex/agents/*.toml` ახლა tracked-ია) → ROOT-CODEX-AGENT-FILES **მზადაა** (root-ის მტკიცებულება). Round 42-ის baseline — HEAD `ea35611`.');
}
setLine('- Dev server:', '- Dev server: B-ის დაგეგმვისას (2026-10-14 17:33) `/studio-lab` 200. Round 41-ში gstack browse daemon ნელა ირთვებოდა (A-ს smoke არ გაეშვა; C-ს ერთი promise poll 10 წთ ჩამოეკიდა) და Windows Defender-მა (≈ 172 % CPU) C-ის პირველ gate-ს timeout-ები გამოუწვია — ხელახალი გაშვება მწვანეა (ENV-BROWSE-DAEMON). B-ის gate-ებისას `node.exe` 32–44.');

const curStart = idx('მიმდინარე რაუნდი:');
const resultEnd = idx('- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 18:37');
lines.splice(curStart, resultEnd - curStart + 1,
  'მიმდინარე რაუნდი: **Round 42** (`current-task.md`, D-29z7) — SRW-13, ეტაპი 4b-2, ჯგუფი 2 (ორი დაკავშირებული Low წყვილი, ერთი ფაილი `ArrangementLane.tsx` + ახალი ტესტი + doc 039):',
  '- **A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK:** Pan-ის slider-ზე keydown blur suppression-ს ხსნის — Alt+Tab-ით შეწყვეტილი drag-ის შემდეგ ისრები ისევ მუშაობს (ერთი `Pan — <ტრეკი>` ჩანაწერი ღილაკზე); keydown-ის გარეშე `change` კვლავ იგნორდება (C-R31-01); Delete/Backspace/Space window-მდე აღწევს.',
  '- **A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES:** window blur-ზე Lane-ის Pan drag-ის აღრიცხვა სრულდება — ძველი draft აღარ ჩანს და სხვა gesture-ის დროს კლავიატურა მხოლოდ ვიზუალურ draft-ს აღარ ქმნის.',
  '- **C:** R42-PK (keydown-ით აღდგენა, 1440 + 1280), R42-RW (window blur), R42-REG (Pan-ის ისრები, reset, Delete/Space, drag, Volume/Master), R42-S, R42-U (mutation a–f), R42-Doc, G42-1..3.',
  '',
  'შემდეგ: Round 43 — FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; Round 44 — MASTER-HOLD-TICK-EDGE + test hardening; შემდეგ 4c + polish; შემდეგ SRW-14..20 (FB-13, FB-09/11, FB-10, FB-12, FB-06, FB-07), SRW-21, სრული რეგრესია, T12. C-R41-01 — Tech Lead-ის პასუხის მიხედვით (TL-Q-VIEWPORT).',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 42 -StartPhase A`.',
  '',
  '**Round 41-ის შედეგი** (A `a-round-41.md`, C `c-round-41.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**',
  '- **PASS:** G41-1 (დატვირთვის გარეშე: `npm run verify` exit 0, 73 ფაილი, 1325/1325; Defender-ის დატვირთვით პირველი გაშვება timeout-ებით ჩავარდა — ორივე ანგარიშშია); G41-2; G41-3 (ანონიმური `/studio-lab` პირდაპირ და header-იდან, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required); R41-S; R41-U (ძველ კოდზე RF1/RF2/RF5 წითელია, mutation a–h); R41-Doc; R41-RV 6/6 (ვიდეო და ჯგუფი 1440-ზე, 1280-ზე — panel 122-ითაც — და 120 px მინიმუმზე, ყველა მიზეზი `scrollTop` 0-ზე ჩანს; RV-SWITCH); R41-SB (10 px stable gutter, 15 წესი; სვეტები 288/490/176/128 და 288/330/176/128); R41-NONE; R41-PM; R41-MN-1..4; R41-K.',
  '- **დაიხურა:** C-R40-01, DOC038-STALE-LINES.',
  '- **ახალი:** C-R41-01 (Low, 1024×768 — Tech Lead-ის კითხვა TL-Q-VIEWPORT); ESC-DESELECT-NOTE (info, C-ის harness-ის შენიშვნა); R41-RECORDS (info: SB-4, 120 px-ზე none-ის მიზეზი 7/13 px, MN-4-ის overlay).',
  '- **Ableton:** ორივე სტრიქონი „არ ეხება“ (CZABA-ს layout და მომხმარებლის scrollbar-ის მოთხოვნა).',
  '- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 17:33, `b-round-41/gates.txt`): HEAD `ea35611`, `git status` ცარიელი, 3 ფაილი C-ის sha-ებით, 386 OK (ახალი სია `b-round-41-tree-sha256.txt`), protected 4/4, tsc 0, vitest 73/1325, `/studio-lab` 200, `node.exe` 32–44.'
);

setLine('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36–41 ID-ები PASS-ია; C-R40-01 დაიხურა Round 41-ში. ღიაა Low C-R41-01 — მხოლოდ 1024×768-ზე, Tech Lead-ის კითხვა) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN; `c-round-38.md` R38-CR; `c-round-39.md` R39-PM/ST; `c-round-40.md` R40-PM; `c-round-41.md` R41-RV/PM | Tech Lead: R30-T, R34-T, R35-T, TL-Q-VIEWPORT. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');
setLine('| FB-05 |', '| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. double-click reset და click-ზე არ ხტომა — Round 38 C PASS (synthetic dblclick, რეალური click). review-ის Low-ები A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK და A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES → Round 42 მუშავდება) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G); `c-round-38.md` (PG-P, DR-P, DC-P, MN-RESET) | Tech Lead: R31-T (Round 42-ის შემდეგ Alt+Tab-ის ნაბიჯითაც), R33-T, R38-T. Round 42 — D-29z7 |');
setLine('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5, 4b-1 და 4b-2 ჯგუფი 1 (Round 39–41) მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R41-01 (Low, Tech Lead-ის viewport-ის კითხვა)) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md`; 4b-2 ჯგუფი 1: `c-round-39.md`, `c-round-40.md`, `c-round-41.md` | Round 42 — Pan-ის ჯგუფი (D-29z7) მუშავდება; 43: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; 44: Master-ის hold tick + test hardening. შემდეგ 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY. C-R27-01: Tech Lead |');

setLine('| A-R31-REVIEW-2 |', '| A-R31-REVIEW-2 | Low | **მუშავდება** (Round 42, D-29z7) | `a-round-31.md` §4 finding 2 | lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური); Lane-ის Pan-ის აღრიცხვა window blur-ზეც სრულდება |');
setLine('| A-R32-REVIEW-1 |', '| A-R32-REVIEW-1 | Low | **მუშავდება** (Round 42, D-29z7) | `a-round-32.md` §4 finding 1; `c-round-32/runs/bc-pid1-realclick.txt` | Pan-ზე keydown suppression-ს ხსნის (frozen `fader-guards` l.363–430 მწვანე რჩება) |');
setLine('| CP-R37-PAN-KEY-LOCK |', '| CP-R37-PAN-KEY-LOCK | Low | **მუშავდება** (Round 42, A-R32-REVIEW-1-თან ერთად) | `checkpoint-r37-review.md` #1 | იგივე მიზეზი, იგივე ცვლილება |');
setLine('| CP-R37-DRAG-ENTRIES |', '| CP-R37-DRAG-ENTRIES | info | **მუშავდება** (Round 42, A-R31-REVIEW-2-თან ერთად) | `checkpoint-r37-review.md` #2; `backlog.json` → `round38_reeval` | window blur-ის abort element blur-ის გარეშე → Lane-ის draft და cleanup ახლა window blur-ზე სრულდება |');
setLine('| **C-R40-01** |', '| C-R40-01 | Low | **დაიხურა** (Round 41: R41-RV 6/6 — ყველა მიზეზი `scrollTop` 0-ზე ჩანს 1440-ზე, 1280-ზე და 120 px-ზე; R41-SB) | `c-round-41.md` §4.1, §4.2; `c-round-41/shots/rv-*.png` | — |');
{
  const i = idx('| C-R40-01 |');
  lines.splice(i + 1, 0, '| **C-R41-01** | Low | **ბაგია** (Tech Lead-ის კითხვა TL-Q-VIEWPORT; 1280×720 და 1440×900-ის გარეთ) | `c-round-41.md` §9; `c-round-41/runs/narrow-1024.txt`; `shots/narrow-grp-1024.png`; `checkpoint-r41-review.md` Low 2 | 1024×768: ვიდეოს მიზეზი `overflow-hidden` ყუთში ზემოდან/ქვემოდან 4.5 px-ით იჭრება (scroll არ არის), ჯგუფის — 28 px-ით ქვემოთ (scroll-დება). თუ ვიწრო სიგანე ფარგლებშია — ჯგუფ 3-მდე; კანდიდატი `b-round-41.md` §4 (ჰიპოთეზა) |');
}
setLine('| DOC038-STALE-LINES |', '| DOC038-STALE-LINES | Low | **დაიხურა** (Round 41: R41-Doc PASS) | `c-round-41.md` §5 | — |');
{
  const i = idx('| ENV-BROWSE-DAEMON |');
  lines.splice(i + 1, 0,
    '| ESC-DESELECT-NOTE | info | **აღრიცხულია** (არ იგეგმება) | `c-round-41.md` §0; `c-round-41/runs/esc-record.txt` | Playhead-ზე focus-ით REAL Escape ჯგუფს არ აუქმებს; round 40-ში იგივე თანმიმდევრობით გაუქმდა; C — focus-ზე დამოკიდებული, ბაგი არ არის |',
    '| R41-RECORDS | info | **აღრიცხულია** | `c-round-41.md` §4.2–§4.4 | SB-4 (Shift+Tab scroller-ს აღწევს, ArrowDown scroll-ავს); 120 px-ზე none-ის მიზეზი 7/13 px (info hint იგივეს ამბობს); MN-4 overlay მიზეზს ნაწილობრივ ფარავს, იკითხება |'
  );
}
{
  const i = idx('**Round 40:** დაიხურა');
  lines.splice(i, 0, '**Round 41:** დაიხურა C-R40-01, DOC038-STALE-LINES. ახალი: C-R41-01 (Low, 1024×768, Tech Lead-ის კითხვა), ESC-DESELECT-NOTE და R41-RECORDS (info). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026; 64 312 byte), 1 U+FFFD `aria-label` (round 40: 2).', '');
}
setLine('| **R31-T** |', '| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში. დამატებით: focus-ის დაკარგვისას (მაგ. Alt+Tab) დაჭერილი ღილაკით range აგრძელებს თუ არა `input`-ს (C-R31-01). Round 42-ის შემდეგ: Alt+Tab ღილაკის დაჭერით → გარეთ აშვება → დაბრუნება → ArrowRight Pan-ს ამოძრავებს | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია; C-მ synthetic event-ები გამოიყენა |');
{
  const i = idx('| **R31-T** |');
  lines.splice(i + 1, 0, '| **TL-Q-VIEWPORT** | 1280 px-ზე ვიწრო სიგანე (1024×768) ფარგლებშია? (C-R41-01) | მომხმარებელმა 1280×720 და 1440×900 დაასახელა; B viewport-ების მატრიცას თვითონ არ აფართოებს |');
}
fs.writeFileSync(p, lines.join('\n'));
console.log('feature-status updated');
