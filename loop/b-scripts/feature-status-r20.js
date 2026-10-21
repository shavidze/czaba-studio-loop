const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'feature-status.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync(dir + 'b-scripts/feature-status.before-r20.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const headStart = t.indexOf('განახლდა: 2026-10-11 · ავტორი: B (round 18 → round 19 დაგეგმვა)');
const headEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
if (headStart < 0 || headEnd < 0) throw new Error('header anchors');
const oldHead = t.slice(headStart, headEnd);
const statusLegend = oldHead.slice(oldHead.indexOf('სტატუსები:'), oldHead.indexOf('მიმდინარე რაუნდი:'));
const newHead = `განახლდა: 2026-10-11 · ავტორი: B (round 19 → round 20 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

${statusLegend}მიმდინარე რაუნდი: **Round 20** (\`current-task.md\`, D-29k) — milestone-ის სრული რეგრესია, **run 1 / 2**:
- **C:** სინქრონის გარეშე რედაქტირების ვალის ID-ები გაყინულ app tree-ზე: R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (კლავიშები), R12-L2, R12-L4 (synthetic ნაწილი);
- **A:** მხოლოდ doc 027-ის relabel (სათაური და round-18 სექციები). \`app/\` გაყინულია.

შემდეგ: Round 21 — run 2 (ვიდეო/სინქრონი, C-R12-01, SRW-11B end to end); Round 22 — milestone-ის fix-ის რაუნდი; შემდეგ SRW-13.

Round 19-ის შედეგი (C, \`c-round-19.md\`): **PASS**, ახალი ბაგი არ არის.
- **PASS:** R19-D1, R19-D2 (8/8 რიგი ±0 px: info 288, waveform 640/448/480/288, label-ები ≤ 80), R19-A, R19-U (guard G6/G6b/G7 + C-ის G6c–e), R19-Doc.
- **მეზობელი რეგრესიები PASS:** R8 detail quick, R18-B/W quick, R16-H1/F1 quick, R9-D3/RF7-P2. G19-1..3 PASS-ია, vitest 999/999.
- **დაიხურა:** C-R18-01.
- **C-ის შენიშვნები (ბაგი არ არის):** doc 027-ის სათაური მოძველებულია (Round 20, A); 1280-ზე panel შეიძლება collapsed ჩაიტვირთოს (შენახული მდგომარეობა, harness-ის შენიშვნა).

`;
t = t.slice(0, headStart) + newHead + t.slice(headEnd);

rep(
  '| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R9-C5 milestone-ის რეგრესიაში თავიდან |',
  '| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R1-B5 და R9-C5: milestone run 1 (Round 20) |',
);
rep(
  '| Tech Lead: რეალური მაუსი (R8-M1/M2) |',
  '| R8-M3/M4: milestone run 1 (Round 20). Tech Lead: რეალური მაუსი (R8-M1/M2) |',
);
rep(
  '**ბაგია** (ეტაპები 1–3-ის, polish 14a-ს, Round 17-ისა და Round 18-ის L4/L11/(b)/L6 C ID-ები PASS-ია; ღიაა C-R8-01 და C-R18-01, ორივე Medium)',
  '**ბაგია** (ეტაპები 1–3-ის, polish 14a/14b-ის, Round 17-ისა და Round 19-ის C ID-ები PASS-ია; ღიაა მხოლოდ C-R8-01, Medium, Tech Lead quiet Chrome)',
);
rep(
  'polish 14b: `c-round-18.md` §2–§7 | Round 19: C-R18-01 (D-29j). M1/L8',
  'polish 14b: `c-round-18.md` §2–§7; design (d): `c-round-19.md` §2–§4 | Milestone-ის რეგრესია (Round 20–21), შემდეგ fix-ის რაუნდი. M1/L8',
);
rep(
  '| R2-V1 milestone-ის რეგრესიაში თავიდან |',
  '| R2-V1: milestone run 2 (Round 21) |',
);
rep(
  'C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone RF5-3 |',
  'C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone run 2 (RF5-3, Round 21) |',
);
rep('`c-round-18.md` §1, §7 (G18-3; WAV 864 000 frame = 18.000 წმ) | — |', '`c-round-18.md` §1, §7 (G18-3; WAV 864 000 frame = 18.000 წმ); `c-round-19.md` §1, §6 (G19-3; WAV 18.000 წმ) | — |');
rep(
  'C-R12-01: milestone RF5-3. Round 19: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |',
  'C-R12-01: milestone run 2 (Round 21). R3-V2/R3-V4: run 2 |',
);
rep('| R6-S5 milestone-ის რეგრესიაში |', '| R6-S5: milestone run 1 (Round 20) |');
rep('| R7-D2..D5 milestone-ის რეგრესიაში |', '| R7-D2..D5: milestone run 1 (Round 20) |');
rep('| R8-M3/M4 milestone-ის რეგრესიაში |', '| R8-M3/M4: milestone run 1 (Round 20) |');
rep('| R9-C5 milestone-ის რეგრესიაში |', '| R9-C5: milestone run 1 (Round 20) |');
rep(
  'R11A-2 (keys) milestone-ის რეგრესიაში. Round 19-ში `ArrangementLibrary.tsx`, preview და dock გაყინულია |',
  'R11A-2 (keys): milestone run 1 (Round 20) |',
);
rep(
  '**ბაგია** (ეტაპები 1–3-ის, polish 14a-ს, Round 17-ისა და 14b-ის L4/L11/(b)/L6/A C ID-ები PASS-ია; ღიაა C-R8-01 და C-R18-01, ორივე Medium)',
  '**ბაგია** (ეტაპები 1–3-ის, polish 14a/14b-ის და Round 17/19-ის C ID-ები PASS-ია; ღიაა მხოლოდ C-R8-01, Medium)',
);
rep(
  'polish 14b: `c-round-18.md` §1–§7; D-29, D-29a–D-29j (`plan.md`) | Round 19: C-R18-01 (R19-D1, R19-D2, R19-A, R19-U, R19-Doc). M1/L8',
  'polish 14b: `c-round-18.md` §1–§7; design (d): `c-round-19.md` §1–§6; D-29, D-29a–D-29k (`plan.md`) | Milestone run 2 (Round 21): SRW-11B end to end. M1/L8',
);
rep(
  '| R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag.',
  '| R12-L2 და R12-L4-ის synthetic ნაწილი: milestone run 1 (Round 20). R12-L4: Tech Lead-ის რეალური HTML5 drag.',
);
rep('| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 20 |', '| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | SRW-13-ის შემდეგ (SRW-10-ზეა დამოკიდებული) |');
rep(
  '| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 20, SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |',
  '| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |',
);
rep('| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 21 |', '| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | SRW-15-ის შემდეგ |');
rep('| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 22, SRW-13-ის შემდეგ |', '| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |');
rep('| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 23, SRW-13-ის შემდეგ |', '| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |');
rep('| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 24 (C-R6-02 Tech Lead-ზეა) |', '| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | SRW-18-ის შემდეგ (C-R6-02 Tech Lead-ზეა) |');
rep('| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 25, SRW-13-ის შემდეგ |', '| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |');

