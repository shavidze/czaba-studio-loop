const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'feature-status.md');
let t = fs.readFileSync(file, 'utf8');
if (t.includes('round 11 → round 12 დაგეგმვა')) throw new Error('already applied');
const rep = (a, b) => {
  const i = t.indexOf(a);
  if (i < 0 || t.indexOf(a, i + 1) >= 0) throw new Error(`anchor: ${a.slice(0, 70)}`);
  t = t.replace(a, b);
};

rep('ავტორი: B (round 10 → round 11 დაგეგმვა)', 'ავტორი: B (round 11 → round 12 დაგეგმვა)');

const headStart = t.indexOf('მიმდინარე რაუნდი: **Round 11**');
const headEnd = t.indexOf('## 1. მომხმარებლის');
if (headStart < 0 || headEnd < 0) throw new Error('head anchors');
t = `${t.slice(0, headStart)}მიმდინარე რაუნდი: **Round 12** — C-R7-01: swap-ის შემდეგ ვიდეოს settle, დაზუსტებული D-19a (\`current-task.md\`). Round 13: ეტაპი 3 (მცურავი ვიდეო), თუ C-R7-01 დაიხურა ან Tech Lead-მა quiet-Chrome შედეგი მიიღო; სხვა შემთხვევაში polish 14a. შემდეგ polish 14a–14c და milestone-ის სრული რეგრესია.

Round 11-ის შედეგი (C, \`c-round-11.md\`): **PASS.** SRW-11B ეტაპი 2-ის ყველა ID (R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc), მეზობელი რეგრესიები და G11-1..3 PASS-ია, vitest 856/856.
- ახალი Low დაკვირვებები: **C-R11-01..03** → polish 14a (\`plan.md\` D-29c); **C-R11-04** მიღებული კონვენციაა (კოდი არ იცვლება).
- Export-ის 1 LSB სხვაობა clip-ის onset-ზე determinism control-შიც ჩანს → მიღებული ჩანაწერი \`export-clip-onset-1lsb\`. Export-ის შედარება ≤ 1.2e-7-ით რჩება.

${t.slice(headEnd)}`;

rep(
  '| FB-08 | პანელების განლაგება | **ბაგია** (SRW-11A მზადაა; ეტაპი 1-ის ყველა ID PASS-ია; ღიაა C-R8-01; ეტაპი 2 მუშავდება) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2; `c-round-9.md` §3 | C-R8-01: Tech Lead quiet Chrome. Round 11: fold/სიმაღლე/auto-fit + D-29b. Round 13: მცურავი ვიდეო. Round 14: polish |',
  '| FB-08 | პანელების განლაგება | **ბაგია** (SRW-11A მზადაა; ეტაპი 1-ისა და ეტაპი 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R11-01..03 (Low); ეტაპი 3 არ დაწყებულა) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4 | C-R8-01: Tech Lead quiet Chrome. Round 13: მცურავი ვიდეო. Polish 14a: C-R11-01..03 (D-29c). Tech Lead: R11-P3m, R11-SB |',
);
rep(
  '| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** |',
  '| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R7-01 მუშავდება, Round 12) |',
);
rep(
  '| Round 12: C-R7-01 (D-19a). C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap |',
  '| Round 12: C-R7-01 (დაზუსტებული D-19a, verdict R12-W1). C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap |',
);
rep(
  '| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** |',
  '| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R7-01 მუშავდება) |',
);
rep(
  '| Round 12: C-R7-01 (D-19a). C-R6-02: Tech Lead quiet Chrome |',
  '| Round 12: C-R7-01 (დაზუსტებული D-19a). C-R6-02: Tech Lead quiet Chrome |',
);
rep(
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპი 1-ის ყველა ID PASS-ია, ღიაა C-R8-01; ეტაპი 2 **მუშავდება**; ეტაპი 3 SRW-03-ს ელოდება) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; D-29, D-29a, D-29b (`plan.md`); ეტაპი 2: `current-task.md` | Round 11: ეტაპი 2. Round 13: ეტაპი 3. Round 14: polish. C-R8-01: Tech Lead quiet Chrome |',
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპი 1-ისა და 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 და C-R11-01..03; ეტაპი 3 არ დაწყებულა და SRW-03-ს ელოდება) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4, `c-round-11/shots/`; D-29, D-29a, D-29b, D-29c (`plan.md`) | Round 13: ეტაპი 3 (ან polish 14a, თუ R12-W1 ჩავარდა). Polish 14a–14c. C-R8-01: Tech Lead quiet Chrome |',
);
rep(
  '| C-R7-01 | Medium | **ბაგია** (მიზეზი დადგინდა; D-19a) |',
  '| C-R7-01 | Medium | **მუშავდება** (Round 12; მიზეზი დადგინდა; D-19a დაზუსტდა: settle მთავრდება band-ში ხელახლა შესვლისას, K ∈ [8, 9], rate ≤ 1.45, D-24-ს უპირატესობა) |',
);
rep(
  'Round 12: D-19a (swap-ის შემდეგ settle band ≤ 0.008, rate-ის დიაპაზონი უცვლელია). Verdict R10-W1 H3 წესით.',
  'Round 12: დაზუსტებული D-19a (swap-ის შემდეგ settle band ≤ 0.008, მდგრადი წესი უცვლელია). Verdict R12-W1 H3 წესით, 0 escalation და R12-S (rate არ "ნადირობს").',
);
rep(
  '**ბოლოს დაიხურა (C, round 10):**',
  `| C-R11-01 | Low | **ბაგია** | \`c-round-11/runs/unfold-manual-1440.json\` | Polish 14a, D-29c (1): დაკეცილ ხაზზე სახელურს pointer-ის hit area არ აქვს; ↑/↓ მხოლოდ შლის |
| C-R11-02 | Low | **ბაგია** | \`c-round-11/runs/p2a-1280-open-selected.json\`, \`p2a-1280-open-noselect.json\` | Polish 14a, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს |
| C-R11-03 | Low | **ბაგია** | \`c-round-11/runs/p2a-1280-afoff-a.json\` | Polish 14a, D-29c (3): cap-ის გამორთვისას panel rendered სიმაღლეს ინარჩუნებს |

**მიღებული კონვენცია (round 11):** C-R11-04 — დაკეცილ ხაზზე \`aria-valuenow\` გაშლის სიმაღლეა, \`aria-valuetext\` კი \`დაკეცილია · {h} px\` (N2). კოდი არ იცვლება.

**ბოლოს დაიხურა (C, round 10):**`,
);
rep(
  'და reviewer L11 ახლა **Round 14-ის panel polish**-შია',
  'და reviewer L11 ახლა **Round 14-ის panel polish**-შია (14b: detail panel; 14c: context/preview; A-ს round-11 follow-up-ები თავისი ფაილის ქვე-რაუნდში)',
);
rep(
  '| R11-P3m | Detail-ის გამყოფის, **ხაზის სიმაღლის სახელურის (Round 11)** და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |',
  '| R11-P3m | Detail-ის გამყოფის, **ხაზის სიმაღლის სახელურის (Round 11)** და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |\n| R11-SB | Auto-fit-ის ხილული არე რეალური 10 px-იანი horizontal scrollbar-ით (`clientHeight` − ruler − loop strip − border-ები) | headless-ში scrollbar 0 px-ია |',
);

fs.writeFileSync(file, t);
console.log('feature-status updated');
