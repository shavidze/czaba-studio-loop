const fs = require('fs');
const file = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(file, 'utf8');
const rep = (a, b) => {
  if (!s.includes(a)) throw new Error(`missing: ${a.slice(0, 80)}`);
  s = s.replace(a, b);
};

rep('ღიაა C-R7-02 (Low, label-ის 1.41–1.47 px overflow zoom sweep-ზე) → Round 9.',
  'ღიაა C-R7-02 (Low, label-ის 1.41–1.47 px overflow zoom sweep-ზე) → Round 10.');
rep('SRW-11B სამ ეტაპად (D-29, D-29a): detail panel (Round 8) → fold/სიმაღლე + auto-fit (Round 10) → მცურავი ვიდეო (Round 12).',
  'SRW-11B სამ ეტაპად (D-29, D-29a): detail panel (Round 8; C-R8-01 ღიაა, Tech Lead quiet Chrome) → fold/სიმაღლე + auto-fit (Round 11) → მცურავი ვიდეო (Round 12).');
rep('C-R6-02 ღიაა (app-attributed rAF LoAF INVALID run-ში). ორივე Round 9-შია. სუფთა რეალური Chrome სავალდებულო მტკიცებულებაა |',
  'C-R6-02 ღიაა: Round 9-ში app-side კანდიდატები მოგვარდა (R9-L1/L2 PASS), D layout 2/3. C-R7-01 Round 10-შია. სუფთა რეალური Chrome სავალდებულო მტკიცებულებაა |');
rep('| 10 | SRW-11B ეტაპი 2 | fold/სიმაღლე + auto-fit (D-29a-ს შეთანხმება), reviewer L11 |\n| 11 | C-R7-01, C-R7-02 | ბაგების რაუნდი: wrap-ის standby hand-off (ჯერ გაზომვა), ruler label-ის sweep. ეტაპ 3-მდე, რადგან ის SRW-03-ზეა დამოკიდებული |',
  '| 10 | C-R7-01, C-R7-02 | ბაგების რაუნდი (Round 11-დან გადმოვიდა): wrap-ის standby hand-off (ჯერ instrumentation), ruler label/tick-ის sweep. ეტაპ 3-მდე, რადგან ის SRW-03-ზეა დამოკიდებული |\n| 11 | SRW-11B ეტაპი 2 | fold/სიმაღლე + auto-fit (D-29a-ს შეთანხმება), reviewer L11; C-R8-01 ღიაა (Tech Lead) |');
rep('Round 3-ის, Round 4-ის, Round 5-ის, Round 6-ის, Round 7-ისა და Round 8-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
  'Round 3-ის, Round 4-ის, Round 5-ის, Round 6-ის, Round 7-ის, Round 8-ისა და Round 9-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.');
rep('- **Round 9: გაგზავნილია.** ბაგების რაუნდი C-R8-01 + C-R6-02 (საერთო მექანიზმი და R3-V1 layout). C-R7-01 და C-R7-02 Round 11-ზე გადავიდა, ეტაპ 3-მდე. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  '- **Round 9: C FAIL** (`tmp/studio-real-loop/c-round-9.md`). R9-D3 (compositor-only detail playhead), R9-L1, R9-L2, R9-U, R9-Doc, მეზობელი რეგრესიები და G9-1..3 PASS-ია. `tick` + microtasks p95 3.3–3.8-დან 0.6–0.9 ms-მდე შემცირდა. ჩავარდა R9-D1 (mode D 2/3), R9-D2 წესი 3 (D − N p95 +0.3 ms) და R9-L3. C-R8-01 და C-R6-02 ღიაა, ტოლერანსი არ შესუსტებულა. App-side კანდიდატები ამოწურულია, ამიტომ შემდეგი მტკიცებულება Tech Lead-ის quiet Chrome-ია (R3-V1, D layout).\n' +
  '- **Round 10: გაგზავნილია.** ბაგების რაუნდი C-R7-01 + C-R7-02 (Round 11-დან გადმოვიდა; მექანიზმით არ არის დაკავშირებული, რაც ღიად არის ჩაწერილი). Round 9-ის წესი „ეტაპი 2 მხოლოდ R9-D1/D2-ის PASS-ის შემდეგ“ შეიცვალა: ეტაპი 2 Round 11-ში იწყება ღია C-R8-01-ით და ერთი mode-D info run-ით. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');
rep('  - SRW-10: C-R7-02 (Low, Round 11) და Tech Lead-ის რეალური მაუსი;\n  - SRW-11B: C-R8-01 (Round 9), ეტაპი 2 (Round 10), ეტაპი 3 (Round 12);',
  '  - SRW-10: C-R7-02 (Low, Round 10) და Tech Lead-ის რეალური მაუსი;\n  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 2 (Round 11), ეტაპი 3 (Round 12);');
rep('  - SRW-03 / SRW-05: C-R6-02 (Round 9), C-R7-01 (Round 11) და რეალური Chrome;',
  '  - SRW-03 / SRW-05: C-R7-01 (Round 10), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;');

fs.writeFileSync(file, s);
console.log('plan.md updated');