const bugRowStart = t.indexOf('| C-R18-01 | Medium |');
if (bugRowStart < 0) throw new Error('C-R18-01 row');
const bugRowEnd = t.indexOf('\n', bugRowStart) + 1;
t = t.slice(0, bugRowStart) + t.slice(bugRowEnd);
rep(
  '| Milestone RF5-3: start-ის rate-ის ჩაწერები',
  '| Milestone run 2 (Round 21), RF5-3: start-ის rate-ის ჩაწერები',
);
rep(
  '**Round 18-ში C-ის მტკიცებულებით დასრულდა (ბაგი არ ყოფილა):**',
  '**ბოლოს დაიხურა (Round 19):** C-R18-01 — design (d)-ის ქართული label-ები `w-72`-ით (`c-round-19.md` §2–§4; R19-D1/D2 8/8 რიგი ±0 px, guard G6/G6b/G7).\n\n**Round 18-ში C-ის მტკიცებულებით დასრულდა (ბაგი არ ყოფილა):**',
);
rep(
  '  - Round 18: L4, L11, design (b), L6 (C PASS); design (d) → C-R18-01, Round 19 (D-29j);',
  '  - Round 18: L4, L11, design (b), L6 (C PASS); design (d) → C-R18-01, Round 19 (D-29j, C PASS);',
);
rep(
  '  - A-ს round-11 დარჩენილი follow-up-ები (`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით): milestone-ის fix-ის რაუნდი (D-29i).',
  '  - A-ს round-11 დარჩენილი follow-up-ები (`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით, fold-ის ჩუმი უარი gesture-ის დროს): milestone-ის fix-ის რაუნდი (Round 22, D-29k), რეგრესიის შემდეგ.',
);
rep(
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–18-ის Studio სამუშაო',
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–19-ის Studio სამუშაო',
);
rep(
  'ეს წესის შესაბამისია, მაგრამ რისკი იზრდება.',
  'ეს წესის შესაბამისია, მაგრამ რისკი იზრდება. A-ს round-19 deviation 5: საკუთარი გაჭედილი python heredoc timeout-ზე დატოვა; C-ის შემოწმებისას python პროცესი აღარ ჩანდა (root-ს არ გადაუმოწმებია).',
);

rep(
  'ქვემოთ ჩამოთვლილი ID-ები ადრეულ რაუნდებში გავიდა, მაგრამ C-მ round 6-ის შემდეგ თავიდან არ გაუშვა. ისინი milestone-ის სრულ რეგრესიაზე შემოწმდება: SRW-11B-ისა და polish-ის დასრულებისას, საერთო ინფრასტრუქტურის ცვლილებისას, ან უფრო ადრე, თუ რეგრესიის კონკრეტული მტკიცებულება გამოჩნდება.',
  'ქვემოთ ჩამოთვლილი ID-ები ადრეულ რაუნდებში გავიდა, მაგრამ C-მ round 6-ის შემდეგ თავიდან არ გაუშვა. Milestone-ის სრული რეგრესია ახლა მიმდინარეობს ორ run-ად (D-29k):\n- **Run 1 (Round 20):** R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (კლავიშები), R12-L2, R12-L4 (synthetic ნაწილი; რეალური drag — Tech Lead);\n- **Run 2 (Round 21):** R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 (RF5-3), SRW-11B end to end.\n\nPASS მხოლოდ C-ის ახალი მტკიცებულებით ჩაიწერება.',
);
rep('- round 6–19-ის დაუკომიტებელი tree;', '- round 6–19-ის დაუკომიტებელი tree (Round 20-ში app-ს კოდი არ იცვლება);');

fs.writeFileSync(p, t);
console.log('feature-status updated');
