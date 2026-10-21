const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync('C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/plan.before-r20.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const d29k = `**D-29k — Round 19-ის შედეგი და milestone-ის სრული რეგრესია (Round 20–21).** C round 19-ის შედეგი (\`c-round-19.md\`): **PASS**, ახალი ბაგი არ არის. R19-D1, R19-D2 (8/8 რიგი, ±0 px), R19-A, R19-U, R19-Doc, მეზობელი რეგრესიები და G19-1..3 PASS-ია. vitest 999/999. **C-R18-01 დაიხურა**, D-29j დადასტურდა.

- **Milestone-ის რეგრესია ახლა იწყება, გაყინულ app tree-ზე.** Fix-ის რაუნდი რეგრესიაში არ ერთიანდება: A-ს round-11 follow-up-ები \`StudioWorkspace.tsx\`-სა და \`ArrangementLane.tsx\`-ს ეხება (საერთო ინფრასტრუქტურა). ისინი 21 ID-ის შედეგის მიკუთვნებას დაარღვევდა, ამიტომ fix-ის რაუნდი სერტიფიცირებულ tree-ზე მოდის.
- **ორ შემოსაზღვრულ run-ად (\`agent-workflow.md\`):**
  - **Run 1 (Round 20)** — სინქრონის გარეშე რედაქტირების ID-ები: R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (კლავიშები), R12-L2, R12-L4 (synthetic ნაწილი; რეალური HTML5 drag Tech Lead-ზე რჩება). R9-C5 და R8-M3/M4 ერთდროულად FB-02/FB-03-ის quick-ებია;
  - **Run 2 (Round 21)** — ვიდეო/სინქრონი: R2-V1 (FB-15-ის quick), R3-V2, R3-V4, R5-L3, C-R12-01 RF5-3-ით dock-ის live position-ით (D-19b), SRW-11B end to end. სინქრონის ბიუჯეტი თითო განლაგებაზე: 3 ვალიდური + 2 ჩანაცვლება.
- **A Round 20-ში:** loop runner A-ს ყოველთვის უშვებს, ამიტომ A-ს ეკუთვნის მხოლოდ doc 027-ის relabel (C-ის round-19 შენიშვნა: სათაური და round-18 სექციები (d)-ს ისევ შეჩერებულად და 13 ტესტით აღწერს). \`app/\` გაყინულია \`b-round-19-tree-sha256.txt\`-ით.
- რეგრესიის ჩავარდნა ბაგი ხდება და fix-ის რაუნდში შედის. ტოლერანსი არ სუსტდება.
- **შემდეგ:** milestone-ის fix-ის რაუნდი (A-ს round-11 follow-up-ები, \`ArrangementLane.tsx:661\`-ის მიზეზის ტექსტი, რეგრესიის ბაგები), შემდეგ SRW-13.

მიზეზი: ღია C ბაგი აღარ არის (C-R6-02 და C-R8-01 Tech Lead-ის quiet Chrome-ზეა, C-R12-01 run 2-ში შედის). SRW-11B-ისა და polish-ის დასრულება წესით milestone-ის რეგრესიას მოითხოვს. მოცულობა არ მცირდება: ყველა 21 ID და SRW-11B end to end ორ run-ში იფარება.

`;
rep('**ვიდეოს import (SRW-02, FB-15).**', d29k + '**ვიდეოს import (SRW-02, FB-15).**');

rep(
  'Round 19: C-R18-01 (D-29j, `w-72`). M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ. design-philosopher-ს',
  'Round 19: C-R18-01 (D-29j, `w-72`; C PASS, დაიხურა). Round 20–21: milestone-ის რეგრესია (D-29k). M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ. design-philosopher-ს',
);

rep(
  '| — | SRW-13 | Clip gain, pan, master, meters (milestone-ის შემდეგ) |',
  '| 20 | Milestone-ის რეგრესია, run 1 | სინქრონის გარეშე რედაქტირების ID-ები (D-29k), C გაყინულ tree-ზე; A — მხოლოდ doc 027-ის relabel |\n| 21 | Milestone-ის რეგრესია, run 2 | ვიდეო/სინქრონი: R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 (RF5-3), SRW-11B end to end |\n| 22 | Milestone-ის fix-ის რაუნდი | A-ს round-11 follow-up-ები, `ArrangementLane.tsx:661`, რეგრესიის ბაგები |\n| — | SRW-13 | Clip gain, pan, master, meters (milestone-ის შემდეგ) |',
);

rep(
  'Round 16-ის, Round 17-ისა და Round 18-ის შემდეგ advisor ხელმისაწვდომი იყო',
  'Round 16-ის, Round 17-ის, Round 18-ისა და Round 19-ის შემდეგ advisor ხელმისაწვდომი იყო',
);

rep(
  '- **Round 19: გაგზავნილია.** C-R18-01 (D-29j), მხოლოდ `ArrangementDetailPanel.tsx`. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 19: C PASS** (\`tmp/studio-real-loop/c-round-19.md\`). R19-D1, R19-D2, R19-A, R19-U, R19-Doc, მეზობელი რეგრესიები და G19-1..3 PASS-ია. vitest 999/999. ახალი ბაგი არ არის.
  - **დაიხურა:** C-R18-01 (design (d), \`w-72\`).
- **Round 20: გაგზავნილია.** Milestone-ის რეგრესია, run 1 (D-29k): C — სინქრონის გარეშე რედაქტირების ID-ები; A — მხოლოდ doc 027-ის relabel, \`app/\` გაყინულია. პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);

rep(
  'SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R18-01 (Round 19), M1/L8',
  'SRW-11B: C-R8-01 (Tech Lead quiet Chrome), milestone-ის რეგრესია (Round 20–21), M1/L8',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
