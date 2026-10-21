const fs = require('fs');
const file = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(file, 'utf8');

const replaceOnce = (from, to) => {
  const at = s.indexOf(from);
  if (at < 0) throw new Error(`not found: ${from.slice(0, 80)}`);
  if (s.indexOf(from, at + from.length) >= 0) throw new Error(`not unique: ${from.slice(0, 80)}`);
  s = s.replace(from, to);
};

if (s.includes('**D-19a')) throw new Error('D-19a already present');

const d19a = `**D-19a — Swap-ის შემდეგ settle (C-R7-01, Round 10-ის დაგეგმვა, Round 12-ში სრულდება; D-19-ის დამატება).** C-მ Round 10-ში აჩვენა, რომ loop wrap-ზე standby ზუსტად პოზიციონირებულია (offset 0), მაგრამ \`play()\`-ის შემდეგ headless decoder +22…+51 ms-ში ჩერდება, ჩამორჩენა ≈ 0.05 წმ-მდე იზრდება და soft sync D-19-ის deadband-ზე (0.02) ჩერდება. ასე იყო 27/27 wrap-ში ორ სესიაში. Round 7-ში B-მ regression-ის ფანჯარა ±0.01 დაწერა (\`tasks/round-7.md\`), ორიგინალი RF5-2 კი \`vt ∈ [2, 4]\` + D-19-ის ზღვრებია (\`tasks/round-5.md\`). ორი B-ის წესი ერთმანეთს ეწინააღმდეგება. გადაწყვეტა უფრო მკაცრი მიმართულებითაა, ანუ app-ის ქცევაში და არა ფანჯრის გაფართოებით:
- standby swap-ის შემდეგ soft sync იყენებს **settle band-ს ≤ 0.008 წმ** და settle gain-ს, rate-ის უცვლელ დიაპაზონში [0.5, 2.0];
- settle მთავრდება, როცა |d| პირველად შევა band-ში, 1.0 წმ-ის შემდეგ, ან შემდეგ seek-ზე, swap-ზე ან pause-ზე. შემდეგ ისევ 0.02-იანი deadband მოქმედებს, ამიტომ მდგრად მდგომარეობაში rate არ "ნადირობს";
- ლოგიკა pure helper-ია \`video-sync.ts\`-ში, დეტერმინისტული სიმულაციის ტესტით: მოდელირებული 30 ms-იანი post-start freeze +300 ms-ზე |d| ≤ 0.01-მდე უნდა მივიდეს;
- dock-ში იცვლება მხოლოდ swap-ის ბლოკი და rate-ის ჩაწერა. Hold, stall/escalation და D-24/D-24a-ს ზღვრები უცვლელია.

Verdict: R10-W1, H3 წესით (|vt − expected(ctx)| ≤ 0.01 ერთსა და იმავე row-ზე, ან ზუსტად +0.300-ზე ინტერპოლაციით). Tech Lead-ის quiet-Chrome RF7-3 run სავალდებულო მტკიცებულებად რჩება. ფანჯრის გაფართოება Tech Lead-ის გადაწყვეტილებაა და B ამას არ აკეთებს. მიზეზი: ეს ყველაზე მცირე ცვლილებაა, რომელიც ორ წესს ერთმანეთთან შეათანხმებს ტოლერანსის შესუსტების გარეშე. Settle მხოლოდ swap-ის შემდეგაა, რადგან მდგრად მდგომარეობაში |d| ისედაც 0.010–0.013-ია და გლობალურად ვიწრო deadband rate-ს არხევდა.

`;
replaceOnce('**D-20 — Undo/Redo gesture-ის დროს', `${d19a}**D-20 — Undo/Redo gesture-ის დროს`);

