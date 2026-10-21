const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'feature-status.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync(dir + 'b-scripts/feature-status.before-r21.md', t);
const rep = (a, b) => {
  if (!t.includes(a)) throw new Error('anchor missing: ' + a.slice(0, 90));
  t = t.replace(a, b);
};

rep('ავტორი: B (round 19 → round 20 დაგეგმვა)', 'ავტორი: B (round 20 → round 21 დაგეგმვა)');

const headStart = t.indexOf('მიმდინარე რაუნდი: **Round 20**');
const headEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
if (headStart < 0 || headEnd < 0) throw new Error('header block');
const head = `მიმდინარე რაუნდი: **Round 21** (\`current-task.md\`, D-29l) — milestone-ის სრული რეგრესია, **run 2 / 2**, იმავე გაყინულ app tree-ზე:
- **C:** R2-V1, R3-V2, R3-V4 (D-19-ის ფორმა), R5-L3 + R5-E1, C-R12-01 RF5-3-ით (dock-ის live position), SRW-11B end to end (R11-P1b, P1c, P2, P3, P4, U) + ერთი mode-D run მხოლოდ ინფორმაციისთვის;
- **A:** ფაილი არ იცვლება, მხოლოდ tree-ის attestation (\`b-round-20-tree-sha256.txt\`, 50 OK).

შემდეგ: milestone-ის fix-ის რაუნდი (run 2-ის ბაგები, A-ს round-11 follow-up-ები, \`ArrangementLane.tsx:661\`), შემდეგ SRW-13.

**Loop runner:** \`run-loop.ps1\`-ის \`RoundLimit\` ნაგულისხმევად 20-ია. Round 21-ისთვის runner-ის გადატვირთვა შეიძლება დასჭირდეს (\`-StartRound 21 -StartPhase A\`, უფრო მაღალი \`-RoundLimit\`).

Round 20-ის შედეგი (C, \`c-round-20.md\`): **PASS**, ახალი ბაგი არ არის.
- **Run 1 PASS (17/17):** R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (ორივე viewport), R12-L2 (ორივე viewport), R12-L4 (synthetic ნაწილი; რეალური drag — Tech Lead).
- **ასევე PASS:** R20-Doc, G20-1..3 (vitest 999/999, tsc 0, Biome 0 error, build; frozen 49 OK + doc 027; ანონიმური \`/studio-lab\` სუფთაა). რეალური WAV: 18.000 წმ, NaN 0, 1800 FS sample (R13-M4 carry).
- **B-ის შესწორება:** R6-S5-ის „Ctrl+E 2+ → უარი“ ტექსტი D-25-ის ჯგუფის split-ით ჩანაცვლდა (\`backlog.json\` → \`regression_debt_g6r.acceptance_amendments\`).
- **C-ის შენიშვნები (ბაგი არ არის):** Delete Time-ის Undo playhead-ს არ აბრუნებს (კრიტერიუმი მხოლოდ arrangement-ს ეხება); doc 027-ის heading-ში ჩაშენებული ფრჩხილები (cosmetic).

`;
t = t.slice(0, headStart) + head + t.slice(headEnd);

rep(
  '| `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R1-B5 და R9-C5: milestone run 1 (Round 20) |',
  '| `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5); milestone run 1: `c-round-20.md` §2.1, §2.12 (R1-B5, R9-C5) | — |',
);
rep(
  '`c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე) | R8-M3/M4: milestone run 1 (Round 20). Tech Lead: რეალური მაუსი (R8-M1/M2) |',
  '`c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |',
);
rep(
  'Milestone-ის რეგრესია (Round 20–21), შემდეგ fix-ის რაუნდი. M1/L8',
  'Milestone run 2 (Round 21; run 1 C PASS), შემდეგ fix-ის რაუნდი. M1/L8',
);
rep('| R2-V1: milestone run 2 (Round 21) |', '| R2-V1: milestone run 2 (Round 21, მიმდინარე) |');
rep(
  '`c-round-19.md` §1, §6 (G19-3; WAV 18.000 წმ) | — |',
  '`c-round-19.md` §1, §6 (G19-3; WAV 18.000 წმ); `c-round-20.md` §1 (G20-3; WAV 18.000 წმ, NaN 0) | — |',
);
rep('| `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე) | R6-S5: milestone run 1 (Round 20) |', '| `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე); `c-round-20.md` §2.5 (R6-S5, D-25) | — |');
rep('| `c-round-5.md` | R7-D2..D5: milestone run 1 (Round 20) |', '| `c-round-5.md`; `c-round-20.md` §2.6–§2.9 (R7-D2..D5) | — |');
rep('`c-round-7.md` (R26-*, R30-*) | R8-M3/M4: milestone run 1 (Round 20) |', '`c-round-7.md` (R26-*, R30-*); `c-round-20.md` §2.10–§2.11 | — |');
rep('| `c-round-5.md` | R9-C5: milestone run 1 (Round 20) |', '| `c-round-5.md`; `c-round-20.md` §2.12 (R9-C5) | — |');
rep(
  '`c-round-17.md` §7 (R11A-1 quick) | R11A-2 (keys): milestone run 1 (Round 20) |',
  '`c-round-17.md` §7 (R11A-1 quick); `c-round-20.md` §2.15 (R11A-2, ორივე viewport) | — |',
);
rep(
  '| Milestone run 2 (Round 21): SRW-11B end to end.',
  '| Milestone run 2 (Round 21, მიმდინარე): SRW-11B end to end.',
);
rep(
  ' | R12-L2 და R12-L4-ის synthetic ნაწილი: milestone run 1 (Round 20). R12-L4: Tech Lead-ის რეალური HTML5 drag.',
  '; `c-round-20.md` §2.13, §2.16–§2.17 (R5-B5, R12-L2, R12-L4 synthetic) | R12-L4: Tech Lead-ის რეალური HTML5 drag.',
);
rep(
  '| Milestone run 2 (Round 21), RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b).',
  '| Milestone run 2 (Round 21, მიმდინარე), RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b, D-29l-ის ცხრილი).',
);

const debtStart = t.indexOf('## 4. რეგრესიის ვალი (PASS არ არის)');
const debtEnd = t.indexOf('## 5. Tech Lead-ის ხელით შემოწმებები');
if (debtStart < 0 || debtEnd < 0) throw new Error('debt block');
const debt = `## 4. რეგრესიის ვალი

Milestone-ის სრული რეგრესია ორ run-ად მიდის (D-29k, D-29l):
- **Run 1 (Round 20) — C PASS, 17/17** (\`c-round-20.md\` §2): R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (კლავიშები), R12-L2, R12-L4 (synthetic ნაწილი; რეალური drag — Tech Lead);
- **Run 2 (Round 21) — მიმდინარე, PASS არ არის:** R2-V1, R3-V2, R3-V4, R5-L3 (+ R5-E1), C-R12-01 (RF5-3), SRW-11B end to end.

დარჩენილი ვალი: \`R2-V1, R3-V2, R3-V4, R5-L3\`. PASS მხოლოდ C-ის ახალი მტკიცებულებით ჩაიწერება.

`;
t = t.slice(0, debtStart) + debt + t.slice(debtEnd);
rep('- round 6–19-ის დაუკომიტებელი tree (Round 20-ში app-ს კოდი არ იცვლება);', '- round 6–20-ის დაუკომიტებელი tree (Round 20–21-ში app-ის კოდი არ იცვლება);');
fs.writeFileSync(p, t);
console.log('feature-status updated');