const d29b = `**D-29b — Auto-fit-ისას detail panel პირველი იკლებს (SRW-11B ეტაპი 2, Round 11; D-29a-ს ღია საკითხის გადაწყვეტა).** D-29a-ს არითმეტიკით 1280×720-ზე 144 px-იანი panel-ით ხაზებს ≈ 224 px რჩება, auto-fit-ის მინიმუმი კი ≈ 236 px-ია (52 + 3 × 60 + border-ები). ამიტომ round-7-ის draft R11-P2a („detail ღიაა (144), vertical scroll არ არის“) შეუსრულებელია. გადაწყვეტა:
- სანამ auto-fit ჩართულია და მომხმარებელს ამ სესიაში panel-ის ზომა არ შეუცვლია, panel-ის rendered გახსნილი სიმაღლე = min(შენახული სიმაღლე, cap);
- cap არის [120, 280]-ში ყველაზე დიდი სიმაღლე, რომლის დროსაც ruler, loop strip, scrollbar და ყველა ხაზი auto-fit-ის მინიმუმით სრულად ჩანს. თუ 120-ზეც არ ეტევა, panel 120 px-ია და timeline ვერტიკალურად scroll-დება;
- **მომხმარებლის არჩევანი იმარჯვებს:** separator-ის პირველი drag ან ↑/↓ ამ სესიაში cap-ს თიშავს. ამის შემდეგ 120–280 ეტაპ 1-ის მსგავსად მოქმედებს. Drag და key step rendered სიმაღლიდან იწყება, ამიტომ ზომა არ ხტება;
- \`aria-valuenow\` გაშლილ მდგომარეობაში rendered სიმაღლეს უდრის (N2);
- D-29a-ს mount-ის გადაწყვეტილება უცვლელია: 1440×900 გახსნილი იწყება, 1280×720 — დაკეცილი.

A კოდამდე მიმდინარე layout-ზე budget-ს ხელახლა ზომავს. თუ panel 144 px-ითაც ეტევა, cap არასოდეს ირთვება და C ამას ამოწმებს. მიზეზი: lane-ის მინიმუმები (D-29) პროტოტიპის შეთანხმებული მნიშვნელობებია, panel-ს კი 24 px სათადარიგო აქვს (144 → 120). ეს ყველაზე მცირე პატიოსანი გზაა, რომ 1280×720-ზე ღია panel-მა 4 ხაზი + ruler + loop strip არ დამალოს.

`;
replaceOnce('**ვიდეოს import (SRW-02, FB-15).**', `${d29b}**ვიდეოს import (SRW-02, FB-15).**`);

replaceOnce(
  'ნავიგაცია (D-28): C-ის ყველა ID PASS-ია (R10-N5r Round 7-ში). ღიაა C-R7-02 (Low, label-ის 1.41–1.47 px overflow zoom sweep-ზე) → Round 10. რეალური მაუსი/wheel Tech Lead-ის სიაშია |',
  'ნავიგაცია (D-28): C-ის ყველა ID PASS-ია (R10-N5r Round 7-ში). C-R7-02 Round 10-ში დაიხურა (R10-R1/R10-R2). რჩება მხოლოდ რეალური მაუსი/wheel (Tech Lead-ის სია) |',
);
replaceOnce(
  'detail panel (Round 8; C-R8-01 ღიაა, Tech Lead quiet Chrome) → fold/სიმაღლე + auto-fit (Round 11) → მცურავი ვიდეო (Round 12). design-philosopher-ს A იძახებს pre-flight-ში |',
  'detail panel (Round 8; C-R8-01 ღიაა, Tech Lead quiet Chrome) → fold/სიმაღლე + auto-fit + D-29b (Round 11) → მცურავი ვიდეო (Round 13). Panel-ის polish Round 14-შია. design-philosopher-ს A იძახებს pre-flight-ში |',
);
replaceOnce(
  'C-R7-01 Round 10-შია. სუფთა რეალური Chrome სავალდებულო მტკიცებულებაა |',
  'C-R7-01: Round 10-ში მიზეზი დადგინდა (D-19-ის deadband ±0.01-იანი ფანჯრის წინააღმდეგ) → D-19a, Round 12. სუფთა რეალური Chrome სავალდებულო მტკიცებულებაა |',
);

const oldRows = s.slice(
  s.indexOf('| 11 | SRW-11B ეტაპი 2 |'),
  s.indexOf('| 20 | SRW-21 |'),
);
if (!oldRows.startsWith('| 11 |')) throw new Error('round table start');
const tail20 = '| 20 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |';
replaceOnce(
  oldRows + tail20,
  [
    '| 11 | SRW-11B ეტაპი 2 | fold/სიმაღლე + auto-fit + D-29b (detail panel პირველი იკლებს). C-R8-01 ღიაა (Tech Lead) |',
    '| 12 | C-R7-01 | D-19a: swap-ის შემდეგ settle, verdict R10-W1 H3 წესით |',
    '| 13 | SRW-11B ეტაპი 3 | მცურავი ვიდეო (C-R7-01-ის დახურვის ან Tech Lead-ის quiet Chrome-ის შემდეგ) |',
    '| 14 | Panel-ის polish | reviewer L11, M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d). შემდეგ milestone-ის სრული რეგრესია |',
    '| 15 | SRW-13 | Clip gain, pan, master, meters |',
    '| 16 | SRW-14, SRW-15 | Grid/Snap, bars/beats/tempo/metronome |',
    '| 17 | SRW-16 | Markers |',
    '| 18 | SRW-17 | ტრეკების ჯგუფები |',
    '| 19 | SRW-18 | Fades + volume envelope |',
    '| 20 | SRW-19 | ვიდეოს opacity fade |',
    '| 21 | SRW-20 | Range/MP3/ექსპორტის სისრულე |',
    '| 22 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |',
  ].join('\n'),
);

replaceOnce(
  'Round 7-ის, Round 8-ისა და Round 9-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
  'Round 7-ის, Round 8-ის, Round 9-ისა და Round 10-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
);

replaceOnce(
  '- **Round 10: გაგზავნილია.** ბაგების რაუნდი C-R7-01 + C-R7-02 (Round 11-დან გადმოვიდა; მექანიზმით არ არის დაკავშირებული, რაც ღიად არის ჩაწერილი). Round 9-ის წესი „ეტაპი 2 მხოლოდ R9-D1/D2-ის PASS-ის შემდეგ“ შეიცვალა: ეტაპი 2 Round 11-ში იწყება ღია C-R8-01-ით და ერთი mode-D info run-ით. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  [
    '- **Round 10: C FAIL** (`tmp/studio-real-loop/c-round-10.md`). R10-W2, R10-R1, R10-R2, R10-Doc, მეზობელი რეგრესიები და G10-1..3 PASS-ია. R10-W3 არ გამოიყენება (source არ შეცვლილა).',
    '  - **დაიხურა:** C-R7-02 (ruler-ის ბოლო tick, R10-R1/R10-R2).',
    '  - **R10-W1 FAIL:** 9 ვალიდური wrap-იდან 6 ფანჯრის ქვემოთაა, `d` +300-ზე −0.017…−0.020 ყველა 9-ში. მიზეზი app-side ფორმებში არ იყო. ეს D-19-ის deadband-ისა და B-ის ±0.01-იანი ფანჯრის კონფლიქტია → D-19a (Round 12). C-R7-01 ღიაა (Medium).',
    '- **Round 11: გაგზავნილია.** SRW-11B ეტაპი 2: fold, სიმაღლე, auto-fit და D-29b. Panel-ის polish Round 14-ში გადავიდა (ჩაწერილია, არ არის მოხსნილი). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  ].join('\n'),
);

replaceOnce(
  '  - SRW-10: C-R7-02 (Low, Round 10) და Tech Lead-ის რეალური მაუსი;\n  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 2 (Round 11), ეტაპი 3 (Round 12);',
  '  - SRW-10: მხოლოდ Tech Lead-ის რეალური მაუსი/wheel;\n  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 2 (Round 11), ეტაპი 3 (Round 13), polish (Round 14);',
);
replaceOnce(
  '  - SRW-03 / SRW-05: C-R7-01 (Round 10), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;',
  '  - SRW-03 / SRW-05: C-R7-01 (Round 12, D-19a), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;',
);

fs.writeFileSync(file, s);
console.log('plan.md updated');
